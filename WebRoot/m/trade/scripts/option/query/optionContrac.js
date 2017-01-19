/**
 * 查询个股期权合约
 */
define("project/scripts/stockOption/stockTrade/query/optionContrac",function(require,exports,module){
	var appUtils = require("appUtils"),
		gconfig = require("gconfig"),
		layerUtils = require("layerUtils"),
		serviceImp = require("project/scripts/thinkive/base/serviceImp_stockOption").getInstance(),
		stock_common = require("project/scripts/stockOption/common/common"),
		globalFunc = require("globalFunc"),
		winHeight = null, // 窗口的高度
	    userInfo = null,
	    global = gconfig.global,
		_pageId = "#stockOption_stockTrade_query_optionContrac ";
	/**
	 * 初始化
	 * */
	function init()
	{
		winHeight = $(window).height();
		if(global.hasBottomNav && (gconfig.platform == '1' || gconfig.platform == '2')) // 原生壳子隐藏底部导航之后，窗口高度会变大
		{
			winHeight += 50;
		}
		userInfo = globalFunc.getStockOptionUserInfo();
		globalFunc.setBottomMenu(false); // 隐藏底部导航
		globalFunc.setSideEffect(0, 0); // 禁用左右滑动
		//添加头部
		stock_common.addNavigation(2, 0, 2, 1, "个股期权合约");
		var contHeight = winHeight - 40 - 10;
		$(_pageId + " .colla_main").css({"height": contHeight, "overflow-x": "hidden", "overflow-y": "auto"});
		queryData();
		BindHeaderEvent();//绑定头部事件
	}
	/**
	 * 事件绑定
	 * */
	function bindPageEvent()
	{
	}
	/**
	 * 个股期权合约查询
	 */
	function queryData()
	{
		var entrust_way = "5";
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid = userInfo.session_id;
		var exchange_type = "";
		var stock_code = "";
		var option_code = "";
		var option_type = "";
		var exercise_month = "";
		var param = {			
			 "entrust_way": entrust_way,
			 "branch_no": branch_no,
			 "fund_account": fund_account,
			 "cust_code": cust_code,
			 "sessionid": sessionid,
			 "exchange_type": exchange_type,
			 "stock_code": stock_code,
			 "option_code": option_code,
			 "option_type": option_type,
			 "exercise_month": exercise_month
		};
		serviceImp.queryOptionContrac(param,queryCallBack);
	}
	/**
	 * 个股期权合约数据方法
	 * @param {Object} data 返回数据
	 */
	function queryCallBack(data)
	{
		if (data) {
			if(data.error_no == 0)
			{
				var results = data.results;	
				if(results && results.length > 0){
					var todayDealHtml = "";
					for(i = 0;i < results.length; i++){
						var data = results[i];
						todayDealHtml += createHtml(data);
					}
					$(_pageId+"#listContents").append(todayDealHtml);
				}
				else{
					$(_pageId+"#listContents").html("<h5 style=\"font-size: 14px; background:#f6f6f6;\">暂无数据！</h5>");
				}
			}
			else
			{
				layerUtils.iAlert(data.error_info);	
			}
		}
	}
	/**
	 * 生成个股期权合约html
	 * @param {Object} element 数据项
	 */
	function createHtml(element)
	{
		var eleHtml = "";
		    eleHtml += "<div class=\"trade_box\"  style=\"margin-top:0px;\">";
		    eleHtml += "<ul class=\"clearfix\">";
			eleHtml += "<li><span>合约代码：</span>"+element.option_code+"</li>";
			eleHtml += "<li><span>合约名称：</span>"+element.option_name+"</li>";
			eleHtml += "<li><span>合约标示：</span>"+element.optcontract_id+"</li>";
//			eleHtml += "<li><span>委托时间：</span>"+"--"+"</li>";
//			eleHtml += "<li><span>合同序号：</span>"+"--"+"</li>";
			eleHtml += "<li><span>标的代码：</span>"+element.stock_code+"</li>";
			eleHtml += "<li><span>期权昨收：</span>"+element.opt_close_price+"</li>";
			eleHtml += "<li><span>合约单位：</span>"+element.amount_per_hand+"</li>";
			eleHtml += "<li><span>标的昨收：</span>"+element.close_price+"</li>";
			eleHtml += "<li><span>行权价格：</span>"+element.exercise_price+"</li>";
			eleHtml += "<li><span>涨停价：</span>"+element.opt_up_price+"</li>";
			eleHtml += "<li><span>跌停价:</span>"+element.opt_down_price+"</li>";
			eleHtml += "<li><span>行权模式：</span>"+element.option_mode_name+"</li>";
			eleHtml += "<li><span>行权类别：</span>"+element.option_type_name+"</li>";
			eleHtml += "<li><span>行权开始日期：</span>"+element.exe_begin_date+"</li>";
			eleHtml += "<li><span>行权截止日期：</span>"+element.exe_end_date+"</li>";
			eleHtml += "<li><span>交易开始日期：</span>"+element.begin_date+"</li>";
			eleHtml += "<li><span>交易截止日期：</span>"+element.end_date+"</li>";
			eleHtml += "<li><span>单笔保证金:</span>"+element.initper_balance+"</li>";
			eleHtml += "<li><span>停牌状态：</span>"+element.optcode_status_name+"</li>";
			eleHtml += "<li><span>调整状态：</span>"+element.opt_updated_status_name+"</li>";
			eleHtml += "<li><span>交易市场：</span>"+element.exchange_type_name+"</li>";
			eleHtml += "<li><span>单笔限价申报最高数量：</span>"+element.limit_high_amount+"</li>";
			eleHtml += "<li><span>单笔限价申报最低数量：</span>"+element.limit_low_amount+"</li>";
			eleHtml += "<li><span>单笔市价申报最高数量：</span>"+element.mkt_high_amount+"</li>";
			eleHtml += "<li><span>单笔市价申报最低数量：</span>"+element.mkt_low_amount+"</li>";
			eleHtml +="</ul>";
			eleHtml +="</div>";
		return eleHtml;
	}
	/**
	 * 绑定头部事件
	 */
	function BindHeaderEvent()
	{
		stock_common.bindEvent($("#stockOption_header #headerName .icon_back"), function(e){
			appUtils.pageInit("stockOption/stockTrade/query/optionContrac","stockOption/stockTrade/query/mainQuery",{});
			e.stopPropagation();
		});
	}
	/**
	 * 销毁
	 * */
	function destroy(){
		$(_pageId+" #listContents").html("");
	}
	
	var optionContrac = {
		"init" : init,
		"bindPageEvent" : bindPageEvent,
		"destroy" : destroy
	};
	
	
	module.exports = optionContrac;
});