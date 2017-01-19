/**
 * 股份转让成交确认卖出
 */
define('trade/scripts/stockTransfer/order/tradeConfirmSell.js',function(require, exports, module) {
	
	var common = require("common");
	var stockTransferOrder = require("stockTransferOrder");
	var _pageId = "#stockTransfer_order_tradeConfirmSell ";
	
    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
		stockTransferOrder.dataInit(_pageId,6);
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("stockTransfer/order/tradeConfirmSell","stockTransfer/order/order",{},true);
			e.stopPropagation();
		});
		stockTransferOrder.elementBindEvent();
	}
	

	function destroy(){
		stockTransferOrder.dataDestroy();
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});