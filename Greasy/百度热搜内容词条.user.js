// ==UserScript==
// @name        百度热搜内容词条
// @version     2025092000
// @match       *://*.baidu.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/baidu.png
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E7%83%AD%E6%90%9C%E5%86%85%E5%AE%B9%E8%AF%8D%E6%9D%A1.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E7%83%AD%E6%90%9C%E5%86%85%E5%AE%B9%E8%AF%8D%E6%9D%A1.user.js
// ==/UserScript==
(function() {
    function clearPlaceholder() {
        let inputElement = document.getElementById('kw');
        if (inputElement && inputElement.placeholder !== '') {
            inputElement.placeholder = ''; // 立即清空
        }
    }

    function observePlaceholder() {
        let inputElement = document.getElementById('kw');
        if (!inputElement) return;
        let observer = new MutationObserver(() => {
            clearPlaceholder(); // 仅在变化时清除
        });
        observer.observe(inputElement, {
            attributes: true,
            attributeFilter: ['placeholder'],
        });
        // 页面卸载时停止监听，防止内存泄漏
        window.addEventListener('beforeunload', () => observer.disconnect());
    }

    function removeAISearchGuide() {
        let aiGuide = document.querySelector('a.new_search_guide_bub_container');
        if (aiGuide) {
            aiGuide.remove(); // 直接移除 AI 搜索提示
        }
    }

    function observeAISearchGuide() {
        let observer = new MutationObserver(() => {
            removeAISearchGuide();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        window.addEventListener('beforeunload', () => observer.disconnect());
    }
    // 页面加载时执行一次
    clearPlaceholder();
    observePlaceholder();
    removeAISearchGuide();
    observeAISearchGuide();
})();