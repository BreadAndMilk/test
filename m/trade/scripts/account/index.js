/**
 * 交易主界面
 */
define('trade/scripts/account/index.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
    var _pageId = "#account_index ";
    var common = require("com");
    var com = require("common");
    var indexPort = null;
    var iscrollUtils = require("iscrollUtils");
    var loadingTimes = 0;
	var myScroller = null; // 滑动组件对象
    
    /**
     * 初始化
     */
	function init(){
		var ah = window.sessionStorage["_account_index"];
		if(ah){
			loadingTimes = ah;
		}
		if($.getPageParam("history")){
			loadingTimes = Number(loadingTimes)+1;
		}
		if(loadingTimes>1){
			history.go(-1);
			loadingTimes = 1;
		}
		if(loadingTimes == 0){
			loadingTimes = 1;
		}
		window.sessionStorage["_account_index"] = loadingTimes;
		// 获取壳子里的全局登陆状态，1:已经登陆； 0:代表退出
		var isLoginIn = $.getSStorageInfo("_isLoginIn");
		if(isLoginIn && isLoginIn != "false"){
			if(!indexPort){
				 require.async("trade/scripts/account/indexPort.js",function(module){
				 	indexPort = module;
				 	indexPort.into(_pageId);
		         });
			}
			else{
				indexPort.into(_pageId);
			}
		}
		else{
			jumpPageEvent();
		}
		// 高度初始化
		$(_pageId + "#version").html("version："+_sysVersion);
    }
	
	function load(){
		var mianHeight = gconfig.appHeight - $(_pageId+".header").outerHeight(true) - $(_pageId+" .footer").outerHeight(true);
		$(_pageId + " section.main").height(mianHeight);
        var height_meau = mianHeight - $(_pageId+".home_value").outerHeight(true) - $(_pageId + " .home_nav").outerHeight(true);
//		$(_pageId + " .home_nav2").height(height_meau).css("overflow","auto");
        initScroller(height_meau);
	}
	/**
	 * 初始化滑动组件
	 */
	function initScroller(height_meau)
	{
		var scrollOptions = {
			scrollerHeight: height_meau, // 滚动组件的高度
			$wrapper: $(_pageId + " #wrapper"),
			scrollbars: true, // 隐藏滚动条
			hasPullDown: false, // 是否显示下拉提示，默认 true
			hasPullUp: false, // 是否显示上拉提示，默认 true
			bounceTime: 500 // 回弹的动画时间
		};
		if(!myScroller)
		{
			myScroller = iscrollUtils.vScroller(scrollOptions);
		}
		else
		{
			myScroller.refresh();
		}
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		$.bindEvent($(".footer .ft_nav li").eq(0),function() {
			window.location.href = gconfig.seaBaseUrl + "hq/index.html#!/hq/zxgList.html";
		});
	}
	
	/**
	 * 事件绑定
	 */
	function jumpPageEvent(){
		// 主页菜单事件绑定
		$.bindEvent($(_pageId + ".main ul li a"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			var topage = $(this).attr("to-page").replaceAll("_","/"); // 获取跳转的页面
			var param =  $(this).attr("param"); // 获取跳转页面参数
			$.pageInit("account/index","account/login",{"topage":topage,"param":param});
			e.stopPropagation();
		}, "tap");
		// 登录
		$.bindEvent($(_pageId + " .top_title .user_box span"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("account/index","account/login",{});
			e.stopPropagation();
		});
		// 登录
		$.bindEvent($(_pageId + " .main>.home_value"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("account/index","account/login",{});
			e.stopPropagation();
		});
	}
    
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId + ".top_title .user_box span").text("请登录");
		$(_pageId + ".top_title .logout").hide();
		$(_pageId + ".home_value strong").html("--");
		$(_pageId + ".home_value li p").html("--").attr("class",'');
		if(myScroller)
		{
			myScroller.destroy();
			myScroller = null;
		}
		if(indexPort){
			indexPort.clearTimer();
		}
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});