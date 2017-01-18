/**
 * 场外基金 -- 风险测评
 */
define('trade/scripts/fund/outside/riskEvaluation.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
	var common = require("common");
	var service_fund = require("service_fund");
	var userInfo = null;
	var mainHeight = null;
	var _pageId = "#fund_outside_riskEvaluation ";
    /**
     * 初始化
     */
	function init(){
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$(this).unbind(e.type);
			this[e.type] = null;
			$.pageBack("fund/outside/order","left");
			e.stopPropagation();
		});
		
		userInfo = common.getCurUserInfo();
		$(_pageId + ".test_result").hide();
		$(_pageId + ".test_main").hide();
		queryRiskLevel();
    }
	
	function load(){
		mainHeight =  common.setMainHeight(_pageId, false);
	}
	
	function queryRiskLevel(){
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var password = userInfo.password;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var risk_kind = "1";//0 A股 1 基金
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "password":password,
			    "risk_kind":risk_kind,
			    "organ_flag":"0"
		};
		//最后一个为超时处理函数
		service_fund.queryRiskLevel(param,queryRiskLevelCallBack,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
				queryRiskQuestions();
			}
	    });
	}
	
	function queryRiskLevelCallBack(data){
		if (data) {
			if (data.error_no == 0) {
				var results = data.results;
				if(results && results.length > 0 && results[0]){
					$(_pageId + ".test_result").show();
					$(_pageId + ".test_main").hide();
					results[0].risk_flag = 0;
					$(_pageId+" .test_result .links").hide();
					$(_pageId+" .test_result .inner").show();
					if(results[0].risk_flag == 1){
						$(_pageId+" .test_result .inner .icon").addClass("over");
						$(_pageId+" .test_result .inner .icon strong").text("0");
						$(_pageId+" .test_result .inner .icon p").text("已过期");
						$(_pageId+" .test_result .inner .icon span").text("到期时间："+results[0].update_date);
						var txt = "您好，您的风险测评已过期，上次测评日期是"+results[0].update_date+"，";
						$(_pageId+" .test_result .notice_box p span").text(txt);
					}
					else{
						$(_pageId+" .test_result .inner .icon").removeClass("over");
						$(_pageId+" .test_result .inner .icon strong").text(results[0].risk_level);
						$(_pageId+" .test_result .inner .icon p").text(results[0].risk_name);
						$(_pageId+" .test_result .inner .icon span").text("到期时间："+results[0].update_date);
						if(results[0].risk_level > 2){
							$(_pageId+" .test_result .notice_box").hide();
							$(_pageId+" .test_result .links").show();
						}
						else{
							$(_pageId+" .test_result .links").hide();
							$(_pageId+" .test_result .notice_box").show();
							var txt = "您好，你的测评等级为"+results[0].risk_name+"，不利于后面综合评分，";
							$(_pageId+" .test_result .notice_box p span").text(txt);
						}
					}
				}
				else{
					queryRiskQuestions();
				}
			}
			else{  
				$.alert(data.error_info);
			}
		}
	}
	
	
	/**
	 * 风险测评题目查询
	 */
	function queryRiskQuestions(){
		$(_pageId + ".test_result").hide();
		$(_pageId + ".test_main").show();
		var testHeight = mainHeight - $(_pageId+" .test_main .ce_btn").outerHeight(true) - 10;
		$(_pageId + " .test_main .test").html("").height(testHeight);
		//获取保存在本地的账户信息
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var fund_account = userInfo.fund_account;
		var password = userInfo.password;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var risk_kind = "1";//0 A股 1 基金
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "password":password,
			    "risk_kind":risk_kind,
			    "organ_flag":"0"
		};
		//最后一个为超时处理函数
		service_fund.queryRiskQuestions(param,queryRiskQuestionsCallBack);
	}
	/**
	 * 查询基金题目回调
	 */
	function queryRiskQuestionsCallBack(data){
		if(data.error_no == "0"){
			if(data.results[0]){
				creatHtml(data.results);
				// 为选择按钮添加事件
				$.bindEvent($(_pageId+" .test_main .test_box ul li"),function(){
					var quetype = $(this).attr("data-kind");	 // 问题类型0：单选，1：多选
					if(quetype == 1){
						if($(this).find("input").attr("checked")){
							$(this).find("input").removeAttr("checked");
						}else{
							$(this).find("input").attr("checked","checked");
						}
					}else{
						$(this).siblings().find("input").removeAttr("checked");
						if($(this).find("input").attr("checked")){
							$(this).find("input").removeAttr("checked");
						}else{
							$(this).find("input").attr("checked","checked");
						}
					}
				});
			}
		}else{
			$.alert(data.error_info);
			return false;
		}
	}
	/**
	 * 生成题目的html
	 */
	function creatHtml(data){
		var question_no;
		var length = data.length;
		var k = 1;
		var html = [];
		for(var i=0; i < length; i++){
			var result = data[i];
			var question_content = data[i].question_content;//问题内容
			var answer_content =  data[i].answer_content;//答案内容
			var answer_no = data[i].answer_no;
			var kind = data[i].question_kind;//问题类型(0：单选，1：多选)
			if(question_no != data[i].question_no){
				if(i != 0){
					html.push("</ul></div>");
				}
				html.push("<div class=\"test_box\"><h5>"+k+"，"+question_content+"</h5>");
				k++;
	        	html.push("<ul>");
	            html.push("<li  data-kind='"+kind+"'><span class=\"icon_radio\"><input type=\"radio\" class=\"r1\" data-question_no='"+data[i].question_no+"' data-answer_no='"+answer_no+"' data-score='"+data[i].score+"' /><label for=\"radio_1\">"+answer_content+"</label></span></li>");
			}else{
				html.push("<li  data-kind='"+kind+"'><span class=\"icon_radio\"><input type=\"radio\" class=\"r1\" data-question_no='"+data[i].question_no+"' data-answer_no='"+answer_no+"' data-score='"+data[i].score+"' /><label for=\"radio_1\">"+answer_content+"</label></span></li>");
			}
			question_no = data[i].question_no;
		}
		if(length != 0){
			html.push("</ul></div>");
		}
		$(_pageId + " .test_main .test").html(html.join(""));
	}
//	/**
//	 * 判断是否勾选
//	 */
//	function isNotChecked(num){
//		var actCheckBox = $(_pageId + " .test_main dl:eq("+(num-1)+") input");
//		for(var i = 0;i<actCheckBox.length;i++){
//			var hasChecked = $(_pageId + " .test_main dl:eq("+(num-1)+") input:eq("+i+")").attr("checked");
//			if(hasChecked == "checked"){
//				return true;
//			}
//		}
//	}

	/**
	 * 获取后端需要的答案
	 */
	function getAnswer(){
		var oDl = $(_pageId + " .test_box");
		var custTotalAnswer = "";
		var aNotFinish = []; // 题目未完成的数组
		for(var num =0;num<oDl.length;num++){
			var custAnswer = [];
			var custScore = [];
			var actCheckBox = oDl.eq(num).find("input");
			var ans_question_no = actCheckBox.eq(0).attr("data-question_no");
			if(oDl.eq(num).find("input[checked='checked']").length==0){
				aNotFinish.push(num+1);
				continue;
			}
			for(var i = 0;i<actCheckBox.length;i++){
				var oInput = actCheckBox.eq(i);
				var hasChecked = oInput.attr("checked");
				if(hasChecked == "checked"){
					var k = 0;
					var ans_answer_no = oInput.attr("data-answer_no");
					var ans_score = oInput.attr("data-score");
					custAnswer[k] = ans_answer_no;
					custScore[k] = ans_score;
					k++;
				}
			}
			custTotalAnswer += ans_question_no + "|" + custAnswer.toString()+ "|" + custScore.toString() + ";";
			//custTotalAnswer += ans_question_no + "&" + custAnswer.toString() + "|" ;
		}
		if(aNotFinish.length > 0){
			$.alert("您的风险测评还有题目未完成，请继续完成：" + aNotFinish.join(","));
			return false;
		}
		return custTotalAnswer;
	}
	
	
	
	/**
	 * 提交客户所需要的答案
	 */
	function submitCustAnswer(){
		//获取保存在本地的账户信息
		var entrust_way= global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	
		var password = userInfo.password;
		var fund_account = userInfo.fund_account;
		var cust_code = userInfo.cust_code;//关联资产账户标志
		var risk_kind = "1";//0 A股 1 基金
		var paper_answer = getAnswer();
		if(!paper_answer){
			return false;
		}
		var param={				
				"entrust_way":entrust_way,
			    "branch_no":branch_no,
			    "fund_account":fund_account,
			    "cust_code":cust_code,
			    "password":password,
			    "risk_kind":risk_kind,
			    "organ_flag":"0",
			    "paper_answer":paper_answer
		};
		//最后一个为超时处理函数
		service_fund.submitCustAnswer(param,queryRiskLevelCallBack,
		{  //传给接口的json格式数据            
			"isLastReq":true,                
			"isShowWait":true,
			"isShowOverLay":false,
			"timeOutFunc":function(){    //超时调用方法
			}
	    });
	}

	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		
		$.bindEvent($(_pageId+" .test_result p a"),function(e){
			queryRiskQuestions();
			e.stopPropagation();
		});
		
		$.bindEvent($(_pageId+" .test_main .ce_btn a"),function(e){
			submitCustAnswer();
			e.stopPropagation();
		});
	}
	
	/**
	 * 数据重置
	 */
	function destroy(){
		$(_pageId + " .test_main .test").html("");
	}
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy
	};
	module.exports = base;
});