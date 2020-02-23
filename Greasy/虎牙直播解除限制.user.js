// ==UserScript==
// @name        虎牙直播解除限制
// @version     2025022200
// @match       *://*.huya.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/huya.png
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_unregisterMenuCommand
// @run-at      document-end
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E8%A7%A3%E9%99%A4%E9%99%90%E5%88%B6.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E8%A7%A3%E9%99%A4%E9%99%90%E5%88%B6.user.js
// ==/UserScript==
(() => {
	// 禁止篡改console
	// Object.freeze(console);
	// 更改菜单选项
	function changeMenuItem(id, onCaption, offCaption, onClick) {
		const inplace = id === GM_registerMenuCommand(offCaption, null, {
			id
		});
		if(inplace) {
			// 插件如VM2.15.9起支持根据id注册选项
			GM_registerMenuCommand(onCaption, onClick, {
				id
			});
		} else {
			// 不支持需先卸载原选项，再注册新选项
			GM_unregisterMenuCommand(offCaption);
			GM_registerMenuCommand(onCaption, onClick);
		}
	}
	// 注册可变菜单项
	function registerToggle(id, onCaption, offCaption, onClick) {
		changeMenuItem(id, onCaption, offCaption, () => {
			onClick();
			registerToggle(id, offCaption, onCaption, onClick);
		});
	}
	// 待注册
	const toggles = [{
		id: 1,
		title: '自动最高画质',
		gmKey: 'autoBestRES',
		gmValue: GM_getValue('autoBestRES')
	}, {
		id: 2,
		title: '单击/空格控制播放/暂停',
		gmKey: 'clickToPlay',
		gmValue: GM_getValue('clickToPlay', true)
	}, {
		id: 3,
		title: '中键/回车切换全屏',
		gmKey: 'midClickToFullscreen',
		gmValue: GM_getValue('midClickToFullscreen', true)
	}, {
		id: 4,
		title: '自动剧场模式',
		gmKey: 'autoFullPage',
		gmValue: GM_getValue('autoFullPage')
	}];
	toggles.forEach((e) => {
		registerToggle(e.id,
			(e.gmValue ? '✔️' : '✖️') + e.title,
			(!e.gmValue ? '✔️' : '✖️') + e.title,
			() => {
				e.gmValue = !e.gmValue;
				GM_setValue(e.gmKey, e.gmValue);
			});
	});
	if(toggles[3].gmValue) {
		document.body.classList.add('mode-page-theater');
	}
	// window.addEventListener('load', () => {
	const getById = (id) => document.getElementById(id);
	// 隐藏进入页面后的登录弹窗
	new MutationObserver((mutations, ob) => {
		const mask = getById('HUYA-UDBSdkLgn');
		if(!mask) return;
		// setTimeout(() => {
		//   const btn = document.getElementById('player-fullpage-btn');
		//   btn.title = '退出剧场';
		//   btn.classList.add('player-narrowpage');
		//   btn.classList.remove('player-fullpage-btn');
		// });
		const $vtList = $('#player-ctrl-wrap .player-videotype-list'),
			unlockRES = () => {
				const $highRes = $vtList.children(':has(.bitrate-right-btn.common-enjoy-btn)');
				$highRes.length ? $highRes.each((i, e) => {
					$(e).data('data').status = 0;
					// 若启用了自动最高画质
					i === 0 && toggles[0].gmValue && e.click();
				}) : toggles[0].gmValue && $vtList.children().length > 1 && $vtList.children()[0].click();
			};
		// 插入登录框后则只监听该元素的变更
		new MutationObserver((records, mob) => {
			if(mask?.style.display !== 'none') {
				mask.style.display = 'none';
				// if (toggles[3].gmValue) {
				//   getById('player-fullpage-btn').click();
				// }
				mob.disconnect();
			}
		}).observe(mask, {
			attributes: true
		});
		// 无限制播放，避免严格模式下对getter属性赋值导致异常中断
		try {
			if(toggles[3].gmValue) {
				const pfBtn = getById('player-fullpage-btn');
				const tid = setInterval(() => {
					pfBtn.classList.contains('player-narrowpage') ? clearInterval(tid) : pfBtn.click();
				}, 500);
				// getById('player-fullpage-btn').className="player-narrowpage"
				// getById('player-fullpage-btn').title="退出剧场"
			}
			getById('hy-video').srcObject.active = false;
		} catch (e) {
			// alert('尝试无限制播放失败，可能需要刷新页面或切换线路。异常：\n' + e)
		}
		ob.disconnect();
		// unlock res
		new MutationObserver(unlockRES).observe($vtList[0], {
			attributes: false,
			childList: true,
			subtree: false
		});
		unlockRES();
		// 添加部分播放器事件
		setTimeout(() => {
			const vid = getById('player-video');
			let flag = null,
				tid = null;
			getById('player-mouse-event-wrap').onmousemove = function() {
				if(flag) return;
				flag = true;
				clearTimeout(tid);
				this.style.cursor = '';
				tid = setTimeout(() => {
					this.style.cursor = 'none';
				}, 3000);
				setTimeout(() => {
					flag = null;
				}, 1000);
			};
			// 单击/空格控制播放/暂停
			if(toggles[1].gmValue) {
				let isOneClick, tmp, tid;
				// 判断是否触发虎牙播放器单击模拟的双击
				vid.addEventListener('click', () => {
					isOneClick = !tmp;
					if(isOneClick) {
						tmp = setTimeout(() => {
							tmp = null;
						}, 301);
					}
				});
				vid.onclick = () => {
					clearTimeout(tid);
					const arr = ['smartMenu_videoMenu', 'player-danmu-report'];
					if(arr.every((e) => !(getById(e)?.style.display === 'block'))) {
						tid = setTimeout(() => {
							isOneClick && getById('player-btn').click();
						}, 300);
					}
				};
				document.addEventListener('keyup', (e) => {
					if(e.code === 'Space' && !'INPUT TEXTAREA'.includes(e.target.nodeName)) {
						e.preventDefault();
						getById('player-btn').click();
					}
				});
			}
			// 中键/回车切换全屏
			if(toggles[2].gmValue) {
				vid.onmousedown = (e) => e.preventDefault();
				vid.onauxclick = (e) => {
					e.button === 1 && getById('player-fullscreen-btn').click();
				};
				document.addEventListener('keyup', (e) => {
					e.key === 'Enter' && !'INPUT TEXTAREA'.includes(e.target.nodeName) && getById('player-fullscreen-btn').click();
				});
			}
		});
	}).observe(document.body, {
		attributes: false,
		childList: true,
		subtree: false
	});
	// 观察节点自动点击播放模式
	// function autoPlay() {
	//   GM_addStyle("div#UDBSdkLgn{z-index: -1;}");
	//   const targetNode =
	//     getById("player-ctrl-wrap").querySelector(".player-play-big");
	//   new MutationObserver((mutationsList, ob) => {
	//     // console.log(mutationsList)
	//     if (
	//       mutationsList[0].type !== "attributes" ||
	//       targetNode.style.display === "none"
	//     )
	//       return;
	//     const mask = getById("UDBSdkLgn");
	//     if (mask.style.display === "block") {
	//       targetNode.click();
	//       mask.style.display = "none";
	//       // console.log('自动续播成功')
	//     }
	//   }).observe(targetNode, {
	//     attributes: true,
	//     childList: false,
	//     subtree: false,
	//   });
	// }
	// });
})();