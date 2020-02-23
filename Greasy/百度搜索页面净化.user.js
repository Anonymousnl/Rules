// ==UserScript==
// @name        百度搜索页面净化
// @version     2025092000
// @match       *://*.baidu.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/baidu.png
// @grant       GM_xmlhttpRequest
// @run-at      document-start
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E6%90%9C%E7%B4%A2%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E6%90%9C%E7%B4%A2%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96.user.js
// ==/UserScript==
(function() {
    // 获取百度搜索框元素
    var inputElement = document.getElementById('kw'); // 百度搜索框的 ID 是 'kw'
    if (inputElement) {
        // 提前清空 placeholder
        inputElement.placeholder = '';
        // 使用 MutationObserver 监控 placeholder 的变化
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'placeholder') {
                    // 如果 placeholder 被动态加载，立即清空
                    inputElement.placeholder = '';
                    observer.disconnect(); // 停止监控，避免重复清空
                }
            });
        });
        // 配置 MutationObserver，监控 placeholder 属性的变化
        var config = {
            attributes: true, // 监控属性变化
            attributeFilter: ['placeholder'] // 只监控 placeholder 属性
        };
        // 开始监控
        observer.observe(inputElement, config);
    }
    var killBaijiaType = 2;
    var MO = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    if (MO) {
        var observer = new MO(function(records) {
            records.map(function(record) {
                if (record.addedNodes.length) {
                    [].forEach.call(record.addedNodes, function(addedNode) {
                        clearOneAD(addedNode);
                    });
                }
            });
        });
        var option = {
            'childList': true,
            'subtree': true
        };
        observer.observe(document, option);
    }

    function checkBaijia(item) {
        var itemHref = item.querySelector("a").href;
        item.style.display = "none";
        if (itemHref.indexOf("baidu.com") == -1) return;
        var gmxhr = GM_xmlhttpRequest({
            url: itemHref,
            headers: {
                "Accept": "text/html"
            },
            method: "head",
            onreadystatechange: function(response) {
                if (response.readyState == 4) {
                    if (response.finalUrl.indexOf("baijiahao.baidu.com") != -1) {
                        item.remove();
                    } else {
                        item.style.display = "";
                    }
                    gmxhr.abort();
                }
            }
        });
    }

    function clearAD() {
        if (!document.querySelectorAll) return;
        var mAds = document.querySelectorAll(".ec_wise_ad,.ec_youxuan_card,.page-banner"),
            i;
        for (i = 0; i < mAds.length; i++) {
            var mAd = mAds[i];
            mAd.remove();
        }
        var list = document.querySelectorAll("#content_left>div,#content_left>table");
        for (i = 0; i < list.length; i++) {
            let item = list[i];
            let s = item.getAttribute("style");
            if (s && /display:(table|block)\s!important/.test(s)) {
                item.remove();
            } else {
                var span = item.querySelector("div>span");
                if (span && span.innerHTML == "广告") {
                    item.remove();
                }
                [].forEach.call(item.querySelectorAll("span,a"), function(span) {
                    if (span && (span.innerHTML == "广告" || span.getAttribute("data-tuiguang"))) {
                        item.remove();
                    }
                });
                if (killBaijiaType == 2) {
                    [].forEach.call(item.querySelectorAll("a>div>span+img"), function(img) {
                        if (img && /^https?:\/\/pic\.rmb\.bdstatic\.com/.test(img.src)) {
                            //checkBaijia(item);
                            item.remove();
                        }
                    });
                }
            }
        }
        var eb = document.querySelectorAll("#content_right>table>tbody>tr>td>div");
        for (i = 0; i < eb.length; i++) {
            let d = eb[i];
            if (d.id != "con-ar") {
                d.remove();
            }
        }
        var nr = document.querySelector("#content_right>div>div>div");
        if (nr) {
            var nra = nr.querySelectorAll("a");
            for (i = 0; i < nra.length; i++) {
                let d = nra[i];
                if (d.innerHTML == "广告") {
                    nr.remove();
                    break;
                }
            }
        }
    }

    function clearOneAD(ele) {
        if (ele.nodeType != 1) return;
        if (ele.classList.contains("ec-tuiguang") || ele.classList.contains("ec_wise_ad") || ele.classList.contains("ec_youxuan_card") || ele.classList.contains("page-banner")) {
            ele.remove();
            return;
        }
        if (ele.parentNode && ele.parentNode.id == "content_left" && (ele.nodeName == "DIV" || ele.nodeName == "TABLE")) {
            let s = ele.getAttribute("style");
            if (s && /display:(table|block)\s!important/.test(s)) {
                ele.remove();
            } else {
                var span = ele.querySelector("div>span");
                if (span && span.innerHTML == "广告") {
                    ele.remove();
                }
                [].forEach.call(ele.querySelectorAll("span,a"), function(span) {
                    if (span && (span.innerHTML == "广告" || span.getAttribute("data-tuiguang"))) {
                        ele.remove();
                    }
                });
                if (killBaijiaType == 2) {
                    [].forEach.call(ele.querySelectorAll("a>div>span+img"), function(img) {
                        if (img && /^https?:\/\/pic\.rmb\.bdstatic\.com/.test(img.src)) {
                            //checkBaijia(ele);
                            ele.remove();
                        }
                    });
                }
            }
        } else if (ele.parentNode && ele.parentNode.id == "content_right") {
            if (ele.nodeName == "TABLE") {
                var eb = ele.querySelectorAll("tbody>tr>td>div");
                for (var i = 0; i < eb.length; i++) {
                    let d = eb[i];
                    if (d.id != "con-ar") {
                        d.remove();
                    }
                }
            }
            if (ele.nodeName == "DIV") {
                var nr = ele.querySelector("div>div");
                if (nr) {
                    var nra = nr.querySelectorAll("a");
                    for (i = 0; i < nra.length; i++) {
                        let d = nra[i];
                        if (d.innerHTML == "广告") {
                            nr.remove();
                            break;
                        }
                    }
                }
            }
        } else {
            let eles = ele.querySelectorAll("#content_left>div,#content_left>table");
            [].forEach.call(eles, e => {
                clearOneAD(e)
            });
        }
    }
    setTimeout(() => {
        clearAD();
    }, 2000);
})();