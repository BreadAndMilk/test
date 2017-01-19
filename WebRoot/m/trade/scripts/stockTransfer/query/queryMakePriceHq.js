/**
 * 股份转让-定价申报行情查询
 */
define('trade/scripts/stockTransfer/query/queryMakePriceHq.js',function(require, exports, module) {
	var common = require("common");
	var keyboard = require("keyboard");
    var _pageId = "#stockTransfer_query_queryMakePriceHq ";
	var _query_type="";
	var _stock_code="";

    /**
     * 初始化
     */
	function init(){
		common.setMainHeight(_pageId, false);
		if(keyboard){
			keyboard.keyInit();
		}
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + "#query_page .top_title .icon_back"), function(e){
			$.pageInit("stockTransfer/query/queryMakePriceHq","stockTransfer/query/query",{},true);
			e.stopPropagation();
		});
		$.bindEvent($(_pageId + "#result_page .top_title .icon_back"), function(e){
			$(_pageId+".fund_table").html("");
			$(_pageId+"#query_page").show();
			$(_pageId+"#result_page").hide();
			e.stopPropagation();
		});
		//类别选择
		$.bindEvent($(_pageId+".toggle_nav ul li"),function (e) {
			$(this).addClass("active");
			$(this).siblings().removeClass();
			_query_type=$(this).find("a").attr("query-type");
			e.stopPropagation();
		});
		//查询按钮绑定事件
		$.bindEvent($(_pageId+"#query_button"),function (e) {
			//验证股票代码的正确性
			var regex=/^[0-9]{6}$/;
			_stock_code=$(_pageId+"#stockCode").val();
			if(!regex.test(_stock_code)){
				$.alert("输入的股票代码不正确");
				return;
			}
			$(_pageId+"#query_page").hide();
			$(_pageId+"#result_page").show();
			queryHqInfo();
			e.stopPropagation();
		})
		//股票输入
		$.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
			if(keyboard){
				keyboard.popUpKeyboard($(this),e);
			}
			e.stopPropagation();
		},"input");
	}
	
	function load(){
	}

	/**
	 * 查询
	 *
	 */
	function queryHqInfo() {
		var entrust_way= global.entrust_way;
		var branch_no = userInfo.branch_no;
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;
		var sessionid=userInfo.session_id;
		var stock_code=_stock_code;
		var query_type=_query_type;
		var param={
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"sessionid":sessionid,
			"stock_code":stock_code,
			"query-type":query_type
		};
		$(_pageId+ ".no_data").hide();
		service_stockTransfer.queryTodayEntrust(param,queryQhCallBack,
			{
				"isLastReq":true,
				"isShowWait":true,
				"isShowOverLay":false
			});
	}

	function queryQhCallBack(data) {
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".main .fund_table").html("");
			if(data.error_no == 0){
				$(_pageId+".no_data").hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var html="<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"ce_table\">";
					html+="<tr><th scope=\"col\">证券/市值</th><th scope=\"col\">买卖类别</th><th scope=\"col\">数量/价格</th><th scope=\"col\">约定号/席位号</th></tr>";
					for (var i=0;i<results.length;i++){
						html += queryHTML(results[i]);
					}
					html+="</table>";
					$(_pageId+ ".main .fund_table").html(html);
					$(_pageId+ ".no_data").hide();
				}else{
					$(_pageId+".no_data").show();
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

	function queryHTML(element) {
		var html="";
		html+="<tr>";
		html+="<td><strong>"+element.stock_name+"</strong><small>"+element.market_asset+"</small></td>";
		html+="<td>"+element.entrust_name+"</td>";
		html+="<td>"+element.entrust_amount+"<br />"+element.entrust_price+"</td>";
		html+="<td>"+element.appoint_code+"<br />"+element.seat+"</td>";
		return html;
	}

	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId+"#stockCode").quzhi("");
		if(keyboard){
			keyboard.keyDestroy();
		}
		$(_pageId+"#query_page").show();
		$(_pageId+"#result_page").hide();
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("stockTransfer/query/queryMakePriceHq","stockTransfer/query/query",{});
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