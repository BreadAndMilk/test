/**
 * 个股期权service层调用接口
 * */
define('trade/service/scripts/trade/service_option.js',function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var serverConfig = global.serverConfig; // 柜台选择   1. 金证win  2. 恒生T2   3. 顶点 （可拓展）
	var global = gconfig.global;
	
	function service_option(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	
	module.exports = new service_option();
    
    /**
	 * 释放操作
	 */
	service_option.prototype.destroy = function(){
		this.service.destroy();
	};
	/********************************公共代码部分********************************/
    service_option.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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
		channelNo = global.channel; //渠道
		hardIdentifier = global.hardId;//硬件特征码
		source = global.opStationInfo; //来源
		mobileNo = global.activePhone;//手机号
		if(global.callNative){
			
			var mobileNoInfo = $.callMessage({"funcNo":"50043","key":"mobilePhone"}); // 电话号码
			if(mobileNoInfo.error_no == "0"){
				mobileNo = global.opStationInfo+mobileNoInfo.results[0].value;
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
	
	/***应用接口......................................................开始*/
    
    
    /**
 	 * 期权行情查询
 	 * @param {Object} exchange_type             交易类别
     * @param {Object} option_code               期权合约编码
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryOptionsMarket = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305000";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["option_code"] = param.option_code;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
    
    
    /**
 	 * 期权代码信息查询（联动査询）
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} stock_code               股票代码
     * @param {Object} option_code              期权合约编码
     * @param {Object} option_type  			期权类别（见数据字典)
     * @param {Object} entrust_bs           	委托标志（见数据字典)
     * @param {Object} covered_flag				备兑标志（见数据字典）
     * @param {Object} entrust_oc           	开平仓方向（见数据字典)
     * @param {Object} exercise_price  			行权价格
     * @param {Object} exercise_month  			行权年月
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.optionCodeInformation = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305001";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"]=param.cust_code;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["option_code"] = param.option_code;
		 paraMap["option_type"] = param.option_type;
		 paraMap["covered_flag"] = param.covered_flag;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["entrust_oc"] = param.entrust_oc;
		 paraMap["exercise_price"] = param.exercise_price;
		 paraMap["exercise_month"] = param.exercise_month;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };


      /**
 	 * 期权持仓查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} option_account  			衍生品合约账户
     * @param {Object} opthold_type           	期权持仓类别（'0'-权利方 '1'-义务方 '2'-备兑方
     * @param {Object} option_code              期权合约编码
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryPosition = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305003";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["option_account"] = param.option_account;
		 paraMap["opthold_type"] = param.opthold_type;
		 paraMap["option_code"] = param.option_code;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 期权资产查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             衍生品资金账户
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} money_type            	币种类别（见数据字典)
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryAssets = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305004";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["money_type"] = param.money_type;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 期权委托
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} option_account           衍生品合约账户
     * @param {Object} option_code              期权合约编码
     * @param {Object} entrust_amount  			委托数量
     * @param {Object} entrust_price  			委托价格
     * @param {Object} entrust_bs           	委托标志（见数据字典)
     * @param {Object} entrust_oc           	开平仓方向
     * @param {Object} covered_flag  			备兑标志
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.placeAnOrder = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305005";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["option_account"] = param.option_account;
		 paraMap["option_code"] = param.option_code;
		 paraMap["entrust_amount"] = param.entrust_amount;
		 paraMap["entrust_price"] = param.entrust_price;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["entrust_oc"] = param.entrust_oc;
		 paraMap["covered_flag"] = param.covered_flag;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 期权撤单
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} entrust_no            	委托编号
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.cancellation = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305006";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["entrust_no"] = param.entrust_no;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
    /**
 	 * 期权当日委托查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} stock_code               股票代码
     * @param {Object} option_code              期权合约编码
     * @param {Object} entrust_bs           	委托标志（见数据字典)
     * @param {Object} option_account  			衍生品合约账户
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryDayOrder = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305007";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["option_code"] = param.option_code;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["option_account"] = param.option_account;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
     /**
 	 * 期权历史委托查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} stock_code               股票代码
     * @param {Object} option_code              期权合约编码
     * @param {Object} entrust_bs           	委托标志（见数据字典)
     * @param {Object} option_account  			衍生品合约账户
     * @param {Object} begin_time  				开始日期
     * @param {Object} end_time  				截止日期
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryHistoryOrder = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305008";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["option_code"] = param.option_code;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["option_account"] = param.option_account;
		 paraMap["begin_time"] = param.begin_time;
		 paraMap["end_time"] = param.end_time;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 期权当日成交查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} stock_code               股票代码
     * @param {Object} option_code              期权合约编码
     * @param {Object} entrust_bs           	委托标志（见数据字典)
     * @param {Object} option_account  			衍生品合约账户
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryDayDeal = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305009";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["option_code"] = param.option_code;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["option_account"] = param.option_account;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
     /**
 	 * 期权历史成交查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} stock_code               股票代码
     * @param {Object} option_code              期权合约编码
     * @param {Object} entrust_bs           	委托标志（见数据字典)
     * @param {Object} option_account  			衍生品合约账户
     * @param {Object} begin_time  				开始日期
     * @param {Object} end_time  				截止日期
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryHistoryDeal = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305010";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["option_code"] = param.option_code;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["option_account"] = param.option_account;
		 paraMap["begin_time"] = param.begin_time;
		 paraMap["end_time"] = param.end_time;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
     /**
 	 * 期权当日行权指派查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} opthold_type             期权持仓类别（'0'-权利方 '1'-义务方 '2'-备兑方）
     * @param {Object} option_code              期权合约编码
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryDayAssign = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305011";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["opthold_type"] = param.opthold_type;
		 paraMap["option_code"] = param.option_code;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 期权历史行权指派查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} opthold_type             期权持仓类别（'0'-权利方 '1'-义务方 '2'-备兑方）
     * @param {Object} option_code              期权合约编码
     * @param {Object} begin_time  				开始日期
     * @param {Object} end_time  				截止日期
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryHistoryAssign = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305012";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["opthold_type"] = param.opthold_type;
		 paraMap["option_code"] = param.option_code;
		 paraMap["begin_time"] = param.begin_time;
		 paraMap["end_time"] = param.end_time;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 期权当日行权交割查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} stock_code            	证券代码
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryDayExerciseDelivery = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305013";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["stock_code"] = param.stock_code;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
     /**
 	 * 期权历史行权交割查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} deliver_type            	交割标志　'0'-打未交割　'1'-全部（见数据字典)
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} option_account           衍生品合约账户
     * @param {Object} option_code              期权合约编码
     * @param {Object} money_type            	币种类别
     * @param {Object} begin_time  				开始日期
     * @param {Object} end_time  				截止日期
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryHistoryExerciseDelivery = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305014";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["deliver_type"] = param.deliver_type;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["option_account"] = param.option_account;
		 paraMap["option_code"] = param.option_code;
		 paraMap["money_type"] = param.money_type;
		 paraMap["begin_time"] = param.begin_time;
		 paraMap["end_time"] = param.end_time;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 期权行权指派欠资欠券查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} fund_account_opt         衍生品资金账户
     * @param {Object} stock_code           	 证券代码
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryPostageDueLessVoucher = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305015";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["fund_account_opt"] = param.fund_account_opt;
		 paraMap["stock_code"] = param.stock_code;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
     /**
 	 * 期权历史交割信息查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} deliver_type            	交割标志　'0'-打未交割　'1'-全部（见数据字典)
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} option_account           衍生品合约账户
     * @param {Object} option_code              期权合约编码
     * @param {Object} money_type            	币种类别
     * @param {Object} begin_time  				开始日期
     * @param {Object} end_time  				截止日期
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryHistoryDelivery = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305016";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["deliver_type"] = param.deliver_type;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["option_account"] = param.option_account;
		 paraMap["option_code"] = param.option_code;
		 paraMap["money_type"] = param.money_type;
		 paraMap["begin_time"] = param.begin_time;
		 paraMap["end_time"] = param.end_time;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
     /**
 	 * 期权历史对账单查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} money_type            	币种类别
     * @param {Object} begin_time  				开始日期
     * @param {Object} end_time  				截止日期
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryHistoryAccountStatement = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305017";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["money_type"] = param.money_type;
		 paraMap["begin_time"] = param.begin_time;
		 paraMap["end_time"] = param.end_time;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 客户备兑证券不足查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} stock_code            	证券代码
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryEnoughSecurities = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305018";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["stock_code"] = param.stock_code;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 备兑证券可划转数量获取
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} fund_account_opt         衍生品资金账户
     * @param {Object} option_account           衍生品合约账户
     * @param {Object} stock_account            证券账号
     * @param {Object} seat_no              	席位编号
     * @param {Object} exchange_type            交易类别
     * @param {Object} stock_code  				标的证券代码
     * @param {Object} lock_direction  			锁定方向（'1'-锁定 '2'-解锁）
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.querySecuritiesTransferred = function(param,callback,ctrlParam)
	 {
		 var paraMap = {}; 
		 paraMap["funcNo"] = "305019";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["fund_account_opt"] = param.fund_account_opt;
		 paraMap["option_account"] = param.option_account;
		 paraMap["stock_account"] = param.stock_account;
		 paraMap["seat_no"] = param.seat_no;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["lock_direction"] = param.lock_direction;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
     /**
 	 * 备兑证券划转（冻结和解冻）
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} fund_account_opt         衍生品资金账户
     * @param {Object} option_account           衍生品合约账户
     * @param {Object} stock_account            证券账号
     * @param {Object} seat_no              	席位编号
     * @param {Object} exchange_type            交易类别
     * @param {Object} stock_code  				标的证券代码
     * @param {Object} lock_direction  			锁定方向（'1'-锁定 '2'-解锁）
     * @param {Object} entrust_amount			划转数量
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.AgainstSecuritiesTransfer = function(param,callback,ctrlParam)
	 {
		 var paraMap = {}; 
		 paraMap["funcNo"] = "305020";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["fund_account_opt"] = param.fund_account_opt;
		 paraMap["option_account"] = param.option_account;
		 paraMap["stock_account"] = param.stock_account;
		 paraMap["seat_no"] = param.seat_no;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["lock_direction"] = param.lock_direction;
		 paraMap["entrust_amount"] = param.entrust_amount;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 个股期权可撤单査询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} exchange_type            交易市场类别（见数据字典)
     * @param {Object} stock_code               股票代码
     * @param {Object} option_code              期权合约编码
     * @param {Object} entrust_bs           	委托标志（见数据字典)
     * @param {Object} option_account  			衍生品合约账户
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryOrderCancellation = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305021";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["exchange_type"] = param.exchange_type;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["option_code"] = param.option_code;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["option_account"] = param.option_account;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
      /**
 	 * 个股期权合约查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
     * @param {Object} sessionid                会话号
     * @param {Object} stock_code            	标的证券代码
     * @param {Object} option_code                 期权合约编码
     * @param {Object} option_type                期权类别（见数据字典)
     * @param {Object} exercise_month           行权年月
 	 * @param callback 回调函数
 	 */
	 service_option.prototype.queryOptionContrac = function(param,callback,ctrlParam)
	 {
		 var paraMap = {};
		 paraMap["funcNo"] = "305022";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["option_code"] = param.option_code;
		 paraMap["option_type"] = param.option_type;
		 paraMap["exercise_month"] = param.exercise_month;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl(global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
	/***应用接口......................................................结束*/
   

});