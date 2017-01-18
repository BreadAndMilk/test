/**
 * 汇添富-资讯
 * 
 * */
define(function(require, exports, module) {
	var gconfig = $.config,
		global = gconfig.global,
		serverPathTrade = global.newsUrl; //服务器URL
		
		
	/********************************公共代码部分********************************/
    service_news.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
		reqParamVo.setReqParam(paraMap);
		ctrlParam = ctrlParam?ctrlParam:{};
		reqParamVo.setIsLastReq(ctrlParam.isLastReq);
		reqParamVo.setIsAsync(ctrlParam.isAsync);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		reqParamVo.setTimeOutFunc(ctrlParam.timeOutFunc);
		reqParamVo.setIsShowOverLay(ctrlParam.isShowOverLay);
		reqParamVo.setTipsWords(ctrlParam.tipsWords);
		reqParamVo.setDataType(ctrlParam.dataType);
		reqParamVo.setIsGlobal(ctrlParam.isGlobal);
		reqParamVo.setProtocol(ctrlParam.protocol);
		this.service.invoke(reqParamVo, callback);
	}

	
	service_news.prototype.destroy = function(){
		this.service.destroy();
	};
	function service_news(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	module.exports = new service_news();
	
	/***应用接口......................................................开始*/
     
	
	/**
	 * 股票新闻查询
	 * @param callback 回调函数
	 * @param stock_code 　stock_code=SZ|000001,SH|603002,SZ|000002|,SZ|300451
	 * @param catalogid  所属栏目 	Y1.普通资讯   2.公告    3.自选股   4.股票新闻  5.沪深
	 * @param curpage 		int				当前页	N
	 * @param rowofpage		int				每页的行数 N
	 * */
	service_news.prototype.queryNews = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "200000";
		paraMap["stock_code"] = param.stock_code;
		paraMap["curpage"] = param.curpage;
		paraMap["rowofpage"] = param.rowofpage;
		paraMap["catalogid"] = param.catalogid;
		paraMap["areacode"] = param.areacode;
		paraMap["query_flag"] = param.query_flag;
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	
	
	/**
	 * 查询资讯内容
	 * @param callback 回调函数
	 * @param id 	NUMBER(20)		编号  	Y
	 * */
	service_news.prototype.queryInformationContent = function(param,callback,ctrlParam)
    {
 	    var paraMap = {};
		paraMap["funcNo"] = "200001";
		paraMap["id"] = param.id;
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
 	 * 公告查询 
 	 * @param stock_code 	varchar(10)		股票代码  	Y
	 * @param curpage 		int				当前页	N
	 * @param rowofpage		int				每页的行数 N
 	 * @param callback 回调函数
 	 */
    service_news.prototype.queryAnnouncement = function(param,callback,ctrlParam)
    {
  	    var paraMap = {};
 		paraMap["funcNo"] = "200302";
 		paraMap["stock_code"] = param.stock_code;
		paraMap["curpage"] = param.curpage;
		paraMap["rowofpage"] = param.rowofpage;
 		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * 查询公告内容
     * @param id 	NUMBER(20)		编号  	Y
     * @param callback 回调函数
     */
    service_news.prototype.queryAnnouncementContent = function(param,callback,ctrlParam)
    {
    	var paraMap = {};
    	paraMap["funcNo"] = "200303";
    	paraMap["id"] = param.id;
    	var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
     /**
 	 * 研报信息查询  
 	 * @param stock_code 	varchar(10)		股票代码  	Y
	 * @param curpage 		int				当前页	N
	 * @param rowofpage		int				每页的行数 N
 	 * @param callback 回调函数
 	 */
    service_news.prototype.queryResearchReportInformation = function(param,callback,ctrlParam)
    {
  	    var paraMap = {};
 		paraMap["funcNo"] = "200304";
 		paraMap["stock_code"] = param.stock_code;
		paraMap["curpage"] = param.curpage;
		paraMap["rowofpage"] = param.rowofpage;
 		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * 查询研报内容
     * @param id 	NUMBER(20)		编号  	Y
     * @param callback 回调函数
     */
    service_news.prototype.queryResearchReportInformationContent = function(param,callback,ctrlParam)
    {
    	var paraMap = {};
    	paraMap["funcNo"] = "200305";
    	paraMap["id"] = param.id;
    	var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * F10公司概况
     * @param {Object} stock_code       varchar(10)       股票代码 Y
     * @param callback 回调函数
     */
    service_news.prototype.companyProfile = function(param,callback,ctrlParam)
    {
    	var paraMap = {};
    	paraMap["funcNo"] = "200306";
    	paraMap["stock_code"] = param.stock_code;
    	var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * F10查询股本股东
     * @param {Object} stock_code       varchar(10)       股票代码 Y
     * @param callback 回调函数
     */
    service_news.prototype.queryEquityShareholders = function(param,callback,ctrlParam)
    {
    	var paraMap = {};
    	paraMap["funcNo"] = "200307";
    	paraMap["stock_code"] = param.stock_code;
    	var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };

    /**
     * F10 分红配送
     * @param {Object} stock_code       varchar(10)       股票代码 Y
     * @param callback 回调函数
     */
    service_news.prototype.dividendDistribution = function(param,callback,ctrlParam)
    {
    	var paraMap = {};
    	paraMap["funcNo"] = "200308";
    	paraMap["stock_code"] = param.stock_code;
    	var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * F10 财务数据
     * @param {Object} stock_code       varchar(10)       股票代码 Y
     * @param callback 回调函数
     */
    service_news.prototype.financialData = function(param,callback,ctrlParam)
    {
    	var paraMap = {};
    	paraMap["funcNo"] = "200309";
    	paraMap["stock_code"] = param.stock_code;
    	var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
 	 * 查询资讯要闻 
	 * @param curpage 		int				当前页	N
	 * @param rowofpage		int				每页的行数 N
 	 * @param callback 回调函数
 	 */
    service_news.prototype.queryInformationNews = function(param,callback,ctrlParam)
    {
  	    var paraMap = {};
 		paraMap["funcNo"] = "200000";
 		paraMap["catalogid"] = param.catalogid;
		paraMap["curpage"] = param.curpage;
		paraMap["rowofpage"] = param.rowofpage;
 		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
	 * 查询资讯自选股
	 * @param callback 回调函数
	 * @param stock_code 	varchar(10)		股票代码  	Y
	 * @param curpage 		int				当前页	N
	 * @param rowofpage		int				每页的行数 N
	 * */
	service_news.prototype.queryInformationFromStock= function(param, callback, isLastReq, isShowWait,isShowOverLay,timeOutFunc) 
	{
		var paraMap = {};
		paraMap["funcNo"] = "200311";
		paraMap["stock_codeSZ"] = param.stock_codeSZ;
		paraMap["stock_codeSH"] = param.stock_codeSH;
		paraMap["curpage"] = param.curpage;
		paraMap["rowofpage"] = param.rowofpage;
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 查询资讯深沪
	 * @param callback 回调函数
	 * @param flag 	varchar(10)		查询标志  	Y   0：大盘动态，1：个股机会
	 * @param curpage 		int				当前页	N
	 * @param rowofpage		int				每页的行数 N
	 * */
	service_news.prototype.queryInformationSH= function(param, callback, isLastReq, isShowWait,isShowOverLay,timeOutFunc) 
	{
		var paraMap = {};
		paraMap["funcNo"] = "200312";
		paraMap["flag"] = param.flag;
		paraMap["curpage"] = param.curpage;
		paraMap["rowofpage"] = param.rowofpage;
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	

    
   
	/***应用接口......................................................结束*/

//	/**
//	 * 释放操作
//	 */
//	newsService.prototype.destroy = function() {
//		this.service.destroy();
//	};
//
//	/**
//	 * 实例化对象
//	 */
//	function getInstance() {
//		return new newsService();
//	}
//
//	var newsService = {
//		"getInstance" : getInstance
//	};
//
//	// 暴露对外的接口
//	module.exports = newsService;
});