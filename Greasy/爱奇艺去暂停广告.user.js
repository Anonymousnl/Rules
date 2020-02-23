// ==UserScript==
// @name			爱奇艺去暂停广告
// @version			2026100200
// @match			*://*.iqiyi.com/*
// @icon			https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/iqiyi.png
// @downloadURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%88%B1%E5%A5%87%E8%89%BA%E5%8E%BB%E6%9A%82%E5%81%9C%E5%B9%BF%E5%91%8A.user.js
// @updateURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%88%B1%E5%A5%87%E8%89%BA%E5%8E%BB%E6%9A%82%E5%81%9C%E5%B9%BF%E5%91%8A.user.js
// ==/UserScript==
(function() {
    var BTN = '.pause-max-close-btn';
    var VL = '.iqp-player-videolayer';
    document.documentElement.setAttribute('data-iqiyi-pausefix', '12.0.0');
    var CSS = [
        '.maxPauseAd-container{display:none!important}',
        /* ★ 真凶：视频层上的 inline transform（scale + translate），这里压死 */
        '.iqp-player-videolayer{transform:none!important;' +
        'width:100%!important;height:100%!important;top:0!important;left:0!important;' +
        'border-radius:0!important;transition:none!important;animation:none!important}'
    ].join('\n');
    (function injectCSS() {
        var host = document.head || document.documentElement;
        if (!host) return setTimeout(injectCSS, 20);
        var s = document.createElement('style');
        s.textContent = CSS;
        host.appendChild(s);
    })();
    /* JS 双保险：万一爱奇艺用 inline !important 写 transform，CSS 会被顶掉，
    就用 JS 反复写 inline !important（后写入者胜） */
    function forceTransform() {
        var vl = document.querySelector(VL);
        if (!vl) return;
        if (vl.style.transform && vl.style.transform !== 'none') {
            vl.style.setProperty('transform', 'none', 'important');
        }
        if (vl.style.getPropertyValue('scale')) vl.style.setProperty('scale', 'none', 'important');
        if (vl.style.getPropertyValue('translate')) vl.style.setProperty('translate', 'none', 'important');
    }

    function guardVL() {
        var vl = document.querySelector(VL);
        if (!vl || vl.__guard) return;
        vl.__guard = true;
        /* style 一变（爱奇艺写入 transform）就在渲染前改回来 */
        new MutationObserver(forceTransform)
            .observe(vl, {
                attributes: true,
                attributeFilter: ['style']
            });
    }

    function autoClick() {
        var btns = document.querySelectorAll(BTN);
        for (var i = 0; i < btns.length; i++) {
            var b = btns[i];
            if (b.offsetParent === null) continue;
            if (b.getBoundingClientRect().width === 0) continue;
            b.click();
        }
    }
    setInterval(function() {
        guardVL();
        forceTransform();
        autoClick();
    }, 30);
    document.addEventListener('pause', function() {
        forceTransform();
        autoClick();
    }, true);
    new MutationObserver(function() {
            guardVL();
            forceTransform();
            autoClick();
        })
        .observe(document.documentElement, {
            childList: true,
            subtree: true
        });
})();