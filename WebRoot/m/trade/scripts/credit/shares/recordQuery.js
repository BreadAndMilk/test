/**
 * 新股申购-申购记录查询
 */
define('trade/scripts/credit/shares/recordQuery.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config;
	var commonFunc = require("commonFunc");
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var service_stock = require("service_stock");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var _pageId = "#credit_shares_recordQuery ";
    var userInfo =  null;
    	
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		statementQuery();
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
//			$.pageInit("stock/statementQuery","stock/stockQuery",{});
			$.pageBack("shares/more","left");
			e.stopPropagation();
		});
		//时间选择
		$.bindEvent($(_pageId + ".date_filter .btn"), function(e){
		 	if(vIscroll._init){
				vIscroll.scroll.destroy();
				vIscroll.scroll = null;
				vIscroll._init = false;
			}
			statementQuery();
		});
	}
	
	/**
	 * 对账单查询
	 */
	function statementQuery(){
		$(_pageId+ ".no_data").hide();
		$(_pageId+".state_list ").html("");
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var business_flag = "";
		var money_type = "";
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"sessionid":sessionid,
			"money_type":money_type,
			"begin_date" : begin_time,
			"end_date" : end_time,
			"business_flag" : business_flag
		};
		$(_pageId+ ".no_data").hide();
		service_stock.queryStatementOfAccount(param,queryStatementOfAccountCallback,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){
				$(_pageId+ ".no_data").show();
				initVIScroll();
				if(vIscroll._init){
					vIscroll.scroll.refresh();
				}
			}
		});
	}
	/**
	 * 对账单查询回调
	 */
	function queryStatementOfAccountCallback(data){
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".state_list ").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryEntrustHTML(results[i]);
					}
					$(_pageId+".state_list ").html(data);
				}else{
					$(_pageId+".no_data").show();
				}
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
		else{
			  $.alert("查询失败");
		}
	}
	
	/**
	 * 委托查询HTML生成
	 */
	function queryEntrustHTML(element){
		var price_digit = 3;
		var css = "";
		var business_name = element.business_name;
		if(business_name == "委托买入"){
			css = "n1";
		}else if(business_name == "委托卖出"){
			css = "n2";
		}
		else{
			css = "";
		}
        var eleHtml = "";
        eleHtml+='<div class="part"><div class="title">';
        eleHtml+='<span class="tag '+css+'">'+business_name+'</span><small>'+element.business_date+'</small>';
        eleHtml+='</div><ul>';
        eleHtml+='<li>成交均价<span>'+Number(element.business_price).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>成交数量<span>'+Number(element.matchqty)+'</span></li>';
        eleHtml+='<li>成交金额<span>'+Number(element.matchamt).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>资金余额<span>'+Number(element.fundbal).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>发生金额<span>'+Number(element.occur_balance).toFixed(price_digit)+'</span></li>';
        eleHtml+='<li>股份余额<span>'+Number(element.stkbal).toFixed(price_digit)+'</span></li>';
        eleHtml+='</ul></div>';
        return eleHtml;
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".date_filter").height()- 6  ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						statementQuery();//下拉获取上一页数据方法
					},
					"upHandle": function() {	
						//上拉获取下一页数据方法
					},
					"wrapperObj": null
			};
			vIscroll.scroll = new VIscroll(config); 	//初始化，需要做if(!hIscroll._init)判断
			vIscroll._init = true;
		} else {
			vIscroll.scroll.refresh();
		}
		$(_pageId+ " .visc_pullUp").hide();
	}
    
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId+" .state_list").html("");
		$(_pageId + ".top_title .top_nav").hide();
		$(_pageId + " .top_title small").text("一周内");	
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