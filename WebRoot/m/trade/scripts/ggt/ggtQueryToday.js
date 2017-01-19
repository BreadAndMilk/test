/**
 * 港股交易-今日查询
 */
define('trade/scripts/ggt/ggtQueryToday.js',function(require, exports, module) {
	
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	
	var service_ggt = require("service_ggt");
    var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
    var _pageId = "#ggt_ggtQueryToday ";
    var userInfo = null;
    var time = null;
    
    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		var queryType = $.getPageParam("param");
		if(queryType=="entrust"){
			$(_pageId+".top_title .toggle_nav ul li:eq(0)").addClass("active").siblings().removeClass("active");
			$(_pageId + ".top_title h3").text("今日委托");
		}else if(queryType=="deal"){
			$(_pageId+".top_title .toggle_nav ul li:eq(1)").addClass("active").siblings().removeClass("active");
			$(_pageId + ".top_title h3").text("今日成交");
		}
		
    }
	
	function load(){
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
			
			$.pageInit("ggt/ggtQueryToday","ggt/ggtQuery",{},true);
		});
		//页面切换
		$.bindEvent($(_pageId + ".top_title .toggle_nav ul li"), function(e){
			if($(this).attr("class") != "active"){
				var date = new Date().getTime();
				var s = (date - time)/1000;
				time = date;
				$(this).addClass("active").siblings().removeClass("active");
				callsQuery();
			}
		});
		
	}
    
	/**
	 * 调用查询
	 */
	function callsQuery(){
		if($(_pageId+".top_title .toggle_nav ul li:eq(0)").hasClass("active")){
			$(_pageId+".fund_list2").html("");
			queryEntrust();
		}else{
			$(_pageId+".fund_list2").html("");
			queryDeal();
		}
	}
	
	/**
	 * 委托查询
	 */
	function queryEntrust(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var password = userInfo.password;
		var sessionid=userInfo.session_id;
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "password":password,
			    "sessionid":sessionid
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
		var css = "";
		var entrust_name = "";
		if(element.entrust_name && element.entrust_name!==" " && element.entrust_name!==""){
			entrust_name = element.entrust_name;
		}
		if(element.entrust_bs == "0"){
			css = "tag n1";
			entrust_name ="买";
		}else if(element.entrust_bs == "1"){
			css = "tag n2";
			entrust_name ="卖";
		}
        var eleHtml = "";

		eleHtml+="<div class=\"part\">";
		eleHtml+="<div class=\"title\"><span class=\""+css+"\">"+entrust_name+"</span><h5><em>"+element.stock_name+"</em><small>"+element.stock_code+"</small></h5><span class=\"stat\">"+element.entrust_state_name+"</span></div>"
       	eleHtml+="<ul>";
       	eleHtml+="<li>委托价 <span>"+Number(element.entrust_price).toFixed(price_digit)+"</span></li>";
       	eleHtml+="<li>委托数 <span>"+element.entrust_amount+"</span></li>";
       	eleHtml+="<li>成交价 <span>"+Number(element.business_price).toFixed(price_digit)+"</span></li>";
       	eleHtml+="<li>成交数 <span>"+element.business_amount+"</span></li>";
       	eleHtml+="<li class=\"full\">委托时间 <span>"+element.entrust_time+"</span></li>";
       	eleHtml+="</ul>";
       	eleHtml+="</div>";
        return eleHtml;
	}
	
	/**
	 * 成交查询
	 */
	function queryDeal(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "password":password,
		    "sessionid":sessionid
		};
		$(_pageId+ ".no_data").hide();
		service_ggt.queryTodayTrade_ggt(param,queryDealCallback,
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
	 * 成交查询回调
	 */
	function queryDealCallback(data){
		if (typeof(data) != "undefined" && data != null) {
			$(_pageId+" .fund_list2").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results != "undefined" && results.length>0){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryDealHTML(results[i]);
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
	 * 成交查询HTML生成
	 */
	function queryDealHTML(element){
		var price_digit = 3;
		var css = "";
		var entrust_name = "";
		if(element.entrust_name && element.entrust_name!==" " && element.entrust_name!==""){
			entrust_name = element.entrust_name;
		}
		if(element.entrust_bs == "0"){
			css = "in";
			entrust_name ="买";
		}else if(element.entrust_bs == "1"){
			css = "out";
			entrust_name ="卖";
		}else{
			css = "other";
		}
		var eleHtml = "";
		eleHtml+="<div class=\"part\">";
		eleHtml+="<span class=\"tip "+css+"\">"+entrust_name+"</span>";
		eleHtml+="<span class=\"stat\">"+element.real_status_name+"</span>";
		eleHtml+="<h5>"+element.stock_name+"<span>"+element.business_time+"</span></h5>";
		eleHtml+="<ul class=\"clearfix\">";
		eleHtml+="<li>编号： <span>"+element.entrust_no+"</span></li>";
		eleHtml+="<li>金额： <span>"+Number(element.business_balance).toFixed(price_digit)+"</span></li>";
		eleHtml+="<li>成交价： <span>"+Number(element.business_price).toFixed(price_digit)+"</span></li>";
		eleHtml+="<li>成交数： <span>"+element.business_amount+"</span></li>";
		eleHtml+="</ul></div>";
        return eleHtml;
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initScroller()
	{
		var scrollOptions = {
			scrollerHeight: $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".tab_nav").height() , // 滚动组件的高度
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
		$(_pageId+".search_list").html("");
		if(myScroller){
			myScroller.destroy();
			myScroller=null;
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
		$.pageInit("ggt/ggtQueryToday",prePageCode,{});
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