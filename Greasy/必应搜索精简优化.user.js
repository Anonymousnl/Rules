// ==UserScript==
// @name        必应搜索精简优化
// @version     2025092000
// @match       *://*.bing.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/bing.png
// @grant       GM_addStyle
// @run-at      document-start
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E5%BF%85%E5%BA%94%E6%90%9C%E7%B4%A2%E7%B2%BE%E7%AE%80%E4%BC%98%E5%8C%96.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E5%BF%85%E5%BA%94%E6%90%9C%E7%B4%A2%E7%B2%BE%E7%AE%80%E4%BC%98%E5%8C%96.user.js
// ==/UserScript==
(n => {
    if (typeof GM_addStyle == "function") {
        GM_addStyle(n);
        return
    }
    const o = document.createElement("style");
    o.textContent = n, document.head.append(o)
})(" #id_l,#id_d,#id_rh_w,#id_rfob,#id_rfoc,#id_qrcode,#id_mobile,#id_qrcode_popup_positioner,#sb_feedback,#footer,#sa_pn_block{display:none!important}#sb_form_c>div>span{display:none!important}#HBContent>div>div.hb_sect_container:has(div.hb_section_nohover){display:none!important}#vs_cont>div.mc_caro>div.hp_trivia_outer{display:none!important}#vs_cont>div.mc_caro>div>div.musCardCont{display:none!important}#vs_cont>div.mc_caro_newmuse.five_col{display:none!important}#vs_cont>div.mc_caro>div>div>div.icon_text{display:none!important}#vs_cont>div.mc_caro>div>div>div.nav{display:none!important}#vert_iotd,#vert_images,#vert_otd,#vsrewds,#vs_default{display:none!important}#vs_cont>div.mc_caro.five_col_new{display:none!important}#vs_cont>div.vs{display:none!important}#headCont>nav{display:none!important}#b_context>li.b_ad{display:none!important}#b_results>li.b_ad{display:none!important}#adstop_gradiant_separator{display:none!important}div.b_hPanel:has(#bingApp_area){display:none!important}#id_mobpoppos,#b_footer{display:none!important}#main>ul:has(#data-from){display:none!important}#main>footer{display:none!important}#b_content>div.aca_contact{display:none!important}.vs_cont .moduleCont .module{padding:0!important}#b_results>li.b_algo{margin-top:0!important} ");
(function() {
    var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
        LogLevel2["Debug"] = "DEBUG";
        LogLevel2["Info"] = "INFO";
        LogLevel2["Warn"] = "WARN";
        LogLevel2["Error"] = "ERROR";
        return LogLevel2;
    })(LogLevel || {});

    function PGLOG(level, funName, message) {
        const now = /* @__PURE__ */ new Date();
        const time = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const logMessage = `${time} [${funName}|${level}]: ${message}`;
        console.log(logMessage);
    }
    const FUNNAME = "Bing增强";
    PGLOG(LogLevel.Info, FUNNAME, "启动!");
})();