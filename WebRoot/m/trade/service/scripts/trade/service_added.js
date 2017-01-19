/**
 * 网络投票service层调用接口
 */
define('trade/service/scripts/trade/service_added.js',function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
    
	/********************************公共代码部分********************************/
    service_added.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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

	service_added.prototype.destroy = function(){
		this.service.destroy();
	};
	function service_added(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	module.exports = new service_added();
	
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
				mobileNo =mobileNoInfo.results[0].value;
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
	/********************************业务范围--网络投票等功能********************************/
	
	/**
	 * 股东大会信息查询
	 * @param {Object} entrust_way				委托方式
	 * @param {Object} branch_no				分支机构
	 * @param {Object} fund_account				资金账号
	 * @param {Object} cust_code				客户编号	
	 * @param {Object} password					交易密码
	 * @param {Object} op_station				操作站点	
	 * @param {Object} sessionid				会话号
	 * @param {Object} exchange_type			市场
	 * @param {Object} company_code				公司代码
	 * @param {Object} vote_code				产品代码
	 * */
	service_added.prototype.queryStockMeetingInfo = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301530";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["company_code"] = param.company_code;
		paraMap["vote_code"] = param.vote_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
 		reqParamVo.setUrl( global.serverPathTrade);
 		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	/**
	 * 投票议案信息查询
	 * @param {Object} entrust_way				委托方式
	 * @param {Object} branch_no				分支机构
	 * @param {Object} fund_account				资金账号
	 * @param {Object} cust_code				客户编号	
	 * @param {Object} password					交易密码
	 * @param {Object} op_station				操作站点	
	 * @param {Object} sessionid				会话号
	 * @param {Object} meeting_seq				股东大会编码
	 * @param {Object} v_id						议案编号
	 * @param {Object} vote_code				产品代码
	 * */
	service_added.prototype.queryVoteBillInfo = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301531";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["sessionid"] = param.sessionid;
		paraMap["meeting_seq"] = param.meeting_seq;
		paraMap["v_id"] = param.v_id;
		paraMap["vote_code"] = param.vote_code;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
 		reqParamVo.setUrl( global.serverPathTrade);
 		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};
	
	
	
	
	/**
	 * 上交所网络投票
	 * @param {Object} entrust_way				委托方式
	 * @param {Object} branch_no				分支机构
	 * @param {Object} fund_account				资金账号
	 * @param {Object} cust_code				客户编号	
	 * @param {Object} password					交易密码	
	 * @param {Object} op_station				操作站点	
	 * @param {Object} exchange_type			市场	
	 * @param {Object} stock_account			证券代码	
	 * @param {Object} stock_code				股东代码
	 * @param {Object} sessionid				会话号
	 * @param {Object} meeting_seq				股东大会编码
	 * @param {Object} v_id						议案编号
	 * @param {Object} vote_number				投票数量
	 * @param {Object} vote_result				投票意见
	 * @param {Object} order_group				委托批号
	 * */
	service_added.prototype.queryVote = function(param,callback,ctrlParam){
		var paraMap = {};
		paraMap["funcNo"] = "301533";
		paraMap["entrust_way"] = param.entrust_way;
		paraMap["branch_no"] = param.branch_no;
		paraMap["fund_account"] = param.fund_account;
		paraMap["cust_code"] = param.cust_code;
		paraMap["password"] = param.password;
		paraMap["exchange_type"] = param.exchange_type;
		paraMap["stock_account"] = param.stock_account;
		paraMap["stock_code"] = param.stock_code;
		paraMap["sessionid"] = param.sessionid;
		paraMap["meeting_seq"] = param.meeting_seq;
		paraMap["v_id"] = param.v_id;
		paraMap["vote_number"] = param.vote_number;
		paraMap["vote_result"] = param.vote_result;
		paraMap["order_group"] = param.order_group;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
 		reqParamVo.setUrl( global.serverPathTrade);
 		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	};

	/***应用接口......................................................结束*/

});