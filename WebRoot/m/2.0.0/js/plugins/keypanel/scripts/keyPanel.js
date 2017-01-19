/*
作者：   Alt+ 
 时间： 2016-07-06 18:46:27 PM 
*/
define("2.0.0/js/plugins/keypanel/scripts/keyPanel.js", function(require, exports, module) {
	function a() {
		return n = Object.create({
			init: b,
			close: j,
			get version() {
				return "1.0.2"
			},
			get updateDate() {
				return "2015-10-13 15:46:40"
			}
		})
	}

	function b(a, b, f, g) {
		l();
		var h = function() {
			n.keyPanelType = b, n.config = g || {}, n.$input = $(a), n.$inputEM = n.$input.find("em"), n.inputPlaceholder = n.$input.attr("data-placeholder") || n.$input.attr("placeholder") || "", n.$input.maxlength = n.$input.attr("maxlength") || 1e5, n.isPassword = "undefined" == typeof f ? !1 : f, b = "2.0.0/js/plugins/keypanel/scripts/keyType"+b+".js", require.async(b, function(a) {
				d(), "function" == typeof n.config.beforeInitFunc && n.config.beforeInitFunc(), e(), "function" == typeof n.config.afterInitFunc && n.config.afterInitFunc()
			})
		};
		c(g.skinName, h)
	}

	function c(a, b) {
		var c = "";
		switch(a = a || "default") {
			case "default":
				c = "2.0.0/js/plugins/keypanel/css/keypanel_keyword_default.css";
				break;
			case "white":
				c = "2.0.0/js/plugins/keypanel/css/keypanel_keyword_white.css";
				break;
			case "black":
				c = "2.0.0/js/plugins/keypanel/css/keypanel_keyword_black.css";
				break;
			case "default2":
				c = "2.0.0/js/plugins/keypanel/css/keypanel_keyword_default2.css"
		}
		$("head>link[href*='plugins/keypanel/css/keypanel_keyword']").each(function() {
			-1 === $(this).attr("href").indexOf(c) && $(this).remove()
		}), 0 === $("head>link[href*='plugins/keypanel/css/keypanel_keyword']").length ? $.loadCss(c, b) : b && b()
	}

	function d() {
		var i = (n.keyPanelType = n.keyPanelType || "1", Number(n.keyPanelType));
		if($["keyType"+i]){
			n.keyPanelHtml = $["keyType"+i].createKeyPanelHtml(), n.keyPanelId = $["keyType"+i].keyPanelId;
		}
		else{
			$.alert('没有keyType'+i+"js文件");
		}
	}

	function e() {
		n.$keyPanel = $("#" + n.keyPanelId), "DIV" == n.$input[0].tagName && 0 == n.$inputEM.length ? (n.$input.html("<em></em>"), n.$inputEM = n.$input.find("em")) : "DIV" == n.$input[0].tagName && 1 == n.$inputEM.length && n.$inputEM.html() == n.inputPlaceholder && (n.$inputEM.html(""), n.$input.attr("value", ""), n.$input.val("")), n.$keyPanel.length <= 0 && (n.$keyPanel = $(n.keyPanelHtml), $("body").append(n.$keyPanel)), n.$keyPanel.css("display", "block"), setTimeout(k, 20), n.$input.removeAttr("data-placeholder").attr("placeholder", n.inputPlaceholder), n.$input.addClass("active"), n.$keyPanel.siblings(".keyword_table").css("display", "none"), f()
	}

	function f() {
		var a = $.device.pc ? "mousedown" : "touchstart",
			b = $.device.pc ? "mouseup" : "touchend";
		$.bindEvent(n.$keyPanel, function(a) {
			a.preventDefault(), a.stopPropagation()
		}, "touchmove"), $.bindEvent(n.$keyPanel.find("a"), function(a) {
			$(this).hasClass("capital") || $(this).addClass("active"), a.stopPropagation(), a.preventDefault()
		}, a), $.bindEvent(n.$keyPanel.find("a"), function(a) {
			$(this).removeClass("active"),$(this).triggerHandler("blur"), a.stopPropagation()
		}, "touchcancel"), $.bindEvent(n.$keyPanel.find("a"), function(a) {
			$(this).hasClass("capital") || $(this).removeClass("active"),$(this).triggerHandler("blur"), g($(this)), a.stopPropagation()
		}, b)
	}

	function g(a) {
		var b = a.html(),
			c = null,
			d = null;
		if(n.$inputEM.length < 1 && (n.$inputEM = $("<em></em>"), n.$input.attr("value", ""), n.$input.val("")), d = n.$inputEM.html(), c = null === n.$input.attr("value") || "undefined" == typeof n.$input.attr("value") ? "" : n.$input.attr("value"), a.hasClass("hide")) j();
		else if(a.hasClass("space")) d += b, c += " ", n.$inputEM.html(d), n.$input.attr("value", c), n.isPassword && n.$inputEM.html(d.replace(/(&nbsp;)$/, "*")), c.length > n.$input.maxlength && i(d, c), m && (m = null), m = document.createEvent("Event"), m.initEvent("input", !0, !0), m.detail = {
			optType: "space",
			curValue: " "
		}, n.$input[0].dispatchEvent(m);
		else if(a.hasClass("del")) i(d, c), m && (m = null), m = document.createEvent("Event"), m.initEvent("input", !0, !0), m.detail = {
			optType: "del"
		}, n.$input[0].dispatchEvent(m);
		else if(a.hasClass("max") || a.hasClass("half")) {
			var e = n.$input.attr("max-value");
			for(e = null === e || "undefined" == typeof e ? 100 : +e, b = a.hasClass("max") ? e : e / 2, n.$inputEM.html(b), n.$input.attr("value", b), n.isPassword && n.$inputEM.html(n.$inputEM.html().replace(/[a-zA-Z0-9\.]/g, "*")); c.length > n.$input.maxlength;) i(d, c), c = n.$input.attr("value"), d = n.$inputEM.html();
			m && (m = null), m = document.createEvent("Event"), m.initEvent("input", !0, !0), m.detail = {
				optType: "normal",
				curValue: b
			}, n.$input[0].dispatchEvent(m)
		} else if(a.hasClass("n123")) "true" === n.$input.attr("is-stock-input") ? n.init(n.$input[0], 5, n.isPassword, n.config) : n.init(n.$input[0], 2, n.isPassword, n.config);
		else if(a.hasClass("abc")) n.init(n.$input[0], 4, n.isPassword, n.config);
		else if(a.hasClass("abcL")) n.init(n.$input[0], 11, n.isPassword, n.config);
		else if(a.hasClass("n123L")) n.init(n.$input[0], 10, n.isPassword, n.config);
		else if(a.hasClass("ok")) j(), "function" == typeof n.config.okFunc && n.config.okFunc();
		else if(a.hasClass("clear")) n.$inputEM.html(""), n.$input.attr("value", ""), n.$input.val(""), m && (m = null), m = document.createEvent("Event"), m.initEvent("input", !0, !0), m.detail = {
			optType: "clear",
			curValue: ""
		}, n.$input[0].dispatchEvent(m);
		else if(a.hasClass("capital")) a.toggleClass("active"), h(a);
		else if(/^\d{3}$/g.test(b) && 3 === b.length) {
			for(d += b, c += b, n.$inputEM.html(d), n.$input.attr("value", c), n.isPassword && n.$inputEM.html(d.replace(/\d$/, "*")); c.length > n.$input.maxlength;) i(d, c), c = n.$input.attr("value"), d = n.$inputEM.html();
			m && (m = null), m = document.createEvent("Event"), m.initEvent("input", !0, !0), m.detail = {
				optType: "stock",
				curValue: b
			}, n.$input[0].dispatchEvent(m)
		} else a.hasClass("keyDiv") ? (m && (m = null), m = document.createEvent("Event"), m.initEvent("input", !0, !0), m.detail = {
			optType: "keyDiv",
			keyDiv: a
		}, n.$input[0].dispatchEvent(m)) : (b = "·" === b ? "." : b, d += b, c += b, n.$inputEM.html(d), n.$input.attr("value", c), n.isPassword && n.$inputEM.html(d.replace(/[a-zA-Z0-9\.]/, "*")), (c.length > n.$input.maxlength || "." === c || c.indexOf(".") != c.lastIndexOf(".")) && i(d, c), m && (m = null), m = document.createEvent("Event"), m.initEvent("input", !0, !0), m.detail = {
			optType: "normal",
			curValue: b
		}, n.$input[0].dispatchEvent(m))
	}

	function h(a) {
		var b = n.$keyPanel.find("a");
		b.each(function() {
			var b = $(this).html();
			1 === b.length && /[a-zA-Z]/.test(b) && (b = a.hasClass("active") ? b.toUpperCase() : b.toLowerCase(), $(this).html(b).attr("key", b))
		})
	}

	function i(a, b) {
		a.length > 0 && (a = /.*&nbsp;+$/.test(a) ? a.slice(0, -6) : a.slice(0, -1), b = b.slice(0, -1), n.$inputEM.html(a), n.$input.attr("value", b), n.$input.val(b))
	}

	function j() {
		n.$keyPanel && n.$keyPanel.length > 0 && (l(), "function" == typeof n.config.beforeCloseFunc && n.config.beforeCloseFunc(), n.config.isSaveDom || "undefined" == typeof n.config.isSaveDom ? n.$keyPanel.css("display", "none") : n.$keyPanel.remove(), n.$keyPanel = null, "function" == typeof n.config.afterCloseFunc && n.config.afterCloseFunc())
	}

	function k() {
		var a = n.$input.parents('[key-panel-main="true"]');
		if(a && a.length > 0) {
			var b = n.$input.offset().top,
				c = n.$input.height(),
				d = n.$keyPanel.offset().top,
				e = b + c + 20 - d,
				f = a.css("margin-top").slice(0, -2);
			n.inputMainExtraOffset = e, n.$inputMain = a, e > 0 && n.$inputMain.css("margin-top", +f - n.inputMainExtraOffset + "px")
		}
	}

	function l() {
		if(n && n.$input && n.$input.length > 0) {
			var a = n.$input.attr("value");
			if("DIV" !== n.$input[0].tagName || "" !== a && null !== a && "undefined" != typeof a || n.$inputEM.html(n.$input.attr("placeholder")), n.$input.removeClass("active"),n.$input.triggerHandler("blur"), n.$inputMain && n.$inputMain.length > 0 && n.inputMainExtraOffset > 0) {
				var b = n.$inputMain.css("margin-top").slice(0, -2);
				n.$inputMain.css("margin-top", +b + n.inputMainExtraOffset + "px"), n.$inputMain = null, n.inputMainExtraOffset = 0
			}
		}
	}
	var m = null,
		n = null;
	$.KeyPanel = a
});
/*出品单位：深圳市思迪信息技术股份有限公司-前端Html5开发小组*/