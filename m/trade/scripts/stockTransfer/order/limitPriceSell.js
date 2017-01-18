/**
 * 股份转让限价买入
 */
define('trade/scripts/stockTransfer/order/limitPriceSell.js',function(require, exports, module) {
	
	var stockTransferOrder = require("stockTransferOrder");
	var common = require("common");
	var _pageId = "#stockTransfer_order_limitPriceSell ";
	
    /**
     * 初始化
     */
	function init(){
		var userInfo = common.getCurUserInfo();
		common.setMainHeight(_pageId, false);
		stockTransferOrder.dataInit(_pageId,2);
    }
	
	function load(){
		
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("stockTransfer/order/limitPriceSell","stockTransfer/order/order",{},true);
			e.stopPropagation();
		});
		common.bindStockEvent($(_pageId+".tab_nav ul li a"),
			function(pageCode,topage){
				$.pageInit(pageCode,topage,$.getPageParam(),'',true);
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