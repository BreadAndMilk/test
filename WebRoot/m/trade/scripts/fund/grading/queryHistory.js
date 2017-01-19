/**
 * 分级基金历史查询
 */
define('trade/scripts/fund/grading/queryHistory.js', function(require, exports, module) {
	var common = require("common");
	var commonFunc = require("commonFunc");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var service_fund = require("service_fund");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var _pageId = "#fund_grading_queryHistory ";
    var userInfo = null;
    
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
		commonFunc.initTimeChoice(_pageId,7,true);
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
//			$.pageInit("stock/stockQueryHistory","stock/stockQuery",{});
			$.pageBack();
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
		$.bindEvent($(_pageId + ".toggle_nav ul li"), function(e){
			if(vIscroll._init){
				vIscroll.scroll.destroy();
				vIscroll.scroll = null;
				vIscroll._init = false;
			}
			$(this).addClass("active").siblings().removeClass("active");
			callsQuery();
		});
		
	}
	
	/**
	 * 调用查询
	 */
	function callsQuery(){
		$(_pageId+".fund_list2").html("");
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
		service_fund.gradingHistoryTrust(param,queryEntrustCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){ // 超时调用方法
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
			$(_pageId+".main .fund_list2").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var html = '';
					for (var i=0;i<results.length;i++){
						html += queryEntrustHTML(results[i],i);
					}
					$(_pageId+ ".main .fund_list2").html(html);
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
		if(!vIscroll._init){
			initVIScroll();
		}else{
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * 委托查询HTML生成
	 */
	function queryEntrustHTML(element,i){
		var price_digit = 3;
		var css = "";
		var eleHtml = "";
		eleHtml +='<div class="part">';
        eleHtml +='<div class="title">';
        eleHtml +='<h5>'+element.fund_name+' <small>'+element.fund_code+'</small></h5></div><ul>';
        eleHtml +='<li>委托类型  <span>'+element.business_name+'</span></li>';
        eleHtml +='<li>委托状态  <span>'+element.entrust_status_mame+'</span></li>';
        eleHtml +='<li>委托份额  <span>'+Number(element.shares).toFixed(price_digit)+'</span></li>';
        eleHtml +='<li>委托金额 <span>'+Number(element.balance).toFixed(price_digit)+'</span></li>';
        eleHtml +='<li class="full">委托时间 <span>'+element.entrust_date+" "+element.entrust_time+'</span></li>';
        eleHtml +='</ul></div>';
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
		service_fund.gradingHistoryDeal(param,queryDealCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){ // 超时调用方法
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
					var html = "";
					for (var i=0;i<results.length;i++){
						html += queryDealHTML(results[i],i);
					}
					$(_pageId+".main .fund_list2").html(html);
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
		if(!vIscroll._init){
			initVIScroll();
		}else{
			vIscroll.scroll.refresh();
		}
	}
	/**
	 * 成交查询HTML生成
	 */
	function queryDealHTML(element){
		var price_digit = 3;
		var css = "";
		var eleHtml = "";
		eleHtml +='<div class="part">';
        eleHtml +='<div class="title">';
        eleHtml +='<h5>'+element.fund_name+' <small>'+element.fund_code+'</small></h5></div><ul>';
        eleHtml +='<li>委托类型  <span>'+element.business_name+'</span></li>';
        eleHtml +='<li>委托状态  <span>已成交</span></li>';
        eleHtml +='<li>委托份额  <span>'+Number(element.shares).toFixed(price_digit)+'</span></li>';
        eleHtml +='<li>委托金额 <span>'+Number(element.balance).toFixed(price_digit)+'</span></li>';
        eleHtml +='<li class="full">成交时间 <span>'+element.business_date+" "+element.business_time+'</span></li>';
        eleHtml +='</ul></div>';
		return eleHtml;
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".date_filter").height() - 6  ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						callsQuery();//下拉获取上一页数据方法
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
		$(_pageId+".fund_list2").html("");
		$(_pageId + ".top_title .top_nav").hide();
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("stock/stockQueryHistory","stock/stockQuery",{});
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