/**
 * 信用交易-查询融资融券负债
 */
define('trade/scripts/credit/query/rzLiabilitiesQuery.js', function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var	service_credit = require("service_credit");
	var	financialSecurities = false;
	var	_pageId = "#credit_query_rzLiabilitiesQuery ";
	var VIscroll = require("vIscroll");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
	var userInfo = null;//保存的客户信息
	var common = require("common");
	
	/**
	 * 初始化
	 * */
	function init()
	{
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		queryRZLiabilities();
	}
	/**
	 * 事件绑定
	 * */
	function bindPageEvent()
	{
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
	}
	/**
	 * 融资负债查询
	 */
	function queryRZLiabilities(type){
		$(_pageId+"#append").html("");
		$(_pageId+ ".no_data").hide();
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var compact_type = "0";
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"password":password,
			"sessionid":sessionid,
			"compact_type":compact_type
		};
		service_credit.contractmx_query(param,contractmx_queryCallBack,
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
	 * 融资负债数据方法
	 * @param {Object} data 返回数据
	 */
	function contractmx_queryCallBack(data)
	{
		if (data) {
			if(data.error_no == 0)
			{
				var results = data.results;	
				if(results && results.length > 0){
					var liabilitiesHtml = "";
					for(i = 0;i < results.length; i++){
						var data = results[i];
						liabilitiesHtml += createHtml(data);
					}
					$(_pageId+"#append").append(liabilitiesHtml);
				}else{
					$(_pageId+ ".no_data").show();
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
	 * 生成融资负债html
	 * @param {Object} element 数据项
	 */
	function createHtml(element)
	{		
		var eleHtml = "";
		    eleHtml += "<div class=\"trade_box\">";
		    eleHtml += "<ul class=\"clearfix\">";
			eleHtml += "<li><span>开仓日期：</span>"+element.open_date+"</li>";
			eleHtml += "<li><span>证券代码：</span>"+element.stock_code+"</li>";
			eleHtml += "<li><span>证券名称：</span>"+element.stock_name+"</li>";
			eleHtml += "<li><span>未还金额:</span>"+element.real_compact_balance+"</li>";
			eleHtml += "<li><span>未还数量：</span>"+element.real_compact_amount+"</li>";
			eleHtml += "<li><span>未还合约费用：</span>"+element.real_compact_fare+"</li>";
			eleHtml += "<li><span>未还合约利息：</span>"+element.real_compact_interest+"</li>";
			eleHtml += "<li><span>已还利息：</span>"+element.repaid_interest+"</li>";
			eleHtml += "<li><span>已还金额：</span>"+element.repaid_balance+"</li>";
			eleHtml += "<li><span>已还数量：</span>"+element.repaid_amount+"</li>";
			eleHtml += "<li><span>合约总利息：</span>"+element.compact_interest+"</li>";
			eleHtml +="</ul>";
			eleHtml +="</div>";
		return eleHtml;
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- 6  ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						queryRZLiabilities();//下拉获取上一页数据方法
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
		$(_pageId+"#append").html("");
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