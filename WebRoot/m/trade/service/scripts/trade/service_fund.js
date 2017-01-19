/**
 * 基金service层调用接口
 */
define('trade/service/scripts/trade/service_fund.js',function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	
	/********************************公共代码部分********************************/
    service_fund.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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

	service_fund.prototype.destroy = function(){
		this.service.destroy();
	};
	function service_fund(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	
	module.exports = new service_fund();
	
	/********************************应用接口开始********************************/

	/**
	 * 添加OpStation
	 * */
	function addOpStation(param){
		var channelNo = " "; // 通道编号
		var ipAddr = " "; // ip 
		var macAddr = " "; // mac
		var hardId = " "; // 硬盘序列号（硬件id）
		var cpuId = " "; // cpu 序列号
		var mobileNo = " "; // 手机号
		var hardIdentifier = " "; //硬件特征码
		var source = " "; // 来源
		var other = " "; // 其他
 
		if($.device.android){
			channelNo = "1";
		}else if($.device.iPad || $.device.iPhone || $.device.ios){
			channelNo = "2";
		}else if($.device.pc){
			channelNo = "0";
		}
		channelNo = global.channel || " "; //渠道
		hardIdentifier = global.hardId || " ";//硬件特征码
		source = global.opStationInfo || " "; //来源
		mobileNo = global.activePhone || " ";//手机号
		if(global.callNative){
			
			var mobileNoInfo = $.callMessage({"funcNo":"50043","key":"mobilePhone"}); // 电话号码
			if(mobileNoInfo.error_no == "0"){
				mobileNo = mobileNoInfo.results[0].value;
			}
			var hardIdInfo = $.callMessage({"funcNo": "50022"}); //设备唯一码
			if(hardIdInfo.error_no ==  "0"){
				hardId = hardIdInfo.results[0].deviceToken;
			}
			var ipAddrInfo = $.callMessage({"funcNo": "50023"}); //设备IP地址
			if(ipAddrInfo.error_no ==  "0"){
				ipAddr = ipAddrInfo.results[0].ip;	
			}
			var macAddrInfo = $.callMessage({"funcNo": "50024"}); //设备MAC地址 
			if(macAddrInfo.error_no ==  "0"){
				macAddr = macAddrInfo.results[0].mac;
			}
			var versionInfo = $.callMessage({"funcNo": "50010"}); //应用版本号
			if(versionInfo.error_no ==  "0"){
				other = versionInfo.results[0].version;
			}
		}
		var aOpStation = [];
		aOpStation.push(channelNo);
		aOpStation.push("|");
		aOpStation.push(ipAddr);
		aOpStation.push("|");
		aOpStation.push(macAddr);
		aOpStation.push("|");
		aOpStation.push(hardId);
		aOpStation.push("|");
		aOpStation.push(cpuId);
		aOpStation.push("|");
		aOpStation.push(mobileNo);
		aOpStation.push("|");
		aOpStation.push(hardIdentifier);
		aOpStation.push("|");
		aOpStation.push(source);
		aOpStation.push("|");
		aOpStation.push(other);
		param.op_station = aOpStation.join(""); // 通道编号|IP地址|MAC地址|硬盘序列号|CPU序列号|手机号码|硬件特征码|来源|其他
	}
	
	/********************************业务范围--基金********************************/
	/**
	 * 资产查询
	 * @param {Object} param
	 * @param {Object} callback
	 * @param {Object} ctrlParam
	 */
	service_fund.prototype.queryFundSelect=function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "301504";
  	    paraMap["entrust_way"] =  param.entrust_way;
  	    paraMap["branch_no"] =  param.branch_no;
  	    paraMap["fund_account"] =  param.fund_account;
  	    paraMap["cust_code"] =  param.cust_code;
  	    paraMap["password"] =  param.password;
  	    paraMap["sessionid"] =  param.sessionid;
  	    paraMap["money_type"] =  param.money_type;
  	    paraMap["is_homepage"] =  param.is_homepage;
  	    paraMap["income_balance"] = param.is_homepage;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}; 
	/**
	 * 风险测评结果查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * @param fund_company   基金公司
	 * */
	service_fund.prototype.queryRiskLevel = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "300104";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["risk_kind"] = param.risk_kind;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	/**
	 * 基金账户信息查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * @param fund_company   基金公司
	 * */
	service_fund.prototype.getCustMsg = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302001";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	
	 /**
	 * 基金客户可购买基金查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * @param fund_company   基金公司
	 * */
	service_fund.prototype.queryCanSubscribe = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302002";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["fund_code"] = param.fund_code;
 		paraMap["fund_status"] = param.fund_status;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	
   /**
	 * 基金公司查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * @param fund_company   基金公司
	 * */
	service_fund.prototype.getFundCompany = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302004";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	  
	/**
	 * 基金详情查询
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param op_station    操作站点
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * */
	service_fund.prototype.getFundInfo = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302005";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["sessionid"] = param.sessionid;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["fund_code"] = param.fund_code;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 基金认购
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * @param amount        认购数量
	 * @param balance       认购金额
	 * @param flag          强制下单标志（0：否，1：是）
	 * */
	 service_fund.prototype.getSubScriptionBuy = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302006";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["fund_company"] = param.fund_company;
		paraMap["fund_code"] = param.fund_code;
		paraMap["amount"] = param.amount;
		paraMap["balance"] = param.balance;
		paraMap["flag"] = param.flag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 基金申购
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param sessionid      会话号
	 * @param fund_company   基金公司
	 * @param fund_code      基金代码
	 * @param auto_buy       分红方式
	 * @param balance        认购金额
	 * @param flag           强制下单标志（0：否，1：是）
	 * */
	 service_fund.prototype.getpurchaseBuy = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302007";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["fund_company"] = param.fund_company;
		paraMap["fund_code"] = param.fund_code;
		paraMap["auto_buy"] = param.auto_buy;
		paraMap["balance"] = param.balance;
		paraMap["flag"] = param.flag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 提交下单基金  基金赎回  
	 * @param funcNo              302008
	 * @param entrust_way         委托方式
	 * @param branch_no           分支机构
	 * @param fund_account        资金账号
	 * @param cust_code           客户编号
	 * @param password            密码
	 * @param op_station          操作站点
	 * @param sessionid           会话号
	 * @param fund_company        基金公司
	 * @param fund_code           基金代码
	 * @param amount              发生数量
	 * @param exceedflag          巨额赎回标志('0':取消，'1':顺延)
	 * */
	 service_fund.prototype.submitOrder = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302008";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["fund_code"] = param.fund_code;
 		paraMap["amount"] = param.amount;
 		paraMap["exceedflag"] = param.exceedflag;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 基金撤单
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * @param begin_date    起始日期
	 * @param end_date      截止日期
	 * @param business_flag 业务类别
	 * */
	 service_fund.prototype.cancelOrder = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302009";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["allot_date"] = param.allot_date;
		paraMap["entrust_no"] = param.entrust_no;
		paraMap["fund_code"] = param.fund_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 当日基金委托查询
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * @param business_flag 业务类别
	 * */
	service_fund.prototype.queryTodayTrust = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302011";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["fund_company"] = param.fund_company;
		paraMap["fund_code"] = param.fund_code;
		paraMap["business_flag"] = param.business_flag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 基金持仓查询,基金份额查询
	 * @param callback      回调函数	
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * */
	 service_fund.prototype.queryFundData = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302012";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["fund_company"] = param.fund_company;
		paraMap["fund_code"] = param.fund_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 基金当日成交查询
	 * @param callback      回调函数	
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * */
	 service_fund.prototype.queryTodayTrade = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302013";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["fund_company"] = param.fund_company;
		paraMap["fund_code"] = param.fund_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 历史基金委托查询
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * @param begin_date    起始日期
	 * @param end_date      截止日期
	 * @param business_flag 业务类别
	 * */
	 service_fund.prototype.queryHistoryTrust = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302014";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["fund_company"] = param.fund_company;
		paraMap["fund_code"] = param.fund_code;
		paraMap["begin_date"] = param.begin_time;
		paraMap["end_date"] = param.end_time;
		paraMap["begin_time"] = param.begin_time;
		paraMap["end_time"] = param.end_time;
		paraMap["business_flag"] = param.business_flag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 历史基金成交查询
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * @param begin_date    起始日期
	 * @param end_date      截止日期
	 * */
	 service_fund.prototype.queryHistoryTrade = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302015";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["fund_company"] = param.fund_company;
		paraMap["fund_code"] = param.fund_code;
		paraMap["begin_date"] = param.begin_time;
		paraMap["end_date"] = param.end_time;
		paraMap["begin_time"] = param.begin_time;
		paraMap["end_time"] = param.end_time;
		paraMap["business_flag"] = param.business_flag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 基金开户
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * @param flag          是否首次开户（0：否，1：是）
	 * */
	 service_fund.prototype.openFundAccount = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "302030";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["sessionid"] = param.sessionid;
		paraMap["password"] = param.password;
		paraMap["fund_company"] = param.fund_company;
		paraMap["stock_account"] = param.stock_account;
		paraMap["flag"] = param.flag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 风险测评问卷查询
	 * @param callback      回调函数
	 * @param entrust_way   委托方试
	 * @param branch_no     分支机构
	 * @param sessionid     会话号
	 * @param fund_company  基金公司
	 * @param fund_code     基金代码
	 * @param flag          是否首次开户（0：否，1：是）
	 * */
	 service_fund.prototype.queryRiskQuestions = function(param, callback, ctrlParam) {
		var paraMap = {};
		paraMap["funcNo"] = "300105";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["sessionid"] = param.sessionid;
		paraMap["password"] = param.password;
		paraMap["risk_kind"] = param.risk_kind;
		paraMap["organ_flag"] = param.organ_flag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 风险测评问卷提交
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * @param risk_kind   风险问卷类型（见数据字典）
	 * @param paper_answer   提交答案
	 * */
	service_fund.prototype.submitCustAnswer = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "300106";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["risk_kind"] = param.risk_kind;
 		paraMap["paper_answer"] = param.paper_answer;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	
	/**
	 * 基金当日可撤委托信息查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.queryTodayCancel = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302019";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["fund_code"] = param.fund_code;
 		paraMap["business_flag"] = param.business_flag;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	//10014242 123321
	/**
	 * 基金委托撤单
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.cancelFundEntrust = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302009";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["allot_date"] = param.allot_date;
 		paraMap["fund_code"] = param.fund_code;
 		paraMap["entrust_no"] = param.entrust_no;
 		paraMap["fund_company"] = param.fund_company;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  

	/**
	 * 基金开户
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.fundOpenAccount = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302030";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["stock_account"] = param.stock_account;
 		paraMap["flag"] = param.flag;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	
	/**
	 * 基金转换
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.fundConversion = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302010";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["fund_code"] = param.fund_code;
 		paraMap["trans_code"] = param.trans_code;
 		paraMap["trans_amount"] = param.trans_amount;
 		paraMap["exceedflag"] = param.exceedflag;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 基金分红方式设置
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.bonusModeSetting = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302016";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["fund_company"] = param.fund_company;
 		paraMap["fund_code"] = param.fund_code;
 		paraMap["dividendmethod"] = param.dividendmethod;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 基金定投查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.fundInvestmentQuery = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302051";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	
	
	/**
	 * 分级基金历史委托查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingHistoryTrust = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302072";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["begin_date"] = param.begin_time;
		paraMap["end_date"] = param.end_time;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金历史成交查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingHistoryDeal = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302073";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["begin_date"] = param.begin_time;
		paraMap["end_date"] = param.end_time;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金持仓
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingPosition = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302074";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 场内货币基金申购
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.venueMonetaryPurchase = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302064";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.fund_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["entrust_prop"] = param.entrust_prop;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 场内货币基金赎回
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.venueMonetaryRedemption = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302065";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.fund_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["entrust_prop"] = param.entrust_prop;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金申购认购
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingSubscription = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302066";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.fund_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["entrust_prop"] = param.entrust_prop;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金赎回
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingRedeem = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302067";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.fund_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["entrust_prop"] = param.entrust_prop;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金撤单
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingChechan = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302068";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["entrust_no"] = param.entrust_no;
	    paraMap["batch_flag"] =  param.batch_flag;
	    paraMap["exchange_type"] = param.exchange_type;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金当日成交查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingDayDeal = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302071";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金当日委托查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingDayCommission = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302070";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级子基金买卖
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.SubFundTrading = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302069";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.fund_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["entrust_prop"] = param.entrust_prop;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 分级基金分拆合并
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.gradingSplitMerge = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302055";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["fund_code"] = param.fund_code;
		paraMap["stock_code"] = param.fund_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["entrust_prop"] = param.entrust_prop;
		paraMap["fund_opertype"] = param.entrust_prop;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
  	 * 股票信息联动
  	 * @param {Object} entrust_way     委托方式
  	 * @param {Object} branch_no       分支机构
  	 * @param {Object} fund_account    资金账号
  	 * @param {Object} cust_code       客户编号
  	 * @param {Object} sessionid       会话号
  	 * @param {Object} entrust_bs      买卖方向
  	 * @param {Object} exchange_type   交易市场类别
  	 * @param {Object} stock_code      股票代码
  	 * @param {Object} entrust_price   委托价格
  	 * */
     service_fund.prototype.queryStockMaxBuy=function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "302078";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
        paraMap["password"] =  param.password;
  	    paraMap["sessionid"] = param.sessionid;
  	    paraMap["entrust_bs"] = param.entrust_bs;
  	    paraMap["stock_code"] = param.fund_code;
  	    paraMap["entrust_price"] = param.entrust_price;
  	    paraMap["newstock_flag"] = param.newstock_flag;
  	    paraMap["stock_account"] =  param.stock_account;
  	    paraMap["stock_accounts"] = param.stock_accounts;
  	    paraMap["exchange_type"] = param.exchange_type;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	/**
  	 * 分级基金可撤查询
  	 * @param {Object} entrust_way     委托方式
  	 * @param {Object} branch_no       分支机构
  	 * @param {Object} fund_account    资金账号
  	 * @param {Object} cust_code       客户编号
  	 * @param {Object} sessionid       会话号
  	 * @param {Object} entrust_bs      买卖方向
  	 * @param {Object} exchange_type   交易市场类别
  	 * @param {Object} stock_code      股票代码
  	 * @param {Object} entrust_price   委托价格
  	 * */
     service_fund.prototype.gradingCanWithdraw=function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "302075";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
        paraMap["password"] =  param.password;
  	    paraMap["sessionid"] = param.sessionid;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	/**
  	 * 分级基金分拆合并查询
  	 * @param {Object} entrust_way     委托方式
  	 * @param {Object} branch_no       分支机构
  	 * @param {Object} fund_account    资金账号
  	 * @param {Object} cust_code       客户编号
  	 * @param {Object} sessionid       会话号
  	 * @param {Object} entrust_bs      买卖方向
  	 * @param {Object} exchange_type   交易市场类别
  	 * @param {Object} stock_code      股票代码
  	 * @param {Object} entrust_price   委托价格
  	 * */
     service_fund.prototype.gradingSplitMergeQuery=function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "302056";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
        paraMap["password"] =  param.password;
  	    paraMap["sessionid"] = param.sessionid;
  	    paraMap["entrust_bs"] = param.entrust_bs;
  	    paraMap["stock_code"] = param.fund_code;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	
  	/**
	 * 场内货币基金当日委托查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.floorQueryToday = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302076";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 场内货币基金历史委托查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.floorQueryHistory = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "302077";
		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["fund_account"] = param.fund_account;
 		paraMap["cust_code"] = param.cust_code;
 		paraMap["password"] = param.password;
 		paraMap["op_station"] = param.op_station;
 		paraMap["sessionid"] = param.sessionid;
 		paraMap["begin_date"] = param.begin_time;
		paraMap["end_date"] = param.end_time;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 场内货币基金历史委托查询
	 * @param callback       回调函数
	 * @param entrust_way    委托方试
	 * @param branch_no      分支机构
	 * @param op_station     操作站点
	 * @param sessionid      会话号
	 * */
	service_fund.prototype.queryStockData = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301503";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["password"] =  param.password;
	    paraMap["stock_account"] = "";  //param.stock_account
	    paraMap["stock_code"] =  param.stock_code;
	    paraMap["exchange_type"] = param.exchange_type;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/***应用接口......................................................结束*/

});