/**
 * 信用交易-资产负债
 */
define('trade/scripts/credit/query/creditAssetsQuery.js', function(require,exports,module){
	var	VIscroll = require("vIscroll");
	var gconfig = $.config;
	var global = gconfig.global;
	var	service_credit = require("service_credit");
    var	vIscroll = {"scroll":null,"_init":false};	//上下滑动
	var	_pageId = "#credit_query_creditAssetsQuery ";
	var userInfo = null;//保存的客户信息
	var common = require("common");
	
	/**
	 * 初始化
	 * */
	function init(){
		userInfo = common.getCurUserInfo();
		var prePage = $.getPageParam("param"); //获取上一个页面传过来的参数，判断展示 哪个页面	
		if(prePage && prePage=="assert_val"){
			$(_pageId+"#changeTitle li").eq(0).addClass("active").siblings().removeClass("active");
			$(_pageId + ".top_title .icon_back").text("资产");
			$(_pageId + "#zc").show();
			$(_pageId + "#fz").hide();
			$(_pageId + "#sy").hide();
		}else if(prePage && prePage=="total_debit"){
			$(_pageId+"#changeTitle li").eq(1).addClass("active").siblings().removeClass("active");
			$(_pageId + ".top_title .icon_back").text("资产");
			$(_pageId + "#zc").hide();
			$(_pageId + "#fz").show();
			$(_pageId + "#sy").hide();
		}
		else if(prePage && prePage=="enable_bail_balance"){
			$(_pageId+"#changeTitle li").eq(2).addClass("active").siblings().removeClass("active");
			$(_pageId + ".top_title .icon_back").text("资产");
			$(_pageId + "#zc").hide();
			$(_pageId + "#fz").hide();
			$(_pageId + "#sy").show();
		}
		//查询资产数据
	}
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		queryAssetsData();
	}
	
	/**
	 * 事件绑定
	 * */
	function bindPageEvent(){
		//点击查询标题名字
		$.bindEvent($(_pageId+"#changeTitle li"), function(e){
			var titleIndex = $(this).index();
			if(titleIndex == 0){
				$(this).addClass("active").siblings().removeClass("active");
				$(_pageId + "#zc").show();
				$(_pageId + "#fz").hide();
				$(_pageId + "#sy").hide();
			}else if(titleIndex == 1){
				$(this).addClass("active").siblings().removeClass("active");
				$(_pageId + "#zc").hide();
				$(_pageId + "#fz").show();
				$(_pageId + "#sy").hide();
			}else if(titleIndex == 2){
				$(this).addClass("active").siblings().removeClass("active");
				$(_pageId + "#zc").hide();
				$(_pageId + "#fz").hide();
				$(_pageId + "#sy").show();
			}
			if(!vIscroll._init){
				initVIScroll();
			}else{
				vIscroll.scroll.refresh();
			}
			e.stopPropagation();
		},"click");
		
		//后退
		$.bindEvent($(_pageId+" .top_title .icon_back"), function(e){
			$.pageBack("credit/query/financingQuery","left");
			e.stopPropagation();
		});
		
	}
	/**
	 * 总数据查询
	 */
	function queryAssetsData(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var param = {			
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"password":password,
			"cust_code":cust_code,
			"sessionid":sessionid
		};
		service_credit.rzrq_liabilitiesQuery(param,rzrq_liabilitiesQueryCallBack,
			{
			"isLastReq":true,
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){
				$(_pageId + " table tr td").text("--");
			}
		});
	}
	
	/**
	 * 资产数据调方法
	 * @param {Object} data 返回数据
	 */
	function rzrq_liabilitiesQueryCallBack(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;	
				if(results && results.length > 0){
					var data = results[0];
					//填充资产
					$(_pageId+"#zc td").eq(0).text(data.assert_val);//信用账户总资产
					$(_pageId+"#zc td").eq(1).text(data.net_asset);//信用账户净资产
					$(_pageId+"#zc td").eq(2).text(data.per_assurescale_value);//维持担保比例
					$(_pageId+"#zc td").eq(3).text(data.market_value);//证券市值
					$(_pageId+"#zc td").eq(4).text(data.enable_bail_balance);//可用保证金
					$(_pageId+"#zc td").eq(5).text(data.current_balance);//资金余额
					$(_pageId+"#zc td").eq(6).text(data.enable_balance);//资金可用
					$(_pageId+"#zc td").eq(7).text(data.enable_assert_bz);//可提资产标准
					$(_pageId+"#zc td").eq(8).text(data.fin_enrepaid_balance);//可用于现金还款资金
					$(_pageId+"#zc td").eq(9).text(data.fetch_balance);//现金可取
//					$(_pageId+"#zc td").eq(10).text(data.slo_sell_balance);//融券卖出资金
					// 填充负债
					$(_pageId+"#fz td").eq(0).text(data.total_debit);//总负债
					$(_pageId+"#fz td").eq(1).text(data.fin_debit);//融资负债
					$(_pageId+"#fz td").eq(2).text(data.slo_debit);//融券负债
					$(_pageId+"#fz td").eq(3).text(data.fin_income);
					$(_pageId+"#fz td").eq(4).text(data.slo_income);
					$(_pageId+"#fz td").eq(5).text(data.fin_compact_interest);
					$(_pageId+"#fz td").eq(6).text(data.slo_compact_interest);
					$(_pageId+"#fz td").eq(7).text(data.fin_interest_rate);
					$(_pageId+"#fz td").eq(8).text(data.slo_interest_rate);
//					$(_pageId+"#fz td").eq(9).text(data.underly_market_value);//罚息年利率
					
					//填充使用
					$(_pageId+"#sy td").eq(0).text(data.fcreditbal+data.dcreditbal);//融资融券授信总额度
					$(_pageId+"#sy td").eq(1).text(data.fcreditbal);//融资授信额度
					$(_pageId+"#sy td").eq(2).text(data.dcreditbal);//融券授信额度
					$(_pageId+"#sy td").eq(3).text(data.fin_enable_quota);//融资可用额度
					$(_pageId+"#sy td").eq(4).text(data.slo_enable_quota);//融券可用额度
					$(_pageId+"#sy td").eq(5).text(data.fin_used_quota);//融资已用额度
					$(_pageId+"#sy td").eq(6).text(data.slo_used_quota);//融券已用额度
			
					if(!vIscroll._init){
						initVIScroll();
					}else{
						vIscroll.scroll.refresh();
					}
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".tab_nav").height()- 6 ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						$(_pageId + " table tr td").text("--");
						//查询资产数据
						queryAssetsData();
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
		$(_pageId+ ".visc_pullUp").hide();
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId + "#zc").show();
		$(_pageId + "#fz").hide();
		$(_pageId + "#sy").hide();
		$(_pageId + " table tr td").text("--");
		$(_pageId + ".top_title .icon_back").text("查询");
		$(_pageId+"#changeTitle li").eq(0).addClass("active").siblings().removeClass("active");
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