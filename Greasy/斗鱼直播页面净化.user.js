// ==UserScript==
// @name			斗鱼直播页面净化
// @version			2026090600
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
#js-toolbar-interact,
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
    // ===============================
    // 模块四：左下角直播间数据
    // ===============================
    let latestRoomData = null;
    let lastRoomDataAt = 0;
    let roomDataLoading = false;
    async function getRoomData(rid) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: `https://www.doseeing.com/xeee/room/aggr`,
                data: `{"m":"${window.btoa(`rid=${rid}&dt=0`).split("").reverse().join("")}"}`,
                responseType: "json",
                timeout: 15000,
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                },
                onload: res => {
                    if (res.status && (res.status < 200 || res.status >= 300)) {
                        reject(new Error(`请求失败（HTTP ${res.status}）`));
                        return;
                    }
                    const data = res.response?.data;
                    if (!data) {
                        reject(new Error('接口未返回直播间数据'));
                        return;
                    }
                    resolve(data);
                },
                onerror: () => reject(new Error('网络请求失败')),
                ontimeout: () => reject(new Error('数据请求超时')),
                onabort: () => reject(new Error('数据请求已取消'))
            });
        });
    }

    function renderRoomData() {
        if (!latestRoomData) return;
        const firstRow = document.getElementById('liwu_info_row_1');
        const secondRow = document.getElementById('liwu_info_row_2');
        if (!firstRow || !secondRow) return;
        firstRow.textContent = `💬弹幕数:${formatData(latestRoomData["chat.pv"])} 👨‍👩‍👧‍👦发弹幕人数:${formatData(latestRoomData["chat.uv"])} ⏱️直播时间:${formatData(latestRoomData["online.minutes"])}分 🔥活跃人数:${formatData(latestRoomData["active.uv"])}`;
        secondRow.textContent = `🎁礼物价值:${formatPrice(latestRoomData["gift.all.price"])}元 🎅礼包送礼人数:${formatData(latestRoomData["gift.all.uv"])} 💸付费礼物:${formatPrice(latestRoomData["gift.paid.price"])}元 🤴付费送礼人数:${formatData(latestRoomData["gift.paid.uv"])}`;
    }

    function updateRoomDataAge() {
        const ageText = document.getElementById('liwu_info_age');
        if (!ageText) return;
        if (!lastRoomDataAt) {
            ageText.textContent = '数据获取时间：尚未获取';
            return;
        }
        const minutes = Math.max(0, Math.floor((Date.now() - lastRoomDataAt) / 60000));
        ageText.textContent = `数据获取时间：${minutes}分钟前`;
    }

    function updateRefreshButton() {
        const button = document.getElementById('liwu_refresh_button');
        if (!button) return;
        button.disabled = roomDataLoading;
        button.classList.toggle('is-loading', roomDataLoading);
        button.setAttribute('aria-busy', String(roomDataLoading));
        button.setAttribute('aria-label', roomDataLoading ? '正在刷新直播间数据' : '手动刷新直播间数据');
        button.title = roomDataLoading ? '正在刷新…' : '手动刷新直播间数据';
    }

    function ensureRoomDataPanel() {
        const toolbar = document.querySelector('#js-player-toolbar .PlayerToolbar-ContentRow:not(.InteractABAd)');
        if (!toolbar) return null;
        let infoDiv = document.getElementById('liwu_info');
        if (infoDiv) {
            if (infoDiv.parentElement !== toolbar) toolbar.prepend(infoDiv);
            return infoDiv;
        }
        infoDiv = document.createElement('div');
        infoDiv.id = 'liwu_info';
        infoDiv.style.display = 'grid';
        infoDiv.style.gridTemplateRows = 'repeat(3, 18px)';
        infoDiv.style.rowGap = '2px';
        infoDiv.style.alignSelf = 'center';
        infoDiv.style.fontSize = '12px';
        infoDiv.style.color = '#888';
        infoDiv.style.marginLeft = '2px';
        infoDiv.style.textAlign = 'left';
        infoDiv.style.lineHeight = '18px';
        infoDiv.style.whiteSpace = 'nowrap';
        const firstRow = document.createElement('div');
        firstRow.id = 'liwu_info_row_1';
        firstRow.textContent = '正在获取直播间数据…';
        const secondRow = document.createElement('div');
        secondRow.id = 'liwu_info_row_2';
        const metaRow = document.createElement('div');
        metaRow.style.display = 'flex';
        metaRow.style.alignItems = 'center';
        metaRow.style.gap = '8px';
        const ageGroup = document.createElement('span');
        ageGroup.className = 'liwu-info-age-group';
        ageGroup.innerHTML = `
<svg class="liwu-info-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
<circle cx="12" cy="12" r="9"></circle>
<path d="M12 7v5l3 2"></path>
</svg>
`;
        const ageText = document.createElement('span');
        ageText.id = 'liwu_info_age';
        ageGroup.append(ageText);
        const refreshButton = document.createElement('button');
        refreshButton.id = 'liwu_refresh_button';
        refreshButton.type = 'button';
        refreshButton.setAttribute('aria-label', '手动刷新直播间数据');
        refreshButton.title = '手动刷新直播间数据';
        refreshButton.innerHTML = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
<path d="M20 12a8 8 0 1 1-2.34-5.66L20 8"></path>
<path d="M20 3v5h-5"></path>
</svg>
`;
        refreshButton.addEventListener('click', () => {
            void showRoomData();
        });
        metaRow.append(ageGroup, refreshButton);
        infoDiv.append(firstRow, secondRow, metaRow);
        toolbar.prepend(infoDiv);
        renderRoomData();
        updateRoomDataAge();
        updateRefreshButton();
        return infoDiv;
    }
    async function showRoomData() {
        if (roomDataLoading) return;
        const rid = getRoomId();
        if (!rid) return;
        ensureRoomDataPanel();
        roomDataLoading = true;
        updateRefreshButton();
        try {
            const data = await getRoomData(rid);
            if (rid !== getRoomId()) return;
            latestRoomData = data;
            lastRoomDataAt = Date.now();
            ensureRoomDataPanel();
            renderRoomData();
            updateRoomDataAge();
            console.log('[Douyu Script] 直播间数据已更新');
        } catch (error) {
            console.warn('[Douyu Script] 直播间数据刷新失败:', error);
        } finally {
            roomDataLoading = false;
            updateRefreshButton();
        }
    }
    // 首次显示、每 12 分钟获取数据；每 30 秒更新相对时间与检查面板
    setTimeout(showRoomData, 5000);
    setInterval(showRoomData, 12 * 60 * 1000);
    setInterval(() => {
        ensureRoomDataPanel();
        updateRoomDataAge();
    }, 30 * 1000);
})();