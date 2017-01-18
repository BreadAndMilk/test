/**
 * OTC-委托成功
 */
define(function(require, exports, module) {
	
	var common = require("common");
    var _pageId = "#otc_otcSuccess ";

    /**
     * 初始化
     */
	function init(){
		
		common.bindStockEvent(_pageId); //绑定头部菜单事件
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("otc/otcSuccess","account/index",{});
		});
	
		//确定
		$.bindEvent($(_pageId+" #success"),function(){
			$.pageInit("otc/otcSuccess","otc/otcProducts",{}); 
		});
		
		
		
	}
    
	/**
	 * 销毁
	 */
	function destroy(){

	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});