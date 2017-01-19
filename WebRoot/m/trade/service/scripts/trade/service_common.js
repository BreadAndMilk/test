/**
 * 普通交易service层调用接口
 */
define('trade/service/scripts/trade/service_common.js',function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var serverConfig = global.serverConfig; // 柜台选择   1. 金证win  2. 恒生T2   3. 顶点 （可拓展）
	var phoneActive = global.phoneActive; //服务器URL

	/********************************公共代码部分********************************/
	service_common.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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
	
	service_common.prototype.destroy = function(){
		this.service.destroy();
	};
	
	function service_common(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	module.exports = new service_common();

	/********************************应用接口开始********************************/

	/**
	 * 添加OpStation
	 * */
	function addOpStation(param){
		var channelNo = " "; // 通道编号    0： pc网页,  1： PC客户端   ，2： 安卓  ，3： IOS ，9：其他  
		var ipAddr = " "; // ip 
		var macAddr = " "; // mac
		var hardId = " "; // 硬盘序列号（硬件id）
		var cpuId = " "; // cpu 序列号
		var mobileNo = " "; // 手机号
		var hardIdentifier = " "; //硬件特征码
		var source = " "; // 来源
		var other = " "; // 其他

		if($.device.android){   //通道编号   0： pc网页,  1： PC客户端   ，2： 安卓  ，3： IOS ，9：其他  
			channelNo = "2";
		}else if($.device.iPad || $.device.iPhone || $.device.ios){
			channelNo = "3";
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

	/********************************业务范围--账户********************************/
	/**
	 * 获取密钥对
	 * @param callback 回调函数
	 * */
	service_common.prototype.getKey = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "1000000";
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 *  普通-客户登录
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} input_type            	登陆类别
	 * @param {Object} input_content            登陆账号
	 * @param {Object} password                 密码
	 * @param {Object} content_type             客户标识类型
	 * @param callback 回调函数
	 */
	service_common.prototype.login =  function(param,callback,ctrlParam){
		var paraMap = {};
		if(param.account_type=="1" && serverConfig=="1"){ //金证win
			paraMap["funcNo"] = "1000010";
		}else if(param.account_type=="1"&& serverConfig=="2"){
			paraMap["funcNo"] = "300100";//客户登录
			paraMap["Branch"] = "30000";
		}
		else if(param.account_type == "2"){
			paraMap["funcNo"] = "305032";
		}
		else{
			paraMap["funcNo"] = "300100";
		}
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["input_type"] = param.input_type;
		paraMap["input_content"] = param.input_content;
		paraMap["password"] = param.password;
		paraMap["content_type"] = param.content_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中 
		paraMap["ticket"] = param.ticket;
		paraMap["mobileKey"] = param.mobilekey;
		paraMap["phone"] = param.phone;
		paraMap["code"] = param.code;
		paraMap["ticketFlag"] = param.ticketFlag;
		paraMap["phone_no"] = param.phone_no;
		paraMap["login_type"] = param.login_type;
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
  	 * 资金查询
  	 * 
	 * @param {Object} entrust_way              委托方式
  	 * @param {Object} branch_no                分支机构
  	 * @param {Object} fund_account             资金账号
  	 * @param {Object} cust_code                客户编号
  	 * @param {Object} sessionid                会话号
  	 * @param {Object} callback	回调方法
  	 * @param {Object} isLastReq	是否是最后一个请求，默认是true	
  	 * */
     service_common.prototype.queryFundSelect=function(param,callback,ctrlParam){
  		var paraMap = {};
  		if(param.account_type=="1"){
	    	paraMap["funcNo"] = "303026";
		}else{
	  	    paraMap["funcNo"] = "301504";
		}
  	    paraMap["entrust_way"] =  param.entrust_way;
  	    paraMap["branch_no"] =  param.branch_no;
  	    paraMap["fund_account"] =  param.fund_account;
  	    paraMap["asset_account"] =  param.asset_account || param.fund_account;
  	    paraMap["cust_code"] =  param.cust_code;
  	    paraMap["password"] =  param.password;
  	    paraMap["sessionid"] =  param.sessionid;
  	    paraMap["money_type"] =  param.money_type;
  	    paraMap["is_homepage"] =  param.is_homepage;
  	    paraMap["income_balance"] = param.is_homepage;
  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.serverPathTrade);
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
	 * @param {Object} password_old             旧密码
	 * @param {Object} password_new             新密码
	 * @param {Object} callback	回调方法
	 */
	service_common.prototype.updatePassword=function(param,callback,ctrlParam){
		var paraMap = {};
		if(param.account_type=="1"){ //金证win
			paraMap["funcNo"] = "303042";
		}else{
			paraMap["funcNo"] = "300101";
		}
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] =  param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] =  param.cust_code;
		paraMap["sessionid"] =  param.sessionid;
		paraMap["password"] =  param.password;
		paraMap["passowrd_type"] = param.passowrd_type;
		paraMap["password_old"] =  param.password_old;
		paraMap["password_new"] =  param.password_new;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 密码校验
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} sessionid                会话号
	 * @param {Object} password_type            密码类型
	 * @param {Object} password                 校验的密码
	 * @param {Object} callback	回调方法
	 */
	service_common.prototype.validatePassword=function(param,callback,ctrlParam){
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
	 * 获取短信验证码
	 * @param {Object} phone       手机号码
	 * @param {Object} callback	回调方法
	 */
	service_common.prototype.getSmsCode=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "901932";
		paraMap["phone"] = param.phone;
		paraMap["device_type"] = param.device_type;
		paraMap["device_code"] = param.device_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.unifyUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 验证 短信验证码
	 * @param {Object} phone       手机号码
	 * @param {Object} callback	回调方法
	 */
	service_common.prototype.checkSmsCode=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "901933";
		paraMap["phone"] = param.phone;
		paraMap["vcode"] = param.vcode;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.unifyUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 绑定客户手机 和 token
	 * @param {Object} phone       手机号码
	 * @param {Object} callback	回调方法
	 */
	service_common.prototype.binDingCustomerPhone=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "901930";
		paraMap["phone"] = param.phone;
		paraMap["hardsn"] = param.hardsn;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.unifyUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 查询  客户 是否绑定手机 
	 * @param {Object} phone       手机号码
	 * @param {Object} callback	回调方法
	 */
	service_common.prototype.queryBinDingCustomerPhone=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "901931";
		paraMap["phone"] = param.phone;
		paraMap["hardsn"] = param.hardsn;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.unifyUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};


	/********************************业务范围--存管********************************/
	/**
	 * 获取开通转账银行账号
	 * @param {Object} entrust_way     委托方式
	 * @param {Object} branch_no       分支机构
	 * @param {Object} fund_account    资金账号
	 * @param {Object} cust_code       客户编号
	 * @param {Object} password        交易密码
	 * @param {Object} sessionid       会话号
	 * @param {Object} bank_code       银行代码
	 * @param {Object} money_type      币种
	 * */
	service_common.prototype.queryAccounts=function(param,callback,ctrlParam){
		var paraMap = {};
		if(param.account_type=="1"){ //金证win
			paraMap["funcNo"] = "303037";
		}else{
			paraMap["funcNo"] = "300200";
		}
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["bank_code"] = param.bank_code;
		paraMap["money_type"] = param.money_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}; 	

	/**
	 * 查询转账银行业务信息
	 * @param {Object} entrust_way     委托方式
	 * @param {Object} branch_no       分支机构
	 * @param {Object} fund_account    资金账号
	 * @param {Object} cust_code       客户编号
	 * @param {Object} password        交易密码
	 * @param {Object} sessionid       会话号
	 * @param {Object} bank_code       银行代码
	 * @param {Object} money_type      币种
	 * @param {Object} transfer_direction 转账方向
	 * */
	service_common.prototype.queryBankInfo=function(param,callback,ctrlParam){
		var paraMap = {};
		if(param.account_type=="1"){ //金证win
			paraMap["funcNo"] = "303038";
		}else{
			paraMap["funcNo"] = "300201";
		}
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["bank_code"] = param.bank_code;
		paraMap["money_type"] = param.money_type;
		paraMap["transfer_direction"] = param.transfer_direction;
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
	service_common.prototype.transfer=function(param,callback,ctrlParam){
		var paraMap = {};
		if(param.account_type=="1"){ //金证win
			paraMap["funcNo"] = "303039";
		}else{
			paraMap["funcNo"] = "300202";
		}
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
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
	//(支持当日和历史，如果开始日期和截止日期传空，或者是当前日期，查询的是当日，否则是查询历史)
	service_common.prototype.transferQuery=function(param,callback,ctrlParam){
		var paraMap = {};
		if(param.account_type=="1"){ //金证win
			paraMap["funcNo"] = "303040";
		}else{
			paraMap["funcNo"] = "300203";
		}
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
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
	 * 银证转账银行余额
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} sessionid                会话号
	 * @param {Object} bank_code				银行代码
	 * @param {Object} money_type               币种
	 * @param {Object} bank_password			银行密码
	 * */
	service_common.prototype.bankBalance=function(param,callback,ctrlParam){
		var paraMap = {};
		if(param.account_type=="1"){ //金证win
			paraMap["funcNo"] = "303041";
		}else{
			paraMap["funcNo"] = "300204";
		}
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["sessionid"] = param.sessionid;
		paraMap["bank_code"] = param.bank_code;
		paraMap["password"] = param.password;
		paraMap["money_type"] = param.money_type;
		paraMap["bank_password"] = param.bank_password;
		paraMap["fund_password"] = param.fund_password;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}; 	

	/**
	 * 一键归集
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} sessionid                会话号
	 * @param {Object} money_type               币种
	 * */
	service_common.prototype.cashCollection=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "300206";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["sessionid"] = param.sessionid;
		paraMap["password"] = param.password;
		paraMap["money_type"] = param.money_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 资金归集
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} sessionid                会话号
	 * @param {Object} money_type               币种
	 * @param {Object} out_fundid               转出资金账号
	 * @param {Object} out_password             转出资金密码
	 * @param {Object} in_fundid                转入资金账号
	 * @param {Object} tranamt                  转账金额
	 * */
	service_common.prototype.cashSweep =function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "300207";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["sessionid"] = param.sessionid;
		paraMap["password"] = param.password;
		paraMap["money_type"] = param.money_type;
		paraMap["out_fund_account"] = param.out_fundid;
		paraMap["out_password"] = param.out_password;
		paraMap["in_fund_account"] = param.in_fundid;
		paraMap["tranamt"] = param.tranamt;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 客户资产账户信息查询
	 * @param {Object} entrust_way              委托方式
	 * @param {Object} branch_no                分支机构
	 * @param {Object} fund_account             资金账号
	 * @param {Object} cust_code                客户编号
	 * @param {Object} sessionid                会话号
	 * @param {Object} money_type               币种
	 * */
	service_common.prototype.queryAccountInfos=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "300208";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["money_type"] = param.money_type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/**
	 * 融资融券模拟登录
	 * */
	service_common.prototype.creditLogin=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "1000011";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
	 * 交易注销
	 * */
	service_common.prototype.loginOut=function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "1000010";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;	
		paraMap["cust_code"] = param.cust_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/********************************业务范围--手机验证********************************/
//	/**
//	* 获取手机验证码
//	* @param callback 回调函数
//	*/
//	service_common.prototype.queryTicketCode = function(param,callback,ctrlParam){
//	var paraMap = {};
//	paraMap["funcNo"] = "1000001";
//	paraMap["mobileNo"] = param.mobileNo;
//	var reqParamVo = this.service.reqParamVo;
//	reqParamVo.setUrl( global.serverPathTrade);
//	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
//	}; 

//	/**
//	* 短信验证码发送(901932)
//	* @param op_way 访问接口来源标识(0：pc,2：pad,3：手机)
//	* @param phone 手机号码
//	* @param callback 回调函数
//	* @param isLastReq 是否最后一次请求
//	* @param isShowWait 是否显示等待层
//	*/
//	service_common.prototype.getSmsCode = function(param,callback,ctrlParam){
//	var paraMap = {};
//	paraMap["funcNo"] = "901932";
//	paraMap["phone"] = param.phone;
//	var reqParamVo = this.service.reqParamVo;
//	reqParamVo.setUrl(phoneActive);
//	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
//	};
//	/**
//	* 登录短信验证码校验(901933)
//	* @param mobile_no 手机号码
//	* @param vcode 手机验证码
//	* @param callback 回调函数
//	*/
//	service_common.prototype.checkSmsCode = function(param,callback,ctrlParam){
//	var paraMap = {};
//	paraMap["funcNo"] = "901933";
//	paraMap["phone"] = param.phone;
//	paraMap["vcode"] = param.vcode;
//	var reqParamVo = this.service.reqParamVo;
//	reqParamVo.setUrl(phoneActive);
//	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
//	}; 
//	/**
//	* 901930
//	* 客户手机绑定
//	*/
//	service_common.prototype.bindMobile = function(param,callback,ctrlParam){
//	var paraMap = {};
//	paraMap["funcNo"] = "901930";
//	paraMap["phone"] = param.phone;
//	paraMap["hardsn"] = param.hardsn;
//	var reqParamVo = this.service.reqParamVo;
//	reqParamVo.setUrl(phoneActive);
//	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
//	};
//	/**
//	* 901931
//	* 查询客户绑定手机信息
//	*/
//	service_common.prototype.queryBinMoblie = function(param,callback,ctrlParam){
//	var paraMap = {};
//	paraMap["funcNo"] = "901931";
//	paraMap["phone"] = param.phone;
//	paraMap["hardsn"] = param.hardsn;
//	var reqParamVo = this.service.reqParamVo;
//	reqParamVo.setUrl(phoneActive);
//	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
//	};
	/**
//       * 802300
//       * 查询客户的自选股
//       */
	service_common.prototype.savaZxgStore = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "802300";
		paraMap["clientid"] = param.clientid;
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.unifyUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/**
//     * 802301
//     * 修改客户的自选股
//     */
	service_common.prototype.updateZxgStore = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "802301";
		paraMap["clientid"] = param.clientid;
		paraMap["stockcode"] = param.stockcode;
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(global.unifyUrl);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	/***应用接口......................................................结束*/
});