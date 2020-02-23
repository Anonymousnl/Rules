// ==UserScript==
// @name			虎牙直播功能增强
// @version			2026081810
// @match			*://*.huya.com/*
// @grant			GM_addStyle
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			unsafeWindow
// @icon			https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/huya.png
// @run-at			document-start
// @downloadURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// @updateURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// ==/UserScript==
(function() {
    // ==========================================
    // 0. 配置读取与 Tampermonkey 菜单交互
    // ==========================================
    const CONFIG_KEY_GIFT_BAR = 'hy_clean_gift_bar';
    const CONFIG_KEY_WEB_ADS = 'hy_clean_web_ads';
    const CONFIG_KEY_AUTO_HQ = 'hy_auto_hq';
    const CONFIG_KEY_BTN_POS = 'hy_btn_pos';
    // 默认开启
    let hideGiftBar = GM_getValue(CONFIG_KEY_GIFT_BAR, false);
    let hideWebAds = GM_getValue(CONFIG_KEY_WEB_ADS, true);
    let autoHQ = GM_getValue(CONFIG_KEY_AUTO_HQ, true);
    // ==========================================
    // 1. 静态与防撕裂 CSS 注入
    // ==========================================
    let dynamicCss = `
/* 虎牙风 UI 盒模型与全局隔离 */
#hy-cleaner-modal, #hy-cleaner-modal *,
#hy-cleaner-btn, #hy-cleaner-btn * {
box-sizing: border-box !important;
}
/* 强力锁定设置按钮只能右侧贴边，使用经典指针 */
#hy-cleaner-btn {
right: 0px !important;
left: auto !important;
cursor: pointer !important;
}
/* 强力消除虎牙播放器容器内误克的镜像悬浮图标 */
#player-wrap #hy-cleaner-btn,
#player-wrap #hy-cleaner-modal,
.room-player-wrap #hy-cleaner-btn,
.room-player-wrap #hy-cleaner-modal,
#player-ctrl-wrap #hy-cleaner-btn,
#player-video-wrapper #hy-cleaner-btn,
.player-video #hy-cleaner-btn {
display: none !important;
visibility: hidden !important;
opacity: 0 !important;
pointer-events: none !important;
}
/* 强力屏蔽扫码/下载PC客户端解锁画质弹窗及遮罩 */
.J_PortalGlobalRoot,
.ModalH5--oUHjECH31csWN7huRN6s,
.Mask--MMmdcOAJcacIE1eHKNma,
[class*="ModalH5--"],
[class*="QualityCodePop"],
[class*="pcWrap--"],
[class*="codeWrap--"] {
display: none !important;
visibility: hidden !important;
opacity: 0 !important;
pointer-events: none !important;
height: 0 !important;
width: 0 !important;
}
/* 强制恢复画质菜单文本可读性与高亮 */
.player-videotype-list li {
color: #ccc !important;
cursor: pointer !important;
}
.player-videotype-list li.on {
color: #ff8800 !important;
font-weight: bold !important;
}
/* 隐藏画质菜单内多余的“扫码即享”角标 */
.player-videotype-list .bitrate-right-btn,
.player-videotype-list .common-enjoy-btn {
display: none !important;
}
/* 开关控件样式 */
.hy-cleaner-switch {
position: relative;
display: inline-block;
width: 38px;
height: 20px;
flex-shrink: 0;
}
.hy-cleaner-switch input {
opacity: 0;
width: 0;
height: 0;
}
.hy-cleaner-slider {
position: absolute;
cursor: pointer;
top: 0; left: 0; right: 0; bottom: 0;
background-color: rgba(255, 255, 255, 0.2);
transition: .25s ease;
border-radius: 20px;
border: 1px solid rgba(255, 255, 255, 0.1);
}
.hy-cleaner-slider:before {
position: absolute;
content: "";
height: 14px;
width: 14px;
left: 2px;
bottom: 2px;
background-color: #fff;
transition: .25s ease;
border-radius: 50%;
box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.hy-cleaner-switch input:checked + .hy-cleaner-slider {
background-color: #ff8800;
border-color: #ff8800;
}
.hy-cleaner-switch input:checked + .hy-cleaner-slider:before {
transform: translateX(18px);
}
/* 靠边收缩时的文本隐藏极速流畅过渡 */
#hy-cleaner-btn .hy-btn-text {
transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.22s cubic-bezier(0.16, 1, 0.3, 1), margin 0.22s cubic-bezier(0.16, 1, 0.3, 1);
max-width: 50px;
opacity: 1;
display: inline-block;
white-space: nowrap;
overflow: hidden;
vertical-align: middle;
}
#hy-cleaner-btn.hy-docked .hy-btn-text {
opacity: 0;
max-width: 0;
margin: 0;
}
`;
    if (hideWebAds) {
        dynamicCss += `
#huya-ab, #huya-ab-fixed, #player-download-guide-tip, #player-subscribe-head,
#pc-watch-download-tips, .room-player-gift-placeholder, .diy-toutu, .J_ttVideo,
.special-bg, #J_hyHdMatch, .room-hd-banner, #sidebarBanner, .room-sidebar-top,
.room-business-game, .room-gg-chat, #J_DanmuAddOne, #diy-pet-icon, #week-star-btn,
#J_treasureChestContainer, .more-activity-icon, .diy-comp, .diy-comps-wrap,
.competition_cont_center_wrap, [class*="sidebar-banner"], [class*="room-business-game"],
#player-wrap [class*="popup-"],
.room-player-wrap [class*="popup-"],
#player-wrap iframe[src*="zt.huya.com"],
#player-wrap iframe[src*="interactive"],
#player-wrap iframe[src*="diy"],
#player-bitrate-tips,
#player-flac-tips,
#player-vr-switch-tips,
#player-login-tip,
#player-subscribe-guide,
#player-app-download-tip,
#player-game-recommend-pop,
#player-recharge-tip,
.player-subscribe-head,
.player-subscribe-head-bg,
[class*="ActivityPop"],
[class*="CardPop"],
[class*="RedPacket"],
[class*="RedBag"],
[class*="WelfarePop"],
[class*="TaskPop"],
[class*="AdPop"],
[class*="BannerPop"],
[class*="FloatPop"],
[class*="RecommendPop"],
/* 播放器顶部与全屏飘屏广播、喇叭、送礼粉色横幅、贵族进场及跑马灯通知 */
[class*="Broadcast"], [class*="broadcast"],
[class*="Horn"], [class*="horn"],
[class*="GiftNotice"], [class*="gift-notice"], [class*="giftNotice"],
[class*="GiftBroadcast"], [class*="gift-broadcast"], [class*="giftBroadcast"],
[class*="GiftBanner"], [class*="gift-banner"], [class*="giftBanner"],
[class*="GiftCombo"], [class*="gift-combo"], [class*="combo-"],
[class*="NobleEnter"], [class*="noble-enter"], [class*="NobleNotice"], [class*="noble-notice"],
[class*="Speaker"], [class*="speaker"],
[class*="Marquee"], [class*="marquee"],
[class*="RollNotice"], [class*="roll-notice"],
[class*="TopNotice"], [class*="top-notice"],
[class*="Notify"], [class*="notify"],
#J_roomHorn, #J_roomNotice, #J_playerHorn, #J_playerNotice, #J_giftNotice, #J_broadcast,
.player-banner, .player-broadcast, .player-notice, .player-horn,
.room-player-notice, .room-player-horn, .room-player-broadcast {
display: none !important;
visibility: hidden !important;
opacity: 0 !important;
height: 0 !important;
width: 0 !important;
pointer-events: none !important;
}
`;
    }
    /* 隐藏整排底栏：欧皇、游戏推荐、小黄车、百宝箱、AI工坊、礼物挂件区、充值、包裹、守护、贵族 */
    if (hideGiftBar) {
        dynamicCss += `
#player-gift-wrap, .player-gift-wrap, .player-gift-left, .diy-activity-icon,
[id^="diy-activity-icon-"], .ab-icon.xsb-icon, .player-box-icon, .player-chest-btn,
.player-gift-left-enter-list, .player-gift-right, #player-recharge-btn,
#player-recharge-click, #player-package-btn, #player-guard-btn, #player-noble-btn {
display: none !important; visibility: hidden !important; height: 0 !important; pointer-events: none !important;
}
/* 消除底栏黑边，控制条贴底与视频画面铺满 */
#player-ctrl-wrap, .player-ctrl-wrap {
bottom: 0 !important;
}
#player-video, #hy-video {
height: 100% !important;
max-height: 100% !important;
}
`;
    }
    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(dynamicCss);
    } else {
        const style = document.createElement('style');
        style.textContent = dynamicCss;
        (document.head || document.documentElement).appendChild(style);
    }
    // ==========================================
    // 2. 深度解锁扫码/登录限制并真实切换视频流 (蓝光10M/原画)
    // ==========================================
    function getWin() {
        return typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    }

    function getPlayerInstance() {
        const win = getWin();
        return win.vplayer || win.hyPlayer || win.TT_PLAYER || win.player || win.VPlayer;
    }

    function sanitizeBitrateData(li) {
        if (!li) return;
        const win = getWin();
        if (win.$) {
            try {
                var $li = win.$(li);
                var data = $li.data('data');
                if (data && typeof data === 'object') {
                    data.status = 0;
                    data.needLogin = 0;
                    data.needScan = 0;
                    data.login = 0;
                    data.bAvailable = 1;
                    $li.data('data', data);
                }
            } catch (e) {}
        }
        li.removeAttribute('data-need-login');
        li.removeAttribute('data-need-scan');
        li.removeAttribute('data-status');
        li.classList.remove('disabled', 'lock', 'need-login');
        var enjoyBadge = li.querySelector('.bitrate-right-btn, .common-enjoy-btn');
        if (enjoyBadge && enjoyBadge.parentNode) {
            enjoyBadge.parentNode.removeChild(enjoyBadge);
        }
    }

    function performBitrateSwitch(li) {
        if (!li) return;
        sanitizeBitrateData(li);
        const win = getWin();
        var player = getPlayerInstance();
        var data = win.$ ? win.$(li).data('data') : null;
        var iBitRate = (data && data.iBitRate) || li.getAttribute('data-bitrate');
        // 方式 A：如果存在 player 实例且有 iBitRate 接口，优先调用 API
        let apiSuccess = false;
        if (player && iBitRate) {
            try {
                if (typeof player.changeBitRate === 'function') {
                    player.changeBitRate(iBitRate);
                    apiSuccess = true;
                } else if (typeof player.setBitRate === 'function') {
                    player.setBitRate(iBitRate);
                    apiSuccess = true;
                } else if (typeof player.changeFreeQuality === 'function') {
                    player.changeFreeQuality(iBitRate);
                    apiSuccess = true;
                }
            } catch (err) {}
        }
        // 方式 B (现代虎牙通用)：派发原生 MouseEvent 点击，触发虎牙自带的 H5 切流事件处理器
        if (!apiSuccess) {
            try {
                const evt = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: win
                });
                li.dispatchEvent(evt);
            } catch (e) {
                if (typeof li.click === 'function') li.click();
            }
        }
        const $vtList = document.querySelector('.player-videotype-list');
        if ($vtList) {
            $vtList.querySelectorAll('li').forEach(item => item.classList.remove('on'));
        }
        li.classList.add('on');
        const cleanText = li.textContent.trim().replace('扫码即享', '');
        const curQuality = document.querySelector('.player-videotype-cur');
        if (curQuality) {
            curQuality.textContent = cleanText;
        }
    }
    document.addEventListener('click', function(e) {
        const li = e.target.closest('.player-videotype-list li');
        if (!li) return;
        sanitizeBitrateData(li);
        const win = getWin();
        const data = win.$ ? win.$(li).data('data') : null;
        if (data && (data.status !== 0 || data.needScan || data.needLogin)) {
            data.status = 0;
            data.needScan = 0;
            data.needLogin = 0;
            e.stopImmediatePropagation();
            performBitrateSwitch(li);
        }
    }, true);
    let hasAutoSwitched = false;
    let autoSwitchAttempts = 0;

    function autoSetHighestQuality() {
        if (!autoHQ) return;
        const $vtList = document.querySelector('.player-videotype-list');
        const curQuality = document.querySelector('.player-videotype-cur');
        if (!$vtList || !$vtList.querySelectorAll('li').length) return;
        const lis = $vtList.querySelectorAll('li');
        lis.forEach(li => sanitizeBitrateData(li));
        const highestLi = lis[0];
        const highestText = highestLi.textContent.trim().replace('扫码即享', '');
        if (!hasAutoSwitched && autoSwitchAttempts < 8) {
            autoSwitchAttempts++;
            performBitrateSwitch(highestLi);
            const video = document.querySelector('video');
            if (video && (video.videoWidth >= 1280 || autoSwitchAttempts >= 4)) {
                hasAutoSwitched = true;
                console.log(`[虎牙纯净版] 智能原生事件驱动强切最高画质成功: ${highestText}`);
            }
        }
        const qModals = document.querySelectorAll('.J_PortalGlobalRoot, .ModalH5--oUHjECH31csWN7huRN6s, [class*="QualityCodePop"]');
        qModals.forEach(m => m.remove());
    }
    // ==========================================
    // 3. 右侧贴边 + 绝对时间戳防哑火靠边隐藏
    // ==========================================
    let lastInteractTime = 0;
    let isDragging = false;

    function injectInPageSettingsUI() {
        if (document.getElementById('hy-cleaner-btn')) return;
        let savedPos = GM_getValue(CONFIG_KEY_BTN_POS, null);
        let initialTop = 160;
        if (savedPos && typeof savedPos.top === 'number') {
            initialTop = Math.max(40, Math.min(window.innerHeight - 40, savedPos.top));
        }
        const btn = document.createElement('div');
        btn.id = 'hy-cleaner-btn';
        btn.innerHTML = `
<span class="hy-btn-icon" style="font-size: 13px; margin-right: 4px; display: inline-block; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">⚡</span>
<span class="hy-btn-text" style="letter-spacing: 0.5px;">设置</span>
`;
        btn.style.cssText = `
position: fixed;
right: 0px !important;
left: auto !important;
top: ${initialTop}px;
z-index: 999999;
background: linear-gradient(135deg, rgba(35, 35, 45, 0.92), rgba(20, 20, 28, 0.96));
color: #ffffff;
padding: 6px 12px;
font-size: 12px;
font-weight: 600;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
border-radius: 20px 0 0 20px;
cursor: pointer !important;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 136, 0, 0.35);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
user-select: none;
transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
display: flex;
align-items: center;
`;
        const modal = document.createElement('div');
        modal.id = 'hy-cleaner-modal';
        modal.style.cssText = `
display: none;
position: fixed;
z-index: 1000000;
background: linear-gradient(145deg, rgba(28, 28, 36, 0.96), rgba(18, 18, 24, 0.98));
color: #e0e0e0;
padding: 18px 20px;
width: 260px;
border-radius: 14px;
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
font-size: 13px;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
user-select: none;
transition: opacity 0.2s ease, transform 0.2s ease;
`;
        modal.innerHTML = `
<div style="font-weight:700; font-size:14px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px; display:flex; justify-content:space-between; align-items:center; color:#fff;">
<span style="display:flex; align-items:center; gap:6px;">
<span style="color:#ff8800; font-size:16px;"></span>虎牙直播功能增强
</span>
<span id="hy-cleaner-close" style="cursor:pointer; color:#888; font-size:14px; padding:2px 6px; border-radius:4px; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#888'">✕</span>
</div>
<div style="display:flex; flex-direction:column; gap:12px;">
<label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
<span style="font-weight:500;">隐藏底栏整排礼物/活动条</span>
<span class="hy-cleaner-switch">
<input type="checkbox" id="chk-gift" ${hideGiftBar ? 'checked' : ''}>
<span class="hy-cleaner-slider"></span>
</span>
</label>
<label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
<span style="font-weight:500;">屏蔽横幅、角标与广告弹窗</span>
<span class="hy-cleaner-switch">
<input type="checkbox" id="chk-ads" ${hideWebAds ? 'checked' : ''}>
<span class="hy-cleaner-slider"></span>
</span>
</label>
<label style="display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
<span style="font-weight:500;">自动最高画质 (真实破解切流)</span>
<span class="hy-cleaner-switch">
<input type="checkbox" id="chk-hq" ${autoHQ ? 'checked' : ''}>
<span class="hy-cleaner-slider"></span>
</span>
</label>
</div>
<div style="font-size:11px; color:#ff8800; display:flex; justify-content:space-between; align-items:center; margin-top:14px; opacity:0.85;">
<span id="hy-btn-reset-pos" style="cursor:pointer; text-decoration:underline;" title="还原至初始高度">重置按钮位置</span>
</div>
`;
        (document.body || document.documentElement).appendChild(btn);
        (document.body || document.documentElement).appendChild(modal);
        // ------------------------------------------
        // 垂直吸附与靠边收缩逻辑 (使用精确时间戳)
        // ------------------------------------------
        function updateModalPos() {
            const wasHidden = modal.style.display === 'none' || !modal.style.display;
            if (wasHidden) {
                modal.style.visibility = 'hidden';
                modal.style.display = 'block';
            }
            const btnRect = btn.getBoundingClientRect();
            const modalWidth = modal.offsetWidth || 260;
            const modalHeight = modal.offsetHeight || 220;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let modalLeft = btnRect.right - modalWidth;
            modalLeft = Math.max(12, Math.min(vw - modalWidth - 12, modalLeft));
            let modalTop = btnRect.bottom + 8;
            if (modalTop + modalHeight > vh - 12) {
                modalTop = btnRect.top - modalHeight - 8;
            }
            modalTop = Math.max(12, Math.min(vh - modalHeight - 12, modalTop));
            modal.style.left = modalLeft + 'px';
            modal.style.top = modalTop + 'px';
            if (wasHidden) {
                modal.style.display = 'none';
                modal.style.visibility = 'visible';
            }
        }

        function triggerDockNow() {
            if (isDragging || modal.style.display === 'block') return;
            btn.classList.add('hy-docked');
            btn.style.transform = 'translateX(calc(100% - 22px))';
            btn.style.opacity = '0.65';
            btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        }

        function triggerUndockNow() {
            btn.classList.remove('hy-docked');
            btn.style.transform = 'translateX(0)';
            btn.style.opacity = '1';
            btn.style.boxShadow = '0 6px 20px rgba(255, 136, 0, 0.35), 0 0 0 1px rgba(255, 136, 0, 0.6)';
        }
        // 窗口大小变化防超出
        window.addEventListener('resize', () => {
            let currentTop = parseInt(btn.style.top, 10) || 160;
            let validTop = Math.max(40, Math.min(window.innerHeight - 40, currentTop));
            btn.style.top = validTop + 'px';
            btn.style.right = '0px';
            btn.style.left = 'auto';
            if (modal.style.display === 'block') {
                updateModalPos();
            }
        });
        // 交互时间戳追踪
        btn.addEventListener('mouseenter', () => {
            lastInteractTime = Date.now();
            triggerUndockNow();
        });
        btn.addEventListener('mousemove', () => {
            lastInteractTime = Date.now();
            if (btn.classList.contains('hy-docked')) {
                triggerUndockNow();
            }
        });
        btn.addEventListener('mouseleave', () => {
            lastInteractTime = Date.now() - 600; // 鼠标移出后 600ms 即刻触发收缩
        });
        modal.addEventListener('mouseenter', () => {
            lastInteractTime = Date.now();
        });
        // 仅限垂直上下拖动
        let hasMoved = false;
        let startY = 0;
        let origTop = 0;
        btn.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = false;
            hasMoved = false;
            startY = e.clientY;
            origTop = parseInt(btn.style.top, 10) || 160;
            lastInteractTime = Date.now();

            function onMouseMove(ev) {
                const dy = ev.clientY - startY;
                if (Math.abs(dy) > 3) {
                    hasMoved = true;
                    isDragging = true;
                    lastInteractTime = Date.now();
                    triggerUndockNow();
                    btn.style.transition = 'none';
                    let newTop = origTop + dy;
                    newTop = Math.max(20, Math.min(window.innerHeight - btn.offsetHeight - 20, newTop));
                    btn.style.top = newTop + 'px';
                    btn.style.right = '0px';
                    btn.style.left = 'auto';
                    if (modal.style.display === 'block') {
                        updateModalPos();
                    }
                }
            }

            function onMouseUp() {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                if (isDragging) {
                    btn.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease';
                    const finalTop = parseInt(btn.style.left, 10);
                    GM_setValue(CONFIG_KEY_BTN_POS, {
                        top: parseInt(btn.style.top, 10)
                    });
                    lastInteractTime = Date.now();
                }
            }
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
        btn.addEventListener('click', (e) => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            lastInteractTime = Date.now();
            if (modal.style.display === 'none' || !modal.style.display) {
                updateModalPos();
                modal.style.display = 'block';
                modal.style.opacity = '1';
            } else {
                modal.style.display = 'none';
                lastInteractTime = Date.now() - 700;
            }
        });
        document.getElementById('hy-cleaner-close').onclick = () => {
            modal.style.display = 'none';
            lastInteractTime = Date.now() - 700;
        };
        document.getElementById('hy-btn-reset-pos').onclick = () => {
            GM_setValue(CONFIG_KEY_BTN_POS, null);
            btn.style.top = '160px';
            btn.style.right = '0px';
            btn.style.left = 'auto';
            if (modal.style.display === 'block') updateModalPos();
            lastInteractTime = Date.now();
        };
        // 点击外部关闭弹窗
        document.addEventListener('click', (e) => {
            if (modal.style.display === 'block' && !modal.contains(e.target) && !btn.contains(e.target)) {
                modal.style.display = 'none';
                lastInteractTime = Date.now() - 700;
            }
        });
        // 变化项事件绑定
        document.getElementById('chk-gift').onchange = (e) => {
            GM_setValue(CONFIG_KEY_GIFT_BAR, e.target.checked);
            location.reload();
        };
        document.getElementById('chk-ads').onchange = (e) => {
            GM_setValue(CONFIG_KEY_WEB_ADS, e.target.checked);
            location.reload();
        };
        document.getElementById('chk-hq').onchange = (e) => {
            GM_setValue(CONFIG_KEY_AUTO_HQ, e.target.checked);
            location.reload();
        };
    }

    function cleanDynamicElements() {
        if (hideWebAds) {
            const popupAds = document.querySelectorAll(`
#player-wrap [class*="popup-"], .room-player-wrap [class*="popup-"],
iframe[src*="zt.huya.com"], iframe[src*="interactive"],
#player-bitrate-tips, #player-flac-tips, #player-recharge-tip,
[class*="Broadcast"], [class*="broadcast"],
[class*="Horn"], [class*="horn"],
[class*="GiftNotice"], [class*="GiftBroadcast"], [class*="GiftBanner"],
[class*="NobleEnter"], [class*="RollNotice"], [class*="Marquee"],
#J_roomHorn, #J_roomNotice, #J_playerHorn, #J_playerNotice
`);
            popupAds.forEach(el => el.remove());
        }
        const btnInstances = document.querySelectorAll('#hy-cleaner-btn');
        if (btnInstances.length > 1) {
            for (let i = 1; i < btnInstances.length; i++) {
                btnInstances[i].remove();
            }
        }
        // 绝对时间戳防哑火保底：超过 1 秒无交互且弹窗未打开，强行触发靠边收缩
        const btn = document.getElementById('hy-cleaner-btn');
        const modal = document.getElementById('hy-cleaner-modal');
        const isModalOpen = modal && modal.style.display === 'block';
        if (btn && !isDragging && !isModalOpen) {
            if (Date.now() - lastInteractTime > 1000) {
                if (!btn.classList.contains('hy-docked')) {
                    btn.classList.add('hy-docked');
                    btn.style.transform = 'translateX(calc(100% - 22px))';
                    btn.style.opacity = '0.65';
                    btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                }
            }
        }
    }
    // ==========================================
    // 4. 监听与初始化轮询
    // ==========================================
    function initObserver() {
        const timer = setInterval(() => {
            autoSetHighestQuality();
            cleanDynamicElements();
            injectInPageSettingsUI();
        }, 800);
        setTimeout(() => {
            clearInterval(timer);
            setInterval(() => {
                autoSetHighestQuality();
                cleanDynamicElements();
            }, 1000);
        }, 10000);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initObserver);
    } else {
        initObserver();
    }
})();