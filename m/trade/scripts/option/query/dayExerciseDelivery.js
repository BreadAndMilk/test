/**
 * 行权结果查询
 */
define("project/scripts/stockOption/stockTrade/query/dayExerciseDelivery",function(require,exports,module){
	var appUtils = require("appUtils"),
		gconfig = require("gconfig"),
		layerUtils = require("layerUtils"),
		serviceImp = require("project/scripts/thinkive/base/serviceImp_stockOption").getInstance(),
		stock_common = require("project/scripts/stockOption/common/common"),
		globalFunc = require("globalFunc"),
		winHeight = null, // 窗口的高度
	    userInfo = null,
	    global = gconfig.global,
		_pageId = "#stockOption_stockTrade_query_dayExerciseDelivery ";
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
		stock_common.addNavigation(2, 0, 2, 1, "行权结果查询");
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
	 * 行权结果查询查询
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
		var entrust_bs = "";
		var option_account = "";
		var param = {			
			 "entrust_way": entrust_way,
			 "branch_no": branch_no,
			 "fund_account": fund_account,
			 "cust_code": cust_code,
			 "sessionid": sessionid,
			 "exchange_type": exchange_type,
			 "stock_code": stock_code,
			 "option_code": option_code,
			 "entrust_bs": entrust_bs,
			 "option_account": option_account
		};
		serviceImp.queryDayExerciseDelivery(param,queryCallBack);
	}
	/**
	 * 行权结果查询数据方法
	 * @param {Object} data 返回数据
	 */
	function queryCallBack(data)
	{
		if (data) {
			if(data.error_no == 0)
			{
				var results = data.results;	
				if(results && results.length > 0){
					var todayExerciseDeliveryHtml = "";
					for(i = 0;i < results.length; i++){
						var data = results[i];
						todayExerciseDeliveryHtml += createHtml(data);
					}
					$(_pageId+"#listContents").append(todayExerciseDeliveryHtml);
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
	 * 生成行权结果查询html
	 * @param {Object} element 数据项
	 */
	function createHtml(element)
	{
		var eleHtml = "";
		    eleHtml += "<div class=\"trade_box\"  style=\"margin-top:0px;\">";
		    eleHtml += "<ul class=\"clearfix\">";
			eleHtml += "<li><span>合约代码：</span>"+element.option_code+"</li>";
			eleHtml += "<li><span>合约名称：</span>"+element.option_name+"</li>";
			eleHtml += "<li><span>证券代码：</span>"+element.stock_code+"</li>";
			eleHtml += "<li><span>期权类别：</span>"+element.option_type_name+"</li>";
			eleHtml += "<li><span>持仓类别：</span>"+element.opthold_type_name+"</li>";
			eleHtml += "<li><span>行权价格：</span>"+element.exercise_price+"</li>";
			eleHtml += "<li><span>行权数量：</span>"+element.exercise_amount+"</li>";
			eleHtml += "<li><span>行权冻结资金：</span>"+element.exefrozen_balance+"</li>";
			eleHtml += "<li><span>标的收付数量：</span>"+element.settle_amount+"</li>";
			eleHtml += "<li><span>收付金额：</span>"+element.settle_balance+"</li>";
			eleHtml += "<li><span>股东账号：</span>"+element.option_account+"</li>";
			eleHtml += "<li><span>交易市场：</span>"+element.exchange_type_name+"</li>";
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
			appUtils.pageInit("stockOption/stockTrade/query/dayExerciseDelivery","stockOption/stockTrade/query/mainQuery",{});
			e.stopPropagation();
		});
	}
	/**
	 * 销毁
	 * */
	function destroy(){
		$(_pageId+" #listContents").html("");
	}
	
	var dayExerciseDelivery = {
		"init" : init,
		"bindPageEvent" : bindPageEvent,
		"destroy" : destroy
	};
	
	
	module.exports = dayExerciseDelivery;
});