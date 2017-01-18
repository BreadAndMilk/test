/**
 * 信用交易-交割单查询
 */
define('trade/scripts/credit/query/deliveryOrderQuery.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var service_credit = require("service_credit");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var _pageId = "#credit_query_deliveryOrderQuery ";
    var commonFunc = require("commonFunc");
    var userInfo = null;
    
    /**
     * 初始化
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		deliveryQuery();
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
			deliveryQuery();
		});
		//点击其他位置，隐藏下拉框
		$.bindEvent($(_pageId + ".main"),function(){
//			if($(_pageId + ".top_title .top_nav").is(':visible')){
//				$(_pageId + ".top_title .top_nav").slideToggle("fast");
//			}
		});
	}
	
	/**
	 * 交割单查询
	 */
	function deliveryQuery(){
		$(_pageId+".fund_flow2").html("");
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var password = userInfo.password;
		var end_time = $(_pageId+" #endDate").text(); 
//		end_time=end_time.replaceAll("-","");
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
		service_credit.deliveryOrder_Query(param,queryDeliveryCallback,
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
	 * 交割单查询回调
	 */
	function queryDeliveryCallback(data){
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".fund_flow2").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryEntrustHTML(results[i]);
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
	 * 交割单查询HTML生成
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
		if(element.entrust_bs == "0"){
			css = "ared";
		}else if(element.entrust_bs == "1"){
			css = "agreen";
		}
        var eleHtml = "";
        eleHtml+="<div class=\"part\">";
        eleHtml+="<div class=\"title\">";
        eleHtml+="<h5>"+element.business_name+"</h5><span class=\"time\">"+element.business_time+"</span>";
        eleHtml+="</div><ul>";
//      eleHtml+="	<dt style=\"padding:3px\">"+element.stock_name+" <small>"+element.stock_code+"</small></dt>";
		eleHtml += "    <li>成交数量<span>"+element.occur_amount+"</span></li>";
		eleHtml += "    <li>成交价格<span>"+Number(element.business_price).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>成交金额<span>"+Number(element.business_balance).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>清算金额<span>"+Number(element.fundeffect).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>手续费<span>"+Number(element.fee_sxf).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>清算费<span>"+Number(element.fee_qsf).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>交易规费<span>"+Number(element.fee_jygf).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>印花税<span>"+Number(element.fare1).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>过户费<span>"+Number(element.fare2).toFixed(price_digit)+"</span></li>";//后资金额
		eleHtml += "    <li>合同序号<span>"+element.report_no+"</span></li>";//申请编号
		eleHtml += "    <li>成交编号<span>"+element.business_no+"</span></li>";
		eleHtml += "    <li>证券余额<span>"+Number(element.post_amount).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>资金余额<span>"+Number(element.post_balance).toFixed(price_digit)+"</span></li>";
		eleHtml += "    <li>证券账号<span>"+element.stock_account+"</span></li>";
		eleHtml += "    <li>交易市场名称<span>"+element.exchange_type_name+"</span></li>";
        eleHtml+="</ul>";
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
						deliveryQuery();
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