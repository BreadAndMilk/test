/**
 * 信用交易-更多界面
 */
define('trade/scripts/credit/order/developing.js', function(require, exports, module) {
	var common = require("common");
	var _pageId = "#credit_order_developing ";
	
    /**
     * 初始化
     */
	function init() {
		
    }
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent() {
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageBack("credit/order/mainOrder","left");
			e.stopPropagation();
//			$.pageInit("credit/order/developing","credit/order/mainOrder",{});
		});

	}

	function destroy(){
	}
	
	
	var base = {
		"init" : init,
		"load": load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});