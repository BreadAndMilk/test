/**
 * 普通交易-查询
 */
define('trade/scripts/stock/stockQuery.js', function(require, exports, module) {
	
	var common = require("common");
	var gconfig = $.config; 
    var global = gconfig.global;
    var _pageId = "#stock_stockQuery ";

    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		jumpPageEvent();
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		var height_search = mianHeight - $(_pageId+".tab_nav").outerHeight(true);
		$(_pageId+" .main .search_nav").height(height_search-10).css("overflow-y","auto"); //查询目录添加高度
	}
	/**
	 * 跳转页面事件
	 * $(this).unbind();
	 * this.click = null;
	 */
	function jumpPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("stock/stockQuery","account/index",{"history":true},"left",true);
//			$.pageBack("account/index","left");
			e.stopPropagation();
		});
		
		//查询页面事件跳转
		common.bindStockEvent($(_pageId + ".main .search_nav ul li a"));
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		
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
		$.pageInit("stock/stockQuery","account/index",{});
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