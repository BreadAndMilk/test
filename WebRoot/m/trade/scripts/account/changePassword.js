/**
 * 密码修改
 */
define('trade/scripts/account/changePassword.js', function(require, exports, module) {
	require("validatorUtils");// 验证组件
	require("rsa");
	require("endecryptUtils");// 加密组件
	var validator = $.validatorUtils;
	var gconfig = $.config;
	var global = gconfig.global;
	var service_common = require("service_common");
	var common = require("common");
	var _pageId = "#account_changePassword ";
    var userInfo = null;
    var password_new ="";
    var _password_type = "1";
	var endecryptUtils = $.endecryptUtils;
    var witchAccount ="";
    var keyboard = require("keyboard");
    
    /**
     * 初始化
     */
	function init() {
		if(keyboard){
			keyboard.keyInit();
		}
		userInfo = common.getCurUserInfo();
    }
	
	function load(){
		common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent() {
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			$.pageBack("account/index","left");
			e.stopPropagation(); // 阻止冒泡
		});
		//密码修改
		$.bindEvent($(_pageId + " .ce_btn"), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			//密码修改校验
			if(!checkInput()){
				return false;
			};
			common.iConfirm("修改密码","<div>您是否确认修改密码?</div>",changePassword);
		});
		
		$.bindEvent($(_pageId), function(e){
			if(keyboard){
				keyboard.closeKeyPanel();
			}
			if(e.target !== document.activeElement)
			{
				document.activeElement.blur();
			}
		});
		$.bindEvent($(_pageId+" .toggle_nav li"), function(e){
			$(this).addClass("active").siblings().removeClass("active");
			clearBuyMsg();
			if($(this).index() == 0){
				$(_pageId + "#oldPassword").attr("placeholder","请输入原交易密码");
				$(_pageId + "#newPassword").attr("placeholder","请输入新交易密码");
				$(_pageId + "#confirmPassword").attr("placeholder","再次输入交易密码");
				_password_type = "1";
			}
			else{
				$(_pageId + "#oldPassword").attr("placeholder","请输入原资金密码");
				$(_pageId + "#newPassword").attr("placeholder","请输入新资金密码");
				$(_pageId + "#confirmPassword").attr("placeholder","再次输入资金密码");
				_password_type = "0";
			}
			e.stopPropagation();
		});
	}
    
	/**
	 * 密码修改校验
	 */
	function checkInput(){
		
		var password_old = $(_pageId + "#oldPassword").val();
		password_new = $(_pageId + "#newPassword").val();
		var password_confirm = $(_pageId + "#confirmPassword").val();
		if(validator.isEmpty(password_old)){// 
			$.alert("原密码不能为空 ");
			return false;
		}
		if(validator.isEmpty(password_new)){
			$.alert("新密码不能为空 ");
			return false;
		}
		if(validator.isEmpty(password_confirm)){
			$.alert("确认密码不能为空 ");
			return false;
		}
//		if(!/^[0-9]{6}$/.test(password_old)){
//			$.alert("原密码只允许输入6位数字");
//			return false;
//		}
		if(!/^[0-9]{6}$/.test(password_new)){
			$.alert("新密码只允许输入6位数字");
			return false;
		}
		if(!/^[0-9]{6}$/.test(password_confirm))
		{
			$.alert("确认密码只允许输入6位数字");
			return false;
		}
//		if(password_old.length != 6 || password_new.length != 6 || password_confirm.length != 6){
//			$.alert("密码长度必须为6位 ");
//			return false;
//		}
		if(password_new == password_old){
			$.alert("新密码与原密码不能相同 ");
			return false;
		}
		if(password_new != password_confirm){
			$.alert("新密码与确认密码请保持一致 ");
			return false;
		}
		return true;
	}

	
	/**
	 * 密码修改
	 */
	function changePassword(){
		//密码加密
		service_common.getKey({},function(data){
			if(data.error_no != "0"){
				//将isShowWait关闭掉(圈)
				$.hidePreloader();
				$.alert(data.error_info);
				$(_pageId + "#oldPassword").val("");
				$(_pageId + "#newPassword").val("");
			    $(_pageId + "#confirmPassword").val("");
				return false;
			}else{
				//获得旧密码和新密码
				var password_old = $(_pageId + "#oldPassword").val();
				password_new = $(_pageId + "#newPassword").val();
				var modulus = data.results[0].modulus;
				var publicExponent = data.results[0].publicExponent;
				//为旧密码和新密码加密
				if(password_old){
					password_old = endecryptUtils.rsaEncrypt(modulus,publicExponent,$.trim(password_old));
				}
				if(password_new){
					password_new = endecryptUtils.rsaEncrypt(modulus,publicExponent,$.trim(password_new));
				}
				var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
				var branch_no = userInfo.branch_no;	//分支机构 
				var fund_account = userInfo.fund_account;	//资产账户
				var cust_code = userInfo.cust_code;	//客户代码
				var password_type = _password_type;//交易密码
				var password = userInfo.password;
				var sessionid = userInfo.session_id;
				var param = {
						"entrust_way":entrust_way,
						"branch_no":branch_no,
						"fund_account":fund_account,
						"cust_code":cust_code,
						"sessionid":sessionid,
						"password":password,
						"password_new":password_new,
						"password_old":password_old,
						"passowrd_type":password_type,
						"account_type":witchAccount 
				};
				//发送修改密码请求
				service_common.updatePassword(param,updatePasswordCallBack);
			}
		},{"isLastReq":false});
		
	}
	function updatePasswordCallBack(data){
		if(data.error_no == 0){
			//需求:当客户点击确定时,才跳转到登陆页面,注意:此处的reSetting不可写为reSetting() 否则会立刻执行
			$.alert("密码修改成功,请重新登录",reSetting,"确定");
		}else{
			$.alert(data.error_info);
			clearBuyMsg();
		}

	}
	
	/**
	 * 重置session
	 */
	function reSetting(){
		common.clearUserInfo();
		$.pageInit("account/changePassword","account/login",{},"",true);
	}
	
	/**
	 * 重置页面数据  
	 */
	function clearBuyMsg(){
		$(_pageId + "#oldPassword").val("");
		$(_pageId + "#newPassword").val("");
	    $(_pageId + "#confirmPassword").val("");
	}
	
	function destroy(){
		clearBuyMsg();
		if(keyboard){
			keyboard.keyDestroy();
		}
	}
	
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});