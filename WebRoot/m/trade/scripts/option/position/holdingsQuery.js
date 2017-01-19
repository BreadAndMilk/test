/**
 * 个股期权-持仓
 */
define('trade/scripts/option/position/holdingsQuery.js', function(require, exports, module) {
	var common = require("common");
	var commonFunc = require("commonFunc");
	var gconfig = $.config;
	var global = gconfig.global;
	var service_option = require("service_option");
	var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
    var vIscrollHeight = null;
    var canBuy = 0 ;//可用
    var market_val = 0 ;//市值
    var _pageId = "#option_position_holdingsQuery ";
    var userInfo = null;
    var position_Timer = null;
    var _callback = true;
    var float_yks = 0;
    
    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		userInfo = common.getCurUserInfo();
		jumpPageEvent();
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		vIscrollHeight = mianHeight - $(_pageId+".tab_nav").height();
		queryData();//查询持仓
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){}
	
	/**
	 * 事件绑定
	 */
	function jumpPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("stock/stockHolding","account/index",{},"left",true);
			e.stopPropagation();
		});
		//转账
		$.bindEvent($(_pageId + "#transfer"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.setSStorageInfo("return_page","stock/stockHolding");
			$.pageInit("stock/stockHolding","banking/transfer",{});
			e.stopPropagation();
		}, "tap");
	}
    
	/**
	 * 查询
	 */
	function queryData(){
		clearPositionTimer();
		//查询资金账户
		queryCapital();
		queryPosition();
		_callback = false;
		if(position_Timer == null && global.positionRefreshTime){
			commonFunc.initCheckTradeTimer();
			position_Timer = window.setInterval(function(){
				if(commonFunc.getTradingTime() && _callback){
					queryCapital();
					queryPosition();
					_callback = false;
				}
			}, global.positionRefreshTime);//定时刷新
		}
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
			    "is_homepage":""
		};
		$(_pageId+ ".no_data").hide();
		//最后一个为超时处理函数
		service_option.queryAssets(param,queryCapitalCallback,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":false,
			"isShowOverLay":false
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
					for(var i=0;i<results.length;i++){
						var assert_val = Number(results[i].total_asset).toFixed(2)+"";
						$(_pageId+" .inner>strong").html(assert_val.substring(0,assert_val.length-2)+"<em>"+ assert_val.substr(-2) +"</em>");//总资产
						var fetch_balance = Number(results[i].fetch_balance).toFixed(2)+"";
						$(_pageId+" .stock_opt_value li").eq(2).find("p").html(fetch_balance.substring(0,fetch_balance.length-2)+"<em>"+ fetch_balance.substr(-2) +"</em>");//可取
						var enable_balance = Number(results[i].enable_balance).toFixed(2)+"";
						$(_pageId+" .stock_opt_value li").eq(0).find("p").html(enable_balance.substring(0,enable_balance.length-2)+"<em>"+ enable_balance.substr(-2) +"</em>");//可用
						//添加总浮动盈亏
						var css = "";
						var float_yks = float_yks = results[i].float_yk || results[i].total_income_balance;
						if(float_yks > 0){
							css = "ared";
						}else if(float_yks < 0){
							css = "agreen";
						}
						var fas = Number(float_yks).toFixed(2);
						$(_pageId+" .stock_opt_value ul li").eq(1).find("p").html(fas.substring(0,fas.length-2)+"<em>"+ fas.substr(-2) +"</em>");//盈亏
						float_yks = results[i].market_val || "0";
						var fa =  Number(float_yks).toFixed(2)//common.numToMoneyType(float_yks,2);
						$(_pageId+" .stock_opt_value ul li").eq(3).find("p").html(fa.substring(0,fa.length-2)+"<em>"+ fa.substr(-2) +"</em>");//盈亏
					}
				}else{
					$(_pageId+".stock_opt_value .inner>strong").text("--");//总资产
					$(_pageId+".stock_opt_value li p").text("--");//市值
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
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
		service_option.queryPosition(param,queryPositionCallback,{
			"isLastReq":true,
			"isShowWait":false,
			"isShowOverLay":false,
			"timeOutFunc":function(){ 
				_callback = true;
				//超时调用方法
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
		_callback = true;
		if (data && data != "undefined") {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					var htmlTop = '';
					float_yks = 0; //浮动盈亏
					for (var i=0;i<results.length;i++){ 
						float_yks += Number(results[i].float_yk);//计数总浮动盈亏
						htmlTop += queryPositionHTML_stock(results[i]);
					}
					$(_pageId+".stock_opt_list").html(htmlTop);
					$(_pageId+".no_data").hide();
					$.bindEvent($(_pageId+" .stock_opt_list .part"), function(e){
						var param ={
							"code" : $(this).attr("id"),
							"optionCode" : $(this).find("small").text()
						}
						var opthold_type = $(this).attr("opthold_type");
						var toPage="option/order/sellOpening";
						if(opthold_type == 1){
							toPage="option/order/buyingPositions"
						}else if(opthold_type == 2){
							toPage="option/order/coveredPositions"
						}
						$.pageInit("option/position/holdingsQuery",toPage,param);
						e.stopPropagation();
					}, "tap");
				}
				else{
					$(_pageId + ".no_data").show();
				}
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
	        window.clearInterval(position_Timer);
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
		var float_yk = Number(element.income_balance);//浮动盈亏
		if(float_yk>0){
			css = "ared";
		}else if(float_yk<0){
			css = "agreen";
		}
		float_yk = float_yk.toFixed(price_digit);
		eleHtml+='<div class="part">';
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
	
	/**
	 * 初始化滑动组件
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
				queryData(); // 模拟查询接口数据操作
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
		_callback = true;
	    canBuy = 0 ;//可用
	    market_val = 0 ;//市值
		$(_pageId+".stock_opt_value .inner>strong").text("--");//总资产
		$(_pageId+".stock_opt_value li p").text("--");//市值
		if(myScroller)
		{
			myScroller.destroy();
			myScroller = null;
		}
		$(_pageId+".stock_opt_list").html("");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});