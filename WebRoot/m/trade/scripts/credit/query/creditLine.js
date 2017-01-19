/**
 * 信用交易-授信额度查询
 */
define('trade/scripts/credit/query/creditLine.js', function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
    var vIscroll = {"scroll":null,"_init":false};	
	var service_credit = require("service_credit");
	var _pageId = "#credit_query_creditLine ";
	var userInfo = null;//保存的客户信息
	var common = require("common");
	/**
	 * 初始化
	 * */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		querycreditLineData();//查询数据
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
	function querycreditLineData(){
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
			"sessionid":sessionid
		};
		service_credit.rzrq_liabilitiesQuery(param,rzrq_liabilitiesQueryCallBack);
	}
	/**
	 * 负债汇总数据方法
	 * @param {Object} data 返回数据
	 */
	function rzrq_liabilitiesQueryCallBack(data){
		if (data){
			if(data.error_no == 0){
				var results = data.results;	
				if(results && results.length > 0){
					var data = results[0];
					$(_pageId+".credit_limit li").eq(0).find("span").text(data.acreditavl);
					$(_pageId+".credit_limit li").eq(1).find("span").text(data.fcreditbal);
					$(_pageId+".credit_limit li").eq(2).find("span").text(data.dcreditbal);
					$(_pageId+".credit_limit li").eq(3).find("span").text(data.fin_used_quota);
					$(_pageId+".credit_limit li").eq(4).find("span").text(data.slo_used_quota);
					$(_pageId+".credit_limit li").eq(5).find("span").text(data.fcreditavl);
					$(_pageId+".credit_limit li").eq(6).find("span").text(data.dcreditavl);
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
						$(_pageId+".cred_info span").text("--");
						querycreditLineData();//下拉获取上一页数据方法
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
		$(_pageId+".cred_info span").text("--");
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
	};
	module.exports = base;
});