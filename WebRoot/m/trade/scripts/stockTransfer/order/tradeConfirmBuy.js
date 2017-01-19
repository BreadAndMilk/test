/**
 * 股份转让成交确认买入
 */
define('trade/scripts/stockTransfer/order/tradeConfirmBuy.js',function(require, exports, module) {
	
	var common = require("common");
	var stockTransferOrder = require("stockTransferOrder");
	var _pageId = "#stockTransfer_order_tradeConfirmBuy ";

    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
		stockTransferOrder.dataInit(_pageId,5);
    }
	
	function load(){
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("stockTransfer/order/tradeConfirmBuy","stockTransfer/order/order",{},true);
			e.stopPropagation();
		});
		stockTransferOrder.elementBindEvent();
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
		stockTransferOrder.dataDestroy();
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("stockTransfer/order/tradeConfirmBuy","stockTransfer/order/order",{},true);
	}
	
	var base = {
		"init" : init,
		"load":load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});