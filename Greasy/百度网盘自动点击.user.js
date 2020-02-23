// ==UserScript==
// @name        百度网盘自动点击
// @version     20240720
// @match       *://pan.baidu.com/*
// @icon        https://www.baidu.com/favicon.ico
// @run-at      document-start
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%98%E8%87%AA%E5%8A%A8%E7%82%B9%E5%87%BB.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%98%E8%87%AA%E5%8A%A8%E7%82%B9%E5%87%BB.user.js
// ==/UserScript==

(function() {
	// 全局属性
	let url = window.location.href;
	//-----------------百度网盘-----------------
	// 自动点击
	if(url.includes("pan.baidu")) {
		if(document.querySelector('#accessCode').value.length === 4) {
			document.querySelector('#submitBtn').click()
		}
	}
})()