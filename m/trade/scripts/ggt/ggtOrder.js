/**
 * 港股交易-委托下单
 */
define('trade/scripts/ggt/ggtOrder.js',function(require, exports, module) {
	
	var common = require("common");
    var _pageId = "#ggt_ggtOrder ";

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
			$.pageInit("ggt/ggtOrder","account/index",{},true);
			e.stopPropagation();
		});
		//查询页面事件跳转
//		$.bindEvent($(_pageId + ".main .fund_nav_hk ul li a"), function(e){
//			var topage = $(this).attr("to-page").replaceAll("_","/"); //获取跳转的页面
//			var param =  $(this).attr("param");
//			if(!param){
//				param = "";
//			}
//			$.pageInit("ggt/ggtOrder",topage,{"param":param}); 
//		});
		common.bindStockEvent($(_pageId + ".main .fund_nav_hk ul li a"));
		
	}
	
	function load(){
		common.bindStockEvent($(_pageId+".tab_nav ul li a"),
			function(pageCode,topage){
				$.pageInit(pageCode,topage,$.getPageParam(),'',true);
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
		$.pageInit("ggt/ggtOder","account/index",{});
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