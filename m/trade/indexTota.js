(function(){
	var session = window.sessionStorage;
	window._sysVersion = '1.3.1';
	var _sysBaseUrl = position+'../trade/';
	window._configPath = _sysBaseUrl+'configuration.js?v='+Math.random();
	function includeLinkStyle(url) {
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		link.charset= "utf-8";
		link.href = url;
		document.getElementsByTagName("head")[0].appendChild(link);
	}
	function addCss(a){
		for(var i = 0; i < a.length; i++){
			var url = position + a[i] + "?v=" + _sysVersion;
			includeLinkStyle(url);
		}
	}
	function addJS(a){
		for(var i = 0; i < a.length; i++){
			var url = position + a[i] + "?v=" + _sysVersion;
			document.write(unescape("%3Cscript src='"+url+"' async='async' type='text/javascript'%3E%3C/script%3E"));
		}
	}
	document.write(unescape("%3Cscript src='"+position+"../2.0.0/lib/zepto.min.js?v="+_sysVersion+"' type='text/javascript'%3E%3C/script%3E"));
	addCss(["../2.0.0/css/hsea.min.css"]);
	
	var request = new UrlSearch();
	var cssType = request["cssType"];
	if(cssType){
		sessionStorage._CSSType = cssType;
	}
	else{
		cssType = sessionStorage._CSSType;
	}
	switch(cssType){
		case "1":
			addCss(["css/01/common.css","css/01/style.css"]);
			break;
		default:
			addCss(["css/common.css","css/style.css"]);
			break;
	}
	
	var js = ["../2.0.0/js/hsea.min.js"];
	addJS(js);
	function UrlSearch() {
		var name, value;
		var str = location.href; //取得整个地址栏
		var num = str.indexOf("?")
		str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]
		var arr = str.split("&"); //各个参数放到数组里
		for (var i = 0; i < arr.length; i++) {
			num = arr[i].indexOf("=");
			if (num > 0) {
				name = arr[i].substring(0, num);
				value = arr[i].substr(num + 1);
				this[name] = value;
			}
		}
	}
})()
