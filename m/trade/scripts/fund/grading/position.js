/**
 * 分级基金-持仓
 */
define('trade/scripts/fund/grading/position.js', function(require, exports, module) {
	var common = require("common");
	var gconfig = $.config; 
    var global = gconfig.global;
    var _pageId = "#fund_grading_position ";
	var VIscroll = require("vIscroll");
	var vIscroll = {"scroll":null,"_init":false}; // 上下滑动
	var service_fund = require("service_fund");
	var userInfo =null;

    /**
     * 初始化
     */
	function init(){
		common.bindStockEvent($(_pageId + '.tab_nav ul li a'),true);
		jumpPageEvent();
		userInfo = common.getCurUserInfo();
		queryData();
    }
		
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
		var height_search = mianHeight - $(_pageId+".tab_nav").outerHeight(true);
		$(_pageId+" .main .search_nav").height(height_search-10).css("overflow-y","auto"); //查询目录添加高度
	}
	/**
	 * 跳转页面事件
	 * $(this).unbind();
	 * this.click = null;
	 */
	function jumpPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("account/index","left");
			e.stopPropagation();
		});
	}
	
	function queryData(){
		queryCapital();
		queryFundStock();
	}
	
	/**
	 * 资金账户查询
	 */
	function queryCapital(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志、
		var money_type = "0";  //  0：人民币，1：美元，2：港币
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "money_type":money_type,
			    "is_homepage":"1"
		};
		service_fund.queryFundSelect(param,queryCapitalCallback,
		{  //传给接口的json格式数据            
			"isLastReq":false,                
			"isShowWait":false,
			"isShowOverLay":false,
	    });
	}
	
	function queryCapitalCallback(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					var market_val = Number(results[0].market_val).toFixed(2)+"";
					$(_pageId+" .hold_main3 li").eq(0).find("strong").html(market_val.substring(0,market_val.length-2)+"<em>"+ market_val.substr(-2) +"</em>");//可取
					var enable_balance = Number(results[0].enable_balance).toFixed(2)+"";
					$(_pageId+" .hold_main3 li").eq(1).find("strong").html(enable_balance.substring(0,enable_balance.length-2)+"<em>"+ enable_balance.substr(-2) +"</em>");//可用
					
					//添加总浮动盈亏
					var css = "";
					var sign = "";
					var float_yks = float_yks = results[0].float_yk || results[0].total_income_balance;
					//当浮动盈亏,浮动盈亏比例大于0 时,在前面添加一个 "+" 
					if(float_yks > 0){
						sign = "+";
						css = "ared";
					}else if(float_yks < 0){
						css = "agreen";
					}
					var fas = sign + common.numToMoneyType(float_yks,2);
					$(_pageId+" .hold_main3 ul li").eq(2).find("strong").html(fas.substring(0,fas.length-2)+"<em>"+ fas.substr(-2) +"</em>").attr("class",css);//盈亏
				}
				else{
					$(_pageId+".hold_main3 li strong").text("--");//市值
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	/**
	 * 查询客户基金持仓
	 */
	function queryFundStock(){
		$(_pageId+ ".no_data").hide();
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code
		};
		//最后一个为超时处理函数
		service_fund.gradingPosition(param,queryFundStockCallBack,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
				$(_pageId+ ".no_data").show();
				if(!vIscroll._init){
					initVIScroll();
				}else{
					vIscroll.scroll.refresh();
				}
			}
	    });
	}
	
	function queryFundStockCallBack(data){
		if (data) {
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					var html = "";
					for (var i=0;i<results.length;i++){
						html += queryFundStockHTML(results[i]);
					}
					$(_pageId + ".position_list").html(html);
					$(_pageId+".no_data").hide();
					//返回按钮
					$.bindEvent($(_pageId + " .position_list .fund_tab .nav_box li"), function(e){
						$(this).addClass("active").siblings().removeClass("active");
						e.stopPropagation();
					});
				}else{
					$(_pageId + ".no_data").show();
				}
			}
			else{
				$.alert(data.error_info);
			}
		}
		if(!vIscroll._init){
			initVIScroll();
		}else{
			vIscroll.scroll.refresh();
		}
	}
	
	function queryFundStockHTML(element){
		var price_digit = 3;
		var css = "";
		var	dividendmethod = "现金分红";
		if(element.dividendmethod == "0"){
			dividendmethod = "红利转投资";
		}
		if(element.income_balance > 0){
			css = "ared";
		}else if(element.income_balance < 0){
			css = "agreen";
		}else{
			css = "";
		}
		var eleHtml = "";
		eleHtml += '<div class="fund_tab mt10">';
//		eleHtml += '<div class="nav_box"><ul>';
//		eleHtml += '<li class="active"><a href="javascript:void(0);">母基金</a></li>';
//		eleHtml += '<li><a href="javascript:void(0);">A基金</a></li>';
//		eleHtml += '<li><a href="javascript:void(0);">B基金</a></li>';
//		eleHtml += '</ul></div>';
		eleHtml += '<div class="tab_main">';
		eleHtml += '<div class="inner">';
		eleHtml += '<div class="part">';
		eleHtml += '<div class="title"><h5>'+element.stock_name+' <small>'+element.stock_code+'</small></h5></div>';
		eleHtml += '<ul>';
		eleHtml += '<li>持有份额 <span>'+Number(element.hold_amount)+'</span></li>';
		eleHtml += '<li>可用份额 <span>'+Number(element.enable_amount)+'</span></li>';
		eleHtml += '<li>最新净值 <span>'+Number(element.last_price)+'</span></li>';
		eleHtml += '<li>浮动盈亏 <span class="'+css+'">'+Number(element.income_balance)+'</span></li>';
		eleHtml += '<li>最新市值 <span>'+Number(element.market_value)+'</span></li>';
		eleHtml += '</ul></div></div></div></div>';
        return eleHtml;
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		
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
					queryData();
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
		$(_pageId+".hold_main3 li strong").text("--");//市值
		$(_pageId + ".position_list").html('');
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