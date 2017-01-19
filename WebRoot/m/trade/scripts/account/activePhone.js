/**
 * 交易激活
 */
define('trade/scripts/account/activePhone.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var service_common = require("service_common");
	require("validatorUtils");
	require("rsa");
	require("endecryptUtils");
	var validata = $.validatorUtils;
	var endecryptUtils = $.endecryptUtils;
    var _pageId = "#account_activePhone ";
    var isActivation = false;
    var startCountDown = null; // 验证码
    
    /**
     * 初始化
     */
	function init(){
		
    }
	
	function load(){
		var mianHeight = gconfig.appHeight;
		mianHeight = mianHeight - $(_pageId+".header").outerHeight(true) - 10;
		$(_pageId + " section.main").height(mianHeight);
		$(_pageId).css("overflow-x","hidden"); // 禁止页面左右滑动
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("account/activePhone","account/index",{"history":true},"left",true);
			e.stopPropagation();
		});
		
		// 点击发送验证码
		$.bindEvent($(_pageId + "#sendMsg"), function(e){
			var phoneNum = $(_pageId + "#phoneNum").val();
			if(!validata.isMobile(phoneNum)){
				$.alert("请输入正确的手机号码");
				return false;
			}
			// 发送验证码
			sendmsg(phoneNum);
			$(_pageId + "#phoneMsg").focus();
			e.stopPropagation();
		});
		
		// 点击下一步
		$.bindEvent($(_pageId + "#next"), function(e){
			if(verifyNext()){
				checkPhoneMsg(); // 校验验证码
			}
			e.stopPropagation();
		});
	}
	
    /**
     * 发送验证码
     */
    function sendmsg(phoneNum){
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
				if(phoneNum){
					phoneNum = endecryptUtils.rsaEncrypt(modulus,publicExponent,$.trim(phoneNum));
				}
				var param = {
					"phone" : phoneNum
				};	
		
				//请求获取验证码接口
				service_common.getSmsCode(param,function(data){
					if(data.error_no == "0"){
						if(data.results){
							if(data.results[0]){
								var vCode = data.results[0].vcode;
								if(vCode){
									$(_pageId + "#phoneMsg").val(vCode);
								}
							}
							// 计时器
							var sumTime = 60;
							// 处理获取验证码时发生的动作
							var handleCount = function(){
								// 获取验证码之后按钮隐藏
								$(_pageId + "#sendMsg").hide();
								// 显示倒计时
								$(_pageId + "#time").show();
								$(_pageId + "#time").text(sumTime--+"秒后重发");
								if(sumTime <= 0){
									clearInterval(startCountDown);
									// 显示按钮
									$(_pageId+" #sendMsg").show();
									// 隐藏倒计时
									$(_pageId+" #time").hide();
									$(_pageId+" #time").text(60);
									//关闭定时器
								}
							};
							handleCount();
							//每秒刷新下发送验证码框的数字
							startCountDown = window.setInterval(function(){
								handleCount();
							}, 1000);
				       }
					}else{
						$.alert(data.error_info);
					}
				});
			}
		},{"isLastReq":false});
		
    }
	
	/**
	 * 校验下一步
	 */
	function verifyNext(){
		var result = true;
		var phoneNum = $(_pageId + "#phoneNum").val();
		var phoneMsgNum = $(_pageId + "#phoneMsg").val();
		if(!validata.isMobile(phoneNum)){
			$.alert( "请输入正确的手机号码");
			result = false;
		}else if(phoneMsgNum == ""){
			$.alert( "验证码不能为空");
			result = false;
		}
		return result;
	}
	
	/**
	 * 校验验证码
	 */
	function checkPhoneMsg(){
		var phoneNum = $(_pageId + "#phoneNum").val();
		var phoneMsgNum = $(_pageId + "#phoneMsg").val();
		var param = {
			"phone": phoneNum,
			"vcode": phoneMsgNum
		};
		service_common.checkSmsCode(param, function(data){
			if(data){
				if (data.error_no == 0) {
					acitvePhone();//激活手机
				} else{
					$.alert(data.error_info);
				}
			}
		});
	}
	   
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId + "#phoneNum").val("");
		$(_pageId + "#phoneMsg").val("");
		if(startCountDown){
			clearInterval(startCountDown);
			startCountDown = null;
		}
		$(_pageId+" #sendMsg").show();
		$(_pageId+" #time").hide();
		$(_pageId+" #time").text(60);
	}
	
    /**
     * 激活客户的手机，并跳转页面
     */
    function acitvePhone(){
		var phoneNum = $(_pageId + "#phoneNum").val();
    	var token = new Date().getTime() +"|"+ phoneNum + Math.floor(Math.random() * 10);
		$.setLStorageInfo("mobilePhone",phoneNum);
		$.setLStorageInfo("cert_no",token);
		var parem = {
				"funcNo":"901930",
				"phone":phoneNum,
				"hardsn":token
			};
		$.ajax({
    		url: global.unifyUrl,
    		type: "post",
    		data: parem,
    		dataType: "json",
    		success: function(data){
    		},
    		error: function(xhr, errorCode){
    		}
    	});
    	global.activePhone = phoneNum;//手机号
//  	$.setSStorageInfo("_isActivation","true");
//  	global.isActivation = true;
		$.pageInit("account/activePhone","account/login",$.getPageParam(),null,true);
	}
	
	var base = {
		"init" : init,
		"load": load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});