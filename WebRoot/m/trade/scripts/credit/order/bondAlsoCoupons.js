/**
 * 信用交易-现券还券
 */
define('trade/scripts/credit/order/bondAlsoCoupons.js', function(require, exports, module) {
			require("validatorUtils");
	var validatorUtil = $.validatorUtils;
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var service_credit = require("service_credit");
	var _pageId = "#credit_order_bondAlsoCoupons ";
	var external = {"callMessage":function(){}};
	var stockAccount =null;//证券账号
	var exchangeType = null;//交易市场类别（见数据字典)
	var userInfo =null;
	// var keyboard = require("keyboard");
	var listData = {};
	var stockInfo = {};
	var contractData = {};
	var selectedList = [];
	
    /**
     * 初始化
     */
	function init(){
		// if(keyboard){
		// 	keyboard.keyInit();
		// }
		userInfo = common.getCurUserInfo();
		canPayStock();//查询可还证券
		
//		var w = Number(gconfig.appWidth * 0.23).toFixed(0);
//		queryContract(w);
    }
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			// if(keyboard){
			// 	keyboard.closeKeyPanel();
			// }
//			$.pageInit("credit/order/bondAlsoCoupons","credit/order/mainOrder",{});
			$.pageBack("credit/order/mainOrder","left");
			e.stopPropagation();
		});
		//查询跳转
		$.bindEvent($(_pageId+".noicon_text"), function(e){
			// if(keyboard){
			// 	keyboard.closeKeyPanel();
			// }
			$.pageInit("credit/order/bondAlsoCoupons","credit/query/financingQuery",{});
			e.stopPropagation();
		});
		
		//提交委托
		$.bindEvent($(_pageId+".back_form .ce_btn"), function(e){
			// if(keyboard){
			// 	keyboard.closeKeyPanel();
			// }
			vailSubmitOrder();
			e.stopPropagation();
		});
		
		//滚动联动
		$.bindEvent($(_pageId+" .back_form .input_text  a.btn"), function(e){
			// if(keyboard){
			// 	keyboard.closeKeyPanel();
			// }
			var mayPay = $(_pageId+"#canPay").val();  //需还款额
			setStockInfo($(_pageId+"#stockNum"),mayPay);
			e.stopPropagation();
		});
		
		$.bindEvent($(_pageId+" .toggle_nav li"), function(e){
			// if(keyboard){
			// 	keyboard.closeKeyPanel();
			// }
			$(this).addClass("active").siblings().removeClass("active");
			if($(this).index() == 0){
				$(_pageId+" .contract").hide();
			}
			else{
				$(_pageId+" .contract").show();
			}
			e.stopPropagation();
		});
		//增加数量
		// $.bindEvent($(_pageId+".add"),function(e){
		// 	var num = $(_pageId+"#stockNum").val();
		// 	if(!num||num==""){
		// 		return false;
		// 	}
		// 	num = Number(num);
		// 	if(num >=0){
		// 		num = num+1;
		// 	}
		// 	setStockInfo($(_pageId+"#stockNum"),num.toFixed(0));
		// });
		// //减少数量
		// $.bindEvent($(_pageId+".less"),function(e){
		// 	var num = $(_pageId+"#stockNum").val();
		// 	if(!num||num==""){
		// 		return false;
		// 	}
		// 	num = Number(num);
		// 	if(num > 0){
		// 		num = num-1;
		// 	}
		// 	setStockInfo($(_pageId+"#stockNum"),num.toFixed(0));
		// });
		
		// //数量输入
		// $.bindEvent($(_pageId + "#stockNum"),function(e){
		// 	if(keyboard){
		// 		var stockNum = $(_pageId + "#stockNum");
		// 		var mostBuy = Number($(_pageId+"#canPay").val());
		// 		var key = e.detail["keyDiv"] ? e.detail["keyDiv"].attr("key") : "";
		// 		if(key == "d4"){
		// 			var num = (mostBuy / 4).toFixed(0);
		// 			setStockInfo(stockNum,num);
		// 		}
		// 		else if(key == "d3"){
		// 			var num = (mostBuy / 3).toFixed(0);
		// 			setStockInfo(stockNum,num);
		// 		}
		// 		else if(key == "d2"){
		// 			var num = (mostBuy / 2).toFixed(0);
		// 			setStockInfo(stockNum,num);
		// 		}
		// 		else if(key == "d1"){
		// 			setStockInfo(stockNum,mostBuy);
		// 		}
		// 		else{
		// 			keyboard.popUpKeyboard($(this),e);
		// 		}
		// 	}
		// 	e.stopPropagation();
		// },"input");
		// $.bindEvent($(_pageId), function(e){
		// 	if(keyboard){
		// 		keyboard.closeKeyPanel();
		// 	}
		// 	e.stopPropagation();
		// })
	}
	
	/**
	 * 设置股票信息的值 可以为对象
	 * @param {Object} key 输入字符串支持单个，输入对象支持全部
	 * @param {Object} value 只支持单个字符串的值
	 */
	function setStockInfo(key, value){
		key.quzhi(value);
		if(keyboard){
			key.attr("value",value);
			key.children("em").text(value);
			key.find("div.key_text").text(value);
			if(value.length == 0){
				key.find("div.key_place").show();
			}else{
				key.find("div.key_place").hide();
			}
		}
	}
    
	/**
	 * 查询买入可用资金最大可买数量
	 * */
	function queryMaxAmount(stockCode){
		if(!stockCode){
			return false;
		}
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid= userInfo.session_id;
		var password = userInfo.password;
		var stock_code =stockCode;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"stock_code":stock_code
			};
		service_credit.restock_link(param,queryMaxAmountCallBack);
	}
	/**
	 * 查询买入可用资金最大可买数量回调方法
	 */
	function queryMaxAmountCallBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results.length>0){
				var canPay = results[0].enable_amount;
				var needPay = results[0].enable_return_amount;
				stockAccount = results[0].stock_account;
				exchangeType = results[0].exchange_type;
//				$(_pageId+"#canPay").val(canPay);//可卖（还）数量(现券还券有效
				$(_pageId+"#needPay").val(needPay);//需还
			}
		}else{
			$.alert(data.error_info);
		}
	}
	
	/**
	 * 下单验证
	 * */
	function vailSubmitOrder(){	
		//验证股票代码输入是否正确
		if(common.size(listData) == 0){
			$.alert("没有可用持仓");
			return false;
		}
		if(!common.isValue(stockInfo)){
			$.alert("请选证券代码");
			return false;
		}
		//验证还券数量
		var num = $(_pageId+"#stockNum").val();
		if(num.length == 0){
			$.alert("请输入还券数量");
			return false;
		}
		if(Number(num) <= 0){
			$.alert("还券数量必须大于0");
			return false;
		}
		var needPay = $(_pageId+"#needPay").val();
		if(Number(num) > Number(needPay)){
			$.alert("委托数量大于需还数量");
			return false;
		}
		var mostBuy = $(_pageId+"#canPay").val();
		if(Number(num) > Number(mostBuy)){
			$.alert("该证券可还数量不足");
			return false;
		}
		var tipStrArray = [];
		tipStrArray.push([stockInfo.stock_name, stockInfo.stock_code]);
		tipStrArray.push(["需还数量 ", $(_pageId+"#needPay").val()]);
		tipStrArray.push(["还券数量 ", num]);
		var tipStr = "<div >";
		tipStr += common.generatePrompt(tipStrArray);
		tipStr += "</div>";
		common.iConfirm("现券还券",tipStr,function success(){
			var cust_code = userInfo.cust_code;	//客户代
			var fund_account = userInfo.fund_account;	//资产账户
			var branch_no = userInfo.branch_no;	//分支机构
			var sessionid=userInfo.session_id;
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
			var password= userInfo.password;
			var exchange_type = exchangeType;	
			var stock_account = stockAccount;
			var stock_code = stockInfo.stock_code;
			var entrust_amount = num;
			var compact_id = "";
			var param = {
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"password":password,
					"sessionid":sessionid,
					"exchange_type":exchange_type,
					"stock_account":stock_account,
					"stock_code":stock_code,
					"entrust_amount":entrust_amount,
					"compact_id":compact_id
				};
			service_credit.repaystock(param,getStockBuyCallBack);
		}, null);
	}
	
	/**
	 * 委托下单返回
	 * */
	function getStockBuyCallBack(data)
	{
		if(data.error_no == 0){
			var results = data.results;
			if(results ){
				//提示框
				var tipStr = "<span style='font-weight:bold;font-size: 18px;'>交易提示</span><br>交易委托已提交，委托编号："+results[0].entrust_no;
				$.alert(tipStr);
			}
			resetBuyForm();
			$(_pageId+"#stockCode").val("");
		}else{
			$.alert(data.error_info);
			resetBuyForm();
		}
	}
	
		
	/**
	 * 持仓查询
	 * 调用两个接口 股份查询，资金查询
	 */
	function canPayStock(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid= userInfo.session_id;
		var password = userInfo.password;
		var stock_account ="";
		var stock_code = "";
		var exchange_type = "";
		var param={
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"stock_account":stock_account,
				"stock_code":stock_code,
				"exchange_type":exchange_type,
				"password":password
		};
		service_credit.cc_query(param,queryStockCallback);
	}

	//持仓查询回调方法
	function queryStockCallback(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					listData = {};
					var listDiv = "<div class='bank_list center'><ul>";
					for (var i=0;i<results.length;i++){
						listData[results[i].stock_code+""] = results[i];
						listDiv += "<li id='"+results[i].stock_code+"'><a href=\"javascript:void(0);\">"+results[i].stock_name+" <small>"+results[i].stock_code+"</small></a></li>";
					}
					listDiv += "</ul></div>";
					common.addChoiceList($(_pageId+" .position .select_box p"), "选择赎回基金代码",listDiv,function(data, div){
						div.html(data.find("a").text());
						var id = data.attr("id");
						stockInfo = listData[id];
						$(_pageId+" #canPay").val(Number(stockInfo.enable_amount));//持有份额
						queryMaxAmount(id);
					},false,"position");
				}
				else{
					$(_pageId+" .position .select_box p").text("暂无持仓信息");
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	/**
	 * 重置表单
	 * */
	function resetBuyForm(){
		$(_pageId+"#stockCode").text("请选择");
		$(_pageId+"#stockName").val("");
		$(_pageId+"#stockNum").val("");
		$(_pageId+"#canPay").val("");
		$(_pageId+"#needPay").val("");
		$(_pageId+".select_box ul").hide();
		$(_pageId+".input_slider .r1").val("0");
	}
	
	
//	function queryContract(w){
//		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
//		var branch_no = userInfo.branch_no;	
//		var fund_account = userInfo.fund_account;
//		var cust_code = userInfo.cust_code;//关联资产账户标志
//		var sessionid = userInfo.session_id;
//		var stock_account ="";
//		var stock_code = "";
//		var exchange_type = "";
//		var _request_num = "1000";
//		var param={
//				"entrust_way":entrust_way,
//				"branch_no":branch_no,
//				"fund_account":fund_account,
//				"cust_code":cust_code,
//				"sessionid":sessionid,
//				"stock_account":stock_account,
//				"stock_code":stock_code,
//				"exchange_type":exchange_type,
//				"position_str":"",
//				"request_num":_request_num
//		};
//		service_credit.contractmx_query(param,function(data){
//			contractData = {};
//			if (data) {
//				if(data.error_no == 0)
//				{
//					var results = data.results;	
//					if(results && results.length > 0)
//					{
//						var listHtml = "<div class='multi_list'><div class='top'><p class='col'><i></i></p><p>证券/代码</p><p>合约编码</p><p>未还金额</p><p>开仓日期</p></div><ul>";
//						for(i = 0;i < results.length; i++)
//						{
//							contractData[""+i] = results[i];
//							listHtml += "<li id='"+i+"'><p class='col'><i></i></p>";
//							listHtml += "<p><span>"+results[i].stock_name+"</span> <span>"+results[i].stock_code+"</span></p>";
//							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].compact_id+"</span></p>";
//							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].real_compact_balance+"</span></p>";
//							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].open_date+"</span></p></li>";
//						}
//						listHtml += "</ul></div>";
//						common.addChoiceList($(_pageId+" .contract .select_box p"), "请选择合约",listHtml,function(data,div){
//							var length = data.length;
//							if(length != 0){
//								div.html("已选"+length+"项");
//								for(var i = 0; i < length; i++){
//									selectedList.push(data.eq(i).attr("id"));
//								}
//							}
//							else{
//								div.html("请选择");
//								selectedList = [];
//							}
//						},true,"contract");
//					}
//					else{
//						$(_pageId+" .contract .select_box p").text("暂无合约信息");
//					}
//				}
//				else
//				{
//					$.alert(data.error_info);
//				}
//			}
//		},{"isShowWait":false});
//	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		resetBuyForm();
		stockAccount =null,//证券账号
		exchangeType = null,//交易市场类别（见数据字典)
		$(_pageId+".select_box p").text("");
		
		$(_pageId+" .toggle_nav li").eq(0).addClass("active").siblings().removeClass("active");
		$(_pageId+" .contract").hide();
		$(_pageId+" .rule_select p span").html("请选择");
		// if(keyboard){
		// 	keyboard.keyDestroy();
		// }
	}
	
	
	var base = {
		"init" : init,
		"load": load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});