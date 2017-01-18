/**
 * 交易下单
 */
define('trade/scripts/common/ggtOrder.js',function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
		require("validatorUtils");
	var validatorUtil = $.validatorUtils;
	var service_ggt = require("service_ggt");
	var service_hq = require("service_hq");
	var keyboard = require("keyboard");
    var userInfo = null;  // 账号信息
    var stock_info = null;
    var stock_html = null;
    var fifthOrder_timer = null;//五档行情定时器
    var _pageId = null;
    var _orderType = null;
	var orderName = { // 委托名称
		"1":"委托买入",
		"2":"委托卖出",
		"3":"零股卖出",
	};
	var _stockCode = null;
    
	/**
	 * 设置股票对象是信息参数
	 */
	function ioitStock(){
		var stockInfo = {
	    	"stockCode" : "", // 股票代码
	    	"stockName" : "", // 股票名称
	    	"stockPrice" : "",// 股票价格
	    	"stockNum" : "",
	    	"exchange_rate": "",//汇率
	    	"up_price" : 0, //加价
	    	"down_price" : 0,//减价
	    	"stockMaxAmount" : 0,//股票最大数
	    	"surplus_quota" : 0,
			"price_digit" : 3, // 小数点位数
			"lot_size" : 100, //每手数量
			"stock_type" : "",//股票类型
			"stock_market" : "",//市场代码
			"gear_one" : false,//是否启动五档
			"exchange_type" : "",//交易市场（交易后台）
			"stock_account" : "",// 股东账号 
	    };
	    return stockInfo;
	}
	
	function initHtml(){
		stock_html = {
	    	"stockCode" : $(_pageId + " #stockCode"), // 股票
	    	"stockList" : $(_pageId+" #stock_list"),
	    	"stockName" : $(_pageId + " #stockCode").next("span"), // 股票名称
	    	"stockPrice" : $(_pageId + " #stockPrice"),// 股票价格
	    	"stockNum" : $(_pageId + " #stockNum"), // 股票数量
	    	"exchange_rate" : $(_pageId + " #exchange_rate"), //汇率
	    	"surplus_quota": $(_pageId + " #surplus_quota"),
	    	"lot_size" : $(_pageId + " #each_hand"),//每手数量
	    	"stockMaxAmount": $(_pageId + " #max_Num"),//股票最大数
	    	"buyGear" : $(_pageId + " .five_box ul").eq(1).find("li"), // 买五档
		   	"sellGear" : $(_pageId + " .five_box ul").eq(0).find("li"), // 卖五档
		   	"total" : $(_pageId + ".ce_btn #total"),// 计算金额显示
			"market_div" : $(_pageId+" .trade_form .switch_tab"), // 委托方式
		}
	}
	

    /**
     * 数据初始化
     */
	function dataInit(pageId,orderType){
		_pageId = pageId;
		if(keyboard){
			keyboard.keyInit();
		}
		userInfo = common.getCurUserInfo();
		_orderType = orderType;
		stock_info = ioitStock();
		initHtml();
		_stockCode = null;
		var stockCode = $.getPageParam("stockCode");
		// 查询个股行情
		if(stockCode){
			$(_pageId + "#stockCode").val(stockCode);
			_stockCode = stockCode;
			getStockList(stockCode);
		}
		queryHolding()
		jumpPageEvent();
    }
	
	function isBuy(){
		if(_orderType == "1"){
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
	 * 跳转页面事件
	 * $(this).unbind();
	 * this.click = null;
	 */
	function jumpPageEvent(){
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind();
	 		this.click = null;
			orderPageBack();
		}, "click");
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
		
		//关闭ios键盘
		$.bindEvent($(_pageId), function(e){
			if(e.target !== document.activeElement)
			{
				document.activeElement.blur();
			}
		}, "click");
		
		$.bindEvent($(_pageId+" .trade_form .input_code .input_text"), function(e){
			var click = e.type || "click";
			if(keyboard){
				$(_pageId + " div#stockCode").trigger(click);
			}
			else{
				$(_pageId + "#stockCode").trigger(click);
				$(_pageId + "#stockCode").focus();
			}
			e.stopPropagation();
		});
		
		if(!keyboard){
			$.bindEvent($(_pageId + "#stockCode"), function(e){
				e.stopPropagation();
			});
		}
		
		// 股票代码输入框监听
		$.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
			if(keyboard){
				keyboard.popUpKeyboard($(this),e);
			}
			var stockCode = stock_html.stockCode.val();
			if(stockCode != _stockCode){
				_stockCode = stockCode;
				clearBuyMsg();
				var vai0 = /^[A-Za-z]+$/;
				var vai1 = /^[\u4e00-\u9fa5]+$/;
				if(stockCode.length > 1 && (vai0.test(stockCode) || vai1.test(stockCode))){ // 当输入的长度大于1 并且为字母的时候
					getStockList(stockCode); // 查询股票列表
				}else if(stockCode.length>2){ // 当输入的长度大于3的时候
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
			var stockNum = stock_html.stockNum.val();
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
			var stockPrice = stock_html.stockPrice.val();
			totalValue(stockPrice,stockNum);
			isQueryMax(stockPrice);
			e.stopPropagation();
		},"blur");
		// 增加价格
		$.bindEvent($(_pageId + ".trade_main .add"),function(e){
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
					stockPrice = (parseFloat(stockPrice)+parseFloat(stock_info.up_price)).toFixed(stock_info.price_digit);
					setStockInfo("stockPrice",stockPrice);
					totalValue(stockPrice,stockNum);
					isQueryMax(stockPrice);
				}
			}else{
				$.alert("请先输入股票代码");
			}
			e.stopPropagation();
		},"click");
		// 减少价格
		$.bindEvent($(_pageId + ".trade_main .less"),function(e){
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
				var price_step = stock_info.down_price;
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
		},"click");
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
				stock_html.stockList.html("");
//				stock_html.market_ul.hide();
			}
			e.stopPropagation();
		});
		
		//委托类型绑定事件
		$.bindEvent($(_pageId+".switch_tab a"),function(e){
			$(_pageId+".switch_tab a").attr("class","");
			$(this).attr("class","current");
			e.stopPropagation();
		})
		
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
		var vai1 = /^[0-9]{5}$/;
		if(vai1.test(stockCode)){
			queryMaxAmount(stockCode);
		}
	}
	
	//对行情接口返回数据进行处理
	function ListData(data){
		var price = data[2] ? data[2]:data[6];
		var stockVal = data[1]; //股票代码
		setStockInfo("stockCode",stockVal,true);
		_stockCode = stockVal;
//		setStockInfo("stockName",data[0],true); 
		if(data[15] == "1"){
//			stock_info.stockCode = "";
			$.hidePreloader();
			$.alert("该股票即将退市，不进入三板，谨慎委托");
//			return false;
		}
		setStockInfo("stockPrice",price.toFixed(stock_info.price_digit)); // 股票现价
		stock_info.stock_market = data[9];
		if (fifthOrder_timer != null ) {
	        window.clearTimeout(fifthOrder_timer);
	    }
		stock_info.gear_one = true;
		setFifthOrder();
		
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
			var stockStrParam = {
			  "q" : stockCode,
			  "type" : type,
			  "marketType":"2"
			}; 
			stock_html.stockList.html("");
//			var vai1 = /^[0-9]{5}$/;
//			if(vai1.test(stockCode)){
//				//$.iLoading(true);
//				
//			}
			service_hq.getStockList_ggt(stockStrParam,function(data){
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
		stock_html.stockList.html("");
		if(data.errorNo == 0){
			var results = data.results;
			// 显示股票列表
			if(results && results.length > 0){
				if(results.length == 1){
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
						if(keyboard){
							keyboard.closeKeyPanel();
						}
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
//				var vai1 = /^[0-9]{5}$/;
//				if(vai1.test(stockCode)){
////					$.alert("没有查询到此股票信息");
////					layerUtils.iLoading(false);
//					queryData(stockCode);
//					stock_html.stockList.html("");
//				}
				$.alert("没有查询到此股票信息");
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
			service_hq.getStockFiveStep(fifthOrder,callbackFifthOrder,{"isShowWait":false,"errorFunc":function(){}});
		}
	}
	
	//回调五档买卖盘
	function callbackFifthOrder(data){
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
					setStockInfo("stockPrice",fifthOne); // 股票现价
					stock_info.gear_one = false;
				}
				//卖五档盘颜色集合
				for(var i = 0 ; i < 5 ; i ++){
					addColor(stock_html.buyGear.eq(i),results[0][16+i],yesProfit,results[0][21+i],price_digit);
					addColor(stock_html.sellGear.eq(i),results[0][6+i],yesProfit,results[0][11+i],price_digit);
				}
			}
			fifthOrder_timer =  window.setTimeout(setFifthOrder, 10000);//定时刷新
		}else{
			if (fifthOrder_timer != null ) {
		        window.clearTimeout(fifthOrder_timer);
		    }
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
	 * 查询买入可用资金最大可买可卖数量
	 * */
	function queryMaxAmount(stockCode,isMax){
		if(keyboard){
			keyboard.closeKeyPanel();
		}
		$.hidePreloader();
		var stock_price = getStockInfo("stockPrice");
		var entrust_bs = "0";
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
			};
  	  	service_ggt.queryInformation_ggt(param,function(data){
	  	  	if(isMax){
		  	  	queryMaxAmountCallBackMax(data);
	  	  	}else{
	  	  		queryMaxAmountCallBack(data);
	  	  	}
	  	  },{"isLastReq":true,"isShowWait":false});
	}
	function queryMaxAmountCallBack(data){
	//	layerUtils.iLoading(false);
		if(data.error_no == 0){
			var results = data.results;
			if(results.length>0){
				var price_digit = stock_info.price_digit;
				setStockInfo("stockMaxAmount",Number(results[0].stock_max_amount),true);
				setStockInfo("stockName",results[0].stock_name,true);
				var exchange_type = results[0].exchange_type;
				stock_info.exchange_type = exchange_type;
				stock_info.stock_account = results[0].stock_account;
				stock_info.up_price = Number(results[0].up); // 现价+
				stock_info.down_price = Number(results[0].down); // 现价-
				setStockInfo("lot_size", Number(results[0].buy_unit),true); // 每手股数
				var exchange_rate = results[0].buy_exchange_rate;
				if (!isBuy()) {
					exchange_rate = results[0].sell_exchange_rate
				}
				setStockInfo("exchange_rate",exchange_rate); //参考汇率
				stock_info.exchange_rate = exchange_rate;
				if(!stock_info.stockCode){
					stock_info.stockCode = results[0].stock_code;
					setStockInfo("stockPrice",Number(results[0].price).toFixed(price_digit));
				}
//				queryAvailable(exchange_type);
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
				stock_info.up_price = Number(results[0].up); // 现价+
				stock_info.down_price = Number(results[0].down); // 现价-
				setStockInfo("lot_size", Number(results[0].buy_unit)); // 每手股数-
				var exchange_rate = Number(results[0].buy_exchange_rate);
				if (!isBuy()) {
					exchange_rate = Number(results[0].sell_exchange_rate)
				}
				setStockInfo("exchange_rate",exchange_rate); //参考汇率
				stock_info.exchange_rate = exchange_rate;
//				queryAvailable(exchange_type);
			}
		}
		else{
			$.alert(data.error_info);
		}
	}
	
	// 计算当前总值
	function totalValue(stockPrice,stockNum){
		stock_html.total.text("");
		if(validatorUtil.isNumberFloat(stockPrice) && validatorUtil.isNumeric(stockNum)&&validatorUtil.isNumberFloat(stock_info.exchange_rate)){
			var exch_rate = stock_info.exchange_rate;
			var amount = (stockPrice*stockNum*stock_info.exchange_rate).toFixed(3);
			stock_html.total.text("(¥"+common.numToMoneyType(""+amount)+")").attr("vlaue",amount);
		}
	}
	
	
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
		var vai1 = /^[0-9]{5}$/;
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
		var stockMaxAmount = stock_info.stockMaxAmount;
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
		if(_orderType == "3"){
//			if(stockMaxAmount >= stock_info.lot_size){
//				layerUtils.iMsg(-1,"可卖数量大于或等于一手股数，不能在零股中卖出,");
//				return false;
//			}
			if(stockNum != stockMaxAmount){
				$.alert("零股卖出数量应为你全部数量");
				return false;
			}
		}else{
//			if(stockNum % Number(lots_of) != 0){
//				layerUtils.iMsg(-1,typeText+"数量应为" + lots_of + "的倍数");
//				return false;
//			}
//			else if(stockNum > 1000000){
//				layerUtils.iMsg(-1,typeText+"数量必须小于或等于100万股");
//				return false;
//			}
		}
		
		var	up_stop = null;
		var	down_stop = null;
		var entrust_bs = "0";
		var tipStrArray = [];
		var tipStr ="<div>";

		tipStrArray.push(["证券名称 :",stock_info.stockName ]);
		tipStrArray.push(["证券代码 :",stockCode]);
		tipStrArray.push(["委托价格 :",stockPrice+"(港币)"]);
		tipStrArray.push(["委托数量 :",stockNum]);
		tipStrArray.push(["参考汇率 :",stock_info.exchange_rate]);
		tipStrArray.push(["委托金额 :",$(_pageId+" #total").attr("vlaue")+"(人民币)"]);
		tipStr += common.generatePrompt(tipStrArray);

		// tipStr += "<div class=\"pop_main\"><ul>";
        // tipStr += "<li>证券名称 :<em>"+stock_info.stockName+"</em></li>";
		// tipStr += "<li>证券代码 :<strong>"+stockCode+"</strong></li>";
		// tipStr += "<li>委托价格 :<strong>"+stockPrice+"</strong>(港币)</li>";
		// tipStr += "<li>委托数量 :<strong>"+stockNum+"</strong></li>";
		// tipStr += "<li>参考汇率 :<strong>"+stock_info.exchange_rate+"</strong></li>";
		// tipStr += "<li>委托金额 :<strong>"+$(_pageId+" #total").attr("vlaue")+"</strong>(人民币)</li></ul>";
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
		var max_price_levels = $(_pageId + " .switch_tab .current").attr("id");
		var single_flag = "0";
		if(_orderType == "3"){
			single_flag = "1";
		}
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
				"single_flag": single_flag,
				"max_price_levels": max_price_levels
			};
		service_ggt.queryTrustSure_ggt(param,getStockBuyCallBack);
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

			}
		}else{
			$.alert(data.error_info);
			clearBuyMsg();
		}
		$(_pageId + "#stockCode").val("");
		$(_pageId+".key_text").text("");
		$(_pageId+".jsKey em").text("");
		queryHolding();
	}
	
	/**
	 * 查询持仓数据
	 */
	function queryHolding(){
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
		service_ggt.queryHolding_ggt(param,queryHoldingCallback,{"isLastReq":true,"isShowWait":false,"isShowOverLay":false});
	}
	
	
	function queryHoldingCallback(data){
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
        eleHtml+="<dd><p><span class=\""+css+"\">"+float_yk+"</span></p><p><span class=\""+css+"\">"+element.float_yk_per+"</span></p></dd>";
        eleHtml+="<dd><p>"+Number(element.hold_amount)+"</p><p>"+Number(element.enable_amount)+"</p></dd>";
        eleHtml+="<dd><p>"+Number(element.cost_balance).toFixed(price_digit)+"</p><p>"+Number(element.last_price).toFixed(price_digit)+"</p></dd>";
        eleHtml+="</dl>";
        return eleHtml;
	}
	
		
	/**
	 * 额度查询
	 * */
	function queryAvailable(exchange_type){
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account;	//资产账户
		var branch_no  = userInfo.branch_no;	//分支机构
		var sessionid=userInfo.sessionid;
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var password= userInfo.password;
		var param = {
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"password":password,
			"sessionid":sessionid,
			"exchange_type":exchange_type
		};
		service_ggt.queryAvailable_ggt(param,function(data){
			if(data.error_no == 0){
				var results = data.results[0];
				if(results){
					setStockInfo("surplus_quota",Number(results.surplus_quota),true);
				}
			}else{
				$.alert(data.error_info);
			}
		},{"isShowWait":false});
	}
	
	
	/**
	 * 
	 */
	function clearBuyMsg(){
		$.clearRequest();
		stock_info = ioitStock();
	   	if(stock_html.market_div.find("a.current").text() == "市价委托"){
		   	stock_info.market_price = true;
	   	}
    	stock_html.stockName.html("<em style=\"color: #ccc;\">证券名称</em>"); // 股票名称
    	stock_html.stockPrice.val("");// 股票价格
    	stock_html.stockNum.val(""); // 股票数量
    	stock_html.lot_size.text("--");
    	stock_html.surplus_quota.text("--");//跌停价
    	stock_html.exchange_rate.text("--");//跌停价
    	stock_html.stockMaxAmount.text("--");//股票最大数
	   	stock_html.total.text("");
	   	if (fifthOrder_timer != null ) {
	        window.clearTimeout(fifthOrder_timer);
	    }
	   	stock_html.buyGear.find("span").removeClass("agreen").removeClass("ared").text("--");
		stock_html.buyGear.find("em").text("--");
		stock_html.sellGear.find("span").removeClass("agreen").removeClass("ared").text("--");
		stock_html.sellGear.find("em").text("--");
		$(_pageId + ".five_box ul li").removeClass("active");
		$(_pageId + "#stock_list").html("");
		//针对调用了js键盘后清除输入数据
		$(_pageId+"#stockPrice .key_text").text("");
		$(_pageId+"#stockPrice .jsKey em").text("");
		$(_pageId+"#stockNum .key_text").text("");
		$(_pageId+"#stockNum .jsKey em").text("");
	}
	/**
	 * 重写框架里面的pageBack方法
	 */
	function orderPageBack(){
		var curPageCode = $.getSStorageInfo("_curPageCode");
		var nextPageCode = "ggt/ggtOrder";
		$.pageInit(curPageCode,nextPageCode,{},true);
	}
	
	function dataDestroy(){
		$(_pageId + " #stockCode").val("");
		_stockCode = "";
		$(_pageId+".fund_table .ce_table").html("");
		clearBuyMsg();
		stock_info = null;
		stock_html = null;
		$(_pageId+ ".no_data p").text("暂无持仓记录");
		$(_pageId+" .search_scroll").hide();
		$(_pageId+" .toggle_nav li:eq(0)").click();
	}
	
	var base = {
		"dataInit" : dataInit,
		"elementBindEvent": elementBindEvent,
		"dataDestroy": dataDestroy,
		"orderPageBack": orderPageBack
	};
	module.exports = base;
});