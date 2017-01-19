/**
 * 场外基金-分红设置
 */
define('trade/scripts/fund/outside/bonus.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var _pageId = "#fund_outside_bonus ";
	var service_fund = require("service_fund");
	var VIscroll = require("vIscroll");
	var vIscroll = {"scroll":null,"_init":false}; // 上下滑动
	var userInfo =null;
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
		userInfo = common.getCurUserInfo();
		queryFundStock();
    }
		
	function load(){
		var mainHeight =  common.setMainHeight(_pageId, false);
	}
	
	/**
	 * 查询客户基金持仓
	 */
	function queryFundStock(){
		$(_pageId+ ".no_data").hide();
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
		service_fund.queryFundData(param,queryFundStockCallBack,
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
	
	function queryFundStockCallBack(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					var html = "";
					for (var i=0;i<results.length;i++){
						html += queryFundStockHTML(results[i]);
					}
					$(_pageId + ".fund_bonus").html(html);
					$(_pageId+".no_data").hide();
					$.bindEvent($(_pageId + ".fund_bonus .part .type_box dd"), function(e){
						$(this).siblings().find("span").removeClass("active");
						$(this).find("span").addClass("active");
						var fund_company = $(this).parent("dl").attr("fund_company");
						var fund_code = $(this).parent("dl").attr("fund_code");
						var mode = "0";
						if($(this).find("span").text() == "现金分红"){
							mode = "1";
						}
						bonusModeSetting(mode,fund_code,fund_company);
						e.stopPropagation();
					});
				}else{
					$(_pageId + ".no_data").show();
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
	
	function queryFundStockHTML(element){
		var price_digit = 3;
		var css = "";
		if(element.income_balance > 0){
			css = "ared";
		}else if(element.income_balance < 0){
			css = "agreen";
		}else{
			css = "";
		}
		var eleHtml = "";
		eleHtml += '<div class="part">';
        eleHtml += '<div class="title"><h5>'+element.fund_name+' <small>'+element.fund_code+'</small></h5>';
        eleHtml += '<span class="stat">正常</span></div><ul>';
        eleHtml += '<li><span>最新净值</span><strong class="'+css+'">'+Number(element.nav)+'</strong></li>';
        eleHtml += '<li><span>基金市值</span><strong class="'+css+'">'+Number(element.market_value)+'</strong></li>';
        eleHtml += '<li><span>持有份额</span><strong>'+Number(element.enable_shares)+'</strong></li>';
        eleHtml += '</ul><div class="type_box"><dl fund_code="'+element.fund_code+'" fund_company="'+element.fund_company+'">';
        eleHtml += '<dt>分红方式：</dt>';
		if(element.dividendmethod == "0"){
			eleHtml += '<dd><span>现金分红</span></dd>';
       		eleHtml += '<dd><span class="active">红利转投</span></dd>';
		}
		else{
	        eleHtml += '<dd><span class="active">现金分红</span></dd>';
	        eleHtml += '<dd><span>红利转投</span></dd>';
		}
        eleHtml += '</dl></div></div>';
        return eleHtml;
	}
	
	function bonusModeSetting(mode,fund_code,fund_company){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var fund_company = fund_company || "";
		var fund_code = fund_code;
		var dividendmethod = mode;
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "fund_company":fund_company,
		 		"fund_code":fund_code,
		 		"dividendmethod":dividendmethod
		};
		//最后一个为超时处理函数
		service_fund.bonusModeSetting(param,bonusModeSettingCallBack,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":false,
			"isShowOverLay":false,
	    });
	}
	
	function bonusModeSettingCallBack(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
				}else{
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
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
					queryFundStock();
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
		$(_pageId + ".fund_bonus").html("");
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});