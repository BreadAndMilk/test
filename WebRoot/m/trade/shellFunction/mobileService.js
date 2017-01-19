/**
 * 手机前端service层调用接口
 **/
define('demo/services/mobileService.js',function(require,exports,module){
	//构造方法
	function MobileService(){
		this.service = new $.service;
	}
	
	
	//用于存储h5提交请求给原生所有请求对象	
	var flowNoMap = {};
	//暴露方法供原生调用H5方法(传回服务器返回数据结果集)
	var nativeRequestCallback  = function (flowNo,resultVo){		
		$.hidePreloader();
		if(resultVo.error_no == 0)
		{			
			flowNoMap[flowNo](resultVo.results);
		}else{
			$.alert(resultVo.error_msg);
		}
         delete flowNoMap[flowNo];
	};
	
	//此方法由原生定义
    window.httpsCallback  = nativeRequestCallback;
	
	/********************************公共代码部分********************************/
    MobileService.prototype.commonInvoke = function(reqParamVo,callback, ctrlParam){
		ctrlParam = ctrlParam?ctrlParam:{};
		reqParamVo.setIsLastReq(ctrlParam.isLastReq);
		reqParamVo.setIsAsync(ctrlParam.isAsync);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		reqParamVo.setTimeOutFunc(ctrlParam.timeOutFunc);
		reqParamVo.setErrorFunc(ctrlParam.errorFunc);
		reqParamVo.setIsShowOverLay(ctrlParam.isShowOverLay);
		reqParamVo.setTipsWords(ctrlParam.tipsWords);
		reqParamVo.setDataType(ctrlParam.dataType);
		reqParamVo.setIsGlobal(ctrlParam.isGlobal);
		reqParamVo.setProtocol(ctrlParam.protocol);
		reqParamVo.setCacheTime(ctrlParam.cacheTime);
		reqParamVo.setCacheType(ctrlParam.cacheType);
		reqParamVo.setReqType(ctrlParam.reqType);
		if($.config.isFordHttpReq == 1 && $.config.platform != 0)//页面将请求发送给原生app(平台为0情况下)
		{
			var flowNo = (Math.random()+"").substring(2,10);
			flowNoMap[flowNo] = callback;
			if(reqParamVo.obj.isShowWait){
	            $.showPreloader();
	        }			
	        require.async('nativePluginService',function(nativePluginService){
	        	nativePluginService.function50118(reqParamVo.obj.url,reqParamVo.obj.reqParam,flowNo,reqParamVo.reqType,30);
	        });
			
		}else
		{	
			this.service.invoke(reqParamVo, callback);
		}
		
	};

	
	/********************************应用接口开始********************************/
	/**
	 * 功能号	29999
	 * 获取获取行情服务器状态
	 * @return 接口的响应数据
	 */
	MobileService.prototype.queryHqState = function(param,callback,ctrlParam)
    {
	    var paraMap = param || {};
		paraMap["funcno"] = "29999";	
		paraMap["version"] = param['version'];			
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl($.config.global.server);
		reqParamVo.setReqParam(paraMap);
		this.commonInvoke(reqParamVo, callback, ctrlParam);
    };
    
    /**
	 * 功能号	000101
	 * 设备查下
	 * @return 接口的响应数据
	 */
	MobileService.prototype.queryEquipmentType = function(param,callback,ctrlParam)
    {
	    var paraMap = param || {};
		paraMap["funcNo"] = "000101";	
		paraMap["equipmentType"] = param['equipmentType'];			
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl($.config.global.server);
		reqParamVo.setReqParam(paraMap);
		this.commonInvoke(reqParamVo, callback, ctrlParam);
    };
    
    /**
	 * 功能号	测试统一登录
	 * 设备查下
	 * @return 接口的响应数据
	 */
	MobileService.prototype.testSsoRequest = function(param,callback,ctrlParam)
    {
	    var paraMap = param || {};
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl($.config.global.ssoLoginUrl);
		reqParamVo.setReqParam(paraMap);
		this.commonInvoke(reqParamVo, callback, ctrlParam);
    };
    
    /**
	 *testURl地址
	 */
	MobileService.prototype.testURL = function(param,callback,ctrlParam)
    {
	    var paraMap = param || {};
		paraMap["funcNo"] = "1000000";	
		paraMap["a"] = 'aaa';			
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl($.config.global.test);
		reqParamVo.setReqParam(paraMap);
		this.commonInvoke(reqParamVo, callback, ctrlParam);
    };
    
   /********************************应用接口结束********************************/
    
    
    
    /**
	 * 释放操作
	 */
	MobileService.prototype.destroy = function(){
		this.service.destroy();
	};
	
    /**
	 * 实例化对象
	 */
	function getInstance(){
		return new MobileService();
	}
	
	var mobileService = {
		"getInstance" : getInstance
	};
	
	module.exports = mobileService;
    
 
});