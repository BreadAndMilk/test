/**
 * 划转撤单
 */
define('trade/scripts/credit/transferred/transferCancellation.js', function(require, exports, module) {
    var _pageId = "#credit_transferred_transferCancellation ";
	var gconfig = $.config;
	var global = gconfig.global;
    var VIscroll = require("vIscroll");
	var service_credit = require("service_credit");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var service_common = require("service_common");
    var common = require("common");
    var userInfo = null;
	var entrustNos = [];
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		common.bindStockEvent($(_pageId + '.toggle_nav ul li a'),true);

		queryTransCanCancel();//查询撤单信息
	}
	function load(){

		var mianHeight = common.setMainHeight(_pageId, false);
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
		
		//全部撤单
		$.bindEvent($(_pageId+".noicon_text"), function(e){
			var entrust_no = entrustNos.join(",");//合同序号
			if(entrustNos.length == 0){
				$.alert("暂无可撤单委托");
				return false;
			}
			var batch_flag="1";
			var exchange_type="";
			var entrust_way = global.entrust_way; // 委托方式  在configuration配置
			var branch_no = userInfo.branch_no;	
			var fund_account = userInfo.fund_account;//货币 ""所有货币，0 人民币，1 港币，2 美元
			var cust_code = userInfo.cust_code;//关联资产账户标志
			var sessionid=userInfo.session_id;
			var password= userInfo.password;
			var param={				
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"password":password,
					"sessionid":sessionid,
					"entrust_no":entrust_no,
					"batch_flag":batch_flag,
					"exchange_type":exchange_type	
			};
			var tipStr = "<div>是否全部撤单?</div>";
			common.iConfirm("全部撤单",tipStr,function(){
				service_credit.credit_cancel(param,CancelCallBack);
			});
			e.stopPropagation();
		});
	}
    
	/**
	 * 查询撤单数据
	 */
	function  queryTransCanCancel(){
		entrustNos = [];
		$(_pageId+ ".no_data").hide();
		$(_pageId+".cancel_order").html("");
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account	= userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var password = userInfo.password;
		var sessionid= userInfo.session_id;
		var stock_account ="";
		var stock_code = "";
		var entrust_bs = "";
		var exchange_type = "";
		var param={
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"exchange_type":exchange_type,
				"stock_account":stock_account,
				"stock_code":stock_code,
				"entrust_bs":entrust_bs
		};
		service_credit.queryTransCanCancel(param, queryCancelCallBack,
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
	/*
	 * 查询撤单回调
	 */
	function queryCancelCallBack(data){
		entrustNos = [];
		if(data){
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length > 0){
					var queryStockHtml = "";
					for ( var i = 0; i < results.length; i++) {
						entrustNos.push(results[i].entrust_no);
						queryStockHtml += creatCancelHtml(results[i]);
					}
					$(_pageId+".cancel_order").html(queryStockHtml);
					
					$.bindEvent($(_pageId+".cancel_order .part"), function(e){
						var $this = $(this);
						var entrust_no = $this.attr("data-id");
						var tipStrArray = [];
						tipStrArray.push([$this.find("div.title strong").text(), $this.find("div.title small").text()]);
						tipStrArray.push(["买卖方向 ", $this.find("div.title span.tag").text()]);
						tipStrArray.push(["成本价格 ", $this.find("ul li").eq(0).find("p").text()]);
						tipStrArray.push(["委托数量 ", $this.find("ul li").eq(1).find("p").text()]);
						tipStrArray.push(["委托编号 ", entrust_no]);
						var tipStr = "<div >";
						tipStr += common.generatePrompt(tipStrArray);
						tipStr += "</div>";
						common.iConfirm("确认撤单",tipStr,function(){
							var exchange_type = $this.attr("data-type");
							postCancelOrder(entrust_no,exchange_type); // 确认撤单
						});
						e.stopPropagation();
					});
				}else{
					$(_pageId+ ".no_data").show();
				}
			}else{
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
     * 生成查询持仓函数
     * @param {Object} data
     */
    function creatCancelHtml(element){
		var price_digit = 3;
		var css = "";
		var entrust_name = "";
		if(element.entrust_bs == "76"){
			entrust_name = "担保品转入";
			css = "ared";
		}else if(element.entrust_bs == "77"){
			entrust_name = "担保品转出";
			css = "agreen";
		}
		var eleHtml = "";
		eleHtml+="<div class=\"part\" data-id="+element.entrust_no+" data-type="+element.exchange_type+">";
        eleHtml+="<div class=\"title\"><span class=\"tag "+css+"\">"+element.entrust_name+"</span><strong>"+element.stock_name+"</strong><small>"+element.stock_code+"</small>";
        eleHtml+="<span class=\"time\">"+element.entrust_time+"</span></div><ul>";
    	eleHtml+="<li><span>成本价 </span><p>"+Number(element.entrust_price).toFixed(price_digit)+"</p></li>";
    	eleHtml+="<li><span>委托数 </span><p>"+element.entrust_amount+"</p></li>";
        eleHtml+="</ul></div>";
		return eleHtml;
    }
    
    /**
	 * 委托撤单
	 * @param $currItem 当前条目
	 */
	function postCancelOrder(entrust_no,exchange_type){
		var batch_flag="0";
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;//货币 ""所有货币，0 人民币，1 港币，2 美元
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var money_type = "";////货币 ""所有货币，0 人民币，1 港币，2 美元
		var sessionid=userInfo.session_id;
		var password= userInfo.password;
		var param={				
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"entrust_no":entrust_no,
				"batch_flag":batch_flag,
				"exchange_type":exchange_type
		};
		service_credit.credit_cancel(param, CancelCallBack);
	}
	
    function CancelCallBack(data){
    	if(data.error_no == "0"){
    		$.alert(data.error_info,function(){
	    		queryTransCanCancel();
    		});
    	}else{
    		$.alert(data.error_info);
    	}
    }    
    /**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".toggle_nav").height() - 6 ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						queryTransCanCancel();//下拉获取上一页数据方法
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
		entrustNos = [];
		$(_pageId+ ".no_data").hide();
		$(_pageId+".cancel_order").html("");
		if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
	};
	module.exports = base;
});