/**
 * 新股-中签查询
 */
define('trade/scripts/shares/theCurrentSuccess.js',function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var service_stock = require("service_stock");
	var common = require("common");
	var VIscroll = require("vIscroll");
	var vIscroll = {"scroll":null,"_init":false};		//上下滑动
	var isShowWait = true;
	var _pageId = "#shares_theCurrentSuccess ";
	var userInfo =null;
	var whichPage ="";
	var witchAccount = "";
	
    /**
     * 初始化
     */
	function init() {
		userInfo = common.getCurUserInfo();
		queryAchiveData(); //中签查询
    }
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("account/index","left");
			e.stopPropagation();
		});
		
	}
    
	/***
	 * 查询中签数据
	 */
	function queryAchiveData(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "stock_account":"",
		    "account_type":witchAccount
		};
		$(_pageId+ ".no_data").hide();
		service_stock.theCurrentSuccess(param,querySuccessDataCallBack,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":isShowWait,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
				$(_pageId+ ".no_data").show();
				initVIScroll();
				if(vIscroll._init){
					vIscroll.scroll.refresh();
				}
	        }
		});
	}
	/**
	 * 查询自选股数据回调方法
	 */
	function querySuccessDataCallBack(data)	{
		if (typeof data != "undefined" && data != null) {
			if(data.error_no == 0){
				if(typeof data.results != "undefined" && data.results!= null && data.results != ""){
					var results = data.results;	
					var dataHtml = "";
					for(var i = 0;i < results.length; i++){
						var data = results[i];
						dataHtml += createHtml(data);
					}
					$(_pageId+".seach_list2").html(dataHtml);
					$(_pageId+ ".no_data").hide();
				}else{
					$(_pageId+ ".no_data").show();
				}
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
				isShowWait = false;
			}
			else{
				  $.alert(data.error_info);
			}
		}
	}
	/**
	 * 生成html
	 * @param {Object} element 数据项
	 */
	function createHtml(element){
		var ipo_info_status = {"0":"认购资金不足额","1":"认购资金足额","2":"未处理状态"};
		var eleHtml =  "";
		eleHtml += '<div class="part">';
        eleHtml += '<div class="title"><span class="time">'+element.init_date+'</span>';
        eleHtml += "<h5>"+element.stock_name+"<small>"+element.stock_code+"</small></h5></div><ul>";
        eleHtml += "<li>中签数量<span>"+Number(element.ipo_lucky_amount)+"</span></li>";
        eleHtml += "<li>中签金额<span>"+Number(element.lucky_balance).toFixed(2)+"</span></li>";
        eleHtml += "<li>中签价格<span>"+Number(element.issue_price).toFixed(2)+"</span></li>";
        eleHtml += "<li>中签缺口金额<span>"+Number(element.ipo_short_balance).toFixed(2)+"</span></li>";
        eleHtml += "<li>认购状态<span>"+ipo_info_status[element.ipo_info_status]+"</span></li>";
        eleHtml += "<li>股东账号<span>"+element.stock_account+"</span></li>";
        eleHtml += "<li style='width: 100%'>备注<span>"+element.remark+"</span></li>";
        eleHtml += "</ul></div>";
	    return eleHtml;
	}
	/**
	 * 初始化上下滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
				"isPagingType": false,		//false表示是微博那种累加形式，true表示分页形式
				"visibleHeight": $(window).height()  - $(_pageId+".top_title").height()- $(_pageId+".tab_nav").height() - $(_pageId+".date_filter").height() - 6  ,		//显示内容区域的高度，当isPaingType为false时传
				"container": $(_pageId+" #v_container_funds_jj"),	
				"wrapper":$(_pageId+" #v_wrapper_funds_jj"),	
				"downHandle": function() {				//下拉获取上一页数据方法
					queryAchiveData();
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
	 * 销毁
	 */
	function destroy(){
		$(_pageId+".seach_list2").html("");
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageBack("account/index","left");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});