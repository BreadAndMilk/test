/**
 * 信用交易-融资卖出
 */
define('trade/scripts/credit/order/financingToSell.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var creditOrder = require("creditOrder");
	var _pageId = "#credit_order_financingToSell ";
	var common = require("common");
	var userInfo = null;  // 账号信息
	
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
		var orderType = "4"; // 1 ，买入  2，卖出  3，融资买入 4，融券卖出  5，普通买入 6，普通卖出 7，买券还券 8，卖券还款
		creditOrder.dataInit(_pageId,orderType,true);
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, true);
        var height_table =  mainHeight - $(_pageId + ".trade_main").outerHeight(true) - $(_pageId + ".fund_table").css("margin-top").slice(0, -2) - 2;  //- $(_pageId + ".toggle_nav_lits").outerHeight(true)
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
			$.pageInit("credit/order/financingToSell","credit/query/financingQuery",{});
			e.stopPropagation();
		});
		
		creditOrder.elementBindEvent();
	}

	/**
	 * 数据重置
	 */
	function destroy(){
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