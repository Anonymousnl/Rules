// ==UserScript==
// @name        虎牙直播功能增强
// @version     2025092000
// @match       *://*.huya.com/*
// @exclude     https://www.huya.com/  // 排除首页
// @exclude     https://www.huya.com/g/*  // 排除游戏分类页
// @exclude     https://www.huya.com/cache.php*  // 排除缓存页
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/huya.png
// @run-at      document-idle
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// ==/UserScript==
(function() {
    console.log('虎牙去广告脚本开始运行...');
    // --- !!! 第一步：检查当前页面是否为直播间 !!! ---
    const isLiveRoom = () => {
        const path = window.location.pathname;
        // 排除首页、分类页等
        return /^\/[\w-]+$/.test(path) && path !== "/";
    };
    if (!isLiveRoom()) {
        console.log('当前页面非直播间，停止执行广告关闭逻辑。');
        return; // 直接退出脚本
    }
    // --- !!! 配置区：需要根据实际情况修改下面的选择器 !!! ---
    const adPopupSelectors = [
        '.pic.J_pic',
        '#ab-banner',
        '.small-handle-tip',
        '.common-popup',
        '.room-sidebar-top',
        '.room-mod-ggTop',
        '#J_roomGgTop',
        '.room-gg-top',
        '.css-9pa8cd.r-13qz1uu.css-1dbjc4n.r-1loqt21.r-1otgn73.r-eafdt9.r-1i6wzkk.r-lrvibr',
        'div[data-is-ad="true"]',
    ];
    const closeButtonSelectors = [
        '.ps.ps_close.J_close',
        '.close-btn',
        '.popup-close-btn',
    ];
    const checkInterval = 1000;
    // --- 核心逻辑（仅直播间内执行）---
    function findAndCloseAds() {
        let adFoundAndClosed = false;
        for (const adSelector of adPopupSelectors) {
            const adPopups = document.querySelectorAll(adSelector);
            adPopups.forEach(popup => {
                const style = window.getComputedStyle(popup);
                if (popup.offsetParent !== null && style.display !== 'none' && style.visibility !== 'hidden') {
                    console.log('检测到可能的广告弹窗:', popup);
                    let closeButtonClicked = false;
                    for (const btnSelector of closeButtonSelectors) {
                        const closeButton = popup.querySelector(btnSelector);
                        if (closeButton?.click) {
                            console.log(`  点击关闭按钮 (${btnSelector})`);
                            try {
                                closeButton.click();
                                closeButtonClicked = true;
                                adFoundAndClosed = true;
                                break;
                            } catch (e) {
                                console.error('  点击出错:', e);
                            }
                        }
                    }
                    if (!closeButtonClicked) {
                        console.warn('  未找到关闭按钮，考虑隐藏弹窗');
                        // popup.style.display = 'none'; // 备选方案（谨慎使用）
                    }
                }
            });
        }
    }
    // --- 启动定时器 ---
    const timerId = setInterval(findAndCloseAds, checkInterval);
    console.log(`直播间广告检测已启动，每 ${checkInterval} 毫秒检查一次`);
    window.addEventListener('beforeunload', () => {
        clearInterval(timerId);
        console.log('定时器已清除');
    });
})();