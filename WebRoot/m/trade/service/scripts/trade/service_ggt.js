/**
 * 港股通service层调用接口
 */
define('trade/service/scripts/trade/service_ggt.js',function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
    
	/********************************公共代码部分********************************/
    service_ggt.prototype.commonInvoke = function(paraMap, callback, ctrlParam, reqParamVo){
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

	service_ggt.prototype.destroy = function(){
		this.service.destroy();
	};
	function service_ggt(){ //对应的接口方法需要在这里暴露出来
		this.service = new $.service;
	};
	module.exports = new service_ggt();
	
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
	/********************************业务范围--港股通********************************/
        
	   /**
	  	 * 港股通行情查询
	     * @param {Object} exchange_type            交易市场类别
	     * @param {Object} stock_code               证券代码
	     * */
     	 service_ggt.prototype.queryHq_ggt=function(param,callback,ctrlParam){
     		var paraMap = {};
     		paraMap["funcNo"] = "301600";
     		paraMap["exchange_type"] = param.entrust_way;
     		paraMap["stock_code"] =  param.stock_code;
	  	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		};
		
	   /**
	  	 * 港股通额度查询
	     * @param {Object} exchange_type            交易市场类别
	     * */
     	 service_ggt.prototype.queryAvailable_ggt=function(param,callback,ctrlParam){
     		var paraMap = {};
     		paraMap["funcNo"] = "301601";
     		paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
     		paraMap["exchange_type"] = param.entrust_way;
	  	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		};
		
	   /**
    	 * 港股通股票联动
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} password                	交易密码
      	 * @param {Object} sessionid                会话号
       	 * @param {Object} entrust_bs               买卖方向
      	 * @param {Object} stock_code               股票号码
       	 * @param {Object} entrust_price            委托价格
    	 * @param {Object} callback	回调方法
    	 * */
     	 service_ggt.prototype.queryInformation_ggt=function(param,callback,ctrlParam){
     		var paraMap = {};
     		paraMap["funcNo"] = "301602";
      	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["entrust_bs"] = param.entrust_bs;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_price"] = param.entrust_price;
    	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	  	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		};
		
	   /**
    	 * 港股通委托确认
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} password                	交易密码
      	 * @param {Object} sessionid                会话号
       	 * @param {Object} entrust_bs               买卖方向
      	 * @param {Object} stock_code               股票号码
       	 * @param {Object} entrust_price            委托价格
       	 * @param {Object} single_flag              是否零股申报（0：否，1：是)
       	 * @param {Object} max_price_levels         最大价格等级(1:表示竞价限价盘 0:表示增强限价盘)
    	 * @param {Object} callback	回调方法
    	 * */
     	 service_ggt.prototype.queryTrustSure_ggt=function(param,callback,ctrlParam){
     		var paraMap = {};
     		paraMap["funcNo"] = "301603";
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
    	    paraMap["single_flag"] =  param.single_flag;
    	    paraMap["max_price_levels"] =  param.max_price_levels;
    	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		};
		
    	/**
    	 * 港股通委托撤单
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
         service_ggt.prototype.postCancelOrder_ggt=function(param,callback,ctrlParam){
    		var paraMap = {};
    	    paraMap["funcNo"] = "301604";
    	    paraMap["entrust_way"] = param.entrust_way;
	  	    paraMap["branch_no"] =  param.branch_no;
	  	    paraMap["fund_account"] = param.fund_account;
	  	    paraMap["cust_code"] =  param.cust_code;
			paraMap["stock_account"]=param.stock_account;
	  	    paraMap["password"] = param.password;
	  	    paraMap["sessionid"] =  param.sessionid;
	  	    paraMap["entrust_no"] = param.entrust_no;
	  	    paraMap["batch_flag"] =  param.batch_flag;
	  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	  	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    	};
    	
 	    /**
    	 * 港股通持仓查询
    	 * @param {Object} entrust_way              委托方式
      	 * @param {Object} branch_no                分支机构
      	 * @param {Object} fund_account             资金账号
      	 * @param {Object} cust_code                客户编号
      	 * @param {Object} password                	交易密码
      	 * @param {Object} sessionid                会话号
       	 * @param {Object} entrust_bs               买卖方向
      	 * @param {Object} stock_code               股票号码
    	 * @param {Object} callback	回调方法
    	 * */
     	 service_ggt.prototype.queryHolding_ggt=function(param,callback,ctrlParam){
     		var paraMap = {};
     		paraMap["funcNo"] = "301605";
      	    paraMap["entrust_way"] = param.entrust_way;
    	    paraMap["branch_no"] =  param.branch_no;
    	    paraMap["fund_account"] = param.fund_account;
    	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] = param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		};
		
       /**
		 * 港股通当日委托查询 
		 * @param {Object} entrust_way              委托方式
		 * @param {Object} branch_no                分支机构
		 * @param {Object} fund_account             资金账号
		 * @param {Object} cust_code                客户编号
		 * @param {Object} sessionid                会话号
		 * @param {Object} exchange_type            交易市场类别
		 * @param {Object} stock_account            证券账号
		 * @param {Object} stock_code               证券代码
		 * @param {Object} entrust_bs               委托标志
		 * */
		 service_ggt.prototype.queryTodayTrust_ggt=function(param,callback,ctrlParam){
			var paraMap = {};
		    paraMap["funcNo"] = "301606";
		    paraMap["entrust_way"] = param.entrust_way;
		    paraMap["branch_no"] =  param.branch_no;
		    paraMap["fund_account"] = param.fund_account;
		    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] = param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_bs"] =  param.entrust_bs;
            paraMap["flag"]=param.flag;
		    paraMap["entrust_type"]=param.entrust_type;
		    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		    var reqParamVo = this.service.reqParamVo;
			reqParamVo.setUrl( global.serverPathTrade);
			this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		};
		
		/**
		 * 港股通当日成交查询
		 * @param {Object} entrust_way              委托方式
		 * @param {Object} branch_no                分支机构
		 * @param {Object} fund_account             资金账号
		 * @param {Object} cust_code                客户编号
		 * @param {Object} sessionid                会话号
		 * @param {Object} exchange_type            交易市场类别
		 * @param {Object} stock_account            证券账号
		 * @param {Object} stock_code               证券代码
		 * @param {Object} entrust_bs               委托标志
		 * @param {Object} callback	回调方法
		 * */
		 service_ggt.prototype.queryTodayTrade_ggt=function(param,callback,ctrlParam){
			var paraMap = {};
		    paraMap["funcNo"] = "301607";
		    paraMap["entrust_way"] = param.entrust_way;
			paraMap["branch_no"] =  param.branch_no;
		    paraMap["fund_account"] = param.fund_account;
			paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] = param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_bs"] =  param.entrust_bs;
			addOpStation(paraMap); // 添加 op_station 到接口请求参数中
			var reqParamVo = this.service.reqParamVo;
			reqParamVo.setUrl( global.serverPathTrade);
			this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		};

       /**
    	 * 港股通历史委托查询
    	 * 
  	     * @param {Object} entrust_way              委托方式
    	 * @param {Object} branch_no                分支机构
    	 * @param {Object} fund_account             资金账号
    	 * @param {Object} cust_code                客户编号
    	 * @param {Object} sessionid                会话号
    	 * @param {Object} begin_time               开始日期
    	 * @param {Object} end_time                	截止日期
    	 * @param {Object} exchange_type            交易市场类别
		 * @param {Object} stock_account            证券账号
		 * @param {Object} stock_code               证券代码
		 * @param {Object} entrust_bs               委托标志
    	 * */
         service_ggt.prototype.queryHistoryTrust_ggt=function(param,callback,ctrlParam){
    		var paraMap = {};
    	    paraMap["funcNo"] = "301608";
    	    paraMap["entrust_way"] = param.entrust_way;
	  	    paraMap["branch_no"] =  param.branch_no;
	  	    paraMap["fund_account"] = param.fund_account;
	  	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] = param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
	  	    paraMap["begin_time"] =  param.begin_time;
	  	    paraMap["end_time"] =  param.end_time;
	  		paraMap["entrust_bs"] = param.entrust_bs;
	  		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	  	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    	};
    	
    	/**
    	 * 港股通历史成交查询
    	 * 
  	     * @param {Object} entrust_way              委托方式
    	 * @param {Object} branch_no                分支机构
    	 * @param {Object} fund_account             资金账号
    	 * @param {Object} cust_code                客户编号
    	 * @param {Object} sessionid                会话号
    	 * @param {Object} begin_time               开始日期
    	 * @param {Object} end_time                	截止日期
    	 * @param {Object} exchange_type            交易市场类别
		 * @param {Object} stock_account            证券账号
		 * @param {Object} stock_code               证券代码
		 * @param {Object} entrust_bs               委托标志
    	 * @param {Object} callback	回调方法
    	 * */
         service_ggt.prototype.queryHistoryTrade_ggt=function(param,callback,ctrlParam){
    		var paraMap = {};
    	    paraMap["funcNo"] = "301609";
    	    paraMap["entrust_way"] = param.entrust_way;
	  	    paraMap["branch_no"] =  param.branch_no;
	  	    paraMap["fund_account"] = param.fund_account;
	  	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] = param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
	  	    paraMap["begin_time"] =  param.begin_time;
	  	    paraMap["end_time"] =  param.end_time;
	  		paraMap["entrust_bs"] = param.entrust_bs;
	  		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
	  	    var reqParamVo = this.service.reqParamVo;
	  		reqParamVo.setUrl( global.serverPathTrade);
	  		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
    	};
    	
    	/**
         * 港股通当日可撤委托查询
  	     * @param {Object} entrust_way              委托方式
    	 * @param {Object} branch_no                分支机构
    	 * @param {Object} fund_account             资金账号
    	 * @param {Object} cust_code                客户编号
    	 * @param {Object} sessionid                会话号
    	 * @param {Object} exchange_type            交易市场类别
		 * @param {Object} stock_account            证券账号
		 * @param {Object} stock_code               证券代码
		 * @param {Object} entrust_bs               委托标志
    	 * */
         service_ggt.prototype.queryTodayTrusts_ggt=function(param,callback,ctrlParam){
    		var paraMap = {};
    	    paraMap["funcNo"] = "301610";
    	    paraMap["entrust_way"] = param.entrust_way;
	  	    paraMap["branch_no"] =  param.branch_no;
	  	    paraMap["fund_account"] = param.fund_account;
	  	    paraMap["cust_code"] =  param.cust_code;
	  	    paraMap["cust_code"] =  param.cust_code;
    	    paraMap["password"] = param.password;
    	    paraMap["sessionid"] =  param.sessionid;
    	    paraMap["exchange_type"] =  param.exchange_type;
    	    paraMap["stock_account"] = param.stock_account;
    	    paraMap["stock_code"] =  param.stock_code;
    	    paraMap["entrust_bs"] = param.entrust_bs;
	  	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
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
    	service_ggt.prototype.queryFundSelect_ggt=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301612";
      	    paraMap["entrust_way"] =  param.entrust_way;
      	    paraMap["branch_no"] =  param.branch_no;
      	    paraMap["fund_account"] =  param.fund_account;
      	    paraMap["cust_code"] =  param.cust_code;
      	    paraMap["password"] =  param.password;
      	    paraMap["sessionid"] =  param.sessionid;
      	    paraMap["money_type"] =  param.money_type;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    		var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl( global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	/**
      	 * 投票申报接口
      	 * 
      	 */
      	service_ggt.prototype.ggtVoteToDelareEntrust=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301621";
      	    paraMap["entrust_way"] =  param.entrust_way;
      	    paraMap["branch_no"] =  param.branch_no;
      	    paraMap["fund_account"] =  param.fund_account;
      	    paraMap["cust_code"] =  param.cust_code;
      	    paraMap["sessionid"] =  param.sessionid;
      	    paraMap["stock_account"] =  param.stock_account;
      	    paraMap["stock_code"] =  param.stock_code;
      	    paraMap["placard_id"] =  param.placard_id;
      	    paraMap["motion_id"] =  param.motion_id;
      	    paraMap["approve_amount"] =  param.approve_amount;
      	    paraMap["oppose_amount"] =  param.oppose_amount;
      	    paraMap["waive_amount"] =  param.waive_amount;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    		var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl( global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	
      	/**
      	 * 公司行为申报接口
      	 * 
      	 */
      	service_ggt.prototype.ggtCompanyHdDeclareEntrust=function(param,callback,ctrlParam){
      		var paraMap = {};
      	    paraMap["funcNo"] = "301624";
      	    paraMap["entrust_way"] =  param.entrust_way;
      	    paraMap["branch_no"] =  param.branch_no;
      	    paraMap["fund_account"] =  param.fund_account;
      	    paraMap["cust_code"] =  param.cust_code;
      	    paraMap["sessionid"] =  param.sessionid;
      	    paraMap["stock_account"] =  param.stock_account;
      	    paraMap["stock_code"] =  param.stock_code;
      	    paraMap["corpbehavior_code"] =  param.corpbehavior_code;
      	    paraMap["business_type"] =  param.business_type;
      	    paraMap["report_amount"] =  param.report_amount;
      	    paraMap["report_type"] =  param.report_type;
      	    addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    		var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl( global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
      	};
      	
      	/*
      	 * 投票申报查询接口
      	 */
		
		 service_ggt.prototype.queryVoteToDeclare=function(param,callback,ctrlParam){
		 	var paraMap={};
			paraMap["funcNo"]="301622";
			paraMap["entrust_way"]=param.entrust_way;
			paraMap["branch_no"]=param.branch_no;
			paraMap["fund_account"]=param.fund_account;
			paraMap["cust_code"]=param.cust_code;
			paraMap["password"]=param.password;
			paraMap["stock_account"]=param.stock_account;
			paraMap["sessionid"]=param.sessionid;
			paraMap["begin_time"]=param.bgn_date;
			paraMap["end_time"]=param.end_date;
			addOpStation(paraMap); // 添加 op_station 到接口请求参数中
    		var reqParamVo = this.service.reqParamVo;
    		reqParamVo.setUrl( global.serverPathTrade);
    		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
		 }
		


	/**
	 * 汇率查询
	 */
	service_ggt.prototype.queryExchangeRate=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301630";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["stock_account"]=param.stock_account;
		paraMap["sessionid"]=param.sessionid;
		paraMap["begin_time"]=param.bgn_date;
		paraMap["end_time"]=param.end_date;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}
	/**
	 * 港股对账单查询
	 */
	service_ggt.prototype.queryStatementList=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301630";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["stock_account"]=param.stock_account;
		paraMap["sessionid"]=param.sessionid;
		paraMap["begin_time"]=param.bgn_date;
		paraMap["end_time"]=param.end_date;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}
	/**
	 * 港股交割单查询
	 */
	service_ggt.prototype.queryExchangeList=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301631";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["stock_account"]=param.stock_account;
		paraMap["sessionid"]=param.sessionid;
		paraMap["begin_time"]=param.bgn_date;
		paraMap["end_time"]=param.end_date;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}
	/**
	 * 通知信息查询
	 */
	service_ggt.prototype.queryNotifyInfo=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301631";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["sessionid"]=param.sessionid;
		paraMap["begin_time"]=param.bgn_date;
		paraMap["end_time"]=param.end_date;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}


	/**
	 * 港股交易日历查询
	 */
	service_ggt.prototype.queryTradeTime=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301639";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["stock_account"]=param.stock_account;
		paraMap["sessionid"]=param.sessionid;
		paraMap["begin_time"]=param.begin_time;
		paraMap["end_time"]=param.end_time;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}


	service_ggt.prototype.queryCompanyInfo=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301625";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["stock_account"]=param.stock_account;
		paraMap["sessionid"]=param.sessionid;
		addOpStation(paraMap); // 添加 op_station 到接口请求参数中
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}

	//投票申报前的查询相关信息
	service_ggt.prototype.queryVoteInfo=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301620";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["sessionid"]=param.sessionid;
		paraMap["exchange_type"]=param.exchange_type;
		paraMap["is_all"]=param.is_all;
		addOpStation(paraMap);
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}

	//价差查询
	service_ggt.prototype.queryPrice=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301634";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["sessionid"]=param.sessionid;
		paraMap["exchange_type"]=param.exchange_type;
		addOpStation(paraMap);
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}

	//汇率查询
	service_ggt.prototype.queryExchangeRate=function(param,callback,ctrlParam){
		var paraMap={};
		paraMap["funcNo"]="301635";
		paraMap["entrust_way"]=param.entrust_way;
		paraMap["branch_no"]=param.branch_no;
		paraMap["fund_account"]=param.fund_account;
		paraMap["cust_code"]=param.cust_code;
		paraMap["sessionid"]=param.sessionid;
		paraMap["money_type1"]=param.money_type1;
		paraMap["money_type2"]=param.money_type2;
		addOpStation(paraMap);
		var reqParamVo = this.service.reqParamVo;
		reqParamVo.setUrl( global.serverPathTrade);
		this.commonInvoke(paraMap, callback, ctrlParam, reqParamVo);
	}


	/***应用接口......................................................结束*/

});