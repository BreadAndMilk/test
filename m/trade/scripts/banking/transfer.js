/**
 * 交易转账
 */
define('trade/scripts/banking/transfer.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	require("validatorUtils");
	var commonFunc = require("commonFunc");
	var validatorUtil = $.validatorUtils;
	var service_common = require("service_common");
    var _pageId = "#banking_transfer ";
    var action = "#transferIn "; // tab节点选择  转入转出
    var balance_pwd = false;
	var userInfo = null;
	var money_types = {"0":"人民币","1":"美元","2":"港币"};
	var money_typef = {"0":"元","1":"美元","2":"港币"};
	var bankInfos = {};
	var bankInfo = {};
	var keyboard = require("keyboard");
	
    /**
     * 初始化
     */
	function init(){
		if(keyboard){
			keyboard.keyInit();
		}
		userInfo = common.getCurUserInfo();
		jumpPageEvent();
		queryAccount(); // 查询存管银行
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
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("account/index","left");
			e.stopPropagation(); // 阻止冒泡
		});
		// 流水查询
		$.bindEvent($(_pageId +".top_title .noicon_text"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("banking/transfer","banking/transferHistory");
			e.stopPropagation(); // 阻止冒泡
		});
		// 页面切换
		$.bindEvent($(_pageId + ".toggle_nav ul li"), function(e){
			resetBuyForm();
			$(this).addClass("active").siblings().removeClass("active");
			$(_pageId + ".input_forms").hide();
			if($(_pageId+".toggle_nav ul li").eq(0).hasClass("active")){
				action = "#transferIn ";
				$(_pageId + ".input_forms").eq(0).show();
			}else{
//				queryBalance();
				action = "#transferOut ";
				$(_pageId + ".input_forms").eq(1).show();
			}
			e.stopPropagation(); // 阻止冒泡
		});

	}
	
	/**
	 * 事件绑定 
	 */
	function bindPageEvent(){
		// 提交转账
		$.bindEvent($(_pageId + ".ce_btn a"),function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			transferSubmit(); // 提交转账
			e.stopPropagation(); // 阻止冒泡
		});
		// 弹出密码输入框
		$.bindEvent($(_pageId + "#enblance"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			if(common.isValue(bankInfo)){
				if(balance_pwd){
					$(_pageId).attr("key-panel-main","false");
					var bank_text = $(_pageId + " .select_box p span").text();
					var html = '<div class="pop_pass"><div class="pop_main" style="padding: 0;"><span class="icon"></span><h5>请输入银行密码</h5><p>';
					html += bank_text+'</p><div class="input_text bankBalance"><input js-key="password8" class="t1" type="password" placeholder="请输入银行密码" maxLength="6" class="text"></div></div></div>';
					common.iConfirm('',html,function($div){
						checkEnblance($div.find("input").val());
						$(_pageId).attr("key-panel-main","true");
					},function(){
						$(_pageId).attr("key-panel-main","true");
					},"确定","取消",function($html){
						var pwd = $html.find("input").val();
						var vai1 = /^[0-9]{6}$/;
						if(validatorUtil.isEmpty(pwd)){
							$.alert("密码不能为空");
							return false;
						}else if(!vai1.test(pwd)){
							$.alert("请输入6位数字密码");
							return false;
						}else{
							return true;
						}
					});
					if(keyboard){
						keyboard.keyInit();
					}
				}
				else
				{
					checkEnblance();
				}
			}
			else{
				$.alert("请选择查询的银行卡");
			}
			e.stopPropagation(); // 阻止冒泡
		});
		
		$.bindEvent($(_pageId), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			if(e.target !== document.activeElement)
			{
				document.activeElement.blur();
			}
		}, "click");
	}
	
    /**
     * 获取开通转账银行账号
     */
	function queryAccount(){
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account; //资产账户
		var branch_no = userInfo.branch_no;	//分支机构
		var sessionid = userInfo.session_id;
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var bank_code = "";
		var money_type = "";
		var param={			
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"bank_code":bank_code,
				"money_type":money_type,
				"account_type":userInfo._loginClass
		};
		service_common.queryAccounts(param,function(data){queryAccountCallBack(data,param);});
	}
	function queryAccountCallBack(data,param){
		if(data.error_no == 0){
			var results = data.results;
			if(results && results.length > 0){
				var listHtml = "<div class='bank_list'><ul>";
				for(var i = 0;i < results.length; i++) {
					bankInfos[i+""] = results[i];
					var bank_accounts = results[i].bank_account;
					if(bank_accounts.length>0){
						bank_accounts = " ****" +bank_accounts.substring(bank_accounts.length-4,bank_accounts.length);
					}
					var fundseq = results[i].fundseq;
					if(fundseq == "1"){
						fundseq = "(辅)";
					}
					else{
						fundseq = "(主)";
					}
					bank_accounts = fundseq+"<span>"+results[i].bank_name+bank_accounts+"</span> <small>"+money_types[results[i].money_type]+"</small>";
					listHtml += "<li id='"+i+"'><a href=\"javascript:void(0);\"><i></i>"+bank_accounts+"</a></li>";
				}
				listHtml += "</ul></div>";
				common.addChoiceList($(_pageId+" .select_box p"), "选择银行和币种",listHtml,function(data,div){
					div.html(data.find("a").html());
					var id = data.attr("id");
					bankInfo = bankInfos[id];
					if(action == "#transferIn "){
						queryBankInfo(2);
						queryBankInfo(0);
					}
					else{
						queryBankInfo(1);
						queryBalance();
					}
					$(_pageId+action+"div.unit input").next("em").text(money_typef[bankInfo.money_type]);
				},false,$.trim(action.substr(1)));
			}
			else{
				$(_pageId+" .select_box p").text("暂无可转账银行卡");
			}
		}
		else {
		   $.alert(data.error_info);
	    }
	}
	
	
	 /**
     * 保证金可转余额查询
     */
	function queryBalance(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account; // 货币 ""所有货币，0 人民币，1 港币，2 美元
		var asset_account = bankInfo.fund_account;
		var cust_code = userInfo.cust_code; // 关联资产账户标志
		var money_type = bankInfo.money_type; // 货币 ""所有货币，0 人民币，1 港币，2 美元
		var sessionid = userInfo.session_id;
		var param={				
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"asset_account": asset_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"money_type":money_type,
				"account_type":userInfo._loginClass
		};
		service_common.queryFundSelect(param,queryBalanceCallBack,{"isShowWait":false});
	}
	function queryBalanceCallBack(data){
		if(data.error_no == 0){
			var results = data.results[0];
			if(results){
				$(_pageId+action+" input.maxs").val(results.fetch_balance);
			}
				
		}
	}
	
	 /**
     * 查询转账银行业务信息 
     */
	function queryBankInfo(transfer_direction){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account; // 货币 ""所有货币，0 人民币，1 港币，2 美元
		var cust_code = userInfo.cust_code; // 关联资产账户标志
		var money_type = bankInfo.money_type;
		var bank_code = bankInfo.bank_code;
		var transfer_direction = transfer_direction;
		var sessionid = userInfo.session_id;
		var param={				
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"bank_code":bank_code,
				"money_type":money_type,
				"transfer_direction":transfer_direction,
				"account_type":userInfo._loginClass
		};
		service_common.queryBankInfo(param, function(data){
			if(data.error_no == 0){
				var results = data.results[0];
				if(results){
//					var transfer_direction = results.transfer_direction; // 转账方向
					var fund_password_flag = results.fund_password_flag; // 资金密码标志
					var bank_password_flag = results.bank_password_flag; // 银行密码标志
					// 银行转证券
					if(transfer_direction == 0){
						if(fund_password_flag == 1 || fund_password_flag == 3){
							$(_pageId+action + " #stock_password").parent().show();
						}
						else{
							$(_pageId+action + " #stock_password").parent().hide();
						}
						if(bank_password_flag == 1){
							$(_pageId+action + " #bank_password").parent().show();
						}
						else{
							$(_pageId+action + " #bank_password").parent().hide();
						}
					} 
					else if(transfer_direction == 1){ // 证券转银行
						if(fund_password_flag == 1 || fund_password_flag == 3){
							$(_pageId+action + " #stock_password").parent().show();
						}
						else{
							$(_pageId+action+" #stock_password").parent().hide();
						}
						if(bank_password_flag == 1){
							$(_pageId+action + " #bank_password").parent().show();
						}
						else{
							$(_pageId+action + " #bank_password").parent().hide();
						}
					}else if(transfer_direction == 2){
						if(bank_password_flag == 1){
							balance_pwd = true;
						}
					}
				}
			}
		});
	}
	
	 /**
     * 提交转账
     */
	function transferSubmit(){
		if(common.size(bankInfos) == 0){
			$.alert("暂无可转账银行卡");
			return false;
		}
		if(!common.isValue(bankInfo)){
			$.alert("请选择转账银行卡");
			return false;
		}
		var moneyNum = $(_pageId+action + "#moneyNum").val(); // 转账金额
		if(moneyNum == ""){
			$.alert("请输入转账金额");
			return false;
		}else if(!validatorUtil.isNumberFloat(moneyNum)){
			$.alert("转账金额请输入数字");
			return false;
		}
		if(action == "#transferOut "){
			var max_transfer=$(_pageId + action + " input.maxs").val(); // 可转金额
			if($.trim(max_transfer).length<=0||parseFloat(max_transfer)<parseFloat(moneyNum)){
				$.alert("转账金额不足");
				return false;
			}
		}
		var fund_password = "";
		var bank_password = "";
		var fund_passwords = $(_pageId+action + "#stock_password");
		var bank_passwords = $(_pageId+action + "#bank_password");
		if(fund_passwords.parent().css("display") != "none"){
			fund_password = fund_passwords.val();	
			if(fund_password == ""){
				$.alert("请输入资金密码");
				return false;
			}
//			else if(fund_password.length!=6){
//				$.alert("资金密码长度为6位数");
//				return false ;
//			}
		}
		if(bank_passwords.parent().css("display") != "none"){
			bank_password = bank_passwords.val();	
			if(bank_password == ""){
				$.alert("请输入银行密码");
				return false ;
			}else if(bank_password.length !=6){
				$.alert("银行密码长度为6位数");
				return false ;
			}
		}
		var pwd = {
			"bank_password":bank_password,
			"fund_password":fund_password
		};
		commonFunc.getKey(function(data){
			var cust_code = userInfo.cust_code;	// 客户代码
			var fund_account = userInfo.fund_account;	// 资产账户
			var branch_no = userInfo.branch_no;	// 分支机构
			var sessionid = userInfo.sessionid;
			var bank_code = bankInfo.bank_code;
			var client_account = bankInfo.bank_account;
			var money_type = bankInfo.money_type;
			var transfer_direction = "0";
			if(action == "#transferOut "){
				transfer_direction = "1";
			}
			var tranamt=moneyNum;
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
			var param={
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"sessionid":sessionid,
					"bank_code":bank_code,
					"money_type":money_type,
					"transfer_direction":transfer_direction,
					"tranamt":tranamt,
					"fund_password":data.fund_password,
					"bank_password":data.bank_password,
					"client_account":client_account,
					"account_type":userInfo._loginClass
			};
			service_common.transfer(param,transferCallBack,{"isLastReq":true,"isShowWait":true});
		},pwd);
	}
	function transferCallBack(data){
		if(data.error_no == 0){
			$.alert("转账请求已发送，流水号为："+data.results[0].serial_no+"<br/>可在转账流水中查询转账结果!");
			resetBuyForm();
//			queryBalance();
		}
		else{
			resetBuyForm();
//			queryBalance();
			$.alert(data.error_info);
		}
	}
	
	 /**
    * 查询银行余额
    */
	function checkEnblance(pwd){
		commonFunc.getKey(function(data){
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
			var cust_code = userInfo.cust_code;	// 客户代码
			var fund_account = userInfo.fund_account; // 资产账户
			var branch_no  = userInfo.branch_no; // 分支机构
			var sessionid = userInfo.session_id;
			var bank_code = bankInfo.bank_code;
			var money_type = bankInfo.money_type;  //  0：人民币，1：美元，2：港币
			var param={
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"sessionid":sessionid,
					"bank_code":bank_code,
					"money_type":money_type,
					"bank_password":data,
					"account_type":userInfo._loginClass
			};
			service_common.bankBalance(param,function(data){
				if(data.error_no == 0){
					var results = data.results[0];
					if(results){
						var fundeffect = 0.00;
						if(results.fundeffect){
							if(validatorUtil.isNumberFloat(results.fundeffect)){
								fundeffect = Number(results.fundeffect).toFixed(2);
							}
						}
						$(_pageId + "#enblance").prev("input").val(fundeffect);
					}
				}
				else{
					$.alert(data.error_info);
				}
			});
		},pwd);
	}
	
	// 数据重置
	function resetBuyForm(){
		$(_pageId + "#moneyNum").val("");
		$(_pageId + " #enblance").prev("input").val("");
		$(_pageId + " input[type='password']").val("");
		$(_pageId + " input[type='password']").parent().hide();
		bankInfo = {};
		$(_pageId + ".select_box p").html("请选择...");
		$(_pageId+".bank_list li").removeClass("active");
		$(_pageId + " input.maxs").val("--");
		$(_pageId+"div.unit input").next("em").text('元');
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		resetBuyForm();
		$(_pageId + " .listSelection").remove();
		action = "#transferIn ";
		$(_pageId + "#transferOut").hide();
		$(_pageId + "#transferIn").show();
		$(_pageId+".toggle_nav ul li").eq(0).addClass("active").siblings().removeClass("active");
		g_need_bank_passwd = false; // 是否需要银行密码
		g_need_fund_passwd = false;// 是否需要资金密码
		if(keyboard){
			keyboard.keyDestroy();
		}
	}
	
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});