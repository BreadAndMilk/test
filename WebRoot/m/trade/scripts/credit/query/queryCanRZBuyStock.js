/**
 * 信用交易---查询标的证券
 */
define('trade/scripts/credit/query/queryCanRZBuyStock.js', function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var	service_credit = require("service_credit");
	var common = require("common");
	var	financialSecurities = false;
	var	_pageId = "#credit_query_queryCanRZBuyStock ";
	var userInfo = null;//保存的客户信息
	var _request_num = 30;
	var _isData = true;
    var _stockName = "";
	var	VIscroll = require("vIscroll");
	var	vIscroll = {"scroll":null,"_init":false};	//上下滑动
 	var time = null;
 	

	/**
	 * 初始化
	 * */
	function init()
	{   
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		queryData();//查询数据
	}
	
	
	/**
	 * 事件绑定
	 * */
	function bindPageEvent()
	{
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
		//点击查询按钮
		$.bindEvent($(_pageId+" .search_box2 .inner a"),function(){
			$(_pageId + " #remove").remove();
			$(_pageId+" .fund_table tr").eq(0).nextAll().remove();
			var stockCode = $(_pageId+" #stockCode").val();
			var vai2=/^[0-9]{6}$/;
			if(vai2.test(stockCode)){
				queryData(stockCode);
			}
			else{
				$.alert("请输入有效的6位数证券代码");
			}
		});
		//融资，融券切换
		$.bindEvent($(_pageId+" .toggle_nav li"),function(e){
			$(_pageId+" .fund_table tbody tr").eq(0).nextAll().remove();
			$(_pageId + " #remove").remove();
			$(_pageId + " #numRemove").remove();
			$(_pageId + " #stockCode").val("");
			$(this).addClass("active").siblings().removeClass("active");
			financialSecurities = ($(_pageId+" .toggle_nav li").index($(this)) == 1);
			if(financialSecurities){
				$(_pageId+" #changeName").text("融券保证金比例").css("width", "20%");
				$(_pageId + " .fund_table tr").append("<th id= \"numRemove\" scope=\"col\">当前数量</th>");
			}else
			{
				$(_pageId + " #numRemove").remove();
				$(_pageId+" #changeName").text("融资保证金比例").css("width", "inherit");
			}
			
			queryData();
		});
//		//股票代码输入框监听
//		$.bindEvent($(_pageId+"#stockCode"), function(e){
//			$(_pageId+ ".no_data").hide();//隐藏暂无数据
//			var stockCode = $(this).val();
//			var vail=/^[A-Za-z]+$/;
//			var vai2=/^[0-9]{6}$/;
//			if(vai2.test(stockCode)){
//				$(_pageId+"#stock_list").html("");
//				queryData(stockCode);
//			}
////			else if(stockCode.length>1 && vail.test(stockCode)){
////				getStockList(stockCode);
////				if(stockCode.length<2){
////					$(_pageId+"#stock_list").html("");
////				}
////			}else if(stockCode.length>3){
////				getStockList(stockCode);
////				if(stockCode.length<4){
////					$(_pageId+"#stock_list").html("");
////				}
////			}
//			e.stopPropagation();
//		},"input");
		//点击其他地方去掉列表
//		$.bindEvent($(_pageId),function(e){
//			$(_pageId+"#stock_list").html("");
//		});

	}
	/**
	 * 查询数据
	 */
	function queryData(stockCode)
	{
		$(_pageId+" .visc_wrapper .visc_pullUp").show();
		_isData = true;
		var poststr = $(_pageId+" .fund_table tbody tr").last().attr("poststr");
		var vai2=/^[0-9]{6}$/;
		if(stockCode && vai2.test(stockCode)){
			$(_pageId+" .fund_table tbody tr").eq(0).nextAll().remove();
			poststr = "";
		}
		else{
			stockCode = "";
		}
		$(_pageId+ ".no_data").hide();
		$(_pageId+" .ti_table tr").eq(0).nextAll().remove();
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var stock_code = stockCode ? stockCode : "";
		var exchange_type = "";
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"password":password,
			"sessionid":sessionid,
			"stock_code":stock_code,
			"exchange_type":exchange_type,
			"poststr":poststr,
			"request_num":_request_num
		};
		if(financialSecurities){
			service_credit.queryCanBeMargin(param,queryCallBack,{"timeOutFunc":function(){
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}});
		}else{
			service_credit.qualificationInquiry(param,queryCallBack,{"timeOutFunc":function(){
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}});
		}
	}
	/**
	 * 回调方法
	 * @param {Object} data 返回数据
	 */
	function queryCallBack(data)
	{
		if (data) {
			if(data.error_no == 0)
			{
				var results = data.results;	
				queryMsg = data.results;//将返回的结果集保存
				if(results && results.length > 0)
				{
					var dataHtml = "";
					for(i = 0;i < results.length; i++)
					{
						var data = results[i];
						dataHtml += createHtml(data);
					}
					$(_pageId+ ".no_data").hide();
					$(_pageId+" .fund_table tr").last().after(dataHtml);
				}
				else{
					$(_pageId+" .fund_table tr").eq(0).nextAll().remove();
					$(_pageId+ ".no_data").show();
				}
				if(_request_num <= results.length){
					$(_pageId+" .visc_wrapper .visc_pullUp").show();
					_isData = true;
				}
				else
				{
					$(_pageId+" .visc_wrapper .visc_pullUp").hide();
					_isData = false;
				}
			}
			else
			{
				$(_pageId+" .fund_table tr").eq(0).nextAll().remove();
				$.alert(data.error_info);
			}
		}
		if(!vIscroll._init){
			initVIScroll();
		}else{
			vIscroll.scroll.refresh();
		}
	}
	/**
	 * 生成html
	 * @param {Object} element 数据项
	 */
	function createHtml(element)
	{
		var status = "";
		if(element.finance_status == "0"||element.slo_status == "0"){
			status = "正常";
		}else if(element.finance_status == "1"||element.slo_status == "1"){
			status = "暂停";
		}
		if(element.today_enable == "0"){
			enable = "是";
		}else if(element.today_enable == "1"){
			enable = "否";
		}
		
		var eleHtml = "";
		    eleHtml += "<tr id='remove' poststr='"+ element.poststr+"'>";
			eleHtml += "<td>"+element.stock_code+"</td>";
			eleHtml += "<td>"+element.stock_name+"</td>";
			eleHtml += "<td>"+element.exchange_type_name+"</td>";
			if(financialSecurities){
				var slo_ratio = element.bail_ratio || "--";
				eleHtml += "<td>"+slo_ratio+"</td>";
				eleHtml += "<td>"+element.enable_amount+"</td>";
//				eleHtml += "<td>"+status+"</td>";
//				eleHtml += "<td>"+element.enable_amount+"</td>";
			}else{
				eleHtml += "<td>"+element.bail_ratio+"</td>";
//				eleHtml += "<td>"+status+"</td>";
//				eleHtml += "<td>"+""+"</td>";
			}
			
			eleHtml +="</tr>";
		return eleHtml;
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height() - $(_pageId+" .search_box2").outerHeight()- 6 ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						$(_pageId+" .fund_table tbody tr").eq(0).nextAll().remove();
						//查询资产数据
						var stockCode = $(_pageId+" #stockCode").val();
						stockCode = $.trim($(_pageId + "#stockCode").val().substring(0,6));
						queryData(stockCode);
					},
					"upHandle": function() {
//						if(_isData){
//							queryData()
//						}
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
	 * */
	function destroy()
	{
		_isData = true;
	    _stockName = "";
		$(_pageId + " #stockCode").val("");
		$(_pageId + " #stockName").text("证券名称");
		financialSecurities = false;
		$(_pageId + " #numRemove").remove();
		$(_pageId + " #remove").remove();
		$(_pageId+" .fund_table tr").eq(0).nextAll().remove();
		$(_pageId+" .toggle_nav li").eq(0).addClass("active").siblings().removeClass("active");
		$(_pageId+" #changeName").text("融资保证金比例").css("width", "inherit");
	    $(_pageId+" .fund_table tbody tr").eq(0).nextAll().remove();
	    if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});