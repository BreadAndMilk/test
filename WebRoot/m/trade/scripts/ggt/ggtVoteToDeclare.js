/**
 * 投票申请
 */
define('trade/scripts/ggt/ggtVoteToDeclare.js',function(require, exports, module){
	var keyboard = require("keyboard");
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var service_hq = require("service_hq");
	var service_ggt = require("service_ggt");
	var _pageId = "#ggt_ggtVoteToDeclare ";
	var _userInfo = null;
	var _queyrInfo=[];
	
	var _stockInfo={
		"companyName":"",
		"companyCode":"",
		"stockCode":"",
		"bill_code":"",		//议案编号
		"approveAmount":"",
		"opposeAmount":"",
		"waiveAmount":"",
		"market":""
	};
	
	

	function init(){
		_userInfo = common.getCurUserInfo();
		if(keyboard){
				keyboard.keyInit();
		}
	}
	
	function load(){
		$(_pageId+".vertical_list").show();
		$(_pageId+".fund_form2").hide();
		$(_pageId+".noicon_text").hide();
		querySubInfo();
	}

	//查询投票和行为申报相关的信息
	function querySubInfo() {
		var is_all ="1";
		var exchange_type = "G";
		var entrust_way =global.entrust_way;
		var branch_no = _userInfo.branch_no;
		var fund_account=_userInfo.fund_account;
		var cust_code=_userInfo.cust_code;
		var sessionid=_userInfo.session_id;
		var param={
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"sessionid":sessionid,
			"is_all":is_all,
			"exchange_type":exchange_type
		};
		service_ggt.queryVoteInfo(param,queryCallBack);
	}

	function queryCallBack(data) {
		$(_pageId+".no_data").hide();
		if(data){
			if(data.error_no==0){
				var results=data.results;
				if(results.length==0){
					$(_pageId+".no_data").show();
				}else{
					var data = "";
					for (var i=0;i<results.length;i++){
						data += getHtml(results[i]);
						_queyrInfo[results[i].vote_code]=results[i];
					}
					$(_pageId+".fund_list2").html(data);

					//绑定点击投票事件
					$.bindEvent($(_pageId+".part"),function (e) {
						var voteInfo=_queyrInfo[$(this).attr("data")];
						_stockInfo.companyName=voteInfo.company_name;
						_stockInfo.companyCode=voteInfo.company_code;
						_stockInfo.stockCode=voteInfo.vote_code;
						_stockInfo.bill_code=voteInfo.bill_code;
						$(_pageId+".vertical_list").hide();
						$(_pageId+".fund_form2").show();
						$(_pageId+".noicon_text").show();
						e.stopPropagation();
					});

				}
			}else{
				$.alert(data.error_info);
			}
		}else{
			$.alert("查询失败");
		}
	}



	function getHtml(element) {
		var html="";
		html+="<div class=\"part\" data=\'"+element.vote_code+"\'>";
		html+="<div class=\"title\">";
		html+="<h5>"+element.company_name+"<small>"+element.company_number+"</small></h5>";
		html+="</div>";
		html+="<ul>";
		html+="<li>大会编号<em>"+element.stockholder_meeting_code+"</em></li>";
		html+="<li>大会类型<em>"+element.meeting_type+"</em></li>";
		html+="<li>大会名称<em>"+element.meeting_code+"</em></li>";
		html+="<li>议案编号<em>"+element.bill_number+"</em></li>";
		html+="<li>议案类型<em>"+element.bill_type+"</em></li>";
		html+="<li>议案名称<em>"+element.bill_name+"</em></li>";
		html+="<li>投票代码<em>"+element.vote_code+"</em></li>";
		html+="<li>开始日期<em>"+element.begin_date+"</em></li>";
		html+="<li>结束日期<em>"+element.end_date+"</em></li>";
		html+="</ul>";
		html+="</div>";
		return html;
	}


	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageInit("ggt/ggtVoteToDelare","ggt/ggtOrder",{},true);
			e.stopPropagation();
		});
		

		//下单
		$.bindEvent($(_pageId+"#submitOrder"),function(e){
			//获取页面上的输入参
			_stockInfo.approveAmount=$(_pageId+"#approveAmount ").val();
			_stockInfo.opposeAmount=$(_pageId+" #opposeAmount ").val();
			_stockInfo.waiveAmount=$(_pageId+" #waiveAmount ").val();
			vailSubmitOrder();
		});
		
		
	// $.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
	// 		if(keyboard){
	// 			keyboard.popUpKeyboard($(this),e);
	// 		}
	// 		var stockCode = $(_pageId+"#stockCode").val();
	// 		if(stockCode != _stockInfo.stockCode){
	// 			_stockInfo.stockCode = stockCode;
	// 			clearMg();
	// 			var vai0 = /^[A-Za-z]+$/;
	// 			var vai1 = /^[\u4e00-\u9fa5]+$/;
	// 			if(stockCode.length > 1 && (vai0.test(stockCode) || vai1.test(stockCode))){ // 当输入的长度大于1 并且为字母的时候
	// 				getStockList(stockCode); // 查询股票列表
	// 			}else if(stockCode.length>2){ // 当输入的长度大于3的时候
	// 				getStockList(stockCode); // 查询股票列表
	// 			}
	// 		}
	// 		e.stopPropagation();
	// 	},"input");

		//查询投票信息
		$.bindEvent($(_pageId+".noicon_text"),function (e) {
			$(_pageId+".vertical_list").show();
			$(_pageId+".fund_form2").hide();
			$(this).hide();
			querySubInfo();
			e.stopPropagation();
		});

	}
	
	//   /**
	//  * 获取股票列表
	//  * */
	// function getStockList(stockStr){
	// 	if(stockStr != ""){
	// 			var stockStrParam = {
	// 			  "q" : stockStr,
	// 			  "marketType":"2"
	// 			};
	// 			stockStrParam.type="HK";
	// 			service_hq.getStockList_ggt(stockStrParam,function(data){
	// 				if(data.errorNo == 0){
	// 					$(_pageId+"#stock_list").html("");
	// 					var results = data.results;
	// 					//显示股票列表
	// 					if(results && results.length > 0){
	// 						if(results.length == 1 && stockStr.length==5){
	// 							$(_pageId+"#stock_list").html("");
	// 							var market = results[0][9];
	// 							var stockCode = results[0][1];
	// 						}else{
	// 							if(results.length >= 6){
	// 								var selectHeight = 6 * 0.44;
	// 							}else{
	// 								selectHeight = 0.44*results.length;
	// 							}
	// 							var listHtml = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
	// 							for(var i = 0;i < results.length; i++) {
	// 								var stname=results[i][0]+"";
	// 								listHtml += "<li><a href=\"javascript:void(0);\" style=\"padding-left:0.20rem;\" id=\""+stname+"\"><strong style=\"font-size:0.15rem\">"+results[i][1]+"</strong>"+stname+"</a>";
	// 								listHtml +=	"<span style=\"display:none;\">"+results[i][9]+"</span></li>";
	// 							};
	// 							listHtml+="</ul>";
	// 							$(_pageId+"#stock_list").append(listHtml);
	// 							$.bindEvent($(_pageId+".input_select .stock_list ul li"),function(){
	// 								_stockInfo.market = $(this).find("span").text();
	// 								_stockInfo.stockCode = $(this).find("strong").text();
	// 								_stockInfo.stockName=$(this).find("a").attr("id");
	// 								$(_pageId + "#stockCode .key_text").text(_stockInfo.stockCode);
	// 								$(_pageId + "#stockName").val(_stockInfo.stockName);
	// 								$(_pageId+"#stock_list").html("");
	// 							});
	// 						}
	// 					}else{
	// 						$.iAlert("该股票列表不存在");
	// 					}
	// 				}else{
	// 					$.iAlert("获取股票列表失败");
	// 				}
	// 			},{"isShowWait":false});
	// 	}
	// }
	//
	
	//清除用户输入的数据.
	function clearMg(){
		$(_pageId+"#companyCode").val("");
		$(_pageId+"#companyName").val("");
		$(_pageId+"#vote_code").val("");
		$(_pageId+"#bill_code").val("");

		$(_pageId+"#approveAmount").val("");
		$(_pageId+" #opposeAmount").val("");
		$(_pageId+" #waiveAmount").val("");
	}
	
	
	/**
	 * 下单验证
	 * */
	function vailSubmitOrder(){
		if(!_stockInfo.approveAmount||_stockInfo.approveAmount<0){
			$.alert("请输入正确的赞成数量");
			return false;
		}
		if(!_stockInfo.opposeAmount||_stockInfo.opposeAmount<0){
			$.alert("请输入正确的反对数量");
			return false;
		}
		if(!_stockInfo.waiveAmount||_stockInfo.waiveAmount<0){
			$.alert("请输入正确的弃权数量");
			return false;
		}
		// //定义弹出层确认
		// var tipStrArray=[];
		// var tipStr ="<div>";
		// tipStr+="<h3>投票申请</h3>";
		// tipStr+="</div>";
		// tipStr+="<div>";
		// tipStrArray.push(["证券代码 :",_stockInfo.stockCode]);
		// tipStrArray.push(["证券名称 :",_stockInfo.stockName]);
		// tipStrArray.push(["isin代码 :",_stockInfo.isinCode]);
		// tipStrArray.push(["公告编号 :",_stockInfo.placardId]);
		// tipStrArray.push(["议案编号 :",_stockInfo.motionId]);
		// tipStrArray.push(["赞成数量 :",_stockInfo.approveAmount]);
		// tipStrArray.push(["反对数量 :",_stockInfo.opposeAmount]);
		// tipStrArray.push(["弃权数量 :",_stockInfo.waiveAmount]);
		// tipStr+=common.generatePrompt(tipStrArray);
		// tipStr+="</div>";
		var entrust_way =global.entrust_way;
		var branch_no = _userInfo.branch_no;
		var fund_account=_userInfo.fund_account;
		var stock_code=_stockInfo.vote_code;
		var cust_code=_userInfo.cust_code;
		var sessionid=_userInfo.session_id;
		var stock_account=_userInfo.stock_account;
		var placard_id=_stockInfo.companyCode;
		var motion_id=_stockInfo.bill_code;
		var approve_amount=_stockInfo.approveAmount;
		var oppose_amount=_stockInfo.opposeAmount;
		var waive_amount=_stockInfo.waiveAmount;
		var param = {
			"entrust_way":entrust_way,
			"branch_no":branch_no,
			"fund_account":fund_account,
			"cust_code":cust_code,
			"sessionid":sessionid,
			"stock_account":stock_account,
			"stock_code":stock_code,
			"placard_id":placard_id,
			"motion_id":motion_id,
			"approve_amount":approve_amount,
			"oppose_amount":oppose_amount,
			"waive_amount" :waive_amount
		};
		service_ggt.ggtVoteToDelareEntrust(param,callBack);
		// common.iConfirm("",tipStr,function success(){

	 // });
  }

	function callBack(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results && results.length>0){
				$.alert(data.error_info);
				clearMg();
			}
		}else{
			$.alert(data.error_info);
			clearMg();
		}
	}
	
	function pageBack(){
		$.pageInit("ggt/ggtVoteToDeclare","ggt/ggtOrder",{},true);
	}
	
	/***
	 * 销毁
	 */
	function destroy(){
		 
		clearMg();
		if(keyboard){
			keyboard.keyDestroy();
		}
	}
	
	
	var base = {
		"init" : init,
		"load" : load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack":pageBack
	}
	module.exports = base;
});
