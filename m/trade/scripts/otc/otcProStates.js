/**
 * OTC-产品状态
 */
define(function(require, exports, module) {
	
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var validatorUtil = require("validatorUtils");
	
	var service_otc = require("service_otc");
    var _pageId = "#otc_otcProStates ";
    var userInfo = null;
    var inst_cod = "";  //产品代码
    var inst_id = ""; //产品编码
    var ta_code = ""; //登记机构
    var trans_acct = ""; //交易账号
    var trd_id = ""; //交易类别
    var timer = null;//定时器
    /**
     * 初始化
     */
	function init(){
		$(_pageId+".main").css("overflow-y","auto");
		var height_list = $(window).height() - $(_pageId+".header").height();
		$(_pageId + ".main").height(height_list);
		userInfo = common.getCurUserInfo();
		common.bindStockEvent(_pageId); //绑定头部菜单事件
		queryProductInfo(); //查询产品详情
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("otc/otcProStates","otc/otcProducts",{});
		});
		//产品协议
		$.bindEvent($(_pageId + " .otc_state_agree a"),function(){
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;	//分支机构
			var fund_account = userInfo.fund_account;	//资产账户
			var cust_code = userInfo.cust_code;	//客户代码
			var param = {
					"entrust_way" : entrust_way,
					"branch_no" : branch_no,
					"fund_account" : fund_account,
					"cust_code" : cust_code,
				    "inst_cod" : inst_cod
			}
			getProtocolFunc(param);
		});
		//--关闭
		$.bindEvent($(_pageId + "#confirm_prot_info h2 em"),function(){
			$(_pageId + "#confirm_prot_info").hide();
			return false;
		});
		
		//确认购买
		$.bindEvent($(_pageId +" .otc_state_btn .otcbuy "),function(){
			//登录校验
			if(!checkInput()){
				return false;
			};
			submitBuyOtc();
		});
		
	}
	/**
	 *  查询产品相关协议
	 * @param {Object} paramObj
	 */
	function getProtocolFunc(paramObj)
	{
		service_otc.productsAgreement(paramObj,function(data){
			if(data.error_no == 0)
			{
				results = data.results;
				if(results && results.length > 0)
				{
					var allPro = "";
            		var item=null,type="",content="";
            		for(var i=0,length = results.length;i<length;i++){
            		    item = results[i];
            		    type = item.type;
            		    content = item.content;
            		    if(type == "1" && content !=""){
            		    	allPro +='<h3 style="text-align: center;font-size: 14px;height: 32px;line-height: 32px;">《风险提示》</h3>';
            		    	allPro += content;
            		    }
            		    else if(type == "3" && content !=""){
            		    	allPro +='<h3 style="text-align: center;font-size: 14px;height: 32px;line-height: 32px;">《计划说明书》</h3>';
            		    	allPro += content;
            		    }
            		    else if(type == "2" && item.content !=""){
            		    	allPro +='<h3 style="text-align: center;font-size: 14px;height: 32px;line-height: 32px;">《产品合同》</h3>';
            		    	allPro += content;
            		    }
            		}
				}
			    $(_pageId+"#prot_text").html(allPro);
				$(_pageId+"#confirm_prot_info").show();
			}
			else
			{
				  $.alert(error_info);
			}
		});
	}
    
	/**
	 * 产品详情
	 */
	function queryProductInfo(){
		$(_pageId + " #remove").remove();
		var params = $.getPageParam();
		var prod_code = params.prod_code;
		var prod_type = params.prod_type;
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no  = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var password = userInfo.password;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"inst_cod":prod_code,
				"prod_type":prod_type
		  };
		service_otc.getProDetail(param,function(data){
			if(typeof data != "undefined" && data != null) {
				if(data.error_no == 0){
					var results = data.results;	
					if(results && results.length>0){
						var data = results[0];
						if($.trim(data.prod_status_name) == "待认购"){
							var beginDate = new Date(data.begin_date.replaceAll("-","/")).getTime();//开始购买的日期
							 var nowDate = new Date(data.nowDate.replaceAll("-","/")).getTime();//现在的时间
							var disDateSe = beginDate - nowDate;
							if( disDateSe > 0 ){
								timer = setInterval(countTime(beginDate,nowDate),1000)
								var disDateDay = Math.floor(disDateSe/(24 * 60 * 60 * 1000));
								var disDateHour = Math.floor((disDateSe%(24 * 60 * 60 * 1000))/(60 * 60 * 1000))
								var disDateMin = Math.floor((disDateSe%(24 * 60 * 60 * 1000))%(60 * 60 * 1000)/(1000*60));
								var disDateSecond = Math.floor(((disDateSe%(24 * 60 * 60 * 1000))%(60 * 60 * 1000)%(1000*60))/1000);
								$(_pageId + " .otc_state_list").append("<li id=\"remove\"><span>倒计时</span><strong>"+disDateDay+"天"+disDateHour+"小时"+disDateMin+"分钟"+disDateSecond+"秒"+"</strong></li>");
								$(_pageId + " #otcbuy").show();
								$(_pageId + " .otcbuy").hide();
							}
						}
						$(_pageId + ".otc_state_infor dt").text(data.inst_fname);
						$(_pageId + ".otc_state_infor dd:eq(0) span").text(parseFloat(data.min_share).toFixed(2)/10000+"万元");
						$(_pageId + ".otc_state_infor dd:eq(1) span").text(data.per_share+"%");
						$(_pageId + ".otc_state_infor dd:eq(2) span").text(parseFloat(data.increase_share).toFixed(2)/10000+"万元");
						$(_pageId + ".otc_state_infor dd:eq(3) span").text(data.prod_term+"天");
						$(_pageId + ".otc_state_list li:eq(0) strong").text(data.begin_invest);
						$(_pageId + ".otc_state_list li:eq(1) strong").text(data.end_date);
						$(_pageId + ".otc_state_list li:eq(2) strong").text(data.prod_status_name);
						$(_pageId + ".otc_state_list li:eq(3) strong").text(data.prof_type);
						$(_pageId + ".otc_state_list li:eq(4) strong").text(data.risk_level_name);
						$(_pageId + ".otc_state_list li:eq(5) strong").text(data.surplus_count);
						inst_cod = data.inst_cod;
					    inst_id = data.inst_id; //产品编码
					    ta_code = data.ta_code; //登记机构
					    trans_acct = data.trans_acct; //交易账号
					    trd_id = data.trd_id; //交易类别
						
					}else{
					  $.alert("暂无产品详情");
					}
					
				}else{
					  $.alert("查询失败");
				}
			}
		});
	}
	/**
	 * 倒计时效果
	 */
	function countTime(beginDate,nowDate){
		return function(){
//			var nowDate = new Date().getTime();//现在的时间
			nowDate = nowDate + 1000;
			var disDateSe = beginDate - nowDate;
			if(disDateSe <= 0 ){
				if(timer){
					clearInterval(timer);
				}
				queryProductInfo(); //查询产品详情
			}
			var disDateDay = Math.floor(disDateSe/(24 * 60 * 60 * 1000));
			var disDateHour = Math.floor((disDateSe%(24 * 60 * 60 * 1000))/(60 * 60 * 1000))
			var disDateMin = Math.floor((disDateSe%(24 * 60 * 60 * 1000))%(60 * 60 * 1000)/(1000*60));
			var disDateSecond = Math.floor(((disDateSe%(24 * 60 * 60 * 1000))%(60 * 60 * 1000)%(1000*60))/1000);
			$(_pageId + " #remove").html("<span>倒计时</span><strong>"+disDateDay+"天"+disDateHour+"小时"+disDateMin+"分钟"+disDateSecond+"秒"+"</strong>");
		}
	}
	/**
	 * 校验购买金额
	 */
	function checkInput(){
		  var trd_amt = $(_pageId+"#money").val();
	      if(validatorUtil.isEmpty(trd_amt)){
				$.alert("购买金额不能为空");
				$.hidePreloader();
				return false;
			}
	      if(!validatorUtil. isNumeric(trd_amt)){
				$.alert("购买金额必须是数字");
				 $(_pageId+"#money").val("");
					$.hidePreloader();
				return false;
			}
		return true;
	}
	/**
	 * 认购确认
	 */
	function submitBuyOtc()
	{
//		if($("input[type='checkbox']").is(':checked'))
	//	if($('input:checkbox').attr("checked",'true'))
//		if($("input[type='checked']:checked") == true)
		if($(_pageId+" #put_otc").is(':checked'))	
		{
			var entrust_way= global.entrust_way; // 委托方式  在configuration配置
			var branch_no  = userInfo.branch_no;	//分支机构
			var fund_account = userInfo.fund_account;	//资产账户
			var cust_code = userInfo.cust_code;	//客户代码
		     var trd_amt = $(_pageId+"#money").val();
		      var param = {
		    		  "entrust_way" : entrust_way,
		    		  "branch_no" : branch_no,
		    		  "fund_account" : fund_account,
		    		  "cust_code" : cust_code,
		    		  "inst_cod" : inst_cod,
		    		  "inst_id" : inst_id,
		    		  "ta_code" : ta_code,
		    		  "trd_id" : trd_id,
		    		  "trans_acct" : trans_acct,
		    		  "trd_amt": trd_amt
		      };
		      service_otc.subOtcBuy(param,function(data){
		    		if(data.error_no == 0)
		    		{
		    			$.pageInit("otc/otcProStates","otc/otcSuccess",{});
		    		}else{
		    			$.alert(data.error_info);
		    		}
		      });
		}else
		{
			  $.alert("请签署协议");
				return false;
		}
	}
	
	
	/**
	 * 销毁
	 */
	function destroy(){
		$(_pageId + " #otcbuy").hide();
		$(_pageId + " .otcbuy").show();
		$(_pageId + " #remove").remove();
		$(_pageId + " #money").val("");
		if(timer){
			clearInterval(timer);
		}
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});