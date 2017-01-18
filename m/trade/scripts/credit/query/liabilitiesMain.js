/**
 * 信用交易-查询负债汇总
 */
define('trade/scripts/credit/query/liabilitiesMain.js', function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
    var vIscroll = {"scroll":null,"_init":false};	
	var	service_credit = require("service_credit");
	var	_pageId = "#credit_query_liabilitiesMain ";
	var userInfo = null;//保存的客户信息
	var common = require("common");
	
	/**
	 * 初始化
	 * */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		queryLiabilitiesData();//查询信息
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	/**
	 * 事件绑定
	 * */
	function bindPageEvent(){
		//后退
		$.bindEvent($(_pageId+" .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
	}
	
	/**
	 * 总数据查询
	 */
	function queryLiabilitiesData(){
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
			"cust_code":cust_code,
			"password":password,
			"sessionid":sessionid
		};
		service_credit.rzrq_liabilitiesQuery(param,rzrq_liabilitiesQueryCallBack);
	}
	/**
	 * 负债汇总数据方法
	 * @param {Object} data 返回数据
	 */
	function rzrq_liabilitiesQueryCallBack(data)
	{
		if (data) {
			if(data.error_no == 0){
				var results = data.results;	
				if(results && results.length > 0){
						var data = results[0];
						// 填充负债
						$(_pageId+"#msg td").eq(0).text(data.fund_asset);
						$(_pageId+"#msg td").eq(1).text(data.total_debit);
						$(_pageId+"#msg td").eq(2).text(data.fin_compact_balance);
						$(_pageId+"#msg td").eq(3).text(data.slo_market_value);
						$(_pageId+"#msg td").eq(4).text(data.sum_compact_interest);
						$(_pageId+"#msg td").eq(5).text(data.fin_compact_fare);
						$(_pageId+"#msg td").eq(6).text(data.other_fare);
						$(_pageId+"#msg td").eq(7).text(data.per_assurescale_value);
				}
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}else{
				$.alert(data.error_info);	
			}
		}
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".tab_nav").height()- 6  ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						$(_pageId + " #msg td").text("--")
						queryLiabilitiesData();//下拉获取上一页数据方法
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
		$(_pageId+ ".visc_pullUp").hide();
	}
	
	/**
	 * 销毁
	 * */
	function destroy(){
		$(_pageId + " #msg td").text("--")
	}
	
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});