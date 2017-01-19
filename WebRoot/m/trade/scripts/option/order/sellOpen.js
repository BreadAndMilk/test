/**
 * 个股期权--下单--卖出开仓
 */
define('trade/scripts/option/order/sellOpen.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var optionOrder = require("optionOrder");
	var _pageId = "#option_order_sellOpen ";
	var common = require("common");
	
    /**
     * 初始化
     */
	function init(){
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("option/order/homePage","left");
			e.stopPropagation();
		});
		var orderType = "2"; 
		optionOrder.dataInit(_pageId,orderType,true);
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//查询跳转
		$.bindEvent($(_pageId+".noicon_text"), function(e){
			$.pageInit("option/order/sellOpen","option/query/financingQuery",{});
			e.stopPropagation();
		});
		
		optionOrder.elementBindEvent();
		
		$.bindEvent($(_pageId+" .toggle_nav li"), function(e){
			$(this).addClass("active").siblings().removeClass("active");
			e.stopPropagation();
		});
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
		optionOrder.dataDestroy();
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});