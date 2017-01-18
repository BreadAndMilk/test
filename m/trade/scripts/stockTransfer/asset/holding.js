/**
 * 股份转让-持仓
 */
define('trade/scripts/stockTransfer/asset/holding.js',function(require, exports, module) {
	
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var service_stock = require("service_stock");
    var vIscrollHeight = null;
    var iscrollUtils = require("iscrollUtils");
	var myScroller = null; // 滑动组件对象
    
    var canBuy = 0 ;//可用
    var float_yks = 0 ;//市值
    var _pageId = "#stockTransfer_asset_holding ";
    var position_timer = null; //持仓定时器
    var commonFunc = require("commonFunc");
    var userInfo = null;
    
    //选择标志,点击底部持仓后获的
    var statusTr="";
    
    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
    }
	
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("stockTransfer/asset/holding","account/index",{},true);
		});
		//转账
		$.bindEvent($(_pageId + "#transfer"), function(e){
			$.setSStorageInfo("whichAccount","stock_userInfo");
			$.setSStorageInfo("whichPage","stockTransfer/asset/holding");
			$.pageInit("stockTransfer/asset/holding","banking/transfer",{});
		},"click");
	}
  
    
    function load(){
    	common.bindStockEvent($(_pageId+".tab_nav ul li a"),
			function(pageCode,topage){
				$.pageInit(pageCode,topage,$.getPageParam(),'',true);
			});
			
		var mianHeight = common.setMainHeight(_pageId, false);
		vIscrollHeight = mianHeight - $(_pageId+".tab_nav").height();
		if(!myScroller){
			initScroller();
		}else{
			myScroller.refresh();
		}
		queryData();
    }
    
	/**
	 * 查询
	 */
	function queryData(){
		if (position_timer != null ) {
	        window.clearInterval(position_timer);
	    }
		//查询资金账户
		queryCapital();
		//查询持仓
		if (position_timer != null ) {
	        window.clearInterval(position_timer);
	    }
		window.setTimeout(queryPosition,100);
        position_timer = window.setInterval(queryPosition, 10000);
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
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "password":password,
			    "cust_code":cust_code
		};
		$(_pageId+ ".no_data").hide();
		//最后一个为超时处理函数
		service_stock.queryFundSelect(param,queryCapitalCallback,
		{  //传给接口的json格式数据            
		"isLastReq":true,                
		"isShowWait":true,
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
				var results = data.results;
				if(results && results!= "undefined" && results.length >0){
					for(var i=0;i<results.length;i++){
						if(results[i].money_type=="0"){
							var assert_val = common.numToMoneyType(""+Number(results[i].assert_val).toFixed(2)+"");
							$(_pageId+".hold_main2 .inner>strong").html(assert_val.substring(0,assert_val.length-2)+"<em>"+ assert_val.substr(-2) +"</em>");//总资产
							var fetch_balance = common.numToMoneyType(""+Number(results[i].fetch_balance).toFixed(2)+"");
							$(_pageId+".hold_main2 .more_info li:eq(2)").find("strong").html(fetch_balance.substring(0,fetch_balance.length-2)+"<em>"+ fetch_balance.substr(-2) +"</em>");//可取
							var enable_balance = common.numToMoneyType(""+Number(results[i].enable_balance).toFixed(2)+"");
							$(_pageId+".hold_main2 .more_info li:eq(0)").find("strong").html(enable_balance.substring(0,enable_balance.length-2)+"<em>"+ enable_balance.substr(-2) +"</em>");//可用
							//总盈亏
							var total_income_balance = common.numToMoneyType(""+Number(results[i].total_income_balance).toFixed(2)+"");
							$(_pageId+".hold_main2 .more_info li:eq(1)").find("strong").html(total_income_balance.substring(0,total_income_balance.length-2)+"<em>"+ total_income_balance.substr(-2) +"</em>");
							//市值
							var market_val = common.numToMoneyType(""+Number(results[i].market_val).toFixed(2)+"");
							$(_pageId+".hold_main2 .more_info li:eq(3)").find("strong").html(market_val.substring(0,market_val.length-2)+"<em>"+ market_val.substr(-2) +"</em>");
						}
					}
				}else{
					$(_pageId+".hold_main2 .inner>strong").text("--");//总资产
					$(_pageId+".hold_main2 .more_info li strong").text("--");//市值
				}
			}
			else{
				$.alert(data.error_info);
			}
			if(!myScroller){
					initScroller();
				}else{
				myScroller.refresh();
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
		    "sessionid":sessionid
		};
		service_stock.queryStockData(param,function(data){
			if (data && data != "undefined") {
				if(data.error_no == 0){
					var results = data.results;
					if(results && results.length>0){
						var html = "<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>";
						float_yks = 0; //浮动盈亏
						for (var i=0;i<results.length;i++){ 
							 float_yks += Number(results[i].float_yk);//计数总浮动盈亏
							 html += queryPositionHTML_stock(results[i]);
						}
						$(_pageId+".fund_table .ce_table").html(html);
						$(_pageId+".no_data").hide();
						//还原上一个状态的持仓
						if(statusTr){
							var tr=$(_pageId+".fund_table .ce_table #"+statusTr);
							tr.addClass("active");
							tr.next().show();
						}
						//卖出事件
//						$.bindEvent($(_pageId+".fund_table .ce_table tr"), function(e){
////							$(this).next().slideToggle("normal", function(){
////								vIscroll.scroll.refresh();
////							});
//							if($(this).attr("class")=="active"){
//								statusTr="";
//								$(this).removeClass("active");
//								$(_pageId+".fund_table .ce_table tr.tools").hide();
//							}else if($(this).attr("class")=="tools"){
//								statusTr="";
//								$(this).hide();
//								$(_pageId+".fund_table .ce_table tr").removeClass("active")
//							}else{
//								statusTr=$(this).attr("id");
//								$(_pageId+".fund_table .ce_table tr").removeClass("active")
//								$(_pageId+".fund_table .ce_table tr.tools").hide();
//								$(this).addClass("active");
//								$(this).next().show();
//							}
//							e.stopPropagation();
//						},"click");
						
//						$.bindEvent($(_pageId+".fund_table .ce_table tr.tools a"), function(e){
//							$(this).unbind();
//							this.click = null;
//							$(_pageId+".fund_table .ce_table tr.tools").hide();
//							$(this).siblings().removeClass("active");
//							var stock = $(this).parents("tr.tools").prev();
//							var stock_code = stock.attr("id");
//							var stockName = stock.find("td").eq(0).find("strong").text();
//							var id = $(this).attr("id");
//							if(id == "buy"){
////								$.pageInit("ggt/ggtHolding","ggt/ggtBuy",{"stockCode":stock_code});
//							}
//							else if(id == "sell"){
////								$.pageInit("ggt/ggtHolding","ggt/ggtSell",{"stockCode":stock_code});
//							}
//							else if(id == "hq"){
//								var stockInfo = {
//									"market":"HK",
//									"stockCode":stock_code,
//									"stockName":stockName,
//									"stockType":"99"
//								}
//								window.sendDirect4Shell(gconfig.seaBaseUrl + "hq/index.html#!/hq/ggStockInfo.html?stockInfo=" + JSON.stringify(stockInfo));
//							}
//							e.stopPropagation();
//						},"click");
					}else{ 
						$(_pageId+".fund_table .ce_table").html("<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>");
						$(_pageId+".no_data").show();
					}
				}else{
					$(_pageId+".fund_table .ce_table").html("<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>");
					$(_pageId+".no_data").show();
					$.alert(data.error_info);
				}
				if(!myScroller){
					initScroller();
				}else{
					myScroller.refresh();
				}
			
			}else{
				$(_pageId+".fund_table .ce_table").html("<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>");
				$(_pageId+".no_data").show();
				$.alert("查询失败");
			}
			
			
		},{"isLastReq":true,"isShowWait":false,"isShowOverLay":false,
			"timeOutFunc":function(){ // 超时调用方法
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
	 * 证券持仓HTML生成
	 */
	function queryPositionHTML_stock(element){
		var price_digit = 3
		var eleHtml = "";
		var css = "";
		var float_yk = Number(element.float_yk);//浮动盈亏
		if(float_yk>0){
			css = "ared";
		}else if(float_yk<0){
			css = "agreen";
		}
		float_yk = float_yk.toFixed(price_digit);
		eleHtml+="<tr class=\"\" id="+element.stock_code +">";
		eleHtml+="<td><strong>"+element.stock_name +"</strong><small>"+Number(element.market_value).toFixed(2)+"</small></td>";
		eleHtml+="<td><span class=\""+css+"\">"+float_yk+"</span><span class=\""+css+"\">"+Number(element.float_yk_per).toFixed(2)+"%</span></td>";
		eleHtml+="<td>"+Number(element.cost_amount)+"<br/>"+Number(element.enable_amount)+"</td>";
		eleHtml+="<td>"+Number(element.cost_balance).toFixed(price_digit)+"<br/>"+Number(element.last_price).toFixed(price_digit)+"</td>";
		eleHtml+="</tr>";
		eleHtml+="<tr class=\"tools\" style=\"display: none;\"><td colspan=\"4\"><ul>";
		eleHtml+="<li><a id=\"buy\" href=\"javascript:void(0);\"><span>买入</span></a></li>";
		eleHtml+="<li><a id=\"sell\" href=\"javascript:void(0);\"><span>卖出</span></a></li>";
		eleHtml+="<li><a id=\"hq\" href=\"javascript:void(0);\"><span>行情</span></a></li>";
		eleHtml+="</ul></td></tr>";
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
		if (position_timer != null ) {
	        window.clearInterval(position_timer);
	    }
		position_timer = null;
	    canBuy = 0 ;//可用
	    market_val = 0 ;//市值
		$(_pageId+".hold_main2 .inner>strong").text("--");//总资产
		$(_pageId+".hold_main2 .more_info li strong").text("--");
		
		if(myScroller)
		{
			myScroller.destroy();
			myScroller = null;
		}
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("stockTransfer/asset/holding","account/index",{});
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