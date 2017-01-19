/**
 * 基金service层调用接口
 */
define('trade/service/scripts/trade/service_otc.js',function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var serverPathTrade = global.serverPathTrade; //服务器URL
    
	/********************************公共代码部分********************************/
    service_otc.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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

	service_otc.prototype.destroy = function(){
		this.service.destroy();
	};
	function service_otc(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	module.exports = new service_otc();
	
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
		var hardIdentifier = " "; // 硬件特征码
		var source = " "; // 来源
		var other = " "; // 其他
		if($.device.android){
			channelNo = "1";
		}
		else if($.device.iPad || $.device.iPhone || $.device.ios){
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
	
	/********************************业务范围--OTC********************************/
	 /**
	 * 获取不同期限产品的列表
	 * @param callback       回调函数
	 * @param prod_term_type    产品期限类型（1：1个月,2：2个月，3:3个月，6:6个月以上）
	 * */
	service_otc.prototype.getProductList = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301412";
//		paraMap["prod_term_type"] = param.prod_term_type;
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["cust_code"] = param.cust_code;
		paraMap["fund_account"] = param.fund_account;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	
	 /**
	 * 获取产品详情
	 * @param callback       回调函数
	 * */
	service_otc.prototype.getProDetail = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301414";
	    paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["passowrd"] = param.passowrd;
	    paraMap["inst_cod"] = param.inst_cod;
	    paraMap["prod_type"] = param.prod_type;
	    paraMap["prod_source"] = param.prod_source;
	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  

	 /**
	 * otc 持仓资产
	 * @param callback       回调函数
	 * @param 
	 * */
	service_otc.prototype.queryHolding = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301416";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	 /**
	 * otc 撤单查询
	 * @param callback       回调函数
	 * @param 
	 * */
	service_otc.prototype.queryCancelData = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301403";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	 /**
	 * otc 撤单确认
	 * @param callback       回调函数
	 * @param 
	 * */
	service_otc.prototype.subCancel = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301405";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["trans_acct"] = param.trans_acct;
		paraMap["ori_app_sno"] = param.ori_app_sno;
		paraMap["ori_app_date"] = param.ori_app_date;
		paraMap["type"] = param.type;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	 /**
	 * otc 认购
	 * @param callback       回调函数
	 * @param 
	 * */
	service_otc.prototype.subOtcBuy = function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301404";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["inst_cod"] = param.inst_cod;
		paraMap["inst_id"] = param.inst_id;
		paraMap["ta_code"] = param.ta_code;
		paraMap["trd_id"] = param.trd_id;
		paraMap["trans_acct"] = param.trans_acct;
		paraMap["trd_amt"] = param.trd_amt;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	 /**
	 * otc 查询产品相关协议
	 * @param callback       回调函数
	 * @param 
	 * */
	service_otc.prototype.productsAgreement= function(param, callback, ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301421";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["inst_cod"] = param.inst_cod;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl(serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};  
	
	
	
	
	
	/***应用接口......................................................结束*/

});