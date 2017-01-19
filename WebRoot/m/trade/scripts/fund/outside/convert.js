/**
 * 场外基金-基金转换
 */
define('trade/scripts/fund/outside/convert.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var _pageId = "#fund_outside_convert ";
	var service_fund = require("service_fund");
    var userInfo= null;
    	require("validatorUtils");
	var validata = $.validatorUtils;
	var listData = {};
	var fundInfo = {};
	var listDataOut = {};
	var fundInfoOut = {};
    /**
     * 初始化
     */
	function init(){
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack();
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
					common.addChoiceList($(_pageId+" #fundCodeTo p"), "选择转出基金",listDiv,function(data, div){
						div.html(data.find("a small").text());
						var id = data.attr("id");
						fundInfo = listData[id];
						$(_pageId + "#fundNameTo").val(fundInfo.fund_name);
						$(_pageId + "#fundNav").val(fundInfo.nav || 0);
						$(_pageId+".fund_form2 .limit em").text(Number(fundInfo.enable_shares));//持有份额
						$(_pageId + "#fundSum").val("");
						listDataOut = {};
						fundInfoOut = {};
						getFundList(fundInfo);
					},false,"fundTo");
				}
				else{
					$(_pageId+" #fundCodeTo p").text("暂无可转出基金");
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
	function getFundList(fundInfo){
		if(fundInfo && fundInfo.fund_company){
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var fund_code = "";
			var fund_company = fundInfo.fund_company;
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
				listDataOut = {};
				var listDiv = "<div class='bank_list center1'><ul>";
				for (var i=0;i<results.length;i++){
					if(fundInfo.fund_code != results[i].fund_code){
						listDataOut[results[i].fund_code+""] = results[i];
						listDiv += "<li id='"+results[i].fund_code+"'><a href=\"javascript:void(0);\">"+results[i].fund_name+" <small>"+results[i].fund_code+"</small></a></li>";
					}
				}
				listDiv += "</ul></div>";
				common.addChoiceList($(_pageId+" #fundCodeOut p"), "选择转人基金",listDiv,function(data, div){
					div.html(data.find("a small").text());
					var id = data.attr("id");
					fundInfoOut = listDataOut[id];
					$(_pageId + "#fundNameOut").val(fundInfoOut.fund_name);
					$(_pageId + "#fundSum").val("");
				},false,"fundOut");
			}
			else{
				$(_pageId+" #fundCodeOut p").text("暂无可转入基金");
			}
		}else{
			$.alert(data.error_info);
		}
	}
	
	function fundConversion(){
		if(common.size(fundInfo) == 0){
			$.alert("没有可转出的基金");
			return false;
		}
		if(!common.isValue(fundInfo)){
			$.alert("请选转出的基金");
			return false;
		}
		if(common.size(listDataOut) == 0){
			$.alert("没有可转入的基金");
			return false;
		}
		if(!common.isValue(fundInfoOut)){
			$.alert("请选转入的基金");
			return false;
		}
		var numMax =$(_pageId+".fund_form2 .limit em").text();
		var fundSum = $(_pageId+"#fundSum").val();
		if(validata.isEmpty(numMax)|| numMax=="0" || numMax=="--"){
			$.alert("可转份额为0");
			return false;
		}
		if(validata.isEmpty(fundSum)){
			$.alert("转换份额不能为空");
			return false;
		}else if(Number(fundSum)>Number(numMax)){
			$.alert("赎回份额不能大于可转份额");
			return false;
		}
		var tipStrArray = [];
		tipStrArray.push(["转出基金名称", fundInfo.fund_name]);
		tipStrArray.push(["转出基金代码 ", fundInfo.fund_code]);
		tipStrArray.push(["转入基金名称", fundInfoOut.fund_name]);
		tipStrArray.push(["转入基金代码 ", fundInfoOut.fund_code]);
		tipStrArray.push(["转换份额 ", fundSum]);
		var tipStr = "<div >";
		tipStr += common.generatePrompt(tipStrArray);
		tipStr += "</div>";
		common.iConfirm("下单确定",tipStr,function success(){
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;      //分支机构
			var fund_account = userInfo.fund_account; //资金账号
			var cust_code = userInfo.cust_code;       //客户编号
			var sessionid = userInfo.session_id;      //会话号
			var fund_company = fundInfo.fund_company;                    //基金公司
			var fund_code = fundInfo.fund_code; //基金代码
			var trans_code = fundInfoOut.fund_code;
			var amount = fundSum;      //赎回份额
			var exceedflag = 0;                            //巨额方式
			var param = {
					"entrust_way" : entrust_way,
					"branch_no" : branch_no,
					"fund_account" : fund_account,
					"cust_code" : cust_code,
					"sessionid" :sessionid,
					"fund_company" : fund_company,
					"fund_code" : fund_code,
					"trans_code": trans_code,
					"trans_amount" : amount,
					"exceedflag" : exceedflag
			};
			service_fund.fundConversion(param,function(data){
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
						service_fund.queryFundData(param,function(data){
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
			fundConversion();
			e.stopPropagation();
		});
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
		$(_pageId+" .select_box p").text("请选择...");
		$(_pageId+".fund_form2 .limit em").text("--"); //可赎份额数量
		$(_pageId + "input").val("");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});