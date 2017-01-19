/**
 * 新股-申购
 */
define('trade/scripts/shares/purchase.js',function(require, exports, module) {
	require("validatorUtils");
	var validator = $.validatorUtils;
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var	service_stock = require("service_stock");
	var _pageId = "#shares_purchase ";
    var userInfo =null;
    var num_step = 500; //步数
    var exchange_market = ""; //市场类别
    var witchAccount = "";
    var stock_account = "";
    var _stockName = "";
    
    /**
     * 初始化
     */
	function init() {
		userInfo = common.getCurUserInfo();
	    queryMessages(); //今日新股查询		
		querynewAmount();//新股额度查询
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
        var height_table = mianHeight - $(_pageId+".tab_nav").height() - $(_pageId+".order_form").height() - 11;
        $(_pageId+".fund_table").css("overflow-y","auto");  //给持仓数据添加高度
        $(_pageId+".fund_table").height(height_table);  //给持仓数据添加高度
		$(_pageId+".fund_table").scrollTop(0);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("account/index","left");
			e.stopPropagation();
		});
		// 股票代码输入框监听
		$.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
			$(_pageId+"#stockPrice").val("");
		 	$(_pageId+"#stockUnit").val("");
			var stockCode = $(this).val();
			if(stockCode.length == 6 && validator.isNumeric(stockCode)){
				queryMaxAmount(stockCode);
			}
			e.stopPropagation();
		},"input");
		$.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
			var code = $.trim($(_pageId + "#stockCode").val().substr(-6));
			$(this).val(code);
			e.stopPropagation();
		},"click");
		// 失去焦点关闭原生键盘
		$.bindEvent($(_pageId + "#stockCode"),function(e){
			var stockCode = $.trim($(_pageId + "#stockCode").val());
			if(stockCode.length == 6){
				$(_pageId + "#stockCode").val(_stockName+" "+stockCode);
			}
			e.stopPropagation();
		},"blur");
		//申购
		$.bindEvent($(_pageId+".order_form .ce_btn"),function(e){
			cofirmOrder(); //
			e.stopPropagation();	// 阻止冒泡
		});
	}
    
	/**
	 * 今日新股查询		
	 */
	function queryMessages(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	 //分支机构
		var fund_account = userInfo.fund_account;//资产账户
		var cust_code = userInfo.cust_code;  	 //客户代码
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid
			};
		service_stock.queryListingShares(param,messageCallBack);
	}
	//新股查询回调
	function messageCallBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if( results && results.length>0){
				var html = '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="ce_table"><tr><th scope="col">名称</th><th scope="col">发行价</th><th scope="col">单位(股)</th><th scope="col">上限(股)</th></tr>';
				for(var i = 0;i<results.length;i++){
					html += messageAddHtml(results[i]);
				}
				html += "</table>";
				$(_pageId+" .fund_table .ce_table").html(html);
				$.bindEvent($(_pageId+".fund_table .newShare"),function(e){
					var stockName = $(this).find("strong").text();
					var stockCode = $(this).find("small").text();
					var stockPrice = $(this).find("td").eq(1).find("span").text();
					var stockUnit = $(this).find("td").eq(2).find("span").text();
					if(stockUnit && !isNaN(Number(stockUnit))){
						num_step = Number(stockUnit);
					}
					var exchange_type = $(this).attr("exchange_type");
					$(_pageId +"#stockCode").val(stockName+" "+stockCode);
					$(_pageId +"#stockPrice").val(stockPrice);
					exchange_market = exchange_type;//交易市场类别（见数据字典)
					var a = Number($(this).find("td").eq(3).find("span").text());
					var apply_sell="";
					if(exchange_market=="0"){
						apply_sell= $(_pageId+" .order_form .max_box strong").eq(1).text();
					}else if(exchange_market=="2"){
						apply_sell= $(_pageId+" .order_form .max_box strong").eq(0).text();
					}
					if(validator.isNumeric(apply_sell)){
						apply_sell = Number(apply_sell);
					}else{
						apply_sell = 0;
					}
					$(_pageId +"#stockUnit").val(a > apply_sell ? apply_sell : a);
					_stockName = stockName;
					stock_account = $(this).attr("stock_account");//股东账号
					//股票联动,查询股票信息，最大可买,配售
				});
				$(_pageId+ ".no_data").hide();
			}else{
				$(_pageId+ ".no_data").show();
			}
		}else{
			$.alert(data.error_info);
		}
	}
	
	/**
	 * actcheck
	 */
	function messageAddHtml(element){
		eleHtml = "";
		eleHtml += '<tr class="newShare" exchange_type="'+element.exchange_type+'" stock_account="'+element.stock_account+'">';
        eleHtml += '<td><strong>'+element.stock_name+'</strong><small>'+element.stock_code+'</small></td>';
        eleHtml += '<td><span>'+Number(element.last_price).toFixed(2)+'</span></td>';
        eleHtml += '<td><span>'+Number(element.buy_unit)+'</span><span>'+element.exchange_type_name+'</span></td>';
        eleHtml += '<td><span>'+Number(element.high_amount)+'</span></td>';
        eleHtml += '</tr>';
		return eleHtml;
	}
	
	/**
	 * 新股申购额度查询	
	 */
	function querynewAmount(fund_account,exchange_type){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	 //分支机构
		var fund_account = fund_account?fund_account:userInfo.fund_account;//资产账户
		var cust_code = userInfo.cust_code;  	 //客户代码
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var exchange_type = exchange_type?exchange_type:"";
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"exchange_type": exchange_type
			};
		service_stock.newAmount_Query(param,queryNewAmountCallBack,{"isLastReq":true,"isShowWait":false});
	}
	//新股申购额度查询回调
	function queryNewAmountCallBack(data){
		if (typeof data != "undefined" && data != null) {
			if(data.error_no == 0){
				if(typeof data.results != "undefined" && data.results!= null && data.results != ""){
					var results = data.results;	
					for(var i=0;i<results.length;i++){
						var exchange_type = results[i].exchange_type;
						var enable_amount = results[i].enable_amount;
						if(exchange_type=="0"){//深市
							$(_pageId+" .order_form .max_box strong").eq(1).text(enable_amount);
						}else if(exchange_type=="2"){//沪市
							$(_pageId+" .order_form .max_box strong").eq(0).text(enable_amount);
						}
						
					}
				}
			}
		}else{
			 $.alert(data.error_info);
		}
	}
		
	/**
	 * 查询最大可买数量
	 * */
	function queryMaxAmount(stockCode){
		_stockName = "";
		_stock_code = "";
		//证券代码编号
		if(stockCode.length != 6){
			$.alert("请输入正确的证券代码");
			return false;
		}
		if(!validator.isNumeric(stockCode)){
			$.alert("请输入正确的证券代码");
			return false;
		}
		$(_pageId+" .order_form .notice span").text("--");
		if(!stockCode){
			return false;
		}
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	 //分支机构
		var fund_account = userInfo.fund_account;//资产账户
		var cust_code = userInfo.cust_code;  	 //客户代码
		var password = userInfo.password;
		var stock_code = stockCode;
		var entrust_bs = "14";
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"entrust_bs":entrust_bs,
				"stock_code":stock_code,
			};
		service_stock.queryListingShares(param,queryMaxAmountCallBack);
	}
    //查询最大可买卖数量回调
	function queryMaxAmountCallBack(data){
		if(data){
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					exchange_market = results[0].exchange_type;//交易市场类别（见数据字典)
					_stockName = results[0].stock_name;
					var stock_code = results[0].stock_code;
					$(_pageId+"#stockCode").val(_stockName+" " + stock_code);
					$(_pageId+"#stockPrice").val(Number(results[0].last_price).toFixed(2));
					stock_account = results[0].stock_account;//股东账号
					if(results[0].buy_unit){
						num_step = results[0].buy_unit;
					}
					var a = Number(results[0].high_amount);
					var apply_sell="";
					if(exchange_market=="0"){
						apply_sell= $(_pageId+" .order_form .max_box strong").eq(1).text();
					}else if(exchange_market=="2"){
						apply_sell= $(_pageId+" .order_form .max_box strong").eq(0).text();
					}
					if(validator.isNumeric(apply_sell)){
						apply_sell = Number(apply_sell);
					}
					else{
						apply_sell = 0;
					}
					$(_pageId +"#stockUnit").val(a > apply_sell ? apply_sell : a);
				}
				else{
					$.alert("该只股票没有在今日新股列表中");
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	/**
	 * 申购验证
	 * */
	function cofirmOrder(){
		var code = $.trim($(_pageId + "#stockCode").val().substr(-6));
		var vai1 = /^[0-9]{6}$/;
		if(!vai1.test(code)){
			$.alert("请输入申购代码");
			return false;
		}
		//验证价格
		var now_price = $(_pageId+"#stockPrice").val();
		if(now_price.length == 0){
			$.alert("请输入申购价格");
			return false;
		}
		if((!validator.isNumberFloat(now_price)) || parseFloat(now_price) <= 0){
			$.alert("输入的申购价格无效");
			return false;
		}
		//验证数量
		var mountBuy = $(_pageId+" #stockUnit").val();
		if(mountBuy.length==0){
			$.alert("请输入申购数量");
			return false;
		}
		if(!validator.isNumeric(mountBuy)||mountBuy <= 0){
			$.alert("输入的申购数量无效");
			return false;
		}
		num_step = Number(num_step);
		if(mountBuy % num_step != 0 ){
			$.alert("申购数量必须为"+num_step+"的整数倍");
			return false;
		}
//		var max_buy = $(_pageId+".order_form .notice span").text(); //可买数量
//		if(max_buy == "--"){
//			$.alert("可申购额度不足");
//			return false;
//		}
//		if(Number(mountBuy) > Number(max_buy)){
//			$.alert("可申购额度不足");
//			return false;
//		}
		var apply_sell="";
		if(exchange_market=="0"){
			apply_sell= $(_pageId+" .order_form .max_box strong").eq(1).text();
		}else if(exchange_market=="2"){
			apply_sell= $(_pageId+" .order_form .max_box strong").eq(0).text();
		}
		if(apply_sell == "" || apply_sell == "--"){
			$.alert("可申购额度不足");
			return false;
		}
		if(Number(apply_sell)<Number(mountBuy)){
			$.alert("可申购额度不足");
			return false;
		}
		var tipStr = "<div >";
		var tipStrArray = [];
		tipStrArray.push([_stockName, code]);
		tipStrArray.push(["申购价格", now_price]);
		tipStrArray.push(["申购数量", mountBuy]);
		tipStr += common.generatePrompt(tipStrArray);
		tipStr+="<p style=\"color: #FF2222;\">您是否确认以上委托？委托后不可撤单</p></div>";
		common.iConfirm("申购确定",tipStr,function success(){
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;	//分支机构
			var fund_account = userInfo.fund_account;	//资产账户
			var cust_code = userInfo.cust_code;	//客户代
			var sessionid = userInfo.session_id;
			var password = userInfo.password;
			var entrust_bs = "14";
			var exchange_type = exchange_market;
			var entrust_type = "0";
			var stock_code = code;
			var entrust_price = now_price;
			var entrust_amount = mountBuy;	
			var param = {
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"exchange_type":exchange_type, 
					"entrust_bs":entrust_bs,
					"entrust_price":entrust_price,
					"entrust_amount":entrust_amount,
					"password":password,
					"sessionid":sessionid,
					"entrust_type":entrust_type,
					"stock_account":stock_account,
					"stock_code":stock_code
				};
			service_stock.getStockBuy(param,succesCallback);
		});
	}
	function succesCallback(data){
		if(data.error_no == "0"){
			$.alert(_stockName+"，申购委托已提交，委托编号："+results[0].entrust_no,"委托结果");
			$(_pageId+"#stockUnit").val("");
			querynewAmount();
		}else{
			$.alert(data.error_info);
		}
	}
	/**
	 * 销毁
	 */
	function destroy(){
		 $(_pageId+"#stockPrice").val("");
		 $(_pageId+"#stockUnit").val("");
		 $(_pageId+".select_box ul").hide();
		 $(_pageId+" .order_form .max strong").text("--");
		 $(_pageId+" .order_form .notice span").text("--"); 
		 $(_pageId+"#stockCode").val("");
		 $(_pageId+" .fund_table .ce_table").html("");
		 _stock_code = "";
		 _stockName = "";
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageBack("account/index","left");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});