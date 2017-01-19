/**
 *  担保品转入
 */
define('trade/scripts/credit/transferred/collateralTransferIn.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
    var _pageId = "#credit_transferred_collateralTransferIn ";
    var common = require("common");
    var external = {"callMessage":function(){}};
	var	VIscroll = require("vIscroll");
    var	vIscroll = {"scroll":null,"_init":false};	//上下滑动
    var	service_credit = require("service_credit");
    var userInfo = null;
    var positionData = {};
    /**
     * 初始化
     */
	function init(){
		userInfo = common.getCurUserInfo();
		common.bindStockEvent($(_pageId + '.toggle_nav ul li a'),true);
    }
	
	function load(){
		var mianHeight = common.setMainHeight(_pageId, false);
	 	//交易持仓查询（划入）
		callsQuery();
	}
	
	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		//返回按钮
		$.bindEvent($(_pageId+".top_title .icon_back"), function(e){
//			$.pageInit("credit/transferred/collateralTransferIn","credit/transferred/collateralTransfer",{});
			$.pageBack("credit/transferred/collateralTransfer","left");
			e.stopPropagation();
		});
		//查询按钮
		$.bindEvent($(_pageId+".top_title .noicon_text"), function(e){
			$.pageInit("credit/transferred/collateralTransferIn","credit/transferred/transactionQuery",{});
			e.stopPropagation();
		});
	}
	
	/**
	 * 调用查询
	 */
	function callsQuery(){
		$(_pageId+" #append").html("");
		$(_pageId+".no_data").hide();
		queryTradePosition();
	}
	
	/**
	 * 交易持仓查询
	 */
    function queryTradePosition(){
		/**
		 * 担保信息查询(划入信息查询)
		 */
    	var param = {
				entrust_way: global.entrust_way, // 委托方式  在configuration配置
				branch_no: userInfo.branch_no, // 分支机构
				cust_code: userInfo.cust_code, // 客户编号
				fund_account:userInfo.fund_account,//资金账号（普通）
				sessionid: userInfo.session_id, // 会话号
				stock_account: "", // 证券账号
				stock_code: "", // 股票代码
		   };
    	if(global.serverConfig=="2"){
    		var stockInfo = common.getTransferInfo();//获取登陆后保存的普通账户信息
    		param.cust_code = stockInfo.cust_code;
    		param.fund_account = stockInfo.fund_account;
    		param.password = stockInfo.password;
    	}
		service_credit.transferInPostion(param,queryMsgCallBack);
    }
    /**
     * 查询信息回调函数
     */
    function queryMsgCallBack(data){
    	if(data){
			if(data.error_no == 0){
				var results = data.results;
				if(results && results.length>0){
					var html = ""
					for (var i=0;i<results.length;i++){
						positionData[""+results[i].stock_code] = results[i];
						html += creatHtml(results[i]);
					}
					$(_pageId + " #append").html(html);
					
					//划出按钮
					$.bindEvent($(_pageId+" .mar_stock .part"), function(e){
						var stockCode = $(this).attr("data-stock");//股票代码
						var codeInfo = positionData[stockCode];
						creatBoxHtml(codeInfo);
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
    function creatHtml(element){
    	var eleHtml = "";
		var cssClass = "";
		if(element.last_price > element.cost_price){
			cssClass = "ared";
		}else if(element.last_price < element.cost_price){
			cssClass = "agreen";
		}else{
			cssClass = "";
		}
		var float_vk = Number(element.float_yk).toFixed(2);
		if(float_vk > 0){
			float_vk = "+" + float_vk;
		}
		var float_yk_per = element.float_yk_per;
		eleHtml +=	"<div class='part' data-stock="+element.stock_code+">"
    	eleHtml += '<h5>'+element.stock_name+' <small>'+element.stock_code+'</small></h5>';
    	eleHtml += '<dl class="clearfix">';
        eleHtml += '<dt><strong class="'+cssClass+'">'+Number(element.last_price).toFixed(2)+'</strong><p>';
        eleHtml += '<span class="'+cssClass+'">'+float_vk+'</span><span class="'+cssClass+'">'+float_yk_per+'</span></p></dt>';
        eleHtml += '<dd><p><em>成本</em> '+Number(element.cost_price).toFixed(2)+'</p><p><em>持仓</em> '+Number(element.cost_price).toFixed(2)+'</p></dd>';
        eleHtml += '<dd><p><em>折算率</em> '+Number(element.cost_price).toFixed(2)+'</p><p><em>市值</em> '+Number(element.cost_price).toFixed(2)+'</p></dd>';
    	eleHtml += '</dl></div>';
		return eleHtml;
    }
    /**
     * 生成划入弹出框
     */
    function creatBoxHtml(codeInfo){
		var tipStr = "<div class='pop_nums' >";
		tipStr += '<div class="pop_main" style="margin: 10px;"><div class="input_text text">';
		tipStr += '<label>最大可转</label><input type="text" class="t1" value="'+codeInfo.enable_amount;
		tipStr += '" readonly="readonly"/><a href="javascript:void(0);" class="all">全部</a>';
		tipStr += '</div><div class="input_box"><label>转入数量</label>';
		tipStr += '<div class="input_value">';
    	tipStr += '<input type="tel" class="t1"/></div></div></div></div>';
		common.iConfirm("转入",tipStr,function($html){
			var num = $html.find(".input_value input").val();
			codeInfo.entrust_amount = num;
			getStockMsg(codeInfo);//股票联动，获取信息
		},null,"提交","取消",function($html){
			var canTurnNun = $html.find(".input_text input").val();
			var num = $html.find(".input_value input").val();
			if(!num || num.length == 0){
				$.alert("请输入数量");
				return false;
			}
			else if(num <= 0){
				$.alert("请输入数量大于0");
				return false;
			}
			else if(num > Number(canTurnNun)){
				$.alert("划出数量大于可划数量");
				return false;
			}else{
				return true;
			}
		});
		$.bindEvent($(_pageId+".pop_nums .input_text .all"),function(e){
			var all = $(this).prev("input").val();
			$(this).parents(".input_text").next(".input_box").find(".input_value input").val(all);
			e.stopPropagation();	// 阻止冒泡
		});
    }
     /**
     * 股票联动，获取信息
     */
    function getStockMsg(codeInfo){
    	var  param={};
    	var stockInfo = common.getTransferInfo() || {};//获取登陆后保存的普通账户信息
		param.branch_no= stockInfo.branch_no || userInfo.branch_no;//分支机构（普通）
		param.fund_account = stockInfo.fund_account || userInfo.fund_account;; //资金账号（普通）
		param.cust_code= stockInfo.cust_code || userInfo.cust_code;//客户编号
		param.password = userInfo.password;//密码
		param.stock_account = codeInfo.stock_account;//证券账号
		param.exchange_type = codeInfo.exchange_type;//交易类别（见数据字典）
		param.entrust_way = global.entrust_way; // 委托方式  在configuration配置
		param.branch_no_crdt = userInfo.branch_no;//分支机构（信用）
		param.fund_account_crdt = userInfo.fund_account;//资金账户（信用）
		param.client_id_crdt = userInfo.cust_code;//客户编号（信用）
		param.password_crdt = userInfo.password; // 信用账户交易密码
		param.sessionid="";//会话
		param.cost_price = codeInfo.cost_price;//成本价格
		param.last_price = codeInfo.last_price;//现价
		param.stock_code = codeInfo.stock_code;//证券代码
		param.entrust_amount = codeInfo.entrust_amount;//过户数量
		param.stock_account_crdt = userInfo.stock_account;//证券账号（信用）
		param.entrust_bs = "0";//买卖方向（76：买入--普转信，77：卖出--信转普）
		service_credit.dbin_link(param, function(data){
			getStockMsgCallback(data, codeInfo)
		});
    }
    /**
     * 股票联动回调函数
     */
    function getStockMsgCallback(data, codeInfo){
    	if(data.error_no == "0"){
    		var result = data.results[0];
    		stockTransIn(codeInfo,result);
    	}else{
    		$.alert(data.error_info);
    		return false;
    	}
    }
    /**
	 * 划转操作
	 */
	function stockTransIn(codeInfo,result)
	{
		var  param={};
		var stockInfo = common.getTransferInfo() || {};//获取登陆后保存的普通账户信息
		param.branch_no = stockInfo.branch_no || userInfo.branch_no;//分支机构（普通）
		param.fund_account = stockInfo.fund_account || userInfo.fund_account;//资金账号（普通）
		param.cust_code = stockInfo.cust_code || userInfo.cust_code;//客户编号
		param.password = stockInfo.password;//密码
		param.entrust_way = global.entrust_way; // 委托方式  在configuration配置
		param.password_crdt = userInfo.password; // 信用账户交易密码
		param.sessionid="";//会话
		param.seat_no= result.seat_no;//席位编号（普通）
		param.stock_code = codeInfo.stock_code;//证券代码
		param.branch_no_crdt = userInfo.branch_no;//分支机构（信用）
		param.client_id_crdt = userInfo.cust_code;//客户编号（信用）
		param.fund_account_crdt = userInfo.fund_account;//资金账户（信用）
		param.entrust_amount = codeInfo.entrust_amount;//过户数量
		param.stock_account_crdt = result.stock_account_crdt || userInfo.stock_account;//证券账号（信用）    s|| $.trim(codeInfo.stock_account)
		param.stock_account = result.stock_account || stockInfo.stock_account || userInfo.stock_account;//证券账号（普通）
		param.exchange_type = result.exchange_type;//交易类别（见数据字典）
		param.seat_no_crdt = result.seat_no_crdt;//席位编号（信用）
		param.cost_price = result.cost_price;//成本价格
		param.last_price = result.last_price;//现价
		param.entrust_bs = "0";//买卖方向（0：买入--普转信，1：卖出--信转普）
		service_credit.dbin_sub(param, transCallback);
	}
	/**
	 * 划入回调函数
	 */
	function transCallback(data){
		if(data.error_no == "0"){
			$.alert("委托成功，委托编号为："+data.results[0].entrust_no+"，T+1日到账",function(){
				queryTradePosition();
			});
			$(" #inputPopLayer").remove();
		}else{
			$.alert(data.error_info,function(){
				queryTradePosition();
			});
		}
	}
    
	/**
	 * 初始化滑动组件
	 */
	function initVIScroll(){
		if(!vIscroll._init){
			var config = {
					"isPagingType": false,//false表示是微博那种累加形式，true表示分页形式
					"visibleHeight": $(window).height() - $(_pageId+".top_title").height()- $(_pageId+".toggle_nav").height()- 25 ,//显示内容区域的高度，当isPaingType为false时传
					"container": $(_pageId+"#v_container_funds_jj"),	
					"wrapper":$(_pageId+"#v_wrapper_funds_jj"),	
					"downHandle": function() {
						callsQuery();
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
		$(_pageId+ ".no_data").hide();
		stockCodeOut = "";
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