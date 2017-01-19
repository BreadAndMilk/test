/**
 * 键盘js
 */
define('trade/scripts/common/keyboard.js', function(require, exports, module) {
	var gconfig = $.config;
	var global = gconfig.global;
    require('keyPanel'); // 首先引入 keyPanel 插件
	var myKeyPanel = new $.KeyPanel(); // 创建与当前页面对应的 keyPanel 对象
	
	/**
	 * 每个页面校验
	 */
	function keyInit(inputValue){
		keyDestroy();
		keypanel(inputValue);
	}
	
	function setDiv(_pageId){
		var jpMap = {"telephone":"1","number":"6","tel":"7","english":"4","shares":"5","password2":"m2","password8":"m8"};
		var inputKey = $(_pageId+' input[js-key]');
		inputKey.attr("readonly","readonly");
		for(var i = 0; i < inputKey.length; i++){
			var inp = inputKey.eq(i);
			if(inp.next("div.jsKey").length == 0){
				var typeName = inp.attr("js-key");
				var type = jpMap[typeName];
				var id = inp.attr("id");
				var css = inp.attr("class");
				var placeholder = inp.attr("placeholder");
				var maxlength = inp.attr("maxlength");
				var div = [];
				if(type == "5"){
					div.push("<div is-stock-input='true' id='");
				}
				else{
					div.push("<div id='");
				}
				div.push(id);
				div.push("' class='");
				div.push(css);
				div.push(" jsKey' key-type='");
				div.push(type);
				div.push("' maxlength='");
				div.push(maxlength);
				div.push("'><em style='display: none;'></em><div ");
				if(inp.css("text-align") == "right"){
					div.push("style='right: 5px;' ");
				}
				div.push("class='key_input");
				if(type.indexOf("m") != -1){
					div.push(" key_pwd");
				}
				div.push("'><div class='key_text'></div><div class='key_cursor'></div></div>");
				if(placeholder){
					div.push("<div class='" + css + " key_place'>" + placeholder + "</div>");
				}
				div.push("</div>");
				inp.hide();
				inp.after(div.join(""));
			}
		}
	}

	/**
	 * 设置键盘公共方法
	 * @param {Object} data
	 */
	function keypanel(inputValue){
		var _pageId = "#"+$.getCurrentPageObj().pageId;
		var appMap = {"1":"3","6":"3","7":"6","4":"1","5":"2","m2":"5","m8":"4"};
		setDiv(_pageId);
		
		/**
		 * 点击页面其他地方隐藏键盘
		 */
		$.bindEvent($(_pageId), function(e){
			if(global.callNative){
				$.callMessage({"moduleName":"trade","funcNo": "50211"});
			}
		    myKeyPanel.close();
		    $(_pageId + " div.jsKey").removeClass("active");
		});
		
		/**
		 * 键盘输入事件
		 */
		$.bindEvent($(_pageId + " div.jsKey"), function(e){
			var a = e.detail;
			popUpKeyboard($(this),e);
		    e.stopPropagation();
		}, "input");
		
		/**
		 * 点击输入框
		 */
		$.bindEvent($(_pageId + " div.jsKey"), function(e){
			var keyPanelType = $(this).attr("key-type");
		    $(this).addClass("active").siblings().removeClass("active");
			if(!global.callNative){
				var isPassword = false;
			    var keyPanelConfig = {
			            beforeInitFunc: function(){
			            	
			            },
			            afterInitFunc: function(){
			            	
			            },
			            beforeCloseFunc: function(){
			            	
			            },
			            afterCloseFunc: function(){
			            	
			            },
			            isSaveDom: true, // 是否保存键盘 DOM 在页面中
						skinName:'default2',//目前皮肤包括black，white,default,default2,缺省是default
						okFunc : function() { // 点击键盘确定按钮绑定的方法
							if(inputValue){
								inputValue();
							}// 根据值搜索对应股票
						}
			    };
				if(keyPanelType.indexOf("m") != -1){
					keyPanelType = keyPanelType.replace("m","");
					isPassword = true;
					keyPanelConfig.isSaveDom = false;
				}
			    myKeyPanel.init(this, keyPanelType, isPassword, keyPanelConfig); // 执行初始化
			}
			else{
				var pageId = _pageId.substring(1,_pageId.length-1);
				var eleId = $(this).attr("id");
				var keyboardType = appMap[keyPanelType];
				$.callMessage({"moduleName":"trade","funcNo": "50210", "pageId":pageId, "eleId":eleId, "doneLable":"done", "keyboardType":keyboardType});
			}
		    e.stopPropagation();
		});
		
	}
	
	function popUpKeyboard(jsKey, e){
		var type = jsKey.attr("key-type") || "";
		var op_str = jsKey.attr("value");
  		var key_text = jsKey.find("div.key_input div.key_text");
		var inp = jsKey.prev("input");
		if(op_str.length == 0){
			jsKey.find("div.key_place").show();
		}else{
			jsKey.find("div.key_place").hide();
		}
		if(type.indexOf("m") != -1){
			var pwdDiv = '';
			for(var i = 0; i < op_str.length; i++){
				pwdDiv += "<b></b>";
			}
			key_text.html(pwdDiv);
		}
		else{
			key_text.html(op_str);
		}
		inp.val(op_str);
	}
	
	function keyDestroy(){
		if(global.callNative){
			$.callMessage({"moduleName":"trade","funcNo": "50211"});
		}
		var _pageId = "#"+$.getCurrentPageObj().pageId;
		myKeyPanel.close();
		$(_pageId + " div.jsKey").removeClass("active");
		$(_pageId + " div.jsKey").val("").attr("value","");
		$(_pageId + " div.jsKey em").text("");
		$(_pageId + " div.jsKey").find("div.key_input div.key_text").html("");
		$(_pageId + " div.jsKey").find("div.key_place").show();
	}
	
	function closeKeyPanel(){
		if(global.callNative){
			$.callMessage({"moduleName":"trade","funcNo": "50211"});
		}
		myKeyPanel.close();
		$(" div.jsKey").removeClass("active");
	}
	var base = {
    	"keyInit": keyInit,
    	"closeKeyPanel": closeKeyPanel,
    	"popUpKeyboard": popUpKeyboard,
    	"keyDestroy": keyDestroy
    };
    if(!global.startJSkeyboard && !global.callNative){
    	base = null;
    }

    module.exports = base;
});