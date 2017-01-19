/**
 * 场外基金-基金开户
 */
define('trade/scripts/fund/outside/openAccount.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var _pageId = "#fund_outside_openAccount ";
	var service_fund = require("service_fund");
	var userInfo = null;
	var listData = {};
	var accounts = {};
	var accountInfo = {};
    /**
     * 初始化
     */
	function init(){
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("fund/outside/account","left");
			e.stopPropagation();
		});
		
		userInfo = common.getCurUserInfo();
		custFundQuery();
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
	}
	
	/**
	 * 查询客户绑定的信息
	 */
	function custFundQuery(){
		//获取保存在本地的账户信息
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code
		};
		//最后一个为超时处理函数
		service_fund.getCustMsg(param,queryFundCallBack,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":false,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
				fundCompanyQuery();
			}
	    });
	}
	/**
	 * 查询客户信息回调
	 */
	function queryFundCallBack(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					var html = "";
					for (var i=0;i<results.length;i++){
						accounts[""+results[i].fund_company] = true;
					}
				}else{
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
		fundCompanyQuery();
	}
	
	/**
	 * 查询客户绑定的信息
	 */
	function fundCompanyQuery(){
		//获取保存在本地的账户信息
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code
		};
		//最后一个为超时处理函数
		service_fund.getFundCompany(param,getFundCompanyCallBack);
	}
	/**
	 * 查询客户信息回调
	 */
	function getFundCompanyCallBack(data){
		if (data) {
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results && results.length > 0){
					listData = {};
					var listHtml = "<div class='bank_list'><ul>";
					for (var i=0;i<results.length;i++){
						if(!accounts[results[i].fund_company]){
							listData[i+""] = results[i];
							var company_name = results[i].company_name;
							listHtml += "<li id='"+i+"'><a href=\"javascript:void(0);\"><i></i>"+company_name+"</a></li>";
						}
					}
					listHtml += "</ul></div>";
					common.addChoiceList($(_pageId+" .select_box p"), "选择开户基金公司",listHtml,function(data, div){
						div.html(data.find("a").html());
						var id = data.attr("id");
						accountInfo = listData[id];
					});
				}
				else{
					$(_pageId+" .select_box p").text("暂无可开户基金公司");
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	
	/**
	 * 查询客户绑定的信息
	 */
	function openFundAccount(){
		if(!common.isValue(accountInfo)){
			$.alert("请选择开户基金公司");
			return false;
		}
		//获取保存在本地的账户信息
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var fund_company = accountInfo.fund_company;
		var stock_account = ""
		var flag = "";
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "fund_company" : fund_company,
				"stock_account" : stock_account,
				"flag" : flag
		};
		//最后一个为超时处理函数
		service_fund.openFundAccount(param,openFundAccountCallBack);
	}
	/**
	 * 查询客户信息回调
	 */
	function openFundAccountCallBack(data){
		if (data) {
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results && results.length > 0){
					$(_pageId + " .fund_notice").show();
					$(_pageId + " .fund_open").hide();
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
		$.bindEvent($(_pageId + ".fund_open .ce_btn a"), function(e){
			openFundAccount();
			e.stopPropagation();
		});
		$.bindEvent($(_pageId + ".fund_notice .links a"), function(e){
			$.pageBack("fund/outside/account","left");
			e.stopPropagation();
		});
		$.bindEvent($(_pageId + ".fund_notice .ce_btn a"), function(e){
			$.pageRefresh();
			e.stopPropagation();
		});
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
		$(_pageId + " .fund_notice").hide();
		$(_pageId + " .fund_open").show();
		$(_pageId+" .select_box p").html("请选择");
		listData = {};
		accounts = {};
		accountInfo = {};
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});