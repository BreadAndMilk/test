/**
 * 信用交易-查询新股申购额度
 */
define('trade/scripts/credit/query/newAmountQuery.js', function(require,exports,module){
	var gconfig = $.config,
		layerUtils = require("layerUtils"),
		_pageId = "#credit_query_newAmountQuery ";
	var common = require("common");
	
	/**
	 * 初始化
	 * */
	function init()
	{
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	
	/**
	 * 事件绑定
	 * */
	function bindPageEvent()
	{
		
	}
	
	/**
	 * 销毁
	 * */
	function destroy()
	{
		
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});