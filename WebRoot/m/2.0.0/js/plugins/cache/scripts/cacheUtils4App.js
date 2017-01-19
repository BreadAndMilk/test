/*
作者：   Alt+ 
 时间： 2016-07-06 15:41:29 PM 
*/
+function(a){function b(a,b,c,d){var f={key:a,value:b,time:c};switch(d){case"app_session":e.function50040(f);break;case"app_local":e.function50042(f)}}function c(a,b){switch(b){case"app_session":e.function50040({key:a,value:"",time:.01});break;case"app_local":e.function50042({key:a,value:"",time:.01})}}function d(b,c){var d=null;switch(c){case"app_session":d=e.function50041({key:b});break;case"app_local":d=e.function50043({key:b})}return d&&d.error_no>0?d.results&&d.results[0]&&(d=d.results[0].value):d&&a.alert(d.error_info),d}var e={function50040:function(a){f("50040",a)},function50041:function(a){f("50041",a)},function50042:function(a){f("50042",a)},function50043:function(a){f("50043",a)}},f=function(b,c){c.funcNo=b,a.callMessage(c)},g={setItem:b,removeItem:c,getItem:d};a.cacheUtils4App=g}($);
/*出品单位：深圳市思迪信息技术股份有限公司-前端Html5开发小组*/