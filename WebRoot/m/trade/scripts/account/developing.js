/**
 * 更多页面
 */
define('trade/scripts/account/developing.js', function(require, exports, module) {
	
	var _pageId = "#account_developing ";
	var common = require("common");
    /**
     * 初始化
     */
	function init() {
		common.setMainHeight(_pageId, false);
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent() {
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			pageBack();
		});

	}

	function destroy(){
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("account/developing","account/index",{});
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});