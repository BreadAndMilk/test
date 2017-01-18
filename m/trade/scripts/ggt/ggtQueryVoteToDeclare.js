/**
 * 港股交易-历史查询
 */
define('trade/scripts/ggt/ggtQueryVoteToDeclare.js',function(require, exports, module) {
	
	var common = require("common");
	var commonFunc = require("commonFunc");
	var gconfig = $.config;
	var global = gconfig.global;
	var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
	var service_ggt = require("service_ggt");
    var _pageId = "#ggt_ggtQueryVoteToDeclare ";
    var userInfo = null;
    
    
    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		
		// commonFunc.initTimeChoice(_pageId,7, true);
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		if(!myScroller){
			initScroller();
		}else{
			myScroller.refresh();
		}
		callsQuery();
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("ggt/ggtQueryVoteToDeclare","ggt/ggtQuery",{},true);
		});
		
		// $.bindEvent($(_pageId + ".date_filter .btn"), function(e){
		// 	if(!myScroller){
		// 		initScroller();
		// 	}else{
		// 		myScroller.refresh();
		// 	}
		// 	callsQuery();
		// });
	}
	
	
	/**
	 * 查询投票申报
	 */
	function callsQuery(){
		var entrust_way=global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var stock_account=userInfo.stock_account;
		var flag="0";
		var entrust_type="100";
		// var end_time = $(_pageId+" #endDate").text();
		// var begin_time = $(_pageId+" #startDate").text();
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "flag":flag,
			"entrust_flag":entrust_type
		};
		$(_pageId+ ".no_data").hide();
		service_ggt.queryTodayTrust_ggt(param,queryEntrustCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){
				$(_pageId+ ".no_data").show();
				if(!myScroller){
					initScroller();
				}else{
					myScroller.refresh();
				}
			}
		});
	}
	/**
	 * 委托查询回调
	 */
	function queryEntrustCallback(data){
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".fund_list2").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryEntrustHTML(results[i]);
					}
					$(_pageId+".fund_list2").html(data);
				}else{
					$(_pageId+".no_data").show();
				}
			
			}
			else{
				$.alert(data.error_info);
			}
		}
		else{
			  $.alert("查询失败");
		}
		if(!myScroller){
			initScroller();
		}else{
			myScroller.refresh();
		}
		
	}
	
	/**
	 * 委托查询HTML生成
	 */
	function queryEntrustHTML(element){
		
		var price_digit = 3;
		var eleHtml = "";
		eleHtml+="<div class=\"part\">";
		eleHtml+="<div class=\"title\">";
		eleHtml+="<h5>"+element.stock_name+" <small>"+element.stock_code+"</small></h5><span class=\"time\">"+element.apply_time+"</span>";
		eleHtml+="</div>";
		eleHtml+="<ul>";
		eleHtml+="<li>公告编号 <em>"+element.placard_id+"</em></li>";
		eleHtml+="<li>议案编号 <em>"+element.motion_id+"</em></li>";
		eleHtml+="<li>赞成票数 <em>"+element.approve_amount+"</em></li>";
		eleHtml+="<li>反对票数 <em>"+element.oppose_amount+"</em></li>";
		eleHtml+="<li>弃权票数 <em>"+element.waive_amount+"</em></li>";
		eleHtml+="<li>申报状态 <em>"+element.trust_status_fj+"</em></li>";
		eleHtml+="<li>成交编号 <em>"+element.business_id+"</em></li>";
        return eleHtml;
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initScroller()
	{
		var scrollOptions = {
			scrollerHeight: $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".date_filter").height() , // 滚动组件的高度
			pullThreshold: 5, // 拖动刷新或者加载的阀值，默认 5 像素
			$wrapper: $(_pageId + " #wrapper"),
			hasPullDown: true, // 是否显示下拉提示，默认 true
			hasPullUp: false, // 是否显示上拉提示，默认 true
			isAlwaysShowPullUp: false, // 是否一直显示上拉提示，true 一直显示上拉加载的提示，false 仅在上拉的时候显示提示，默认 true
			pullDownHandler: function(){
				callsQuery(); // 模拟查询接口数据操作
			},
			pullUpHandler: function(){
			}
		};
		if(!myScroller)
		{
			// 内容的高度比滚动区域高度小时
			// iscrollUtils 已有相同判断的代码，此处这样写的目的是为了解决 Android UC、微信等浏览器滚动失效的问题，在 iscrollUtils 设置高度，在初始化组件时，取到的值不准确
			if(scrollOptions.$wrapper.find("[data-is-content='true']").height() <= scrollOptions.scrollerHeight)
			{
				scrollOptions.$wrapper.children().height(scrollOptions.scrollerHeight + 1);
			}
			myScroller = iscrollUtils.vScroller(scrollOptions);
		}
		else
		{
			myScroller.refresh();
		}
	}
    
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId+".fund_list2").html("");
		if(myScroller)
		{
			myScroller.destroy();
			myScroller = null;
		}
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		var sCurPage = $.getSStorageInfo("_curPage");
		var curPage = JSON.parse(sCurPage);
		var prePageCode = curPage.prePageCode;
		if(!prePageCode || prePageCode=="account/login"){
			prePageCode ="account/index";
		}
		$.pageInit("ggt/ggtQueryVoteToDeclare",prePageCode,{},true);
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