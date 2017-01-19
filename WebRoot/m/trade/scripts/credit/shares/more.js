/**
 * 新股-更多
 */
define('trade/scripts/credit/shares/more.js',function(require, exports, module) {
	var common = require("common");
	var _pageId = "#credit_shares_more ";
	
    /**
     * 初始化
     */
	function init() {
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		
		common.bindStockEvent($(_pageId + '.distr_nav ul li a'));
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("account/index","left");
			e.stopPropagation();
		});
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
		$.pageBack("account/index","left");
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