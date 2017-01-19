/**
 * 撤单
 */
define("project/scripts/stockOption/stockTrade/order/cancellation",function(require,exports,module){
	var appUtils = require("appUtils"),
		layerUtils = require("layerUtils"),
		gconfig = require("gconfig"),
		serviceImp = require("project/scripts/thinkive/base/serviceImp_stockOption").getInstance(),
		stock_common = require("project/scripts/stockOption/common/common"),
		globalFunc = require("globalFunc"),
		VIscroll = require("vIscroll"),
		account=[],
		global = gconfig.global,
		winHeight = null, // 窗口的高度
		userInfo = null,//登录客户信息
		myScroller = null, // 滚动组件
		_pageId = "#stockOption_stockTrade_order_cancellation ";

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
		//添加头部
		stock_common.addNavigation(1, 0, 2, 1,"撤单<div class='input_limit'><a href='javascript:void(0);' class='limit_value' style='font-size: 16px;width: 80px;line-height: 40px;'>全部撤单</a></div>");
		BindHeaderEvent(); // 绑定头部事件
		globalFunc.setSideEffect(0, 0); // 禁用左右滑动
		globalFunc.setBottomMenu(false); // 隐藏底部导航
		userInfo = globalFunc.getStockOptionUserInfo();
		//撤单查询
		queryData();
	}

	/**
	 * 事件绑定
	 * */
	function bindPageEvent()
	{
	}
	//获取全部撤单的合同序号
	function getEntrustNo(){
		var entrust_no = "";
		var exchange_type = "";
		var ents = $(_pageId+' #stockListDiv>div[class="trade_box"]');
		for(var i=0;i<ents.length;i++){
			entrust_no +=(ents.eq(i).attr("id")+",");
			exchange_type +=(ents.eq(i).attr("exchange_type")+",");
		}
		if(entrust_no.length>0){
			entrust_no = entrust_no.substring(0,entrust_no.length-1);
			exchange_type = exchange_type.substring(0,exchange_type.length-1);
		}
		var param = {
			"entrust_no": entrust_no,
			"exchange_type": exchange_type
		}
		return param;
	}
	/**
	 * 撤单查询
	 */
	function queryData()
	{
		$(_pageId+" #stockListDiv").html("");
		var entrust_way="5";
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid= userInfo.session_id;
		var option_code ="";
		var stock_code = "";
		var entrust_bs = "";
		var exchange_type = "";
		var option_account = "";
		var param={
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"exchange_type":exchange_type,
				"stock_code":stock_code,
				"option_code":option_code,
				"entrust_bs":entrust_bs,
				"option_account":option_account
		};
		serviceImp.queryOrderCancellation(param,queryStockCallback);//股票查询
	}
	/**
	 * 股份查询回调方法
	 * @param {Object} data 返回数据
	 */
	function queryStockCallback(data)
	{
		if (data) {
			if(data.error_no == 0)
			{
				var results = data.results;
				if(results && results.length > 0){
					//$(_pageId+" #stockNum em:eq(0)").text(results.length);
					var queryStockHtml = "";
					for ( var i = 0; i < results.length; i++) 
					{
						var oneData = results[i];
						queryStockHtml += createqueryStockHtml(oneData,i);
					}
					$(_pageId+" #stockListDiv").html(queryStockHtml);
					//绑定撤单事件
					stock_common.bindEvent(_pageId+" .cancel_li a",function (){
						selectObject=$(this).parents(" .trade_box");
						var $currItem = $(this).parents("ul");
						if(selectObject&&selectObject.length>0)
						{
							postCancelOrder($currItem);
						}
					});
				}else
				{
					$(_pageId+" #stockListDiv").html("<h5 style=\"font-size: 14px; background:#f6f6f6;\">暂无数据！</h5>");
					$(_pageId+" #stockListDiv").css('height', winHeight - 40);
				}
				if(myScroller) // 销毁滚动组件
				{
					myScroller.destroy();
					myScroller = null;
				}
				initScroller(); // 初始化滚动组件
			}
			else{
				layerUtils.iAlert(data.error_info);
			}
		}
	}

	/**
	 * 生成股份查询html
	 * @param {Object} 结果集
	 */
	function createqueryStockHtml(element)
	{
		var eleHtml = "";
		var	entrust_price=element.entrust_price!=""?element.entrust_price:"0";
		entrust_price=Number(entrust_price);
		eleHtml +="<div class=\"trade_box\" id="+element.entrust_no+" exchange_type="+element.exchange_type+">";
		eleHtml +="<h3><span style= 'position: absolute;right: 180px;'>编号："+element.report_no+"</span><a href=\"javascript:void(0)\" class=\"gouxuan gouxuanzhong\">"+element.entrust_bs_name+"</a><em><a class=\"jy_huise\">"+element.entrust_date+"</a></em></h3>";
		eleHtml +="<ul class=\"clearfix\" style='margin-top: 15px;'>";
		eleHtml += "<li><span>委托时间：</span>"+element.entrust_time+"</li>";
		eleHtml += "<li><span>合同序号：</span>"+element.entrust_no+"</li>";
		eleHtml += "<li><span>合约代码：</span>"+element.option_code+"</li>";
		eleHtml += "<li><span>合约名称：</span>"+element.option_name+"</li>";
		eleHtml += "<li><span>合约标示：</span>"+element.optcontract_id+"</li>";
		eleHtml += "<li><span>证券代码：</span>"+element.stock_code+"</li>";
		eleHtml += "<li><span>委托类别：</span>"+element.entrust_type_name+"</li>";
		eleHtml += "<li><span>买卖类别：</span>"+element.entrust_bs_name+"</li>";
		eleHtml += "<li><span>开平仓：</span>"+element.entrust_oc_name+"</li>";
		eleHtml += "<li><span>备兑标示：</span>"+element.covered_flag_name+"</li>";
		eleHtml += "<li><span>委托价格：</span>"+element.opt_entrust_price+"</li>";
		eleHtml += "<li><span>委托数量：</span>"+element.entrust_amount+"</li>";
		eleHtml += "<li><span>撤单数量：</span>"+element.withdraw_amount+"</li>";
		eleHtml += "<li><span>成交数量：</span>"+element.business_amount+"</li>";
		eleHtml += "<li><span>委托状态：</span>"+element.entrust_status_name+"</li>";
		eleHtml += "<li><span>股东账号：</span>"+element.option_account+"</li>";
		eleHtml +="<li class=\"cancel_li\"><a href=\"javascript:void(0)\">撤&nbsp;&nbsp;单</a></li>";	
		eleHtml +="</ul></div>";
		return eleHtml;
	}
	
	/**
	 * 委托撤单
	 * @param $currItem 当前条目
	 */
	function postCancelOrder($currItem)
	{
		var stockCode = $currItem.find("li:eq(2)").text(); // 证券代码
		var stockName = $currItem.find("li:eq(3)").text(); // 证券名称
		var delegateOrien = $currItem.prev().find("a:eq(0)").text(); // 操作类型
		var delegatePrice = $currItem.find("li:eq(10)").text(); // 委托价格
		var delegateQuantity = $currItem.find("li:eq(11)").text(); // 委托数量
		// 去掉 ： 之前的内容
		stockCode = stockCode.substring(stockCode.indexOf("：") + 1);
		stockName = stockName.substring(stockName.indexOf("：") + 1);
		delegatePrice = delegatePrice.substring(delegatePrice.indexOf("：") + 1);
		delegateQuantity = delegateQuantity.substring(delegateQuantity.indexOf("：") + 1);
		var entrust_no = selectObject.eq(0).attr("id");//合同序号
		var batch_flag="0";
		var exchange_type="";
		var entrust_way="5";
		var exchange_type = selectObject.eq(0).attr("exchange_type");
		var branch_no	= userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//货币 ""所有货币，0 人民币，1 港币，2 美元
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var money_type = "";////货币 ""所有货币，0 人民币，1 港币，2 美元
		var sessionid=userInfo.session_id;
		var password="";
		var param={				
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"entrust_no":entrust_no,
				"exchange_type":exchange_type,
				"batch_flag":batch_flag,
				"exchange_type":exchange_type
		};
		var tipStr = "<div style=\"text-align: center;;color: #999;font-size:14px;height: 180px;\">";
		tipStr+="<span  style=\"text-align: center;padding-left: 8%;font-size: 20px;color: #EE1247;font-weight: bold;\">交易确认</span>";
		tipStr += "<ul class='jyts'>";
		tipStr+="<li>委托编号：</li><li>" + entrust_no;
		tipStr+="</li><li>合约名称：</li><li>"+stockName;
		tipStr+="</li><li>合约代码：</li><li>"+stockCode;
		tipStr+="</li><li>操作类型：</li><li>"+delegateOrien;
		tipStr+="</li><li>委托价格：</li><li>"+delegatePrice;
		tipStr+="</li><li>委托数量：</li><li>"+delegateQuantity+"张</li></ul></div>";
		layerUtils.iConfirm(tipStr,function success(){
			serviceImp.cancellation(param,postCancelOrderCallback);
		},function fail(){
		} );
	}
	/**
	 * 委托撤单回调方法
	 * @param {Object} data 返回数据
	 */
	function postCancelOrderCallback(data)
	{
		if (data) {
			var errorNo = data.error_no;
			if (errorNo == 0) 
			{
				layerUtils.iAlert(data.error_info);
				if(myScroller) // 销毁滚动组件
				{
					myScroller.destroy();
					myScroller = null;
				}
				globalFunc.refreshRightAssetData();//撤单成功后更新右抽屉资产值
			}
			else
			{
				layerUtils.iAlert(data.error_info);
			}
			queryData();
		}
	}

	/**
	 * 销毁
	 * */
	function destroy(){
		if(myScroller) // 销毁滚动组件
		{
			myScroller.destroy();
			myScroller = null;
		}
		$(_pageId + "#v_trade_wrapper .visc_pullDown").hide();
		serviceImp.destroy();
	}
	
	/**
	 * 绑定头部事件
	 */
	function BindHeaderEvent()
	{
		stock_common.bindEvent($("#stockOption_header #headerName .icon_back"), function(e){
			appUtils.pageInit("stockOption/stockTrade/order/cancellation", "stockOption/stockTrade/order/homePage",{});
			e.stopPropagation();
		});
		
		//全部撤单
		stock_common.bindEvent($("#stockOption_header #headerName .input_limit a"), function(){
			var entrust_no = getEntrustNo().entrust_no;//合同序号
			if(!entrust_no)
			{
				layerUtils.iAlert("暂无可撤单委托");
				return false;
			}
			var batch_flag="1";
			var exchange_type="";
			var entrust_way="5";
			var exchange_type = getEntrustNo().exchange_type;
			var branch_no	= userInfo.branch_no;	
			var fund_account = userInfo.fund_account;//货币 ""所有货币，0 人民币，1 港币，2 美元
			var cust_code = userInfo.cust_code;//关联资产账户标志
			var sessionid=userInfo.session_id;
			var password="";
			var param={				
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"exchange_type":exchange_type,
					"password":password,
					"sessionid":sessionid,
					"entrust_no":entrust_no,
					"batch_flag":batch_flag,
					"exchange_type":exchange_type
			};
			var tipStr = "你确定全部撤单吗？";
			layerUtils.iConfirm(tipStr,function success(){
				serviceImp.cancellation(param,postCancelOrderCallback);
			},function fail(){
			} );

		});
	}
	
	/**
	 * 初始化滚动组件
	 */
	function initScroller()
	{
		if(!myScroller)
		{
			var scrollConfig = {
					"isPagingType" : false,
					"isHasHead" : false,
					"hasUpPull": false,
					"pullDownTips": "下拉刷新",
					"visibleHeight" : $(window).height() - 40, // 安卓底部导航是原生的，计算高度时不能减去底部导航的高度
					"perRowHeight" : 236,
					"showVScrollBar" : false,
					"container" : $(_pageId + "#v_trade_container"),
					"wrapper" : $(_pageId + "#v_trade_wrapper"),
					"downHandle": function(){
						myScroller.refresh();
						init();
					},
					"wrapperObj": null
			};
			myScroller = new VIscroll(scrollConfig);
			$(_pageId + "#v_trade_wrapper .visc_pullUp").hide();
			setTimeout(function(){
				$(_pageId + "#v_trade_wrapper .visc_pullUp").show().hide(); // 解决如 华为 P7 之类手机底部无法显示的问题
			}, 300); // 解决某些安卓机器初始化之后概率的底部空白问题
		}
	}
	
	
	var cancellation = {
		"init" : init,
		"bindPageEvent" : bindPageEvent,
		"destroy" : destroy
		
	};
	module.exports = cancellation;
});