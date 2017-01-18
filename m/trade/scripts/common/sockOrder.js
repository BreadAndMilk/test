/**
 * 交易下单
 */
define('trade/scripts/common/sockOrder.js', function(require, exports, module) {
	var common = require("common");
	var commonFunc = require("commonFunc");
	var gconfig = $.config;
	var global = gconfig.global;
		require("validatorUtils");
	var validatorUtil = $.validatorUtils;
	var service_stock = require("service_stock");
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
		"SH" : "<li id=\"64\"><a href=\"javascript:void(0);\">五档即成剩撤</a></li><li id=\"62\"><a href=\"javascript:void(0);\">五档即成转限价</a></li>",
		"SZ" : "<li id=\"70\"><a href=\"javascript:void(0);\">对方最优价格</a></li><li id=\"68\"><a href=\"javascript:void(0);\">本方最优价格</a></li><li id=\"4\"><a href=\"javascript:void(0);\">即时成交剩余撤销</a></li><li id=\"64\"><a href=\"javascript:void(0);\">五档即成剩撤</a></li><li id=\"66\"><a href=\"javascript:void(0);\">全额成交或撤销</a></li>"	
    };//市价委托的数据
	var orderName = { // 委托名称
		"1":"委托买入",
		"2":"委托卖出"
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
	    	"stockPrice" : "",// 股票价格
	    	"stockNum" : "",
	    	"upStop" : 0, //涨停价
	    	"downStop" : 0,//跌停价
	    	"stockMaxAmount" : 0,//股票最大数
	    	"price_step" : 0.01, // 步长
			"price_digit" : 3, // 小数点位数
			"lot_size" : 100, //每手数量
			"stock_type" : "",//股票类型
			"stock_market" : "",//市场代码
			"gear_one" : false,//是否启动五档
			"exchange_type" : "",//交易市场（交易后台）
			"stock_account" : "",// 股东账号 
			"market_price" : false, // 是否市价委托
			"delist_info" : "",// 退市提示语
			"delist_flag" : "",//是否提示标示
	    };
	    return stockInfo;
	}
	
	
	function initHtml(){
		stock_html = {
	    	"stockCode" : $(_pageId + " #stockCode"), // 股票
	    	"stockName" : $(_pageId + " #stockCode").next("span"), // 股票名称
	    	"stockPrice" : $(_pageId + " #stockPrice"),// 股票价格
	    	"stockNum" : $(_pageId + " #stockNum"), // 股票数量
	    	"upStop" : $(_pageId + " #up_stop"), //涨停价
	    	"downStop" : $(_pageId + " #down_stop"),//跌停价
	    	"stockMaxAmount": $(_pageId + ".trade_form p.limit strong"),//股票最大数
	    	"buyGear" : $(_pageId + " .five_box ul").eq(1).find("li"), // 买五档
		   	"sellGear" : $(_pageId + " .five_box ul").eq(0).find("li"), // 卖五档
		   	"total" : $(_pageId + ".ce_btn #total"),// 计算金额显示
			"market_ul" : $(_pageId + "#market_list ul"),
			"market_div" : $(_pageId+" .trade_form .value_btn"), // 委托方式
			"market_p" : $(_pageId + "#market_list p"),
			"stockList" : $(_pageId + "#stock_list"),// 股票下拉列表
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
			if(keyboard && ("stockCode" == key || "stockPrice" == key || "stockNum" == key)){
				stock_html[key].attr("value",value);
				stock_html[key].children("em").text(value);
				stock_html[key].find("div.key_text").text(value);
				if(value.length == 0){
					stock_html[key].find("div.key_place").show();
				}else{
					stock_html[key].find("div.key_place").hide();
				}
			}
	//		stock_html[key].val(value);
	//		stock_html[key].text(value);
			if(newest && stock_info){
				if(!value || value == "--"){
					value = 0;
				}
				stock_info[key] = value;
			}
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
				}else{
					stock_info[param] = data;
				}
			}
			return data;
		}else{
			return '';
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
		
		//检测是否是交易时间，并启动交易时间检测器
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
	
	//判断是否是普通买入
	function isBuy(){
		// 1 ，买入  2，卖出  3，融资买入 4，融券卖出  5，普通买入 6，普通卖出 7，买券还券 8，卖券还款
		if(_orderType == "1"){
			return true;
		}
		else{
			return false;
		}
	}
	
	/**
	 * 市价委托
	 */
	function marketPrice(){
		//限价委托DOM
		var input_value = $(_pageId + ".input_select .input_value");
		//市价委托DOM
		var market_list = $(_pageId + "#market_list");
		
		//限价委托和市价委托切换
		$.bindEvent($(_pageId + ".trade_form .value_btn a"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			if($(this).attr("class") != "current"){
				$(this).addClass("current").siblings().removeClass("current");
				if($(this).text() == "限价委托"){
					input_value.show();
					market_list.hide();
					stock_info.market_price = false;   //是否市价委托
					stock_html.total.show();   //显示买入卖出后面的总的价格
					var stockPrice = getStockInfo("stockPrice");   //从页面股票对象中取股票价格
					isQueryMax(stockPrice);
				}else{
					input_value.hide();
					market_list.show();
					stock_info.market_price = true;   //是否市价委托
					var id = stock_html.market_p.attr("id");
					stock_html.market_div.attr("value",id);
					stock_html.total.hide();
					if(!id){
						stock_html.market_p.html("<em style='color: #ccc;'>请选择委托方式</em>");
						stock_html.market_ul.show();
					}else{
						isQueryMax(0.01);
					}
				}
			}
			e.stopPropagation();
		});
		
		$.bindEvent($(_pageId + "#market_list"), function(e){
			$(this).find("ul").slideToggle();
			e.stopPropagation();
		});
	}
	
	/**
	 * 
	 * @param {Object} stockPrice
	 */
	function isQueryMax(stockPrice){
		//判断是否是普通买入以及需要的各种参数是否为空
		if((isBuy() || !stock_info.exchange_type) && stock_info.stockCode && stockPrice && stockPrice != "0"){
			queryMaxAmount(stock_info.stockCode,true);
		}
	}
	
	
	/**
	 * 委托下单页面事件绑定
	 */
	function elementBindEvent(){
		//关闭ios键盘
		$.bindEvent($(_pageId), function(e){
			if(e.target !== document.activeElement){
				document.activeElement.blur();
			}
		}, "click");
		
		$.bindEvent($(_pageId+" .trade_form .input_code .input_text"), function(e){
			var click = e.type || "click";
			if(keyboard){
				$(_pageId + " div#stockCode").triggerFastClick();
			}else{
				$(_pageId + "#stockCode").triggerFastClick();
				$(_pageId + "#stockCode").focus();
			}
			e.stopPropagation();
		});
		
		if(!keyboard){
			$.bindEvent($(_pageId + "#stockCode"), function(e){
				stock_html.stockList.show();
				if(global.callNative){ // 同步原生的自选股
					var data = $.callMessage({"moduleName":"self-stock","funcNo": "60100", "searchKey":""});
					var source = "1"; // 渠道来源 0表示搜索码表 1 表示同步的自选股列表
					getStockListCallBack(data,"",source); // 显示股票列表
				}
				e.stopPropagation();
			});
		}
		
		// 股票代码输入框监听
		$.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
			if(keyboard){
				keyboard.popUpKeyboard($(this),e);
			}
			var stockCode = $(_pageId + "#stockCode").val();
			if(stockCode != _stockCode){
				_stockCode = stockCode;
				clearBuyMsg();
				var vai0 = /^[A-Za-z]+$/;
				var vai1 = /^[\u4e00-\u9fa5]+$/;
				if(stockCode.length > 1 && (vai0.test(stockCode) || vai1.test(stockCode))){ // 当输入的长度大于1 并且为字母的时候
					getStockList(stockCode); // 查询股票列表
				}else if(stockCode.length>3){ // 当输入的长度大于3的时候
					getStockList(stockCode); // 查询股票列表
				}
			}
			e.stopPropagation();
		},"input");
		
		//数量输入
		$.bindEvent($(_pageId + "#stockNum"),function(e){
			if(keyboard){
				var key = e.detail["keyDiv"] ? e.detail["keyDiv"].attr("key") : "";
				if(key == "d4"){
					var num = (stock_info.stockMaxAmount / stock_info.lot_size / 4).toFixed(0) * stock_info.lot_size;
					setStockInfo("stockNum",num);
				}
				else if(key == "d3"){
					var num = (stock_info.stockMaxAmount / stock_info.lot_size / 3).toFixed(0) * stock_info.lot_size;
					setStockInfo("stockNum",num);
				}
				else if(key == "d2"){
					var num = (stock_info.stockMaxAmount / stock_info.lot_size / 2).toFixed(0) * stock_info.lot_size;
					setStockInfo("stockNum",num);
				}
				else if(key == "d1"){
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
			limitingDigit($(this));   //限制小数点位数
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
		
		// 下单
		$.bindEvent($(_pageId + "#submitOrder"),function(e){
			vailSubmitOrder();
		});
		
		// 点击其他位置去掉五档点击效果
		$.bindEvent($(_pageId),function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			$(_pageId + ".five_box ul li").removeClass("active");
			if(stock_html){
				stock_html.stockList.hide();
				stock_html.market_ul.hide();
			}
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
	
	//行情列表接口有问题时，输入股票是6位数时直接调用交易接口
	function queryData(stockCode){
		var vai1 = /^[0-9]{6}$/;
		if(vai1.test(stockCode)){
			queryMaxAmount(stockCode);
		}
	}
	
	
	/*******************************************获取股票列表及详情START*******************************************/
	//对行情接口返回数据进行处理
	function ListData(data){
		var price = data[2] ? data[2]:data[6];
		var stockVal = data[1]; //股票代码
		var stkType = data[10];
		var price_digit = null;
		var price_step = null;
		var lotsOf = null;
		 /*--------- 2 ，设置证券价格加减步长 ------------*/
//		var price_step_const = [10,12,13,4,6,19,20,3,11,16];  //0.001
//		var price_step_const = [1,3,4,5,6,10,11,12,13,14,16,19,20,21,22,23,24,30];//0.001
		var price_step_const = [0,1,2,7,9,14,15,17,18,25,26,27,66];//0.01
		if(global.typeDigit && global.typeDigit instanceof Array && global.typeDigit.length != 0){
			price_step_const = global.typeDigit;
		}
		var step_flag = $.inArray(stkType, price_step_const);
		// 判断是否为债券
		// 上海国债逆回购
		if(stockVal.substring(0,3) == "204"){
			price_digit = 3;
			price_step = 0.005;
			lotsOf = 1000;
		}
		// 否则浮动为0.01
		else if(step_flag != -1){
			price_digit = 2;
			price_step = 0.01;
			lotsOf = 100;
		}
		// 变动价格为0.001
		else{
			price_digit = 3;
			price_step = 0.001;
			lotsOf = 100;
		}
		var num_step_const = [6,14,21,22,23,24,25,26,27];//10张
		if($.inArray(stkType, num_step_const) != -1 || stockVal.substring(0,3) == "131"){
			lotsOf = 10;
		}
		setStockInfo("stockCode",stockVal,true);
		_stockCode = stockVal;
		setStockInfo("stockName",data[0],true); // 股票现价
		if(data[15] == "1"){
//			stock_info.stockCode = "";
			$.hidePreloader();
			$.alert("该股票已停牌");
//			return false;
		}
		var p_price = $.getPageParam("price");
		if(p_price && p_price != 0 && validatorUtil.isNumberFloat(p_price)){
			price  = Number(p_price);
		}
		setStockInfo("stockPrice",price.toFixed(price_digit)); // 股票现价
		setStockInfo("upStop",common.transferText(data[13],price_digit),true); // 股票现价
		setStockInfo("downStop",common.transferText(data[14],price_digit),true); // 股票现价
		stock_info.lot_size = lotsOf;
		stock_info.price_step = price_step;
		stock_info.price_digit = price_digit;
		stock_info.stock_market = data[9];
		stock_info.stock_type = stkType;
		
		var bondType = [6,14,21,22,23,24,25,26,27,30]; // 债券
		if($.inArray(stkType, bondType)!=-1){
			$(_pageId + " p.limit em").text("张");
			$(_pageId + " .input_num .input_text em").text("张");
		}
		else{
			$(_pageId + " p.limit em").text("股");
			$(_pageId + " .input_num .input_text em").text("股");
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
		
		if(_market){
			if(stock_info.stock_market == "SH" && market_html_data && market_html_data.SH){
				if(stock_html.market_ul.attr("category") != "SH"){
					stock_html.market_p.attr("id","").html("<em style='color: #ccc;'>请选择委托方式</em>");
				}
				stock_html.market_ul.html(market_html_data.SH).attr("category","SH");
			}
			else if(stock_info.stock_market == "SZ" && market_html_data && market_html_data.SZ)
			{
				if(stock_html.market_ul.attr("category") != "SZ"){
					stock_html.market_p.attr("id","").html("<em style='color: #ccc;'>请选择委托方式</em>");
				}
				stock_html.market_ul.html(market_html_data.SZ).attr("category","SZ");
			}
			$.bindEvent($(_pageId + "#market_list ul li"), function(e){
				$(this).parent("ul").prev("p").text($(this).text()).attr("id",$(this).attr("id"));
				stock_html.market_div.attr("value",$(this).attr("id"));
				stock_html.market_ul.hide();
				isQueryMax(0.01);
				e.stopPropagation();
			});
		}
		//股票联动,查询股票信息，最大可买
		queryMaxAmount(stockVal);
	}
	/**
	 * 通过输入的字符查询出对应的股票列表
	 * @param {Object} stockCode 输入的字符
	 */
	function getStockList(stockCode){
		if(stockCode != ""){
			if(global.callNative){   //根据配置项判断是否调用原生插件
				var data = $.callMessage({"moduleName":"self-stock","funcNo": "60101","num":10,"searchKey":stockCode});
				var source = "0"; // 渠道来源   0表示搜索码表 1 表示同步的自选股列表
				getStockListCallBack(data,stockCode,source); // 显示股票列表
			}else{
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
				},{
					"isLastReq":false,"isShowWait":false,
					"timeOutFunc":function(){
						queryData(stockCode);
					},"errorFunc":function(){
						queryData(stockCode);
					}
				}
				);
			}
		}
	}
	//查询股票列表回调
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
			}else{
				if(vai1.test(stockCode)){
					queryData(stockCode);
//					$.alert("没有查询到此股票信息");
//					$.hidePreloader();
				}
			}
		}else{
			queryData(stockCode);
		}
	}
	
		//五档买卖盘
	function setFifthOrder(){
		var market = stock_info.stock_market, stockCode = stock_info.stockCode;
		if(market && stockCode){
			var fifthOrder = {
				"stock_list" : market+":"+stockCode
			};
			service_hq.getStockFiveStep(fifthOrder,callbackFifthOrder,{"isShowWait":false,"errorFunc":function(){_fifthCallback = true;}});
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
	/*******************************************获取股票列表及详情END*******************************************/
	
	
	/**
	 * 查询买入可用资金最大可买可卖数量
	 **/
	function queryMaxAmount(stockCode,isMax){
		stock_html.stockList.html("");   //将股票的下拉列表清除
		if(keyboard){
			keyboard.closeKeyPanel();
		}
		$.hidePreloader();
		var stock_price = getStockInfo("stockPrice");   //股票价格
		var entrust_bs = "0";
		if(stock_info.market_price){
			if(stock_html.market_p.attr("id")){
				entrust_bs = stock_html.market_div.attr("value");
				stock_price = "0.01"
			}
			else{
				stock_html.market_ul.show();
			}
		}
		if(!isBuy()){
			entrust_bs = (Number(entrust_bs)+1) + "";
		}
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid = userInfo.session_id;
		var stock_code = stockCode;
		var entrust_price = stock_price;
		var stock_account = stock_info.stock_account;
		var exchange_type = _exchange[stock_info.stock_type+""];
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"entrust_bs":entrust_bs,
				"stock_code":stock_code,
				"entrust_price":entrust_price,
				"stock_account": stock_account,
	            "newstock_flag":"",
	            "exchange_type":exchange_type
			};
  	  	service_stock.queryStockMaxBuy(param,function(data){
	  	  	if(isMax){
		  	  	queryMaxAmountCallBackMax(data);
	  	  	}else{
	  	  		queryMaxAmountCallBack(data);
	  	  	}
	  	  },{"isLastReq":true,"isShowWait":false});
		
	}
	function queryMaxAmountCallBack(data){
		$.hidePreloader();
		if(data.error_no == 0){
			var results = data.results;
			if(results.length>0){
				var price_digit = stock_info.price_digit;
				setStockInfo("stockMaxAmount",Number(results[0].stock_max_amount),true);
				var exchange_type = results[0].exchange_type;
				stock_info.exchange_type = exchange_type;
				stock_info.stock_account = results[0].stock_account;
				var buy_unit = results[0].buy_unit ? Number(results[0].buy_unit) : 0;
				if(buy_unit != 0){
					stock_info.lot_size = buy_unit;
				}
				stock_info.delist_flag = results[0].delist_flag;
				stock_info.delist_info = results[0].delist_info;
				if(!stock_info.stockCode){
					setStockInfo("stockCode",results[0].stock_code,true);
					setStockInfo("stockName",results[0].stock_name,true);
					var p_price = $.getPageParam("price");
					if(p_price && p_price != 0 && validatorUtil.isNumberFloat(p_price)){
						results[0].price = p_price
					}
					setStockInfo("stockPrice",Number(results[0].price).toFixed(price_digit));
					if(exchange_type == 0 || exchange_type == 1)
					{
						stock_info.stock_market = "SZ";
					}
					else if(exchange_type == 2 || exchange_type == 3)
					{
						stock_info.stock_market = "SH";
					}
					if(results[0].up_limit != 0){
						setStockInfo("upStop",Number(results[0].up_limit).toFixed(price_digit),true);
					}
					if(results[0].down_limit != 0){
						setStockInfo("downStop",Number(results[0].down_limit).toFixed(price_digit),true);
					}
				}
				if(stock_info.stock_market == "SH" && market_html_data && market_html_data.SH){
					stock_html.market_ul.html(market_html_data.SH);
				}
				else if(stock_info.stock_market == "SZ" && market_html_data && market_html_data.SZ)
				{
					stock_html.market_ul.html(market_html_data.SZ);
				}
				$.bindEvent($(_pageId + "#market_list ul li"), function(e){
					$(this).parent("ul").prev("p").text($(this).text()).attr("id",$(this).attr("id"));
					stock_html.market_div.attr("value",$(this).attr("id"));
					stock_html.market_ul.hide();
					isQueryMax(0.01);
					e.stopPropagation();
				});
				var p_num = $.getPageParam("num");
				if(p_num && p_num != 0 && validatorUtil.isNumeric(p_num)){
					setStockInfo("stockNum",p_num,true);
				}
			}
		}else{
			$.alert(data.error_info);
		}
	}
	function queryMaxAmountCallBackMax(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results.length>0){
				var price_digit = stock_info.price_digit;
				setStockInfo("stockMaxAmount",Number(results[0].stock_max_amount),true);
				var exchange_type = results[0].exchange_type;
				stock_info.exchange_type = exchange_type;
				stock_info.stock_account = results[0].stock_account;
				var buy_unit = results[0].buy_unit ? Number(results[0].buy_unit) : 0;
				if(buy_unit != 0){
					stock_info.lot_size = buy_unit;
				}
				stock_info.delist_flag = results[0].delist_flag;
				stock_info.delist_info = results[0].delist_info;
			}
		}
		else{
			$.alert(data.error_info);
		}
	}
	
	// 计算当前总值
	function totalValue(stockPrice,stockNum){
		stock_html.total.text("");
//		if(validatorUtil.isNumberFloat(stockPrice) && validatorUtil.isNumeric(stockNum)){
//			stock_html.total.text("(¥"+common.numToMoneyType(""+(stockPrice*stockNum).toFixed(2))+")");
//		}
	}
	
	
	
	/*******************************************委托下单START*******************************************/
	/**
	 * 下单验证
	 * */
	function vailSubmitOrder(){
		var typeText = "买入";
		if(!isBuy()){
			typeText = "卖出";
		}
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
			$.alert("请输入"+typeText+"价格");
			return false;
		}else if(!validatorUtil.isNumberFloat(stockPrice)){
			$.alert("请正确输入价格");
			return false;
		}
		var stockMaxAmount = stock_info.stockMaxAmount+"";
		//验证买入数量
		var stockNum = getStockInfo("stockNum");
		if($.trim(stockNum).length<=0){
			$.alert("请输入"+typeText+"数量");
			return false;
		}else if(!validatorUtil.isNumberFloat(stockNum)){
			$.alert("请正确输入数量");
			return false;
		}else if(parseFloat(stockNum)<=0){
			$.alert("数量必须大于0");
			return false;
		}else if(parseFloat(stockMaxAmount)<parseFloat(stockNum)){
			$.alert("最大可"+typeText+"数量不足");
			return false;
		}
		//验证最大可买
		if($.trim(stockMaxAmount).length<=0||parseFloat(stockMaxAmount)<=0){
			$.alert("最大可"+typeText+"为0");
			return false;
		}
		var lots_of = stock_info.lot_size;
		if(isBuy()){
			if(stockNum % Number(lots_of) != 0){
				$.alert("买入数量应为" + lots_of + "的倍数");
				return false;
			}else if(stockNum > 1000000){
				$.alert("买入数量必须小于或等于100万股");
				return false;
			}
		}else{
			if(stockNum != stockMaxAmount && stockNum % Number(lots_of) != 0){
				$.alert("卖出数量应为" + lots_of + "的倍数");
				return false;
			}
		}
		var	up_stop = null;
		var	down_stop = null;
		var entrust_bs = "0";
		var tipStrArray = [];
		var tipStr = "<div >";
		tipStrArray.push([stock_info.stockName, stockCode]);
		tipStrArray.push(["买卖方向", orderName[_orderType]]);
		if(stock_info.market_price){
			if(!stock_html.market_p.attr("id")){
				$.alert("请选择市价委托方式",function(){
					stock_html.market_ul.show();
				});
				return false;
			}
			entrust_bs = stock_html.market_div.attr("value");
			stock_price = "0.01";
			tipStrArray.push(["委托价格", "市价委托"]);
		}else{
			up_stop = stock_info.upStop;
			down_stop = stock_info.downStop;
			tipStrArray.push(["委托价格", stockPrice]);
		}
		tipStrArray.push(["委托数量", stockNum]);
		tipStr += common.generatePrompt(tipStrArray);
//		if(up_stop && up_stop !="--" && up_stop != 0 && Number(stockPrice) > Number(up_stop)){
//			tipStr += "<div><span style=\"margin: 0 20px;color: #D93335;display: inline-block;line-height: 18px;\">委托价格超过涨停价，交易可能不会成功。</span><br><span>确定"+orderName[_orderType]+"该证券？</span></div>";
//		}else if(down_stop && down_stop != "--" && down_stop != 0 && Number(stockPrice) < Number(down_stop)){
//			tipStr += "<div><span style=\"margin: 0 20px;color: #D93335;display: inline-block;line-height: 18px;\">委托价格低于跌停价，交易可能不会成功。</span><br><span>确定"+orderName[_orderType]+"该证券？</span></div>";
//		}
		tipStr+="</div>";
		common.iConfirm("下单确定",tipStr,function success(){
		if(!isBuy()){
			entrust_bs = (Number(entrust_bs)+1) + "";
		}
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account;	//资产账户
		var branch_no = userInfo.branch_no;	//分支机构
		var sessionid = userInfo.session_id;
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var exchange_type = stock_info.exchange_type;
		var stock_account = stock_info.stock_account;
		var stock_code = stockCode;
		var entrust_price = stockPrice;
		var entrust_amount = stockNum;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"entrust_bs":entrust_bs,
				"exchange_type":exchange_type,
				"stock_account":stock_account,
				"stock_code":stock_code,
				"entrust_price":entrust_price,
				"entrust_amount":entrust_amount,
			};
			service_stock.getStockBuy(param,getStockBuyCallBack);
			
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
				var tipStr = "<span style='font-weight:bold;font-size: 18px;'>交易提示</span><br>交易委托已提交，委托编号："+results[0].entrust_no;
				$.alert(tipStr);
				clearBuyMsg();
				$(_pageId + "#stockCode").val("");
			}
		}else{
			$.alert(data.error_info);
			clearBuyMsg();
			$(_pageId + " #stockCode").val("");
		}
		queryHolding();
	}
	/*******************************************委托下单END*******************************************/
	
	
	/*******************************************证券持仓START*******************************************/
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
		service_stock.queryStockData(param,queryHoldingCallback,{"isLastReq":false,"isShowWait":false,"isShowOverLay":false});
	}
	function queryHoldingCallback(data){
		_callback = true;
		var html = "<div class='top'><p><span scope=\"col\">证券/市值</span></p><p><span scope=\"col\">盈亏</span></p><p><span scope=\"col\">持仓/可用</span></p><p><span scope=\"col\">成本/现价</span></p></div>";
		$(_pageId+".fund_table div.ce_table").html(html);
		$(_pageId+".no_data").show();
		if (data && data != "undefined") {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					for (var i=0;i<results.length;i++){ 
						html += queryHoldingHTML_stock(results[i],i);
					}
					$(_pageId+".fund_table div.ce_table").html(html);
					$(_pageId+ ".no_data").hide();
					//卖出事件
					$.bindEvent($(_pageId+".fund_table .ce_table dl"), function(e){
						clearBuyMsg();// 清楚数据
						var stockCode = $(this).attr("id");
						$(_pageId + "#stockCode").val(stockCode);
						_stockCode = stockCode;
						getStockList(stockCode);
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
		var price_digit = 3;
		var css = "";
		var float_yk = Number(element.float_yk);//浮动盈亏
		if(float_yk > 0){
			css = "ared";
		}else if(float_yk < 0){
			css = "agreen";
		}
		float_yk = float_yk.toFixed(2);
	   	var eleHtml = "";
        eleHtml+="<dl id="+element.stock_code +">";
        eleHtml+="<dd><p><strong>"+element.stock_name +"</strong></p><p><small>"+Number(element.market_value).toFixed(2) +"</small></p></dd>";
        eleHtml+="<dd><p><span class=\""+css+"\">"+float_yk+"</span></p><p><span class=\""+css+"\">"+Number(element.float_yk_per).toFixed(2)+"%</span></p></dd>";
        eleHtml+="<dd><p>"+Number(element.cost_amount)+"</p><p>"+Number(element.enable_amount)+"</p></dd>";
        eleHtml+="<dd><p>"+Number(element.cost_price).toFixed(price_digit)+"</p><p>"+Number(element.last_price).toFixed(price_digit)+"</p></dd>";
        eleHtml+="</dl>";
        return eleHtml;
	}
	/*******************************************证券持仓END*******************************************/
	
	/**
	 * 
	 */
	function clearBuyMsg(){
		$.clearRequest();
		stock_info = ioitStock();
		if(stock_html){
		   	if(stock_html.market_div.find("a.current").text() == "市价委托"){
			   	stock_info.market_price = true;
		   	}
	    	stock_html.stockName.html("<em class=\"placeholder stockCode\">证券名称</em>"); // 股票名称
	    	setStockInfo("stockPrice","");// 股票价格
	    	setStockInfo("stockNum",""); // 股票数量
	    	stock_html.upStop.text("--"); //涨停价
	    	stock_html.downStop.text("--");//跌停价
	    	stock_html.stockMaxAmount.text("--");//股票最大数
		   	stock_html.total.text("");
		   	stock_html.buyGear.find("span").removeClass("agreen").removeClass("ared").text("--");
			stock_html.buyGear.find("em").text("--");
			stock_html.sellGear.find("span").removeClass("agreen").removeClass("ared").text("--");
			stock_html.sellGear.find("em").text("--");
			stock_html.stockList.html("");
			stock_html.market_ul.hide();
		}
	   	if (fifthOrder_timer != null ) {
	        window.clearInterval(fifthOrder_timer);
	    }
	   	_fifthCallback = true;
		$(_pageId + ".five_box ul li").removeClass("active");
		$(_pageId + " p.limit em").text("股");
		$(_pageId + " .input_num .input_text em").text("股");
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