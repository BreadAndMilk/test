/**
 * 信用交易-合约展期
 */
define('trade/scripts/credit/order/contractExtension.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var commonOrder = require("commonOrder");
	var _pageId = "#credit_order_contractExtension ";
	var dateUtils = require("mobiscrollUtils");
	var common = require("common");
	var service_credit = require("service_credit");
	var userInfo = null;  // 账号信息
	var contractData = {};
	var contractInfo = [];
	
    /**
     * 初始化
     */
	function init(){
		
		userInfo = common.getCurUserInfo();
		
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("credit/order/mainOrder","left");
			e.stopPropagation();
		});
		var w = Number(gconfig.appWidth * 0.23).toFixed(0);
		queryContract(w);
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//查询跳转
		$.bindEvent($(_pageId+".noicon_text"), function(e){
			$.pageInit("credit/order/contractExtension","credit/query/financingQuery",{});
			e.stopPropagation();
		});
		
		//提交委托
		$.bindEvent($(_pageId+".back_form .ce_btn"), function(e){
			vailSubmitOrder();
			e.stopPropagation();
		});
		
	}
	
	function queryContract(w){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var stock_account ="";
		var stock_code = "";
		var exchange_type = "";
		var _request_num = "1000";
		var param={
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"stock_account":stock_account,
				"stock_code":stock_code,
				"exchange_type":exchange_type,
				"position_str":"",
				"request_num":_request_num
		};
		service_credit.contractmx_query(param,function(data){
			contractData = {};
			if (data) {
				if(data.error_no == 0)
				{
					var results = data.results;	
					if(results && results.length > 0)
					{
						var listHtml = "<div class='multi_list'><div class='top'><p class='col'><i></i></p><p>证券/代码</p><p>合约编码</p><p>开仓日期</p><p>到期日期</p></div><ul>";
						for(i = 0;i < results.length; i++)
						{
							contractData[""+i] = results[i];
							listHtml += "<li id='"+i+"'><p class='col'><i></i></p>";
							listHtml += "<p><span>"+results[i].stock_name+"</span> <span>"+results[i].stock_code+"</span></p>";
							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].compact_id+"</span></p>";
							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].open_date+"</span></p>";
							listHtml += "<p><span class='_single' style='width:"+w+"px'>"+results[i].ret_end_date+"</span></p></li>";
						}
						listHtml += "</ul></div>";
						common.addChoiceList($(_pageId+" .input_select .select_box p"), "请选择合约",listHtml,function(data,div){
							var id = data.attr("id");
							contractInfo = contractData[id];
							div.html(contractInfo.stock_code);
							$(_pageId + " #startInput").val(contractInfo.open_date.replaceAll("-","/"));
							$(_pageId + " #stockName").val(contractInfo.stock_name);
							$(_pageId + " #compact_id").val(contractInfo.compact_id);
							$(_pageId + " #endInput").val(contractInfo.ret_end_date.replaceAll("-","/"));
							dateUtils.initDateUI($(_pageId + " #endInput"), {
								"preset": "date",
								"theme": 'default',
//								"dateFormat": "yyyy-mm-dd"
							});
						});
					}
					else{
						$(_pageId+" .input_select .select_box p").text("暂无合约信息");
					}
				}
				else
				{
					$.alert(data.error_info);
				}
			}
		},{"isShowWait":false});
	}
	
	
	/**
	 * 下单验证
	 * */
	function vailSubmitOrder(){	
		//验证股票代码输入是否正确
		if(common.size(contractData) == 0){
			$.alert("没有合约信息");
			return false;
		}
		if(!common.isValue(contractInfo)){
			$.alert("请选择合约");
			return false;
		}
		var endInput = $(_pageId + " #endInput").val().replaceAll("/","-");
		var tipStrArray = [];
		tipStrArray.push([contractInfo.stock_name, contractInfo.stock_code]);
		tipStrArray.push(["合约编号 ", contractInfo.compact_id]);
		tipStrArray.push(["开仓时间 ", contractInfo.open_date]);
		tipStrArray.push(["到期时间 ", endInput]);
		var tipStr = "<div >";
		tipStr += common.generatePrompt(tipStrArray);
		tipStr += "</div>";
		common.iConfirm("合约展期",tipStr,function success(){
			var cust_code = userInfo.cust_code;	//客户代
			var fund_account = userInfo.fund_account;	//资产账户
			var branch_no = userInfo.branch_no;	//分支机构
			var sessionid=userInfo.session_id;
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
			var password= userInfo.password;
			var stock_code = contractInfo.stock_code;
			var compact_id = "";
			var param = {
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"password":password,
					"sessionid":sessionid,
					"stock_code":stock_code,
					"compact_id":compact_id
				};
			service_credit.repaystock(param,getStockBuyCallBack);
		}, null);
	}
	
	/**
	 * 委托下单返回
	 * */
	function getStockBuyCallBack(data)
	{
		if(data){
			var errorNo = data.error_no;
			$.alert(data.error_info,function(){
				
			});
		}
	}
	
	
	/**
	 * 数据重置
	 */
	function destroy(){
		$(_pageId+" .input_select .select_box p").html("请选择");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});