/**
 * 信用交易-查询主界面
 */
define('trade/scripts/credit/query/financingQuery.js',function(require, exports, module) {
    var _pageId = "#credit_query_financingQuery ";
    var common = require("common");
    
    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		
		common.bindStockEvent($(_pageId + ".main .search_nav ul li a"));
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		var orderHeigt = mianHeight-$(_pageId + ".main .tab_nav").outerHeight();
		$(_pageId + " .main .search_nav").height(orderHeigt-11).css("overflow","auto");
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
//			$.pageInit("credit/query/financingQuery","account/index",{});
			$.pageBack("account/index","left");
			e.stopPropagation();
		});
	}
    
	/**
	 * 销毁
	 */
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