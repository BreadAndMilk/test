/**
 * OTC撤单
 */
define(function(require, exports, module) {
	
	var common = require("common");
	
	var gconfig = $.config;
	var global = gconfig.global;
	var service_otc = require("service_otc");
    var _pageId = "#otc_otcCancel ";
    var userInfo = null;
    var trans_acct = ""; //交易账号
    var app_sno = ""; //申请编号
    var app_date = ""; //申请日期
    var type = ""; //1表示普通撤单，2表示预约撤单

    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		common.bindStockEvent(_pageId); //绑定头部菜单事件
		queryCancellation(); //可撤单查询
    }
	/**
	 * 可撤单查询
	 */
	function queryCancellation()
	{
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
	    var param = {
	    		"entrust_way" : entrust_way,
	    		"branch_no" : branch_no,
	    		"fund_account" : fund_account,
	    		"cust_code" : cust_code,
	    		"op_station" : "pc|192.168.1.55| | | "
	    };
	    service_otc.queryCancelData(param,queryCancelDataCallBack);
	}
	function queryCancelDataCallBack(data)
	{
		if (typeof(data) != undefined && typeof(data) != null)
		{
			$(_pageId+".cancel_order").html("");
			if(data.error_no == 0)
			{
				var results = data.results;
				if(results && results.length>0)
				{
					var data = "";
					for (var i=0;i<results.length;i++){
						data += queryTrustDataHTML(results[i]);
					}
					$(_pageId+".cancel_order").html(data);
					
					//撤单事件
					$.bindEvent($(_pageId+".cancel_order .part"), function(e){
						app_sno = $(this).attr("data-id");  //申请编号
					    trans_acct = $(this).find(".value a").attr("data-id");//交易账号
					    type = $(this).find(".value").attr("data-type");//交易账号
					    app_date  = $(this).find("ul li:eq(2) span").html();//交易账号
					  
						isCancellation($(this));
						e.stopPropagation();
					},"click");
					
				}
				else{
					$(_pageId+ ".no_data").show();
				}
			}
			else{
				$.alert(data.error_info);
			}
		}else
		{
			  $.alert("查询失败");
		}
		
	}
	
	
	function queryTrustDataHTML(element)
	{
		var css = "";
		var otcName= "";
		if(element.trd_id == "110"){
			css = "ared";
			otcName ="认购";
		}else if(element.trd_id == "111"){
			css = "agreen";
			otcName ="申购";
		}
		
		var eleHtml = "";
        eleHtml+="<div class=\"part\" data-id="+element.app_sno+">";  //申请编号
        eleHtml+="<div class=\"title\"><span class=\""+css+"\">"+otcName+"</span><p></p><small>"+element.inst_code+"</small></div>";
        eleHtml+="<div class=\"value\" data-type="+element.type+">";
        eleHtml+="<a href=\"javascript:void(0)\" id=\"cancel\" data-id="+element.trans_acct+">撤单</a>"; //交易账号
        eleHtml+="<span class=\"time\" style=\"color: #333333;\">"+element.inst_sname+"</span>";
        eleHtml+="<ul>";
        eleHtml+="<li>委托金额 <span>"+Number(element.ord_amt).toFixed(3)+"</span></li>";
        eleHtml+="<li>交易数量 <span>"+element.trd_qty+"</span></li>";
        eleHtml+="<li>申请日期 <span>"+element.app_date+"</span></li>";
        eleHtml+="<li>委托状态 <span>"+element.ord_stat_name+"</span></li>";
        eleHtml+="</ul></div></div>";
        return eleHtml;
		
	}
	
	/**
	 * 确定撤单弹出层
	 */
	function isCancellation(dom){
		$(_pageId+".backdrop").show();
		$(_pageId+".pop_box").show();
		$(_pageId+".pop_box .pop_main ul li:eq(0) em").text(dom.find("p").text());
		$(_pageId+".pop_box .pop_main ul li:eq(0) strong").text(dom.find("small").text());
		$(_pageId+".pop_box .pop_main ul li:eq(1) em").text(dom.find("span").eq(0).text());
		$(_pageId+".pop_box .pop_main ul li:eq(2) strong").text(dom.find("li:eq(0) span").text());
		$(_pageId+".pop_box .pop_main ul li:eq(3) strong").text(dom.find("li:eq(1) span").text());
		$(_pageId+".pop_box .pop_main ul li:eq(4) strong").text(dom.find("li:eq(3) span").text());
	}
	
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("otc/otcCancel","account/index",{});
		});
		
		//撤单取消
		$.bindEvent($(_pageId + ".pop_footer .pop_btn a:eq(1)"), function(e){
			$(_pageId+".backdrop").hide();
			$(_pageId+".pop_box").hide();
		});
		//撤单确认
		$.bindEvent($(_pageId + ".pop_footer .pop_btn a:eq(0)"), function(e){
			$(_pageId+".backdrop").hide();
			$(_pageId+".pop_box").hide();
			Cancellation();//撤单提交
		});
	}
	/**
	 * 确定撤单
	 */
	function Cancellation()
	{
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
        var param = {
        		"entrust_way" : entrust_way,
        		"branch_no" : branch_no,
        		"fund_account" : fund_account,
        		"cust_code" : cust_code,
        		"op_station" : "pc|192.168.1.55| | | ",
        		"trans_acct" : trans_acct,    //交易账号
        	    "ori_app_sno" : app_sno,         //申请编号
        	    "ori_app_date" : app_date,     //申请日期
        	    "type" : type                     //1表示普通撤单，2表示预约撤单
        };
        service_otc.subCancel(param,subCancelCallBack);
	}
	
	function subCancelCallBack(data)
	{
		if (typeof data != "undefined" && data != null) {
			if (data.error_no == 0) {	
				if(typeof data.results[0] != "undefined" && data.results[0] != null ){
					$.alert("撤单成功");
					queryCancellation();//刷新页面重新加载数据
				}
			}
			else{  
				$.alert(data.error_info);
				
			}
		}
		else{
			$.alert("撤单失败");
		}
		
	}

	
	/**
	 * 销毁
	 */
	function destroy(){

	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});