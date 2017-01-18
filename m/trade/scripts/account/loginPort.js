/**
 * 交易模块公用 js
 */
define('trade/scripts/account/loginPort.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var service_common = require("service_common");
	require("validatorUtils");
	var validata = $.validatorUtils;
	require("rsa");
	require("endecryptUtils");
	var common = require("common");
	var _pageId = "#account_login ";
	var mobilekey = null;
	var topage = "";
	var loginClass = "0";
	var remember_account = {};
	/**
	 * 每个页面校验
	 */
	function into(_topage,_loginClass){
		topage = _topage;
		loginClass = _loginClass;
		getTicketImg();
		getAccount(loginClass);
		if($.getPageParam("param") && $.getPageParam("param")["account"]){
			$(_pageId+" #saveAcc .c1").removeAttr("checked");
			$(_pageId + "#account").val($.getPageParam("param")["account"]); // 华龙311700014065  华安170010779
		}
		return true;
	}
	
	/**
	 * 获取验证码
	 */
	function getTicketImg(){
		var ticket_key = getRndNum(10);
		mobilekey = ticket_key;
		var randomImg = gconfig.global.validateimg +"?r="+ ticket_key+"&mobileKey="+ticket_key;
		$(_pageId+" #randomImg").attr("src", randomImg);
	}
	
	/**
	 * 获取随机数
	 */
	function getRndNum(n){
	    var rnd = "";
	    for(var i = 0; i < n; i++){
		  	rnd += Math.floor(Math.random() * 10);
	    }
	    return rnd;
	}

	
	/**
	 * 校验登录账号,交易密码,手机验证码
	 */
	function checkInput(){
		if(validata.isEmpty($(_pageId + "#account").val())){
			$.hidePreloader();
			$.alert("登录账号不能为空");
			return false;
		}
		if(validata.isEmpty($(_pageId + "#password").val())){
			$.hidePreloader();
			$.alert("密码不能为空");
			return false;
//		}else if(!/^[0-9a-zA-Z]{6,12}$/.test($(_pageId+"#password").val())){
//			$.hidePreloader();
//			$.alert("密码只允许输入0-9、a-z、A-Z且长度为6-12位");
			return false;
		}
		if(validata.isEmpty($(_pageId + "#ticket").val())){
			$.hidePreloader();
			$.alert("验证码不能为空");
			return false;
		}
		return true;
	}
	
	/**
	 * 通过短信验证,或者格式校验后登陆
	 */
	function submitLogin(){
		$.showPreloader("请等待...");
		// 登录时获取页面手机号码
		var account = $(_pageId + "#account").val();
		var password = $(_pageId + "#password").val();
		var ticket = $(_pageId + "#ticket").val();
		var input_type = $(_pageId + "#loginKind p").attr("id");
		// 密码加密
		service_common.getKey({},function(data){
			if(data.error_no != "0"){
				$.hidePreloader();
				$.alert(data.error_info);
				return false;
			}else{
				// 参数固定,是密码加密的参数
				var modulus = data.results[0].modulus;
				var publicExponent = data.results[0].publicExponent;
				var endecryptUtils = $.endecryptUtils;
				if(password){
					password = endecryptUtils.rsaEncrypt(modulus,publicExponent,$.trim(password));
				}
				loginFuc(); // 调用登录接口
			}
		},{"isLastReq":false});
		
		var loginFuc = function(){
			// 调用登录接口实现接口
			var param = {
					"entrust_way": global.entrust_way,	// 委托方式  在configuration配置 
					"input_type": input_type,		    // 手机登陆
					"input_content": account,			// 手机号码
					"password": password,
					"ticket":ticket,
					"content_type" : "",                // 客户标识类型
					"mobilekey":mobilekey,
					"account_type":loginClass,
					"login_type": loginClass
			};
			service_common.login(param,function(data){
				if(data.error_no != 0){
					$(_pageId + "#ticket").val("");
					getTicketImg(); // 获取验证码
					$.hidePreloader();
					$.alert(data.error_info);
					return false;
				}else{
					var results = ""; // 适配单结果集和多结果集
                    if(data.DataSet){
                    	results = data.DataSet;
                    }else if(data.results){
                    	results = data.results;
                    }
                    
					if(results && results.length > 0){
//						results[0].password = password; // 保存交易密码
						results[0].loginType = input_type; //保存登陆类型
						results[0]._loginClass = loginClass;
						
						/**
						 * 存储登录用户信息（将登录的账号信息保存在了本地，key：userInfos）（返回什么，直接保存了什么）
						 */
						common.setAccountInfos(results);
						
	                    //此处为保存账号逻辑
						var saveAcc = $(_pageId + "#account").val();
						var isChecked = $(_pageId + "#saveAcc input").attr("checked");
						if(isChecked && (isChecked == "true" || isChecked == "checked")){
							isChecked = false;
						}
						else{
							isChecked = true;
						}
						
						//保存登录用户信息到本地（这里保存的是第一个信息，key：...._userInfo）
						common.setCurUserInfo(results[0]);
						
						//保存股东账号（深市、沪市）
						common.saveStockAccount(results);
						
						//保存登录成功的账号及登录类型到本地缓存
						setAccount(loginClass, saveAcc, input_type, isChecked); // 保存登录成功并且选择记住的账号
						
						if(data.DataSet3){
							global.trade_flag = data.DataSet3[0].trade_flag; // 是否统一登录标识
						}
						
					    $.hidePreloader();
					    
						if(topage && topage.indexOf("credit/transferred/") == 0){
							$.pageInit("account/login","credit/transferred/collateralTransfer",$.getPageParam("param"),null,true);
						}else{
							$.pageInit("account/login",topage,$.getPageParam("param"),null,true);
						}
					}else{
						$.hidePreloader();
						getTicketImg(); // 获取验证码
						$(_pageId + "#ticket").val("");
						$.alert("登录失败！");
					}
				}
			},{"isLastReq":false});
	    };
    }
	
	/**
	 * 保存登录的账号(保存的是当前登录的账号和对应的登录类型)
	 */
	function setAccount(type,saveAcc,accType,isChecked){
		//直接到缓存里面去拿账号
		var remember = $.getLStorageInfo("remember_account");
		if(remember && remember != "null" && remember != "0"){   //表示从缓存中拿到了账号
			remember = JSON.parse(remember);
			if(remember){
				remember_account = remember;   //remember_account表示的就是从缓存中拿到账号并转成了JSON格式
			}
		}
		var accounts = remember_account[common.dealType(type)];
		if(!accounts){
			accounts = [];
		}
		
		//数组去重
		accounts = common.unshiftDeleteSame(accounts, saveAcc+"||"+accType, isChecked);   //["110018148||5"]
		
		remember_account[common.dealType(type)] = accounts;   //remember_account["stock"] = ["110018148||5"]
		
		$.setLStorageInfo("remember_account",JSON.stringify(remember_account));
	}
	
	/**
	 * 获取保存的账号
	 */
	function getAccount(type){
		// 获取保存在缓存中的账号
		var remember = $.getLStorageInfo("remember_account");
		if(remember && typeof(remember) == "string" && remember != "null" && remember !="0"){
			remember = JSON.parse(remember);
			remember_account = remember;
		}
		if(remember_account && remember_account[common.dealType(type)] && remember_account[common.dealType(type)][0]){
			var account = remember_account[common.dealType(type)][0].split("||");
			$(_pageId+"#saveAcc .c1").attr("checked",true);
			$(_pageId+"#account").val(account[0]);
			if(account[1]){
				var txt = $(_pageId + "#loginKind ul li[type=\""+type+"\"][id=\""+account[1]+"\"]").text();
				if(txt){
					$(_pageId + "#loginKind p").attr("id",account[1]);
					$(_pageId + "#loginKind p").text(txt);
				}
			}
		}else{
			$(_pageId+" #saveAcc .c1").removeAttr("checked");
		}
	}
	
	var base = {
    	"into": into,
    	"checkInput": checkInput,
    	"submitLogin": submitLogin,
    	"getTicketImg": getTicketImg,
    	"getAccount": getAccount,
    	"remember_account": remember_account
    };

    module.exports = base;
});