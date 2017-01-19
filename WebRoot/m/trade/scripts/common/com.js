/**
 * 交易模块公用 js
 */
define('trade/scripts/common/com.js', function(require, exports, module) {
    var gconfig = $.config;
    var global = gconfig.global;

	/**
	 * 每个页面校验
	 */
	function checkPermission(a,checkInParam,b){
		document.activeElement.blur();
		if(checkInParam){
			if(checkInParam.param){
				var chancel = checkInParam.param.chancel;
				if(chancel){
					global.channel = chancel;//渠道
					$.setSStorageInfo("_channel",chancel);
				}
				var source = checkInParam.param.source;
				if(source){
					global.opStationInfo = source;//来源
					$.setSStorageInfo("_source",source);
				}
				var hardware = checkInParam.param.auth_bind_station;
				if(hardware){
					global.hardId = hardware;//硬件特征码
					$.setSStorageInfo("_hardware",hardware);
				}
				var phone = checkInParam.param.phone;
				if(phone){
					global.activePhone = phone;//手机号
					$.setSStorageInfo("_phone",phone);
				}
				var macAddr = checkInParam.param.mac;
				if(macAddr){
					global.macAddr = macAddr;//手机号
					$.setSStorageInfo("_macAddr",macAddr);
				}
			}
			if(checkInParam.pageCode == "account/login"){
				if(global.phoneActivation && !$.getLStorageInfo("cert_no")){
					$.pageInit(checkInParam.pageCode,"account/activePhone",checkInParam.param);
					return false;
				}	
			}
		}
		return true;
	}
	
	/**
	 * 首次进入模块的时候，调用
	 */
	function firstLoadFunc(){
		if(document.referrer){
			$.setSStorageInfo("_referrer",document.referrer);
		}
		
		$.setSStorageInfo("_lastDoTime",new Date().getTime());
		
		$.bindEvent("body",function(){ // 当页面有操作时记录最后操作时间
			$.setSStorageInfo("_lastDoTime",new Date().getTime());
		},"click");
		
		$.bindEvent("body",function(){ // 当页面有操作时记录最后操作时间
			$(this).unbind("click");
			this.click = null;
			$.setSStorageInfo("_lastDoTime",new Date().getTime());
		},"touchstart");
		$.modal.prototype.defaults.modalButtonOk= "确定";
		$.showIndicatorHtml = function(){};//加载页面等待菊花
		$.hideIndicatorHtml = function(){};//加载页面隐藏菊花 把菊花方法重置
		
      	$.toastHtml = function(){
      		$.alert("网络不通，页面加载失败");
      	}; //加载页面如果断网，会有这个提示$.toastHtml("加载失败");，可以重写
		
		getGlobal();
		
		if(global.phoneActivation) isUserActive();
		
		if(global.callNative) getCallNative();
		require.async("zeptoExtend");
		if(global.shareCookie){
			require.async("aes");
			require.async("endecryptUtils");
		}
	}
	
	function getGlobal(){
		var channel = $.getSStorageInfo("_channel");
		if(channel){
			global.channel = channel;
		}
		var source = $.getSStorageInfo("_source");
		if(source){
			global.opStationInfo = source;
		}
		var hardware = $.getSStorageInfo("_hardware");
		if(hardware){
			global.hardId = hardware;
		}
		var macAddr = $.getSStorageInfo("_macAddr");
		if(macAddr){
			global.macAddr = macAddr;
		}
	}
	
	/**
	 * 判断用户是否激活
	 */
	function isUserActive()
	{
		var phoneNum = $.getLStorageInfo("mobilePhone");
		var hardsn = $.getLStorageInfo("cert_no");
		if(phoneNum && hardsn){
			global.activePhone = phoneNum;//手机号
			if(global.activationTime){
				var hardsns = hardsn.split("|");
				if(new Date().getTime() - Number(hardsns[0]) < 1000*60*60*global.activationTime){
					queryActivation(phoneNum, hardsn);
				}
				else{
					$.clearLStorage("cert_no");
				}
			}
			else{
				queryActivation(phoneNum, hardsn);
			}
		}
	}

	function queryActivation(phoneNum, hardsn){
		var parem = {
			"funcNo":"901931",
			"phone": phoneNum,
			"hardsn": hardsn
		};
		$.ajax({
    		url: global.unifyUrl,
    		type: "post",
    		data: parem,
    		async : true,
    		timeout : "10000",
    		dataType: "json",
    		success: function(data){
				if(data){
					if (data.error_no == 0) {
						if(data.results && data.results[0] && data.results[0].flag == "1"){
							global.activePhone = phoneNum;//手机号
//							$.setSStorageInfo("_isActivation","true");
						}
						else{
							global.activePhone = '';//手机号
							$.clearLStorage("cert_no");
						}
					}
				}
		
    		},
    		error: function(xhr, errorCode){
    		}
    	});
	}
	
	function checkFunc(url, noAnimation, replace, reload,param,pagecode,prePageCode,_callback,direct){
		var pageCode = pagecode;
//		debugger;
//		console.log(param);
		var param = {
			"topage": pageCode,
			"param": param
			};
		$.pageInit(pageCode,"account/login",param,"",true);
	}
	
	
	function getCallNative(){
		require.async("msgFunction",function(module){
			$.callMessage({"funcNo": "50100", "moduleName":"trade"});
	   	});	
		require.async("",function(module){
	    });
	}
	
	
	var base = {
    	"checkPermission": checkPermission,
    	"firstLoadFunc":firstLoadFunc,
    	"checkFunc":checkFunc
    };

    module.exports = base;
});