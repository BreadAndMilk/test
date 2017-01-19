/**
 * 一键归集
 */
define('trade/scripts/banking/collection.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	require("validatorUtils");
	var validatorUtil = $.validatorUtils;
	var service_common = require("service_common");
	var service_stock = require("service_stock");
    var _pageId = "#banking_collection ";
    var userInfo = null;
    var money_types = {"0":"人民币","1":"美元","2":"港币"};
    var bankData = {};
    var rollOut = {};
    var shiftTo = {};
    var shift = false;
    var bankInfo = {};
    var height_table = null;
    var keyboard = require("keyboard");
    
    /**
     * 初始化
     */
	function init(){
		if(keyboard){
			keyboard.keyInit();
		}
		userInfo = common.getCurUserInfo();
		queryAccountInfos(); // 查询客户资产账户信息
    }
	
	function load(){
		mianHeight = common.setMainHeight(_pageId, false);
	 	var height_table =  mianHeight - $(_pageId + ".inte_form").outerHeight(true);
        $(_pageId + ".inte_table").height(height_table).css("overflow","auto");   //给持仓数据添加高度
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		$.bindEvent($(_pageId), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			e.stopPropagation();	// 阻止冒泡
		});
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			$.pageBack("account/index","left");
			e.stopPropagation();	// 阻止冒泡
		});
		//页面切换
		$.bindEvent($(_pageId + ".toggle_nav ul li"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			$(this).addClass("active").siblings().removeClass("active");
			$(_pageId+" .inte_form").hide();
			$(_pageId+" .inte_form").eq($(this).index()).show();
			var height_table =  mianHeight - $(_pageId + ".inte_form").eq($(this).index()).outerHeight(true);
        	$(_pageId + ".inte_table").height(height_table).css("overflow","auto");
		});
		
		// 提交一键归集转账
		$.bindEvent($(_pageId + ".inte_form").eq(0).find(".ce_btn a"),function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			cashCollectSubmit(); // 提交转账
			e.stopPropagation(); // 阻止冒泡
		});
		// 提交资金归集转账
		$.bindEvent($(_pageId + ".inte_form").eq(1).find(".ce_btn a"),function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			cashSweepSubmit(); //提交转账
			e.stopPropagation(); // 阻止冒泡
		});
		
	}
	
	/**
	 * 客户资产账户信息查询
	 */
	function queryAccountInfos(){
		var cust_code = userInfo.cust_code;	//客户代码
		var branch_no = userInfo.branch_no;	//分支机构
		var sessionid = userInfo.session_id;
		var fund_account = userInfo.fund_account;
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var money_type="";
		var param={			
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"money_type":money_type,
				
		};
		service_common.queryAccountInfos(param,queryAccountInfosCallBack);
	}
	function queryAccountInfosCallBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results && results.length > 0){
				var listHtml = "<div class='bank_list'><ul>";
				var outHtml = "<div class='bank_list'><ul>";
				var html = '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><th scope="col">资产账号</th><th scope="col">银行名称</th><th scope="col">币种/账户类型</th><th scope="col">余额/可转</th></tr>';
				for(var i = 0;i < results.length; i++) {
					if(results[i].money_type == 0){
						bankData[i+""] = results[i];
						var bank_accounts = results[i].bank_account || "";
						var bank_name = results[i].bank_name;
						var fundseq = results[i].fundseq;
						if(fundseq == "1"){
							fundseq = "辅";
						}
						else{
							fundseq = "主";
						}
						html += "<tr><td>"+results[i].fund_account+"</td>";
	                	html += "<td>"+bank_name+"<br /></td>";
		                html += "<td>"+money_types[results[i].money_type]+"<br/>"+fundseq+"</td>";
		                html += "<td>"+Number(results[i].current_balance).toFixed(2)+"<br />"+Number(results[i].fetch_balance).toFixed(2)+"</td></tr>";
						bank_accounts = "("+fundseq+")<span>"+results[i].fund_account+" "+bank_name+"</span> <small>"+money_types[results[i].money_type]+"</small>";
					outHtml += "<li id='"+i+"'><a href=\"javascript:void(0);\"><i></i>"+bank_accounts+"</a></li>";
					if(results[i].fundseq == 0){
						listHtml += "<li id='"+i+"'><a href=\"javascript:void(0);\"><i></i>"+bank_accounts+"</a></li>";
						}
					}
				}
				listHtml += "</ul></div>";
				outHtml += "</ul></div>";
				html += "</table>";
				common.addChoiceList($(_pageId+" #collection p"), "选择银行和币种",listHtml,function(data,div){
					div.html(data.find("a").html());
					var id = data.attr("id");
					bankInfo = bankData[id];
				},false,"collection");
				common.addChoiceList($(_pageId+" #rollOut p"), "选择转出银行和币种",outHtml,function(data,div){
					div.html(data.find("a").html());
					var id = data.attr("id");
					rollOut = bankData[id];
					addShiftToHtml();
				},false,"rollOut");
				$(_pageId+" .inte_table").html(html);
			}
		}
		else
		{
			$.alert(data.error_info);
		}
	}
	
	function addShiftToHtml(){
		var ToHtml = "<div class='bank_list'><ul>";
		shift = false;
		for(var key in bankData){
			var money_type = bankData[key].money_type;
			var fundseq = bankData[key].fundseq;
			if(money_type == rollOut.money_type && fundseq != rollOut.fundseq){
				shift = true;
				var bank_accounts = bankData[key].bank_account || "";
				var bank_name = bankData[key].bank_name;
				if(fundseq == "1"){
					fundseq = "辅";
				}
				else{
					fundseq = "主";
				}
				bank_accounts ="("+fundseq+")<span>"+bankData[key].fund_account+" "+bank_name+"</span> <small>"+money_types[money_type]+"</small>";
				ToHtml += "<li id='"+key+"'><a href=\"javascript:void(0);\"><i></i>"+bank_accounts+"</a></li>";
			}
		}
		ToHtml += "</ul></div>";
		if(shift){
			common.addChoiceList($(_pageId+" #shiftTo p"), "选择转入银行和币种",ToHtml,function(data,div){
				div.html(data.find("a").html());
				var id = data.attr("id");
				shiftTo = bankData[id];
			},false,"shiftTo");
		}
		else{
			$(_pageId+" #shiftTo p").html("没有可转入的资金账号选择");
		}
	}
	 /**
     * 一键归集提交转账
     */
	function cashCollectSubmit(){
		if(common.size(bankData) == 0){
			$.alert("没有开通银行卡");
			return false;
		}
		if(!common.isValue(bankInfo)){
			$.alert("请选归集的银行卡");
			return false;
		}
		var stock_password =  $(_pageId+" .inte_form").eq(0).find("#stock_password").val() || "";	
		if(stock_password == ""){
			$.alert("请输入资金密码");
			return false ;
		}
//		else if(stock_password.length!=6){
//			$.alert("资金密码长度为6位数");
//			return false ;
//		}
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = bankInfo.fund_account;	//资产账户
		var branch_no  = userInfo.branch_no;	//分支机构
		var sessionid = userInfo.session_id;
		var money_type = bankInfo.money_type;
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var param={
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"money_type":money_type,
		};
		service_common.cashCollection(param,cashCollectionCallBack);
	}
	function cashCollectionCallBack(data){
		if(data.error_no == 0){
			$(_pageId+" .inte_form").eq(0).find("#stock_password").val("");
			$.alert(data.results[0].fundeffec!=""?"归集金额 为："+data.results[0].fundeffec:"已提交转款");
			resetBuyForm();
			queryAccountInfos();
		}
		else{
			resetBuyForm();
			$.alert(data.error_info);
		}
	}
	
	 /**
     * 提交资金归集转账
     */
	function cashSweepSubmit(){
		if(common.size(bankData) == 0){
			$.alert("没有开通银行卡");
			return false;
		}
		if(!common.isValue(rollOut)){
			$.alert("请选转出的银行卡");
			return false;
		}
		if(!shift){
			$.alert("没有可用来转入的银行卡");
			return false;
		}
		if(shift && !common.isValue(shiftTo)){
			$.alert("请选转入的银行卡");
			return false;
		}
		var moneyNum = $(_pageId + "#moneyNum").val(); // 转账金额
		if(moneyNum == ""){
			$.alert("请输入转账金额");
			return false;
		}else if(!validatorUtil.isNumberFloat(moneyNum)){
			$.alert("转账金额请输入数字");
			return false;
		}
		var stock_password =  $(_pageId+" .inte_form").eq(1).find("#stock_password").val();	
		if(stock_password == ""){
			$.alert("请输入资金密码");
			return false ;
		}
//		else if(stock_password.length != 6){
//			$.alert("资金密码长度为6位数");
//			return false ;
//		}
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account;	//资产账户
		var branch_no  = userInfo.branch_no;	//分支机构
		var sessionid = userInfo.session_id;
		var money_type = rollOut.money_type;
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var out_fundid = rollOut.fund_account;
		var in_fundid = shiftTo.fund_account;
		var param={
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"money_type":money_type,
	      	    "out_fundid":out_fundid,
  	            "out_password":stock_password,
  	            "in_fundid":in_fundid,
  	            "tranamt":moneyNum
		};
		service_common.cashSweep(param,cashSweepCallBack);
	}
	function cashSweepCallBack(data){
		if(data.error_no == 0){
			$(_pageId+" .inte_form").eq(1).find("#moneyNum").val("");
			$(_pageId+" .inte_form").eq(1).find("#stock_password").val("");
			$.alert(data.results[0].outsno!=""?"转出流水号为："+data.results[0].outsno:"已提交转款");
			resetBuyForm();
			queryAccountInfos();
		}
		else{
			resetBuyForm();
			$.alert(data.error_info);
		}
	}
	//数据重置
	function resetBuyForm(){
		$(_pageId + " .listSelection li").removeClass("active");
		$(_pageId + "#moneyNum").val("");
		$(_pageId + "#stock_password").val("");
		$(_pageId + "#turnIn ul").hide();
		$(_pageId + "#turnOut ul").hide();
		$(_pageId+" .input_select .select_box p").text("请选择..");
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId + " .listSelection").remove();
		$(_pageId + ".toggle_nav ul li").eq(0).addClass("active").siblings().removeClass("active");
		$(_pageId+" .inte_form").eq(1).hide();
		$(_pageId+" .inte_form").eq(0).show();
		resetBuyForm();
		$(_pageId +"#cashTransfer").hide();
		$(_pageId +"#collection").show();
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