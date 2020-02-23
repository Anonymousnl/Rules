// ==UserScript==
// @name        虎牙直播解除限制
// @version     2025092000
// @match       *://*.huya.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/huya.png
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E8%A7%A3%E9%99%A4%E9%99%90%E5%88%B6.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E8%A7%A3%E9%99%A4%E9%99%90%E5%88%B6.user.js
// ==/UserScript==
(function() {
    const switchQuality = setInterval(() => {
        const $list = $(".player-videotype-list li");
        const $cur = $(".player-videotype-cur");
        if ($cur.length === 0 || $list.length === 0) return;
        // --- 解锁扫码限制 ---
        $list.each((_, li) => {
            const $li = $(li);
            const dataObj = $li.data("data");
            if (dataObj && dataObj.status !== 0) {
                dataObj.status = 0;
            }
        });
        // --- 自动切换到最高画质 ---
        if ($cur.text().trim() !== $list.first().text().trim()) {
            $list.first().click();
            return;
        }
        // --- 自动切换到指定画质（可选功能） ---
        /*
        const targetQuality = "蓝光4M"; // ← 这里修改为你想要的画质
        const $match = $list.filter((_, el) => $(el).text().trim() === targetQuality);
        if ($match.length > 0 && $cur.text().trim() !== targetQuality) {
        $match.click();
        return;
        }
        */
    }, 1000); // 每秒检查一次
    setTimeout(() => {
        clearInterval(switchQuality);
    }, 3000); // 3秒后可自由切换画质
})();