define('2.0.0/js/plugins/keypanel/scripts/keyType7.js',function (require, exports, module) {
/**
 * 持仓数字键盘
 */
+ function($) {
	var keyPanelId = "KeyPanel7",
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
		
		aKeyPanelHtml.push('<div id="KeyPanel7" class="keyword_table">');
		aKeyPanelHtml.push('<table width="100%" border="0" cellspacing="0" cellpadding="0" class="number">');
		aKeyPanelHtml.push('<tbody><tr>');
		aKeyPanelHtml.push('<td><a key="d4" herf="javascript:void(0)" class="btn keyDiv">1/4</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">1</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">2</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">3</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)" class="del"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 84 84" enable-background="new 0 0 84 84" xml:space="preserve"><rect opacity="0.5" fill="none" width="84" height="84"></rect><g><g><path fill="#E6E6E6" d="M76,25v34H23L8.9,42L23,25H76 M79,22H21.6L5,42l16.6,20H79V22L79,22z"></path></g><polygon fill="#E6E6E6" points="41.3,53 49.6,44.7 57.9,53 60.6,50.3 52.3,42 60.6,33.7 57.9,31 49.6,39.3 41.3,31 38.6,33.7 ');
		aKeyPanelHtml.push('46.9,42 38.6,50.3 	"></polygon></g></svg></a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('<tr>');
		aKeyPanelHtml.push('<td><a key="d3" herf="javascript:void(0)" class="btn keyDiv">1/3</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">4</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">5</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">6</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)" class="btn clear">清空</a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('<tr>');
		aKeyPanelHtml.push('<td><a key="d2" herf="javascript:void(0)" class="btn keyDiv">1/2</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">7</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">8</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">9</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)" class="btn hide">隐藏</a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('<tr>');
		aKeyPanelHtml.push('<td><a key="d1" herf="javascript:void(0)" class="btn keyDiv">全仓</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">00</a></td>');
		aKeyPanelHtml.push('<td><a herf="javascript:void(0)">0</a></td>');
		aKeyPanelHtml.push('<td colspan="2"><a herf="javascript:void(0)" class="btn ok">确 定</a></td>');
		aKeyPanelHtml.push('</tr>');
		aKeyPanelHtml.push('</tbody></table>');
		aKeyPanelHtml.push('</div>');

		return aKeyPanelHtml.join("");
	}
	
	var keyType7 = {
		createKeyPanelHtml: createKeyPanelHtml,
		keyPanelId: keyPanelId
	}

	$.keyType7 = keyType7;	
}($);
});