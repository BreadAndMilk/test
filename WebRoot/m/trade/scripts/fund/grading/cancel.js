/**
 * 分级基金-撤单
 */
define('trade/scripts/fund/grading/cancel.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var vIscroll = {"scroll":null,"_init":false}; // 上下滑动
	var service_fund = require("service_fund");
    var _pageId = "#fund_grading_cancel ";
    var userInfo = null;
    var stock_code = "";
    var stock_num = "";  
    var stock_direction = "";
    
    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		userInfo = common.getCurUserInfo();
		// 返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
//			$.pageInit("stock/stockCancel","account/index",{});
			$.pageBack();
			e.stopPropagation();
		});
		queryCancellation(); // 可撤单查询
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
	}
    
	/**
	 * 可撤单查询
	 */
	function queryCancellation(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid = userInfo.session_id;
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid
		};
		// 每次查询前,先将暂无数据隐藏
		$(_pageId + ".no_data").hide();
		// 最后一个函数为超时函数,在超时后,显示暂无数据,并且初始化滑动组件
		service_fund.gradingCanWithdraw(param,queryTrustDataCallback,
		{ // 传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){ // 超时调用方法
				$(_pageId+ ".no_data").show();
				initVIScroll();
				if(vIscroll._init){
					vIscroll.scroll.refresh();
				}
	        }
		});
	}
	
	/**
	 * 可撤单查询回调
	 */
	function queryTrustDataCallback(data){
		if (typeof(data) != undefined && typeof(data) != null) {
			$(_pageId + ".main .fund_list2").html("");
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryTrustDataHTML(results[i],i);
					}
					$(_pageId + ".main .fund_list2").html(data);
					$(_pageId+ ".no_data").hide();
					// 撤单事件
					$.bindEvent($(_pageId+".fund_list2 .part"), function(e){
						var $this = $(this);
						var tipStrArray = [];
						tipStrArray.push(["基金代码", $this.find("h5 small").text()]);
						tipStrArray.push(["委托类型 ", $this.find("ul li").eq(0).find("span").text()]);
						tipStrArray.push(["委托份额 ", $this.find("ul li").eq(2).find("span").text()]);
						tipStrArray.push(["委托金额 ", $this.find("ul li").eq(3).find("span").text()]);
						var tipStr = "<div >";
						tipStr += common.generatePrompt(tipStrArray);
						tipStr += "</div>";
						common.iConfirm("确认撤单",tipStr,function(){
							cancellation($this); // 确认撤单
						});
						e.stopPropagation();
					});
				}else{
					$(_pageId + ".no_data").show();
					$(_pageId + ".visc_pullUp").hide();
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
		else{
			  $.alert("查询失败");
		}
		if(!vIscroll._init){
			initVIScroll();
		}else{
			vIscroll.scroll.refresh();
		}
	}
	/**
	 * 可撤单查询HTML生成
	 */
	function queryTrustDataHTML(element){
		var price_digit = 3;
		var css = "";
		var eleHtml = "";
      	eleHtml +='<div class="part" entrust_no="'+element.entrust_no+'" fund_company="'+element.fund_company+'">';
        eleHtml +='<div class="title">';
        eleHtml +='<h5><em>'+element.fund_name+'</em> <small>'+element.fund_code+'</small></h5></div><ul>';
       	eleHtml +='<li>委托类型  <span>'+element.business_name+'</span></li>';
        eleHtml +='<li>委托时间  <span>'+element.entrust_time+'</span></li>';
       	eleHtml +='<li>委托份额  <span>'+Number(element.shares).toFixed(price_digit)+'</span></li>';
        eleHtml +='<li>委托金额 <span>'+Number(element.balance).toFixed(price_digit)+'</span></li>';
        eleHtml +='</ul></div>';
		return eleHtml;
	}

	/**
	 * 确定撤单
	 */
	function cancellation($div){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//
		var cust_code = userInfo.cust_code; // 关联资产账户标志
		var sessionid = userInfo.session_id;
		var batch_flag = "0";
		var entrust_no = $div.attr("entrust_no");
		var fund_code = $div.find("h5 small").text();
		var allot_date = $div.find("ul li").eq(1).text();
		var fund_company = $div.attr("fund_company");
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid":sessionid,
		    "entrust_no":entrust_no,
		    "batch_flag":batch_flag,
		    "fund_code":fund_code,
		    "allot_date":allot_date,
		    "fund_company":fund_company
		};
		service_fund.gradingChechan(param,postCancelOrderCallback);
	}
    //确定撤单回调
	function postCancelOrderCallback(data){
		if (typeof data != "undefined" && data != null) {
			if (data.error_no == 0) {	
				if(typeof data.results[0] != "undefined" && data.results[0] != null ){
					$.alert("撤单成功",function(){
						queryCancellation(); //刷新页面重新加载数据
					});
				}
			}else{  
				$.alert(data.error_info,function(){queryCancellation();});
			}
		}else{
			$.alert("撤单失败",function(){queryCancellation();});
		}
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
					queryCancellation();
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
	    stock_code = "";
	    stock_num = "";  
	    stock_direction = "";
		$(_pageId + ".main .fund_list2").html("");
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("stock/stockCancel","account/index",{});
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