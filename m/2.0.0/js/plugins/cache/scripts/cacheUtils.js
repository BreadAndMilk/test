/*
作者：   Alt+ 
 时间： 2016-07-06 15:41:29 PM 
*/
+function(a){function b(b,c,d,e){switch(e=e||"h5_session",c=c||"",d="undefined"==typeof d||null===d?1:d,e){case"h5_session":case"h5_local":a.cacheUtils4H5.setItem(b,c,d,e);break;case"app_session":case"app_local":a.cacheUtils4App.setItem(b,c,d,e)}}function c(b,c){switch(c=c||"h5_session"){case"h5_session":case"h5_local":a.cacheUtils4H5.removeItem(b,c);break;case"app_session":case"app_local":a.cacheUtils4App.removeItem(b,c)}}function d(b,c){c=c||"h5_session";var d=null;switch(c){case"h5_session":case"h5_local":d=a.cacheUtils4H5.getItem(b,c);break;case"app_session":case"app_local":d=a.cacheUtils4App.getItem(b,c)}return d}var e={setItem:b,removeItem:c,getItem:d};a.cacheUtils=e}($);
/*出品单位：深圳市思迪信息技术股份有限公司-前端Html5开发小组*/