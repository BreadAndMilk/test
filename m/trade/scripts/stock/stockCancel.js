/**
 * 普通交易-撤单
 */
define('trade/scripts/stock/stockCancel.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var vIscrollHeight = null;
	var service_stock = require("service_stock");
    var _pageId = "#stock_stockCancel ";
    var userInfo = null;
    var stock_code = "";
    var stock_num = "";  
    var stock_direction = "";
    var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
    
    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		userInfo = common.getCurUserInfo();
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("stock/stockCancel","account/index",{"history":true},"left",true);
//			$.pageBack("account/index","left");
			e.stopPropagation();
		});
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		vIscrollHeight = mianHeight - $(_pageId+".tab_nav").height();
		queryCancellation(); // 可撤单查询
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
	}
    
	/**
	 * 可撤单查询
	 */
	function queryCancellation(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid = userInfo.session_id;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid
		};
		// 每次查询前,先将暂无数据隐藏
		$(_pageId + ".no_data").hide();
		// 最后一个函数为超时函数,在超时后,显示暂无数据,并且初始化滑动组件
		service_stock.queryTrustData(param,queryTrustDataCallback,
		{ // 传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":false,
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
	 * 可撤单查询回调
	 */
	function queryTrustDataCallback(data){
		if (typeof(data) != undefined && typeof(data) != null) {
//			$(_pageId + ".search_table .ce_table").html("");
			$(_pageId + ".main .cancel_order").html("");
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryTrustDataHTML(results[i],i);
					}
					$(_pageId + ".main .cancel_order").html(data);
					$(_pageId+ ".no_data").hide();
					// 撤单事件
					$.bindEvent($(_pageId+".cancel_order .part"), function(e){
						var $this = $(this);
						var tipStrArray = [];
						tipStrArray.push([$this.find("div.title strong").text(), $this.find("div.title small").text()]);
						tipStrArray.push(["买卖方向 ", $this.find("div.title span.tag").text()]);
						tipStrArray.push(["委托价格 ", $this.find("ul li").eq(0).find("p").text()]);
						tipStrArray.push(["委托数量 ", $this.find("ul li").eq(1).find("p").text()]);
						tipStrArray.push(["成交数量 ", $this.find("ul li").eq(3).find("p").text()]);
						var tipStr = "<div >";
						tipStr += common.generatePrompt(tipStrArray);
						tipStr += "</div>";
						common.iConfirm("确认撤单",tipStr,function(){
							var entrust_no = $this.attr("data-id");
							var exchange_type = $this.attr("data-type");
							cancellation(entrust_no,exchange_type); // 确认撤单
						});
						e.stopPropagation();
					}, "tap");
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
		if($.inArray(element.entrust_bs, ["0","4","62","64","66","68","70"]) != -1){
			css = "n1";
		}else if($.inArray(element.entrust_bs, ["1","5","63","65","67","69","71"]) != -1){
			css = "n2";
		}
		if(element.entrust_name && element.entrust_name!==" " && element.entrust_name!==""){
			entrust_name = element.entrust_name;
		}
		var eleHtml = "";
		eleHtml+="<div class=\"part\" data-id="+element.entrust_no+" data-type="+element.exchange_type+">";
        eleHtml+="<div class=\"title\"><span class=\"tag "+css+"\">"+entrust_name+"</span><strong>"+element.stock_name+"</strong><small>"+element.stock_code+"</small>";
        eleHtml+="<span class=\"time\">"+element.entrust_time+"</span></div><ul>";
    	eleHtml+="<li><span>委托价 </span><p>"+Number(element.entrust_price).toFixed(price_digit)+"</p></li>";
    	eleHtml+="<li><span>委托数 </span><p>"+element.entrust_amount+"</p></li>";
        eleHtml+="<li><span>成交价 </span><p>"+Number(element.business_price).toFixed(price_digit)+"</p></li>";
        eleHtml+="<li><span>成交数 </span><p>"+element.business_amount+"</p></li>";
        eleHtml+="</ul></div>";
		return eleHtml;
	}

	/**
	 * 确定撤单
	 */
	function cancellation(entrustNo,exchangeType){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//
		var cust_code = userInfo.cust_code; // 关联资产账户标志
		var sessionid = userInfo.session_id;
		var batch_flag = "0";
		var entrust_no = entrustNo;
		var exchange_type = exchangeType;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "entrust_no":entrust_no,
		    "batch_flag":batch_flag,
		    "exchange_type":exchange_type
		};
		service_stock.postCancelOrder(param,postCancelOrderCallback);
	}
    //确定撤单回调
	function postCancelOrderCallback(data){
		if (typeof data != "undefined" && data != null) {
			if (data.error_no == 0) {	
				if(typeof data.results[0] != "undefined" && data.results[0] != null ){
					$.alert("撤单成功",function(){
						queryCancellation(); //刷新页面重新加载数据
					});
				}
			}else{  
				$.alert(data.error_info,function(){queryCancellation();});
			}
		}else{
			$.alert("撤单失败",function(){queryCancellation();});
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
	    stock_code = "";
	    stock_num = "";  
	    stock_direction = "";
		$(_pageId + ".main .cancel_order").html("");
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