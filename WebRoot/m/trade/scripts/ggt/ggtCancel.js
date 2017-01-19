/**
 * 港股交易-撤单
 */
define('trade/scripts/ggt/ggtCancel.js',function(require, exports, module) {
	
	
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
//	var VIscroll = require("vIscroll");
//	var vIscroll = {"scroll":null,"_init":false}; //上下滑动
	var vIscrollHeight = null;
	var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
	
	var service_ggt = require("service_ggt");
    var _pageId = "#ggt_ggtCancel ";
    var entrustNo = ""; //撤单编号
	var exchangeType = ""; //市场类型
    var userInfo = null;
    
    var _stockInfo={
    	"stockCode":"",
    	"stockName":"",
    	"entrustName":"",
    	"entrustPrice":"",
    	"entrustAmount":"",
    	"businessPrice":"",
    	"businessAmount":"",
    	"entrustNo":"",
    	"exchangeType":"",
		"stock_account":""
    	
    };
    
    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		_stockInfo.stock_account=common.getStockAccount("G");  //获取港股股东账号
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("ggt/ggtCancel","ggt/ggtOrder",{},true);
		});
		//撤单取消
		$.bindEvent($(_pageId + ".pop_footer .pop_btn a:eq(0)"), function(e){
			$(_pageId+".backdrop").hide();
			$(_pageId+".pop_box").hide();
		});
		//撤单确认
		$.bindEvent($(_pageId + ".pop_footer .pop_btn a:eq(1)"), function(e){
			$(_pageId+".backdrop").hide();
			$(_pageId+".pop_box").hide();
			Cancellation();//撤单提交
		});
	}
    
    function load(){
//  	common.bindStockEvent($(_pageId+".tab_nav ul li a"),
//			function(pageCode,topage){
//				$.pageInit(pageCode,topage,$.getPageParam(),'',true);
//			});
		var mianHeight = common.setMainHeight(_pageId, false);
		vIscrollHeight = mianHeight - $(_pageId+".tab_nav").height();
		queryCancellation(); //可撤单查询
    }
    
	/**
	 * 可撤单查询
	 */
	function queryCancellation(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var password = userInfo.password;
		var sessionid = userInfo.session_id;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "password":password,
		    "sessionid":sessionid
		};
		//每次查询前,先将暂无数据隐藏
		$(_pageId+ ".no_data").hide();
		//最后一个函数为超时函数,在超时后,显示暂无数据,并且初始化滑动组件
		service_ggt.queryTodayTrusts_ggt(param,queryTrustDataCallback,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
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
	 * 可撤单查询回调
	 */
	function queryTrustDataCallback(data){
		if (typeof(data) != undefined && typeof(data) != null) {
			$(_pageId + ".main .cancel_order").html("");
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryTrustDataHTML(results[i]);
					}
					$(_pageId + ".main .fund_list2").html(data);
					$(_pageId+ ".no_data").hide();
					// 撤单事件
					$.bindEvent($(_pageId+".fund_list2 .part"), function(e){
						_stockInfo.stockCode=$(this).find(".title h5 em").text();
						_stockInfo.stockName=$(this).find(".title small").text();
						_stockInfo.entrustName=$(this).find(".title span").text();
						_stockInfo.entrustPrice=$(this).find("#entrustPrice").text();
						_stockInfo.entrustAmount=$(this).find("#entrustAmount").text();
						_stockInfo.businessPrice=$(this).find("#businessPrice").text();
						_stockInfo.businessAmount=$(this).find("#businessAmount").text();
						_stockInfo.entrustNo=$(this).attr("data-id");
						_stockInfo.exchangeType=$(this).attr("data-type");
						isCancellation();
						e.stopPropagation();
					},"click");
					// 撤单事件
					$.bindEvent($(_pageId+" .pop_footer #ok"), function(e){
						$(_pageId+".backdrop").hide();
						$(_pageId+".pop_box").hide();
						cancellation(_stockInfo.entrustNo,_stockInfo.exchangeType);
						e.stopPropagation();
					},"click");
					// 撤单事件
					$.bindEvent($(_pageId+".pop_footer #cancel"), function(e){
						$(_pageId+".backdrop").hide();
						$(_pageId+".pop_box").hide();
						e.stopPropagation();
					},"click");
				}else{
					$(_pageId + ".no_data").show();
					$(_pageId + ".visc_pullUp").hide();
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
	 * 可撤单查询HTML生成
	 */
	function queryTrustDataHTML(element){
		var price_digit = 3;
		var css = "";
		var entrust_name = "";
		if(element.entrust_bs == 0){
			css = "tag n1";
		}else if(element.entrust_bs == 1){
			css = "tag n2";
		}
		if(element.entrust_name && element.entrust_name!==" " && element.entrust_name!==""){
			entrust_name = element.entrust_name;
		}
		var eleHtml = "";
//		eleHtml+="<div class=\"part\" data-id="+element.entrust_no+" data-type="+element.exchange_type+">";
//      eleHtml+="<div class=\"title\"><strong class=\""+css+"\">"+entrust_name+"</strong><span>"+element.entrust_time+"</span>";
//		eleHtml+="<span class=\"stat\" style=\"float: right;\">"+element.entrust_state_name+"</span></div>";
//      eleHtml+="<ul class=\"value\">";
//      eleHtml+="<li><strong>"+element.stock_name+"</strong><small>"+element.stock_code+"</small></li>";
//      eleHtml+="<li>";
//  	eleHtml+="<p>委托价：<span>"+Number(element.entrust_price).toFixed(price_digit)+"</span></p>";
//      eleHtml+="<p>汇率：<span>"+Number(element.exchange_rate).toFixed(price_digit)+"</span></p>";
//  	eleHtml+="</li>";
//      eleHtml+="<li>";
//  	eleHtml+="<p>委托数：<span>"+element.entrust_amount+"</span></p>";
//      eleHtml+="<p>成交数：<span>"+element.business_amount+"</span></p>";
//  	eleHtml+="</li>";
//      eleHtml+="</ul>";
//  	eleHtml+="</div>";
		eleHtml+="<div class=\"part\" data-id="+element.entrust_no+" data-type="+element.exchange_type+">";
		eleHtml+="<div class=\"title\"><span class=\""+css+"\">"+entrust_name+"</span><h5><em>"+element.stock_name+"</em><small>"+element.stock_code+"</small></h5><span class=\"time\">"+element.entrust_time+"</span></div>"
       	eleHtml+="<ul>";
       	eleHtml+="<li>委托价 <span id=\"entrustPrice\">"+Number(element.entrust_price).toFixed(price_digit)+"</span></li>";
       	eleHtml+="<li>委托数 <span id=\"entrustAmount\">"+element.entrust_amount+"</span></li>";
       	eleHtml+="<li>交易市场 <span id=\"businessPrice\">"+element.exchange_type_name+"</span></li>";
       	eleHtml+="<li>成交数 <span id=\"businessAmount\">"+element.business_amount+"</span></li>";
       	eleHtml+="</ul>";
       	eleHtml+="</div>";
        return eleHtml;
	}
	
	
	
	
	/**
	 * 确定撤单
	 */
	function isCancellation(){
		$(_pageId+".pop_box .pop_main ul li:eq(0)").find("em").text(_stockInfo.stockCode);
		$(_pageId+".pop_box .pop_main ul li:eq(0)").find("strong").text(_stockInfo.stockName);
		$(_pageId+".pop_box .pop_main ul li:eq(1)").find("em").text(_stockInfo.entrustName);
		$(_pageId+".pop_box .pop_main ul li:eq(2)").find("strong").text(_stockInfo.entrustPrice);
		$(_pageId+".pop_box .pop_main ul li:eq(3)").find("strong").text(_stockInfo.entrustAmount);
		$(_pageId+".pop_box .pop_main ul li:eq(4)").find("strong").text(_stockInfo.businessPrice);
		$(_pageId+".pop_box .pop_main ul li:eq(5)").find("strong").text(_stockInfo.businessAmount);
		$(_pageId+".backdrop").show();
		$(_pageId+".pop_box").show();
		
	}
	/**
	 * 确定撤单
	 */
	function cancellation(entrust_no,exchange_type){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var stock_account=_stockInfo.stock_account;
		var batch_flag = "0";
		var entrust_no = entrust_no;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "password":password,
		    "sessionid":sessionid,
		    "entrust_no":entrust_no,
		    "batch_flag":batch_flag,
			"stock_account":stock_account
		};
		service_ggt.postCancelOrder_ggt(param,postCancelOrderCallback);
	}
    //确定撤单回调
	function postCancelOrderCallback(data){
		if (typeof data != "undefined" && data != null) {
			if (data.error_no == 0) {	
				if(typeof data.results[0] != "undefined" && data.results[0] != null ){
					$.alert("撤单成功");
					queryCancellation();//刷新页面重新加载数据
				}
			}
			else{  
				//$.alert("<div style=\"display:block;text-align:center;padding:0 16px;font-size:16px;word-break:break-all;\">"+data.error_info+"</div>");
				$.alert(data.error_info);
			}
		}
		else{
			$.alert("撤单失败");
		}
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initScroller()
	{
		var scrollOptions = {
			scrollerHeight: vIscrollHeight, // 滚动组件的高度
			pullThreshold: 5, // 拖动刷新或者加载的阀值，默认 5 像素
			$wrapper: $(_pageId + " #wrapper"),
			hasPullDown: true, // 是否显示下拉提示，默认 true
			hasPullUp: false, // 是否显示上拉提示，默认 true
			isAlwaysShowPullUp: false, // 是否一直显示上拉提示，true 一直显示上拉加载的提示，false 仅在上拉的时候显示提示，默认 true
			pullDownHandler: function(){
				queryCancellation(); // 模拟查询接口数据操作
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
	//	common.saveRecords("4004");
	    entrustNo = "";
		exchangeType = "";
		$(_pageId+".cancel_order").html("");
		if(myScroller){
			myScroller.destroy();
			myScroller=null;
		}
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("stock/stockBuy","account/index",{});
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