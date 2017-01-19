/**
 * 股份转让下单主页面
 */
define('trade/scripts/stockTransfer/query/query.js',function(require, exports, module) {
	
	var common = require("common");
    var _pageId = "#stockTransfer_query_query ";

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
			$.pageInit("stockTransfer/query/query","account/index",{},true);
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
		$.pageInit("stockTransfer/query/query","account/index",{});
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