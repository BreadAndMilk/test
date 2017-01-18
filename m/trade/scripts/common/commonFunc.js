/**
 * 交易模块公用方法js  （涉及到业务接口的调用）
 */
define('trade/scripts/common/commonFunc.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
    var service_hq = require("service_hq");
	var service_common = require("service_common");
	var dateUtils = require("mobiscrollUtils");
	require("rsa");
	require("endecryptUtils");
	var endecryptUtils = $.endecryptUtils;
	var modulus = null;
	var publicExponent = null;
	var tradingTime = true;
	var checkTradeTimer = null;
	
	
	/**
	 * 股票小数保留位数
	 */
	function decimalKeep(stockCode,callback){  //小数保留
		var KEEP_TWO = 3;
		var param = {
				"code_list" : stockCode
		};
		service_hq.getStockInfo(param,function(data){
			if(data.errorNo == "0"){
				var results = data.results;
				if(results && results.length>0){
					var stkType = results[0][10];  // 行情类别
					var stockVal = results[0][1];
					var price_step_const = [0,1,2,7,9,15,18,25,26,27]; // 保留两位
					var step_flag = $.inArray(stkType, price_step_const);
					// 上海国债逆回购
					if(stockVal.substring(0,3) == "204"){
						KEEP_TWO = 3
					}
					// 否则浮动为0.01
					else if(step_flag == -1){
						KEEP_TWO = 3;
					}
					// 变动价格为0.001
					else{
						KEEP_TWO = 2;
					}
					callback(KEEP_TWO, results[0]);
				}
				else{
					callback(KEEP_TWO, ['',stockCode]);
				}
			}else{
				callback(KEEP_TWO, ['',stockCode]);
	    		$.alert("获取股票信息失败");
	    	}	
		},{"isShowWait":false,"timeOutFunc":function(){
			callback(KEEP_TWO, ['',stockCode]);
		},"errorFunc":function(){
			callback(KEEP_TWO, ['',stockCode]);
		}});
	}
	
	/**
	 * 取行情服务器时间
	 * @param {Object} isAsync 是否异步请求
	 * @param {Object} callback 回调
	 */
	function getServerTime(isAsync,callback){
		isAsync = isAsync ? true : false;
		var dates = {};
		var localDate = new Date();
		dates["dateTime"] = localDate.format("yyyy-MM-dd HH:mm:ss");
		dates["date"] = localDate.format("yyyy-MM-dd");
		dates["time"] = localDate.format("HH:mm:ss");
		dates["Date"] = localDate;
		service_hq.getHqState(null,function(data){
			if(data){
				var results = data.results;
				if(results && results[0]){
					var s = (results[0][3] || "")+"";
					var date = "";
					var time = "";
					if(s.length > 7){
						date = s.slice(0,4)+"-"+s.slice(4,6)+"-"+s.slice(6,8);
					}
					if(s.length == 14){
						time = s.slice(8,10)+":"+s.slice(10,12)+":"+s.slice(12);
					}
					var dateTime = date+" "+time;
					dates["dateTime"] = dateTime;
					dates["date"] = date;
					dates["time"] = time;
					
					var serverDate = dateTime.replace(/-/g,"/");
					$.setSStorageInfo("_simulationTime",localDate.getTime()+"|"+serverDate);
					
					dates["Date"] = new Date(serverDate);
					
					isTradingTime(dates);
					dates["tradingF"] = true;
					
					if(callback){
						callback(dates);
					}
				}
				else{
					if(callback){
						callback(dates);
					}
				}
			}
			else{
				if(callback){
					callback(dates);
				}
			}
		},{
			"isAsync":false,
			"isShowWait":false,
			"isShowOverLay":false,
			"isGlobal":true,
			"timeOutFunc":function(){
				if(callback){
					callback(dates);
				}
			},"errorFunc":function(){
				if(callback){
					callback(dates);
				}
			}
		});
		return dates;
	}
	
	
	/**
	 * 取行模拟计算的时间
	 * @param {Object} isAsync 是否异步请求
	 * @param {Object} callback 回调
	 */
	function simulationTime(isAsync,callback){
		var s = new Date().getTime();
		var simulationTime = $.getSStorageInfo("_simulationTime") || "";
		simulationTime = simulationTime.split("|");
		var lastDoTime = s - Number(simulationTime[0]);
		if(global.syncServerTime && lastDoTime > 60000 * global.syncServerTime){
			return getServerTime(isAsync,callback);
		}
		else{
			var serverDate = new Date(simulationTime[1]).getTime();
			var localDate = new Date(serverDate + lastDoTime);
			var dates = {};
			dates["dateTime"] = localDate.format("yyyy-MM-dd HH:mm:ss");
			dates["date"] = localDate.format("yyyy-MM-dd");
			dates["time"] = localDate.format("HH:mm:ss");
			dates["Date"] = localDate;
			if(callback){
				callback(dates);
			}
			return dates;
		}
	}
	
	function initCheckTradeTimer(){
		if(checkTradeTimer == null){
			simulationTime(false,isTradingTime);
			//启动是否是交易时间检查定时器
			checkTradeTimer = window.setInterval(function(){
				simulationTime(false,isTradingTime);
			}, global.checkTradeTime * 60000); // 5秒检测一次
		}
	}
	
	function clearCheckTradeTimer(){
		if(checkTradeTimer != null){
			window.clearInterval(checkTradeTimer);
			checkTradeTimer = null;
		}
	}
	
	function getTradingTime(){
		return tradingTime;
	}
	
	/***
	 * 判断是否是交易时间
	 * @param {Object} type
	 */
	function isTradingTime(dates){
		dates = dates || simulationTime();
		if(!dates.tradingF){
			var xq = dates.Date.getDay();
			if(xq == 6 || xq == 0){
				tradingTime = false;
			}
			else{
				var time = dates.time;
				if(timeComparison(time, "08:50") >= 0 && timeComparison(time, "15:10") <= 0){
					tradingTime = true;
				}
				else{
					tradingTime = false;
				}
			}
		}
		return tradingTime;
	}
	
		
	/***
	 * 判断是否是交易时间
	 * @param {Object} type
	 */
	function isTradingTimes(type, dates){
		if(!type && !dates){
			return isTradingTime();
		}
		else{
			dates = dates || simulationTime();
			if(dates["Date"]){
				var xq = dates.Date.getDay();
				if(xq == 6 || xq == 0){
					return false;
				}
				if(!dates["time"]){
					dates["time"] = dates["Date"].format("HH:mm:ss");
				}
			}
			else{
				type = type + "";
				var time = dates.time;
				var isTrading = false;
				var tradingtimes = [['09:00',"15:00"]];
				switch(type){
					case "0":
						tradingtimes = [['09:00',"12:00"],['13:00',"15:00"]];
						break;
					case "1":
						tradingtimes = [['09:00:00',"12:00:00"],['13:00:00',"16:00:00"]];
						break;
				}
				for(var i = 0; i < tradingtimes.length; i++){
					if(timeComparison(time, tradingtimes[i][0]) >= 0 && timeComparison(time, tradingtimes[i][1]) <= 0){
						isTrading = true;
						break;
					}
				}
				return isTrading;
			}
		}
	}
	
	function timeComparison(a,b){
		a = (a || '').split(":");
		b = (b || '').split(":");
		a = Number(a[0] || 0)*60*60 + Number(a[1] || 0)*60 + Number(a[2] || 0);
		b = Number(b[0] || 0)*60*60 + Number(b[1] || 0)*60 + Number(b[2] || 0);
		return a - b;
	}
	
	/**
	 * 获取当前日前后几天的日期
	 * @param {Number} days 天数 正数为后几天，负数为前几天
	 * @param {String} format 时间显示格式
	 */
	function getTradingDay(days, format){
		format = format ? format : "yyyy-MM-dd";
		var end_time  = new Date();	//截止时间
		end_time.setDate(end_time.getDate() + days);
		return end_time.format(format);
	}
	
	/**
	 * 初始化日期选择组件
	 * @param {Object} pageId 
	 * @param {Object} timeLimit 默认查询天数
	 * @param {Boolean} notContainToday 不包含今天
	 */
	function initTimeChoice(pageId,timeLimit,notContainToday){
		if(!timeLimit){
			timeLimit = 0;
		}
		var begin_time = getTradingDay(0-timeLimit, "yyyy-MM-dd");	//截止时间
		var end_time = new Date().format("yyyy-MM-dd");  
		if(notContainToday){
			begin_time = getTradingDay(0-timeLimit-1, "yyyy-MM-dd");
			end_time = getTradingDay(-1, "yyyy-MM-dd");  
		}
		$(pageId + " #startDate").html(begin_time);
		$(pageId + " #endDate").html(end_time);
		$(pageId + " #startInput").val(begin_time);
		$(pageId + " #endInput").val(end_time);
		//初始化时间控件
//		
		dateUtils.initDateUI($(pageId + " .time input"), {
			"preset": "date",
			"theme": 'default',
		});
		
		
		//设置开始日期
		$.bindEvent($(pageId + " #setStart"), function(e){
			$(pageId + " #startInput").triggerFastClick();
			$(pageId + " #startInput").focus();
			e.stopPropagation();
		});
		$.bindEvent($(pageId + " #startInput"), function(e){
			var reg = /^\d{4}-\d{2}-\d{2}$/,
			thisVal = $(this).val().replaceAll("/","-");
			if (reg.test(thisVal)){
				$(pageId + " #startDate").html(thisVal);
			}
			e.stopPropagation();
		}, "change");
		
		//设置截止日期
		$.bindEvent($(pageId + " #setEnd"), function(e){
			$(pageId + " #endInput").triggerFastClick();
			$(pageId + " #endInput").focus();
			e.stopPropagation();
		});
		$.bindEvent($(pageId + " #endInput"), function(e){
			var reg = /^\d{4}-\d{2}-\d{2}$/,
			thisVal = $(this).val().replaceAll("/","-");
			if (reg.test(thisVal)){
				$(pageId + " #endDate").html(thisVal);
			}
			e.stopPropagation();
		}, "change");
	}
	
	
	/**
	 * 获取密码要
	 * @param {Object} data
	 * @param {Object} callback
	 */
	function getKey(callback, data){
		modulus = $.getSStorageInfo("modulus");
		publicExponent = $.getSStorageInfo("publicExponent");
		if(modulus && publicExponent){
			if(callback){
				if(data){
					if(typeof(data) == "string"){
						if(data && $.trim(data) != ""){
							data = endecryptUtils.rsaEncrypt(modulus, publicExponent, $.trim(data));
						}
						else{
							data = "";
						}
					}
					else if(typeof(data) == "object" && common.size(data) > 0){
						$.each(data, function(key,value) {
							if(value && $.trim(value) != ""){
								data[key] = endecryptUtils.rsaEncrypt(modulus, publicExponent, $.trim(value));
							}
							else{
								data[key] = "";
							}
						});
					}
				}
				callback(data);
			}
		}
		else{
			service_common.getKey({},function(d){
				if(d && d.error_no == "0" && d.results[0]){
					modulus = d.results[0].modulus;
					publicExponent = d.results[0].publicExponent;
					$.setSStorageInfo("modulus",modulus);
					$.setSStorageInfo("publicExponent",publicExponent);
					if(callback){
						if(data){
							if(typeof(data) == "string"){
								if(data && $.trim(data) != ""){
									data = endecryptUtils.rsaEncrypt(modulus, publicExponent, $.trim(data));
								}
								else{
									data = "";
								}
							}
							else if(typeof(data) == "object" && common.size(data) > 0){
								$.each(data, function(key,value) {
									if(value && $.trim(value) != ""){
										data[key] = endecryptUtils.rsaEncrypt(modulus, publicExponent, $.trim(value));
									}
									else{
										data[key] = "";
									}
								});
							}
						}
						callback(data);
					}
				}
			},{"isLastReq":false});
		}
	}
	

	
    var base = {
    	"getTradingDay": getTradingDay,
    	"getKey" : getKey,
    	"decimalKeep" : decimalKeep,
    	"initTimeChoice": initTimeChoice,
    	"getServerTime": getServerTime,
    	"simulationTime": simulationTime,
    	"isTradingTimes": isTradingTimes,
    	"getTradingTime": getTradingTime,
    	"initCheckTradeTimer": initCheckTradeTimer,
    	"clearCheckTradeTimer": clearCheckTradeTimer,
    };

    module.exports = base;
});