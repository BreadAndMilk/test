/**
 * Created by sizhe on 2016/8/31.
 */
/**
 * 港股通公司行为行为信息
 */
define('trade/scripts/ggt/ggtQueryCompanyInfo.js',function(require, exports, module) {
    var keyboard = require("keyboard");
    var common = require("common");
    var gconfig = $.config;
    var global = gconfig.global;
    var service_hq = require("service_hq");
    var service_ggt = require("service_ggt");
    var _pageId = "#ggt_ggtQueryCompanyInfo ";


    /**
     * 初始化
     */
    function init() {
        userInfo = common.getCurUserInfo();
        if (keyboard) {
            keyboard.keyInit();
        }
    }

    function load() {

    }

    /**
     * 事件绑定
     */
    function bindPageEvent() {
        //返回按钮
        $.bindEvent($(_pageId + ".top_title .icon_back"), function (e) {
            $.pageInit("ggt/ggtQueryCompanyInfo", "ggt/ggtQuery", {}, true);
            e.stopPropagation();
        });


        $.bindEvent($(_pageId + "#stockCode"), function (e) {
            if (keyboard) {
                keyboard.popUpKeyboard($(this), e);
            }
            e.stopPropagation();
        }, "input");

        $.bindEvent($(_pageId + "#queryButton"), function (e) {
            var stockCode = $(_pageId + "#stockCode").val();
            var vai1 = /^[0-9]{5}$/;
            if (!vai1.test(stockCode)) {
                $.alert("输入股票代码有误");
                return;
            }
            var exchange_type = "G";
            queryCompanyInfo()
            if (keyboard) {
                keyboard.closeKeyPanel();
            }
            e.stopPropagation();
        });
    }


    // function getStockList(stockStr){
    //     if(stockStr != ""){
    //         var stockStrParam = {
    //             "q" : stockStr,
    //             "marketType":"2"
    //         };
    //         stockStrParam.type="HK";
    //         service_hq.getStockList_ggt(stockStrParam,function(data){
    //             if(data.errorNo == 0){
    //                 $(_pageId+"#stock_list").html("");
    //                 var results = data.results;
    //                 //显示股票列表
    //                 if(results && results.length > 0){
    //                     if(results.length == 1 && stockStr.length==6){
    //                         $(_pageId+"#stock_list").html("");
    //                         var market = results[0][9];
    //                         var stockCode = results[0][1];
    //                         queryCompanyInfo(stockCode,market);
    //                     }else{
    //                         if(results.length >= 6){
    //                             var selectHeight = 6 * 0.44;
    //                         }else{
    //                             selectHeight = 0.44*results.length;
    //                         }
    //                         var listHtml = "<ul style=\"display:block;overflow-y:auto;height:"+selectHeight+"rem\">";
    //                         for(var i = 0;i < results.length; i++) {
    //                             var stname=results[i][0]+"";
    //                             listHtml += "<li><a href=\"javascript:void(0);\" style=\"padding-left:0.20rem;\" id=\""+stname+"\"><strong style=\"font-size:0.15rem\">"+results[i][1]+"</strong>"+stname+"</a>";
    //                             listHtml +=	"<span style=\"display:none;\">"+results[i][9]+"</span></li>";
    //                         };
    //                         listHtml+="</ul>";
    //                         $(_pageId+"#stock_list").append(listHtml);
    //                         $.bindEvent($(_pageId+".input_select .stock_list ul li"),function(){
    //                             var market = $(this).find("span").text();
    //                             var stockCode = $(this).find("strong").text();
    //                             $(_pageId+"#stock_list").html("");
    //                             queryCompanyInfo(stockCode,market);
    //                         });
    //                     }
    //                 }else{
    //                     $.alert("该股票列表不存在");
    //                 }
    //             }else{
    //                 $.alert("获取股票列表失败");
    //             }
    //         },{"isShowWait":false});
    //     }
    // }

    //查询公司相关信息
    function queryCompanyInfo(stockCode, exchange_type) {
        var entrust_way = global.entrust_way;
        var branch_no = userInfo.branch_no;
        var fund_account = userInfo.fund_account;
        var stock_code = stockCode;
        var cust_code = userInfo.cust_code;
        var sessionid = userInfo.session_id;
        var exchange_type = exchange_type;
        var param = {
            "entrust_way": entrust_way,
            "branch_no": branch_no,
            "fund_account": fund_account,
            "stock_code": stock_code,
            "cust_code": cust_code,
            "sessionid": sessionid,
            "exchange_type": exchange_type
        };
        service_ggt.queryCompanyInfo(param, queryCallBack);
    }


    function queryCallBack(data) {
        if (data) {
            if (data.error_no == 0) {
                var results = data.results;
                if (results && results.length > 0) {
                    $(_pageId + ".no_data").hide();
                    var data = getHtml(results[0]);
                    $(_pageId + ".fund_list2").html(data);
                } else {
                    $(_pageId + ".no_data").show();
                }
            } else {
                $.alert(data.error_info);
                clearMg();
            }
        } else {
            $.alert("查询失败");
        }
        $(_pageId + "#stockCode").quzhi("");
    }

    function getHtml(element) {
        var eleHtml = "";
        eleHtml += "<div class=\"part\">";
        eleHtml += "<div class=\"title\">";
        eleHtml += "<h5>" + element.stock_name + " <small>" + element.stock_code + "</small></h5><span class=\"time\">" + element.apply_time + "</span>";
        eleHtml += "</div>";
        eleHtml += "<ul>";
        eleHtml += "<li>行为代码 <em>" + element.corpbehavior_code + "</em></li>";
        eleHtml += "<li>申报类型 <em>" + element.report_type + "</em></li>";
        eleHtml += "<li>申报数量 <em>" + element.entrust_amount + "</em></li>";
        eleHtml += "<li>确认数量 <em>" + element.current_amount + "</em></li>";
        eleHtml += "<li>成交编号 <em>" + element.report_id + "</em></li>";
        eleHtml += "<li>流  水  号 <em>" + element.result_code + "</em></li>";
        eleHtml += "<li>业务类型 <em>" + element.business_type_name + "</em></li>";
        return eleHtml;
    }


    //清除用户输入的数据.
    function clearMg() {
        // $(_pageId+"#stockCode").quzhi("");
        $(_pageId + ".stock_list").html("");
    }


    function pageBack() {
        $.pageInit("ggt/ggtQueryCompanyInfo", "ggt/ggtOrder", {}, true);
    }

    /***
     * 销毁
     */
    function destroy() {
        clearMg();
        if (keyboard) {
            keyboard.keyDestroy();
        }
        $(_pageId + "#stockCode").quzhi("");
    }

    var base = {
        "init" : init,
        "load" : load,
        "bindPageEvent": bindPageEvent,
        "destroy": destroy,
        "pageBack":pageBack
    }
    module.exports = base;
});

