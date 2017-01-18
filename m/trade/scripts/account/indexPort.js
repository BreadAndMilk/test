/**
 * 交易模块公用 js
 */
define('trade/scripts/account/indexPort.js', function(require, exports, module) {
    var gconfig = $.config;
	var global = gconfig.global;
    var _pageId = "#account_index ";
    var common = require("common");
    var commonFunc = require("commonFunc");
    var service_stock = require("service_stock");
    var userInfo = null;
    var timer = null;
    var _callback = true;
    var accountType = {"0":"普通账户","1":"信用账户","2":"期权账户","3":"理财账户"};

	/**
	 * 每个页面校验
	 */
	function into(pageId){
		_pageId = pageId;
		userInfo = common.getCurUserInfo();
		jumpPageEvent();
		if(common.isTradeLogin("0")){
			if(userInfo._loginClass != "0"){
				common.switchingCurUser("0");
				userInfo = common.getCurUserInfo();
			}
			assetsInquiry();
			_callback = false;
			if(timer == null && global.positionRefreshTime){
				commonFunc.initCheckTradeTimer();
				timer = window.setInterval(function(){
					if(commonFunc.getTradingTime() && _callback){
						assetsInquiry();
						_callback = false;
					}
				}, global.positionRefreshTime);//定时刷新
			}
			$.bindEvent($(_pageId + " .top_title .user_box span"), function(e){
				e.stopPropagation();
			});
			// 登录
			$.bindEvent($(_pageId + " .main>.home_value"), function(e){
				e.stopPropagation();
			});
		}
		return true;
	}
	
	/**
	 * 查询资产信息
	 */
	function assetsInquiry(){
		$(_pageId+" .top_title .user_box span").text(userInfo.fund_account+ " "+ userInfo.client_name);
		$(_pageId+" .header .logout").show();
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var money_type = "0";  //  0：人民币，1：美元，2：港币
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "money_type":money_type,
			    "is_homepage":''
		};
		service_stock.queryFundSelect(param,function(data){
			_callback = true;
			if (data && data!= "undefined"){
				if(data.error_no == 0){
					var results = data.results;
					if(results && results.length >0){
						for(var i=0;i<results.length;i++){
							if(results[i].money_type=="0"){
								var assert_val = common.numToMoneyType(results[i].assert_val,2);
								$(_pageId+".home_value .inner strong").html(assert_val.substring(0,assert_val.length-2)+"<small>"+ assert_val.substr(-2) +"</small>");//总资产
								//添加总浮动盈亏
								var css = "";
								var sign = "";
								var float_yks = float_yks = results[i].float_yk || results[i].total_income_balance;
								//当浮动盈亏,浮动盈亏比例大于0 时,在前面添加一个 "+" 
								if(float_yks > 0){
									css = "ared";
								}else if(float_yks < 0){
									css = "agreen";
								}
								var fas = sign + common.numToMoneyType(float_yks,2);
								$(_pageId+".home_value .value_box li").eq(1).find("p").html(fas.substring(0,fas.length-2)+"<small>"+ fas.substr(-2) +"</small>");//总盈亏
								//添加当日浮动盈亏
								float_yks = results[i].market_val;
								var fa = common.numToMoneyType(float_yks,2);
								$(_pageId+".home_value .value_box li").eq(0).find("p").html(fa.substring(0,fa.length-2)+"<small>"+ fa.substr(-2) +"</small>");//当日盈亏
							}
						}
					}
				}
				else{
					$.alert(data.error_info);
				}
			}
		},{
			"isLastReq":true,
			"isShowWait":false,
		});
	}
	
	
	/**
	 * 跳转页面事件
	 */
	function jumpPageEvent(){
		$.bindEvent($(_pageId + " .top_title .user_box span"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("account/index","account/login",{});
			e.stopPropagation();
		});
		// 登录
		$.bindEvent($(_pageId + " .main>.home_value"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("account/index","account/login",{});
			e.stopPropagation();
		});
		
		// 主页菜单事件绑定
		$.bindEvent($(_pageId + ".main ul li a"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			var topage = $(this).attr("to-page").replaceAll("_","/"); // 获取跳转的页面
			var param =  $(this).attr("param"); // 获取跳转页面参数
			var type = $(this).attr("type");
			if(common.isTradeLogin()){
				if(type && type.length == 1 && common.isTradeLogin(type)){
					if(!(userInfo && userInfo._loginClass == type)){
						common.switchingCurUser(type);
					}
					$.pageInit("account/index",topage,{"param":param});
				}
				else if(type && type.indexOf("|") > 0){
					if(common.loginTypeSize()== 1){
						if(type.indexOf(userInfo._loginClass) >= 0){
							$.setSStorageInfo("return_page","account/index");
							$.pageInit("account/index",topage,{"param":param});
						}
						else
						{
							$.setSStorageInfo("return_page","account/index");
							$.pageInit("account/index","account/login",{"topage":topage,"param":param});
						}
					}
					else{
						$(_pageId + ".pop_box.pop .pop_main .test_box").html("");
						var types = type.split("|");
						for(var i = 0; i < types.length; i++){
							if(common.isTradeLogin(types[i])){
								var t = types[i];
								var fund_account = common.getCurUserInfo(t).fund_account;
								var html = '<dd><span class="icon_radio"><input type="checkbox" class="r1" id="stock"/><label type="'+t+'" account="'+fund_account+'">'+accountType[t]+'<span>('+fund_account+')</span></label></span></dd>';
								$(_pageId + ".pop_box.pop .pop_main .test_box").append(html);
							}
						}
						$.bindEvent($(_pageId + ".pop_box.pop .pop_main .test_box dd"), function(e){
							$(this).find("input").attr("checked","checked");
							$(this).siblings().find("input").removeAttr("checked");
						});
						$(_pageId + ".pop_box.pop .pop_main h4 span").text($(this).find("span").text() + "操作");
						$(_pageId + ".pop_box.pop .pop_main").attr("to-page",topage);
						$(_pageId + ".backdrop").show();
						$(_pageId + ".pop_box.pop").show();
					}
				}
				else{
					$.pageInit("account/index","account/login",{"topage":topage,"param":param});
				}
			}
			else{
				$.pageInit("account/index","account/login",{"topage":topage,"param":param});
			}
			e.stopPropagation();
		}, "tap");
		
		// 账户选择确认事件
		$.bindEvent($(_pageId + ".pop_box.pop #sureBtn"), function(e){
			var checked = $(_pageId + ".pop_box.pop .pop_main .test_box .icon_radio input[checked=\"checked\"]");
			if(checked.length == 1){
				var type = checked.next("label").attr("type");
				if(!(userInfo && userInfo._loginClass == type)){
					common.switchingCurUser(type);
				}
				var topage = $(_pageId + ".pop_box.pop .pop_main").attr("to-page");
				$(_pageId + ".backdrop").hide();
				$(_pageId + ".pop_box.pop").hide();
				$(_pageId + ".pop_box.pop .pop_main .test_box").html("");
				$.setSStorageInfo("return_page","account/index");
				$.pageInit("account/index",topage,{}); 
			}
			else{
				$.alert("请选择账户");
			}
			e.stopPropagation();
		});
		
//		 注销事件
		$.bindEvent($(_pageId + ".top_title .logout"), function(e){
			var tipStr = "<div class=\"pop_main\" style=\"height: 35px;font-size:0.15rem\"><div>确定注销当前登录账号?</div></div>";
			common.iConfirm("注销账户",tipStr,function success(html){
				$.clearRequest();
				common.clearUserInfo();
				commonFunc.clearCheckTradeTimer();
				$(_pageId + ".top_title .logout").hide();
				window.setTimeout(function(){
					$.pageInit("account/index","account/login",{"topage":"account/index"},'');
				},300);
			},function fail(){
			});
			e.stopPropagation();
		});
	}
	
	function clearTimer(){
		if (timer != null ) {
	        window.clearInterval(timer);
	    }
	}
	
	var base = {
    	"into": into,
    	"clearTimer": clearTimer
    };

    module.exports = base;
});