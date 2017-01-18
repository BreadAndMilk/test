/*
作者：   Alt+ 
 时间： 2016-07-06 15:41:29 PM 
*/
define("2.0.0/js/plugins/keypanel/scripts/keyType11.js", function(require, exports, module) {
	+ function(a) {
		function b() {
			var a1 = ["q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m"];
			var c1 = [];
			var b1 = [];
			for(var i = 26; i > 0; i--){
				var t =	Math.floor(Math.random() * i);
				var v = a1[t];
				a1[t] = undefined;
				for(var e = 0; e < a1.length; e++){
					if(a1[e] != undefined){
						c1.push(a1[e]);
					}
				}
				a1 = c1;
				c1 = [];
				b1.push(v);
			}
			return d && (d = null), d = [],d.push('<div id="KeyPanel11" class="keyword_table">'), d.push('<table width="100%" border="0" cellspacing="0" cellpadding="0" class="abc">'), d.push("<tbody><tr>"), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[0]+'">'+b1[0]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[1]+'">'+b1[1]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[2]+'">'+b1[2]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[3]+'">'+b1[3]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[4]+'">'+b1[4]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[5]+'">'+b1[5]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[6]+'">'+b1[6]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[7]+'">'+b1[7]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[8]+'">'+b1[8]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[9]+'">'+b1[9]+'</a></td>'), d.push("</tr>"), d.push("<tr>"), d.push("<td>&nbsp;</td>"), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[10]+'">'+b1[10]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[11]+'">'+b1[11]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[12]+'">'+b1[12]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[13]+'">'+b1[13]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[14]+'">'+b1[14]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[15]+'">'+b1[15]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[16]+'">'+b1[16]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[17]+'">'+b1[17]+'</a></td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[18]+'">'+b1[18]+'</a></td>'), d.push("<td>&nbsp;</td>"), d.push("</tr>"), d.push("<tr>"), d.push('<td colspan="3"><a class="caps capital"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve">'), d.push('<path fill="#FFFFFF" d="M16,5l11.5,13H23h-2v2.5V28H11v-7.5V18H9H4.5L16,5 M16,2L0,20h9v10h14V20h9L16,2L16,2z"></path>'), d.push("< /svg></a > </td>"),d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[19]+'">'+b1[19]+'</a > </td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[20]+'">'+b1[20]+'</a > </td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[21]+'">'+b1[21]+'</a > </td>'),d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[22]+'">'+b1[22]+'</a > </td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[23]+'">'+b1[23]+'</a > </td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[24]+'">'+b1[24]+'</a > </td>'), d.push('<td colspan="2"><a herf="javascript:void(0)" class="key" key="'+b1[25]+'">'+b1[25]+'</a > </td>'), d.push('<td colspan="3"><a herf="javascript:void(0)" class="del"><svg version="1.1" xmlns="http:/ / www.w3.org / 2000 / svg " xmlns:xlink="http: //www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 84 84" enable-background="new 0 0 84 84" xml:space="preserve"><rect opacity="0.5" fill="none" width="84" height="84"></rect><g><g><path fill="#E6E6E6" d="M76,25v34H23L8.9,42L23,25H76 M79,22H21.6L5,42l16.6,20H79V22L79,22z"></path></g><polygon fill="#E6E6E6" points="41.3,53 49.6,44.7 57.9,53 60.6,50.3 52.3,42 60.6,33.7 57.9,31 49.6,39.3 41.3,31 38.6,33.7 '), d.push('46.9,42 38.6,50.3 	"></polygon></g></svg></a></td>'), d.push("</tr>"), d.push("<tr>"), d.push('<td colspan="3"><a class="btn n123L">123</a></td>'), d.push('<td colspan="3"><a class="btn hide">隐藏</a></td>'), d.push('<td colspan="9"><a class="space">&nbsp;</a></td>'), d.push('<td colspan="5"><a class="btn enter ok">确定</a></td>'), d.push("</tr>"), d.push("</tbody></table>"), d.push("</div>"),d.join("")
		}
		var c = "KeyPanel11",
			d = null,
			e = {
				createKeyPanelHtml: b,
				keyPanelId: c
			};
		a.keyType11 = e
	}($)
});
/*出品单位：深圳市思迪信息技术股份有限公司-前端Html5开发小组*/