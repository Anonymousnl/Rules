// ==UserScript==
// @name			斗鱼直播页面净化
// @version			2026100800
// @match			*://*.douyu.com/*
// @icon			https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/douyu.png
// @grant			GM_addStyle
// @grant			GM_xmlhttpRequest
// @run-at			document-idle
// @downloadURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%96%97%E9%B1%BC%E7%9B%B4%E6%92%AD%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96.user.js
// @updateURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%96%97%E9%B1%BC%E7%9B%B4%E6%92%AD%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96.user.js
// ==/UserScript==
(function() {
    // ===============================
    // 模块一：工具函数
    // ===============================
    function getRoomId() {
        try {
            // 先尝试从 query 参数读取ID
            const u = new URL(location.href);
            if (u.searchParams.has("rid")) {
                return u.searchParams.get("rid");
            }
            // 直接在路径中取ID
            let path = u.pathname.split('/').filter(Boolean);
            if (path.length >= 1) {
                let lastPart = path[path.length - 1];
                if (/^\d+$/.test(lastPart)) {
                    return lastPart;
                }
            }
        } catch (e) {
            return null;
        }
    }

    function formatData(num) {
        return String(num).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }

    function formatPrice(num) {
        const str = String(num);
        const integer = formatData(str / 100 | 0);
        const decimal = String(str % 100).padStart(2, '0');
        return `${integer}.${decimal}`;
    }
    // ===============================
    // 模块二：广告屏蔽
    // ===============================
    GM_addStyle(`
/* ------ 顶部横幅广告 ------ */
#js-room-top-banner,
.ScreenBannerAd,
/* ------ 弹幕区广告 ------ */
.Barrage-chat-ad,
.BarrageSuspendedBallAd,
.Barrage-notice .js-athena-barrage,
.IconCardAdCard .IconCardAd,
/* ------ 右下角活动广告 ------ */
.Bottom-ad,
.JinChanChanGame,
/* ------ 礼物栏广告 ------ */
.PrivilegeGiftModalDialog,
.RechargeBigRewards,
/* ------ 聊天框顶部视频广告 ------ */
#js-player-asideTopSuspension,
/* ------ 聊天框右侧悬浮广告 ------ */
#js-room-activity,
/* ------ 底部鱼丸文字广告 ------ */
.RoomText-list,
.RoomText-icon,
/* ------ 互动游戏鱼丸夺宝屏蔽 ------ */
/* ------ #js-toolbar-interact,------ */
/* ------ 右下角鱼丸、鱼翅、充值、背包及其占位行 ------ */
#js-player-toolbar .PlayerToolbar-ContentRow.InteractABAd,
/* ------ 其他常见广告类 ------ */
[class^=adsRoot_] {
display: none !important;
}
/* ------ 礼物栏靠右 ------ */
.PlayerToolbar-ContentCell {
margin-left:auto;
}
/* ------ 移除互动广告行后，同步收缩播放器底部预留 ------ */
#js-player-main {
--stage-interactive-height: 76px !important;
--stage-player-gap-bottom: 76px !important;
}
/* ------ 数据时间与手动刷新图标 ------ */
#liwu_info .liwu-info-age-group {
display: inline-flex;
align-items: center;
gap: 4px;
}
#liwu_info .liwu-info-clock {
width: 13px;
height: 13px;
flex: none;
color: #888;
}
/* 斗鱼全局 svg[fill="none"] 会将描边宽度重置为 0，这里仅恢复本插件图标 */
#liwu_info svg {
fill: none !important;
stroke: currentColor !important;
stroke-width: 2px !important;
stroke-linecap: round !important;
stroke-linejoin: round !important;
}
#liwu_refresh_button {
display: inline-grid;
place-items: center;
width: 18px;
height: 18px;
padding: 0;
border: 1px solid #ddd;
border-radius: 50%;
background: #fff;
color: #777;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
cursor: pointer;
appearance: none;
transition: color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
#liwu_refresh_button svg {
display: block;
width: 14px;
height: 14px;
transform-origin: center;
}
#liwu_refresh_button:hover:not(:disabled) {
color: #ff5d23;
border-color: #ffad8c;
}
#liwu_refresh_button:active:not(:disabled) {
transform: scale(0.92);
}
#liwu_refresh_button:focus-visible {
outline: 2px solid rgba(255, 93, 35, 0.45);
outline-offset: 1px;
}
#liwu_refresh_button:disabled {
opacity: 0.6;
cursor: wait;
}
#liwu_refresh_button.is-loading svg {
animation: liwu-refresh-spin 0.75s linear infinite;
}
@keyframes liwu-refresh-spin {
to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
#liwu_refresh_button.is-loading svg {
animation: none;
}
}
`);
    console.log('[Douyu Script] 广告屏蔽模块已启用');
    // ===============================
    // 模块三：自动网页全屏
    // ===============================
    window.addEventListener('load', () => {
        setTimeout(() => {
            // 模拟按下“Y”键（斗鱼网页全屏快捷键）
            const event = new KeyboardEvent('keydown', {
                key: 'y',
                code: 'KeyY',
                keyCode: 89,
                which: 89,
                bubbles: true
            });
            document.body.dispatchEvent(event);
            console.log('[Douyu Script] 网页全屏触发');
        }, 1000);
    });
})();