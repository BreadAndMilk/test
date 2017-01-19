/**
 * 服务层基础模块
 */
define(function(require, exports, module) {
	var gconfig = $.config;
	
	/**
	 * 基础的module模型
	 */
	function DynModle(){
	    this.obj = {};
	}
	DynModle.prototype.put = function(key,value){
		if(key === null || key === "" || key === undefined){
			return;
		}
		this.obj[key] =  value;
	};
	DynModle.prototype.getString = function(key){
		if(key === null || key === "" || key === undefined){
			return "";
		}
		if(!this.obj.hasOwnProperty(key)){
			return "";
		}else{
			return String(this.obj[key]);
		}
	};
	DynModle.prototype.getInt = function(key){
		if(key === null || key === "" || key === undefined){
			return 0;
		}
		if(!this.obj.hasOwnProperty(key)){
			return 0;
		}else{
			return parseInt(this.obj[key]);
		}
	};
	DynModle.prototype.getFloat = function(key){
		if(key === null || key === "" || key === undefined){
			return 0;
		}
		if(!this.obj.hasOwnProperty(key)){
			return 0;
		}else{
			return parseFloat(this.obj[key]);
		}
	};
	DynModle.prototype.getNumber = function(key){
		if(key === null || key === "" || key === undefined){
			return 0;
		}
		if(!this.obj.hasOwnProperty(key)){
			return 0;
		}else{
			return Number(this.obj[key]);
		}
	};
	DynModle.prototype.getBoolean = function(key){
	    if(key === null || key === "" || key === undefined){
			return false;
		}
		if(!this.obj.hasOwnProperty(key)){
			return false;
		}else{
			return Boolean(this.obj[key]);
		}
	};
	DynModle.prototype.getObject = function(key){
		if(key === null || key === "" || key === undefined){
			return null;
		}
		if(!this.obj.hasOwnProperty(key)){
			return null;
		}else{
			return this.obj[key];
		}
	};
	DynModle.prototype.fromObject = function(_obj){
		if(_obj !== null){
			for(var key in _obj){
				this.obj[key] = _obj[key];
			}
		}
	};
	DynModle.prototype.toObject = function(){
	    return this.obj;
	};
	DynModle.prototype.clear = function(){
	    for(var key in this.obj){
			delete this.obj[key];
			this.obj[key] = null;
		}
		this.obj = null;
	};
	DynModle.prototype.clone = function(){
	    var dynModle = new DynModle();
		dynModle.fromObject(this.toObject());
		return dynModle;
	};
	
	/**
	 * 调用接口的请求对象
	 */
	function ReqParamVo(){
	   this.obj = {};
	}
	ReqParamVo.consts = {
	   //请求协议
	   PROTOCOL : "protocol",
	   //URL地址
	   URL : "url",
	   //请求参数
	   REQPARAM : "reqParam",
	   //是否最后一次的请求
	   ISLASTREQ : "isLastReq",
	   //是否异步
	   ISASYNC : "isAsync",
	   //是否显示等待效果
	   ISSHOWWAIT : "isShowWait",
	   //出现网络错误时的处理函数
	   ERRORFUNC : "errorFunc",
	   //是否显示遮罩层
	   ISSHOWOVERLAY : "isShowOverLay",
	   //等待显示的文字
	   TIPSWORDS : "tipsWords",
	   //超时处理
	   TIMEOUTFUNC : "timeOutFunc",
	   //请求数据格式
	   DATATYPE : "dataType",
	   //是否属于全局请求，true表示切换页面时，该请求不会被清除
	   ISGLOBAL : "isGlobal"
	};
	ReqParamVo.prototype = new DynModle();
	ReqParamVo.prototype.setProtocol = function(protocol){
		protocol = protocol || "ajax";
	    this.put(ReqParamVo.consts.PROTOCOL,protocol);
	};
	ReqParamVo.prototype.getProtocol = function(){
		return this.getString(ReqParamVo.consts.PROTOCOL);
	};
	ReqParamVo.prototype.setUrl = function(url){
		this.put(ReqParamVo.consts.URL,url);
	};
	ReqParamVo.prototype.getUrl = function(){
		return this.getString(ReqParamVo.consts.URL);
	};
	ReqParamVo.prototype.setReqParam = function(reqParam){
	   this.put(ReqParamVo.consts.REQPARAM,reqParam);
	};
	ReqParamVo.prototype.getReqParam = function(){
		return this.getObject(ReqParamVo.consts.REQPARAM);
	};
	ReqParamVo.prototype.setIsAsync = function(isAsync){
		isAsync = (typeof(isAsync)=="undefined"||isAsync==="")?true:isAsync;
	    this.put(ReqParamVo.consts.ISASYNC,isAsync);
	};
	ReqParamVo.prototype.getIsAsync = function(){
		return this.getBoolean(ReqParamVo.consts.ISASYNC);
	};
	ReqParamVo.prototype.setIsLastReq = function(isLastReq){
		isLastReq = (typeof(isLastReq)=="undefined"||isLastReq==="")?true:isLastReq;
	    this.put(ReqParamVo.consts.ISLASTREQ,isLastReq);
	};
	ReqParamVo.prototype.getIsLastReq = function(){
		return this.getBoolean(ReqParamVo.consts.ISLASTREQ);
	};
	ReqParamVo.prototype.setIsShowWait = function(isShowWait){
		isShowWait = (typeof(isShowWait)=="undefined"||isShowWait==="")?true:isShowWait;
	    this.put(ReqParamVo.consts.ISSHOWWAIT,isShowWait);
	};
	ReqParamVo.prototype.getIsShowWait = function(){
		return this.getBoolean(ReqParamVo.consts.ISSHOWWAIT);
	};
	ReqParamVo.prototype.setIsShowOverLay = function(isShowOverLay){
		isShowOverLay = (typeof(isShowOverLay)=="undefined"||isShowOverLay==="")?true:isShowOverLay;
	    this.put(ReqParamVo.consts.ISSHOWOVERLAY,isShowOverLay);
	};
	ReqParamVo.prototype.getIsShowOverLay = function(){
		return this.getBoolean(ReqParamVo.consts.ISSHOWOVERLAY);
	};
	ReqParamVo.prototype.setTipsWords = function(tipsWords){
		tipsWords = tipsWords || "请等待...";
	    this.put(ReqParamVo.consts.TIPSWORDS,tipsWords);
	};
	ReqParamVo.prototype.setErrorFunc = function(errorFunc) {
		this.put(ReqParamVo.consts.ERRORFUNC, errorFunc)
	};
	ReqParamVo.prototype.getErrorFunc = function() {
		return this.getObject(ReqParamVo.consts.ERRORFUNC)
	};
	ReqParamVo.prototype.getTipsWords = function(){
		return this.getString(ReqParamVo.consts.TIPSWORDS);
	};
	ReqParamVo.prototype.setTimeOutFunc = function(timeOutFunc){
	    this.put(ReqParamVo.consts.TIMEOUTFUNC,timeOutFunc);
	};
	ReqParamVo.prototype.getTimeOutFunc = function(){
		return this.getObject(ReqParamVo.consts.TIMEOUTFUNC);
	};
	ReqParamVo.prototype.setDataType = function(dataType){
		dataType = dataType || "json";
	    this.put(ReqParamVo.consts.DATATYPE,dataType);
	};
	ReqParamVo.prototype.getIsGlobal = function(){
		return this.getBoolean(ReqParamVo.consts.ISGLOBAL);
	};
	ReqParamVo.prototype.setIsGlobal = function(isGlobal){
		isGlobal = (typeof(isGlobal)=="undefined"||isGlobal==="")?false:isGlobal;
	    this.put(ReqParamVo.consts.ISGLOBAL,isGlobal);
	};
	ReqParamVo.prototype.getDataType = function(){
		return this.getString(ReqParamVo.consts.DATATYPE);
	};
	ReqParamVo.prototype.clone = function(){
		var reqParamVo = new ReqParamVo();
		reqParamVo.fromObject(this.toObject());
		return reqParamVo;
	};


	/**
	 * 请求接口的服务层接口
	 */
	function Service(){
	}
	
	/**
	 * 功能:请求服务
	 * 入参: reqParamVo:请求对象
	 *     	callBackFunc：回调函数
	 */
	Service.prototype.invoke = function(reqParamVo,callBackFunc){
		var This = this;
//		var protocol = reqParamVo.getProtocol();
//		require.async($.service.ajax, function(module){
			var url = reqParamVo.getUrl();
			if($.getSStorageInfo("jsessionid") && url.indexOf(";jessionid=")<0) {
				url = url + ";jsessionid=" + $.getSStorageInfo("jsessionid");
			}
			var param = reqParamVo.getReqParam();
			var isLastReq = reqParamVo.getIsLastReq();
			var isAsync = reqParamVo.getIsAsync();
			var isShowWait = reqParamVo.getIsShowWait();
			var isShowOverLay = reqParamVo.getIsShowOverLay();
			var tipsWords = reqParamVo.getTipsWords();
			var timeOutFunc = reqParamVo.getTimeOutFunc();
			var dataType = reqParamVo.getDataType();
			var isGlobal = reqParamVo.getIsGlobal();
			var errorFunc = reqParamVo.getErrorFunc();
			$.service.ajax.request(url, param, function(data){
//				data.error_no = -1;

//				data.results = [];

//				results = data.results[0];
//				if(results){
//					for(var i = 0; i < 20; i++){
//						data.results = data.results.concat(results);
//					}
//				}

				if(data) {
					callBackFunc && callBackFunc(data);
				}
			}, isLastReq, isAsync, isShowWait, isShowOverLay, tipsWords, timeOutFunc, dataType, isGlobal, errorFunc);
//		});
	};
	
	/**
	 * 功能：释放操作
	 */
	Service.prototype.destroy = function(){};
	
	module.exports = {
		"ReqParamVo": ReqParamVo,
		"Service": Service
	};
});