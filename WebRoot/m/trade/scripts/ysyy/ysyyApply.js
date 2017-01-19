/**
 * 预售要约-申报
 */
define(function(require, exports, module) {
	
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	
	var service_stock = require("service_stock");
	var _pageId = "#ysyy_ysyyApply ";
	var userInfo = null;
    var position_timer = null; //持仓定时器
    var _stock_code="";
    var _exchange_type="";
    var _stockAccount="";
    var _entrust_price=0;
	/**
     * 初始化
     */
	function init(){
		var height_table = $(window).height() - $(_pageId+".header").height() - $(_pageId+".tab_nav").height() - $(_pageId+".trade_main").height()-27;
		 $(_pageId+".offer_main").height(height_table);   //给持仓数据添加高度
		common.systemKeybord(); // 解禁系统键盘
		common.bindStockEvent(_pageId); //绑定头部菜单事件
//		$(_pageId+".offer_main .select_box").addClass("deleteBefore");
		userInfo = common.getCurUserInfo();
		$(_pageId+".offer_main .max").hide();
		queryData();
    }
	
	
	/**
	 * 查询
	 */
	function queryData(){
		if (position_timer != null ) {
	        window.clearInterval(position_timer);
	    }
		//查询持仓
		if (position_timer != null ) {
	        window.clearInterval(position_timer);
	    }
		window.setTimeout(queryPosition(),100);
        position_timer = window.setInterval(queryPosition(), 10000);
	}
	
	function queryPosition(){
		 return function() {//为了解决定时器不能传参数的问题	 
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
			var branch_no = userInfo.branch_no;	
			var fund_account = userInfo.fund_account;
			var cust_code = userInfo.cust_code;//关联资产账户标志
			var sessionid = userInfo.session_id;
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
						console.info(results);
						var str="";
						if(results && results.length>0){
							for(var i=0; i<results.length; i++){
								str+="<li stock_code="+results[i].stock_code+" exchange_type="+results[i].exchange_type+" stockAccount="+results[i].stock_account+" enable_amount="+results[i].enable_amount+" entrust_price="+results[i].cost_balance+" ><a href=\"javascript:void(0)\">"+results[i].stock_name+"</a></li>";
//								$(_pageId+".select_box ul li").eq(i).attr({"stock_code":results[i].stock_code,"cost_balance":results[i].stock_code});
							}
							$(_pageId+".select_box ul").html(str);
						}else{ 
							$(_pageId+".select_box p").html("请选择需要申报的证券");
						}
					}else{
						$(_pageId+".select_box p").html("请选择需要申报的证券");
						$.alert(data.error_info);
					}
				}else{
					$(_pageId+".select_box p").html("请选择需要申报的证券");
					$.alert("查询失败");
				}
				
			},{"isLastReq":true,"isShowWait":false,"isShowOverLay":false});
		 };
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("voting/netVote","account/index");
			cleanPage();
			e.stopPropagation();
		});
		
		$.bindEvent($(_pageId+".select_box"),function(e){
			$(_pageId+" .select_box ul").slideToggle("fast");
			e.stopPropagation();	// 阻止冒泡
		});
		
		$.preBindEvent($(_pageId+".select_box ul"),"li",function(e){
			console.info($(this));
			console.info($(this).attr("stock_code"));
			_stock_code = $(this).attr("stock_code");
			_exchange_type = $(this).attr("exchange_type");
			_stockAccount = $(this).attr("stockAccount");
			console.info(_stockAccount);
			console.info(_exchange_type);
			console.info(_entrust_price);
			_entrust_price = $(this).attr("entrust_price");
			var enable_amount=$(this).attr("enable_amount");
			$(_pageId+".offer_main .max").show();
			$(_pageId+".offer_main .max span").html(enable_amount);
			$(_pageId+".select_box p").html("<strong>"+$(this).text()+"</strong>");
			$(_pageId+"#amount").val("");
		});
		
		$.bindEvent($(_pageId+".ce_btn"),function(e){
			
			submit();
		});
		
	}
	
	//提交申报
	function submit(){
		var amount=$(_pageId+"#amount").val();
		var stockName = $(_pageId+".select_box p").html();
		if(stockName == "请选择需要申报的证券"){
			$.alert("请选择需要申报的证券");
			return;
		}
		if(amount == ""){
			$.alert("请输入正确的数量");
			return;
		}
		var _amount=$(_pageId+".offer_main .max span").html();
		if(amount>_amount){
			$.alert("请输入正确的数量");
			return;
		}
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account;	//资金账号
		var branch_no  = userInfo.branch_no;	//分支机构
		var sessionid=userInfo.session_id;
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var password=userInfo.password;
		var entrust_bs="56";		
		var entrust_price=Number(_entrust_price).toFixed(2);
		var entrust_amount=_amount;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"entrust_bs":entrust_bs,
				"exchange_type":_exchange_type,
				"stock_account":_stockAccount,
				"stock_code":_stock_code,
				"entrust_price":entrust_price,
				"entrust_amount":entrust_amount,
				"batch_no":""
			};
		service_stock.getStockBuy(param,getStockBuyCallBack);
	}
	
	function getStockBuyCallBack(data){
		if(data.error_no == 0){
			$(_pageId+"#msg").fadeIn(3000);
			cleanPage();
		}else{
			$.alert(data.error_info);
		}
	}
	
	function cleanPage(){
		$(_pageId+".select_box p").html("请选择需要申报的证券");
		$(_pageId+"#amount").val("");
		$(_pageId+".offer_main .max").hide();
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		if (position_timer != null ) {
	        window.clearInterval(position_timer);
	    }
		position_timer = null;
		cleanPage();
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("voting/netVote","account/index");
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});