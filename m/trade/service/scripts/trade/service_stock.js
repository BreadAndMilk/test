/**
 * 普通交易service层调用接口
 */
define('trade/service/scripts/trade/service_stock.js',function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var serverConfig = global.serverConfig; // 柜台选择   1. 金证win  2. 恒生T2   3. 顶点 （可拓展）
	var global = gconfig.global;
	
	function service_stock(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	
	module.exports = new service_stock();
    
    /**
	 * 释放操作
	 */
	service_stock.prototype.destroy = function(){
		this.service.destroy();
	};
	/********************************公共代码部分********************************/
    service_stock.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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
		channelNo = global.channel || " "; //渠道
		hardIdentifier = global.hardId || " ";//硬件特征码
		source = global.opStationInfo || " "; //来源
		mobileNo = global.activePhone || " ";//手机号
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
    /********************************业务范围--股票********************************/
      /**
    	 *  委托
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} password                	交易密码
      	 * @param {Object} sessionid                会话号
       	 * @param {Object} entrust_bs               买卖方向
      	 * @param {Object} exchange_type            交易类别
       	 * @param {Object} stock_account            证券账号
      	 * @param {Object} stock_code               股票号码
       	 * @param {Object} entrust_price            委托价格
      	 * @param {Object} entrust_amount           委托数量
         * @param {Object} batch_no                 委托批号
    	 * @param {Object} callback	回调方法
    	 * */
         service_stock.prototype.getStockBuy=function(param,callback,ctrlParam){
    		var paraMap = {};
    	    paraMap["funcNo"] = "301501";
    	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["entrust_bs"] = param.entrust_bs;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] = param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_price"] = param.entrust_price;
    	    paraMap["entrust_amount"] =  param.entrust_amount;
    	    paraMap["batch_no"] =  param.batch_no;
    	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
    	    reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    	};
    	
        /**
      	 * 委托撤单
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} password                	交易密码
      	 * @param {Object} sessionid                会话号
       	 * @param {Object} entrust_no               委托编号
      	 * @param {Object} exchange_type            交易类别
       	 * @param {Object} batch_flag            	批量撤单标志
      	 * @param {Object} callback	回调方法
      	 * */
         service_stock.prototype.postCancelOrder=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301502";
      	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["entrust_no"] = param.entrust_no;
    	    paraMap["batch_flag"] =  param.batch_flag;
    	    paraMap["exchange_type"] = param.exchange_type;
    	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	/**
      	 * 持仓查询
      	 * 
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} sessionid                会话号
      	 * @param {Object} exchange_type            交易类别
       	 * @param {Object} stock_account            证券账号
      	 * @param {Object} stock_code               股票号码
      	 * @param {Object} callback	回调方法
      	 * */
         service_stock.prototype.queryStockData=function(param,callback,ctrlParam){
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
    		reqParamVo.setUrl(global.serverPathTrade);
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
         service_stock.prototype.queryFundSelect=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301504";
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
      	 * 资金流水查询
      	 *  
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} sessionid                会话号
      	 * @param {Object} begin_time               开始日期
      	 * @param {Object} end_time                	截止日期
      	 * @param {Object} business_flag            业务类型
      	 * @param {Object} callback	回调方法
      	 * */
         service_stock.prototype.queryAccountFlow=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301505";
      	    paraMap["entrust_way"] =  param.entrust_way;
      	    paraMap["branch_no"] =  param.branch_no;
      	    paraMap["fund_account"] =  param.fund_account;
      	    paraMap["cust_code"] =  param.cust_code;
      	    paraMap["password"] =  param.password;
      	    paraMap["sessionid"] =  param.sessionid;
      	    paraMap["money_type"] =  param.money_type;
      	    paraMap["begin_time"] =  param.begin_time;
      	    paraMap["end_time"] =  param.end_time;
      	    paraMap["business_flag"] =  param.business_flag;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    		var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	
      	/**
      	 * 行情查询
      	 * 
    	 * @param {Object} exchange_type             交易类型
      	 * @param {Object} stock_code                股票号码
      	 * @param {Object} callback	回调方法
      	 * */
        service_stock.prototype.queryStockhqInfo=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301506";
      	    paraMap["exchange_type"] =  param.exchange_type;
      	    paraMap["stock_code"] =  param.stock_code;
    		var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
       
        /**
      	 * 当日委托查询
      	 * 
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} sessionid                会话号
      	 * */
         service_stock.prototype.queryTodayTrust=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301508";
      	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] =  param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] =  param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_bs"] =  param.entrust_bs;
    	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	
        /**
      	 * 当日成交查询
      	 * 
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} sessionid                会话号
      	 * @param {Object} callback	回调方法
      	 * */
         service_stock.prototype.queryTodayTrade=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301509";
      	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] =  param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] =  param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_bs"] =  param.entrust_bs;
    	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	
        /**
      	 * 历史委托查询
      	 * 
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} sessionid                会话号
      	 * @param {Object} begin_time               开始日期
      	 * @param {Object} end_time                	截止日期
      	 * */
         service_stock.prototype.queryHistoryTrust=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301510";
      	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] =  param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["begin_time"] =  param.begin_time;
    	    paraMap["end_time"] =  param.end_time;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] =  param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_bs"] =  param.entrust_bs;
    		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
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
         service_stock.prototype.queryHistoryTrade=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301511";
      	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] =  param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["begin_time"] =  param.begin_time;
    	    paraMap["end_time"] =  param.end_time;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] =  param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_bs"] =  param.entrust_bs;
    		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	/**
      	 * 查询股东列表
      	 * @param {Object} entrust_way     委托方式
      	 * @param {Object} branch_no       分支机构
      	 * @param {Object} fund_account    资金账号
      	 * @param {Object} cust_code       客户编号
      	 * @param {Object} sessionid       会话号
      	 * */
         service_stock.prototype.queryStockAccountList=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301512";
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
      	 * 机构信息查询
      	 * @param {Object} entrust_way     委托方式
      	 * @param {Object} query_branch_no 查询机构入参
      	 * */
         service_stock.prototype.queryBranchInfo=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301513";
      	    paraMap["entrust_way"] = param.entrust_way;
      	    paraMap["query_branch_no"] = param.query_branch_no;
    		var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
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
         service_stock.prototype.queryStockMaxBuy=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301514";
      	    paraMap["entrust_way"] = param.entrust_way;
      	    paraMap["branch_no"] = param.branch_no;
           	paraMap["fund_account"] = param.fund_account;	
      	    paraMap["cust_code"] = param.cust_code;
            paraMap["password"] =  param.password;
      	    paraMap["sessionid"] = param.sessionid;
      	    paraMap["entrust_bs"] = param.entrust_bs;
      	    paraMap["stock_code"] = param.stock_code;
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
      	 * 查询当日可撤委托
      	 * @param {Object} entrust_way     委托方式
      	 * @param {Object} branch_no       分支机构
      	 * @param {Object} fund_account    资金账号
      	 * @param {Object} cust_code       客户编号
      	 * @param {Object} sessionid       会话号
      	 * */
         service_stock.prototype.queryTrustData=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301515";
      	    paraMap["entrust_way"] = param.entrust_way;
      	    paraMap["branch_no"] = param.branch_no;
           	paraMap["fund_account"] = param.fund_account;	
      	    paraMap["cust_code"] = param.cust_code;
            paraMap["password"] =  param.password;
      	    paraMap["sessionid"] = param.sessionid;
      	    paraMap["entrust_bs"] = param.entrust_bs;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
      	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	}; 	
      	
    	/**
      	 * 资金流水当日查询
      	 * @param {Object} entrust_way     委托方式
      	 * @param {Object} branch_no       分支机构
      	 * @param {Object} fund_account    资金账号
      	 * @param {Object} cust_code       客户编号
      	 * @param {Object} sessionid       会话号
      	 * @param {Object} sessionid       业务类型
      	 * */
         service_stock.prototype.querySameDayCapitalFlow=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301516";
      	    paraMap["entrust_way"] = param.entrust_way;
      	    paraMap["branch_no"] = param.branch_no;
           	paraMap["fund_account"] = param.fund_account;	
      	    paraMap["cust_code"] = param.cust_code;
            paraMap["password"] =  param.password;
      	    paraMap["sessionid"] = param.sessionid;
      	    paraMap["money_type"] = param.money_type;
      	    paraMap["business_flag"] = param.business_flag;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
      	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	}; 	
      	
      	//**********新股*************************************
      	/**
      	 * 新股票配号查询		
      	 * @param {Object} cust_code              客户编号	
      	 * @param {Object} fund_account           资金账号
      	 * @param {Object} xjb_account            现金宝账户
      	 * @param {Object} star_page              起始页码
      	 * @param {Object} page_count             每页数量
      	 * */
        service_stock.prototype.queryDistributionData =function(param,callback,ctrlParam){
      		var paraMap = {};
      		if(param.account_type=="credit_userInfo" && serverConfig=="2"){ //恒生
	    		paraMap["funcNo"] = "303029";
	    	}else{
	    		paraMap["funcNo"] = "301517";
	    	}
      	    paraMap["entrust_way"] = param.entrust_way;
      	    paraMap["branch_no"] = param.branch_no;
           	paraMap["fund_account"] = param.fund_account;	
      	    paraMap["cust_code"] = param.cust_code;
            paraMap["password"] =  param.password;
      	    paraMap["sessionid"] = param.sessionid;
      	    paraMap["stock_account"] =  param.stock_account;
      	    paraMap["stock_code"] = param.stock_code;
      	    paraMap["begin_time"] = param.begin_time;
      	    paraMap["end_time"] = param.end_time;
      	    paraMap["begin_date"] = param.begin_time;
      	    paraMap["end_date"] = param.end_time;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
      	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	
      	/**
      	 * 新股中签查询		
      	 * @param {Object} cust_code              客户编号	
      	 * @param {Object} fund_account           资金账号
      	 * @param {Object} xjb_account            现金宝账户
      	 * @param {Object} star_page              起始页码
      	 * @param {Object} page_count             每页数量
      	 * */
      	service_stock.prototype.querySuccessData =function(param,callback,ctrlParam){
      		var paraMap = {};
      		if(param.account_type=="credit_userInfo" && serverConfig=="2"){ //恒生
	    		paraMap["funcNo"] = "303030";
	    	}else{
	    		paraMap["funcNo"] = "301518";
	    	}
      	    paraMap["entrust_way"] = param.entrust_way;
      	    paraMap["branch_no"] = param.branch_no;
           	paraMap["fund_account"] = param.fund_account;	
      	    paraMap["cust_code"] = param.cust_code;
            paraMap["password"] =  param.password;
      	    paraMap["sessionid"] = param.sessionid;
      	    paraMap["stock_account"] =  param.stock_account;
      	    paraMap["stock_code"] = param.stock_code;
      	    paraMap["begin_time"] = param.begin_time;
      	    paraMap["end_time"] = param.end_time;
      	    paraMap["begin_date"] = param.begin_time;
      	    paraMap["end_date"] = param.end_time;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
      	    var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl(global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	}; 
      	
        /**
         * 
         * 新股日历--新股信息查询
         */
      	service_stock.prototype.queryMakeApp = function(param,callback,ctrlParam){
        	var paraMap = {};
        	paraMap["funcNo"] = "200200";
        	var reqParamVo = this.service.reqParamVo;
        	reqParamVo.setUrl(global.serverPathTrade);
        	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
        };
        
        /**
         * 
         * 添加消息推送token信息		
         * @param callback 回调函数
         */
        service_stock.prototype.sendMessages = function(param,callback,ctrlParam){
        	var paraMap = {};
        	paraMap["funcNo"] = "1000005";
        	paraMap["token"] = param.token;
        	paraMap["stockcode"] = param.stockcode;
        	paraMap["chancel"] = param.chancel;
        	paraMap["sendflag"] = param.sendflag;
        	paraMap["phone"] = param.phone;
        	var reqParamVo = this.service.reqParamVo;
        	reqParamVo.setUrl(global.serverPathTrade);
        	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
        };
        
        /**
         * 
         * 今日新股查询		
         * @param callback 回调函数
         */
        service_stock.prototype.queryTodayNewShare = function(param,callback,ctrlParam){
        	var paraMap = {};
        	paraMap["funcNo"] = "200020";
        	paraMap["flag"] = param.flag;
        	paraMap["list_date"] = param.list_date;
        	var reqParamVo = this.service.reqParamVo;
        	reqParamVo.setUrl(global.newshareUrl);
        	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
        };
        
        /**
         * 新股申购额度查询
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
        service_stock.prototype.newAmount_Query = function(param,callback,ctrlParam){
        	var paraMap = {};
        	paraMap["funcNo"] = "301519";
        	paraMap["entrust_way"] = param.entrust_way;
        	paraMap["branch_no"] = param.branch_no;
        	paraMap["fund_account"] = param.fund_account;
        	paraMap["cust_code"] = param.cust_code;
        	paraMap["password"] = param.password;
        	paraMap["sessionid"] = param.sessionid;
        	paraMap["exchange_type"] = param.exchange_type;
        	addOpStation(paraMap); // 添加 op_station 到接口请求参数中
        	var reqParamVo = this.service.reqParamVo;
    	  	reqParamVo.setUrl(global.serverPathTrade);
    	  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
        };
        /**
	  	 * 查询对账单
		 * @param {Object} entrust_way              委托方式
	  	 * @param {Object} branch_no                分支机构
	  	 * @param {Object} fund_account             资金账号
	  	 * @param {Object} cust_code                客户编号
	  	 * @param {Object} sessionid                会话号
	  	 * @param {Object} begin_time               开始日期
	  	 * @param {Object} end_time                	截止日期
	  	 * @param {Object} callback	回调方法
	  	*/
	    service_stock.prototype.queryStatementOfAccount = function(param,callback,ctrlParam){
	  		var paraMap = {};
	  	    paraMap["funcNo"] = "301520";
	  	    paraMap["entrust_way"] =  param.entrust_way;
	  	    paraMap["branch_no"] =  param.branch_no;
	  	    paraMap["fund_account"] =  param.fund_account;
	  	    paraMap["cust_code"] =  param.cust_code;
	  	    paraMap["money_type"] =  param.money_type;
	  	    paraMap["sessionid"] =  param.sessionid;
  	        paraMap["password"] =  param.password;
	  	    paraMap["begin_date"] =  param.begin_date;
	  	    paraMap["end_date"] =  param.end_date;
			addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	  	};
	  	
	  	 /**
	  	 * 查询新股列表
		 * @param {Object} entrust_way              委托方式
	  	 * @param {Object} branch_no                分支机构
	  	 * @param {Object} fund_account             资金账号
	  	 * @param {Object} cust_code                客户编号
	  	 * @param {Object} sessionid                会话号
	  	 * @param {Object} callback	回调方法
	  	*/
	    service_stock.prototype.queryListingShares = function(param,callback,ctrlParam){
	  		var paraMap = {};
	  	    paraMap["funcNo"] = "301535";
	  	    paraMap["entrust_way"] =  param.entrust_way;
	  	    paraMap["branch_no"] =  param.branch_no;
	  	    paraMap["fund_account"] =  param.fund_account;
	  	    paraMap["cust_code"] =  param.cust_code;
	  	    paraMap["money_type"] =  param.money_type;
	  	    paraMap["sessionid"] =  param.sessionid;
	  	    paraMap["stock_code"] =  param.stock_code;
	  	    paraMap["flag"]=param.flag;
			addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	  	};
	  	
	  	/**
	  	 * 当前中签查询
		 * @param {Object} entrust_way              委托方式
	  	 * @param {Object} branch_no                分支机构
	  	 * @param {Object} fund_account             资金账号
	  	 * @param {Object} cust_code                客户编号
	  	 * @param {Object} sessionid                会话号
	  	 * @param {Object} begin_time               开始日期
	  	 * @param {Object} end_time                	截止日期
	  	 * @param {Object} callback	回调方法
	  	*/
	    service_stock.prototype.theCurrentSuccess = function(param,callback,ctrlParam){
	  		var paraMap = {};
	  	    paraMap["funcNo"] = "301536";
	  	    paraMap["entrust_way"] =  param.entrust_way;
	  	    paraMap["branch_no"] =  param.branch_no;
	  	    paraMap["fund_account"] =  param.fund_account;
	  	    paraMap["cust_code"] =  param.cust_code;
	  	    paraMap["sessionid"] =  param.sessionid;
	  	    paraMap["stock_account"] =  param.stock_account;
			addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
		  	reqParamVo.setUrl(global.serverPathTrade);
		  	this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	  	};
        
	/***应用接口......................................................结束*/

});