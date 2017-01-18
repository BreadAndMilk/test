/**
 * 预售要约-查询
 */
define(function(require, exports, module) {
	
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	
	var common = require("common");
	
	var _pageId = "#ysyy_ysyySearch ";
	/**
     * 初始化
     */
	function init(){
		$(_pageId).css("overflow-x","hidden");
		common.bindStockEvent(_pageId); //绑定头部菜单事件
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("voting/netVote","account/index");
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
		$.pageInit("voting/netVote","account/index");
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});