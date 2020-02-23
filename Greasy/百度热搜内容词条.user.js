// ==UserScript==
// @name        百度热搜内容词条
// @version     2025022200
// @match       *://*.baidu.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/baidu.png
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E7%83%AD%E6%90%9C%E5%86%85%E5%AE%B9%E8%AF%8D%E6%9D%A1.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E7%83%AD%E6%90%9C%E5%86%85%E5%AE%B9%E8%AF%8D%E6%9D%A1.user.js
// ==/UserScript==
(function() {
	// 获取百度搜索框元素
	var inputElement = document.getElementById('kw'); // 百度搜索框的 ID 是 'kw'
	if(inputElement) {
		// 提前清空 placeholder
		inputElement.placeholder = '';
		// 使用 MutationObserver 监控 placeholder 的变化
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if(mutation.type === 'attributes' && mutation.attributeName === 'placeholder') {
					// 如果 placeholder 被动态加载，立即清空
					inputElement.placeholder = '';
					observer.disconnect(); // 停止监控，避免重复清空
				}
			});
		});
		// 配置 MutationObserver，监控 placeholder 属性的变化
		var config = {
			attributes: true, // 监控属性变化
			attributeFilter: ['placeholder'] // 只监控 placeholder 属性
		};
		// 开始监控
		observer.observe(inputElement, config);
	}
})();