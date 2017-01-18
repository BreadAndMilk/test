/**
 * 分级基金-赎回
 */
define('trade/scripts/fund/grading/redeem.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config; 
    var global = gconfig.global;
    var _pageId = "#fund_grading_redeem ";
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
		jumpPageEvent();
		userInfo = common.getCurUserInfo();
		queryHoldingsQuery();//查询可赎回基金
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 跳转页面事件
	 * $(this).unbind();
	 * this.click = null;
	 */
	function jumpPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack();
			e.stopPropagation();
		});
		
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
		service_fund.gradingPosition(param,queryFundDataCallback);
	}

	//持仓查询回调方法
	function queryFundDataCallback(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					listData = {};
					var listDiv = "<div class='bank_list center'><ul>";
					for (var i=0;i<results.length;i++){
						listData[results[i].stock_code+""] = results[i];
						listDiv += "<li id='"+results[i].stock_code+"'><a href=\"javascript:void(0);\">"+results[i].stock_name+" <small>"+results[i].stock_code+"</small></a></li>";
					}
					listDiv += "</ul></div>";
					common.addChoiceList($(_pageId+" .select_box p"), "选择赎回基金代码",listDiv,function(data, div){
						div.html(data.find("a small").text());
						var id = data.attr("id");
						fundInfo = listData[id];
						$(_pageId + "#fundName").val(fundInfo.stock_name);
						$(_pageId + "#fundNav").val(fundInfo.last_price || 0);
						$(_pageId +".fund_form2 .limit em").text(Number(fundInfo.enable_amount));//持有份额
						$(_pageId + "#purchaseLimit").val(Number(fundInfo.enable_amount));
						$(_pageId + "#fundSum").val("");
					});
				}
				else{
					$(_pageId+" .select_box p").text("暂无可赎回基金");
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	//下单提交基金
	function submitOrderFund(){
		if(common.size(fundInfo) == 0){
			$.alert("没有可赎回的基金");
			return false;
		}
		if(!common.isValue(fundInfo)){
			$.alert("请选可赎回的基金");
			return false;
		}
		var numMax =$(_pageId+".fund_form2 .limit em").text();
		var fundSum = $(_pageId+"#fundSum").val();
		if(validata.isEmpty(numMax)|| numMax=="0" || numMax=="--"){
			$.alert("可赎份额为0");
			return false;
		}
		if(validata.isEmpty(fundSum)){
			$.alert("赎回份额不能为空");
			return false;
		}else if(Number(fundSum)>Number(numMax)){
			$.alert("赎回份额不能大于可赎份额");
			return false;
		}
		var tipStrArray = [];
		tipStrArray.push(["基金名称", fundInfo.stock_name]);
		tipStrArray.push(["基金代码 ", fundInfo.stock_code]);
		tipStrArray.push(["赎回份额 ", fundSum]);
		var tipStr = "<div >";
		tipStr += common.generatePrompt(tipStrArray);
		tipStr += "</div>";
		common.iConfirm("下单确定",tipStr,function success(){
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;      //分支机构
			var fund_account = userInfo.fund_account; //资金账号
			var cust_code = userInfo.cust_code;       //客户编号
			var sessionid = userInfo.session_id;      //会话号
			var fund_code = fundInfo.stock_code; //基金代码
			var amount = fundSum;      //赎回份额
	        var entrust_price = $(_pageId+"#fundNav").val(); //收费方式//巨额方式
			var param = {
					"entrust_way" : entrust_way,
					"branch_no" : branch_no,
					"fund_account" : fund_account,
					"cust_code" : cust_code,
					"sessionid" :sessionid,
					"fund_code":fund_code,
					"entrust_bs":"21",
					"exchange_type":fundInfo.exchange_type,
					"stock_account":fundInfo.stock_account,
					"entrust_amount":amount,
	                "entrust_price":entrust_price,
	                "entrust_prop":'LFR'
			};
			service_fund.gradingRedeem(param,function(data){
				if(data.error_no ==0){
					$.alert(data.error_info,function(){
						var entrust_way= global.entrust_way; // 委托方式  在configuration配置
						var branch_no = userInfo.branch_no;	//分支机构
						var fund_account = userInfo.fund_account;	//资产账户
						var cust_code = userInfo.cust_code;	//客户代码
						var sessionid="";
						var fund_company =fundInfo.fund_company;
						var fund_code =fundInfo.fund_code;
						var param={
								"entrust_way":entrust_way,
								"branch_no":branch_no,
								"fund_account":fund_account,
								"cust_code":cust_code,
								"sessionid":sessionid,
								"fund_company":fund_company,
								"fund_code":fund_code,
						};
						service_fund.gradingPosition(param,function(data){
							if (typeof(data) != undefined && typeof(data) != null) {
								if(data.error_no == 0){
									fundInfo = data.results[0];
									listData[""+data.results[0].fund_code] = data.results[0];
									var enable_shares = Number(data.results[0].enable_shares);
									$(_pageId+".fund_form2 .limit em").text(enable_shares); //可赎份额数量
								}
							}
						},{"isShowWait":false,"isShowOverLay":false});
					});
					$(_pageId+"#fundSum").val("");
					$(_pageId+".fund_form2 .limit em").text("--"); //可赎份额数量
				}else{
					$.alert(data.error_info);
				}
			});
		},function fail(){});
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//申购
		$.bindEvent($(_pageId + ".fund_form2 .ce_btn"), function(e){
			submitOrderFund();
			e.stopPropagation();
		});
		//全部
		$.bindEvent($(_pageId + ".fund_form2 .all .all_btn"), function(e){
			var purchaseLimit = $(this).prev("input").val();
			$(_pageId + "#fundSum").val(purchaseLimit);
			e.stopPropagation();
		});
	}
    
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId+" .select_box p").text("请选择...");
		$(_pageId+".fund_form2 .limit em").text("--"); //可赎份额数量
		$(_pageId + "#fundName").val("");
		$(_pageId + "#fundNav").val("");
		$(_pageId + "#fundSum").val("");
		$(_pageId+"#purchaseLimit").val("");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});