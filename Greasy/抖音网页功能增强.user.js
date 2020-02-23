// ==UserScript==
// @name			抖音网页功能增强
// @version			2026101740
// @match			*://*.douyin.com/*
// @require			https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.31/vue.global.min.js
// @grant			GM_addStyle
// @grant			GM_download
// @grant			GM_getValue
// @grant			GM_info
// @grant			GM_registerMenuCommand
// @grant			GM_setValue
// @grant			unsafeWindow
// @grant			window.close
// @noframes
// @icon			https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/douyin.png
// @run-at			document-start
// @downloadURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%8A%96%E9%9F%B3%E7%BD%91%E9%A1%B5%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// @updateURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%8A%96%E9%9F%B3%E7%BD%91%E9%A1%B5%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// ==/UserScript==
// ★ 版本号唯一来源：读 @version 头部声明
const SCRIPT_VERSION = (() => {
    try {
        return GM_info.script.version;
    } catch (e) {
        return '0.0.0';
    }
})();
// =========================================================
//  [新增] Lucide 风格图标字典（24x24 viewBox · stroke 单色）
// =========================================================
const DY_ICON_PATHS = {
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    arrowDownToLine: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
    chevronsDown: '<path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    rotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    microscope: '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
    keyboard: '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
    barChart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    broom: '<path d="m13 11 9-9"/><path d="M14.6 12.6c.8.8.9 2.1.2 3L10 22l-8-8 6.4-4.8c.9-.7 2.2-.6 3 .2Z"/><path d="m6.8 10.4 6.8 6.8"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    refreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    mouse: '<rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 6v4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    sliders: '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
};
// ★ 非 Vue 上下文（自检面板 / 错误报告）用的字符串 helper
function dyIconSvg(name, size = 14) {
    const p = DY_ICON_PATHS[name] || '';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ` +
        `fill="none" stroke="currentColor" stroke-width="2" ` +
        `stroke-linecap="round" stroke-linejoin="round" ` +
        `style="display:inline-block;vertical-align:-2px;margin-right:5px;flex-shrink:0;" ` +
        `aria-hidden="true">${p}</svg>`;
}
// =========================================================
//  [重构] 抖音稳定选择器表
//  data-e2e / data-* / id 优先；哈希类名（LebMor1Z、jZefMs6I 等）一律不写
// =========================================================
const SEL = {
    // 页面骨架
    root: '#root',
    rightContainer: '#douyin-right-container',
    header: '#douyin-header',
    slideList: '#slidelist',
    // 推荐流 / 卡片
    feedItem: '[data-e2e="feed-item"]',
    activeVideo: '[data-e2e="feed-active-video"]',
    activeVideoId: '[data-e2e="feed-active-video"][data-e2e-vid]',
    liveCard: '[data-e2e="feed-live"]',
    nextArrow: '[data-e2e="video-switch-next-arrow"]',
    prevArrow: '[data-e2e="video-switch-prev-arrow"]',
    // 播放器（xgplayer 语义类，稳定）
    player: '.xgplayer',
    xgVideo: '.xgplayer video',
    clarityBtn: '.xgplayer-playclarity-setting .btn',
    clarityItem: '.xgplayer-playclarity-setting .virtual .item',
    timeCurrent: 'xg-icon.xgplayer-time .time-current',
    timeDuration: 'xg-icon.xgplayer-time .time-duration',
    // 视频信息
    videoInfo: '[data-e2e="video-info"]',
    videoDesc: '[data-e2e="video-desc"]',
    nickname: '[data-e2e="feed-video-nickname"]',
    // 弹幕
    danmakuBox: '[data-e2e="danmaku-container"]',
    danmuItem: '[data-danmu-id]',
    danmuText: '.danMuText',
    // 消息 / IM
    imEntry: '[data-e2e="im-entry"]',
    imPortal: '#im-entry-vmok-popup-portal',
    imContainer: '#imSaasContainerId',
    convItem: '[data-e2e="conversation-item"]',
    convTitle: '.conversationConversationItemtitle',
    convAvatar: '.commonIMAvataravatarContainer img, .semi-avatar-img img',
    convPreview: '.ConversationItemHinttextBox',
    convTime: '.ConversationItemTagNextToTitletimeStr',
    convUnread: '.ConversationItemUnReadCountdigitsNumberPop',
    // 顶部导航（插件自身注入点）
    tabMicrogame: '.tab-microgame',
    tabScriptMenu: '.tab-scriptmenu',
    // ========== [新增] 画质切换相关 ==========
    // 当前激活播放器容器
    activePlayer: '[data-e2e="feed-active-video"] .xgplayer',
    // 页面上所有播放器（用于兜底筛选）
    anyPlayer: '.xgplayer',
    // 清晰度选项的"选中态"（多标记兼容，抖音换一种就命中另一种）
    claritySelected: '.xgplayer-playclarity-setting .virtual .item[aria-checked="true"], ' +
        '.xgplayer-playclarity-setting .virtual .item.active, ' +
        '.xgplayer-playclarity-setting .virtual .item.selected, ' +
        '.xgplayer-playclarity-setting .virtual .item[data-selected="true"]',
    // 清晰度选项容器（兼容两种 DOM 结构）
    clarityOptions: '.xgplayer-playclarity-setting .virtual .item, ' +
        '.xgplayer-playclarity-setting .virtual > div',
    // 直播清晰度
    liveQualityBtn: '[data-e2e="quality"]',
    liveQualityBox: '[data-e2e="quality-selector"]',
};
// =========================================================
//  [重构] 抖音运行时全局变量工具（awemeInfo 比 DOM 更稳）
// =========================================================
function getQuickPlayerInfo() {
    try {
        const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
        const qp = W.__QUICK_PLAYER;
        if (!qp) return null;
        const info = qp.awemeInfo;
        if (!info) return null;
        return {
            desc: info.desc || '',
            author: info.authorInfo?.nickname || '',
            awemeId: info.awemeId || '',
            raw: info,
        };
    } catch (e) {
        return null;
    }
}
// 当前激活视频 ID（三层兜底）
function getCurrentVideoId() {
    const el = document.querySelector(SEL.activeVideoId);
    if (el) {
        const v = el.getAttribute('data-e2e-vid');
        if (v) return v;
    }
    const qp = getQuickPlayerInfo();
    if (qp && qp.awemeId) return qp.awemeId;
    return '';
}
// =========================================================
//          加载状态提示（最早执行，用于自检）
// =========================================================
(function initLoadTip() {
    let tipEl = null;
    let resolved = false;
    let useSplashMode = false;
    const splashWillShow = (() => {
        try {
            const s = GM_getValue('DY_Settings', {});
            if (!s.enableSplashScreen) return false;
            if (sessionStorage.getItem('dySplashShown')) return false;
            return true;
        } catch (e) {
            return false;
        }
    })();
    const ensureFloatEl = () => {
        if (tipEl && tipEl.parentNode) return tipEl;
        if (!document.body) return null;
        tipEl = document.createElement('div');
        tipEl.id = 'dyLoadTip';
        tipEl.style.cssText = [
            'position:fixed',
            'top:calc(6vh - 38px)',
            'right:max(2vw, 10px)',
            'z-index:2147483646',
            'padding:0 16px',
            'height:32px',
            'line-height:32px',
            'border-radius:6px',
            'font-size:var(--dy-font-size-md, 13px)',
            'font-weight:600',
            "font-family:'PingFang SC','Microsoft YaHei',sans-serif",
            'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
            'pointer-events:none',
            'transition:opacity 0.4s ease',
            'opacity:0',
            'max-width:92vw',
            'overflow:hidden',
            'text-overflow:ellipsis',
            'white-space:nowrap',
            '-webkit-backdrop-filter:blur(12px) saturate(1.4)',
            'backdrop-filter:blur(12px) saturate(1.4)',
        ].join(';');
        document.body.appendChild(tipEl);
        return tipEl;
    };
    let floatShownAt = 0;
    const _tipColors = (type) => {
        const isLight = (typeof ThemeManager !== 'undefined') ?
            ThemeManager.getTheme() === 'light' :
            document.documentElement.getAttribute('data-dy-theme') === 'light';
        if (isLight) {
            if (type === 'error') return {
                color: '#b71c1c',
                bg: 'rgba(255,255,255,0.30)'
            };
            if (type === 'timeout') return {
                color: '#e65100',
                bg: 'rgba(255,255,255,0.30)'
            };
            return {
                color: '#1c1c1e',
                bg: 'rgba(255,255,255,0.30)'
            };
        }
        if (type === 'error') return {
            color: '#ff8080',
            bg: 'rgba(180,40,40,0.96)'
        };
        if (type === 'timeout') return {
            color: '#ffcc66',
            bg: 'rgba(200,120,20,0.96)'
        };
        return {
            color: '#fff',
            bg: 'rgba(64,64,64,0.95)'
        };
    };
    const showFloatTip = (text, type) => {
        const el = ensureFloatEl();
        if (!el) return;
        if (!floatShownAt) floatShownAt = Date.now();
        const c = _tipColors(type);
        el.textContent = text;
        el.style.background = c.bg;
        el.style.color = c.color;
        el.style.opacity = '1';
    };
    const hideFloatTip = (delayMs) => {
        setTimeout(() => {
            if (!tipEl) return;
            tipEl.style.opacity = '0';
            const el = tipEl;
            tipEl = null;
            setTimeout(() => {
                if (el.parentNode) el.remove();
            }, 500);
        }, delayMs || 0);
    };
    const showTip = (text, type) => {
        if (splashWillShow) {
            useSplashMode = true;
            // 开屏封面是黑底设计，用亮色文案
            let color = 'rgba(255,255,255,0.42)';
            if (type === 'error') color = '#ff8080';
            if (type === 'timeout') color = '#ffcc66';
            if (typeof window.__dySplashStatus === 'function') {
                window.__dySplashStatus(text, color);
            } else {
                window.__dyPendingLoadTip = {
                    text,
                    color
                };
            }
            return;
        }
        showFloatTip(text, type);
    };
    const hideTip = (delayMs) => {
        if (useSplashMode) return;
        hideFloatTip(delayMs);
    };
    const waitBody = (cb) => {
        if (document.body) {
            cb();
            return;
        }
        const iv = setInterval(() => {
            if (document.body) {
                clearInterval(iv);
                cb();
            }
        }, 30);
    };
    waitBody(() => {
        showTip('插件加载中', 'loading');
    });
    window.addEventListener('error', (e) => {
        if (resolved) return;
        const msg = (e && e.message) ? e.message : '未知错误';
        showTip('✕ 插件加载失败：' + msg.slice(0, 50), 'error');
        hideTip(10000);
    }, true);
    const timeoutId = setTimeout(() => {
        if (resolved) return;
        showTip('⚠ 插件加载超时，请检查油猴是否正常 / 网络是否可达', 'timeout');
        hideTip(10000);
    }, 6000);
    const MIN_SHOW_MS = 900;
    window.__dyLoadOk = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        if (useSplashMode) return;
        const hide = () => {
            if (tipEl) {
                tipEl.style.opacity = '0';
                const el = tipEl;
                tipEl = null;
                setTimeout(() => {
                    if (el.parentNode) el.remove();
                }, 400);
            }
        };
        const elapsed = floatShownAt ? (Date.now() - floatShownAt) : MIN_SHOW_MS;
        const wait = Math.max(0, MIN_SHOW_MS - elapsed);
        if (wait > 0) setTimeout(hide, wait);
        else hide();
    };
    window.__dyLoadFail = (msg) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        showTip('✕ 插件加载失败：' + (msg || '').slice(0, 50), 'error');
        hideTip(10000);
    };
})();
// =========================================================
//            崩溃日志系统（最先初始化）
// =========================================================
const CrashLog = (() => {
    const KEY = 'DY_CrashLog';
    const DEFAULT_MAX = 30;
    const DEDUPE_WINDOW_MS = 10 * 60 * 1000; // 10 分钟内同类错误合并
    function getMax() {
        try {
            const v = Number(settings.crashLogMaxEntries);
            return Number.isFinite(v) ? Math.max(10, Math.min(100, v)) : DEFAULT_MAX;
        } catch (e) {
            return DEFAULT_MAX;
        }
    }

    function getAll() {
        try {
            const v = GM_getValue(KEY, []);
            return Array.isArray(v) ? v : [];
        } catch (e) {
            return [];
        }
    }

    function fingerprint(entry) {
        return String(entry.type || '') + '|' +
            String(entry.module || '') + '|' +
            String(entry.message || '').slice(0, 80) + '|' +
            String(entry.stack || '').slice(0, 200);
    }

    function push(entry) {
        try {
            const list = getAll();
            const fp = fingerprint(entry);
            const now = Date.now();
            const item = {
                time: now,
                timeStr: new Date().toLocaleString('zh-CN'),
                version: SCRIPT_VERSION,
                url: String(location.href).slice(0, 200),
                fp,
                count: 1,
                ...entry,
            };
            if (item.stack && item.stack.length > 2000) item.stack = item.stack.slice(0, 2000) + '…';
            if (item.message && item.message.length > 500) item.message = item.message.slice(0, 500) + '…';
            // 去重合并
            const dupIdx = list.findIndex(h => h.fp === fp);
            if (dupIdx >= 0 && now - (list[dupIdx].time || 0) < DEDUPE_WINDOW_MS) {
                const merged = list.splice(dupIdx, 1)[0];
                merged.count = (merged.count || 1) + 1;
                merged.lastTime = now;
                merged.lastTimeStr = item.timeStr;
                list.unshift(merged);
                GM_setValue(KEY, list.slice(0, getMax()));
                return;
            }
            list.unshift(item);
            GM_setValue(KEY, list.slice(0, getMax()));
        } catch (e) {}
    }

    function clear() {
        try {
            GM_setValue(KEY, []);
        } catch (e) {}
    }

    function latest() {
        const list = getAll();
        return list.length > 0 ? list[0] : null;
    }
    return {
        getAll,
        push,
        clear,
        latest,
        getMax
    };
})();
// =========================================================
//   [新增] 实时监控事件总线（供各功能模块打点）
// =========================================================
const Monitor = (function() {
    const buffer = [];
    const MAX = 300;
    const listeners = new Set();
    const _throttleMap = new Map();
    let seq = 0;
    const CATEGORY_COLOR = {
        quality: '#4FC3F7',
        danmu: '#81C784',
        skip: '#FF8A65',
        pause: '#BA68C8',
        keep: '#BA68C8',
        lottery: '#FFD54F',
        msg: '#4DD0E1',
        immersive: '#9575CD',
        core: '#90A4AE',
        error: '#FF6B6B',
    };

    function fmtTime(d) {
        const t = d || new Date();
        return String(t.getHours()).padStart(2, '0') + ':' +
            String(t.getMinutes()).padStart(2, '0') + ':' +
            String(t.getSeconds()).padStart(2, '0');
    }

    function emit(category, message, level) {
        const entry = {
            id: ++seq,
            time: Date.now(),
            timeStr: fmtTime(),
            category: String(category || 'core'),
            message: String(message == null ? '' : message),
            level: level || 'info',
        };
        buffer.push(entry);
        if (buffer.length > MAX) buffer.shift();
        for (const fn of listeners) {
            try {
                fn(entry);
            } catch (e) {}
        }
        return entry;
    }

    function emitThrottled(key, category, message, intervalMs, level) {
        const now = Date.now();
        const last = _throttleMap.get(key) || 0;
        if (now - last < (intervalMs || 5000)) return null;
        _throttleMap.set(key, now);
        return emit(category, message, level);
    }

    function subscribe(fn) {
        if (typeof fn !== 'function') return () => {};
        listeners.add(fn);
        return () => listeners.delete(fn);
    }
    return {
        emit,
        emitThrottled,
        subscribe,
        getBuffer: () => buffer.slice(),
        clear: () => {
            buffer.length = 0;
        },
        getCategoryColor: (c) => CATEGORY_COLOR[c] || '#90A4AE',
    };
})();
// 全局未捕获错误 → 崩溃日志
(function installGlobalErrorCapture() {
    let count = 0;
    const LIMIT = 10;
    const startedAt = Date.now();
    window.addEventListener('error', (e) => {
        if (count >= LIMIT) return;
        if (!e.message && !e.error) return;
        count++;
        try {
            CrashLog.push({
                type: 'uncaught-error',
                message: String(e.message || (e.error && e.error.message) || '未知错误'),
                filename: String(e.filename || ''),
                line: e.lineno || 0,
                column: e.colno || 0,
                stack: (e.error && e.error.stack) ? String(e.error.stack) : '',
            });
        } catch (_) {}
    }, true);
    window.addEventListener('unhandledrejection', (e) => {
        if (count >= LIMIT) return;
        try {
            const r = e.reason;
            const msg = (r && r.message) ? String(r.message) : String(r);
            const stack = (r && r.stack) ? String(r.stack) : '';
            const isNetworkNoise =
                /^(Network Error|NetworkError|AbortError|CanceledError)/i.test(msg) ||
                /Failed to fetch|The operation was aborted|net::ERR|ERR_|request failed/i.test(msg) ||
                /^\s*at\s+(XMLHttpRequest|fetch|axios|createError)/.test(stack);
            if (isNetworkNoise) return;
            count++;
            CrashLog.push({
                type: 'unhandled-rejection',
                message: msg,
                stack,
            });
        } catch (_) {}
    }, true);
})();
// ★ [新增] console.error 捕获（过滤脚本自身的模块失败日志）
(function installConsoleErrorCapture() {
    if (window._dyConsoleHooked) return;
    window._dyConsoleHooked = true;
    const _origError = console.error;
    let lastAt = 0;
    let lastMsg = '';
    console.error = function(...args) {
        try {
            const msg = args.map(a => {
                if (a instanceof Error) return a.message || String(a);
                if (a && typeof a === 'object') {
                    try {
                        return JSON.stringify(a).slice(0, 200);
                    } catch (e) {
                        return String(a);
                    }
                }
                return String(a);
            }).join(' ');
            const now = Date.now();
            if (msg !== lastMsg || now - lastAt > 1000) {
                lastAt = now;
                lastMsg = msg;
                if (!/^\[抖音优化\]/.test(msg)) {
                    const errObj = args.find(a => a instanceof Error);
                    CrashLog.push({
                        type: 'console-error',
                        message: msg.slice(0, 500),
                        stack: (errObj && errObj.stack) ? String(errObj.stack) : '',
                    });
                }
            }
        } catch (e) {}
        return _origError.apply(console, args);
    };
})();
// =========================================================
//      分段加载器（每个功能模块独立 try-catch，互不影响）
// =========================================================
const ModuleLoader = (() => {
    const records = [];
    let recoveryMode = false;

    function nowMs() {
        return (typeof performance !== 'undefined' && performance.now) ?
            performance.now() : Date.now();
    }

    function setRecoveryMode(v) {
        recoveryMode = !!v;
    }

    function isRecoveryMode() {
        return recoveryMode;
    }

    function run(name, fn, opts) {
        opts = opts || {};
        const critical = !!opts.critical;
        const t0 = nowMs();
        try {
            fn();
            records.push({
                name,
                status: 'ok',
                critical,
                timeMs: nowMs() - t0
            });
            return true;
        } catch (e) {
            const err = {
                name,
                critical,
                message: (e && e.message) ? String(e.message) : String(e),
                stack: (e && e.stack) ? String(e.stack) : '',
            };
            records.push({
                name,
                status: 'error',
                critical,
                error: err
            });
            try {
                console.error(`[抖音优化] 模块「${name}」加载失败:`, e);
            } catch (_) {}
            CrashLog.push({
                type: 'module-error',
                module: name,
                critical,
                message: err.message,
                stack: err.stack,
            });
            return false;
        }
    }
    return {
        run,
        setRecoveryMode,
        isRecoveryMode,
        getRecords: () => records.slice(),
        getErrors: () => records.filter(r => r.status === 'error'),
        hasErrors: () => records.some(r => r.status === 'error'),
        reset: () => {
            records.length = 0;
        },
    };
})();
// 简易 HTML 转义（报告面板用）
function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    } [c]));
}
// =========================================================
//                          配置
// =========================================================
const DEFAULT_SETTINGS = {
    blockedDanmu_Switch: false,
    blockedDanmu_UseRegular: true,
    blockedDanmu_Array: [],
    enableQualitySwitch: true,
    enablePayHide: true,
    enableMirror: false,
    enableGiftFilter: true,
    enableKeepAlive: true,
    hideNonVideoElements_Switch: true,
    interactionLockDelay: 3.0,
    pollingQuality: 1.5,
    pollingDanmu: 0.5,
    qualityClickDedupe: 2500, // 画质切换去重窗口（毫秒）
    qualityForceWait: 8000, // 已选最高画质但视频流未生效时，强制重选前的等待窗口（毫秒）
    qualityForceMaxRetries: 3, // 已选最高画质但视频流未生效时，最多强制重选几次
    consoleOutputLog_Switch: false,
    hideBlockedWordsInMenu_Switch: false,
    poolSizeLimit: 50,
    customPlaybackRate: 1.0,
    enableSplashScreen: false,
    enableMsgFloat: true,
    // Video parsing and download settings
    parseVideo: true,
    'dy-video-downloader-addDownloadButton': true,
    'dy-video-popupDownloadRenameFileName': false,
    'dy-video-parseVideo-downloadFileName': '{uid}-{nickname}-{desc}-{quality}-{downloadTime}',
    'dy-video-parseVideoMusic-downloadFileName': '{author}-{title}-{duration}-{downloadTime}',
    skipLive_Switch: false,
    skipVideoRegex_Switch: false,
    skipVideoRegex_UseRegular: true,
    skipVideoRegex_Array: [],
    skipVideoMask_Switch: true,
    skipVideoPolling: 0.3,
    skipVideoCooldown: 3000,
    skipVideoRetryInterval: 1500,
    skipVideoRetryTimeout: 8000,
    skipVideoBtnFallbackDelay: 300,
    pauseGuard_visibilitySpoof: true,
    pauseGuard_eventBlocking: true,
    pauseGuard_rafReplacement: true,
    pauseGuard_mouseSimulation: true,
    pauseGuard_popupClick: true,
    pauseGuard_backgroundResume: true,
    enableKeyboardShortcuts: true,
    keyTogglePayHide: '=',
    keyToggleGiftFilter: '*',
    keyToggleMirror: '/',
    enableNavButton: true,
    pauseGuard_mouseSimInterval: 60,
    pauseGuard_backgroundResumeInterval: 30,
    pauseGuard_visibilityCheckInterval: 3,
    pauseGuard_popupClickInterval: 2,
    pauseGuard_popupClickDedupe: 1.5,
    pauseGuard_domMutationDebounce: 500,
    splashDuration: 1200,
    splashFadeoutMs: 600,
    splashBgColor: '#000000',
    splashSlogan: '记录美好生活',
    enableImmersivePersist: false,
    hijackImmersiveShortcut: false,
    immersiveState: false,
    enableLottery: false,
    lotteryShowFloatPanel: true,
    lotteryPollingIdle: 60,
    lotteryPollingActive: 1,
    lotteryAutoCloseDelay: 1000,
    lotterySkipMultiCond: true,
    preferQuickPlayer: true,
    themeMode: 'auto', // 'auto' | 'dark' | 'light'
    tooltipShowDelay: 700,
    tooltipHideDelay: 100,
    debugMode: false,
    monitorAutoOpen: false, // 下次加载时是否自动打开实时监控浮窗
    crashLogMaxEntries: 30,
};
let settings = GM_getValue("DY_Settings", {});
for (const key in DEFAULT_SETTINGS) {
    if (!(key in settings)) settings[key] = DEFAULT_SETTINGS[key];
}
// =========================================================
//              旧数据迁移：字符串 → {text, useRegex}
// =========================================================
(function migrateSettings() {
    let changed = false;

    function migrateArray(arr, defaultRegex) {
        if (!Array.isArray(arr)) return {
            arr: [],
            changed: false
        };
        let localChanged = false;
        const out = arr.map(item => {
            if (typeof item === 'string') {
                localChanged = true;
                return {
                    text: item,
                    useRegex: !!defaultRegex
                };
            }
            if (item && typeof item === 'object' && typeof item.text === 'string') {
                if (typeof item.useRegex !== 'boolean') {
                    localChanged = true;
                    return {
                        text: item.text,
                        useRegex: !!defaultRegex
                    };
                }
                return item;
            }
            localChanged = true;
            return null;
        }).filter(Boolean);
        return {
            arr: out,
            changed: localChanged
        };
    }
    const r1 = migrateArray(settings.blockedDanmu_Array, settings.blockedDanmu_UseRegular);
    if (r1.changed) {
        settings.blockedDanmu_Array = r1.arr;
        changed = true;
    } else settings.blockedDanmu_Array = r1.arr;
    const r2 = migrateArray(settings.skipVideoRegex_Array, settings.skipVideoRegex_UseRegular);
    if (r2.changed) {
        settings.skipVideoRegex_Array = r2.arr;
        changed = true;
    } else settings.skipVideoRegex_Array = r2.arr;
    if (changed) GM_setValue('DY_Settings', settings);
})();
GM_setValue('DY_Settings', settings);
// =========================================================
//              主题管理（深浅色自动识别）
// =========================================================
const ThemeManager = (function() {
    let current = 'dark';
    const listeners = [];
    let observer = null;
    let pollTimer = null;
    let _debounce = null;

    function parseBg(str) {
        if (!str || str === 'transparent') return null;
        const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
        if (!m) return null;
        const a = (m[4] === undefined) ? 1 : parseFloat(m[4]);
        if (a === 0) return null;
        return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
    }

    function detectFromDom() {
        const html = document.documentElement;
        const body = document.body;
        // 1. data-theme
        for (const el of [html, body]) {
            if (!el || !el.getAttribute) continue;
            const dt = el.getAttribute('data-theme');
            if (dt === 'light') return 'light';
            if (dt === 'dark') return 'dark';
        }
        // 2. class
        for (const el of [html, body]) {
            if (!el || !el.classList) continue;
            const c = el.classList;
            if (c.contains('theme-light') || c.contains('light-mode') || c.contains('light')) return 'light';
            if (c.contains('theme-dark') || c.contains('dark-mode') || c.contains('dark')) return 'dark';
        }
        // 3. body / html 背景亮度
        try {
            for (const el of [body, html]) {
                if (!el) continue;
                const rgb = parseBg(getComputedStyle(el).backgroundColor);
                if (rgb) {
                    const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
                    return lum > 0.5 ? 'light' : 'dark';
                }
            }
        } catch (e) {}
        // 4. 系统偏好
        try {
            if (window.matchMedia) {
                if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
            }
        } catch (e) {}
        return 'dark';
    }

    function resolve() {
        const mode = settings.themeMode || 'auto';
        if (mode === 'light') return 'light';
        if (mode === 'dark') return 'dark';
        return detectFromDom();
    }

    function emit(theme) {
        for (const fn of listeners) {
            try {
                fn(theme);
            } catch (e) {}
        }
    }

    function apply(theme, silent) {
        if (!document.documentElement) return;
        if (current === theme &&
            document.documentElement.getAttribute('data-dy-theme') === theme) return;
        current = theme;
        document.documentElement.setAttribute('data-dy-theme', theme);
        if (!silent) emit(theme);
    }

    function update() {
        const t = resolve();
        if (t !== current) apply(t, false);
    }

    function onChange(fn) {
        if (typeof fn === 'function') listeners.push(fn);
    }

    function getTheme() {
        return current;
    }

    function setMode(mode) {
        if (!['auto', 'dark', 'light'].includes(mode)) return;
        settings.themeMode = mode;
        GM_setValue('DY_Settings', settings);
        const t = resolve();
        apply(t, false);
        if (current === t) emit(t); // 强制通知一次，方便 UI 刷新
    }

    function watch() {
        if (observer) return;
        const opts = {
            attributes: true,
            attributeFilter: ['class', 'style', 'data-theme']
        };
        try {
            observer = new MutationObserver(() => {
                if (_debounce) return;
                _debounce = setTimeout(() => {
                    _debounce = null;
                    update();
                }, 120);
            });
            observer.observe(document.documentElement, opts);
        } catch (e) {}
        const attachBody = () => {
            if (!observer || !document.body) return false;
            try {
                observer.observe(document.body, opts);
            } catch (e) {}
            update();
            return true;
        };
        if (!attachBody()) {
            const iv = setInterval(() => {
                if (attachBody()) clearInterval(iv);
            }, 200);
        }
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(update, 2000);
    }
    // 立刻应用一次，让 GM_addStyle 注入的 CSS 能立即匹配
    try {
        current = resolve();
        document.documentElement.setAttribute('data-dy-theme', current);
    } catch (e) {
        try {
            document.documentElement.setAttribute('data-dy-theme', 'dark');
        } catch (_) {}
    }
    return {
        update,
        onChange,
        getTheme,
        setMode,
        watch,
        apply
    };
})();
// =========================================================
//                    日志
// =========================================================
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function cc(color, ...args) {
    console.log(colors[color] + args.join(' ') + colors.reset);
}

function log(...args) {
    if (settings.consoleOutputLog_Switch) console.log(`[${new Date().toLocaleTimeString()}]`, ...args);
}

function plog(...args) {
    if (settings.consoleOutputLog_Switch) console.log('[防暂停]', ...args);
}

function dlog(module, ...args) {
    if (settings.consoleOutputLog_Switch && settings.debugMode) {
        console.log(`%c[⌬ ${module}]`, 'color:#9C27B0;font-weight:bold', new Date().toLocaleTimeString(), ...args);
    }
}
// =========================================================
//         规则条目通用工具（每个词独立正则/关键词）
// =========================================================
function ruleGetText(item) {
    if (item == null) return '';
    if (typeof item === 'string') return item;
    return item.text || '';
}

function ruleGetUseRegex(item, fallback) {
    if (item == null) return !!fallback;
    if (typeof item === 'string') return !!fallback;
    return item.useRegex !== false;
}

function ruleTestItem(item, text, fallbackRegex) {
    const kw = ruleGetText(item);
    if (!kw) return false;
    const useRe = ruleGetUseRegex(item, fallbackRegex);
    if (useRe) {
        try {
            return new RegExp(kw, 'i').test(text);
        } catch (e) {
            return false;
        }
    }
    return text.includes(kw);
}
// =========================================================
//              全局防暂停模块（document-start 立即执行）
// =========================================================
const PauseGuard = (function() {
    const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
    const D = document;
    const DocProto = Object.getPrototypeOf(D);
    let _enabled = settings.enableKeepAlive !== false;
    let _dedupeMs = (settings.pauseGuard_popupClickDedupe || 1.5) * 1000;
    let _nativeHiddenGetter = null;
    let _nativeVisGetter = null;
    let _nativeHasFocusFn = null;
    try {
        _nativeHiddenGetter = Object.getOwnPropertyDescriptor(DocProto, 'hidden').get;
        _nativeVisGetter = Object.getOwnPropertyDescriptor(DocProto, 'visibilityState').get;
        _nativeHasFocusFn = DocProto.hasFocus;
    } catch (e) {}
    const _nativeAddEventListener = EventTarget.prototype.addEventListener;
    const _nativeRemoveEventListener = EventTarget.prototype.removeEventListener;
    const realHidden = () => _nativeHiddenGetter ? _nativeHiddenGetter.call(D) : D.hidden;

    function patchVisibility() {
        if (!settings.pauseGuard_visibilitySpoof) return;
        const hijack = (proto, name, onValue) => {
            try {
                Object.defineProperty(proto, name, {
                    configurable: true,
                    get: () => _enabled ? onValue : (name.toLowerCase().indexOf('hidden') >= 0 ? realHidden() : (name.toLowerCase().indexOf('vis') >= 0 ? (_nativeVisGetter ? _nativeVisGetter.call(D) : 'visible') : onValue)),
                    set: () => {}
                });
            } catch (e) {}
        };
        hijack(DocProto, 'hidden', false);
        hijack(DocProto, 'visibilityState', 'visible');
        hijack(DocProto, 'webkitHidden', false);
        hijack(DocProto, 'webkitVisibilityState', 'visible');
        hijack(DocProto, 'mozHidden', false);
        hijack(DocProto, 'mozVisibilityState', 'visible');
        hijack(DocProto, 'msHidden', false);
        hijack(DocProto, 'msVisibilityState', 'visible');
        try {
            DocProto.hasFocus = function() {
                if (_enabled) return true;
                return _nativeHasFocusFn ? _nativeHasFocusFn.call(D) : true;
            };
        } catch (e) {}
        plog('可见性伪装已安装');
    }
    const BLOCKED_EVENTS = {
        visibilitychange: 1,
        webkitvisibilitychange: 1,
        mozvisibilitychange: 1,
        msvisibilitychange: 1
    };

    function shouldBlockEvent(type, target) {
        if (!_enabled) return false;
        if (!settings.pauseGuard_eventBlocking) return false;
        if (!BLOCKED_EVENTS[type]) return false;
        return target === D || target === W;
    }

    function patchEventTarget() {
        try {
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (shouldBlockEvent(type, this)) return;
                return _nativeAddEventListener.call(this, type, listener, options);
            };
            EventTarget.prototype.removeEventListener = function(type, listener, options) {
                if (shouldBlockEvent(type, this)) return;
                return _nativeRemoveEventListener.call(this, type, listener, options);
            };
            plog('事件拦截已安装');
        } catch (e) {}
    }

    function patchRaf() {
        if (!settings.pauseGuard_rafReplacement) return;
        try {
            W.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
            W.cancelAnimationFrame = (id) => clearTimeout(id);
            plog('rAF 已替换为 setTimeout');
        } catch (e) {}
    }
    const collectEls = (root, out) => {
        if (!root) return;
        const walker = D.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        let el;
        while ((el = walker.nextNode())) {
            out.push(el);
            if (el.shadowRoot) collectEls(el.shadowRoot, out);
        }
    };
    let eligibleVideos = new WeakSet();
    let eligibleCount = 0;
    const mutedOrig = new WeakMap();

    function snapshotPlayingAtHide() {
        const list = [];
        collectEls(D.documentElement, list);
        for (const v of list) {
            if (v.tagName === 'VIDEO' && !v.paused && !eligibleVideos.has(v)) {
                eligibleVideos.add(v);
                eligibleCount++;
            }
        }
        if (eligibleCount) plog(`[资格] 快照：${eligibleCount} 个视频允许后台恢复`);
    }

    function markPausedWhileHidden(v) {
        if (!eligibleVideos.has(v)) {
            eligibleVideos.add(v);
            eligibleCount++;
            plog('[资格] 隐藏期间视频被暂停，允许恢复');
        }
    }

    function playVideos(forceMute) {
        const list = [];
        collectEls(D.documentElement, list);
        let resumed = 0;
        for (const v of list) {
            if (v.tagName !== 'VIDEO' || v.paused === false || v.ended) continue;
            if (!eligibleVideos.has(v)) continue;
            if (forceMute && !v.muted) {
                try {
                    mutedOrig.set(v, false);
                    v.muted = true;
                } catch (e) {}
            }
            v.play().catch(() => {});
            resumed++;
        }
        if (resumed) {
            plog(`已恢复 ${resumed} 个视频`);
            Monitor.emitThrottled('p-resume', 'pause', '后台恢复 ' + resumed + ' 个视频', 5000, 'ok');
        }
    }

    function restoreVideos() {
        const list = [];
        collectEls(D.documentElement, list);
        for (const v of list) {
            if (v.tagName === 'VIDEO' && mutedOrig.has(v)) {
                try {
                    v.muted = mutedOrig.get(v);
                } catch (e) {}
                mutedOrig.delete(v);
            }
        }
    }
    const RESUME_SELECTORS = [
        '.igUiNOJ9 .TxVs4ENa.dRu312SK.eE0e9Gi3',
        '.TxVs4ENa.dRu312SK.eE0e9Gi3',
        '.dRu312SK.eE0e9Gi3',
        '.dRu312SK'
    ];
    const PAUSE_DIALOG_SELECTORS = ['.igUiNOJ9', '.cfrKAQ5G', '.kSQMetim'];
    const PAUSE_DIALOG_HINT = '长时间无操作';
    const POPUP_TEXTS = ['继续播放', '继续观看', '恢复播放'];
    const FORBIDDEN_TEXTS = ['使用客户端免弹窗', '免弹窗', '客户端'];
    let lastClickedBtn = null;
    let lastClickedAt = 0;

    function isForbidden(txt) {
        return FORBIDDEN_TEXTS.some(f => txt.indexOf(f) >= 0);
    }

    function isPauseDialogVisible() {
        for (const sel of PAUSE_DIALOG_SELECTORS) {
            try {
                const el = D.querySelector(sel);
                if (el && (el.textContent || '').indexOf(PAUSE_DIALOG_HINT) >= 0) return true;
            } catch (e) {}
        }
        try {
            const all = D.querySelectorAll('.TxVs4ENa, .kSQMetim');
            for (const el of all) {
                if ((el.textContent || '').indexOf(PAUSE_DIALOG_HINT) >= 0) return true;
            }
        } catch (e) {}
        return false;
    }

    function findResumeBtn() {
        for (const sel of RESUME_SELECTORS) {
            let els;
            try {
                els = D.querySelectorAll(sel);
            } catch (e) {
                continue;
            }
            for (const el of els) {
                const txt = (el.textContent || '').trim();
                if (isForbidden(txt)) continue;
                if (POPUP_TEXTS.some(t => txt === t || txt.indexOf(t) === 0)) return el;
                if (!txt && sel.indexOf('dRu312SK') >= 0) return el;
            }
        }
        for (const sel of PAUSE_DIALOG_SELECTORS) {
            let containers;
            try {
                containers = D.querySelectorAll(sel);
            } catch (e) {
                continue;
            }
            for (const c of containers) {
                if ((c.textContent || '').indexOf(PAUSE_DIALOG_HINT) < 0) continue;
                const btns = c.querySelectorAll('div, button, span, a, p');
                for (const b of btns) {
                    const txt = (b.textContent || '').trim();
                    if (isForbidden(txt)) continue;
                    if (POPUP_TEXTS.some(t => txt === t || txt.indexOf(t) === 0)) return b;
                }
            }
        }
        const list = [];
        collectEls(D.documentElement, list);
        let best = null;
        for (const el of list) {
            const tag = el.tagName;
            if (tag !== 'BUTTON' && tag !== 'SPAN' && tag !== 'DIV' && tag !== 'A' && tag !== 'P') continue;
            const txt = (el.textContent || '').trim();
            if (isForbidden(txt)) continue;
            if (!POPUP_TEXTS.some(t => txt === t || (txt.indexOf(t) === 0 && txt.length <= t.length + 2))) continue;
            if (!best || el.getElementsByTagName('*').length < best.getElementsByTagName('*').length) best = el;
        }
        return best;
    }

    function clickResumeBtn() {
        if (!_enabled || !settings.pauseGuard_popupClick) return;
        if (realHidden() && eligibleCount === 0) return;
        if (!isPauseDialogVisible()) return;
        const btn = findResumeBtn();
        if (!btn) return;
        const now = Date.now();
        if (btn === lastClickedBtn && now - lastClickedAt < _dedupeMs) return;
        lastClickedBtn = btn;
        lastClickedAt = now;
        plog('[弹窗] 点击继续播放:', btn.tagName, (btn.textContent || '').trim().slice(0, 20));
        dlog('防暂停', '点击继续播放按钮');
        Monitor.emit('pause', '自动点击「继续播放」', 'ok');
        try {
            btn.click();
            ['mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(type => {
                try {
                    btn.dispatchEvent(new MouseEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        view: W
                    }));
                } catch (e) {}
            });
        } catch (e) {}
        if (_enabled) playVideos(realHidden());
    }
    let timers = [];
    let _mutationObserver = null;

    function stopTimers() {
        timers.forEach(id => clearInterval(id));
        timers = [];
        if (_mutationObserver) {
            _mutationObserver.disconnect();
            _mutationObserver = null;
        }
    }

    function startTimers() {
        stopTimers();
        const debounceMs = settings.pauseGuard_domMutationDebounce || 500;
        const clickInterval = Math.max(200, (settings.pauseGuard_popupClickInterval || 2) * 1000);
        const mouseInterval = Math.max(5000, (settings.pauseGuard_mouseSimInterval || 60) * 1000);
        const visCheckInterval = Math.max(500, (settings.pauseGuard_visibilityCheckInterval || 3) * 1000);
        const bgResumeInterval = Math.max(3000, (settings.pauseGuard_backgroundResumeInterval || 30) * 1000);
        _dedupeMs = (settings.pauseGuard_popupClickDedupe || 1.5) * 1000;
        try {
            let popDebounce = null;
            _mutationObserver = new MutationObserver(() => {
                if (popDebounce) return;
                popDebounce = setTimeout(() => {
                    popDebounce = null;
                    clickResumeBtn();
                }, debounceMs);
            });
            _mutationObserver.observe(D.documentElement, {
                childList: true,
                subtree: true
            });
        } catch (e) {}
        timers.push(setInterval(clickResumeBtn, clickInterval));
        timers.push(setInterval(() => {
            if (!_enabled || !settings.pauseGuard_mouseSimulation) return;
            if (!realHidden()) return;
            const ae = D.activeElement;
            if (ae && /^(INPUT|TEXTAREA|SELECT)$/i.test(ae.tagName)) return;
            try {
                D.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true,
                    cancelable: true,
                    view: W,
                    clientX: 5 + Math.random() * 40,
                    clientY: 5 + Math.random() * 40
                }));
                dlog('防暂停', '派发假鼠标移动');
            } catch (e) {}
        }, mouseInterval));
        let prevHidden = realHidden();
        timers.push(setInterval(() => {
            if (!_enabled) return;
            const h = realHidden();
            if (h === prevHidden) return;
            prevHidden = h;
            if (h) {
                snapshotPlayingAtHide();
            } else {
                eligibleVideos = new WeakSet();
                eligibleCount = 0;
                restoreVideos();
                plog('[可见性] 回到前台：清除资格、恢复音量');
            }
        }, visCheckInterval));
        timers.push(setInterval(() => {
            if (!_enabled || !settings.pauseGuard_backgroundResume) return;
            if (realHidden()) playVideos(true);
            else restoreVideos();
        }, bgResumeInterval));
        try {
            _nativeAddEventListener.call(W, 'visibilitychange', () => {
                if (realHidden()) snapshotPlayingAtHide();
            }, true);
        } catch (e) {}
        plog(`定时器已启动：弹窗${clickInterval/1000}s / 鼠标${mouseInterval/1000}s / 可见性${visCheckInterval/1000}s / 后台恢复${bgResumeInterval/1000}s`);
    }

    function installVideoTimeline() {
        ['play', 'pause'].forEach((type) => {
            try {
                _nativeAddEventListener.call(D, type, (e) => {
                    const v = e.target;
                    if (!v || v.tagName !== 'VIDEO') return;
                    if (type === 'pause' && realHidden()) markPausedWhileHidden(v);
                }, true);
            } catch (e) {}
        });
    }

    function setEnabled(v) {
        _enabled = !!v;
        plog('开关 → ' + (_enabled ? '运行中' : '已关闭'));
    }
    patchVisibility();
    patchEventTarget();
    patchRaf();
    installVideoTimeline();
    startTimers();
    return {
        setEnabled,
        isEnabled: () => _enabled,
        realHidden,
        playVideos: () => playVideos(realHidden()),
        restoreVideos,
        restartTimers: startTimers,
        get eligibleCount() {
            return eligibleCount;
        }
    };
})();
// =========================================================
//                        开屏封面
// =========================================================
function _hexToRgba(hex, alpha) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = String(hex).trim().replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`;
    return `rgba(${r},${g},${b},${alpha})`;
}
(function showSplashScreenImmediately() {
    if (!settings.enableSplashScreen) return;
    if (document.getElementById('dySplashScreen')) return;
    if (sessionStorage.getItem('dySplashShown')) return;
    sessionStorage.setItem('dySplashShown', 'true');
    const duration = settings.splashDuration ?? 1200;
    const fadeout = settings.splashFadeoutMs ?? 600;
    const bgColor = settings.splashBgColor || '#000000';
    const slogan = settings.splashSlogan || '记录美好生活';
    const splash = document.createElement('div');
    splash.id = 'dySplashScreen';
    const bgRgba = _hexToRgba(bgColor, 0.55);
    splash.style.cssText = `
position: fixed; top: 0; left: 0;
width: 100vw; height: 100vh;
background: ${bgRgba};
-webkit-backdrop-filter: blur(22px) saturate(1.6);
backdrop-filter: blur(22px) saturate(1.6);
display: flex; flex-direction: column;
justify-content: center; align-items: center;
z-index: 9999; opacity: 1;
pointer-events: none;
transition: opacity ${fadeout}ms ease;
`;
    splash.innerHTML = `
<div style="animation: dySplashBounce 0.8s ease; margin-bottom: 0px;">
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2540_39617)">
<path d="M28.5975 33.0616V29.8161C27.4863 29.6643 26.3555 29.5713 25.2002 29.5713C11.3026 29.5762 -0.000488281 40.8793 -0.000488281 54.7769C-0.000488281 63.3044 4.25837 70.848 10.7593 75.4103C6.56403 70.9067 3.98913 64.8758 3.98913 58.2525C3.98913 44.5556 14.9741 33.3847 28.5975 33.0665V33.0616Z" fill="#00FAF0"/>
<path d="M29.1902 69.7612C35.3925 69.7612 40.4492 64.8317 40.6793 58.6833L40.6989 3.81254H50.7244C50.5139 2.68663 50.4013 1.52646 50.4013 0.336914H36.7093L36.6897 55.2077C36.4596 61.3512 31.4028 66.2856 25.2006 66.2856C23.2718 66.2856 21.4606 65.8059 19.8599 64.9639C21.9501 67.8619 25.3474 69.7612 29.1902 69.7612Z" fill="#00FAF0"/>
<path d="M69.4482 22.434V19.3843C65.625 19.3843 62.0613 18.2486 59.0752 16.3003C61.7333 19.3549 65.346 21.5578 69.4482 22.434Z" fill="#00FAF0"/>
<path d="M59.0754 16.3003C56.1627 12.9519 54.3907 8.58536 54.3907 3.8125H50.7241C51.6885 9.03083 54.7872 13.5051 59.0754 16.3003Z" fill="#FF0050"/>
<path d="M25.2001 43.2682C18.8559 43.2682 13.6914 48.4327 13.6914 54.777C13.6914 59.1974 16.1978 63.0352 19.8643 64.964C18.4985 63.0744 17.6859 60.7589 17.6859 58.2526C17.6859 51.9083 22.8504 46.7439 29.1946 46.7439C30.3793 46.7439 31.515 46.9397 32.5919 47.2774V33.3015C31.4807 33.1498 30.3499 33.0568 29.1946 33.0568C28.9939 33.0568 28.7981 33.0666 28.5974 33.0715V43.8067C27.5205 43.4689 26.3848 43.2731 25.2001 43.2731V43.2682Z" fill="#FF0050"/>
<path d="M69.4483 22.4341V33.0763C62.3502 33.0763 55.771 30.8049 50.4009 26.9524V54.7769C50.4009 68.6745 39.0978 79.9776 25.2002 79.9776C19.8302 79.9776 14.8517 78.2839 10.7593 75.4104C15.3608 80.3546 21.9204 83.4533 29.1948 83.4533C43.0924 83.4533 54.3955 72.1502 54.3955 58.2526V30.428C59.7655 34.2806 66.3447 36.552 73.4429 36.552V22.86C72.0722 22.86 70.7407 22.7131 69.4532 22.4341H69.4483Z" fill="#FF0050"/>
<path d="M50.4006 54.7769V26.9523C55.7706 30.8049 62.3499 33.0763 69.448 33.0763V22.434C65.3457 21.5578 61.7331 19.3549 59.0749 16.3003C54.7867 13.5051 51.688 9.02593 50.7237 3.8125H40.6982L40.6786 58.6833C40.4485 64.8268 35.3918 69.7612 29.1895 69.7612C25.3516 69.7612 21.9494 67.8619 19.8592 64.9639C16.1975 63.0351 13.6863 59.1973 13.6863 54.7769C13.6863 48.4326 18.8507 43.2682 25.195 43.2682C26.3796 43.2682 27.5153 43.464 28.5923 43.8017V33.0665C14.9688 33.3847 3.98389 44.5556 3.98389 58.2525C3.98389 64.8758 6.55878 70.9116 10.754 75.4103C14.8464 78.2838 19.8249 79.9776 25.195 79.9776C39.0926 79.9776 50.3957 68.6745 50.3957 54.7769H50.4006Z" fill="white"/>
<path d="M102.472 20.0255H96.6709V28.5873H89.9253V34.3881H96.6709V46.2444L89.9253 47.2528V53.4013L96.6709 52.3928V62.5652C96.6709 63.3729 96.015 64.0288 95.2073 64.0288H90.312V69.8297H97.601C100.293 69.8297 102.472 67.6464 102.472 64.9589V51.5313L108.371 50.6501V44.5017L102.472 45.3829V34.393H108.371V28.5922H102.472V20.0304V20.0255Z" fill="white"/>
<path d="M135.471 20.0255H129.67V50.4592L110.52 52.0991V58.2476L129.67 56.6028V70.2948H135.471V56.079L141.35 55.5454V49.397L135.471 49.9305V20.0255Z" fill="white"/>
<path d="M126.664 26.8005L112.914 24.348V30.4916L126.664 32.949V26.8005Z" fill="white"/>
<path d="M126.664 39.5674L112.914 37.1149V43.2584L126.664 45.7158V39.5674Z" fill="white"/>
<path d="M188.599 36.9973L189.514 32.2783H183.366L182.455 36.9973H166.399L165.669 32.2783H159.521L160.25 36.9973H148.629V42.6905H200V36.9973H188.599Z" fill="white"/>
<path d="M198.374 24.0543H178.901L177.922 20.0255H170.364L171.343 24.0543H150.249V29.7034H198.374V24.0543Z" fill="white"/>
<path d="M190.468 46.876H158.16C155.467 46.876 153.289 49.0593 153.289 51.7467V65.0324C153.289 67.7248 155.472 69.9032 158.16 69.9032H190.468C193.161 69.9032 195.339 67.7199 195.339 65.0324V51.7467C195.339 49.0544 193.156 46.876 190.468 46.876ZM160.206 52.1286H188.422C189.23 52.1286 189.886 52.7845 189.886 53.5922V55.9615H158.747V53.5922C158.747 52.7845 159.403 52.1286 160.211 52.1286H160.206ZM188.422 64.6849H160.206C159.398 64.6849 158.742 64.0289 158.742 63.2212V60.8225H189.881V63.2212C189.881 64.0289 189.225 64.6849 188.417 64.6849H188.422Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_2540_39617">
<rect width="200" height="200" fill="white" transform="translate(0 0)"/>
</clipPath>
</defs>
</svg>
</div>
<div style="overflow: hidden; width: 200px; margin-top: -100px;">
<div style="font-size: 24px; color: rgba(255,255,255,0.7); font-family: 'PingFang SC', 'Helvetica Neue', sans-serif; letter-spacing: 2px; transform: translateX(-100%); animation: dySloganSlide 0.6s ease 0.2s forwards; white-space: nowrap;">${slogan}</div>
</div>
<div id="dySplashStatus" style="
position: absolute;
bottom: 6vh;
left: 0;
right: 0;
text-align: center;
font-size: 13px;
font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
font-weight: 500;
line-height: 1.5;
color: rgba(150,150,150,0.55);
transition: color 0.35s ease, opacity 0.35s ease;
opacity: 0;
pointer-events: none;
"></div>
<style>
@keyframes dySplashBounce { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes dySloganSlide { 0% { transform: translateX(-100%); opacity: 0; } 100% { transform: translateX(0%); opacity: 1; } }
</style>
`;
    const target = document.body || document.documentElement;
    target.appendChild(splash);
    const statusEl = splash.querySelector('#dySplashStatus');
    window.__dySplashStatus = function(text, color) {
        if (!statusEl) return;
        if (!text) {
            statusEl.style.opacity = '0';
            return;
        }
        statusEl.textContent = text;
        if (color) statusEl.style.color = color;
        statusEl.style.opacity = '1';
    };
    if (window.__dyPendingLoadTip) {
        const p = window.__dyPendingLoadTip;
        window.__dySplashStatus(p.text, p.color);
        window.__dyPendingLoadTip = null;
    } else {
        window.__dySplashStatus('插件加载中…', 'rgba(255,255,255,0.42)');
    }
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            if (splash.parentNode) splash.remove();
            try {
                delete window.__dySplashStatus;
            } catch (e) {
                window.__dySplashStatus = undefined;
            }
        }, fadeout);
    }, duration);
})();
// =========================================================
//               弹幕池 & 屏蔽池
// =========================================================
let danmuPool = [];
let blockedPool = [];
const MAX_POOL_STORAGE = 500;
let lastVideoContainerId = '';

function getDanmuContainer(danmuEl) {
    return danmuEl.closest(
        '#sliderVideo, [data-e2e="feed-active-video"], [data-e2e="feed-item"]'
    );
}

function getContainerId(container) {
    if (!container) return '';
    const activeEl = container.querySelector ?
        container.querySelector(SEL.activeVideoId) :
        null;
    if (activeEl) {
        const v = activeEl.getAttribute('data-e2e-vid');
        if (v) return v;
    }
    if (container.hasAttribute && container.hasAttribute('data-e2e-vid')) {
        return container.getAttribute('data-e2e-vid');
    }
    const qp = getQuickPlayerInfo();
    if (qp && qp.awemeId) return qp.awemeId;
    if (container.id) return container.id;
    return (container.outerHTML || '').slice(0, 30);
}

function getVideoTimeFromContainer(container) {
    if (!container) return null;
    let timeEl = container.querySelector('xg-icon.xgplayer-time');
    if (!timeEl) timeEl = container.querySelector('.xgplayer-time');
    if (!timeEl) return null;
    const currentEl = timeEl.querySelector('.time-current');
    const durationEl = timeEl.querySelector('.time-duration');
    if (!currentEl) return null;
    const duration = durationEl ? durationEl.textContent.trim() : '--:--';
    return {
        current: currentEl.textContent.trim(),
        duration
    };
}

function getContainerCurrentTime(container) {
    const timeInfo = getVideoTimeFromContainer(container);
    if (timeInfo) {
        const parts = timeInfo.current.split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const video = container ? container.querySelector('video') : document.querySelector('video');
    if (video && !isNaN(video.currentTime)) return video.currentTime;
    return 0;
}

function getContainerDuration(container) {
    const timeInfo = getVideoTimeFromContainer(container);
    if (timeInfo && timeInfo.duration && timeInfo.duration !== '直播') {
        const parts = timeInfo.duration.split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const video = container ? container.querySelector('video') : document.querySelector('video');
    if (video && !isNaN(video.duration) && isFinite(video.duration)) return video.duration;
    return 0;
}

function getContainerFullTimeStr(container) {
    const current = getContainerCurrentTime(container);
    const duration = getContainerDuration(container);
    const currentStr = formatVideoTime(current);
    if (duration > 0) {
        const durStr = formatVideoTime(duration);
        return `${currentStr} / ${durStr}`;
    }
    return `${currentStr} / --:--`;
}

function formatVideoTime(seconds) {
    if (!seconds || seconds < 0) return '00:00';
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function createDivider() {
    return {
        id: 'divider_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        isDivider: true,
        text: '──────── 视频切换 ────────',
        videoTime: 0,
        fullTimeStr: '─────'
    };
}

function resetPools() {
    danmuPool = [];
    blockedPool = [];
    lastVideoContainerId = '';
    log('↻ 弹幕池已重置');
    setTimeout(filterDanmu, 100);
    if (menuApp) {
        const vm = menuApp._instance;
        if (vm && vm.proxy && vm.proxy.syncPools) {
            vm.proxy.syncPools();
        }
    }
}

function insertDivider() {
    if (danmuPool.length === 0 && blockedPool.length === 0) return;
    const lastDanmu = danmuPool[danmuPool.length - 1];
    const lastBlocked = blockedPool[blockedPool.length - 1];
    if (lastDanmu && lastDanmu.isDivider && lastBlocked && lastBlocked.isDivider) {
        log('⇄ 末尾已是分割线，跳过重复插入');
        return;
    }
    const divider = createDivider();
    danmuPool.push(divider);
    blockedPool.push(divider);
    if (danmuPool.length > MAX_POOL_STORAGE) danmuPool = danmuPool.slice(-MAX_POOL_STORAGE);
    if (blockedPool.length > MAX_POOL_STORAGE) blockedPool = blockedPool.slice(-MAX_POOL_STORAGE);
    log('⇄ 插入分割线');
    if (menuApp) {
        const vm = menuApp._instance;
        if (vm && vm.proxy && vm.proxy.syncPools) {
            vm.proxy.syncPools();
        }
    }
}
// =========================================================
//                  菜单 CSS
// =========================================================
GM_addStyle(`
:root {
--dy-ui-bg: rgba(32,32,36,0.62);
--dy-ui-input-bg: rgba(90,90,96,0.42);
--dy-ui-box-bg: rgba(120,120,128,0.32);
--dy-ui-scrollbar: rgba(141,141,141,0.35);
--dy-ui-text: rgb(250,250,250);
--dy-ui-btn: rgba(0,174,236,0.85);
/* ★ 字体层级：统一字号 */
--dy-font-size: 14px;        /* 基准：选项 / 正文 / 标签 */
--dy-font-size-md: 13px;     /* ★新增：列表项 / 标签 */
--dy-font-size-sm: 12px;     /* 辅助说明 / 徽章 / 小按钮 */
--dy-font-size-xs: 11px;     /* 极小的注脚 */
--dy-font-title: 16px;       /* 面板标题 */
--dy-font-section: 14px;     /* 分区标题（≥ 选项） */
--dy-line-height: 24px;
--dy-radius: 4px;
--dy-blur: 22px;
--dy-saturate: 1.6;
--dy-header-h: 44px;
}
#dyMenuUi {
font-size:var(--dy-font-size);
position:fixed;
top:6vh;
top:6dvh;
right:max(2vw, 10px);
z-index:1005;
width:min(480px, 92vw);
max-height:88vh;
max-height:88dvh;
display:flex;
flex-direction:column;
overflow:hidden;
background:var(--dy-ui-bg);
-webkit-backdrop-filter: blur(var(--dy-blur)) saturate(var(--dy-saturate));
backdrop-filter: blur(var(--dy-blur)) saturate(var(--dy-saturate));
border:1px solid rgba(255,255,255,0.10);
box-shadow:0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
border-radius:var(--dy-radius);
padding:0;
}
#dyMenuUi * { color:var(--dy-ui-text); box-sizing:border-box; border:0; border-radius:var(--dy-radius); line-height:var(--dy-line-height); font-family:"PingFang SC","Helvetica Neue","Microsoft YaHei",sans-serif; }
.dy-menu-body {
flex:1 1 auto;
min-height:0;
overflow-y:auto;
overflow-x:hidden;
margin-top:calc(-1 * var(--dy-header-h));
padding-top:var(--dy-header-h);
padding-bottom:10px;
scrollbar-width:thin;
scrollbar-color: var(--dy-ui-input-bg) transparent;
}
.dy-menu-body::-webkit-scrollbar { width:7px; }
.dy-menu-body::-webkit-scrollbar-track { background:transparent; }
.dy-menu-body::-webkit-scrollbar-thumb { background:var(--dy-ui-input-bg); border-radius:7px; }
.dy-menu-body::-webkit-scrollbar-thumb:hover { background:var(--dy-ui-box-bg); }
#dyMenuTitle {
position:relative;
z-index:10;
flex-shrink:0;
box-sizing:border-box;
height:var(--dy-header-h);
background:var(--dy-ui-bg);
-webkit-backdrop-filter: blur(var(--dy-blur)) saturate(var(--dy-saturate));
backdrop-filter: blur(var(--dy-blur)) saturate(var(--dy-saturate));
font-size: var(--dy-font-title);
padding:0 12px;
font-weight:bold;
border-bottom:1px solid rgba(255,255,255,0.1);
display:flex;
align-items:center;
gap:8px;
cursor:move;
}
#dyMenuTitle .dy-title-close {
background:none;
border:none;
color:rgba(255,255,255,0.6);
font-size:18px;
line-height:1;
cursor:pointer;
padding:2px 8px;
border-radius:4px;
transition:all 0.15s;
flex-shrink:0;
}
#dyMenuTitle .dy-title-close:hover {
color:#ff6b6b;
}
#dyMenuTitle .dy-title-text {
flex:1;
text-align:center;
}
#dyMenuTitle .dy-title-spacer {
width:34px;
flex-shrink:0;
}
.dy-menu-section { background:var(--dy-ui-input-bg); padding:10px 12px; margin:8px 10px; border-radius:var(--dy-radius); }
.dy-menu-section .section-title {
font-size: var(--dy-font-section) !important;   /* 14px：与选项一致，靠字重/颜色区分 */
color: rgba(255,255,255,0.85);                  /* 原 0.55，稍微提亮 */
margin-bottom: 8px; letter-spacing: 0.3px;
font-weight: 600;                               /* 原 500，加粗突出层级 */
display: flex; align-items: center; gap: 6px;
}
/* ★ 次级分组标题（高级设置里的「池子 / DOM 清理参数 / …」） */
.dy-group-title {
font-size: var(--dy-font-size-md);   /* 13px：比选项 14px 略小，作次级标题 */
font-weight: 600;
color: rgba(255,255,255,0.78);
letter-spacing: 0.2px;
width: 100%;
display: flex;
align-items: center;
gap: 6px;
}
html[data-dy-theme="light"] .dy-group-title {
color: rgba(0, 0, 0, 0.78) !important;
}
.dy-menu-row { display:flex; align-items:center; flex-wrap:wrap; gap:4px 8px; margin-bottom:4px; }
.dy-menu-row label { font-size: var(--dy-font-size); cursor:pointer; display:flex; align-items:center; gap:4px; }
.dy-menu-row input[type="checkbox"] {
width: 18px; height: 18px; margin: 0;
appearance: none; -webkit-appearance: none;
border: 1px solid rgba(255,255,255,0.28) !important;
border-radius: 5px; cursor: pointer; flex-shrink: 0;
background: rgba(255,255,255,0.05);
position: relative; outline: none; vertical-align: middle;
transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.dy-menu-row input[type="checkbox"]::after {
content: '';
position: absolute; left: 50%; top: 50%;
width: 4px; height: 8px;
border: solid #fff; border-width: 0 2px 2px 0;
border-radius: 0 0 1px 0;
transform: translate(-50%, -50%) rotate(45deg) scale(0);
opacity: 0; pointer-events: none;
transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.12s ease;
}
.dy-menu-row input[type="checkbox"]:hover {
border-color: rgba(255,255,255,0.5);
background: rgba(255,255,255,0.1);
}
.dy-menu-row input[type="checkbox"]:checked {
border-color: #4CAF50 !important;
background: rgba(76,175,80,0.16);
box-shadow: none;
}
.dy-menu-row input[type="checkbox"]:checked::after {
transform: translate(-50%, -50%) rotate(45deg) scale(1);
opacity: 1;
border-color: #7BE087;
}
.dy-menu-row input[type="checkbox"]:checked:hover {
border-color: #66BB6A !important;
background: rgba(76,175,80,0.24);
box-shadow: 0 0 0 3px rgba(76,175,80,0.18),
inset 0 1px 0 rgba(255,255,255,0.12);
}
.dy-menu-row input[type="checkbox"]:disabled { opacity: 0.35; cursor: not-allowed; }
.dy-status-badge {
font-size: var(--dy-font-size-sm); padding: 0 9px; border-radius: 10px;
line-height: 20px; display: inline-flex; align-items: center;
gap: 5px; font-weight: 500; letter-spacing: 0.2px;
transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.dy-status-on {
background: rgba(76,175,80,0.16);
color: #6BE07A;
border: 1px solid rgba(76,175,80,0.32);
}
.dy-status-on::before {
content: ''; width: 6px; height: 6px; border-radius: 50%;
background: #4CAF50; box-shadow: 0 0 6px rgba(76,175,80,0.85);
flex-shrink: 0;
}
.dy-status-off {
background: rgba(255,255,255,0.06);
color: rgba(255,255,255,0.5);
border: 1px solid rgba(255,255,255,0.1);
}
.dy-status-off::before {
content: ''; width: 6px; height: 6px; border-radius: 50%;
background: rgba(255,255,255,0.3); flex-shrink: 0;
}
.dy-menu-row input[type="text"] { background:var(--dy-ui-box-bg); font-size:var(--dy-font-size); line-height:var(--dy-line-height); border-radius:var(--dy-radius); padding:0 8px; border:none; outline:none; flex:2; min-width:80px; }
.dy-menu-row input[type="number"] { background:var(--dy-ui-box-bg); font-size:var(--dy-font-size); line-height:var(--dy-line-height); border-radius:var(--dy-radius); padding:0 8px; border:none; outline:none; width:80px; flex:0; min-width:60px; }
.dy-menu-row button:not(.dy-toggle-btn):not(.dy-ghost-btn):not(.dy-gold-btn):not(.dy-danger-btn) {
line-height: var(--dy-line-height); border-radius: 5px; padding: 0 12px;
background: rgba(0,174,236,0.14);
border: 1px solid rgba(0,174,236,0.45);
color: #6FD4FF;
cursor: pointer; white-space: nowrap; font-weight: 500;
box-shadow: none;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.dy-menu-row button:not(.dy-toggle-btn):not(.dy-ghost-btn):not(.dy-gold-btn):not(.dy-danger-btn):hover {
background: rgba(255,255,255,0.05);
border-color: rgba(255,255,255,0.12);
color: rgba(255,255,255,0.72);
}
.dy-menu-row button:not(.dy-toggle-btn):not(.dy-ghost-btn):not(.dy-gold-btn):not(.dy-danger-btn):active {
transform: translateY(1px);
box-shadow: none;
}
.dy-tag-list { background:var(--dy-ui-box-bg); padding:4px 4px 0 4px; margin:4px 0 0 0; width:100%; min-height:30px; max-height:80px; overflow-y:auto; border-radius:var(--dy-radius); display:flex; flex-wrap:wrap; gap:4px; }
.dy-tag-list .dy-tag {
background: rgba(0,174,236,0.14);
border: 1px solid rgba(0,174,236,0.45);
color: #6FD4FF;
padding: 0 4px 0 6px; border-radius: 5px;
display: inline-flex; align-items: center; gap: 4px;
font-size: var(--dy-font-size-md); line-height: 20px;
box-shadow: none;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.dy-tag-list .dy-tag:hover {
background: rgba(255,255,255,0.05);
border-color: rgba(255,255,255,0.12);
color: rgba(255,255,255,0.72);
}
.dy-tag-list .dy-tag button {
background: none; border: none; color: inherit;
font-size: 18px; line-height: 18px; padding: 0 2px;
cursor: pointer; opacity: 0.6; transition: opacity 0.15s;
}
.dy-tag-list .dy-tag button:hover { opacity: 1; }
.dy-tag-list .dy-tag .dy-tag-mode {
display: inline-flex; align-items: center; justify-content: center;
min-width: 22px; height: 17px; padding: 0 6px;
border-radius: 5px; font-size: 10px; cursor: pointer;
font-family: "SF Mono", "Consolas", monospace;
font-weight: 700; letter-spacing: -0.2px; user-select: none;
box-shadow: none;
background: transparent !important;
transition: filter 0.15s, transform 0.1s;
}
/* 正则 → 透明底 · 金边 · 金字 */
.dy-tag-list .dy-tag .dy-tag-mode.regex {
border: 1px solid rgba(245,194,74,0.65) !important;
color: #FFD980 !important;
}
/* 关键词 → 透明底 · 绿边 · 绿字 */
.dy-tag-list .dy-tag .dy-tag-mode.keyword {
border: 1px solid rgba(76,175,80,0.65) !important;
color: #7BE087 !important;
}
.dy-tag-list .dy-tag .dy-tag-mode:hover { filter: brightness(1.18); }
.dy-tag-list .dy-tag .dy-tag-mode:active { transform: scale(0.94); }
html[data-dy-theme="light"] .dy-tag-list .dy-tag .dy-tag-mode.regex {
background: transparent !important;
border-color: rgba(184,134,11,0.7) !important;
color: #B8860B !important;
}
html[data-dy-theme="light"] .dy-tag-list .dy-tag .dy-tag-mode.keyword {
background: transparent !important;
border-color: rgba(46,125,50,0.7) !important;
color: #2E7D32 !important;
}
html[data-dy-theme="light"] .dy-tag-list .dy-tag .dy-tag-mode:hover {
background: rgba(0,0,0,0.06);
border-color: rgba(0,0,0,0.18);
color: rgba(0,0,0,0.68);
}
.dy-danmu-pool, .dy-blocked-pool { max-height:200px; overflow-y:auto; background:var(--dy-ui-box-bg); border-radius:var(--dy-radius); padding:4px 6px; margin-top:4px; font-size: var(--dy-font-size-md); scroll-behavior:smooth; }
.dy-danmu-item { display:flex; align-items:center; justify-content:space-between; padding:2px 0; border-bottom:1px solid rgba(255,255,255,0.05); gap:6px; cursor:pointer; transition:background 0.15s; }
.dy-danmu-item:hover { background:rgba(255,255,255,0.05); }
.dy-danmu-item .dy-danmu-text { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dy-danmu-item .dy-danmu-time { color:rgba(255,255,255,0.4); font-size: var(--dy-font-size-xs); flex-shrink:0; font-family:monospace; min-width:90px; text-align:right; }
.dy-divider { text-align:center; color:rgba(255,255,255,0.15); padding:6px 0 4px 0; border-top:1px solid rgba(255,255,255,0.08); margin:4px 0 2px 0; font-size: var(--dy-font-size-xs); letter-spacing:2px; cursor:default !important; pointer-events:none; }
.dy-divider:hover { background:transparent !important; }
.dy-highlight-danmu { animation:dyFlashBorder 0.8s ease 3; border:2px solid #FFD700 !important; background:rgba(255,215,0,0.3) !important; border-radius:4px; padding:2px 4px; }
@keyframes dyFlashBorder { 0%{border-color:#FFD700;background:rgba(255,215,0,0.3);} 50%{border-color:#FF6B6B;background:rgba(255,107,107,0.3);} 100%{border-color:#FFD700;background:rgba(255,215,0,0.3);} }
.dy-toggle-btn {
background: rgba(0,174,236,0.14);
border: 1px solid rgba(0,174,236,0.45);
color: #6FD4FF;
padding: 0 10px;
border-radius: 5px;
cursor: pointer;
font-size: var(--dy-font-size-sm);
line-height: 22px;
font-family: inherit;
display: inline-flex;
align-items: center;
gap: 6px;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.dy-toggle-btn:hover {
background: rgba(255,255,255,0.05);
border-color: rgba(255,255,255,0.12);
color: rgba(255,255,255,0.72);
}
.dy-toggle-btn:active { transform: translateY(1px); }
.dy-toggle-btn::after {
content: '';
display: inline-block;
width: 6px;
height: 6px;
border-right: 1.6px solid currentColor;
border-bottom: 1.6px solid currentColor;
transform: rotate(45deg) translate(-1px, -1px);
transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
margin-left: 0px;
margin-bottom: 2px;
flex-shrink: 0;
}
.dy-toggle-btn.open::after {
transform: rotate(-135deg) translate(-1px, -1px);
margin-bottom: -2px;
}
.dy-toggle-btn.dy-icon-only {
padding: 0 8px;
justify-content: center;
}
.dy-toggle-btn.dy-icon-only::after {
margin-left: 0;
margin-bottom: 0;
transform: translateY(-1px) rotate(45deg);
}
.dy-toggle-btn.dy-icon-only.open::after {
transform: translateY(1px) rotate(-135deg);
}
/* 幽灵按钮（无箭头）：浅蓝 hover */
.dy-ghost-btn {
background: rgba(0,174,236,0.14) !important;
border: 1px solid rgba(0,174,236,0.45) !important;
color: #6FD4FF !important;
border-radius: 5px !important;
box-shadow: none !important;
padding: 0 12px !important;
line-height: var(--dy-line-height) !important;
white-space: nowrap !important;
cursor: pointer !important;
display: inline-flex !important;
align-items: center !important;
justify-content: center !important;
font-size: var(--dy-font-size) !important;
font-family: inherit !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-ghost-btn:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
.dy-ghost-btn:active {
transform: translateY(1px);
}
/* 两列等宽按钮网格 */
.dy-btn-grid {
display: grid !important;
grid-template-columns: 1fr 1fr !important;
gap: 8px !important;
flex-wrap: nowrap !important;
}
.dy-btn-grid > button {
width: 100% !important;
min-width: 0 !important;
flex: none !important;
}
.dy-blocked-item .dy-danmu-text { color:#ff6b6b; text-decoration:line-through; }
.dy-blocked-item .dy-danmu-time { color:rgba(255,107,107,0.4); }
/* 重置弹幕 + 最新：幽灵按钮 · 浅金 hover */
.dy-refresh-btn,
.dy-latest-btn {
background: rgba(245,194,74,0.16) !important;
border: 1px solid rgba(245,194,74,0.55) !important;
color: #FFD980 !important;
border-radius: 5px !important;
box-shadow: none !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-refresh-btn:hover,
.dy-latest-btn:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
.dy-latest-btn {
background: rgba(76,175,80,0.16) !important;
border: 1px solid rgba(76,175,80,0.55) !important;
color: #7BE087 !important;
border-radius: 5px !important;
margin-left: 6px;
box-shadow: none !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-latest-btn:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
.dy-latest-btn:active {
transform: translateY(1px);
}
/* 纯图标按钮：清掉 dy-icon 自带的右间距 */
.dy-latest-btn .dy-icon {
margin-right: 0 !important;
vertical-align: 0;
}
.dy-latest-btn.dy-following {
background: rgba(76,175,80,0.45) !important;
border-color: rgba(76,175,80,0.95) !important;
color: #fff !important;
}
/* 收起 / 展开动画：宽度收窄，让右边的展开按钮滑过来吃掉它 */
.dy-latest-btn {
overflow: hidden;
transition:
width         0.32s cubic-bezier(0.4, 0, 0.2, 1),
margin-right  0.32s cubic-bezier(0.4, 0, 0.2, 1),
opacity       0.22s ease,
background    0.16s ease,
border-color  0.16s ease,
color         0.16s ease !important;
}
.dy-latest-btn.dy-latest-hidden {
width: 0 !important;
margin-right: -4px !important;
padding: 0 !important;
border-width: 0 !important;
opacity: 0;
pointer-events: none;
}
/* 重置弹幕：收起时宽度收缩，被右边的展开按钮吃掉 */
.dy-refresh-btn {
overflow: hidden;
max-width: 80px;
white-space: nowrap;
transition:
max-width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
padding 0.32s cubic-bezier(0.4, 0, 0.2, 1),
margin-right 0.32s cubic-bezier(0.4, 0, 0.2, 1),
opacity 0.22s ease,
background 0.16s ease,
border-color 0.16s ease,
color 0.16s ease !important;
}
.dy-refresh-btn.dy-latest-hidden {
max-width: 0 !important;
padding: 0 !important;
margin-right: -4px !important;
border-width: 0 !important;
opacity: 0;
pointer-events: none;
}
.dy-pool-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; }
.dy-pool-header .dy-pool-title {
display: flex; align-items: center; gap: 8px;
font-size: var(--dy-font-section) !important;   /* 覆盖 HTML 内联的 13px */
}
.dy-danger-btn {
background: rgba(211,47,47,0.16) !important;
border: 1px solid rgba(211,47,47,0.55) !important;
color: #FF8A80 !important;
box-shadow: none !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-danger-btn:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
/* 幽灵按钮 · 橙色 hover */
.dy-ghost-orange {
background: rgba(255,152,0,0.16) !important;
border: 1px solid rgba(255,152,0,0.5) !important;
color: #FFB74D !important;
border-radius: 5px !important;
padding: 0 12px;
line-height: 24px;
cursor: pointer;
box-shadow: none !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-ghost-orange:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
.dy-ghost-orange:active { transform: translateY(1px); }
/* 幽灵按钮 · 绿色 hover */
.dy-ghost-green {
background: rgba(76,175,80,0.16) !important;
border: 1px solid rgba(76,175,80,0.55) !important;
color: #7BE087 !important;
border-radius: 5px !important;
padding: 0 12px;
line-height: 24px;
cursor: pointer;
box-shadow: none !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-ghost-green:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
.dy-ghost-green:active { transform: translateY(1px); }
/* 幽灵按钮 · 红色 hover */
.dy-ghost-red {
background: rgba(211,47,47,0.16) !important;
border: 1px solid rgba(211,47,47,0.55) !important;
color: #FF8A80 !important;
border-radius: 5px !important;
padding: 0 12px;
line-height: 24px;
cursor: pointer;
box-shadow: none !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-ghost-red:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
.dy-ghost-red:active { transform: translateY(1px); }
/* ============ 福袋开关按钮（幽灵风格） ============ */
#dyLotteryToggle {
background: rgba(211,47,47,0.16);
border: 1px solid rgba(211,47,47,0.55);
color: #FF8A80;
padding: 0 12px;
border-radius: 5px;
cursor: pointer;
font-weight: 500;
font-size: var(--dy-font-size-xs);
line-height: 22px;
font-family: inherit;
box-shadow: none;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
#dyLotteryToggle:hover {
background: rgba(255,255,255,0.05);
border-color: rgba(255,255,255,0.12);
color: rgba(255,255,255,0.72);
}
#dyLotteryToggle:active { transform: translateY(1px); }
#dyLotteryToggle.dy-lottery-on {
background: rgba(76,175,80,0.16);
border-color: rgba(76,175,80,0.55);
color: #7BE087;
}
#dyLotteryToggle.dy-lottery-on:hover {
background: rgba(255,255,255,0.05);
border-color: rgba(255,255,255,0.12);
color: rgba(255,255,255,0.72);
}
.dy-menu-row button.dy-gold-btn {
background: rgba(245,194,74,0.16) !important;
border: 1px solid rgba(245,194,74,0.55) !important;
color: #FFD980 !important;
box-shadow: none !important;
padding: 0 12px !important;
line-height: var(--dy-line-height) !important;
white-space: nowrap !important;
cursor: pointer !important;
display: inline-flex !important;
align-items: center !important;
justify-content: center !important;
gap: 4px !important;
font-size: var(--dy-font-size) !important;
font-family: inherit !important;
border-radius: var(--dy-radius) !important;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease !important;
}
.dy-menu-row button.dy-gold-btn:hover {
background: rgba(255,255,255,0.05) !important;
border-color: rgba(255,255,255,0.12) !important;
color: rgba(255,255,255,0.72) !important;
}
#dyMenuPrompt {
position:fixed;
top:calc(6vh - 38px);
right:max(2vw, 10px);
z-index:1006;
padding:0 16px;
height:32px;
line-height:32px;
border-radius:6px;
font-size: var(--dy-font-size-md);
font-weight:600;
font-family:'PingFang SC','Microsoft YaHei',sans-serif;
max-width:92vw;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
color:#e8e8e8;
background:rgba(64,64,64,0.95);
-webkit-backdrop-filter:blur(12px) saturate(1.4);
backdrop-filter:blur(12px) saturate(1.4);
border:1px solid rgba(255,255,255,0.10);
box-shadow:0 4px 16px rgba(0,0,0,0.4);
pointer-events:none;
transition:opacity 0.4s ease;
}
.dy-tip { cursor: help; border-bottom: 1px dashed rgba(255,255,255,0.30); }
#dyGlobalTooltip {
position: fixed;
top: 0;
left: 0;
z-index: 2147483647;
background: rgba(20,20,24,0.72);
-webkit-backdrop-filter: blur(14px) saturate(1.5);
backdrop-filter: blur(14px) saturate(1.5);
color: #eee;
font-size: var(--dy-font-size-sm);
font-weight: normal;
padding: 8px 12px;
border-radius: 6px;
line-height: 1.6;
max-width: 300px;
min-width: 40px;
white-space: normal;
text-align: left;
box-shadow: 0 6px 20px rgba(0,0,0,0.6);
border: 1px solid rgba(255,255,255,0.1);
opacity: 0;
visibility: hidden;
pointer-events: none;
transition: opacity 0.15s ease;
word-break: break-word;
font-family: "PingFang SC","Helvetica Neue","Microsoft YaHei",sans-serif;
}
#dyGlobalTooltip.dy-tooltip-show {
opacity: 1;
visibility: visible;
}
.dy-sub-section {
background: rgba(0,0,0,0.15);
border-radius: 4px;
padding: 8px 10px;
margin-top: 6px;
border-left: 2px solid rgba(255,165,0,0.4);
}
.dy-sub-section .dy-pool-header { margin-bottom: 6px; }
.dy-advanced-content {
background: rgba(0,0,0,0.25);
border-radius: 4px;
padding: 8px 10px;
margin-top: 6px;
border-left: 2px solid rgba(255,152,0,0.5);
}
.dy-advanced-content .dy-menu-row { margin-bottom: 6px; }
.dy-collapse {
display: grid;
grid-template-rows: 0fr;
opacity: 0;
transition:
grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1),
opacity            0.22s ease,
padding            0.32s cubic-bezier(0.4, 0, 0.2, 1),
margin             0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
.dy-collapse.dy-collapse-open {
grid-template-rows: 1fr;
opacity: 1;
}
.dy-collapse:not(.dy-collapse-open) {
padding: 0 !important;
margin-top: 0 !important;
margin-bottom: 0 !important;
border: none !important;
background: transparent !important;
border-radius: 0 !important;
}
.dy-collapse > .dy-collapse-inner {
overflow: hidden;
min-height: 0;
}
/* ★ [新增] dy-icon 组件样式 */
.dy-icon {
display: inline-block;
vertical-align: -2px;
margin-right: 5px;
flex-shrink: 0;
opacity: 0.92;
color: currentColor;
}
.section-title .dy-icon { opacity: 0.78; }
.dy-menu-row button .dy-icon,
.dy-toggle-btn .dy-icon,
.dy-refresh-btn .dy-icon,
.dy-latest-btn .dy-icon,
.dy-danger-btn .dy-icon {
vertical-align: -3px;
margin-right: 4px;
}
.dy-status-badge .dy-icon { vertical-align: -2px; margin-right: 3px; }
/* ============================================================
*   界面主题：单选框 + 浅色主题覆盖
* ============================================================ */
/* --- radio（深色默认）--- */
.dy-menu-row input[type="radio"] {
width: 16px; height: 16px; margin: 0 6px 0 0;
appearance: none; -webkit-appearance: none;
border: 1px solid rgba(255,255,255,0.28) !important;
border-radius: 50%; cursor: pointer;
background: rgba(255,255,255,0.05);
position: relative; vertical-align: middle;
transition: background 0.18s, border-color 0.18s;
outline: none;
}
.dy-menu-row input[type="radio"]:hover {
border-color: rgba(255,255,255,0.5) !important;
background: rgba(255,255,255,0.1);
}
.dy-menu-row input[type="radio"]::after {
content: '';
position: absolute; left: 50%; top: 50%;
width: 8px; height: 8px; border-radius: 50%;
background: #4CAF50;
transform: translate(-50%, -50%) scale(0);
transition: transform 0.15s;
}
.dy-menu-row input[type="radio"]:checked {
border-color: #4CAF50 !important;
background: rgba(76,175,80,0.16);
}
.dy-menu-row input[type="radio"]:checked::after {
transform: translate(-50%, -50%) scale(1);
}
/* --- 浅色主题 --- */
html[data-dy-theme="light"] {
--dy-ui-bg:         rgba(255,255,255,0.30);
--dy-ui-input-bg:   rgba(0,0,0,0.05);
--dy-ui-box-bg:     rgba(0,0,0,0.06);
--dy-ui-scrollbar:  rgba(0,0,0,0.2);
--dy-ui-text:       rgb(28,28,30);
--dy-ui-btn:        rgba(0,174,236,0.85);
}
/* 面板骨架 */
html[data-dy-theme="light"] #dyMenuUi,
html[data-dy-theme="light"] #dySelfCheck,
html[data-dy-theme="light"] #dyErrorReport {
border-color: rgba(0,0,0,0.10);
box-shadow: 0 12px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7);
}
html[data-dy-theme="light"] #dyMenuTitle {
background: rgba(255,255,255,0.30);
border-bottom-color: rgba(0,0,0,0.08);
}
html[data-dy-theme="light"] .dy-report-header { background: rgba(255,255,255,0.30) !important; }
html[data-dy-theme="light"] .dy-menu-section { background: rgba(0,0,0,0.04); }
html[data-dy-theme="light"] .dy-menu-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); }
/* 输入控件边框 */
html[data-dy-theme="light"] .dy-menu-row input[type="checkbox"],
html[data-dy-theme="light"] .dy-menu-row input[type="radio"] {
border-color: rgba(0,0,0,0.28) !important;
background: rgba(0,0,0,0.03);
}
html[data-dy-theme="light"] .dy-menu-row input[type="checkbox"]:hover,
html[data-dy-theme="light"] .dy-menu-row input[type="radio"]:hover {
border-color: rgba(0,0,0,0.5) !important;
background: rgba(0,0,0,0.06);
}
html[data-dy-theme="light"] .dy-menu-row input[type="text"]::placeholder { color: rgba(0,0,0,0.35); }
/* 池子 / 分区背景 */
html[data-dy-theme="light"] .dy-tag-list,
html[data-dy-theme="light"] .dy-danmu-pool,
html[data-dy-theme="light"] .dy-blocked-pool { background: rgba(0,0,0,0.05); }
html[data-dy-theme="light"] .dy-danmu-item { border-bottom-color: rgba(0,0,0,0.05); }
html[data-dy-theme="light"] .dy-danmu-item:hover { background: rgba(0,0,0,0.05); }
html[data-dy-theme="light"] .dy-divider { border-top-color: rgba(0,0,0,0.08); }
html[data-dy-theme="light"] .dy-sub-section { background: rgba(0,0,0,0.03); }
html[data-dy-theme="light"] .dy-advanced-content { background: rgba(0,0,0,0.04); }
/* 浮窗 / 提示条背景 */
html[data-dy-theme="light"] #dyMenuPrompt,
html[data-dy-theme="light"] #dyGlobalTooltip,
html[data-dy-theme="light"] #dy-msg-float-window,
html[data-dy-theme="light"] #dyLotteryPanel {
background: rgba(255,255,255,0.30) !important;
border-color: rgba(0,0,0,0.10) !important;
box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
}
/* ★ 新增：提示条 / Tooltip 文字跟随浅色主题 */
html[data-dy-theme="light"] #dyMenuPrompt,
html[data-dy-theme="light"] #dyGlobalTooltip {
color: #1c1c1e !important;
}
html[data-dy-theme="light"] #dy-msg-float-window > div:first-child {
border-bottom-color: rgba(255,255,255,0.30) !important;
filter: drop-shadow(0 -2px 4px rgba(0,0,0,0.1)) !important;
}
html[data-dy-theme="light"] #dy-msg-float-content .dy-avatar { background: rgba(0,0,0,0.08) !important; }
html[data-dy-theme="light"] #dyLotteryPanel > div { border-color: rgba(0,0,0,0.12) !important; }
/* 折叠箭头 / 虚线 */
html[data-dy-theme="light"] .dy-toggle-btn::after {
border-right-color: currentColor !important;
border-bottom-color: currentColor !important;
}
html[data-dy-theme="light"] .dy-tip { border-bottom-color: rgba(0,0,0,0.25) !important; }
/* 徽章圆点 */
html[data-dy-theme="light"] .dy-status-on::before { background: #2E7D32; box-shadow: 0 0 5px rgba(46,125,50,0.55); }
html[data-dy-theme="light"] .dy-status-off::before { background: rgba(0,0,0,0.3); }
/* ============ 报告面板按钮（幽灵样式 · 深浅双主题） ============ */
.dy-report-btn {
padding: 6px 14px;
border-radius: 4px;
cursor: pointer;
font-size: var(--dy-font-size-sm);
font-family: inherit;
display: inline-flex;
align-items: center;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.dy-report-close {
background: none;
border: none;
font-size: 24px;
line-height: 1;
cursor: pointer;
padding: 0 4px;
transition: color 0.15s ease;
}
/* 深色（默认） */
.dy-report-btn-blue  { background: rgba(0,174,236,0.14); border: 1px solid rgba(0,174,236,0.45); color: #6FD4FF; }
.dy-report-btn-green { background: rgba(76,175,80,0.16); border: 1px solid rgba(76,175,80,0.55); color: #7BE087; }
.dy-report-btn-red   { background: rgba(211,47,47,0.16); border: 1px solid rgba(211,47,47,0.55); color: #FF8A80; }
.dy-report-btn-blue:hover,
.dy-report-btn-green:hover,
.dy-report-btn-red:hover {
background: rgba(255,255,255,0.05);
border-color: rgba(255,255,255,0.12);
color: rgba(255,255,255,0.72);
}
.dy-report-close { color: #aaa; }
.dy-report-close:hover { color: #ff6b6b; }
/* 浅色 */
html[data-dy-theme="light"] .dy-report-btn-blue  { background: rgba(2,136,209,0.10);  border-color: rgba(2,136,209,0.45);  color: #0288D1; }
html[data-dy-theme="light"] .dy-report-btn-green { background: rgba(76,175,80,0.12);   border-color: rgba(46,125,50,0.5);   color: #2E7D32; }
html[data-dy-theme="light"] .dy-report-btn-red   { background: rgba(211,47,47,0.10);   border-color: rgba(198,40,40,0.5);   color: #C62828; }
html[data-dy-theme="light"] .dy-report-btn-blue:hover,
html[data-dy-theme="light"] .dy-report-btn-green:hover,
html[data-dy-theme="light"] .dy-report-btn-red:hover {
background: rgba(0,0,0,0.06);
border-color: rgba(0,0,0,0.18);
color: rgba(0,0,0,0.68);
}
html[data-dy-theme="light"] .dy-report-close { color: rgba(0,0,0,0.55); }
html[data-dy-theme="light"] .dy-report-close:hover { color: #d32f2f; }
/* ============ 浅色模式：所有文字统一深色 ============ */
html[data-dy-theme="light"] #dyMenuUi *,
html[data-dy-theme="light"] #dySelfCheck *,
html[data-dy-theme="light"] #dyErrorReport *,
html[data-dy-theme="light"] #dyLotteryPanel *,
html[data-dy-theme="light"] #dy-msg-float-window * {
color: #1c1c1e !important;
}
html[data-dy-theme="light"] #dyLotteryToggle {
background: rgba(211,47,47,0.10) !important;
border-color: rgba(198,40,40,0.5) !important;
color: #C62828 !important;
}
html[data-dy-theme="light"] #dyLotteryToggle.dy-lottery-on {
background: rgba(76,175,80,0.12) !important;
border-color: rgba(46,125,50,0.5) !important;
color: #2E7D32 !important;
}
html[data-dy-theme="light"] #dyLotteryToggle:hover,
html[data-dy-theme="light"] #dyLotteryToggle.dy-lottery-on:hover {
background: rgba(0,0,0,0.06) !important;
border-color: rgba(0,0,0,0.18) !important;
color: rgba(0,0,0,0.68) !important;
}
/* ============================================================
*   动画总汇 · 三套独立动画
*   ① 报告面板：中心缩放淡入淡出（dyPanelIn / dyPanelOut）
*   ② 主菜单：从页眉向下卷帘揭示 / 反向收回（dyMenuReveal / dyMenuConceal）
*   ③ 消息悬浮窗：轻量位移 + 淡入淡出（走 transition）
* ============================================================ */
/* ① 报告面板 */
@keyframes dyPanelIn {
from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
to   { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
}
@keyframes dyPanelOut {
from { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
to   { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
}
/* ② 主菜单 */
@keyframes dyMenuReveal {
from {
opacity: 0;
clip-path: inset(0 0 100% 0 round var(--dy-radius));
transform: translateY(-6px);
}
to {
opacity: 1;
clip-path: inset(0 0 0% 0 round var(--dy-radius));
transform: translateY(0);
}
}
@keyframes dyMenuConceal {
from {
opacity: 1;
clip-path: inset(0 0 0% 0 round var(--dy-radius));
transform: translateY(0);
}
to {
opacity: 0;
clip-path: inset(0 0 100% 0 round var(--dy-radius));
transform: translateY(-6px);
}
}
#dyMenuUi.dy-menu-opening {
animation: dyMenuReveal 0.34s cubic-bezier(0.16, 1, 0.3, 1) both;
transform-origin: top center;
will-change: clip-path, transform, opacity;
}
#dyMenuUi.dy-menu-closing {
animation: dyMenuConceal 0.24s cubic-bezier(0.4, 0, 1, 1) forwards;
pointer-events: none;
transform-origin: top center;
will-change: clip-path, transform, opacity;
}
/* 消息悬浮窗：从顶部向下卷帘展开 */
#dy-msg-float-window {
transition:
clip-path 0.30s cubic-bezier(0.16, 1, 0.3, 1),
opacity   0.22s ease,
transform 0.30s cubic-bezier(0.16, 1, 0.3, 1);
transform-origin: top center;
will-change: clip-path, transform, opacity;
}
`);
GM_addStyle(`
#dyMonitorWindow {
position: fixed;
top: 80px;
left: 20px;
width: 380px;
max-height: 480px;
display: none;
flex-direction: column;
background: rgba(20,22,28,0.82);
-webkit-backdrop-filter: blur(22px) saturate(1.6);
backdrop-filter: blur(22px) saturate(1.6);
border: 1px solid rgba(255,255,255,0.12);
border-radius: 8px;
box-shadow: 0 12px 40px rgba(0,0,0,0.55);
z-index: 2147483600;
overflow: hidden;
font-family: 'PingFang SC','Microsoft YaHei',sans-serif;
font-size: 12px;
color: #e8e8e8;
opacity: 1;
transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.16,1,0.3,1);
}
#dyMonitorWindow.dy-monitor-hidden {
opacity: 0;
transform: scale(0.92);
pointer-events: none;
}
#dyMonitorTitle {
display: flex; align-items: center; gap: 8px;
padding: 0 10px; height: 34px; flex-shrink: 0;
cursor: move; user-select: none;
border-bottom: 1px solid rgba(255,255,255,0.08);
background: rgba(0,0,0,0.18);
}
#dyMonitorTitle .dy-monitor-dot {
width: 8px; height: 8px; border-radius: 50%;
background: #4CAF50;
box-shadow: 0 0 8px rgba(76,175,80,0.9);
flex-shrink: 0;
animation: dyMonitorPulse 1.8s ease-in-out infinite;
}
@keyframes dyMonitorPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
#dyMonitorTitle .dy-monitor-title-text {
flex: 1; font-weight: 600; font-size: 12px; letter-spacing: 0.3px;
}
#dyMonitorTitle .dy-monitor-remember {
display: flex; align-items: center; gap: 4px;
font-size: 11px; opacity: 0.75; cursor: pointer;
padding: 2px 6px; border-radius: 4px;
transition: background 0.15s, opacity 0.15s;
}
#dyMonitorTitle .dy-monitor-remember:hover { background: rgba(255,255,255,0.08); opacity: 1; }
#dyMonitorTitle .dy-monitor-remember input {
width: 12px; height: 12px; margin: 0;
accent-color: #4CAF50; cursor: pointer;
}
#dyMonitorTitle button {
background: none; border: none; color: rgba(255,255,255,0.55);
font-size: 14px; line-height: 1; cursor: pointer;
padding: 4px 6px; border-radius: 4px;
transition: background 0.15s, color 0.15s; font-family: inherit;
}
#dyMonitorTitle button:hover { background: rgba(255,255,255,0.1); color: #fff; }
#dyMonitorBody {
flex: 1 1 auto; min-height: 100px; overflow-y: auto; overflow-x: hidden;
padding: 6px 8px;
font-family: 'SF Mono','Consolas','Menlo',monospace;
font-size: 11px; line-height: 1.55;
scrollbar-width: thin;
}
#dyMonitorBody::-webkit-scrollbar { width: 5px; }
#dyMonitorBody::-webkit-scrollbar-track { background: transparent; }
#dyMonitorBody::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 3px; }
.dy-monitor-entry {
display: flex; gap: 6px; padding: 1px 2px; border-radius: 3px;
word-break: break-all;
animation: dyMonitorFadeIn 0.2s ease;
}
@keyframes dyMonitorFadeIn {
from { opacity: 0; transform: translateX(-4px); }
to   { opacity: 1; transform: translateX(0); }
}
.dy-monitor-entry:hover { background: rgba(255,255,255,0.05); }
.dy-monitor-entry .dy-monitor-time { flex-shrink: 0; color: rgba(255,255,255,0.35); }
.dy-monitor-entry .dy-monitor-cat {
flex-shrink: 0; padding: 0 4px; border-radius: 3px;
font-size: 10px; background: rgba(255,255,255,0.08);
}
.dy-monitor-entry .dy-monitor-text { flex: 1; color: rgba(255,255,255,0.85); }
.dy-monitor-entry.dy-monitor-error .dy-monitor-text { color: #FF8A80; }
.dy-monitor-entry.dy-monitor-warn  .dy-monitor-text { color: #FFCC80; }
.dy-monitor-entry.dy-monitor-ok    .dy-monitor-text { color: #A5D6A7; }
#dyMonitorFooter {
flex-shrink: 0; height: 26px;
display: flex; align-items: center; justify-content: space-between;
padding: 0 10px;
border-top: 1px solid rgba(255,255,255,0.08);
background: rgba(0,0,0,0.18);
font-size: 10.5px; color: rgba(255,255,255,0.5);
}
#dyMonitorFooter .dy-monitor-auto { display: flex; align-items: center; gap: 4px; cursor: pointer; }
#dyMonitorFooter .dy-monitor-auto input { width: 11px; height: 11px; margin: 0; accent-color: #4CAF50; cursor: pointer; }
html[data-dy-theme="light"] #dyMonitorWindow {
background: rgba(255,255,255,0.78);
border-color: rgba(0,0,0,0.12);
color: #1c1c1e;
box-shadow: 0 12px 40px rgba(0,0,0,0.18);
}
html[data-dy-theme="light"] #dyMonitorTitle,
html[data-dy-theme="light"] #dyMonitorFooter {
background: rgba(255,255,255,0.5);
border-color: rgba(0,0,0,0.08);
}
html[data-dy-theme="light"] #dyMonitorTitle .dy-monitor-title-text { color: #1c1c1e; }
html[data-dy-theme="light"] #dyMonitorTitle button { color: rgba(0,0,0,0.5); }
html[data-dy-theme="light"] #dyMonitorTitle button:hover { background: rgba(0,0,0,0.08); color: #000; }
html[data-dy-theme="light"] .dy-monitor-entry .dy-monitor-time { color: rgba(0,0,0,0.4); }
html[data-dy-theme="light"] .dy-monitor-entry .dy-monitor-cat { background: rgba(0,0,0,0.08); }
html[data-dy-theme="light"] .dy-monitor-entry .dy-monitor-text { color: rgba(0,0,0,0.85); }
html[data-dy-theme="light"] #dyMonitorFooter { color: rgba(0,0,0,0.5); }
`);
// =========================================================
//                       菜单 HTML
// =========================================================
const menuHTML = `
<div id="dyMenuUi">
<div id="dyMenuTitle">
<span class="dy-title-spacer"></span>
<span class="dy-title-text">
<dy-icon name="settings" :size="16"></dy-icon>
抖音优化 v${SCRIPT_VERSION}
</span>
<button class="dy-title-close" @click="closeMenu()" title="关闭菜单">✕</button>
</div>
<div class="dy-menu-body">
<!-- ========== 弹幕池区域 ========== -->
<div class="dy-menu-section" style="border-left:3px solid #FFA500;">
<div class="section-title dy-pool-header">
<span class="dy-pool-title"><dy-icon name="clipboard"></dy-icon> 弹幕池 & <dy-icon name="shield"></dy-icon> 屏蔽池</span>
<span style="display:flex; gap:4px;">
<button class="dy-refresh-btn" :class="{ 'dy-latest-hidden': !poolsAreaExpanded }" @click="manualRefresh()"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;border:none;border-radius:4px;color:#fff;cursor:pointer;">重置弹幕</button>
<button class="dy-toggle-btn" :class="{ open: poolsAreaExpanded }" @click="poolsAreaExpanded = !poolsAreaExpanded"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;">
{{ poolsAreaExpanded ? '收起' : '展开' }}
<span class="dy-chevron"></span>
</button>
</span>
</div>
<dy-collapse :show="poolsAreaExpanded">
<!-- 弹幕池 -->
<div class="dy-sub-section">
<div class="dy-pool-header" style="margin-bottom:6px;">
<span class="dy-pool-title" style="font-weight:600;"><dy-icon name="clipboard" :size="13"></dy-icon> 弹幕池（{{ danmuList.filter(i => !i.isDivider).length }} 条）</span>
<span style="display:flex; gap:4px;">
<button class="dy-latest-btn" :class="{ 'dy-following': followingDanmu, 'dy-latest-hidden': !danmuListExpanded }" @click="goToLatest('danmu')"
data-tip="滚动到最新并开启跟随"
style="font-size:var(--dy-font-size-sm);width:24px;height:24px;padding:0;border:none;border-radius:4px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;">
<dy-icon name="chevronsDown" :size="13"></dy-icon>
</button>
<button class="dy-toggle-btn dy-icon-only" :class="{ open: danmuListExpanded }" @click="danmuListExpanded = !danmuListExpanded"
title="展开/收起列表"
style="font-size:var(--dy-font-size-sm);padding:0 8px;line-height:24px;">
</button>
</span>
</div>
<div style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.3);margin-bottom:4px;" v-if="danmuList.length === 0">（暂无弹幕）</div>
<dy-collapse :show="danmuListExpanded" style="margin-top:4px;">
<div class="dy-danmu-pool" ref="danmuPoolContainer" v-if="danmuList.length > 0">
<template v-for="item in danmuList" :key="item.id">
<div v-if="item.isDivider" class="dy-divider">{{ item.text }}</div>
<div v-else class="dy-danmu-item" @click="locateDanmu(item.id)">
<span class="dy-danmu-text" :title="item.text">{{ item.text }}</span>
<span class="dy-danmu-time">⏱ {{ item.fullTimeStr }}</span>
</div>
</template>
</div>
<div style="font-size:var(--dy-font-size-xs);color:rgba(255,255,255,0.2);margin-top:4px;text-align:right;">点击弹幕定位</div>
</dy-collapse>
</div>
<!-- 屏蔽池 -->
<div class="dy-sub-section" style="border-left-color:rgba(255,107,107,0.5);">
<div class="dy-pool-header" style="margin-bottom:6px;">
<span class="dy-pool-title" style="font-weight:600;"><dy-icon name="shield" :size="13"></dy-icon> 屏蔽池（{{ blockedList.filter(i => !i.isDivider).length }} 条）</span>
<span style="display:flex; gap:4px;">
<button class="dy-latest-btn" :class="{ 'dy-following': followingBlocked, 'dy-latest-hidden': !blockedPoolExpanded }" @click="goToLatest('blocked')"
data-tip="滚动到最新并开启跟随"
style="font-size:var(--dy-font-size-sm);width:24px;height:24px;padding:0;border:none;border-radius:4px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;">
<dy-icon name="chevronsDown" :size="13"></dy-icon>
</button>
<button class="dy-toggle-btn dy-icon-only" :class="{ open: blockedPoolExpanded }" @click="blockedPoolExpanded = !blockedPoolExpanded"
title="展开/收起列表"
style="font-size:var(--dy-font-size-sm);padding:0 8px;line-height:24px;">
</button>
</span>
</div>
<div style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.3);margin-bottom:4px;" v-if="blockedList.length === 0">（暂无屏蔽记录）</div>
<dy-collapse :show="blockedPoolExpanded" style="margin-top:4px;">
<div class="dy-blocked-pool" ref="blockedPoolContainer" v-if="blockedList.length > 0">
<template v-for="item in blockedList" :key="item.id">
<div v-if="item.isDivider" class="dy-divider">{{ item.text }}</div>
<div v-else class="dy-danmu-item dy-blocked-item" @click="locateDanmu(item.id)">
<span class="dy-danmu-text" :title="item.text">{{ item.text }}</span>
<span class="dy-danmu-time">⏱ {{ item.fullTimeStr }}</span>
</div>
</template>
</div>
</dy-collapse>
</div>
<!-- 弹幕屏蔽设置折叠按钮 + 状态徽章 -->
<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;margin-top:4px;display:flex;align-items:center;gap:8px;">
<button class="dy-toggle-btn" :class="{ open: showDanmuBlockedSettings }" @click="showDanmuBlockedSettings = !showDanmuBlockedSettings"
style="font-size:var(--dy-font-size-sm);padding:0 12px;line-height:24px;">
<dy-icon name="settings" :size="12"></dy-icon> {{ showDanmuBlockedSettings ? '收起设置' : '屏蔽设置' }}
<span class="dy-chevron"></span>
</button>
<span class="dy-status-badge" :class="s.blockedDanmu_Switch ? 'dy-status-on' : 'dy-status-off'">
{{ s.blockedDanmu_Switch ? '已开启' : '已关闭' }}
</span>
</div>
<!-- 弹幕关键词屏蔽内容 -->
<dy-collapse :show="showDanmuBlockedSettings"
style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.08);">
<div class="section-title" style="font-size:var(--dy-font-size-md);font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:6px;">
<dy-icon name="message" :size="13"></dy-icon> 弹幕关键词屏蔽
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.blockedDanmu_Switch" @change="onDanmuToggle()" />
<span class="dy-tip" data-tip="开启后，命中屏蔽词的弹幕会被隐藏并记录到屏蔽池">启用弹幕屏蔽</span>
</label>
</div>
<div class="dy-menu-row">
<input type="text" placeholder="输入屏蔽词，逗号分隔" v-model="temp.danmuInput" />
<button @click="addItem('blockedDanmu_Array', temp.danmuInput)">添加</button>
<button @click="showRegexTest = !showRegexTest" class="dy-gold-btn">
<dy-icon name="flask" :size="12"></dy-icon> {{ showRegexTest ? '关闭测试' : '正则测试' }}
<span class="dy-chevron"></span>
</button>
</div>
<div class="dy-menu-row" style="align-items:center;">
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.5);">新增词的默认模式：</span>
<label style="margin-left:4px;"><input type="checkbox" v-model="s.blockedDanmu_UseRegular" @change="immediateSave()" />
<span class="dy-tip" data-tip="勾选后，新添加的屏蔽词默认按正则表达式处理。每个词仍可在下方标签上单独切换模式">默认正则</span>
</label>
<span style="font-size:var(--dy-font-size-xs);color:rgba(255,255,255,0.35);margin-left:6px;">（点击标签上的 Aa / .* 可单独切换）</span>
</div>
<div class="dy-tag-list">
<span class="dy-tag" v-for="(v,i) in s.blockedDanmu_Array" :key="i">
<span class="dy-tag-mode" :class="v.useRegex ? 'regex' : 'keyword'"
@click="toggleItemMode('blockedDanmu_Array', i)"
:title="v.useRegex ? '当前：正则模式（点击切换为关键词）' : '当前：关键词模式（点击切换为正则）'">{{ v.useRegex ? '.*' : 'Aa' }}</span>
{{ displayText(v,i) }}
<button @click="removeItem('blockedDanmu_Array', i)">×</button>
</span>
</div>
<dy-collapse :show="showRegexTest" style="background:rgba(245,194,74,0.15);border-radius:4px;padding:8px 10px;margin-top:6px;">
<div style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.6);margin-bottom:6px;">
<dy-icon name="flask" :size="12"></dy-icon> 正则 / 关键词测试
<span class="dy-tip" data-tip="输入一段文本，实时检测会被哪些屏蔽词命中；正则语法错误也会提示。每个词按自身模式判定" style="margin-left:6px;">?</span>
</div>
<div class="dy-menu-row">
<input type="text" placeholder="输入测试文本，例如：这是广告内容" v-model="regexTestText" @input="runRegexTest" style="flex:3;" />
</div>
<div style="font-size:var(--dy-font-size-sm);line-height:1.8;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:4px;max-height:120px;overflow-y:auto;">
<div v-if="!regexTestText" style="color:rgba(255,255,255,0.3);">输入文本后在此显示命中结果…</div>
<div v-else-if="regexTestResult.length === 0" style="color:#4CAF50;">✓ 未命中任何屏蔽词</div>
<div v-else>
<div v-for="(r,i) in regexTestResult" :key="i"
:style="{ color: r.valid ? '#FF6B6B' : '#FF9800' }">
<span :style="{ color: r.useRegex ? '#CE93D8' : '#81C784', fontFamily:'monospace' }">[{{ r.useRegex ? '正则' : '关键词' }}]</span>
{{ r.valid ? '⊘ 命中：' : '⚠ 语法错误：' }} <code>{{ r.pattern }}</code>
<span style="color:rgba(255,255,255,0.5);"> — {{ r.reason }}</span>
</div>
</div>
</div>
</dy-collapse>
<div style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.3);margin-top:4px;">
<dy-icon name="zap" :size="12"></dy-icon> 直接扫描所有弹幕元素，不受容器重建影响
<span v-if="s.blockedDanmu_Switch && s.blockedDanmu_Array.length === 0" style="color:#FF6B6B;display:block;margin-top:2px;"><dy-icon name="alert" :size="12"></dy-icon> 已开启但未添加屏蔽词</span>
</div>
</dy-collapse>
</dy-collapse>
</div>
<!-- ========== 跳过直播 / 正则屏蔽视频 ========== -->
<div class="dy-menu-section" style="border-left:3px solid #FF6B6B;">
<div class="section-title dy-pool-header">
<span class="dy-pool-title"><dy-icon name="ban"></dy-icon> 跳过直播 / 正则屏蔽视频</span>
<span class="dy-status-badge" :class="(s.skipLive_Switch || s.skipVideoRegex_Switch) ? 'dy-status-on' : 'dy-status-off'">
{{ (s.skipLive_Switch || s.skipVideoRegex_Switch) ? '运行中' : '已关闭' }}
</span>
<button class="dy-toggle-btn" :class="{ open: skipVideoExpanded }" @click="skipVideoExpanded = !skipVideoExpanded"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;margin-left:auto;">
{{ skipVideoExpanded ? '收起' : '展开' }}
<span class="dy-chevron"></span>
</button>
</div>
<dy-collapse :show="skipVideoExpanded">
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.skipLive_Switch" @change="onSkipLiveToggle()" />
<span class="dy-tip" data-tip="检测到推荐流中的直播卡片时，自动静音暂停并切到下一个">跳过直播卡片</span>
</label>
<span class="dy-status-badge" :class="s.skipLive_Switch ? 'dy-status-on' : 'dy-status-off'">
{{ s.skipLive_Switch ? '已开启' : '已关闭' }}
</span>
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.skipVideoRegex_Switch" @change="onSkipVideoRegexToggle()" />
<span class="dy-tip" data-tip="匹配视频的标题、作者昵称、视频信息区域文本，命中则静音暂停并切到下一个">正则屏蔽视频</span>
</label>
<span class="dy-status-badge" :class="s.skipVideoRegex_Switch ? 'dy-status-on' : 'dy-status-off'">
{{ s.skipVideoRegex_Switch ? '已开启' : '已关闭' }}
</span>
</div>
<div class="dy-menu-row">
<input type="text" placeholder="输入屏蔽规则，逗号分隔" v-model="temp.skipVideoInput" />
<button @click="addItem('skipVideoRegex_Array', temp.skipVideoInput)">添加</button>
</div>
<div class="dy-tag-list">
<span class="dy-tag" v-for="(v,i) in s.skipVideoRegex_Array" :key="i">
<span class="dy-tag-mode" :class="v.useRegex ? 'regex' : 'keyword'"
@click="toggleItemMode('skipVideoRegex_Array', i)"
:title="v.useRegex ? '当前：正则模式（点击切换为关键词）' : '当前：关键词模式（点击切换为正则）'">{{ v.useRegex ? '.*' : 'Aa' }}</span>
{{ displayText(v,i) }}
<button @click="removeItem('skipVideoRegex_Array', i)">×</button>
</span>
</div>
<div class="dy-menu-row" style="margin-top:6px;">
<label style="width:130px;"><span class="dy-tip" data-tip="兜底轮询间隔。事件驱动为主，这个只是兜底，越小越灵敏但越耗CPU">检测间隔</span></label>
<input type="number" v-model.number="s.skipVideoPolling" min="0.2" max="5.0" step="0.1" style="width:80px;" @change="restartSkipTimer()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="同一张卡片（视频）被检测一次后，多久内不重复检测。太短会重复打遮罩，太长会漏检">同卡片冷却</span></label>
<input type="number" v-model.number="s.skipVideoCooldown" min="500" max="10000" step="500" style="width:80px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">毫秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="切换指令发出后，中心卡片多久没变就重试一次切换">重试间隔</span></label>
<input type="number" v-model.number="s.skipVideoRetryInterval" min="500" max="5000" step="100" style="width:80px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">毫秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="重试超过这个时间就放弃，避免无限重试。超过后遮罩淡出">重试截止</span></label>
<input type="number" v-model.number="s.skipVideoRetryTimeout" min="3000" max="20000" step="500" style="width:80px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">毫秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="点击切换按钮后多少毫秒内卡片没变，就改用键盘 ArrowDown 兜底">键盘兜底延迟</span></label>
<input type="number" v-model.number="s.skipVideoBtnFallbackDelay" min="100" max="2000" step="50" style="width:80px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">毫秒</span>
</div>
<div class="dy-menu-row" style="align-items:center;gap:4px 14px;margin-top:4px;">
<label><input type="checkbox" v-model="s.skipVideoRegex_UseRegular" @change="immediateSave()" />
<span class="dy-tip" data-tip="勾选后，新添加的规则默认按正则表达式处理。每条规则仍可在下方标签上单独切换模式">新增规则默认正则</span>
</label>
<label><input type="checkbox" v-model="s.skipVideoMask_Switch" @change="immediateSave()" />
<span class="dy-tip" data-tip="切换瞬间加一层黑色遮罩，避免闪现画面">切换遮罩</span>
</label>
</div>
<div style="font-size:var(--dy-font-size-xs);color:rgba(255,255,255,0.35);margin-top:2px;">
（点击标签上的 Aa / .* 可单独切换每条规则的模式）
</div>
<div style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.3);margin-top:4px;">
匹配范围：视频标题 / 作者昵称 / 视频信息区域
<span v-if="s.skipVideoRegex_Switch && s.skipVideoRegex_Array.length === 0" style="color:#FF6B6B;display:block;margin-top:2px;"><dy-icon name="alert" :size="12"></dy-icon> 已开启但未添加屏蔽规则</span>
</div>
</dy-collapse>
</div>
<!-- ========== 视频解析与下载 ========== -->
<div class="dy-menu-section" style="border-left:3px solid #4FC3F7;">
<div class="section-title dy-pool-header">
<span class="dy-pool-title"><dy-icon name="download"></dy-icon> 视频解析与下载</span>
<span class="dy-status-badge" :class="(s.parseVideo || s['dy-video-downloader-addDownloadButton']) ? 'dy-status-on' : 'dy-status-off'">
{{ (s.parseVideo || s['dy-video-downloader-addDownloadButton']) ? '已开启' : '已关闭' }}
</span>
<button class="dy-toggle-btn" :class="{ open: videoDownloadExpanded }" @click="videoDownloadExpanded = !videoDownloadExpanded"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;margin-left:auto;">
{{ videoDownloadExpanded ? '收起' : '展开' }}
<span class="dy-chevron"></span>
</button>
</div>
<dy-collapse :show="videoDownloadExpanded">
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.parseVideo" @change="onVideoDownloadSettingsChange()" />
<span class="dy-tip" data-tip="在抖音分享菜单点击下载时，打开视频解析面板，显示可用的清晰度和媒体地址">启用视频解析</span>
</label>
<span class="dy-status-badge" :class="s.parseVideo ? 'dy-status-on' : 'dy-status-off'">{{ s.parseVideo ? '已开启' : '已关闭' }}</span>
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s['dy-video-downloader-addDownloadButton']" @change="onVideoDownloadSettingsChange()" />
<span class="dy-tip" data-tip="尝试在播放器工具栏添加一个下载按钮">播放器下载按钮</span>
</label>
<span class="dy-status-badge" :class="s['dy-video-downloader-addDownloadButton'] ? 'dy-status-on' : 'dy-status-off'">{{ s['dy-video-downloader-addDownloadButton'] ? '已开启' : '已关闭' }}</span>
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s['dy-video-popupDownloadRenameFileName']" @change="onVideoDownloadSettingsChange()" />
<span class="dy-tip" data-tip="点击下载时先确认或修改文件名">下载时确认文件名</span>
</label>
</div>
<div class="dy-menu-row" style="align-items:center;">
<button class="dy-ghost-btn" @click="openCurrentVideoDownload()"><dy-icon name="search" :size="12"></dy-icon> 解析当前视频</button>
<span style="font-size:var(--dy-font-size-xs);color:rgba(255,255,255,0.42);">若分享菜单无法解析，可以尝试此按钮</span>
</div>
<div class="dy-menu-row" style="display:block;">
<label style="display:block;margin-bottom:4px;">视频 / 图片文件名模板</label>
<input type="text" style="width:100%;min-width:0;" v-model="s['dy-video-parseVideo-downloadFileName']" @change="onVideoDownloadSettingsChange()" />
<div style="font-size:var(--dy-font-size-xs);color:rgba(255,255,255,0.42);margin-top:3px;">{uid} 作者ID、{nickname} 作者名、{awemeId} 视频ID、{desc} 文案、{quality} 分辨率、{downloadTime} 下载时间</div>
</div>
<div class="dy-menu-row" style="display:block;">
<label style="display:block;margin-bottom:4px;">音乐文件名模板</label>
<input type="text" style="width:100%;min-width:0;" v-model="s['dy-video-parseVideoMusic-downloadFileName']" @change="onVideoDownloadSettingsChange()" />
<div style="font-size:var(--dy-font-size-xs);color:rgba(255,255,255,0.42);margin-top:3px;">{author} 音乐人、{title} 音乐名称、{album} 专辑、{duration} 时长、{downloadTime} 下载时间</div>
</div>
</dy-collapse>
</div>
<!-- ========== 福袋自动抢 ========== -->
<div class="dy-menu-section" style="border-left:3px solid #FFD54F;">
<div class="section-title dy-pool-header">
<span class="dy-pool-title"><dy-icon name="gift"></dy-icon> 福袋自动抢</span>
<span class="dy-status-badge" :class="s.enableLottery ? 'dy-status-on' : 'dy-status-off'">
{{ s.enableLottery ? '已开启' : '已关闭' }}
</span>
<button class="dy-toggle-btn" :class="{ open: lotteryExpanded }" @click="lotteryExpanded = !lotteryExpanded"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;margin-left:auto;">
{{ lotteryExpanded ? '收起' : '展开' }}
<span class="dy-chevron"></span>
</button>
</div>
<dy-collapse :show="lotteryExpanded">
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.enableLottery" @change="onLotteryToggle()" />
<span class="dy-tip" data-tip="开启后自动识别直播间福袋、检查参与条件、自动参与并检测开奖结果。快捷键：Alt+Q">启用福袋自动抢</span>
</label>
<span class="dy-status-badge" :class="s.enableLottery ? 'dy-status-on' : 'dy-status-off'">
{{ s.enableLottery ? '已开启' : '已关闭' }}
</span>
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.lotteryShowFloatPanel" @change="onLotteryPanelToggle()" />
<span class="dy-tip" data-tip="在直播页顶部显示一个可拖拽的状态浮窗，实时显示福袋开关、状态、参与条件、参与人数、上轮结果">显示悬浮状态窗</span>
</label>
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.lotterySkipMultiCond" @change="immediateSave()" />
<span class="dy-tip" data-tip="多条件福袋中，若全部条件都未达成，则自动放弃并等待下一轮。关闭后遇到不符合条件的福袋会一直停留在弹窗">多条件不符自动放弃</span>
</label>
</div>
<div class="dy-menu-row">
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.5);">
快捷键：<code style="background:rgba(255,255,255,0.1);padding:0 6px;border-radius:3px;">F8</code>
开启 / 关闭
</span>
</div>
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<span class="dy-group-title"><dy-icon name="barChart" :size="12"></dy-icon> 实时状态（仅直播间页有效）</span>
</div>
<div class="dy-menu-row" style="gap:4px 12px;flex-wrap:wrap;">
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.55);">福袋状态：</span>
<span data-dy-lottery-status style="font-size:var(--dy-font-size-sm);color:#ffd54f;">未运行</span>
<span data-dy-lottery-count style="font-size:var(--dy-font-size-sm);color:#ffd54f;font-weight:bold;">（未知）</span>
</div>
<div class="dy-menu-row">
<span data-dy-lottery-cond style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.7);width:100%;text-align:left;"></span>
</div>
<div class="dy-menu-row">
<span data-dy-lottery-participant style="font-size:var(--dy-font-size-sm);color:#ffd54f;width:100%;text-align:left;"></span>
<span data-dy-lottery-last style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.7);width:100%;text-align:left;"></span>
</div>
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<span class="dy-group-title"><dy-icon name="clock" :size="12"></dy-icon> 轮询参数</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="没有福袋出现时的轮询间隔，越长越省 CPU">空闲轮询</span></label>
<input type="number" v-model.number="s.lotteryPollingIdle" min="10" max="300" step="5" style="width:80px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="检测到福袋后的快速轮询间隔，越小越灵敏">活动轮询</span></label>
<input type="number" v-model.number="s.lotteryPollingActive" min="0.5" max="5" step="0.5" style="width:80px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="检测到开奖结果后，等待多少毫秒再自动点击关闭">开奖关闭延迟</span></label>
<input type="number" v-model.number="s.lotteryAutoCloseDelay" min="200" max="5000" step="100" style="width:80px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">毫秒</span>
</div>
<div style="font-size:var(--dy-font-size-xs);color:rgba(255,255,255,0.35);margin-top:6px;line-height:1.6;">
<b>参与规则：</b><br>
• 单条件 / 无限制 → 直接参与<br>
• 多条件含「发送评论」且未达成 + 其它条件有达成 → 参与<br>
• 多条件全部未达成 → 自动放弃（可在上方关闭）<br>
• 倒计时剩余 10s 自动采集参与人数
</div>
</dy-collapse>
</div>
<!-- ========== 功能开关 ========== -->
<div class="dy-menu-section">
<div class="section-title dy-pool-header">
<span class="dy-pool-title"><dy-icon name="settings"></dy-icon> 功能开关</span>
<button class="dy-toggle-btn" :class="{ open: functionalSwitchExpanded }" @click="functionalSwitchExpanded = !functionalSwitchExpanded"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;">
{{ functionalSwitchExpanded ? '收起' : '展开' }}
<span class="dy-chevron"></span>
</button>
</div>
<dy-collapse :show="functionalSwitchExpanded">
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.enableQualitySwitch" @change="onQualityToggle()" />
<span class="dy-tip" data-tip="自动切换到可用的最高画质（原画/蓝光/超清等）">智能画质切换</span>
</label>
<label><input type="checkbox" v-model="s.enablePayHide" @change="onPayHideToggle()" />
<span class="dy-tip" data-tip="隐藏直播间的礼物面板 / 付费面板">隐藏礼物面板</span>
</label>
<label><input type="checkbox" v-model="s.enableMirror" @change="onMirrorToggle()" />
<span class="dy-tip" data-tip="将视频画面水平翻转（镜像）显示">视频镜像</span>
</label>
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.enableGiftFilter" @change="onGiftFilterToggle()" />
<span class="dy-tip" data-tip="过滤直播间中的礼物赠送类聊天消息">礼物消息过滤</span>
</label>
<label><input type="checkbox" v-model="s.hideNonVideoElements_Switch" @change="immediateSave()" />
<span class="dy-tip" data-tip="隐藏广告、推广卡片、直播/游戏推荐等非视频元素">隐藏非视频元素</span>
</label>
</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.enableImmersivePersist" @change="onImmersivePersistToggle()" />
<span class="dy-tip" data-tip="开启后播放器持续保持清屏模式（控制栏隐藏）。点击清屏按钮可退出；按 J 键的行为取决于下方开关">清屏持久化</span>
</label>
<span class="dy-status-badge" :class="s.enableImmersivePersist ? 'dy-status-on' : 'dy-status-off'">
{{ s.enableImmersivePersist ? '已开启' : '已关闭' }}
</span>
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableImmersivePersist ? 1 : 0.45 }">
<label><input type="checkbox" v-model="s.hijackImmersiveShortcut" @change="immediateSave()"
:disabled="!s.enableImmersivePersist" />
<span class="dy-tip" data-tip="开启后：按 J 键可以切换持久化的开/关；关闭时：按 J 键会直接关闭持久化">劫持 J 键切换持久化</span>
</label>
<span class="dy-status-badge" :class="s.hijackImmersiveShortcut ? 'dy-status-on' : 'dy-status-off'">
{{ s.hijackImmersiveShortcut ? '已开启' : '已关闭' }}
</span>
</div>
<div class="dy-menu-row">
<label style="width:110px;flex:0 0 110px;"><span class="dy-tip" data-tip="手动设置视频播放速度（0.1~3.0 倍）"><dy-icon name="zap" :size="12"></dy-icon> 自定义倍速</span></label>
<input type="number" v-model.number="s.customPlaybackRate" min="0.1" max="3.0" step="0.1" style="width:70px;flex:0 0 70px;" />
<button class="dy-ghost-btn" @click="applyCustomRate()">应用</button>
</div>
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<label><input type="checkbox" :checked="s.themeMode === 'auto'" @change="onAutoFollowChange($event)" />
<span class="dy-tip" data-tip="开启后自动跟随系统的深浅色偏好；关闭后可手动切换深/浅色">自动跟随系统深浅色</span>
</label>
<span class="dy-status-badge" :class="s.themeMode === 'auto' ? 'dy-status-on' : 'dy-status-off'">
{{ s.themeMode === 'auto' ? '跟随中' : '手动' }}
</span>
<button class="dy-ghost-btn" :disabled="s.themeMode === 'auto'"
@click="toggleDarkLight()"
:style="{ opacity: s.themeMode === 'auto' ? 0.45 : 1, cursor: s.themeMode === 'auto' ? 'not-allowed' : 'pointer' }">
切换到{{ s.themeMode === 'light' ? '深色' : '浅色' }}
</button>
</div>
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<label><input type="checkbox" v-model="s.enableMsgFloat" @change="immediateSave()" />
<span class="dy-tip" data-tip="开启后，鼠标移到顶部「消息」按钮上会浮出联系人列表"><dy-icon name="mail" :size="12"></dy-icon> 消息悬浮窗</span>
</label>
<button class="dy-ghost-orange" @click="resetContacts()">重置</button>
</div>
</dy-collapse>
</div>
<!-- ========== 全局防暂停 ========== -->
<div class="dy-menu-section">
<div class="section-title"><dy-icon name="shield"></dy-icon> 全局防暂停</div>
<div class="dy-menu-row" style="align-items:center;">
<label><input type="checkbox" v-model="s.enableKeepAlive" @change="onKeepAliveToggle()" />
<span class="dy-tip" data-tip="总开关：关闭后所有防暂停子模块均失效，但下方子选项的配置会保留">全局防暂停</span>
</label>
<span class="dy-status-badge" :class="s.enableKeepAlive ? 'dy-status-on' : 'dy-status-off'">
{{ s.enableKeepAlive ? '运行中' : '已关闭' }}
</span>
<button class="dy-toggle-btn" :class="{ open: pauseGuardExpanded }"
@click="pauseGuardExpanded = !pauseGuardExpanded"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;margin-left:auto;">
{{ pauseGuardExpanded ? '收起' : '选项' }}
<span class="dy-chevron"></span>
</button>
</div>
<dy-collapse :show="pauseGuardExpanded"
class="dy-advanced-content"
:style="{ opacity: s.enableKeepAlive ? 1 : 0.45 }">
<div style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);margin-bottom:6px;">
防暂停子模块
<span v-if="!s.enableKeepAlive" style="color:#FF9800;">（总开关关闭中，这些设置暂不生效）</span>
</div>
<div class="dy-menu-row" style="flex-wrap:wrap;gap:4px 12px;margin-bottom:6px;">
<label><input type="checkbox" v-model="s.pauseGuard_visibilitySpoof" @change="immediateSave()" />
<span class="dy-tip" data-tip="把 document.hidden / visibilityState 伪装成“前台可见”，骗过播放器的可见性检测">可见性伪装</span>
</label>
<label><input type="checkbox" v-model="s.pauseGuard_eventBlocking" @change="immediateSave()" />
<span class="dy-tip" data-tip="拦截 document/window 上的 visibilitychange 事件，让页面收不到切后台通知">事件拦截</span>
</label>
<label><input type="checkbox" v-model="s.pauseGuard_rafReplacement" @change="immediateSave()" />
<span class="dy-tip" data-tip="把 requestAnimationFrame 换成 setTimeout，避免后台 rAF 被浏览器限速导致播放器卡死。副作用：后台略耗CPU">rAF 替换</span>
</label>
<label><input type="checkbox" v-model="s.pauseGuard_mouseSimulation" @change="immediateSave()" />
<span class="dy-tip" data-tip="后台时定期派发假的 mousemove 事件，防止“长时间无操作”弹窗">鼠标模拟</span>
</label>
<label><input type="checkbox" v-model="s.pauseGuard_popupClick" @change="immediateSave()" />
<span class="dy-tip" data-tip="自动检测并点击“继续播放/继续观看/恢复播放”按钮">弹窗点击</span>
</label>
<label><input type="checkbox" v-model="s.pauseGuard_backgroundResume" @change="immediateSave()" />
<span class="dy-tip" data-tip="后台时若视频被暂停，自动静音并强制播放；回前台恢复音量">后台静音恢复</span>
</label>
</div>
<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;margin-top:4px;">
<div class="dy-menu-row">
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.5);"><dy-icon name="clock" :size="12"></dy-icon> 时间参数</span>
<button class="dy-toggle-btn" :class="{ open: pauseGuardTimeExpanded }" @click="pauseGuardTimeExpanded = !pauseGuardTimeExpanded"
style="font-size:var(--dy-font-size-xs);padding:0 8px;line-height:18px;margin-left:auto;">
{{ pauseGuardTimeExpanded ? '收起' : '展开' }}
<span class="dy-chevron"></span>
</button>
</div>
<dy-collapse :show="pauseGuardTimeExpanded" style="margin-top:4px;">
<div class="dy-menu-row">
<label style="width:150px;"><span class="dy-tip" data-tip="每隔多少秒派发一次假的鼠标移动事件">鼠标模拟间隔</span></label>
<input type="number" v-model.number="s.pauseGuard_mouseSimInterval" min="10" max="300" step="5" style="width:70px;" @change="restartPauseGuardTimers()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:150px;"><span class="dy-tip" data-tip="后台时每隔多少秒检查一次被暂停的视频并尝试恢复">后台恢复检查</span></label>
<input type="number" v-model.number="s.pauseGuard_backgroundResumeInterval" min="5" max="120" step="5" style="width:70px;" @change="restartPauseGuardTimers()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:150px;"><span class="dy-tip" data-tip="检测前台↔后台切换的轮询频率，越小越灵敏但越耗CPU">前后台状态检测</span></label>
<input type="number" v-model.number="s.pauseGuard_visibilityCheckInterval" min="1" max="15" step="0.5" style="width:70px;" @change="restartPauseGuardTimers()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:150px;"><span class="dy-tip" data-tip="扫描页面上是否存在暂停弹窗的频率">弹窗点击扫描间隔</span></label>
<input type="number" v-model.number="s.pauseGuard_popupClickInterval" min="0.5" max="10" step="0.5" style="width:70px;" @change="restartPauseGuardTimers()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:150px;"><span class="dy-tip" data-tip="同一个按钮多久内不会重复点击（防连点）">弹窗点击去重</span></label>
<input type="number" v-model.number="s.pauseGuard_popupClickDedupe" min="0.5" max="5" step="0.1" style="width:70px;" @change="restartPauseGuardTimers()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:150px;"><span class="dy-tip" data-tip="DOM 变化后多久检查一次暂停弹窗（越小越灵敏，越大越省CPU）">DOM 变化防抖</span></label>
<input type="number" v-model.number="s.pauseGuard_domMutationDebounce" min="100" max="2000" step="50" style="width:70px;" @change="restartPauseGuardTimers()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">毫秒</span>
</div>
</dy-collapse>
</div>
</dy-collapse>
</div>
<!-- ========== 通用 ========== -->
<div class="dy-menu-section">
<div class="section-title"><dy-icon name="wrench"></dy-icon> 通用</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.consoleOutputLog_Switch" @change="immediateSave()" />
<span class="dy-tip" data-tip="在浏览器控制台输出运行日志（一般用户无需开启）">控制台日志</span>
</label>
<label><input type="checkbox" v-model="s.debugMode" @change="onDebugToggle()" />
<span class="dy-tip" data-tip="全功能调试模式：输出每个模块的详细执行日志、定时器状态、事件时间线。适合排查问题"><dy-icon name="microscope" :size="12"></dy-icon> 全功能调试</span>
</label>
<label><input type="checkbox" v-model="s.hideBlockedWordsInMenu_Switch" @change="immediateSave()" />
<span class="dy-tip" data-tip="在菜单里用「词1、词2」代替真实屏蔽词，避免被截图泄露">隐藏菜单屏蔽词</span>
</label>
</div>
<div class="dy-menu-row dy-btn-grid" style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);">
<button class="dy-ghost-btn" @click="exportConfig()"><dy-icon name="upload" :size="12"></dy-icon> 导出配置</button>
<button class="dy-ghost-btn" @click="importConfig()"><dy-icon name="download" :size="12"></dy-icon> 导入配置</button>
</div>
<div class="dy-menu-row dy-btn-grid" style="margin-top:8px;">
<button class="dy-ghost-btn" @click="runSelfCheckFromMenu()"><dy-icon name="search" :size="12"></dy-icon> 自检</button>
<button class="dy-ghost-btn dy-ghost-red" @click="resetDefaults()"><dy-icon name="rotateCcw" :size="12"></dy-icon> 恢复默认</button>
</div>
</div>
<!-- ========== 高级设置 ========== -->
<div class="dy-menu-section" style="border-left:3px solid rgba(255,152,0,0.6);">
<div class="section-title dy-pool-header">
<span class="dy-pool-title"><dy-icon name="microscope"></dy-icon> 高级设置
<span class="dy-tip" data-tip="这里都是不常用的调优参数。误改可能导致功能异常，建议保持默认" style="margin-left:6px;">?</span>
</span>
<button class="dy-toggle-btn" :class="{ open: advancedExpanded }" @click="advancedExpanded = !advancedExpanded"
style="font-size:var(--dy-font-size-sm);padding:0 10px;line-height:22px;">
{{ advancedExpanded ? '收起' : '展开' }}
<span class="dy-chevron"></span>
</button>
</div>
<dy-collapse :show="advancedExpanded" class="dy-advanced-content">
<!-- 键盘快捷键 -->
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.enableKeyboardShortcuts" @change="immediateSave()" />
<span class="dy-tip" data-tip="启用键盘快捷键开关（关闭后下面的键位设置不生效）"><dy-icon name="keyboard" :size="12"></dy-icon> 键盘快捷键</span>
</label>
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableKeyboardShortcuts ? 1 : 0.4 }">
<label style="width:120px;flex:0 0 120px;">切换礼物面板</label>
<input type="text" v-model="s.keyTogglePayHide" maxlength="8"
style="width:60px;flex:0 0 60px;text-align:center;"
@keydown="captureKey($event, 'keyTogglePayHide')"
@focus="$event.target.select()"
:disabled="!s.enableKeyboardShortcuts" />
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableKeyboardShortcuts ? 1 : 0.4 }">
<label style="width:120px;flex:0 0 120px;">切换礼物过滤</label>
<input type="text" v-model="s.keyToggleGiftFilter" maxlength="8"
style="width:60px;flex:0 0 60px;text-align:center;"
@keydown="captureKey($event, 'keyToggleGiftFilter')"
@focus="$event.target.select()"
:disabled="!s.enableKeyboardShortcuts" />
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableKeyboardShortcuts ? 1 : 0.4 }">
<label style="width:120px;flex:0 0 120px;">切换视频镜像</label>
<input type="text" v-model="s.keyToggleMirror" maxlength="8"
style="width:60px;flex:0 0 60px;text-align:center;"
@keydown="captureKey($event, 'keyToggleMirror')"
@focus="$event.target.select()"
:disabled="!s.enableKeyboardShortcuts" />
<span style="color:rgba(255,255,255,0.3);font-size:var(--dy-font-size-xs);margin-left:8px;">点击输入框后按任意键设定</span>
</div>
<!-- 导航栏按钮 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<label><input type="checkbox" v-model="s.enableNavButton" @change="onNavButtonToggle()" />
<span class="dy-tip" data-tip="在抖音导航栏注入「脚本」按钮，方便随时打开设置面板。关闭后需从油猴菜单打开">导航栏「脚本」按钮</span>
</label>
</div>
<!-- 池子 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<span class="dy-group-title"><dy-icon name="barChart" :size="12"></dy-icon> 池子</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="菜单里最多显示多少条弹幕/屏蔽记录（内存里最多保留 500 条）">池子显示上限</span></label>
<input type="number" v-model.number="s.poolSizeLimit" min="10" max="500" step="5" style="width:70px;" @change="onPoolSizeChange()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">条</span>
</div>
<!-- 数据源优先级 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<label><input type="checkbox" v-model="s.preferQuickPlayer" @change="immediateSave()" />
<span class="dy-tip" data-tip="优先读取抖音运行时 window.__QUICK_PLAYER.awemeInfo 判断视频标题/作者，比 DOM 更稳。若某天结构变化可关闭"><dy-icon name="target" :size="12"></dy-icon> 优先用运行时视频信息</span>
</label>
</div>
<!-- 基础时间参数 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<span class="dy-group-title"><dy-icon name="clock" :size="12"></dy-icon> 基础时间参数</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="用户点击/按键后，多少秒内不自动操作（避免打断你手动选择）"><dy-icon name="shield" :size="12"></dy-icon> 交互锁延迟</span></label>
<input type="number" v-model.number="s.interactionLockDelay" min="0.5" max="10.0" step="0.5" style="width:70px;" @change="onLockDelayChange()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="每隔多少秒扫描一次画质并尝试切换"><dy-icon name="film" :size="12"></dy-icon> 画质切换</span></label>
<input type="number" v-model.number="s.pollingQuality" min="0.5" max="10.0" step="0.5" style="width:70px;" @change="restartQualityTimer()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="同一视频、同一目标画质，多久内不重复点击。太短会反复点，太长会延迟切换。只对画质切换生效"><dy-icon name="film" :size="12"></dy-icon> 画质去重窗口</span></label>
<input type="number" v-model.number="s.qualityClickDedupe" min="500" max="10000" step="100" style="width:70px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">毫秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="抖音有时会把 4K 标为「已选中」，但视频流仍是低画质。脚本检测到后会再点一次强制切换。这里设置两次点击之间的最小间隔（毫秒），值越小越激进，越大越保守。建议 8000，最小 3000"><dy-icon name="film" :size="12"></dy-icon> 强制重选间隔</span></label>
<input type="number" v-model.number="s.qualityForceWait" min="3000" max="30000" step="1000" style="width:70px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">毫秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="UI 已选最高画质但视频流未生效时，脚本最多再点几次。达到上限后 30 秒内不再点，避免无限循环。建议 3，范围 1~10"><dy-icon name="film" :size="12"></dy-icon> 强制重选上限</span></label>
<input type="number" v-model.number="s.qualityForceMaxRetries" min="1" max="10" step="1" style="width:70px;" @change="immediateSave()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">次</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="每隔多少秒扫描一次新弹幕。越小越实时但越耗 CPU"><dy-icon name="message" :size="12"></dy-icon> 弹幕过滤</span></label>
<input type="number" v-model.number="s.pollingDanmu" min="0.2" max="5.0" step="0.1" style="width:70px;" @change="restartDanmuTimer()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
<span style="color:rgba(255,255,255,0.2);font-size:var(--dy-font-size-xs);margin-left:4px;"><dy-icon name="alert" :size="11"></dy-icon> 越频繁越耗CPU</span>
</div>
<!-- Tooltip 参数 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<span class="dy-group-title"><dy-icon name="info" :size="12"></dy-icon> Tooltip 提示参数</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="鼠标悬停在带虚线下划线的文字上，等待多久才弹出提示气泡。值越大越不容易误触发">弹出延迟</span></label>
<input type="number" v-model.number="s.tooltipShowDelay" min="0" max="3000" step="50" style="width:70px;" @change="immediateSave()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">毫秒</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="鼠标移出后多久收起提示气泡。值太小会导致鼠标从气泡上划过时闪断">隐藏延迟</span></label>
<input type="number" v-model.number="s.tooltipHideDelay" min="0" max="1000" step="10" style="width:70px;" @change="immediateSave()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">毫秒</span>
</div>
<!-- 开屏封面 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<label><input type="checkbox" v-model="s.enableSplashScreen" @change="immediateSave()" />
<span class="dy-tip" data-tip="开启后在每次会话首次进入页面时显示一个开屏动画（下次刷新生效）"><dy-icon name="film" :size="12"></dy-icon> 开屏封面</span>
</label>
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableSplashScreen ? 1 : 0.4 }">
<label style="width:130px;"><span class="dy-tip" data-tip="封面停留的时间">显示时长</span></label>
<input type="number" v-model.number="s.splashDuration" min="300" max="5000" step="100" style="width:70px;" @change="immediateSave()" :disabled="!s.enableSplashScreen" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">毫秒</span>
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableSplashScreen ? 1 : 0.4 }">
<label style="width:130px;"><span class="dy-tip" data-tip="淡出动画时长">淡出时长</span></label>
<input type="number" v-model.number="s.splashFadeoutMs" min="100" max="3000" step="100" style="width:70px;" @change="immediateSave()" :disabled="!s.enableSplashScreen" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">毫秒</span>
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableSplashScreen ? 1 : 0.4 }">
<label style="width:130px;"><span class="dy-tip" data-tip="封面背景色（CSS 颜色值）">背景色</span></label>
<input type="text" v-model="s.splashBgColor" style="width:100px;" @change="immediateSave()" :disabled="!s.enableSplashScreen" />
</div>
<div class="dy-menu-row" :style="{ opacity: s.enableSplashScreen ? 1 : 0.4 }">
<label style="width:130px;"><span class="dy-tip" data-tip="封面下方显示的副标题">副标题</span></label>
<input type="text" v-model="s.splashSlogan" style="width:180px;" @change="immediateSave()" :disabled="!s.enableSplashScreen" />
</div>
<!-- 数据管理 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<span class="dy-group-title"><dy-icon name="database" :size="12"></dy-icon> 数据管理</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="崩溃日志最多保留多少条。数值越大，越能追溯历史，但占用的存储空间也越大。建议 30，范围 10~100"><dy-icon name="database" :size="12"></dy-icon> 崩溃日志上限</span></label>
<input type="number" v-model.number="s.crashLogMaxEntries" min="10" max="100" step="10" style="width:70px;" @change="immediateSave()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">条</span>
</div>
<div class="dy-menu-row">
<button class="dy-ghost-red" @click="clearAllStorage()"
data-tip="⚠ 核弹级操作：清空所有设置、屏蔽词/规则列表、联系人缓存、账号绑定，并自动刷新页面。比「恢复默认」更彻底，且不可撤销！">清空全部存储</button>
</div>
</dy-collapse>
</div>
<Teleport to="body">
<div id="dyMenuPrompt" :style="{ opacity: promptOpacity }">{{ promptText }}</div>
</Teleport>
</div>
`;
// =========================================================
//                         Vue 菜单
// =========================================================
let menuApp = null;
let danmuSyncTimer = null;
// =========================================================
//                菜单拖动功能（标题栏拖动）
// =========================================================
const MENU_POS_KEY = 'DY_MenuPos';

function _clampMenuPos(menu, left, top) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mw = menu.offsetWidth || 480;
    const pad = 8;
    left = Math.max(pad - mw + 60, Math.min(left, vw - 60));
    top = Math.max(0, Math.min(top, vh - 40));
    return {
        left,
        top
    };
}

function makeMenuDraggable() {
    const menu = document.getElementById('dyMenuUi');
    if (!menu || menu._dyDragBound) return;
    menu._dyDragBound = true;
    const handle = menu.querySelector('#dyMenuTitle');
    if (!handle) return;
    try {
        const saved = GM_getValue(MENU_POS_KEY, null);
        if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
            const p = _clampMenuPos(menu, saved.left, saved.top);
            menu.style.left = p.left + 'px';
            menu.style.top = p.top + 'px';
            menu.style.right = 'auto';
        }
    } catch (e) {}
    let isDragging = false,
        startX = 0,
        startY = 0,
        startLeft = 0,
        startTop = 0;
    const onStart = (e) => {
        if (e.target && e.target.closest && e.target.closest('.dy-title-close')) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = menu.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        startX = cx;
        startY = cy;
        menu.style.left = startLeft + 'px';
        menu.style.top = startTop + 'px';
        menu.style.right = 'auto';
        isDragging = true;
        menu.style.cursor = 'grabbing';
        handle.style.cursor = 'grabbing';
        handle.style.userSelect = 'none';
        document.body.style.userSelect = 'none';
        if (e.cancelable) e.preventDefault();
    };
    const onMove = (e) => {
        if (!isDragging) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const p = _clampMenuPos(menu, startLeft + (cx - startX), startTop + (cy - startY));
        menu.style.left = p.left + 'px';
        menu.style.top = p.top + 'px';
    };
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        menu.style.cursor = '';
        handle.style.cursor = '';
        handle.style.userSelect = '';
        document.body.style.userSelect = '';
        const rect = menu.getBoundingClientRect();
        try {
            GM_setValue(MENU_POS_KEY, {
                left: Math.round(rect.left),
                top: Math.round(rect.top)
            });
        } catch (e) {}
    };
    handle.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    handle.addEventListener('touchstart', onStart, {
        passive: false
    });
    document.addEventListener('touchmove', onMove, {
        passive: false
    });
    document.addEventListener('touchend', onEnd);
    handle.addEventListener('dblclick', (e) => {
        if (e.target && e.target.closest && e.target.closest('.dy-title-close')) return;
        menu.style.left = '';
        menu.style.top = '';
        menu.style.right = '';
        try {
            GM_setValue(MENU_POS_KEY, null);
        } catch (e) {}
    });
    window.addEventListener('resize', () => {
        if (!menu.style.left) return;
        const rect = menu.getBoundingClientRect();
        const p = _clampMenuPos(menu, rect.left, rect.top);
        menu.style.left = p.left + 'px';
        menu.style.top = p.top + 'px';
    });
}
// =========================================================
//              窗口打开 / 关闭动画辅助函数
// =========================================================
function playMenuOpen(menuEl) {
    if (!menuEl) return;
    menuEl.style.display = '';
    menuEl.classList.remove('dy-menu-closing');
    menuEl.classList.remove('dy-menu-opening');
    void menuEl.offsetWidth; // 强制 reflow，让动画可重播
    menuEl.classList.add('dy-menu-opening');
    const cleanup = () => {
        menuEl.classList.remove('dy-menu-opening');
        menuEl.removeEventListener('animationend', cleanup);
    };
    menuEl.addEventListener('animationend', cleanup);
}

function playMenuClose(menuEl, onDone) {
    // ★ 关闭菜单前先收起 tooltip，避免菜单 display:none 后 mouseout 丢失导致残留
    try {
        if (typeof window.__dyHideTooltip === 'function') window.__dyHideTooltip();
    } catch (e) {}
    if (!menuEl) {
        onDone && onDone();
        return;
    }
    if (menuEl.style.display === 'none') {
        onDone && onDone();
        return;
    }
    menuEl.classList.remove('dy-menu-opening');
    menuEl.classList.add('dy-menu-closing');
    let done = false;
    const finish = () => {
        if (done) return;
        done = true;
        menuEl.style.display = 'none';
        menuEl.classList.remove('dy-menu-closing');
        onDone && onDone();
    };
    menuEl.addEventListener('animationend', finish, {
        once: true
    });
    setTimeout(finish, 300); // 兜底
}

function playPanelClose(panel) {
    if (!panel || !panel.parentNode) return;
    panel.style.animation = 'dyPanelOut 0.22s cubic-bezier(0.4, 0, 1, 1) forwards';
    panel.style.pointerEvents = 'none';
    setTimeout(() => {
        if (panel.parentNode) panel.remove();
    }, 230);
}

function createMenu() {
    const existingMenu = document.getElementById("dyMenuUi");
    if (existingMenu) {
        playMenuOpen(existingMenu);
        if (!danmuSyncTimer) startDanmuPoolSync();
        setScriptGearActive(true);
        makeMenuDraggable();
        return;
    }
    const container = document.createElement("div");
    container.innerHTML = menuHTML;
    document.body.appendChild(container);
    try {
        if (typeof Vue === 'undefined') {
            if (typeof unsafeWindow !== 'undefined' && unsafeWindow.Vue) {
                window.Vue = unsafeWindow.Vue;
            }
        } else {
            if (typeof unsafeWindow !== 'undefined') {
                unsafeWindow.Vue = Vue;
            }
        }
    } catch (e) {}
    if (typeof Vue === 'undefined') {
        console.error('[抖音优化] Vue 加载失败，无法创建菜单');
        window.__dyLoadFail && window.__dyLoadFail('Vue 未加载');
        return;
    }
    const {
        createApp,
        reactive,
        toRaw,
        ref,
        onMounted,
        onUnmounted,
        nextTick
    } = Vue;
    menuApp = createApp({
        setup() {
            const s = reactive({});
            const temp = reactive({
                danmuInput: '',
                skipVideoInput: ''
            });
            const promptText = ref('');
            const promptOpacity = ref(0);
            const danmuList = ref([]);
            const blockedList = ref([]);
            const blockedPoolExpanded = ref(false);
            let promptTimer = null;
            const danmuPoolContainer = ref(null);
            const blockedPoolContainer = ref(null);
            const followingDanmu = ref(false);
            const followingBlocked = ref(false);
            const pauseGuardExpanded = ref(false);
            const pauseGuardTimeExpanded = ref(false);
            const advancedExpanded = ref(false);
            const showRegexTest = ref(false);
            const poolsAreaExpanded = ref(true);
            const danmuListExpanded = ref(true);
            const showDanmuBlockedSettings = ref(true);
            const skipVideoExpanded = ref(false);
            const functionalSwitchExpanded = ref(true);
            const lotteryExpanded = ref(false);
            const videoDownloadExpanded = ref(false);
            const regexTestText = ref('');
            const regexTestResult = ref([]);

            function showPrompt(msg) {
                promptText.value = msg;
                promptOpacity.value = 1;
                if (promptTimer) clearTimeout(promptTimer);
                promptTimer = setTimeout(() => {
                    promptOpacity.value = 0;
                }, 1500);
            }

            function immediateSave() {
                const raw = toRaw(s);
                for (const key in raw) settings[key] = raw[key];
                GM_setValue('DY_Settings', settings);
                PauseGuard.setEnabled(settings.enableKeepAlive !== false);
            }

            function applyCustomRate() {
                const rate = s.customPlaybackRate;
                if (rate < 0.1 || rate > 3.0) {
                    showPrompt('倍速范围 0.1~3.0');
                    return;
                }
                immediateSave();
                const videos = document.querySelectorAll('video');
                if (videos.length === 0) {
                    showPrompt('未找到视频元素');
                    return;
                }
                let applied = 0;
                for (const video of videos) {
                    video.playbackRate = rate;
                    applied++;
                }
                showPrompt(`倍速已设为 ${rate.toFixed(1)}x（已应用于 ${applied} 个视频）`);
                log('◎ 手动应用倍速:', rate, '到', applied, '个视频');
            }

            function onPoolSizeChange() {
                immediateSave();
                syncPools();
                showPrompt(`池子上限已更新为 ${s.poolSizeLimit} 条`);
            }

            function goToLatest(type) {
                const isDanmu = (type === 'danmu');
                const following = isDanmu ? followingDanmu : followingBlocked;
                following.value = true;
                const container = isDanmu ? danmuPoolContainer.value : blockedPoolContainer.value;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                    showPrompt(`⇣ ${isDanmu ? '弹幕池' : '屏蔽池'}已开启跟随，滚动到最新`);
                } else {
                    showPrompt('⚠ 容器未加载');
                }
                log(`${isDanmu ? '弹幕池' : '屏蔽池'}跟随已开启`);
            }

            function scrollIfFollowing() {
                if (!followingDanmu.value && !followingBlocked.value) return;
                nextTick(() => {
                    if (followingDanmu.value && danmuPoolContainer.value) {
                        danmuPoolContainer.value.scrollTop = danmuPoolContainer.value.scrollHeight;
                    }
                    if (followingBlocked.value && blockedPoolContainer.value && blockedPoolExpanded.value) {
                        blockedPoolContainer.value.scrollTop = blockedPoolContainer.value.scrollHeight;
                    }
                });
            }

            function setupWheelListener() {
                nextTick(() => {
                    if (danmuPoolContainer.value) {
                        danmuPoolContainer.value.removeEventListener('wheel', onWheelDanmu);
                        danmuPoolContainer.value.addEventListener('wheel', onWheelDanmu);
                    }
                    if (blockedPoolContainer.value) {
                        blockedPoolContainer.value.removeEventListener('wheel', onWheelBlocked);
                        blockedPoolContainer.value.addEventListener('wheel', onWheelBlocked);
                    }
                });
            }

            function onWheelDanmu() {
                if (followingDanmu.value) {
                    followingDanmu.value = false;
                    showPrompt('■ 弹幕池：手动滚动，跟随已停止');
                    log('弹幕池跟随已停止');
                }
            }

            function onWheelBlocked() {
                if (followingBlocked.value) {
                    followingBlocked.value = false;
                    showPrompt('■ 屏蔽池：手动滚动，跟随已停止');
                    log('屏蔽池跟随已停止');
                }
            }

            function syncPools() {
                const limit = Math.max(10, s.poolSizeLimit || 50);
                danmuList.value = danmuPool.slice(-limit);
                blockedList.value = blockedPool.slice(-limit);
                setupWheelListener();
                scrollIfFollowing();
            }

            function onDanmuToggle() {
                const status = s.blockedDanmu_Switch ? '已开启' : '已关闭';
                showPrompt(`弹幕屏蔽 ${status}`);
                immediateSave();
                if (s.blockedDanmu_Switch) {
                    danmuPool = [];
                    blockedPool = [];
                    setTimeout(filterDanmu, 200);
                } else {
                    document.querySelectorAll('.dy-danmu-blocked').forEach(el => {
                        el.style.display = '';
                        el.classList.remove('dy-danmu-blocked');
                    });
                    blockedPool = [];
                    filterDanmu();
                }
                runRegexTest();
            }

            function onQualityToggle() {
                immediateSave();
                showPrompt(s.enableQualitySwitch ? '画质切换已开启' : '画质切换已关闭');
            }

            function onPayHideToggle() {
                togglePayHide();
                showPrompt(settings.enablePayHide ? '✓ 礼物面板已隐藏' : '✕ 礼物面板已显示');
            }

            function onMirrorToggle() {
                toggleMirror();
                showPrompt(settings.enableMirror ? '✓ 镜像已开启' : '✕ 镜像已关闭');
            }

            function onGiftFilterToggle() {
                toggleGiftFilter();
                showPrompt(settings.enableGiftFilter ? '✓ 礼物消息过滤已开启' : '✕ 礼物消息过滤已关闭');
            }

            function onKeepAliveToggle() {
                immediateSave();
                setupKeepAlive();
                if (!s.enableKeepAlive) pauseGuardExpanded.value = false;
                showPrompt(s.enableKeepAlive ? '◈ 全局防暂停已开启' : '◈ 全局防暂停已关闭');
            }

            function onImmersivePersistToggle() {
                immediateSave();
                if (s.enableImmersivePersist) {
                    startImmersiveTimer();
                    setTimeout(applyImmersiveState, 50);
                    showPrompt('✓ 清屏持久化已开启');
                } else {
                    stopImmersiveTimer();
                    setImmersive(false);
                    showPrompt('⏏ 清屏持久化已关闭');
                }
            }

            function onLockDelayChange() {
                immediateSave();
                showPrompt(`交互锁延迟已更新为 ${s.interactionLockDelay} 秒`);
            }

            function restartQualityTimer() {
                immediateSave();
                if (timerQuality) {
                    clearInterval(timerQuality);
                    timerQuality = null;
                }
                startQualityTimer();
                showPrompt(`画质切换间隔已更新为 ${s.pollingQuality} 秒`);
            }

            function restartDanmuTimer() {
                immediateSave();
                if (timerDanmu) {
                    clearInterval(timerDanmu);
                    timerDanmu = null;
                }
                startDanmuTimer();
                showPrompt(`弹幕过滤间隔已更新为 ${s.pollingDanmu} 秒`);
            }

            function restartSkipTimer() {
                immediateSave();
                if (timerSkip) {
                    clearInterval(timerSkip);
                    timerSkip = null;
                }
                startSkipTimer();
                showPrompt(`跳过检测间隔已更新为 ${s.skipVideoPolling} 秒`);
            }

            function onSkipLiveToggle() {
                immediateSave();
                showPrompt(s.skipLive_Switch ? '⊘ 跳过直播已开启' : '✕ 跳过直播已关闭');
            }

            function onSkipVideoRegexToggle() {
                immediateSave();
                showPrompt(s.skipVideoRegex_Switch ? '⊘ 正则屏蔽视频已开启' : '✕ 正则屏蔽视频已关闭');
            }

            function manualRefresh() {
                resetPools();
                showPrompt('↻ 弹幕池和屏蔽池已重置');
            }

            function onVideoDownloadSettingsChange() {
                immediateSave();
                try {
                    restartVideoDownloadFeature();
                } catch (e) {
                    console.error('[抖音优化] 视频下载设置更新失败', e);
                }
                showPrompt('视频解析与下载设置已保存');
            }

            function openCurrentVideoDownload() {
                try {
                    openCurrentVideoDownloadPanel();
                } catch (e) {
                    showPrompt('解析当前视频失败：' + (e && e.message ? e.message : e));
                }
            }

            function onLotteryToggle() {
                immediateSave();
                if (typeof LotteryModule !== 'undefined') {
                    LotteryModule.setEnabled(!!s.enableLottery);
                }
                showPrompt(s.enableLottery ? '✦ 福袋自动抢已开启' : '■ 福袋自动抢已关闭');
            }

            function onLotteryPanelToggle() {
                immediateSave();
                if (typeof LotteryModule !== 'undefined') {
                    LotteryModule.rebuildPanel();
                }
                showPrompt(s.lotteryShowFloatPanel ? '✦ 福袋浮窗已启用' : '福袋浮窗已隐藏');
            }

            function locateDanmu(id) {
                if (!id) {
                    showPrompt('⚠ 弹幕ID不存在');
                    return;
                }
                const target = document.querySelector(`[data-danmu-id="${id}"]`);
                if (!target) {
                    showPrompt('⚠ 弹幕已消失');
                    return;
                }
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                target.classList.add('dy-highlight-danmu');
                setTimeout(() => target.classList.remove('dy-highlight-danmu'), 2000);
                showPrompt(`◎ 已定位弹幕: ${target.textContent.trim().slice(0, 30)}`);
            }

            function deepCopy(src, dst) {
                for (const key in src) {
                    if (typeof src[key] === 'object' && src[key] !== null) {
                        dst[key] = Array.isArray(src[key]) ? [] : {};
                        deepCopy(src[key], dst[key]);
                    } else {
                        dst[key] = src[key];
                    }
                }
            }

            function refresh() {
                let stored = GM_getValue("DY_Settings", {});
                for (const key in DEFAULT_SETTINGS) {
                    if (!(key in stored)) stored[key] = DEFAULT_SETTINGS[key];
                }
                for (const key in stored) settings[key] = stored[key];
                deepCopy(settings, s);
                syncPools();
                PauseGuard.setEnabled(settings.enableKeepAlive !== false);
                pauseGuardExpanded.value = false;
                pauseGuardTimeExpanded.value = false;
                advancedExpanded.value = false;
                poolsAreaExpanded.value = true;
                danmuListExpanded.value = true;
                showDanmuBlockedSettings.value = true;
                skipVideoExpanded.value = false;
                functionalSwitchExpanded.value = true;
                lotteryExpanded.value = false;
                showPrompt('已读取配置');
            }

            function save() {
                const raw = toRaw(s);
                deepCopy(raw, settings);
                GM_setValue('DY_Settings', settings);
                PauseGuard.setEnabled(settings.enableKeepAlive !== false);
                if (settings.blockedDanmu_Switch && settings.blockedDanmu_Array.length === 0) {
                    showPrompt('⚠ 弹幕屏蔽已开启但未添加屏蔽词！');
                } else if (settings.blockedDanmu_Switch) {
                    showPrompt('✓ 配置已保存，弹幕屏蔽已开启');
                } else {
                    showPrompt('▣ 配置已保存');
                }
                restartAllTimers();
                try {
                    restartVideoDownloadFeature();
                } catch (e) {}
                setTimeout(filterDanmu, 200);
                syncPools();
            }

            function closeMenu() {
                const el = document.getElementById('dyMenuUi');
                if (el) playMenuClose(el);
                if (danmuSyncTimer) {
                    clearInterval(danmuSyncTimer);
                    danmuSyncTimer = null;
                }
                setScriptGearActive(false);
            }

            function resetDefaults() {
                if (!confirm('⚠ 确定要恢复所有设置到默认值吗？\n（弹幕屏蔽将关闭，屏蔽词列表清空）')) return;
                for (const key in DEFAULT_SETTINGS) settings[key] = DEFAULT_SETTINGS[key];
                settings.blockedDanmu_Array = [];
                settings.skipVideoRegex_Array = [];
                GM_setValue('DY_Settings', settings);
                deepCopy(settings, s);
                poolsAreaExpanded.value = true;
                danmuListExpanded.value = true;
                showDanmuBlockedSettings.value = true;
                skipVideoExpanded.value = false;
                danmuPool = [];
                blockedPool = [];
                lastVideoContainerId = '';
                followingDanmu.value = false;
                followingBlocked.value = false;
                syncPools();
                restartAllTimers();
                applyPayHide();
                applyMirror();
                setupKeepAlive();
                PauseGuard.setEnabled(settings.enableKeepAlive !== false);
                showPrompt('✓ 已恢复默认设置');
                setTimeout(() => location.reload(), 1500);
            }

            function addItem(key, input) {
                if (!input || !input.trim()) return;
                if (!Array.isArray(s[key])) s[key] = [];
                const defaultRegex = (key === 'blockedDanmu_Array') ?
                    !!s.blockedDanmu_UseRegular :
                    !!s.skipVideoRegex_UseRegular;
                const items = input.split(',').map(v => v.trim()).filter(v => v)
                    .map(text => ({
                        text,
                        useRegex: defaultRegex
                    }));
                s[key].push(...items);
                if (key === 'blockedDanmu_Array') temp.danmuInput = '';
                if (key === 'skipVideoRegex_Array') temp.skipVideoInput = '';
                immediateSave();
                showPrompt(`已添加 ${items.length} 项（默认${defaultRegex ? '正则' : '关键词'}模式）`);
                if (key === 'blockedDanmu_Array') {
                    if (s.blockedDanmu_Switch) {
                        danmuPool = [];
                        blockedPool = [];
                        setTimeout(filterDanmu, 200);
                    }
                    runRegexTest();
                }
            }

            function removeItem(key, index) {
                if (Array.isArray(s[key])) s[key].splice(index, 1);
                immediateSave();
                if (key === 'blockedDanmu_Array') {
                    if (s.blockedDanmu_Switch) {
                        danmuPool = [];
                        blockedPool = [];
                        setTimeout(filterDanmu, 200);
                    }
                    runRegexTest();
                }
            }

            function toggleItemMode(key, index) {
                const arr = s[key];
                if (!Array.isArray(arr) || !arr[index]) return;
                const item = arr[index];
                if (typeof item === 'string') {
                    arr[index] = {
                        text: item,
                        useRegex: true
                    };
                } else {
                    arr[index] = {
                        text: item.text,
                        useRegex: !item.useRegex
                    };
                }
                immediateSave();
                const newMode = arr[index].useRegex ? '正则' : '关键词';
                showPrompt(`已切换为 ${newMode} 模式`);
                if (key === 'blockedDanmu_Array') {
                    if (s.blockedDanmu_Switch) {
                        danmuPool = [];
                        blockedPool = [];
                        setTimeout(filterDanmu, 200);
                    }
                    runRegexTest();
                }
            }

            function displayText(value, index) {
                if (s.hideBlockedWordsInMenu_Switch) return `词${index + 1}`;
                return typeof value === 'string' ? value : (value && value.text) || '';
            }

            function runRegexTest() {
                const text = regexTestText.value || '';
                const arr = s.blockedDanmu_Array || [];
                const fallbackRegex = s.blockedDanmu_UseRegular;
                const results = [];
                if (!text || arr.length === 0) {
                    regexTestResult.value = results;
                    return;
                }
                for (const item of arr) {
                    const kw = typeof item === 'string' ? item : item.text;
                    const useRe = typeof item === 'string' ? !!fallbackRegex : item.useRegex !== false;
                    if (!kw) continue;
                    if (useRe) {
                        try {
                            const re = new RegExp(kw, 'i');
                            if (re.test(text)) {
                                const m = text.match(re);
                                results.push({
                                    pattern: kw,
                                    valid: true,
                                    useRegex: true,
                                    reason: m ? `匹配到 "${m[0]}"` : '匹配成功'
                                });
                            }
                        } catch (e) {
                            results.push({
                                pattern: kw,
                                valid: false,
                                useRegex: true,
                                reason: e.message
                            });
                        }
                    } else {
                        if (text.includes(kw)) {
                            results.push({
                                pattern: kw,
                                valid: true,
                                useRegex: false,
                                reason: '文本包含该关键词'
                            });
                        }
                    }
                }
                regexTestResult.value = results;
            }

            function captureKey(e, keyName) {
                e.preventDefault();
                e.stopPropagation();
                let key = e.key;
                if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return;
                if (key === ' ') key = 'Space';
                if (key === 'Escape') {
                    e.target.blur();
                    return;
                }
                s[keyName] = key;
                immediateSave();
                showPrompt(`快捷键已设为：${key}`);
                e.target.blur();
            }

            function onDebugToggle() {
                immediateSave();
                showPrompt(s.debugMode ? '⌬ 全功能调试模式已开启（详见控制台）' : '调试模式已关闭');
                if (s.debugMode) {
                    cc('magenta', '=== ⌬ 全功能调试模式已启用 ===');
                    cc('magenta', '当前配置:', JSON.parse(JSON.stringify(toRaw(s))));
                    cc('magenta', 'PauseGuard 状态:', {
                        enabled: PauseGuard.isEnabled(),
                        eligibleVideos: PauseGuard.eligibleCount,
                        realHidden: PauseGuard.realHidden(),
                    });
                    cc('magenta', '定时器:', {
                        timerQuality: !!timerQuality,
                        timerDanmu: !!timerDanmu,
                        timerSkip: !!timerSkip
                    });
                    cc('magenta', '容器选择方式:', detectSelectorMode());
                }
            }

            function onAutoFollowChange(e) {
                const following = e.target.checked;
                if (following) {
                    s.themeMode = 'auto';
                } else {
                    // 关闭跟随时，以当前实际显示的主题作为手动起点
                    s.themeMode = ThemeManager.getTheme();
                }
                immediateSave();
                ThemeManager.setMode(s.themeMode);
                showPrompt(following ? '✓ 已开启自动跟随系统' : '已关闭自动跟随，可手动切换');
            }

            function toggleDarkLight() {
                if (s.themeMode === 'auto') return;
                const next = s.themeMode === 'light' ? 'dark' : 'light';
                s.themeMode = next;
                immediateSave();
                ThemeManager.setMode(next);
                showPrompt(next === 'light' ? '☀ 已切换到浅色' : '🌙 已切换到深色');
            }

            function restartPauseGuardTimers() {
                immediateSave();
                if (PauseGuard && typeof PauseGuard.restartTimers === 'function') {
                    PauseGuard.restartTimers();
                    showPrompt('✓ 防暂停定时器已重启');
                }
            }

            function onNavButtonToggle() {
                immediateSave();
                if (s.enableNavButton) {
                    injectScriptMenuButton();
                    showPrompt('导航栏按钮已启用');
                } else {
                    const btn = document.querySelector('.tab-scriptmenu');
                    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
                    showPrompt('导航栏按钮已移除');
                }
            }

            function clearAllStorage() {
                if (!confirm('⚠ 要清空所有存储吗？（包括联系人缓存、所有设置）\n此操作不可撤销！')) return;
                GM_setValue('DY_Settings', {});
                GM_setValue('dy_contacts_cache', '');
                GM_setValue('dy_user_id', '');
                location.reload();
            }

            function exportConfig() {
                const raw = toRaw(s);
                const payload = {
                    _meta: {
                        version: SCRIPT_VERSION,
                        exportTime: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                    },
                    settings: raw,
                };
                const json = JSON.stringify(payload, null, 2);
                const blob = new Blob([json], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `抖音配置_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showPrompt('✓ 导出成功');
            }

            function importConfig() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json';
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                        const text = await file.text();
                        const parsed = JSON.parse(text);
                        const data = parsed.settings || parsed;
                        for (const key in DEFAULT_SETTINGS) {
                            if (!(key in data)) data[key] = DEFAULT_SETTINGS[key];
                        }
                        ['blockedDanmu_Array', 'skipVideoRegex_Array'].forEach(k => {
                            if (Array.isArray(data[k])) {
                                const fallback = k === 'blockedDanmu_Array' ? data.blockedDanmu_UseRegular : data.skipVideoRegex_UseRegular;
                                data[k] = data[k].map(item => {
                                    if (typeof item === 'string') return {
                                        text: item,
                                        useRegex: !!fallback
                                    };
                                    if (item && typeof item === 'object' && typeof item.text === 'string') return item;
                                    return null;
                                }).filter(Boolean);
                            }
                        });
                        deepCopy(data, s);
                        const raw = toRaw(s);
                        deepCopy(raw, settings);
                        GM_setValue('DY_Settings', settings);
                        PauseGuard.setEnabled(settings.enableKeepAlive !== false);
                        applyPayHide();
                        applyMirror();
                        setupKeepAlive();
                        restartAllTimers();
                        setTimeout(filterDanmu, 200);
                        showPrompt(`✓ 导入成功（来源：${parsed._meta ? parsed._meta.version : '旧版'}），已自动保存`);
                    } catch (err) {
                        showPrompt('✕ 导入失败: ' + err.message);
                    }
                };
                input.click();
            }

            function resetContacts() {
                if (!confirm('确定要重置所有消息缓存吗？（刷新后重新加载）')) return;
                contactMap.clear();
                GM_setValue('dy_contacts_cache', '');
                GM_setValue('dy_user_id', '');
                updateFloatWindow();
                showPrompt('✓ 消息缓存已重置');
            }

            function runSelfCheckFromMenu() {
                showSelfCheckPanel();
            }
            onMounted(() => {
                syncPools();
                if (!danmuSyncTimer) startDanmuPoolSync();
            });
            onUnmounted(() => {
                if (danmuSyncTimer) {
                    clearInterval(danmuSyncTimer);
                    danmuSyncTimer = null;
                }
                if (danmuPoolContainer.value) danmuPoolContainer.value.removeEventListener('wheel', onWheelDanmu);
                if (blockedPoolContainer.value) blockedPoolContainer.value.removeEventListener('wheel', onWheelBlocked);
            });
            refresh();
            return {
                s,
                temp,
                promptText,
                promptOpacity,
                danmuList,
                blockedList,
                blockedPoolExpanded,
                danmuPoolContainer,
                blockedPoolContainer,
                followingDanmu,
                followingBlocked,
                pauseGuardExpanded,
                pauseGuardTimeExpanded,
                advancedExpanded,
                poolsAreaExpanded,
                danmuListExpanded,
                showDanmuBlockedSettings,
                skipVideoExpanded,
                functionalSwitchExpanded,
                showRegexTest,
                regexTestText,
                regexTestResult,
                onDanmuToggle,
                onQualityToggle,
                onPayHideToggle,
                onMirrorToggle,
                onGiftFilterToggle,
                onKeepAliveToggle,
                onImmersivePersistToggle,
                onLockDelayChange,
                onPoolSizeChange,
                onSkipLiveToggle,
                onSkipVideoRegexToggle,
                restartQualityTimer,
                restartDanmuTimer,
                restartSkipTimer,
                restartPauseGuardTimers,
                immediateSave,
                manualRefresh,
                goToLatest,
                locateDanmu,
                syncPools,
                resetDefaults,
                refresh,
                save,
                closeMenu,
                addItem,
                removeItem,
                displayText,
                toggleItemMode,
                exportConfig,
                importConfig,
                scrollIfFollowing,
                applyCustomRate,
                resetContacts,
                runSelfCheckFromMenu,
                runRegexTest,
                captureKey,
                onDebugToggle,
                onNavButtonToggle,
                clearAllStorage,
                lotteryExpanded,
                videoDownloadExpanded,
                onVideoDownloadSettingsChange,
                openCurrentVideoDownload,
                onLotteryToggle,
                onLotteryPanelToggle,
                onAutoFollowChange,
                toggleDarkLight,
            };
        }
    });
    // 通用折叠组件
    menuApp.component('dy-collapse', {
        name: 'DyCollapse',
        props: {
            show: {
                type: Boolean,
                default: false
            }
        },
        template: `
<div class="dy-collapse" :class="{ 'dy-collapse-open': show }">
<div class="dy-collapse-inner"><slot></slot></div>
</div>
`
    });
    // ★ [新增] dy-icon 图标组件
    menuApp.component('dy-icon', {
        name: 'DyIcon',
        props: {
            name: {
                type: String,
                required: true
            },
            size: {
                type: [Number, String],
                default: 14
            },
        },
        computed: {
            inner() {
                return DY_ICON_PATHS[this.name] || '';
            },
        },
        template: `
<svg class="dy-icon" :width="size" :height="size" viewBox="0 0 24 24"
fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round"
aria-hidden="true"><g v-html="inner"></g></svg>
`,
    });
    menuApp.mount('#dyMenuUi');
    makeMenuDraggable();
    // 首次创建 → 播放打开动画
    playMenuOpen(document.getElementById('dyMenuUi'));
    requestAnimationFrame(() => {
        const el = document.getElementById('dyMenuUi');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth) el.style.right = '10px';
        if (rect.left < 0) {
            el.style.left = '10px';
            el.style.right = 'auto';
        }
        if (rect.bottom > window.innerHeight) {
            el.style.maxHeight = Math.max(200, window.innerHeight - rect.top - 10) + 'px';
        }
    });
    startDanmuPoolSync();
    setScriptGearActive(true);
}
GM_registerMenuCommand('脚本面板', createMenu);

function startDanmuPoolSync() {
    if (danmuSyncTimer) {
        clearInterval(danmuSyncTimer);
        danmuSyncTimer = null;
    }
    const intervalMs = Math.max(200, (settings.pollingDanmu || 0.5) * 1000);
    danmuSyncTimer = setInterval(() => {
        const menuEl = document.getElementById('dyMenuUi');
        if (menuApp && menuEl && menuEl.style.display !== 'none') {
            const vm = menuApp._instance;
            if (vm && vm.proxy && vm.proxy.syncPools) {
                vm.proxy.syncPools();
            }
        }
    }, intervalMs);
}
// =========================================================
//               跳过直播 / 正则屏蔽视频（核心）
// =========================================================
const skipVideoHandled = new WeakMap();

function getSkipCurrentFeedItem() {
    const active = document.querySelector(SEL.activeVideo);
    if (active) {
        const card = active.closest(SEL.feedItem);
        if (card) {
            const r = card.getBoundingClientRect();
            if (r.width > 10 && r.height > 10 && r.bottom > 0 && r.top < window.innerHeight) {
                return card;
            }
        }
    }
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    if (!el) return null;
    return el.closest(SEL.feedItem);
}

function getCardFingerprint(card) {
    if (!card) return '';
    const activeVidEl = card.querySelector(SEL.activeVideoId);
    if (activeVidEl) {
        const v = activeVidEl.getAttribute('data-e2e-vid');
        if (v) return v;
    }
    const globalActive = document.querySelector(SEL.activeVideoId);
    if (globalActive && card.contains(globalActive)) {
        const v = globalActive.getAttribute('data-e2e-vid');
        if (v) return v;
    }
    if (settings.preferQuickPlayer !== false) {
        const qp = getQuickPlayerInfo();
        if (qp && qp.awemeId && globalActive && card.contains(globalActive)) {
            return qp.awemeId;
        }
    }
    const video = card.querySelector('video');
    const src = video ? (video.currentSrc || video.src || '') : '';
    if (src) return src;
    return getSkipVideoCardText(card).slice(0, 60);
}

function isSkipLiveCard(card) {
    if (!card) return false;
    const hasLiveAttr = card.querySelector('[data-e2e="feed-live"]');
    const hasLiveSlider = card.querySelector('[data-e2e="live-slider"]');
    const hasLiveLink = card.querySelector('.LiveLinkA');
    if (!hasLiveAttr && !hasLiveSlider && !hasLiveLink) return false;
    const text = card.innerText || '';
    return text.includes('直播中') || text.includes('正在直播');
}

function quickCheckCard(card) {
    if (!card) return;
    if (!settings.skipLive_Switch && !settings.skipVideoRegex_Switch) return;
    if (activeSwitchWatcher) return;
    const cardRect = card.getBoundingClientRect();
    if (cardRect.width < 10 || cardRect.height < 10) return;
    if (cardRect.bottom <= 0 || cardRect.top >= window.innerHeight) return;
    const fp = getCardFingerprint(card);
    const now = Date.now();
    const prev = skipVideoHandled.get(card);
    const cooldown = Math.max(500, settings.skipVideoCooldown || 3000);
    if (prev && prev.fp === fp && now - prev.time < cooldown) return;
    let reason = null;
    if (settings.skipLive_Switch && isSkipLiveCard(card)) {
        reason = '⊘ 已跳过直播';
    } else if (settings.skipVideoRegex_Switch && !isSkipLiveCard(card) && isVideoBlockedByRegex(card)) {
        const matched = getMatchedVideoRule(card);
        reason = matched ? `⊘ 规则命中：${matched}` : '⊘ 已屏蔽';
    }
    if (!reason) return;
    log('⊘ 命中：', reason);
    skipVideoHandled.set(card, {
        fp,
        time: now
    });
    skipCurrentCard(card, reason);
}

function hookAllVideos() {
    document.querySelectorAll('video').forEach(v => {
        if (v._dyHooked) return;
        v._dyHooked = true;
        const onPlay = () => {
            if (v.paused) return;
            const r = v.getBoundingClientRect();
            if (r.width < 10 || r.height < 10) return;
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            if (Math.abs(cx - window.innerWidth / 2) > window.innerWidth * 0.4) return;
            if (Math.abs(cy - window.innerHeight / 2) > window.innerHeight * 0.4) return;
            const card = v.closest(SEL.feedItem);
            if (!card) return;
            try {
                quickCheckCard(card);
            } catch (e) {}
        };
        v.addEventListener('play', onPlay, true);
        v.addEventListener('loadedmetadata', onPlay, true);
    });
}

function getSkipVideoCardText(card) {
    if (!card) return '';
    const globalActive = document.querySelector(SEL.activeVideo);
    const isActive = globalActive && card.contains(globalActive);
    if (isActive && settings.preferQuickPlayer !== false) {
        const qp = getQuickPlayerInfo();
        if (qp && (qp.desc || qp.author)) {
            return [qp.desc, qp.author].filter(Boolean).join('\n');
        }
    }
    const parts = [];
    const desc = card.querySelector(SEL.videoDesc);
    if (desc) parts.push(desc.innerText || desc.textContent || '');
    const nickname = card.querySelector(SEL.nickname);
    if (nickname) parts.push(nickname.innerText || nickname.textContent || '');
    const info = card.querySelector(SEL.videoInfo);
    if (info) parts.push(info.innerText || info.textContent || '');
    return parts.join('\n').trim();
}

function isVideoBlockedByRegex(card) {
    if (!settings.skipVideoRegex_Switch) return false;
    const arr = settings.skipVideoRegex_Array || [];
    if (arr.length === 0) return false;
    const text = getSkipVideoCardText(card);
    if (!text) return false;
    const fallbackRegex = settings.skipVideoRegex_UseRegular !== false;
    for (const item of arr) {
        if (ruleTestItem(item, text, fallbackRegex)) return true;
    }
    return false;
}

function getMatchedVideoRule(card) {
    if (!settings.skipVideoRegex_Switch) return null;
    const arr = settings.skipVideoRegex_Array || [];
    if (arr.length === 0) return null;
    const text = getSkipVideoCardText(card);
    if (!text) return null;
    const fallbackRegex = settings.skipVideoRegex_UseRegular !== false;
    for (const item of arr) {
        if (ruleTestItem(item, text, fallbackRegex)) return ruleGetText(item);
    }
    return null;
}

function getCurrentVideoRect() {
    const vids = document.querySelectorAll('video');
    let best = null,
        bestArea = 0;
    for (const v of vids) {
        try {
            const r = v.getBoundingClientRect();
            const visW = Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(r.left, 0));
            const visH = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
            const a = visW * visH;
            if (a > bestArea) {
                bestArea = a;
                best = r;
            }
        } catch (e) {}
    }
    return best;
}
let activeSkipMask = null;
let activeSwitchWatcher = null;
let skipBlockedVideos = new WeakSet();

function blockVideoPlayback(v) {
    try {
        skipBlockedVideos.add(v);
        v.pause();
        if (!v._dyBlockHandler) {
            v._dyBlockHandler = function() {
                if (skipBlockedVideos.has(v)) {
                    try {
                        v.pause();
                    } catch (e) {}
                }
            };
            v.addEventListener('play', v._dyBlockHandler);
        }
    } catch (e) {}
}

function unblockAllVideos() {
    skipBlockedVideos = new WeakSet();
}

function showSkipMask(reason) {
    if (activeSkipMask && activeSkipMask.parentNode) {
        if (activeSkipMask._followTimer) clearInterval(activeSkipMask._followTimer);
        activeSkipMask.remove();
    }
    const mask = document.createElement('div');
    mask.className = 'dy-skip-mask';
    mask.style.cssText = `
position: fixed;
z-index: 2147483000;
pointer-events: none;
backdrop-filter: blur(22px) saturate(0.6);
-webkit-backdrop-filter: blur(22px) saturate(0.6);
background: rgba(0,0,0,0.42);
display: flex;
align-items: center;
justify-content: center;
color: #fff;
font-size: 22px;
font-weight: 600;
letter-spacing: 4px;
font-family: 'PingFang SC','Microsoft YaHei',sans-serif;
text-shadow: 0 2px 16px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9);
opacity: 1;
transition: opacity 220ms ease;
`;
    mask.textContent = reason || '⊘ 已屏蔽';
    const r0 = getCurrentVideoRect();
    if (r0) {
        mask.style.left = r0.left + 'px';
        mask.style.top = r0.top + 'px';
        mask.style.width = r0.width + 'px';
        mask.style.height = r0.height + 'px';
    }
    document.body.appendChild(mask);
    void mask.offsetHeight;
    mask._followTimer = setInterval(() => {
        if (activeSkipMask !== mask) {
            clearInterval(mask._followTimer);
            return;
        }
        const rr = getCurrentVideoRect();
        if (rr) {
            mask.style.left = rr.left + 'px';
            mask.style.top = rr.top + 'px';
            mask.style.width = rr.width + 'px';
            mask.style.height = rr.height + 'px';
        }
    }, 30);
    activeSkipMask = mask;
    return mask;
}

function fadeOutAndRemoveMask() {
    if (!activeSkipMask) return;
    const m = activeSkipMask;
    activeSkipMask = null;
    if (m._followTimer) clearInterval(m._followTimer);
    m.style.opacity = '0';
    setTimeout(() => {
        if (m.parentNode) m.remove();
    }, 240);
}

function startSkipWatch(initialCard) {
    if (activeSwitchWatcher) {
        activeSwitchWatcher();
        activeSwitchWatcher = null;
    }
    let lastCard = initialCard;
    let lastFp = getCardFingerprint(initialCard);
    const start = Date.now();
    let waitingNormal = false;
    let lastRetryAt = Date.now();
    const retryInterval = Math.max(500, settings.skipVideoRetryInterval || 1500);
    const retryTimeout = Math.max(2000, settings.skipVideoRetryTimeout || 8000);
    const timer = setInterval(() => {
        const now = Date.now();
        const card = getSkipCurrentFeedItem();
        if (!card) {
            if (now - start > 10000) {
                clearInterval(timer);
                activeSwitchWatcher = null;
                unblockAllVideos();
                fadeOutAndRemoveMask();
            }
            return;
        }
        const fp = getCardFingerprint(card);
        const cardChanged = (card !== lastCard) || (fp !== lastFp);
        if (cardChanged) {
            lastCard = card;
            lastFp = fp;
            lastRetryAt = now;
            const isLive = settings.skipLive_Switch && isSkipLiveCard(card);
            const isBlocked = settings.skipVideoRegex_Switch && !isSkipLiveCard(card) && isVideoBlockedByRegex(card);
            if (isLive || isBlocked) {
                const reason = isLive ? '⊘ 已跳过直播' :
                    `⊘ 规则命中：${getMatchedVideoRule(card) || ''}`;
                card.querySelectorAll('video').forEach(blockVideoPlayback);
                document.querySelectorAll('video').forEach(v => {
                    try {
                        if (!v.paused) blockVideoPlayback(v);
                    } catch (e) {}
                });
                if (activeSkipMask && activeSkipMask.parentNode) {
                    activeSkipMask.textContent = reason;
                }
                skipVideoHandled.set(card, {
                    fp,
                    time: now
                });
                goToNextFeed();
                return;
            } else {
                unblockAllVideos();
                waitingNormal = true;
                return;
            }
        }
        if (waitingNormal) {
            const v = card.querySelector('video');
            if (v && !v.paused && v.readyState >= 2) {
                clearInterval(timer);
                activeSwitchWatcher = null;
                fadeOutAndRemoveMask();
                return;
            }
        } else {
            if (now - lastRetryAt > retryInterval && now - start < retryTimeout) {
                lastRetryAt = now;
                dlog('跳过', '切换未生效，重试');
                goToNextFeed();
            }
        }
        if (now - start > 10000) {
            clearInterval(timer);
            activeSwitchWatcher = null;
            unblockAllVideos();
            fadeOutAndRemoveMask();
        }
    }, 40);
    activeSwitchWatcher = () => {
        clearInterval(timer);
    };
}

function skipCurrentCard(card, reason) {
    if (!card) return;
    Monitor.emit('skip', (reason || '已屏蔽') + ' · 正在切换下一条', 'ok');
    card.querySelectorAll('video').forEach(blockVideoPlayback);
    document.querySelectorAll('video').forEach(v => {
        try {
            if (!v.paused) blockVideoPlayback(v);
        } catch (e) {}
    });
    if (activeSkipMask && activeSkipMask.parentNode) {
        activeSkipMask.textContent = reason;
    } else {
        showSkipMask(reason);
    }
    goToNextFeed();
    startSkipWatch(card);
}

function dispatchKeyboardNext() {
    dlog('跳过', '模拟 ArrowDown');
    const ev = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true,
    });
    [document, document.body, document.activeElement].forEach(el => {
        if (el && el.dispatchEvent) {
            try {
                el.dispatchEvent(ev);
            } catch (e) {}
        }
    });
}

function goToNextFeed() {
    const prevCard = getSkipCurrentFeedItem();
    let nextBtn = document.querySelector(SEL.nextArrow + ':not(.disabled)');
    if (!nextBtn) {
        nextBtn = document.querySelector('.xgplayer-playswitch-next:not(.disabled)');
    }
    if (!nextBtn) {
        nextBtn = document.querySelector(SEL.nextArrow);
    }
    if (nextBtn) {
        dlog('跳过', '点击下一个按钮');
        try {
            nextBtn.click();
            ['mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(type => {
                try {
                    nextBtn.dispatchEvent(new MouseEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                } catch (e) {}
            });
        } catch (e) {}
        const fallbackDelay = Math.max(100, settings.skipVideoBtnFallbackDelay || 300);
        setTimeout(() => {
            if (getSkipCurrentFeedItem() === prevCard) {
                dlog('跳过', '按钮点击无效，改用键盘');
                dispatchKeyboardNext();
            }
        }, fallbackDelay);
        return;
    }
    dispatchKeyboardNext();
}

function checkSkipFeed() {
    if (!settings.skipLive_Switch && !settings.skipVideoRegex_Switch) return;
    if (activeSwitchWatcher) return;
    const card = getSkipCurrentFeedItem();
    if (!card) return;
    const fp = getCardFingerprint(card);
    const now = Date.now();
    const prev = skipVideoHandled.get(card);
    const cooldown = Math.max(500, settings.skipVideoCooldown || 3000);
    if (prev && prev.fp === fp && now - prev.time < cooldown) return;
    if (settings.skipLive_Switch && isSkipLiveCard(card)) {
        log('⊘ 跳过直播卡片');
        dlog('跳过', '检测到直播卡片');
        skipVideoHandled.set(card, {
            fp,
            time: now
        });
        skipCurrentCard(card, '⊘ 已跳过直播');
        return;
    }
    if (settings.skipVideoRegex_Switch && !isSkipLiveCard(card) && isVideoBlockedByRegex(card)) {
        const matched = getMatchedVideoRule(card);
        log('⊘ 规则命中，跳过视频：', matched || '');
        dlog('跳过', '规则命中');
        skipVideoHandled.set(card, {
            fp,
            time: now
        });
        skipCurrentCard(card, matched ? `⊘ 规则命中：${matched}` : '⊘ 已屏蔽');
        return;
    }
}
// =========================================================
//                         核心功能
// =========================================================
function hideNonVideoElements() {
    if (!settings.hideNonVideoElements_Switch) return;
    const selectors = ['.ad-container', '[data-e2e="ad-card"]', '.ad-feed', '.promotion-card', '.recommend-ad', '.live-recommend', '.game-recommend'];
    for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => {
            if (!el.classList.contains('dy-hidden')) {
                el.classList.add('dy-hidden');
                el.style.display = 'none';
            }
        });
    }
}
// =========================================================
//              [新增] 画质切换工具函数
// =========================================================
// 文本归一化：去空格 + 转小写，用于宽松比对
function normQualityText(t) {
    return String(t == null ? '' : t).replace(/\s+/g, '').toLowerCase();
}
// 画质评分：数字分辨率优先，档位关键词兜底
// 注意：分数只用于"同一播放器内"的比较，跨播放器无意义
function scoreQualityText(text) {
    const t = String(text || '');
    if (!t || t.includes('登录即享')) return -1;
    let score = 0;
    const nums = t.match(/\d+/g);
    if (nums) score = parseInt(nums.join(''), 10) || 0;
    // 关键词分级（数值越大越优先）
    if (t.includes('4K')) return Math.max(score, 4000);
    if (t.includes('2K')) return Math.max(score, 2000);
    if (t.includes('原画')) return 3200; // 原画通常等于最高源
    if (t.includes('蓝光')) return 3000;
    if (t.includes('1080')) return Math.max(score, 1080);
    if (t.includes('超清')) return 2000;
    if (t.includes('高清')) return 1000;
    if (t.includes('720')) return Math.max(score, 720);
    if (t.includes('标清')) return 500;
    if (t.includes('流畅')) return 400;
    return score;
}
// ★ [新增] 从画质文本解析期望的视频高度
//   用于校验「UI 已选最高画质，但视频流仍是低画质」这种阴间情况
function parseExpectedResolution(text) {
    const t = String(text || '');
    if (/4k|2160|uhd/i.test(t)) return 2160;
    if (/2k|1440|qhd/i.test(t)) return 1440;
    if (/1080|蓝光|超清|full\s*hd/i.test(t)) return 1080;
    if (/720|高清|hd/i.test(t)) return 720;
    if (/480|标清|sd/i.test(t)) return 480;
    if (/360|流畅|low/i.test(t)) return 360;
    return 0; // 原画 / 未知档位 → 无法判定，跳过校验
}
// ★ [新增] 校验视频流是否真的达到了「最佳画质」应有的分辨率
//   返回 true  = 已生效 / 无法判定（放行）
//   返回 false = UI 骗人，视频流仍是低画质（要强制重选）
function isQualityActuallyApplied(player, bestText) {
    if (!player) return true;
    const video = player.querySelector('video');
    if (!video) return true;
    if (video.readyState < 2) return true; // 还没开始加载，等下一轮
    const vh = video.videoHeight;
    if (!vh) return true;
    const expectedH = parseExpectedResolution(bestText);
    if (!expectedH) return true; // 原画/未知画质 → 不做校验
    // 容差 30%：抖音 4K 档位实际可能给 1440p 甚至更低，给足余地
    return vh >= expectedH * 0.7;
}
// 获取当前正在播放视频的播放器容器
// 三层兜底：显式标记 → 唯一正在播放 → 可见面积最大
function getActivePlayer() {
    // 1) 显式标记（抖音自己打的 active 标记，最可靠）
    const explicit = document.querySelector(SEL.activePlayer);
    if (explicit) return explicit;
    // 2) 页面上只有一个在播放的播放器
    const all = Array.from(document.querySelectorAll(SEL.anyPlayer));
    const playing = all.filter(p => {
        const v = p.querySelector('video');
        return v && !v.paused && v.readyState >= 2;
    });
    if (playing.length === 1) return playing[0];
    if (playing.length > 1) {
        // 多个在播放 → 取离视窗中心最近的
        let best = null,
            bestDist = Infinity;
        for (const p of playing) {
            const r = p.getBoundingClientRect();
            const d = Math.hypot(
                r.left + r.width / 2 - window.innerWidth / 2,
                r.top + r.height / 2 - window.innerHeight / 2
            );
            if (d < bestDist) {
                bestDist = d;
                best = p;
            }
        }
        return best;
    }
    // 3) 可见面积最大（最末兜底）
    let best = null,
        bestArea = 0;
    for (const p of all) {
        const r = p.getBoundingClientRect();
        const w = Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(r.left, 0));
        const h = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
        const area = w * h;
        if (area > bestArea) {
            bestArea = area;
            best = p;
        }
    }
    return best;
}
// 获取播放器身份 key（用于去重）：视频 ID 优先，video.src 兜底
function getPlayerQualityKey(player) {
    if (!player) return '';
    const card = player.closest(
        '[data-e2e="feed-active-video"], [data-e2e="feed-item"]'
    );
    if (card) {
        const v = card.getAttribute('data-e2e-vid') ||
            card.querySelector('[data-e2e-vid]')
            ?.getAttribute('data-e2e-vid');
        if (v) return 'v:' + v;
    }
    const src = player.querySelector('video')?.currentSrc ||
        player.querySelector('video')?.src ||
        '';
    if (src) return 's:' + src.slice(0, 120);
    // 直播兜底：URL + 播放器顶层 class 哈希
    return 'l:' + location.pathname + '|' + (player.className || '').slice(0, 40);
}
// 获取播放器当前选中的清晰度项（DOM 级别，最可靠）
function getCurrentQualityItem(player) {
    if (!player) return null;
    return player.querySelector(SEL.claritySelected);
}
// ★ [新增] 强制重选追踪器：防止「平台给不到目标分辨率」时无限点击
const _forceReselectTracker = new Map(); // playerKey -> { tries, lastHeight }
const MAX_FORCE_RESELECT = () => {
    const v = Number(settings.qualityForceMaxRetries);
    return Number.isFinite(v) ? Math.max(1, Math.min(10, v)) : 3;
};

function _recordForceAttempt(playerKey, currentHeight) {
    let st = _forceReselectTracker.get(playerKey);
    if (!st) {
        st = {
            tries: 0,
            lastHeight: 0
        };
        _forceReselectTracker.set(playerKey, st);
        // 内存保护：Map 太大时踢掉最老的键
        if (_forceReselectTracker.size > 50) {
            const firstKey = _forceReselectTracker.keys().next().value;
            _forceReselectTracker.delete(firstKey);
        }
    }
    // 分辨率有实质提升（>10%）→ 说明点击有效，只是慢，重置计数
    if (currentHeight > st.lastHeight * 1.1) {
        st.tries = 1;
    } else {
        st.tries++;
    }
    st.lastHeight = Math.max(st.lastHeight, currentHeight);
    return st.tries;
}

function _clearForceTracker(playerKey) {
    if (playerKey) _forceReselectTracker.delete(playerKey);
}
// =========================================================
//              [新增] 画质切换去重状态
// =========================================================
let _lastQualityClick = {
    key: '',
    at: 0
};

function _qualityDedupeMs() {
    const v = Number(settings.qualityClickDedupe);
    return Number.isFinite(v) && v >= 500 ? v : 2500;
}
// =========================================================
//                       抖音优化功能
// =========================================================
let interactionLock = 0;
let _lastInteraction = {
    at: 0,
    timeStr: '',
    type: '',
    target: ''
};

function setupInteractionLock() {
    const record = (type, targetStr) => {
        const delayMs = Math.max(500, (settings.interactionLockDelay || 3) * 1000);
        interactionLock = Date.now() + delayMs;
        _lastInteraction = {
            at: Date.now(),
            timeStr: new Date().toLocaleTimeString('zh-CN'),
            type,
            target: targetStr,
        };
    };
    document.addEventListener('click', (e) => {
        const t = e.target;
        let desc = '?';
        if (t && t.tagName) {
            desc = t.tagName.toLowerCase();
            if (t.id) desc += '#' + t.id;
            if (t.className && typeof t.className === 'string') {
                const first = t.className.trim().split(/\s+/)[0];
                if (first) desc += '.' + first;
            }
            if (t.textContent) {
                const txt = t.textContent.trim().slice(0, 20);
                if (txt) desc += ' "' + txt + '"';
            }
        }
        record('click', desc.slice(0, 80));
    }, true);
    document.addEventListener('keydown', (e) => {
        record('keydown', String(e.key || '?').slice(0, 20));
    }, true);
}

function switchToHighestQuality() {
    if (!settings.enableQualitySwitch) return;
    if (Date.now() < interactionLock) return;
    // 用户在输入框里打字时不动
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' ||
            ae.getAttribute('contenteditable') === 'true')) return;
    const isLive = location.href.includes('live.douyin.com/');
    if (isLive) {
        switchLiveQuality();
    } else {
        switchFeedQuality();
    }
}
// ---------- 推荐流 / 视频页 ----------
function switchFeedQuality() {
    const player = getActivePlayer();
    if (!player) {
        Monitor.emitThrottled('q-noplayer', 'quality', '未找到活跃播放器（等待中）', 8000, 'warn');
        return;
    }
    const btn = player.querySelector('.xgplayer-playclarity-setting .btn');
    if (!btn) {
        Monitor.emitThrottled('q-nobtn', 'quality', '未找到画质按钮（面板可能未展开）', 8000, 'warn');
        return;
    }
    const options = player.querySelectorAll(SEL.clarityOptions);
    if (options.length === 0) {
        Monitor.emitThrottled('q-noopt', 'quality', '未找到画质选项', 8000, 'warn');
        return;
    }
    // 挑出评分最高的选项
    let bestItem = null,
        bestScore = -1,
        bestText = '';
    options.forEach(el => {
        const text = el.textContent.trim();
        const score = scoreQualityText(text);
        if (score < 0) return;
        if (score > bestScore) {
            bestScore = score;
            bestItem = el;
            bestText = text;
        }
    });
    if (!bestItem) return;
    const currentItem = getCurrentQualityItem(player);
    const currentText = (currentItem ? currentItem.textContent : btn.textContent).trim();
    const isAlreadyBest = (currentItem && currentItem === bestItem) ||
        (normQualityText(currentText) === normQualityText(bestText));
    const playerKey = getPlayerQualityKey(player);
    const dedupeKey = playerKey + '|' + normQualityText(bestText);
    const now = Date.now();
    // ============ 情况 A：UI 已显示是最高画质 ============
    if (isAlreadyBest) {
        // ★ 关键：不看 UI，看视频流真实分辨率
        if (isQualityActuallyApplied(player, bestText)) {
            Monitor.emitThrottled('q-ok', 'quality', '✓ 已是最高画质：' + bestText, 8000, 'ok');
            _clearForceTracker(playerKey); // 成功了，清掉计数
            return;
        }
        // ★ 重试上限保护：超过 N 次还是拉不到，就认命，不再点
        const tracker = _forceReselectTracker.get(playerKey);
        if (tracker && tracker.tries >= MAX_FORCE_RESELECT()) {
            const vh = (player.querySelector('video') || {}).videoHeight || 0;
            Monitor.emitThrottled('q-giveup-' + playerKey, 'quality',
                '⚠ ' + bestText + ' 已选，但视频流仅 ' + vh + 'p（尝试 ' + tracker.tries + ' 次），可能平台限制，停止重试',
                30000, 'warn');
            return;
        }
        // 缓冲窗口，等视频流切换（可调，默认 8000ms）
        const waitMs = Math.max(3000, Number(settings.qualityForceWait) || 8000);
        if (_lastQualityClick.key === dedupeKey && now - _lastQualityClick.at < waitMs) {
            Monitor.emitThrottled('q-reassert-wait', 'quality',
                '↻ 已选 ' + bestText + '，等待视频流切换生效…', 5000, 'warn');
            return;
        }
        const vh = (player.querySelector('video') || {}).videoHeight || 0;
        const tries = _recordForceAttempt(playerKey, vh);
        _lastQualityClick = {
            key: dedupeKey,
            at: now
        };
        Monitor.emit('quality',
            '⚠ UI 已选 ' + bestText + '（当前 ' + vh + 'p）→ 强制重选第 ' + tries + '/' + MAX_FORCE_RESELECT() + ' 次',
            'warn');
        cc('yellow', '◎ 强制重选画质:', bestText, '(视频流 ' + vh + 'p, 第 ' + tries + ' 次)');
        dlog('画质', '强制重选', bestText, '当前 videoHeight=' + vh, '尝试 #' + tries);
        bestItem.click();
        return;
    }
    // ============ 情况 B：当前不是最高画质 → 正常点击切换 ============
    if (_lastQualityClick.key === dedupeKey &&
        now - _lastQualityClick.at < _qualityDedupeMs()) {
        Monitor.emitThrottled('q-dedupe', 'quality', '↻ 去重窗口内：' + bestText, 3000, 'warn');
        return;
    }
    _lastQualityClick = {
        key: dedupeKey,
        at: now
    };
    Monitor.emit('quality', '切换 ' + (currentText || '?') + ' → ' + bestText, 'ok');
    cc('white', '◎ 切换画质:', currentText || '?', '→', bestText);
    dlog('画质', '视频页切换', currentText, '→', bestText);
    bestItem.click();
}
// ---------- 直播页 ----------
function switchLiveQuality() {
    // 直播页一般只有一个主播放器，但仍做作用域限定，避免残留元素串味
    const player = document.querySelector(SEL.anyPlayer);
    const scope = player || document;
    const btn = scope.querySelector(SEL.liveQualityBtn) ||
        document.querySelector(SEL.liveQualityBtn);
    if (!btn) return;
    const currentText = btn.textContent.trim();
    const box = scope.querySelector(SEL.liveQualityBox) ||
        document.querySelector(SEL.liveQualityBox);
    // 面板未展开 → 展开（不要在这里 return，因为展开后会轮到下一轮处理）
    if (!box) {
        const openKey = 'live|open|' + normQualityText(currentText);
        const now = Date.now();
        if (_lastQualityClick.key === openKey &&
            now - _lastQualityClick.at < _qualityDedupeMs()) return;
        _lastQualityClick = {
            key: openKey,
            at: now
        };
        btn.click();
        return;
    }
    const options = box.querySelectorAll('.tmNdnn5Q, [class*="tmNdnn5Q"]');
    if (options.length === 0) return;
    // 1) 挑最高
    let bestItem = null,
        bestScore = -1,
        bestText = '';
    options.forEach(el => {
        let textEl = el.querySelector('.KJ5LucVT') ||
            el.querySelector('div') ||
            el;
        const text = textEl.textContent.trim();
        const score = scoreQualityText(text);
        if (score < 0) return;
        if (score > bestScore) {
            bestScore = score;
            bestItem = el;
            bestText = text;
        }
    });
    if (!bestItem) return;
    // 2) 判断是否已经最高（文本归一化）
    if (normQualityText(currentText) === normQualityText(bestText)) return;
    // 3) 去重
    const key = 'live|' + location.pathname + '|' + normQualityText(bestText);
    const now = Date.now();
    if (_lastQualityClick.key === key &&
        now - _lastQualityClick.at < _qualityDedupeMs()) return;
    _lastQualityClick = {
        key,
        at: now
    };
    const clickTarget = bestItem.querySelector('.siW34Cq4') || bestItem;
    Monitor.emit('quality', '（直播）切换 ' + currentText + ' → ' + bestText, 'ok');
    cc('white', '◎ 切换画质（直播）:', currentText, '→', bestText);
    dlog('画质', '直播页切换', currentText, '→', bestText);
    clickTarget.click();
}

function filterGiftMessages() {
    if (!settings.enableGiftFilter) return;
    const items = document.querySelectorAll('.webcast-chatroom___item.webcast-chatroom___item_new:not([dy-filtered])');
    for (const el of items) {
        el.setAttribute('dy-filtered', '1');
        const giftWrapper = el.querySelector('.jViERTHR');
        if (giftWrapper) {
            const text = giftWrapper.textContent;
            if (text.includes('送出了')) {
                el.style.display = 'none';
                log('过滤礼物消息:', text.trim().slice(0, 30));
                continue;
            }
        }
        const fullText = el.textContent;
        const keywords = ['送出', '送给', '为主播加了', '赠送', '打赏', '礼物', '红包', '福袋'];
        if (keywords.some(k => fullText.includes(k))) {
            el.style.display = 'none';
            log('过滤礼物消息(关键词):', fullText.trim().slice(0, 30));
        }
    }
}
let payHideStyle = null;

function applyPayHide() {
    if (settings.enablePayHide) {
        if (!payHideStyle) {
            payHideStyle = document.createElement('style');
            payHideStyle.textContent = `
#BottomLayout,
.gift-panel,
.pay-panel,
[data-e2e="gift-panel"],
[data-e2e="pay-panel"],
[data-e2e="gift-bar"]
{ display: none !important; }
`;
            document.head.appendChild(payHideStyle);
        }
    } else {
        if (payHideStyle) {
            payHideStyle.remove();
            payHideStyle = null;
        }
    }
    if (menuApp && menuApp._instance && menuApp._instance.proxy) {
        const proxy = menuApp._instance.proxy;
        if (proxy.s) {
            proxy.s.enablePayHide = settings.enablePayHide;
        }
    }
}

function togglePayHide() {
    settings.enablePayHide = !settings.enablePayHide;
    GM_setValue('DY_Settings', settings);
    applyPayHide();
    cc('blue', '▸ 礼物面板:', settings.enablePayHide ? '隐藏' : '显示');
}
let mirrorStyle = null;

function applyMirror() {
    if (settings.enableMirror) {
        if (!mirrorStyle) {
            mirrorStyle = document.createElement('style');
            mirrorStyle.textContent = `video { transform: rotateY(180deg) !important; }`;
            document.head.appendChild(mirrorStyle);
        }
    } else {
        if (mirrorStyle) {
            mirrorStyle.remove();
            mirrorStyle = null;
        }
    }
    if (menuApp && menuApp._instance && menuApp._instance.proxy) {
        const proxy = menuApp._instance.proxy;
        if (proxy.s) {
            proxy.s.enableMirror = settings.enableMirror;
        }
    }
}

function toggleMirror() {
    settings.enableMirror = !settings.enableMirror;
    GM_setValue('DY_Settings', settings);
    applyMirror();
    cc('blue', '▸ 镜像:', settings.enableMirror ? '开启' : '关闭');
}

function toggleGiftFilter() {
    settings.enableGiftFilter = !settings.enableGiftFilter;
    GM_setValue('DY_Settings', settings);
    if (menuApp && menuApp._instance && menuApp._instance.proxy) {
        const proxy = menuApp._instance.proxy;
        if (proxy.s) {
            proxy.s.enableGiftFilter = settings.enableGiftFilter;
        }
    }
    const items = document.querySelectorAll('.webcast-chatroom___item.webcast-chatroom___item_new');
    for (const el of items) {
        el.style.display = '';
        el.removeAttribute('dy-filtered');
    }
    if (settings.enableGiftFilter) filterGiftMessages();
    cc('blue', '▸ 礼物消息过滤:', settings.enableGiftFilter ? '开启' : '关闭');
}
// =========================================================
//         福袋自动抢（整合自 175cc 参考脚本 · 重构版）
// =========================================================
const LotteryModule = (function() {
    const LSEL = {
        dialogContainer: "#lottery_close_cotainer, [id*='lottery_close']",
        closeBtn: ".hJ3SHYaQ, #lottery_close_cotainer [class*='close'], [id*='lottery_close'] .hJ3SHYaQ",
        joinBtn: ".QOARtY3v.VA93rNkB.WrS6ZBHo, [class*='QOARtY3v'][class*='WrS6ZBHo']",
        alreadyJoinedBtn: ".UU67CvI1",
        timer: ".VWPnhGkt, .qR53KhLu, .ycjwPFJI",
        resultDialog: ".HHkLyvba.lotteryDialog, [class*='lotteryDialog'], .lotteryDialog",
        resultText: ".EJpzW6yC, [class*='EJpzW6yC']",
        resultBtn: ".QOARtY3v.VA93rNkB.U8EWGi24, [class*='lotteryDialog'] .QOARtY3v",
        icon: ".LMUtLyr9, .dVxrjT_h",
        reqItem: ".aMOCkQGL, [class*='aMOCkQGL']",
        statusItem: ".q6Dj7eFU, [class*='q6Dj7eFU']",
        joinedCount: ".T6zCkci7, [class*='T6zCkci7']",
    };
    let isEnabled = false;
    let isProcessing = false;
    let loopTimer = null;
    let countdownTimer = null;
    let abandonTimeoutTimer = null;
    let hasJoinedThisRound = false;
    let currentActionState = "NONE";
    let cachedRemainingSeconds = 999;
    let lastRoundResult = null;
    let currentLotteryCount = null;
    let lastParticipantCount = null;
    let participantCountFetched = false;
    let panelEl = null;
    let routeWatcherTimer = null;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const $ = (sel) => {
        const el = document.querySelector(sel);
        return el && el.offsetParent !== null ? el : null;
    };
    const $byText = (tag, text, exact = true) =>
        Array.from(document.querySelectorAll(tag)).find((el) => {
            const t = el.textContent.trim();
            return exact ? t === text : t.includes(text);
        });
    const idleMs = () => Math.max(10000, (settings.lotteryPollingIdle || 60) * 1000);
    const activeMs = () => Math.max(500, (settings.lotteryPollingActive || 1) * 1000);

    function updateStatus(msg) {
        document.querySelectorAll('[data-dy-lottery-status]').forEach(el => el.textContent = msg);
    }

    function updateCountDisplay() {
        const txt = Number.isInteger(currentLotteryCount) && currentLotteryCount >= 0 ?
            `（${currentLotteryCount}个）` : '（未知）';
        document.querySelectorAll('[data-dy-lottery-count]').forEach(el => el.textContent = txt);
    }

    function updateParticipantDisplay() {
        document.querySelectorAll('[data-dy-lottery-participant]').forEach(el => {
            if (lastParticipantCount == null) {
                el.textContent = '';
                el.title = '';
            } else {
                el.textContent = `${lastParticipantCount} 人已参与`;
                el.title = `本轮参与人数：${lastParticipantCount}人`;
            }
        });
    }

    function updateConditionsDisplay(info) {
        document.querySelectorAll('[data-dy-lottery-cond]').forEach(el => {
            if (!info || !info.hasConditions) {
                el.textContent = '';
                el.title = '';
                return;
            }
            el.title = info.formattedText;
            if (info.isSingle) {
                el.style.whiteSpace = 'nowrap';
                el.textContent = info.formattedText;
            } else {
                el.style.whiteSpace = 'pre-line';
                el.textContent = info.conditions.map(c => `• ${c.requirement} [${c.status}]`).join('\n');
            }
        });
    }

    function updateLastRoundDisplay() {
        document.querySelectorAll('[data-dy-lottery-last]').forEach(el => {
            if (!lastRoundResult) {
                el.textContent = '';
                el.title = '';
                return;
            }
            el.title = `上轮详情：${lastRoundResult.text}`;
            const icon = lastRoundResult.status === '中奖' ? '★' : '○';
            el.textContent = `${icon} 上轮：${lastRoundResult.status}`;
        });
    }

    function dispatchFullEvents(el) {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const opts = {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
        };
        try {
            el.dispatchEvent(new PointerEvent('pointerdown', opts));
        } catch (e) {}
        el.dispatchEvent(new MouseEvent('mousedown', opts));
        try {
            el.dispatchEvent(new PointerEvent('pointerup', opts));
        } catch (e) {}
        el.dispatchEvent(new MouseEvent('mouseup', opts));
        el.click();
    }

    function parseRemainingSeconds(str) {
        if (!str) return 999;
        const parts = str.trim().split(':').map(p => parseInt(p, 10));
        if (parts.some(isNaN)) return 999;
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 1) return parts[0];
        return 999;
    }

    function closeLotteryDialog() {
        const btn = $(LSEL.closeBtn);
        if (btn) {
            dispatchFullEvents(btn);
            dlog('福袋', '已关闭福袋弹窗');
            return true;
        }
        return false;
    }

    function getLotteryCount(container) {
        if (!container) return null;
        const countEl = container.querySelector('.Y76xf_k0, [class*="Y76xf_k0"], .T6zCkci7, [class*="T6zCkci7"]');
        if (!countEl) return null;
        const text = countEl.textContent.trim();
        const m = text.match(/(?:共|有)?\s*(\d+)\s*个福袋/);
        if (m) return Number(m[1]);
        const num = text.match(/\d+/);
        if (num) return Number(num[0]);
        const cn = text.match(/[一二两三四五六七八九十]+/);
        if (!cn) return null;
        const map = {
            一: 1,
            二: 2,
            两: 2,
            三: 3,
            四: 4,
            五: 5,
            六: 6,
            七: 7,
            八: 8,
            九: 9,
            十: 10
        };
        return map[cn[0]] || null;
    }
    async function fetchParticipantCount() {
        participantCountFetched = true;
        const icon = $(LSEL.icon);
        if (!icon) {
            updateParticipantDisplay();
            return;
        }
        isProcessing = true;
        dlog('福袋', '倒计时 10s，采集参与人数');
        dispatchFullEvents(icon);
        await sleep(800);
        const dialog = $(LSEL.dialogContainer);
        if (dialog) {
            for (let i = 0; i < 3; i++) {
                const infoEl = dialog.querySelector(LSEL.joinedCount);
                if (infoEl) {
                    const m = infoEl.textContent.match(/(\d+)\s*人已参与/);
                    if (m) {
                        lastParticipantCount = Number(m[1]);
                        break;
                    }
                }
                await sleep(400);
            }
            const cnt = getLotteryCount(dialog);
            if (cnt != null) {
                currentLotteryCount = cnt;
                updateCountDisplay();
            }
            closeLotteryDialog();
            await sleep(300);
        } else {
            dlog('福袋', '参与人数采集失败：弹窗未打开');
        }
        updateParticipantDisplay();
        isProcessing = false;
    }

    function detectLotteryResult() {
        const dialog = $(LSEL.resultDialog);
        if (!dialog) return null;
        const textEl = dialog.querySelector(LSEL.resultText);
        const text = textEl ? textEl.textContent.trim() : '';
        if (!text) return null;
        let status = '未知';
        if (/没抽中|未中奖|没中奖|未抽中|没中|遗憾|下次|好运|未能|空手/.test(text)) status = '未中奖';
        else if (/中奖|恭喜|获得|抽中|幸运|赢得了|领取/.test(text)) status = '中奖';
        else status = '结果:' + text;
        return {
            resultText: text,
            status
        };
    }
    async function tryCloseResultDialog() {
        for (let i = 0; i < 6; i++) {
            const btn = $(LSEL.resultBtn);
            if (btn) {
                dispatchFullEvents(btn);
                dlog('福袋', '已关闭开奖弹窗');
                updateStatus('已关闭开奖弹窗(轮询中)');
                resetRoundState();
                updateLastRoundDisplay();
                return true;
            }
            await sleep(1000);
        }
        return false;
    }

    function getLotteryConditionsInfo(dialogContainer) {
        const lotteryCount = getLotteryCount(dialogContainer);
        const conditionTitle = dialogContainer ?
            Array.from(dialogContainer.querySelectorAll('div')).find(el => el.textContent.trim() === '参与条件') :
            $byText('div', '参与条件');
        if (!conditionTitle) return {
            hasConditions: false,
            conditions: [],
            formattedText: '',
            lotteryCount
        };
        const conditionContainer = conditionTitle.closest("[class*='dialog'], [class*='container'], [class*='content']") ||
            conditionTitle.parentElement;
        if (!conditionContainer) return {
            hasConditions: false,
            conditions: [],
            formattedText: '',
            lotteryCount
        };
        const reqEls = conditionContainer.querySelectorAll(LSEL.reqItem);
        const conditions = Array.from(reqEls).map(reqEl => {
            const requirement = reqEl.textContent.trim();
            const statusEl = reqEl.parentElement ? reqEl.parentElement.querySelector(LSEL.statusItem) : null;
            return {
                requirement,
                status: statusEl ? statusEl.textContent.trim() : '未知'
            };
        }).filter(c => c.requirement);
        if (conditions.length === 0) {
            const allDivs = Array.from(conditionContainer.querySelectorAll('div'));
            for (let i = 0; i < allDivs.length - 1; i++) {
                const reqText = allDivs[i].textContent.trim();
                const statusText = allDivs[i + 1].textContent.trim();
                if (!reqText || reqText === '参与条件') continue;
                if (statusText === '已达成' || statusText === '未达成') {
                    conditions.push({
                        requirement: reqText,
                        status: statusText
                    });
                    i++;
                }
            }
        }
        if (conditions.length === 0) return {
            hasConditions: false,
            conditions: [],
            formattedText: '',
            lotteryCount
        };
        const isSingle = conditions.length === 1;
        const prefix = isSingle ? '单条件' : `多条件(${conditions.length})`;
        const formattedText = `${prefix}: ` + conditions.map(c => `${c.requirement}[${c.status}]`).join(' | ');
        return {
            hasConditions: true,
            conditions,
            isSingle,
            formattedText,
            lotteryCount
        };
    }
    async function runLotteryTask() {
        if (!isEnabled || isProcessing) return;
        if (!isLiveRoomUrl()) return;
        const resultInfo = detectLotteryResult();
        if (resultInfo && resultInfo.resultText) {
            stopLoopTimer();
            stopCountdownTimer();
            lastRoundResult = {
                text: resultInfo.resultText,
                status: resultInfo.status
            };
            log('✦ 福袋开奖：', resultInfo.resultText, `（${resultInfo.status}）`);
            updateConditionsDisplay({
                hasConditions: true,
                isSingle: true,
                formattedText: `开奖结果：${resultInfo.status}（${resultInfo.resultText}）`,
                conditions: [],
            });
            updateStatus('开奖结果已出');
            setTimeout(async () => {
                if (!isEnabled) return;
                await tryCloseResultDialog();
                if (!loopTimer && isEnabled) setPollingInterval(idleMs());
            }, settings.lotteryAutoCloseDelay || 1000);
            return;
        }
        const dialog = $(LSEL.dialogContainer);
        const alreadyJoined = dialog?.querySelector(LSEL.alreadyJoinedBtn) ||
            (dialog ? $byText('div', '已参与') : null);
        const joinBtn = dialog?.querySelector(LSEL.joinBtn) ||
            (dialog ? Array.from(dialog.querySelectorAll('div'))
                .find(el => el.textContent.includes('一键发评论参与福袋')) : null);
        const timerEl = $(LSEL.timer);
        const timerText = timerEl ? timerEl.textContent.trim() : '';
        const secs = parseRemainingSeconds(timerText);
        if (secs < 999) cachedRemainingSeconds = secs;
        if (dialog) {
            const info = getLotteryConditionsInfo(dialog);
            currentLotteryCount = info.lotteryCount;
            updateCountDisplay();
            if (info.hasConditions) {
                dlog('福袋', '参与条件：', info.formattedText);
                updateConditionsDisplay(info);
            }
            setPollingInterval(activeMs());
            if (alreadyJoined && alreadyJoined.textContent.includes('已参与')) {
                if (!hasJoinedThisRound) {
                    lastParticipantCount = null;
                    updateParticipantDisplay();
                }
                hasJoinedThisRound = true;
                currentActionState = 'JOINED';
                updateStatus(`已参与 | 剩余: ${timerText || '运行中'}`);
                closeLotteryDialog();
                if (cachedRemainingSeconds > 0 && cachedRemainingSeconds < 999) {
                    stopLoopTimer();
                    startCountdownTimer();
                }
                return;
            }
            if (joinBtn) {
                let shouldJoin = false;
                if (info.hasConditions && !info.isSingle) {
                    const commentCond = info.conditions.find(c => c.requirement.includes('发送评论'));
                    const otherConds = info.conditions.filter(c => !c.requirement.includes('发送评论'));
                    const anyOtherReached = otherConds.some(c => c.status !== '未达成');
                    const anyReached = info.conditions.some(c => c.status !== '未达成');
                    const canProceed = commentCond?.status === '未达成' && anyOtherReached;
                    const allUnreached = !anyReached;
                    if (canProceed) {
                        shouldJoin = true;
                    } else if (allUnreached && settings.lotterySkipMultiCond) {
                        hasJoinedThisRound = true;
                        currentActionState = 'ABANDONED';
                        updateStatus(`已放弃 | 剩余: ${timerText || '等待中'}`);
                        dlog('福袋', '多条件全部未达成，自动放弃');
                        isProcessing = true;
                        closeLotteryDialog();
                        const waitTime = (cachedRemainingSeconds < 999 && cachedRemainingSeconds > 0) ?
                            cachedRemainingSeconds * 1000 + 30000 : 30000;
                        if (cachedRemainingSeconds > 0 && cachedRemainingSeconds < 999) {
                            stopLoopTimer();
                            startCountdownTimer();
                        }
                        if (abandonTimeoutTimer) clearTimeout(abandonTimeoutTimer);
                        abandonTimeoutTimer = setTimeout(() => {
                            if (!isEnabled) return;
                            resetRoundState();
                            dlog('福袋', '放弃倒计时结束，重置状态');
                        }, waitTime);
                        setPollingInterval(idleMs());
                        isProcessing = false;
                        return;
                    } else {
                        updateStatus('多条件福袋，已跳过自动参与');
                        return;
                    }
                } else {
                    shouldJoin = true;
                }
                if (shouldJoin) {
                    isProcessing = true;
                    updateStatus('条件符合，自动参与福袋');
                    dispatchFullEvents(joinBtn);
                    hasJoinedThisRound = true;
                    currentActionState = 'JOINED';
                    lastParticipantCount = null;
                    updateParticipantDisplay();
                    log('✓ 福袋已参与，剩余:', timerText);
                    updateStatus(`已参与 | 剩余: ${timerText}`);
                    await sleep(500);
                    closeLotteryDialog();
                    if (cachedRemainingSeconds > 0 && cachedRemainingSeconds < 999) {
                        stopLoopTimer();
                        startCountdownTimer();
                    } else {
                        await sleep(activeMs());
                        await tryCloseResultDialog();
                        setPollingInterval(idleMs());
                    }
                    isProcessing = false;
                    return;
                }
            }
        }
        const icon = $(LSEL.icon);
        if (icon) {
            if (hasJoinedThisRound) {
                const outerTimer = icon.querySelector(LSEL.timer);
                const outerText = outerTimer ? outerTimer.textContent.trim() : '';
                const outerSecs = parseRemainingSeconds(outerText);
                if (outerSecs < 999) cachedRemainingSeconds = outerSecs;
                const label = currentActionState === 'ABANDONED' ? '已放弃' : '已参与';
                updateStatus(`${label} | 剩余: ${outerText || '进行中'}`);
                if (outerSecs > 2) {
                    stopLoopTimer();
                    return;
                }
                if (outerSecs <= 2 && outerSecs > 0) {
                    setPollingInterval(activeMs());
                    isProcessing = true;
                    if (currentActionState === 'ABANDONED') {
                        resetRoundState();
                        setPollingInterval(idleMs());
                    } else {
                        updateStatus('倒计时归零，等待开奖...');
                        await sleep(5000);
                        await tryCloseResultDialog();
                        stopCountdownTimer();
                        setPollingInterval(idleMs());
                    }
                    isProcessing = false;
                }
                return;
            }
            setPollingInterval(activeMs());
            isProcessing = true;
            updateStatus('发现未参与福袋，打开面板...');
            dispatchFullEvents(icon);
            dlog('福袋', '发现福袋图标，点击唤起');
            await sleep(800);
            isProcessing = false;
        } else {
            if (!hasJoinedThisRound) updateStatus('运行中');
        }
    }

    function resetRoundState() {
        hasJoinedThisRound = false;
        currentActionState = 'NONE';
        cachedRemainingSeconds = 999;
        currentLotteryCount = null;
        participantCountFetched = false;
        updateCountDisplay();
        stopCountdownTimer();
        if (abandonTimeoutTimer) {
            clearTimeout(abandonTimeoutTimer);
            abandonTimeoutTimer = null;
        }
        updateConditionsDisplay({
            hasConditions: false
        });
        if (isEnabled) updateStatus('运行中');
    }

    function stopLoopTimer() {
        if (loopTimer) {
            clearInterval(loopTimer);
            loopTimer = null;
        }
    }

    function stopCountdownTimer() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
    }

    function setPollingInterval(ms) {
        if (!isEnabled) return;
        stopLoopTimer();
        loopTimer = setInterval(runLotteryTask, ms);
    }

    function startCountdownTimer() {
        stopCountdownTimer();
        dlog('福袋', `本地倒计时启动，初始 ${cachedRemainingSeconds}s`);
        countdownTimer = setInterval(() => {
            if (!isEnabled) {
                stopCountdownTimer();
                return;
            }
            if (cachedRemainingSeconds > 0) {
                cachedRemainingSeconds--;
                const mm = String(Math.floor(cachedRemainingSeconds / 60)).padStart(2, '0');
                const ss = String(cachedRemainingSeconds % 60).padStart(2, '0');
                const prefix = currentActionState === 'ABANDONED' ? '已放弃' : '已参与';
                updateStatus(`${prefix} | 剩余: ${mm}:${ss}`);
            }
            if (!participantCountFetched && currentActionState === 'JOINED' &&
                cachedRemainingSeconds <= 10 && cachedRemainingSeconds > 2) {
                fetchParticipantCount();
            }
            if (cachedRemainingSeconds <= 2) {
                stopCountdownTimer();
                if (currentActionState === 'ABANDONED') {
                    resetRoundState();
                    setPollingInterval(idleMs());
                    return;
                }
                setPollingInterval(activeMs());
            }
        }, 1000);
    }

    function isLiveRoomUrl() {
        try {
            const url = new URL(location.href);
            const host = url.hostname;
            const path = url.pathname;
            // 传统格式：live.douyin.com/直播间ID
            if (/live\.douyin\.com$/.test(host)) {
                const anchorId = url.searchParams.get('anchor_id');
                const liveWebRid = url.searchParams.get('live_web_rid');
                return path !== '/' || Boolean(anchorId) || Boolean(liveWebRid);
            }
            // 新增格式1：www.douyin.com/follow/live/直播间ID
            if (/www\.douyin\.com$/.test(host) && /^\/follow\/live\/\d+/.test(path)) {
                return true;
            }
            // 新增格式2：www.douyin.com/live/直播间ID
            if (/www\.douyin\.com$/.test(host) && /^\/live\/\d+/.test(path)) {
                return true;
            }
            // 兜底：只要带 anchor_id 或 live_web_rid 参数，就认为是直播间
            const anchorId = url.searchParams.get('anchor_id');
            const liveWebRid = url.searchParams.get('live_web_rid');
            if (anchorId || liveWebRid) return true;
            return false;
        } catch (e) {
            return false;
        }
    }

    function makeDraggable(panel, handle) {
        let isDragging = false,
            sx, sy, il, it;
        const onStart = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            sx = cx;
            sy = cy;
            const rect = panel.getBoundingClientRect();
            il = rect.left;
            it = rect.top;
            panel.style.bottom = 'auto';
            panel.style.right = 'auto';
            panel.style.transform = 'none';
            panel.style.left = il + 'px';
            panel.style.top = it + 'px';
            panel.style.cursor = 'grabbing';
        };
        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            let nl = il + (cx - sx),
                nt = it + (cy - sy);
            nl = Math.max(0, Math.min(nl, window.innerWidth - panel.offsetWidth));
            nt = Math.max(0, Math.min(nt, window.innerHeight - panel.offsetHeight));
            panel.style.left = nl + 'px';
            panel.style.top = nt + 'px';
        };
        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            panel.style.cursor = 'move';
        };
        handle.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        handle.addEventListener('touchstart', onStart, {
            passive: false
        });
        document.addEventListener('touchmove', onMove, {
            passive: false
        });
        document.addEventListener('touchend', onEnd);
    }

    function applyToggleUI() {
        const btn = document.getElementById('dyLotteryToggle');
        if (!btn) return;
        btn.classList.toggle('dy-lottery-on', isEnabled);
        btn.textContent = isEnabled ? '福袋：已开启 (F8)' : '福袋：已关闭 (F8)';
    }

    function createPanel() {
        const old = document.getElementById('dyLotteryPanel');
        if (old) old.remove();
        panelEl = null;
        if (!settings.lotteryShowFloatPanel) return;
        if (!isLiveRoomUrl()) return;
        const panel = document.createElement('div');
        panel.id = 'dyLotteryPanel';
        panel.style.cssText = [
            'position:fixed', 'top:0', 'left:50%', 'transform:translateX(-50%)',
            'z-index:1100', 'background:rgba(20,22,30,0.62)',
            'backdrop-filter:blur(18px) saturate(1.6)', '-webkit-backdrop-filter:blur(18px) saturate(1.6)',
            'padding:6px 10px', 'border-radius:6px', 'color:#fff',
            'font-size:var(--dy-font-size-xs)', 'box-shadow:0 3px 10px rgba(0,0,0,0.4)',
            'display:flex', 'align-items:center', 'gap:8px',
            'user-select:none', 'font-family:sans-serif',
            'cursor:move', 'border:1px solid rgba(255,255,255,0.30)',
        ].join(';');
        panel.innerHTML = `
<div style="font-size:10px;opacity:0.6;display:flex;flex-direction:column;align-items:center;line-height:1.2;padding-right:4px;border-right:1px solid rgba(255,255,255,0.2);">
<span>拖</span><span>拽</span>
</div>
<div style="display:flex;flex-direction:column;gap:4px;">
<button id="dyLotteryToggle">福袋：已关闭 (F8)</button>
<div style="font-size:10px;opacity:0.85;text-align:center;">
状态: <span data-dy-lottery-status style="color:#ffd54f;">已关闭</span>
<span data-dy-lottery-count style="display:inline-block;margin-left:4px;padding:0 3px;border:1px solid #ffd54f;border-radius:2px;color:#ffd54f;font-weight:bold;">（未知）</span>
</div>
</div>
<div style="display:flex;flex-direction:column;justify-content:center;max-width:220px;border-left:1px solid rgba(255,255,255,0.2);padding-left:6px;margin-left:2px;">
<div data-dy-lottery-cond style="font-size:10px;opacity:0.85;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
<div data-dy-lottery-participant style="font-size:10px;opacity:0.9;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;color:#ffd54f;"></div>
<div data-dy-lottery-last style="font-size:10px;opacity:0.9;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;"></div>
</div>
`;
        (document.body || document.documentElement).appendChild(panel);
        panelEl = panel;
        updateCountDisplay();
        updateParticipantDisplay();
        updateLastRoundDisplay();
        makeDraggable(panel, panel);
        document.getElementById('dyLotteryToggle').addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
        });
        applyToggleUI();
    }

    function setEnabled(flag) {
        isEnabled = !!flag;
        settings.enableLottery = isEnabled;
        GM_setValue('DY_Settings', settings);
        if (menuApp && menuApp._instance && menuApp._instance.proxy) {
            const p = menuApp._instance.proxy;
            if (p.s) p.s.enableLottery = isEnabled;
        }
        // 确保面板存在（勾选开关时兜底补建）
        if (!panelEl && settings.lotteryShowFloatPanel && isLiveRoomUrl()) {
            createPanel();
        }
        if (isEnabled) {
            log('✦ 福袋自动抢已开启');
            resetRoundState();
            setPollingInterval(idleMs());
            runLotteryTask();
        } else {
            log('■ 福袋自动抢已关闭');
            stopLoopTimer();
            resetRoundState();
            lastRoundResult = null;
            lastParticipantCount = null;
            updateParticipantDisplay();
            updateLastRoundDisplay();
            updateStatus('已关闭');
        }
        applyToggleUI();
    }

    function toggle() {
        setEnabled(!isEnabled);
    }

    function rebuildPanel() {
        createPanel();
    }

    function destroy() {
        stopLoopTimer();
        stopCountdownTimer();
        if (abandonTimeoutTimer) {
            clearTimeout(abandonTimeoutTimer);
            abandonTimeoutTimer = null;
        }
        if (routeWatcherTimer) {
            clearInterval(routeWatcherTimer);
            routeWatcherTimer = null;
        }
        if (panelEl && panelEl.parentNode) panelEl.remove();
        panelEl = null;
    }

    function init() {
        if (settings.enableLottery) {
            isEnabled = true;
        }
        createPanel();
        if (isEnabled) {
            resetRoundState();
            setPollingInterval(idleMs());
            runLotteryTask();
        }
        applyToggleUI();
    }

    function setupRouteWatcher() {
        if (routeWatcherTimer) clearInterval(routeWatcherTimer);
        let lastUrl = location.href;
        routeWatcherTimer = setInterval(() => {
            const urlChanged = (location.href !== lastUrl);
            lastUrl = location.href;
            const shouldShow = isLiveRoomUrl() && settings.lotteryShowFloatPanel;
            // 每次都检查面板存在性：应该显示但没有 → 补建
            if (shouldShow && !panelEl) {
                createPanel();
            }
            // 不应该显示但有 → 拆掉
            else if (!shouldShow && panelEl) {
                panelEl.remove();
                panelEl = null;
                stopLoopTimer();
                stopCountdownTimer();
                if (abandonTimeoutTimer) {
                    clearTimeout(abandonTimeoutTimer);
                    abandonTimeoutTimer = null;
                }
            }
            // URL 变化时（进/出直播间）额外重置状态
            if (urlChanged && isLiveRoomUrl() && isEnabled) {
                resetRoundState();
                setPollingInterval(idleMs());
                runLotteryTask();
            }
        }, 2000);
    }
    return {
        init,
        setEnabled,
        toggle,
        destroy,
        rebuildPanel,
        isEnabled: () => isEnabled,
        isLiveRoomUrl,
        setupRouteWatcher,
    };
})();
// =========================================================
//      保活（音频保活 + 防暂停模块同步）
// =========================================================
let audioContext = null;

function setupKeepAlive() {
    PauseGuard.setEnabled(settings.enableKeepAlive !== false);
    if (!settings.enableKeepAlive) {
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        return;
    }
    if (!audioContext) {
        try {
            audioContext = new(window.AudioContext || window.webkitAudioContext)();
            const buf = audioContext.createBuffer(1, 128, audioContext.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < 128; i++) d[i] = 0;

            function play() {
                if (!audioContext || audioContext.state === 'closed') return;
                const s = audioContext.createBufferSource();
                s.buffer = buf;
                const g = audioContext.createGain();
                g.gain.value = 0.001;
                s.connect(g);
                g.connect(audioContext.destination);
                s.start();
                s.onended = () => {
                    if (audioContext && audioContext.state !== 'closed') setTimeout(play, 100);
                };
            }
            const start = () => {
                if (audioContext && audioContext.state === 'suspended') audioContext.resume();
                play();
                document.removeEventListener('click', start);
                document.removeEventListener('keydown', start);
            };
            document.addEventListener('click', start);
            document.addEventListener('keydown', start);
            if (audioContext.state === 'running') play();
        } catch (e) {
            log('保活音频启动失败:', e);
        }
    }
}
// =========================================================
//                       弹幕核心
// =========================================================
function isDanmuBlocked(text) {
    if (!settings.blockedDanmu_Switch || !settings.blockedDanmu_Array || settings.blockedDanmu_Array.length === 0) return false;
    const fallbackRegex = settings.blockedDanmu_UseRegular !== false;
    for (const item of settings.blockedDanmu_Array) {
        if (ruleTestItem(item, text, fallbackRegex)) return true;
    }
    return false;
}

function filterDanmu() {
    const danmuElements = document.querySelectorAll(SEL.danmuItem);
    if (danmuElements.length === 0) {
        Monitor.emitThrottled('d-empty', 'danmu', '未检测到弹幕元素（可能弹幕未开启）', 15000, 'warn');
        return;
    }
    Monitor.emitThrottled('d-scan', 'danmu', '扫描 ' + danmuElements.length + ' 条弹幕', 5000);
    dlog('弹幕', '扫描', danmuElements.length, '条');
    let activeId = '';
    const activeEl = document.querySelector(SEL.activeVideoId);
    if (activeEl) {
        activeId = activeEl.getAttribute('data-e2e-vid') || '';
    }
    if (!activeId && settings.preferQuickPlayer !== false) {
        const qp = getQuickPlayerInfo();
        if (qp && qp.awemeId) activeId = qp.awemeId;
    }
    if (activeId && activeId !== lastVideoContainerId) {
        if (lastVideoContainerId !== '') {
            insertDivider();
            log('⇄ 切换到新视频容器:', lastVideoContainerId, '→', activeId);
        }
        lastVideoContainerId = activeId;
    }
    for (const el of danmuElements) {
        const id = el.dataset.danmuId || el.getAttribute('data-danmu-id');
        if (!id) continue;
        const container = getDanmuContainer(el);
        const fullTimeStr = getContainerFullTimeStr(container);
        const videoTime = getContainerCurrentTime(container);
        if (danmuPool.some(item => item.id === id)) continue;
        const textEl = el.querySelector('.danMuText span') || el.querySelector('.danMuText');
        let text = textEl ? textEl.textContent.trim() : el.textContent.trim().slice(0, 50);
        if (!text) text = '(空)';
        danmuPool.push({
            id,
            text,
            videoTime,
            fullTimeStr
        });
        if (danmuPool.length > MAX_POOL_STORAGE) danmuPool = danmuPool.slice(-MAX_POOL_STORAGE);
        if (settings.blockedDanmu_Switch && isDanmuBlocked(text)) {
            el.style.display = 'none';
            el.classList.add('dy-danmu-blocked');
            log('屏蔽弹幕:', text);
            Monitor.emit('danmu', '屏蔽：' + text.slice(0, 40), 'ok');
            if (!blockedPool.some(p => p.id === id)) {
                blockedPool.push({
                    id,
                    text,
                    videoTime,
                    fullTimeStr
                });
                if (blockedPool.length > MAX_POOL_STORAGE) blockedPool = blockedPool.slice(-MAX_POOL_STORAGE);
            }
        }
    }
    if (menuApp) {
        const vm = menuApp._instance;
        if (vm && vm.proxy && vm.proxy.syncPools) vm.proxy.syncPools();
    }
}
// =========================================================
//              清屏（沉浸式）持久化
// =========================================================
const IMMERSIVE_CONTAINER_SEL = '.xgplayer-immersive-switch-setting';
let timerImmersive = null;
let _immersiveUserClickedAt = 0;

function findActiveImmersiveWrapper() {
    const active = document.querySelector(SEL.activeVideo);
    if (active) {
        const w = active.querySelector(IMMERSIVE_CONTAINER_SEL);
        if (w && w.getAttribute('data-state') !== 'disabled') return w;
    }
    const list = document.querySelectorAll(IMMERSIVE_CONTAINER_SEL);
    for (const w of list) {
        if (w.getAttribute('data-state') === 'disabled') continue;
        const r = w.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight) return w;
    }
    return null;
}

function getImmersiveBtn() {
    const w = findActiveImmersiveWrapper();
    return w ? w.querySelector('.xg-switch') : null;
}

function isImmersiveOn() {
    const btn = getImmersiveBtn();
    if (!btn) return null;
    return btn.getAttribute('aria-checked') === 'true';
}

function syncImmersiveMenu(persistOn, hijackOn) {
    if (menuApp && menuApp._instance && menuApp._instance.proxy) {
        const p = menuApp._instance.proxy;
        if (p.s) {
            if (typeof persistOn === 'boolean') p.s.enableImmersivePersist = persistOn;
            if (typeof hijackOn === 'boolean') p.s.hijackImmersiveShortcut = hijackOn;
        }
        if (p.showPrompt && typeof persistOn === 'boolean') {
            p.showPrompt(persistOn ? '✓ 清屏持久化已开启' : '⏏ 清屏持久化已关闭');
        }
    }
}

function getImmersiveProps(btn) {
    if (!btn) return null;
    const fiberKey = Object.getOwnPropertyNames(btn).find(k => k.startsWith('__reactFiber$'));
    if (!fiberKey) return null;
    let fiber = btn[fiberKey];
    for (let i = 0; i < 3 && fiber; i++) fiber = fiber.return;
    return fiber && fiber.memoizedProps ? fiber.memoizedProps : null;
}

function setImmersive(on) {
    const btn = getImmersiveBtn();
    if (!btn) return false;
    const props = getImmersiveProps(btn);
    if (!props) return false;
    if (!!props.isOn === !!on) return true;
    if (typeof props.updateImmersiveSwitch === 'function') {
        try {
            props.updateImmersiveSwitch({
                isOn: !!on,
                logParams: {},
                showTip: false
            });
            log('清屏', '已切换：', on ? '开' : '关');
            return true;
        } catch (e) {
            log('清屏', '切换失败:', e.message);
        }
    }
    return false;
}

function applyImmersiveState() {
    if (!settings.enableImmersivePersist) return;
    if (Date.now() - _immersiveUserClickedAt < 800) return;
    const btn = getImmersiveBtn();
    if (!btn) return;
    const props = getImmersiveProps(btn);
    if (!props) return;
    if (props.isOn === true) return;
    if (setImmersive(true)) {
        Monitor.emitThrottled('im-recover', 'immersive', '已自动恢复清屏状态', 5000, 'ok');
    }
}

function _turnOffPersist(reason) {
    if (!settings.enableImmersivePersist) return;
    settings.enableImmersivePersist = false;
    GM_setValue('DY_Settings', settings);
    stopImmersiveTimer();
    syncImmersiveMenu(false);
    log('清屏持久化已关闭：', reason);
}

function _turnOnPersist(reason) {
    if (settings.enableImmersivePersist) return;
    settings.enableImmersivePersist = true;
    GM_setValue('DY_Settings', settings);
    startImmersiveTimer();
    setTimeout(applyImmersiveState, 50);
    syncImmersiveMenu(true);
    log('清屏持久化已开启：', reason);
}

function setupImmersivePersistence() {
    const markClick = (e) => {
        const t = e.target;
        if (!t || typeof t.closest !== 'function') return;
        if (t.closest(IMMERSIVE_CONTAINER_SEL)) {
            _immersiveUserClickedAt = Date.now();
            if (settings.enableImmersivePersist) {
                _turnOffPersist('用户点击清屏按钮');
            }
        }
    };
    ['pointerdown', 'mousedown', 'click'].forEach(type => {
        window.addEventListener(type, markClick, true);
    });
}

function startImmersiveTimer() {
    if (timerImmersive) {
        clearInterval(timerImmersive);
        timerImmersive = null;
    }
    if (!settings.enableImmersivePersist) return;
    applyImmersiveState();
    timerImmersive = setInterval(applyImmersiveState, 500);
    log('清屏持久化轮询已启动');
}

function stopImmersiveTimer() {
    if (timerImmersive) {
        clearInterval(timerImmersive);
        timerImmersive = null;
    }
}

function handleImmersiveJKey() {
    if (!settings.enableImmersivePersist && !settings.hijackImmersiveShortcut) {
        return false;
    }
    if (settings.hijackImmersiveShortcut) {
        if (settings.enableImmersivePersist) {
            _turnOffPersist('用户按下 J 键（劫持）');
            setImmersive(false);
        } else {
            _turnOnPersist('用户按下 J 键（劫持）');
        }
        return true;
    } else {
        if (settings.enableImmersivePersist) {
            _turnOffPersist('用户按下 J 键');
        }
        return false;
    }
}
// =========================================================
//                     键盘快捷键
// =========================================================
function keydown(event) {
    if (event.code === 'F8' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
        const t = event.target;
        const isTyping = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (!isTyping) {
            event.preventDefault();
            event.stopPropagation();
            if (typeof LotteryModule !== 'undefined' && LotteryModule.isLiveRoomUrl()) {
                LotteryModule.toggle();
            } else {
                cc('yellow', '✦ 福袋自动抢：仅在直播间页生效');
            }
            return;
        }
    }
    if (event.key === 'j' || event.key === 'J') {
        const t = event.target;
        const isTyping = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (!isTyping) {
            const handled = handleImmersiveJKey();
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
    }
    if (!settings.enableKeyboardShortcuts) return;
    const key = event.key;
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    const kPayHide = settings.keyTogglePayHide || '=';
    const kGift = settings.keyToggleGiftFilter || '*';
    const kMirror = settings.keyToggleMirror || '/';
    if (key === kPayHide) {
        event.preventDefault();
        togglePayHide();
        return;
    }
    if (key === kGift) {
        event.preventDefault();
        toggleGiftFilter();
        return;
    }
    if (key === kMirror) {
        event.preventDefault();
        toggleMirror();
        return;
    }
}
// =========================================================
//                           定时器
// =========================================================
let timerQuality = null,
    timerDanmu = null,
    timerSkip = null;

function startQualityTimer() {
    if (timerQuality) clearInterval(timerQuality);
    const seconds = Math.max(0.5, settings.pollingQuality || 1.5);
    timerQuality = setInterval(switchToHighestQuality, seconds * 1000);
    log('画质轮询已启动（间隔', seconds, '秒）');
    Monitor.emit('core', '画质轮询已启动（间隔 ' + seconds + 's）', 'ok');
}

function startDanmuTimer() {
    if (timerDanmu) clearInterval(timerDanmu);
    const seconds = Math.max(0.2, settings.pollingDanmu || 0.5);
    timerDanmu = setInterval(filterDanmu, seconds * 1000);
    log('弹幕轮询已启动（间隔', seconds, '秒）');
    Monitor.emit('core', '弹幕轮询已启动（间隔 ' + seconds + 's）', 'ok');
    startDanmuPoolSync();
}

function startSkipTimer() {
    if (timerSkip) clearInterval(timerSkip);
    const seconds = Math.max(0.3, settings.skipVideoPolling || 0.5);
    timerSkip = setInterval(checkSkipFeed, seconds * 1000);
    hookAllVideos();
    log('跳过检测已启动（事件驱动 + 兜底轮询', seconds, '秒）');
    Monitor.emit('core', '跳过检测已启动（间隔 ' + seconds + 's）', 'ok');
}

function restartAllTimers() {
    if (timerQuality) {
        clearInterval(timerQuality);
        timerQuality = null;
    }
    if (timerDanmu) {
        clearInterval(timerDanmu);
        timerDanmu = null;
    }
    if (timerSkip) {
        clearInterval(timerSkip);
        timerSkip = null;
    }
    if (danmuSyncTimer) {
        clearInterval(danmuSyncTimer);
        danmuSyncTimer = null;
    }
    stopImmersiveTimer();
    setTimeout(() => {
        startQualityTimer();
        startDanmuTimer();
        startSkipTimer();
        startImmersiveTimer();
    }, 100);
}
// =========================================================
//              导航栏「脚本」按钮
// =========================================================
// 用占位符 __COLOR__，由 getGearUrls() 按主题注入黑/白
const GEAR_OUTLINE_SVG_TPL =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' " +
    "fill='none' stroke='__COLOR__' stroke-width='1.8' " +
    "stroke-linecap='round' stroke-linejoin='round'>" +
    "<circle cx='12' cy='12' r='3'/>" +
    "<path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'/>" +
    "</svg>";
const GEAR_SOLID_SVG_TPL =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='__COLOR__'>" +
    "<path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.74 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z'/>" +
    "</svg>";

function getGearUrls() {
    const isLight = (ThemeManager.getTheme() === 'light');
    const color = isLight ? '%231c1c1e' : '%23fff';
    return {
        outline: `url("data:image/svg+xml;utf8,${GEAR_OUTLINE_SVG_TPL.replace('__COLOR__', color)}")`,
        solid: `url("data:image/svg+xml;utf8,${GEAR_SOLID_SVG_TPL.replace('__COLOR__', color)}")`,
    };
}

function refreshScriptGearIcon(active) {
    const tab = document.querySelector(SEL.tabScriptMenu);
    if (!tab) return;
    const {
        outline,
        solid
    } = getGearUrls();
    const url = active ? solid : outline;
    const size = active ? 'contain' : '85%';
    tab.querySelectorAll('.b0EMo3Nf .hSOV0nY4').forEach(d => {
        d.style.backgroundImage = url;
        d.style.backgroundPosition = 'center';
        d.style.backgroundSize = size;
        d.style.backgroundRepeat = 'no-repeat';
    });
}

function setScriptGearActive(active) {
    refreshScriptGearIcon(active);
}

function injectScriptMenuButton() {
    if (!settings.enableNavButton) return;
    if (document.querySelector(SEL.tabScriptMenu)) return;
    const microgameTab = document.querySelector(SEL.tabMicrogame);
    if (!microgameTab) return;
    const newTab = microgameTab.cloneNode(true);
    newTab.classList.remove('tab-microgame');
    newTab.classList.add('tab-scriptmenu');
    const link = newTab.querySelector('a');
    if (link) {
        link.setAttribute('href', 'javascript:void(0);');
        link.removeAttribute('target');
    }
    const textSpan = newTab.querySelector('.wiu7QUYe');
    if (textSpan) textSpan.textContent = '脚本';
    const {
        outline
    } = getGearUrls();
    const iconDivs = newTab.querySelectorAll('.b0EMo3Nf .hSOV0nY4');
    iconDivs.forEach(d => {
        d.style.backgroundImage = outline;
        d.style.backgroundPosition = 'center';
        d.style.backgroundSize = '85%';
        d.style.backgroundRepeat = 'no-repeat';
    });
    if (link) {
        link.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menuEl = document.getElementById('dyMenuUi');
            if (menuEl) {
                if (menuEl.style.display === 'none') {
                    playMenuOpen(menuEl);
                    if (!danmuSyncTimer) startDanmuPoolSync();
                    setScriptGearActive(true);
                } else {
                    playMenuClose(menuEl, () => {
                        if (danmuSyncTimer) {
                            clearInterval(danmuSyncTimer);
                            danmuSyncTimer = null;
                        }
                    });
                    setScriptGearActive(false);
                }
            } else {
                createMenu();
                setScriptGearActive(true);
            }
        };
    }
    microgameTab.parentNode.insertBefore(newTab, microgameTab.nextSibling);
    log('✓ 导航栏「脚本」按钮已注入');
}
// 主题变化 → 刷新齿轮图标
ThemeManager.onChange(() => {
    const menuEl = document.getElementById('dyMenuUi');
    const isActive = !!(menuEl && menuEl.style.display !== 'none');
    refreshScriptGearIcon(isActive);
});
// =========================================================
//                    获取当前用户ID
// =========================================================
function getCurrentUserId() {
    try {
        const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
        if (W.USER && W.USER.uid) return 'uid_' + W.USER.uid;
        if (W.__INITIAL_STATE__?.user?.uid) return 'uid_' + W.__INITIAL_STATE__.user.uid;
        if (W.__USER_INFO__?.uid) return 'uid_' + W.__USER_INFO__.uid;
    } catch (e) {}
    try {
        const cookieMap = {};
        document.cookie.split('; ').forEach(c => {
            const idx = c.indexOf('=');
            if (idx < 0) return;
            const k = c.slice(0, idx);
            const v = c.slice(idx + 1);
            cookieMap[k] = v;
        });
        if (cookieMap['passport_assist_user']) {
            return 'pa_' + cookieMap['passport_assist_user'].slice(0, 32);
        }
        if (cookieMap['login_time']) {
            return 'lt_' + cookieMap['login_time'];
        }
        if (cookieMap['uid']) return 'uid_' + cookieMap['uid'];
        if (cookieMap['user_id']) return 'uid_' + cookieMap['user_id'];
    } catch (e) {}
    return 'fixed_user_id';
}
// =========================================================
//                     消息悬浮窗
// =========================================================
let msgFloatWindow = null;
let msgFloatContent = null;
let msgFloatVisible = false;
let msgButton = null;
let contactMap = new Map();
let syncTimer = null;
let currentUserId = null;
let isFullLoadComplete = false;
let _uidResolved = false;

function migrateUserIdIfNeeded(savedUserId, newUserId) {
    if (!newUserId) return savedUserId;
    if (savedUserId === newUserId) return savedUserId;
    if (newUserId === 'fixed_user_id') return savedUserId;
    if (!savedUserId || savedUserId === 'fixed_user_id') {
        try {
            GM_setValue('dy_user_id', newUserId);
        } catch (e) {}
        console.log('[抖音优化] 用户ID升级：', savedUserId || '(空)', '→', String(newUserId).slice(0, 12) + '…');
        return newUserId;
    }
    const isOldFormat = !/^(pa_|lt_|uid_)/.test(savedUserId);
    const isNewFormat = /^(pa_|lt_|uid_)/.test(newUserId);
    if (isOldFormat && isNewFormat) {
        try {
            GM_setValue('dy_user_id', newUserId);
        } catch (e) {}
        console.log('[抖音优化] 用户ID格式升级：', String(savedUserId).slice(0, 8), '→', String(newUserId).slice(0, 12) + '…');
        return newUserId;
    }
    return savedUserId;
}

function saveContactsToStorage() {
    const data = Array.from(contactMap.values()).map(c => ({
        name: c.name,
        avatar: c.avatar,
        preview: c.preview,
        time: c.time,
        unread: c.unread,
    }));
    GM_setValue('dy_contacts_cache', JSON.stringify(data));
    if (currentUserId) GM_setValue('dy_user_id', currentUserId);
}

function loadContactsFromStorage() {
    const raw = GM_getValue('dy_contacts_cache');
    let savedUserId = GM_getValue('dy_user_id', '');
    savedUserId = migrateUserIdIfNeeded(savedUserId, currentUserId);
    if (currentUserId && savedUserId && savedUserId !== 'fixed_user_id' && currentUserId !== savedUserId && currentUserId !== 'fixed_user_id') {
        console.log('↻ 检测到账号切换，自动重置消息缓存');
        contactMap.clear();
        GM_setValue('dy_contacts_cache', '');
        updateFloatWindow();
        return;
    }
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        data.forEach(item => {
            contactMap.set(item.name, {
                ...item,
                element: null
            });
        });
        if (contactMap.size > 0) updateFloatWindow();
    } catch (e) {}
}

function isImPanelVisible() {
    const dialog = document.querySelector('[data-e2e="im-dialog"]');
    if (!dialog) return false;
    let el = dialog;
    while (el && el !== document.body) {
        let st;
        try {
            st = getComputedStyle(el);
        } catch (e) {
            return false;
        }
        if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
        el = el.parentElement;
    }
    const r = dialog.getBoundingClientRect();
    if (r.width < 50 || r.height < 50) return false;
    if (r.bottom <= 0 || r.right <= 0 || r.top >= window.innerHeight || r.left >= window.innerWidth) return false;
    return true;
}

function initMessagePreview() {
    if (!_uidResolved) {
        currentUserId = getCurrentUserId();
        if (!currentUserId) currentUserId = 'default';
        _uidResolved = true;
    }

    function findMsgButton() {
        const imEntry = document.querySelector(SEL.imEntry);
        if (imEntry) {
            const innerBtn = imEntry.querySelector('[data-e2e="something-button"]');
            if (innerBtn) return innerBtn;
            return imEntry;
        }
        const all = document.querySelectorAll('[data-e2e="something-button"]');
        for (const b of all) {
            const label = b.querySelector('.phl13lpd');
            if (label && label.textContent.trim() === '消息') return b;
        }
        return null;
    }
    msgButton = findMsgButton();
    if (!msgButton) {
        window._dyMsgRetry = (window._dyMsgRetry || 0) + 1;
        if (window._dyMsgRetry <= 60) {
            if (window._dyMsgRetry === 1) {
                console.log('[抖音优化] 消息按钮还没出现，正在等待…（第 1 次）');
            }
            setTimeout(initMessagePreview, 500);
        } else {
            console.warn('[抖音优化] 等了 30 秒还是没找到消息按钮，放弃');
        }
        return;
    }
    window._dyMsgRetry = 0;
    if (msgButton._dyBound) return;
    msgButton._dyBound = true;
    loadContactsFromStorage();
    createFloatWindow();
    setTimeout(() => {
        if (isImPanelVisible()) {
            isFullLoadComplete = false;
            loadAllContacts();
        } else {
            try {
                const list = document.querySelector('.conversationConversationListwrapper') ||
                    document.querySelector('#im-entry-vmok-popup-portal .componentsLeftPanelboxList');
                if (list) {
                    updateContactsInfo();
                }
            } catch (e) {}
        }
    }, 800);
    let listChangeTimer = null;
    const listObserver = new MutationObserver(() => {
        if (listChangeTimer) clearTimeout(listChangeTimer);
        listChangeTimer = setTimeout(() => {
            const panel = document.querySelector(SEL.imPortal) || document.getElementById('im-entry-vmok-popup-portal');
            if (!panel) {
                listChangeTimer = null;
                return;
            }
            if (!isImPanelVisible()) {
                if (contactMap.size > 0) updateFloatWindow();
                listChangeTimer = null;
                return;
            }
            if (!isFullLoadComplete) loadAllContacts();
            else updateContactsInfo();
            listChangeTimer = null;
        }, 500);
    });
    const waitForList = setInterval(() => {
        const list = document.querySelector('.conversationConversationListwrapper') ||
            document.querySelector('#im-entry-vmok-popup-portal .componentsLeftPanelboxList');
        if (list) {
            clearInterval(waitForList);
            listObserver.observe(list, {
                childList: true,
                subtree: true,
                attributes: false
            });
        }
    }, 1000);
    let hideTimer = null;

    function showFloat() {
        if (!settings.enableMsgFloat) return;
        clearTimeout(hideTimer);
        const rect = msgButton.getBoundingClientRect();
        const floatWidth = 400;
        let left = rect.left + 4;
        if (left + floatWidth > window.innerWidth - 10) left = window.innerWidth - floatWidth - 10;
        if (left < 10) left = 10;
        msgFloatWindow.style.left = left + 'px';
        msgFloatWindow.style.top = (rect.bottom + 8) + 'px';
        msgFloatWindow.style.display = 'block';
        msgFloatWindow.style.width = floatWidth + 'px';
        void msgFloatWindow.offsetWidth;
        msgFloatVisible = true;
        requestAnimationFrame(() => {
            msgFloatWindow.style.opacity = '1';
            msgFloatWindow.style.transform = 'translateY(0)';
            msgFloatWindow.style.clipPath = 'inset(0 0 0% 0 round 12px)';
            msgFloatWindow.style.pointerEvents = 'auto';
        });
        updateContactsInfo();
        if (syncTimer) clearInterval(syncTimer);
        syncTimer = setInterval(() => {
            if (msgFloatVisible) updateContactsInfo();
            else {
                clearInterval(syncTimer);
                syncTimer = null;
            }
        }, 2000);
    }

    function hideFloat() {
        hideTimer = setTimeout(() => {
            msgFloatWindow.style.opacity = '0';
            msgFloatWindow.style.transform = 'translateY(-6px)';
            msgFloatWindow.style.clipPath = 'inset(0 0 100% 0 round 12px)';
            msgFloatWindow.style.pointerEvents = 'none';
            msgFloatVisible = false;
            if (syncTimer) {
                clearInterval(syncTimer);
                syncTimer = null;
            }
            setTimeout(() => {
                if (!msgFloatVisible) msgFloatWindow.style.display = 'none';
            }, 320);
        }, 300);
    }
    msgButton.addEventListener('mouseenter', () => {
        showFloat();
    });
    msgButton.addEventListener('mouseleave', () => {
        hideFloat();
    });
    msgButton.addEventListener('click', (e) => {
        if (e.isTrusted === false) return;
        // 只收起自己的浮窗，点击事件照常放行 → 原生消息面板正常打开
        hideFloat();
        let tries = 0;
        const waitPanel = setInterval(() => {
            tries++;
            if (isImPanelVisible()) {
                clearInterval(waitPanel);
                isFullLoadComplete = false;
                loadAllContacts();
            } else if (tries >= 25) {
                clearInterval(waitPanel);
            }
        }, 200);
    }, true);
    msgFloatWindow.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    msgFloatWindow.addEventListener('mouseleave', () => {
        hideFloat();
    });
    document.addEventListener('click', (e) => {
        if (msgFloatVisible && !msgFloatWindow.contains(e.target) && e.target !== msgButton && !msgButton.contains(e.target)) {
            hideFloat();
        }
    });
    window.addEventListener('scroll', () => {
        if (msgFloatVisible) {
            const rect = msgButton.getBoundingClientRect();
            const floatWidth = 400;
            let left = rect.left + 4;
            if (left + floatWidth > window.innerWidth - 10) left = window.innerWidth - floatWidth - 10;
            if (left < 10) left = 10;
            msgFloatWindow.style.left = left + 'px';
            msgFloatWindow.style.top = (rect.bottom + 8) + 'px';
        }
    }, true);
}

function createFloatWindow() {
    if (msgFloatWindow) return;
    msgFloatWindow = document.createElement('div');
    msgFloatWindow.id = 'dy-msg-float-window';
    msgFloatWindow.style.cssText = `
position: fixed;
width: 400px;
max-height: 70vh;
background: rgba(30,32,44,0.68);
-webkit-backdrop-filter: blur(22px) saturate(1.6);
backdrop-filter: blur(22px) saturate(1.6);
color: #e8e8e8;
border-radius: 12px;
box-shadow: 0 8px 24px rgba(0,0,0,0.6);
border: 1px solid rgba(255,255,255,0.10);
z-index: 9999;
display: none;
overflow-y: auto;
padding: 6px 0;
opacity: 0;
transform: translateY(-6px);
clip-path: inset(0 0 100% 0 round 12px);
transition: clip-path 0.30s cubic-bezier(0.16, 1, 0.3, 1),
opacity 0.22s ease,
transform 0.30s cubic-bezier(0.16, 1, 0.3, 1);
pointer-events: none;
right: auto;
bottom: auto;
font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
scrollbar-width: thin;
scrollbar-color: rgba(255,255,255,0.2) transparent;
`;
    const arrow = document.createElement('div');
    arrow.style.cssText = `
position: absolute;
top: -8px;
left: 30px;
width: 0;
height: 0;
border-left: 8px solid transparent;
border-right: 8px solid transparent;
border-bottom: 8px solid rgba(30,32,44,0.9);
filter: drop-shadow(0 -2px 4px rgba(0,0,0,0.3));
`;
    msgFloatWindow.appendChild(arrow);
    const content = document.createElement('div');
    content.id = 'dy-msg-float-content';
    content.style.cssText = 'padding: 0 6px;';
    msgFloatWindow.appendChild(content);
    document.body.appendChild(msgFloatWindow);
    msgFloatContent = content;
    const styleTag = document.createElement('style');
    styleTag.textContent = `
#dy-msg-float-content .dy-contact-item {
display: flex;
align-items: center;
padding: 8px 12px;
border-bottom: 1px solid rgba(255,255,255,0.06);
cursor: pointer;
transition: background 0.15s;
}
#dy-msg-float-content .dy-contact-item:hover {
background: rgba(255,255,255,0.08);
}
#dy-msg-float-content .dy-avatar {
width: 44px;
height: 44px;
border-radius: 50%;
background: #3a3b4a;
flex-shrink: 0;
margin-right: 12px;
overflow: hidden;
}
#dy-msg-float-content .dy-avatar img {
width: 100%;
height: 100%;
object-fit: cover;
}
#dy-msg-float-content .dy-info {
flex: 1;
min-width: 0;
}
#dy-msg-float-content .dy-name {
font-size: var(--dy-font-size);
font-weight: 500;
color: #e8e8e8;
display: flex;
align-items: center;
gap: 6px;
}
#dy-msg-float-content .dy-name .dy-badge {
background: #ff4757;
color: #fff;
font-size: var(--dy-font-size-xs);
padding: 0 6px;
border-radius: 10px;
line-height: 18px;
}
#dy-msg-float-content .dy-preview {
font-size: var(--dy-font-size-md);
color: rgba(255,255,255,0.55);
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
margin-top: 2px;
}
#dy-msg-float-content .dy-time {
font-size: var(--dy-font-size-sm);
color: rgba(255,255,255,0.35);
flex-shrink: 0;
margin-left: 8px;
}
#dy-msg-float-content .dy-empty {
padding: 30px 20px;
text-align: center;
color: rgba(255,255,255,0.4);
}
#dy-msg-float-window::-webkit-scrollbar { width: 5px; }
#dy-msg-float-window::-webkit-scrollbar-track { background: transparent; }
#dy-msg-float-window::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.30); border-radius: 4px; }
#dy-msg-float-window::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
`;
    msgFloatWindow.appendChild(styleTag);
}

function loadAllContacts() {
    const panel = document.querySelector(SEL.imPortal) || document.getElementById('im-entry-vmok-popup-portal');
    if (!panel) {
        if (contactMap.size > 0) updateFloatWindow();
        return;
    }
    const list = panel.querySelector('.conversationConversationListwrapper') ||
        panel.querySelector('.componentsLeftPanelboxList');
    if (!list) return;
    if (!isImPanelVisible()) {
        const cnt = extractAndUpdate();
        if (cnt > 0) updateFloatWindow();
        return;
    }
    const scrollContainer = list.closest('[style*="overflow"]') || list.parentElement;
    if (!scrollContainer) return;
    if (window._dyLoadingContacts) return;
    window._dyLoadingContacts = true;
    const originalScrollTop = scrollContainer.scrollTop;
    let previousCount = 0;
    let stableCount = 0;
    const maxAttempts = 50;
    let attempts = 0;
    const step = 400;
    if (window._dyLoadTimer) {
        clearInterval(window._dyLoadTimer);
        window._dyLoadTimer = null;
    }

    function extractAndUpdate() {
        let items = list.querySelectorAll(SEL.convItem);
        if (items.length === 0) {
            items = list.querySelectorAll('.conversationConversationItemwrapper');
        }
        items.forEach(item => {
            const titleEl = item.querySelector(SEL.convTitle);
            if (!titleEl) return;
            const name = titleEl.textContent.trim();
            if (!name) return;
            const avatarImg = item.querySelector('.commonIMAvataravatarContainer img') ||
                item.querySelector('.semi-avatar-img img');
            let avatarUrl = '';
            if (avatarImg) avatarUrl = avatarImg.src;
            const previewEl = item.querySelector(SEL.convPreview);
            const preview = previewEl ? previewEl.textContent.trim() : '';
            const timeEl = item.querySelector(SEL.convTime);
            const time = timeEl ? timeEl.textContent.trim() : '';
            const badge = item.querySelector(SEL.convUnread);
            const unread = badge ? badge.textContent.trim() : '';
            if (contactMap.has(name)) {
                const existing = contactMap.get(name);
                existing.avatar = avatarUrl || existing.avatar;
                existing.preview = preview || existing.preview;
                existing.time = time || existing.time;
                existing.unread = unread || existing.unread;
                existing.element = item;
            } else {
                contactMap.set(name, {
                    name,
                    avatar: avatarUrl,
                    preview,
                    time,
                    unread,
                    element: item
                });
            }
        });
        saveContactsToStorage();
        return contactMap.size;
    }

    function isAtBottom() {
        return scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 20;
    }

    function doScrollLoad() {
        if (attempts >= maxAttempts || !msgFloatVisible) {
            window._dyLoadingContacts = false;
            if (window._dyLoadTimer) {
                clearInterval(window._dyLoadTimer);
                window._dyLoadTimer = null;
            }
            scrollContainer.scrollTop = originalScrollTop;
            extractAndUpdate();
            updateFloatWindow();
            return;
        }
        attempts++;
        const currentCount = extractAndUpdate();
        if (isAtBottom()) {
            scrollContainer.scrollTop = originalScrollTop;
            window._dyLoadingContacts = false;
            if (window._dyLoadTimer) {
                clearInterval(window._dyLoadTimer);
                window._dyLoadTimer = null;
            }
            extractAndUpdate();
            updateFloatWindow();
            return;
        }
        if (currentCount > previousCount) {
            previousCount = currentCount;
            stableCount = 0;
            scrollContainer.scrollTop += step;
            if (window._dyLoadTimer) {
                clearInterval(window._dyLoadTimer);
                window._dyLoadTimer = null;
            }
            window._dyLoadTimer = setTimeout(doScrollLoad, 250);
        } else {
            stableCount++;
            if (stableCount >= 3) {
                scrollContainer.scrollTop = originalScrollTop;
                window._dyLoadingContacts = false;
                if (window._dyLoadTimer) {
                    clearInterval(window._dyLoadTimer);
                    window._dyLoadTimer = null;
                }
                extractAndUpdate();
                updateFloatWindow();
                return;
            } else {
                scrollContainer.scrollTop += step;
                if (window._dyLoadTimer) {
                    clearInterval(window._dyLoadTimer);
                    window._dyLoadTimer = null;
                }
                window._dyLoadTimer = setTimeout(doScrollLoad, 250);
            }
        }
    }
    const initialCount = extractAndUpdate();
    if (initialCount === 0) {
        scrollContainer.scrollTop = 0;
        setTimeout(() => {
            window._dyLoadingContacts = false;
            if (window._dyLoadTimer) {
                clearInterval(window._dyLoadTimer);
                window._dyLoadTimer = null;
            }
            extractAndUpdate();
            updateFloatWindow();
        }, 300);
        return;
    }
    previousCount = initialCount;
    window._dyLoadTimer = setTimeout(doScrollLoad, 200);
}

function updateContactsInfo() {
    const panel = document.querySelector(SEL.imPortal) || document.getElementById('im-entry-vmok-popup-portal');
    if (!panel) return;
    const list = panel.querySelector('.conversationConversationListwrapper') ||
        panel.querySelector('.componentsLeftPanelboxList');
    if (!list) return;
    let items = list.querySelectorAll(SEL.convItem);
    if (items.length === 0) {
        items = list.querySelectorAll('.conversationConversationItemwrapper');
    }
    let updated = false;
    items.forEach(item => {
        const titleEl = item.querySelector(SEL.convTitle);
        if (!titleEl) return;
        const name = titleEl.textContent.trim();
        if (!name) return;
        if (contactMap.has(name)) {
            const existing = contactMap.get(name);
            const avatarImg = item.querySelector('.commonIMAvataravatarContainer img') ||
                item.querySelector('.semi-avatar-img img');
            if (avatarImg) existing.avatar = avatarImg.src || existing.avatar;
            const previewEl = item.querySelector(SEL.convPreview);
            if (previewEl) existing.preview = previewEl.textContent.trim() || existing.preview;
            const timeEl = item.querySelector(SEL.convTime);
            if (timeEl) existing.time = timeEl.textContent.trim() || existing.time;
            const badge = item.querySelector(SEL.convUnread);
            if (badge) existing.unread = badge.textContent.trim() || existing.unread;
            existing.element = item;
            updated = true;
        }
    });
    if (updated) {
        saveContactsToStorage();
        updateFloatWindow();
    }
}

function updateFloatWindow() {
    if (!msgFloatContent) return;
    if (contactMap.size === 0) {
        msgFloatContent.innerHTML = `<div class="dy-empty">暂无消息</div>`;
        return;
    }
    const contacts = Array.from(contactMap.values());
    contacts.sort((a, b) => {
        if (a.time && b.time) return b.time.localeCompare(a.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return a.name.localeCompare(b.name);
    });
    let html = '';
    for (const c of contacts) {
        const unreadBadge = c.unread && c.unread !== '0' ? `<span class="dy-badge">${c.unread}</span>` : '';
        const avatarHtml = c.avatar ? `<img src="${c.avatar}" />` : '';
        html += `
<div class="dy-contact-item" data-name="${c.name}">
<div class="dy-avatar">${avatarHtml}</div>
<div class="dy-info">
<div class="dy-name">${c.name} ${unreadBadge}</div>
<div class="dy-preview">${c.preview || '无消息'}</div>
</div>
<div class="dy-time">${c.time || ''}</div>
</div>
`;
    }
    msgFloatContent.innerHTML = html;
    msgFloatContent.querySelectorAll('.dy-contact-item').forEach(el => {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.dataset.name;
            if (name) {
                hideFloatImmediate();
                jumpToConversation(name);
            }
        });
    });
}

function hideFloatImmediate() {
    msgFloatWindow.style.opacity = '0';
    msgFloatWindow.style.transform = 'translateY(-6px)';
    msgFloatWindow.style.clipPath = 'inset(0 0 100% 0 round 12px)';
    msgFloatWindow.style.pointerEvents = 'none';
    msgFloatVisible = false;
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
    setTimeout(() => {
        if (!msgFloatVisible) msgFloatWindow.style.display = 'none';
    }, 320);
}

function jumpToConversation(name) {
    if (isImPanelVisible()) {
        clickNativeItem(name);
        return;
    }
    if (!msgButton) return;
    msgButton.click();
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(() => {
        attempts++;
        if (isImPanelVisible()) {
            clearInterval(interval);
            clickNativeItem(name);
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.warn('消息面板未能在规定时间内打开');
        }
    }, 200);
}

function clickNativeItem(name) {
    let nativeItems = document.querySelectorAll('#im-entry-vmok-popup-portal [data-e2e="conversation-item"]');
    if (nativeItems.length === 0) {
        nativeItems = document.querySelectorAll('#im-entry-vmok-popup-portal .conversationConversationItemwrapper');
    }
    if (!nativeItems.length) {
        console.warn('未找到消息面板列表，可能尚未加载');
        return;
    }
    let target = null;
    for (const native of nativeItems) {
        const nativeTitle = native.querySelector(SEL.convTitle);
        if (nativeTitle && nativeTitle.textContent.trim() === name) {
            target = native;
            break;
        }
    }
    if (!target) {
        const lowerName = name.toLowerCase();
        for (const native of nativeItems) {
            const nativeTitle = native.querySelector(SEL.convTitle);
            if (nativeTitle) {
                const titleText = nativeTitle.textContent.trim();
                if (titleText.toLowerCase().includes(lowerName) || lowerName.includes(titleText.toLowerCase())) {
                    target = native;
                    break;
                }
            }
        }
    }
    if (!target) {
        for (const native of nativeItems) {
            const label = native.getAttribute('aria-label') || native.getAttribute('data-e2e');
            if (label && label.includes(name)) {
                target = native;
                break;
            }
        }
    }
    if (target) {
        target.click();
        ['mousedown', 'mouseup', 'click'].forEach(evt => {
            target.dispatchEvent(new MouseEvent(evt, {
                bubbles: true
            }));
        });
        console.log('✓ 已跳转到:', name);
    } else {
        console.warn('未找到联系人:', name);
    }
}
// =========================================================
//        全局 Tooltip（脱离菜单容器，避免被裁切）
// =========================================================
function initGlobalTooltip() {
    if (document.getElementById('dyGlobalTooltip')) return;
    const tip = document.createElement('div');
    tip.id = 'dyGlobalTooltip';
    (document.body || document.documentElement).appendChild(tip);
    let currentTarget = null;

    function position(target) {
        const rect = target.getBoundingClientRect();
        void tip.offsetHeight;
        const tipRect = tip.getBoundingClientRect();
        const margin = 8;
        const pad = 10;
        let left = rect.left + rect.width / 2 - tipRect.width / 2;
        if (left < pad) left = pad;
        if (left + tipRect.width > window.innerWidth - pad) {
            left = window.innerWidth - tipRect.width - pad;
        }
        let top = rect.top - tipRect.height - margin;
        if (top < pad) {
            top = rect.bottom + margin;
        }
        if (top + tipRect.height > window.innerHeight - pad) {
            top = window.innerHeight - tipRect.height - pad;
        }
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
    }
    let showTimer = null;
    let hideTimer = null;
    const getShowDelay = () => {
        const v = Number(settings.tooltipShowDelay);
        return Number.isFinite(v) ? Math.max(0, v) : 700;
    };
    const getHideDelay = () => {
        const v = Number(settings.tooltipHideDelay);
        return Number.isFinite(v) ? Math.max(0, v) : 100;
    };

    function clearShowTimer() {
        if (showTimer) {
            clearTimeout(showTimer);
            showTimer = null;
        }
    }

    function clearHideTimer() {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    }

    function showTip(el) {
        currentTarget = el;
        tip.textContent = el.dataset.tip;
        tip.classList.add('dy-tooltip-show');
        position(el);
    }

    function hideTip() {
        clearShowTimer();
        clearHideTimer();
        tip.classList.remove('dy-tooltip-show');
        currentTarget = null;
    }
    // ★ [新增] 目标是否还在页面上且可见（元素被 Vue 重渲染 / display:none 检测）
    function isTargetAlive(el) {
        if (!el) return false;
        if (!el.isConnected) return false;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        return true;
    }
    // ---------- mouseover ----------
    document.addEventListener('mouseover', (e) => {
        const tipEl = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
        if (!tipEl) return;
        const from = e.relatedTarget;
        if (from && tipEl.contains(from)) return; // 内部移动，忽略
        // 从当前 tooltip 元素内部绕回来 → 取消隐藏
        if (tipEl === currentTarget) {
            clearHideTimer();
            return;
        }
        // ★ 关键修复：切换到新的 tip 目标时，立即收起旧的
        //   不再"无条件 clearHideTimer"，避免旧 tip 的隐藏被意外取消
        if (currentTarget) hideTip();
        clearShowTimer();
        showTimer = setTimeout(() => {
            showTimer = null;
            if (!isTargetAlive(tipEl)) return; // ★ 二次确认：元素仍存活
            showTip(tipEl);
        }, getShowDelay());
    }, true);
    // ---------- mousemove ----------
    document.addEventListener('mousemove', () => {
        if (!currentTarget) return;
        // ★ 兜底 1：目标被移除或隐藏（如菜单关闭、Vue 重渲染）→ 立即收起
        if (!isTargetAlive(currentTarget)) {
            hideTip();
            return;
        }
        position(currentTarget);
    }, true);
    // ---------- mouseout ----------
    document.addEventListener('mouseout', (e) => {
        const tipEl = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
        if (!tipEl) return;
        const to = e.relatedTarget;
        if (to && tipEl.contains(to)) return; // 内部移动，忽略
        clearShowTimer(); // 真正离开：杀掉待弹出的 showTimer
        if (tipEl === currentTarget) {
            clearHideTimer();
            hideTimer = setTimeout(() => {
                hideTimer = null;
                // ★ 二次确认：鼠标没绕回来
                if (currentTarget === tipEl) hideTip();
            }, getHideDelay());
        }
    }, true);
    // ---------- 位置跟随滚动 ----------
    document.addEventListener('scroll', () => {
        if (currentTarget) position(currentTarget);
    }, true);
    // ---------- 兜底 2：鼠标离开浏览器窗口 ----------
    document.addEventListener('mouseleave', () => {
        hideTip();
    });
    // ---------- 兜底 3：切 tab / 窗口失焦 ----------
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) hideTip();
    });
    window.addEventListener('blur', () => {
        hideTip();
    });
    // ---------- 兜底 4：对外暴露 hideTip，供菜单关闭等场景主动调用 ----------
    window.__dyHideTooltip = hideTip;
}
// =========================================================
//  [重构] 容器选择方式探测（自检用）
// =========================================================
function detectSelectorMode() {
    const mode = {
        danmuContainer: '未命中',
        containerId: '未命中',
        feedCard: '未命中',
        cardFingerprint: '未命中',
        videoTextSource: '未命中',
        nextBtn: '未命中',
        qualityItem: '未命中',
        msgEntry: '未命中',
        convItem: '未命中',
        quickPlayer: '已停用（DOM 兜底）',
    };
    const danmuEl = document.querySelector(SEL.danmuItem);
    if (danmuEl) {
        if (danmuEl.closest('[data-e2e="feed-active-video"]')) mode.danmuContainer = '[data-e2e="feed-active-video"]（新·优选）';
        else if (danmuEl.closest('#sliderVideo')) mode.danmuContainer = '#sliderVideo（同节点，兼容）';
        else if (danmuEl.closest('[data-e2e="feed-item"]')) mode.danmuContainer = '[data-e2e="feed-item"]（次优）';
    } else {
        mode.danmuContainer = '(无弹幕元素，无法判定)';
    }
    const activeEl = document.querySelector(SEL.activeVideoId);
    if (activeEl && activeEl.getAttribute('data-e2e-vid')) {
        mode.containerId = 'data-e2e-vid（优）';
    } else if (document.querySelector('[data-e2e-vid]')) {
        mode.containerId = 'container[data-e2e-vid]';
    } else if (getQuickPlayerInfo() && getQuickPlayerInfo().awemeId) {
        mode.containerId = 'quick-player.awemeId';
    } else {
        mode.containerId = 'outerHTML 兜底';
    }
    const activeCard = document.querySelector(SEL.activeVideo);
    if (activeCard && activeCard.closest(SEL.feedItem)) {
        mode.feedCard = 'active-video.closest(feed-item)（优）';
    } else if (document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)?.closest(SEL.feedItem)) {
        mode.feedCard = 'elementFromPoint 兜底';
    }
    if (document.querySelector(SEL.activeVideoId)) {
        mode.cardFingerprint = 'data-e2e-vid（优）';
    } else if (getQuickPlayerInfo()?.awemeId) {
        mode.cardFingerprint = 'quick-player.awemeId';
    } else if (document.querySelector('video')?.src) {
        mode.cardFingerprint = 'video.src';
    } else if (document.querySelector(SEL.feedItem)) {
        mode.cardFingerprint = 'text 兜底';
    }
    const qp = getQuickPlayerInfo();
    if (settings.preferQuickPlayer !== false && qp && (qp.desc || qp.author)) {
        mode.videoTextSource = 'quick-player（优·已开启）';
    } else if (document.querySelector(SEL.videoDesc) || document.querySelector(SEL.nickname)) {
        mode.videoTextSource = 'DOM data-e2e（dom）';
    }
    if (document.querySelector(SEL.nextArrow)) {
        mode.nextBtn = '[data-e2e="video-switch-next-arrow"]（优）';
    } else if (document.querySelector('.xgplayer-playswitch-next')) {
        mode.nextBtn = '.xgplayer-playswitch-next（兜底）';
    }
    if (document.querySelector(SEL.clarityItem)) {
        mode.qualityItem = '.virtual .item（优）';
    } else if (document.querySelector('.xgplayer-playclarity-setting .virtual > div')) {
        mode.qualityItem = '.virtual > div（兜底）';
    }
    if (document.querySelector(SEL.imEntry)) {
        mode.msgEntry = '[data-e2e="im-entry"]（优）';
    } else if (document.querySelector('[data-e2e="something-button"]')) {
        mode.msgEntry = '[data-e2e="something-button"]（兜底）';
    }
    if (document.querySelector(SEL.convItem)) {
        mode.convItem = '[data-e2e="conversation-item"]（优）';
    } else if (document.querySelector('.conversationConversationItemwrapper')) {
        mode.convItem = '.conversationConversationItemwrapper（兜底）';
    } else {
        mode.convItem = '(消息列表未打开，无法判定)';
    }
    if (qp && qp.awemeId) {
        mode.quickPlayer = `可用（awemeId: ${qp.awemeId}）`;
    } else {
        mode.quickPlayer = '抖音未暴露（已使用 DOM 兜底）';
    }
    return mode;
}
// =========================================================
//  [新增] 当前视频分辨率检测（自检用 · 常驻实时刷新）
// =========================================================
function detectVideoResolution() {
    // 找到当前活跃播放器（复用画质模块的兜底逻辑）
    let player = null;
    try {
        player = getActivePlayer();
    } catch (e) {}
    // 拿 video 元素：优先活跃播放器里，其次页面上面积最大的
    let video = player ? player.querySelector('video') : null;
    if (!video) {
        const all = document.querySelectorAll('video');
        let best = null,
            bestArea = 0;
        for (const v of all) {
            const r = v.getBoundingClientRect();
            const w = Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(r.left, 0));
            const h = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
            const a = w * h;
            if (a > bestArea) {
                bestArea = a;
                best = v;
            }
        }
        video = best;
    }
    if (!video) {
        return {
            ok: false,
            reason: '未找到 video 元素'
        };
    }
    const vw = video.videoWidth || 0;
    const vh = video.videoHeight || 0;
    const readyState = video.readyState;
    const paused = video.paused;
    if (!vw || !vh) {
        return {
            ok: false,
            reason: '视频尚未加载元数据（readyState=' + readyState + '）',
            readyState,
            paused,
        };
    }
    // 横竖屏 / 方形
    let orientation = '横屏';
    if (vh > vw) orientation = '竖屏';
    else if (vh === vw) orientation = '方形';
    // 档位标签（按短边判定）
    const shortSide = Math.min(vw, vh);
    let tier = '其他';
    if (shortSide >= 2160) tier = '4K';
    else if (shortSide >= 1440) tier = '2K';
    else if (shortSide >= 1080) tier = '1080P';
    else if (shortSide >= 720) tier = '720P';
    else if (shortSide >= 480) tier = '480P';
    else if (shortSide >= 360) tier = '360P';
    else if (shortSide > 0) tier = '低于 360P';
    // UI 画质信息
    let uiCurrentText = '';
    let uiBestText = '';
    if (player) {
        const btn = player.querySelector('.xgplayer-playclarity-setting .btn');
        const cur = player.querySelector(SEL.claritySelected);
        const opts = player.querySelectorAll(SEL.clarityOptions);
        let bestItem = null,
            bestScore = -1;
        opts.forEach(el => {
            const text = el.textContent.trim();
            const score = scoreQualityText(text);
            if (score > bestScore) {
                bestScore = score;
                bestItem = el;
            }
        });
        uiCurrentText = cur ? cur.textContent.trim() : (btn ? btn.textContent.trim() : '');
        uiBestText = bestItem ? bestItem.textContent.trim() : '';
    }
    return {
        ok: true,
        width: vw,
        height: vh,
        aspect: (vw / vh).toFixed(3),
        orientation,
        tier,
        readyState,
        paused,
        uiCurrentText,
        uiBestText,
    };
}
// 把检测结果格式化成一行可读文本（供自检面板和定时器复用）
function formatResolutionLine(res) {
    if (!res || !res.ok) {
        return '⚠ ' + ((res && res.reason) || '无法检测');
    }
    let line = res.width + '×' + res.height +
        ' · ' + res.tier +
        ' · ' + res.orientation +
        ' · AR ' + res.aspect;
    if (res.uiCurrentText) {
        line += ' · UI: ' + res.uiCurrentText;
        if (res.uiBestText && res.uiBestText !== res.uiCurrentText) {
            line += ' (最高可选: ' + res.uiBestText + ')';
        }
        const uiExpected = parseExpectedResolution(res.uiCurrentText);
        if (uiExpected > 0 && res.height < uiExpected * 0.7) {
            line += ' ⚠ UI 标称与视频流不符';
        }
    }
    return line;
}
// =========================================================
//                   插件自检
// =========================================================
function runSelfCheck() {
    const groups = [];
    const push = (list, name, status, detail) => list.push({
        name,
        status,
        detail
    });
    let okCount = 0,
        warnCount = 0,
        failCount = 0;
    const envGroup = {
        title: dyIconSvg('layers') + ' 环境',
        items: []
    };
    push(envGroup.items, '脚本版本', 'ok', 'v' + SCRIPT_VERSION);
    push(envGroup.items, '当前域名', /douyin\.com/.test(location.hostname) ? 'ok' : 'fail', location.hostname);
    let pageType = '未知页面';
    const href = location.href;
    if (href.includes('live.douyin.com')) pageType = '直播间';
    else if (href.includes('/video/')) pageType = '视频详情页';
    else if (document.querySelector(SEL.feedItem)) pageType = '推荐流';
    else if (/^https:\/\/www\.douyin\.com\/?$/.test(href)) pageType = '首页';
    else pageType = '其他页面';
    push(envGroup.items, '页面类型', 'ok', pageType);
    const urlBrief = href.length > 70 ? href.slice(0, 67) + '...' : href;
    push(envGroup.items, 'URL', 'ok', urlBrief);
    groups.push(envGroup);
    const depGroup = {
        title: dyIconSvg('database') + ' 依赖与权限',
        items: []
    };
    let vueOk = false,
        vueVer = '';
    try {
        vueOk = (typeof Vue !== 'undefined');
        vueVer = vueOk ? ('v' + (Vue.version || '?')) : '';
    } catch (e) {}
    push(depGroup.items, 'Vue.js', vueOk ? 'ok' : 'fail', vueOk ? vueVer + ' · 已加载' : '未加载（CDN 可能被墙）');
    let hasUnsafe = false;
    try {
        hasUnsafe = typeof unsafeWindow !== 'undefined';
    } catch (e) {}
    push(depGroup.items, 'unsafeWindow', hasUnsafe ? 'ok' : 'warn', hasUnsafe ? '已授权' : '未声明（需 @grant）');
    let gmOk = false;
    try {
        GM_getValue('__dy_selfcheck', '');
        gmOk = true;
    } catch (e) {}
    push(depGroup.items, 'GM 存储 API', gmOk ? 'ok' : 'fail', gmOk ? 'GM_getValue / GM_setValue 可用' : '读写出错');
    let gmHandler = '';
    try {
        gmHandler = (typeof GM_info !== 'undefined') ? (GM_info.scriptHandler || '未知') : '';
    } catch (e) {}
    push(depGroup.items, '脚本管理器', gmHandler ? 'ok' : 'warn', gmHandler ? gmHandler : 'GM_info 不可用');
    groups.push(depGroup);
    const storageGroup = {
        title: dyIconSvg('database') + ' 存储',
        items: []
    };
    let ssOk = false;
    try {
        sessionStorage.setItem('__dy_t', '1');
        sessionStorage.removeItem('__dy_t');
        ssOk = true;
    } catch (e) {}
    push(storageGroup.items, 'sessionStorage', ssOk ? 'ok' : 'warn', ssOk ? '可用（开屏封面可正常显示）' : '不可用（开屏封面将失效）');
    let lsOk = false;
    try {
        localStorage.setItem('__dy_t', '1');
        localStorage.removeItem('__dy_t');
        lsOk = true;
    } catch (e) {}
    push(storageGroup.items, 'localStorage', lsOk ? 'ok' : 'warn', lsOk ? '可用' : '不可用（隐私模式可能受限）');
    const stored = GM_getValue('DY_Settings', {});
    const missing = [];
    for (const k in DEFAULT_SETTINGS) {
        if (!(k in stored)) missing.push(k);
    }
    push(storageGroup.items, '配置完整性', missing.length === 0 ? 'ok' : 'warn',
        missing.length === 0 ?
        ('全部 ' + Object.keys(DEFAULT_SETTINGS).length + ' 项字段齐全') :
        ('缺 ' + missing.length + ' 项：' + missing.slice(0, 3).join('、') + (missing.length > 3 ? ' 等' : '')));
    push(storageGroup.items, '已存字段数', 'ok', Object.keys(stored).length + ' 项');
    groups.push(storageGroup);
    const timerGroup = {
        title: dyIconSvg('clock') + ' 核心定时器',
        items: []
    };
    push(timerGroup.items, '画质轮询', timerQuality ? 'ok' : 'warn',
        timerQuality ? ('运行中 · 间隔 ' + (settings.pollingQuality || 1.5) + 's') : '未启动');
    push(timerGroup.items, '弹幕轮询', timerDanmu ? 'ok' : 'warn',
        timerDanmu ? ('运行中 · 间隔 ' + (settings.pollingDanmu || 0.5) + 's') : '未启动');
    push(timerGroup.items, '跳过检测', timerSkip ? 'ok' : 'warn',
        timerSkip ? ('运行中 · 间隔 ' + (settings.skipVideoPolling || 0.3) + 's') : '未启动');
    groups.push(timerGroup);
    const modGroup = {
        title: dyIconSvg('layers') + ' 功能模块',
        items: []
    };
    if (typeof PauseGuard !== 'undefined') {
        const subKeys = [
            ['pauseGuard_visibilitySpoof', '可见性伪装'],
            ['pauseGuard_eventBlocking', '事件拦截'],
            ['pauseGuard_rafReplacement', 'rAF 替换'],
            ['pauseGuard_mouseSimulation', '鼠标模拟'],
            ['pauseGuard_popupClick', '弹窗点击'],
            ['pauseGuard_backgroundResume', '后台静音恢复'],
        ];
        const onSubs = subKeys.filter(kv => settings[kv[0]] !== false).map(kv => kv[1]);
        const offSubs = subKeys.filter(kv => settings[kv[0]] === false).map(kv => kv[1]);
        const en = PauseGuard.isEnabled();
        let detail;
        if (en) {
            detail = '总开关开启 · 子模块 ' + onSubs.length + '/6 已启用';
            if (offSubs.length > 0) detail += ' · 关闭：' + offSubs.join('、');
        } else {
            detail = '总开关已关闭（子模块配置保留 ' + onSubs.length + '/6）';
        }
        push(modGroup.items, 'PauseGuard', en ? 'ok' : 'warn', detail);
    } else {
        push(modGroup.items, 'PauseGuard', 'fail', '未初始化');
    }
    push(modGroup.items, 'DOM 观察器', window._dyObserver ? 'ok' : 'warn',
        window._dyObserver ? '运行中（监控页面 DOM 变化）' : '未启动');
    const navBtn = document.querySelector(SEL.tabScriptMenu);
    push(modGroup.items, '导航栏按钮', navBtn ? 'ok' : 'warn',
        navBtn ? '已注入（导航栏可见「脚本」）' : (settings.enableNavButton ? '未注入（可能不在首页）' : '用户已关闭'));
    const msgBtn = document.querySelector(SEL.imEntry) || document.querySelector('[data-e2e="something-button"]');
    push(modGroup.items, '消息悬浮窗', settings.enableMsgFloat ? (msgBtn ? 'ok' : 'warn') : 'warn',
        !settings.enableMsgFloat ? '用户已关闭' :
        (msgBtn ? '已启用 · 消息按钮存在' : '已启用 · 但未找到消息按钮'));
    push(modGroup.items, '开屏封面', settings.enableSplashScreen ? (ssOk ? 'ok' : 'warn') : 'warn',
        !settings.enableSplashScreen ? '用户已关闭' :
        (ssOk ? '已启用 · sessionStorage 可用' : '已启用 · 但 sessionStorage 不可用'));
    const immersiveOn = isImmersiveOn();
    push(modGroup.items, '清屏持久化',
        settings.enableImmersivePersist ? (immersiveOn !== null ? 'ok' : 'warn') : 'warn',
        !settings.enableImmersivePersist ? '用户已关闭' :
        (immersiveOn !== null ?
            ('已启用 · 当前清屏：' + (immersiveOn ? '开' : '关') + ' · 记忆：' + (settings.immersiveState ? '开' : '关')) :
            '已启用 · 播放器未加载'));
    if (typeof LotteryModule !== 'undefined') {
        push(modGroup.items, '福袋自动抢',
            settings.enableLottery ? (LotteryModule.isLiveRoomUrl() ? 'ok' : 'warn') : 'warn',
            !settings.enableLottery ? '用户已关闭' :
            (LotteryModule.isLiveRoomUrl() ?
                '已启用 · 直播间页 · 浮窗' + (settings.lotteryShowFloatPanel ? '开' : '关') :
                '已启用 · 但当前非直播间页'));
    }
    groups.push(modGroup);
    const selGroup = {
        title: dyIconSvg('target') + ' 容器选择方式（检修用）',
        items: []
    };
    const sm = detectSelectorMode();
    const mark = (val) => {
        if (!val || val === '未命中') return 'warn';
        if (val.indexOf('兜底') >= 0 || val.indexOf('旧') >= 0) return 'warn';
        if (val.indexOf('无') === 0 || val.indexOf('(') === 0) return 'warn';
        return 'ok';
    };
    push(selGroup.items, '弹幕容器', mark(sm.danmuContainer), sm.danmuContainer);
    push(selGroup.items, '容器 ID 来源', mark(sm.containerId), sm.containerId);
    push(selGroup.items, '卡片定位', mark(sm.feedCard), sm.feedCard);
    push(selGroup.items, '卡片指纹', mark(sm.cardFingerprint), sm.cardFingerprint);
    push(selGroup.items, '视频文本源', mark(sm.videoTextSource), sm.videoTextSource);
    push(selGroup.items, '下一条按钮', mark(sm.nextBtn), sm.nextBtn);
    push(selGroup.items, '画质选项', mark(sm.qualityItem), sm.qualityItem);
    push(selGroup.items, '消息入口', mark(sm.msgEntry), sm.msgEntry);
    push(selGroup.items, '会话项', mark(sm.convItem), sm.convItem);
    push(selGroup.items, '__QUICK_PLAYER', 'ok',
        sm.quickPlayer.startsWith('可用') ? sm.quickPlayer :
        '抖音已停止暴露（已全面使用 DOM 兜底，功能正常）');
    groups.push(selGroup);
    const domGroup = {
        title: dyIconSvg('target') + ' 抖音 DOM 适配',
        items: []
    };
    const feedItems = document.querySelectorAll(SEL.feedItem);
    push(domGroup.items, '卡片 feed-item', feedItems.length > 0 ? 'ok' : 'warn',
        feedItems.length > 0 ? (feedItems.length + ' 个卡片') : '未找到（可能不在推荐流）');
    const videos = document.querySelectorAll('video');
    const playingCount = Array.from(videos).filter(v => !v.paused).length;
    const readyCount = Array.from(videos).filter(v => v.readyState >= 2).length;
    push(domGroup.items, '视频元素 video', videos.length > 0 ? 'ok' : 'warn',
        videos.length > 0 ? (videos.length + ' 个 · ' + playingCount + ' 播放中 · ' + readyCount + ' 就绪') : '未找到');
    // ★ 当前视频分辨率（常驻实时刷新）
    const _res = detectVideoResolution();
    const _resConflict = /⚠/.test(formatResolutionLine(_res));
    push(domGroup.items, '当前视频分辨率',
        _resConflict ? 'warn' : 'ok',
        '<span data-dy-res>' + formatResolutionLine(_res) + '</span>');
    const nextBtn = document.querySelector(SEL.nextArrow) || document.querySelector('.xgplayer-playswitch-next');
    push(domGroup.items, '切换按钮', nextBtn ? 'ok' : 'warn',
        nextBtn ? '存在（"下一个"按钮可用）' : '未找到（跳过功能靠键盘 ArrowDown 兜底）');
    const danmu = document.querySelectorAll(SEL.danmuItem);
    push(domGroup.items, '弹幕元素', danmu.length > 0 ? 'ok' : 'warn',
        danmu.length > 0 ? (danmu.length + ' 条在屏弹幕') : '未找到（可能弹幕未开启）');
    const microgame = document.querySelector(SEL.tabMicrogame);
    push(domGroup.items, '导航栏 tab-microgame', microgame ? 'ok' : 'warn',
        microgame ? '存在（导航栏按钮的锚点）' : '未找到（导航栏按钮无法注入）');
    groups.push(domGroup);
    const toggleGroup = {
        title: dyIconSvg('settings') + ' 功能开关状态',
        items: []
    };
    const switches = [
        ['blockedDanmu_Switch', '弹幕屏蔽'],
        ['skipLive_Switch', '跳过直播'],
        ['skipVideoRegex_Switch', '正则屏蔽视频'],
        ['enableQualitySwitch', '智能画质切换'],
        ['enablePayHide', '隐藏礼物面板'],
        ['enableMirror', '视频镜像'],
        ['enableGiftFilter', '礼物消息过滤'],
        ['hideNonVideoElements_Switch', '隐藏非视频元素'],
        ['enableKeepAlive', '全局防暂停'],
        ['enableKeyboardShortcuts', '键盘快捷键'],
        ['enableNavButton', '导航栏按钮'],
        ['enableMsgFloat', '消息悬浮窗'],
        ['enableSplashScreen', '开屏封面'],
        ['consoleOutputLog_Switch', '控制台日志'],
        ['debugMode', '全功能调试'],
        ['preferQuickPlayer', '优先运行时视频信息'],
        ['enableLottery', '福袋自动抢'],
    ];
    const onList = [],
        offList = [];
    for (const [key, label] of switches) {
        if (settings[key]) onList.push(label);
        else offList.push(label);
    }
    push(toggleGroup.items, '已开启（' + onList.length + '/' + switches.length + '）', 'ok', onList.join('、') || '无');
    push(toggleGroup.items, '已关闭（' + offList.length + '）', 'ok', offList.join('、') || '无');
    groups.push(toggleGroup);
    for (const g of groups) {
        for (const it of g.items) {
            if (it.status === 'ok') okCount++;
            else if (it.status === 'warn') warnCount++;
            else if (it.status === 'fail') failCount++;
        }
    }
    return {
        groups,
        okCount,
        warnCount,
        failCount
    };
}
// =========================================================
//              报告面板统一配色（跟随主题）
// =========================================================
function getReportPalette() {
    const isLight = (typeof ThemeManager !== 'undefined') ?
        ThemeManager.getTheme() === 'light' :
        document.documentElement.getAttribute('data-dy-theme') === 'light';
    if (isLight) {
        return {
            panelBg: 'rgba(255,255,255,0.30)',
            headerBg: 'rgba(255,255,255,0.30)',
            text: '#1c1c1e',
            textDim: 'rgba(0,0,0,0.65)',
            textFaint: 'rgba(0,0,0,0.4)',
            divider: 'rgba(0,0,0,0.12)',
            cardBg: 'rgba(0,0,0,0.05)',
            border: 'rgba(0,0,0,0.12)',
            shadow: '0 12px 40px rgba(0,0,0,0.18)',
            closeColor: 'rgba(0,0,0,0.55)',
            ok: '#2E7D32',
            warn: '#E65100',
            fail: '#C62828',
            okBg: 'rgba(76,175,80,0.16)',
            warnBg: 'rgba(255,152,0,0.18)',
            failBg: 'rgba(211,47,47,0.14)',
            copyBtn: '#0288D1',
            rerunBtn: '#2E7D32',
            clearBtn: '#C62828',
            btnText: '#ffffff',
            stackBg: 'rgba(0,0,0,0.06)',
            stackText: 'rgba(0,0,0,0.7)',
        };
    }
    return {
        panelBg: 'rgba(32,32,36,0.72)',
        headerBg: 'rgba(32,32,36,0.55)',
        text: '#eee',
        textDim: '#bbb',
        textFaint: 'rgba(255,255,255,0.4)',
        divider: 'rgba(255,255,255,0.12)',
        cardBg: 'rgba(0,0,0,0.3)',
        border: 'rgba(255,255,255,0.12)',
        shadow: '0 12px 40px rgba(0,0,0,0.7)',
        closeColor: '#aaa',
        ok: '#4CAF50',
        warn: '#ffa500',
        fail: '#ff6b6b',
        okBg: 'rgba(76,175,80,0.2)',
        warnBg: 'rgba(255,152,0,0.2)',
        failBg: 'rgba(220,50,50,0.2)',
        copyBtn: '#00aeec',
        rerunBtn: '#4CAF50',
        clearBtn: '#d32f2f',
        btnText: '#ffffff',
        stackBg: 'rgba(0,0,0,0.3)',
        stackText: '#999',
    };
}
// =========================================================
//  [新增] 崩溃报告 - 快照收集
// =========================================================
function collectEnvSnapshot() {
    const env = {};
    try {
        if (typeof GM_info !== 'undefined') {
            env.scriptHandler = GM_info.scriptHandler || '未知';
            env.scriptHandlerVersion = GM_info.version || '';
            env.scriptVersion = SCRIPT_VERSION;
        }
    } catch (e) {
        env.scriptHandler = '不可用';
    }
    try {
        env.platform = (navigator.userAgentData && navigator.userAgentData.platform) ||
            navigator.platform || '未知';
        env.language = navigator.language || '';
        env.hardwareConcurrency = navigator.hardwareConcurrency || '未知';
        env.deviceMemory = navigator.deviceMemory || '未知';
        env.devicePixelRatio = window.devicePixelRatio || 1;
        env.screenSize = screen.width + '×' + screen.height;
        env.viewport = window.innerWidth + '×' + window.innerHeight;
    } catch (e) {}
    try {
        env.readyState = document.readyState;
        const href = location.href;
        if (href.includes('live.douyin.com')) env.pageType = '直播间';
        else if (href.includes('/video/')) env.pageType = '视频详情页';
        else if (document.querySelector('[data-e2e="feed-item"]')) env.pageType = '推荐流';
        else if (/^https:\/\/www\.douyin\.com\/?$/.test(href)) env.pageType = '首页';
        else env.pageType = '其他';
        env.url = String(href).slice(0, 200);
    } catch (e) {}
    return env;
}

function collectRuntimeSnapshot() {
    const rs = {};
    rs.timerQuality = !!timerQuality;
    rs.timerDanmu = !!timerDanmu;
    rs.timerSkip = !!timerSkip;
    rs.danmuSyncTimer = !!danmuSyncTimer;
    rs.immersiveTimer = !!timerImmersive;
    rs.domObserver = !!window._dyObserver;
    try {
        if (typeof PauseGuard !== 'undefined') {
            rs.pauseGuardEnabled = PauseGuard.isEnabled();
            rs.pauseGuardEligibleVideos = PauseGuard.eligibleCount;
            rs.pauseGuardRealHidden = PauseGuard.realHidden();
        }
    } catch (e) {}
    try {
        rs.monitorBufferSize = Monitor.getBuffer().length;
    } catch (e) {}
    try {
        rs.switches = {
            enableKeepAlive: !!settings.enableKeepAlive,
            enableQualitySwitch: !!settings.enableQualitySwitch,
            enableImmersivePersist: !!settings.enableImmersivePersist,
            blockedDanmu_Switch: !!settings.blockedDanmu_Switch,
            skipLive_Switch: !!settings.skipLive_Switch,
            skipVideoRegex_Switch: !!settings.skipVideoRegex_Switch,
            enableLottery: !!settings.enableLottery,
            enableMsgFloat: !!settings.enableMsgFloat,
            enableNavButton: !!settings.enableNavButton,
            debugMode: !!settings.debugMode,
            consoleOutputLog_Switch: !!settings.consoleOutputLog_Switch,
            themeMode: settings.themeMode || 'auto',
        };
    } catch (e) {}
    try {
        const player = typeof getActivePlayer === 'function' ? getActivePlayer() : null;
        if (player) {
            const v = player.querySelector('video');
            if (v) {
                rs.video = {
                    readyState: v.readyState,
                    paused: v.paused,
                    width: v.videoWidth,
                    height: v.videoHeight,
                };
            }
        }
        rs.activeVideoId = typeof getCurrentVideoId === 'function' ? getCurrentVideoId() : '';
    } catch (e) {}
    // ★ 最后交互
    try {
        if (_lastInteraction && _lastInteraction.at > 0) {
            rs.lastInteraction = {
                timeStr: _lastInteraction.timeStr,
                agoMs: Date.now() - _lastInteraction.at,
                type: _lastInteraction.type,
                target: _lastInteraction.target,
            };
        }
    } catch (e) {}
    return rs;
}

function collectMonitorTail(n) {
    try {
        return Monitor.getBuffer().slice(-(n || 30));
    } catch (e) {
        return [];
    }
}
// =========================================================
//   [新增] 实时监控浮窗
// =========================================================
const MonitorWindow = (function() {
    const POS_KEY = 'DY_MonitorPos';
    const MAX_RENDER = 400;
    let win = null;
    let bodyEl = null;
    let footerStatsEl = null;
    let unsub = null;
    let autoScroll = true;
    let visibleCount = 0;

    function clampPos(left, top) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = (win && win.offsetWidth) || 380;
        const h = (win && win.offsetHeight) || 400;
        left = Math.max(-w + 80, Math.min(left, vw - 60));
        top = Math.max(0, Math.min(top, vh - 40));
        return {
            left,
            top
        };
    }

    function makeDraggable(panel, handle) {
        let isDragging = false,
            sx, sy, il, it;
        const onStart = (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('label')) return;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const rect = panel.getBoundingClientRect();
            il = rect.left;
            it = rect.top;
            sx = cx;
            sy = cy;
            isDragging = true;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = il + 'px';
            panel.style.top = it + 'px';
            handle.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            if (e.cancelable) e.preventDefault();
        };
        const onMove = (e) => {
            if (!isDragging) return;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const p = clampPos(il + (cx - sx), it + (cy - sy));
            panel.style.left = p.left + 'px';
            panel.style.top = p.top + 'px';
        };
        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            handle.style.cursor = '';
            document.body.style.userSelect = '';
            const rect = panel.getBoundingClientRect();
            try {
                GM_setValue(POS_KEY, {
                    left: Math.round(rect.left),
                    top: Math.round(rect.top)
                });
            } catch (e) {}
        };
        handle.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        handle.addEventListener('touchstart', onStart, {
            passive: false
        });
        document.addEventListener('touchmove', onMove, {
            passive: false
        });
        document.addEventListener('touchend', onEnd);
    }

    function appendEntry(entry) {
        if (!bodyEl) return;
        if (visibleCount > MAX_RENDER) {
            const first = bodyEl.firstChild;
            if (first) first.remove();
            visibleCount--;
        }
        const el = document.createElement('div');
        el.className = 'dy-monitor-entry' +
            (entry.level === 'error' ? ' dy-monitor-error' : '') +
            (entry.level === 'warn' ? ' dy-monitor-warn' : '') +
            (entry.level === 'ok' ? ' dy-monitor-ok' : '');
        const color = Monitor.getCategoryColor(entry.category);
        el.innerHTML = '<span class="dy-monitor-time">' + entry.timeStr + '</span>' +
            '<span class="dy-monitor-cat" style="color:' + color + '">' + escapeHtml(entry.category) + '</span>' +
            '<span class="dy-monitor-text">' + escapeHtml(entry.message) + '</span>';
        bodyEl.appendChild(el);
        visibleCount++;
        if (autoScroll) bodyEl.scrollTop = bodyEl.scrollHeight;
        updateStats();
    }

    function updateStats() {
        if (!footerStatsEl) return;
        footerStatsEl.textContent = '运行中 · 缓冲 ' + Monitor.getBuffer().length + ' 条';
    }

    function create() {
        if (win && win.parentNode) return;
        win = document.createElement('div');
        win.id = 'dyMonitorWindow';
        win.className = 'dy-monitor-hidden';
        win.innerHTML = '' +
            '<div id="dyMonitorTitle">' +
            '<span class="dy-monitor-dot"></span>' +
            '<span class="dy-monitor-title-text">插件实时监控</span>' +
            '<label class="dy-monitor-remember" title="勾选后，下次打开/刷新页面时自动弹出监控浮窗">' +
            '<input type="checkbox" id="dyMonitorRemember" />' +
            '<span>记忆</span>' +
            '</label>' +
            '<button id="dyMonitorClear" title="清空记录">🗑</button>' +
            '<button id="dyMonitorClose" title="关闭">✕</button>' +
            '</div>' +
            '<div id="dyMonitorBody"></div>' +
            '<div id="dyMonitorFooter">' +
            '<span id="dyMonitorStats">运行中 · 缓冲 0 条</span>' +
            '<label class="dy-monitor-auto" title="自动滚动到最新">' +
            '<input type="checkbox" id="dyMonitorAutoScroll" checked />' +
            '<span>自动滚动</span>' +
            '</label>' +
            '</div>';
        (document.body || document.documentElement).appendChild(win);
        bodyEl = win.querySelector('#dyMonitorBody');
        footerStatsEl = win.querySelector('#dyMonitorStats');
        try {
            const pos = GM_getValue(POS_KEY, null);
            if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
                const p = clampPos(pos.left, pos.top);
                win.style.left = p.left + 'px';
                win.style.top = p.top + 'px';
            }
        } catch (e) {}
        const rememberCb = win.querySelector('#dyMonitorRemember');
        rememberCb.checked = !!settings.monitorAutoOpen;
        rememberCb.addEventListener('change', () => {
            settings.monitorAutoOpen = rememberCb.checked;
            GM_setValue('DY_Settings', settings);
        });
        const autoCb = win.querySelector('#dyMonitorAutoScroll');
        autoCb.checked = autoScroll;
        autoCb.addEventListener('change', () => {
            autoScroll = autoCb.checked;
            if (autoScroll && bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
        });
        win.querySelector('#dyMonitorClear').addEventListener('click', (e) => {
            e.stopPropagation();
            Monitor.clear();
            if (bodyEl) bodyEl.innerHTML = '';
            visibleCount = 0;
            updateStats();
        });
        win.querySelector('#dyMonitorClose').addEventListener('click', (e) => {
            e.stopPropagation();
            close();
        });
        bodyEl.addEventListener('scroll', () => {
            const atBottom = bodyEl.scrollTop + bodyEl.clientHeight >= bodyEl.scrollHeight - 8;
            if (!atBottom && autoScroll) {
                autoScroll = false;
                autoCb.checked = false;
            } else if (atBottom && !autoScroll) {
                autoScroll = true;
                autoCb.checked = true;
            }
        });
        const buf = Monitor.getBuffer();
        for (const e of buf) appendEntry(e);
        if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
        unsub = Monitor.subscribe((entry) => appendEntry(entry));
        makeDraggable(win, win.querySelector('#dyMonitorTitle'));
        window.addEventListener('resize', () => {
            if (!win || !win.style.left) return;
            const rect = win.getBoundingClientRect();
            const p = clampPos(rect.left, rect.top);
            win.style.left = p.left + 'px';
            win.style.top = p.top + 'px';
        });
    }

    function open() {
        create();
        if (!win) return;
        win.style.display = 'flex';
        void win.offsetWidth;
        win.classList.remove('dy-monitor-hidden');
        setTimeout(() => Monitor.emit('core', '✓ 监控浮窗已打开，开始实时捕获', 'ok'), 30);
    }

    function close() {
        if (!win || !win.parentNode) return;
        win.classList.add('dy-monitor-hidden');
        const w = win;
        win = null;
        bodyEl = null;
        footerStatsEl = null;
        visibleCount = 0;
        if (unsub) {
            try {
                unsub();
            } catch (e) {}
            unsub = null;
        }
        setTimeout(() => {
            if (w && w.parentNode) w.remove();
        }, 240);
    }

    function isOpen() {
        return !!(win && win.parentNode);
    }

    function toggle() {
        isOpen() ? close() : open();
    }
    return {
        open,
        close,
        toggle,
        isOpen
    };
})();

function showSelfCheckPanel() {
    const old = document.getElementById('dySelfCheck');
    if (old) old.remove();
    const {
        groups,
        okCount,
        warnCount,
        failCount
    } = runSelfCheck();
    const P = getReportPalette();
    const summaryBg = failCount > 0 ? P.failBg :
        warnCount > 0 ? P.warnBg : P.okBg;
    const summaryColor = failCount > 0 ? P.fail :
        warnCount > 0 ? P.warn : P.ok;
    const summaryText = failCount > 0 ?
        (dyIconSvg('x') + ' ' + failCount + ' 项失败 · ' + warnCount + ' 项警告 · ' + okCount + ' 项通过') :
        warnCount > 0 ?
        (dyIconSvg('alert') + ' ' + warnCount + ' 项警告 · ' + okCount + ' 项通过') :
        (dyIconSvg('check') + ' 全部 ' + okCount + ' 项检查通过');
    let bodyHtml = '';
    for (const g of groups) {
        bodyHtml += '<div style="margin-bottom:16px;">' +
            '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.text + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:4px;display:flex;align-items:center;">' + g.title + '</div>';
        for (const r of g.items) {
            const icon = r.status === 'ok' ? dyIconSvg('check') : r.status === 'warn' ? dyIconSvg('alert') : dyIconSvg('x');
            const color = r.status === 'ok' ? P.ok : r.status === 'warn' ? P.warn : P.fail;
            bodyHtml += '<div style="display:flex;gap:8px;padding:4px 0;align-items:flex-start;font-size:var(--dy-font-size-sm);">' +
                '<span style="flex-shrink:0;width:16px;">' + icon + '</span>' +
                '<span style="flex:0 0 140px;color:' + color + ';">' + r.name + '</span>' +
                '<span style="flex:1;color:' + P.textDim + ';word-break:break-all;">' + (r.detail || '') + '</span>' +
                '</div>';
        }
        bodyHtml += '</div>';
    }
    const panel = document.createElement('div');
    panel.id = 'dySelfCheck';
    panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'z-index:2147483647;background:' + P.panelBg + ';color:' + P.text + ';border-radius:8px;' +
        '-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);' +
        'min-width:520px;max-width:92vw;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;' +
        'box-shadow:' + P.shadow + ';border:1px solid ' + P.border + ';' +
        "font-family:'PingFang SC','Microsoft YaHei',sans-serif;font-size:var(--dy-font-size-md);line-height:1.6;" +
        'animation:dyPanelIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);';
    panel.innerHTML = '' +
        '<div class="dy-report-header" style="position:relative;z-index:10;flex-shrink:0;box-sizing:border-box;' +
        'padding:18px 22px 12px 22px;' +
        'background:' + P.headerBg + ';' +
        '-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:var(--dy-font-title);font-weight:600;display:flex;align-items:center;">' + dyIconSvg('search', 16) + ' 脚本自检报告</div>' +
        '<button id="dySelfCheckClose" class="dy-report-close">×</button>' +
        '</div>' +
        '<div style="padding:8px 12px;border-radius:4px;background:' + summaryBg + ';color:' + summaryColor + ';font-weight:600;display:flex;align-items:center;">' +
        summaryText +
        '</div>' +
        '</div>' +
        '<div class="dy-report-body" style="flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;' +
        'padding:0 22px 22px 22px;scrollbar-width:thin;">' +
        bodyHtml +
        '</div>' +
        '<div style="flex-shrink:0;display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px 22px;border-top:1px solid ' + P.divider + ';">' +
        '<button id="dySelfCheckCopy" class="dy-report-btn dy-report-btn-blue">' + dyIconSvg('copy') + ' 复制报告</button>' +
        '<button id="dySelfCheckMonitor" class="dy-report-btn dy-report-btn-blue">' + dyIconSvg('activity') + ' 实时监控</button>' +
        '<button id="dySelfCheckRerun" class="dy-report-btn dy-report-btn-green">' + dyIconSvg('refreshCw') + ' 重新检查</button>' +
        '</div>';
    document.body.appendChild(panel);
    requestAnimationFrame(() => {
        const header = panel.querySelector('.dy-report-header');
        const body = panel.querySelector('.dy-report-body');
        if (header && body) {
            const h = header.offsetHeight;
            body.style.marginTop = (-h) + 'px';
            body.style.paddingTop = h + 'px';
        }
    });
    document.getElementById('dySelfCheckClose').onclick = () => playPanelClose(panel);
    document.getElementById('dySelfCheckMonitor').onclick = () => {
        playPanelClose(panel);
        setTimeout(() => MonitorWindow.open(), 260);
    };
    document.getElementById('dySelfCheckRerun').onclick = () => {
        playPanelClose(panel);
        setTimeout(() => showSelfCheckPanel(), 240);
    };
    document.getElementById('dySelfCheckCopy').onclick = async () => {
        let text = '抖音优化 v' + SCRIPT_VERSION + ' 自检报告\n';
        text += '时间: ' + new Date().toLocaleString() + '\n';
        text += 'URL: ' + location.href + '\n';
        text += 'UA: ' + navigator.userAgent + '\n\n';
        for (const g of groups) {
            text += '【' + g.title.replace(/<[^>]+>/g, '').replace(/^\s+/, '') + '】\n';
            for (const r of g.items) {
                const tag = r.status === 'ok' ? '[OK]  ' : r.status === 'warn' ? '[WARN]' : '[FAIL]';
                text += '  ' + tag + ' ' + r.name + ': ' + (r.detail || '') + '\n';
            }
            text += '\n';
        }
        try {
            await navigator.clipboard.writeText(text);
            const btn = document.getElementById('dySelfCheckCopy');
            btn.innerHTML = dyIconSvg('check') + ' 已复制';
            setTimeout(() => {
                btn.innerHTML = dyIconSvg('copy') + ' 复制报告';
            }, 1500);
        } catch (e) {
            prompt('复制以下内容：', text);
        }
    };
    // ★ 当前视频分辨率 · 每秒刷新
    const _resTimer = setInterval(() => {
        const p = document.getElementById('dySelfCheck');
        if (!p) {
            clearInterval(_resTimer);
            return;
        }
        const el = p.querySelector('[data-dy-res]');
        if (!el) return;
        const res = detectVideoResolution();
        const line = formatResolutionLine(res);
        el.textContent = line;
        el.style.color = /⚠/.test(line) ? P.warn : '';
    }, 1000);
    // 面板关闭时清掉定时器
    const _watchClose = new MutationObserver(() => {
        if (!document.getElementById('dySelfCheck')) {
            clearInterval(_resTimer);
            _watchClose.disconnect();
        }
    });
    _watchClose.observe(document.body, {
        childList: true,
        subtree: true
    });
    const onKey = (e) => {
        if (e.key === 'Escape') {
            playPanelClose(panel);
            document.removeEventListener('keydown', onKey, true);
        }
    };
    document.addEventListener('keydown', onKey, true);
}
// =========================================================
//              错误报告面板
// =========================================================
function showErrorReport(forceShow) {
    const records = ModuleLoader.getRecords();
    const errors = records.filter(r => r.status === 'error');
    const oks = records.filter(r => r.status === 'ok');
    if (!forceShow && errors.length === 0) return;
    const old = document.getElementById('dyErrorReport');
    if (old) old.remove();
    const P = getReportPalette();
    const history = CrashLog.getAll();
    // ============ 模块加载明细 ============
    let modulesHtml = '';
    if (records.length === 0) {
        modulesHtml = '<div style="color:' + P.textFaint + ';padding:8px;">本次加载无模块记录</div>';
    } else {
        for (const r of records) {
            const isErr = r.status === 'error';
            const icon = isErr ? dyIconSvg('x') : dyIconSvg('check');
            const color = isErr ? P.fail : P.ok;
            const detail = isErr ? r.error.message :
                (r.timeMs != null ? r.timeMs.toFixed(1) + ' ms' : '');
            modulesHtml += `<div style="display:flex;gap:8px;padding:4px 0;align-items:flex-start;font-size:var(--dy-font-size-sm);border-bottom:1px solid ${P.divider};">` +
                `<span style="flex-shrink:0;width:18px;">${icon}</span>` +
                `<span style="flex:0 0 150px;color:${color};">${escapeHtml(r.name)}${r.critical ? ' ⚠' : ''}</span>` +
                `<span style="flex:1;color:${P.textDim};word-break:break-all;">${escapeHtml(detail)}</span>` +
                `</div>`;
        }
    }
    // ============ 错误详情 ============
    let errorDetailHtml = '';
    if (errors.length > 0) {
        errorDetailHtml = '<div style="margin-top:16px;">' +
            '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.fail + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:6px;display:flex;align-items:center;">' +
            dyIconSvg('alert') + ' 错误详情（含堆栈）</div>';
        for (const r of errors) {
            errorDetailHtml += '<div style="margin-bottom:10px;background:' + P.cardBg + ';border-radius:4px;padding:8px 10px;">' +
                '<div style="color:' + P.fail + ';font-weight:600;margin-bottom:4px;">【' +
                escapeHtml(r.name) + '】' + escapeHtml(r.error.message) + '</div>';
            if (r.error.stack) {
                const stack = r.error.stack.split('\n').slice(0, 8).join('\n');
                errorDetailHtml += '<pre style="color:' + P.stackText + ';font-size:var(--dy-font-size-xs);font-family:Consolas,monospace;white-space:pre-wrap;word-break:break-all;margin:0;max-height:150px;overflow-y:auto;">' +
                    escapeHtml(stack) + '</pre>';
            }
            errorDetailHtml += '</div>';
        }
        errorDetailHtml += '</div>';
    }
    // ============ 环境快照 ============
    const _env = collectEnvSnapshot();
    let envHtml = '<div style="margin-top:16px;">' +
        '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.text + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:6px;display:flex;align-items:center;">' +
        dyIconSvg('monitor') + ' 环境快照</div>';
    const envRows = [
        ['脚本管理器', (_env.scriptHandler || '?') + (_env.scriptHandlerVersion ? ' v' + _env.scriptHandlerVersion : '')],
        ['脚本版本', 'v' + (_env.scriptVersion || '?')],
        ['平台', _env.platform || ''],
        ['语言', _env.language || ''],
        ['CPU 核心', String(_env.hardwareConcurrency)],
        ['设备内存', _env.deviceMemory === '未知' ? '未知' : (_env.deviceMemory + ' GB')],
        ['DPR', String(_env.devicePixelRatio)],
        ['屏幕', _env.screenSize + ' · 视口 ' + _env.viewport],
        ['页面类型', _env.pageType || ''],
        ['readyState', _env.readyState || ''],
        ['URL', _env.url || ''],
    ];
    for (const [k, v] of envRows) {
        envHtml += '<div style="display:flex;gap:8px;padding:3px 0;font-size:var(--dy-font-size-sm);">' +
            '<span style="flex:0 0 110px;color:' + P.textFaint + ';">' + escapeHtml(k) + '</span>' +
            '<span style="flex:1;color:' + P.textDim + ';word-break:break-all;">' + escapeHtml(String(v)) + '</span>' +
            '</div>';
    }
    envHtml += '</div>';
    // ============ 运行时状态 ============
    const _rs = collectRuntimeSnapshot();
    let rsHtml = '<div style="margin-top:16px;">' +
        '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.text + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:6px;display:flex;align-items:center;">' +
        dyIconSvg('activity') + ' 运行时状态</div>';
    const boolDot = (b) => b ?
        '<span style="color:' + P.ok + ';">● 运行中</span>' :
        '<span style="color:' + P.fail + ';">○ 未启动</span>';
    const rsRows = [
        ['画质轮询', boolDot(_rs.timerQuality)],
        ['弹幕轮询', boolDot(_rs.timerDanmu)],
        ['跳过检测', boolDot(_rs.timerSkip)],
        ['弹幕同步', boolDot(_rs.danmuSyncTimer)],
        ['清屏持久化', boolDot(_rs.immersiveTimer)],
        ['DOM 观察器', boolDot(_rs.domObserver)],
    ];
    if (typeof _rs.pauseGuardEnabled === 'boolean') {
        rsRows.push(['PauseGuard', _rs.pauseGuardEnabled ?
            '<span style="color:' + P.ok + ';">● 运行中</span>' +
            ' <span style="color:' + P.textFaint + ';">（资格视频 ' + (_rs.pauseGuardEligibleVideos || 0) +
            ' · 真实 hidden=' + _rs.pauseGuardRealHidden + '）</span>' :
            '<span style="color:' + P.warn + ';">○ 已关闭</span>'
        ]);
    }
    rsRows.push(['Monitor 缓冲', '<span style="color:' + P.textDim + ';">' + (_rs.monitorBufferSize || 0) + ' 条</span>']);
    if (_rs.video) {
        rsRows.push(['当前视频', '<span style="color:' + P.textDim + ';">' +
            _rs.video.width + '×' + _rs.video.height +
            ' · readyState=' + _rs.video.readyState +
            ' · ' + (_rs.video.paused ? '暂停' : '播放中') + '</span>'
        ]);
    }
    if (_rs.activeVideoId) {
        rsRows.push(['视频 ID', '<span style="color:' + P.textDim + ';">' + escapeHtml(String(_rs.activeVideoId).slice(0, 40)) + '</span>']);
    }
    if (_rs.lastInteraction) {
        const li = _rs.lastInteraction;
        let ago = li.agoMs < 1000 ? li.agoMs + 'ms' :
            li.agoMs < 60000 ? Math.round(li.agoMs / 1000) + 's' :
            Math.round(li.agoMs / 60000) + 'min';
        rsRows.push(['最后交互', '<span style="color:' + P.textDim + ';">' +
            li.type + ' → ' + escapeHtml(li.target || '') +
            ' <span style="color:' + P.textFaint + ';">（' + ago + '前 · ' + li.timeStr + '）</span>' +
            '</span>'
        ]);
    }
    for (const [k, v] of rsRows) {
        rsHtml += '<div style="display:flex;gap:8px;padding:3px 0;font-size:var(--dy-font-size-sm);">' +
            '<span style="flex:0 0 110px;color:' + P.textFaint + ';">' + escapeHtml(k) + '</span>' +
            '<span style="flex:1;color:' + P.textDim + ';word-break:break-all;">' + v + '</span>' +
            '</div>';
    }
    if (_rs.switches) {
        const sw = _rs.switches;
        const onList = [],
            offList = [];
        const labelMap = {
            enableKeepAlive: '防暂停',
            enableQualitySwitch: '画质',
            enableImmersivePersist: '清屏',
            blockedDanmu_Switch: '弹幕屏蔽',
            skipLive_Switch: '跳直播',
            skipVideoRegex_Switch: '正则屏蔽',
            enableLottery: '福袋',
            enableMsgFloat: '消息浮窗',
            enableNavButton: '导航按钮',
            debugMode: '调试',
            consoleOutputLog_Switch: '控制台日志',
        };
        for (const k in labelMap) {
            if (sw[k]) onList.push(labelMap[k]);
            else offList.push(labelMap[k]);
        }
        rsHtml += '<div style="padding:4px 0;font-size:var(--dy-font-size-sm);color:' + P.textFaint + ';">开关状态</div>' +
            '<div style="font-size:var(--dy-font-size-xs);color:' + P.ok + ';padding:2px 0;word-break:break-all;">' +
            '已开启：' + (onList.join('、') || '无') + '</div>' +
            '<div style="font-size:var(--dy-font-size-xs);color:' + P.textFaint + ';padding:2px 0;word-break:break-all;">' +
            '已关闭：' + (offList.join('、') || '无') + '</div>' +
            '<div style="font-size:var(--dy-font-size-xs);color:' + P.textFaint + ';padding:2px 0;">' +
            '主题：' + escapeHtml(sw.themeMode) + '</div>';
    }
    rsHtml += '</div>';
    // ============ Monitor 黑匣子 ============
    const _tail = collectMonitorTail(30);
    let tailHtml = '';
    if (_tail.length > 0) {
        tailHtml = '<div style="margin-top:16px;">' +
            '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.text + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:6px;display:flex;align-items:center;">' +
            dyIconSvg('list') + ' 崩溃前最后 ' + _tail.length + ' 条事件（Monitor 黑匣子）</div>' +
            '<div style="background:' + P.cardBg + ';border-radius:4px;padding:6px 10px;max-height:320px;overflow-y:auto;' +
            'font-family:Consolas,monospace;font-size:var(--dy-font-size-xs);line-height:1.55;">';
        for (const e of _tail) {
            const lv = e.level || 'info';
            const color = lv === 'error' ? P.fail : lv === 'warn' ? P.warn : lv === 'ok' ? P.ok : P.textDim;
            tailHtml += '<div style="display:flex;gap:6px;word-break:break-all;padding:1px 0;">' +
                '<span style="color:' + P.textFaint + ';flex-shrink:0;">' + escapeHtml(e.timeStr || '') + '</span>' +
                '<span style="color:' + color + ';flex-shrink:0;">[' + escapeHtml(e.category || '') + ']</span>' +
                '<span style="color:' + color + ';flex:1;">' + escapeHtml(e.message || '') + '</span>' +
                '</div>';
        }
        tailHtml += '</div></div>';
    }
    // ============ 历史崩溃日志（带去重徽章 + 位置） ============
    let historyHtml = '';
    if (history.length > 0) {
        historyHtml = '<div style="margin-top:16px;">' +
            '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.warn + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:6px;display:flex;align-items:center;">' +
            dyIconSvg('clock') + ' 历史崩溃日志（显示最近 ' +
            Math.min(history.length, 10) + ' / ' + history.length + ' 条 · 上限 ' + CrashLog.getMax() + '）</div>';
        for (const h of history.slice(0, 10)) {
            const cnt = (h.count && h.count > 1) ? h.count : 0;
            const cntBadge = cnt ?
                '<span style="background:' + P.failBg + ';color:' + P.fail + ';border-radius:8px;padding:0 6px;font-size:10px;margin-left:6px;">×' + cnt + '</span>' :
                '';
            const lastTime = (cnt && h.lastTimeStr && h.lastTimeStr !== h.timeStr) ?
                '<span style="color:' + P.textFaint + ';font-size:10px;margin-left:6px;">最后 ' + escapeHtml(h.lastTimeStr) + '</span>' :
                '';
            historyHtml += '<div style="padding:6px 8px;margin-bottom:4px;background:' + P.cardBg + ';border-radius:4px;font-size:var(--dy-font-size-sm);">' +
                '<div style="color:' + P.warn + ';font-size:var(--dy-font-size-xs);">[' +
                escapeHtml(h.timeStr || '') + '] ' + escapeHtml(h.type || '未知') +
                (h.module ? ' · ' + escapeHtml(h.module) : '') +
                (h.version ? ' · v' + escapeHtml(h.version) : '') +
                cntBadge + lastTime +
                '</div>' +
                '<div style="color:' + P.textDim + ';word-break:break-all;font-family:Consolas,monospace;font-size:var(--dy-font-size-xs);margin-top:2px;">' +
                escapeHtml((h.message || '').slice(0, 200)) +
                '</div>' +
                (h.filename ?
                    '<div style="color:' + P.textFaint + ';font-family:Consolas,monospace;font-size:10px;margin-top:2px;">' +
                    escapeHtml(h.filename) + ':' + (h.line || 0) + ':' + (h.column || 0) + '</div>' :
                    '') +
                '</div>';
        }
        historyHtml += '</div>';
    }
    // ============ 汇总条 ============
    const summaryText = errors.length > 0 ?
        (dyIconSvg('x') + ' 本次加载 ' + errors.length + ' 个模块失败 · ' + oks.length + ' 个成功') :
        (dyIconSvg('check') + ' 本次加载全部 ' + oks.length + ' 个模块正常');
    const summaryBg = errors.length > 0 ? P.failBg : P.okBg;
    const summaryColor = errors.length > 0 ? P.fail : P.ok;
    const titleText = errors.length > 0 ?
        (dyIconSvg('alert', 16) + ' 插件加载异常报告') :
        (dyIconSvg('search', 16) + ' 插件加载报告');
    // ============ 面板骨架 ============
    const panel = document.createElement('div');
    panel.id = 'dyErrorReport';
    panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'z-index:2147483647;background:' + P.panelBg + ';color:' + P.text + ';border-radius:8px;' +
        '-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);' +
        'min-width:560px;max-width:92vw;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;' +
        'box-shadow:' + P.shadow + ';border:1px solid ' + P.border + ';' +
        "font-family:'PingFang SC','Microsoft YaHei',sans-serif;font-size:var(--dy-font-size-md);line-height:1.6;" +
        'animation:dyPanelIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);';
    panel.innerHTML = '' +
        '<div class="dy-report-header" style="position:relative;z-index:10;flex-shrink:0;box-sizing:border-box;' +
        'padding:18px 22px 12px 22px;' +
        'background:' + P.headerBg + ';' +
        '-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<div style="font-size:var(--dy-font-title);font-weight:600;display:flex;align-items:center;">' + titleText + ' · v' + escapeHtml(SCRIPT_VERSION) + '</div>' +
        '<button id="dyErrorReportClose" class="dy-report-close">×</button>' +
        '</div>' +
        '<div style="padding:8px 12px;border-radius:4px;background:' + summaryBg + ';color:' + summaryColor + ';font-weight:600;display:flex;align-items:center;">' +
        summaryText +
        '</div>' +
        '</div>' +
        '<div class="dy-report-body" style="flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;' +
        'padding:0 22px 22px 22px;scrollbar-width:thin;">' +
        '<div style="margin-bottom:14px;">' +
        '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.text + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:4px;display:flex;align-items:center;">' +
        dyIconSvg('layers') + ' 模块加载明细</div>' +
        modulesHtml +
        '</div>' +
        envHtml +
        rsHtml +
        errorDetailHtml +
        tailHtml +
        historyHtml +
        '</div>' +
        '<div style="flex-shrink:0;display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px 22px;border-top:1px solid ' + P.divider + ';flex-wrap:wrap;">' +
        '<button id="dyErrorReportCopy" class="dy-report-btn dy-report-btn-blue">' + dyIconSvg('copy') + ' 复制报告</button>' +
        '<button id="dyErrorReportClear" class="dy-report-btn dy-report-btn-red">' + dyIconSvg('trash') + ' 清除历史日志</button>' +
        '<button id="dyErrorReportRerun" class="dy-report-btn dy-report-btn-green">' + dyIconSvg('refreshCw') + ' 重新加载页面</button>' +
        '</div>';
    document.body.appendChild(panel);
    requestAnimationFrame(() => {
        const header = panel.querySelector('.dy-report-header');
        const body = panel.querySelector('.dy-report-body');
        if (header && body) {
            const h = header.offsetHeight;
            body.style.marginTop = (-h) + 'px';
            body.style.paddingTop = h + 'px';
        }
    });
    document.getElementById('dyErrorReportClose').onclick = () => playPanelClose(panel);
    document.getElementById('dyErrorReportRerun').onclick = () => location.reload();
    document.getElementById('dyErrorReportClear').onclick = () => {
        if (confirm('确定要清除所有历史崩溃日志吗？')) {
            CrashLog.clear();
            showErrorReport(true);
        }
    };
    // ============ 复制报告（含环境 / 运行时 / 黑匣子 / 堆栈） ============
    document.getElementById('dyErrorReportCopy').onclick = async () => {
        let text = '抖音优化 v' + SCRIPT_VERSION + ' 加载报告\n';
        text += '时间: ' + new Date().toLocaleString() + '\n';
        text += 'URL: ' + location.href + '\n';
        text += 'UA: ' + navigator.userAgent + '\n';
        text += '恢复模式: ' + (ModuleLoader.isRecoveryMode() ? '是' : '否') + '\n\n';
        // 环境快照
        const _envTxt = collectEnvSnapshot();
        text += '=== 环境快照 ===\n';
        text += '  脚本管理器: ' + (_envTxt.scriptHandler || '?') +
            (_envTxt.scriptHandlerVersion ? ' v' + _envTxt.scriptHandlerVersion : '') + '\n';
        text += '  脚本版本: v' + (_envTxt.scriptVersion || '?') + '\n';
        text += '  平台: ' + (_envTxt.platform || '') + '\n';
        text += '  语言: ' + (_envTxt.language || '') + '\n';
        text += '  CPU 核心: ' + _envTxt.hardwareConcurrency + '\n';
        text += '  设备内存: ' + _envTxt.deviceMemory + ' GB\n';
        text += '  DPR: ' + _envTxt.devicePixelRatio + '\n';
        text += '  屏幕: ' + _envTxt.screenSize + ' · 视口 ' + _envTxt.viewport + '\n';
        text += '  页面类型: ' + (_envTxt.pageType || '') + '\n';
        text += '  readyState: ' + (_envTxt.readyState || '') + '\n\n';
        // 运行时状态
        const _rsTxt = collectRuntimeSnapshot();
        text += '=== 运行时状态 ===\n';
        text += '  画质轮询: ' + (_rsTxt.timerQuality ? '运行中' : '未启动') + '\n';
        text += '  弹幕轮询: ' + (_rsTxt.timerDanmu ? '运行中' : '未启动') + '\n';
        text += '  跳过检测: ' + (_rsTxt.timerSkip ? '运行中' : '未启动') + '\n';
        text += '  弹幕同步: ' + (_rsTxt.danmuSyncTimer ? '运行中' : '未启动') + '\n';
        text += '  清屏持久化: ' + (_rsTxt.immersiveTimer ? '运行中' : '未启动') + '\n';
        text += '  DOM 观察器: ' + (_rsTxt.domObserver ? '运行中' : '未启动') + '\n';
        if (typeof _rsTxt.pauseGuardEnabled === 'boolean') {
            text += '  PauseGuard: ' + (_rsTxt.pauseGuardEnabled ? '运行中' : '已关闭') +
                ' (资格视频 ' + (_rsTxt.pauseGuardEligibleVideos || 0) +
                ', 真实 hidden=' + _rsTxt.pauseGuardRealHidden + ')\n';
        }
        text += '  Monitor 缓冲: ' + (_rsTxt.monitorBufferSize || 0) + ' 条\n';
        if (_rsTxt.video) {
            text += '  当前视频: ' + _rsTxt.video.width + '×' + _rsTxt.video.height +
                ' readyState=' + _rsTxt.video.readyState +
                ' ' + (_rsTxt.video.paused ? '暂停' : '播放中') + '\n';
        }
        if (_rsTxt.activeVideoId) text += '  视频 ID: ' + _rsTxt.activeVideoId + '\n';
        if (_rsTxt.lastInteraction) {
            const li = _rsTxt.lastInteraction;
            text += '  最后交互: ' + li.type + ' → ' + li.target +
                ' (' + Math.round(li.agoMs / 1000) + 's 前, ' + li.timeStr + ')\n';
        }
        if (_rsTxt.switches) {
            const sw = _rsTxt.switches;
            text += '  主题: ' + sw.themeMode + '\n';
            const on = [],
                off = [];
            const map = {
                enableKeepAlive: '防暂停',
                enableQualitySwitch: '画质',
                enableImmersivePersist: '清屏',
                blockedDanmu_Switch: '弹幕屏蔽',
                skipLive_Switch: '跳直播',
                skipVideoRegex_Switch: '正则屏蔽',
                enableLottery: '福袋',
                enableMsgFloat: '消息浮窗',
                enableNavButton: '导航按钮',
                debugMode: '调试',
                consoleOutputLog_Switch: '控制台日志',
            };
            for (const k in map) {
                if (sw[k]) on.push(map[k]);
                else off.push(map[k]);
            }
            text += '  开关ON:  ' + (on.join('、') || '无') + '\n';
            text += '  开关OFF: ' + (off.join('、') || '无') + '\n';
        }
        text += '\n';
        // Monitor 黑匣子
        const _tailTxt = collectMonitorTail(30);
        if (_tailTxt.length > 0) {
            text += '=== 崩溃前最后 ' + _tailTxt.length + ' 条事件 ===\n';
            for (const e of _tailTxt) {
                text += '[' + (e.timeStr || '') + '] [' + (e.category || '') + '] ' +
                    (e.level && e.level !== 'info' ? '(' + e.level + ') ' : '') +
                    (e.message || '') + '\n';
            }
            text += '\n';
        }
        // 模块明细
        text += '=== 模块明细 ===\n';
        for (const r of records) {
            const tag = r.status === 'ok' ? '[OK]  ' : '[FAIL]';
            text += '  ' + tag + ' ' + r.name;
            if (r.status === 'error') text += ': ' + r.error.message;
            else if (r.timeMs != null) text += ' (' + r.timeMs.toFixed(1) + 'ms)';
            text += '\n';
        }
        // 本次加载的模块错误堆栈
        if (errors.length > 0) {
            text += '\n=== 错误堆栈（本次加载） ===\n';
            for (const r of errors) {
                text += '\n【' + r.name + '】' + r.error.message + '\n';
                if (r.error.stack) text += r.error.stack + '\n';
            }
        }
        // 历史日志（含重复次数、位置、堆栈）
        if (history.length > 0) {
            text += '\n=== 历史崩溃日志 ===\n';
            for (const h of history) {
                const cnt = (h.count && h.count > 1) ? ' ×' + h.count : '';
                text += '[' + (h.timeStr || '') + '] ' + (h.type || '') + cnt +
                    (h.module ? ' · ' + h.module : '') +
                    (h.filename ? ' @ ' + h.filename + ':' + (h.line || 0) + ':' + (h.column || 0) : '') +
                    '\n';
                text += '  消息: ' + (h.message || '') + '\n';
                if (h.lastTimeStr && h.lastTimeStr !== h.timeStr) {
                    text += '  最后出现: ' + h.lastTimeStr + '\n';
                }
                if (h.stack) {
                    text += '  堆栈:\n' + h.stack.split('\n').map(l => '    ' + l).join('\n') + '\n';
                }
            }
        }
        try {
            await navigator.clipboard.writeText(text);
            const btn = document.getElementById('dyErrorReportCopy');
            btn.innerHTML = dyIconSvg('check') + ' 已复制';
            setTimeout(() => {
                btn.innerHTML = dyIconSvg('copy') + ' 复制报告';
            }, 1500);
        } catch (e) {
            prompt('复制以下内容：', text);
        }
    };
    const onKey = (e) => {
        if (e.key === 'Escape') {
            playPanelClose(panel);
            document.removeEventListener('keydown', onKey, true);
        }
    };
    document.addEventListener('keydown', onKey, true);
}
// =========================================================
// Video download integration adapters (keeps the original script's settings and Vue UI)
// Adapted from WhiteSevs/TamperMonkeyScript, userscript "抖音优化" (GPL-3.0-only): https://github.com/WhiteSevs/TamperMonkeyScript.
// =========================================================
const _GM_download = (typeof GM_download === 'function') ? GM_download : null;
let _dyVideoDownloadOpenCurrent = null;
let _dyVideoDownloadListenerCleanup = null;

function dyVideoDownloadToast(message, type = 'info', timeout = 2800, onClose) {
    const host = document.body || document.documentElement;
    if (!host) return {
        close() {},
        setText() {}
    };
    let style = document.getElementById('dy-video-download-toast-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'dy-video-download-toast-style';
        style.textContent = '.dy-vd-toast{position:fixed;right:18px;bottom:22px;z-index:2147483647;display:flex;align-items:center;gap:12px;max-width:min(560px,90vw);padding:11px 14px;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:rgba(28,32,43,.94);box-shadow:0 8px 28px rgba(0,0,0,.28);color:#fff;font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;backdrop-filter:blur(12px)}.dy-vd-toast-info{border-color:rgba(79,95,199,.55)}.dy-vd-toast-success{border-color:rgba(76,175,80,.7)}.dy-vd-toast-error{border-color:rgba(211,47,47,.75)}.dy-vd-toast-loading{border-color:rgba(79,95,199,.75)}.dy-vd-toast button{border:0;background:transparent;color:inherit;cursor:pointer;font-size:18px;line-height:1;padding:0 2px}';
        (document.head || document.documentElement).appendChild(style);
    }
    const el = document.createElement('div');
    el.className = 'dy-vd-toast dy-vd-toast-' + type;
    const text = document.createElement('span');
    text.textContent = String(message == null ? '' : message);
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '\u00d7';
    closeBtn.setAttribute('aria-label', 'Close notification');
    el.append(text, closeBtn);
    host.appendChild(el);
    let timer = null,
        closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        if (timer) clearTimeout(timer);
        el.remove();
    };
    closeBtn.addEventListener('click', () => {
        try {
            if (onClose) onClose();
        } finally {
            close();
        }
    });
    if (Number(timeout) > 0) timer = setTimeout(close, Number(timeout));
    return {
        close,
        setText(next) {
            text.textContent = String(next == null ? '' : next);
        }
    };
}
const qmsg = {
    default: {
        error(message, options = {}) {
            return dyVideoDownloadToast(message, 'error', options.timeout || 3600);
        },
        success(message, options = {}) {
            return dyVideoDownloadToast(message, 'success', options.timeout || 2600);
        },
        info(message, options = {}) {
            return dyVideoDownloadToast(message, 'info', options.timeout || 2600);
        },
        loading(message, options = {}) {
            return dyVideoDownloadToast(message, 'loading', 0, options.onClose);
        },
    }
};
log.info = (...args) => {
    if (settings.consoleOutputLog_Switch) console.info('[抖音优化][视频下载]', ...args);
};
log.warn = (...args) => console.warn('[抖音优化][视频下载]', ...args);
log.success = (...args) => {
    if (settings.consoleOutputLog_Switch) console.info('[抖音优化][视频下载]', ...args);
};
log.error = (...args) => console.error('[抖音优化][视频下载]', ...args);

function dyVideoDownloadFixUrl(value) {
    if (typeof value !== 'string') return '';
    const url = value.trim();
    if (url.startsWith('//')) return 'https:' + url;
    return /^https?:\/\//i.test(url) ? url : '';
}

function dyVideoDownloadCollectUrls(value) {
    const output = [],
        seenUrls = new Set(),
        seenObjects = new Set();
    const walk = (item, depth = 0) => {
        if (depth > 5 || item == null) return;
        if (typeof item === 'string') {
            const url = dyVideoDownloadFixUrl(item);
            if (url && !seenUrls.has(url)) {
                seenUrls.add(url);
                output.push(url);
            }
            return;
        }
        if (Array.isArray(item)) {
            for (const child of item) walk(child, depth + 1);
            return;
        }
        if (typeof item !== 'object' || seenObjects.has(item)) return;
        seenObjects.add(item);
        for (const key of ['url_list', 'urlList', 'urlListV2', 'download_url_list', 'downloadUrlList', 'src', 'url', 'uri', 'playApi', 'play_api', 'play_addr', 'playAddr', 'play_url', 'playUrl']) {
            if (Object.prototype.hasOwnProperty.call(item, key)) walk(item[key], depth + 1);
        }
    };
    walk(value);
    return output;
}

function dyVideoDownloadParseBitRates(list, cover) {
    if (!Array.isArray(list)) return [];
    const output = [];
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const addr = item.play_addr || item.playAddr || item.play_addr_info || item.playAddrInfo || {};
        const urls = [];
        const preferred = dyVideoDownloadFixUrl(item.playApi || item.play_api || item.url || '');
        if (preferred) urls.push(preferred);
        for (const url of dyVideoDownloadCollectUrls(addr.url_list || addr.urlList || addr))
            if (!urls.includes(url)) urls.push(url);
        for (const url of dyVideoDownloadCollectUrls(item.playAddr || item.play_addr || item.url_list || item.urlList))
            if (!urls.includes(url)) urls.push(url);
        if (!urls.length) continue;
        output.push({
            cover: cover || '',
            bitRate: item.bit_rate ?? item.bitRate ?? 0,
            dataSize: addr.data_size ?? addr.dataSize ?? item.data_size ?? item.dataSize ?? 0,
            format: item.format || item.fileFormat || 'mp4',
            isH265: item.is_h265 ?? item.isH265 ?? false,
            fps: item.FPS ?? item.fps ?? 0,
            gearName: item.gear_name || item.gearName || '',
            qualityType: item.quality_type ?? item.qualityType ?? '',
            width: Number(item.width ?? addr.width ?? 0) || 0,
            height: Number(item.height ?? addr.height ?? 0) || 0,
            url: urls[0],
            backUrl: urls.slice(1),
        });
    }
    const bestByQuality = new Map();
    for (const item of output) {
        const key = [item.width, item.height, item.fps].join('x');
        const old = bestByQuality.get(key);
        if (!old || Number(item.dataSize) > Number(old.dataSize)) bestByQuality.set(key, item);
    }
    return Array.from(bestByQuality.values()).sort((a, b) => a.width - b.width || a.height - b.height || a.fps - b.fps);
}

function dyDownloadParseDuration(value) {
    let n = Number(value);
    if (!Number.isFinite(n) || n < 0) return String(value == null ? '' : value);
    if (n > 10000) n = n / 1000;
    n = Math.floor(n);
    const minutes = Math.floor(n / 60),
        seconds = n % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}
const DouYinVideoFilterBase = class {
    parseAwemeInfoDictData(rawAwemeInfo) {
        const raw = rawAwemeInfo && typeof rawAwemeInfo === 'object' ? rawAwemeInfo : {};
        const author = raw.authorInfo || raw.author || raw.author_info || {};
        const video = raw.video || {};
        const music = raw.music || {};
        const images = Array.isArray(raw.images) ? raw.images : (Array.isArray(raw.imageList) ? raw.imageList : (Array.isArray(raw.image_list) ? raw.image_list : []));
        const videoCover = dyVideoDownloadCollectUrls(video.cover || video.coverUrlList || video.cover_url || video.cover_url_list)[0] || '';
        const bitrateList = [video.bitRateList, video.bit_rate, video.bitRate, video.bit_rate_list].find((list) => Array.isArray(list) && list.length) || [];
        const videoBitRateList = dyVideoDownloadParseBitRates(bitrateList, videoCover);
        const pictureList = images.map((image) => {
            const imageUrls = dyVideoDownloadCollectUrls([image.urlList, image.url_list, image.downloadUrlList, image.download_url_list, image.url, image.displayImage, image.display_image]);
            const imageVideo = image.video || {};
            const imageVideoCover = dyVideoDownloadCollectUrls(imageVideo.coverUrlList || imageVideo.cover_url_list || imageVideo.cover || imageVideo.coverUrl)[0] || imageUrls[0] || '';
            const imageRates = [imageVideo.bitRateList, imageVideo.bit_rate, imageVideo.bitRate, imageVideo.bit_rate_list].find((list) => Array.isArray(list) && list.length) || [];
            return {
                width: Number(image.width) || 0,
                height: Number(image.height) || 0,
                url: imageUrls[0] || '',
                videoBitRateList: dyVideoDownloadParseBitRates(imageRates, imageVideoCover)
            };
        }).filter((item) => item.url || item.videoBitRateList.length);
        const musicPlay = music.playUrl || music.play_url || music.playUrlInfo || music.play_url_info || {};
        const musicUrls = dyVideoDownloadCollectUrls(musicPlay.urlList || musicPlay.url_list || musicPlay || music.url || music.url_list);
        const musicUrl = dyVideoDownloadFixUrl(musicPlay.uri || '') || musicUrls[0] || '';
        const musicBackUrlList = musicUrls.filter((url) => url !== musicUrl);
        const desc = String(raw.desc || raw.description || '');
        return {
            awemeId: String(raw.awemeId || raw.aweme_id || raw.awemeIdStr || raw.aweme_id_str || ''),
            uid: String(author.uid || author.uid_str || author.id || author.sec_uid || ''),
            nickname: String(author.nickname || author.nickName || author.name || ''),
            desc,
            originDesc: desc.replace(/ #(.+) /g, '').replace(/#(.+)/g, ''),
            width: Number(video.width) || 0,
            height: Number(video.height) || 0,
            isPicture: Number(raw.awemeType ?? raw.aweme_type ?? raw.aweme_type_id) === 68 || pictureList.length > 0,
            videoBitRateList,
            pictureList,
            musicAlbum: music.album || music.albumName || music.album_name || '',
            musicAuthor: music.author || music.authorName || music.author_name || music.ownerNickname || '',
            musicDuration: music.duration ?? music.durationMs ?? 0,
            musicTitle: music.title || music.musicName || music.music_name || '',
            musicUrl,
            musicBackUrlList,
        };
    }
};
const utils$1 = {
    formatByteToSize(value) {
        let n = Number(value);
        if (!Number.isFinite(n) || n <= 0) return '未知大小';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (n >= 1024 && i < units.length - 1) {
            n /= 1024;
            i++;
        }
        return (i ? n.toFixed(2) : String(Math.round(n))) + ' ' + units[i];
    },
    isNotNull(value) {
        return value != null && String(value).trim() !== '';
    },
    isNull(value) {
        return value == null || String(value).trim() === '';
    },
    toJSON(value) {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch (e) {
            return null;
        }
    },
    formatTime(value, pattern = 'yyyy-MM-dd_HH:mm:ss') {
        const d = value == null ? new Date() : new Date(value);
        const parts = {
            yyyy: String(d.getFullYear()),
            MM: String(d.getMonth() + 1).padStart(2, '0'),
            dd: String(d.getDate()).padStart(2, '0'),
            HH: String(d.getHours()).padStart(2, '0'),
            mm: String(d.getMinutes()).padStart(2, '0'),
            ss: String(d.getSeconds()).padStart(2, '0')
        };
        return pattern.replace(/yyyy|MM|dd|HH|mm|ss/g, (key) => parts[key]);
    },
    sortListByProperty(list, getter) {
        list.sort((a, b) => Number(getter(a) || 0) - Number(getter(b) || 0));
        return list;
    },
    getReactInstance(element) {
        let node = element;
        while (node && node !== document) {
            try {
                const key = Object.getOwnPropertyNames(node).find((name) => name.startsWith('__reactFiber$') || name.startsWith('__reactInternalInstance$'));
                if (key) return {
                    reactFiber: node[key]
                };
            } catch (e) {}
            node = node.parentElement;
        }
        return null;
    },
    queryProperty(start, predicate) {
        let node = start;
        const seen = new Set();
        let count = 0;
        while (node && typeof node === 'object' && !seen.has(node) && count++ < 2500) {
            seen.add(node);
            const result = predicate(node);
            if (result && result.isFind) return result.data;
            if (result && result.data && result.data !== node) node = result.data;
            else node = node.return || null;
        }
        return null;
    },
    LockFunction: class {
        constructor(fn) {
            this.fn = fn;
            this.pending = false;
        }
        run() {
            if (this.pending) return;
            this.pending = true;
            Promise.resolve().then(() => {
                this.pending = false;
                this.fn();
            });
        }
    },
    mutationObserver(target, options = {}) {
        const observer = new MutationObserver(() => {
            try {
                options.callback && options.callback();
            } catch (e) {
                log.error(e);
            }
        });
        const root = target === document ? document.documentElement : target;
        if (root) observer.observe(root, options.config || {
            childList: true,
            subtree: true
        });
        if (options.immediate && typeof options.callback === 'function') options.callback();
        return observer;
    },
};
const domUtils = {
    createElement(tag, options = {}) {
        const el = document.createElement(tag);
        if (options.className) el.className = options.className;
        if (options.innerHTML != null) el.innerHTML = options.innerHTML;
        if (options.textContent != null) el.textContent = options.textContent;
        return el;
    },
    on(target, type, selectorOrHandler, handlerOrOptions, maybeOptions) {
        const delegated = typeof selectorOrHandler === 'string';
        const callback = delegated ? handlerOrOptions : selectorOrHandler;
        const options = delegated ? maybeOptions : handlerOrOptions;
        const listener = (event) => {
            if (delegated) {
                const raw = event.target && event.target.nodeType === 1 ? event.target : event.target?.parentElement;
                const match = raw?.closest?.(selectorOrHandler);
                if (match && (target === document || target === match || target.contains?.(match))) callback(event, match);
            } else callback(event, target);
        };
        target.addEventListener(type, listener, options);
        return {
            off() {
                target.removeEventListener(type, listener, options);
            }
        };
    },
    preventEvent(event) {
        if (!event) return;
        event.preventDefault?.();
        event.stopPropagation?.();
    },
    prepend(parent, child) {
        parent.prepend(child);
    },
    remove(selector) {
        document.querySelectorAll(selector).forEach((el) => el.remove());
    },
};
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const _dyPanelExecResults = new Map();

function dyCleanupPanelResult(result) {
    if (Array.isArray(result)) {
        for (const item of result) dyCleanupPanelResult(item);
        return;
    }
    if (typeof result === 'function') {
        try {
            result();
        } catch (e) {
            log.warn(e);
        }
        return;
    }
    if (result && typeof result.off === 'function') {
        try {
            result.off();
        } catch (e) {
            log.warn(e);
        }
    }
}
const Panel = {
    getValue(key, fallback) {
        return settings[key] == null ? fallback : settings[key];
    },
    execMenuOnce(key, callback) {
        if (_dyPanelExecResults.has(key)) {
            dyCleanupPanelResult(_dyPanelExecResults.get(key));
            _dyPanelExecResults.delete(key);
        }
        if (!settings[key] || typeof callback !== 'function') return null;
        const result = callback();
        _dyPanelExecResults.set(key, result);
        return result;
    },
};
const DouYinRouter = {
    isLive() {
        return typeof isLiveRoomUrl === 'function' && isLiveRoomUrl();
    }
};
const DouYinVideoDownloadExtract = {
    supportVideoDownloader($parseNode) {
        log.info("视频下载支持");
        const showParseInfoDialog = (data) => {
            const vue =
                (typeof globalThis !== "undefined" && globalThis.Vue) ||
                (typeof window !== "undefined" && window.Vue) ||
                (typeof Vue !== "undefined" ? Vue : null);
            if (!vue || typeof vue.createApp !== "function" || typeof vue.h !== "function" || typeof vue.ref !== "function") {
                qmsg.default.error("Vue 3 未加载，无法打开视频解析面板");
                log.error("Vue 3 未加载，视频解析面板无法初始化");
                return;
            }
            const {
                createApp,
                h,
                ref,
                onMounted,
                onBeforeUnmount
            } = vue;
            const root = document.createElement("div");
            root.className = "dy-video-parse-root";
            document.documentElement.appendChild(root);
            let app = null;
            const cssText = `
.dy-video-parse-root {
position: fixed;
inset: 0;
z-index: 2147483646;
color: #202638;
font: 14px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
isolation: isolate;
-webkit-font-smoothing: antialiased;
}
.dy-video-parse-root *,
.dy-video-parse-root *::before,
.dy-video-parse-root *::after { box-sizing: border-box; }
.dy-video-parse-root button,
.dy-video-parse-root input,
.dy-video-parse-root a { font: inherit; }
.dy-video-parse-root button { -webkit-tap-highlight-color: transparent; }
.dy-video-parse-root .dy-vp-backdrop {
position: absolute;
inset: 0;
display: flex;
align-items: center;
justify-content: center;
padding: clamp(10px, 2.5vw, 28px);
background: rgba(13, 18, 31, .42);
backdrop-filter: blur(12px) saturate(135%);
-webkit-backdrop-filter: blur(12px) saturate(135%);
animation: dy-vp-mask-in .2s ease both;
}
.dy-video-parse-root .dy-vp-panel {
display: flex;
flex-direction: column;
width: min(920px, 96vw);
height: min(760px, 90vh);
height: min(760px, 90dvh);
max-height: calc(100dvh - 20px);
min-height: 0;
overflow: hidden;
border: 1px solid rgba(255, 255, 255, .66);
border-radius: 20px;
background: rgba(248, 250, 255, .82);
box-shadow: 0 26px 90px rgba(4, 10, 24, .3), inset 0 1px 0 rgba(255, 255, 255, .78);
backdrop-filter: blur(28px) saturate(170%);
-webkit-backdrop-filter: blur(28px) saturate(170%);
animation: dy-vp-panel-in .24s cubic-bezier(.2, .75, .25, 1) both;
}
.dy-video-parse-root .dy-vp-backdrop.is-closing { pointer-events: none; animation: dy-vp-mask-out .18s ease both; }
.dy-video-parse-root .dy-vp-panel.is-closing { animation: dy-vp-panel-out .18s ease both; }
@keyframes dy-vp-mask-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes dy-vp-panel-in { from { opacity: 0; transform: translateY(10px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes dy-vp-mask-out { to { opacity: 0; } }
@keyframes dy-vp-panel-out { to { opacity: 0; transform: translateY(7px) scale(.99); } }
.dy-video-parse-root .dy-vp-header {
position: relative;
z-index: 2;
display: flex;
flex: 0 0 auto;
align-items: center;
justify-content: space-between;
gap: 18px;
min-height: 76px;
padding: 15px 22px;
border-bottom: 1px solid rgba(255, 255, 255, .78);
background: rgba(255, 255, 255, .43);
box-shadow: 0 1px 0 rgba(37, 48, 72, .035);
}
.dy-video-parse-root .dy-vp-heading { display: flex; align-items: center; gap: 11px; min-width: 0; }
.dy-video-parse-root .dy-vp-mark {
display: inline-flex;
align-items: center;
justify-content: center;
flex: 0 0 38px;
width: 38px;
height: 38px;
border: 1px solid rgba(255, 255, 255, .8);
border-radius: 12px;
background: linear-gradient(145deg, rgba(255,255,255,.92), rgba(227,233,249,.76));
color: #3446a4;
box-shadow: 0 5px 14px rgba(41, 57, 112, .09);
}
.dy-video-parse-root .dy-vp-heading-copy { min-width: 0; }
.dy-video-parse-root .dy-vp-eyebrow { margin: 0 0 2px; color: #858da0; font-size: 10px; font-weight: 700; letter-spacing: .13em; }
.dy-video-parse-root .dy-vp-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.dy-video-parse-root .dy-vp-title { margin: 0; color: #202638; font-size: 18px; font-weight: 680; line-height: 1.3; letter-spacing: -.015em; }
.dy-video-parse-root .dy-vp-source {
display: inline-flex;
align-items: center;
min-height: 20px;
padding: 2px 7px;
border: 1px solid rgba(91, 109, 210, .16);
border-radius: 999px;
background: rgba(91, 109, 210, .08);
color: #5362b3;
font-size: 11px;
white-space: nowrap;
}
.dy-video-parse-root .dy-vp-close {
display: inline-flex;
align-items: center;
justify-content: center;
flex: 0 0 34px;
width: 34px;
height: 34px;
padding: 0;
border: 1px solid rgba(80, 92, 118, .12);
border-radius: 10px;
background: rgba(255, 255, 255, .58);
color: #667085;
font-size: 22px;
line-height: 1;
cursor: pointer;
transition: background .16s ease, color .16s ease, transform .16s ease;
}
.dy-video-parse-root .dy-vp-close:hover { background: rgba(255,255,255,.94); color: #202638; transform: translateY(-1px); }
.dy-video-parse-root .dy-vp-close:focus-visible,
.dy-video-parse-root .dy-vp-action:focus-visible,
.dy-video-parse-root .dy-vp-link-button:focus-visible,
.dy-video-parse-root .dy-vp-picture-video:focus-visible { outline: 2px solid #7788e7; outline-offset: 3px; }
.dy-video-parse-root .dy-vp-content {
flex: 1 1 auto;
min-height: 0;
overflow: auto;
overscroll-behavior: contain;
padding: 18px 22px 22px;
scrollbar-width: thin;
scrollbar-color: rgba(118, 130, 155, .42) transparent;
}
.dy-video-parse-root .dy-vp-content::-webkit-scrollbar { width: 8px; height: 8px; }
.dy-video-parse-root .dy-vp-content::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 99px; background: rgba(118,130,155,.38); background-clip: padding-box; }
.dy-video-parse-root .dy-vp-info {
margin: 0 0 18px;
padding: 15px 17px;
border: 1px solid rgba(255, 255, 255, .82);
border-radius: 14px;
background: rgba(255, 255, 255, .48);
box-shadow: inset 0 1px 0 rgba(255,255,255,.68);
}
.dy-video-parse-root .dy-vp-info-row { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 10px; padding: 4px 0; }
.dy-video-parse-root .dy-vp-info-row + .dy-vp-info-row { margin-top: 4px; border-top: 1px solid rgba(115, 126, 150, .1); padding-top: 9px; }
.dy-video-parse-root .dy-vp-info-label { color: #7a8499; font-size: 12px; }
.dy-video-parse-root .dy-vp-info-value { min-width: 0; color: #343e53; overflow-wrap: anywhere; white-space: pre-wrap; }
.dy-video-parse-root .dy-vp-section { margin-top: 20px; }
.dy-video-parse-root .dy-vp-section:first-child { margin-top: 0; }
.dy-video-parse-root .dy-vp-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 10px; }
.dy-video-parse-root .dy-vp-section-heading h3 { margin: 0; color: #293247; font-size: 14px; font-weight: 680; }
.dy-video-parse-root .dy-vp-count { color: #8992a5; font-size: 11px; }
.dy-video-parse-root .dy-vp-resource-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
.dy-video-parse-root .dy-vp-resource-card {
min-width: 0;
padding: 14px;
border: 1px solid rgba(255, 255, 255, .86);
border-radius: 14px;
background: rgba(255, 255, 255, .55);
box-shadow: 0 5px 18px rgba(36, 49, 80, .035), inset 0 1px 0 rgba(255,255,255,.7);
transition: border-color .16s ease, background .16s ease, box-shadow .16s ease, transform .16s ease;
}
.dy-video-parse-root .dy-vp-resource-card:hover { border-color: rgba(120, 135, 210, .3); background: rgba(255,255,255,.7); box-shadow: 0 8px 22px rgba(36,49,80,.07); }
.dy-video-parse-root .dy-vp-resource-top { display: flex; align-items: center; gap: 12px; min-width: 0; }
.dy-video-parse-root .dy-vp-resource-mark {
display: flex;
align-items: center;
justify-content: center;
flex: 0 0 42px;
width: 42px;
height: 42px;
border: 1px solid rgba(91, 109, 210, .12);
border-radius: 12px;
background: linear-gradient(145deg, rgba(245,247,255,.92), rgba(226,232,250,.72));
color: #4d5db4;
font-size: 11px;
font-weight: 750;
letter-spacing: .02em;
}
.dy-video-parse-root .dy-vp-resource-copy { flex: 1 1 auto; min-width: 0; }
.dy-video-parse-root .dy-vp-resource-title { margin: 0; color: #2a344a; font-size: 13px; font-weight: 650; overflow-wrap: anywhere; }
.dy-video-parse-root .dy-vp-resource-meta { margin: 4px 0 0; color: #858ea1; font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
.dy-video-parse-root .dy-vp-action {
display: inline-flex;
flex: 0 0 auto;
align-items: center;
justify-content: center;
gap: 7px;
min-height: 34px;
padding: 0 12px;
border: 1px solid rgba(75, 91, 185, .22);
border-radius: 9px;
background: linear-gradient(180deg, rgba(96, 115, 215, .98), rgba(75, 91, 190, .98));
box-shadow: 0 4px 10px rgba(69, 84, 173, .15), inset 0 1px 0 rgba(255,255,255,.2);
color: #fff;
font-size: 12px;
font-weight: 620;
white-space: nowrap;
cursor: pointer;
transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
}
.dy-video-parse-root .dy-vp-action:hover:not(:disabled) { filter: brightness(1.04); transform: translateY(-1px); box-shadow: 0 6px 14px rgba(69,84,173,.2); }
.dy-video-parse-root .dy-vp-action:active:not(:disabled) { transform: translateY(0); }
.dy-video-parse-root .dy-vp-action:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
.dy-video-parse-root .dy-vp-action svg { display: block; width: 15px; height: 15px; flex: 0 0 15px; }
.dy-video-parse-root .dy-vp-url-row { display: flex; align-items: baseline; gap: 8px; min-width: 0; margin-top: 11px; padding-top: 10px; border-top: 1px solid rgba(117, 128, 153, .1); }
.dy-video-parse-root .dy-vp-url-label { flex: 0 0 auto; color: #8a93a6; font-size: 11px; }
.dy-video-parse-root .dy-vp-url { display: block; min-width: 0; overflow: hidden; color: #6876be; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; text-decoration: none; }
.dy-video-parse-root .dy-vp-url:hover { color: #3f50ad; text-decoration: underline; }
.dy-video-parse-root .dy-vp-backups { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin-top: 9px; }
.dy-video-parse-root .dy-vp-backup-label { color: #8a93a6; font-size: 11px; }
.dy-video-parse-root .dy-vp-link-button {
display: inline-flex;
align-items: center;
justify-content: center;
min-height: 25px;
padding: 2px 8px;
border: 1px solid rgba(102, 116, 150, .16);
border-radius: 7px;
background: rgba(255,255,255,.56);
color: #5967b1;
font-size: 11px;
cursor: pointer;
transition: background .15s ease, border-color .15s ease;
}
.dy-video-parse-root .dy-vp-link-button:hover { border-color: rgba(91,109,210,.3); background: rgba(255,255,255,.9); }
.dy-video-parse-root .dy-vp-picture-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.dy-video-parse-root .dy-vp-picture-card { min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.86); border-radius: 13px; background: rgba(255,255,255,.58); box-shadow: 0 5px 16px rgba(36,49,80,.04); }
.dy-video-parse-root .dy-vp-picture-preview { position: relative; aspect-ratio: 1 / 1; overflow: hidden; background: rgba(221,226,237,.6); }
.dy-video-parse-root .dy-vp-picture-preview img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .24s ease; }
.dy-video-parse-root .dy-vp-picture-card:hover .dy-vp-picture-preview img { transform: scale(1.025); }
.dy-video-parse-root .dy-vp-picture-preview img.is-error { opacity: 0; }
.dy-video-parse-root .dy-vp-picture-download {
position: absolute;
right: 9px;
bottom: 9px;
z-index: 2;
display: inline-flex;
align-items: center;
justify-content: center;
gap: 6px;
min-height: 30px;
padding: 0 10px;
border: 1px solid rgba(255,255,255,.58);
border-radius: 8px;
background: rgba(24, 30, 47, .68);
box-shadow: 0 4px 12px rgba(0,0,0,.12);
color: #fff;
font-size: 11px;
cursor: pointer;
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
}
.dy-video-parse-root .dy-vp-picture-download:hover { background: rgba(24,30,47,.84); }
.dy-video-parse-root .dy-vp-picture-video {
position: absolute;
top: 9px;
right: 9px;
z-index: 3;
min-height: 26px;
padding: 0 9px;
border: 1px solid rgba(255,255,255,.6);
border-radius: 8px;
background: rgba(34, 42, 65, .62);
color: #fff;
font-size: 11px;
cursor: pointer;
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
}
.dy-video-parse-root .dy-vp-picture-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; padding: 9px 10px; color: #747f95; font-size: 11px; }
.dy-video-parse-root .dy-vp-picture-footer span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dy-video-parse-root .dy-vp-empty { padding: 32px 16px; border: 1px dashed rgba(112,125,155,.28); border-radius: 14px; color: #818ba0; text-align: center; }
.dy-video-parse-root .dy-vp-footer { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; gap: 12px; min-height: 42px; padding: 9px 22px; border-top: 1px solid rgba(255,255,255,.7); background: rgba(255,255,255,.34); color: #929bad; font-size: 10px; }
.dy-video-parse-root .dy-vp-footer span { min-width: 0; }
@media (max-width: 640px) {
.dy-video-parse-root .dy-vp-panel { width: 100%; height: 94vh; height: 94dvh; max-height: calc(100dvh - 12px); border-radius: 15px; }
.dy-video-parse-root .dy-vp-header { min-height: 62px; padding: 11px 13px; }
.dy-video-parse-root .dy-vp-mark { flex-basis: 34px; width: 34px; height: 34px; border-radius: 10px; }
.dy-video-parse-root .dy-vp-title { font-size: 16px; }
.dy-video-parse-root .dy-vp-content { padding: 13px; }
.dy-video-parse-root .dy-vp-resource-top { align-items: flex-start; flex-wrap: wrap; gap: 9px; }
.dy-video-parse-root .dy-vp-resource-copy { flex-basis: calc(100% - 54px); }
.dy-video-parse-root .dy-vp-resource-top > .dy-vp-action { margin-left: 51px; }
.dy-video-parse-root .dy-vp-picture-grid { grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); gap: 9px; }
.dy-video-parse-root .dy-vp-footer { padding: 8px 13px; }
}
@media (prefers-reduced-motion: reduce) {
.dy-video-parse-root *,
.dy-video-parse-root *::before,
.dy-video-parse-root *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
`;
            const safeArray = (value) => Array.isArray(value) ? value : [];
            const safeUrl = (value) => {
                const url = typeof value === "string" ? value.trim() : "";
                return /^https?:\/\//i.test(url) ? url : "";
            };
            const formatSize = (value) => {
                try {
                    return value ? utils$1.formatByteToSize(value) : "未知大小";
                } catch {
                    return "未知大小";
                }
            };
            const getVideoQuality = (item) => {
                const width = Number(item?.width) || 0;
                const height = Number(item?.height) || 0;
                const fps = item?.fps;
                const resolution = width && height ? `${width}x${height}` : "未知分辨率";
                const qualityInfo = `${resolution}${fps != null && fps !== "" ? ` @${fps}` : ""}`;
                const max = Math.max(width, height);
                const min = Math.min(width, height);
                let qualityText = width ? `${width}P` : "未知";
                if (max > 7000 && max < 9000) qualityText = "8K";
                else if (max > 3500) qualityText = "4K";
                else if (max > 2000 && min > 1080) qualityText = "2K";
                else if (min) qualityText = `${min}P`;
                return {
                    width,
                    height,
                    qualityInfo,
                    qualityText
                };
            };
            const safeClone = (value) => {
                try {
                    if (typeof structuredClone === "function") return structuredClone(value);
                } catch (error) {
                    log.warn("structuredClone 失败，改用 JSON 复制", error);
                }
                return JSON.parse(JSON.stringify(value));
            };
            app = createApp({
                setup() {
                    const isClosing = ref(false);
                    let closeTimer = null;
                    const close = () => {
                        if (isClosing.value) return;
                        isClosing.value = true;
                        closeTimer = window.setTimeout(() => {
                            try {
                                app?.unmount();
                            } finally {
                                root.remove();
                            }
                        }, 180);
                    };
                    const isTopDialog = () => {
                        const roots = document.querySelectorAll(".dy-video-parse-root");
                        return roots.length > 0 && roots[roots.length - 1] === root;
                    };
                    const onKeyDown = (event) => {
                        if (event.key === "Escape" && isTopDialog()) {
                            event.preventDefault();
                            close();
                        }
                    };
                    onMounted(() => {
                        window.addEventListener("keydown", onKeyDown, true);
                        root.querySelector(".dy-vp-close")?.focus?.({
                            preventScroll: true
                        });
                    });
                    onBeforeUnmount(() => {
                        if (closeTimer !== null) window.clearTimeout(closeTimer);
                        window.removeEventListener("keydown", onKeyDown, true);
                    });
                    const startDownload = (event, urlValue, initialFileName) => {
                        event?.preventDefault?.();
                        event?.stopPropagation?.();
                        const url = safeUrl(urlValue);
                        if (!url) {
                            qmsg.default.error("下载地址无效或为空");
                            return;
                        }
                        let fileName = String(initialFileName || "douyin-download");
                        if (Panel.getValue("dy-video-popupDownloadRenameFileName")) {
                            const renameFileName = window.prompt("请确认下载的文件名", fileName);
                            if (renameFileName === null) return;
                            const cleanName = transformDownloadFileName({}, renameFileName.trim());
                            if (cleanName) fileName = cleanName;
                        }
                        if (typeof _GM_download !== "function") {
                            log.warn("当前脚本环境不支持 GM_download，改为新标签页打开下载地址");
                            window.open(url, "_blank", "noopener,noreferrer");
                            return;
                        }
                        let abortDownload = null;
                        let isSuccessDownload = false;
                        let isDownloadEnd = false;
                        let loading = null;
                        try {
                            loading = qmsg.default.loading("下载中...", {
                                showClose: true,
                                onClose() {
                                    if (!isSuccessDownload && typeof abortDownload === "function") abortDownload();
                                },
                            });
                            const result = _GM_download({
                                url,
                                name: fileName,
                                headers: {
                                    Referer: window.location.href
                                },
                                onload() {
                                    isSuccessDownload = true;
                                    loading?.close?.();
                                    qmsg.default.success(`下载 ${fileName} 已完成`);
                                },
                                onprogress(details) {
                                    if (details && Number(details.total) > 0 && !isDownloadEnd) {
                                        const progress = ((Number(details.loaded) / Number(details.total)) * 100).toFixed(1);
                                        loading?.setText?.(`下载中... ${progress}%`);
                                        if (Number(details.loaded) >= Number(details.total)) isDownloadEnd = true;
                                    }
                                },
                                onerror(error) {
                                    loading?.close?.();
                                    log.error("下载失败", error);
                                    const reason = typeof error === "object" && error?.error ? `，原因：${error.error}` : "";
                                    qmsg.default.error(`下载 ${fileName} 失败或已取消${reason}`, {
                                        timeout: 6000
                                    });
                                },
                                ontimeout() {
                                    loading?.close?.();
                                    qmsg.default.error(`下载 ${fileName} 请求超时`);
                                },
                            });
                            if (result && typeof result === "object" && typeof result.abort === "function") abortDownload = result.abort;
                        } catch (error) {
                            loading?.close?.();
                            log.error("启动下载失败", error);
                            qmsg.default.error(`启动下载失败：${error?.message || error}`);
                        }
                    };
                    const makeDownloadButton = (url, fileName, label, extraClass = "") =>
                        h("button", {
                            type: "button",
                            class: ["dy-vp-action", extraClass],
                            disabled: !safeUrl(url),
                            onClick: (event) => startDownload(event, url, fileName),
                        }, [
                            h("svg", {
                                viewBox: "0 0 24 24",
                                "aria-hidden": "true",
                                fill: "none"
                            }, [
                                h("path", {
                                    d: "M12 3v11m0 0 4-4m-4 4-4-4M4 17v3h16v-3",
                                    stroke: "currentColor",
                                    "stroke-width": "1.8",
                                    "stroke-linecap": "round",
                                    "stroke-linejoin": "round"
                                }),
                            ]),
                            h("span", label),
                        ]);
                    const makeUrlLink = (url, fileName, label = url) => {
                        const validUrl = safeUrl(url);
                        if (!validUrl) return h("span", {
                            class: "dy-vp-url"
                        }, "暂无有效地址");
                        return h("a", {
                            class: "dy-vp-url",
                            href: validUrl,
                            title: validUrl,
                            onClick: (event) => startDownload(event, validUrl, fileName),
                        }, label);
                    };
                    const makeBackupLinks = (urls, fileName) => {
                        const validUrls = safeArray(urls).map(safeUrl).filter(Boolean);
                        if (!validUrls.length) return null;
                        return h("div", {
                            class: "dy-vp-backups"
                        }, [
                            h("span", {
                                class: "dy-vp-backup-label"
                            }, "备用地址"),
                            ...validUrls.map((url, index) =>
                                h("button", {
                                    type: "button",
                                    class: "dy-vp-link-button",
                                    key: `${index}-${url}`,
                                    title: url,
                                    onClick: (event) => startDownload(event, url, fileName),
                                }, `地址 ${index + 1}`)
                            ),
                        ]);
                    };
                    const makeSectionHeading = (title, count) =>
                        h("div", {
                            class: "dy-vp-section-heading"
                        }, [
                            h("h3", title),
                            h("span", {
                                class: "dy-vp-count"
                            }, `${count} 个资源`),
                        ]);
                    const videoItems = safeArray(data.videoDownloadInfo?.urlInfoList).map((item, index) => {
                        const quality = getVideoQuality(item);
                        let fileName = data.videoDownloadInfo?.fileName || "douyin-video";
                        fileName = transformDownloadFileName({
                            quality: quality.qualityInfo,
                            "quality-t": quality.qualityText
                        }, fileName);
                        const rawFormat = String(item?.format || "mp4").replace(/^\./, "");
                        const format = /^[a-z0-9]{1,8}$/i.test(rawFormat) ? rawFormat : "mp4";
                        return {
                            key: `${index}-${quality.qualityInfo}`,
                            item,
                            quality,
                            fileName: `${fileName}.${format}`,
                            backUrls: safeArray(item?.backUrl),
                        };
                    });
                    const musicItems = safeArray(data.musicDownloadInfo?.urlInfoList).map((item, index) => ({
                        key: `${index}-${item?.title || "music"}`,
                        item,
                        fileName: `${transformDownloadFileName({}, data.musicDownloadInfo?.fileName || "douyin-music")}.mp3`,
                        backUrls: safeArray(item?.backUrl),
                    }));
                    const pictureItems = safeArray(data.pictureDownloadInfo?.urlInfoList).map((item, index) => {
                        const sizeInfo = `${Number(item?.width) || 0}x${Number(item?.height) || 0}`;
                        const fileName = `${transformDownloadFileName({ quality: sizeInfo, "quality-t": sizeInfo }, data.pictureDownloadInfo?.fileName || "douyin-picture")}.png`;
                        return {
                            key: `${index}-${sizeInfo}`,
                            item,
                            sizeInfo,
                            fileName
                        };
                    });
                    const openPictureVideo = (event, index) => {
                        event?.preventDefault?.();
                        event?.stopPropagation?.();
                        const pictureInfo = pictureItems[index]?.item;
                        if (!pictureInfo) {
                            qmsg.default.error("未获取到图片信息");
                            return;
                        }
                        try {
                            const clonedPicture = safeClone(pictureInfo);
                            const videoList = safeArray(clonedPicture.video);
                            clonedPicture.video = [];
                            showParseInfoDialog({
                                isFromNetWork: !!data.isFromNetWork,
                                videoInfo: data.videoInfo,
                                videoDownloadInfo: {
                                    fileName: data.videoDownloadInfo?.fileName || "douyin-video",
                                    urlInfoList: videoList,
                                },
                                pictureDownloadInfo: {
                                    fileName: data.pictureDownloadInfo?.fileName || "douyin-picture",
                                    urlInfoList: [clonedPicture],
                                },
                            });
                        } catch (error) {
                            log.error("打开图片关联视频失败", error);
                            qmsg.default.error("无法打开图片关联视频");
                        }
                    };
                    const renderInfo = () => {
                        if (!data.videoInfo) return null;
                        return h("section", {
                            class: "dy-vp-info"
                        }, [
                            h("div", {
                                class: "dy-vp-info-row"
                            }, [
                                h("span", {
                                    class: "dy-vp-info-label"
                                }, "作者"),
                                h("span", {
                                    class: "dy-vp-info-value"
                                }, String(data.videoInfo.author || "未知作者")),
                            ]),
                            h("div", {
                                class: "dy-vp-info-row"
                            }, [
                                h("span", {
                                    class: "dy-vp-info-label"
                                }, "文案"),
                                h("span", {
                                    class: "dy-vp-info-value"
                                }, String(data.videoInfo.desc || "暂无文案")),
                            ]),
                        ]);
                    };
                    const renderVideos = () => {
                        if (!videoItems.length) return null;
                        return h("section", {
                            class: "dy-vp-section"
                        }, [
                            makeSectionHeading("视频资源", videoItems.length),
                            h("div", {
                                class: "dy-vp-resource-list"
                            }, videoItems.map(({
                                    key,
                                    item,
                                    quality,
                                    fileName,
                                    backUrls
                                }) =>
                                h("article", {
                                    class: "dy-vp-resource-card",
                                    key
                                }, [
                                    h("div", {
                                        class: "dy-vp-resource-top"
                                    }, [
                                        h("div", {
                                            class: "dy-vp-resource-mark"
                                        }, "MP4"),
                                        h("div", {
                                            class: "dy-vp-resource-copy"
                                        }, [
                                            h("h4", {
                                                class: "dy-vp-resource-title"
                                            }, `视频 · ${quality.qualityText}`),
                                            h("p", {
                                                class: "dy-vp-resource-meta"
                                            }, `清晰度 ${quality.qualityInfo} · 大小 ${formatSize(item?.dataSize)}`),
                                        ]),
                                        makeDownloadButton(item?.url, fileName, "下载视频"),
                                    ]),
                                    h("div", {
                                        class: "dy-vp-url-row"
                                    }, [
                                        h("span", {
                                            class: "dy-vp-url-label"
                                        }, "下载地址"),
                                        makeUrlLink(item?.url, fileName),
                                    ]),
                                    makeBackupLinks(backUrls, fileName),
                                ])
                            )),
                        ]);
                    };
                    const renderMusic = () => {
                        if (!musicItems.length) return null;
                        return h("section", {
                            class: "dy-vp-section"
                        }, [
                            makeSectionHeading("音乐资源", musicItems.length),
                            h("div", {
                                class: "dy-vp-resource-list"
                            }, musicItems.map(({
                                    key,
                                    item,
                                    fileName,
                                    backUrls
                                }) =>
                                h("article", {
                                    class: "dy-vp-resource-card",
                                    key
                                }, [
                                    h("div", {
                                        class: "dy-vp-resource-top"
                                    }, [
                                        h("div", {
                                            class: "dy-vp-resource-mark"
                                        }, "MP3"),
                                        h("div", {
                                            class: "dy-vp-resource-copy"
                                        }, [
                                            h("h4", {
                                                class: "dy-vp-resource-title"
                                            }, String(item?.title || "音乐资源")),
                                            h("p", {
                                                class: "dy-vp-resource-meta"
                                            }, [
                                                item?.author ? `音乐人 ${item.author}` : "音乐人 未知",
                                                item?.album ? ` · 专辑 ${item.album}` : "",
                                                item?.duration ? ` · 时长 ${dyDownloadParseDuration(item.duration)}` : "",
                                            ].join("")),
                                        ]),
                                        makeDownloadButton(item?.url, fileName, "下载音乐"),
                                    ]),
                                    h("div", {
                                        class: "dy-vp-url-row"
                                    }, [
                                        h("span", {
                                            class: "dy-vp-url-label"
                                        }, "下载地址"),
                                        makeUrlLink(item?.url, fileName),
                                    ]),
                                    makeBackupLinks(backUrls, fileName),
                                ])
                            )),
                        ]);
                    };
                    const renderPictures = () => {
                        if (!pictureItems.length) return null;
                        return h("section", {
                            class: "dy-vp-section"
                        }, [
                            makeSectionHeading("图片资源", pictureItems.length),
                            h("div", {
                                class: "dy-vp-picture-grid"
                            }, pictureItems.map(({
                                key,
                                item,
                                sizeInfo,
                                fileName
                            }, index) => {
                                const imageUrl = safeUrl(item?.url);
                                const hasVideo = safeArray(item?.video).length > 0;
                                return h("article", {
                                    class: "dy-vp-picture-card",
                                    key
                                }, [
                                    h("div", {
                                        class: "dy-vp-picture-preview"
                                    }, [
                                        imageUrl ?
                                        h("img", {
                                            src: imageUrl,
                                            alt: `图片 ${sizeInfo}`,
                                            loading: "lazy",
                                            onError: (event) => event.target?.classList?.add("is-error"),
                                        }) :
                                        h("div", {
                                            class: "dy-vp-empty"
                                        }, "图片地址无效"),
                                        makeDownloadButton(imageUrl, fileName, "下载图片", "dy-vp-picture-download"),
                                        hasVideo ?
                                        h("button", {
                                            type: "button",
                                            class: "dy-vp-picture-video",
                                            onClick: (event) => openPictureVideo(event, index),
                                        }, "含关联视频") :
                                        null,
                                    ]),
                                    h("div", {
                                        class: "dy-vp-picture-footer"
                                    }, [
                                        h("span", {
                                            title: sizeInfo
                                        }, sizeInfo),
                                        hasVideo ? h("span", null, `${safeArray(item.video).length} 个视频`) : h("span", null, "图片"),
                                    ]),
                                ]);
                            })),
                        ]);
                    };
                    const renderContent = () => {
                        const children = [renderInfo(), renderVideos(), renderMusic(), renderPictures()].filter(Boolean);
                        if (!children.length) {
                            children.push(h("div", {
                                class: "dy-vp-empty"
                            }, "没有解析到可下载的资源。"));
                        }
                        return children;
                    };
                    return () => h("div", {
                        class: "dy-vp-shell"
                    }, [
                        h("style", {
                            type: "text/css"
                        }, cssText),
                        h("div", {
                            class: ["dy-vp-backdrop", isClosing.value && "is-closing"],
                            onClick: (event) => {
                                if (event.target === event.currentTarget) close();
                            },
                        }, [
                            h("section", {
                                class: ["dy-vp-panel", isClosing.value && "is-closing"],
                                role: "dialog",
                                "aria-modal": "true",
                                "aria-label": "视频解析",
                            }, [
                                h("header", {
                                    class: "dy-vp-header"
                                }, [
                                    h("div", {
                                        class: "dy-vp-heading"
                                    }, [
                                        h("div", {
                                            class: "dy-vp-mark",
                                            "aria-hidden": "true"
                                        }, [
                                            h("svg", {
                                                viewBox: "0 0 24 24",
                                                width: "21",
                                                height: "21",
                                                fill: "none"
                                            }, [
                                                h("path", {
                                                    d: "M12 3v11m0 0 4-4m-4 4-4-4M4 17v3h16v-3",
                                                    stroke: "currentColor",
                                                    "stroke-width": "1.7",
                                                    "stroke-linecap": "round",
                                                    "stroke-linejoin": "round"
                                                }),
                                            ]),
                                        ]),
                                        h("div", {
                                            class: "dy-vp-heading-copy"
                                        }, [
                                            h("p", {
                                                class: "dy-vp-eyebrow"
                                            }, "DOUYIN MEDIA TOOLS"),
                                            h("div", {
                                                class: "dy-vp-title-row"
                                            }, [
                                                h("h2", {
                                                    class: "dy-vp-title"
                                                }, "视频解析"),
                                                h("span", {
                                                    class: "dy-vp-source"
                                                }, data.isFromNetWork ? "网络数据" : "页面数据"),
                                            ]),
                                        ]),
                                    ]),
                                    h("button", {
                                        type: "button",
                                        class: "dy-vp-close",
                                        title: "关闭",
                                        "aria-label": "关闭视频解析面板",
                                        onClick: close,
                                    }, "×"),
                                ]),
                                h("main", {
                                    class: "dy-vp-content"
                                }, renderContent()),
                                h("footer", {
                                    class: "dy-vp-footer"
                                }, [
                                    h("span", "下载操作由用户脚本管理器执行"),
                                    h("span", "按 Esc 关闭"),
                                ]),
                            ]),
                        ]),
                    ]);
                },
            });
            try {
                app.mount(root);
            } catch (error) {
                log.error("Vue 3 视频解析面板挂载失败", error);
                app?.unmount?.();
                root.remove();
                qmsg.default.error("视频解析面板加载失败，请查看控制台");
            }
        };
        const transformDownloadFileName = (
            data,
            fileNameTemplate = Panel.getValue("dy-video-parseVideo-downloadFileName")
        ) => {
            for (const key in data) {
                if (!Reflect.has(data, key)) continue;
                const value = data[key];
                if (value == null) continue;
                const valueStr = value?.toString();
                fileNameTemplate = fileNameTemplate.replace(`{${key}}`, valueStr);
            }
            fileNameTemplate = fileNameTemplate.replaceAll(
                /[:?"*<>|~/\\\u{1}-\u{1f}\u{7f}\u{80}-\u{9f}\p{Cf}\p{Cn}]|^[.\u{0}\p{Zl}\p{Zp}\p{Zs}]|[.\u{0}\p{Zl}\p{Zp}\p{Zs}]$|^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?=\.|$)/giu,
                "_"
            );
            return fileNameTemplate;
        };
        const addDownloadButton = () => {
            const downloadButtonClassName = "gm-video-download-btn";
            let styleNode = null;
            const ensureStyle = () => {
                styleNode = document.getElementById("gm-video-download-btn-style");
                if (styleNode) return styleNode;
                styleNode = document.createElement("style");
                styleNode.id = "gm-video-download-btn-style";
                styleNode.textContent = `
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn {
display: inline-flex !important;
flex: 0 0 38px !important;
align-items: center !important;
justify-content: center !important;
width: 38px !important;
min-width: 38px !important;
height: 38px !important;
margin: 0 7px !important;
padding: 0 !important;
border: 0 !important;
border-radius: 50% !important;
background: transparent !important;
color: var(--xgplayer-icon-color, #fff) !important;
cursor: pointer;
box-sizing: border-box;
opacity: .96;
transition: background-color .16s ease, opacity .16s ease, transform .16s ease;
}
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn:hover {
background: rgba(255, 255, 255, .13) !important;
opacity: 1;
transform: translateY(-1px);
}
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn:active {
transform: translateY(0) scale(.96);
}
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn:focus-visible {
outline: 2px solid rgba(255,255,255,.88);
outline-offset: 2px;
}
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn .xgplayer-icon {
display: inline-flex !important;
align-items: center !important;
justify-content: center !important;
width: 100%;
height: 100%;
padding: 0 !important;
margin: 0 !important;
color: inherit;
pointer-events: none;
}
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn svg {
display: block;
width: 22px !important;
height: 22px !important;
font-size: 22px !important;
flex: 0 0 22px;
}
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn .xg-tips {
pointer-events: none;
white-space: nowrap;
}
@media (max-width: 640px) {
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn {
flex-basis: 34px !important;
width: 34px !important;
min-width: 34px !important;
height: 34px !important;
margin: 0 5px !important;
}
:is(.basePlayerContainer, .xgplayer) xg-right-grid > xg-icon.gm-video-download-btn svg {
width: 20px !important;
height: 20px !important;
flex-basis: 20px;
}
}
`;
                (document.head || document.documentElement).appendChild(styleNode);
                return styleNode;
            };
            const createButton = () => {
                const button = domUtils.createElement("xg-icon", {
                    className: downloadButtonClassName,
                    innerHTML: `
<div class="xgplayer-icon" aria-hidden="true">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
<path fill="currentColor" d="M19 18v2H5v-2H3v4h18v-4h-2zM13 3h-2v10.17l-3.59-3.58L6 11l6 6 6-6-1.41-1.41L13 13.17V3z"/>
</svg>
</div>
<div class="xg-tips">下载</div>
`,
                });
                button.setAttribute("role", "button");
                button.setAttribute("tabindex", "0");
                button.setAttribute("aria-label", "下载视频");
                button.setAttribute("title", "下载视频");
                domUtils.on(button, "keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        domUtils.preventEvent(event);
                        onClick(button);
                    }
                });
                return button;
            };
            ensureStyle();
            const lockFn = new utils$1.LockFunction(() => {
                if (DouYinRouter.isLive()) return;
                $$(`:is(.basePlayerContainer, .xgplayer) xg-right-grid:not(:has(.${downloadButtonClassName}))`).forEach(($xgRightGrid) => {
                    const $btn = createButton();
                    domUtils.on($btn, "click", async (event) => {
                        domUtils.preventEvent(event);
                        await onClick($btn);
                    });
                    domUtils.prepend($xgRightGrid, $btn);
                });
            });
            const observer = utils$1.mutationObserver(document, {
                config: {
                    subtree: true,
                    childList: true,
                },
                immediate: true,
                callback: () => {
                    lockFn.run();
                },
            });
            return {
                off() {
                    observer.disconnect();
                    domUtils.remove(`.${downloadButtonClassName}`);
                    if (styleNode && styleNode.id === "gm-video-download-btn-style") styleNode.remove();
                },
            };
        };
        const onClick = ($click) => {
            if ($click?.closest?.('[data-e2e="feed-live"]') || (typeof isLiveRoomUrl === "function" && isLiveRoomUrl())) {
                qmsg.default.error("无法解析直播视频的下载信息");
                return;
            }
            try {
                const playerScope = $click?.closest?.(".basePlayerContainer, .xgplayer, [data-e2e='feed-active-video'], [data-e2e='feed-item']") || $click?.parentElement || null;
                const fiber = utils$1.getReactInstance($click?.parentElement)?.reactFiber || utils$1.getReactInstance(playerScope)?.reactFiber;
                let awemeInfo = utils$1.queryProperty(fiber, (node) => {
                    const props = node?.memoizedProps || node?.pendingProps || {};
                    const candidate = props?.awemeInfo || props?.videoData?.awemeInfo || props?.item?.awemeInfo;
                    if (candidate && typeof candidate === "object") return {
                        isFind: true,
                        data: candidate
                    };
                    return {
                        isFind: false,
                        data: node?.return || null
                    };
                });
                if (!awemeInfo) {
                    const quickInfo = typeof getQuickPlayerInfo === "function" ? getQuickPlayerInfo() : null;
                    awemeInfo = quickInfo?.raw || null;
                }
                if (awemeInfo?.awemeInfo && typeof awemeInfo.awemeInfo === "object" && !awemeInfo.video && !awemeInfo.authorInfo) {
                    awemeInfo = awemeInfo.awemeInfo;
                }
                const currentVideo = playerScope?.querySelector?.("video") || document.querySelector(SEL.activePlayer + " video") || document.querySelector("video");
                if (!awemeInfo && currentVideo?.currentSrc) awemeInfo = {};
                if (!awemeInfo) {
                    log.error("未获取到当前视频信息", $click, fiber);
                    qmsg.default.error("获取视频信息失败，请先播放或切换到目标视频");
                    return;
                }
                log.info("视频原始数据", awemeInfo);
                const transformAwemeInfo = new DouYinVideoFilterBase().parseAwemeInfoDictData(awemeInfo, "dom", true);
                const isFromNetWork = !!(awemeInfo?.aweme_id || (awemeInfo?.author && Array.isArray(awemeInfo?.video?.bit_rate)));
                if (transformAwemeInfo.nickname == null || transformAwemeInfo.nickname === "") transformAwemeInfo.nickname = "未知作者";
                if (transformAwemeInfo.desc == null || transformAwemeInfo.desc === "") transformAwemeInfo.desc = "未知视频文案";
                let videoDownloadUrlList = Array.isArray(transformAwemeInfo.videoBitRateList) ? transformAwemeInfo.videoBitRateList.slice() : [];
                let musicDownloadUrlList = [];
                let pictureDownloadUrlList = Array.isArray(transformAwemeInfo.pictureList) ? transformAwemeInfo.pictureList.map((item) => ({
                    url: item.url,
                    width: item.width,
                    height: item.height,
                    video: item.videoBitRateList,
                })) : [];
                if (typeof transformAwemeInfo.musicUrl === "string" && utils$1.isNotNull(transformAwemeInfo.musicUrl)) {
                    musicDownloadUrlList.push({
                        url: transformAwemeInfo.musicUrl,
                        author: transformAwemeInfo.musicAuthor,
                        album: transformAwemeInfo.musicAlbum,
                        title: transformAwemeInfo.musicTitle,
                        duration: transformAwemeInfo.musicDuration,
                        backUrl: transformAwemeInfo.musicBackUrlList,
                    });
                }
                if (!videoDownloadUrlList.length && !transformAwemeInfo.isPicture && currentVideo) {
                    const currentUrl = currentVideo.currentSrc || currentVideo.src || "";
                    if (/^https?:\/\//i.test(currentUrl)) {
                        videoDownloadUrlList.push({
                            url: currentUrl,
                            backUrl: [],
                            width: currentVideo.videoWidth || transformAwemeInfo.width || 0,
                            height: currentVideo.videoHeight || transformAwemeInfo.height || 0,
                            fps: 0,
                            dataSize: 0,
                            format: "mp4",
                        });
                    }
                }
                if (!videoDownloadUrlList.length && !pictureDownloadUrlList.length) {
                    qmsg.default.error("未解析出有效的视频或图片资源，可尝试重新加载或切换清晰度");
                    return;
                }
                const downloadTime = utils$1.formatTime(void 0, "yyyy-MM-dd_HH:mm:ss");
                const videoOrPictureTransformOption = {
                    downloadTime,
                    uid: transformAwemeInfo.uid,
                    nickname: transformAwemeInfo.nickname,
                    desc: transformAwemeInfo.desc,
                    awemeId: transformAwemeInfo.awemeId,
                    originDesc: transformAwemeInfo.originDesc,
                };
                const videoDownloadFileName = transformDownloadFileName(videoOrPictureTransformOption);
                const pictureDownloadFileName = transformDownloadFileName(videoOrPictureTransformOption);
                const musicDownloadFileName = transformDownloadFileName({
                    album: transformAwemeInfo.musicAlbum,
                    author: transformAwemeInfo.musicAuthor,
                    title: transformAwemeInfo.musicTitle,
                    duration: transformAwemeInfo.musicDuration,
                    downloadTime,
                }, Panel.getValue("dy-video-parseVideoMusic-downloadFileName"));
                showParseInfoDialog({
                    isFromNetWork,
                    videoInfo: {
                        author: transformAwemeInfo.nickname,
                        desc: transformAwemeInfo.desc
                    },
                    videoDownloadInfo: {
                        fileName: videoDownloadFileName,
                        urlInfoList: videoDownloadUrlList
                    },
                    musicDownloadInfo: {
                        fileName: musicDownloadFileName,
                        urlInfoList: musicDownloadUrlList
                    },
                    pictureDownloadInfo: {
                        fileName: pictureDownloadFileName,
                        urlInfoList: pictureDownloadUrlList
                    },
                });
            } catch (error) {
                log.error(error);
                qmsg.default.error("解析视频失败：" + (error?.message || error));
            }
        };
        _dyVideoDownloadOpenCurrent = () => {
            const currentNode = document.querySelector(SEL.activePlayer) || document.querySelector(".xgplayer") || document.querySelector("video") || document.querySelector(SEL.activeVideo) || document.body;
            onClick(currentNode);
        };
        if ($parseNode) onClick($parseNode);
        else {
            const listener = domUtils.on(
                document,
                "click",
                'div[data-e2e="video-share-container"] div[data-inuser="false"] button + div',
                (evt, $click) => {
                    if (!Panel.getValue("parseVideo")) return;
                    domUtils.preventEvent(evt);
                    onClick($click);
                }, {
                    capture: true
                }
            );
            Panel.execMenuOnce("dy-video-downloader-addDownloadButton", () => {
                const {
                    off
                } = addDownloadButton();
                return [
                    () => {
                        off();
                    },
                ];
            });
            return [listener.off];
        }
    },
};

function restartVideoDownloadFeature() {
    if (_dyVideoDownloadListenerCleanup) {
        try {
            _dyVideoDownloadListenerCleanup();
        } catch (e) {
            log.warn(e);
        }
        _dyVideoDownloadListenerCleanup = null;
    }
    if (!settings.parseVideo && !settings['dy-video-downloader-addDownloadButton']) {
        Panel.execMenuOnce('dy-video-downloader-addDownloadButton', () => null);
        return;
    }
    try {
        const cleanupList = DouYinVideoDownloadExtract.supportVideoDownloader();
        _dyVideoDownloadListenerCleanup = () => {
            if (Array.isArray(cleanupList)) cleanupList.forEach((fn) => {
                if (typeof fn === 'function') fn();
            });
        };
    } catch (error) {
        log.error('Video download initialization failed', error);
        qmsg.default.error('视频下载模块初始化失败：' + (error?.message || error));
    }
}

function openCurrentVideoDownloadPanel() {
    if (typeof _dyVideoDownloadOpenCurrent === 'function') {
        _dyVideoDownloadOpenCurrent();
        return;
    }
    const currentNode = document.querySelector(SEL.activePlayer) || document.querySelector('.xgplayer') || document.querySelector('video') || document.querySelector(SEL.activeVideo) || document.body;
    try {
        DouYinVideoDownloadExtract.supportVideoDownloader(currentNode);
    } catch (e) {
        log.error(e);
        qmsg.default.error('解析当前视频失败：' + (e?.message || e));
    }
    if (typeof _dyVideoDownloadOpenCurrent !== 'function') qmsg.default.error('当前页面未找到可解析的视频');
}
// =========================================================
//                   初始化（分段加载）
// =========================================================
function init() {
    const lastCrash = CrashLog.latest();
    const isCriticalCrash = !!lastCrash &&
        (lastCrash.type === 'module-error' || lastCrash.type === 'uncaught-error');
    const recoveryMode = isCriticalCrash;
    ModuleLoader.setRecoveryMode(recoveryMode);
    if (recoveryMode) {
        cc('yellow', `⚠ 检测到历史崩溃记录（${lastCrash.timeStr}：${lastCrash.module || lastCrash.type}）→ 进入分段加载恢复模式`);
        console.warn('[抖音优化] 上次崩溃记录:', lastCrash);
    }
    cc('magenta', `=== 抖音优化 + 全局防暂停 v${SCRIPT_VERSION} 启动 ===`);
    ModuleLoader.run('环境探测', () => {
        try {
            const mode = detectSelectorMode();
            cc('cyan', '容器选择方式:');
            if (typeof console.table === 'function') console.table(mode);
            else console.log(mode);
        } catch (e) {}
    });
    ModuleLoader.run('全局 Tooltip', () => initGlobalTooltip());
    ModuleLoader.run('主题监听', () => {
        ThemeManager.watch();
        // 兜底：DOMContentLoaded 之后再检查一次（此时抖音主题一般已经应用）
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => ThemeManager.update(), {
                once: true
            });
        } else {
            setTimeout(() => ThemeManager.update(), 200);
        }
    });
    ModuleLoader.run('交互锁', () => setupInteractionLock());
    ModuleLoader.run('清屏持久化', () => setupImmersivePersistence());
    ModuleLoader.run('礼物面板隐藏', () => applyPayHide());
    ModuleLoader.run('视频镜像', () => applyMirror());
    ModuleLoader.run('防暂停保活', () => setupKeepAlive());
    ModuleLoader.run('视频解析与下载', () => restartVideoDownloadFeature());
    ModuleLoader.run('键盘快捷键监听', () => document.addEventListener('keydown', keydown, false));
    ModuleLoader.run('URL 变化监听', () => {
        let lastUrl = location.href;
        setInterval(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                cc('blue', 'URL变化，重置弹幕');
                resetPools();
            }
        }, 2000);
    });
    setTimeout(() => {
        ModuleLoader.run('导航栏按钮注入', () => injectScriptMenuButton());
    }, 1000);
    setTimeout(() => {
        ModuleLoader.run('画质初始检测', () => switchToHighestQuality());
        ModuleLoader.run('弹幕初始扫描', () => filterDanmu());
        ModuleLoader.run('跳过检测初始扫描', () => checkSkipFeed());
    }, 500);
    setTimeout(() => {
        ModuleLoader.run('画质定时器', () => startQualityTimer());
        ModuleLoader.run('弹幕定时器', () => startDanmuTimer());
        ModuleLoader.run('跳过检测定时器', () => startSkipTimer());
        ModuleLoader.run('清屏持久化定时器', () => startImmersiveTimer());
    }, 1000);
    ModuleLoader.run('DOM 变化观察器', () => {
        let observerTimer = null;
        const observer = new MutationObserver(() => {
            if (observerTimer) clearTimeout(observerTimer);
            observerTimer = setTimeout(() => {
                try {
                    hideNonVideoElements();
                } catch (e) {}
                try {
                    filterGiftMessages();
                } catch (e) {}
                try {
                    hookAllVideos();
                } catch (e) {}
                try {
                    if (settings.enableNavButton) injectScriptMenuButton();
                } catch (e) {}
            }, 300);
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        window._dyObserver = observer;
    });
    setTimeout(() => {
        ModuleLoader.run('福袋自动抢', () => {
            LotteryModule.init();
            LotteryModule.setupRouteWatcher();
        });
        ModuleLoader.run('消息悬浮窗', () => initMessagePreview());
    }, 1500);
    cc('green', '初始化完成');
    if (window.__dyLoadOk) window.__dyLoadOk();
    // ★ 监控浮窗记忆自动打开
    if (settings.monitorAutoOpen) {
        const openMonitor = () => {
            try {
                if (!MonitorWindow.isOpen()) MonitorWindow.open();
            } catch (e) {}
        };
        if (document.body) requestAnimationFrame(openMonitor);
        else document.addEventListener('DOMContentLoaded', openMonitor, {
            once: true
        });
    }
    setTimeout(() => {
        const hasErrors = ModuleLoader.hasErrors();
        if (hasErrors) {
            try {
                showErrorReport(true);
            } catch (e) {}
        } else {
            try {
                CrashLog.clear();
            } catch (e) {}
            if (recoveryMode) {
                cc('yellow', '⚠ 恢复模式：上次崩溃记录已保留，本次加载正常。可点击「⌕ 查看崩溃 / 加载报告」查看详情');
            }
        }
    }, 5000);
}
// =========================================================
//                   启动入口
// =========================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    setTimeout(init, 1000);
}
window.addEventListener('beforeunload', () => {
    if (timerQuality) {
        clearInterval(timerQuality);
        timerQuality = null;
    }
    if (timerDanmu) {
        clearInterval(timerDanmu);
        timerDanmu = null;
    }
    if (timerSkip) {
        clearInterval(timerSkip);
        timerSkip = null;
    }
    stopImmersiveTimer();
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    if (window._dyObserver) {
        window._dyObserver.disconnect();
        window._dyObserver = null;
    }
    if (danmuSyncTimer) {
        clearInterval(danmuSyncTimer);
        danmuSyncTimer = null;
    }
    if (typeof LotteryModule !== 'undefined') LotteryModule.destroy();
    document.removeEventListener('keydown', keydown, false);
});