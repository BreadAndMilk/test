/**
 * 交易模块公用 js
 */
define('trade/scripts/common/common.js', function(require, exports, module) {
    var gconfig = $.config;
    var global = gconfig.global;
    var logoutTimer = null; // 定时器
    var accountInfos = {};
    var operationInfo = [];
    var curUserInfo = {};
    var transferInfo = {};
    
	
	/**
	 * 绑定列表型菜单事件跳转
	 * @param {Object} _divId 完整div位置
	 * @param {Object} callback 自定义执行方法
	 */
	function bindStockEvent(_divId,callback,eliminate,eType){
		eType = eType || "tap";
		$.bindEvent(_divId, function(e){
			if(!eliminate){
//				e.type
				$(this).unbind(eType);
				this[eType] = null;
			}
			var pageCode = $.getCurrentPageObj().pageCode || '';
			var topage = $(this).attr("to-page").replaceAll("_","/"); //获取跳转的页面
			var param =  $(this).attr("param");
			if(!param){
				param = "";
			}
			if(callback && typeof callback == "function"){
				callback(pageCode,topage,param);
			}
			else{
				if(pageCode != topage){
					if(callback && typeof callback == "boolean"){
						$.pageInit(pageCode,topage,{"param":param},"",true);	
					}
					else{
						$.pageInit(pageCode,topage,{"param":param});
					}
				}
			}
			e.stopPropagation();
		 },eType);
	}
	
	/**
	 * 将数字转换为金钱格式
	 * @param {Object} str 数字字符串或者数字
	 * @param {Object} digit 保存的位数
	 */
	function numToMoneyType(str,digit){
		str = str + "";  //强制转换成字符串
		if(digit){
			str = Number(str).toFixed(digit);	
		}
		var sign = "";
		if(str < 0){
			sign = str.substring(0,1);
			str = str.substring(1,str.length);
		}
		var index = str.indexOf(".");
		var afterStr = "";
		if(index != -1){
			afterStr = str.substring(index,str.length);
			str = str.substring(0,index);
		}
		var len = str.length, 
		lastIndex, 
		arr = []; 
		while( len > 0 ){ 
			lastIndex = len; 
			len -= 3; 
			arr.unshift( str.substring(len, lastIndex) ); 
		} 
		return ""+sign + arr.join(',') + afterStr; 
	}
	
	/**
	 * 得到证券类型
	 */
	function getStockType(stkType){
		var typeName = "股票";
		var bondType = [6,14,21,22,23,24,25,26,27,30]; // 债券
		var fundType = [3,4,11,12,19,20]; // 基金
		var warrantType = [5,13]; // 权证
		if($.inArray(stkType, bondType)!=-1){
			typeName = "债券";
		}else if($.inArray(stkType, fundType)!=-1){
			typeName = "基金";
		}else if($.inArray(stkType, warrantType)!=-1){
			typeName = "权证";
		}else{
			typeName = "股票";
		}
		return typeName;
	}
	
	 
   	/**
   	 * 设置页面高度 显示隐藏底部
   	 * @param {Object} _pageId 页面id
   	 * @param {Object} choice true 显示/false 隐藏
   	 * return (Number) 返回main的高度
   	 */
    function setMainHeight(_pageId, choice){
   		var mainHeight = gconfig.appHeight - $(_pageId + " header.header").height();
   	   	if(choice)
   		{
   			$("#afui #footer").show();//显示底部
   			mainHeight = mainHeight - $("#afui #footer").height();
   		}
   		else
   		{
   			$("#afui #footer").hide();//隐藏底部
   		}
		$(_pageId + " section.main").height(mainHeight).css("overflow","auto");
  		return mainHeight;
    }
    
	/**
	 * 将不规则文本转换为 "--"
	 */
	function transferText(str, num){
		var outText = "--";
		if(str && str != 0 && !isNaN(Number(str))){
			if(num){
				outText = Number(str).toFixed(num);
			}
			else{
				outText = str;
			}
		}
		return outText;
	}
	
	//数量过万改以万为单位
	function overAMillion(num){
		num = Number(num);
		if(num >= 10000){
			num = (num/10000).toFixed(2) + "万";
		}
		if(num == 0){
			num = "--";
		}
		return num;
	}
	
	/**
	 * 获取数据的长度，和对象的属性个数
	 * @param {Object} obj
	 */
	function size(obj){
		if(obj){
			if(typeof(obj) == "string" || obj instanceof Array){
				return obj.length;
			}
			else if(typeof(obj) == "object"){
				return Object.getOwnPropertyNames(obj).length
			}
		}
		else{
			return 0;
		}
	}
	
	/**
	 * 判断数据的值是否有用的值
	 */
	function isValue(v){
		if(v){
			if(v instanceof Array && v.length == 0){
				return false;
			}
			else if(typeof(v) == "string"){
				v = $.trim(v);
				if(v == "" || v == "null" || v == "undefined" || v == "false"){
					return false;
				}
				else{
					return true;
				}
			}
			else if(typeof(v) == "object" && Object.getOwnPropertyNames(v).length == 0){
				return false;
			}
			else{
				return true;
			}
		}
		else{
			return false;
		}
	}
	
	
	
	/*******************关于登录账号信息**********************/
	
	/**
	 * 用户登录超时，后台返回-999时 调用方法
	 */
	function filterLoginOut(){
		$.alert("登录超时,请重新登陆");
		var pageCode = $.getCurrentPageObj().pageCode;
		var param = {
			"topage": pageCode,
			"param": $.getPageParam() || {}
			};
		$(".top_title .logout").hide();
		clearUserInfo();
		if(global.callNative){
			$.callMessage({"funcNo": "60202"}); // 同步自选股
			$.callMessage({"moduleName":"trade","funcNo": "60252","reLogin":"1"});
		}
		$.pageInit(pageCode,"account/login",param,"",true);
	}
	
	
	/**
	 * 设置或修改登录用户信息
	 * @param {Object} data 登录数据
	 */
	function setCurUserInfo(data, type){
		curUserInfo = data;
		if(!type){
			type = data._loginClass;
		}
		
		//参数：登录类型（什么样的登录账号进行登录）0、1、2、3.......   [0,1,2,3......]
		recordType(type);
		
		var userInfo =JSON.stringify(data);
		
		//dealType(type)表示对应的转换，如stock、credit......
		$.setSStorageInfo(dealType(type)+"_userInfo", userInfo, false, {"shareCookie": global.shareCookie,"isEncrypt": global.shareCookie,"isSaveSession":!global.shareCookie});// 信用普通
		$.setSStorageInfo("jsessionid",data.jsessionid, false, {"shareCookie": global.shareCookie,"isSaveSession":!global.shareCookie});
		//登录成功的标识(添加此标识才能表示用户已经登录且登录成功，后面设定的需要经过登录才能访问的页面才能正常进入)
		$.setSStorageInfo("_isLoginIn", "true", false, {"shareCookie": global.shareCookie,"isSaveSession":!global.shareCookie}); // 保存登录成功状态
	}

	/**
	 * 保存股东账号
	 * 参数：
	 */
	function saveStockAccount(data) {
		var stock_account=[];
		for(var i=0;i<data.length;i++)
		{
			var item={};
			item.exchange_type=data[i].exchange_type;
			item.stock_account=data[i].stock_account;
			stock_account[i]=item;
		}
		$.setSStorageInfo("stock_accounts",JSON.stringify(stock_account));
	}

	//获取股东账号
	/**
	 *
	 * @param type  exchange_type
	 */
	function getStockAccount(type) {
		var stock_account=JSON.parse($.getSStorageInfo("stock_accounts"));
		for(var i=0;i<stock_account.length;i++){
			if(stock_account[i].exchange_type==type){
				return stock_account[i].stock_account;
			}
		}
		return "";
	}

	/**
	 * 获取登录用户信息
	 */
	function getCurUserInfo(type){
		if(!type){
			if(!isValue(operationInfo)){
				operationInfo = JSON.parse($.getSStorageInfo("operationInfo")) || [];
			}
			if(!isValue(curUserInfo) || curUserInfo._loginClass != operationInfo[0]){
				var _userInfo = $.getSStorageInfo(dealType(operationInfo[0])+"_userInfo", false, {"isDecrypt": global.shareCookie});
				if(isValue(_userInfo)){
					curUserInfo = JSON.parse(_userInfo);
				}
				else{
					curUserInfo = {};
				}
			}
			if(isValue(curUserInfo) && logoutTimer == null){
				initLogoutTime();
			}
			return curUserInfo;
		}else{
			var _userInfo = $.getSStorageInfo(dealType(type)+"_userInfo", false, {"isDecrypt": global.shareCookie});
			if(isValue(_userInfo)){
				return JSON.parse(_userInfo);
			}
			else{
				return {};
			}
		}
	}
	
	/**
	 * 修改登录用户信息
	 * @param {Array} data 登录数据
	 * @param {String} type 登录账号+类型   1234|0  N
	 */
	function updateCurUserInfo(data, type){
		if(!type){
			type = data._loginClass;
		}
		getCurUserInfo();
		if(curUserInfo.fund_account == data.fund_account && curUserInfo._loginClass == data._loginClass){
			curUserInfo = data;
		}
		var userInfo =JSON.stringify(data);
		$.setSStorageInfo(dealType(type)+"_userInfo", userInfo, false, {"shareCookie": global.shareCookie,"isEncrypt": global.shareCookie,"isSaveSession":!global.shareCookie});// 信用普通
	}
	
	
	
	/**
	 * 切换账号
	 * @param {String} type 登录账号+类型   1234|0  N
	 */
	function switchingCurUser(type, account){
		if(curUserInfo._loginClass != type){
			curUserInfo = getCurUserInfo(type);
			recordType(type);
			$.setSStorageInfo("jsessionid",curUserInfo.jsessionid, false, {"shareCookie": global.shareCookie,"isSaveSession":!global.shareCookie});
		}
	}
	
	/**
     * 操作类型
     * @param {Object} type 登录类型
     * @param {Object} isDelete 是否是删除  N
     */
    function recordType(type, isDelete){
    	//数组去除相同的数据，添加或者删除数组
		operationInfo = unshiftDeleteSame(operationInfo, type, isDelete);
		/**
		 * 保存登录的账号类型
		 */
    	$.setSStorageInfo("operationInfo", JSON.stringify(operationInfo), false, {"shareCookie": global.shareCookie,"isSaveSession":!global.shareCookie});// 信用普通
	}
	
	/**
	 * 
	 * @param {Object} type
	 */
	function clearUserInfo(type){
		if(type){
			recordType(type, true);
			if(type == "1"){
				clearTransferInfo();
			}
			if(curUserInfo._loginClass == type){
				curUserInfo = {};
			}
			$.clearSStorage(dealType(type)+"_userInfo", false, {"shareCookie": global.shareCookie});
		}
		else{
			$.clearSStorage("_isLoginIn", false, {"shareCookie": global.shareCookie});
			$.clearSStorage("jsessionid", false, {"shareCookie": global.shareCookie});
			for(var i = 0; i < operationInfo.length; i++){
				$.clearSStorage(dealType(i)+"_userInfo", false, {"shareCookie": global.shareCookie});
			}
			$.clearSStorage("operationInfo", false, {"shareCookie": global.shareCookie});
			clearTransferInfo();
			clearLogoutTime();
		    operationInfo = [];
    		curUserInfo = {};
    		require.async("commonFunc",function(module){
    			module.clearCheckTradeTimer();
	    	});
		}
	}
	
	
	/**
	 * 是否已交易登录
	 * @param {Object} type 登录类型,信息类型 默认是普通交易信息 1：融资融券信息 N
	 */
	function isTradeLogin(type)
	{
		if(type){
			 return isValue(getCurUserInfo(type));
		}
		else{
			return isValue(operationInfo);
		}
	}
	
    /**
     * 类型字段转换
     * @param {Object} type 登录类型
     */
    function dealType(type){
    	type = (type || "") + "";
    	switch(type){
			case "1":
				return "credit";
			case "2":
				return "option";
			case "3":
				return "financial";
			default:
				return "stock";
		}
    }
    
    
    /**
     * 数组去除相同的数据，添加或者删除数组
     * @param {Array} arrays 要操作的数组
     * @param {Object} account 添加或者删除
     * @param {Object} isDelete 是否是删除  N
     */
    function unshiftDeleteSame(arrays, account, isDelete){
    	var as = [];
    	if(!isDelete){
	    	as.push(account);
    	}
    	for(var i = 0; i < arrays.length; i++){
    		if(arrays[i] != account){
    			as.push(arrays[i]);
    		}
    	}
    	return as;
    }
    
    
	
    
	/**
	 * 存储登录用户信息
	 * @param {Array} data 登录数据
	 * @param {String} type 登录账号+类型   1234|0  N
	 */
	function setAccountInfos(data,type){
		if(data){
			//返回对应登录账户类型的用户信息（传入参数：登录类型）
			getAccountInfos();
			
			if(!accountInfos){
				accountInfos = {};
			}
			
			if(!type){
				type = data[0]._loginClass;
			}
			
			//得到登录类型相关的用户信息
			accountInfos[dealType(type)] = data;
			
			var userInfo =JSON.stringify(accountInfos);
			
			//将对应登录的账号信息保存在本地
			$.setSStorageInfo("userInfos", userInfo, false, {"shareCookie": global.shareCookie,"isEncrypt": global.shareCookie,"isSaveSession":!global.shareCookie});// 信用普通
		}
	}
	
	
	/**
	 * 获取登录用户信息
	 * @param {String} type 登录账号+类型   1234|0  N
	 */
	function getAccountInfos(type){
		//表示还没有登录的用户信息对象
		if(!accountInfos || size(accountInfos) == 0){
			var userInfo = $.getSStorageInfo("userInfos",false,{"isDecrypt": global.shareCookie});
			if(userInfo && typeof(userInfo) == "string" && userInfo != "null" && userInfo != "0"){
				accountInfos = JSON.parse(userInfo);
			}
		}
		if(type && accountInfos){
			return accountInfos[dealType(type)];	
		}else{
			return accountInfos;
		}
	}
	
	
	/**
	 * 删除登录用户信息
	 */
	function clearAccountInfos(){
		clearUserInfo();
		accountInfos = null;
		$.clearSStorage("userInfos", false, {"shareCookie": global.shareCookie});
	}
	
	
	/**
	 * 获取主铺账户信息
	 * @param {Object} type
	 */
	function getMainAuxiliaryAccount(type){
		getAccountInfos();
		var account = null;
		if(type){
			var account = accountInfos[dealType(type)];
		}else{
			getCurUserInfo();
			if(curUserInfo){
				var type = curUserInfo._loginClass;
				account = accountInfos[dealType(type)];
			}
		}
		if(account && account.length > 0){
			var m = {};
			for(var i = 0; i < account.length; i++){
				var a = account[i].fund_account+"|"+account[i].main_flag;
				var s = m[a] || [];
				s.push(account[i]);
				m[a] = s;
			}
			return m;
		}
		else{
			return null;
		}
	}
	
	
	/**
	 * 启动用户登录超时定时检测
	 * */
	function initLogoutTime(){
		//启动账户登录检测定时器
		clearLogoutTime();
		logoutTimer = window.setInterval(function(){
			var lastDoTime = $.getSStorageInfo("_lastDoTime") || "";
			if(global.logoutTimeNum && new Date().getTime() - Number(lastDoTime) > 1000*60*global.logoutTimeNum){
				var pageCode = $.getCurrentPageObj().pageCode;
				var param = {
					"topage": pageCode,
					"param": $.getPageParam() || {}
					};
				clearUserInfo();
				$.hidePreloader();
				$(".top_title .logout").hide();
				clearLogoutTime();
				$.pageInit(pageCode,"account/login",param,"",true);
			}
		},5000); // 5秒检测一次
	}
	
	/**
	 * 清除定时器
	 */
	function clearLogoutTime(){
		if(logoutTimer != null){
			window.clearInterval(logoutTimer);
			logoutTimer = null;
		}
	}
	
	/**
	 * 获取划转普通信息
	 * @param {Object} type
	 */
	function getTransferInfo(type){
		if(!isValue(transferInfo)){
			var userInfo = $.getSStorageInfo("transferInfo");
			if(userInfo && typeof(userInfo) == "string" && userInfo != "null" && userInfo != "0"){
				transferInfo = JSON.parse(userInfo);
			}
		}
		return transferInfo;
	}
	
	/**
	 * 设置划转普通信息
	 * @param {Object} type
	 */
	function setTransferInfo(type,data){
		getTransferInfo();
		transferInfo = data;
		$.setSStorageInfo("transferInfo", JSON.stringify(transferInfo), false, {"shareCookie": global.shareCookie,"isSaveSession":!global.shareCookie});// 信用普通
	}
	
	/**
	 * 删除划转普通信息
	 * @param {Object} type
	 */
	function clearTransferInfo(type){
		transferInfo = null;
		$.clearSStorage("transferInfo", false, {"shareCookie": global.shareCookie});
	}
	/*******************关于登录账号信息**********************/
	
	function loginTypeSize(){
		return operationInfo.length;
	}
	
	
	/**
     * 双按钮提示框
     * @param {Object} theme 提示标题
     * @param {Object} content 提示内容
     * @param {Object} determineFunction 点击正确执行函数
     * @param {Object} cancelFunction 点击取消执行函数
     * @param {Object} determine 正确按钮语
     * @param {Object} cancel 取消按钮语
     */
    function iConfirm(theme, content, determineFunction, cancelFunction, determine, cancel, prompt){
    	$("#newTradingTipsBox2").remove();
    	var pageId = '#'+$.getCurrentPageObj().pageId;
    	if(theme && typeof(theme) == "string"){
    		theme ="<h3>" +theme+"</h3>";
    	}
    	if(typeof(content) == "undefined"){
    		content = "";
    	}
    	if(typeof(determine) == "undefined"){
    		determine = "确定";
    	}
    	if(typeof(cancel) == "undefined"){
    		cancel = "取消";
    	}
    	var div='<div id="newTradingTipsBox2" style="position: fixed"><div key-panel-main="true" class="prompt_box2">'+theme+'<div class="_content">' + content + 
		  		'</div><div class="btn"><div><a href="javascript:void(0)" id="cancel">'+ cancel +
		  		'</a></div><div><a class="needsclick" href="javascript:void(0)" id="determine">'+ determine+
		  		'</a>';
		  		if(prompt){
		  			div += '<div class="prompt_shade"></div>';	
		  		}
		  		div +='</div></div></div><div class="shade"></div></div>';
    	$(pageId).append(div);
    	var $content = $(pageId+" #newTradingTipsBox2 .prompt_box2 ._content");
    	if($content.height() < 30){
    		$content.height(30);
    	}
    	var $prompt = $(pageId+" #newTradingTipsBox2 .prompt_box2");
    	var wHeight = Number(gconfig.appHeight) * 0.4;
    	var topHeight = $prompt.height()/2;
    	if(topHeight >= wHeight){
    		topHeight = wHeight;
    		$content.css({"height": topHeight*2 - 131, "overflow": "auto"});
    	}
    	$prompt.css("margin-top", 0-topHeight);
    	$(pageId+" #newTradingTipsBox2").css("position", "static");
    	$.bindEvent($(pageId+" #newTradingTipsBox2 .prompt_box2 .prompt_shade"), function(e) {
    		if(prompt && typeof prompt == "function"){
    			if(prompt($content)){
    				$(pageId+" #newTradingTipsBox2 #determine").trigger("touchstart");
    			}
    		}
    		var evt = e || window.event;
			evt.stopPropagation ? evt.stopPropagation() : (evt.cancelBubble = true);
    	});
    	$.bindEvent($(pageId+" #newTradingTipsBox2 #determine"), function(e) {
    		$(this).unbind();
			this.touchstart = null;
			$(pageId+" #newTradingTipsBox2 .shade").css("opacity", "0");
			$(pageId+" #newTradingTipsBox2 .prompt_box2").hide();
			setTimeout(function(){
				var opacity = $(pageId+" #newTradingTipsBox2 .shade").css("opacity");
				if(opacity == 0){
	    			$("#newTradingTipsBox2").remove();
				}
			},500);
			if(determineFunction){
				setTimeout(function(){
					determineFunction($content);
				},300);
			}
			var evt = e || window.event;
			evt.stopPropagation ? evt.stopPropagation() : (evt.cancelBubble = true);
		},"touchstart");
		$.bindEvent($(pageId+" #newTradingTipsBox2 #cancel"), function(e) {
    		setTimeout(function(){
				$(pageId+" #newTradingTipsBox2 .shade").css("opacity", "0");
				$(pageId+" #newTradingTipsBox2 .prompt_box2").hide();
			},100);
			setTimeout(function(){
    			var opacity = $(pageId+" #newTradingTipsBox2 .shade").css("opacity");
				if(opacity == 0){
	    			$("#newTradingTipsBox2").remove();
				}
			},500);
			if(cancelFunction){
				setTimeout(function(){
					cancelFunction($content);
				},300);
			}
			var evt = e || window.event;
			evt.stopPropagation ? evt.stopPropagation() : (evt.cancelBubble = true);
		},"touchstart");
    }
	
	function generatePrompt(data){
		var tipStr = [];
		tipStr.push("<ul class='tips_list'>");
		for(var i = 0; i < data.length; i++){
			tipStr.push("<li><span><em>")
			tipStr.push(data[i][0]);
			tipStr.push("</em></span><span><em>");
			tipStr.push(data[i][1]);
			tipStr.push("</em></span></li>");
		}
		tipStr.push("</ul>");
		return tipStr.join("");
	}
	
	function addChoiceList(div, title, liHtml, determine, type, id){
		var _pageId = '#'+$.getCurrentPageObj().pageId+" ";
		var divID = "";
		var pageId = _pageId;
		if(id){
			divID = ' id="list_'+id+'"';
			pageId = pageId + "#list_"+id;
		}
		var html = [];
		if(type){
			$(pageId+".listSelection.multi").remove();
			html.push('<div'+divID+' class="listSelection multi">');
			$.bindEvent(div,function(e){
				div = $(this);
	      		$(pageId+".listSelection.multi").showLeft();
	      		if(!global.startJSkeyboard){
		      		e.stopPropagation(); // 阻止冒泡
	      		}
	      	});
		}
		else{
			$(pageId+".listSelection.radio").remove();
			html.push('<div'+divID+' class="listSelection radio">');
			$.bindEvent(div,function(e){
				div = $(this);
				$(pageId+".listSelection.radio").showLeft();
				if(!global.startJSkeyboard){
		      		e.stopPropagation(); // 阻止冒泡
	      		}
	      	});
		}
    	html.push('<div class="top_title">');
        html.push('<a href="javascript:void(0);" class="cancel">取消</a>');
        html.push('<h3>');
        html.push(title);
        html.push('</h3>');
        if(type){
             html.push('<a href="javascript:void(0);" class="save">保存</a>');
        }
      	html.push('</div><div class="list">');
      	html.push(liHtml);
      	html.push('</div>');
      	$(_pageId).append(html.join(""));
      	$(pageId+".listSelection .list").height(gconfig.appHeight - $(pageId+".listSelection .top_title").height())
      	$.bindEvent(pageId+".listSelection.radio .list li",function(e){
      		$(this).addClass("active").siblings().removeClass("active");
      		if(determine){
      			determine($(this), div);
      		}
      		$(pageId+".listSelection").hideLeft();
      		e.stopPropagation(); // 阻止冒泡
      	});
      	$.bindEvent(pageId+".listSelection.multi .list li",function(e){
      		$(this).toggleClass("active");
      		e.stopPropagation(); // 阻止冒泡
      	});
      	$.bindEvent(pageId+".listSelection .cancel",function(e){
      		$(pageId+".listSelection").hideLeft();
      		e.stopPropagation(); // 阻止冒泡
      	});
      	$.bindEvent(pageId+".listSelection.multi .save",function(e){
      		if(determine){
      			determine($(pageId+".listSelection li.active"), div);
      		}
      		$(pageId+".listSelection").hideLeft();
      		e.stopPropagation(); // 阻止冒泡
      	});
	}
	
	
	/**
	 * 加载显示协议页面
	 * @param {Object} paraMap 参数
	 * @param {Object} qdCallback 确定回调方法
	 * @param {Object} qxCallback 取消回调方法
	 */
	function Agreement(paraMap, qdCallback, qxCallback){
		var	_pageId = paraMap.pageId || "#"+$.getCurrentPageObj().pageId;
		$(_pageId+" .agreement").remove();
		var para = {
			"top": typeof(paraMap.top) == "undefined" ? true : paraMap.top,//是否显示头部返回按钮
			"topTxt": paraMap.topTxt || "", // 头部返回的文字
			"title": paraMap.title || "签署协议",// 头部显示文字 ，可以为数组
			"class": paraMap.class || "", // 添加样式名
			"height": paraMap.height || $(window).height(), // 高度
			"width": paraMap.width || $(window).width(), // 宽度
			"src": paraMap.src || "", // iframe 的 引用地址，可以为数组
			"checkbox": typeof(paraMap.checkbox) == "undefined" ? true : paraMap.checkbox, // 是否显示协议勾选按钮
			"checkboxTxt": paraMap.checkboxTxt || "同意并签署上述协议", // 协议勾选按钮文字
			"checkboxDefault": typeof(paraMap.checkboxDefault) == "undefined" ? false : paraMap.checkboxDefault,//协议勾选按钮是否默认勾上
			"twoButton": typeof(paraMap.twoButton) == "undefined" ? false : paraMap.twoButton, // 是否有下面的返回按钮
			"back": paraMap.cancel || "返回", // 下面的返回按钮的文字
			"sure": paraMap.sure || "已阅读并同意", // 确定按钮的文字
			"isShowWait": typeof(paraMap.isShowWait) == "undefined" ? true : paraMap.isShowWait, // 是否有加载提示
			"lastStep": paraMap.lastStep || "上一个", // 多个地址 上一个的文字提示
			"nextStep": paraMap.nextStep || "下一个", // 多个地址 下一个的文字提示
			"iAlertTxt": paraMap.iAlertTxt || "请先同意勾选协议", // 协议勾选按钮没有勾上的提示文字
			"first": true,
			"srcList": false,
			"srcLengln": 0,
			"iframePosi": 1,
			"load_in": true,
			"id": "Agreement"
		};
		var html = [];
		if(para.src && para.src instanceof Array){
			para.srcLengln = para.src.length;
			if(para.srcLengln > 0){
				para.srcList = true;
				para.twoButton = true;
			}
		}
		if(para.title && typeof(para.title) == "string"){
			para.title = [para.title];
		}
		html.push('<div class="agreement '+ para.class +'" id="'+para.id+'">');
		html.push('<header class="header">');
		html.push('<div class="top_title">');
		if(para.top){
			html.push('<a href="javascript:void(0);" class="icon_back text">');
			html.push(para.topText);
			html.push('</a>');
		}
		html.push('<h3>');
		html.push(para.title[0]);
		html.push('</h3></div></header>');
		html.push('<div class="sr_entry" style="overflow:auto;-webkit-overflow-scrolling:touch;">');
		if(para.srcList){
			for(var i = 0; i < para.srcLengln; i++){
				html.push('<iframe src="'+para.src[i]+'"></iframe>');
			}
		}
		else{
			html.push('<iframe src="'+para.src+'"></iframe>');
		}
		html.push('</div><div class="sr_but">');
		if(para.checkbox){
			html.push('<div class="sr_check"><span class="icon_check">');
			if(para.checkboxDefault){
				html.push('<input type="checkbox" class="c1" checked="checked"/><label>');
			}
			else{
				html.push('<input type="checkbox" class="c1" /><label>');
			}
			html.push(para.checkboxTxt);
			html.push('</label></span></div>');
		}
		html.push('<div class="ce_btn">');
		if(para.twoButton){
			html.push('<a class="back" href="javascript:void(0)">'+para.back+'</a>');
		}
		html.push('<a class="sure" href="javascript:void(0)">'+para.sure+'</a>');
		html.push('</div></div></div>');
		$(_pageId).append(html.join(""));
		var agre = $(_pageId+" #"+para.id);
		var divs = {
			"iframe": agre.find("iframe"),
			"icon_back": agre.find(".top_title .icon_back"),
			"back": agre.find(".ce_btn .back"),
			"icon_check": agre.find(".sr_check .icon_check"),
			"sure": agre.find(" .ce_btn .sure"),
			"icon_input": agre.find(" .sr_check .icon_check input")
		}
		divs.iframe[0].onload = function(){
			para.load_in = false;
			$.hidePreloader();
			divs.iframe.eq(0).show();
			agre.find(" .sr_but").show();
		};
		
		// top返回
		$.bindEvent(divs.icon_back, function(e){
			agre.hide();
			e.stopPropagation(); // 阻止冒泡
		});
		// 下面返回按钮
		$.bindEvent(divs.back, function(e){
			if(para.srcList){
				if(para.iframePosi == 1){
					agre.hide();
					if(qxCallback){
						qxCallback();
					}
				}
				else{
					para.iframePosi--;
					divs.iframe.hide();
					if(para.checkbox){
						divs.icon_input.attr("checked",true);
					}
					agre.find("h3").html(para.title[para.iframePosi-1]);
					divs.iframe.eq(para.iframePosi-1).show();
					divs.sure.html(para.nextStep);
					if(para.iframePosi == 1){
						divs.back.html(para.back);
					}
					else{
						divs.back.html(para.lastStep);
					}
				}
			}
			else{
				agre.hide();
				if(qxCallback){
					qxCallback();
				}
			}
			e.stopPropagation(); // 阻止冒泡
		});
		//勾选协议
		$.bindEvent(divs.icon_check, function(e){
			var isChecked = $(this).find("input").attr("checked");
			if(isChecked){
				$(this).find("input").attr("checked",false);
			}else{
				$(this).find("input").attr("checked",true);
			}
			e.stopPropagation();
		});
		//确定
		$.bindEvent(divs.sure, function(e){
			if(para.srcList){
				if(para.checkbox){
					var isChecked = divs.icon_input.attr("checked");  // 是否勾选协议
					if(!isChecked)  // 未勾选协议时
					{
						$.alert(para.iAlertTxt);
					}
					else{
						if(para.iframePosi == para.srcLengln){
							para.iframePosi = 1;
							if(qdCallback){
								qdCallback();
							}
						}
						else{
							divs.iframe.hide();
							divs.icon_input.attr("checked",false);
							agre.find("h3").html(para.title[para.iframePosi]);
							divs.iframe.eq(para.iframePosi).show();
							para.iframePosi++;
							divs.back.html(para.lastStep);
							if(para.iframePosi == para.srcLengln){
								divs.sure.html(para.sure);
							}
							else{
								divs.sure.html(para.nextStep);
							}
						}
					}
				}
				else{
					if(para.iframePosi == para.srcLengln){
						para.iframePosi = 1;
						if(qdCallback){
							qdCallback();
						}
					}
					else{
						divs.iframe.hide();
						agre.find("h3").html(para.title[para.iframePosi]);
						divs.iframe.eq(para.iframePosi).show();
						para.iframePosi++;
						divs.back.html(para.lastStep);
						if(para.iframePosi == para.srcLengln){
							divs.sure.html(para.sure);
						}
						else{
							divs.sure.html(para.nextStep);
						}
					}
				}
			}
			else{
				if(para.checkbox){
					var isChecked = divs.icon_input.attr("checked");  // 是否勾选协议
					if(!isChecked)  // 未勾选协议时
					{
						$.alert(para.iAlertTxt);
					}
					else{
						if(qdCallback){
							qdCallback();
						}
					}
				}
				else{
					if(qdCallback){
						qdCallback();
					}
				}
			}
			e.stopPropagation(); // 阻止冒泡
		});
		//显示
		var show = function(){
			agre.showLeft();
			if(para.first){
				var iframeHeight = para.height - agre.find("header").height() - agre.find(".sr_but").height();
				agre.find(".sr_entry").height(iframeHeight);
				divs.iframe.height(iframeHeight-24);
				agre.css({"opacity":"1","z-index":"1000000"});
				if(para.load_in && para.isShowWait){
					$.showPreloader("请等待...");
				}
			}
			para.iframePosi = 1;
			divs.iframe.hide();
			if(para.checkbox){
				divs.icon_input.attr("checked",false);
			}
			agre.find("h3").html(para.title[0]);
			divs.back.html(para.back);
			if(para.srcList){
				divs.sure.html(para.nextStep)
			}
			divs.iframe.eq(0).show();
		};
		//隐藏
		var hide = function(){
			agre.hideLeft();
		}
		//消除
		var destroy = function(){
			agre.remove();
			para = {};
			divs = {};
		}
		return {"show":show,"hide":hide,"destroy":destroy};
	}
	
	function getWidth($div,text,fontSize)  
	{  
		$("body>._getWidth_").remove();
		var localName = $div[0].localName;
		if(!fontSize){
			fontSize = $div.css("font-size");
		}
		else{
			fontSize += "px";
		}
		var html = "<"+localName+" class=\"_getWidth_\" style=\"font-size:"+fontSize+";\">"+text+"</"+localName+">";
        $("body").append(html);
        var w = $("body>._getWidth_")[0].offsetWidth;
        $("body>._getWidth_").remove();
	    return w;
	}
	
	function fontOutOf($div,text,type){
		var fontSize = $div.css("font-size").replace("px","");
		fontSize = Number(fontSize);
		var width = $div.parent().width();
		var $div_width = getWidth($div,text);
		if($div_width > width){
			// 用省略号表示
			if(type == "1"){
				$div.parent().addClass("_ellipsis_");
				$div.html(text);
			}
			// 用跑马灯
			else if(type == "2"){
				$div.html("<marquee>"+text+"</marquee>");
			}
			// 用缩小字体
			else if(type == "3"){
				var size = fontSize - 1;
				for(var i = size; i >= 12; i--){
					var w = getWidth($div,text, i);
					if(w <= width){
						size = i;
						break;
					}
				}
				$div.html(text).css("font-size",(size)+"px");
			}
			// 换行
			else if(type == "4"){
				$div.addClass("_beyondWrap_");
				$div.html(text);
			}
		}
	}


	function commonButtomSelectCreateParam(selectArrayText,selectArrayOnclick,cancelArray) {
		var button1=[];
		var button2=cancelArray;
		for(var i=0;i<selectArrayText.length;i++){
			var obj={
				text:selectArrayText[i],
				onClick:selectArrayOnclick[i]
			};
			button1[i]=obj;
		}
		var groups = [button1, button2];
		return groups;
	}




	var base = {
		"size": size,
    	"bindStockEvent":bindStockEvent,
    	"numToMoneyType":numToMoneyType,
    	"getStockType":getStockType,
    	"setMainHeight": setMainHeight,
    	"transferText": transferText,
    	"filterLoginOut": filterLoginOut,
    	"getCurUserInfo": getCurUserInfo,
    	"setCurUserInfo": setCurUserInfo,
    	"updateCurUserInfo":updateCurUserInfo,
    	"clearUserInfo": clearUserInfo,
    	"switchingCurUser": switchingCurUser,
    	"setAccountInfos": setAccountInfos,
    	"getAccountInfos": getAccountInfos,
    	"setTransferInfo": setTransferInfo,
    	"getTransferInfo": getTransferInfo,
    	"clearTransferInfo": clearTransferInfo,
    	"getMainAuxiliaryAccount": getMainAuxiliaryAccount,
    	"isTradeLogin": isTradeLogin,
    	"unshiftDeleteSame": unshiftDeleteSame,
    	"dealType": dealType,
    	"isValue": isValue,
    	"loginTypeSize": loginTypeSize,
    	"iConfirm": iConfirm,
    	"generatePrompt": generatePrompt,
    	"addChoiceList": addChoiceList,
    	"Agreement": Agreement,
    	"fontOutOf": fontOutOf,
    	"getWidth": getWidth,
		"commonButtomSelectCreateParam":commonButtomSelectCreateParam,
		"saveStockAccount":saveStockAccount,
		"getStockAccount":getStockAccount
    };

    module.exports = base;
});