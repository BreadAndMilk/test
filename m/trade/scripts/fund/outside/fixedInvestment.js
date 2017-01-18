/**
 * 场外基金-定投下单
 */
define('trade/scripts/fund/outside/fixedInvestment.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var _pageId = "#fund_outside_fixedInvestment ";
    /**
     * 初始化
     */
	function init(){
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack();
			e.stopPropagation();
		});
		
		if($.getPageParam("param") == "query"){
			$(_pageId+".toggle_nav ul li").eq(1).addClass("active").siblings().removeClass("active");
			$(_pageId+" .fund_cast").show();
			$(_pageId+" .fund_form2").hide();
		}else{
			$(_pageId+".toggle_nav ul li").eq(0).addClass("active").siblings().removeClass("active");
			$(_pageId+" .fund_form2").show();
			$(_pageId+" .fund_cast").hide();
		}
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		$.bindEvent($(_pageId + ".toggle_nav ul li"), function(e){
			$(this).addClass("active").siblings().removeClass("active");
			if($(this).index() == 0){
				$(_pageId+" .fund_form2").show();
				$(_pageId+" .fund_cast").hide();
			}
			else{
				$(_pageId+" .fund_cast").show();
				$(_pageId+" .fund_form2").hide();
			}
		});
	}
	
	/**
	 * 数据重置
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