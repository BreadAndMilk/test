/**
 * 普通交易-卖出
 */
define('trade/scripts/stock/stockSell.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var sockOrder = require("sockOrder");
	var _pageId = "#stock_stockSell ";
	var common = require("common");
	
    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),function(pageCode,topage){
			$.pageInit(pageCode,topage,$.getPageParam(),"",true);
		});
			
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("stock/stockSell","account/index",{"history":true},"left",true);
//			$.pageBack("account/index","left");
			e.stopPropagation();
		});
		
		var orderType = "2";
		sockOrder.dataInit(_pageId,orderType,true);
    }
	
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
        var height_table =  mainHeight - $(_pageId + ".tab_nav").outerHeight(true) - $(_pageId + ".trade_main").outerHeight(true) - $(_pageId + ".fund_table").css("margin-top").slice(0, -2);
        $(_pageId + ".fund_table").height(height_table);   //给持仓数据添加高度
		$(_pageId + ".ce_btn div.order").css({"padding-top": "3px","line-height":"14px","width":$(_pageId + ".ce_btn a").width(),"display":"inline-block"});
		$(_pageId + ".ce_btn #total").css("display","inline-block");
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		sockOrder.elementBindEvent();
	}
	
	/**
	 * 数据重置
	 */
	function  destroy(){
		sockOrder.dataDestroy();
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});