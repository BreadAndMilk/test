/**
 * 获取行情service
 * */
define('trade/service/scripts/trade/service_hq.js',function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
    
	function service_hq(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	service_hq.prototype.destroy = function(){
		this.service.destroy();
	};
	module.exports = new service_hq();
	/********************************公共代码部分********************************/
    service_hq.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
		reqParamVo.setReqParam(paraMap);
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
		this.service.invoke(reqParamVo, callback);
	}

	
	/********************************应用接口开始********************************/
	
	/**
	 *  获取股票现价
	 * @param {Object} stockStr 市场代码:股票代码
	 * @param {Object} callback	回调方法
	 * */
	service_hq.prototype.getStockNowPrice=function(param,callback,ctrlParam){
	    var paraMap = {};
	    paraMap["funcno"] = "20000";
	    paraMap["version"] = 1;
	    paraMap["stock_list"] = param.stock_list;
	    paraMap["field"] ="22:24:2:10:11:9:12:14:6:23:21:3:1:45:46:48";	    
	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.HqUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 *  获取行情五档
	 * @param {Object} stockStr 市场代码:股票代码
	 * @param {Object} callback	回调方法
	 * */
	service_hq.prototype.getStockFiveStep=function(param,callback,ctrlParam){
	    var paraMap = {};
	    paraMap["funcno"] = "20003";
	    paraMap["version"] = 1;
	    paraMap["stock_list"] = param.stock_list;
	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.HqUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 *  根据股票代码，拼音简称，中文名称查询股票（可用做码表查询）
	 * @param {Object} stockStr 市场代码:股票代码
	 * @param {Object} callback	回调方法
	 * */
	service_hq.prototype.getStockList=function(param,callback,ctrlParam){
	    var paraMap = {};
	    paraMap["funcno"] = "20007";
	    paraMap["version"] = 1;
	    paraMap["type"] = param.type?param.type:"0:1:2:3:4:5:6:8:9:10:11:12:13:14:16:17:18:19:20:21:22:23:24:25:26:27:30:64:65:66";
	    paraMap["q"] = param.q;
	    paraMap["count"] = "10";
	    paraMap["field"] = "22:24:2:10:11:9:12:14:6:23:21:3:1:45:46:48";
	    paraMap["is_start"] = param.is_start;
	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.HqUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 *  获取个股行情
	 * @param {Object} stockStr 股票代码或者拼音
	 * @param {Object} callback	回调方法
	 * */
	service_hq.prototype.getStockInfo=function(param,callback,ctrlParam){
		//填充机构代码
	    var paraMap = {};
	    paraMap["funcno"] = "20010";
	    paraMap["version"] = 1;
	    paraMap["type"] = "0:1:2:3:4:5:6:8:9:10:11:12:13:14:16:17:18:19:20:21:22:23:23:24:25:26:27:30:64:65:66";
	    paraMap["code_list"] = param.code_list;
	    paraMap["field"] ="22:24:2:10:11:9:12:14:6:23:21:3:1:45:46:48";
	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.HqUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 *  获取行情服务器状态
	 * @param {Object} stockStr 市场代码:股票代码
	 * @param {Object} callback	回调方法
	 * */
	service_hq.prototype.getHqState=function(param,callback,ctrlParam){
	    var paraMap = {};
	    paraMap["funcno"] = "29999";
	    paraMap["version"] = 1;
	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.HqUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 港股通个股行情
	 * @param {Object} stockStr 市场代码:股票代码
	 * @param {Object} callback	回调方法
	 * */
	service_hq.prototype.getHqState_ggt=function(param,callback,ctrlParam){
	    var paraMap = {};
	    paraMap["funcno"] = "50000";
	    paraMap["version"] = 1;
	    paraMap["field"] = "22:24:2:10:11:9:12:14:6:1:16:3:4:5";
	    paraMap["stock_list"] = param.stock_list;
	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.HqUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 *  根据股票代码，拼音简称，中文名称查询股票（可用做码表查询）
	 * @param {Object} stockStr 市场代码:股票代码
	 * @param {Object} callback	回调方法
	 * */
	service_hq.prototype.getStockList_ggt=function(param,callback,ctrlParam){
	    var paraMap = {};
	    paraMap["funcno"] = "21007";
	    paraMap["version"] = 1;
	    paraMap["type"] = param.type?param.type:"99";
//	    paraMap["type"] = param.type?param.type:"99:0:1:2:3:4:5:6:8:9:10:11:12:13:14:16:17:18:19:20:21:22:23:24:25:26:27:30:64:65:66";
	    paraMap["q"] = param.q;
	    paraMap["count"] = "5";
	    paraMap["field"] = "22:24:2:10:11:9:12:14:6:23:21:3:1:45:46:48";
	    paraMap["is_start"] = param.is_start;
	    paraMap['marketType'] = "2";
	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.HqUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/***应用接口......................................................结束*/

});