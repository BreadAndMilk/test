/**
 * 信用交易-资金股份流水查询
 */
define('trade/scripts/credit/query/liabilitiesFlowQuery.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var service_credit = require("service_credit");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var _pageId = "#credit_query_liabilitiesFlowQuery ";
    var commonFunc = require("commonFunc");
    var userInfo = null;
    
    /**
     * 初始化
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		liabilitiesFlowQuery();
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
		});
		//时间选择
		$.bindEvent($(_pageId + ".date_filter .btn"), function(e){
			if(vIscroll._init){
				vIscroll.scroll.destroy();
				vIscroll.scroll = null;
				vIscroll._init = false;
			}
			liabilitiesFlowQuery();
		});
		//点击其他位置，隐藏下拉框
		$.bindEvent($(_pageId + ".main"),function(){
		});
	}
	
	/**
	 * 负债变动流水查询
	 */
	function liabilitiesFlowQuery(){
		$(_pageId+".fund_flow2").html("");		
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var password = userInfo.password;
		var sessionid = userInfo.session_id;
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param = {			
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"begin_time" : begin_time,
				"end_time" : end_time
		};
		$(_pageId+ ".no_data").hide();
		service_credit.queryAssetFlow(param,liabilitiesFlowQueryCallback,
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
	 * 负债变动流水查询回调
	 */
	function liabilitiesFlowQueryCallback(data){
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".fund_flow2").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryFlowHTML(results[i]);
					}
					$(_pageId+".fund_flow2").html(data);		
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
	function queryFlowHTML(element){
		var price_digit = 3;
//		require("common").decimalKeep(element.stock_code ,function(data){  //获取保留的位数
//	    	if(data){
//	    		price_digit = data;
//	    	}
//		});
		var css="";
        var eleHtml = "";
        eleHtml+="<div class=\"part\">";
        eleHtml+="<div class=\"title\">";
        eleHtml+="<h5>"+element.business_name+"</h5><span class=\"time\">"+element.business_date+"&nbsp"+element.business_time+"</span>";
        eleHtml+="</div><ul>";
//      eleHtml+="	<dt>"+element.stock_name+" <small>"+element.stock_code+"</small></dt>";
        eleHtml+="    <li>流水号<span>"+element.entrust_no+"</span></li>";
//      eleHtml+="    <li>业务名称<span>"+element.business_name+"</span></li>";
        eleHtml+="    <li>发生金额<span>"+Number(element.occur_balance).toFixed(price_digit)+"</span></li>";
        eleHtml+="    <li>资金余额<span>"+Number(element.enable_balance).toFixed(price_digit)+"</span></li>";
//      eleHtml+="    <li>成交数量<span>"+element.occur_amount+"</span></li>";
//      eleHtml+="    <li>成交价格<span>"+Number(element.business_price).toFixed(price_digit)+"</span></li>";
		eleHtml+="    <li>币种<span>"+element.money_type_name+"</span></li>";
        eleHtml+="</ul></div>";
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
						liabilitiesFlowQuery();//下拉获取上一页数据方法
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
		$(_pageId+".fund_flow2").html("");
		$(_pageId + ".top_title .top_nav").hide();
		$(_pageId + " .top_title small").text("一周内");	
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});