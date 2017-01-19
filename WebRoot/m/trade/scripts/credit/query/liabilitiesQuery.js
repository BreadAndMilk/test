/**
 * 信用交易-负债汇总查询
 */
define('trade/scripts/credit/query/liabilitiesQuery.js', function(require, exports, module) {
    var _pageId = "#credit_query_liabilitiesQuery ";
    var common = require("common");
    
    /**
     * 初始化
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
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
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});