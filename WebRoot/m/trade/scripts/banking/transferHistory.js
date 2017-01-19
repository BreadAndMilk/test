/**
 * 交易转账流水查询
 */
define('trade/scripts/banking/transferHistory.js', function(require, exports, module) {
	var service_common = require("service_common");
	var gconfig = $.config;
	var global = gconfig.global;
	var commonFunc = require("commonFunc");
	var VIscroll = require("vIscroll");
	var common = require("common");
	var vIscroll = {"scroll":null,"_init":false};
    var _pageId = "#banking_transferHistory ";
    var money_typef = {"0":"元","1":"美元","2":"港币"};
    var userInfo = null;
    var witchAccount = "";  // 登录的账号类型
    
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		queryHistory();
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageBack("banking/transfer","left");
		});
		// 时间选择
		$.bindEvent($(_pageId + ".date_filter .btn"), function(e){
			if(vIscroll._init){
				vIscroll.scroll.destroy();
				vIscroll.scroll = null;
				vIscroll._init = false;
			}
			queryHistory();
		});
	}
    
	/**
	 * 转账转账  (300203)
	 */
	function queryHistory(){
		$(_pageId + ".bank_over ul").html("");
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account;	//资产账户
		var money_type = "";//货币 ""所有货币，0 人民币，1 港币，2 美元 
		var branch_no = userInfo.branch_no;	//分支机构
		var sessionid = userInfo.session_id;
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var transfer_direction = "";	
		var param={			
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"money_type":money_type,
				"begin_time":begin_time,
				"end_time":end_time,
				"transfer_direction":transfer_direction,
				"account_type":witchAccount
		};
		service_common.transferQuery(param,function(data){
			if(data.error_no != 0){
				$.alert(data.error_info);
			}else{
				$(_pageId + ".no_data").hide();
				var results = data.results;
				if(results && results.length> 0 && typeof results != "undefined"){
					// 显示历史流水数据
					showHistory(results);
					initVIScroll();
					$(_pageId + ".visc_pullUp").hide();
				}else{
					initVIScroll();
					$(_pageId + ".no_data").show();
					$(_pageId + ".visc_pullUp").hide();
				}
			}
		},{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){
				initVIScroll();
				if(vIscroll._init){
					vIscroll.scroll.refresh();
				}
			}
		});
	}
	
	/**
	 * 显示流水数据
	 */
	function showHistory(results){
		var strHtmls = "";
		for(var i=0 ;i<results.length;i++){
    		var css = "";
    		var tranamt = results[i].tranamt;
    		if(results[i].transfer_direction_name == "查询余额"){
    			tranamt = results[i].fundbal;
    		}
    		var transfer_direction = results[i].transfer_direction;
    		if(transfer_direction == "0"){
    			css = "ared";
    			tranamt = "+"+tranamt;
    		}else if(transfer_direction == "1"){
    			css = "agreen";
    			tranamt = tranamt;
    		}
    		var failedNote = "";
    		if(results[i].entrust_name){
    			failedNote = ": " + results[i].entrust_name;
    		}
    		if(results[i].entrust_name.indexOf("失败") != "-1"){
    			failedNote += " " + results[i].bank_error_info;
    		}
			strHtmls += "<li style=\"height: initial;line-height: initial;position: relative;\">";
			strHtmls += "<p style=\"position: absolute;padding-top: 0.02rem;clear: both;\">"+results[i].transfer_direction_name+"</p>";
			strHtmls += "<strong style=\"text-align: right;float: none;display: block;padding-left: 50%;\" class="+css+">"+tranamt+"<em style='font-size: 0.12rem;color: #777;padding-left: 0.02rem;'>"+money_typef[results[i].money_type]+"</em></strong>";
			strHtmls += "<span style=\"position: absolute;padding-top: 0.03rem;  white-space: nowrap;\" class=\"time\">"+results[i].business_date+" "+results[i].business_time+"</span>";
			strHtmls += "<em style=\"display: block;min-height: 0.16rem;text-align: right;padding-left: 40%;\">"+results[i].bank_name+failedNote+"</em>";
			strHtmls += "</li>";
		}
		$(_pageId + ".bank_over ul").html(strHtmls);
		$(_pageId + ".visc_pullUp").hide();
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false, // false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId + ".top_title").height() - $(_pageId+" .date_filter").height() - 6  ,		//48 为原生底部高度 显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId + "#v_container_funds_jj"),	
					"wrapper":$(_pageId + "#v_wrapper_funds_jj"),	
					"downHandle": function() {	// 下拉获取上一页数据方法
						queryHistory();
						vIscroll.scroll.refresh() ; // 刷新滑动组件滚动条
					},
					"upHandle": function() { // 上拉获取下一页数据方法
					},
					"wrapperObj": null
			};
			vIscroll.scroll = new VIscroll(config); // 初始化，需要做if(!hIscroll._init)判断
			vIscroll._init = true; // 尽量只初始化一次，保持性能
		} else {
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		 $(_pageId + ".no_data").hide();
		 $(_pageId + ".top_title .top_nav").hide();
		 $(_pageId + ".bank_over ul").html("");
		 if(vIscroll._init){
			vIscroll.scroll.refresh();
		 }
		 $(_pageId + " .top_title small").text("一周内");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});