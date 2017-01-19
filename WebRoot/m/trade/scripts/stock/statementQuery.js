/**
 * 普通交易-历史资金流水
 */
define('trade/scripts/stock/statementQuery.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var commonFunc = require("commonFunc");
	var global = gconfig.global;
	var service_stock = require("service_stock");
    var _pageId = "#stock_statementQuery ";
    var userInfo =  null;
    var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
    	
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		statementQuery();
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
//			$.pageInit("stock/statementQuery","stock/stockQuery",{});
			$.pageBack("stock/stockQuery","left");
			e.stopPropagation();
		});
		//时间选择
		$.bindEvent($(_pageId + ".date_filter .btn"), function(e){
 			if(!myScroller){
				initScroller();
			}else{
				myScroller.refresh();
			}
			statementQuery();
		});
	}
	
	/**
	 * 对账单查询
	 */
	function statementQuery(){
		$(_pageId+ ".no_data").hide();
		$(_pageId+".state_list ").html("");
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var business_flag = "";
		var money_type = "";
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"sessionid":sessionid,
			"money_type":money_type,
			"begin_date" : begin_time,
			"end_date" : end_time,
			"business_flag" : business_flag
		};
		$(_pageId+ ".no_data").hide();
		service_stock.queryStatementOfAccount(param,queryStatementOfAccountCallback,
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
	 * 对账单查询回调
	 */
	function queryStatementOfAccountCallback(data){
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".state_list ").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryEntrustHTML(results[i]);
					}
					$(_pageId+".state_list ").html(data);
				}else{
					$(_pageId+".no_data").show();
				}
			}
			else{
				$.alert(data.error_info);
			}
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
		var business_name = element.business_name;
		if($.inArray(element.entrust_bs, ["0","4","62","64","66","68","70"]) != -1){
			css = "n1";
		}else if($.inArray(element.entrust_bs, ["1","5","63","65","67","69","71"]) != -1){
			css = "n2";
		}
		else{
			css = "";
		}
        var eleHtml = "";
        eleHtml+='<div class="part"><div class="title">';
        eleHtml+='<span class="tag '+css+'">'+business_name+'</span><small>'+element.business_date+'</small>';
        eleHtml+='</div><ul>';
        eleHtml+='<li>证券名称<span>'+(element.stock_name || "--")+'</span></li>';
        eleHtml+='<li>证券代码<span>'+(element.stock_code || "--")+'</span></li>';
        eleHtml+='<li>成交均价<span>'+Number(element.business_price).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>成交数量<span>'+Number(element.matchqty)+'</span></li>';
        eleHtml+='<li>成交金额<span>'+Number(element.matchamt).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>资金余额<span>'+Number(element.fundbal).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>发生金额<span>'+Number(element.occur_balance).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>股份余额<span>'+Number(element.stkbal).toFixed(price_digit)+'</span></li>';
        eleHtml+='</ul></div>';
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
				statementQuery(); // 模拟查询接口数据操作
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
		$(_pageId+" .state_list").html("");
		$(_pageId + ".top_title .top_nav").hide();
		$(_pageId + " .top_title small").text("一周内");	
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