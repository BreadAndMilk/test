/**
 * 场外基金-基金转托
 */
define('trade/scripts/fund/outside/transfer.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var _pageId = "#fund_outside_transfer ";
	var service_fund = require("service_fund");
    var userInfo= null;
    	require("validatorUtils");
	var validata = $.validatorUtils;
	var listData = {};
	var fundInfo = {};
    /**
     * 初始化
     */
	function init(){
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("fund/outside/order","left");
			e.stopPropagation();
		});
		userInfo = common.getCurUserInfo();
		queryHoldingsQuery();//查询可赎回基金
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
	}
	
	/**
	 * 持仓查询
	 * 调用两个接口 股份查询，资金查询
	 */
	function queryHoldingsQuery(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid="";
		var fund_company ="";
		var fund_code ="";
		var param={
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"fund_company":fund_company,
				"fund_code":fund_code,
		};
		service_fund.queryFundData(param,queryFundDataCallback);
	}

	//持仓查询回调方法
	function queryFundDataCallback(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					listData = {};
					var listDiv = "<div class='bank_list center1'><ul>";
					for (var i=0;i<results.length;i++){
						listData[results[i].fund_code+""] = results[i];
						listDiv += "<li id='"+results[i].fund_code+"'><a href=\"javascript:void(0);\">"+results[i].fund_name+" <small>"+results[i].fund_code+"</small></a></li>";
					}
					listDiv += "</ul></div>";
					common.addChoiceList($(_pageId+" .select_box p"), "选择转出基金",listDiv,function(data, div){
						div.html(data.find("a small").text());
						var id = data.attr("id");
						fundInfo = listData[id];
						$(_pageId + "#fundName").val(fundInfo.fund_name);
						$(_pageId + "#fundNav").val(fundInfo.nav || 0);
						$(_pageId + "#fundCompany").val(fundInfo.company_name);
						$(_pageId+".fund_form2 .limit em").text(Number(fundInfo.enable_shares));//持有份额
						$(_pageId + "#fundSum").val("");
					});
				}
				else{
					$(_pageId+" .select_box p").text("暂无可转出基金");
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});