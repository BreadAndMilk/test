/**
 * 新股-- 一键申购
 */
define('trade/scripts/credit/shares/oneKeyPurchase.js',function(require, exports, module) {
	require("validatorUtils");
	var validator = $.validatorUtils;
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var	service_stock = require("service_stock");
	var _pageId = "#credit_shares_oneKeyPurchase ";
	var VIscroll = require("vIscroll");
    var vIscroll = {"scroll":null,"_init":false};		//上下滑动
    var userInfo =null;
    var listData = {};
    var singleData = {};
    var num_step = 500; //步数
    var exchange_market = ""; //市场类别
    var witchAccount = "";
    var stock_account = "";
    var _stockName = "";
    var mianHeight = null;
    
    
    /**
     * 初始化
     */
	function init() {
		$(_pageId+".main").eq(1).hide();
		$(_pageId+".main").eq(0).show();
		userInfo = common.getCurUserInfo();
	    queryMessages(); //今日新股查询		
    }
	
	function load(){
		mianHeight = common.setMainHeight(_pageId, false);
	}
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageBack("shares/more","left");
			e.stopPropagation();
		});
		
		//申购
		$.bindEvent($(_pageId+" .onekey_check .btn"),function(e){
			cofirmOrder(); //
//			e.stopPropagation();	// 阻止冒泡
		});
		
		//全选
		$.bindEvent($(_pageId+" .onekey_check span"),function(e){
			if($(this).find("i").hasClass("active")){
				$(this).find("i").removeClass("active");
				$(_pageId+" .onekey_main .part").removeClass("active");
			}
			else{
				$(this).find("i").addClass("active");
				$(_pageId+" .onekey_main .part").addClass("active");
			}
			e.stopPropagation();	// 阻止冒泡
		});
	}
    
	/**
	 * 今日新股查询		
	 */
	function queryMessages(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	 //分支机构
		var fund_account = userInfo.fund_account;//资产账户
		var cust_code = userInfo.cust_code;  	 //客户代码
		var sessionid = userInfo.session_id;
		var password = userInfo.password;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid
			};
		service_stock.queryListingShares(param,messageCallBack,
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
	//新股查询回调
	function messageCallBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if( results && results.length>0){
				var html = '';
				listData = {};
				for(var i = 0;i<results.length;i++){
					listData[""+i] = results[i];
					html += messageAddHtml(results[i], i);
				}
				$(_pageId+" .onekey_main").html(html);
				$(_pageId+ ".no_data").hide();
				
				//全选
				$.bindEvent($(_pageId+" .onekey_main .part .title"),function(e){
					if($(this).parent(".part").hasClass("active")){
						$(this).parent(".part").removeClass("active");
					}
					else{
						$(this).parent(".part").addClass("active");
					}
					e.stopPropagation();	// 阻止冒泡
				});
				
				//申购
				$.bindEvent($(_pageId+" .onekey_main .part ul li:nth-child(2)"),function(e){
					var $this = $(this);
					var data = listData[$this.parents(".part").attr("id")];
					var tipStr = "<div class='pop_nums' >";
					tipStr += '<div class="pop_main" style="margin: 10px;"><div class="input_text text">';
        			tipStr += '<label>申购上限</label><input type="text" class="t1" value="'+ Number(data.high_amount);
        			tipStr += '" readonly="readonly"/><a href="javascript:void(0);" class="all">全部</a>';
       				tipStr += '</div><div class="input_box"><label>申购数量</label>';
        			tipStr += '<div class="input_value" buy_unit="'+Number(data.buy_unit)+'"><em class="less"></em><em class="add"></em>';
                	tipStr += '<input type="tel" class="t1" value="'+ ($(this).find("em").text() || 0);
                	tipStr += '" /></div></div></div></div>';
					common.iConfirm("编辑申购数",tipStr,function(div){
						$this.find("em").text(div.find(".pop_nums .input_value input").val());
					});
					//申购
					$.bindEvent($(_pageId+".pop_nums .input_value em"),function(e){
						var css = $(this).attr("class");
						var inp = $(this).nextAll("input");
						var buy_unit = $(this).parent(".input_value").attr("buy_unit") || 500;
						buy_unit = Number(buy_unit);
						var inpVal = Number(inp.val());
						if(css == "less"){
							if(inpVal - buy_unit < 0){
								inpVal = 0;
							}
							else{
								inpVal = inpVal - buy_unit;
							}
						}
						else if(css == "add"){
							inpVal = inpVal + buy_unit;
						}
						inp.val(inpVal);
						e.stopPropagation();	// 阻止冒泡
					});
					$.bindEvent($(_pageId+".pop_nums .input_text .all"),function(e){
						var all = $(this).prev("input").val();
						$(this).parents(".input_text").next(".input_box").find(".input_value input").val(all);
						e.stopPropagation();	// 阻止冒泡
					});
					e.stopPropagation();	// 阻止冒泡
				});
			}else{
				$(_pageId+ ".no_data").show();
			}
		}else{
			$.alert(data.error_info);
		}
		if(!vIscroll._init){
			initVIScroll();
		}else{
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * actcheck
	 */
	function messageAddHtml(element, i){
		eleHtml = "";
		eleHtml += '<div id="'+i+'" class="part" exchange_type="'+element.exchange_type+'">';
        eleHtml += '<div class="title"><i></i><h5>'+element.stock_name+' <small>'+element.stock_code+'</small></h5></div>';
        eleHtml += '<ul>';
        eleHtml += '<li><p><span>发行价</span>'+Number(element.last_price).toFixed(3)+'</p><p><span>申购上限</span>'+Number(element.high_amount)+'</p></li>';
        eleHtml += '<li><p><span>申购数</span><em>'+Number(element.buy_unit)+'</em></p><a href="javascript:void(0);"></a></li>';
        eleHtml += '</ul></div>';
		return eleHtml;
	}
		
	/**
	 * 申购验证
	 * */
	function cofirmOrder(){
		var list = $(_pageId+" .onekey_main div.active");
		var listLength = list.length;
		if(listLength == 0){
			$.alert("请勾选要申购的代码");
			return false;
		}
		var tipStr = "<div ><ul>";
		var tipStrArray = [];
		for(var i = 0; i < listLength; i++){
			var name = list.eq(i).find("h5").html();
			var num = list.eq(i).find("ul li").eq(1).find("p em").text();
//			for(var d = 0 ; d<10; d++){
				tipStrArray.push([name, "申购股数 "+num]);
//			}
		}
		tipStr += common.generatePrompt(tipStrArray);
		tipStr+="</ul></div>";
		common.iConfirm("申购确定",tipStr,function success(){
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;	 //分支机构
			var fund_account = userInfo.fund_account;//资产账户
			var cust_code = userInfo.cust_code;  	 //客户代码
			var sessionid = userInfo.session_id;
			var password = userInfo.password;
			var param = {
					"entrust_way":entrust_way,
					"branch_no":branch_no,
					"fund_account":fund_account,
					"cust_code":cust_code,
					"password":password,
					"sessionid":sessionid
				};
			service_stock.queryStockData(param,succesCallback);
		});
	}
	function succesCallback(data){
		if (typeof(data) != "undefined" && data) {
			$(_pageId+".state_list ").html("");
			if(data.error_no == 0){
				$(_pageId+".main").eq(0).hide();
				var results = data.results;
				if(results.length>0 && results!= "undefined"){
					var html = "";
					for (var i=0;i<results.length;i++){
						var css = '<span class="n1">提交成功</span>';
						if(i%2 == 0){
							css = '<span class="n2">提交失败</span>';
						}
						html += "<li>"+results[i].stock_name+" "+results[i].enable_amount+"股"+css+"</li>"
					}
					html = html + html;
					$(_pageId+".onekey_succes .stat_box ul").html(html);
				}
				$(_pageId+".main").eq(1).show();
				var height = mianHeight -  $(_pageId + " .onekey_succes .inner").height() - $(_pageId + " .onekey_succes .ce_btn").height() - 40;
				$(_pageId+".onekey_succes .stat_box ul").css({
					"max-height": height + "px",
					"overflow" : "auto"
				});
				//返回按钮
				$.bindEvent($(_pageId+".onekey_succes .ce_btn a"), function(e){
					$.pageBack("shares/more","left");
					e.stopPropagation();
				});
			}
			else{
				$.alert(data.error_info);
			}
		}
	}
	
	/**
	 * 销毁
	 */
	function destroy(){
		 $(_pageId+"#stockPrice").val("");
		 $(_pageId+"#stockNum").val("");
		 $(_pageId+".select_box ul").hide();
		 $(_pageId +".input_select .select_box p").html("请选择");
		 $(_pageId+" .order_form .max strong").text("--");
		 $(_pageId+" .order_form .notice span").text("--"); 
		 $(_pageId+"#stockCode").val("");
		 _stock_code = "";
		 _stockName = "";
		 if(vIscroll._init){
			vIscroll.scroll.refresh();
		}
	}
	
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".onekey_check").height()- 6  ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						queryMessages();//下拉获取上一页数据方法
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
	
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});