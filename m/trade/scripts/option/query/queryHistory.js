/**
 * 普通交易-历史查询
 */
define('trade/scripts/option/query/queryHistory.js', function(require, exports, module) {
	var common = require("common");
	var commonFunc = require("commonFunc");
	var gconfig = $.config;
	var global = gconfig.global;
	var service_stock = require("service_stock");
    var _pageId = "#option_query_queryHistory ";
    var userInfo = null;
    var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
    
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		var queryType = $.getPageParam("param"); //根据参数判断委托还是成交查询
		if(queryType=="entrust"){
			$(_pageId+".toggle_nav ul li").eq(0).addClass("active").siblings().removeClass("active");
		}else if(queryType=="deal"){
			$(_pageId+".toggle_nav ul li").eq(1).addClass("active").siblings().removeClass("active");
		}
		commonFunc.initTimeChoice(_pageId,7, true);
		callsQuery();
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
//			$.pageInit("option/query/queryHistory","option/query/stockQuery",{});
			$.pageBack("option/query/stockQuery","left");
			e.stopPropagation();
		});
		//时间选择
		$.bindEvent($(_pageId + ".date_filter .btn"), function(e){
			if(!myScroller){
				initScroller();
			}else{
				myScroller.refresh();
			}
			callsQuery();
		});
		//页面切换
		$.bindEvent($(_pageId + ".toggle_nav ul li"), function(e){
			if(!myScroller){
				initScroller();
			}else{
				myScroller.refresh();
			}
			$(this).addClass("active").siblings().removeClass("active");
			callsQuery();
		});
		
	}
	
	/**
	 * 调用查询
	 */
	function callsQuery(){
		$(_pageId+".search_table2").html("");
		if($(_pageId+".toggle_nav ul li").eq(0).hasClass("active")){
			queryEntrust();
		}else{
			queryDeal();
		}
	}
	
	/**
	 * 委托查询
	 */
	function queryEntrust(){
		var entrust_way=global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "begin_time":begin_time,
		    "end_time":end_time
		};
		$(_pageId+ ".no_data").hide();
		service_stock.queryHistoryTrust(param,queryEntrustCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){ // 超时调用方法
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
			$(_pageId+".main .search_table2").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var html = '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><th scope="col">名称/时间</th><th scope="col">委托/成交价</th><th scope="col">委托/成交数</th><th scope="col">类型/状态</th></tr>';
					for (var i=0;i<results.length;i++){
						html += queryEntrustHTML(results[i],i);
					}
					html += '</table>';
					$(_pageId+ ".main .search_table2").html(html);
					$(_pageId+ ".no_data").hide();
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
	function queryEntrustHTML(element,i){
		var price_digit = 3;
		var css = "";
		var entrust_name = "";
		if(element.entrust_name && element.entrust_name!==" " && element.entrust_name!==""){
			entrust_name = element.entrust_name;
		}
		if($.inArray(element.entrust_bs, ["0","4","62","64","66","68","70"]) != -1){
			css = "n1";
			entrust_name ="买入";
		}else if($.inArray(element.entrust_bs, ["1","5","63","65","67","69","71"]) != -1){
			css = "n2";
			entrust_name ="卖出";
		}else{
			css = "";
		}
		var eleHtml = "";
      	eleHtml+="<tr>";
        eleHtml+="<td><strong>"+element.stock_name+"</strong><small>"+element.entrust_date+"<br/>"+element.entrust_time+"</small></td>";
        eleHtml+="<td><span>"+Number(element.entrust_price).toFixed(price_digit)+"</span><span>"+Number(element.business_price).toFixed(price_digit)+"</span></td>";
        eleHtml+="<td><span>"+element.entrust_amount+"</span><span>"+element.business_amount+"</span></td>";
        eleHtml+="<td><em class=\""+css+"\">"+entrust_name+"</em><span>"+element.entrust_state_name+"</span></td>";
      	eleHtml+="</tr>";
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
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "begin_time":begin_time,
		    "end_time":end_time
		};
		$(_pageId+ ".no_data").hide();
		service_stock.queryHistoryTrade(param,queryDealCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){ // 超时调用方法
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
			$(_pageId+" .tarde_hit").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results != "undefined" && results.length>0){
					var html = '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><th scope="col">名称/时间</th><th scope="col">成交价/成交数</th><th scope="col">成交金额</th><th scope="col">类型</th></tr>';
					for (var i=0;i<results.length;i++){
						html += queryDealHTML(results[i],i);
					}
					html += '</table>';
					$(_pageId+".main .search_table2").html(html);
					$(_pageId+".no_data").hide();
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
		if($.inArray(element.entrust_bs, ["0","4","62","64","66","68","70"]) != -1){
			css = "n1";
			entrust_name ="买入";
		}else if($.inArray(element.entrust_bs, ["1","5","63","65","67","69","71"]) != -1){
			css = "n2";
			entrust_name ="卖出";
		}else{
			css = "";
		}
		var eleHtml = "";
      	eleHtml+="<tr>";
        eleHtml+="<td><strong>"+element.stock_name+"</strong><small>"+element.business_date+"<br/>"+element.business_time+"</small></td>";
        eleHtml+="<td><span>"+Number(element.business_price).toFixed(price_digit)+"</span><span>"+element.business_amount+"</span></td>";
        eleHtml+="<td><span>"+Number(element.business_balance).toFixed(price_digit)+"</span></td>";
        eleHtml+="<td><em class=\""+css+"\">"+entrust_name+"</em></td>";
      	eleHtml+="</tr>";
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
		$(_pageId+".search_table2").html("");
		$(_pageId + ".top_title .top_nav").hide();
		if(myScroller)
		{
			myScroller.destroy();
			myScroller = null;
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