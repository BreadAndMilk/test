/**
 * 股份转让下单主页面
 */
define('trade/scripts/stockTransfer/order/order.js',function(require, exports, module) {
	
	var common = require("common");
    var _pageId = "#stockTransfer_order_order ";

    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("stockTransfer/order/order","account/index",{},true);
			e.stopPropagation();
		});
		common.bindStockEvent($(_pageId + ".main .search_nav ul li a"));
	}
	
	function load(){
		common.bindStockEvent($(_pageId+".tab_nav ul li a"),
			function(pageCode,topage){
				$.pageInit(pageCode,topage,$.getPageParam(),'',true);
			});
		var height=$(window).height()-$(_pageId+".header").height()-$(_pageId+".tab_nav").height()-11;
		$(_pageId+".search_nav").height(height).css({"overflow":"auto"});
	}
    
	/**
	 * 销毁
	 */
	function destroy(){
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("stockTransfer/order/order","account/index",{});
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});