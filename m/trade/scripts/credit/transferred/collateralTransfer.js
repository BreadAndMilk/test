/**
 * 担保品划转主页面
 */
define('trade/scripts/credit/transferred/collateralTransfer.js', function(require, exports, module) {
    var _pageId = "#credit_transferred_collateralTransfer ";
	var gconfig = $.config;
	var global = gconfig.global;
		require("validatorUtils");
	var validata = $.validatorUtils;
	var	service_credit = require("service_credit");
    var commonFunc = require("commonFunc");
    var common = require("common");
    var keyboard = require("keyboard");
    var userInfo = null;
    var judge = false;
    var isLogin = false;
    
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		isAStockLogin();
		
		
		//划转页面事件跳转
		$.bindEvent($(_pageId + ".main .search_nav ul li a"), function(e){
			if(judge){
				var topage = $(this).attr("to-page").replaceAll("_","/"); //获取跳转的页面
				var param =  $(this).attr("param");
				if(!param){
					param = "";
				}
				if(isLogin){
					loginGeneralAccount(function(){
						$.pageInit("stock/stockQuery",topage,{"param":param});
					});
				}
				else{
					$.pageInit("stock/stockQuery",topage,{"param":param}); 
				}
			}
			else{
				$.showPreloader("请等待...");
			}
		});
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		var orderHeigt = mianHeight-$(_pageId + ".main .tab_nav").outerHeight();
		$(_pageId + " .main .search_nav").height(orderHeigt-11).css("overflow","auto");
	}
	
	function loginGeneralAccount(callback){
		var pdwBox = "";
		pdwBox += '<div class="pop_main">';
        pdwBox += '<div class="input_box">';
        pdwBox += '<input type="text" id="custNo" class="text user" readonly value="'+userInfo.cust_code+'"/>';
        pdwBox += '</div><div class="input_box">';
        pdwBox += '<input js-key="password2" type="password" id="pwd" class="text pass" />';
        pdwBox += '</div></div>';
		common.iConfirm("请登录普通股票资金账户",pdwBox,function($html){
			var pwd = $html.find("input#pwd").val();
			stockALogin(pwd,callback);
		},null,"登录","取消",function($html){
			var pwd = $html.find("input#pwd").val();
			if(validata.isEmpty($html.find("input#custNo").val())){
				$.alert("登录账号不能为空");
				return false;
			}else if(validata.isEmpty(pwd)){
				$.alert("密码不能为空");
				return false;
//				}else if(pwd.length != 6){
//					$.alert("请输入6位密码");
//					return false;
			}else{
				return true;
			}
		});
		if(keyboard){
			keyboard.keyInit();
		}
	}
	
	/**
	 * 点击划转获取客户登陆信息
	 */
	function isAStockLogin(){
		if(global.serverConfig == "1"){
			judge = true;
			isLogin = false;
			$.hidePreloader();
		}
		else{
			var stock_userInfo = common.getCurUserInfo("0");
			if(global.callNative){
				stock_userInfo = $.callMessage({"funcNo":"50043","key":"userInfo"}).results[0].value;
			}
			var stockIonfo = common.getTransferInfo();
			if(common.isValue(stockIonfo)){
				judge = true;
				isLogin = false;
				$.hidePreloader();
			}
			else if(stock_userInfo && stock_userInfo.cust_code === userInfo.cust_code){
				judge = true;
				isLogin = false;
				$.hidePreloader();
				saveInfo(stock_userInfo);
			}
			else{
				popUpLayer();
			}
		}
	}
	
	function saveInfo(data,callback){
		var params = {
				entrust_way: global.entrust_way, // 委托方式  在configuration配置
				branch_no: data.branch_no, // 分支机构
				cust_code: data.client_id || data.cust_code, // 客户编号
				fund_account:data.fund_account,//资金账号（普通）
				password: userInfo.password, // 交易密码
				sessionid: data.session_id, // 会话号
				stock_account: data.stock_account, // 证券账号
				exchange_type: data.exchange_type,
				password_c: data.password,// 会话号
				stockAccounts: data.stockAccounts
	    	};
	    	var type = data.fund_account + "|";
	    	type = type + (data._loginClass ? data._loginClass : userInfo.fund_account);
			common.setTransferInfo(type,params);
			if(callback) callback();
	}
	
	function popUpLayer(){
		if(global.serverConfig == "2"){
			judge = true;
			isLogin = true;
			$.hidePreloader();
		}else{
			var param = {
					entrust_way: global.entrust_way, // 委托方式  在configuration配置
					branch_no: userInfo.branch_no, // 分支机构
					cust_code: userInfo.cust_code, // 客户编号
					fund_account:userInfo.fund_account,//资金账号（普通）
					password: userInfo.password, // 交易密码
					sessionid: userInfo.session_id, // 会话号
				};
	    	service_credit.queryStockAccount(param,function(data){
	    		if(data.error_no == "0"){
	    			judge = true;
					isLogin = false;
	    			$.hidePreloader();
	    			var stockAccounts = $.cloneFun(data.results);
	    			var datas = data.results[0];
	    			if(common.isValue(datas)){
		    			datas["stockAccounts"] = stockAccounts;
	    				saveInfo(datas);
	    			}
	    		}else{
	    			judge = true;
					isLogin = false;
	    			$.hidePreloader();
	    			$.alert(data.error_info);
	    		}		
	    	});
		}
	}
	
	/**
	 * 普通A股登陆
	 */
	function stockALogin(pwd,callback){
		commonFunc.getKey(function(pwd){
			var loginParam = {
      				"entrust_way" : global.entrust_way, // 委托方式  在configuration配置   // 委托方式
      				"branch_no" : "",  // 营业部编号
      				"input_type" : "5",  // 账号类型
      				"input_content" : userInfo.cust_code,  // 登录账号
      				"password" : pwd,  // 交易密码
      				"ticket" : '',  // 图片验证码
      				"mobileKey" : '',  // 验证码的 mobileKey
      				"ticketFlag" : "0", // 0 不需要验证码 1 需要验证码
      				"content_type" : ""  // 客户标识类型
      		};
	      	service_credit.goodsSwitchTradeLogin(loginParam,function(data){
				if(data.error_no != 0){
					$.alert(data.error_info);
				}else{
					if(data.results[0]){
						var stockAccounts = $.cloneFun(data.results);
						var userInfo = data.results[0];
						userInfo["stockAccounts"] = stockAccounts;
						userInfo.password = pwd; // 保存交易密码
						saveInfo(userInfo,callback);
					}else{
						$.alert("账户信息不足");
						return false;
					}
				}
	      	});
		},pwd);
	}

	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
//			$.pageInit("credit/transferred/collateralTransfer","account/index",{});
			$.pageBack("account/index","left");
			e.stopPropagation();
		});
		$.bindEvent($(_pageId), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			e.stopPropagation();
		})
	}
    
	/**
	 * 销毁
	 */
	function destroy(){
		if(keyboard){
			keyboard.keyDestroy();
		}
	}
	
	
	var base = {
		"init" : init,
		"load": load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});