/**
 * 网络投票
 */
define(function(require, exports, module) {
	
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	
	var validatorUtil = require("validatorUtils");
	var _pageId = "#voting_netVote ";
	var service_hq = require("service_hq");
	var external = {"callMessage":function(){}};
	var service_added = require("service_added");
	var userInfo = null;	//账号信息
	var startTime="";
	var endTime="";
	var meeting_seq = "";
	var vote_type="";
	var stock_code="";
	/**
     * 初始化
     */
	function init(){
		$(_pageId).css("overflow-x","hidden");
		common.systemKeybord(); // 解禁系统键盘
		$(_pageId+".vote_form .select_box").addClass("deleteBefore");
		userInfo = common.getCurUserInfo();
    }
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId + ".top_title .icon_back"), function(e){
			$.pageInit("voting/netVote","account/index");
			e.stopPropagation();
		});
		//股票代码输入框监听
		$.bindEvent($(_pageId+"#stockCode"), function(e){
			var stockCode = $(this).val();
//			clearBuyMsg();
			var vail=/^[A-Za-z]+$/;
			if(stockCode.length>1 && vail.test(stockCode)){
				getStockList(stockCode);
				if(stockCode.length<2){
					$(_pageId+"#stock_list").html("");
				}
			}else if(stockCode.length>3){
				if(e.keyCode == 8){
					if(stockCode.length == 5){
						$(_pageId+"#stockCode").val("");
						$(_pageId+"#stockName").text("");
					}				
				}else{
					getStockList(stockCode);
				}
				if(stockCode.length<4){
					$(_pageId+"#stock_list").html("");
				}
			}else{
				$(_pageId+"#stock_list").html("");
			}
//			$(_pageId+".ce_btn #total").hide();
			e.stopPropagation();
		},"keyup");
		
		//股票代码输入框调用原生键盘
		$.bindEvent($(_pageId+".vote_form "), function(e){
			$(_pageId+"#stockCode").focus();
//			if(gconfig.platform == "1"){
//				var data = JSON.parse($.callMessage({"moduleName":"self-stock","funcNo": "60100", "searchKey":""}));
//				showStockList(data);// 显示股票列表
//			}else if(gconfig.platform == "2"){
//				var data = $.callMessage({"moduleName":"self-stock","funcNo": "60100", "searchKey":""});
//				showStockList(data);// 显示股票列表
//			}
			window.keyBoardInputFunction = function(e){ //原生回调
				var stockCode = $(_pageId+"#stockCode").val();
				$(_pageId+"#stockCode").val("");
				$(_pageId+"#stockName").text("");
				var vail=/^[A-Za-z]+$/;
				if(stockCode.length>1 && vail.test(stockCode)){
					if(stockCode.length<2){
						$(_pageId+"#stock_list").html("");
					}
				}else if(stockCode.length>3){
					if(e.keyCode == 8){
						if(stockCode.length == 5){
							$(_pageId+"#stockCode").val("");
							$(_pageId+"#stockName").text("");
						}				
					}else{
						getStockList(stockCode);
					}
					
					if(stockCode.length<4){
						$(_pageId+"#stock_list").html("");
					}
				}else{
					$(_pageId+"#stock_list").html("");
					
				}
//				$(_pageId+".ce_btn #total").hide();
			};
			$.callMessage({"moduleName":"trade","funcNo": "50210", "pageId":"voting_netVote", "eleId":"stockCode", "doneLable":"done", "keyboardType":"2"});
			e.stopPropagation();
		},"click");
		//失去焦点关闭原生键盘
		$.bindEvent($(_pageId + "#stockCode"),function(e){
			$.callMessage({"moduleName":"trade","funcNo": "50211"});
			e.stopPropagation();
		},"blur");
		
		//单击议案序号
		$.bindEvent($(_pageId+"#motionNum"),function(e){
			var stockCode = $(_pageId+"#stockCode").val();
			if(stockCode.length == 0){
				$(_pageId+"#stockCode").focus();
				$.alert("请先输入投票代码");
				$(_pageId+"#motionNum").val("");
			}else{
				
			}
		},"keyup");
		
		$.bindEvent($(_pageId+"#motionNum"),function(e){
			var motionNum = $(_pageId+"#motionNum").val();
			if(motionNum != ""){
				getVoteBillInfo(meeting_seq,Number(motionNum));
			}
			
		},"blur");
		
		//提交按钮
		$.bindEvent($(_pageId+".ce_btn"),function(e){
			vailSubmit();
		});
		
		
	}
	//提交检验
	function vailSubmit(){
		var delegateQuantity = $(_pageId+"#delegateQuantity").val();
		if(vote_type == "P"){
			addVote("0",delegateQuantity);
		}else if(vote_type == "L"){
			addVote(delegateQuantity,"1");
		}
		
	}
	
	/**
	 * 获取股票列表
	 * */
	function getStockList(stockStr){
		if(stockStr != ""){
			if(global.callNative){
				var data = $.callMessage({"moduleName":"self-stock","funcNo": "60101","num":10,"searchKey":stockStr});
			}else{
				var stockStrParam = {
				  "q" : stockStr
				}; 
				service_hq.getStockList(stockStrParam,function(data){
					if(data.errorNo == 0){
						$(_pageId+"#stock_list").html("");
						$(_pageId+"#stockName").text("");
						var results = data.results;
						//显示股票列表
						if(results && results.length > 0){
							if(results.length == 1 && stockStr.length==6){
								$(_pageId+"#stock_list").html("");
								var stockCode = results[0][1];
								var stockName = results[0][0];
								stock_code=stockCode + stockName;
//								$(_pageId+"#stockCode").val((365000+parseInt(stockCode.substr(0,2))));
								getStockMeetingInfo();
//								$(_pageId+"#stockName").text(stockName);
							}else{
								if(results.length >= 6){
									var selectHeight = 6 * 0.44;
								}else{
									selectHeight = 0.44 * results.length;
								}
								var listHtml = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
								for(var i = 0;i < results.length; i++) {
									listHtml += "<li><a href=\"javascript:void(0);\" style=\"padding-left:0.20rem;\"><strong style=\"font-size:0.18rem\">"+results[i][1]+"</strong>"+results[i][0]+"</a>";
								};
								listHtml+="</ul>";
								$(_pageId+"#stock_list").append(listHtml);
								$.bindEvent($(_pageId+".vote_form ul li"),function(){
									stock_code = $(this).find("a").text();
//									var stockCode = $(this).find("strong").text();
									$(_pageId+"#stock_list").html("");
									checkStockCode(stock_code);
									getStockMeetingInfo();
//									getStockInfo(market,stockCode);
								});
							}
						}else{
							$.alert("该股票列表不存在");
						}
					}else{
						$.alert("获取股票列表失败");
					}
				},{"isShowWait":false});
			}
		}	
	} 

	//检测投票证券代码
	function checkStockCode(str){
		var stockName=str.substr(6);
		var stockCode=str.substr(0,6);
		var str1=stockCode.substr(0,1);//主板
		var str2=stockCode.substr(0,3);//中小板
		if(str1 == "6"||str1 == "0"||str2 == "002"){
			$(_pageId+"#stockCode").val((360000+parseInt(stockCode.substr(2))));
			$(_pageId+"#stockName").html(stockName);
			$(_pageId+"#stock_list").html("");
			
		}else if(str2 == "300"){
			$(_pageId+"#stockCode").val((365000+parseInt(stockCode.substr(2))));
			$(_pageId+"#stockName").html(stockName+"投票");
			$(_pageId+"#stock_list").html("");
		}else{
			$.alert("只支持主板、中小板与创业板进行投票");
			clearPage();
		}
	}
	/**
	 * 投票议案信息查询
	 * */
	function getVoteBillInfo(meeting_seq,v_id){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var password = userInfo.password;
		var sessionid = userInfo.session_id;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"meeting_seq":meeting_seq,
				"v_id":v_id,
				"vote_code":""
		};
		service_added.queryVoteBillInfo(param,VoteBillInfoCallback);
	}
	function VoteBillInfoCallback(data){
		if(data.error_no == 0){
			var results = data.results;
			if(results.length==1){
				vote_type = results[0].vote_type;
			}else{
				$.alert("输入议案编号有误");
			}
		}else{
			$.alert(data.error_info);
		}
	}
	
	/**
	 * 股东大会信息查询
	 * */
	function getStockMeetingInfo(){
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var password = userInfo.password;
		var sessionid = userInfo.session_id;
		var exchange_type = userInfo.exchange_type;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"sessionid":sessionid,
				"exchange_type":exchange_type,
				"company_code":stock_code.substr(0,6),
				"vote_code":""
		};
		service_added.queryStockMeetingInfo(param,StockMeetingInfoCallback);
	}
	function StockMeetingInfoCallback(data){
		if(data.error_no == 0){
			var results=data.results;
			if(results.length == 1){
				checkStockCode(stock_code);
//				$(_pageId+"#stockCode").val((365000+parseInt(stock_code.substr(2,6))));
//				$(_pageId+"#stockName").html(stock_code.substr(6)+"投票");
				startTime = results[0].meeting_begin;
				endTime = results[0].meeting_end;
				meeting_seq = results[0].meeting_seq;
			}else{
				$.alert("该股票暂不支持投票，请随时关注最新消息");
				clearPage();
			}
		}else{
			$.alert(data.error_info);
		}
	}
	
	/**
	 * 上交所网络投票
	 * */
	function addVote(vote_number,vote_result){
		
		var entrust_way = global.entrust_way; // 委托方式  在configuration配置
		var branch_no = userInfo.branch_no;	//分支机构
		var fund_account = userInfo.fund_account;	//资产账户
		var cust_code = userInfo.cust_code;	//客户代码
		var password = userInfo.password;
		var exchange_type = userInfo.exchange_type;
		var stock_account = userInfo.stock_account;
		var sessionid = userInfo.session_id;		
		var v_id = $(_pageId+"#motionNum").val();
		var order_group = "";
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"cust_code":cust_code,
				"password":password,
				"exchange_type":exchange_type,
				"stock_account":stock_account,
				"stock_code":stock_code.substr(0,6),
				"sessionid":sessionid,
				"meeting_seq":meeting_seq,
				"v_id":Number(v_id),
				"vote_number":vote_number,
				"vote_result":vote_result,
				"order_group":order_group
		};
		service_added.queryVote(param,addVoteCallback);
	}
	function addVoteCallback(data){
		if(data.error_no == 0){
			clearPage();
		}else{
			$.alert(data.error_info);
		}
	}
	
	function clearPage(){
		startTime="";
		endTime="";
		meeting_seq = "";
		vote_type="";
		stock_code="";
		$(_pageId+"#stockCode").val("");
		$(_pageId+"#motionNum").val("");
		$(_pageId+"#delegateQuantity").val("");
		$(_pageId+"#stockName").text("");
		$(_pageId+"#stock_list").html("");
	}
	
	
	/**
	 * 销毁
	 */
	function destroy(){
		clearPage();
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		$.pageInit("voting/netVote","account/index");
	}
	
	var base = {
		"init" : init,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});