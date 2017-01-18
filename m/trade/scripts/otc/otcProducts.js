/**
 * OTC-产品列表
 */
define(function(require, exports, module) {
	
	var common = require("common");
	
	var gconfig = $.config;
	var global = gconfig.global;
	var service_otc = require("service_otc");
    var _pageId = "#otc_otcProducts ";
    var userInfo = null;

    /**
     * 初始化
     */
	function init(){
		$(_pageId+".main").css("overflow-y","auto");
		var height_list = $(window).height() - $(_pageId+".header").height() - $(_pageId+" .tab_nav").height();
		$(_pageId + ".main").height(height_list);
		userInfo = common.getCurUserInfo();
		common.bindStockEvent(_pageId); //绑定头部菜单事件
		queryProducts();
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("otc/otcProducts","account/index",{});
		});
	
	}
	
	/**
	 * 查询产品列表
	 */
	function queryProducts(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	//分支机构
		var cust_code = userInfo.cust_code;	//客户代码
		var fund_account = userInfo.fund_account;	//资产账户
		var param = {
				"entrust_way" : entrust_way,
				"branch_no" : branch_no,
				"cust_code" : cust_code,
				"fund_account" : fund_account,
				"op_station" : "pc|192.168.1.55| | | "
		};
		service_otc.getProductList(param,function(data){
			if(typeof data != "undefined" && data != null) {
				if(data.error_no == 0){
					var results = data.results;	
					if(results && results.length>0){
						var data ="";
						for (var i=0;i<results.length;i++){
							data += queryProductHTML(results[i]);
						}
						$(_pageId+".otc_list").html(data);
						$.bindEvent($(_pageId+".otc_list .otc_list_box"), function(e){
							var prod_code = $(this).attr("data-prod_code");
							var prod_type = $(this).attr("data-prod_type");
							var param = {
								prod_code: prod_code,
								prod_type: prod_type,
								prod_source:"2"
							};
							$.pageInit("otc/otcProducts", "otc/otcProStates", param);
							e.stopPropagation();
						},"click");
					}else{
						$(_pageId+ ".no_data").show();
					    //$.alert("暂无产品");
					}
					
				}else{
					  $.alert("查询失败");
				}
			}
	    });
	}
	
	/**
	 * 委托查询HTML生成
	 */
	function queryProductHTML(element){
		
        var eleHtml = "";
	        eleHtml+="<div class=\"otc_list_box mt10 clearfix\" data-prod_code="+element.prod_code +" data-prod_type="+ element.prod_type +">";
	        eleHtml+="<div class=\"otc_list_left\">";
	        eleHtml+="    <h3><span>"+parseFloat(element.unitnetassets).toFixed(3)+"</span>%</h3>";
	        eleHtml+="     <p>约定年化收益率</p>";
	        eleHtml+="    <var>"+element.prod_status_name+"</var>";
	        eleHtml+="  </div>";
	        eleHtml+=" <dl class=\"otc_list_right\">";
	        eleHtml+="     <dt>"+element.inst_fname+"</dt>";
	        eleHtml+="      <dd>";
	        eleHtml+="        <h4>起购金额</h4>";
	        eleHtml+="        <p>"+parseFloat(element.min_share).toFixed(2)/10000+"万元"+"</p>";
	        eleHtml+="          <h4>销售时间</h4>";
	        eleHtml+="         <p>"+element.default_date+"</p>";
	        eleHtml+="     </dd>";
	        eleHtml+="     <dd>";
	        eleHtml+="          <h4>剩余额度</h4>";
	        eleHtml+="          <p>"+parseFloat(element.surplus_share).toFixed(2)/10000+"万元"+"</p>";
	        eleHtml+="        <h4>剩余人数</h4>";
	        eleHtml+="        <p>"+element.surplus_count+"</p>";
	        eleHtml+="     </dd>";
	        eleHtml+=" </dl>";
	        eleHtml+=" </div>";

        return eleHtml;
        
//		if(prod_type=="1" || prod_type=="0" || prod_type =="5" || prod_type =="6"){
//			 info += '<div class="product_item"><h2 class="titl" ><a href="javascript:void(0)" data-prod_code="' + prod_code + '"  data-prod_type="' + prod_type +'">'+inst_fname;
//		     info +='('+prod_code+')</a></h2><div class="cont"><div class="rate"><h2 style="margin-top:10px;">'+Number(unitnetassets).toFixed(2);
//		     info += '<em>%</em></h2><p>约定年化收益率</p></div><div class="money"><p><strong>起购金额(元)</strong>'+min_share;
//		     info +='万</p><p><strong>剩余额度(元)</strong>'+surplus_share;
//		     info +='万</p><p><strong>销售时间</strong>'+default_date;
//		     info +='</p><p><strong>产品状态</strong>'+prod_status_name;
//		     info +='</p><p><strong>剩余人数</strong>'+surplus_count;
//		     info +='</p></div></div></div>';
//		}else if(prod_type=="2" || prod_type =="3" || prod_type =="4" ){
//			info += '<div class="product_item"><h2 class="titl"><a href="javascript:void(0)" data-prod_code="' + prod_code + '"  data-prod_type="' + prod_type +'">'+inst_fname;
//		     info +='('+prod_code+')</a></h2><div class="cont"><div class="rate" style="height: 75px;"><h2>'+Number(unitnetassets).toFixed(2);
//		     info += '<em>%</em></h2><p>七日年化收益率</p></div><div class="money"><p><strong>起购金额(元)</strong>'+min_share;
//		     info +='万</p><p><strong>销售时间</strong>'+default_date+'</p><p><strong>产品状态</strong>'+prod_status_name;
//		     info +='</p></div></div></div>';
//		}else if(prod_type=="7"){
//			 info += '<div class="product_item"><h2 class="titl" ><a href="javascript:void(0)" data-prod_code="' + prod_code + '"  data-prod_type="' + prod_type +'">'+inst_fname;
//		     info +='('+prod_code+')</a></h2><div class="cont"><div class="rate"><h2 style="margin-top:25px;">'+is_break;
//		     info += '</h2></div><div class="money"><p><strong>起购金额(元)</strong>'+min_share;
//		     info +='万</p><p><strong>募集额度(元)</strong>'+collect_limit;
//		     info +='万</p><p><strong>销售开始日</strong>'+default_date;
//		     info +='</p><p><strong>销售结束日</strong>'+buy_end_date;
//		     info +='</p><p><strong>募集状态</strong>'+prod_status_name;
//		     info +='</p></div></div></div>';
//		}
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