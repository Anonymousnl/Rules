// ==UserScript==
// @name        斗鱼直播页面净化
// @version     2025121400
// @match       *://*.douyu.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/douyu.png
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @run-at      document-idle
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%96%97%E9%B1%BC%E7%9B%B4%E6%92%AD%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%96%97%E9%B1%BC%E7%9B%B4%E6%92%AD%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96.user.js
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
            // 提取 /beta/ 后的直播间 ID
            return window.location.pathname.replace('/beta/', '');
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
/* ------ 其他常见广告类 ------ */
[class^=adsRoot_] {
display: none !important;
}
/* ------ 礼物栏靠右 ------ */
.PlayerToolbar-ContentCell {
margin-left:auto;
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
    const rid = getRoomId();
    async function getRoomData(rid) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "POST",
                url: `https://www.doseeing.com/xeee/room/aggr`,
                data: `{"m":"${window.btoa(`rid=${rid}&dt=0`).split("").reverse().join("")}"}`,
                responseType: "json",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                },
                onload: res => resolve(res.response.data)
            });
        });
    }
    async function showRoomData() {
        const data = await getRoomData(rid);
        if (!data) return;
        const firstRow = `💬弹幕数:${formatData(data["chat.pv"])} 👨‍👩‍👧‍👦发弹幕人数:${formatData(data["chat.uv"])} ⏱️直播时间:${formatData(data["online.minutes"])}分 🔥活跃人数:${formatData(data["active.uv"])}`;
        const secondRow = `🎁礼物价值:${formatPrice(data["gift.all.price"])}元 🎅礼包送礼人数:${formatData(data["gift.all.uv"])} 💸付费礼物:${formatPrice(data["gift.paid.price"])}元 🤴付费送礼人数:${formatData(data["gift.paid.uv"])}`;
        if (!document.getElementById('liwu_info')) {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'liwu_info';
            infoDiv.style.whiteSpace = 'pre';
            infoDiv.style.float = 'left';
            infoDiv.style.fontSize = '12px';
            infoDiv.style.color = '#888';
            infoDiv.style.marginTop = '10px';
            infoDiv.style.marginLeft = '2px';
            infoDiv.style.textAlign = 'left';
            infoDiv.style.lineHeight = '180%';
            const toolbar = document.querySelector('.PlayerToolbar-ContentRow');
            if (toolbar) toolbar.prepend(infoDiv);
        }
        document.getElementById('liwu_info').textContent = `${firstRow}\n${secondRow}`;
        console.log('[Douyu Script] 直播间数据已更新');
    }
    // 首次显示 & 每 12 分钟刷新一次
    setTimeout(showRoomData, 5000);
    setInterval(showRoomData, 12 * 60 * 1000);
})();