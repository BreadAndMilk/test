/**
 * 信用交易-未偿还合约查询/已了结合约
 */
define('trade/scripts/credit/query/contractInquiryQuery.js', function(require, exports, module) {
	var service_credit = require("service_credit");
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var _pageId = "#credit_query_contractInquiryQuery ";
    var userInfo = null;
    var queryType = null;
    	
    /**
     * 初始化 
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		queryType = $.getPageParam("param");
		if(queryType=="0"){
			$(_pageId + ".top_title h3").text("未偿还合约");
		}else if(queryType=="1"){
			$(_pageId + ".top_title h3").text("已了结合约（60天）");
		}
		queryMsg(queryType);//查询信息
    }
	/**
	 * 查询信息
	 */
	function queryMsg(queryType){
		queryContracliata(queryType); //已了结合约查询
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
	}
	
	/**
	 * 未偿还合约查询
	 */
	function queryContracliata(query_type){
		$(_pageId+".main .contract_list").html("");
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"password":password,
			"cust_code":cust_code,
			"query_type":query_type,
			"sessionid":sessionid
		};
		service_credit.openInterest_Query(param,openInterest_QueryCallBack,
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
		});//未偿还合约查询
	}
	/**
	 * 未偿还合约数据查询回调方法
	 */
	function openInterest_QueryCallBack(data){
		if (data){
			if(data.error_no == 0){
				var results = data.results;	
				if(results && results.length > 0){
					var openInterestHtml = "";
					for(var i = 0;i < results.length; i++){
						var data = results[i];
						openInterestHtml += createHtml(data,i);
					}
					$(_pageId+".main .contract_list").html(openInterestHtml);
				}else{
					$(_pageId+".no_data").show();
				}
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}
			else
			{
				$.alert(data.error_info);	
			}
		}
	}
	/**
	 * 生成未偿还合约html
	 * @param {Object} element 数据项
	 */
	function createHtml(element,i){
		var compact_type = "";
		if(element.compact_type == "0"){
			compact_type = "融资";
		}else if(element.compact_type == "1"){
			compact_type = "融券";
		}
		if(element.status == "0"){
			status = "未偿还";
		}else if(element.status == "1"){
			status = "已偿还";
		}else if(element.status = "2"){
			status = "到期未平仓";
		}
		if(queryType == 0){
			
			if(element.compact_type == "0"){
				var eleHtml = "";
				eleHtml += "<div class=\"part\">";
				eleHtml += "<div class=\"title\"><h5>"+element.stock_name+"<small>"+element.stock_code+"</small></h5>";
				eleHtml += "<span class=\"time\">合约日期 "+element.open_date+"<span></div>";
                eleHtml += "<ul>";
				eleHtml += "  <li>序号<span>"+(i+1)+"</span></li>";
				eleHtml += "  <li>合约日期<span>"+element.open_date+"</span></li>";
				eleHtml += "  <li>合约类型<span>"+compact_type+"</span></li>";
				eleHtml += "  <li>合约状态<span>"+status+"</span></li>";
//				eleHtml += "  <li>成交数量<span>"+element.business_amount+"</span></li>";
				eleHtml += "  <li>成交金额<span>"+element.business_price+"</span></li>";
				eleHtml += "  <li>融资金额<span>"+element.business_balance+"</span></li>";
//				eleHtml += "  <li>合约盈亏<span>"+element.contractProfit+"</span></li>";
				eleHtml += "  <li>融资盈亏<span>"+element.fin_income+"</span></li>";
				eleHtml += "  <li>未还金额<span>"+element.real_compact_balance+"</span></li>";
//				eleHtml += "  <li>未还本金<span>"+element.total_debit+"</span></li>";
				eleHtml += "  <li>已还利息<span>"+element.repaid_interest+"</span></li>";
				eleHtml += "  <li>已还金额<span>"+element.repaid_balance+"</span></li>";
				eleHtml += "  <li>未还利息<span>"+element.real_compact_interest+"</span></li>";
//				eleHtml += "  <li>已还罚息<span>"+element.punifee_repay+"</span></li>";
//				eleHtml += "  <li>未还罚息<span>"+element.punifeeunfrz+"</span></li>";
				eleHtml += "  <li>总负债<span>"+element.total_debit+"</span></li>";
				eleHtml += "  <li>合约到期日<span>"+element.ret_end_date+"</span></li>";
				eleHtml += " </ul></div>";
			}else{
				var eleHtml = "";
				eleHtml += "<div class=\"part\">";
				eleHtml += "<div class=\"title\"><h5>"+element.stock_name+"<small>"+element.stock_code+"</small></h5>";
				eleHtml += "<span class=\"time\">合约日期 "+element.open_date+"<span></div>";
                eleHtml += "<ul>";
				eleHtml += "  <li>序号<span>"+(i+1)+"</span></li>";
				eleHtml += "  <li>合约日期<span>"+element.open_date+"</span></li>";
				eleHtml += "  <li>合约类型<span>"+compact_type+"</span></li>";
				eleHtml += "  <li>合约状态<span>"+status+"</span></li>";
				eleHtml += "  <li>成交数量<span>"+element.business_amount+"</span></li>";
//				eleHtml += "  <li>成交金额<span>"+element.business_price+"</span></li>";
				eleHtml += "  <li>融券金额<span>"+element.business_balance+"</span></li>";
				eleHtml += "  <li>融券盈亏<span>"+element.slo_income+"</span></li>";
//				eleHtml += "  <li>合约盈亏<span>"+element.contractProfit+"</span></li>";
				eleHtml += "  <li>未还金额<span>"+element.real_compact_balance+"</span></li>";
//				eleHtml += "  <li>未还本金<span>"+element.total_debit+"</span></li>";
				eleHtml += "  <li>已还利息<span>"+element.repaid_interest+"</span></li>";
//				eleHtml += "  <li>已还金额<span>"+element.repaid_balance+"</span></li>";
				eleHtml += "  <li>未还利息<span>"+element.real_compact_interest+"</span></li>";
				eleHtml += "  <li>已还数量<span>"+element.repaid_amount+"</span></li>";
//				eleHtml += "  <li>已还罚息<span>"+element.punifee_repay+"</span></li>";
//				eleHtml += "  <li>未还罚息<span>"+element.punifeeunfrz+"</span></li>";
				eleHtml += "  <li>总负债<span>"+element.total_debit+"</span></li>";
				eleHtml += "  <li>合约到期日<span>"+element.ret_end_date+"</span></li>";
				eleHtml += " </ul></div>";
			}
			
		}else{
			
			if(element.compact_type == "0"){
				var eleHtml = "";
				eleHtml += "<div class=\"part\">";
				eleHtml += "<div class=\"title\"><h5>"+element.stock_name+"<small>"+element.stock_code+"</small></h5>";
				eleHtml += "<span class=\"time\">合约日期 "+element.open_date+"<span></div>";
                eleHtml += "<ul>";
				eleHtml += "  <li>序号<span>"+(i+1)+"</span></li>";
				eleHtml += "  <li>合约日期<span>"+element.open_date+"</span></li>";
				eleHtml += "  <li>合约类型<span>"+compact_type+"</span></li>";
				eleHtml += "  <li>合约状态<span>"+status+"</span></li>";
//				eleHtml += "  <li>成交数量<span>"+element.business_amount+"</span></li>";
				eleHtml += "  <li>成交金额<span>"+element.business_price+"</span></li>";
				eleHtml += "  <li>融资盈亏<span>"+element.fin_income+"</span></li>";
				eleHtml += "  <li>融资金额<span>"+element.business_balance+"</span></li>";
				eleHtml += "  <li>已还利息<span>"+element.repaid_interest+"</span></li>";
//				eleHtml += "  <li>已还罚息<span>"+element.punifee_repay+"</span></li>";
				eleHtml += "  <li>总负债<span>"+element.total_debit+"</span></li>";
				eleHtml += "  <li>合约了结日<span>"+element.date_clear+"</span></li>";
				eleHtml += " </ul></div>";
			}else{
				var eleHtml = "";
				eleHtml += "<div class=\"part\">";
				eleHtml += "<div class=\"title\"><h5>"+element.stock_name+"<small>"+element.stock_code+"</small></h5>";
				eleHtml += "<span class=\"time\">合约日期 "+element.open_date+"<span></div>";
                eleHtml += "<ul>";
				eleHtml += "  <li>序号<span>"+(i+1)+"</span></li>";
				eleHtml += "  <li>合约日期<span>"+element.open_date+"</span></li>";
				eleHtml += "  <li>合约类型<span>"+compact_type+"</span></li>";
				eleHtml += "  <li>合约状态<span>"+status+"</span></li>";
				eleHtml += "  <li>成交数量<span>"+element.business_amount+"</span></li>";
				eleHtml += "  <li>融券盈亏<span>"+element.slo_income+"</span></li>";
//				eleHtml += "  <li>成交金额<span>"+element.business_price+"</span></li>";
				eleHtml += "  <li>融券金额<span>"+element.business_balance+"</span></li>";
				eleHtml += "  <li>已还利息<span>"+element.repaid_interest+"</span></li>";
				eleHtml += "  <li>已还罚息<span>"+element.punifee_repay+"</span></li>";
				eleHtml += "  <li>总负债<span>"+element.total_debit+"</span></li>";
				eleHtml += "  <li>合约了结日<span>"+element.date_clear+"</span></li>";
				eleHtml += " </ul></div>";
			}
			
		}
		return eleHtml;
	}
    
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height() - 6  ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						 queryMsg(queryType);//下拉获取上一页数据方法
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
		$(_pageId+".main .contract_list").html("");
		$(_pageId+ ".no_data").hide();
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