// ==UserScript==
// @name        油管视频最高画质
// @version     2025092000
// @match       *://www.youtube.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/youtube.png
// @run-at      document-start
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%B2%B9%E7%AE%A1%E8%A7%86%E9%A2%91%E6%9C%80%E9%AB%98%E7%94%BB%E8%B4%A8.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%B2%B9%E7%AE%A1%E8%A7%86%E9%A2%91%E6%9C%80%E9%AB%98%E7%94%BB%E8%B4%A8.user.js
// ==/UserScript==
(function() {
    let highestQuality = null;

    function setHighestQuality() {
        const video = document.querySelector('video');
        if (video) {
            const player = document.querySelector('.html5-video-player');
            if (player) {
                const availableQualityLevels = player.getAvailableQualityLevels();
                if (availableQualityLevels && availableQualityLevels.length > 0) {
                    highestQuality = availableQualityLevels[0];
                    console.log("Setting quality to: " + highestQuality);
                    player.setPlaybackQualityRange(highestQuality, highestQuality);
                    player.setPlaybackQuality(highestQuality);
                    // 在标签页标题中显示提示信息
                    displayMessage("设置画质为 " + highestQuality);
                } else {
                    console.warn("Hgtrojan: 未能找到可用的清晰度级别");
                }
            } else {
                console.warn("Hgtrojan: 未能找到视频播放器");
            }
        } else {
            console.warn("Hgtrojan: 未能找到视频元素");
        }
    }

    function checkAndMaintainHighestQuality() {
        const video = document.querySelector('video');
        if (video) {
            const player = document.querySelector('.html5-video-player');
            if (player && highestQuality) {
                const currentQuality = player.getPlaybackQuality();
                if (currentQuality !== highestQuality) {
                    console.log("Maintaining quality at: " + highestQuality);
                    player.setPlaybackQuality(highestQuality);
                }
            }
        }
    }

    function checkUrlAndSetQuality() {
        if (window.location.href.includes('watch')) {
            setHighestQuality();
            // 每隔5秒检查并保持最高画质
            setInterval(checkAndMaintainHighestQuality, 5000);
        }
    }

    function displayMessage(message) {
        document.title = message;
        // 10秒后恢复原来的标题
        setTimeout(() => {
            document.title = originalTitle;
        }, 10000);
    }
    const originalTitle = document.title;
    // 创建MutationObserver实例
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeName === 'VIDEO') {
                        setTimeout(checkUrlAndSetQuality, 1000);
                    }
                });
            }
        });
    });
    // 开始观察整个文档，包括所有子节点和后代节点
    observer.observe(document, {
        childList: true,
        subtree: true
    });
    // 初始加载时设置最高清晰度
    window.addEventListener('yt-player-updated', checkUrlAndSetQuality);
    window.addEventListener('yt-navigate-finish', checkUrlAndSetQuality);
})();