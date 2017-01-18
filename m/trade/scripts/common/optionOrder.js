/**
 * 交易下单
 */
define('trade/scripts/common/optionOrder.js', function(require, exports, module) {
	var common = require("common");
	var commonFunc = require("commonFunc");
	var gconfig = $.config;
	var global = gconfig.global;
	require("validatorUtils");
	var validatorUtil = $.validatorUtils;
	var service_option=require("service_option");
	var service_hq = require("service_hq");
	var keyboard = require("keyboard");
    var userInfo = null;  // 账号信息
    var stock_info = null;
    var stock_html = null;
    var fifthOrder_timer = null;//五档行情定时器
    var position_timer = null;
    var _pageId = null;
    var _market = null;
    var _orderType = null;
    var market_html_data = {
		"SH" : "<li id=\"3\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价IOC</a></li>" +
		       "<li id=\"4\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价FOK</a></li>" +
		       "<li id=\"5\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价剩转限价GFD</a></li>",
		"SZ" : "<li id=\"6\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价最优五档即时成交剩余撤销</a></li>" +
		       "<li id=\"7\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价全额成交或撤销</a></li>" +
		       "<li id=\"8\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价本方最优价格</a></li>" +
		       "<li id=\"9\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价对手方最优价格</a></li>" +
		       "<li id=\"10\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">市价即时成交剩余撤销</a></li>"
    };//市价委托的数据
	//委託的信息
	var orderTypeInfo = {
		"1":{
			"name":"买入开仓",
			"entrust_bs":"0",
			"entrust_oc":"0",
			"covered_flag":"0",
		},
		"2":{
			"name":"卖出开仓",
			"entrust_bs":"1",
			"entrust_oc":"0",
			"covered_flag":"0",
		},
		"3":{
			"name":"买入平仓",
			"entrust_bs":"0",
			"entrust_oc":"1",
			"covered_flag":"0",
		},
		"4":{
			"name":"卖出平仓",
			"entrust_bs":"1",
			"entrust_oc":"1",
			"covered_flag":"0",
		},
		"5":{
			"name":"备兑开仓",
			"entrust_bs":"1",
			"entrust_oc":"0",
			"covered_flag":"1",
		},
		"6":{
			"name":"备兑平仓",
			"entrust_bs":"0",
			"entrust_oc":"1",
			"covered_flag":"1",
		},
		"7":{
			"name":"行权",
			"entrust_bs":"1",
			"entrust_oc":"2",
			"covered_flag":"0",
		},
	};
    //0：深A，1：深B，2：沪A，3：沪B，4：三板，9：特转A，A：特转B，F1：郑州交易所，F2：大连交易所，F3：上海交易所，F4：金融交易所，G：港股
    var _exchange = {
			"0":"0", "2":"0", "3":"0", "4":"0", "5":"0", "6":"0", "7":"0", "8":"0",
			"1":"1",
			"9":"2", "11":"2", "12":"2", "13":"2", "14":"2", "15":"2", "16":"2",
			"10":"3",
			"17":"4",
			"18":"0", "19":"0", "21":"0", "22":"0", "23":"0", "24":"0", "64":"0",
			"20":"2", "25":"2", "26":"2", "27":"2", "30":"2", "65":"2", "66":"2"
		};
	var _stockCode = null;
	var _callback = true;
	var _fifthCallback = true;
    
	/**
	 * 设置股票对象是信息参数
	 */
	function ioitStock(){
		var stockInfo = {
			"stockCode" : "", // 股票代码
			"stockName" : "", // 股票名称
			"optionCode": "",//期权合约代码
			"optionName": "",//期权合约名称
			"stockPrice" : "",// 股票价格
			"stockNum" : "",
			"exerciseMonth" : "",// 到期月份
			"exercisePrice" : "",// 行权价格
			"upStop" : 0, //涨停价
			"downStop" : 0,//跌停价
			"stockMaxAmount" : 0,//股票最大数
			"price_step" : 0.0001, // 步长
			"price_digit" : 4, // 小数点位数
			"lot_size" : 1, //每手数量
			"stock_type" : "",//股票类型
			"stock_market" : "",//市场代码
			"gear_one" : false,//是否启动五档
			"exchange_type" : "",//交易市场（交易后台）
			"stock_account" : "",// 股东账号 
			// "market_price" : false, // 是否市价委托
		};
		return stockInfo;
	}
	
	function initHtml(){
		stock_html = {
			"stockCode" : $(_pageId + " #stockCode"), // 股票
			"stockName" : $(_pageId + " #stockCode").next("span"), // 股票名称
			"optionCode": $(_pageId + " #optionCode"),//期权合约代码
			"optionName": $(_pageId + " #optionName"),//期权合约名称
			"stockPrice" : $(_pageId + " #stockPrice"),// 股票价格
			"stockNum" : $(_pageId + " #stockNum"), // 股票数量
			"exerciseMonth" : $(_pageId + ' #month .select_box p'),// 到期月份
			"exercisePrice" : $(_pageId + ' #exercise .select_box p'),// 行权价格
			"stockMaxAmount": $(_pageId + ".trade_form p.limit strong"),//股票最大数
			"buyGear" : $(_pageId + " .five_box ul").eq(1).find("li"), // 买五档
			"sellGear" : $(_pageId + " .five_box ul").eq(0).find("li"), // 卖五档
			"total" : $(_pageId + ".ce_btn #total"),// 计算金额显示
			"market_ul" : $(_pageId + "#market_list ul"),
			"market_div" : $(_pageId+" #quote .select_box p"), // 委托方式
			"market_p" : $(_pageId + " .input_select .quote_tet"),
			"stockList" : $(_pageId + "#stock_list")// 股票下拉列表
		}
	}
	

    /**
     * 数据初始化
     */
	function dataInit(pageId,orderType,market){
		_pageId = pageId
		if(keyboard){
			keyboard.keyInit();
		}
		userInfo = common.getCurUserInfo();
		_orderType = orderType;
		stock_info = ioitStock();
		initHtml();
		_market = market;
		_stockCode = null;
		commonFunc.initCheckTradeTimer();
		var stockCode = $.getPageParam("code");
		// 查询个股行情
		if(stockCode){
			$(_pageId + " #stockCode").val(stockCode);
			getStockList(stockCode);
		}
		if(_market)marketPrice();
		queryHolding();
    }
	
	function isBuy(){
		if(_orderType == "1" || _orderType == "3" || _orderType == "6"){
			return true;
		}
		else{
			return false;
		}
	}
	
	/**
	 * 获取股票信息
	 * @param {Object} param 对应id名的值
	 * @param {Object} newest 是否不同步
	 */
	function getStockInfo(param, newest){
		if(stock_html){
			var data = stock_html[param].quzhi();
	//		var data = stock_html[param].val() || stock_html[param].text();
			if(newest && stock_info){
				if(!data || data == "--"){
					stock_info[param] = 0;
				}
				else
				{
					stock_info[param] = data;
				}
			}
			return data;
		}
		else{
			return '';
		}
	}
	
	/**
	 * 设置股票信息的值 可以为对象
	 * @param {Object} key 输入字符串支持单个，输入对象支持全部
	 * @param {Object} value 只支持单个字符串的值
	 * @param {Object} newest 是否改变对象的值 默认是改变，true是不改变
	 */
	function setStockInfo(key, value, newest){
		if(stock_html){
			stock_html[key].quzhi(value);
			if(newest && stock_info){
				if(value == "--"){
					value = 0;
				}
				stock_info[key] = value;
			}
		}
	}
	
	
	/**
	 * 市价委托
	 */
	function marketPrice(market){
		var input_value = $(_pageId + ".input_select .input_value");
		var market_list = $(_pageId + "#market_list");
		var market_length = 2;
		if(market){
			market_length = market_html_data[market].split("</li>").length + 1;
		}
		var selectHeight = 0.44*market_length;
		if(market_length >= 6){
			selectHeight = 6 * 0.44;
		}
		var listHtml = "<ul style=\"text-align: right;display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
		listHtml += "<li id=\"1\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">限价GFD</a></li>";
		listHtml += "<li id=\"2\"><a style=\"white-space: nowrap;padding-left: 0;padding-right: 0.20rem;\" href=\"javascript:void(0);\">限价FOK</a></li>";
		listHtml += market_html_data[market] || "";
		listHtml+="</ul>";
		market_list.html(listHtml).hide();
		// 返回按钮
		$.bindEvent($(_pageId + " #market_list li"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			if($(this).attr("id") == "1" || $(this).attr("id") == "2")
			{
				stock_html.market_div.text($(this).find("a").text());
				stock_html.market_div.attr("value",$(this).attr("id"));
				input_value.show();
				stock_html.market_p.hide();
				stock_info.market_price = false;
				stock_html.total.show();
				var stockPrice = getStockInfo("stockPrice");
				isQueryMax(stockPrice);

			}
			else
			{
				stock_html.market_div.text("市价委托");
				stock_html.market_p.text($(this).find("a").text()).show();
				stock_html.market_div.attr("value",$(this).attr("id"));
				input_value.hide();
				stock_html.market_p.show();
				stock_info.market_price = true;
				stock_html.total.hide();
				isQueryMax(0.01);
			}
			$(_pageId + " #market_list").hide();
			e.stopPropagation();
		});
	}
	
	
	
	/**
	 * 
	 * @param {Object} stockPrice
	 */
	function isQueryMax(stockPrice){
		if((isBuy() || !stock_info.exchange_type) && stock_info.stockCode && stockPrice && stockPrice != "0"){
			queryMaxAmount(stock_info.stockCode,true);
		}
	}
	/**
	 * 事件绑定
	 */
	function elementBindEvent(){

		$.bindEvent($(_pageId + "#quote .select_box"), function(e){
			$(_pageId + " .select_list").not("#market_list").hide();
			$(_pageId + " #market_list").slideToggle();
			e.stopPropagation();
		});

		//关闭ios键盘
		$.bindEvent($(_pageId), function(e){
			if(e.target !== document.activeElement)
			{
				document.activeElement.blur();
			}
		}, "click");

		$.bindEvent($(_pageId+" .trade_form .input_code .input_text"), function(e){
			$(_pageId + " .select_list").hide();
			var click = e.type || "click";
			if(keyboard){
				$(_pageId + " div#stockCode").triggerFastClick();
			}
			else{
				$(_pageId + "#stockCode").triggerFastClick();
				$(_pageId + "#stockCode").focus();
			}
			e.stopPropagation();
		});

		if(!keyboard){
			$.bindEvent($(_pageId + "#stockCode"), function(e){
				$(_pageId + " .select_list").hide();
				e.stopPropagation();
			});
		}

		// 股票代码输入框监听
		$.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
			if(keyboard){
				keyboard.popUpKeyboard($(this),e);
			}
			else{
				var stockCode = $(this).val();
				stockCode = stockCode.replaceAll(/([^A-Za-z0-9])/g,"");
				stockCode = $.trim(stockCode);
				$(this).val(stockCode);
			}
			var stockCode = $(_pageId + "#stockCode").val();
			if(stockCode.length == 0){
				clearBuyMsg();
				$(_pageId + "#stockCode").addClass("C100");
			}
			else{
				$(_pageId + "#stockCode").removeClass("C100");
			}
			if(stockCode){
				if(stockCode != _stockCode){
					_stockCode = stockCode;
					clearBuyMsg();
					var vai0 = /^[A-Za-z]+$/;
					var vai1 = /^[\u4e00-\u9fa5]+$/;
					if(stockCode.length > 1 && (vai0.test(stockCode) || vai1.test(stockCode))){ // 当输入的长度大于1 并且为字母的时候
						getStockList(stockCode); // 查询股票列表
					}else if(stockCode.length > 3){ // 当输入的长度大于3的时候
						getStockList(stockCode); // 查询股票列表
					}
				}
			}
			e.stopPropagation();
		},"input");

		//数量输入
		$.bindEvent($(_pageId + "#stockNum"),function(e){
			if(keyboard){
				var key = "";
				if(!global.callNative){
					key = e.detail["keyDiv"] ? e.detail["keyDiv"].attr("key") : "";
				}
				else{
					key = $(this).attr("keyDiv");
				}
				if(key == "d4" || key == "-11"){
					var num = (stock_info.stockMaxAmount / stock_info.lot_size / 4).toFixed(0) * stock_info.lot_size;
					setStockInfo("stockNum",num);
				}
				else if(key == "d3" || key == "-12"){
					var num = (stock_info.stockMaxAmount / stock_info.lot_size / 3).toFixed(0) * stock_info.lot_size;
					setStockInfo("stockNum",num);
				}
				else if(key == "d2" || key == "-13"){
					var num = (stock_info.stockMaxAmount / stock_info.lot_size / 2).toFixed(0) * stock_info.lot_size;
					setStockInfo("stockNum",num);
				}
				else if(key == "d1" || key == "-14"){
					var num = stock_info.stockMaxAmount;
					setStockInfo("stockNum",num);
				}
				else{
					keyboard.popUpKeyboard($(this),e);
				}
			}
			var stockNum = $(_pageId + "#stockNum").val();
			var stockPrice = getStockInfo("stockPrice");
			totalValue(stockPrice,stockNum);
			e.stopPropagation();
		},"input");

		// 价格输入框
		$.bindEvent($(_pageId + "#stockPrice"), function(e){
			if(keyboard){
				keyboard.popUpKeyboard($(this),e);
			}
			limitingDigit($(this));
			e.stopPropagation();
		},"input");

		// 价格输入框
		$.bindEvent($(_pageId + "#stockPrice"), function(e){
			var stockNum = getStockInfo("stockNum");
			var stockPrice = $(_pageId + "#stockPrice").val();
			totalValue(stockPrice,stockNum);
			isQueryMax(stockPrice);
			e.stopPropagation();
		},"blur");
		// 增加价格
		$.bindEvent($(_pageId + ".trade_main .input_select .add"),function(e){
			$(_pageId + " .select_list").hide();
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			if(stock_info.stockCode){
				var stockNum = getStockInfo("stockNum");
				var stockPrice = getStockInfo("stockPrice");
				if(!stockPrice || !validatorUtil.isNumberFloat(stockPrice)){
					setStockInfo("stockPrice",0);
					return false;
				}
				stockPrice = Number(stockPrice);
				if(stockPrice >= 0 && stockPrice < 999999999){
					stockPrice = (parseFloat(stockPrice)+parseFloat(stock_info.price_step)).toFixed(stock_info.price_digit);
					setStockInfo("stockPrice",stockPrice);
					totalValue(stockPrice,stockNum);
					isQueryMax(stockPrice);
				}
			}else{
				$.alert("请先输入股票代码");
			}
			e.stopPropagation();
		},"touchstart");
		// 减少价格
		$.bindEvent($(_pageId + ".trade_main .input_select .less"),function(e){
			$(_pageId + " .select_list").hide();
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			if(stock_info.stockCode){
				var stockNum = getStockInfo("stockNum");
				var stockPrice = getStockInfo("stockPrice");
				if(!stockPrice || !validatorUtil.isNumberFloat(stockPrice)){
					setStockInfo("stockPrice",0);
					return false;
				}
				var price_step = stock_info.price_step;
				stockPrice = Number(stockPrice);
				if(stockPrice - price_step >= 0){
					stockPrice = (parseFloat(stockPrice) - parseFloat(price_step)).toFixed(stock_info.price_digit);
					setStockInfo("stockPrice",stockPrice);
					totalValue(stockPrice,stockNum);
					isQueryMax(stockPrice);
				}
			}else{
				$.alert("请先输入股票代码");
			}
			e.stopPropagation();
		},"touchstart");
		// 五档买卖盘联动
		$.bindEvent($(_pageId + ".five_box ul li"),function(e){
			$(_pageId + " .select_list").hide();
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			var curPrice = $(this).find("span").text();
			if(curPrice && curPrice != "--"){
				$(this).siblings().removeClass("active");
				$(this).parent().siblings().find("li").removeClass("active");
				$(this).addClass("active");
				curPrice = Number(curPrice).toFixed(stock_info.price_digit);
				setStockInfo("stockPrice",curPrice);
				var stockNum = getStockInfo("stockNum");
				totalValue(curPrice,stockNum);
				isQueryMax(stockPrice);
			}
			e.stopPropagation();
		});

		$.bindEvent($(_pageId + " #month .select_box"),function(e){
			$(_pageId + " .select_list").not("#month_list").hide();
			$(_pageId + " #month_list").slideToggle("fast");
			e.stopPropagation();
		});
		$.bindEvent($(_pageId + " #exercise .select_box"),function(e){
			$(_pageId + " .select_list").not("#exercise_list").hide();
			$(_pageId + " #exercise_list").slideToggle("fast");
			e.stopPropagation();
		});

		// 下单
		$.bindEvent($(_pageId + "#submitOrder"),function(e){
			vailSubmitOrder();
		});

		// 点击其他位置去掉五档点击效果
		$.bindEvent($(_pageId),function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			$(_pageId + " .select_list").hide();
			$(_pageId + ".five_box ul li").removeClass("active");
			if(stock_html){
				stock_html.stockList.hide();
				stock_html.market_ul.hide();
			}
			e.stopPropagation();
		});

		$.bindEvent($(_pageId+" .toggle_nav li"), function(e){
			$(_pageId + " .select_list").hide();
			clearOption();
			$(this).addClass("active").siblings().removeClass("active");
			queryData(stock_info.stockCode);
			e.stopPropagation();
		});
		
	}
	
	/**
	 * 限制小数点位数
	 * @param {Object} price
	 */
	function limitingDigit($this){
		var price_digit = stock_info.price_digit;
		var price = getStockInfo("stockPrice");
		if(price && validatorUtil.isNumberFloat(price)){
			var cur_arr = (price+"").split(".");
			if(cur_arr.length == 2){
				if(cur_arr[1].length > price_digit){
					var price = cur_arr[0]+"."+cur_arr[1].substring(0,price_digit);
					setStockInfo("stockPrice",price)
				}
			}
		}
	}
	
	//行情列表接口有问题是，输入股票是6位数时直接调用交易接口
	function queryData(stockCode){
		var vai1 = /^[0-9]{6}$/;
		if(vai1.test(stockCode)){
			queryMaxAmount(stockCode);
		}
	}
	
	//对行情接口返回数据进行处理
	function ListData(data){
		var price = data[2] ? data[2]:data[6];
		var stockVal = data[1]; //股票代码
		var stkType = data[10];

		$(_pageId + " #stockCode").removeClass("C100");
		setStockInfo("stockCode",stockVal,true);
		_stockCode = stockVal;
		setStockInfo("stockName",data[0],true); // 股票现价

		stock_info.stock_market = data[9];
		stock_info.stock_type = stkType;

		//股票联动,查询股票信息，最大可买
		queryMaxAmount(stockVal);
	}
	
	/**
	 * 通过输入的字符查询出对应的股票列表
	 * @param {Object} stockCode 输入的字符
	 */
	function getStockList(stockCode){
		if(stockCode != ""){
			var type = "";
			if(global.stockType && global.stockType instanceof Array && global.stockType.length != 0){
				type = global.stockType.join(":");
			}
			var stockStrParam = {
				"q" : stockCode,
				"type" : type
			};
			stock_html.stockList.html("");
			var vai1 = /^[0-9]{6}$/;
			if(vai1.test(stockCode)){
				$.showPreloader("请等待...");
			}
			service_hq.getStockList(stockStrParam,function(data){
					getStockListCallBack(data,stockCode);
				},
				{"isLastReq":false,"isShowWait":false,
					"timeOutFunc":function(){
						queryData(stockCode);
					},"errorFunc":function(){
						queryData(stockCode);
				}});
		}
	}
	
	function getStockListCallBack(data,stockCode){
		var StockList = {};
		var vai1 = /^[0-9]{6}$/;
		stock_html.stockList.html("");
		if(data.errorNo == 0){
			var results = data.results;
			// 显示股票列表
			if(results && results.length > 0){
				if(results.length == 1 && vai1.test(stockCode)){
					var market = results[0][9];
					var stockCode = results[0][1];
					ListData(results[0]);
					stock_html.stockList.html("");
				}else{
					var selectHeight = 0.44*results.length;
					if(results.length >= 6){
						selectHeight = 6 * 0.44;
					}
					var listHtml = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
					for(var i = 0;i < results.length; i++) {
						StockList[(results[i][9]+":"+results[i][1])] = results[i];
						listHtml += "<li><a href=\"javascript:void(0);\" style=\"padding-left:0.20rem;\"><strong style=\"font-size:0.15rem\">"+results[i][1]+"</strong>"+results[i][0]+"</a>";
						listHtml +=	"<span style=\"display:none;\">"+results[i][9]+"</span></li>";
					};
					listHtml+="</ul>";
					stock_html.stockList.html(listHtml);
					$.bindEvent($(_pageId + ".trade_form .select_box ul li"),function(e){
						var market = $(this).find("span").text();
						var stockCode = $(this).find("strong").text();
						ListData(StockList[market+":"+stockCode]);
						stock_html.stockList.html("");
						StockList={};
						e.stopPropagation();
					});
				}
			}
			else{
				if(vai1.test(stockCode)){
					queryData(stockCode);
				}
			}
		}else{
			queryData(stockCode);
		}
	}

	//五档买卖盘
	function setFifthOrder(){
		var option_code = stock_info.optionCode;
		if(option_code){
			var fifthOrder = {
				"entrust_way":global.entrust_way,
				"branch_no":userInfo.branch_no,
				"exchange_type":stock_info.exchange_type,
				"option_code":option_code,
			};
			service_option.queryOptionsMarket(fifthOrder,callbackOptionsMarket,{"isShowWait":false,"errorFunc":function(){_fifthCallback = true;}});
		}
	}

	//回调五档买卖盘
	function callbackFifthOrder(data){
		_fifthCallback = true;
		if(data.errorNo == 0){
			var results = data.results;
			if(results && results.length>0){
				var yesProfit = results[0][26];
				var price_digit = stock_info.price_digit;
				if(stock_info.gear_one){
					var fifthOne = "";
					var presentPrice = results[0][30];
					if(isBuy()){
						fifthOne = results[0][10];
					}else{
						fifthOne = results[0][16];
					}
					if(presentPrice != 0 && (fifthOne == "0" || presentPrice == stock_info.upStop || presentPrice == stock_info.downStop)){
						fifthOne = presentPrice;
					}
					fifthOne = Number(fifthOne).toFixed(price_digit);
					var p_price = $.getPageParam("price");
					if(p_price && p_price != 0 && validatorUtil.isNumberFloat(p_price)){
						fifthOne  = Number(p_price).toFixed(price_digit);
					}
					setStockInfo("stockPrice",fifthOne); // 股票现价
					stock_info.gear_one = false;
				}
				//卖五档盘颜色集合
				for(var i = 0 ; i < 5 ; i ++){
					addColor(stock_html.buyGear.eq(i),results[0][16+i],yesProfit,results[0][21+i],price_digit);
					addColor(stock_html.sellGear.eq(i),results[0][6+i],yesProfit,results[0][11+i],price_digit);
				}
			}
		}else{
			$.alert(data.error_info);
		}
	}

	function callbackOptionsMarket(data){
		_fifthCallback = true;
		if(data.error_no == 0){
			var results = data.results;
			if(results && results.length>0){
				var yesProfit = Number(results[0].opt_open_price);
				var price_digit = stock_info.price_digit;
				if(stock_info.gear_one){
					var fifthOne = "";
					var presentPrice = results[0].opt_last_price;
					if(isBuy()){
						fifthOne = results[0].opt_sale_price1;
					}else{
						fifthOne = results[0].opt_buy_price1;
					}
					if(presentPrice != 0 && (fifthOne == "0" || presentPrice == results[0].opt_high_price || presentPrice == results[0].opt_low_price)){
						fifthOne = presentPrice;
					}
					fifthOne = Number(fifthOne).toFixed(price_digit);
					var p_price = $.getPageParam("price");
					if(p_price && p_price != 0 && validatorUtil.isNumberFloat(p_price)){
						fifthOne  = Number(p_price).toFixed(price_digit);
					}
					setStockInfo("stockPrice",fifthOne); // 股票现价
					stock_info.gear_one = false;
				}
				//卖五档盘颜色集合
				for(var i = 0 ; i < 5 ; i ++){

					addColor(stock_html.buyGear.eq(i),Number(results[0]["opt_buy_price"+(i+1)]),yesProfit,results[0]["buy_amount"+(i+1)],price_digit);

					addColor(stock_html.sellGear.eq(i),Number(results[0]["opt_sale_price"+(5-i)]),yesProfit,results[0]["sale_amount"+(5-i)],price_digit);
				}
			}
		}else{
			$.alert(data.error_info);
		}
	}
	
	
	//根据昨收改动价格颜色 , 没有价格的地方显示“--”
	function addColor(div,price,yesProfit,num,price_digit){
		var prices = div.find("span");
		var nums = div.find("em");
		yesProfit = yesProfit.toFixed(price_digit);
		price = price.toFixed(price_digit);
		if(price == 0){
			prices.text("--").attr("class","");
		}
		else if(price > yesProfit){
			prices.text(price).attr("class","ared");
		}
		else if(price < yesProfit)
		{
			prices.text(price).attr("class","agreen");
		}
		else
		{
			prices.text(price).attr("class","");
		}
		if(num == 0){
			nums.text("--");
		}
		else if(num >= 100000){
			nums.text((num/10000).toFixed(2) + "万");
		}
		else{
			nums.text(num);
		}
	}


	/**
	 * 查询个股期最大可买可卖相关信息
	 * @param stockCode
	 * @param isMax
	 */
	function queryMaxAmount(stockCode,isMax, option_code, exerciseMonth, exercisePrice){
		stock_html.stockList.html("");
		if(keyboard){
			keyboard.closeKeyPanel();
		}
		$.hidePreloader();
		var stock_price = getStockInfo("stockPrice");
		var entrust_bs = orderTypeInfo[_orderType].entrust_bs;
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid = userInfo.session_id;
		var stock_code = stockCode;
		var exercise_price = exercisePrice || stock_info.exercisePrice;
		var exercise_month = exerciseMonth || stock_info.exerciseMonth;
		var entrust_prop_opt = stock_html.market_div.attr("value");
		var entrust_price = stock_price;
		var category = $(_pageId+" .toggle_nav_lit li.active").index();
		var option_type = category < 0 ? "" : category;
		if(option_code && $.trim(option_code).length == 8){
			option_type = "";
		}
		var option_code = option_code || stock_info.optionCode;
		var entrust_oc = orderTypeInfo[_orderType].entrust_oc;//0：开仓  1：平仓  2：行权）
		var covered_flag = orderTypeInfo[_orderType].covered_flag;//备兑标志（见数据字典）
		var param = {
			"entrust_way": entrust_way,
			"branch_no": branch_no,
			"fund_account": fund_account,
			"cust_code": cust_code,
			"stock_code": stock_code,
			"option_code": option_code,
			"option_type": option_type,//0：认购 1：认沽
			"entrust_bs": entrust_bs,//0：买入，1：卖出
			"entrust_oc": entrust_oc,
			"entrust_prop_opt": entrust_prop_opt,
			"covered_flag": covered_flag,
			"exercise_price": exercise_price,
			"exercise_month": exercise_month,
			"entrust_price": entrust_price,
		};
		service_option.optionCodeInformation(param,function(data){
			if(isMax){
				queryMaxAmountCallBackMax(data);
			}else{
				queryMaxAmountCallBack(data);
			}
		},{"isLastReq":true,"isShowWait":!isMax});

	}
	function queryMaxAmountCallBack(data){
		$.hidePreloader();

		if(data.error_no == 0){
			if(!stock_info.stockCode && data.DataSet && data.DataSet.length > 0){
				$(_pageId + " #stockCode").removeClass("C100");
				setStockInfo("stockCode",data.DataSet[0].stock_code,true);
				setStockInfo("stockName",data.DataSet[0].stock_name,true);
			}
			if(data.DataSet1 && (!stock_info.exercisePrice))
			{
				var DataSet1 = data.DataSet1;
				if(DataSet1 && DataSet1.length > 0){
					setStockInfo("exercisePrice","请选择");
					$(_pageId+" #exercise_list").html("");
					var selectHeight = 0.44*DataSet1.length;
					if(DataSet1.length >= 6){
						selectHeight = 6 * 0.44;
					}
					var html = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
					for(var i = 0; i < DataSet1.length;i++){
						html += "<li id='" + Number(DataSet1[i].exercise_price).toFixed(4) + "'><a href=\"javascript:void(0);\" style=\"text-align: right;padding-right:0.20rem;\"><strong style=\"font-size:0.15rem\">"+ Number(DataSet1[i].exercise_price).toFixed(4) + "</strong></a></li>";
					}
					html += "</ul>";
					$(_pageId+" #exercise_list").html(html).hide();
				}
				$.bindEvent($(_pageId + " #exercise_list ul li"),function(e){
					clearOption();
					setStockInfo("exercisePrice",$(this).attr("id"),true);
					$(_pageId+" #exercise_list").hide();
					queryData(stock_info.stockCode);
					e.stopPropagation();
				});
			}
			if(data.DataSet2 && (!stock_info.exerciseMonth))
			{
				var DataSet2 = data.DataSet2;
				if(DataSet2 && DataSet2.length > 0){
					setStockInfo("exerciseMonth","请选择");
					$(_pageId+" #month_list").html("");
					var selectHeight = 0.44*DataSet2.length;
					if(DataSet2.length >= 6){
						selectHeight = 6 * 0.44;
					}
					var html = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
					for(var i = 0; i < DataSet2.length;i++){
						var date = DataSet2[i].exe_end_date;
						html += "<li id='" + date + "'><a href=\"javascript:void(0);\" style=\"text-align: right;padding-right:0.20rem;\"><strong style=\"font-size:0.15rem\">" + date.substring(0,4) +'年' + date.substring(4,6) + '月' + "</strong></a></li>";
					}
					html += "</ul>";
					$(_pageId+" #month_list").html(html).hide();
				}
				$.bindEvent($(_pageId + " #month_list ul li"),function(e){
					clearOption();
					setStockInfo("exerciseMonth",$(this).find("strong").text());
					stock_info.exerciseMonth = $(this).attr("id");
					$(_pageId+" #month_list").hide();
					queryData(stock_info.stockCode);
					e.stopPropagation();
				});
			}
			if(data.results && data.results.length > 0){
				var results = data.results;
				if(results.length == 1)
				{
					$(_pageId + " #stockCode").removeClass("C100");
					setStockInfo("stockCode",results[0].stock_code,true);
					setStockInfo("stockName",results[0].stock_name,true);
					var price_digit = (results[0].opt_price_step).indexOf("1") - 1;
					stock_info.price_digit = price_digit;
					stock_info.price_step = Number(results[0].opt_price_step);
					setStockInfo("stockPrice",Number(results[0].lastprice).toFixed(price_digit));
					setStockInfo("optionCode",results[0].option_code,true);
					setStockInfo("optionName",$.trim(results[0].option_name),true);
					var exchange_type = results[0].exchange_type;
					stock_info.exchange_type = exchange_type;
					stock_info.stock_account = results[0].stock_account;
					setStockInfo("stockMaxAmount",Number(results[0].enable_amount),true);
					if(exchange_type == "0" || exchange_type == "1" || exchange_type == "05")
					{
						marketPrice("SZ");
					}
					else if(exchange_type == "2" || exchange_type == "3" || exchange_type == "15")
					{
						marketPrice("SH");
					}
					var month = results[0].exercise_month.substring(0,6);
					setStockInfo("exerciseMonth",month.substring(0,4) +'年' + month.substring(4,6) + '月');
					stock_info.exerciseMonth = month;
					var exercise = Number(results[0].exercise_price).toFixed(4);
					setStockInfo("exercisePrice",exercise,true);
					if(results[0].optcontract_id.substring(6,7) == "P")
					{
						$(_pageId + " .toggle_nav_lit li:eq(1)").addClass("active").siblings().removeClass("active");
					}
					else
					{
						$(_pageId + " .toggle_nav_lit li:eq(0)").addClass("active").siblings().removeClass("active");
					}

					if (fifthOrder_timer != null ) {
						window.clearInterval(fifthOrder_timer);
					}
					stock_info.gear_one = true;
					setFifthOrder();

					_fifthCallback = false;
					fifthOrder_timer =  window.setInterval(function(){
						if(commonFunc.getTradingTime() && _callback){
							setFifthOrder();
							_fifthCallback = false;
						}
					}, (global.refreshTime || 5000));//定时刷新
					queryMaxAmount(stock_info.stockCode,true, " ", " ", " ");
				}
			}
			else if(data.DataSet && data.DataSet.length > 0)
			{
				var results = data.DataSet;
				if(results.length == 1){
					var price_digit = (results[0].opt_price_step).indexOf("1") - 1;
					stock_info.price_digit = price_digit;
					stock_info.price_step = Number(results[0].opt_price_step);
					setStockInfo("stockPrice",Number(results[0].lastprice).toFixed(price_digit));
					setStockInfo("optionCode",results[0].option_code,true);
					setStockInfo("optionName",$.trim(results[0].option_name),true);
					var exchange_type = results[0].exchange_type;
					stock_info.exchange_type = exchange_type;
					stock_info.stock_account = results[0].stock_account;
					setStockInfo("stockMaxAmount",Number(results[0].enable_amount),true);
					if(exchange_type == "0" || exchange_type == "1" || exchange_type == "05")
					{
						marketPrice("SZ");
					}
					else if(exchange_type == "2" || exchange_type == "3" || exchange_type == "15")
					{
						marketPrice("SH");
					}
					var month = results[0].exe_end_date.substring(0,6);
					setStockInfo("exerciseMonth",month.substring(0,4) +'年' + month.substring(4,6) + '月');
					stock_info.exerciseMonth = month;
					var exercise = Number(results[0].exercise_price).toFixed(4);
					setStockInfo("exercisePrice",exercise,true);
					if(results[0].optcontract_id.substring(6,7) == "P")
					{
						$(_pageId + " .toggle_nav_lit li:eq(1)").addClass("active").siblings().removeClass("active");
					}
					else
					{
						$(_pageId + " .toggle_nav_lit li:eq(0)").addClass("active").siblings().removeClass("active");
					}

					if (fifthOrder_timer != null ) {
						window.clearInterval(fifthOrder_timer);
					}
					stock_info.gear_one = true;
					setFifthOrder();

					_fifthCallback = false;
					fifthOrder_timer =  window.setInterval(function(){
						if(commonFunc.getTradingTime() && _callback){
							setFifthOrder();
							_fifthCallback = false;
						}
					}, (global.refreshTime || 5000));//定时刷新
					queryMaxAmount(stock_info.stockCode,true, " ", " ", " ");
				}
			}
			else{
				$.alert("没有对应的合约代码信息，请重新选择");
			}
		}else{
			$.alert(data.error_info);
		}
	}
	function queryMaxAmountCallBackMax(data){
		if(data.error_no == 0){
			if(data.DataSet1)
			{
				var DataSet1 = data.DataSet1;
				if(DataSet1 && DataSet1.length > 0){
					var selectHeight = 0.44*DataSet1.length;
					if(DataSet1.length >= 6){
						selectHeight = 6 * 0.44;
					}
					var html = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
					for(var i = 0; i < DataSet1.length;i++){
						html += "<li id='" + Number(DataSet1[i].exercise_price).toFixed(4) + "'><a href=\"javascript:void(0);\" style=\"text-align: right;padding-right:0.20rem;\"><strong style=\"font-size:0.15rem\">"+ Number(DataSet1[i].exercise_price).toFixed(4) + "</strong></a></li>";
					}
					html += "</ul>";
					$(_pageId+" #exercise_list").html(html).hide();
				}
				$.bindEvent($(_pageId + " #exercise_list ul li"),function(e){
					clearOption();
					setStockInfo("exercisePrice",$(this).attr("id"),true);
					$(_pageId+" #exercise_list").hide();
					queryData(stock_info.stockCode);
					e.stopPropagation();
				});
			}
			if(data.DataSet2)
			{
				var DataSet2 = data.DataSet2;
				if(DataSet2 && DataSet2.length > 0){
					var selectHeight = 0.44*DataSet2.length;
					if(DataSet2.length >= 6){
						selectHeight = 6 * 0.44;
					}
					var html = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
					for(var i = 0; i < DataSet2.length;i++){
						var date = DataSet2[i].exe_end_date;
						html += "<li id='" + date + "'><a href=\"javascript:void(0);\" style=\"text-align: right;padding-right:0.20rem;\"><strong style=\"font-size:0.15rem\">" + date.substring(0,4) +'年' + date.substring(4,6) + '月' + "</strong></a></li>";
					}
					html += "</ul>";
					$(_pageId+" #month_list").html(html).hide();
				}
				$.bindEvent($(_pageId + " #month_list ul li"),function(e){
					clearOption();
					setStockInfo("exerciseMonth",$(this).find("strong").text());
					stock_info.exerciseMonth = $(this).attr("id");
					$(_pageId+" #month_list").hide();
					queryData(stock_info.stockCode);
					e.stopPropagation();
				});
			}
			var results = data.results;
			if(results && results.length>0){
				var price_digit = (results[0].opt_price_step).indexOf("1") - 1;
				stock_info.price_digit = price_digit;
				setStockInfo("stockMaxAmount",Number(results[0].enable_amount),true);
				var exchange_type = results[0].exchange_type;
				stock_info.exchange_type = exchange_type;
				stock_info.stock_account = results[0].stock_account;
			}
		}
		else{
			$.alert(data.error_info);
		}
	}
	
	// 计算当前总值
	function totalValue(stockPrice,stockNum){
		stock_html.total.text("");
		if(validatorUtil.isNumberFloat(stockPrice) && validatorUtil.isNumeric(stockNum)){
			stock_html.total.text("(¥"+common.numToMoneyType(""+(stockPrice*stockNum).toFixed(2))+")");
		}
	}


	function vailSubmitOrder(){

		//验证股票代码输入是否正确
		var stockCode = stock_info.stockCode;
		if(stockCode.length == 0){
			$.alert("请输入股票代码");
			return false;
		}
		var vai1 = /^[0-9]{6}$/;
		if(!vai1.test(stockCode)){
			$.alert("股票代码输入错误");
			return false;
		}
		//验证股票价格输入是否正确
		var stockPrice = getStockInfo("stockPrice");
		if($.trim(stockPrice).length<=0){
			$.alert("请输入委托价格");
			return false;
		}else if(!validatorUtil.isNumberFloat(stockPrice)){
			$.alert("请正确输入价格");
			return false;
		}
		var stockMaxAmount = stock_info.stockMaxAmount+"";
		//验证买入数量
		var stockNum = getStockInfo("stockNum");
		if($.trim(stockNum).length<=0){
			$.alert("请输入委托数量");
			return false;
		}else if(!validatorUtil.isNumberFloat(stockNum)){
			$.alert("请正确输入数量");
			return false;
		}else if(parseFloat(stockNum)<=0){
			$.alert("数量必须大于0");
			return false;
		}else if(parseFloat(stockMaxAmount)<parseFloat(stockNum)){
			$.alert("最大可委托数量不足");
			return false;
		}
		//验证最大可买
		if($.trim(stockMaxAmount).length<=0||parseFloat(stockMaxAmount)<=0){
			$.alert("最大可委托数量为0");
			return false;
		}
		var entrust_bs = orderTypeInfo[_orderType].entrust_bs;
		var tipStrArray = [];
		var tipStr = "<div >";
		tipStrArray.push(["买卖方向", orderTypeInfo[_orderType].name]);
		tipStrArray.push(["合约代码", stock_info.optionCode]);
		tipStrArray.push(["合约名称", stock_info.optionName]);
		if(stock_info.market_price){
			tipStrArray.push(["委托价格", "市价委托"]);
		}else{
			tipStrArray.push(["委托价格", stockPrice]);
		}
		tipStrArray.push(["委托数量", stockNum]);
		tipStr += common.generatePrompt(tipStrArray);
		tipStr+="</div>";
		common.iConfirm("下单确定",tipStr,function success(){
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;	//分支机构
			var fund_account = userInfo.fund_account;	//资产账户
			var cust_code = userInfo.cust_code;	//客户代码
			var sessionid = userInfo.session_id;
			var stock_code = stockCode;
			var exercise_price = stock_info.exercisePrice;
			var exercise_month = stock_info.exerciseMonth;
			var entrust_prop_opt = stock_html.market_div.attr("value");
			var entrust_price = stockPrice;
			var category = $(_pageId+" .toggle_nav_lit li.active").index();
			var option_type = category < 0 ? "" : category;
			var option_code = stock_info.optionCode;
			var entrust_oc = orderTypeInfo[_orderType].entrust_oc;//0：开仓  1：平仓  2：行权）
			var covered_flag = orderTypeInfo[_orderType].covered_flag;//备兑标志（见数据字典）
			var exchange_type = stock_info.exchange_type;
			var stock_account = stock_info.stock_account;
			var entrust_amount = stockNum;
			var param = {
				"entrust_way": entrust_way,
				"branch_no": branch_no,
				"fund_account": fund_account,
				"cust_code": cust_code,
				"sessionid": sessionid,
				"exchange_type": exchange_type,
				"stock_account": stock_account,
				"option_type": option_type,//0：认购 1：认沽
				"option_code": option_code,
				"entrust_amount": entrust_amount,
				"entrust_price": entrust_price,
				"entrust_bs": entrust_bs,
				"entrust_oc": entrust_oc,
				"entrust_prop_opt": entrust_prop_opt,
				"covered_flag": covered_flag
			};
			service_option.placeAnOrder(param,getStockBuyCallBack);

		},function fail(){
		});
	}

	/**
	 * 委托下单返回
	 * */
	function getStockBuyCallBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results && results.length>0){
				var tipStr = "<span style='font-weight:bold;font-size: 18px;'>交易提示</span><br>交易委托已提交，合同编号："+results[0].batch_no;
				$.alert(tipStr);
				clearBuyMsg();
				setStockInfo("stockCode","");// 股票价格
				$(_pageId + "#stockCode").addClass("C100");
			}
		}else{
			$.alert(data.error_info);
			clearBuyMsg();
			setStockInfo("stockCode","");// 股票价格
			$(_pageId + " #stockCode").addClass("C100");
		}
		queryHolding();
	}
	
	function queryHolding(){
		queryHoldings();
		_callback = false;
		if(position_timer == null && global.positionRefreshTime){
			position_timer = window.setInterval(function(){
				if(commonFunc.getTradingTime() && _callback){
					queryHoldings();
					_callback = false;
				}
			}, global.positionRefreshTime);//定时刷新
		}
	}
	
	/**
	 * 查询持仓数据
	 */
	function queryHoldings(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var stock_account ="";
		var stock_code = "";
		var exchange_type = "";
		var param={
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"sessionid":sessionid,
			"stock_account":stock_account,
			"stock_code":stock_code,
			"exchange_type":exchange_type,
		};
		service_option.queryPosition(param,queryHoldingCallback,{"isLastReq":false,"isShowWait":false,"isShowOverLay":false});
	}
	
	function queryHoldingCallback(data){
		_callback = true;
		var html = "";
		$(_pageId+".no_data").show();
		if (data && data != "undefined") {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					for (var i=0;i<results.length;i++){
						html += queryHoldingHTML_stock(results[i],i);
					}
					$(_pageId+".fund_table div.stock_opt_list").append(html);
					$(_pageId+ ".no_data").hide();

					//卖出事件
					$.bindEvent($(_pageId+" .stock_opt_list .part"), function(e){
						clearBuyMsg();// 清楚数据
						var stockCode = $(this).attr("id");
						$(_pageId + " #stockCode").removeClass("C100");
						var option_code = $(this).find("small").text();
						$(_pageId + "#stockCode").quzhi(stockCode);
						_stockCode = stockCode;
						queryMaxAmount(stockCode,false,option_code);
						$(_pageId + " .main").scrollTop(0);
						e.stopPropagation();
					});
				}
			}else{
				$.alert(data.error_info);
			}
		}
	}
	/**
	 * 证券持仓HTML生成
	 */
	function queryHoldingHTML_stock(element){
		var price_digit = 4;
		var eleHtml = "";
		var css = "";
		var float_yk = Number(element.income_balance);//浮动盈亏
		if(float_yk>0){
			css = "ared";
		}else if(float_yk<0){
			css = "agreen";
		}
		float_yk = float_yk.toFixed(price_digit);
		eleHtml+='<div class="part" id="'+element.stock_code +'" opthold_type="'+element.opthold_type+'">';
		eleHtml+='<div class="title"><span class="stat">平仓</span>';
		eleHtml+='<h5>'+element.option_name+'</h5> <small>'+element.option_code+'</small></div>';
		eleHtml+='<ul>';
		eleHtml+='<li><em>期权类型</em><span>'+element.option_type_name+'</span></li>';
		eleHtml+='<li><em>持仓类型</em><span>'+element.opthold_type_name+'</span></li>';
		eleHtml+='<li><em>成本价格</em><span>'+Number(element.cost_price).toFixed(price_digit)+'</span></li>';
		eleHtml+='<li><em>最新价格</em><span class="'+css+'">'+Number(element.last_price).toFixed(price_digit)+'</span></li>';
		eleHtml+='<li><em>持仓数量</em><span>'+element.hold_amount+'</span></li>';
		eleHtml+='<li><em>可用数量</em><span>'+element.enable_amount+'</span></li>';
		eleHtml+='<li><em>浮动盈亏</em><span class="'+css+'">'+float_yk+'</span></li>';
		eleHtml+='<li><em>最新市值</em><span class="'+css+'">'+Number(element.market_value).toFixed(price_digit)+'</span></li>';
		eleHtml+='</ul></div>';
		return eleHtml;
	}



	function clearOption(){
		setStockInfo("optionCode","",true);// 股票价格
		setStockInfo("optionName","",true); // 股票数量
		stock_info.stockMaxAmount = 0;
		if(stock_html){
			stock_html.stockMaxAmount.text("--");//股票最大数
		}
	}
	
	/**
	 * 清楚頁面上的數據
	 */
	function clearBuyMsg(){
		$.clearRequest();
		stock_info = ioitStock();
		if(stock_html){
			stock_html.stockName.html("<em class=\"placeholder stockCode\"></em>"); // 股票名称
			setStockInfo("stockPrice","");// 股票价格
			setStockInfo("stockNum",""); // 股票数量
			stock_html.stockMaxAmount.text("--");//股票最大数
			stock_html.total.text("");
			stock_html.buyGear.find("span").removeClass("agreen").removeClass("ared").text("--");
			stock_html.buyGear.find("em").text("--");
			stock_html.sellGear.find("span").removeClass("agreen").removeClass("ared").text("--");
			stock_html.sellGear.find("em").text("--");
			stock_html.stockList.html("");
			stock_html.market_ul.hide();
			setStockInfo("exercisePrice","请选择");
			$(_pageId+" #exercise_list").html("");
			setStockInfo("exerciseMonth","请选择");
			$(_pageId+" #month_list").html("");
			stock_html.market_div.attr("value","1");
			$(_pageId + ".input_select .input_value").show();
			stock_html.market_p.hide();
		}
		if (fifthOrder_timer != null ) {
			window.clearInterval(fifthOrder_timer);
		}
		_fifthCallback = true;
		clearOption();
		$(_pageId + ".five_box ul li").removeClass("active");
	}
	
	function dataDestroy(){
		$(_pageId + " #stockCode").val("");
		_stockCode = "";
		$(_pageId+".fund_table .ce_table").html("");
		clearBuyMsg();
		if (position_timer != null ) {
	        window.clearInterval(position_timer);
	    }
		position_timer = null;
		stock_info = null;
		stock_html = null;
		if(keyboard){
			keyboard.keyDestroy();
		}
	}
	
	var base = {
		"dataInit" : dataInit,
		"elementBindEvent": elementBindEvent,
		"dataDestroy": dataDestroy
	};
	module.exports = base;
});