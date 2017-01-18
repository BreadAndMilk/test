/**
 * 这里写模块内部的消息处理函数，供原生回调H5
 */
define("trade/shellFunction/msgFunction.js",function(require, exports, module){
	var	gconfig = $.config;
	var	global = gconfig.global;
	var oMyMsgFunction = {}; // 暴露给外部的对象
	var oMyMsgFunction = $.msgFunction; // 暴露给外部的对象
	
	/**
	 * 公用		
	 * 弹出通讯录，用于选择联系人的信息，选择完毕后回调H5
	 * 说明：通讯录插件的调用必须要写在页面UI的事件处理函数中，否则多模块开发原生无法获取到当前激活的模块从而导致无法回调H5
	 * @param funcNo 50223
	 * @param name String 名称 Y
	 * @param phone String 手机号码 Y
	 */
	oMyMsgFunction.function50223 = function(paramMap) 
	{
		var selPhoneCallback = window.selPhoneCallback; // 选择电话联系人的回调函数
		if(selPhoneCallback)
		{
			selPhoneCallback(paramMap);
		}
	}
	
	/**
	 * 公用		
	 * 日期控件回调H5
	 * 说明：日期控件的调用必须要写在页面UI的事件处理函数中，否则多模块开发原生无法获取到当前激活的模块从而导致无法回调H5
	 * @param funcNo 50251
	 * @param date String 日期 Y
	 * @param selector String H5的元素选择器 N
	 */
	oMyMsgFunction.function50251 = function(paramMap) 
	{
		paramMap = paramMap || {};
		var selDateCallback = window.selDateCallback; // 选择日期的回调函数
		if(selDateCallback)
		{
			selDateCallback(paramMap);
		}
	}
	
	/**
	 * 公用		
	 * 设置系统软件的主题风格
	 * @param funcNo 50104
	 * @param theme String 主题颜色(见数据字典) Y 0：红色，1：蓝色，2：黑色，3：黄色，9：绿色
	 */
	oMyMsgFunction.function50104 = function(paramMap) 
	{
		if(paramMap)
		{
//			var $appCss = $("head>link[href*='" + gconfig.firstLoadCss[0] + "']");
//			var skinMap = {0: "red", 1: "blue", 2: "black", 3: "yellow", 9: "green"};
//			var href = gconfig.cssPath + "style_" + skinMap[paramMap.theme] + ".css";
//			gconfig.firstLoadCss[0] = href; // 修改当前皮肤对应的 css
//			$appCss.attr("href", href);
//			var originalOverflow = $("body").css("overflow");
//			$("body").css("overflow", "auto"); // 强制浏览器重绘
//			$("body").css("overflow", originalOverflow);
		}
	}

	/**
	 * 公用		
	 * 原生的信息提示框回调H5
	 * @param funcNo 50111
	 * @param flag	String	业务标志	N
	 */
	oMyMsgFunction.function50111 = function(paramMap) 
	{
		if(paramMap)
		{
			$.alert(paramMap.flag);
		}
	}

	/**
	 * 公用		
	 * 通知H5分享后的状态
	 * @param funcNo 50232
	 * @param shareType	String	分享平台（数据字典）	Y
	 * @param flag	String	分享状态（0：失败，1：成功)	Y
	 * @param info	String	备注信息	N
	 */
	oMyMsgFunction.function50232 = function(paramMap) 
	{
		if(paramMap)
		{
			$.alert("通知H5分享后的状态50232" + JSON.stringify(paramMap));
		}
	}
	
	/**
	 * 公用		
	 * 验证手势密码中忘记密码，修改账号回调H5
	 * @param funcNo 50262
	 * @param type	String	类型(0：忘记密码，1：修改账号）	N
	 */
	oMyMsgFunction.function50262 = function(paramMap) 
	{
		if(paramMap)
		{
			$.alert("验证手势密码中忘记密码，修改账号回调H550262" + JSON.stringify(paramMap));
		}
	}

	/**
	 * 公用		
	 * 扫描图片二维码的内容回调给H5页面	
	 * @param funcNo 50272
	 * @param content	String	内容	Y
	 */
	oMyMsgFunction.function50272 = function(paramMap) 
	{
		if(paramMap)
		{
			$.alert("扫描图片二维码的内容回调给H5页面	50272" + JSON.stringify(paramMap));
		}
	}
	
	/**
	 * 行情跳转买卖			
	 * @param funcNo 50272
	 * @param content	String	内容	Y
	 */
	oMyMsgFunction.function60250 = function(paramMap) 
	{
		try{
			var type = paramMap.type;//买卖类型
			var code = paramMap.code;//股票代码
			var market = paramMap.market;//市场
			var param = {"code":code};
			if(type=="buy"){
				$.pageInit(null,"stock/stockBuy",param);
			}else{
				$.pageInit(null,"stock/stockSell",param);
			}
		}catch(e){
			console.log("H5获取股票买卖传入数据解析JSON出错"+e.message);
	    }
	}
	
	/**
	 * 原生跳转H5模块
	 * @param paramMap json格式参数
	 */
	oMyMsgFunction.function60251 = function(paramMap) 
	{
		try{
			var funcModules ={"0":"newshare/apply",
					          "1":"credit/asset/asset", 
					          "2":"ggt/ggtBuy",
					          "3":"fund/fundApply",
					          "4":"otc/otcProducts",
					          "5":"",
					          "6":"banking/transfer",
					          "7":"banking/collection",
					          "8":"account/changePassword",
					          "9":""
		                   };
			var funcModule = paramMap.funcModule;//功能模块
			var userInfo = paramMap.userInfo;//用户信息
			var loginType = paramMap.loginType;//账户类别
			var topage = funcModules[funcModule];
			require.async("common",function(module){
              	module.setCurUserInfo(userInfo,loginType);
			  	$.pageInit(null,topage,{});
              	var tradeURL = $.callMessage({"moduleName":"trade","serverName":"TRADE_URL","funcNo": "50112"});
				if(tradeURL && (tradeURL.error_no == 0) && tradeURL.results[0].url){
					var result = tradeURL.results[0].url;
					global.serverPathTrade = result+"/servlet/json";//交易地址
					global.serverPath =  result+"/servlet/json";//统一登录
					global.validateimg = result+"/servlet/NewImage";//验证码
					global.HqUrl = result+"/servlet/MarketAction";//行情
				}
           	});
		}catch(e){
			console.log("原生跳转H5模块传入数据解析JSON出错"+e.message);
	    }
	}
	
	/**
        *模块切换初始化
        */
     oMyMsgFunction.function50113 = function(param)
     {
           var toPage = param ? param["toPage"] : null;
           console.log("#############"+toPage);
           require.async("sso",function(module){
              if(toPage && toPage.length > 0)
              {
                  var index = toPage.indexOf(".");
                  if(index > 0){
                       toPage = toPage.substring(0,index);
                  }
                  var pageId = toPage.split("/").join("_");
                  $("#"+pageId).hide();
                  $.pageInit("",toPage);
              }
              else
              {
                       console.log("aaaaaa");
                  module.reloadPageInit();

              }
           });
     }

    /**
     *统一退出回调
     */
     oMyMsgFunction.function60401 = function(param)
     {
	       if(param.error_no == 0)
	       {
	       		require.async("sso",function(module){
                 	if(module.checkLoginRight()){
	                	 module.goTologin();
	                 }
	             });
	       }
	       else
	       {
	       		$.alert(param.error_info);
	       }
      }
	
     
     /**
      *  系统退出
      */
     oMyMsgFunction.function60403 = function(param)
     {
         require.async("common",function(module){
              module.clearUserInfo();
         });
         //调用退出登录接口，请求服务器，失效session
         
     }
	module.exports = oMyMsgFunction;
});