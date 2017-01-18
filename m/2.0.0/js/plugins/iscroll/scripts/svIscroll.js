/*
作者：   Alt+ 
 时间： 2016-07-06 15:41:29 PM 
*/
define("2.0.0/js/plugins/iscroll/scripts/svIscroll.js",function(require,exports,module){function a(a){var b=this,c=null;this.setCssHW=function(){var b=a.wrapper,c=b.children(),d=a.container,e=a.containerHeight,f=a.containerWidth;e?b.height(e):b.height($(window).height()),f?b.width(f):b.width($(window).width()),b.css({position:"absolute"}),c.css({position:"absolute",width:"100%",padding:"0px"}),d.css({padding:"0px",margin:"0px",width:"100%"})},this.refresh=function(a){c.refresh()},this.init=function(){this.setCssHW(),require.async("2.0.0/js/plugins/iscroll/scripts/iscroll4.js",function(b){c=new b(a.wrapper[0],{onScrollMove:function(){a.wrapper.children("div").eq(1).show()},onScrollEnd:function(){a.wrapper.children("div").eq(1).hide()}}),setTimeout(function(){a.wrapper.children("div").eq(1).hide()},200)})},this.destroy=function(){null!=c&&(c.destroy(),c=null)},b.init()}module.exports=a});
/*出品单位：深圳市思迪信息技术股份有限公司-前端Html5开发小组*/