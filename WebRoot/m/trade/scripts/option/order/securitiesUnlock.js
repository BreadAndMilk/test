/**
 * 个股期权--下单--证券解锁
 */
define("project/scripts/stockOption/stockTrade/order/securitiesUnlock", function(require,exports,module){
	var appUtils = require("appUtils"),
		gconfig = require("gconfig"),
		validatorUtil = require("validatorUtil"),
		layerUtils = require("layerUtils"),
		keyTelPanel = require("keyTelPanel"),
		keyPaneStock = require("keyPaneStock"),
		serviceImp = require("project/scripts/thinkive/base/serviceImp_stockOption").getInstance(),
		stock_common = require("project/scripts/stockOption/common/common"),
		globalFunc = require("globalFunc"),
		stockCodeInput = null,
		_exchange_type = null,
		stock_list = null,
		timer = null,
		bond_type = null,
		userInfo = null,
		_pageId = "#stockOption_stockTrade_order_securitiesUnlock ";
		
	/**
	 * 初始化
	 * */
	function init()
	{
		globalFunc.setSideEffect(0, 0); // 禁用左右滑动
		globalFunc.setBottomMenu(false); // 隐藏底部导航
		stock_common.addNavigation(1, 0, 2, 1,"证券解锁");
		userInfo = globalFunc.getStockOptionUserInfo();
		order_bindPageEvent();
		initKeyPanel();
	}
	
	/**
	 * 初始化键盘
	 * */
	function initKeyPanel()
	{
		stock_common.bindEvent($(_pageId+" #stockCode"),function(e){
			$(_pageId+" .sel_list").hide();
			keyTelPanel.closeKeyPanel();
			var stockCodeInput = $(this);
			$(_pageId+" .input_custom").removeClass("active");
			stockCodeInput.addClass("active");
			keyPaneStock.init_keyPanel(function(stockStr)
			{		
				appUtils.setSStorageInfo("_lastDoTime",new Date().getTime());
				var op_str=stockCodeInput.find("em").text();
				if(stockStr=="del"){
					if(op_str.length>0){
						op_str=op_str.substr(0,op_str.length-1);
					}
					stockStr="";
				}			
				else if(stockStr=="clear"){
					op_str="";
					stockStr="";
				}			
				else if(stockStr=="search"){
					stockStr="";
					getStockList(op_str);
					getStockInfo(op_str);
				}			
				else if(stockStr==""){
					keyPaneStock.closeKeyPanel();
					return false ;
				}
				else if((op_str+stockStr).length>6){
					layerUtils.iAlert("股票代码最长为6位");
					return false ;
				}
				op_str+=stockStr;
				if(op_str.length>5){
					getStockList(op_str);
					getStockInfo(op_str);
				}
				stockCodeInput.find("em").html(op_str);
			},"num");
			e.stopPropagation();
		});
		
		//最大可买可卖
		stock_common.bindEvent($(_pageId+" #num_keyboard"),function(e){
			$(_pageId+" .sel_list").hide();
			var num_keyboard=$(this);
			$(_pageId+" .input_custom").removeClass("active");
			num_keyboard.addClass("active");
			$("#trade_header #pageRegion").hide();
			var init_str=$(_pageId+" #num").attr("value");
			if(init_str==""){
				num_keyboard.find("em").html("");
			}
			keyTelPanel.init_keyPanel(function(str)
			{			
				appUtils.setSStorageInfo("_lastDoTime",new Date().getTime());
				var op_str=num_keyboard.find("em").text();
				if(str=="del"){
					if(op_str.length>0){
						op_str=op_str.substr(0,op_str.length-1);
					}
					str="";
				}
				else if(op_str.length>8){
					layerUtils.iAlert(tip+"数量不超过9位");
					return false ;
				}
				op_str+=str;
				if(op_str.length!=0){
					op_str=Number(op_str);
				}
				num_keyboard.find("em").html(op_str);
				$(_pageId+" #num").attr("value",op_str);
				beyondTheBox(num_keyboard);
			},num_keyboard);
			e.stopPropagation();
		});
		
	}
	/**
	 * 使文本超出框时隐藏左侧
	 */
	function beyondTheBox(input){
		input.css("overflow","hidden");
		var i=0;
		while(true){
			i=input[0].scrollLeft;
			input[0].scrollLeft++;
			if(i==input[0].scrollLeft){
				break;
			}
		}
	}
	
	
	function getStockInfo(stockCode){
		keyPaneStock.closeKeyPanel();
		if (timer != null ) {
            window.clearInterval(timer);
        }
        timer = null;
		stock_list = null;
		resettingStock();
		var stockStrParam = {
				"code_list" : stockCode
			};
			//查询个股行情
		serviceImp.getStockInfo(stockStrParam,getStockListCallBack);
	}
	
	/**
	 * 获取股票列表返回
	 * */
	function getStockListCallBack(data)
	{
		if(data.errorNo == 0){
			var results = data.results;
			if(results && results.length > 0){
				var stkType = results[0][10];  // 行情类别
				// 判断是否为债券
				if(stkType == 6 || stkType == 14){
					bond_type = true;
				}
				else{
					bond_type = false;
				}
				$(_pageId+" #stockName").attr("value",results[0][0]);
				stock_list = results[0][9] + ":" + results[0][1];
				setFifthOrder();
				timer = window.setInterval(setFifthOrder,10000);
			}else{
				layerUtils.iAlert("该只股票不存在！");
			}
		}else{
			layerUtils.iAlert(data.error_info);
		}
	}
	
	//五档买卖盘
	function setFifthOrder(){
		if(stock_list){
			var fifthOrder = {
				"stock_list" : stock_list
			};
			serviceImp.getFifthOrder(fifthOrder,callbackFifthOrder);
		}
	}
	//回调五档买卖盘
	function callbackFifthOrder(data){
		if(data.errorNo == 0){
			var results = data.results;
			if(results.length>0)
			{
				var stock_gear = $(_pageId+" .stock_option ul li");
				var yesProfit = Number(results[0][26]);
				stock_gear.eq(0).find("span:eq(1)").text(results[0][6]);
				stock_gear.eq(0).find("span:eq(2)").text(overAMillion(results[0][11]));
				stock_gear.eq(1).find("span:eq(1)").text(results[0][7]);
				stock_gear.eq(1).find("span:eq(2)").text(overAMillion(results[0][12]));
				stock_gear.eq(2).find("span:eq(1)").text(results[0][8]);
				stock_gear.eq(2).find("span:eq(2)").text(overAMillion(results[0][13]));
				stock_gear.eq(3).find("span:eq(1)").text(results[0][9]);
				stock_gear.eq(3).find("span:eq(2)").text(overAMillion(results[0][14]));
				stock_gear.eq(4).find("span:eq(1)").text(results[0][10]);
				stock_gear.eq(4).find("span:eq(2)").text(overAMillion(results[0][15]));
				stock_gear.eq(5).find("span:eq(1)").text(results[0][16]);
				stock_gear.eq(5).find("span:eq(2)").text(overAMillion(results[0][21]));
				stock_gear.eq(6).find("span:eq(1)").text(results[0][17]);
				stock_gear.eq(6).find("span:eq(2)").text(overAMillion(results[0][22]));
				stock_gear.eq(7).find("span:eq(1)").text(results[0][18]);
				stock_gear.eq(7).find("span:eq(2)").text(overAMillion(results[0][23]));
				stock_gear.eq(8).find("span:eq(1)").text(results[0][19]);
				stock_gear.eq(8).find("span:eq(2)").text(overAMillion(results[0][24]));
				stock_gear.eq(9).find("span:eq(1)").text(results[0][20]);
				stock_gear.eq(9).find("span:eq(2)").text(overAMillion(results[0][25]));
				addColor(yesProfit,stock_gear);
			}
		}else{
			layerUtils.iAlert(data.error_info);
		}
	}
	//根据昨收改动价格颜色 , 没有价格的地方显示“--”
	function addColor(yesProfit,stock_gear){
		var prices = stock_gear.find("span:eq(1)");
		var nums = stock_gear.find("span:eq(2)");
		for(var i=0;i<prices.length;i++){
			var price = Number(prices.eq(i).text());
			var num = Number(nums.eq(i).text());
			if(price == 0){
				prices.eq(i).text("--");
				prices.eq(i).css("color","black");
			}
			else if(price > yesProfit){
				prices.eq(i).css("color","red");
			}
			else if(price < yesProfit)
			{
				prices.eq(i).css("color","green");
			}
			else
			{
				prices.eq(i).css("color","black");
			}
			if(num == 0){
				nums.eq(i).text("--");
			}
		}
	}
	//数量过万改以万为单位
	function overAMillion(num){
		num = Number(num);
		if(num >= 100000){
			num = (num/10000).toFixed(2) + "万";
		}
		return num;
	}
	
	/**
	 * 查询合约代码
	 * */
	function getStockList(stockCode)
	{
		$(_pageId+" #numMax").attr("value","");
		if(!stockCode){
			stockCode = $(_pageId + ' #stockCode').text();
			if(!stockCode){
				return false;
			}
		}
		var entrust_way="5";
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account = globalFunc.getTradeUserInfo().fund_account;	//普通资金账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid= userInfo.session_id;
		var stock_code = stockCode;
		var fund_account_opt = userInfo.fund_account;//衍生品资金账户
		var option_account = userInfo.stock_account;//衍生品合约账户
		var stock_account = "";
		var seat_no = "";
		var exchange_type = "";
		var lock_direction = "2";
		var param = {
				"entrust_way": entrust_way,
				 "branch_no": branch_no,
				 "fund_account": fund_account,
				 "cust_code": cust_code,
				 "sessionid": sessionid,
				 "fund_account_opt": fund_account_opt,
				 "option_account": option_account,
				 "stock_account": stock_account,
				 "seat_no": seat_no,
				 "exchange_type": exchange_type,
				 "stock_code": stock_code,
				 "lock_direction": lock_direction
			};
		serviceImp.querySecuritiesTransferred(param,queryMaxAmountCallBack,true,false);
	}
	
	function queryMaxAmountCallBack(data)
	{
		if(data.error_no == 0){
			var results = data.results;
			if(results.length>0)
			{
				_exchange_type = results[0].exchange_type;
//				$(_pageId+" #stockName").attr("value",results[0].stock_name);
				$(_pageId+" #numMax").attr("value",Number(results[0].enable_amount));
			}
		}else{
			layerUtils.iAlert(data.error_info);
		}
	}
	
	/**
	 * 下单验证
	 * */
	function vailSubmitOrder()
	{	
		//验证股票代码输入是否正确
		var take_stockCode = $(_pageId+" #stockCode").text();
		if(take_stockCode.length == 0)
		{
			layerUtils.iAlert("请输入股票代码");
			return false;
		}	
		if(take_stockCode.length <5)
		{
			layerUtils.iAlert("股票代码输入错误");
			return false;
		}
		//验证最大可买
		var mostBuy = $(_pageId + " #numMax").attr("value");
		if (mostBuy.length == 0) {
			layerUtils.iAlert("该只股票没有可解锁数量");
			return false;
		} else if (mostBuy <= 0) {
			layerUtils.iAlert("最大可解锁为0");
			return false;
		} 
		//验证买入数量
		var mounttake = $(_pageId + " #num").attr("value");
		if (mounttake.length == 0) {
			layerUtils.iAlert("请输入解锁数量");
			return false;
		} else if (!validatorUtil.isNumberFloat(mounttake) || mounttake <= 0) {
			layerUtils.iAlert("输入的解锁数量无效");
			return false;
		} 
		
		var exchange_type = "";
		var secu_acc = "";
		var tipStr = "<div style=\"text-align: center;;color: #999;font-size:14px;height: 120px;\">";
		tipStr+="<span  style=\"text-align: center;padding-left: 8%;font-size: 20px;color: #EE1247;font-weight: bold;\">交易确认</span>";
		tipStr += "<ul class='jyts'>";
		tipStr+="</li><li>操作类型：</li><li>证券解锁";
		tipStr+="</li><li>证券名称：</li><li>"+ $(_pageId+" #stockName").val();
		tipStr+="</li><li>证券代码：</li><li>"+take_stockCode;
		tipStr+="</li><li>解锁数量：</li><li>"+mounttake+"</li></ul></div>";
		layerUtils.iConfirm(tipStr,function success(){
			var cust_code = userInfo.cust_code;	//客户代码
			var fund_account = globalFunc.getTradeUserInfo().fund_account;	//普通资金账户
			var branch_no  = userInfo.branch_no;	//分支机构
			var sessionid=userInfo.session_id;
			var entrust_way="5";
			var stock_account = "";
			var stock_code = take_stockCode;
			var entrust_amount = mounttake;
			var fund_account_opt = userInfo.fund_account;//衍生品资金账户
			var option_account = userInfo.stock_account;//衍生品合约账户
			var seat_no = "";
			var exchange_type = _exchange_type;
			var lock_direction = "2";
			var param = {
					"entrust_way": entrust_way,
					 "branch_no": branch_no,
					 "fund_account": fund_account,
					 "cust_code": cust_code,
					 "sessionid": sessionid,
					 "fund_account_opt": fund_account_opt,
					 "option_account": option_account,
					 "stock_account": stock_account,
					 "seat_no": seat_no,
					 "exchange_type": exchange_type,
					 "stock_code": stock_code,
					 "lock_direction": lock_direction,
					 "entrust_amount": entrust_amount
				};
			serviceImp.AgainstSecuritiesTransfer(param,getStocktakeCallBack);
		}, null);
	}
	
	/**
	 * 委托下单返回
	 * */
	function getStocktakeCallBack(data)
	{
		if(data.error_no == 0){
			var results = data.results;
			if(results ){
				var tipStr = "<span style='font-weight:bold;font-size: 18px;'>交易提示</span><br>交易委托已提交，委托编号："+results[0].entrust_no;
				layerUtils.iAlert(tipStr);
				getStockList();
				globalFunc.refreshRightAssetData();//下单成功后更新右抽屉资产值
			}
		}else{
			layerUtils.iAlert(data.error_info);
		}
		$(_pageId+" #num").attr("value","");
		$(_pageId+" #num_keyboard").html("<em></em>");
	}
	
	/**
	 * 事件绑定
	 * */
	function order_bindPageEvent()
	{
		stock_common.bindEvent($("#stockOption_header #headerName .icon_back"), function(e){
			appUtils.pageInit("stockOption/stockTrade/order/securitiesUnlock","stockOption/stockTrade/order/homePage",{});
			e.stopPropagation();
		});
		//全部
		stock_common.bindEvent($(_pageId+" #numMax").next("a"),function(e){
			var numMax = $(_pageId+" #numMax").attr("value");
			$(_pageId+" #num_keyboard").find("em").html(numMax);
			$(_pageId+" #num").attr("value",numMax);
			e.stopPropagation();
		});
		
		//增加数量
		stock_common.bindEvent($(_pageId+" #num_add"),function(e){
			var num = $(_pageId+" #num").attr("value");
			num = Number(num);
			var mosttake = $(_pageId+" #numMax").attr("value");
			mosttake = Number(mosttake);
			if(num >= 0&&num<999999999)
			{
				var decimalUnit = 100;
				var stock_val = $(_pageId+" #stockCode em").text();
				if(stock_val.substring(0,3) == "204")
				{
					decimalUnit=1000;
				}
				else if(bond_type == true || stock_val.substring(0,3) == "131")
				{
					decimalUnit = 10;
				}
				else{
					decimalUnit = 100;
				}
				if(num+decimalUnit <= mosttake){
					num=num+decimalUnit;
				}
			}	
			$(_pageId+" #num").attr("value",num);
			$(_pageId+" #num_keyboard").html("<em>"+num+"</em>");
			e.stopPropagation();
		},"touchstart");
	
		//减少数量
		stock_common.bindEvent($(_pageId+" #num_less"),function(e){
			var num = $(_pageId+" #num").attr("value");
			if(!num||num=="")
			{
				return false;
			}
			num = Number(num);
			if(num > 0){
				var decimalUnit = 100;
				var stock_val = $(_pageId+" #stockCode em").text();
				if(stock_val.substring(0,3) == "204")
				{
					decimalUnit=1000;
				}
				else if(bond_type == true || stock_val.substring(0,3) == "131")
				{
					decimalUnit = 10;
				}
				else{
					decimalUnit = 100;
				}
				num = num-decimalUnit;
			}
			num = num <= 0 ? 0 : num;
			$(_pageId+" #num").attr("value",num);
			$(_pageId+" #num_keyboard").html("<em>"+num+"</em>");
			e.stopPropagation();
		},"touchstart");
		
		//下单
		stock_common.bindEvent($(_pageId+" #submitOrder"),function(e){
			$(_pageId+" .input_custom").removeClass("active");
			$(_pageId+" .sel_list").hide();
			keyTelPanel.closeKeyPanel();
			keyPaneStock.closeKeyPanel();
			vailSubmitOrder();
			e.stopPropagation();
		});
		stock_common.bindEvent($(_pageId),function(e){
			$(_pageId+" .input_custom").removeClass("active");
			$(_pageId+" .sel_list").hide();
			keyTelPanel.closeKeyPanel();
			keyPaneStock.closeKeyPanel();
			e.stopPropagation();
		});
		
	}
	/**
	 * 重置表单
	 * */
	function resettingStock()
	{
		$(_pageId+" .input_custom").removeClass("active");
		$(_pageId+" #stockName").attr("value","");
		$(_pageId+" #numMax").val("");
		$(_pageId+" #num").attr("value","");
		_exchange_type = null;
		$(_pageId+" #num_keyboard").find("em").html("");
		$(_pageId+" .stock_option ul li").find("span:gt(0)").text("--").css("color","black");
	}
	function bindPageEvent(){
		
	}
	/**
	 * 销毁
	 * */
	function destroy(){
		$(_pageId+" #stockCode").html('<em></em>');
		//关闭前面页面打开的键盘
		keyTelPanel.closeKeyPanel();
		keyPaneStock.closeKeyPanel();
		resettingStock();
		if (timer != null ) {
            window.clearInterval(timer);
        }
        timer = null;
		stock_list = null;
	}
	
	var securitiesUnlock = {
		"init" : init,
		"bindPageEvent" : bindPageEvent,
		"destroy" : destroy
	};
	
	module.exports = securitiesUnlock;
});