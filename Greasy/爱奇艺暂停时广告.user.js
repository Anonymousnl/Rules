// ==UserScript==
// @name        爱奇艺暂停时广告
// @version     20240720
// @match       *://*.iqiyi.com/*
// @icon        https://www.iqiyi.com/favicon.ico
// @run-at      document-idle
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%88%B1%E5%A5%87%E8%89%BA%E6%9A%82%E5%81%9C%E6%97%B6%E5%B9%BF%E5%91%8A.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%88%B1%E5%A5%87%E8%89%BA%E6%9A%82%E5%81%9C%E6%97%B6%E5%B9%BF%E5%91%8A.user.js
// ==/UserScript==

(function() {
	const observer = new MutationObserver(() => {
		const btnplaypause = document.querySelectorAll('[data-player-hook="btnplaypause"]');
		if(btnplaypause.length == 0) {
			return;
		}
		observer.disconnect();
		const video = document.querySelector("video");
		// 点击视频
		video.addEventListener("click", (event) => {
			video.paused ? video.play() : video.pause();
			event.stopPropagation();
		}, true);
		// 暂停按钮
		btnplaypause.forEach((items) => {
			items.addEventListener("click", (event) => {
				video.paused ? video.play() : video.pause();
				event.stopPropagation();
			}, true);
		});
		// 空格
		document.addEventListener("keydown", (event) => {
			if(event.code == "Space" && event.target.tagName != "INPUT") {
				video.paused ? video.play() : video.pause();
				event.stopPropagation();
			}
		}, true);
	});
	const target = document.querySelector('#flashbox');
	target && observer.observe(target, {
		childList: true,
		subtree: true
	});
})();