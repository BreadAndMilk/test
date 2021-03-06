/**
 * 场外基金-基金认购
 */
define('trade/scripts/fund/outside/subscribe.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config; 
    var global = gconfig.global;
    var _pageId = "#fund_outside_subscribe ";
    var service_fund = require("service_fund");
    var userInfo = null;
    	require("validatorUtils");
	var validata = $.validatorUtils;

    /**
     * 初始化
     */
	function init(){
		jumpPageEvent();
		userInfo = common.getCurUserInfo();
		queryCapital();
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
			$.pageBack("fund/outside/order","left");
			e.stopPropagation();
		});
		
	}
	
		/**
	 * 资金账户查询
	 */
	function queryCapital(){
		//获取保存在本地的账户信息
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var money_type = "0";  //  0：人民币，1：美元，2：港币
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "money_type":money_type,
		};
		//最后一个为超时处理函数
		service_fund.queryFundSelect(param,queryCapitalCallback,{"isShowWait":false,"isShowOverLay":false});
	}
	
	/**
	 * 资金账户查询回调
	 */
	function queryCapitalCallback(data){
		if (data){
			if(data.error_no == 0){
				var results = data.results;
				if(results && results[0]){
					$(_pageId+".fund_form2 .limit em").text(Number(results[0].enable_balance).toFixed(2));//可用
				}else{
					$(_pageId+".fund_form2 .limit em").text("--");//可用
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	/**
	 * 获取基金列表
	 * */
	function getFundList(fundStr){
		if(fundStr!= "" && fundStr.length==6){
			clearBuyMsg();
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var fund_code = fundStr;
			var fund_company="";
			var branch_no = userInfo.branch_no;	
			var fund_account = userInfo.fund_account;
			var cust_code = userInfo.cust_code;//关联资产账户标志
			var param={				
					"entrust_way":entrust_way,
				    "branch_no":branch_no,
				    "fund_account":fund_account,
				    "cust_code":cust_code,
					"fund_company":fund_company,
					"fund_code":fund_code
			};
			service_fund.getFundInfo(param,getFundInfoBack);
		}	
	}
	function getFundInfoBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results && results.length > 0){
				var nav=results[0].nav!=""?results[0].nav:"0";
                var fundCompany = results[0].fund_company;
				$(_pageId+"#fundName").val(results[0].fund_name).attr("data-fundCom",fundCompany);
				$(_pageId+"#fundNav").val(nav);
			}
			else{
				$.alert("没有查询到对应的基金");
			}
		}else{
			$.alert(data.error_info);
		}
	}
	
	
	/**
	 * 下单验证
	 * */
	function vailSubmitOrder(){
		//验证基金代码输入是否正确
		var buy_stockCode = $.trim($(_pageId+"#fundCode").val());
		if(buy_stockCode.length == 0){
			$.alert("请输入基金代码");
			return false;
		}	
		if(buy_stockCode.length != 6){
			$.alert("基金代码输入错误");
			return false;
		}	
		//验证基金份额输入是否正确
		var now_price = $(_pageId+"#fundSum").val();
		var can_buy = $(_pageId+".fund_form2 .limit em").text();
		if($.trim(now_price).length<=0){
			$.alert("请输入申购金额");
			return false;
		}else if(now_price=="0"){
			$.alert("申购金额不能为0");
			return false;
		}else if(!validata.isNumberFloat(now_price)||parseFloat(now_price)<0){
			$.alert("请正确输入申购金额");
			return false;
		}else if(Number(now_price)>Number(can_buy)){
			$.alert("申购金额超过可用金额");
			return false;
		}
		var tipStrArray = [];
		tipStrArray.push(["基金名称", $(_pageId+" #fundName").val()]);
		tipStrArray.push(["基金代码 ", buy_stockCode]);
		tipStrArray.push(["申购金额 ", now_price]);
		var tipStr = "<div >";
		tipStr += common.generatePrompt(tipStrArray);
		tipStr += "</div>";
		common.iConfirm("下单确定",tipStr,function success(){
			var cust_code = userInfo.cust_code;	//客户代码
			var fund_account = userInfo.fund_account;	//资产账户
			var branch_no  = userInfo.branch_no;	//分支机构
			var sessionid=userInfo.sessionid;
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var fund_company=$(_pageId+"#fundName").attr("data-fundCom");
			var fund_code=buy_stockCode;
			var balance=now_price;
			var amount = "";
	        var charge_type = ""; //收费方式
			var param = {
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"sessionid":sessionid,
					"fund_company":fund_company,
					"fund_code":fund_code,
					"flag":"",
					"balance":balance,
					"amount":amount,
	                "charge_type":charge_type
				};
			    service_fund.getSubScriptionBuy(param,function(data){
			    	getBuyCallBack(data,param);
			    });
			},function fail(){
		});
	}
	//申购回调
	function getBuyCallBack(data,param){
		if(data.error_no == 0){
			var results = data.results;
				if(results){
					$(_pageId+"#fundSum").val("");
					$.alert(data.error_info);
					queryCapital();
				}
	  	}else if(data.error_no == "-30200610") {
			var imsg = "该基金您暂未开通权限，您是否现在开通？";
			common.iConfirm("基金开户",imsg,function() { // 点击确定
				var param = {
						"entrust_way" : global.entrust_way, // 委托方式  在configuration配置
						"branch_no" : userInfo.branch_no, // 分支机构
						"fund_account" : userInfo.fund_account, //资产账户
						"cust_code" : userInfo.cust_code, //客户代码
						"sessionid" : userInfo.sessionid, // 会话号
						"fund_company" : $(_pageId+"#fundName").attr("data-fundCom") // 基金公司代码
				};
				// 基金开户
				service_fund.fundOpenAccount(param, function(data){
					if(data.error_no == 0) {
						$.alert("基金户开通成功");
						//vailSubmitOrder();
					} else {
						$.alert(data.error_info);
					}
				});
			});
		}else if(data.error_no == "-30200611"){
			common.iConfirm("下单提示",data.error_info,function() {
				param.flag = "1";
				service_fund.getSubScriptionBuy(param,getBuyCallBack);
			});
		}else{
			$.alert(data.error_info);
		}
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//股票代码输入框监听
		$.bindEvent($(_pageId+"#fundCode"), function(e){
			var fundCode = $.trim($(this).val());
			if(fundCode.length == 6){
				getFundList(fundCode);
			}else{
				clearBuyMsg();
			}
			e.stopPropagation();
		},"input");
		
		//申购
		$.bindEvent($(_pageId + ".fund_form2 .ce_btn"), function(e){
			vailSubmitOrder();
			e.stopPropagation();
		});
	}
	
	
	/**
	 * 重置页面数据  
	 */
	function clearBuyMsg(){
//		$(_pageId + " .input_text input").slice(1).val("");
		$(_pageId + "#fundName").val("");
		$(_pageId + "#fundNav").val("");
		$(_pageId + "#fundSum").val("");
	}
    
	/**
	 * 销毁
	 */
	function destroy(){
		clearBuyMsg();
		$(_pageId + "#fundCode").val("");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});