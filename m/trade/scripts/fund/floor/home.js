/**
 * 普通交易-查询
 */
define('trade/scripts/fund/floor/home.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config; 
    var global = gconfig.global;
    var _pageId = "#fund_floor_home ";

    /**
     * 初始化
     */
	function init(){
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
			$.pageBack();
			e.stopPropagation();
		});
		
		common.bindStockEvent($(_pageId + '.search_nav2 ul li a'));
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
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});