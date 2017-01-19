/**
 * 历史行权交割查询
 */
define("project/scripts/stockOption/stockTrade/query/historyExerciseDelivery",function(require,exports,module){
	var appUtils = require("appUtils"),
		gconfig = require("gconfig"),
		layerUtils = require("layerUtils"),
		serviceImp = require("project/scripts/thinkive/base/serviceImp_stockOption").getInstance(),
		stock_common = require("project/scripts/stockOption/common/common"),
		globalFunc = require("globalFunc"),
		winHeight = null, // 窗口的高度
	    userInfo = null,
	    global = gconfig.global,
		_pageId = "#stockOption_stockTrade_query_historyExerciseDelivery ";
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
		stock_common.addNavigation(2, 0, 2, 1, "历史行权交割查询");
		var contHeight = winHeight - 40 - 10;
		$(_pageId + " .colla_main").css({"height": contHeight, "overflow-x": "hidden", "overflow-y": "auto"});
		var name = $(_pageId+"  #until").attr("value");
		$(_pageId+" .sel_list li[name="+name+"]").addClass("active").siblings().removeClass("active");
		queryData();
		BindHeaderEvent();//绑定头部事件
	}
	/**
	 * 事件绑定
	 * */
	function bindPageEvent()
	{
		stock_common.bindEvent($(_pageId+" #timeUntil #until"),function(e){
			var sel_ul_height = $(_pageId+" .sel_list").height()-30+"px";
			$(_pageId+" .sel_list ul").css("height", sel_ul_height);
			$(_pageId+"  .sel_list").slideToggle();
//			if($(_pageId+" .sel_list").is(":visible")){
//				$(_pageId+" .colla_main").css("overflow","hidden");
//			}else{
//				$(_pageId+" .colla_main").css("overflow","auto");
//			}
			e.stopPropagation();	// 阻止冒泡
		});
		stock_common.bindEvent($(_pageId+" .sel_list li"),function(e){
			$(this).addClass("active").siblings().removeClass("active");
			$(_pageId+" #until").attr("value",$(this).attr("name"));
			$(_pageId+" #until").text($(this).text());
			$(_pageId+" .sel_list").hide();
			e.stopPropagation();	// 阻止冒泡
			//查询历史成交数据
			queryData();
		});
		stock_common.bindEvent($(_pageId),function (){
			$(_pageId+" .sel_list").hide();
			if($(_pageId+" .sel_list").is(":visible")){
				$(_pageId+" .colla_main").css("overflow","hidden");
			}else{
				$(_pageId+" .colla_main").css("overflow","auto");
			}
		});
	}
	/**
	 * 历史行权交割查询
	 */
	function queryData()
	{
		$(_pageId+ " #listContents").html("");
		var t = Number($(_pageId+" #until").attr("value"));
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account;	//资产账户
		var branch_no = userInfo.branch_no;	//分支机构
		var sessionid = userInfo.session_id;
		var entrust_way = "5";
		var exchange_type = "";
		var stock_code = "";
		var option_code = "";
		var entrust_bs = "";
		var option_account = "";
		stock_common.queryDiffTradeDate("0",t,function(data){
			if(data)
			{
				var end_time = globalFunc.getServerTime(false).date;//截止时间
				var begin_time  = data;	//开始时间
				if(begin_time == "")
				{
					layerUtils.iMsg(-1,"开始日期不能为空");
					return false;
				}
				if(end_time == "")
				{
					layerUtils.iMsg(-1,"截止日期不能为空");
					return false;
				}
				var param={		
					"entrust_way": entrust_way,
					 "branch_no": branch_no,
					 "fund_account": fund_account,
					 "cust_code": cust_code,
					 "sessionid": sessionid,
					 "exchange_type": exchange_type,
					 "stock_code": stock_code,
					 "option_code": option_code,
					 "entrust_bs": entrust_bs,
					 "option_account": option_account,
					 "begin_time": begin_time,
					 "end_time": end_time
				};
				serviceImp.queryHistoryExerciseDelivery(param,queryCallBack);
			}
		});
	}
	/**
	 * 历史行权交割查询数据方法
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
	 * 生成历史行权交割查询html
	 * @param {Object} element 数据项
	 */
	function createHtml(element)
	{
		var eleHtml = "";
		    eleHtml += "<div class=\"trade_box\"  style=\"margin-top:0px;\">";
		    eleHtml += "<ul class=\"clearfix\">";
			eleHtml += "<li><span>证券代码：</span>"+element.stock_code+"</li>";
		   	eleHtml += "<li><span>交易日期：</span>"+element.init_date+"</li>";
			eleHtml += "<li><span>清算数量：</span>"+element.clear_amount+"</li>";
			eleHtml += "<li><span>交收数量：</span>"+element.settle_amount+"</li>";
			eleHtml += "<li><span>缺口数量：</span>"+element.short_amount+"</li>";
			eleHtml += "<li><span>处理数量：</span>"+element.treat_amount+"</li>";
			eleHtml += "<li><span>返还数量：</span>"+element.return_amount+"</li>";
			eleHtml += "<li><span>清算金额：</span>"+element.clear_balance+"</li>";
			eleHtml += "<li><span>结算金额：</span>"+element.settle_balance+"</li>";
			eleHtml += "<li><span>缺口资金：</span>"+element.short_balance+"</li>";
			eleHtml += "<li><span>返还金额：</span>"+element.return_balance+"</li>";
			eleHtml += "<li><span>调账金额：</span>"+element.adjust_balance+"</li>";
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
			appUtils.pageInit("stockOption/stockTrade/query/historyExerciseDelivery","stockOption/stockTrade/query/mainQuery",{});
			e.stopPropagation();
		});
	}
	/**
	 * 销毁
	 * */
	function destroy(){
		$(_pageId+" #listContents").html("");
		$(_pageId+"  .sel_list").hide();
		$(_pageId+" #until").attr("value",10);
		$(_pageId+" #until").text("近10天");
	}
	
	var historyExerciseDelivery = {
		"init" : init,
		"bindPageEvent" : bindPageEvent,
		"destroy" : destroy
	};
	
	
	module.exports = historyExerciseDelivery;
});