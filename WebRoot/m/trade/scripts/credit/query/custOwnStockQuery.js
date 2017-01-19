/**
 * 信用交易-股份持仓查询
 */
define('trade/scripts/credit/query/custOwnStockQuery.js', function(require,exports,module){
	var gconfig = $.config;
	var global = gconfig.global;
	var VIscroll = require("vIscroll");
    var vIscroll = {"scroll":null,"_init":false};	
	var	service_credit = require("service_credit");
	var	_pageId = "#credit_query_custOwnStockQuery ";
	var userInfo = null;//保存的客户信息
	var common = require("common");
	/**
	 * 初始化
	 * */
	function init(){
		userInfo = common.getCurUserInfo();
	}
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		queryPosition();//查询持仓
	}
	/**
	 * 事件绑定
	 * */
	function bindPageEvent(){
		//后退
		$.bindEvent($(_pageId+" .top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
	}
	
	function queryPosition(){
			$(_pageId+".fund_table .ce_table").html("");
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置 
			var branch_no = userInfo.branch_no;	
			var fund_account = userInfo.fund_account;
			var cust_code = userInfo.cust_code;//关联资产账户标志
			var sessionid = userInfo.session_id;
			var password = userInfo.password;
			var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "password":password,
			    "sessionid":sessionid
			};
			service_credit.cc_query(param,function(data){
				if (data && data != "undefined") {
					if(data.error_no == 0){
						var results = data.results;
						if(results && results.length>0){
							var total_cost_balance = 0;//持仓数量X持仓成本
							var total_last_price = 0; //持仓数量X最新价
							var data = "<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>";
							var float_yk = 0; //浮动盈亏
							for (var i=0;i<results.length;i++){ 
								 float_yk += Number(results[i].float_yk);//计数总浮动盈亏
								 total_cost_balance += Number(results[i].cost_amount)*Number(results[i].cost_price);
								 total_last_price += Number(results[i].cost_amount)*Number(results[i].last_price);
								 data += queryPositionHTML_stock(results[i]);
							}
							$(_pageId+".fund_table .ce_table").html(data);
							$(_pageId+".no_data").hide();
							
						}else{ 
							$(_pageId+".fund_table .ce_table").html("<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>");
							$(_pageId+".no_data").show();
						}
					}else{
						$(_pageId+".fund_table .ce_table").html("<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>");
						$(_pageId+".no_data").show();
						$.alert(data.error_info);
					}
				}else{
					$(_pageId+".fund_table .ce_table").html("<tr><th scope=\"col\">证券/市值</th> <th scope=\"col\">盈亏</th><th scope=\"col\">持仓/可用</th><th scope=\"col\">成本/现价</th></tr>");
					$(_pageId+".no_data").show();
					$.alert("查询失败");
				}
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			},{"isLastReq":true,"isShowWait":true,"isShowOverLay":true});
	}
	/**
	 * 证券持仓HTML生成
	 */
	function queryPositionHTML_stock(element){
		var css = "";
		var float_yk = Number(element.float_yk);//浮动盈亏
		var float_yk_per = element.float_yk_per;//浮动盈亏%
		if(float_yk>0){
			float_yk = "+" + float_yk.toFixed(2);
			css = "ared";
		}else if(float_yk<0){
			css = "agreen";
			float_yk = float_yk.toFixed(2);
		}
       var eleHtml = "";
       eleHtml+="<tr id="+element.stock_code +">";
       eleHtml+="<td><strong>"+element.stock_name +"</strong><small>"+element.market_value +"</small></td>";
       eleHtml+="<td><span class=\""+css+"\">"+float_yk+"</span><span class=\""+css+"\">"+float_yk_per+"</span></td>";
       eleHtml+="<td>"+Number(element.cost_amount)+"<br/>"+Number(element.enable_amount)+"</td>";
       eleHtml+="<td>"+Number(element.cost_price)+"<br/>"+Number(element.last_price)+"</td>";
       eleHtml+="</tr>";
       return eleHtml;
	}
	
	/**
	 * 初始化上下滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
				"isPagingType": false,		//false表示是微博那种累加形式，true表示分页形式
				"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".tab_nav").height() - 6  ,	//显示内容区域的高度，当isPaingType为false时传
				"container": $(_pageId+" #v_container_funds_jj"),	
				"wrapper":$(_pageId+" #v_wrapper_funds_jj"),	
				"downHandle": function() {				//下拉获取上一页数据方法
					queryPosition();
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
		$(_pageId + ".visc_pullUp").css("display","none");//隐藏"上拉加载下一页"
	}
	/**
	 * 销毁
	 * */
	function destroy(){
		$(_pageId + " #msg td").text("--");
		$(_pageId+".fund_table .ce_table").html("");
	}
	
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});