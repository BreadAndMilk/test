/**
 * 信用交易-总资产界面
 */
define('trade/scripts/credit/asset/asset.js', function(require, exports, module) {
	
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var	service_credit = require("service_credit");
	var vIscrollHeight = null;
	var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
    var canBuy = 0 ;//可用
    var market_val = 0 ;//市值
    var _pageId = "#credit_asset_asset ";
    var userInfo = null;
    var assets_Timer = null;
    var position_Timer = null;
    var float_yks = 0;
    
    var holdHeight;
    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		userInfo = common.getCurUserInfo();
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId,false);
		vIscrollHeight = mianHeight - $(_pageId+".tab_nav").height();
		// holdHeight=vIscrollHeight-$(_pageId+".vertical_list").height()-11;
		// $(_pageId+".fund_table").height(holdHeight);
		// $(_pageId+".fund_table").css();
		if(!myScroller){
			initScroller();
		}else{
			myScroller.refresh();
		}
		queryData();//查询持仓
	}

	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
//			$.pageInit("credit/asset/asset","account/index",{},"left",true);
			$.pageBack("account/index","left");
			e.stopPropagation();
		});
		//转账
		$.bindEvent($(_pageId + "#transfer"), function(e){
			$.setSStorageInfo("return_page","credit/asset/asset");
			$.pageInit("credit/asset/asset","banking/transfer",{});
			e.stopPropagation();
		},"tap");

		// 注销事件
		$.bindEvent($(_pageId + ".header .logout"), function(e){
			var tipStr = "<div class=\"pop_main\" style=\"height: 35px;font-size:0.15rem\"><div>确定退出当前登录融资融券账号?</div></div>";
			common.iConfirm("账号退出",tipStr,function success(html){
				common.clearUserInfo("1");
				$.pageInit("credit/asset/asset","account/index",{"history":true});
			},function fail(){
			});
		});
	}

    
	/**
	 * 查询
	 */
	function queryData(){
		clearPositionTimer();
		clearAssetsTimer();
		//查询资金账户
		queryCapital();
		queryPosition();
	}
	/**
	 * 资金账户查询
	 */
	function queryCapital(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var password = userInfo.password;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var money_type = "";  //  0：人民币，1：美元，2：港币
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "password":password,
			    "cust_code":cust_code,
			    "money_type":money_type,
			    "is_homepage":"1"
		};
		$(_pageId+ ".no_data").hide();
		//最后一个为超时处理函数
		service_credit.rzrq_liabilitiesQuery(param,queryCapitalCallback,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":false,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
				$(_pageId+ ".no_data").show();
				if(!myScroller){
					initScroller();
				}else{
					myScroller.refresh();
				}
			}
	    });
	}
	/**
	 * 资金账户查询回调
	 */
	function queryCapitalCallback(data){
		if (data && data!= "undefined"){
			if(data.error_no == 0){
				var results = data.results;
				if(results && results!= "undefined" && results.length >0){
					var data = results[0];
					var enable_bail_balance = common.numToMoneyType(data.enable_bail_balance,2); //可用保证金
				    $(_pageId+" .hold_main2 .more_info").eq(0).find("li").eq(0).find("strong").html(enable_bail_balance.substring(0,enable_bail_balance.length-2)+"<em>"+ enable_bail_balance.substr(-2) +"</em>");//可用
				    var total_debit = common.numToMoneyType(data.total_debit,2); //总负债
				    $(_pageId+" .hold_main2 .inner").eq(1).find("strong").html(total_debit.substring(0,total_debit.length-2)+"<em>"+ total_debit.substr(-2) +"</em>");//可用
				    var assert_val = common.numToMoneyType(data.assert_val,2);  //总资产
				    $(_pageId+" .hold_main2 .inner").eq(0).find("strong").html(assert_val.substring(0,assert_val.length-2)+"<em>"+ assert_val.substr(-2) +"</em>");//可用
				    var per_assurescale_value = common.numToMoneyType(data.per_assurescale_value,2); //维持担保比例
				    $(_pageId+" .hold_main2 .more_info").eq(0).find("li").eq(1).find("strong").html(per_assurescale_value.substring(0,per_assurescale_value.length-2)+"<em>"+ per_assurescale_value.substr(-2) +"%</em>");//可用
//				    $(_pageId+" .hold_main2 .more_info").eq(1).find("li").eq(1).find("strong").html(per_assurescale_value.substring(0,per_assurescale_value.length-2)+"<em>"+ per_assurescale_value.substr(-2) +"%</em>");//可用
				    var fund_asset = common.numToMoneyType(data.fund_asset,2); //现金
				    $(_pageId+" .hold_main2 .more_info").eq(0).find("li").eq(2).find("strong").html(fund_asset.substring(0,fund_asset.length-2)+"<em>"+ fund_asset.substr(-2) +"</em>");//可用
				    var fin_debit = common.numToMoneyType(data.fin_debit,2); //融资负债
//				    $(_pageId+" .hold_main2 .more_info").eq(1).find("li").eq(0).find("strong").html(fin_debit.substring(0,fin_debit.length-2)+"<em>"+ fin_debit.substr(-2) +"</em>");//可用
				    var slo_debit = common.numToMoneyType(data.slo_debit,2); //融券负债
//				    $(_pageId+" .hold_main2 .more_info").eq(1).find("li").eq(2).find("strong").html(slo_debit.substring(0,slo_debit.length-2)+"<em>"+ slo_debit.substr(-2) +"</em>");//可用
				    
				    var sum_compact_interest = common.numToMoneyType(data.sum_compact_interest,2); //合约总利息
//				    $(_pageId+" .hold_main2 .more_info").eq(1).find("li").eq(3).find("strong").html(sum_compact_interest.substring(0,sum_compact_interest.length-2)+"<em>"+ sum_compact_interest.substr(-2) +"</em>");//可用
				    var market_value = common.numToMoneyType(data.market_value,2); //证券市值
				    $(_pageId+" .hold_main2 .more_info").eq(0).find("li").eq(3).find("strong").html(market_value.substring(0,market_value.length-2)+"<em>"+ market_value.substr(-2) +"</em>");//可用
				    
					assets_Timer =  window.setTimeout(queryCapital, 10000);//定时刷新
				}else{
					clearAssetsTimer();
					$(_pageId+".hold_main2 .inner>strong").text("--");//总资产
					$(_pageId+".hold_main2 .more_info li strong").text("--");//市值
				}
			}
			else{
				clearAssetsTimer();
				$.alert(data.error_info);
			}
		}

		if(!myScroller){
			initScroller();
		}else{
			myScroller.refresh();
		}
	}
	
	function clearAssetsTimer(){
		if (assets_Timer != null ) {
	        window.clearTimeout(assets_Timer);
	    }
		assets_Timer = null;
	}
	
	function queryPosition(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "password":password
		};
		service_credit.cc_query(param,queryPositionCallback,{
			"isLastReq":true,
			"isShowWait":false,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
				$(_pageId+ ".no_data").show();
				if(!myScroller){
					initScroller();
				}else{
					myScroller.refresh();
				}
			}
		});
	}
	function queryPositionCallback(data){
		var htmlTop = "<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>";
		if (data && data != "undefined") {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					float_yks = 0; //浮动盈亏
					for (var i=0;i<results.length;i++){ 
						float_yks += Number(results[i].float_yk);//计数总浮动盈亏
						htmlTop += queryPositionHTML_stock(results[i]);
					}
					// $(_pageId+".fund_table").css("height","holdHeight");
					$(_pageId+".fund_table .ce_table").html(htmlTop);
					$(_pageId+".no_data").hide();
				}
				else{
					$(_pageId + ".no_data").show();
				}
				position_Timer = window.setTimeout(queryPosition, 10000);//定时刷新
			}else{
				$.alert(data.error_info);
			}
			
		}
		
		if(!myScroller){
			initScroller();
		}else{
			myScroller.refresh();
		}
	}
	
	function clearPositionTimer(){
		if (position_Timer != null ) {
	        window.clearTimeout(position_Timer);
	    }
		position_Timer = null;
	}
	/**
	 * 证券持仓HTML生成
	 */
	function queryPositionHTML_stock(element){
		var price_digit = 3;
		var eleHtml = "";
		var css = "";
		var float_yk = Number(element.float_yk);//浮动盈亏
		if(float_yk>0){
			css = "ared";
		}else if(float_yk<0){
			css = "agreen";
		}
		float_yk = float_yk.toFixed(price_digit);
		eleHtml+="<tr class=\"position_data\" id="+element.stock_code +">";
		eleHtml+="<td><strong>"+element.stock_name +"</strong><small>"+Number(element.market_value).toFixed(price_digit) +"</small></td>";
		eleHtml+="<td><span class=\""+css+"\">"+float_yk+"</span><span class=\""+css+"\">"+element.float_yk_per+"%</span></td>";
		eleHtml+="<td>"+Number(element.cost_amount)+"<br/>"+Number(element.enable_amount)+"</td>";
		eleHtml+="<td>"+Number(element.cost_price).toFixed(price_digit)+"<br/>"+Number(element.last_price).toFixed(price_digit)+"</td>";
		eleHtml+="</tr>";
		return eleHtml;
	}
	
	
	/**
	 * 初始化上下滑动组件
	 */
	function initScroller()
	{
		var scrollOptions = {
			scrollerHeight: vIscrollHeight, // 滚动组件的高度
			pullThreshold: 5, // 拖动刷新或者加载的阀值，默认 5 像素
			$wrapper: $(_pageId + " #wrapper"),
			hasPullDown: true, // 是否显示下拉提示，默认 true
			hasPullUp: false, // 是否显示上拉提示，默认 true
			isAlwaysShowPullUp: false, // 是否一直显示上拉提示，true 一直显示上拉加载的提示，false 仅在上拉的时候显示提示，默认 true
			pullDownHandler: function(){
				queryData();// 模拟查询接口数据操作
			},
			pullUpHandler: function(){
			}
		};
		if(!myScroller)
		{
			// 内容的高度比滚动区域高度小时
			// iscrollUtils 已有相同判断的代码，此处这样写的目的是为了解决 Android UC、微信等浏览器滚动失效的问题，在 iscrollUtils 设置高度，在初始化组件时，取到的值不准确
			if(scrollOptions.$wrapper.find("[data-is-content='true']").height() <= scrollOptions.scrollerHeight)
			{
				scrollOptions.$wrapper.children().height(scrollOptions.scrollerHeight + 1);
			}
			myScroller = iscrollUtils.vScroller(scrollOptions);
		}
		else
		{
			myScroller.refresh();
		}
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		clearPositionTimer();
		clearAssetsTimer();
	    canBuy = 0 ;//可用
	    market_val = 0 ;//市值
		$(_pageId+".hold_table tr td strong").text("--");//总资产
		if(myScroller)
		{
			myScroller.destroy();
			myScroller = null;
		}
		$(_pageId+".fund_table .ce_table tr.tools").hide();
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});