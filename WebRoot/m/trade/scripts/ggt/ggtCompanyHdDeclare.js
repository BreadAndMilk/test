/**
 * 港股通公司行为申报
 */
define('trade/scripts/ggt/ggtCompanyHdDeclare.js',function(require, exports, module){
	var keyboard = require("keyboard");
	var common = require("common");
	var gconfig = $.config;
	var global = gconfig.global;
	var service_hq = require("service_hq");
	var service_ggt = require("service_ggt");
	var _pageId = "#ggt_ggtCompanyHdDeclare ";
	var _userInfo = null;
	
	var _stockInfo={
		"stockCode":"",
		"stockName":"",
		"businessType":"",
		"report_type":"",
		"hdCode":"",
		"entrustAmount":""
	};
	
	
	/**
	 * 初始化
	 */
	function init(){
		userInfo = common.getCurUserInfo();
		if(keyboard){
				keyboard.keyInit();
		}
	}
	
	function load(){

	}

	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
			$.pageInit("ggt/ggtCompanyHdDeclare","ggt/ggtOrder",{},true);
			e.stopPropagation();
		});
		

		//下单
		$.bindEvent($(_pageId+"#submitOrder"),function(e){
			//获取页面上的输入参数
			_stockInfo.hdCode=$(_pageId+" #hdCode").val();
			_stockInfo.entrustAmount=$(_pageId+" #entrustAmount").val();
			vailSubmitOrder();
		});
		
		
	$.bindEvent($(_pageId + "#stockCode"), function(e){ // 该监听方法是为了适配浏览器
			if(keyboard){
				keyboard.popUpKeyboard($(this),e);
			}
			var stockCode = $(_pageId+"#stockCode").val();
			if(stockCode != _stockInfo.stockCode){
				_stockInfo.stockCode = stockCode;
				clearMg();
				var vai0 = /^[A-Za-z]+$/;
				var vai1 = /^[\u4e00-\u9fa5]+$/;
				if(stockCode.length > 1 && (vai0.test(stockCode) || vai1.test(stockCode))){ // 当输入的长度大于1 并且为字母的时候
					getStockList(stockCode); // 查询股票列表
				}else if(stockCode.length>2){ // 当输入的长度大于3的时候
					getStockList(stockCode); // 查询股票列表
				}
			}
			e.stopPropagation();
		},"input");
		
		//业务类型，申报类型的选择
		$.bindEvent($(_pageId+".fund_form2 .select_business"),function(e){
			var textArray=["公司收购申报业务回报","公开招股申报业务","供股行权申报业务","红利现金选择权申报业务"];
			var onClickArray=[];
			onClickArray[0]=function() {
				$(_pageId+".fund_form2 .select_business p").text("公司收购申报业务回报");
				_stockInfo.businessType="H63";
			};
			onClickArray[1]=function () {
				$(_pageId+".fund_form2 .select_business p").text("公开招股申报业务");
				_stockInfo.businessType="H64";
			};
			onClickArray[2]=function() {
				$(_pageId+".fund_form2 .select_business p").text("供股行权申报业务");
				_stockInfo.businessType="H65";
			};
			onClickArray[3]=function() {
				$(_pageId+".fund_form2 .select_business p").text("红利现金选择权申报业务");
				_stockInfo.businessType="H66";
			};




			// var button1 = [{
			// 	text:"公司收购申报业务回报",
			// 	onClick: function() {
			// 		$(_pageId+".fund_form2 .select_business p").text("公司收购申报业务回报");
			// 		_stockInfo.businessType="H63";
          	// 	}
			// },{
			// 	text:"公开招股申报业务",
			// 	onClick: function() {
			// 		$(_pageId+".fund_form2 .select_business p").text("公开招股申报业务");
			// 		_stockInfo.businessType="H64";
          	// 	}
			// },{
			// 	text:"供股行权申报业务",
			// 	onClick: function() {
			// 		$(_pageId+".fund_form2 .select_business p").text("供股行权申报业务");
			// 		_stockInfo.businessType="H65";
          	// 	}
			// },
			// {
			// 	text:"红利现金选择权申报业务",
			// 	onClick: function() {
			// 		$(_pageId+".fund_form2 .select_business p").text("红利现金选择权申报业务");
			// 		_stockInfo.businessType="H66";
          	// 	}
			// }];
			var button2 = [{
				 text: '取消',
          	     bg: 'danger'
			}]
			var groups = common.commonButtomSelectCreateParam(textArray,onClickArray,button2);
			if(keyboard){
				keyboard.closeKeyPanel();
			}
      		$.actions(groups);
			e.stopPropagation();
		});
		$.bindEvent($(_pageId+".fund_form2 .select_reportType"),function(e){
			var button1=[{
				text:"申报",
				onClick:function(){
					$(_pageId+".fund_form2 .select_reportType p").text("申购");
					_stockInfo.report_type="HSB";
				}
			},{
				text:"撤销",
				onClick:function(){
					$(_pageId+".fund_form2 .select_reportType p").text("申购");
					_stockInfo.report_type="HSB";
				}
			}];
			var button2 = [{
				 text: '取消',
          	     bg: 'danger'
			}]	
			var groups = [button1, button2];
			if(keyboard){
				keyboard.closeKeyPanel();
			}
      		$.actions(groups);
			e.stopPropagation();
		});
		
		$.bindEvent($("body .modal-overlay-visible"),function(e){
			e.stopPropagation();
		},"touchstart");
	}
	

	function getStockList(stockStr){
		if(stockStr != ""){
				var stockStrParam = {
				  "q" : stockStr,
				  "marketType":"2"
				};
				stockStrParam.type="HK";
				service_hq.getStockList_ggt(stockStrParam,function(data){
					if(data.errorNo == 0){
						$(_pageId+"#stock_list").html("");
						var results = data.results;
						//显示股票列表
						if(results && results.length > 0){
							if(results.length == 1 && stockStr.length==6){
								$(_pageId+"#stock_list").html("");
								var market = results[0][9];
								var stockCode = results[0][1];
							}else{
								if(results.length >= 6){
									var selectHeight = 6 * 0.44;
								}else{
									selectHeight = 0.44*results.length;
								}
								var listHtml = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
								for(var i = 0;i < results.length; i++) {
									var stname=results[i][0]+"";
									listHtml += "<li><a href=\"javascript:void(0);\" style=\"padding-left:0.20rem;\" id=\""+stname+"\"><strong style=\"font-size:0.15rem\">"+results[i][1]+"</strong>"+stname+"</a>";
									listHtml +=	"<span style=\"display:none;\">"+results[i][9]+"</span></li>";
								};
								listHtml+="</ul>";
								$(_pageId+"#stock_list").append(listHtml);
								$.bindEvent($(_pageId+".input_select .stock_list ul li"),function(){
									_stockInfo.market = $(this).find("span").text();
									_stockInfo.stockCode = $(this).find("strong").text();
									_stockInfo.stockName=$(this).find("a").attr("id");
									$(_pageId + "#stockCode .key_text").text(_stockInfo.stockCode);
									$(_pageId + "#stockName").val(_stockInfo.stockName);
									$(_pageId+"#stock_list").html("");
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
	
	
	//清除用户输入的数据.
	function clearMg(){
		$(_pageId+"#stock_list").html("");
		$(_pageId+" #stockName").val("");
		$(_pageId+" #hdCode").val("");
		$(_pageId+" #entrustAmount").val("");
		$(_pageId+".select_business p").text("请选择...");
		$(_pageId+" .select_reportType p").text("请选择...");
	}
	
	
	
	//下单验证
    function vailSubmitOrder(){
    	var stockCode = _stockInfo.stockCode;
		if(stockCode.length == 0){
			$.alert("请输入股票代码");
			return false;
		}	
		if(stockCode.length <5){
			$.alert(-1,"股票代码输入错误");
			return false;
		}
		//验证业务类型
		if(!_stockInfo.businessType){
			$.alert("请选择业务类型");
			return false;
		}
		//校验行为代码
		if(!_stockInfo.report_type){
			$.alert("请选择申报类型");
			return false;
		}
		if(!_stockInfo.hdCode){
			$.alert("请输入行为代码");
			return false;
		}
		//判断输入的申报数量
		if(!_stockInfo.entrustAmount){
			$.alert("请输入申报数量");
			return false;
		}
		if(_stockInfo.entrustAmount<=0){
			$.alert("申报数量要大于0");
			return false;
		}
		
		//定义弹出层确认
		var tipStr ="<div>";
		var tipStrArray = [];
		tipStr+="<h3>公司行为申报</h3>";
		tipStr+="</div>";
		tipStr+="<div>";
		tipStrArray.push(["证券代码 :",_stockInfo.stockCode]);
		tipStrArray.push(["证券名称 :",_stockInfo.stockName]);
		tipStrArray.push(["业务类型 :",_stockInfo.businessType]);
		tipStrArray.push(["申报类型 :",_stockInfo.report_type]);
		tipStrArray.push(["行为代码 :",_stockInfo.hdCode]);
		tipStrArray.push(["申报数量 :",_stockInfo.entrustAmount]);
		tipStr+=common.generatePrompt(tipStrArray);

		tipStr+="</div>";
		//根据选择的申报类型改变输入的数量
		common.iConfirm("",tipStr,function success(){
	    var entrust_way =global.entrust_way;                    
		var branch_no = userInfo.branch_no;	  
		var fund_account=userInfo.fund_account;           
		var stock_code=_stockInfo.stockCode;
		var cust_code=userInfo.cust_code;
        var sessionid=userInfo.session_id;
        var stock_account=userInfo.stock_account;
        var business_type=_stockInfo.businessType;
        var report_type=_stockInfo.report_type;
        var corpbehavior_code=_stockInfo.hdCode;
        var report_amount=_stockInfo.entrustAmount;
		var param = {
				"entrust_way":entrust_way,
				"branch_no":branch_no,
				"fund_account":fund_account,
				"stock_code":stock_code,
				"cust_code":cust_code,
				"sessionid":sessionid,
				"stock_account":stock_account,
				"business_type":business_type,
				"report_type":report_type,
				"corpbehavior_code":corpbehavior_code,
				"report_amount":report_amount
			};
		service_ggt.ggtCompanyHdDeclareEntrust(param,CallBack);
  	});
  }
    
    function CallBack(data){
    	if(data.error_no == 0){
			var results = data.results;
			if(results && results.length>0){
				$.alert(data.error_info);
				clearMsg();
			}
		}else{
			$.alert(data.error_info);
			clearMg();
		}
		$(_pageId+"#stockCode").quzhi("");
  }
    
	
	function pageBack(){
		$.pageInit("ggt/ggtCompanyHdDeclare","ggt/ggtOrder",{},true);
	}
	
	/***
	 * 销毁
	 */
	function destroy(){
		 
		clearMg();
		$(_pageId + " #stockCode .key_text").text("");
		$(_pageId + " #stockCode em").text("");
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
