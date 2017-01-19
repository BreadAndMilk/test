/**
 * 信用交易-卖券还款
 */
define('trade/scripts/credit/order/sellTicketsRepayment.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var creditOrder = require("creditOrder");
	var _pageId = "#credit_order_sellTicketsRepayment ";
	var common = require("common");
	var height_table = null;
	var service_credit = require("service_credit");
	var userInfo = null;  // 账号信息
	var contractData = {};
	var selectedList = [];
	
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("credit/order/mainOrder","left");
			e.stopPropagation();
		});
		var orderType = "8"; // 1 ，买入  2，卖出  3，融资买入 4，融券卖出  5，普通买入 6，普通卖出 7，买券还券 8，卖券还款
		creditOrder.dataInit(_pageId,orderType,true);
		var w = Number(gconfig.appWidth * 0.23).toFixed(0);
//		queryContract(w);
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
        height_table =  mainHeight - $(_pageId + ".trade_main").outerHeight(true) - $(_pageId + ".fund_table").css("margin-top").slice(0, -2);  //- $(_pageId+" .toggle_nav").outerHeight(true)
        $(_pageId + ".fund_table").height(height_table);   //给持仓数据添加高度
		$(_pageId + ".ce_btn div.order").css({"padding-top": "3px","line-height":"14px","width":$(_pageId + ".ce_btn a").width(),"display":"inline-block"});
		$(_pageId + ".ce_btn #total").css("display","inline-block");
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//查询跳转
		$.bindEvent($(_pageId+".noicon_text"), function(e){
			$.pageInit("credit/order/sellTicketsRepayment","credit/query/financingQuery",{});
			e.stopPropagation();
		});
		
		creditOrder.elementBindEvent();
		
//		$.bindEvent($(_pageId+" .toggle_nav li"), function(e){
//			$(this).addClass("active").siblings().removeClass("active");
//			if($(this).index() == 0){
//				$(_pageId+" .rule_select").hide();
//				$(_pageId + ".fund_table").height(height_table);
//			}
//			else{
//				$(_pageId+" .rule_select").show();
//				$(_pageId + ".fund_table").height(height_table - $(_pageId+" .rule_select").outerHeight(true)); 
//			}
//			e.stopPropagation();
//		});
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
//						common.addChoiceList($(_pageId+" .rule_select p"), "请选择合约",listHtml,function(data,div){
//							var length = data.length;
//							if(length != 0){
//								div.find("span").html("已选"+length+"项");
//								for(var i = 0; i < length; i++){
//									selectedList.push(data.eq(i).attr("id"));
//								}
//							}
//							else{
//								div.find("span").html("请选择");
//								selectedList = [];
//							}
//						},true);
//					}
//					else{
//						$(_pageId+" .rule_select p span").text("暂无合约信息");
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
	 * 数据重置
	 */
	function destroy(){
		$(_pageId+" .toggle_nav li").eq(0).addClass("active").siblings().removeClass("active");
		$(_pageId+" .rule_select").hide();
		$(_pageId+" .rule_select p span").html("请选择");
		creditOrder.dataDestroy();
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});