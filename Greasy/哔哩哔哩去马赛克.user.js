// ==UserScript==
// @name        哔哩哔哩去马赛克
// @version     20240720
// @match       *://live.bilibili.com/*
// @icon        https://www.bilibili.com/favicon.ico
// @run-at      document-end
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E5%8E%BB%E9%A9%AC%E8%B5%9B%E5%85%8B.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E5%8E%BB%E9%A9%AC%E8%B5%9B%E5%85%8B.user.js
// ==/UserScript==

(function() {
	// 创建一个MutationObserver来监视DOM变化
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if(mutation.type === 'childList' || mutation.type === 'subtree') {
				// 使用一个小延迟来隐藏元素，减少被检测到的可能性
				setTimeout(hideElement, 500);
			}
		});
	});
	// 配置MutationObserver
	const config = {
		childList: true,
		subtree: true
	};
	// 观察页面的根元素
	observer.observe(document.body, config);
	// 尝试隐藏目标元素
	function hideElement() {
		const element = document.getElementById('web-player-module-area-mask-panel');
		if(element) {
			// 更改元素的CSS类而不是直接设置display
			element.style.opacity = '0';
			element.style.pointerEvents = 'none';
			console.log('Element hidden');
		}
	}
	// 初始调用，隐藏元素
	hideElement();
})();