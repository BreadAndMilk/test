/**
 * 普通交易-买入
 */
define(function(require, exports, module) {
	
	var ggtOrder = require("ggtOrder");
	var common = require("common");
	var _pageId = "#ggt_ggtSell ";
	
    /**
     * 初始化
     */
	function init(){
		var userInfo = common.getCurUserInfo();
		if(!userInfo || !userInfo.cust_code){
			$.pageInit("ggt/ggtSell","account/login",$.getPageParam());
			return false;
		}
		common.setMainHeight(_pageId, false);
		var orderType = "2"; // 1 ，买入  2，卖出  3，碎股
		ggtOrder.dataInit(_pageId,orderType);
    }

	function load() {
		var mainHeight =  common.setMainHeight(_pageId, false);
		var height_table =  mainHeight  - $(_pageId + ".trade_main").outerHeight(true) - $(_pageId + ".fund_table").css("margin-top").slice(0, -2);
		$(_pageId + ".fund_table").css({"overflow":"auto","height":height_table});
	}


	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		ggtOrder.elementBindEvent();
		common.bindStockEvent($(_pageId+".tab_nav ul li a"),
			function(pageCode,topage){
				$.pageInit(pageCode,topage,$.getPageParam(),'',true);
			});
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
	//	common.saveRecords("4002");
		ggtOrder.dataDestroy();
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		ggtOrder.orderPageBack();
	}
	
	var base = {
		"init" : init,
		"load":load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});