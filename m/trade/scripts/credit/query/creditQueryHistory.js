/**
 * 信用交易-历史查询
 */
define('trade/scripts/credit/query/creditQueryHistory.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var service_credit = require("service_credit");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var _pageId = "#credit_query_creditQueryHistory ";
    var commonFunc = require("commonFunc");
    var userInfo = null;
    var _queryType=null;
    	
    /**
     * 初始化
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		_queryType = $.getPageParam("param"); //根据参数判断委托还是成交查询
		$(_pageId+".search_list").html("");
		if(_queryType=="entrust"){
			$(_pageId + ".top_title h3").text("历史委托");
		}else if(_queryType=="deal"){
			$(_pageId + ".top_title h3").text("历史成交");
		}
		callsQuery(_queryType);
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
		//时间按钮
		$.bindEvent($(_pageId + ".top_title .icon_nav"), function(e){
			$(_pageId + ".top_title .top_nav").slideToggle("fast");
			e.stopPropagation();
		});
		//时间选择
		$.bindEvent($(_pageId + ".date_filter .btn"), function(e){
			if(vIscroll._init){
				vIscroll.scroll.destroy();
				vIscroll.scroll = null;
				vIscroll._init = false;
			}
			callsQuery();
		});
		//页面切换
//		$.bindEvent($(_pageId + ".tab_nav ul li"), function(e){
//			if(vIscroll._init){
//				vIscroll.scroll.destroy();
//				vIscroll.scroll = null;
//				vIscroll._init = false;
//			}
//			$(this).addClass("active").siblings().removeClass("active");
//			$(_pageId + ".top_title h4 span").text($(this).find("a").text());
//			callsQuery();
//		});
		//点击其他位置，隐藏下拉框
		$.bindEvent($(_pageId + ".main"),function(){
		});
	}
	
	/**
	 * 调用查询
	 */
	function callsQuery(queryType){
		if(queryType=="entrust"){
			$(_pageId+".search_list").html("");
			queryEntrust();
		}else{
			$(_pageId+".search_list").html("");
			queryDeal();
		}
	}
	
	/**
	 * 委托查询
	 */
	function queryEntrust(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var password = userInfo.password;
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "password":password,
		    "sessionid":sessionid,
		    "begin_time":begin_time,
		    "end_time":end_time
		};
		$(_pageId+ ".no_data").hide();
		service_credit.historywt_query(param,queryEntrustCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){
				$(_pageId+ ".no_data").show();
				initVIScroll();
				if(vIscroll._init){
					vIscroll.scroll.refresh();
				}
			}
		});
	}
	/**
	 * 委托查询回调
	 */
	function queryEntrustCallback(data){
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".search_list").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryEntrustHTML(results[i]);
					}
					$(_pageId+".search_list").html(data);
				}else{
					$(_pageId+".no_data").show();
				}
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
		else{
			  $.alert("查询失败");
		}
	}
	
	/**
	 * 委托查询HTML生成
	 */
	function queryEntrustHTML(element){
		var price_digit = 3;
//		require("common").decimalKeep(element.stock_code ,function(data){  //获取保留的位数
//	    	if(data){
//	    		price_digit = data;
//	    	}
//		});
		var css = "";
		if("0,4,62,64,66,68,70".indexOf(element.entrust_bs) != -1){
			css = "ared";
		}else if("1,5,63,65,67,69,71".indexOf(element.entrust_bs)!= -1){
			css = "agreen";
		}
        var eleHtml = "";
        eleHtml+="<div class=\"part\">";
        eleHtml+="<span class=\"time\">"+element.entrust_date+"&nbsp"+element.entrust_time+"</span>";
        eleHtml+="<h5 class=\""+css+"\">"+element.entrust_type_name+"</h5>";
        eleHtml+="<dl class=\"clearfix\">";
        eleHtml+="	<dt>"+element.stock_name+" <small>"+element.stock_code+"</small></dt>";
        eleHtml+="    <dd><em>编&#160;&#160;&#160;号</em>"+element.report_no+"</dd>";
        eleHtml+="    <dd><em>状&#160;&#160;&#160;态</em>"+element.entrust_state_name+"</dd>";
        eleHtml+="    <dd><em>委托价格</em>"+Number(element.entrust_price).toFixed(price_digit)+"</dd>";
        eleHtml+="    <dd><em>委托数量</em>"+element.entrust_amount+"</dd>";
        eleHtml+="    <dd><em>成交价格</em>"+Number(element.business_price).toFixed(price_digit)+"</dd>";
        eleHtml+="    <dd><em>成交数量</em>"+element.business_amount+"</dd>";
//      eleHtml+="    <dd><em>委托编号</em>"+element.entrust_no+"</dd>";
//      eleHtml+="    <dd><em>委托类别</em>"+element.entrust_type_name+"</dd>";
//      eleHtml+="    <dd><em>报价方式</em>"+element.trade_name+"</dd>";
        eleHtml+="    <dd><em>股东代码</em>"+element.stock_account+"</dd>";
        eleHtml+="</dl>";
        eleHtml+="</div>";
        return eleHtml;
	}
	
	/**
	 * 成交查询
	 */
	function queryDeal(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "password":password,
		    "begin_time":begin_time,
		    "end_time":end_time
		};
		$(_pageId+ ".no_data").hide();
		service_credit.queryHistoryTrade(param,queryDealCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){
				$(_pageId+ ".no_data").show();
				initVIScroll();
				if(vIscroll._init){
					vIscroll.scroll.refresh();
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
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryDealHTML(results[i]);
					}
					$(_pageId+".search_list").html(data);
				}else{
					$(_pageId+".no_data").show();
				}
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
		else{
			  $.alert("查询失败");
		}
	}
	/**
	 * 成交查询HTML生成
	 */
	function queryDealHTML(element){
		var price_digit = 3;
//		require("common").decimalKeep(element.stock_code ,function(data){  //获取保留的位数
//	    	if(data){
//	    		price_digit = data;
//	    	}
//		});
		var css = "";
		if("0,4,62,64,66,68,70".indexOf(element.entrust_bs) != -1){
			css = "ared";
		}else if("1,5,63,65,67,69,71".indexOf(element.entrust_bs)!= -1){
			css = "agreen";
		}
        var eleHtml = "";
        eleHtml+="<div class=\"part\">";
        eleHtml+="<span class=\"time\">"+element.entrust_date+"&nbsp"+element.entrust_time+"</span>";
        eleHtml+="<h5 class=\""+css+"\">"+element.entrust_type_name+"</h5>";
        eleHtml+="<dl class=\"clearfix\">";
        eleHtml+="	<dt>"+element.stock_name+" <small>"+element.stock_code+"</small></dt>";
//      eleHtml+="    <dd><em>编&#160;&#160;&#160;号</em>"+element.entrust_no+"</dd>";
        eleHtml+="    <dd><em>委托编号</em>"+element.report_no+"</dd>";
        eleHtml+="    <dd><em>金&#160;&#160;&#160;额</em>"+Number(element.business_balance).toFixed(price_digit)+"</dd>";
        eleHtml+="    <dd><em>成交价格</em>"+Number(element.business_price).toFixed(price_digit)+"</dd>";
        eleHtml+="    <dd><em>成交数量</em>"+element.business_amount+"</dd>";
        eleHtml+="    <dd><em>成交编号</em>"+element.entrust_no+"</dd>";
        eleHtml+="    <dd><em>股东代码</em>"+element.stock_account+"</dd>";
//      eleHtml+="    <dd><em>佣金费用</em>"+element.fare0+"</dd>";
//      eleHtml+="    <dd><em>印花税费</em>"+element.fare1+"</dd>";
//      eleHtml+="    <dd><em>过户费用</em>"+element.fare2+"</dd>";
//      eleHtml+="    <dd><em>其他费用</em>"+element.other_fare+"</dd>";
//      eleHtml+="    <dd><em>备&#160;&#160;&#160;注</em>"+element.remark+"</dd>";
        eleHtml+="</dl>";
        eleHtml+="</div>";
        return eleHtml;
       
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".tab_nav").height()- $(_pageId+".date_filter").height() - 6  ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						callsQuery(_queryType);//下拉获取上一页数据方法
					},
					"upHandle": function() {	
						//上拉获取下一页数据方法
					},
					"wrapperObj": null
			};
			vIscroll.scroll = new VIscroll(config); 	//初始化，需要做if(!hIscroll._init)判断
			vIscroll._init = true;
		} else {
			vIscroll.scroll.refresh();
		}
		$(_pageId+ " .visc_pullUp").hide();
	}
	
    
	/**
	 * 销毁
	 */
	function destroy(){
		_queryType=null;
		$(_pageId+".search_list").html("");
		$(_pageId + ".top_title .top_nav").hide();
		$(_pageId + " .top_title small").text("一周内");	
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageBack();
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});