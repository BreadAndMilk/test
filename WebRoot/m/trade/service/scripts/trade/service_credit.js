/**
 * 基金service层调用接口
 */
define('trade/service/scripts/trade/service_credit.js',function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
    
	/********************************公共代码部分********************************/
    service_credit.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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

	service_credit.prototype.destroy = function(){
		this.service.destroy();
	};
	function service_credit(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	module.exports = new service_credit();
	
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
	
	/********************************业务范围--融资融券********************************/
	  /**
 	 * 融资融券信用买卖股票联动
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} entrust_bs            	委托标志
     * @param {Object} entrust_type             委托类别（见数据字典)
     * @param {Object} stock_code               股票代码
     * @param {Object} entrust_price            委托价格
     * @param {Object} newstock_flag            是否新股(0:否，1：是)
     * @param {Object} stock_account            股东账户
     * @param {Object} stock_accounts  证券账户集合   市场代码:账户类别:证券账户,市场代码:账户类别:证券账户,….
 	 * @param callback 回调函数
 	 */
	 service_credit.prototype.stock_link = function(param,callback,ctrlParam){
		 var paraMap = {};
		 paraMap["funcNo"] = "303000";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["entrust_bs"] = param.entrust_bs;
		 paraMap["entrust_type"] = param.entrust_type; 
		 paraMap["stock_code"] = param.stock_code;
		 paraMap["entrust_price"] = param.entrust_price;
		 paraMap["stock_account"] = param.stock_account;
		 paraMap["stock_accounts"] = param.stock_accounts;
		 paraMap["newstock_flag"] = param.newstock_flag;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		 var reqParamVo = this.service.reqParamVo;
	  	 reqParamVo.setUrl(global.serverPathTrade);
	  	 this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
	/**
	* 融资融券委托交易
	* @param {Object} entrust_way              委托方式
	* @param {Object} branch_no                分支机构
	* @param {Object} fund_account             资金账号
	* @param {Object} cust_code                客户编号
	* @param {Object} password                 交易密码
	* @param {Object} sessionid                会话号
	* @param {Object} entrust_bs               委托标志
	* @param {Object} entrust_type             委托类别
	* @param {Object} exchange_type            交易市场类别	  
	* @param {Object} stock_account            证券账号
	* @param {Object} stock_code               股票代码
	* @param {Object} entrust_price            委托价格
	* @param {Object} entrust_amount           委托数量
	* @param {Object} batch_no                 委托批号
	* @param callback 回调函数
	*/
	service_credit.prototype.entrust_trade = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303001";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["entrust_type"] = param.entrust_type;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["batch_no"] = param.batch_no;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户担保证券信息查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} exchange_type            交易市场类别	  
	 * @param {Object} stock_code               股票代码
	 * @param callback 回调函数
	 */
	service_credit.prototype.db_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303002";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["exchange`_type"] = param.exchange_type;
		paraMap["stock_code"] = param.stock_code;
		paraMap["poststr"] = param.poststr;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户证券持仓查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               股票代码
	 * @param {Object} exchange_type            交易市场类别	  
	 * @param callback 回调函数
	 */
	service_credit.prototype.cc_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303003";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["exchange_type"] = param.exchange_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 资金账户查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} money_type            	币种类别
	 * @param callback 回调函数
	 */
	service_credit.prototype.zjzh_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303004";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["money_type"] = param.money_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
      
    /**
	 * 融资证券资格信息查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_code            	证券代码
	 * @param {Object} exchange_type            交易市场类别（见数据字典)
	 * @param callback 回调函数
	 */
	service_credit.prototype.qualificationInquiry = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303005";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_code"] = param.stock_code;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["poststr"] = param.poststr;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
      
    /**
	 * 客户可融券信息查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_code            	证券代码
	 * @param {Object} exchange_type            交易市场类别（见数据字典)
	 * @param callback 回调函数
	 */
	service_credit.prototype.queryCanBeMargin = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303006";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_code"] = param.stock_code;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["poststr"] = param.poststr;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};   
	
	/**
	 * 客户融资融券合约查询【汇总模式】
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code            	证券代码
	 * @param {Object} exchange_type            交易市场类别（见数据字典)
	 * @param {Object} begin_date               起始开仓日期
	 * @param {Object} end_date                 到期开仓日期
	 * @param {Object} compact_type 			合约类型(0-融资，1-融券)
	 * @param {Object} query_type               交易市场类别（见数据字典)查询模式(0-未了结，1-当日已了结)
	 * @param callback 回调函数
	 */
	service_credit.prototype.contractInquiry = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303007";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["begin_date"] = param.begin_date;
		paraMap["end_date"] = param.end_date;
		paraMap["compact_type"] = param.compact_type;
		paraMap["query_type"] = param.query_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户融资融券实时合约查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code            	证券代码
	 * @param {Object} exchange_type            交易市场类别（见数据字典)
	 * @param {Object} compact_id               合约编号
	 * @param {Object} compact_type             合约类型
	 * @param {Object} query_type               交易市场类别（见数据字典)查询模式(0-未了结，1-当日已了结)
	 * @param callback 回调函数
	 */
	service_credit.prototype.curcontractquery = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303008";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["compact_id"] = param.compact_id;
		paraMap["compact_type"] = param.compact_type;
		paraMap["query_type"] = param.query_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户融资融券资产负债查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} money_type               币种类别
	 * @param callback 回调函数
	 */
	service_credit.prototype.zcfz_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303009";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["money_type"] = param.money_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户融资融券直接还款
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} money_type               币种类别
	 * @param {Object} pay_type                 还款方式（0：按金额还，1：按笔还）
	 * @param {Object} occur_balance            还款金额
	 * @param {Object} compact_id               还款合约编号
	 * @param callback 回调函数
	 */
	service_credit.prototype.repayment = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303010";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["money_type"] = param.money_type;
		paraMap["pay_type"] = param.pay_type;
		paraMap["occur_balance"] = param.occur_balance;
		paraMap["compact_id"] = param.compact_id;
		paraMap["jzwin_debtdate"] = param.jzwin_debtdate;
		paraMap["jzwin_debtsno"] = param.jzwin_debtsno;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户融资融券直接还券
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} exchange_type            交易市场类别
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               证券代码
	 * @param {Object} entrust_amount           还券数量
	 * @param {Object} compact_id               还款合约编号
	 * @param callback 回调函数
	 */
	service_credit.prototype.repaystock = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303011";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["compact_id"] = param.compact_id;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户融资融券直接还款联动
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param callback 回调函数
	 */
	service_credit.prototype.remoney_link = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303012";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["money_type"] = param.money_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 客户融资融券直接还券联动
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_code               股票代码
	 * @param callback 回调函数
	 */
	service_credit.prototype.restock_link = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303013";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_code"] = param.stock_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 担保品划转联动
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} password_crdt            信用账户交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} branch_no_crdt           信用账户分支机构
	 * @param {Object} fund_account_crdt        信用账户资金账号
	 * @param {Object} client_id_crdt           信用客户编号
	 * @param {Object} password_crdt            信用账户交易密码
	 * @param {Object} stock_code               股票代码
	 * @param {Object} cost_price               持仓成本价
	 * @param {Object} exchange_type            交易类别
	 * @param {Object} entrust_bs               买卖方向（0：买入--普转信，1：卖出--信转普）
	 * @param callback 回调函数
	 */
	service_credit.prototype.dbin_link = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303014";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["branch_no_crdt"] = param.branch_no_crdt;
		paraMap["fund_account_crdt"] = param.fund_account_crdt;
		paraMap["password_crdt"] = param.password_crdt;
		paraMap["client_id_crdt"] = param.client_id_crdt;
		paraMap["password_crdt"] = param.password_crdt;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_code"] = param.stock_code;
		paraMap["cost_price"] = param.cost_price;
		paraMap["last_price"] = param.last_price;
		paraMap["stock_account"] = param.stock_account;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["entrust_bs"] = param.entrust_bs;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 担保品划转提交
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} password_crdt            信用账户交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_account            证券账号
	 * @param {Object} seat_no                  席位编号
	 * @param {Object} exchange_type            交易类别
	 * @param {Object} stock_code               股票代码
	 * @param {Object} entrust_amount           过户数量
	 * @param {Object} branch_no_crdt           信用账户分支机构
	 * @param {Object} client_id_crdt           信用客户编号
	 * @param {Object} fund_account_crdt        信用账户资金账号
	 * @param {Object} stock_account_crdt       证券账号
	 * @param {Object} seat_no_crdt             席位编号
	 * @param {Object} cost_price               持仓成本价
	 * @param {Object} entrust_bs               买卖方向(0：买入--普转信，1：卖出--信转普)
	 * @param callback 回调函数
	 */
	service_credit.prototype.dbin_sub = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303015";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;	
		paraMap["stock_account"] = param.stock_account;
		paraMap["seat_no"] = param.seat_no;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_code"] = param.stock_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["branch_no_crdt"] = param.branch_no_crdt;
		paraMap["client_id_crdt"] = param.client_id_crdt;
		paraMap["fund_account_crdt"] = param.fund_account_crdt;
		paraMap["stock_account_crdt"] = param.stock_account_crdt;
		paraMap["password_crdt"] = param.password_crdt;	
		paraMap["seat_no_crdt"] = param.seat_no_crdt;
		paraMap["cost_price"] = param.cost_price;
		paraMap["last_price"] = param.last_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	
	/**
	 * 融资融券当日委托查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} exchange_type            交易类别
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               席位编号
	 * @param {Object} entrust_bs               买卖方向（0：买入--普转信，1：卖出--信转普）
	 * @param callback 回调函数
	 */
	service_credit.prototype.todaywt_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303016";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["entrust_bs"] = param.entrust_bs;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 融资融券当日可撤委托查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} exchange_type            交易类别
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               席位编号
	 * @param {Object} entrust_bs               买卖方向（0：买入--普转信，1：卖出--信转普）
	 * @param callback 回调函数
	 */
	service_credit.prototype.todaykcwt_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303017";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["entrust_bs"] = param.entrust_bs;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/** 
	 * 融资融券撤单
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} entrust_no               委托编号
	 * @param {Object} batch_flag               批量撤单标志（0:不是，1：是）
	 * @param {Object} exchange_type            交易市场类别
	 * @param callback 回调函数
	 */
	service_credit.prototype.credit_cancel = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303018";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["entrust_no"] = param.entrust_no;
		paraMap["batch_flag"] = param.batch_flag;
		paraMap["exchange_type"] = param.exchange_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/** 
	 * 融资融券当日成交查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} exchange_type            交易市场类别
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               证券代码
	 * @param {Object} entrust_bs               委托标志
	 * @param callback 回调函数
	 */
	service_credit.prototype.todaycj_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303019";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["entrust_bs"] = param.entrust_bs;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/** 
	 * 融资融券历史委托查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} exchange_type            交易市场类别
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               证券代码
	 * @param {Object} begin_time               开始日期
	 * @param {Object} end_time                 截止日期
	 * @param {Object} entrust_bs               委托标志
	 * @param callback 回调函数
	 */
	service_credit.prototype.historywt_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303020";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["begin_time"] = param.begin_time;
		paraMap["end_time"] = param.end_time;
		paraMap["entrust_bs"] = param.entrust_bs;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/** 
	 * 客户融资融券合约查询【明细模式】
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               证券代码
	 * @param {Object} exchange_type            交易市场类别
	 * @param {Object} begin_date               开始日期
	 * @param {Object} end_date                 截止日期
	 * @param {Object} compact_type             合约类型(0-融资，1-融券)
	 * @param {Object} query_type               查询模式(0-未了结，1-当日已了结)
	 * @param {Object} compact_id               合约编号
	 * @param callback 回调函数
	 */
	service_credit.prototype.contractmx_query = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303021";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["begin_date"] = param.begin_date;
		paraMap["end_date"] = param.end_date;
		paraMap["compact_type"] = param.compact_type;
		paraMap["query_type"] = param.query_type;
		paraMap["compact_id"] = param.compact_id;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/** 
	 * 客户融资融券负债变动流水
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               证券代码
	 * @param {Object} begin_date               开始日期
	 * @param {Object} end_date                 截止日期
	 * @param callback 回调函数
	 */
	service_credit.prototype.credit_bdls = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303022";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["begin_date"] = param.begin_date;
		paraMap["end_date"] = param.end_date;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	 /**
     * 融资融券担保品划转委托查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param op_station	varchar(50)	操作站点（见数据字典)
     * @param sessionid	varchar(32)	会话号
     * @param exchange_type	varchar(1)	交易市场类别（见数据字典)
     * @param stock_account	varchar(20)	证券账号
     * @param stock_code	varchar(6)	证券代码
     * @param entrust_bs	varchar(2)	委托标志（见数据字典)

     * @param callback 回调函数
     * */
    service_credit.prototype.queryGh = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303023";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["exchange_type"] = param.exchange_type;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["entrust_bs"] = param.entrust_bs;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
	
	 /**
     * 融资融券担保品划转可撤委托查询
     * @param entrust_way varchar(1)	委托方式（见数据字典)	Y	
     * @param branch_no varchar(10)	分支机构	Y
     * @param fund_account varchar(20)	资金账号	Y	
     * @param cust_code varchar(32)	客户编号	Y	
     * @param password varchar(32)	交易密码	N	恒生版本不能为空
     * @param op_station varchar(50)	操作站点（见数据字典)	Y	
     * @param sessionid varchar(32)	会话号	N	MID版本不能为空
     * @param exchange_type varchar(1)	交易市场类别（见数据字典)
     * @param stock_account varchar(20)	证券账号
     * @param stock_code varchar(6)	证券代码
     * @param entrust_bs varchar(2)	委托标志（见数据字典)
     * @param callback 回调函数
     * */
    service_credit.prototype.queryTransCanCancel = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303024";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["op_station"] = param.op_station;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["exchange_type"] = param.exchange_type;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["entrust_bs"] = param.entrust_bs;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    
    /**
     * 融资融券担保品划转委托查询(历史)
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param op_station	varchar(50)	操作站点（见数据字典)
     * @param sessionid	varchar(32)	会话号
     * @param exchange_type	varchar(1)	交易市场类别（见数据字典)
     * @param stock_account	varchar(20)	证券账号
     * @param stock_code	varchar(6)	证券代码
     * @param entrust_bs	varchar(2)	委托标志（见数据字典)

     * @param callback 回调函数
     * */
    service_credit.prototype.queryGhHistory = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303025";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["exchange_type"] = param.exchange_type;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["begin_time"] = param.begin_time;
    	paraMap["end_time"] = param.end_time;
    	paraMap["entrust_bs"] = param.entrust_bs;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * 融资融券资产负债综合查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param op_station	varchar(50)	操作站点（见数据字典)
     * @param sessionid	varchar(32)	会话号
     * @param sessionid	varchar(32)	币种类别（见数据字典)
     * @param callback 回调函数
     * */
    service_credit.prototype.rzrq_liabilitiesQuery = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303026";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["money_type"] = param.money_type;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * 融资融券交割单查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param sessionid	varchar(32)	会话号
     * @param money_type	varchar(20)	币种类别
     * @param entrust_bs	varchar(2)	委托标志（见数据字典)
	 * @param begin_time	varchar(2)	开始时间
	 * @param end time 	varchar(2)	结束时间
	 * @param exchange_type 	varchar(1)	交易市场类别（见数据字典)
	 * @param stock_account	varchar(20)	证券账号
	 * @param stock_code 	varchar(6)	证券代码
	 * @param money_type 	varchar(1)	币种类别（见数据字典)
     * @param callback 回调函数
     * */
    service_credit.prototype.deliveryOrder_Query = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303027";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["money_type"] = param.money_type;
    	paraMap["begin_time"] = param.begin_time;
    	paraMap["end_time"] = param.end_time;
    	paraMap["exchange_type"] = param.exchange_type;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["money_type"] = param.money_type;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * 融资融券新股申购额度查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param op_station	varchar(50)	操作站点（见数据字典)
     * @param sessionid	varchar(32)	会话号
     * @param exchange_type	varchar(1)	交易市场类别（见数据字典)
     * @param callback 回调函数
     * */
    service_credit.prototype.newAmount_Query = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303028";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["exchange_type"] = param.exchange_type;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
     /**
     * 配号查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param sessionid	varchar(32)	会话号
     * @param money_type	varchar(20)	币种类别
     * @param exchange_type 	varchar(1)	交易市场类别（见数据字典)
	 * @param stock_account	varchar(20)	证券账号
	 * @param stock_code 	varchar(6)	证券代码
     * @param entrust_bs	varchar(2)	委托标志（见数据字典)
	 * @param begin_date	varchar(2)	开始时间
	 * @param end_date 	varchar(2)	结束时间
     * @param callback 回调函数
     * */
    service_credit.prototype.distribution_query = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303029";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["exchange_type"] = param.exchange_type;
    	paraMap["begin_date"] = param.begin_date;
    	paraMap["end_date"] = param.end_date;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    /**
     * 中签查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param sessionid	varchar(32)	会话号
     * @param money_type	varchar(20)	币种类别
     * @param entrust_bs	varchar(2)	委托标志（见数据字典)
	 * @param begin_date	varchar(2)	开始时间
	 * @param end_date 	varchar(2)	结束时间
     * @param callback 回调函数
     * */
    service_credit.prototype.success_Query = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303030";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["begin_date"] = param.begin_date;
    	paraMap["end_date"] = param.end_date;
    	paraMap["entrust_bs"] = param.entrust_bs;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
 	 * 融资融券授信额度调整申请
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} money_type        		币种类别（见数据字典）
     * @param {Object} valid_date        		有效日期
     * @param {Object} fin_apply_quota        	融资申请额度
     * @param {Object} slo_apply_quota        	融券申请额度
     * @param {Object} total_apply_quota        申请总额度
 	 * @param callback 回调函数
 	 */
	 service_credit.prototype.submitApplication = function(param,callback,ctrlParam){
		 var paraMap = {};
		 paraMap["funcNo"] = "303031";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["money_type"] = param.money_type;
		 paraMap["valid_date"] = param.valid_date;
		 paraMap["fin_apply_quota"] = param.fin_apply_quota;
		 paraMap["slo_apply_quota"] = param.slo_apply_quota;
		 paraMap["total_apply_quota"] = param.total_apply_quota;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		 var reqParamVo = this.service.reqParamVo;
	  	 reqParamVo.setUrl( global.serverPathTrade);
	  	 this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
    /**
 	 * 客户信用额度调整申请查询
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
     * @param {Object} fund_account             资金账号
     * @param {Object} cust_code                客户编号
 	 * @param {Object} password                 交易密码
     * @param {Object} sessionid                会话号
     * @param {Object} money_type        		币种类别（见数据字典）
     * @param {Object} valid_date        		有效日期
     * @param {Object} fin_apply_quota        	融资申请额度
     * @param {Object} slo_apply_quota        	融券申请额度
     * @param {Object} total_apply_quota        申请总额度
 	 * @param callback 回调函数
 	 */
	 service_credit.prototype.custApplyQuery = function(param,callback,ctrlParam){
		 var paraMap = {};
		 paraMap["funcNo"] = "303032";
		 paraMap["entrust_way"] = param.entrust_way;
		 paraMap["branch_no"] = param.branch_no;
		 paraMap["fund_account"] = param.fund_account;
		 paraMap["cust_code"] = param.cust_code;
		 paraMap["password"] = param.password;
		 paraMap["sessionid"] = param.sessionid;
		 paraMap["money_type"] = param.money_type;
		 addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		 var reqParamVo = this.service.reqParamVo;
	  	 reqParamVo.setUrl( global.serverPathTrade);
	  	 this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      };
      
    
    
    /**
     * 未平仓合约查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param sessionid	varchar(32)	会话号
     * @param money_type	varchar(20)	币种类别
	 * @param begin_date	varchar(2)	开始时间
	 * @param end_date	varchar(2)	结束时间
	 * * @param stock_account	varchar(20)	证券账号
	 * @param stock_code 	varchar(6)	证券代码
     * @param entrust_bs	varchar(2)	委托标志（见数据字典)
     * @param {Object} compact_type             合约类型(0-融资，1-融券)
	 * @param {Object} query_type               查询模式(0-未了结，1-当日已了结)
	 * @param {Object} compact_id               合约编号
     * @param callback 回调函数
     * */
    service_credit.prototype.openInterest_Query = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303035";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["jzwin_status"] = param.jzwin_status;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["exchange_type"] = param.exchange_type;
    	paraMap["begin_date"] = param.begin_date;
    	paraMap["end_date"] = param.end_date;
    	paraMap["compact_type"] = param.compact_type;
		paraMap["query_type"] = param.query_type;
		paraMap["compact_id"] = param.compact_id;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
   
    /**
     * 融资融担保品转入查询
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param sessionid	varchar(32)	会话号
     * @param money_type	varchar(20)	币种类别
	 * @param begin_date	varchar(2)	开始时间
	 * @param end_date	varchar(2)	结束时间
	 * * @param stock_account	varchar(20)	证券账号
	 * @param stock_code 	varchar(6)	证券代码
     * @param entrust_bs	varchar(2)	委托标志（见数据字典)
     * @param {Object} compact_type             合约类型(0-融资，1-融券)
	 * @param {Object} query_type               查询模式(0-未了结，1-当日已了结)
	 * @param {Object} compact_id               合约编号
     * @param callback 回调函数
     * */
    service_credit.prototype.transferInPostion = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303046";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["password"] = param.password;
    	paraMap["password_c"] = param.password_c;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["exchange_type"] = param.exchange_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
     * 查询普通资金帐号
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param sessionid	varchar(32)	会话号  
     * @param callback 回调函数
     * */
    service_credit.prototype.queryStockAccount = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303047";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
	/**
	 * 获取密钥对
	 * @param callback 回调函数
	 * */
	service_credit.prototype.getKey = function(param,callback,ctrlParam){
 	    var paraMap = {};
		paraMap["funcNo"] = "1000000";
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
     };
     /**
     * 融资融券卖券还款按笔还款
     * @param entrust_way	varchar(1)	委托方式（见数据字典)
     * @param branch_no	varchar(10)	分支机构
     * @param fund_account	varchar(20)	资金账号
     * @param cust_code	varchar(32)	客户编号
     * @param password	varchar(32)	交易密码
     * @param sessionid	varchar(32)	会话号  
     * @param callback 回调函数
     * */
    service_credit.prototype.repayCash = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "303049";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["password"] = param.password;
    	paraMap["sessionid"] = param.sessionid;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["entrust_amount"] = param.entrust_amount;
		paraMap["entrust_price"] = param.entrust_price;
		paraMap["entrust_bs"] = param.entrust_bs;
		paraMap["init_date"] = param.init_date;
		paraMap["debit_type"] = param.debit_type;
		paraMap["serial_no"] = param.serial_no;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
    
    /**
     * 交易证券持仓查询
     * @param entrust_way varchar(1)	委托方式（见数据字典)	Y	
     * @param branch_no varchar(10)	分支机构	Y
     * @param fund_account varchar(20)	资金账号	Y	
     * @param cust_code varchar(32)	客户编号	Y	
     * @param password varchar(32)	交易密码	N	恒生版本不能为空
     * @param op_station varchar(50)	操作站点（见数据字典)	Y	
     * @param sessionid varchar(32)	会话号	N	MID版本不能为空
     * @param stock_account varchar(20)	证券账号	N	
     * @param stock_code varchar(6)	证券代码	N	
     * @param exchange_type varchar(4)	交易市场类别（见数据字典)	N	
     * @param callback 回调函数
     * */
    service_credit.prototype.queryTradePosition = function(param,callback,ctrlParam){

    	var paraMap = {};
    	paraMap["funcNo"] = "301503";
    	paraMap["entrust_way"] = param.entrust_way;
    	paraMap["branch_no"] = param.branch_no;
    	paraMap["fund_account"] = param.fund_account;
    	paraMap["cust_code"] = param.cust_code;
    	paraMap["password"] = param.password;
    	paraMap["op_station"] = param.op_station;
    	paraMap["sessionid"] = param.sessionid;
    	paraMap["stock_account"] = param.stock_account;
    	paraMap["stock_code"] = param.stock_code;
    	paraMap["exchange_type"] = param.exchange_type;
    	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
   
   
    /**
	 *  获取个股行情
	 * @param {Object} stockStr 股票代码或者拼音
	 * @param {Object} callback	回调方法
	 * */
	service_credit.prototype.getStockInfo = function(param,callback,ctrlParam){
		//填充机构代码
	    var paraMap = {};
	    paraMap["funcno"] = "20010";
	    paraMap["version"] = 1;
	    paraMap["type"] = "0:1:2:3:4:5:6:8:9:10:11:12:13:14:16:17:18:19:20:30:64:65:66";
	    paraMap["code_list"] = param.code_list;
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	 /**
	 *  获取五档买卖盘
	 * @param {Object} stock_list 证券代码，以SH:000001|SZ:000001分隔
	 * @param {Object} callback	回调方法
	 * */
	service_credit.prototype.getFifthOrder = function(param,callback,ctrlParam){
		//填充机构代码
	    var paraMap = {};
	    paraMap["funcno"] = "20003";
	    paraMap["version"] = 1;
	    paraMap["stock_list"] = param.stock_list;
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
  	 * 获取开通转帐银行账号
  	 * @param {Object} entrust_way     委托方式
  	 * @param {Object} branch_no       分支机构
  	 * @param {Object} fund_account    资金账号
  	 * @param {Object} cust_code       客户编号
  	 * @param {Object} sessionid       会话号
   	 * @param {Object} bank_code       银行代码
  	 * @param {Object} money_type      币种
  	 * */
      service_credit.prototype.queryAccounts = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "300200";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
  	    paraMap["sessionid"] = param.sessionid;
  	    paraMap["bank_code"] = param.bank_code;
  	    paraMap["money_type"] = param.money_type;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	}; 	
  	
  	/**
  	 * 查询转帐银行业务信息
  	 * @param {Object} entrust_way     委托方式
  	 * @param {Object} branch_no       分支机构
  	 * @param {Object} fund_account    资金账号
  	 * @param {Object} cust_code       客户编号
  	 * @param {Object} sessionid       会话号
  	 * @param {Object} password       交易密码
  	 * @param {Object} transfer_direction 转账方向
   	 * @param {Object} bank_code       银行代码
  	 * @param {Object} money_type      币种
  	 * */
      service_credit.prototype.queryBankInfo = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "300201";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
  	    paraMap["sessionid"] = param.sessionid;
  	    paraMap["password"] = param.password;
  	    paraMap["transfer_direction"] = param.transfer_direction;
  	    paraMap["bank_code"] = param.bank_code;
  	    paraMap["money_type"] = param.money_type;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	}; 
  	
  	
	/**
  	 * 银证转账
  	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
   	 * @param {Object} bank_code                银行代码
  	 * @param {Object} money_type               币种
  	 * @param {Object} transfer_direction       转账方向
  	 * @param {Object} tranamt                  发生金额
   	 * @param {Object} fund_password            资金密码
  	 * @param {Object} bank_password            银行密码
  	 * @param {Object} client_account           存管资金账号
  	 * */
      service_credit.prototype.transfer = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "300202";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
  	    paraMap["sessionid"] = param.sessionid;
  	    paraMap["bank_code"] = param.bank_code;
  	    paraMap["money_type"] = param.money_type;
  	    paraMap["transfer_direction"] = param.transfer_direction;
       	paraMap["tranamt"] = param.tranamt;	
  	    paraMap["fund_password"] = param.fund_password;
  	    paraMap["bank_password"] = param.bank_password;
  	    paraMap["client_account"] = param.client_account;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	
/**
  	 * 银证转账查询
  	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
   	 * @param {Object} money_type               币种
  	 * */
      service_credit.prototype.transferQuery = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "300203";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
  	    paraMap["sessionid"] = param.sessionid;
  	    paraMap["money_type"] = param.money_type;
  	    paraMap["begin_time"] = param.begin_time;
  	    paraMap["end_time"] = param.end_time;
  	    paraMap["transfer_direction"] = param.transfer_direction;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	}; 	
  	
  	/**
  	 * 银证转帐银行余额
  	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} bank_code				银行代码
   	 * @param {Object} money_type               币种
   	 * @param {Object} bank_password			银行密码
  	 * */
      service_credit.prototype.bankBalance = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "300204";
  	    paraMap["entrust_way"] = param.entrust_way;
  	    paraMap["branch_no"] = param.branch_no;
       	paraMap["fund_account"] = param.fund_account;	
  	    paraMap["cust_code"] = param.cust_code;
  	    paraMap["sessionid"] = param.sessionid;
  	    paraMap["bank_code"] = param.bank_code;
  	    paraMap["money_type"] = param.money_type;
  	    paraMap["bank_password"] = param.bank_password;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
  	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	}; 	
  	
  	/**
  	 * 验证原密码
  	 * 
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} password_type            密码类型
  	 * @param {Object} password                 校验的密码
  	 * @param {Object} mac                		mac地址
  	 * @param {Object} hddsn             		硬盘序列号
  	 * @param {Object} ip               		ip地址
  	 * @param {Object} callback	回调方法
  	 */
      service_credit.prototype.validatePassword = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "300107";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["password"] =  param.password;
	    paraMap["password_type"] = param.password_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	
	/**
  	 * 修改密码
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} passowrd_type            密码类型
  	 * @param {Object} password_new             旧密码
  	 * @param {Object} password_new             新密码
  	 * @param {Object} mac                		mac地址
  	 * @param {Object} hddsn             		硬盘序列号
  	 * @param {Object} ip               		ip地址
  	 * @param {Object} callback	回调方法
  	 */
    service_credit.prototype.updatePassword = function(param,callback,ctrlParam){
	    var paraMap = {};
	    paraMap["funcNo"] = "300101";
	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] = param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] = param.cust_code;
	    paraMap["sessionid"] = param.sessionid;
	    paraMap["passowrd_type"] = param.passowrd_type;
	    paraMap["password_old"] = param.password_old;
	    paraMap["password_new"] = param.password_new;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
  	
  	/**
  	 * 资金流水查询
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} begin_time               开始日期
  	 * @param {Object} end_time                	截止日期
  	 * @param {Object} callback	回调方法
  	*/
    service_credit.prototype.queryAccountFlow = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "301505";
  	    paraMap["entrust_way"] =  param.entrust_way;
  	    paraMap["branch_no"] =  param.branch_no;
  	    paraMap["fund_account"] =  param.fund_account;
  	    paraMap["cust_code"] =  param.cust_code;
  	    paraMap["money_type"] =  param.money_type;
  	    paraMap["sessionid"] =  param.sessionid;
  	    paraMap["begin_date"] =  param.begin_date;
  	    paraMap["end_date"] =  param.end_date;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	/**
     * 获取指定日期向前(向后)第N个交易日
     * @param {Object} trade_date varchar(30)	查询日期	Y	yyyy-MM-dd
     * @param {Object} sort varchar(1)	查询方向(0:向前,1向后)	N	默认取1
     * @param {Object} days	int	第几个交易日	N	默认取1
     * @param callback 回调函数
     */
    service_credit.prototype.queryDiffTardeDate = function(param,callback,ctrlParam){
  		var paraMap = {};
    	paraMap["funcNo"] = "901902";
    	paraMap["trade_date"] = param.trade_date;
    	paraMap["sort"] = param.sort;
    	paraMap["days"] = param.days;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	
      /**
     * 获取服务器上当前日期
     * @param callback 回调函数
     */
    service_credit.prototype.getCurTime = function(param,callback,ctrlParam){
    	var paraMap = {};
    	paraMap["funcNo"] = "1000002";
    	var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
 	 * 用户登录
 	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
 	 * @param {Object} input_type               登录类别（见数据字典）
     * @param {Object} input_content            登录账号
     * @param {Object} op_station            	操作站点（见数据字典）
     * @param {Object} password                 密码
     * @param {Object} content_type             客户标识类型
 	 * @param {Object} auth_type              	认证方式 （见数据字典）
     * @param {Object} auth_source          	认证原文相关信息
     * @param {Object} auth_key             	认证串
     * @param {Object} auth_bind_station        硬件绑定地址(硬件机器码)
     * @param {Object} ticket        图片验证码
     * @param {Object} mobileKey        验证码的 key
     * @param {Object} ticketFlag        0 不需要验证码 1 需要验证码
 	 * @param callback 回调函数
 	 */
    service_credit.prototype.login = function(param,callback,ctrlParam){
  	    var paraMap = {};
 		paraMap["funcNo"] = "300100";
 		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["input_type"] = param.input_type;
 		paraMap["input_content"] = param.input_content;
 		paraMap["op_station"] = param.op_station;
 		paraMap["password"] = param.password;
 		paraMap["content_type"] = param.content_type;
 		paraMap["auth_type"] = param.auth_type;
 		paraMap["auth_source"] = param.auth_source;
 		paraMap["auth_key"] = param.auth_key;
 		paraMap["auth_bind_station"] = param.auth_bind_station;
 		paraMap["ticket"] = param.ticket;
 		paraMap["mobileKey"] = param.mobileKey;
 		paraMap["ticketFlag"] = param.ticketFlag;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
 		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    };
    
    /**
  	 * 历史成交查询
  	 * 
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} begin_time               开始日期
  	 * @param {Object} end_time                	截止日期
  	 * @param {Object} callback	回调方法
  	 */
      service_credit.prototype.queryHistoryTrade = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "303036";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["begin_time"] =  param.begin_time;
	    paraMap["end_time"] =  param.end_time;
		paraMap["entrust_bs"] = param.entrust_bs;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
   
    /**
  	 * 资金股份流水
  	 * 
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} begin_time               开始日期
  	 * @param {Object} end_time                	截止日期
  	 * @param {Object} callback	回调方法
  	 */
      service_credit.prototype.queryAssetFlow = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "303043";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["password"] =  param.password;
	    paraMap["begin_time"] =  param.begin_time;
	    paraMap["end_time"] =  param.end_time;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	/**
  	 * 查询融券卖出
  	 * 
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} begin_time               开始日期
  	 * @param {Object} end_time                	截止日期
  	 * @param {Object} callback	回调方法
  	 */
      service_credit.prototype.queryFinacingToSell = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "303044";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["password"] =  param.password;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
   /** 
	 * 物资划转交易登录
	 * @param {Object} entrust_way              委托方式
     * @param {Object} branch_no                分支机构
 	 * @param {Object} input_type               登录类别（见数据字典）
     * @param {Object} input_content            登录账号
     * @param {Object} op_station            	操作站点（见数据字典）
     * @param {Object} password                 密码
     * @param {Object} content_type             客户标识类型
 	 * @param {Object} auth_type              	认证方式 （见数据字典）
     * @param {Object} auth_source          	认证原文相关信息
     * @param {Object} auth_key             	认证串
     * @param {Object} auth_bind_station        硬件绑定地址(硬件机器码)
     * @param {Object} ticket        图片验证码
     * @param {Object} mobileKey        验证码的 key
     * @param {Object} ticketFlag        0 不需要验证码 1 需要验证码
	 * @param callback 回调函数
	 */
	service_credit.prototype.goodsSwitchTradeLogin = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "1000008";
 		paraMap["entrust_way"] = param.entrust_way;
 		paraMap["branch_no"] = param.branch_no;
 		paraMap["input_type"] = param.input_type;
 		paraMap["input_content"] = param.input_content;
 		paraMap["op_station"] = param.op_station;
 		paraMap["password"] = param.password;
 		paraMap["content_type"] = param.content_type;
 		paraMap["auth_type"] = param.auth_type;
 		paraMap["auth_source"] = param.auth_source;
 		paraMap["auth_key"] = param.auth_key;
 		paraMap["auth_bind_station"] = param.auth_bind_station;
 		paraMap["ticket"] = param.ticket;
 		paraMap["mobileKey"] = param.mobileKey;
 		paraMap["ticketFlag"] = param.ticketFlag;
 		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	  	/**
  	 * 查询融券负债
  	 * 
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} begin_time               开始日期
  	 * @param {Object} end_time                	截止日期
  	 * @param {Object} callback	回调方法
  	 */
      service_credit.prototype.queryRqLiabilities = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "303048";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["password"] =  param.password;
	    paraMap["entrust_price"] =  param.entrust_price;
	    paraMap["exchange_type"] =  param.exchange_type;
	    paraMap["stock_code"] =  param.stock_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
  	
  	/**
	 * 客户证券持仓查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} password                 交易密码
	 * @param {Object} sessionid                会话号
	 * @param {Object} stock_account            证券账号
	 * @param {Object} stock_code               股票代码
	 * @param {Object} exchange_type            交易市场类别	  
	 * @param callback 回调函数
	 */
	service_credit.prototype.queryTransferPositions = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "303003";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["exchange_type"] = param.exchange_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	//两融中新股申购-新股列表
     service_credit.prototype.queryNewslist = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "303053";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["flag"] = param.flag;     //0:查询全部,1:今日中签,2:今日上市,3:未上市,4:即将发行
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
  	
  	
	//两融新股申购查询额度
	service_credit.prototype.queryPurchaseLimit = function(param,callback,ctrlParam){
  		var paraMap = {};
  	    paraMap["funcNo"] = "303028";
  	    paraMap["entrust_way"] = param.entrust_way;
	    paraMap["branch_no"] =  param.branch_no;
	    paraMap["fund_account"] = param.fund_account;
	    paraMap["cust_code"] =  param.cust_code;
	    paraMap["sessionid"] =  param.sessionid;
	    paraMap["password"] =  param.password;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	    var reqParamVo = this.service.reqParamVo;
	  	reqParamVo.setUrl( global.serverPathTrade);
	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
  	};
	
	/***应用接口......................................................结束*/

});