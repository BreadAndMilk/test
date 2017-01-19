/**
 * 程序入口配置读取
 * 项目开发时需要的自定义配置
 */
/**
 * 存放对 hsea 的 config，需在 zepto 之后 hsea 之前加载
 *
 * 2016-4-12 10:15:09
 */
define(function(require, exports, module) {
	$.config = {
	    // 路由功能开关过滤器，返回 false 表示当前点击链接不使用路由
	    routerFilter: function($link) {
	        // 某个区域的 a 链接不想使用路由功能
	        if ($link.is('.disable-router a')) {
	            return false;
	        }
	        return true;
	    },
	    /*
	     * 配置默认document.titles标题
	     */
	    documentTitle: "股票交易",
	    /**
		 * hSea根路径，项目中的文件uri最终会在项目访问的web路径后添加
		 */
	    seaBaseUrl: "/m/",
		//项目名，默认为project
		projName: "trade", //一般为“project”，对应的项目目录名字
		//项目的css目录
		cssPathName: "css",
		//项目的images目录
		imagesPathName: "images",
		//项目的scripts目录
		scriptsPathName: "scripts",
		//项目的views目录
		viewsPathName: "views",
		//壳子文件scripts文件路径
		shellScriptPath: "/shellFunction/msgFunction.js",
		//默认点击事件
		triggerEventName: "click",
		/**
		 * 后端接口返回过滤
		 */
		executeFilter: {
	    	executeFilterFunc: function(data)
	    	{	
//	    		data.error_no = "-999";
	    		if(data.error_no == '-999' || data.errorNo == '-999')//未登录
	    		{	    			
	    			require.async("common",function(module){
					 	module.filterLoginOut();
			        });		
	    			return false;
	    		}else
	    		{
//					data.error_no = -1;
	
//					data.results = [];
					
//					if(data.results){
//						results = data.results[0];
//						if(results){
//							for(var i = 0; i < 20; i++){
//								data.results = data.results.concat(results);
//							}
//						}    		
//					}
					
	    			return true;
	    		}
	    		
	    	}
		},
		//引导页
		guidePage: {"pageCode": "", "jsonParam":{}},
		//项目中公用模块的别名配置(根目录为seaBaseUrl)
		pAlias: {
			"hIscroll": "2.0.0/js/plugins/iscroll/scripts/hIscroll.js",
			"vIscroll": "2.0.0/js/plugins/iscroll/scripts/vIscroll.js",
			"svIscroll": "2.0.0/js/plugins/iscroll/scripts/svIscroll.js",
			"iscroll5": "2.0.0/js/plugins/iscroll5/scripts/iscroll5.js",// iscroll5上下拉刷新
			"iscrollUtils": "2.0.0/js/plugins/iscroll5/scripts/iscrollUtils.js",
			"mobiscrollUtils": "2.0.0/js/plugins/mobiscroll/scripts/mobiscrollUtils.js",
			"aes":"2.0.0/js/plugins/endecrypt/scripts/aes.js",
			"rsa":"2.0.0/js/plugins/endecrypt/scripts/rsa.js",
			"endecryptUtils":"2.0.0/js/plugins/endecrypt/scripts/endecryptUtils.js",
			"validatorUtils": "2.0.0/js/plugins/validator/scripts/validatorUtils.js",
			"keyPanel": "2.0.0/js/plugins/keypanel/scripts/keyPanel.js",
			"com":"trade/scripts/common/com.js", //首次加载方法
			"common":"trade/scripts/common/common.js", //交易工具公共方法
			"keyboard":"trade/scripts/common/keyboard.js",
//			"service":"trade/service/scripts/base/service.js",
			"zeptoExtend":"trade/scripts/common/zeptoExtend.js",
			"commonFunc":"trade/scripts/common/commonFunc.js", //交易业务公共方法
			"commonOrder":"trade/scripts/common/commonOrder.js", //下单公共方法
			"sockOrder":"trade/scripts/common/sockOrder.js", //普通交易下单公共方法
			"ggtOrder":'trade/scripts/common/ggtOrder.js',// 港股通下单公共方法
			"creditOrder":"trade/scripts/common/creditOrder.js", //融资融券下单公共方法
			"optionOrder": "trade/scripts/common/optionOrder.js",
			"stockTransferOrder":"trade/scripts/common/stockTransferOrder",			//新三板-股份转让的通用交易处理模块
			"msgFunction": "trade/shellFunction/msgFunction.js",
			"service_common":"trade/service/scripts/trade/service_common.js",
			"service_stock":"trade/service/scripts/trade/service_stock.js",
			"service_hq":"trade/service/scripts/trade/service_hq.js",
			"service_fund":"trade/service/scripts/trade/service_fund.js",
			"service_option":"trade/service/scripts/trade/service_option.js",
			"service_ggt":"trade/service/scripts/trade/service_ggt.js",
			"service_otc":"trade/service/scripts/trade/service_otc.js",
			"service_credit":"trade/service/scripts/trade/service_credit.js",
			"service_added":"trade/service/scripts/trade/service_added.js",
			"service_stockTransfer":"trade/service/scripts/trade/service_stockTransfer"			//新三板-股份转让的前端请求接口
		},
		//登录检测(一个模块里面登录只要一个)
		loginCheck: {
			isAsynch: false,//是否异步,默认同步(区别在于如果设置为true，需要等当前异步操作完毕后才会执行后续操作(比如页面跳转))
			//不需要登录需要在这里配置（如果配置在页面，需要拉取页面后才能做判断）页面配置ID
			//pageFilters这里必须写绝对路径，即/开头
		    "pageFilters" : [
				['account/index','account/login',"account/activePhone"],[]
		    ], //过滤的pageCode,可以绕过登录
		    "checkFunc" : function(url, noAnimation, replace, reload,param,pagecode,prePageCode,_callback,direct){  
		    	//常规登录判断
				var _isLoginIn = $.getSStorageInfo("_isLoginIn");//是否登录的标志
				if(_isLoginIn){
					return true;
				}
				else{
					require.async("com",function(module){
					 	module.checkFunc(url, noAnimation, replace, reload,param,pagecode,prePageCode,_callback,direct);
			        });			
					return false;
				}
				
				//异步验证,需要在异步返回后执行callback方法
				/*var urls = $.config.global.server;
				var params = {'version': 1,'funcno': 29999};
				var callback = function(data)
				{
					if(data.errorNo == '0')//已结登录
					{
						_callback(_prePages,_url, _param,_ignoreCaches);

					}else{//未登录
						$.pageInit(null,'./views/login/',param);			
					}
					
				}
				$.service.ajax.request(urls, params, $.proxy(callback,this));*/
			}
	   },
		/**
		 * 跳转页面时做的权限校验，提供在外面的方法,每次跳转页面都会先执行此方法
		 * moduleAlias为项目通用模块配置的别名，moduleFuncName方法里面写校验规则，返回true或者false，避免写异步的代码
		 * 不配默认为：{}
		 */
		checkPermission: {"moduleAlias":"com", "moduleFuncName":"checkPermission"},
		/**
		 * 第一次加载第一个业务模块前所需要的处理，即启动之后提供给外界初始化的接口，
		 * 这个方法中避免写异步操作，或者保证异步影响其他代码逻辑
		 * moduleAlias为项目通用模块配置的别名，moduleFuncName为执行的方法
		 * 这个配置可以做很多事情，当你从业务模块逻辑上不好实现时，可以考虑这里！！
		 * 是否异步，默认为true,为异步
		 */
		firstLoadIntf: {"moduleAlias": "com", "moduleFuncName":"firstLoadFunc","isAsynch": true},
		/**
		 * 项目中需要调用到的常量、变量这里配置，调用方式，通过$.config.global.*来调用
		 * 不配默认为：{}
		 */
		global: {
			//行情地址   http://192.168.11.83:8080
			"HqUrl": "http://trade.sczq.com.cn:8011/market/json",
			//交易RUL
			"serverPathTrade" : "http://122.224.251.235:80/servlet/json",  //首创（110018148  111111）
			//验证码        
			"validateimg" : "http://122.224.251.235:80/servlet/NewImage", 
			"unifyUrl" : "http://218.29.101.51:9902/servlet/json",
			
			"serverPath":"", //统一登陆地址
            "newshareUrl": "",//新股列表
			"logoutTimeNum" : 10,//锁定屏幕设置时间，单位分钟
			"activationTime": 168,//手机激活失效时间，单位小时
//			"hardId": "",//硬盘序列号（硬件id）
//			"activePhone": "",// 手机号码
			"phoneActivation" : false, // 是否启动手机激活
			"channel": "", // 渠道配置
			"typeDigit": [0,1,2,7,9,14,15,17,18,25,26,27,66],//股票类别显示小数位数 0.01的
			"stockType": [],// 交易行情查询股票类型，为空是所有的类型
			"shareCookie": false, // 登录信息是否共享  true 可以多个页面 ，false 只能在一个页面
			"refreshTime": 5000,// 毫秒 五档刷新时间
			"startJSkeyboard": true,// 是否启用js自绘键盘
			"callNative": false,// 是否调用原生插件
			"syncServerTime": 30,// 多久同步一次服务器时间  单位分钟
			"checkTradeTime": 3,// 检查交易时间，是否是交易时间  单位分钟
			"positionRefreshTime": 0,//持仓刷新时间，配置0就不刷新  类型数字，单位毫秒
			"entrust_way" : "5",//委托方式
			"serverConfig":"2"   //柜台选择  1.金证win 2.恒生T2 3.顶点 4.金证mid 5.恒生T1
		},
		/**
		 * Android手机返回键处理，退出应用还是返回上级页面，true-退出应用，false-返回页面，默认为true
		 * 如果需要返回上一级页面，并最终提示退出应用，需要改为false，并且在一级页面的html上设置“data-pageLevel="1"”
		 * 不配默认为：true
		 */
		isDirectExit: false,
		/**
		 * ajax请求超时时间设置，默认为20秒之后超时
		 * 不配默认为：20秒
		 * 
		 */
		ajaxTimeout: {
			time: 30,
			//请求超时处理方法
			ajaxTimeoutFunc: function(xhr, textStatus, errorMessage){
				$.alert('数据超时了');
				
			},
			//断网，跨域或者网络请求错误等
			execErrorFunc: function(xhr, textStatus, errorMessage)
			{
				if(textStatus == 'abort')//跨域或者被主动阻断
			    {
			    	$.alert('服务器错误，或者网络异常!');
			    }else{
			    	$.alert('未知错误,请联系开发人员!');
			    }
				
			}
		},
		/**
		 * 缓存扫描器的扫描间隔时间，单位秒
		 * @time 缓存扫描时间
		 * @cacheFuncNoKey用于缓存功能号保存的key--缓存数据接口会用到
		 * @cacheFuncCallbackKey用于返回参数成功标志位的key--缓存数据接口会用到
		 */
		cacheScanInterval: {
			time:10,
			cacheFuncNoKey:['funcno','funcNo'],
			cacheFuncCallbackKey:['errorNo','error_no']
		},
		/*
		 * 是否启用调试模式，1启用，0不启用
		 * */		 
		isDebug: 0,
		/*
		 * 是否将http请求转发给原生去发送,0是否，1是，默认为否,如果为是需要原生支持
		 * 
		 **/
		isFordHttpReq: 0,
		/**
		 * 是否通过mainfest文件管理版本号
		 * */
		isMainfest:"0",
	};
	var a = require("../globalConfig.js");
	for(var i in a){
		$.config[i] = a[i];
	}
	module.exports = $.config;
});