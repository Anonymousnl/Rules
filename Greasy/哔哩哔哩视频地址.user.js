// ==UserScript==
// @name        哔哩哔哩视频地址
// @version     20240720
// @match       *://www.bilibili.com/list/*
// @match       *://www.bilibili.com/video/*
// @icon        https://www.bilibili.com/favicon.ico
// @run-at      document-start
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91%E5%9C%B0%E5%9D%80.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%E8%A7%86%E9%A2%91%E5%9C%B0%E5%9D%80.user.js
// ==/UserScript==

(() => {
	// webpackBootstrap
	var __webpack_exports__ = {};
	(function() {
		"use strict";
		var pageWindow = unsafeWindow;
		var filterBackupUrls = function(mediaArray) {
			mediaArray.forEach(function(media) {
				var filteredUrls = media.backupUrl.filter(function(url) {
					return !url.includes("mcdn.bilivideo.cn");
				});
				if(filteredUrls.length > 0) {
					media.backupUrl = filteredUrls;
					media.backup_url = filteredUrls;
					media.baseUrl = filteredUrls[0];
					media.base_url = filteredUrls[0];
				} else {
					console.log("\u6CA1\u6709\u53EF\u7528\u7684\u975Epcdn url");
				}
			});
		};
		var replaceUrl = function(data) {
			var dash = data;
			var video = dash.video;
			var audio = dash.audio;
			filterBackupUrls(video);
			filterBackupUrls(audio);
			return dash;
		};
		// 普通BV号视频页面，修改播放器初始化参数
		var originalConnectPlayerFunction = pageWindow.connectPlayer;
		Object.defineProperty(pageWindow, "connectPlayer", {
			get: function() {
				return originalConnectPlayerFunction;
			},
			set: function(value) {
				originalConnectPlayerFunction = value;
				pageWindow.__playinfo__.data.dash = replaceUrl(pageWindow.__playinfo__.data.dash);
			},
		});
		// 播放列表页面
		var originalXHR = pageWindow.XMLHttpRequest;
		// 方法一，重写XMLHttpRequest构造函数，会发生错误
		// function ModifiedXHR() {
		//   const xhrInstance = new originalXHR()
		//   const originalOpen = xhrInstance.open
		//   xhrInstance.open = function (_: any, url: string) {
		//     if (url.includes('api.bilibili.com/x/player/wbi/playurl')) {
		//       this.addEventListener('readystatechange', function () {
		//         if (this.readyState === 4 && this.status === 200) {
		//           let responseJson = JSON.parse(this.responseText)
		//           responseJson.data.dash = replaceUrl(responseJson.data.dash)
		//           let modifiedResponse = JSON.stringify(responseJson)
		//           Object.defineProperty(this, 'responseText', { value: modifiedResponse })
		//         }
		//       })
		//     }
		//     return originalOpen.apply(this, arguments)
		//   }
		//   return xhrInstance
		// }
		// pageWindow.XMLHttpRequest = ModifiedXHR as unknown as typeof XMLHttpRequest
		// 方法二，修改responseText的getter
		var xhrOpen = originalXHR.prototype.open;
		originalXHR.prototype.open = function(_, url) {
			var xhr = this;
			if(url.includes("api.bilibili.com/x/player/wbi/playurl")) {
				var getter_1 = Object.getOwnPropertyDescriptor(originalXHR.prototype, "responseText").get;
				Object.defineProperty(xhr, "responseText", {
					get: function() {
						var response = getter_1.call(xhr);
						var responseJson = JSON.parse(response);
						responseJson.data.dash = replaceUrl(responseJson.data.dash);
						var modifiedResponse = JSON.stringify(responseJson);
						return modifiedResponse;
					},
				});
			}
			return xhrOpen.apply(xhr, arguments);
		};
	})();
})();