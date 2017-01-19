/**
 * 股份转让意向买入
 */
define('trade/scripts/stockTransfer/order/confirmBuy.js',function(require, exports, module) {
	
	var common = require("common");
	var stockTransferOrder = require("stockTransferOrder");
	var _pageId = "#stockTransfer_order_confirmBuy ";
	
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
			$.pageInit("stockTransfer/order/confirmBuy","stockTransfer/order/order",{},true);
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