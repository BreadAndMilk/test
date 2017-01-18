/**
 * 买入
 */
define('trade/scripts/ggt/ggtBuy.js',function(require, exports, module) {
	
	var ggtOrder = require("ggtOrder");
	var common = require("common");
	var _pageId = "#ggt_ggtBuy ";
	
    /**
     * 初始化
     */
	function init(){
		var userInfo = common.getCurUserInfo();
		if(!userInfo || !userInfo.cust_code){
			$.pageInit("ggt/ggtBuy","account/login",$.getPageParam());
			return false;
		}
		var orderType = "1"; // 1 ，买入  2，卖出  3，融资买入 4，融券卖出  5，普通买入 6，普通卖出 7，买券还券 8，卖券还款
		ggtOrder.dataInit(_pageId,orderType);
    }

    function load() {
		var mainHeight =  common.setMainHeight(_pageId, false);
		var height_table =  mainHeight  - $(_pageId + ".trade_main").outerHeight(true) - $(_pageId + ".fund_table").css("margin-top").slice(0, -2);
		$(_pageId + ".fund_table").css({"overflow":"auto","height":height_table});
	}

	/**
	 * 事件绑定
	 */
	function bindPageEvent(){
		ggtOrder.elementBindEvent();
		common.bindStockEvent($(_pageId+".tab_nav ul li a"),
			function(pageCode,topage){
				$.pageInit(pageCode,topage,$.getPageParam(),'',true);
			});
	}

	function commonParentNode(oNode1, oNode2) {
		var nodes1=[];
		var nodes2=[];
		var flag=true;
		while (flag){
			var parent1=oNode1.parentElement();
			nodes1.push(parent1);
			if(parent1.nodeName=="html"){
				flag=false;
			}
		}
		flag=true;
		while (flag){
			var parent2=oNode2.parentElement();
			nodes2.push(parent2);
			if(parent2.nodeName=="html"){
				flag=false;
			}
		}
		for(var i=nodes1.length-1,j=nodes2.length-1;i>=0,j>=0;i--,j--){
			if(nodes1[i].nodeName=nodes2[j].nodeName){
				return nodes1[i];
			}
		}
		return -1;  //没有找到
	}


	/**
	 * 数据重置
	 */
	function destroy(){
		//common.saveRecords("4001");
		ggtOrder.dataDestroy();
	}
	
	/**
	 * 重写框架里面的pageBack方法
	 */
	function pageBack(){
		ggtOrder.orderPageBack();
	}
	
	var base = {
		"init" : init,
		"load":load,
		"bindPageEvent": bindPageEvent,
		"destroy": destroy,
		"pageBack": pageBack
	};
	module.exports = base;
});