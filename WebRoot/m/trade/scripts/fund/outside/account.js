/**
 * 场外基金-基金账户查询
 */
define('trade/scripts/fund/outside/account.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var VIscroll = require("vIscroll");
	var vIscroll = {"scroll":null,"_init":false}; // 上下滑动
	var _pageId = "#fund_outside_account ";
	var service_fund = require("service_fund");
	var userInfo = null;
    /**
     * 初始化
     */
	function init(){
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("fund/outside/order","left");
			e.stopPropagation();
		});
		
		$.bindEvent($(_pageId + ".top_title .right_text"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageInit("fund/outside/account","fund/outside/openAccount",{});
			e.stopPropagation();
		});
		
		userInfo = common.getCurUserInfo();
		custFundQuery();//客户信息查询
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
	}
	
	/**
	 * 查询客户绑定的信息
	 */
	function custFundQuery(){
		$(_pageId + " .fund_account").html("");
		$(_pageId + " .no_data").hide();
		//获取保存在本地的账户信息
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code
		};
		//最后一个为超时处理函数
		service_fund.getCustMsg(param,queryFundCallBack,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
				$(_pageId+ ".no_data").show();
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}
	    });
	}
	/**
	 * 查询客户信息回调
	 */
	function queryFundCallBack(data){
		if (data) {
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results && results.length > 0){
					var html = "";
					for (var i=0;i<results.length;i++){
						html += queryFundHTML(results[i],i);
					}
					$(_pageId+ ".main .fund_account").html(html);
				}else{
					$(_pageId+".no_data").show();
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
		if(!vIscroll._init){
			initVIScroll();
		}else{
			vIscroll.scroll.refresh();
		}
	}
	
	function queryFundHTML(element){
		var eleHtml = "";
		eleHtml += '<div class="part">';
        eleHtml += '<div class="title"><h5><i class="icon"></i>'+element.company_name+'</h5>';
        eleHtml += '<span class="time">开户日期 '+element.open_date+'</span></div><ul>';
        eleHtml += '<li>基金账号<span>'+element.fund_account+'</span></li>';
        eleHtml += '<li>公司代码<span>'+element.fund_company+'</span></li>';
        eleHtml += '<li>账户全名<span>'+element.holder_name+'</span></li>';
        eleHtml += '<li>账户状态<span>'+element.holder_status+'</span></li>';
        eleHtml += '</ul></div>';
        return eleHtml;
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
	}
	
	
	/**
	 * 初始化上下滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
				"isPagingType": false,		//false表示是微博那种累加形式，true表示分页形式
				"visibleHeight": $(window).height() - $(_pageId+".top_title").height() - $("#afui #footer").height() - $(_pageId+".tab_nav").height() - 6  ,//显示内容区域的高度，当isPaingType为false时传
				"container": $(_pageId+" #v_container_funds_jj"),	
				"wrapper":$(_pageId+" #v_wrapper_funds_jj"),	
				"downHandle": function() {				//下拉获取上一页数据方法
					custFundQuery();
				},
				"upHandle": function() {
				},
				"wrapperObj": null
			};
			vIscroll.scroll = new VIscroll(config); 	//初始化，需要做if(!hIscroll._init)判断
			vIscroll._init = true; 						//尽量只初始化一次，保持性能
			
		}else{
			vIscroll.scroll.refresh();
		}
		$(_pageId + ".visc_pullUp").css("display","none");
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
		$(_pageId + " .fund_account").html("");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});