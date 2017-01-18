/**
 * 信用交易-现金还款
 */
define('trade/scripts/credit/order/cashPayments.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
			require("validatorUtils");
	var validatorUtil = $.validatorUtils;
	var service_credit = require("service_credit");
    var _pageId = "#credit_order_cashPayments ";
    var userInfo =null;
	var debtdate = ""; //合约日期
	var debtsno = "";  //合约编号
	var keyboard = require("keyboard");
	var contractData = {};
	var selectedList = [];
    
    /**
     * 初始化
     */
	function init(){
		if(keyboard){
			keyboard.keyInit();
		}
		userInfo = common.getCurUserInfo();
		$(_pageId+".input_slider r1").attr("value",50);
		queryFundSelectData();
		
//		var w = Number(gconfig.appWidth * 0.23).toFixed(0);
//		queryContract(w);
	}
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		$(_pageId+".main .fund_table").scrollTop(0);
		$(_pageId+".main .fund_table").css("overflow-y","auto");
        var height_meau = mianHeight - $(_pageId+".main .pay_form").outerHeight() - 22;
		$(_pageId+".main .fund_table").height(height_meau); //查询目录添加高度
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		$.bindEvent($(_pageId), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			e.stopPropagation();
		})
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
//			$.pageInit("credit/order/cashPayments","credit/order/mainOrder",{});
			$.pageBack("credit/order/mainOrder","left");
			e.stopPropagation();
		});
		//查询跳转
		$.bindEvent($(_pageId+".noicon_text"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			$.pageInit("credit/order/cashPayments","credit/query/financingQuery",{});
			e.stopPropagation();
		});
		//滚动联动
		$.bindEvent($(_pageId+" .back_form .input_form a.btn"), function(e){
//			var enableMoney = $(_pageId+"#enableMoney").text();  //资金可用金额
			var mayPay = $(_pageId+"#mayPay").text();  //需还款额
			$(_pageId+"#payMoney").val(mayPay);
			$(_pageId+"#payMoney").attr("value",mayPay);
			$(_pageId+"#payMoney").children("em").text(mayPay);
			$(_pageId+"#payMoney").find("div.key_text").text(mayPay);
			if(mayPay.length == 0){
				$(_pageId+"#payMoney").find("div.key_place").show();
			}else{
				$(_pageId+"#payMoney").find("div.key_place").hide();
			}
			e.stopPropagation();
		});
		//提交委托
		$.bindEvent($(_pageId+".back_form .ce_btn"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			vailSubmitOrder();
			e.stopPropagation();
		});
		
		$.bindEvent($(_pageId+" .toggle_nav li"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			$(this).addClass("active").siblings().removeClass("active");
			if($(this).index() == 0){
				$(_pageId+" .rule_select").hide();
			}
			else{
				$(_pageId+" .rule_select").show();
			}
			e.stopPropagation();
		});
	}
    
	/**
	 * 资金查询
	 */
	function queryFundSelectData(bz){	
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var money_type = bz?bz:"";////货币 ""所有货币，0 人民币，1 港币，2 美元
		var password = userInfo.password;
		var sessionid=userInfo.session_id;
		var param={				
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"money_type":money_type
		};
		service_credit.remoney_link(param,queryFundSelectCallback);
	}
	
	/**
	 * 资金查询回调方法
	 * @param {Object} data 返回数据
	 */
	function queryFundSelectCallback(data){
		if(data) {
			if(data.error_no == 0){
				var account=data.results;
				var current_balance = account[0].fin_enrepaid_balance;
				var total_debit=account[0].real_compact_balance;
				$(_pageId+"#enableMoney").text(Number(current_balance).toFixed(2));  //资金可用金额
				$(_pageId+"#mayPay").text(Number(total_debit).toFixed(2));  //需还款额
			}else{
				$.alert(data.error_info);
			}
		}
	}
	
	/**
	 * 下单验证
	 * */
	function vailSubmitOrder(){	
		var mostBuy = $(_pageId+" #mayPay").text();
		if(Number(mostBuy) == 0){
			$.alert("已不需要还款");
			return false;
		}
		//还款金额
		var money = $(_pageId+"#payMoney").val();
		if(money.length == 0){
			$.alert("请输入还款金额");
			return false;
		}	
		//验证股票价格输入是否正确
		if(!validatorUtil.isNumberFloat(money)){
			$.alert("请正确输入还款金额");
			return false;
		}
		if(Number(money) <= 0){
			$.alert("还款金额必须大于0");
			return false;
		}
		var avail = $(_pageId+" #enableMoney").text();
		if(Number(avail) < Number(money)){
			$.alert("可用金额不足");
			return false;
		}
		//验证需还款额
		if(Number(money) > Number(mostBuy)){
			$.alert("还款金额已经大于需还款额");
			return false;
		}
		var tipStrArray = [];
		tipStrArray.push(["资产账户", userInfo.fund_account]);
		tipStrArray.push(["操作类型 ", "现金还款"]);
		tipStrArray.push(["需还款额 ", $(_pageId+" #mayPay").text()]);
		tipStrArray.push(["还款金额 ", money]);
		var tipStr = "<div >";
		tipStr += common.generatePrompt(tipStrArray);
		tipStr += "</div>";
		common.iConfirm("现金还款",tipStr,function success(){
			var cust_code = userInfo.cust_code;	//客户代码
			var fund_account = userInfo.fund_account;	//资产账户
			var branch_no  = userInfo.branch_no;	//分支机构
			var sessionid=userInfo.session_id;
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
			var password= userInfo.password;
			var money_type= "0";	
			var pay_type= 0;
			var occur_balance=$(_pageId+"#payMoney").val();
			var compact_id="";
			var param = {
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"password":password,
					"sessionid":sessionid,
					"money_type":money_type,
					"pay_type":pay_type,
					"occur_balance":occur_balance,
					"compact_id":compact_id,
					"debtdate":debtdate,
					"debtsno":debtsno
				};
			service_credit.repayment(param,getStockBuyCallBack);
		}, null);
	}
	
	/**
	 * 委托下单返回
	 * */
	function getStockBuyCallBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results ){
				var occur_balance = results[0].occur_balance;
				var tipStr = "交易委托已提交，实际还款金额 : "+(occur_balance?occur_balance:0);
				$.alert(tipStr);
			}
			resetBuyForm();
			queryFundSelectData();
			
		}else{
			resetBuyForm();
			queryFundSelectData();
			$.alert(data.error_info);
		}
	}

	
//	function queryContract(w){
//		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
//		var branch_no = userInfo.branch_no;	
//		var fund_account = userInfo.fund_account;
//		var cust_code = userInfo.cust_code;//关联资产账户标志
//		var sessionid = userInfo.session_id;
//		var stock_account ="";
//		var stock_code = "";
//		var exchange_type = "";
//		var _request_num = "1000";
//		var param={
//				"entrust_way":entrust_way,
//				"branch_no":branch_no,
//				"fund_account":fund_account,
//				"cust_code":cust_code,
//				"sessionid":sessionid,
//				"stock_account":stock_account,
//				"stock_code":stock_code,
//				"exchange_type":exchange_type,
//				"position_str":"",
//				"request_num":_request_num
//		};
//		service_credit.contractmx_query(param,function(data){
//			contractData = {};
//			if (data) {
//				if(data.error_no == 0)
//				{
//					var results = data.results;	
//					if(results && results.length > 0)
//					{
//						var listHtml = "<div class='multi_list'><div class='top'><p class='col'><i></i></p><p>证券/代码</p><p>合约编码</p><p>未还金额</p><p>开仓日期</p></div><ul>";
//						for(i = 0;i < results.length; i++)
//						{
//							contractData[""+i] = results[i];
//							listHtml += "<li id='"+i+"'><p class='col'><i></i></p>";
//							listHtml += "<p><span>"+results[i].stock_name+"</span> <span>"+results[i].stock_code+"</span></p>";
//							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].compact_id+"</span></p>";
//							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].real_compact_balance+"</span></p>";
//							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].open_date+"</span></p></li>";
//						}
//						listHtml += "</ul></div>";
//						common.addChoiceList($(_pageId+" .rule_select p"), "请选择合约",listHtml,function(data,div){
//							var length = data.length;
//							if(length != 0){
//								div.find("span").html("已选"+length+"项");
//								for(var i = 0; i < length; i++){
//									selectedList.push(data.eq(i).attr("id"));
//								}
//							}
//							else{
//								div.find("span").html("请选择");
//								selectedList = [];
//							}
//						},true);
//					}
//					else{
//						$(_pageId+" .rule_select p span").text("暂无合约信息");
//					}
//				}
//				else
//				{
//					$.alert(data.error_info);
//				}
//			}
//		},{"isShowWait":false});
//	}
	
	/**
	 * 重置表单
	 * */
	function resetBuyForm(){
		
		$(_pageId+"#enableMoney").text("--");
		$(_pageId+"#mayPay").text("--");
		$(_pageId+"#payMoney").val("");
		
		$(_pageId+" .toggle_nav li").eq(0).addClass("active").siblings().removeClass("active");
		$(_pageId+" .rule_select").hide();
		$(_pageId+" .rule_select p span").html("请选择");
	
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		if(keyboard){
			keyboard.keyDestroy();
		}
		resetBuyForm();
	}
	
	var base = {
		"init" : init,
		"load": load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});