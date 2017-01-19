/**
 * OTC-持仓查询
 */
define(function(require, exports, module) {
	
	var common = require("common");
	
	var gconfig = $.config;
	var global = gconfig.global;
	var service_otc = require("service_otc");
    var _pageId = "#otc_otcHolding ";
    var userInfo = null;
    
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		common.bindStockEvent(_pageId); //绑定头部菜单事件
		
		//otc持仓查询
		queryOtcHolding();
    }
	
	function queryOtcHolding()
	{
		//查询资金账户
		queryCapital();
		
		
	}
	
	/**
	 * 资金账户查询
	 */
	function queryCapital()
	{
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//客户编号
		var param = {
				"entrust_way" : entrust_way,
				"branch_no" : branch_no,
				"fund_account" : fund_account,
				"cust_code" : cust_code,
				"op_station" :  "pc|192.168.1.55| | | "
		};
		service_otc.queryHolding(param,queryHoldingCallBack);
		
	}
	/**
	 * 资金账户查询回调
	 */
	function queryHoldingCallBack(data)
	{
		if(data.error_no == 0)
		{
			var results = data.results[0];
			if(results && results!= "undefined"){
				$(_pageId+".hold_table tr:eq(0) td:eq(0) strong").text(results.inst_sname);//产品名称
				$(_pageId+".hold_table tr:eq(0) td:eq(1) strong").text(results.inst_code);//产品代码
				$(_pageId+".hold_table tr:eq(0) td:eq(2) strong").text(results.prod_term);//产品期限
				$(_pageId+".hold_table tr:eq(1) td:eq(0) strong").text(common.numToMoneyType(""+Number(results.mkt_val).toFixed(2)+""));//总资产
				$(_pageId+".hold_table tr:eq(1) td:eq(1) strong").text(common.numToMoneyType(""+Number(results.inst_avl).toFixed(2)+""));//投入金额
				$(_pageId+".hold_table tr:eq(1) td:eq(2) strong").text(results.end_date);//到期日
			}else{
				$(_pageId+".hold_table tr:eq(0) td:eq(0) strong").text("--");//总资产
				$(_pageId+".hold_table tr:eq(0) td:eq(2) strong").text("--");//市值
				$(_pageId+".hold_table tr:eq(1) td:eq(0) strong").text("--");//可取
				$(_pageId+".hold_table tr:eq(1) td:eq(1) strong").text("--");//可用
			}
		}
		else
		{
			$.alert(data.error_info);
		}
	}
	
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("otc/otcHolding","account/index",{});
		});

	}
	
	/**
	 * 销毁
	 */
	function destroy(){

	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});