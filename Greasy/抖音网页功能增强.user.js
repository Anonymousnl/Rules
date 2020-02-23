// ==UserScript==
// @name			抖音网页功能增强
// @version			2026100810
// @exclude			*://lf-zt.douyin.com*
// @match			*://*.douyin.com/*
// @match			*://*.iesdouyin.com/*
// @match			https://www.douyin.com/?*
// @require			https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.31/vue.global.min.js
// @grant			GM_addStyle
// @grant			GM_getValue
// @grant			GM_info
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
    const MAX = 30;

    function getAll() {
        try {
            const v = GM_getValue(KEY, []);
            return Array.isArray(v) ? v : [];
        } catch (e) {
            return [];
        }
    }

    function push(entry) {
        try {
            const list = getAll();
            const item = {
                time: Date.now(),
                timeStr: new Date().toLocaleString('zh-CN'),
                version: SCRIPT_VERSION,
                url: String(location.href).slice(0, 200),
                ...entry,
            };
            if (item.stack && item.stack.length > 2000) item.stack = item.stack.slice(0, 2000) + '…';
            if (item.message && item.message.length > 500) item.message = item.message.slice(0, 500) + '…';
            list.unshift(item);
            GM_setValue(KEY, list.slice(0, MAX));
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
        latest
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
    enableDOMClean: true,
    hideNonVideoElements_Switch: true,
    interactionLockDelay: 3.0,
    pollingQuality: 1.5,
    pollingDanmu: 0.5,
    pollingClean: 10.0,
    consoleOutputLog_Switch: false,
    hideBlockedWordsInMenu_Switch: false,
    poolSizeLimit: 50,
    customPlaybackRate: 1.0,
    enableSplashScreen: false,
    enableMsgFloat: true,
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
    enableMsgFloatHover: true,
    pauseGuard_mouseSimInterval: 60,
    pauseGuard_backgroundResumeInterval: 30,
    pauseGuard_visibilityCheckInterval: 3,
    pauseGuard_popupClickInterval: 2,
    pauseGuard_popupClickDedupe: 1.5,
    pauseGuard_domMutationDebounce: 500,
    domClean_minCardThreshold: 10,
    domClean_keepAround: 3,
    domClean_triggerProbability: 30,
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
        if (resumed) plog(`已恢复 ${resumed} 个视频`);
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
html[data-dy-theme="light"] #dyLotteryToggle { color: #fff !important; }
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
/* 消息悬浮窗：轻量淡入淡出 */
#dy-msg-float-window {
transition: opacity 0.18s ease,
transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
transform-origin: top left;
}
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
<span class="dy-tip" data-tip="开启后自动识别直播间福袋、检查参与条件、自动参与并检测开奖结果。快捷键：Ctrl+Q">启用福袋自动抢</span>
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
快捷键：<code style="background:rgba(255,255,255,0.1);padding:0 6px;border-radius:3px;">Ctrl</code>
+ <code style="background:rgba(255,255,255,0.1);padding:0 6px;border-radius:3px;">Q</code>
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
<label><input type="checkbox" v-model="s.enableDOMClean" @change="immediateSave()" />
<span class="dy-tip" data-tip="定期清理已离开视野很远的视频卡片，降低内存占用（直播页不生效）">DOM清理</span>
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
<!-- ========== 消息悬浮窗 ========== -->
<div class="dy-menu-section">
<div class="section-title"><dy-icon name="mail"></dy-icon> 消息悬浮窗</div>
<div class="dy-menu-row">
<label><input type="checkbox" v-model="s.enableMsgFloat" @change="immediateSave()" />
<span class="dy-tip" data-tip="开启后，鼠标移到顶部「消息」按钮上会浮出联系人列表">启用悬浮窗</span>
</label>
<label><input type="checkbox" v-model="s.enableMsgFloatHover" @change="immediateSave()" />
<span class="dy-tip" data-tip="关闭后需点击「消息」按钮才会浮出；开启时鼠标悬停即可显示">悬停触发</span>
</label>
<button class="dy-ghost-orange" @click="resetContacts()">重置消息页</button>
</div>
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
<!-- DOM 清理参数 -->
<div class="dy-menu-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;margin-top:6px;">
<span class="dy-group-title"><dy-icon name="broom" :size="12"></dy-icon> DOM 清理参数</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="页面上的视频卡片少于这个数量时，跳过 DOM 清理">最少卡片阈值</span></label>
<input type="number" v-model.number="s.domClean_minCardThreshold" min="3" max="50" step="1" style="width:70px;" @change="immediateSave()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">张</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="以视窗中心为基准，保留前后各 N 张卡片">保留中心附近</span></label>
<input type="number" v-model.number="s.domClean_keepAround" min="1" max="10" step="1" style="width:70px;" @change="immediateSave()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">±张</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="每次轮询触发时，只有此概率会真的执行清理（降低CPU占用）">触发概率</span></label>
<input type="number" v-model.number="s.domClean_triggerProbability" min="5" max="100" step="5" style="width:70px;" @change="immediateSave()" />
<span style="font-size:var(--dy-font-size-sm);color:rgba(255,255,255,0.4);">%</span>
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
<label style="width:130px;"><span class="dy-tip" data-tip="每隔多少秒扫描一次新弹幕。越小越实时但越耗 CPU"><dy-icon name="message" :size="12"></dy-icon> 弹幕过滤</span></label>
<input type="number" v-model.number="s.pollingDanmu" min="0.2" max="5.0" step="0.1" style="width:70px;" @change="restartDanmuTimer()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
<span style="color:rgba(255,255,255,0.2);font-size:var(--dy-font-size-xs);margin-left:4px;"><dy-icon name="alert" :size="11"></dy-icon> 越频繁越耗CPU</span>
</div>
<div class="dy-menu-row">
<label style="width:130px;"><span class="dy-tip" data-tip="每隔多少秒尝试清理一次已滚出视野的 DOM 卡片"><dy-icon name="broom" :size="12"></dy-icon> DOM清理</span></label>
<input type="number" v-model.number="s.pollingClean" min="5.0" max="60.0" step="1.0" style="width:70px;" @change="restartCleanTimer()" />
<span style="color:rgba(255,255,255,0.4);font-size:var(--dy-font-size-sm);">秒</span>
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
            const basicTimeExpanded = ref(false);
            const functionalSwitchExpanded = ref(true);
            const lotteryExpanded = ref(false);
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

            function restartCleanTimer() {
                immediateSave();
                if (timerClean) {
                    clearInterval(timerClean);
                    timerClean = null;
                }
                startCleanTimer();
                showPrompt(`DOM清理间隔已更新为 ${s.pollingClean} 秒`);
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
                basicTimeExpanded.value = false;
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
                basicTimeExpanded.value = false;
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
                        timerClean: !!timerClean,
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
                basicTimeExpanded,
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
                restartCleanTimer,
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

function cleanOldDOM() {
    if (!settings.enableDOMClean || location.href.includes('live.douyin.com')) return;
    const prob = (settings.domClean_triggerProbability ?? 30) / 100;
    if (Math.random() > prob) return;
    const minThreshold = settings.domClean_minCardThreshold ?? 10;
    const keepAround = settings.domClean_keepAround ?? 3;
    const cards = document.querySelectorAll('[data-e2e="video-card"], .video-card, .feed-item');
    if (cards.length <= minThreshold) return;
    let closestIdx = 0,
        closestDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
        const r = cards[i].getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - window.innerHeight / 2);
        if (d < closestDist) {
            closestDist = d;
            closestIdx = i;
        }
    }
    const keepSet = new Set();
    for (let i = Math.max(0, closestIdx - keepAround); i < Math.min(cards.length, closestIdx + keepAround + 1); i++) {
        keepSet.add(cards[i]);
    }
    document.querySelectorAll('video:not([paused])').forEach(v => {
        const p = v.closest('[data-e2e="video-card"], .video-card, .feed-item');
        if (p) keepSet.add(p);
    });
    let removed = 0;
    for (const card of cards) {
        if (!keepSet.has(card)) {
            const r = card.getBoundingClientRect();
            if (r.top > window.innerHeight * 1.5 || r.bottom < -window.innerHeight * 0.5) {
                card.remove();
                removed++;
            }
        }
    }
    if (removed > 0) {
        log('⌫ 清理DOM:', removed, '个卡片');
        dlog('DOM', '清理', removed, '个卡片');
    }
}
// =========================================================
//                       抖音优化功能
// =========================================================
let interactionLock = 0;

function setupInteractionLock() {
    document.addEventListener('click', () => {
        const delayMs = Math.max(500, (settings.interactionLockDelay || 3) * 1000);
        interactionLock = Date.now() + delayMs;
    }, true);
    document.addEventListener('keydown', () => {
        const delayMs = Math.max(500, (settings.interactionLockDelay || 3) * 1000);
        interactionLock = Date.now() + delayMs;
    }, true);
}

function switchToHighestQuality() {
    if (!settings.enableQualitySwitch || Date.now() < interactionLock) return;
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true')) return;
    const isLive = location.href.includes('live.douyin.com/');
    if (isLive) {
        const btn = document.querySelector('[data-e2e="quality"]');
        if (!btn) return;
        const current = btn.textContent.trim();
        const container = document.querySelector('[data-e2e="quality-selector"]');
        if (!container) {
            btn.click();
            return;
        }
        const options = container.querySelectorAll('.tmNdnn5Q');
        if (options.length === 0) {
            btn.click();
            return;
        }
        let bestItem = null,
            bestScore = -1,
            bestText = '';
        options.forEach(el => {
            let textEl = el.querySelector('.KJ5LucVT');
            if (!textEl) textEl = el.querySelector('div');
            if (!textEl) textEl = el;
            const text = textEl.textContent.trim();
            if (!text || text.includes('登录即享')) return;
            let score = 0;
            if (text === '自动(原画)') score = 9998;
            else if (text.includes('原画') || text.includes('画质')) score = 9999;
            else if (text.includes('蓝光')) score = 3000;
            else if (text.includes('超清')) score = 2000;
            else if (text.includes('高清')) score = 1000;
            else if (text.includes('标清')) score = 500;
            else if (text.includes('流畅')) score = 400;
            else {
                const nums = text.match(/\d+/g);
                if (nums) score = parseInt(nums.join('')) || 0;
            }
            if (score > bestScore) {
                bestScore = score;
                bestItem = el;
                bestText = text;
            }
        });
        if (bestItem && bestText && !current.includes(bestText) && !(Date.now() < interactionLock)) {
            const clickTarget = bestItem.querySelector('.siW34Cq4') || bestItem;
            cc('white', '◎ 切换画质:', current, '→', bestText);
            dlog('画质', '直播页切换', current, '→', bestText);
            clickTarget.click();
        }
    } else {
        const btn = document.querySelector('.xgplayer-playclarity-setting .btn');
        if (!btn) return;
        const current = btn.textContent.trim();
        let options = document.querySelectorAll(SEL.clarityItem);
        if (options.length === 0) {
            options = document.querySelectorAll('.xgplayer-playclarity-setting .virtual > div');
        }
        if (options.length === 0) return;
        let bestItem = null,
            bestScore = -1,
            bestText = '';
        options.forEach(el => {
            const text = el.textContent.trim();
            if (!text || text.includes('登录即享')) return;
            let score = 0;
            const nums = text.match(/\d+/g);
            if (nums) score = parseInt(nums.join('')) || 0;
            if (text.includes('4K')) score = 4000;
            else if (text.includes('1080')) score = 1080;
            else if (text.includes('720')) score = 720;
            else if (text.includes('超清')) score = 2000;
            else if (text.includes('高清')) score = 1000;
            else if (text.includes('流畅')) score = 500;
            if (score > bestScore) {
                bestScore = score;
                bestItem = el;
                bestText = text;
            }
        });
        if (bestItem && bestText && !current.includes(bestText) && !(Date.now() < interactionLock)) {
            cc('white', '◎ 切换画质:', current, '→', bestText);
            dlog('画质', '视频页切换', current, '→', bestText);
            bestItem.click();
        }
    }
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
            if (!hasJoinedThisRound) updateStatus('运行中（等待福袋出现）');
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
        if (isEnabled) updateStatus('运行中（等待福袋出现）');
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
            if (!/live\.douyin\.com$/.test(url.hostname)) return false;
            const anchorId = url.searchParams.get('anchor_id');
            const liveWebRid = url.searchParams.get('live_web_rid');
            return url.pathname !== '/' || Boolean(anchorId) || Boolean(liveWebRid);
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
        if (isEnabled) {
            btn.style.background = '#4CAF50';
            btn.textContent = '福袋：已开启 (Ctrl+Q)';
        } else {
            btn.style.background = '#f44336';
            btn.textContent = '福袋：已关闭 (Ctrl+Q)';
        }
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
<button id="dyLotteryToggle" style="background:#f44336;color:white;border:none;padding:4px 10px;border-radius:3px;cursor:pointer;font-weight:bold;font-size:var(--dy-font-size-xs);transition:background .2s;">福袋：已关闭 (Ctrl+Q)</button>
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
            if (location.href === lastUrl) return;
            lastUrl = location.href;
            if (isLiveRoomUrl()) {
                if (!panelEl && settings.lotteryShowFloatPanel) createPanel();
                if (isEnabled) {
                    resetRoundState();
                    setPollingInterval(idleMs());
                    runLotteryTask();
                }
            } else {
                if (panelEl) {
                    panelEl.remove();
                    panelEl = null;
                }
                stopLoopTimer();
                stopCountdownTimer();
                if (abandonTimeoutTimer) {
                    clearTimeout(abandonTimeoutTimer);
                    abandonTimeoutTimer = null;
                }
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
    if (danmuElements.length === 0) return;
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
    setImmersive(true);
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
    if ((event.ctrlKey || event.metaKey) && (event.key || '').toLowerCase() === 'q') {
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
    timerClean = null,
    timerSkip = null;

function startQualityTimer() {
    if (timerQuality) clearInterval(timerQuality);
    const seconds = Math.max(0.5, settings.pollingQuality || 1.5);
    timerQuality = setInterval(switchToHighestQuality, seconds * 1000);
    log('画质轮询已启动（间隔', seconds, '秒）');
}

function startDanmuTimer() {
    if (timerDanmu) clearInterval(timerDanmu);
    const seconds = Math.max(0.2, settings.pollingDanmu || 0.5);
    timerDanmu = setInterval(filterDanmu, seconds * 1000);
    log('弹幕轮询已启动（间隔', seconds, '秒）');
    startDanmuPoolSync();
}

function startCleanTimer() {
    if (timerClean) clearInterval(timerClean);
    const seconds = Math.max(5.0, settings.pollingClean || 10.0);
    timerClean = setInterval(cleanOldDOM, seconds * 1000);
    log('DOM清理轮询已启动（间隔', seconds, '秒）');
}

function startSkipTimer() {
    if (timerSkip) clearInterval(timerSkip);
    const seconds = Math.max(0.3, settings.skipVideoPolling || 0.5);
    timerSkip = setInterval(checkSkipFeed, seconds * 1000);
    hookAllVideos();
    log('跳过检测已启动（事件驱动 + 兜底轮询', seconds, '秒）');
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
    if (timerClean) {
        clearInterval(timerClean);
        timerClean = null;
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
        startCleanTimer();
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
        msgFloatVisible = true;
        requestAnimationFrame(() => {
            msgFloatWindow.style.opacity = '1';
            msgFloatWindow.style.transform = 'translateY(0) scale(1)';
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
            msgFloatWindow.style.transform = 'translateY(-8px) scale(0.94)';
            msgFloatWindow.style.pointerEvents = 'none';
            msgFloatVisible = false;
            if (syncTimer) {
                clearInterval(syncTimer);
                syncTimer = null;
            }
            setTimeout(() => {
                if (!msgFloatVisible) msgFloatWindow.style.display = 'none';
            }, 200);
        }, 300);
    }
    msgButton.addEventListener('mouseenter', () => {
        if (settings.enableMsgFloatHover) showFloat();
    });
    msgButton.addEventListener('mouseleave', () => {
        if (settings.enableMsgFloatHover) hideFloat();
    });
    msgButton.addEventListener('click', (e) => {
        if (e.isTrusted === false) return;
        if (!settings.enableMsgFloatHover) {
            e.stopPropagation();
            if (msgFloatVisible) hideFloat();
            else showFloat();
        } else {
            hideFloat();
        }
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
        if (settings.enableMsgFloatHover) hideFloat();
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
transform: translateY(-8px) scale(0.94);
transition: opacity 0.18s ease,
transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
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
    msgFloatWindow.style.transform = 'translateY(-8px) scale(0.94)';
    msgFloatWindow.style.pointerEvents = 'none';
    msgFloatVisible = false;
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
    setTimeout(() => {
        if (!msgFloatVisible) msgFloatWindow.style.display = 'none';
    }, 200);
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
    // 每次触发都从 settings 读，保证改完立即生效，无需刷新
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
        tip.classList.remove('dy-tooltip-show');
        currentTarget = null;
    }
    // 用 relatedTarget 判断是否真正「进入」/「离开」tip，
    // 这样鼠标在 tip 内部（图标 ↔ 文字）移动时不会被误判
    document.addEventListener('mouseover', (e) => {
        const tipEl = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
        if (!tipEl) return;
        const from = e.relatedTarget;
        if (from && tipEl.contains(from)) return; // 内部移动，忽略
        if (tipEl === currentTarget) {
            clearHideTimer();
            return;
        } // 从内部绕回，取消隐藏
        clearHideTimer();
        clearShowTimer();
        showTimer = setTimeout(() => {
            showTimer = null;
            showTip(tipEl);
        }, getShowDelay());
    }, true);
    document.addEventListener('mousemove', () => {
        if (currentTarget) position(currentTarget);
    }, true);
    document.addEventListener('mouseout', (e) => {
        const tipEl = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
        if (!tipEl) return;
        const to = e.relatedTarget;
        if (to && tipEl.contains(to)) return; // 内部移动，忽略
        // 真正离开：先杀掉还在等待弹出的计时器
        clearShowTimer();
        if (tipEl === currentTarget) {
            clearHideTimer();
            hideTimer = setTimeout(() => {
                hideTimer = null;
                hideTip();
            }, getHideDelay());
        }
    }, true);
    document.addEventListener('scroll', () => {
        if (currentTarget) position(currentTarget);
    }, true);
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
    push(timerGroup.items, 'DOM 清理', timerClean ? 'ok' : 'warn',
        timerClean ? ('运行中 · 间隔 ' + (settings.pollingClean || 10) + 's') : '未启动');
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
        ['enableDOMClean', 'DOM 清理'],
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
    let historyHtml = '';
    if (history.length > 0) {
        historyHtml = '<div style="margin-top:16px;">' +
            '<div style="font-size:var(--dy-font-size-md);font-weight:600;color:' + P.warn + ';padding:4px 0 6px;border-bottom:1px solid ' + P.divider + ';margin-bottom:6px;display:flex;align-items:center;">' +
            dyIconSvg('clock') + ' 历史崩溃日志（显示最近 ' +
            Math.min(history.length, 10) + ' / ' + history.length + ' 条）</div>';
        for (const h of history.slice(0, 10)) {
            historyHtml += '<div style="padding:6px 8px;margin-bottom:4px;background:' + P.cardBg + ';border-radius:4px;font-size:var(--dy-font-size-sm);">' +
                '<div style="color:' + P.warn + ';font-size:var(--dy-font-size-xs);">[' +
                escapeHtml(h.timeStr || '') + '] ' + escapeHtml(h.type || '未知') +
                (h.module ? ' · ' + escapeHtml(h.module) : '') +
                (h.version ? ' · v' + escapeHtml(h.version) : '') +
                '</div>' +
                '<div style="color:' + P.textDim + ';word-break:break-all;font-family:Consolas,monospace;font-size:var(--dy-font-size-xs);margin-top:2px;">' +
                escapeHtml((h.message || '').slice(0, 200)) +
                '</div>' +
                '</div>';
        }
        historyHtml += '</div>';
    }
    const summaryText = errors.length > 0 ?
        (dyIconSvg('x') + ' 本次加载 ' + errors.length + ' 个模块失败 · ' + oks.length + ' 个成功') :
        (dyIconSvg('check') + ' 本次加载全部 ' + oks.length + ' 个模块正常');
    const summaryBg = errors.length > 0 ? P.failBg : P.okBg;
    const summaryColor = errors.length > 0 ? P.fail : P.ok;
    const titleText = errors.length > 0 ?
        (dyIconSvg('alert', 16) + ' 插件加载异常报告') :
        (dyIconSvg('search', 16) + ' 插件加载报告');
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
        errorDetailHtml +
        historyHtml +
        '</div>' +
        '<div style="flex-shrink:0;display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px 22px;border-top:1px solid ' + P.divider + ';flex-wrap:wrap;">' +
        '<button id="dyErrorReportCopy" class="dy-report-btn dy-report-btn-blue">' + dyIconSvg('copy') + ' 复制报告</button>' +
        '<button id="dyErrorReportClear" class="dy-report-btn dy-report-btn-red">' + dyIconSvg('trash') + ' 清除历史日志</button>' +
        '<button id="dyErrorReportRerun" class="dy-report-btn dy-report-btn-green">' + dyIconSvg('refreshCw') + ' 重新加载页面</button>' +
        '</div>';
    document.body.appendChild(panel);
    // 修补 summaryText 的 HTML 渲染（因为上面直接做了 escape）
    const summaryEl = panel.querySelector('.dy-report-header > div:nth-child(2)');
    if (summaryEl) summaryEl.innerHTML = summaryText;
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
    document.getElementById('dyErrorReportCopy').onclick = async () => {
        let text = '抖音优化 v' + SCRIPT_VERSION + ' 加载报告\n';
        text += '时间: ' + new Date().toLocaleString() + '\n';
        text += 'URL: ' + location.href + '\n';
        text += 'UA: ' + navigator.userAgent + '\n';
        text += '恢复模式: ' + (ModuleLoader.isRecoveryMode() ? '是' : '否') + '\n\n';
        text += '=== 模块明细 ===\n';
        for (const r of records) {
            const tag = r.status === 'ok' ? '[OK]  ' : '[FAIL]';
            text += '  ' + tag + ' ' + r.name;
            if (r.status === 'error') text += ': ' + r.error.message;
            else if (r.timeMs != null) text += ' (' + r.timeMs.toFixed(1) + 'ms)';
            text += '\n';
        }
        if (errors.length > 0) {
            text += '\n=== 错误堆栈 ===\n';
            for (const r of errors) {
                text += '\n【' + r.name + '】' + r.error.message + '\n';
                if (r.error.stack) text += r.error.stack + '\n';
            }
        }
        if (history.length > 0) {
            text += '\n=== 历史崩溃日志 ===\n';
            for (const h of history) {
                text += '[' + (h.timeStr || '') + '] ' + (h.type || '') +
                    (h.module ? ' ' + h.module : '') + ' — ' + (h.message || '') + '\n';
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
        ModuleLoader.run('DOM 初始清理', () => cleanOldDOM());
        ModuleLoader.run('跳过检测初始扫描', () => checkSkipFeed());
    }, 500);
    setTimeout(() => {
        ModuleLoader.run('画质定时器', () => startQualityTimer());
        ModuleLoader.run('弹幕定时器', () => startDanmuTimer());
        ModuleLoader.run('DOM 清理定时器', () => startCleanTimer());
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
    if (timerClean) {
        clearInterval(timerClean);
        timerClean = null;
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