/**
 * 新股-放弃认购申报
 */
define('trade/scripts/credit/shares/waiverSubscription.js',function(require, exports, module) {
	require("validatorUtils");
	var validator = $.validatorUtils;
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var	service_stock = require("service_stock");
	var _pageId = "#credit_shares_waiverSubscription ";
	var userInfo =null;
	var lists = {};
	var list = {};
	
    /**
     * 初始化
     */
	function init() {
		userInfo = common.getCurUserInfo();
		query();
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	
	
	/***
	 * 查询中签数据
	 */
	function query(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "account_type":userInfo._loginClass
		};
		service_stock.queryStockData(param,queryCallBack);
	}
	/**
	 * 查询自选股数据回调方法
	 */
	function queryCallBack(data)	{
		if (data) {
			if(data.error_no == 0){
				if(data.results){
					var results = data.results;	
					var listHtml = "<div class='bank_list center'><ul>";
					for(var i = 0;i < results.length; i++){
						lists[i+""] = results[i];
						listHtml += "<li id='"+i+"'><a href=\"javascript:void(0);\">"+results[i].stock_name+" <small>"+results[i].stock_code+"</small></a></li>";
					}
					listHtml += "</ul></div>";
					common.addChoiceList($(_pageId+" .select_box p"), "选择证券代码",listHtml,function(data, div){
						div.html(data.find("a").html());
						var id = data.attr("id");
						list = lists[id];
						$(_pageId + ".input_text input").eq(0).val(Number(list.enable_amount));
						$(_pageId + ".input_text input").eq(1).val(Number(list.market_value).toFixed(2));
					});
				}
				else{
					$(_pageId+" .select_box p").text("暂无可选证券代码");
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
		
		//返回按钮
		$.bindEvent($(_pageId+" .top_title .icon_back"), function(e){
			$.pageBack("shares/more","left");
			e.stopPropagation();
		});
		
		//确定
		$.bindEvent($(_pageId+" .order_form .ce_btn a"), function(e){
			determine();
			e.stopPropagation();
		});
		
	}
    
	/**
	 * 申购验证
	 * */
	function determine(){
		if(common.size(lists) == 0){
			$.alert("没有放弃认购代码");
			return false;
		}
		if(!common.isValue(list)){
			$.alert("请选择放弃代码");
			return false;
		}
		//验证数量
		var mountBuy = $(_pageId + ".input_text input").eq(2).val();
		if(mountBuy.length==0){
			$.alert("请输入放弃数量");
			return false;
		}
		if(!validator.isNumeric(mountBuy)||mountBuy <= 0){
			$.alert("输入的放弃数量无效");
			return false;
		}
		var ballot_num = Number(list.enable_amount);
		if(mountBuy > ballot_num){
			$.alert("放弃数量必须小于或等于中签数量");
			return false;
		}
		var tipStr = "<div >";
		var tipStrArray = [];
		tipStrArray.push([list.stock_name, list.stock_code]);
		tipStrArray.push(["放弃数量", mountBuy]);
		tipStr += common.generatePrompt(tipStrArray);
		tipStr+="</div>";
		common.iConfirm("放弃确定",tipStr,function success(){
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;	//分支机构
			var fund_account = userInfo.fund_account;	//资产账户
			var cust_code = userInfo.cust_code;	//客户代
			var sessionid = userInfo.session_id;
			var password = userInfo.password;
			var entrust_bs = "0";
			var entrust_type = "0";
			var stock_code = list.stock_code;
			var entrust_amount = mountBuy;	
			var param = {
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"entrust_bs":entrust_bs,
					"entrust_amount":entrust_amount,
					"password":password,
					"sessionid":sessionid,
					"entrust_type":entrust_type,
					"stock_code":stock_code
				};
			service_stock.getStockBuy(param,succesCallback);
		});
	}
	function succesCallback(data){
		if(data.error_no != "0"){
			$.alert(data.error_info);
		}else{
			$.alert("申购成功");
		}
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId + ".input_text input").val('');
		$(_pageId + ".select_box p").text('请选择');
	}
	
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});