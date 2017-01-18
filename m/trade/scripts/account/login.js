 /* 
  * 交易登录
 */
define('trade/scripts/account/login.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var _pageId = "#account_login ";
    var topage ="";    // 记录登录后跳转的页面
    var common = require("com");
    var loginPort = null;
    var loginClass = "0";

    /**
     * 初始化
     */
	function init() {
		$.hidePreloader();
		$("div.modal-in").remove();
		$("div.modal-overlay").remove();
		$(_pageId + "#account").val(""); // 华龙311700014065  华安170010779
		$(_pageId + "#password").val("");   // 华龙861026  华安111111
		topage = $.getPageParam("topage"); // 获取登录后跳转的页面
		if(!topage){
			topage = "account/index";
		}
		else if(topage == "account/login"){
			topage = "account/index";
		}
		$(_pageId + " #loginKind ul li").hide();
		if(topage.indexOf("credit/") == 0){
			loginClass = "1";					//标准版上的login_type为1
			$(_pageId + ".top_title h3").text("融资融券登录");
			$(_pageId + ".select_box p").text("融资融券账号登录").attr("id","b");
			$(_pageId + "#account").attr("placeholder","请输入融资融券账号");
			$(_pageId + "#password").attr("placeholder","请输入融资融券密码");
		}
		else if(topage.indexOf("option/") == 0){
			loginClass = "2";
			$(_pageId + ".top_title h3").text("个股期权登录");
			// $(_pageId + ".select_box p").text("个股期权账号登录").attr("id","c");
			$(_pageId + ".select_box p").text("个股期权账号登录").attr("id","25");
			$(_pageId + "#account").attr("placeholder","请输入个股期权账号");
			$(_pageId + "#password").attr("placeholder","请输入个股期权密码");
		}
		else{
			loginClass = "0";
			$(_pageId + ".top_title h3").text("普通交易登录");
			$(_pageId + ".select_box p").text("资金账号登录").attr("id","5");
		}
		$(_pageId + ' #loginKind ul li[type="'+loginClass+'"]').show();
		if(!loginPort){
			 require.async("trade/scripts/account/loginPort.js",function(module){
			 	loginPort = module;
			 	loginPort.into(topage,loginClass);
	         });
		}
		else{
			loginPort.into(topage,loginClass);
		}
		// 判断是跳转到普通交易还是信用交易页面
    }
	
	function load(){
 		var mianHeight = gconfig.appHeight;
		mianHeight = mianHeight - $(_pageId+".header").outerHeight(true)
		$(_pageId + " section.main").height(mianHeight);
		$(_pageId).css("overflow-x","hidden"); // 禁止页面左右滑动
	}

	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
//			$.pageBack("account/index","left");
			$.pageInit("account/login","account/index",{"history":true},"left",true);
			e.stopPropagation();
		});
		// 保存账号按钮
		$.bindEvent($(_pageId + "#saveAcc"), function(e){
			var isChecked = $(this).find("input").attr("checked");
			if(isChecked){
				$(this).find("input").removeAttr("checked");
			}else{
				$.alert("在本机保存账号可能存在一定的风险，请您注意！",function(){
					$(_pageId + "#saveAcc").find("input").attr("checked",true);
				});

			}
			e.stopPropagation();
		});
		// 点击登陆下拉框
		$.bindEvent($(_pageId + "#loginKind"), function(e){
			$(_pageId+" #loginKind ul").slideToggle("fast");
			e.stopPropagation(); // 阻止冒泡
		});
		// 点击登录下拉框选择
		$.bindEvent($(_pageId + "#loginKind ul li"),function(e){
			$(_pageId + "#loginKind p").html($(this).find("a strong").html());
			$(_pageId + "#loginKind p").attr("id",$(this).attr("id"));
			var placeholderText = "请输入"+ $(this).find("a strong").html().substring(0,$(this).find("a strong").html().length-2);
			$(_pageId + "#account").attr("placeholder",placeholderText);
			$(_pageId+" #loginKind ul").slideToggle("fast");
			e.stopPropagation(); // 阻止冒泡
		});
		
		// 绑定点击验证码图形
		$.bindEvent($(_pageId + "#randomImg"),function(e){
			loginPort.getTicketImg();
			e.stopPropagation();
		});	
		
		// 登录
		$.bindEvent($(_pageId + "#login"), function(e){
			// 登录校验
			if(!loginPort.checkInput()){
				return false;
			};
			loginPort.submitLogin();
			e.stopPropagation();
		});
		
	} 
	
	
	/**
	 * 销毁
	 */
	function destroy(){
	    topage =""; // 记录登录后跳转的页面
	    $(_pageId + "#account").val("");
		$(_pageId + "#password").val("");
		$(_pageId + "#ticket").val("");
		$(_pageId + "#account").attr("placeholder","请输入资金账号");
		$(_pageId + "#password").attr("placeholder","请输入交易密码");
		$(_pageId + "#loginKind ul").hide(); // 隐藏下拉选框
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});