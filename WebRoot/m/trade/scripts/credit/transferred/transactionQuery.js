/**
 * 担保品划转查询
 */
define('trade/scripts/credit/transferred/transactionQuery.js', function(require, exports, module) {
    var _pageId = "#credit_transferred_transactionQuery ";
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
	var service_credit = require("service_credit");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var commonFunc = require("commonFunc");
    var userInfo = null;
    /**
     * 初始化
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		commonFunc.initTimeChoice(_pageId,7);
		queryTransNsg();//查询担保品划转数据
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("credit/transferred/collateralTransfer","left");
//			$.pageBack();
			e.stopPropagation();
		});
		//时间按钮
		$.bindEvent($(_pageId + ".top_title .icon_nav"), function(e){
			$(_pageId + ".top_title .top_nav").slideToggle("fast");
			e.stopPropagation();
		});
		//时间选择
		$.bindEvent($(_pageId + ".date_filter .btn"), function(e){
			if(vIscroll._init){
				vIscroll.scroll.destroy();
				vIscroll.scroll = null;
				vIscroll._init = false;
			}
			queryTransNsg();
		});
		//点击其他位置，隐藏下拉框
		$.bindEvent($(_pageId + ".main"),function(){
			if($(_pageId + ".top_title .top_nav").is(':visible')){
				$(_pageId + ".top_title .top_nav").slideToggle("fast");
			}
		});
	}
   	
   	/**
   	 * 查询非交易过户数据
   	 */
   	function queryTransNsg(){
   		$(_pageId+".search_list").html("");
   		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var end_time = $(_pageId+" #endDate").text();  
		var begin_time = $(_pageId+" #startDate").text();	//截止时间
		var param={				
			"entrust_way":entrust_way,
		    "branch_no":branch_no,
		    "fund_account":fund_account,
		    "cust_code":cust_code,
		    "sessionid：":sessionid,
		    "password":password,
		    "begin_time":begin_time,
		    "end_time":end_time
		};
		$(_pageId+ ".no_data").hide();
		service_credit.queryGhHistory(param,queryDealCallback,
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
	 * 成交查询回调
	 */
	function queryDealCallback(data){
		if (typeof(data) != "undefined" && data != null) {
			$(_pageId+" .tarde_hit").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results != "undefined" && results.length>0){
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryDealHTML(results[i]);
					}
					$(_pageId+".search_list").html(data);
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
	 * 成交查询HTML生成
	 */
	function queryDealHTML(element){
		var css = "";
		if(element.entrust_type == "0"){
			css = "ared";
		}else if(element.entrust_type == "1"){
			css = "agreen";
		}
        var eleHtml = "";
        eleHtml+="<div class=\"part\">";
        eleHtml+="<span class=\"time\">"+element.entrust_date+"&nbsp"+element.entrust_time+"</span>";
        eleHtml+="<h5 class=\""+css+"\">"+element.entrust_type_name+"</h5>";
        eleHtml+="<dl class=\"clearfix\">";
        eleHtml+="	<dt style=\"padding:3px 0 3px 0\"><strong  style=\"font-family: serif;\">"+element.stock_name+" <small>"+element.stock_code+"</small></strong></dt>";
        eleHtml+="    <dd><em>编&#160;&#160;&#160;号</em>"+element.report_no+"</dd>";
        eleHtml+="    <dd><em>委托数量</em>"+element.entrust_amount+"</dd>";
        eleHtml+="    <dd><em>金&#160;&#160;&#160;额</em>"+Number(element.business_balance).toFixed(3)+"</dd>";
        eleHtml+="    <dd><em>成交价格</em>"+Number(element.business_price).toFixed(3)+"</dd>";
        eleHtml+="    <dd><em>成交数量</em>"+element.business_amount+"</dd>";
//      eleHtml+="    <dd><em>成交编号</em>"+element.entrust_no+"</dd>";
//      eleHtml+="    <dd><em>委托编号</em>"+element.entrust_no+"</dd>";
        eleHtml+="    <dd><em>股东代码</em>"+element.stock_account+"</dd>";
//      eleHtml+="    <dd><em>买卖标志</em>"+element.entrust_bs+"</dd>";
//      eleHtml+="    <dd><em>委托类别</em>"+element.entrust_type_name+"</dd>";
        eleHtml+="    <dd><em>状态说明</em>"+element.entrust_state_name+"</dd>";
        eleHtml+="</dl>";
        eleHtml+="</div>";
        return eleHtml;
       
	}
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".tab_nav").height()- $(_pageId+".date_filter").height() - 6 ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						queryTransNsg();//下拉获取上一页数据方法
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
		$(_pageId+".search_list").html("");
		$(_pageId + ".top_title .top_nav").hide();
		$(_pageId+".no_data").hide();
		$(_pageId + " .top_title small").text("一周内");	
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageBack();
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});