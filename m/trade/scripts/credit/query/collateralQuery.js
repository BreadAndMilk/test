/**
 * 信用交易-担保品证券
 */
define('trade/scripts/credit/query/collateralQuery.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var	service_credit = require("service_credit");
	var	_pageId = "#credit_query_collateralQuery ";
	var common = require("common");
	var userInfo = null;//保存的客户信息
	var _stockName = "";
	var	VIscroll = require("vIscroll");
	var	vIscroll = {"scroll":null,"_init":false};	//上下滑动
	var _request_num = 30;
	var _upHandle = false;
	var _isData = true;
	
    /**
     * 初始化
     */
	function init(){
		var mianHeight = common.setMainHeight(_pageId, false);
		userInfo = common.getCurUserInfo();
		queryCollateral();//查询数据
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
		//点击查询按钮
		$.bindEvent($(_pageId+" .search_box2 .inner a"),function(){
			$(_pageId + " #remove").remove();
			var stockCode = $(_pageId+" #stockCode").val();
			var vai2=/^[0-9]{6}$/;
			if(vai2.test(stockCode)){
				queryCollateral(stockCode);
			}
			else{
				$.alert("请输入有效的6位数证券代码");
			}
		});
//		//股票代码输入框监听
//		$.bindEvent($(_pageId+"#stockCode"), function(e){
//			$(_pageId+ ".no_data").hide();//隐藏暂无数据
//			var stockCode = $(this).val();
//			var vail=/^[A-Za-z]+$/;
//			var vai2=/^[0-9]{6}$/;
//			if(vai2.test(stockCode)){
//				$(_pageId+"#stock_list").html("");
//				queryCollateral(stockCode);
//			}
//			else if(stockCode.length>1 && vail.test(stockCode)){
//				getStockList(stockCode);
//				if(stockCode.length<2){
//					$(_pageId+"#stock_list").html("");
//				}
//			}else if(stockCode.length>3){
//				getStockList(stockCode);
//				if(stockCode.length<4){
//					$(_pageId+"#stock_list").html("");
//				}
//			}
//			e.stopPropagation();
//		},"input");
		//点击其他地方去掉列表
		$.bindEvent($(_pageId),function(e){
			$(_pageId+"#stock_list").html("");
		});
	}
    /**
	 * 担保品数据查询
	 */
	function queryCollateral(stockCode)
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
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var stock_code = stockCode ? stockCode : "";
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"password":password,
			"sessionid":sessionid,
			"stock_code":stock_code,
			"poststr": poststr,
			"request_num":_request_num
		};
		service_credit.db_query(param,db_queryCallBack);
	}
	/**
	 * 担保品数据调方法
	 * @param {Object} data 返回数据
	 */
	function db_queryCallBack(data)
	{
		if (data) {
			if(data.error_no == 0)
			{  
				var results = data.results;	
				queryMsg = data.results;//将返回的结果集保存
				if(results && results.length > 0){
					$(_pageId+ ".no_data").hide();
					var todayDealHtml = "";
					for(var i = 0;i < results.length; i++){
						var data = results[i];
						todayDealHtml += createHtml(data);
					}
					$(_pageId+" .fund_table tr").last().after(todayDealHtml);
				}else{
					if(!_upHandle){
						$(_pageId+ ".no_data").show();
					}
				}
				if((_upHandle && results.length == 0) ||  results.length == 1){
					$(_pageId+" .visc_wrapper .visc_pullUp").hide();
					_isData = false;
				}
				else{
					$(_pageId+" .visc_wrapper .visc_pullUp").show();
					_isData = true;
				}
				_upHandle = false;
		 	}
			else
			{
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
	 * 
	 * @param {Object} element
	 */
	function createHtml(element)
	{
		var market = element.exchange_type;
		if(market == "0"){
			market = "深A";
		}else if(market == "1")
		{ 
			market ="深B";
		}else if(market == "2")
		{ 
			market ="沪A";
		}else if(market == "3")
		{ 
			market ="沪B";
		}else if(market == "4")
		{ 
			market ="三板";
		}else if(market == "F1")
		{ 
			market ="郑州交易所";
		}else if(market == "F2")
		{ 
			market ="大连交易所";
		}
		var eleHtml = "";
	    eleHtml += "<tr id='remove' poststr='" + element.poststr + "'>";
		eleHtml += "<td>"+element.stock_code+"</td>";
		eleHtml += "<td>"+element.stock_name+"</td>";
		eleHtml += "<td>"+market+"</td>";
		eleHtml += "<td>"+element.assure_ratio+"</td>";
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
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+" .search_box2").outerHeight()- 6 ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						$(_pageId+" .fund_table tbody tr").eq(0).nextAll().remove();
						//查询资产数据
						var stockCode = $(_pageId+" #stockCode").val();
						stockCode = $.trim($(_pageId + "#stockCode").val().substring(0,6));
						queryCollateral(stockCode);
					},
					"upHandle": function() {
//						if(_isData){
//							queryCollateral();
//							_upHandle = true;
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
	 */
	function destroy(){
		_isData = true;
		_upHandle = false;
		$(_pageId+" .fund_table tbody tr").eq(0).nextAll().remove();
        _stockName = "";
		$(_pageId + " #remove").remove();
		$(_pageId + " #stockCode").val("");
		$(_pageId + " #stockName").text("证券名称");
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