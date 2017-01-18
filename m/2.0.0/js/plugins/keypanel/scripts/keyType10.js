define('2.0.0/js/plugins/keypanel/scripts/keyType10.js',function (require, exports, module) {
/**
 * 持仓数字键盘
 */
+ function($) {
	var keyPanelId = "KeyPanel10",
		aKeyPanelHtml = null;
	
	/**
	 * 创建键盘字符串
	 */
	function createKeyPanelHtml()
	{
		if(aKeyPanelHtml)
		{
			aKeyPanelHtml = null;
		}
		aKeyPanelHtml = [];
		var a = [1,2,3,4,5,6,7,8,9,0];
		var c = [];
		var b = [];
		for(var i = 10; i > 0; i--){
			var t =	Math.floor(Math.random() * i);
			var v = a[t];
			a[t] = undefined;
			for(var e = 0; e < a.length; e++){
				if(a[e] != undefined){
					c.push(a[e]);
				}
			}
			a = c;
			c = [];
			b.push(v);
		}
		aKeyPanelHtml.push('<div id="KeyPanel10" class="keyword_table">');
		aKeyPanelHtml.push('<table width="100%" border="0" cellspacing="0" cellpadding="0" class="number">');
		aKeyPanelHtml.push('<tbody><tr>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[0]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[1]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[2]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)" class="del"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 84 84" enable-background="new 0 0 84 84" xml:space="preserve"><rect opacity="0.5" fill="none" width="84" height="84"></rect><g><g><path fill="#E6E6E6" d="M76,25v34H23L8.9,42L23,25H76 M79,22H21.6L5,42l16.6,20H79V22L79,22z"></path></g><polygon fill="#E6E6E6" points="41.3,53 49.6,44.7 57.9,53 60.6,50.3 52.3,42 60.6,33.7 57.9,31 49.6,39.3 41.3,31 38.6,33.7 ');
		aKeyPanelHtml.push('46.9,42 38.6,50.3 	"></polygon></g></svg></a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('<tr>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[3]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[4]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[5]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)" class="btn clear">清空</a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('<tr>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[6]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[7]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[8]+'</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)" class="btn hide">隐藏</a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('<tr>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)" class="btn abcL">ABC</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">'+b[9]+'</a></td>');
		aKeyPanelHtml.push('<td colspan="2"><a herf="javascript:void(0)" class="btn ok">确 定</a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('</tbody></table>');
		aKeyPanelHtml.push('</div>');

		return aKeyPanelHtml.join("");
	}
	
	var keyType10 = {
		createKeyPanelHtml: createKeyPanelHtml,
		keyPanelId: keyPanelId
	}

	$.keyType10 = keyType10;	
}($);
});