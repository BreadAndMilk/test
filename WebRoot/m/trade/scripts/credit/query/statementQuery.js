/**
 * 信用交易-对账单查询
 */
define('trade/scripts/credit/query/statementQuery.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var service_credit = require("service_credit");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var _pageId = "#credit_query_statementQuery ";
    var commonFunc = require("commonFunc");
    var userInfo =  null;
    	
    /**
     * 初始化
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		statementQuery();
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
			statementQuery();
		});
		//点击其他位置，隐藏下拉框
		$.bindEvent($(_pageId + ".main"),function(){
		});
	}
	
	/**
	 * 对账单查询
	 */
	function statementQuery(){
		$(_pageId+ ".no_data").hide();
		$(_pageId+".search_list").html("");
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var password = userInfo.password;
		var business_flag = "";
		var money_type = "";
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"password":password,
			"sessionid":sessionid,
			"money_type":money_type,
			"begin_date" : begin_time,
			"end_date" : end_time,
			"business_flag" : business_flag
		};
		$(_pageId+ ".no_data").hide();
		service_credit.queryAccountFlow(param,queryStatementCallback,
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
	 * 对账单查询回调
	 */
	function queryStatementCallback(data){
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
		var business_name = element.business_name;
		if(business_name == "委托买入"){
			css = "ared";
		}else if(business_name == "委托卖出"){
			css = "agreen";
		}
        var eleHtml = "";
        eleHtml+="<div class=\"part\">";
        eleHtml+="<span class=\"time\">"+element.business_date+"&nbsp</span>";
        eleHtml+="<h5 class=\""+css+"\">"+business_name+"</h5>";
        eleHtml+="<dl class=\"clearfix\">";
        eleHtml+="	<dt>"+element.stock_name+" <small>"+element.stock_code+"</small></dt>";
        eleHtml+="    <dd><em>流水编号</em>"+element.serial_no+"</dd>";
        eleHtml+="    <dd><em>发生金额</em>"+Number(element.occur_balance).toFixed(price_digit)+"</dd>";
        eleHtml+="    <dd><em>剩余金额</em>"+Number(element.enable_balance).toFixed(price_digit)+"</dd>";
        eleHtml+="    <dd><em>买卖标志</em>"+element.business_name+"</dd>";
        eleHtml+="    <dd><em>成交价格</em>"+Number(element.business_price).toFixed(price_digit)+"</dd>";
        eleHtml+="    <dd><em>成交数量</em>"+element.occur_amount+"</dd>";
        eleHtml+="    <dd><em>币种</em>"+element.money_type_name+"</dd>";
        eleHtml+="    <dd><em>股东代码</em>"+element.stock_account+"</dd>";
        eleHtml+="    <dd><em>备注</em>"+element.remark+"</dd>";
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
						statementQuery();//下拉获取上一页数据方法
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
		$(_pageId+".search_list").html("");
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