// ==UserScript==
// @name        哔哩哔哩页面调整
// @match       *://*.bilibili.com/*
// @exclude     *://*.chat.bilibili.com/*
// @exclude     *://api.*.bilibili.com/*
// @exclude     *://api.bilibili.com/*
// @exclude     *://cm.bilibili.com/*
// @exclude     *://data.bilibili.com/*
// @exclude     *://message.bilibili.com/pages/nav/header_sync
// @exclude     *://message.bilibili.com/pages/nav/index_new_pc_sync
// @exclude     *://passport.bilibili.com/*
// @icon        https://www.bilibili.com/favicon.ico
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @run-at      document-start
// ==/UserScript==

(async function() {
	var __defProp = Object.defineProperty;
	var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
		enumerable: true,
		configurable: true,
		writable: true,
		value
	}) : obj[key] = value;
	var __publicField = (obj, key, value) => {
		__defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
		return value;
	};
	var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
	var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
	var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
	var _GM_unregisterMenuCommand = /* @__PURE__ */ (() => typeof GM_unregisterMenuCommand != "undefined" ? GM_unregisterMenuCommand : void 0)();
	var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
	const settings = {
		enableDebugMain: false,
		enableDebugComponents: false,
		enableDebugRules: false,
		enableDebugVideoFilter: false,
		enableDebugCommentFilter: false,
		// 标记视频过滤器检测过的视频
		filterSign: "bili-cleaner-filtered"
	};
	const startTime = performance.now();
	let lastTime = startTime;
	let currTime = startTime;
	const wrapper = (loggingFunc, isEnable) => {
		if(isEnable) {
			return (...innerArgs) => {
				currTime = performance.now();
				const during = (currTime - lastTime).toFixed(1);
				const total = (currTime - startTime).toFixed(1);
				loggingFunc(`[bili-cleaner] ${during} / ${total} ms | ${innerArgs.join(" ")}`);
				lastTime = currTime;
			};
		}
		return (..._args) => {};
	};
	const log = wrapper(console.log, true);
	const error = wrapper(console.error, true);
	const debugMain = wrapper(console.log, settings.enableDebugMain);
	const debugComponents = wrapper(console.log, settings.enableDebugComponents);
	const debugRules = wrapper(console.log, settings.enableDebugRules);
	const debugVideoFilter = wrapper(console.log, settings.enableDebugVideoFilter);
	const debugCommentFilter = wrapper(console.log, settings.enableDebugCommentFilter);
	const init = async () => {
		await waitForHTMLBuild();
		log("wait for html complete");
	};
	const waitForHTMLBuild = () => {
		return new Promise((resolve) => {
			const observer = new MutationObserver(() => {
				if(document.head) {
					observer.disconnect();
					resolve();
				}
			});
			observer.observe(document, {
				childList: true,
				subtree: true
			});
		});
	};
	const sideBtnStyle = '@charset "UTF-8";button.bili-cleaner-side-btn{border:1px #e3e5e7 solid;width:40px;height:40px;padding:0;font-size:13px;color:#000;border-radius:6px;background-color:#fff;transition:background-color .1s linear;position:fixed;bottom:220px;right:6px;z-index:99999;cursor:pointer}button.bili-cleaner-side-btn:hover{background-color:#e3e5e7;cursor:pointer}html:has(#bilibili-player.mode-webscreen) button.bili-cleaner-side-btn{display:none!important}\n';
	class SideBtn {
		constructor(btnID, btnContent, btnFunc) {
			__publicField(this, "nodeHTML", `<button class="bili-cleaner-side-btn" type="button"></button>`);
			this.btnID = btnID;
			this.btnContent = btnContent;
			this.btnFunc = btnFunc;
		}
		enable() {
			var _a, _b;
			try {
				(_a = document.querySelector(`#bili-cleaner-${this.btnID}`)) == null ? void 0 : _a.remove();
				(_b = document.querySelector(`style[bili-cleaner-css="${this.btnID}"]`)) == null ? void 0 : _b.remove();
				_GM_setValue(`BILICLEANER_${this.btnID}`, true);
				const style = document.createElement("style");
				style.innerHTML = sideBtnStyle;
				style.setAttribute("bili-cleaner-css", this.btnID);
				document.documentElement.appendChild(style);
				let node = document.createElement("div");
				node.innerHTML = this.nodeHTML;
				node = node.querySelector(".bili-cleaner-side-btn");
				node.id = `bili-cleaner-${this.btnID}`;
				node.innerHTML = this.btnContent;
				const right = _GM_getValue(`BILICLEANER_${this.btnID}-right`);
				const bottom = _GM_getValue(`BILICLEANER_${this.btnID}-bottom`);
				right && node.style.setProperty("right", `${right}px`);
				bottom && node.style.setProperty("bottom", `${bottom}px`);
				let isDragging = false;
				let initX, initY, initRight, initBottom;
				node.addEventListener("mousedown", (e) => {
					isDragging = true;
					initX = e.clientX;
					initY = e.clientY;
					const c = window.getComputedStyle(node);
					initRight = parseInt(c.getPropertyValue("right"));
					initBottom = parseInt(c.getPropertyValue("bottom"));
				});
				document.addEventListener("mousemove", (e) => {
					if(isDragging) {
						const diffX = e.clientX - initX;
						const diffY = e.clientY - initY;
						node.style.right = `${initRight - diffX}px`;
						node.style.bottom = `${initBottom - diffY}px`;
					}
				});
				document.addEventListener("mouseup", () => {
					isDragging = false;
					_GM_setValue(`BILICLEANER_${this.btnID}-right`, parseInt(node.style.right));
					_GM_setValue(`BILICLEANER_${this.btnID}-bottom`, parseFloat(node.style.bottom));
				});
				node.addEventListener("click", () => {
					this.btnFunc();
				});
				document.documentElement.appendChild(node);
				debugComponents(`SideBtn ${this.btnID} enable OK`);
			} catch (err) {
				error(err);
				error(`SideBtn ${this.btnID} enable error`);
			}
		}
		disable() {
			var _a, _b;
			_GM_setValue(`BILICLEANER_${this.btnID}`, false);
			(_a = document.querySelector(`#bili-cleaner-${this.btnID}`)) == null ? void 0 : _a.remove();
			(_b = document.querySelector(`style[bili-cleaner-css="${this.btnID}"]`)) == null ? void 0 : _b.remove();
		}
	}
	const panelStyle = '#bili-cleaner{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:max(32vw,300px);height:90vh;border-radius:10px;background:#f4f5f7;box-shadow:0 0 8px #00000040;overflow:auto;z-index:2147483640;overscroll-behavior:contain}#bili-cleaner #bili-cleaner-bar{width:max(32vw,300px);height:6vh;background:rgb(0,174,236);border-top-left-radius:10px;border-top-right-radius:10px;cursor:move;-webkit-user-select:none;user-select:none}#bili-cleaner #bili-cleaner-bar #bili-cleaner-title{width:max(32vw,300px);height:6vh;display:flex;justify-content:center;align-items:center;color:#fff;font-weight:700;font-size:22px}#bili-cleaner #bili-cleaner-bar #bili-cleaner-title span{text-align:center}#bili-cleaner #bili-cleaner-bar #bili-cleaner-close{position:absolute;top:0;right:0;width:6vh;height:6vh;border-radius:6vh;display:flex;justify-content:center;align-items:center;cursor:auto}#bili-cleaner #bili-cleaner-bar #bili-cleaner-close:hover{background:rgba(255,255,255,.2)}#bili-cleaner #bili-cleaner-bar #bili-cleaner-close svg{text-align:center}#bili-cleaner #bili-cleaner-group-list{height:84vh;overflow:auto;scrollbar-width:none!important;overscroll-behavior:contain}#bili-cleaner #bili-cleaner-group-list::-webkit-scrollbar{display:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group{margin:14px;background:white;border-radius:6px;padding:8px 16px;border:1px solid #ddd;-webkit-user-select:none;user-select:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group hr{border:1px solid #eee;margin:5px 0 10px}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-group-title{font-size:20px;font-weight:700;padding:2px;color:#000;letter-spacing:1px}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-list label{display:flex;align-items:center;margin:6px 0 6px 10px;font-size:16px;color:#000}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-list hr{border:1px solid #eee;margin:15px 20px}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox{width:50px;min-width:50px;height:27px;margin:0 1em 0 0;position:relative;border:1px solid #dfdfdf;background-color:#fdfdfd;box-shadow:#dfdfdf 0 0 inset;border-radius:50px;-moz-appearance:none;appearance:none;-webkit-appearance:none;-webkit-user-select:none;user-select:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox:before{content:"";width:25px;height:25px;position:absolute;top:0;left:0;border-radius:50px;background-color:#fff;box-shadow:0 1px 3px #00000080}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox:checked{border-color:#00aeec;box-shadow:#00aeec 0 0 0 16px inset;background-color:#00aeec}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox:checked:before{left:25px}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-number{width:50px;min-width:50px;height:27px;margin:0 .5em;position:relative;border:1px solid #dfdfdf;background-color:#fdfdfd;box-shadow:#dfdfdf 0 0 inset;border-radius:5px;appearance:none;-webkit-appearance:none;text-align:center;color:#00f;font-size:16px;-moz-appearance:textfield}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-number::-webkit-inner-spin-button{-webkit-appearance:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-button{width:50px;background-color:#fff;border:1px solid #666;border-radius:6px;box-sizing:border-box;cursor:pointer;display:inline-block;font-size:16px;margin:0 1em 0 0;outline:none;padding:5px 0;position:relative;text-align:center;text-decoration:none;touch-action:manipulation;transition:box-shadow .2s,-ms-transform .1s,-webkit-transform .1s,transform .1s;user-select:none;-webkit-user-select:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-button:active{background-color:#f7f7f7;border-color:#000;transform:scale(.96)}#bili-cleaner-wordlist{background:white;border-radius:5px;box-shadow:0 0 8px #00000040;overflow:hidden;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;z-index:2147483641;overscroll-behavior:contain}#bili-cleaner-wordlist .wordlist-header{background-color:#00aeec;color:#fff;font-size:22px;font-weight:700;margin:0;height:100%;width:100%;line-height:36px;text-align:center;-webkit-user-select:none;user-select:none}#bili-cleaner-wordlist .wordlist-description{font-size:16px;margin:6px auto;line-height:18px;text-align:center}#bili-cleaner-wordlist textarea.wordlist-body{width:400px;height:500px;margin:0 12px;border:2px solid #ccc;overflow-y:scroll;font-size:16px;line-height:22px;padding:5px 10px;flex-grow:1;resize:none;overscroll-behavior:contain}#bili-cleaner-wordlist textarea.wordlist-body:focus{outline:none!important}#bili-cleaner-wordlist .wordlist-footer{height:50px;display:flex;justify-content:space-evenly;padding:0 10px;align-items:center}#bili-cleaner-wordlist .wordlist-footer button{width:100px;height:30px;border-radius:5px;border:1px solid #666;font-size:18px}#bili-cleaner-wordlist .wordlist-footer button:hover{background-color:#666;color:#fff}\n';
	class Panel {
		constructor() {
			__publicField(this, "panelHTML", `
<div id="bili-cleaner">
<div id="bili-cleaner-bar">
<div id="bili-cleaner-title">
<span>页面净化设置</span>
</div>
<div id="bili-cleaner-close">
<svg class="icon" viewBox="0 0 1026 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M996.742543 154.815357L639.810328 511.747572l356.932215 356.932215a90.158906 90.158906 0 0 1-127.490994 127.490994L512.319334 639.195998l-356.932215 356.889647A90.158906 90.158906 0 1 1 27.896126 868.637219L384.82834 511.747572 27.896126 154.815357A90.158906 90.158906 0 1 1 155.387119 27.324364L512.319334 384.256578 869.251549 27.324364a90.158906 90.158906 0 1 1 127.490994 127.490993z" fill="#ffffff"></path></svg>
</div>
</div>
<div id="bili-cleaner-group-list">
</div>
</div>`);
			// mode用于记录panel中功能类型, 如 屏蔽元素/视频过滤器
			__publicField(this, "mode");
			__publicField(this, "isShowing", false);
		}
		/** 向document.head中添加panel CSS */
		insertPanelCSS() {
			try {
				if(document.head.querySelector("#bili-cleaner-panel-css")) {
					return;
				}
				const style = document.createElement("style");
				style.innerHTML = panelStyle;
				style.setAttribute("id", "bili-cleaner-panel-css");
				document.head.appendChild(style);
				debugComponents("insertPanelCSS OK");
			} catch (err) {
				error(`insertPanelCSS failed`);
				error(err);
			}
		}
		/** 向document.body后添加panel html代码 */
		insertPanelHTML() {
			try {
				if(document.getElementById("bili-cleaner")) {
					return;
				}
				let node = document.createElement("div");
				node.innerHTML = this.panelHTML;
				node = node.querySelector("#bili-cleaner");
				document.body.appendChild(node);
				debugComponents("insertPanelHTML OK");
			} catch (err) {
				error(`insertPanelHTML failed`);
				error(err);
			}
		}
		/** 右上角关闭按钮 */
		watchCloseBtn() {
			try {
				const closeBtn = document.getElementById("bili-cleaner-close");
				closeBtn.addEventListener("click", () => {
					this.hide();
				});
				debugComponents("watchCloseBtn OK");
			} catch (err) {
				error(`watchCloseBtn failed`);
				error(err);
			}
		}
		/** 可拖拽panel bar, 拖拽panel顶部的bar可移动panel, 其他区域不可拖拽 */
		draggableBar() {
			try {
				const panel = document.getElementById("bili-cleaner");
				const bar = document.getElementById("bili-cleaner-bar");
				let isDragging = false;
				let initX, initY, initLeft, initTop;
				bar.addEventListener("mousedown", (e) => {
					isDragging = true;
					initX = e.clientX;
					initY = e.clientY;
					const c = window.getComputedStyle(panel);
					initLeft = parseInt(c.getPropertyValue("left"), 10);
					initTop = parseInt(c.getPropertyValue("top"), 10);
				});
				document.addEventListener("mousemove", (e) => {
					if(isDragging) {
						const diffX = e.clientX - initX;
						const diffY = e.clientY - initY;
						panel.style.left = `${initLeft + diffX}px`;
						panel.style.top = `${initTop + diffY}px`;
						const rect = bar.getBoundingClientRect();
						if(rect.left < 0) {
							panel.style.left = `${initLeft + diffX - rect.left}px`;
						}
						if(rect.top < 0) {
							panel.style.top = `${initTop + diffY - rect.top}px`;
						}
						if(rect.right > window.innerWidth) {
							panel.style.left = `${initLeft + diffX - (rect.right - window.innerWidth)}px`;
						}
						if(rect.bottom > window.innerHeight) {
							panel.style.top = `${initTop + diffY - (rect.bottom - window.innerHeight)}px`;
						}
					}
				});
				document.addEventListener("mouseup", () => {
					isDragging = false;
				});
				debugComponents("draggableBar OK");
			} catch (err) {
				error(`draggableBar failed`);
				error(err);
			}
		}
		/** 创建Panel */
		create() {
			this.insertPanelCSS();
			this.insertPanelHTML();
			this.watchCloseBtn();
			this.draggableBar();
		}
		/** 隐藏panel */
		hide() {
			const panel = document.getElementById("bili-cleaner");
			if(panel) {
				panel.style.display = "none";
			}
			this.isShowing = false;
		}
		/** 显示panel */
		show() {
			const panel = document.getElementById("bili-cleaner");
			if(panel) {
				panel.style.removeProperty("display");
			}
			this.isShowing = true;
		}
		/** 清空panel内groups, 用于替换功能group */
		clearGroups() {
			const groupList = document.getElementById("bili-cleaner-group-list");
			if(groupList) {
				groupList.innerHTML = "";
			}
			debugComponents("panel clearGroups OK");
		}
	}
	class CheckboxItem {
		constructor(option) {
			__publicField(this, "nodeHTML", `<input class="bili-cleaner-item-checkbox" type="checkbox">`);
			__publicField(this, "isEnable");
			// item对应的HTML input node
			__publicField(this, "itemEle");
			this.option = option;
			this.isEnable = void 0;
			this.itemEle = void 0;
		}
		/**
		 * 设定并记录item开关状态
		 * @param value checkbox开关状态
		 */
		setStatus(value) {
			_GM_setValue(`BILICLEANER_${this.option.itemID}`, value);
			this.isEnable = value;
		}
		/** 获取item开关状态, 若第一次安装时不存在该key, 使用默认值 */
		getStatus() {
			this.isEnable = _GM_getValue(`BILICLEANER_${this.option.itemID}`);
			if(this.option.defaultStatus && this.isEnable === void 0) {
				this.isEnable = this.option.defaultStatus;
				this.setStatus(this.isEnable);
			}
		}
		/**
		 * 在相应group内添加item
		 * @param groupID item所属groupID, 由Group调用insertItem时传入
		 */
		insertItem(groupID) {
			try {
				this.getStatus();
				const e = document.createElement("label");
				e.id = this.option.itemID;
				e.innerHTML = `${this.nodeHTML}<span>${this.option.description.replaceAll("\n", "<br>")}</span>`;
				if(this.isEnable) {
					e.querySelector("input").checked = true;
				}
				const itemGroupList = document.querySelector(`#${groupID} .bili-cleaner-item-list`);
				if(itemGroupList) {
					itemGroupList.appendChild(e);
					debugComponents(`insertItem ${this.option.itemID} OK`);
				}
			} catch (err) {
				error(`insertItem ${this.option.itemID} err`);
				error(err);
			}
		}
		/** 启用CSS片段, 向<html>插入style */
		insertItemCSS() {
			if(!this.option.itemCSS) {
				return;
			}
			try {
				if(document.querySelector(`html>style[bili-cleaner-css=${this.option.itemID}]`)) {
					debugComponents(`insertItemCSS ${this.option.itemID} CSS exist, ignore`);
					return;
				}
				const style = document.createElement("style");
				style.innerHTML = this.option.itemCSS.replace(/\n\s*/g, "").trim();
				style.setAttribute("bili-cleaner-css", this.option.itemID);
				document.documentElement.appendChild(style);
				debugComponents(`insertItemCSS ${this.option.itemID} OK`);
			} catch (err) {
				error(`insertItemCSS ${this.option.itemID} failed`);
				error(err);
			}
		}
		/** 停用CSS片段, 从<html>移除style */
		removeItemCSS() {
			var _a;
			if(this.option.itemCSS) {
				const style = document.querySelector(`html>style[bili-cleaner-css=${this.option.itemID}]`);
				if(style) {
					(_a = style.parentNode) == null ? void 0 : _a.removeChild(style);
					debugComponents(`removeItemCSS ${this.option.itemID} OK`);
				}
			}
		}
		/** 监听item checkbox开关 */
		watchItem() {
			try {
				this.itemEle = document.querySelector(`#${this.option.itemID} input`);
				this.itemEle.addEventListener("change", (event) => {
					if(event.target.checked) {
						this.setStatus(true);
						this.insertItemCSS();
						this.option.enableFunc && this.option.enableFunc().then().catch();
					} else {
						this.setStatus(false);
						this.removeItemCSS();
						this.option.disableFunc && this.option.disableFunc().then().catch();
					}
				});
				debugComponents(`watchItem ${this.option.itemID} OK`);
			} catch (err) {
				error(`watchItem ${this.option.itemID} err`);
				error(err);
			}
		}
		/**
		 * 执行item功能, 添加CSS, 执行func
		 * @param enableFunc 是否执行func, 默认true
		 */
		enableItem(enableFunc = true) {
			this.getStatus();
			if(this.isEnable) {
				try {
					this.insertItemCSS();
					if(enableFunc && this.option.enableFunc) {
						switch(this.option.enableFuncRunAt) {
							case "document-start":
								this.option.enableFunc().then().catch();
								break;
							case "document-end":
								if(["complete", "interactive"].includes(document.readyState)) {
									this.option.enableFunc().then().catch();
								} else {
									document.addEventListener("DOMContentLoaded", this.option.enableFunc);
								}
								break;
							case "document-idle":
								if(document.readyState === "complete") {
									this.option.enableFunc().then().catch();
								} else {
									document.addEventListener("load", this.option.enableFunc);
								}
								break;
							default:
								this.option.enableFunc().then().catch();
						}
					}
					debugComponents(`enableItem ${this.option.itemID} OK`);
				} catch (err) {
					error(`enableItem ${this.option.itemID} Error`);
					error(err);
				}
			}
		}
	}
	class RadioItem {
		constructor(option) {
			__publicField(this, "nodeHTML", `<input class="bili-cleaner-item-checkbox" type="radio">`);
			__publicField(this, "isEnable");
			__publicField(this, "itemEle");
			this.option = option;
			this.isEnable = void 0;
			this.itemEle = void 0;
		}
		/**
		 * 设定并记录item开关状态
		 * @param targetID 设定对象itemID, 默认null 给this对象设定
		 * @param value 开关状态
		 */
		setStatus(value, targetID = null) {
			if(!targetID) {
				_GM_setValue(`BILICLEANER_${this.option.itemID}`, value);
				this.isEnable = value;
			} else {
				_GM_setValue(`BILICLEANER_${targetID}`, value);
			}
		}
		/** 获取item开关状态, 若第一次安装时不存在该key, 使用默认值 */
		getStatus() {
			this.isEnable = _GM_getValue(`BILICLEANER_${this.option.itemID}`);
			if(this.option.defaultStatus && this.isEnable === void 0) {
				this.isEnable = this.option.defaultStatus;
				this.setStatus(this.isEnable);
			}
		}
		/**
		 * 在相应group内添加item
		 * @param groupID item所属groupID, 由Group调用insertItem时传入
		 */
		insertItem(groupID) {
			try {
				this.getStatus();
				const e = document.createElement("label");
				e.id = this.option.itemID;
				e.innerHTML = `${this.nodeHTML}<span>${this.option.description.replaceAll("\n", "<br>")}</span>`;
				if(this.isEnable) {
					e.querySelector("input").checked = true;
				}
				e.querySelector("input").name = this.option.radioName;
				const itemGroupList = document.querySelector(`#${groupID} .bili-cleaner-item-list`);
				if(itemGroupList) {
					itemGroupList.appendChild(e);
					debugComponents(`insertItem ${this.option.itemID} OK`);
				}
			} catch (err) {
				error(`insertItem ${this.option.itemID} err`);
				error(err);
			}
		}
		/** 启用CSS片段, 向<html>插入style */
		insertItemCSS() {
			if(!this.option.itemCSS) {
				return;
			}
			try {
				if(document.querySelector(`html>style[bili-cleaner-css=${this.option.itemID}]`)) {
					debugComponents(`insertItemCSS ${this.option.itemID} CSS exist, ignore`);
					return;
				}
				const style = document.createElement("style");
				style.innerHTML = this.option.itemCSS.replace(/\n\s*/g, "").trim();
				style.setAttribute("bili-cleaner-css", this.option.itemID);
				document.documentElement.appendChild(style);
				debugComponents(`insertItemCSS ${this.option.itemID} OK`);
			} catch (err) {
				error(`insertItemCSS ${this.option.itemID} failed`);
				error(err);
			}
		}
		/** 停用CSS片段, 从<html>移除style */
		removeItemCSS() {
			var _a;
			if(this.option.itemCSS) {
				const style = document.querySelector(`html>style[bili-cleaner-css=${this.option.itemID}]`);
				if(style) {
					(_a = style.parentNode) == null ? void 0 : _a.removeChild(style);
					debugComponents(`removeItemCSS ${this.option.itemID} OK`);
				}
			}
		}
		/** 监听item option开关 */
		watchItem() {
			try {
				this.itemEle = document.querySelector(`#${this.option.itemID} input`);
				this.itemEle.addEventListener("change", (event) => {
					if(event.target.checked) {
						debugComponents(`radioItem ${this.option.itemID} checked`);
						this.setStatus(true);
						this.insertItemCSS();
						this.option.itemFunc && this.option.itemFunc().then().catch();
						this.option.radioItemIDList.forEach((targetID) => {
							var _a;
							if(targetID !== this.option.itemID) {
								const style = document.querySelector(`html>style[bili-cleaner-css=${targetID}]`);
								if(style) {
									(_a = style.parentNode) == null ? void 0 : _a.removeChild(style);
									debugComponents(`removeItemCSS ${targetID} OK`);
								}
								this.setStatus(false, targetID);
								debugComponents(`disable same name radioItem ${targetID}, OK`);
							}
						});
					}
				});
				debugComponents(`watchItem ${this.option.itemID} OK`);
			} catch (err) {
				error(`watchItem ${this.option.itemID} err`);
				error(err);
			}
		}
		/**
		 * 执行item功能, 添加CSS, 执行func
		 * @param enableFunc 是否执行func, 默认true
		 */
		enableItem(enableFunc = true) {
			this.getStatus();
			if(this.isEnable) {
				try {
					this.insertItemCSS();
					if(enableFunc && this.option.itemFunc) {
						this.option.itemFunc().then().catch();
					}
					debugComponents(`enableItem ${this.option.itemID} OK`);
				} catch (err) {
					error(`enableItem ${this.option.itemID} Error`);
					error(err);
				}
			}
		}
	}
	class NumberItem {
		constructor(option) {
			__publicField(this, "nodeHTML", `<input class="bili-cleaner-item-number" type="number">`);
			__publicField(this, "itemValue", 0);
			this.option = option;
		}
		/** 获取数值, 初次安装使用默认值 */
		getValue() {
			this.itemValue = _GM_getValue(`BILICLEANER_${this.option.itemID}`);
			if(this.itemValue === void 0) {
				this.itemValue = this.option.defaultValue;
				this.setValue(this.itemValue);
			}
		}
		/** 设定并记录数值 */
		setValue(value) {
			this.itemValue = value;
			_GM_setValue(`BILICLEANER_${this.option.itemID}`, this.itemValue);
		}
		/**
		 * 在相应group内添加item
		 * @param groupID item所属groupID, 由Group调用insertItem时传入
		 */
		insertItem(groupID) {
			try {
				this.getValue();
				const node = document.createElement("label");
				node.id = this.option.itemID;
				node.innerHTML = `${this.option.description.replaceAll("\n", "<br>")}<span>${this.nodeHTML}</span>${this.option.unit}`;
				const inputNode = node.querySelector("input");
				inputNode.setAttribute("value", this.itemValue.toString());
				inputNode.setAttribute("min", this.option.minValue.toString());
				inputNode.setAttribute("max", this.option.maxValue.toString());
				const itemGroupList = document.querySelector(`#${groupID} .bili-cleaner-item-list`);
				if(itemGroupList) {
					itemGroupList.appendChild(node);
					debugComponents(`insertItem ${this.option.itemID} OK`);
				}
			} catch (err) {
				error(`insertItem ${this.option.itemID} err`);
				error(err);
			}
		}
		/** 插入CSS，若有占位符则替换成当前设定数值 */
		insertItemCSS() {
			try {
				if(!this.option.itemCSS) {
					return;
				}
				if(document.querySelector(`html>style[bili-cleaner-css=${this.option.itemID}]`)) {
					debugComponents(`insertItemCSS ${this.option.itemID} CSS exist, ignore`);
					return;
				}
				const style = document.createElement("style");
				let currCSS = this.option.itemCSS;
				if(this.option.itemCSSPlaceholder) {
					this.getValue();
					currCSS = currCSS.replaceAll(this.option.itemCSSPlaceholder, this.itemValue.toString());
				}
				style.innerHTML = currCSS.replace(/\n\s*/g, "").trim();
				style.setAttribute("bili-cleaner-css", this.option.itemID);
				document.documentElement.appendChild(style);
				debugComponents(`insertItemCSS ${this.option.itemID} OK`);
			} catch (err) {
				error(`insertItemCSS ${this.option.itemID} failed`);
				error(err);
			}
		}
		/** 移除CSS */
		removeItemCSS() {
			var _a;
			if(this.option.itemCSS) {
				const style = document.querySelector(`html>style[bili-cleaner-css=${this.option.itemID}]`);
				if(style) {
					(_a = style.parentNode) == null ? void 0 : _a.removeChild(style);
					debugComponents(`removeItemCSS ${this.option.itemID} OK`);
				}
			}
		}
		/** 监听数值变化并保持, 重置不合理的值 */
		watchItem() {
			try {
				const itemEle = document.querySelector(`#${this.option.itemID} input`);
				let currValue;
				itemEle.addEventListener("input", () => {
					if(!itemEle.value.trim().match(/^-?\d+$/)) {
						return;
					}
					currValue = parseInt(itemEle.value);
					if(isNaN(currValue)) {
						itemEle.value = this.option.disableValue.toString();
					} else {
						if(currValue > this.option.maxValue) {
							itemEle.value = this.option.maxValue.toString();
						} else if(currValue < this.option.minValue) {
							itemEle.value = this.option.minValue.toString();
						}
					}
					this.setValue(parseInt(itemEle.value));
					itemEle.value = parseInt(itemEle.value).toString();
					debugComponents(`${this.option.itemID} currValue ${itemEle.value}`);
					this.reloadItem();
					this.option.callback && this.option.callback(parseInt(itemEle.value)).then().catch();
				});
				debugComponents(`watchItem ${this.option.itemID} OK`);
			} catch (err) {
				error(`watchItem ${this.option.itemID} err`);
				error(err);
			}
		}
		/** 启用，设定带自定义数值的CSS, 数值为disableValue时禁用 */
		enableItem(_enableFunc = false) {
			this.getValue();
			if(this.itemValue !== this.option.disableValue) {
				try {
					this.insertItemCSS();
					debugComponents(`enableItem ${this.option.itemID} OK`);
				} catch (err) {
					error(`enableItem ${this.option.itemID} Error`);
					error(err);
				}
			}
		}
		/** 重载，在数值修改后重载CSS */
		reloadItem() {
			if(!this.option.itemCSS) {
				return;
			}
			if(this.itemValue !== this.option.disableValue) {
				this.removeItemCSS();
				this.insertItemCSS();
			} else {
				this.removeItemCSS();
			}
		}
	}
	class ButtonItem {
		constructor(option) {
			__publicField(this, "nodeHTML", `<button class="bili-cleaner-item-button" role="button"></button>`);
			this.option = option;
		}
		/**
		 * 在相应group内添加item
		 * @param groupID item所属groupID, 由Group调用insertItem时传入
		 */
		insertItem(groupID) {
			try {
				const node = document.createElement("label");
				node.id = this.option.itemID;
				node.innerHTML = `${this.nodeHTML}${this.option.description.replaceAll("\n", "<br>")}`;
				node.querySelector("button").innerHTML = this.option.name;
				const itemGroupList = document.querySelector(`#${groupID} .bili-cleaner-item-list`);
				if(itemGroupList) {
					itemGroupList.appendChild(node);
					debugComponents(`insertItem ${this.option.itemID} OK`);
				}
			} catch (err) {
				error(`insertItem ${this.option.itemID} err`);
				error(err);
			}
		}
		/** 监听按钮按下 */
		watchItem() {
			try {
				const itemEle = document.querySelector(`#${this.option.itemID} button`);
				itemEle.addEventListener("click", () => {
					debugComponents(`button ${this.option.itemID} click`);
					this.option.itemFunc().then().catch();
				});
				debugComponents(`watchItem ${this.option.itemID} OK`);
			} catch (err) {
				error(`watchItem ${this.option.itemID} err`);
				error(err);
			}
		}
	}
	class Group {
		/**
		 * Group是每个页面的规则组，每个页面有多个组
		 * @param groupID group的唯一ID
		 * @param title group标题, 显示在group顶部, 可使用换行符'\n', 可使用HTML
		 * @param items group内功能列表
		 */
		constructor(groupID, title, items) {
			__publicField(this, "groupHTML", `
<div class="bili-cleaner-group">
<div class="bili-cleaner-group-title">
</div>
<hr>
<div class="bili-cleaner-item-list">
</div>
</div>`);
			this.groupID = groupID;
			this.title = title;
			this.items = items;
			this.groupID = "bili-cleaner-group-" + groupID;
		}
		/** 在panel内添加一个group */
		insertGroup() {
			const e = document.createElement("div");
			e.innerHTML = this.groupHTML.trim();
			e.querySelector(".bili-cleaner-group").id = this.groupID;
			e.querySelector(".bili-cleaner-group-title").innerHTML = this.title.replaceAll("\n", "<br>");
			const groupList = document.getElementById("bili-cleaner-group-list");
			groupList.appendChild(e);
		}
		/** 插入group内item列表, 并逐一监听 */
		insertGroupItems() {
			try {
				this.items.forEach((e) => {
					e.insertItem(this.groupID);
					if(typeof e.watchItem === "function") {
						e.watchItem();
					}
				});
				debugComponents(`insertGroupItems ${this.groupID} OK`);
			} catch (err) {
				error(`insertGroupItems ${this.groupID} err`);
				error(err);
			}
		}
		/**
		 * 启用group，启用group内items
		 * @param enableFunc 是否启用item功能, 默认true
		 */
		enableGroup(enableFunc = true) {
			try {
				this.items.forEach((e) => {
					if(e instanceof CheckboxItem || e instanceof RadioItem || e instanceof NumberItem) {
						e.enableItem(enableFunc);
					}
				});
				debugComponents(`enableGroup ${this.groupID} OK`);
			} catch (err) {
				error(`enableGroup ${this.groupID} err`);
				error(err);
			}
		}
		/** 禁用Group, 临时使用, 移除全部CSS, 监听函数保持不变 */
		disableGroup() {
			try {
				this.items.forEach((e) => {
					if(e instanceof CheckboxItem || e instanceof RadioItem || e instanceof NumberItem) {
						e.removeItemCSS();
					}
				});
				debugComponents(`disableGroup ${this.groupID} OK`);
			} catch (err) {
				error(`disableGroup ${this.groupID} err`);
				error(err);
			}
		}
	}
	const href = location.href;
	const host = location.host;
	const pathname = location.pathname;
	const currPage = () => {
		if(href.includes("www.bilibili.com/correspond/") || href.includes("live.bilibili.com/p/html/") || href.includes("live.bilibili.com/live-room-play-game-together")) {
			return "invalid";
		}
		if(href.startsWith("https://www.bilibili.com/") && ["/index.html", "/"].includes(pathname)) {
			return "homepage";
		}
		if(href.includes("bilibili.com/video/")) {
			return "video";
		}
		if(href.includes("bilibili.com/v/popular/")) {
			return "popular";
		}
		if(host === "search.bilibili.com") {
			return "search";
		}
		if(host === "t.bilibili.com" || href.includes("bilibili.com/opus/") || href.includes("bilibili.com/v/topic/detail")) {
			return "dynamic";
		}
		if(host === "live.bilibili.com") {
			if(pathname.match(/^\/(?:blanc\/)?\d+/)) {
				return "liveRoom";
			}
			if(href.match(/live\.bilibili\.com\/(p\/html|activity|blackboard)/)) {
				return "";
			}
			return "liveHome";
		}
		if(href.includes("bilibili.com/bangumi/play/")) {
			return "bangumi";
		}
		if(href.includes("bilibili.com/list/")) {
			return "playlist";
		}
		if(host === "space.bilibili.com") {
			return "space";
		}
		if(!href.includes("bilibili.com/v/popular/") && href.includes("bilibili.com/v/")) {
			return "channel";
		}
		if(href.includes("www.bilibili.com/festival/")) {
			return "festival";
		}
		if(href.includes("bilibili.com/watchlater")) {
			return "watchlater";
		}
		return "";
	};
	const ans = currPage();
	const isPageInvalid = () => ans === "invalid";
	const isPageHomepage = () => ans === "homepage";
	const isPageVideo = () => ans === "video";
	const isPagePopular = () => ans === "popular";
	const isPageSearch = () => ans === "search";
	const isPageDynamic = () => ans === "dynamic";
	const isPageLiveHome = () => ans === "liveHome";
	const isPageLiveRoom = () => ans === "liveRoom";
	const isPageBangumi = () => ans === "bangumi";
	const isPagePlaylist = () => ans === "playlist";
	const isPageFestival = () => ans === "festival";
	const isPageChannel = () => ans === "channel";
	const isPageSpace = () => ans === "space";
	const isPageWatchlater = () => ans === "watchlater";
	const channelGroupList = [];
	if(isPageChannel()) {
		const basicItems2 = [
			// 隐藏 横幅banner, 同步首页设定
			new CheckboxItem({
				itemID: "homepage-hide-banner",
				description: "隐藏 横幅banner",
				itemCSS: `
.header-banner__inner, .bili-header__banner {
display: none !important;
}
.bili-header .bili-header__bar:not(.slide-down) {
position: relative !important;
box-shadow: 0 2px 4px #00000014;
}
.bili-header__channel {
margin-top: 5px !important;
}
/* icon和文字颜色 */
.bili-header .right-entry__outside .right-entry-icon {
color: #18191c !important;
}
.bili-header .left-entry .entry-title, .bili-header .left-entry .download-entry, .bili-header .left-entry .default-entry, .bili-header .left-entry .loc-entry {
color: #18191c !important;
}
.bili-header .left-entry .entry-title .zhuzhan-icon {
color: #00aeec !important;
}
.bili-header .right-entry__outside .right-entry-text {
color: #61666d !important;
}
/* header滚动后渐变出现, 否则闪动 */
#i_cecream .bili-header__bar.slide-down {
transition: background-color 0.3s ease-out, box-shadow 0.3s ease-out !important;
}
#i_cecream .bili-header__bar:not(.slide-down) {
transition: background-color 0.3s ease-out !important;
}
/* header高度 */
#biliMainHeader {min-height: unset !important;}
/* 分区菜单 第一排按钮的二级菜单下置  */
.v-popover.is-top {padding-top: 5px; padding-bottom: unset !important; bottom: unset !important;}
@media (min-width: 2200px) {.v-popover.is-top {top:32px;}}
@media (min-width: 1701px) and (max-width: 2199.9px) {.v-popover.is-top {top:32px;}}
@media (min-width: 1367px) and (max-width: 1700.9px) {.v-popover.is-top {top:28px;}}
@media (min-width: 1100px) and (max-width: 1366.9px) {.v-popover.is-top {top:28px;}}
@media (max-width: 1099.9px) {.v-popover.is-top {top:24px;}}
`
			}),
			// 隐藏 全站分区栏
			new CheckboxItem({
				itemID: "channel-hide-subarea",
				description: "隐藏 全站分区栏",
				itemCSS: `#i_cecream .bili-header__channel {display: none !important;}`
			}),
			// 隐藏 大图轮播
			new CheckboxItem({
				itemID: "channel-hide-carousel",
				description: "隐藏 大图轮播",
				itemCSS: `.channel-swiper, .channel-swiper-client {display: none !important;}`
			}),
			// 隐藏 滚动页面时 顶部吸附频道分区
			new CheckboxItem({
				itemID: "channel-hide-sticky-subchannel",
				description: "隐藏 滚动页面时 顶部吸附 频道分区",
				itemCSS: `.fixed-header-nav-sticky {display: none !important;}
.fixed-wrapper-shown {box-shadow: unset !important;}`
			}),
			// 隐藏 滚动页面时 顶部吸附顶栏
			new CheckboxItem({
				itemID: "channel-hide-sticky-header",
				description: "隐藏 滚动页面时 顶部吸附 顶栏",
				itemCSS: `.bili-header__bar.slide-down {display: none !important;}`
			}),
			// 修改 页面两侧边距
			new NumberItem({
				itemID: "channel-layout-padding",
				description: "修改 页面两侧边距 (-1禁用)",
				defaultValue: -1,
				minValue: -1,
				maxValue: 500,
				disableValue: -1,
				unit: "px",
				itemCSS: `.go-back-btn, .channel-layout, .channel-outer-nav {padding: 0 ???px !important;}`,
				itemCSSPlaceholder: "???"
			})
		];
		channelGroupList.push(new Group("channel-basic", "频道页 基础功能", basicItems2));
		const videoListItems = [
			// 隐藏 前方高能右侧 话题精选
			// 适配视频过滤，不对元素做nth-child判断
			// 使用grid-template-rows: 1fr auto 控制两行显示
			// 使用grid-auto-rows: 0px隐藏第三行
			new CheckboxItem({
				itemID: "channel-hide-high-energy-topic",
				description: "隐藏 前方高能右侧 话题精选",
				itemCSS: `
.bili-grid:has([data-report="high_energy.content"]) {
grid-template-columns: unset !important;
margin-top: 0 !important;
margin-bottom: 20px !important;
}
.bili-grid:has([data-report="high_energy.content"]) aside[data-report="topic.card"] {
display: none !important;
}
.bili-grid:has([data-report="high_energy.content"]) .video-card-list,
.video-double-full {
min-height: unset !important;
}
@media (max-width: 1099.9px) {
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body {
grid-column: span 4;
grid-template-columns: repeat(4, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body>*:nth-of-type(1n + 7) {
display: unset !important
}
}
@media (min-width: 1100px) and (max-width: 1366.9px) {
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body {
grid-column: span 5;
grid-template-columns: repeat(5, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body>*:nth-of-type(1n + 9) {
display: unset !important
}
}
@media (min-width: 1367px) and (max-width: 1700.9px) {
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body {
grid-column: span 5;
grid-template-columns: repeat(5, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body>*:nth-of-type(1n + 9) {
display: unset !important
}
}
@media (min-width: 1701px) and (max-width: 2199.9px) {
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body {
grid-column: span 6;
grid-template-columns: repeat(6, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body>*:nth-of-type(1n + 11) {
display: unset !important
}
}
@media (min-width: 2200px) {
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body {
grid-column: span 6;
grid-template-columns: repeat(6, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has([data-report="high_energy.content"]) .video-card-list .video-card-body>*:nth-of-type(1n + 13) {
display: unset !important
}
}
`
			}),
			// 隐藏 前方高能栏目
			new CheckboxItem({
				itemID: "channel-hide-high-energy",
				description: "隐藏 前方高能栏目",
				itemCSS: `.bili-grid:has([data-report="high_energy.content"]) {display: none !important;}`
			}),
			// 隐藏 视频栏目右侧 热门列表
			new CheckboxItem({
				itemID: "channel-hide-rank-list",
				description: "隐藏 视频栏目右侧 热门列表",
				itemCSS: `
.bili-grid:has(.rank-list) {
grid-template-columns: unset !important;
margin-top: 0 !important;
margin-bottom: 20px !important;
}
.bili-grid:has(.rank-list) aside {
display: none !important;
}
.bili-grid.sub-dynamic:has(.rank-list),
.bili-grid:has(.rank-list) .video-card-list {
min-height: unset !important;
}
@media (max-width: 1099.9px) {
.bili-grid:has(.rank-list) .video-card-list .video-card-body {
grid-column: span 4;
grid-template-columns: repeat(4, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has(.rank-list) .video-card-list .video-card-body>*:nth-of-type(1n + 7) {
display: unset !important
}
}
@media (min-width: 1100px) and (max-width: 1366.9px) {
.bili-grid:has(.rank-list) .video-card-list .video-card-body {
grid-column: span 5;
grid-template-columns: repeat(5, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has(.rank-list) .video-card-list .video-card-body>*:nth-of-type(1n + 9) {
display: unset !important
}
}
@media (min-width: 1367px) and (max-width: 1700.9px) {
.bili-grid:has(.rank-list) .video-card-list .video-card-body {
grid-column: span 5;
grid-template-columns: repeat(5, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has(.rank-list) .video-card-list .video-card-body>*:nth-of-type(1n + 9) {
display: unset !important
}
}
@media (min-width: 1701px) and (max-width: 2199.9px) {
.bili-grid:has(.rank-list) .video-card-list .video-card-body {
grid-column: span 6;
grid-template-columns: repeat(6, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has(.rank-list) .video-card-list .video-card-body>*:nth-of-type(1n + 11) {
display: unset !important
}
}
@media (min-width: 2200px) {
.bili-grid:has(.rank-list) .video-card-list .video-card-body {
grid-column: span 6;
grid-template-columns: repeat(6, 1fr);
overflow: hidden;
/* grid-template-rows: repeat(2, 1fr); */
grid-template-rows: 1fr auto;
grid-auto-rows: 0px;
}
.bili-grid:has(.rank-list) .video-card-list .video-card-body>*:nth-of-type(1n + 13) {
display: unset !important
}
}`
			}),
			// 隐藏 广告banner
			new CheckboxItem({
				itemID: "channel-hide-ad-banner",
				description: "隐藏 广告banner",
				defaultStatus: true,
				itemCSS: `.eva-banner {display: none !important;}
.bili-grid {margin-bottom: 20px !important;}`
			}),
			// 隐藏 发布时间
			new CheckboxItem({
				itemID: "channel-hide-video-info-date",
				description: "隐藏 发布时间",
				itemCSS: `.bili-video-card__info--date {display: none !important;}`
			}),
			// 隐藏 弹幕数, 默认开启
			new CheckboxItem({
				itemID: "channel-hide-danmaku-count",
				description: "隐藏 弹幕数",
				defaultStatus: true,
				itemCSS: `.bili-video-card__stats--item:nth-child(2) {visibility: hidden;}`
			}),
			// 隐藏 稍后再看按钮
			new CheckboxItem({
				itemID: "channel-hide-bili-watch-later",
				description: "隐藏 稍后再看按钮",
				itemCSS: `.bili-watch-later {display: none !important;}`
			}),
			// 优化 近期投稿栏目 视频行距, 默认开启
			new CheckboxItem({
				itemID: "channel-feed-card-body-grid-gap",
				description: "优化 近期投稿栏目 视频行距",
				defaultStatus: true,
				itemCSS: `.feed-card-body {grid-gap: 20px 12px !important;}`
			}),
			// 增大 视频信息字号
			new CheckboxItem({
				itemID: "channel-increase-rcmd-list-font-size",
				description: "增大 视频信息字号",
				itemCSS: `.bili-video-card .bili-video-card__info--tit,
.bili-live-card .bili-live-card__info--tit,
.single-card.floor-card .title {
font-size: 16px !important;
}
.bili-video-card .bili-video-card__info--bottom,
.floor-card .sub-title.sub-title {
font-size: 14px !important;
}
.bili-video-card__stats,
.bili-video-card__stats .bili-video-card__stats--left,
.bili-video-card__stats .bili-video-card__stats--right {
font-size: 14px !important;
}`
			})
		];
		channelGroupList.push(new Group("channel-video", "视频列表", videoListItems));
		const sidebarItems = [
			// 隐藏 新版反馈, 默认开启
			new CheckboxItem({
				itemID: "channel-hide-feedback",
				description: "隐藏 新版反馈",
				defaultStatus: true,
				itemCSS: `.palette-button-wrap .feedback {display: none !important;}`
			}),
			// 隐藏 回顶部
			new CheckboxItem({
				itemID: "channel-hide-top-btn",
				description: "隐藏 回顶部",
				itemCSS: `.palette-button-wrap .top-btn-wrap {display: none !important;}`
			})
		];
		channelGroupList.push(new Group("channel-sidebar", "页面右下角 小按钮", sidebarItems));
	}
	const debounce = (fn, wait, immed = false) => {
		let timer = void 0;
		return function(...args) {
			if(timer === void 0 && immed) {
				fn.apply(this, args);
			}
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(this, args), wait);
			return timer;
		};
	};
	const bvidPattern = /(BV[1-9A-HJ-NP-Za-km-z]+)/;
	const matchBvid = (s) => {
		const match = bvidPattern.exec(s);
		if(match && match.length >= 2) {
			return match[1];
		}
		return null;
	};
	const avidbvidPattern = /(av\d+|BV[1-9A-HJ-NP-Za-km-z]+)/;
	const matchAvidBvid = (s) => {
		const match = avidbvidPattern.exec(s);
		if(match && match.length >= 2) {
			return match[1];
		}
		return null;
	};
	const hideEle = (ele) => {
		ele.style.setProperty("display", "none", "important");
	};
	const showEle = (ele) => {
		if(ele.style.display === "none") {
			ele.style.removeProperty("display");
		}
	};
	const isEleHide = (ele) => {
		return ele.style.display === "none";
	};
	const waitForEle = async (watchEle, selector, isTargetNode) => {
		if(!selector) {
			return null;
		}
		let ele = watchEle.querySelector(selector);
		if(ele) {
			return ele;
		}
		return await new Promise((resolve) => {
			const observer = new MutationObserver((mutationList) => {
				mutationList.forEach((mutation) => {
					if(mutation.addedNodes) {
						mutation.addedNodes.forEach((node) => {
							if(node instanceof HTMLElement && isTargetNode(node)) {
								observer.disconnect();
								ele = watchEle.querySelector(selector);
								resolve(ele);
							}
						});
					}
				});
			});
			observer.observe(watchEle, {
				childList: true,
				subtree: true
			});
		});
	};
	const homepageGroupList = [];
	if(isPageHomepage()) {
		const basicItems2 = [
			// 隐藏 横幅banner
			new CheckboxItem({
				itemID: "homepage-hide-banner",
				description: "隐藏 横幅banner",
				itemCSS: `.header-banner__inner, .bili-header__banner {
display: none !important;
}
.bili-header .bili-header__bar:not(.slide-down) {
position: relative !important;
box-shadow: 0 2px 4px #00000014;
}
.bili-header__channel {
margin-top: 5px !important;
}
/* icon和文字颜色 */
.bili-header .right-entry__outside .right-entry-icon {
color: #18191c !important;
}
.bili-header .left-entry .entry-title, .bili-header .left-entry .download-entry, .bili-header .left-entry .default-entry, .bili-header .left-entry .loc-entry {
color: #18191c !important;
}
.bili-header .left-entry .entry-title .zhuzhan-icon {
color: #00aeec !important;
}
.bili-header .right-entry__outside .right-entry-text {
color: #61666d !important;
}
/* header滚动后渐变出现, 否则闪动 */
#i_cecream .bili-header__bar.slide-down {
transition: background-color 0.3s ease-out, box-shadow 0.3s ease-out !important;
}
#i_cecream .bili-header__bar:not(.slide-down) {
transition: background-color 0.3s ease-out !important;
}
/* 分区菜单 第一排按钮的二级菜单下置  */
.v-popover.is-top {padding-top: 5px; padding-bottom: unset !important; bottom: unset !important;}
@media (min-width: 2200px) {.v-popover.is-top {top:32px;}}
@media (min-width: 1701px) and (max-width: 2199.9px) {.v-popover.is-top {top:32px;}}
@media (min-width: 1367px) and (max-width: 1700.9px) {.v-popover.is-top {top:28px;}}
@media (min-width: 1100px) and (max-width: 1366.9px) {.v-popover.is-top {top:28px;}}
@media (max-width: 1099.9px) {.v-popover.is-top {top:24px;}}
`
			}),
			// 隐藏 大图活动轮播, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-recommend-swipe",
				description: "隐藏 大图活动轮播",
				defaultStatus: true,
				itemCSS: `.recommended-swipe {
display: none !important;
}
/* 布局调整 */
.recommended-container_floor-aside .container>*:nth-of-type(5) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container>*:nth-of-type(6) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container>*:nth-of-type(7) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container>*:nth-of-type(n + 8) {
margin-top: 0 !important;
}
/* 完全展示10个推荐项 */
.recommended-container_floor-aside .container .feed-card:nth-of-type(n + 9) {
display: inherit !important;
}
.recommended-container_floor-aside .container.is-version8>*:nth-of-type(n + 13) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container .feed-card:nth-of-type(n + 12) {
display: inherit !important;
}
.recommended-container_floor-aside .container .floor-single-card:first-of-type {
margin-top: 0 !important;
}
/* 压缩分区栏高度, 压缩16px */
@media (max-width: 1099.9px) {.bili-header .bili-header__channel {height:84px!important}}
@media (min-width: 1100px) and (max-width: 1366.9px) {.bili-header .bili-header__channel {height:84px!important}}
@media (min-width: 1367px) and (max-width: 1700.9px) {.bili-header .bili-header__channel {height:94px!important}}
@media (min-width: 1701px) and (max-width: 2199.9px) {.bili-header .bili-header__channel {height:104px!important}}
@media (min-width: 2200px) {.bili-header .bili-header__channel {height:114px!important}}
`
			}),
			// 隐藏 整个分区栏
			new CheckboxItem({
				itemID: "homepage-hide-subarea",
				description: "隐藏 整个分区栏",
				// 高权限, 否则被压缩分区栏高度影响
				itemCSS: `#i_cecream .bili-header__channel .channel-icons {
display: none !important;
}
#i_cecream .bili-header__channel .right-channel-container {
display: none !important;
}
/* adapt bilibili-app-recommend */
#i_cecream .bili-header__channel {
height: 0 !important;
}
#i_cecream main.bili-feed4-layout:not(:has(.bilibili-app-recommend-root)) {
margin-top: 20px !important;
}`
			}),
			// 隐藏 滚动页面时 顶部吸附顶栏
			new CheckboxItem({
				itemID: "homepage-hide-sticky-header",
				description: "隐藏 滚动页面时 顶部吸附顶栏",
				itemCSS: `.bili-header .left-entry__title svg {
display: none !important;
}
/* 高优先覆盖!important */
#i_cecream .bili-feed4 .bili-header .slide-down {
box-shadow: unset !important;
}
#nav-searchform.is-actived:before,
#nav-searchform.is-exper:before,
#nav-searchform.is-exper:hover:before,
#nav-searchform.is-focus:before,
.bili-header .slide-down {
background: unset !important;
}
.bili-header .slide-down {
position: absolute !important;
top: 0;
animation: unset !important;
box-shadow: unset !important;
}
.bili-header .slide-down .left-entry {
margin-right: 30px !important;
}
.bili-header .slide-down .left-entry .default-entry,
.bili-header .slide-down .left-entry .download-entry,
.bili-header .slide-down .left-entry .entry-title,
.bili-header .slide-down .left-entry .entry-title .zhuzhan-icon,
.bili-header .slide-down .left-entry .loc-entry,
.bili-header .slide-down .left-entry .loc-mc-box__text,
.bili-header .slide-down .left-entry .mini-header__title,
.bili-header .slide-down .right-entry .right-entry__outside .right-entry-icon,
.bili-header .slide-down .right-entry .right-entry__outside .right-entry-text {
color: #fff !important;
}
.bili-header .slide-down .download-entry,
.bili-header .slide-down .loc-entry {
display: unset !important;
}
.bili-header .slide-down .center-search-container,
.bili-header .slide-down .center-search-container .center-search__bar {
margin: 0 auto !important;
}
/* 不可添加important, 否则与Evolved的黑暗模式冲突 */
#nav-searchform {
background: #f1f2f3;
}
#nav-searchform:hover {
background-color: var(--bg1) !important;
opacity: 1
}
#nav-searchform.is-focus {
border: 1px solid var(--line_regular) !important;
border-bottom: none !important;
background: var(--bg1) !important;
}
#nav-searchform.is-actived.is-exper4-actived,
#nav-searchform.is-focus.is-exper4-actived {
border-bottom: unset !important;
}
/* 只隐藏吸附header时的吸附分区栏 */
#i_cecream .header-channel {
top: 0 !important;
}
/* adapt bilibili-app-recommend */
.bilibili-app-recommend-root .area-header {
top: 0 !important;
}`
			}),
			// 隐藏 滚动页面时 顶部吸附分区栏
			new CheckboxItem({
				itemID: "homepage-hide-sticky-subarea",
				description: "隐藏 滚动页面时 顶部吸附分区栏",
				defaultStatus: true,
				itemCSS: `#i_cecream .header-channel {display: none !important;}
/* 吸附分区栏的动效转移给吸附header, 滚动后渐变出现 */
#i_cecream .bili-header__bar.slide-down {
transition: background-color 0.3s ease-out, box-shadow 0.3s ease-out !important;
}
#i_cecream .bili-header__bar:not(.slide-down) {
transition: background-color 0.3s ease-out;
}`
			}),
			// 隐藏 顶部adblock提示, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-adblock-tips",
				description: "隐藏 顶部adblock提示",
				defaultStatus: true,
				itemCSS: `.adblock-tips {display: none !important;}`
			}),
			// 恢复 原始动态按钮
			new CheckboxItem({
				itemID: "homepage-revert-channel-dynamic-icon",
				description: "恢复 原始动态按钮",
				itemCSS: `
.bili-header__channel .channel-icons .icon-bg__dynamic picture {
display: none !important;
}
.bili-header__channel .channel-icons .icon-bg__dynamic svg {
display: none !important;
}
.bili-header__channel .channel-icons .icon-bg__dynamic::after {
content: "";
width: 25px;
height: 25px;
background-image: url('data:image/svg+xml,<svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-bg--icon" data-v-674f5b07=""> <path d="M6.41659 15.625C3.88528 15.625 1.83325 13.7782 1.83325 11.5H10.9999C10.9999 13.7782 8.94789 15.625 6.41659 15.625Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15.125 16.0827C15.125 18.614 13.2782 20.666 11 20.666L11 11.4993C13.2782 11.4993 15.125 13.5514 15.125 16.0827Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6.875 6.91667C6.875 9.44797 8.72183 11.5 11 11.5L11 2.33333C8.72182 2.33333 6.875 4.38536 6.875 6.91667Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15.5833 7.375C13.052 7.375 11 9.22183 11 11.5H20.1667C20.1667 9.22183 18.1146 7.375 15.5833 7.375Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>');
background-size: contain;
background-repeat: no-repeat;
background-position: center;
}`
			}),
			// 修改 页面两侧边距
			new NumberItem({
				itemID: "homepage-layout-padding",
				description: "修改 页面两侧边距 (-1禁用)",
				defaultValue: -1,
				minValue: -1,
				maxValue: 500,
				disableValue: -1,
				unit: "px",
				itemCSS: `.bili-feed4-layout, .bili-feed4 .bili-header .bili-header__channel {padding: 0 ???px !important;}
.bili-feed4-layout, .bili-feed4 .bili-header .bili-header__channel {width: 100% !important;}`,
				itemCSSPlaceholder: "???"
			})
		];
		homepageGroupList.push(new Group("homepage-basic", "首页 基本功能", basicItems2));
		const layoutItems = [
			// 官方默认布局, 默认开启
			new RadioItem({
				itemID: "homepage-layout-default",
				description: "官方默认，自动匹配页面缩放",
				radioName: "homepage-layout-option",
				radioItemIDList: ["homepage-layout-default", "homepage-layout-4-column", "homepage-layout-5-column", "homepage-layout-6-column"],
				defaultStatus: true
			}),
			// 强制使用 4 列布局
			new RadioItem({
				itemID: "homepage-layout-4-column",
				description: "强制使用 4 列布局",
				radioName: "homepage-layout-option",
				radioItemIDList: ["homepage-layout-default", "homepage-layout-4-column", "homepage-layout-5-column", "homepage-layout-6-column"],
				itemCSS: `#i_cecream .recommended-container_floor-aside .container {
grid-template-columns: repeat(4,1fr) !important;
}`
			}),
			// 强制使用 5 列布局
			new RadioItem({
				itemID: "homepage-layout-5-column",
				description: "强制使用 5 列布局\n建议开启 增大视频信息字号",
				radioName: "homepage-layout-option",
				radioItemIDList: ["homepage-layout-default", "homepage-layout-4-column", "homepage-layout-5-column", "homepage-layout-6-column"],
				itemCSS: `#i_cecream .recommended-container_floor-aside .container {
grid-template-columns: repeat(5,1fr) !important;
}`
			}),
			// 强制使用 6 列布局
			new RadioItem({
				itemID: "homepage-layout-6-column",
				description: "强制使用 6 列布局\n建议 隐藏发布时间，可选 显示活动轮播",
				radioName: "homepage-layout-option",
				radioItemIDList: ["homepage-layout-default", "homepage-layout-4-column", "homepage-layout-5-column", "homepage-layout-6-column"],
				itemCSS: `#i_cecream .recommended-container_floor-aside .container {
grid-template-columns: repeat(6,1fr) !important;
}`
			})
		];
		homepageGroupList.push(new Group("homepage-layout", "页面强制布局 (单选)", layoutItems));
		const rcmdListItems = [
			// 增大 视频信息字号
			new CheckboxItem({
				itemID: "homepage-increase-rcmd-list-font-size",
				description: "增大 视频信息字号",
				itemCSS: `.bili-video-card .bili-video-card__info--tit,
.bili-live-card .bili-live-card__info--tit,
.single-card.floor-card .title {
font-size: 16px !important;
}
.bili-video-card .bili-video-card__info--bottom,
.floor-card .sub-title.sub-title {
font-size: 14px !important;
}
.bili-video-card__stats,
.bili-video-card__stats .bili-video-card__stats--left,
.bili-video-card__stats .bili-video-card__stats--right {
font-size: 14px !important;
}`
			}),
			// 隐藏 视频负反馈 恢复标题宽度
			new CheckboxItem({
				itemID: "homepage-hide-no-interest",
				description: "隐藏 视频负反馈 恢复标题宽度",
				itemCSS: `.bili-video-card.enable-no-interest, .bili-live-card.enable-no-interest {--title-padding-right: 0;}
.bili-video-card__info--no-interest, .bili-live-card__info--no-interest {display: none !important;}`
			}),
			// 隐藏 视频tag (已关注/1万点赞)
			new CheckboxItem({
				itemID: "homepage-hide-up-info-icon",
				description: "隐藏 视频tag (已关注/1万点赞)",
				itemCSS: `/* CSS伪造Logo */
.bili-video-card .bili-video-card__info--icon-text {
width: 17px;
height: 17px;
color: transparent !important;
background-color: unset !important;
border-radius: unset !important;
margin: 0 2px 0 0 !important;
font-size: 0 !important;
line-height: unset !important;
padding: unset !important;
user-select: none !important;
}
.bili-video-card .bili-video-card__info--icon-text::before {
content: "";
display: inline-block;
width: 100%;
height: 100%;
background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" class="bili-video-card__info--owner__up"><!--[--><path d="M6.15 8.24805C6.5642 8.24805 6.9 8.58383 6.9 8.99805L6.9 12.7741C6.9 13.5881 7.55988 14.248 8.3739 14.248C9.18791 14.248 9.8478 13.5881 9.8478 12.7741L9.8478 8.99805C9.8478 8.58383 10.1836 8.24805 10.5978 8.24805C11.012 8.24805 11.3478 8.58383 11.3478 8.99805L11.3478 12.7741C11.3478 14.41655 10.01635 15.748 8.3739 15.748C6.73146 15.748 5.4 14.41655 5.4 12.7741L5.4 8.99805C5.4 8.58383 5.73578 8.24805 6.15 8.24805z" fill="rgb(148, 153, 160)"></path><path d="M12.6522 8.99805C12.6522 8.58383 12.98795 8.24805 13.4022 8.24805L15.725 8.24805C17.31285 8.24805 18.6 9.53522 18.6 11.123C18.6 12.71085 17.31285 13.998 15.725 13.998L14.1522 13.998L14.1522 14.998C14.1522 15.4122 13.8164 15.748 13.4022 15.748C12.98795 15.748 12.6522 15.4122 12.6522 14.998L12.6522 8.99805zM14.1522 12.498L15.725 12.498C16.4844 12.498 17.1 11.8824 17.1 11.123C17.1 10.36365 16.4844 9.74804 15.725 9.74804L14.1522 9.74804L14.1522 12.498z" fill="rgb(148, 153, 160)"></path><path d="M12 4.99805C9.48178 4.99805 7.283 5.12616 5.73089 5.25202C4.65221 5.33949 3.81611 6.16352 3.72 7.23254C3.60607 8.4998 3.5 10.171 3.5 11.998C3.5 13.8251 3.60607 15.4963 3.72 16.76355C3.81611 17.83255 4.65221 18.6566 5.73089 18.7441C7.283 18.8699 9.48178 18.998 12 18.998C14.5185 18.998 16.7174 18.8699 18.2696 18.74405C19.3481 18.65655 20.184 17.8328 20.2801 16.76405C20.394 15.4973 20.5 13.82645 20.5 11.998C20.5 10.16965 20.394 8.49877 20.2801 7.23205C20.184 6.1633 19.3481 5.33952 18.2696 5.25205C16.7174 5.12618 14.5185 4.99805 12 4.99805zM5.60965 3.75693C7.19232 3.62859 9.43258 3.49805 12 3.49805C14.5677 3.49805 16.8081 3.62861 18.3908 3.75696C20.1881 3.90272 21.6118 5.29278 21.7741 7.09773C21.8909 8.3969 22 10.11405 22 11.998C22 13.88205 21.8909 15.5992 21.7741 16.8984C21.6118 18.7033 20.1881 20.09335 18.3908 20.23915C16.8081 20.3675 14.5677 20.498 12 20.498C9.43258 20.498 7.19232 20.3675 5.60965 20.2392C3.81206 20.0934 2.38831 18.70295 2.22603 16.8979C2.10918 15.5982 2 13.8808 2 11.998C2 10.1153 2.10918 8.39787 2.22603 7.09823C2.38831 5.29312 3.81206 3.90269 5.60965 3.75693z" fill="rgb(148, 153, 160)"></path><!--]--></svg>');
background-size: contain;
background-repeat: no-repeat;
background-position: center;
}`
			}),
			// 隐藏 发布时间
			new CheckboxItem({
				itemID: "homepage-hide-video-info-date",
				description: "隐藏 发布时间",
				itemCSS: `main:not(:has(.bilibili-app-recommend-root)) .bili-video-card__info--date {display: none !important;}`
			}),
			// 隐藏 弹幕数, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-danmaku-count",
				description: "隐藏 弹幕数",
				defaultStatus: true,
				itemCSS: `main:not(:has(.bilibili-app-recommend-root)) .bili-video-card__stats--item:nth-child(2) {display: none !important;}`
			}),
			// 隐藏 稍后再看提示语
			new CheckboxItem({
				itemID: "homepage-hide-bili-watch-later-tip",
				description: "隐藏 稍后再看提示语",
				itemCSS: `.bili-watch-later__tip--lab {display: none !important;}`
			}),
			// 隐藏 稍后再看按钮
			new CheckboxItem({
				itemID: "homepage-hide-bili-watch-later",
				description: "隐藏 稍后再看按钮",
				itemCSS: `.bili-watch-later {display: none !important;}`
			}),
			// 隐藏 视频预览中的弹幕
			new CheckboxItem({
				itemID: "homepage-hide-inline-player-danmaku",
				description: "隐藏 视频预览中的弹幕",
				itemCSS: `.bpx-player-row-dm-wrap, .bpx-player-cmd-dm-wrap {display: none !important;}`
			}),
			// 隐藏 广告, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-ad-card",
				description: "隐藏 广告",
				defaultStatus: true,
				itemCSS: `
:is(.feed-card, .bili-video-card.is-rcmd):has(.bili-video-card__info--ad, [href*="cm.bilibili.com"], .bili-video-card__info--creative-ad) {
display: none !important;
}
:is(.feed-card, .bili-video-card.is-rcmd):not(:has(.bili-video-card__wrap, .bili-video-card__skeleton)) {
display: none !important;
}
/* 布局调整 */
.recommended-container_floor-aside .container>*:nth-of-type(5) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container>*:nth-of-type(6) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container>*:nth-of-type(7) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container>*:nth-of-type(n + 8) {
margin-top: 0 !important;
}
/* 完全展示10个推荐项 */
.recommended-container_floor-aside .container .feed-card:nth-of-type(n + 9) {
display: inherit !important;
}
.recommended-container_floor-aside .container.is-version8>*:nth-of-type(n + 13) {
margin-top: 0 !important;
}
.recommended-container_floor-aside .container .feed-card:nth-of-type(n + 12) {
display: inherit !important;
}
.recommended-container_floor-aside .container .floor-single-card:first-of-type {
margin-top: 0 !important;
}`
			}),
			// 隐藏 直播间推荐
			new CheckboxItem({
				itemID: "homepage-hide-live-card-recommend",
				description: "隐藏 直播间推荐",
				itemCSS: `.bili-live-card.is-rcmd {display: none !important;}`
			}),
			// 精简 分区视频推荐, 默认开启
			new CheckboxItem({
				itemID: "homepage-simple-sub-area-card-recommend",
				description: "简化 分区视频推荐",
				defaultStatus: true,
				itemCSS: `.floor-single-card .layer {display: none !important;}
.floor-single-card .floor-card {box-shadow: unset !important; border: none !important;}
.single-card.floor-card .floor-card-inner:hover {background: none !important;}`
			}),
			// 隐藏 分区视频推荐
			new CheckboxItem({
				itemID: "homepage-hide-sub-area-card-recommend",
				description: "隐藏 分区视频推荐",
				// 含skeleton时不隐藏否则出现空档
				itemCSS: `.floor-single-card:not(:has(.skeleton, .skeleton-item)) {display: none !important;}`
			}),
			// 关闭 视频载入 骨架动效(skeleton animation)
			new CheckboxItem({
				itemID: "homepage-hide-skeleton-animation",
				description: "关闭 视频载入 骨架动效",
				itemCSS: `.bili-video-card .loading_animation .bili-video-card__skeleton--light,
.bili-video-card .loading_animation .bili-video-card__skeleton--text,
.bili-video-card .loading_animation .bili-video-card__skeleton--face,
.bili-video-card .loading_animation .bili-video-card__skeleton--cover {
animation: none !important;
}
.skeleton .skeleton-item {
animation: none !important;
}
.floor-skeleton .skeleton-item {
animation: none !important;
}`
			}),
			// 隐藏 视频载入 骨架(skeleton)
			new CheckboxItem({
				itemID: "homepage-hide-skeleton",
				description: "隐藏 视频载入 骨架",
				// anchor占位也隐藏
				itemCSS: `.bili-video-card:has(.loading_animation), .load-more-anchor {
visibility: hidden;
}
.floor-single-card:has(.skeleton, .skeleton-item) {
visibility: hidden;
}`
			}),
			// 增大 视频载入 视频数量
			new CheckboxItem({
				itemID: "homepage-increase-rcmd-load-size",
				description: "增大 视频载入 视频数量 (实验功能)",
				itemCSS: `
/* 扩增载入后会产生奇怪的骨架空位 */
.container.is-version8 > .floor-single-card:has(.skeleton, .skeleton-item, .floor-skeleton) {
display: none;
}`,
				enableFunc: async () => {
					const origFetch = _unsafeWindow.fetch;
					_unsafeWindow.fetch = (input, init2) => {
						var _a;
						if(typeof input === "string" && input.includes("api.bilibili.com") && input.includes("feed/rcmd") && ((_a = init2 == null ? void 0 : init2.method) == null ? void 0 : _a.toUpperCase()) === "GET") {
							input = input.replace("&ps=12&", "&ps=24&");
						}
						return origFetch(input, init2);
					};
				}
			}),
			// 启用 预加载下一屏
			new CheckboxItem({
				itemID: "homepage-rcmd-video-preload",
				description: "启用 预加载下一屏 (实验功能)\n需开启 隐藏分区视频推荐",
				itemCSS: `
.load-more-anchor.preload {
position: fixed;
z-index: -99999;
visibility: hidden;
opacity: 0;
top: 0;
left: 0;
}
`,
				enableFunc: async () => {
					waitForEle(document.body, ".load-more-anchor", (node) => {
						return node.className === "load-more-anchor";
					}).then((anchor) => {
						if(!anchor) {
							return;
						}
						const fireRcmdLoad = () => {
							const firstSkeleton = document.querySelector(".bili-video-card:has(.bili-video-card__skeleton:not(.hide)):has(~ .load-more-anchor)");
							if(!firstSkeleton || firstSkeleton.getBoundingClientRect().top > innerHeight * 2) {
								return;
							}
							anchor.classList.add("preload");
							new Promise((resolve) => {
								const id = setInterval(() => {
									const firstSkeleton2 = document.querySelector(".bili-video-card:has(.bili-video-card__skeleton:not(.hide)):has(~ .load-more-anchor)");
									if(!firstSkeleton2) {
										clearInterval(id);
										resolve();
									}
									if(firstSkeleton2.getBoundingClientRect().top < innerHeight * 2) {
										new Promise((resolve2) => setTimeout(resolve2, 20)).then(() => {
											window.dispatchEvent(new Event("scroll"));
										});
									} else {
										clearInterval(id);
										resolve();
									}
								}, 200);
							}).then(() => {
								anchor.classList.remove("preload");
							});
						};
						fireRcmdLoad();
						const debounceFireRcmdLoad = debounce(fireRcmdLoad, 250, true);
						window.addEventListener("wheel", (e) => {
							if(e.deltaY > 0) {
								debounceFireRcmdLoad();
							}
						});
					});
				},
				enableFuncRunAt: "document-end"
			})
		];
		homepageGroupList.push(new Group("homepage-rcmd-list", "视频列表", rcmdListItems));
		const sidebarItems = [
			// 隐藏 下载桌面端弹窗, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-desktop-download-tip",
				description: "隐藏 下载桌面端弹窗",
				defaultStatus: true,
				itemCSS: `.desktop-download-tip {display: none !important;}`
			}),
			// 隐藏 下滑浏览推荐提示, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-trial-feed-wrap",
				description: "隐藏 下滑浏览推荐提示",
				defaultStatus: true,
				itemCSS: `.trial-feed-wrap {display: none !important;}`
			}),
			// 隐藏 换一换
			new CheckboxItem({
				itemID: "homepage-hide-feed-roll-btn",
				description: "隐藏 换一换",
				itemCSS: `.feed-roll-btn {display: none !important;}`
			}),
			// 隐藏 稍后再看
			new CheckboxItem({
				itemID: "homepage-hide-watchlater-pip-button",
				description: "隐藏 稍后再看",
				itemCSS: `.watchlater-pip-button {display: none !important;}`
			}),
			// 隐藏 刷新
			new CheckboxItem({
				itemID: "homepage-hide-flexible-roll-btn",
				description: "隐藏 刷新",
				itemCSS: `.palette-button-wrap .flexible-roll-btn {display: none !important;}`
			}),
			// 隐藏 客服和反馈, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-feedback",
				description: "隐藏 客服和反馈",
				defaultStatus: true,
				itemCSS: `.palette-button-wrap .storage-box {display: none !important;}`
			}),
			// 隐藏 回顶部
			new CheckboxItem({
				itemID: "homepage-hide-top-btn",
				description: "隐藏 回顶部",
				itemCSS: `.palette-button-wrap .top-btn-wrap {display: none !important;}`
			})
		];
		homepageGroupList.push(new Group("homepage-sidebar", "页面侧栏 小组件", sidebarItems));
		const biliAppRcmdItems = [
			// 适配bilibili-app-recommend插件
			// 隐藏 视频tag (bilibili-app-recommend)
			new CheckboxItem({
				itemID: "homepage-hide-up-info-icon-bilibili-app-recommend",
				description: "隐藏 视频tag",
				itemCSS: `/* adapt bilibili-app-recommend */
.bilibili-app-recommend-root .bili-video-card:not(:has(.ant-avatar)) .bili-video-card__info--owner>span[class^="_recommend-reason"] {
width: 17px;
height: 17px;
color: transparent !important;
background-color: unset !important;
border-radius: unset !important;
margin: 0 2px 0 0 !important;
font-size: unset !important;
line-height: unset !important;
padding: unset !important;
user-select: none !important;
}
.bilibili-app-recommend-root .bili-video-card:not(:has(.ant-avatar)) .bili-video-card__info--owner>span[class^="_recommend-reason"]::before {
content: "";
display: inline-block;
width: 100%;
height: 100%;
background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" class="bili-video-card__info--owner__up"><!--[--><path d="M6.15 8.24805C6.5642 8.24805 6.9 8.58383 6.9 8.99805L6.9 12.7741C6.9 13.5881 7.55988 14.248 8.3739 14.248C9.18791 14.248 9.8478 13.5881 9.8478 12.7741L9.8478 8.99805C9.8478 8.58383 10.1836 8.24805 10.5978 8.24805C11.012 8.24805 11.3478 8.58383 11.3478 8.99805L11.3478 12.7741C11.3478 14.41655 10.01635 15.748 8.3739 15.748C6.73146 15.748 5.4 14.41655 5.4 12.7741L5.4 8.99805C5.4 8.58383 5.73578 8.24805 6.15 8.24805z" fill="rgb(148, 153, 160)"></path><path d="M12.6522 8.99805C12.6522 8.58383 12.98795 8.24805 13.4022 8.24805L15.725 8.24805C17.31285 8.24805 18.6 9.53522 18.6 11.123C18.6 12.71085 17.31285 13.998 15.725 13.998L14.1522 13.998L14.1522 14.998C14.1522 15.4122 13.8164 15.748 13.4022 15.748C12.98795 15.748 12.6522 15.4122 12.6522 14.998L12.6522 8.99805zM14.1522 12.498L15.725 12.498C16.4844 12.498 17.1 11.8824 17.1 11.123C17.1 10.36365 16.4844 9.74804 15.725 9.74804L14.1522 9.74804L14.1522 12.498z" fill="rgb(148, 153, 160)"></path><path d="M12 4.99805C9.48178 4.99805 7.283 5.12616 5.73089 5.25202C4.65221 5.33949 3.81611 6.16352 3.72 7.23254C3.60607 8.4998 3.5 10.171 3.5 11.998C3.5 13.8251 3.60607 15.4963 3.72 16.76355C3.81611 17.83255 4.65221 18.6566 5.73089 18.7441C7.283 18.8699 9.48178 18.998 12 18.998C14.5185 18.998 16.7174 18.8699 18.2696 18.74405C19.3481 18.65655 20.184 17.8328 20.2801 16.76405C20.394 15.4973 20.5 13.82645 20.5 11.998C20.5 10.16965 20.394 8.49877 20.2801 7.23205C20.184 6.1633 19.3481 5.33952 18.2696 5.25205C16.7174 5.12618 14.5185 4.99805 12 4.99805zM5.60965 3.75693C7.19232 3.62859 9.43258 3.49805 12 3.49805C14.5677 3.49805 16.8081 3.62861 18.3908 3.75696C20.1881 3.90272 21.6118 5.29278 21.7741 7.09773C21.8909 8.3969 22 10.11405 22 11.998C22 13.88205 21.8909 15.5992 21.7741 16.8984C21.6118 18.7033 20.1881 20.09335 18.3908 20.23915C16.8081 20.3675 14.5677 20.498 12 20.498C9.43258 20.498 7.19232 20.3675 5.60965 20.2392C3.81206 20.0934 2.38831 18.70295 2.22603 16.8979C2.10918 15.5982 2 13.8808 2 11.998C2 10.1153 2.10918 8.39787 2.22603 7.09823C2.38831 5.29312 3.81206 3.90269 5.60965 3.75693z" fill="rgb(148, 153, 160)"></path><!--]--></svg>');
background-size: contain;
background-repeat: no-repeat;
background-position: center;
}
.bilibili-app-recommend-root .bili-video-card:has(.ant-avatar) [class^="_recommend-reason"] {
display: none !important;
}`
			}),
			// 隐藏 弹幕数 (bilibili-app-recommend)
			new CheckboxItem({
				itemID: "homepage-hide-danmaku-count-bilibili-app-recommend",
				description: "隐藏 弹幕数",
				itemCSS: `.bili-video-card:has(use) .bili-video-card__stats--item:has([href="#widget-video-danmaku"]) {display: none !important;}`
			}),
			// 隐藏 点赞数 (bilibili-app-recommend)
			new CheckboxItem({
				itemID: "homepage-hide-agree-count-bilibili-app-recommend",
				description: "隐藏 点赞数",
				itemCSS: `.bili-video-card:has(use) .bili-video-card__stats--item:has([href="#widget-agree"]) {display: none !important;}`
			})
		];
		homepageGroupList.push(new Group("homepage-bili-app-rcmd", "适配插件[bilibili-app-recommend]", biliAppRcmdItems));
	}
	class URLCleaner {
		constructor() {
			__publicField(this, "origReplaceState", _unsafeWindow.history.replaceState);
			__publicField(this, "origPushState", _unsafeWindow.history.pushState);
			// URL清理函数
			__publicField(this, "cleanFnArr", []);
			try {
				this.hijack();
			} catch (err) {
				error("init URLCleaner error", err);
			}
		}
		hijack() {
			_unsafeWindow.history.replaceState = (data, unused, url) => {
				try {
					if(typeof url === "string") {
						if(!url.startsWith(location.origin) && !url.startsWith(location.hostname)) {
							url = `${location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
						}
						const cleanURL = this.cleanFnArr.reduce((curr, fn) => fn(curr), url);
						if(location.href.endsWith(cleanURL)) {
							return;
						}
						return this.origReplaceState.apply(_unsafeWindow.history, [data, unused, cleanURL]);
					}
					return this.origReplaceState.apply(_unsafeWindow.history, [data, unused, url]);
				} catch (err) {
					error("URLCleaner replaceState error", err);
					return this.origReplaceState.apply(_unsafeWindow.history, [data, unused, url]);
				}
			};
			_unsafeWindow.history.pushState = (data, unused, url) => {
				try {
					if(typeof url === "string") {
						if(!url.startsWith(location.origin) && !url.startsWith(location.hostname)) {
							url = `${location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
						}
						const cleanURL = this.cleanFnArr.reduce((curr, fn) => fn(curr), url);
						if(location.href.endsWith(cleanURL)) {
							return;
						}
						return this.origPushState.apply(_unsafeWindow.history, [data, unused, cleanURL]);
					}
					return this.origPushState.apply(_unsafeWindow.history, [data, unused, url]);
				} catch (err) {
					error("URLCleaner pushState error", err);
					return this.origReplaceState.apply(_unsafeWindow.history, [data, unused, url]);
				}
			};
		}
		clean() {
			try {
				const cleanURL = this.cleanFnArr.reduce((curr, fn) => fn(curr), location.href);
				if(location.href !== cleanURL) {
					this.origReplaceState.apply(_unsafeWindow.history, [null, "", cleanURL]);
				}
			} catch (err) {
				error("init URLCleaner error", err);
			}
		}
	}
	const URLCleanerInstance = new URLCleaner();
	const commonGroupList = [];
	let borderRadiusCSS = "";
	if(isPageDynamic()) {
		borderRadiusCSS = `
#nav-searchform,
.nav-search-content,
.header-upload-entry,
.v-popover-content,
.van-popover,
.v-popover-wrap,
.v-popover,
.topic-panel,
.bili-header .header-upload-entry,
.bili-dyn-up-list,
.bili-dyn-publishing,
.bili-dyn-publishing__action,
.bili-dyn-sidebar *,
.bili-dyn-up-list__window,
.bili-dyn-live-users,
.bili-dyn-topic-box,
.bili-dyn-list-notification,
.bili-dyn-item,
.bili-dyn-banner,
.bili-dyn-banner__img,
.bili-dyn-my-info,
.bili-dyn-card-video,
.bili-dyn-list-tabs,
.bili-album__preview__picture__gif,
.bili-album__preview__picture__img {
border-radius: 3px !important;
}
.bili-dyn-card-video__cover__mask,
.bili-dyn-card-video__cover {
border-radius: 3px 0 0 3px !important;
}
.bili-dyn-card-video__body {
border-radius: 0 3px 3px 0 !important;
}`;
	} else if(isPageLiveRoom()) {
		borderRadiusCSS = `
#nav-searchform,
#player-ctnr,
.nav-search-content,
.header-upload-entry,
.v-popover-content,
.van-popover,
.v-popover-wrap,
.v-popover,
.aside-area,
.lower-row .right-ctnr *,
.panel-main-ctnr,
.startlive-btn,
.flip-view,
.content-wrapper,
.chat-input-ctnr,
.announcement-cntr,
.bl-button--primary {
border-radius: 3px !important;
}
#rank-list-vm,
.head-info-section {
border-radius: 3px 3px 0 0 !important;
}
.gift-control-section {
border-radius: 0 0 3px 3px !important;
}
.follow-ctnr .right-part {
border-radius: 0 3px 3px 0 !important;
}
.chat-control-panel {
border-radius: 0 0 3px 3px !important;
}
.follow-ctnr .left-part,
#rank-list-ctnr-box.bgStyle {
border-radius: 3px 0 0 3px !important;
}`;
	} else if(isPageSearch()) {
		borderRadiusCSS = `
#nav-searchform,
.nav-search-content,
.v-popover-content,
.van-popover,
.v-popover-wrap,
.v-popover,
.search-sticky-header *,
.vui_button,
.header-upload-entry,
.search-input-wrap *,
.search-input-container .search-input-wrap,
.bili-video-card__cover {
border-radius: 3px !important;
}`;
	} else {
		if(isPageVideo() || isPagePlaylist()) {
			borderRadiusCSS = `
#nav-searchform,
.nav-search-content,
.v-popover-content,
.van-popover,
.v-popover,
.pic-box,
.action-list-container,
.actionlist-item-inner .main .cover,
.recommend-video-card .card-box .pic-box,
.recommend-video-card .card-box .pic-box .rcmd-cover .rcmd-cover-img .b-img__inner img,
.actionlist-item-inner .main .cover .cover-img .b-img__inner img,
.card-box .pic-box .pic,
.bui-collapse-header,
.base-video-sections-v1,
.bili-header .search-panel,
.bili-header .header-upload-entry,
.bpx-player-container .bpx-player-sending-bar .bpx-player-video-inputbar,
.video-tag-container .tag-panel .tag-link,
.video-tag-container .tag-panel .show-more-btn,
.vcd .cover img,
.vcd *,
.upinfo-btn-panel *,
.fixed-sidenav-storage div,
.fixed-sidenav-storage a,
.reply-box-textarea,
.reply-box-send,
.reply-box-send:after {
border-radius: 3px !important;
}
.bpx-player-container .bpx-player-sending-bar .bpx-player-video-inputbar .bpx-player-dm-btn-send,
.bpx-player-container .bpx-player-sending-bar .bpx-player-video-inputbar-wrap {
border-radius: 0 3px 3px 0 !important;
}
.bpx-player-dm-btn-send .bui-button {
border-radius: 3px 0 0 3px !important;
}`;
		} else if(isPageBangumi()) {
			borderRadiusCSS = `
a[class^="mediainfo_mediaCover"],
a[class^="mediainfo_btnHome"],
[class^="follow_btnFollow"],
[class^="vipPaybar_textWrap__QARKv"],
[class^="eplist_ep_list_wrapper"],
[class^="RecommendItem_cover"],
[class^="imageListItem_wrap"] [class^="imageListItem_coverWrap"],
[class^="navTools_navMenu"] > *,
[class^="navTools_item"],
#nav-searchform,
.nav-search-content,
.v-popover-content,
.van-popover,
.v-popover,
.pic-box,
.card-box .pic-box .pic,
.bui-collapse-header,
.base-video-sections-v1,
.bili-header .search-panel,
.bili-header .header-upload-entry,
.bpx-player-container .bpx-player-sending-bar .bpx-player-video-inputbar,
.video-tag-container .tag-panel .tag-link,
.video-tag-container .tag-panel .show-more-btn,
.vcd .cover img,
.vcd *,
.upinfo-btn-panel *,
.fixed-sidenav-storage div,
.reply-box-textarea,
.reply-box-send,
.reply-box-send:after {
border-radius: 3px !important;
}
.bpx-player-container .bpx-player-sending-bar .bpx-player-video-inputbar .bpx-player-dm-btn-send,
.bpx-player-container .bpx-player-sending-bar .bpx-player-video-inputbar-wrap {
border-radius: 0 3px 3px 0 !important;
}
.bpx-player-dm-btn-send .bui-button {
border-radius: 3px 0 0 3px !important;
}`;
		} else if(isPageHomepage()) {
			borderRadiusCSS = `
#nav-searchform,
.nav-search-content,
.history-item,
.header-upload-entry,
.bili-header .search-panel,
.bili-header .header-upload-entry,
.bili-header__channel .channel-link,
.channel-entry-more__link,
.header-channel-fixed-right-item,
.recommended-swipe-body,
.bili-video-card .bili-video-card__cover,
.bili-video-card .bili-video-card__image,
.bili-video-card .bili-video-card__info--icon-text,
.bili-live-card,
.floor-card,
.floor-card .badge,
.single-card.floor-card .floor-card-inner,
.single-card.floor-card .cover-container,
.primary-btn,
.flexible-roll-btn,
.palette-button-wrap .flexible-roll-btn-inner,
.palette-button-wrap .storage-box,
.palette-button-wrap,
.v-popover-content {
border-radius: 3px !important;
}
.bili-video-card__stats {
border-bottom-left-radius: 3px !important;
border-bottom-right-radius: 3px !important;
}
.floor-card .layer {
display: none !important;
}
.single-card.floor-card {
border: none !important;
}`;
		} else if(isPagePopular()) {
			borderRadiusCSS = `
#nav-searchform,
.nav-search-content,
.v-popover-content,
.van-popover,
.v-popover,
.bili-header .search-panel,
.bili-header .header-upload-entry,
.upinfo-btn-panel *,
.rank-list .rank-item > .content > .img,
.card-list .video-card .video-card__content, .video-list .video-card .video-card__content,
.fixed-sidenav-storage div,
.fixed-sidenav-storage a {
border-radius: 3px !important;
}`;
		} else if(isPageChannel()) {
			borderRadiusCSS = `
#nav-searchform,
.nav-search-content,
.history-item,
.header-upload-entry,
.bili-header .search-panel,
.bili-header .header-upload-entry,
.bili-header__channel .channel-link,
.channel-entry-more__link,
.header-channel-fixed-right-item,
.recommended-swipe-body,
.bili-video-card .bili-video-card__cover,
.bili-video-card .bili-video-card__image,
.bili-video-card .bili-video-card__info--icon-text,
.bili-live-card,
.floor-card,
.floor-card .badge,
.single-card.floor-card .floor-card-inner,
.single-card.floor-card .cover-container,
.primary-btn,
.flexible-roll-btn,
.palette-button-wrap .flexible-roll-btn-inner,
.palette-button-wrap .storage-box,
.palette-button-wrap,
.v-popover-content {
border-radius: 3px !important;
}
.bili-video-card__stats {
border-bottom-left-radius: 3px !important;
border-bottom-right-radius: 3px !important;
}
.floor-card .layer {
display: none !important;
}
.single-card.floor-card {
border: none !important;
}`;
		}
	}
	const basicItems = [
		new CheckboxItem({
			itemID: "border-radius",
			description: "页面直角化，去除圆角",
			itemCSS: borderRadiusCSS
		}),
		// 滚动条美化, 默认开启
		new CheckboxItem({
			itemID: "beauty-scrollbar",
			description: "美化页面滚动条",
			defaultStatus: true,
			itemCSS: `
/* WebKit and Chrome
Chrome 121+支持sidebar新属性，但难看，继续用webkit
https://developer.chrome.com/docs/css-ui/scrollbar-styling
*/
::-webkit-scrollbar {
width: 8px !important;
height: 8px !important;
background: transparent !important;
}
::-webkit-scrollbar:hover {
background: rgba(128, 128, 128, 0.4) !important;
}
::-webkit-scrollbar-thumb {
border: 1px solid rgba(255, 255, 255, 0.4) !important;
background-color: rgba(0, 0, 0, 0.4) !important;
z-index: 2147483647;
-webkit-border-radius: 8px !important;
background-clip: content-box !important;
}
::-webkit-scrollbar-thumb:hover {
background-color: rgba(0, 0, 0, 0.8) !important;
}
::-webkit-scrollbar-thumb:active {
background-color: rgba(0, 0, 0, 0.6) !important;
}
/* Firefox */
@-moz-document url-prefix() {
* {
scrollbar-color: rgba(0, 0, 0, 0.6) transparent !important;
scrollbar-width: thin;
}
}`
		}),
		// URL参数净化, 默认开启
		new CheckboxItem({
			itemID: "url-cleaner",
			description: "URL参数净化 (充电时需关闭)",
			defaultStatus: true,
			/**
			 * URL净化，移除query string中的跟踪参数/无用参数
			 * 净化掉vd_source参数会导致充电窗口载入失败
			 */
			enableFunc: async () => {
				const cleanParams = (url) => {
					try {
						if(url.match(/live\.bilibili\.com\/(p\/html|activity|blackboard)/)) {
							return url;
						}
						const keysToRemove = /* @__PURE__ */ new Set(["from_source", "spm_id_from", "search_source", "vd_source", "unique_k", "is_story_h5", "from_spmid", "share_plat", "share_medium", "share_from", "share_source", "share_tag", "up_id", "timestamp", "mid", "live_from", "launch_id", "session_id", "share_session_id", "broadcast_type", "is_room_feed", "spmid", "plat_id", "goto", "report_flow_data", "trackid", "live_form", "track_id", "from", "visit_id", "extra_jump_from"]);
						if(isPageSearch()) {
							keysToRemove.add("vt");
						}
						if(isPageLiveRoom()) {
							keysToRemove.add("bbid");
							keysToRemove.add("ts");
							keysToRemove.add("hotRank");
							keysToRemove.add("popular_rank");
						}
						const urlObj = new URL(url);
						const params = new URLSearchParams(urlObj.search);
						const temp = [];
						for(const k of params.keys()) {
							keysToRemove.has(k) && temp.push(k);
						}
						for(const k of temp) {
							params.delete(k);
						}
						params.get("p") === "1" && params.delete("p");
						urlObj.search = params.toString().replace(/\/$/, "");
						return urlObj.toString();
					} catch (err) {
						return url;
					}
				};
				URLCleanerInstance.cleanFnArr.push(cleanParams);
				URLCleanerInstance.clean();
			}
		}),
		// 隐藏页底 footer
		new CheckboxItem({
			itemID: "hide-footer",
			description: "隐藏 页底footer",
			itemCSS: `.international-footer, #biliMainFooter, .biliMainFooterWrapper, .link-footer-ctnr {display: none !important;}`
		})
	];
	commonGroupList.push(new Group("common-basic", "全站通用项 基本功能", basicItems));
	if(!isPageLiveHome()) {
		const headerLeftItems = [
			// 隐藏 主站Logo
			new CheckboxItem({
				itemID: "common-hide-nav-homepage-logo",
				description: "隐藏 主站Logo",
				itemCSS: `.bili-header__bar .left-entry li:has(>a[href="//www.bilibili.com"]) .left-entry__title>svg {
display: none !important;
}
/* 首页版本 */
.bili-header__bar .left-entry .zhuzhan-icon {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>span>a[href="//www.bilibili.com"], >span>a[href="www.bilibili.com/"]) .navbar_logo {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap a[href="https://www.bilibili.com/"]>svg {
display: none !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntryTitle__"] > svg {
display: none !important;
}`
			}),
			// 隐藏 首页
			new CheckboxItem({
				itemID: "common-hide-nav-homepage",
				description: "隐藏 首页",
				itemCSS: `
.bili-header__bar .left-entry .mini-header__title {
display: none !important;
}
/* 首页版本 */
.bili-header__bar .left-entry .zhuzhan-icon + span {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>span>a[href="//www.bilibili.com"]) :not(svg) {
color: transparent;
user-select: none;
}
#internationalHeader li.nav-link-item:has(>span>a[href="//www.bilibili.com"]) .navbar_pullup {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap a[href="https://www.bilibili.com/"] .mini-header__title {
display: none !important;
}
#biliMainHeader .bili-header .left-entry__title .mini-header__logo {
margin-right: 0 !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntryTitle__"] > div {
display: none !important;
}`
			}),
			// 隐藏 分区弹出框
			new CheckboxItem({
				itemID: "common-hide-nav-channel-panel-popover",
				description: "隐藏 分区弹出框",
				itemCSS: `.bili-header .left-entry .bili-header-channel-panel {display: none !important;}
.bili-header .left-entry .mini-header__title .mini-header__arrow {display: none !important;}`
			}),
			// 隐藏 番剧
			new CheckboxItem({
				itemID: "common-hide-nav-anime",
				description: "隐藏 番剧",
				itemCSS: `.bili-header__bar .left-entry li:has(.default-entry[href="//www.bilibili.com/anime/"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>a[href*="bilibili.com/anime"]) {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="bilibili.com/anime"]) {
display: none !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntry__"] li:has(a[href*="bilibili.com/anime"]){
display: none !important;
}`
			}),
			// 隐藏 番剧弹出框
			new CheckboxItem({
				itemID: "common-hide-nav-anime-popover",
				description: "隐藏 番剧弹出框",
				itemCSS: `.bili-header__bar .left-entry .default-entry[href*="//www.bilibili.com/anime/"] + .v-popover {
display: none !important;
}`
			}),
			// 隐藏 直播
			new CheckboxItem({
				itemID: "common-hide-nav-live",
				description: "隐藏 直播",
				itemCSS: `.bili-header__bar .left-entry li:has(.default-entry[href="//live.bilibili.com"], .default-entry[href="//live.bilibili.com/"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>span>a[href*="live.bilibili.com"]) {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="live.bilibili.com"]) {
display: none !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntry__"] li:has(a[href*="live.bilibili.com"]){
display: none !important;
}`
			}),
			// 隐藏 直播弹出框
			new CheckboxItem({
				itemID: "common-hide-nav-live-popover",
				description: "隐藏 直播弹出框",
				itemCSS: `.bili-header__bar .left-entry :is(.default-entry[href*="//live.bilibili.com"]) + .v-popover {
display: none !important;
}`
			}),
			// 隐藏 游戏中心
			new CheckboxItem({
				itemID: "common-hide-nav-game",
				description: "隐藏 游戏中心",
				itemCSS: `.bili-header__bar .left-entry li:has(.default-entry[href^="//game.bilibili.com"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>span>a[href*="game.bilibili.com"]) {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="game.bilibili.com"]) {
display: none !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntry__"] li:has(a[href*="game.bilibili.com"]){
display: none !important;
}`
			}),
			// 隐藏 游戏中心弹出框
			new CheckboxItem({
				itemID: "common-hide-nav-game-popover",
				description: "隐藏 游戏中心弹出框",
				itemCSS: `.bili-header__bar .left-entry .default-entry[href*="//game.bilibili.com"] + .v-popover {
display: none !important;
}`
			}),
			// 隐藏 会员购
			new CheckboxItem({
				itemID: "common-hide-nav-vipshop",
				description: "隐藏 会员购",
				itemCSS: `.bili-header__bar .left-entry li:has(.default-entry[href^="//show.bilibili.com"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>a[href*="show.bilibili.com"]) {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="show.bilibili.com"]) {
display: none !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntry__"] li:has(a[href*="show.bilibili.com"]){
display: none !important;
}`
			}),
			// 隐藏 漫画
			new CheckboxItem({
				itemID: "common-hide-nav-manga",
				description: "隐藏 漫画",
				itemCSS: `.bili-header__bar .left-entry li:has(.default-entry[href^="//manga.bilibili.com"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>span>a[href*="manga.bilibili.com"]) {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="manga.bilibili.com"]) {
display: none !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntry__"] li:has(a[href*="manga.bilibili.com"]){
display: none !important;
}`
			}),
			// 隐藏 漫画弹出框
			new CheckboxItem({
				itemID: "common-hide-nav-manga-popover",
				description: "隐藏 漫画弹出框",
				itemCSS: `.bili-header__bar .left-entry .default-entry[href*="//manga.bilibili.com"] + .v-popover {
display: none !important;
}`
			}),
			// 隐藏 赛事
			new CheckboxItem({
				itemID: "common-hide-nav-match",
				description: "隐藏 赛事",
				itemCSS: `.bili-header__bar .left-entry li:has(.default-entry[href^="//www.bilibili.com/match/"], .default-entry[href^="//www.bilibili.com/v/game/match/"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(>a[href*="bilibili.com/match/"]) {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="bilibili.com/match/"]) {
display: none !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_leftEntry__"] li:has(a[href*="www.bilibili.com/v/game/match"]){
display: none !important;
}`
			}),
			// 隐藏 活动/活动直播
			new CheckboxItem({
				itemID: "common-hide-nav-moveclip",
				description: "隐藏 活动/活动直播",
				itemCSS: `.bili-header__bar li:has(.loc-mc-box) {
display: none !important;
}
.bili-header__bar .left-entry li:not(:has(.v-popover)):has([href^="https://live.bilibili.com/"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(a[href*="live.bilibili.com/blackboard"]) {
display: none !important;
}`
			}),
			// 隐藏 百大评选
			new CheckboxItem({
				itemID: "common-hide-nav-bdu",
				description: "隐藏 百大评选",
				itemCSS: `.bili-header__bar .left-entry li:has(>div>a[href*="bilibili.com/BPU20"]) {display: none !important;}`
			}),
			// 隐藏 BML
			new CheckboxItem({
				itemID: "common-hide-nav-bml",
				description: "隐藏 BML",
				itemCSS: `
.bili-header__bar .left-entry li:has(>div>a[href*="bml.bilibili.com"]) {display: none !important;}
#internationalHeader li.nav-link-item:has(a[href*="bml.bilibili.com"]) {display: none !important;}
`
			}),
			// 隐藏 下载客户端, 默认开启
			new CheckboxItem({
				itemID: "common-hide-nav-download-app",
				description: "隐藏 下载客户端",
				defaultStatus: true,
				itemCSS: `.bili-header__bar .left-entry li:has(a[href="//app.bilibili.com"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(a[href*="app.bilibili.com"]) {
display: none !important;
}
#biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="app.bilibili.com"]) {
display: none !important;
}`
			}),
			// 隐藏 所有官方活动(blackboard)
			new CheckboxItem({
				itemID: "common-hide-nav-blackboard",
				description: "隐藏 所有官方活动(强制)",
				itemCSS: `.bili-header__bar .left-entry li:has(>a[href*="bilibili.com/blackboard"]) {
display: none !important;
}
.bili-header__bar .left-entry li:has(>div>a[href*="bilibili.com/blackboard"]) {
display: none !important;
}
.bili-header__bar .left-entry li:has(>a[href*="bilibili.com/video/"]) {
display: none !important;
}
.bili-header__bar .left-entry li:has(>div>a[href*="bilibili.com/video/"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader li.nav-link-item:has(.loc-mc-box, span>a[href*="bilibili.com/blackboard"]) {
display: none !important;
}`
			})
		];
		commonGroupList.push(new Group("common-header-left", "全站通用项 顶栏 左侧", headerLeftItems));
		const headerCenterItems = [
			// 隐藏 推荐搜索
			new CheckboxItem({
				itemID: "common-hide-nav-search-rcmd",
				description: "隐藏 推荐搜索",
				itemCSS: `
#nav-searchform .nav-search-input::placeholder {color: transparent;}
#nav-searchform .nav-search-input {user-select: none;}
/* 旧版header */
#internationalHeader #nav_searchform input::placeholder {color: transparent;}
#internationalHeader #nav_searchform input {user-select: none;}`
			}),
			// 隐藏 搜索历史
			new CheckboxItem({
				itemID: "common-hide-nav-search-history",
				description: "隐藏 搜索历史",
				itemCSS: `.search-panel .history {display: none;}
/* 旧版header */
#internationalHeader .nav-search-box .history {display: none !important;}`
			}),
			// 隐藏 bilibili热搜
			new CheckboxItem({
				itemID: "common-hide-nav-search-trending",
				description: "隐藏 bilibili热搜",
				itemCSS: `.search-panel .trending {display: none;}
/* 旧版header */
#internationalHeader .nav-search-box .trending {display: none !important;}`
			})
		];
		commonGroupList.push(new Group("common-header-center", "全站通用项 顶栏 搜索框", headerCenterItems));
		const headerRightItems = [
			// 隐藏 头像
			new CheckboxItem({
				itemID: "common-hide-nav-avatar",
				description: "隐藏 头像",
				itemCSS: `.right-entry .v-popover-wrap.header-avatar-wrap {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .item:has(.mini-avatar) {
display: none !important;
}`
			}),
			// 隐藏 大会员, 默认开启
			new CheckboxItem({
				itemID: "common-hide-nav-vip",
				description: "隐藏 大会员",
				defaultStatus: true,
				itemCSS: `.right-entry .vip-wrap:has([href*="//account.bilibili.com/big"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .item:has(.mini-vip) {
display: none !important;
}`
			}),
			// 隐藏 消息
			new CheckboxItem({
				itemID: "common-hide-nav-message",
				description: "隐藏 消息",
				itemCSS: `.right-entry .v-popover-wrap:has([href*="//message.bilibili.com"], [data-idx="message"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .item:has(.nav-item-message) {
display: none !important;
}`
			}),
			// 隐藏 消息小红点
			new CheckboxItem({
				itemID: "common-hide-nav-message-red-num",
				description: "隐藏 消息小红点",
				itemCSS: `
.right-entry .v-popover-wrap:has([href*="//message.bilibili.com"], [data-idx="message"]) :is(.red-num--message, .red-point--message) {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .nav-item-message .num {
display: none !important;
}`
			}),
			// 隐藏 动态
			new CheckboxItem({
				itemID: "common-hide-nav-dynamic",
				description: "隐藏 动态",
				itemCSS: `.right-entry .v-popover-wrap:has([href*="//t.bilibili.com"], [data-idx="dynamic"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .item:has(.nav-item-dynamic) {
display: none !important;
}`
			}),
			// 隐藏 动态小红点
			new CheckboxItem({
				itemID: "common-hide-nav-dynamic-red-num",
				description: "隐藏 动态小红点",
				itemCSS: `
.right-entry .v-popover-wrap:has([href*="//t.bilibili.com"], [data-idx="dynamic"]) .red-num--dynamic {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .nav-item-dynamic .num {
display: none !important;
}`
			}),
			// 隐藏 收藏
			new CheckboxItem({
				itemID: "common-hide-nav-favorite",
				description: "隐藏 收藏",
				itemCSS: `.right-entry .v-popover-wrap:has(.right-entry__outside[href$="/favlist"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .item:has(.mini-favorite) {
display: none !important;
}`
			}),
			// 收藏弹出框 自动选中稍后再看
			new CheckboxItem({
				itemID: "common-nav-favorite-select-watchlater",
				description: "收藏弹出框 自动选中稍后再看",
				enableFunc: async () => {
					let cnt = 0;
					const id = setInterval(() => {
						const ele = document.querySelector(`.right-entry .v-popover-wrap:has(.right-entry__outside[href$="/favlist"]),
.nav-user-center .user-con .item:has(.mini-favorite)`);
						if(ele) {
							clearInterval(id);
							ele.addEventListener("mouseenter", () => {
								let innerCnt = 0;
								const watchLaterId = setInterval(() => {
									const watchlater = document.querySelector(`:is(.favorite-panel-popover, .vp-container .tabs-panel) .tab-item:nth-child(2)`);
									if(watchlater) {
										watchlater.click();
										clearInterval(watchLaterId);
									} else {
										innerCnt++;
										innerCnt > 250 && clearInterval(watchLaterId);
									}
								}, 20);
							});
						} else {
							cnt++;
							cnt > 100 && clearInterval(id);
						}
					}, 200);
				},
				enableFuncRunAt: "document-end"
			}),
			// 隐藏 历史
			new CheckboxItem({
				itemID: "common-hide-nav-history",
				description: "隐藏 历史",
				itemCSS: `
.right-entry .v-popover-wrap:has([href*="www.bilibili.com/account/history"], [data-idx="history"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .item:has(.mini-history) {
display: none !important;
}`
			}),
			// 隐藏 创作中心
			new CheckboxItem({
				itemID: "common-hide-nav-member",
				description: "隐藏 创作中心",
				itemCSS: `.right-entry .right-entry-item:has(a[href*="//member.bilibili.com/platform/home"], [data-idx="creation"]) {
display: none !important;
}
/* 旧版header */
#internationalHeader .nav-user-center .item:has(a[href*="member.bilibili.com/platform/home"]) {
display: none !important;
}`
			}),
			// 隐藏 投稿
			new CheckboxItem({
				itemID: "common-hide-nav-upload",
				description: "隐藏 投稿",
				// 不可设定 display: none, 会导致历史和收藏popover显示不全
				itemCSS: `.right-entry .right-entry-item.right-entry-item--upload {
visibility: hidden !important;
}
/* 旧版header */
#internationalHeader .nav-user-center >div:has(.mini-upload) {
visibility: hidden !important;
}
/* 番剧页 */
[class^="BiliHeaderV3_headerUploadEntry"] {
visibility: hidden !important;
}`
			})
		];
		commonGroupList.push(new Group("common-header-right", "全站通用项 顶栏 右侧", headerRightItems));
		const headerWidthItems = [
			new NumberItem({
				itemID: "common-header-bar-padding-left",
				description: "顶栏左侧 与页面左边界距离",
				defaultValue: -1,
				minValue: -1,
				maxValue: 2e3,
				disableValue: -1,
				unit: "px",
				itemCSS: `
.bili-header .bili-header__bar,
.mini-header__content,
[class^="BiliHeaderV3_biliHeaderBar___"] {
padding-left: ???px !important;
}`,
				itemCSSPlaceholder: "???"
			}),
			new NumberItem({
				itemID: "common-header-bar-search-width",
				description: "顶栏中间 搜索框宽度",
				defaultValue: -1,
				minValue: -1,
				maxValue: 2e3,
				disableValue: -1,
				unit: "px",
				itemCSS: `
.bili-header .center-search-container .center-search__bar,
.bili-header-m .nav-search-box,
.international-header .nav-search-box {
width: ???px !important;
max-width: ???px !important;
min-width: 0px !important;
}`,
				itemCSSPlaceholder: "???"
			}),
			new NumberItem({
				itemID: "common-header-bar-padding-right",
				description: "顶栏右侧 与页面右边界距离",
				defaultValue: -1,
				minValue: -1,
				maxValue: 2e3,
				disableValue: -1,
				unit: "px",
				itemCSS: `
.bili-header .bili-header__bar,
.mini-header__content,
[class^="BiliHeaderV3_biliHeaderBar___"] {
padding-right: ???px !important;
}`,
				itemCSSPlaceholder: "???"
			})
		];
		commonGroupList.push(new Group("common-header-bar-value", "全站通用项 顶栏 数值设定 (-1禁用)", headerWidthItems));
	}
	let _isWide = _unsafeWindow.isWide;
	let wideScreenLock = false;
	const onIsWideChangeFnArr = [];
	if(isPageVideo() || isPagePlaylist()) {
		Object.defineProperty(_unsafeWindow, "isWide", {
			get() {
				return _isWide;
			},
			set(value) {
				_isWide = value || wideScreenLock;
				if(typeof _isWide === "boolean") {
					onIsWideChangeFnArr.forEach((func) => func());
				}
			},
			configurable: true,
			enumerable: true
		});
		onIsWideChangeFnArr.push(() => {
			var _a, _b;
			if(_unsafeWindow.isWide) {
				(_a = document.documentElement) == null ? void 0 : _a.setAttribute("bili-cleaner-is-wide", "");
			} else {
				(_b = document.documentElement) == null ? void 0 : _b.removeAttribute("bili-cleaner-is-wide");
			}
		});
	}
	const disableAdjustVolume$1 = () => {};
	const videoGroupList = [];
	if(isPageVideo() || isPagePlaylist()) {
		const basicItems2 = [
			// BV号转AV号, 在url变化时需重载, 关闭功能需刷新
			new CheckboxItem({
				itemID: "video-page-bv2av",
				description: "BV号转AV号",
				enableFunc: async () => {
					const bv2av = (url) => {
						const XOR_CODE = 23442827791579n;
						const MASK_CODE = 2251799813685247n;
						const BASE = 58n;
						const data = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";
						const dec = (bvid) => {
							const bvidArr = Array.from(bvid);
							[bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
							[bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
							bvidArr.splice(0, 3);
							const tmp = bvidArr.reduce((pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)), 0n);
							return Number(tmp & MASK_CODE ^ XOR_CODE);
						};
						try {
							if(url.includes("bilibili.com/video/BV")) {
								const bvid = matchBvid(url);
								if(bvid) {
									const urlObj = new URL(url);
									const params = new URLSearchParams(urlObj.search);
									let partNum = "";
									if(params.has("p")) {
										partNum += `?p=${params.get("p")}`;
									}
									const aid = dec(bvid);
									if(partNum || urlObj.hash) {
										return `https://www.bilibili.com/video/av${aid}/${partNum}${urlObj.hash}`;
									}
									return `https://www.bilibili.com/video/av${aid}`;
								}
							}
							return url;
						} catch (err) {
							return url;
						}
					};
					URLCleanerInstance.cleanFnArr.push(bv2av);
					URLCleanerInstance.clean();
				}
			}),
			// 净化分享, 默认开启, 关闭功能需刷新
			new CheckboxItem({
				itemID: "video-page-simple-share",
				description: "净化分享功能",
				defaultStatus: true,
				itemCSS: `
.video-share-popover .video-share-dropdown .dropdown-bottom {display: none !important;}
.video-share-popover .video-share-dropdown .dropdown-top {padding: 15px !important;}
.video-share-popover .video-share-dropdown .dropdown-top .dropdown-top-right {display: none !important;}
.video-share-popover .video-share-dropdown .dropdown-top .dropdown-top-left {padding-right: 0 !important;}
`,
				// 净化分享按钮功能
				enableFunc: async () => {
					let counter = 0;
					const id = setInterval(() => {
						counter++;
						const shareBtn = document.getElementById("share-btn-outer");
						if(shareBtn) {
							shareBtn.addEventListener("click", () => {
								var _a;
								let title = (_a = document.querySelector(".video-info-title .video-title, #viewbox_report > h1, .video-title-href")) == null ? void 0 : _a.textContent;
								if(title && !title.match(/^[（【［《「＜｛〔〖〈『].*|.*[）】］》」＞｝〕〗〉』]$/)) {
									title = `【${title}】`;
								}
								const avbv = matchAvidBvid(location.href);
								let shareText = title ? `${title}
https://www.bilibili.com/video/${avbv}` : `https://www.bilibili.com/video/${avbv}`;
								const urlObj = new URL(location.href);
								const params = new URLSearchParams(urlObj.search);
								if(params.has("p")) {
									shareText += `?p=${params.get("p")}`;
								}
								navigator.clipboard.writeText(shareText).then().catch();
							});
							clearInterval(id);
						} else if(counter > 50) {
							clearInterval(id);
						}
					}, 200);
				},
				enableFuncRunAt: "document-end"
			}),
			// 顶栏 滚动页面后不再吸附顶部
			new CheckboxItem({
				itemID: "video-page-hide-fixed-header",
				description: "顶栏 滚动页面后不再吸附顶部",
				itemCSS: `.fixed-header .bili-header__bar {position: relative !important;}`
			})
		];
		videoGroupList.push(new Group("video-basic", "播放页 基本功能", basicItems2));
		const playerInitItems = [
			// 默认宽屏播放
			new CheckboxItem({
				itemID: "default-widescreen",
				description: "默认宽屏播放 刷新生效",
				itemCSS: `
/* 修复mini播放模式主播放器宽度支撑问题 */
html[bili-cleaner-is-wide] #playerWrap:has(.bpx-player-container[data-screen="mini"]) {
width: fit-content;
}
`,
				enableFunc: async () => {
					wideScreenLock = true;
					_unsafeWindow.isWide = true;
					const listener = () => {
						window.scrollTo(0, 64);
						waitForEle(document.body, ".bpx-player-ctrl-wide", (node) => {
							return node.className.includes("bpx-player-ctrl-wide");
						}).then((wideBtn) => {
							if(wideBtn) {
								wideBtn.click();
								wideScreenLock = false;
							}
						});
					};
					document.addEventListener("DOMContentLoaded", listener);
				},
				disableFunc: async () => {
					wideScreenLock = false;
				}
			}),
			// 网页全屏时 页面可滚动
			new CheckboxItem({
				itemID: "webscreen-scrollable",
				description: "网页全屏时 页面可滚动 滚轮调音量失效\n（Firefox 不适用）",
				itemCSS: `
.webscreen-fix {
position: unset;
top: unset;
left: unset;
margin: unset;
padding: unset;
width: unset;
height: unset;
}
.webscreen-fix #biliMainHeader {
display: none;
}
.webscreen-fix #mirror-vdcon {
box-sizing: content-box;
position: relative;
}
.webscreen-fix #danmukuBox {
margin-top: 0 !important;
}
.webscreen-fix :is(.left-container, .playlist-container--left) {
position: static !important;
padding-top: 100vh;
min-width: 56vw !important;
}
.webscreen-fix :is(.left-container, .playlist-container--left) .video-info-container {
height: fit-content;
}
.webscreen-fix :is(.left-container, .playlist-container--left) #bilibili-player.mode-webscreen {
position: static;
border-radius: unset;
z-index: unset;
left: unset;
top: unset;
width: 100%;
height: 100%;
}
.webscreen-fix :is(.left-container, .playlist-container--left) #playerWrap {
position: absolute;
left: 0;
right: 0;
top: 0;
height: 100vh;
width: 100vw;
padding-right: 0;
}
.webscreen-fix :is(.right-container, .playlist-container--right) {
padding-top: 100vh;
}
/* 隐藏小窗 */
.webscreen-fix .float-nav-exp .nav-menu .item.mini,
.webscreen-fix .fixed-sidenav-storage .mini-player-window {
display: none !important;
}
/* 滚动条 */
.webscreen-fix::-webkit-scrollbar {
display: none !important;
}
/* firefox滚动条 */
@-moz-document url-prefix() {
html:has(.webscreen-fix), body.webscreen-fix {
scrollbar-width: none !important;
}
}
`,
				enableFunc: async () => {
					document.removeEventListener("wheel", disableAdjustVolume$1);
					document.addEventListener("wheel", disableAdjustVolume$1);
					waitForEle(document.body, ".bpx-player-ctrl-web", (node) => {
						return node.className.includes("bpx-player-ctrl-web");
					}).then((webBtn) => {
						if(webBtn) {
							webBtn.addEventListener("click", () => {
								if(webBtn.classList.contains("bpx-state-entered")) {
									window.scrollTo(0, 0);
								}
							});
						}
					});
				},
				enableFuncRunAt: "document-end",
				disableFunc: async () => document.removeEventListener("wheel", disableAdjustVolume$1)
			}),
			// 全屏时 页面可滚动
			new CheckboxItem({
				itemID: "fullscreen-scrollable",
				description: "全屏时 页面可滚动 滚轮调音量失效\n（实验功能，Firefox 不适用）",
				itemCSS: `
.webscreen-fix {
position: unset;
top: unset;
left: unset;
margin: unset;
padding: unset;
width: unset;
height: unset;
}
.webscreen-fix #biliMainHeader {
display: none;
}
.webscreen-fix #mirror-vdcon {
box-sizing: content-box;
position: relative;
}
.webscreen-fix #danmukuBox {
margin-top: 0 !important;
}
.webscreen-fix :is(.left-container, .playlist-container--left) {
position: static !important;
padding-top: 100vh;
min-width: 56vw !important;
}
.webscreen-fix :is(.left-container, .playlist-container--left) .video-info-container {
height: fit-content;
}
.webscreen-fix :is(.left-container, .playlist-container--left) #bilibili-player.mode-webscreen {
position: static;
border-radius: unset;
z-index: unset;
left: unset;
top: unset;
width: 100%;
height: 100%;
}
.webscreen-fix :is(.left-container, .playlist-container--left) #playerWrap {
position: absolute;
left: 0;
right: 0;
top: 0;
height: 100vh;
width: 100vw;
padding-right: 0;
}
.webscreen-fix :is(.right-container, .playlist-container--right) {
padding-top: 100vh;
}
/* 隐藏小窗 */
.webscreen-fix .float-nav-exp .nav-menu .item.mini,
.webscreen-fix .fixed-sidenav-storage .mini-player-window {
display: none !important;
}
/* 滚动条 */
.webscreen-fix::-webkit-scrollbar {
display: none !important;
}
/* firefox滚动条 */
@-moz-document url-prefix() {
html:has(.webscreen-fix), body.webscreen-fix {
scrollbar-width: none !important;
}
}
`,
				enableFunc: async () => {
					if(!navigator.userAgent.toLocaleLowerCase().includes("chrome")) {
						return;
					}
					document.removeEventListener("wheel", disableAdjustVolume$1);
					document.addEventListener("wheel", disableAdjustVolume$1);
					let cnt = 0;
					const id = setInterval(() => {
						var _a;
						const webBtn = document.body.querySelector(".bpx-player-ctrl-btn.bpx-player-ctrl-web");
						const fullBtn = document.body.querySelector(".bpx-player-ctrl-btn.bpx-player-ctrl-full");
						if(webBtn && fullBtn) {
							clearInterval(id);
							const isFullScreen = () => {
								if(document.fullscreenElement) {
									return "ele";
								} else if(window.innerWidth === screen.width && window.innerHeight === screen.height) {
									return "f11";
								} else {
									return "not";
								}
							};
							const isWebScreen = () => {
								return webBtn.classList.contains("bpx-state-entered");
							};
							const newFullBtn = fullBtn.cloneNode(true);
							newFullBtn.addEventListener("click", () => {
								switch(isFullScreen()) {
									case "ele":
										if(isWebScreen()) {
											webBtn.click();
										} else {
											document.exitFullscreen().then().catch();
										}
										break;
									case "f11":
										if(isWebScreen()) {
											webBtn.click();
										} else {
											webBtn.click();
										}
										break;
									case "not":
										document.body.requestFullscreen().then().catch();
										if(!isWebScreen()) {
											webBtn.click();
										}
										window.scrollTo(0, 0);
										break;
								}
							});
							(_a = fullBtn.parentElement) == null ? void 0 : _a.replaceChild(newFullBtn, fullBtn);
						} else {
							cnt++;
							cnt > 100 && clearInterval(id);
						}
					}, 100);
				},
				enableFuncRunAt: "document-end",
				disableFunc: async () => document.removeEventListener("wheel", disableAdjustVolume$1)
			}),
			// 播放器和视频标题 交换位置
			new CheckboxItem({
				itemID: "video-page-exchange-player-position",
				description: "播放器和视频信息 交换位置",
				itemCSS: `
body:not(.webscreen-fix) :is(.left-container, .playlist-container--left) {
display: flex !important;
flex-direction: column !important;
padding-top: 35px !important;
}
body:not(.webscreen-fix) :is(.left-container, .playlist-container--left) > * {
order: 1;
}
body:not(.webscreen-fix) #playerWrap {
order: 0 !important;
z-index: 1;
}
body:not(.webscreen-fix) .video-info-container {
height: auto !important;
padding-top: 16px !important;
/* 高权限消除展开标题的间距 */
margin-bottom: 0 !important;
}
/* fix #80 宽屏模式下播放器遮盖up主 */
html[bili-cleaner-is-wide] body:not(.webscreen-fix) .up-panel-container {
position: relative !important;
/*
拟合魔法，勿动
videoWidth = innerWidth * 0.962339 - 359.514px
videoHeight = max(min(calc(innerWidth * 0.962339 - 359.514px), 2010px), 923px) * 9/16 + 46px
*/
margin-top: calc(max(min(calc(100vw * 0.962339 - 359.514px), 2010px), 923px) * 9 / 16 + 46px + 35px);
}
html[bili-cleaner-is-wide] body:not(.webscreen-fix) #danmukuBox {
margin-top: 0 !important;
}
`
			}),
			// 普通播放 视频宽度调节
			new NumberItem({
				itemID: "normalscreen-width",
				description: "普通播放 视频宽度调节（-1禁用）",
				defaultValue: -1,
				minValue: -1,
				maxValue: 100,
				disableValue: -1,
				unit: "vw",
				itemCSS: `
/* 魔法, 勿动 */
:root {
--normal-width: min(calc(100vw - 400px), ???vw);
--normal-height: calc(min(calc(100vw - 400px), ???vw) * 9 / 16);
}
#bilibili-player-placeholder {
visibility: hidden !important;
}
/*
需避免右侧视频预览 inline player 影响
data-screen变化慢, 播放模式判断一律用:not(), 使用html元素的bili-cleaner-is-wide加快wide模式判断
*/
/* 左列basis宽度 */
html:not([bili-cleaner-is-wide]) :is(.left-container, .playlist-container--left):has(.bpx-player-container:not([data-screen="wide"], [data-screen="web"], [data-screen="full"])) {
flex-basis: var(--normal-width);
}
/* 播放器长宽限制 */
html:not([bili-cleaner-is-wide]) :is(.left-container, .playlist-container--left):has(.bpx-player-container:not([data-screen="wide"], [data-screen="web"], [data-screen="full"], [data-screen="mini"])) :is(.bpx-player-video-area, video) {
width: 100% !important;
height: var(--normal-height) !important;
min-height: var(--normal-height) !important;
max-height: var(--normal-height) !important;
}
/* 播放器外层 */
html:not([bili-cleaner-is-wide]) :is(.left-container, .playlist-container--left):has(.bpx-player-container:not([data-screen="wide"], [data-screen="web"], [data-screen="full"], [data-screen="mini"])) :is(.bpx-player-primary-area, .bpx-player-container, .bpx-docker-major, #bilibili-player, #playerWrap) {
width: var(--normal-width);
height: fit-content;
max-height: calc(var(--normal-height) + 56px);
}
/* 普通mini模式 主播放器支撑 */
html:not([bili-cleaner-is-wide]) #playerWrap:has(.bpx-player-container[data-screen="mini"]) {
background-color: transparent;
width: var(--normal-width);
height: calc(var(--normal-height) + 46px);
min-height: var(--normal-height);
max-height: calc(var(--normal-height) + 56px);
position: relative;
}
html:not([bili-cleaner-is-wide]) #playerWrap:has(.bpx-player-container[data-screen="mini"])::before {
content: '';
position: absolute;
top: 0;
left: 0;
width: 100%;
height: calc(100% - 46px);
background-color: black;
}
/* 宽屏mini模式 主播放器支撑 */
html[bili-cleaner-is-wide] #playerWrap:has(.bpx-player-container[data-screen="mini"]) {
background-color: transparent;
width: fit-content;
position: relative;
}
html[bili-cleaner-is-wide] #playerWrap:has(.bpx-player-container[data-screen="mini"])::before {
content: '';
position: absolute;
top: 0;
left: 0;
width: 100%;
height: calc(100% - 46px);
background-color: black;
}
`,
				itemCSSPlaceholder: "???"
			})
		];
		videoGroupList.push(new Group("player-mode", "播放设定", playerInitItems));
		const infoItems = [
			// 展开 完整视频标题
			new CheckboxItem({
				itemID: "video-page-unfold-video-info-title",
				description: "展开 完整视频标题(多行)",
				itemCSS: `
.video-info-container:has(.show-more) {
height: fit-content !important;
margin-bottom: 12px;
}
.video-info-container .video-info-title-inner-overflow .video-title {
margin-right: unset !important;
text-wrap: wrap !important;
}
.video-info-container .video-info-title-inner .video-title .video-title-href {
text-wrap: wrap !important;
}
.video-info-container .show-more {
display: none !important;
}
`
			}),
			// 隐藏 弹幕数
			new CheckboxItem({
				itemID: "video-page-hide-video-info-danmaku-count",
				description: "隐藏 弹幕数",
				itemCSS: `:is(.video-info-detail, .video-info-meta) .dm {display: none !important;}`
			}),
			// 隐藏 发布日期
			new CheckboxItem({
				itemID: "video-page-hide-video-info-pubdate",
				description: "隐藏 发布日期",
				itemCSS: `:is(.video-info-detail, .video-info-meta) .pubdate-ip {display: none !important;}`
			}),
			// 隐藏 版权声明
			new CheckboxItem({
				itemID: "video-page-hide-video-info-copyright",
				description: "隐藏 版权声明",
				itemCSS: `:is(.video-info-detail, .video-info-meta) .copyright {display: none !important;}`
			}),
			// 隐藏 视频荣誉(排行榜/每周必看)
			new CheckboxItem({
				itemID: "video-page-hide-video-info-honor",
				description: "隐藏 视频荣誉(排行榜/每周必看)",
				itemCSS: `:is(.video-info-detail, .video-info-meta) .honor-rank, .v:is(ideo-info-detail, ideo-info-meta) .honor-weekly {display: none !important;}`
			}),
			// 隐藏 温馨提示(饮酒/危险/AI生成), 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-video-info-argue",
				description: "隐藏 温馨提示(饮酒/危险/AI生成)",
				defaultStatus: true,
				itemCSS: `:is(.video-info-detail, .video-info-meta) :is(.argue, .video-argue) {display: none !important;}`
			})
		];
		videoGroupList.push(new Group("video-info", "视频信息", infoItems));
	}
	if(isPageVideo() || isPagePlaylist() || isPageFestival()) {
		const playerItems = [
			// 隐藏 一键三连弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-guide-all",
				description: "隐藏 一键三连弹窗",
				itemCSS: `.bpx-player-video-area .bili-guide, .bpx-player-video-area .bili-guide-all {display: none !important;}`
			}),
			// 隐藏 投票弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-vote",
				description: "隐藏 投票弹窗",
				itemCSS: `.bpx-player-video-area .bili-vote, .bpx-player-video-area .bili-cmd-shrink {display: none !important;}`
			}),
			// 隐藏 播放效果调查, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-qoe-feedback",
				description: "隐藏 播放效果调查",
				defaultStatus: true,
				itemCSS: `.bpx-player-video-area .bili-qoeFeedback {display: none !important;}`
			}),
			// 隐藏 评分弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-score",
				description: "隐藏 评分弹窗",
				itemCSS: `.bpx-player-video-area .bili-score {display: none !important;}`
			}),
			// 隐藏 评分总结弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-score-sum",
				description: "隐藏 评分总结弹窗",
				itemCSS: `.bpx-player-video-area .bili-scoreSum {display: none !important;}`
			}),
			// 隐藏 打卡弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-clock",
				description: "隐藏 打卡弹窗",
				itemCSS: `.bpx-player-video-area .bili-clock {display: none !important;}`
			}),
			// 隐藏 视频预告弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-reserve",
				description: "隐藏 视频预告弹窗",
				itemCSS: `.bpx-player-video-area .bili-reserve {display: none !important;}`
			}),
			// 隐藏 视频链接弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-link",
				description: "隐藏 视频链接弹窗(稍后再看)",
				itemCSS: `.bpx-player-video-area .bili-link {display: none !important;}`
			}),
			// 隐藏 左上角 播放器内标题
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-top-left-title",
				description: "隐藏 左上角 播放器内标题",
				itemCSS: `.bpx-player-top-title {display: none !important;}
.bpx-player-top-left-title {display: none !important;}
/* 播放器上方阴影渐变 */
.bpx-player-top-mask {display: none !important;}`
			}),
			// 隐藏 左上角 视频音乐链接
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-top-left-music",
				description: "隐藏 左上角 视频音乐链接",
				itemCSS: `.bpx-player-top-left-music {display: none !important;}`
			}),
			// 隐藏 左上角 关注UP主, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-top-left-follow",
				description: "隐藏 左上角 关注UP主",
				defaultStatus: true,
				itemCSS: `.bpx-player-top-left-follow {display: none !important;}`
			}),
			// 隐藏 右上角 反馈按钮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-top-issue",
				description: "隐藏 右上角 反馈按钮",
				defaultStatus: true,
				itemCSS: `.bpx-player-top-issue {display: none !important;}`
			}),
			// 隐藏 视频暂停时大Logo
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-state-wrap",
				description: "隐藏 视频暂停时大Logo",
				itemCSS: `.bpx-player-state-wrap {display: none !important;}`
			}),
			// 隐藏 播放结束后视频推荐
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ending-related",
				description: "隐藏 播放结束后视频推荐",
				itemCSS: `
.bpx-player-ending-related {display: none !important;}
.bpx-player-ending-content {display: flex !important; align-items: center !important;}`
			}),
			// 隐藏 弹幕悬停 点赞/复制/举报
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dialog-wrap",
				description: "隐藏 弹幕悬停点赞/复制/举报",
				itemCSS: `.bpx-player-dialog-wrap {display: none !important;}`
			}),
			// 隐藏 高赞弹幕前点赞按钮
			new CheckboxItem({
				itemID: "video-page-bpx-player-bili-high-icon",
				description: "隐藏 高赞弹幕前点赞按钮",
				itemCSS: `.bili-dm .bili-high-icon {display: none !important}`
			}),
			// 彩色渐变弹幕 变成白色
			new CheckboxItem({
				itemID: "video-page-bpx-player-bili-dm-vip-white",
				description: "彩色渐变弹幕 变成白色",
				itemCSS: `#bilibili-player .bili-dm>.bili-dm-vip {
background: unset !important;
background-size: unset !important;
/* 父元素未指定 var(--textShadow), 默认重墨描边凑合用 */
text-shadow: 1px 0 1px #000000,0 1px 1px #000000,0 -1px 1px #000000,-1px 0 1px #000000 !important;
text-stroke: none !important;
-webkit-text-stroke: none !important;
-moz-text-stroke: none !important;
-ms-text-stroke: none !important;
}`
			}),
			// CC字幕 字体优化
			new CheckboxItem({
				itemID: "video-page-bpx-player-subtitle-font-family",
				description: "CC字幕 字体优化 (实验性)",
				itemCSS: `#bilibili-player .bpx-player-subtitle-panel-text {
font-family: inherit;
}`
			}),
			// CC字幕 字体优化
			new CheckboxItem({
				itemID: "video-page-bpx-player-subtitle-text-stroke",
				description: "CC字幕 字体描边 (实验性)",
				itemCSS: `#bilibili-player .bpx-player-subtitle-panel-text {
background: unset !important;
background-color: rgba(0,0,0,0.7) !important;
text-shadow: none !important;
background-clip: text !important;
text-stroke: 3px transparent !important;
-webkit-background-clip: text !important;
-webkit-text-stroke: 3px transparent;
-moz-background-clip: text !important;
-moz-text-stroke: 3px transparent;
-ms-background-clip: text !important;
-ms-text-stroke: 3px transparent;
}`
			})
		];
		videoGroupList.push(new Group("video-player", "播放器", playerItems));
		const miniPlayerItems = [
			// 隐藏底边进度
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-mini-mode-process",
				description: "隐藏底边进度",
				defaultStatus: true,
				itemCSS: `.bpx-player-container[data-screen=mini]:not(:hover) .bpx-player-mini-progress {display: none;}`
			}),
			// 隐藏弹幕
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-mini-mode-danmaku",
				description: "隐藏弹幕",
				itemCSS: `.bpx-player-container[data-screen=mini] .bpx-player-row-dm-wrap {visibility: hidden !important;}`
			}),
			// 滚轮调节大小
			new CheckboxItem({
				itemID: "video-page-bpx-player-mini-mode-wheel-adjust",
				description: "滚轮调节大小",
				enableFunc: async () => {
					try {
						const insertCSS = (zoom) => {
							const cssText = `
.bpx-player-container[data-screen=mini] {
height: calc(225px * ${zoom}) !important;
width: calc(400px * ${zoom}) !important;
}
.bpx-player-container[data-revision="1"][data-screen=mini],
.bpx-player-container[data-revision="2"][data-screen=mini] {
height: calc(180px * ${zoom}) !important;
width: calc(320px * ${zoom}) !important;
}
@media screen and (min-width:1681px) {
.bpx-player-container[data-revision="1"][data-screen=mini],
.bpx-player-container[data-revision="2"][data-screen=mini] {
height: calc(203px * ${zoom}) !important;
width: calc(360px * ${zoom}) !important;
}
}`.replace(/\n\s*/g, "").trim();
							const node = document.querySelector(`html>style[bili-cleaner-css=video-page-bpx-player-mini-mode-wheel-adjust]`);
							if(node) {
								node.innerHTML = cssText;
							} else {
								const style = document.createElement("style");
								style.innerHTML = cssText;
								style.setAttribute("bili-cleaner-css", "video-page-bpx-player-mini-mode-wheel-adjust");
								document.documentElement.appendChild(style);
							}
						};
						const oldZoom = _GM_getValue("BILICLEANER_video-page-bpx-player-mini-mode-zoom");
						oldZoom && insertCSS(oldZoom);
						let cnt = 0;
						const interval = setInterval(() => {
							const player = document.querySelector(".bpx-player-container");
							if(player) {
								clearInterval(interval);
								let flag = false;
								player.addEventListener("mouseenter", () => {
									if(player.getAttribute("data-screen") === "mini") {
										flag = true;
									}
								});
								player.addEventListener("mouseleave", () => {
									flag = false;
								});
								let lastZoom = oldZoom || 1;
								player.addEventListener("wheel", (e) => {
									if(flag) {
										e.stopPropagation();
										e.preventDefault();
										const scaleSpeed = 5;
										let zoom = lastZoom - Math.sign(e.deltaY) * scaleSpeed / 100;
										zoom = zoom < 0.5 ? 0.5 : zoom;
										zoom = zoom > 3 ? 3 : zoom;
										if(zoom !== lastZoom) {
											lastZoom = zoom;
											insertCSS(zoom);
											_GM_setValue("BILICLEANER_video-page-bpx-player-mini-mode-zoom", zoom);
										}
									}
								});
							} else {
								cnt++;
								if(cnt > 20) {
									clearInterval(interval);
								}
							}
						}, 500);
					} catch (err) {
						error("adjust mini player size error");
						error(err);
					}
				},
				enableFuncRunAt: "document-end",
				disableFunc: async () => {
					var _a;
					(_a = document.querySelector(`style[bili-cleaner-css=video-page-bpx-player-mini-mode-wheel-adjust]`)) == null ? void 0 : _a.remove();
				}
			}),
			// 记录小窗位置
			new CheckboxItem({
				itemID: "video-page-bpx-player-mini-mode-position-record",
				description: "记录小窗位置",
				enableFunc: async () => {
					let player;
					const addMiniPlayerMoveListener = () => {
						if(!player) {
							return;
						}
						player.addEventListener("mouseup", () => {
							if(player.getAttribute("data-screen") !== "mini") {
								return;
							}
							_GM_setValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-right", parseInt(player.style.right));
							_GM_setValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-bottom", parseInt(player.style.bottom));
						});
					};
					const setMiniPlayerState = () => {
						const right = _GM_getValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-right");
						const bottom = _GM_getValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-bottom");
						if(typeof right === "number" && typeof bottom === "number") {
							if(_unsafeWindow.player) {
								_unsafeWindow.player.__core().uiStore.state.miniScreenRight = right;
								_unsafeWindow.player.__core().uiStore.state.miniScreenBottom = bottom;
							}
						}
					};
					waitForEle(document.body, "#bilibili-player .bpx-player-container", (node) => {
						return node.className.startsWith("bpx-player-container");
					}).then((ele) => {
						if(ele) {
							player = ele;
							try {
								setMiniPlayerState();
								addMiniPlayerMoveListener();
							} catch {}
						}
					});
				},
				enableFuncRunAt: "document-end"
			})
		];
		videoGroupList.push(new Group("video-mini-player", "小窗播放器", miniPlayerItems));
		const playerControlItems = [
			// 隐藏 上一个视频
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-prev",
				description: "隐藏 上一个视频",
				itemCSS: `.bpx-player-ctrl-prev {display: none !important;}`
			}),
			// 隐藏 播放/暂停
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-play",
				description: "隐藏 播放/暂停",
				itemCSS: `.bpx-player-ctrl-play {display: none !important;}`
			}),
			// 隐藏 下一个视频
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-next",
				description: "隐藏 下一个视频",
				itemCSS: `.bpx-player-ctrl-next {display: none !important;}`
			}),
			// 隐藏 章节列表
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-viewpoint",
				description: "隐藏 章节列表",
				itemCSS: `.bpx-player-ctrl-viewpoint {display: none !important;}`
			}),
			// 隐藏 Hi-Res无损
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-flac",
				description: "隐藏 Hi-Res无损",
				itemCSS: `.bpx-player-ctrl-flac {display: none !important;}`
			}),
			// 隐藏 清晰度
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-quality",
				description: "隐藏 清晰度",
				itemCSS: `.bpx-player-ctrl-quality {display: none !important;}`
			}),
			// 隐藏 选集
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-eplist",
				description: "隐藏 选集",
				itemCSS: `.bpx-player-ctrl-eplist {display: none !important;}`
			}),
			// 隐藏 倍速
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-playbackrate",
				description: "隐藏 倍速",
				itemCSS: `.bpx-player-ctrl-playbackrate {display: none !important;}`
			}),
			// 隐藏 字幕
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-subtitle",
				description: "隐藏 字幕",
				itemCSS: `.bpx-player-ctrl-subtitle {display: none !important;}`
			}),
			// 隐藏 音量
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-volume",
				description: "隐藏 音量",
				itemCSS: `.bpx-player-ctrl-volume {display: none !important;}`
			}),
			// 隐藏 视频设置
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-setting",
				description: "隐藏 视频设置",
				itemCSS: `.bpx-player-ctrl-setting {display: none !important;}`
			}),
			// 隐藏 画中画(Chrome)
			// Firefox的画中画按钮为浏览器自带，无法通过CSS隐藏，只可通过浏览器设置关闭
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-pip",
				description: "隐藏 画中画(Chrome)",
				itemCSS: `.bpx-player-ctrl-pip {display: none !important;}`
			}),
			// 隐藏 宽屏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-wide",
				description: "隐藏 宽屏",
				itemCSS: `.bpx-player-ctrl-wide {display: none !important;}`
			}),
			// 隐藏 网页全屏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-web",
				description: "隐藏 网页全屏",
				itemCSS: `.bpx-player-ctrl-web {display: none !important;}`
			}),
			// 隐藏 全屏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-full",
				description: "隐藏 全屏",
				itemCSS: `.bpx-player-ctrl-full {display: none !important;}`
			}),
			// 隐藏 高能进度条 图钉按钮
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-pbp-pin",
				description: "隐藏 高能进度条 图钉按钮",
				itemCSS: `.bpx-player-pbp-pin {display: none !important;}`
			}),
			// 隐藏 底边mini视频进度, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-shadow-progress-area",
				description: "隐藏 底边mini视频进度",
				defaultStatus: true,
				itemCSS: `.bpx-player-shadow-progress-area {display: none !important;}`
			})
		];
		videoGroupList.push(new Group("video-player-control", "播放控制", playerControlItems));
		const danmakuItems = [
			// 隐藏 同时在看人数
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-info-online",
				description: "隐藏 同时在看人数",
				itemCSS: `.bpx-player-video-info-online, .bpx-player-video-info-divide {display: none !important;}`
			}),
			// 隐藏 载入弹幕数量
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-info-dm",
				description: "隐藏 载入弹幕数量",
				itemCSS: `.bpx-player-video-info-dm, .bpx-player-video-info-divide {display: none !important;}`
			}),
			// 隐藏 弹幕启用
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-switch",
				description: "隐藏 弹幕启用",
				itemCSS: `.bpx-player-dm-switch {display: none !important;}`
			}),
			// 隐藏 弹幕显示设置
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-setting",
				description: "隐藏 弹幕显示设置",
				itemCSS: `.bpx-player-dm-setting {display: none !important;}`
			}),
			// 隐藏 弹幕样式
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-btn-dm",
				description: "隐藏 弹幕样式",
				itemCSS: `.bpx-player-video-btn-dm {display: none !important;}`
			}),
			// 隐藏 占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-input",
				description: "隐藏 占位文字",
				defaultStatus: true,
				itemCSS: `.bpx-player-dm-input::placeholder {color: transparent !important;}`
			}),
			// 隐藏 弹幕礼仪, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-hint",
				description: "隐藏 弹幕礼仪",
				defaultStatus: true,
				itemCSS: `.bpx-player-dm-hint {display: none !important;}`
			}),
			// 隐藏 发送按钮
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-btn-send",
				description: "隐藏 发送按钮",
				itemCSS: `.bpx-player-dm-btn-send {display: none !important;}`
			}),
			// 隐藏 智能弹幕 发送提示
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-postpanel",
				description: "隐藏 智能弹幕/广告弹幕",
				itemCSS: `
.bpx-player-postpanel-sug, .bpx-player-postpanel-carousel, .bpx-player-postpanel-popup {
display: none !important;
}`
			}),
			// 非全屏下 关闭弹幕栏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-sending-area",
				description: "非全屏下 关闭弹幕栏",
				itemCSS: `
/* video page的player height由JS动态设定 */
.bpx-player-sending-area {display: none !important;}
/* 活动播放器直接去黑边 */
.page-main-content:has(.festival-video-player) .video-player-box {height: fit-content !important;}
.festival-video-player {height: fit-content !important;}
.festival-video-player #bilibili-player:not(.mode-webscreen) {height: calc(100% - 46px) !important;}
`,
				// 隐藏弹幕栏时，强行调节播放器高度
				enableFunc: async () => {
					const genSizeCSS = () => {
						const e = _unsafeWindow.isWide;
						const i = _unsafeWindow.innerHeight;
						const t = Math.max(document.body && document.body.clientWidth || _unsafeWindow.innerWidth, 1100);
						const n = 1680 < innerWidth ? 411 : 350;
						const o = 16 * (i - (1690 < innerWidth ? 318 : 308)) / 9;
						const r = t - 112 - n;
						let d = r < o ? r : o;
						if(d < 668) {
							d = 668;
						}
						if(1694 < d) {
							d = 1694;
						}
						let a = d + n;
						if(_unsafeWindow.isWide) {
							a -= 125;
							d -= 100;
						}
						let l;
						if(_unsafeWindow.hasBlackSide && !_unsafeWindow.isWide) {
							l = Math.round((d - 14 + (e ? n : 0)) * 0.5625) + 96;
						} else {
							l = Math.round((d + (e ? n : 0)) * 0.5625);
						}
						const s = `
.video-container-v1 {width: auto;padding: 0 10px;}
.left-container {width: ${a - n}px;}
#bilibili-player {width: ${a - (e ? -30 : n)}px;height: ${l}px;position: ${e ? "relative" : "static"};}
#oldfanfollowEntry {position: relative;top: ${e ? `${l + 10}px` : "0"};}
#danmukuBox {margin-top: ${e ? `${l + 28}px` : "0"};}
#playerWrap {height: ${l}px;}
.video-discover {margin-left: ${(a - n) / 2}px;}
`;
						return s.replace(/\n\s*/g, "").trim();
					};
					const overrideCSS = () => {
						const overrideStyle = document.getElementById("overrideSetSizeStyle");
						if(!overrideStyle) {
							const newStyleNode = document.createElement("style");
							newStyleNode.id = "overrideSetSizeStyle";
							newStyleNode.innerHTML = genSizeCSS();
							document.head.appendChild(newStyleNode);
							debugRules("override setSize OK");
						} else {
							overrideStyle.innerHTML = genSizeCSS();
							debugRules("refresh setSize OK");
						}
					};
					if(document.getElementById("setSizeStyle")) {
						overrideCSS();
					}
					const observeStyle = new MutationObserver(() => {
						if(document.getElementById("setSizeStyle")) {
							overrideCSS();
							observeStyle.disconnect();
						}
					});
					document.head && observeStyle.observe(document.head, {
						childList: true
					});
					onIsWideChangeFnArr.push(overrideCSS);
				}
			}),
			// 全屏下 关闭弹幕输入框
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-inputbar",
				description: "全屏下 关闭弹幕输入框",
				itemCSS: `.bpx-player-container[data-screen=full] .bpx-player-control-bottom-center .bpx-player-video-inputbar,
.bpx-player-container[data-screen=web] .bpx-player-control-bottom-center .bpx-player-video-inputbar {
display: none !important;
}
.bpx-player-container[data-screen=full] .bpx-player-control-bottom-center,
.bpx-player-container[data-screen=web] .bpx-player-control-bottom-center {
padding: 0 15px !important;
}
/* 弹幕开关按钮贴紧左侧, 有章节列表时增大列表宽度 */
.bpx-player-container[data-screen=full] .bpx-player-control-bottom-left,
.bpx-player-container[data-screen=web] .bpx-player-control-bottom-left {
min-width: unset !important;
}
.bpx-player-container[data-screen=full] .bpx-player-ctrl-viewpoint,
.bpx-player-container[data-screen=web] .bpx-player-ctrl-viewpoint {
width: fit-content !important;
}`
			})
		];
		videoGroupList.push(new Group("video-danmaku", "弹幕栏", danmakuItems));
	}
	if(isPageVideo() || isPagePlaylist()) {
		const toolbarItems = [
			// 投币时不自动点赞 #46
			new CheckboxItem({
				itemID: "video-page-coin-disable-auto-like",
				description: "投币时不自动点赞 (关闭需刷新)",
				enableFunc: async () => {
					const disableAutoLike = () => {
						let counter = 0;
						const timer = setInterval(() => {
							const checkbox = document.querySelector("body > .bili-dialog-m .bili-dialog-bomb .like-checkbox input");
							if(checkbox) {
								checkbox.checked && checkbox.click();
								clearInterval(timer);
							} else {
								counter++;
								if(counter > 100) {
									clearInterval(timer);
								}
							}
						}, 20);
					};
					const coinBtn = document.querySelector("#arc_toolbar_report .video-coin.video-toolbar-left-item");
					if(coinBtn) {
						coinBtn.addEventListener("click", disableAutoLike);
					} else {
						document.addEventListener("DOMContentLoaded", () => {
							const coinBtn2 = document.querySelector("#arc_toolbar_report .video-coin.video-toolbar-left-item");
							coinBtn2 == null ? void 0 : coinBtn2.addEventListener("click", disableAutoLike);
						});
					}
				}
			}),
			// 隐藏 分享按钮弹出菜单, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-video-share-popover",
				description: "隐藏 分享按钮弹出菜单",
				defaultStatus: true,
				itemCSS: `.video-share-popover {display: none !important;}`
			}),
			// 隐藏 官方AI总结
			new CheckboxItem({
				itemID: "video-page-hide-below-info-video-ai-assistant",
				description: "隐藏 官方AI总结",
				itemCSS: `.video-toolbar-right .video-ai-assistant {display: none !important;}`
			}),
			// 隐藏 记笔记
			new CheckboxItem({
				itemID: "video-page-hide-below-info-video-note",
				description: "隐藏 记笔记",
				itemCSS: `.video-toolbar-right .video-note {display: none !important;}`
			}),
			// 隐藏 举报/笔记/稍后再看
			new CheckboxItem({
				itemID: "video-page-hide-below-info-video-report-menu",
				description: "隐藏 举报/笔记/稍后再看",
				itemCSS: `.video-toolbar-right .video-tool-more {display: none !important;}`
			}),
			// 隐藏 视频简介
			new CheckboxItem({
				itemID: "video-page-hide-below-info-desc",
				description: "隐藏 视频简介",
				itemCSS: `#v_desc {display: none !important;}
/* 收藏夹和稍后再看 */
.video-desc-container {display: none !important;}`
			}),
			// 隐藏 tag列表
			new CheckboxItem({
				itemID: "video-page-hide-below-info-tag",
				description: "隐藏 tag列表",
				itemCSS: `#v_tag {display: none !important;}
/* 收藏夹和稍后再看 */
.video-tag-container {display: none !important;}`
			}),
			// 隐藏 活动宣传, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-below-activity-vote",
				description: "隐藏 活动宣传",
				defaultStatus: true,
				itemCSS: `#activity_vote {display: none !important;}`
			}),
			// 隐藏 广告banner, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-below-bannerAd",
				description: "隐藏 广告banner",
				defaultStatus: true,
				itemCSS: `#bannerAd {display: none !important;}`
			}),
			// 隐藏 投票
			new CheckboxItem({
				itemID: "video-page-hide-top-vote-card",
				description: "隐藏 投票",
				itemCSS: `.top-vote-card {display: none !important;}`
			})
		];
		videoGroupList.push(new Group("video-toolbar", "视频下方 三连/简介/Tag", toolbarItems));
		const upInfoItems = [
			// 隐藏 给UP发消息, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-up-sendmsg",
				description: "隐藏 给UP发消息",
				defaultStatus: true,
				itemCSS: `.up-detail .send-msg {display: none !important;}`
			}),
			// 隐藏 UP简介
			new CheckboxItem({
				itemID: "video-page-hide-up-description",
				description: "隐藏 UP简介",
				itemCSS: `.up-detail .up-description {display: none !important;}`
			}),
			// 隐藏 充电
			new CheckboxItem({
				itemID: "video-page-hide-up-charge",
				description: "隐藏 充电",
				itemCSS: `.upinfo-btn-panel .new-charge-btn, .upinfo-btn-panel .old-charge-btn {display: none !important;}`
			}),
			// 隐藏 UP主头像外饰品
			new CheckboxItem({
				itemID: "video-page-hide-up-bili-avatar-pendent-dom",
				description: "隐藏 UP主头像外饰品",
				itemCSS: `.up-info-container .bili-avatar-pendent-dom {display: none !important;}
.up-avatar-wrap {width: 48px !important; height:48px !important;}
.up-avatar-wrap .up-avatar {background-color: transparent !important;}
.up-avatar-wrap .bili-avatar {width: 48px !important; height:48px !important; transform: unset !important;}`
			}),
			// 隐藏 UP主头像icon
			new CheckboxItem({
				itemID: "video-page-hide-up-bili-avatar-icon",
				description: "隐藏 UP主头像icon",
				itemCSS: `.up-info-container .bili-avatar-icon {display: none !important;}
.up-info-container .bili-avatar-nft-icon {display: none !important;}`
			}),
			// 隐藏 创作团队header, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-up-membersinfo-normal-header",
				description: "隐藏 创作团队header",
				defaultStatus: true,
				itemCSS: `.membersinfo-normal .header {display: none !important;}`
			})
		];
		videoGroupList.push(new Group("video-up-info", "右侧 UP主信息", upInfoItems));
		const rightItems = [
			// 优化 右栏底部吸附 实验功能
			new CheckboxItem({
				itemID: "video-page-right-container-sticky-optimize",
				description: "优化 右栏底部吸附 (实验功能)",
				itemCSS: `
/* 修复右栏底部吸附计算top时位置跳变 */
.video-container-v1 .right-container {
display: flex !important;
}
.video-container-v1 .right-container .right-container-inner {
position: sticky !important;
top: unset !important;
align-self: flex-end !important;
/* fix #87, #84 */
max-width: 100% !important;
padding-bottom: 0 !important;
}
/* 小窗播放器挡住下方视频 #87 */
body:has(.mini-player-window.on) .video-container-v1 .right-container .right-container-inner {
bottom: 240px !important;
}
body:has(.mini-player-window:not(.on)) .video-container-v1 .right-container .right-container-inner {
bottom: 10px !important;
}
`
			}),
			// 禁用 滚动页面时右栏底部吸附
			new CheckboxItem({
				itemID: "video-page-right-container-sticky-disable",
				description: "禁用 右栏底部吸附",
				itemCSS: `.right-container .right-container-inner {position: static !important;}`
			}),
			// 隐藏 广告, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-ad",
				description: "隐藏 广告",
				defaultStatus: true,
				itemCSS: `#slide_ad {display: none !important;}
.ad-report.video-card-ad-small {display: none !important;}
.video-page-special-card-small {display: none !important;}
#reco_list {margin-top: 0 !important;}`
			}),
			// 隐藏 游戏推荐
			new CheckboxItem({
				itemID: "video-page-hide-right-container-video-page-game-card-small",
				description: "隐藏 游戏推荐",
				itemCSS: `#reco_list .video-page-game-card-small {display: none !important;}`
			}),
			// 隐藏 弹幕列表, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-danmaku",
				description: "隐藏 弹幕列表",
				defaultStatus: true,
				itemCSS: `
/* 不可使用 display:none 否则播放器宽屏模式下danmukuBox的margin-top失效，导致视频覆盖右侧列表 */
#danmukuBox {
visibility: hidden !important;
height: 0 !important;
margin-bottom: 0 !important;
}`
			}),
			// 隐藏 自动连播按钮
			new CheckboxItem({
				itemID: "video-page-hide-right-container-reco-list-next-play-next-button",
				description: "隐藏 自动连播按钮",
				itemCSS: `#reco_list .next-play .next-button {display: none !important;}`
			}),
			// 隐藏 接下来播放
			new CheckboxItem({
				itemID: "video-page-hide-right-container-reco-list-next-play",
				description: "隐藏 接下来播放",
				itemCSS: `#reco_list .next-play {display: none !important;}
#reco_list .rec-list {margin-top: 0 !important;}`
			}),
			// 视频合集 增加合集列表高度, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-section-height",
				description: "视频合集 增加合集列表高度",
				defaultStatus: true,
				itemCSS: `.base-video-sections-v1 .video-sections-content-list {height: fit-content !important; max-height: 350px !important;}
.video-sections-v1 .video-sections-content-list {height: fit-content !important; max-height: 350px !important;}`
			}),
			// 隐藏 视频合集 自动连播
			new CheckboxItem({
				itemID: "video-page-hide-right-container-section-next-btn",
				description: "隐藏 视频合集 自动连播",
				itemCSS: `.base-video-sections-v1 .next-button {display: none !important;}
.video-sections-head_first-line .first-line-left {max-width: 100% !important;}
.video-sections-head_first-line .first-line-title {max-width: unset !important;}
.video-sections-head_first-line .first-line-right {display: none !important;}`
			}),
			// 隐藏 视频合集 播放量
			new CheckboxItem({
				itemID: "video-page-hide-right-container-section-play-num",
				description: "隐藏 视频合集 播放量",
				itemCSS: `.base-video-sections-v1 .play-num {display: none !important;}
.video-sections-head_second-line .play-num {display: none !important;}`
			}),
			// 隐藏 视频合集 简介, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-section-abstract",
				description: "隐藏 视频合集 简介",
				defaultStatus: true,
				itemCSS: `.base-video-sections-v1 .abstract {display: none !important;}
.base-video-sections-v1 .second-line_left img {display: none !important;}
.video-sections-head_second-line .abstract {display: none !important;}
.video-sections-head_second-line .second-line_left img {display: none !important;}`
			}),
			// 隐藏 视频合集 订阅合集
			new CheckboxItem({
				itemID: "video-page-hide-right-container-section-subscribe",
				description: "隐藏 视频合集 订阅合集",
				itemCSS: `.base-video-sections-v1 .second-line_right {display: none !important;}
.video-sections-head_second-line .second-line_right {display: none !important;}`
			}),
			// 隐藏 分P视频 自动连播
			new CheckboxItem({
				itemID: "video-page-hide-right-container-multi-page-next-btn",
				description: "隐藏 分P视频 自动连播",
				itemCSS: `#multi_page .next-button {display: none !important;}`
			}),
			// 相关视频 视频信息置底, 默认开启
			new CheckboxItem({
				itemID: "video-page-right-container-set-info-bottom",
				description: "相关视频 视频信息置底",
				defaultStatus: true,
				itemCSS: `:is(.video-page-card-small, .video-page-operator-card-small) .card-box .info {display: flex !important; flex-direction: column !important;}
:is(.video-page-card-small, .video-page-operator-card-small) .card-box .info .upname {margin-top: auto !important;}`
			}),
			// 隐藏 相关视频 视频时长
			new CheckboxItem({
				itemID: "video-page-hide-right-container-duration",
				description: "隐藏 相关视频 视频时长",
				itemCSS: `#reco_list .duration {display: none !important;}
/* 适配watchlater, favlist */
.recommend-list-container .duration {display: none !important;}`
			}),
			// 隐藏 相关视频 稍后再看按钮
			new CheckboxItem({
				itemID: "video-page-hide-right-container-reco-list-watch-later-video",
				description: "隐藏 相关视频 稍后再看按钮",
				itemCSS: `#reco_list .watch-later-video {display: none !important;}
/* 适配watchlater, favlist */
.recommend-list-container .watch-later-video {display: none !important;}`
			}),
			// 隐藏 相关视频 UP主
			new CheckboxItem({
				itemID: "video-page-hide-right-container-reco-list-rec-list-info-up",
				description: "隐藏 相关视频 UP主",
				itemCSS: `#reco_list .info .upname {
visibility: hidden !important;
}
#reco_list .info {
display: flex;
flex-direction: column;
justify-content: space-between;
}
/* 适配watchlater, favlist */
.recommend-list-container .info .upname {
display: none !important;
}
.recommend-list-container .info {
display: flex;
flex-direction: column;
justify-content: space-between;
}`
			}),
			// 隐藏 相关视频 播放和弹幕
			new CheckboxItem({
				itemID: "video-page-hide-right-container-reco-list-rec-list-info-plays",
				description: "隐藏 相关视频 播放和弹幕",
				itemCSS: `#reco_list .info .playinfo {
display: none !important;
}
#reco_list .info {
display: flex;
flex-direction: column;
justify-content: space-between;
}
/* 适配watchlater, favlist */
.recommend-list-container .info .playinfo {
display: none !important;
}
.recommend-list-container .info {
display: flex;
flex-direction: column;
justify-content: space-between;
}`
			}),
			// 隐藏 相关视频 全部列表
			new CheckboxItem({
				itemID: "video-page-hide-right-container-reco-list-rec-list",
				description: "隐藏 相关视频 全部列表",
				itemCSS: `#reco_list .rec-list {display: none !important;}
#reco_list .rec-footer {display: none !important;}
/* 适配watchlater, favlist */
.recommend-list-container {display: none !important;}`
			}),
			// 隐藏 活动banner, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-right-bottom-banner",
				description: "隐藏 活动banner",
				defaultStatus: true,
				itemCSS: `
#right-bottom-banner {
display: none !important;
}
/* 小窗视频防挡 #87 */
body:has(.mini-player-window.on) .video-container-v1 .right-container .right-container-inner {
padding-bottom: 240px;
}
body:has(.mini-player-window:not(.on)) .video-container-v1 .right-container .right-container-inner {
padding-bottom: 10px;
}
`
			}),
			// 隐藏 直播间推荐, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-live",
				description: "隐藏 直播间推荐",
				defaultStatus: true,
				itemCSS: `
.right-container .pop-live-small-mode {display: none !important;}
/* 小窗视频防挡 #87 */
body:has(.mini-player-window.on) .video-container-v1 .right-container .right-container-inner {
padding-bottom: 240px;
}
body:has(.mini-player-window:not(.on)) .video-container-v1 .right-container .right-container-inner {
padding-bottom: 10px;
}
`
			})
		];
		videoGroupList.push(new Group("video-right", "右侧 视频栏", rightItems));
		const commentItems = [
			// 隐藏 活动/notice, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-notice",
				description: "隐藏 活动/notice",
				defaultStatus: true,
				itemCSS: `.reply-header .reply-notice {display: none !important;}`
			}),
			// 隐藏 整个评论框
			new CheckboxItem({
				itemID: "video-page-hide-main-reply-box",
				description: "隐藏 整个评论框",
				// 不可使用display: none, 会使底部吸附评论框宽度变化
				itemCSS: `.main-reply-box {height: 0 !important; visibility: hidden !important;}
.comment-container .reply-list {margin-top: -20px !important;}`
			}),
			// 隐藏 页面底部 吸附评论框, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-fixed-reply-box",
				description: "隐藏 页面底部 吸附评论框",
				defaultStatus: true,
				itemCSS: `.fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 评论编辑器内占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-box-textarea-placeholder",
				description: "隐藏 评论编辑器内占位文字",
				defaultStatus: true,
				itemCSS: `.main-reply-box .reply-box-textarea::placeholder {color: transparent !important;}
.fixed-reply-box .reply-box-textarea::placeholder {color: transparent !important;}`
			}),
			// 隐藏 评论区用户卡片
			new CheckboxItem({
				itemID: "video-page-hide-comment-user-card",
				description: "隐藏 评论区用户卡片\n鼠标放在用户名上时不显示卡片",
				itemCSS: `.user-card {display: none!important;}`
			}),
			// 隐藏 评论内容右侧装饰
			new CheckboxItem({
				itemID: "video-page-hide-reply-decorate",
				description: "隐藏 评论内容右侧装饰",
				itemCSS: `.reply-decorate {display: none !important;}`
			}),
			// 隐藏 ID后粉丝牌
			new CheckboxItem({
				itemID: "video-page-hide-fan-badge",
				description: "隐藏 ID后粉丝牌",
				itemCSS: `.fan-badge {display: none !important;}`
			}),
			// 隐藏 老粉、原始粉丝Tag
			new CheckboxItem({
				itemID: "video-page-hide-contractor-box",
				description: "隐藏 老粉、原始粉丝Tag",
				itemCSS: `.contractor-box {display: none !important;}`
			}),
			// 隐藏 一级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-user-level",
				description: "隐藏 一级评论用户等级",
				itemCSS: `.user-level {display: none !important;}`
			}),
			// 隐藏 二级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-sub-user-level",
				description: "隐藏 二级评论用户等级",
				itemCSS: `.sub-user-level {display: none !important;}`
			}),
			// 隐藏 用户头像外圈饰品
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-pendent-dom",
				description: "隐藏 用户头像外圈饰品",
				itemCSS: `.root-reply-avatar .bili-avatar-pendent-dom {display: none !important;}
.comment-container .root-reply-avatar .bili-avatar {width: 48px !important; height:48px !important;}`
			}),
			// 隐藏 用户头像右下小icon
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-nft-icon",
				description: "隐藏 用户头像右下小icon",
				itemCSS: `.bili-avatar-nft-icon {display: none !important;}
.comment-container .bili-avatar-icon {display: none !important;}`
			}),
			// 隐藏 用户投票 (红方/蓝方)
			new CheckboxItem({
				itemID: "video-page-hide-vote-info",
				description: "隐藏 用户投票 (红方/蓝方)",
				itemCSS: `.vote-info {display: none !important;}`
			}),
			// 隐藏 评论内容下tag(UP觉得很赞)
			new CheckboxItem({
				itemID: "video-page-hide-reply-tag-list",
				description: "隐藏 评论内容下tag(UP觉得很赞)",
				itemCSS: `.reply-tag-list {display: none !important;}`
			}),
			// 隐藏 笔记评论前的小Logo, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-note-prefix",
				description: "隐藏 笔记评论前的小Logo",
				defaultStatus: true,
				itemCSS: `.note-prefix {display: none !important;}`
			}),
			// 隐藏 评论内容搜索关键词高亮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-jump-link-search-word",
				description: "隐藏 评论内容搜索关键词高亮",
				defaultStatus: true,
				itemCSS: `.reply-content .jump-link.search-word {color: inherit !important;}
.comment-container .reply-content .jump-link.search-word:hover {color: #008AC5 !important;}
.comment-container .reply-content .icon.search-word {display: none !important;}`
			}),
			// 隐藏 二级评论中的@高亮
			new CheckboxItem({
				itemID: "video-page-hide-reply-content-user-highlight",
				description: "隐藏 二级评论中的@高亮",
				itemCSS: `.sub-reply-container .reply-content .jump-link.user {color: inherit !important;}
.comment-container .sub-reply-container .reply-content .jump-link.user:hover {color: #40C5F1 !important;}`
			}),
			// 隐藏 召唤AI机器人的评论, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-at-bots",
				description: "隐藏 召唤AI机器人的评论",
				defaultStatus: true,
				itemCSS: (
					// 8455326 @机器工具人
					// 234978716 @有趣的程序员
					// 1141159409 @AI视频小助理
					// 437175450 @AI视频小助理总结一下 (误伤)
					// 1692825065 @AI笔记侠
					// 690155730 @AI视频助手
					// 689670224 @哔哩哔理点赞姬
					// 3494380876859618 @课代表猫
					// 1168527940 @AI课代表呀
					// 439438614 @木几萌Moe
					// 1358327273 @星崽丨StarZai
					// 3546376048741135 @AI沈阳美食家
					// 1835753760 @AI识片酱
					// 9868463 @AI头脑风暴
					// 358243654 @GPT_5
					// 393788832 @Juice_AI
					// 91394217 @AI全文总结
					// 473018527 @AI视频总结
					// 3546639035795567 @AI总结视频
					`.reply-item:has(.jump-link.user[data-user-id="8455326"]),
.reply-item:has(.jump-link.user[data-user-id="234978716"]),
.reply-item:has(.jump-link.user[data-user-id="1141159409"]),
.reply-item:has(.jump-link.user[data-user-id="437175450"]),
.reply-item:has(.jump-link.user[data-user-id="1692825065"]),
.reply-item:has(.jump-link.user[data-user-id="690155730"]),
.reply-item:has(.jump-link.user[data-user-id="689670224"]),
.reply-item:has(.jump-link.user[data-user-id="3494380876859618"]),
.reply-item:has(.jump-link.user[data-user-id="1168527940"]),
.reply-item:has(.jump-link.user[data-user-id="439438614"]),
.reply-item:has(.jump-link.user[data-user-id="1358327273"]),
.reply-item:has(.jump-link.user[data-user-id="3546376048741135"]),
.reply-item:has(.jump-link.user[data-user-id="1835753760"]),
.reply-item:has(.jump-link.user[data-user-id="9868463"]),
.reply-item:has(.jump-link.user[data-user-id="358243654"]),
.reply-item:has(.jump-link.user[data-user-id="393788832"]),
.reply-item:has(.jump-link.user[data-user-id="91394217"]),
.reply-item:has(.jump-link.user[data-user-id="473018527"]),
.reply-item:has(.jump-link.user[data-user-id="3546639035795567"]) {
display: none !important;
}`)
			}),
			// 隐藏 AI机器人发布的评论
			new CheckboxItem({
				itemID: "video-page-hide-bots-reply",
				description: "隐藏 AI机器人发布的评论",
				defaultStatus: false,
				itemCSS: (
					// 8455326 @机器工具人
					// 234978716 @有趣的程序员
					// 1141159409 @AI视频小助理
					// 437175450 @AI视频小助理总结一下 (误伤)
					// 1692825065 @AI笔记侠
					// 690155730 @AI视频助手
					// 689670224 @哔哩哔理点赞姬
					// 3494380876859618 @课代表猫
					// 1168527940 @AI课代表呀
					// 439438614 @木几萌Moe
					// 1358327273 @星崽丨StarZai
					// 3546376048741135 @AI沈阳美食家
					// 1835753760 @AI识片酱
					// 9868463 @AI头脑风暴
					// 358243654 @GPT_5
					// 393788832 @Juice_AI
					// 91394217 @AI全文总结
					// 473018527 @AI视频总结
					// 3546639035795567 @AI总结视频
					`.reply-item:has(.root-reply-container .user-name[data-user-id="8455326"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="234978716"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1141159409"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="437175450"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1692825065"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="690155730"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="689670224"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3494380876859618"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1168527940"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="439438614"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1358327273"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3546376048741135"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1835753760"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="9868463"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="358243654"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="393788832"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="91394217"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="473018527"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3546639035795567"]) {
display: none !important;
}`)
			}),
			// 隐藏 包含@的 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-at-reply",
				description: "隐藏 包含@的 无人点赞评论",
				itemCSS: `.reply-item:has(.root-reply .jump-link.user):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 包含@的 全部评论
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-all",
				description: "隐藏 包含@的 全部评论",
				itemCSS: `.reply-item:has(.root-reply .jump-link.user):not(:has(.delete-reply, .top-icon, .sub-up-icon)) {display: none !important;}`
			}),
			// 隐藏 LV1 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv1-reply",
				description: "隐藏 LV1 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-1):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV2 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv2-reply",
				description: "隐藏 LV2 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-2):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV3 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv3-reply",
				description: "隐藏 LV3 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-3):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 一级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-root-reply-dislike-reply-btn",
				description: "一级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.reply-info:not(:has(i.disliked)) .reply-btn,
.comment-container .reply-info:not(:has(i.disliked)) .reply-dislike {
visibility: hidden;
}
.comment-container .reply-item:hover .reply-btn,
.comment-container .reply-item:hover .reply-dislike {
visibility: visible !important;
}`
			}),
			// 二级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-sub-reply-dislike-reply-btn",
				description: "二级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.sub-reply-item:not(:has(i.disliked)) .sub-reply-btn,
.comment-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-dislike {
visibility: hidden;
}
.comment-container .sub-reply-item:hover .sub-reply-btn,
.comment-container .sub-reply-item:hover .sub-reply-dislike {
visibility: visible !important;
}`
			}),
			// 隐藏 大表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large",
				description: "隐藏 大表情",
				itemCSS: `.emoji-large {display: none !important;}`
			}),
			// 大表情变成小表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large-zoom",
				description: "大表情变成小表情",
				itemCSS: `.emoji-large {zoom: .5;}`
			}),
			// 用户名 全部大会员色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-pink",
				description: "用户名 全部大会员色",
				itemCSS: `.reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #FB7299 !important;}}`
			}),
			// 用户名 全部恢复默认色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-default",
				description: "用户名 全部恢复默认色",
				itemCSS: `.reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #61666d !important;}}`
			}),
			// 笔记图片 查看大图优化, 默认开启
			new CheckboxItem({
				itemID: "video-page-reply-view-image-optimize",
				description: "笔记图片 查看大图优化",
				defaultStatus: true,
				// 单图模式隐藏底部图片列表, 多图模式淡化列表, hover复原, 左右按钮增大
				itemCSS: `.reply-view-image .last-image, .reply-view-image .next-image {zoom: 1.4;}
.reply-view-image:has(.preview-item-box:only-child) .last-image {display: none !important;}
.reply-view-image:has(.preview-item-box:only-child) .next-image {display: none !important;}
.reply-view-image .preview-list {display: none !important;}`
			}),
			// 隐藏 整个评论区 #42
			new CheckboxItem({
				itemID: "video-page-hide-comment",
				description: "隐藏 整个评论区",
				itemCSS: `#comment, #comment-module {display: none;}`
			})
		];
		videoGroupList.push(new Group("video-comment", "评论区", commentItems));
		const sidebarItems = [
			// 隐藏 小窗播放开关
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-right-container-live",
				description: "隐藏 小窗播放开关",
				itemCSS: `.fixed-sidenav-storage .mini-player-window {display: none !important;}
/* 适配watchlater, favlist */
.float-nav-exp .nav-menu .item.mini {display: none !important;}`
			}),
			// 隐藏 客服, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-customer-service",
				description: "隐藏 客服",
				defaultStatus: true,
				itemCSS: `.fixed-sidenav-storage .customer-service {display: none !important;}
/* 适配watchlater, favlist */
.float-nav-exp .nav-menu a:has(>.item.help) {display: none !important;}`
			}),
			// 隐藏 回顶部
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-back-to-top",
				description: "隐藏 回顶部",
				itemCSS: `.fixed-sidenav-storage .back-to-top {display: none !important;}
/* 适配watchlater, favlist */
.float-nav-exp .nav-menu .item.backup {display: none !important;}`
			})
		];
		videoGroupList.push(new Group("video-sidebar", "页面右下角 小按钮", sidebarItems));
	}
	const bangumiGroupList = [];
	const disableAdjustVolume = () => {};
	if(isPageBangumi()) {
		const basicItems2 = [
			// 净化分享功能, 默认开启, 关闭功能需刷新
			new CheckboxItem({
				itemID: "video-page-simple-share",
				description: "净化分享功能",
				defaultStatus: true,
				itemCSS: `
#share-container-id [class^='Share_boxBottom'] {display: none !important;}
#share-container-id [class^='Share_boxTop'] {padding: 15px !important;}
#share-container-id [class^='Share_boxTopRight'] {display: none !important;}
#share-container-id [class^='Share_boxTopLeft'] {padding: 0 !important;}
`,
				enableFunc: async () => {
					let counter = 0;
					const id = setInterval(() => {
						counter++;
						const shareBtn = document.getElementById("share-container-id");
						if(shareBtn) {
							clearInterval(id);
							shareBtn.addEventListener("click", () => {
								var _a, _b;
								const mainTitle = (_a = document.querySelector("[class^='mediainfo_mediaTitle']")) == null ? void 0 : _a.textContent;
								const subTitle = (_b = document.getElementById("player-title")) == null ? void 0 : _b.textContent;
								const shareText = `《${mainTitle}》${subTitle}
https://www.bilibili.com${location.pathname}`;
								navigator.clipboard.writeText(shareText).then().catch();
							});
						} else if(counter > 50) {
							clearInterval(id);
						}
					}, 200);
				},
				enableFuncRunAt: "document-end"
			}),
			// 顶栏 滚动页面后不再吸附顶部
			new CheckboxItem({
				itemID: "video-page-hide-fixed-header",
				description: "顶栏 滚动页面后不再吸附顶部",
				itemCSS: `.fixed-header .bili-header__bar {position: relative !important;}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-basic", "版权视频播放页 基本功能", basicItems2));
		const playerInitItems = [
			// 网页全屏时 页面可滚动
			new CheckboxItem({
				itemID: "webscreen-scrollable",
				description: "网页全屏时 页面可滚动 滚轮调音量失效\n（Firefox 不适用）",
				itemCSS: `
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) {
overflow: auto !important;
position: relative !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) #bilibili-player-wrap {
position: absolute !important;
width: 100vw !important;
height: 100vh !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) .main-container {
position: static !important;
margin: 0 auto !important;
padding-top: calc(100vh + 15px) !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) .bpx-player-video-area {
flex: unset !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen'])::-webkit-scrollbar {
display: none !important;
}
/* firefox */
@-moz-document url-prefix() {
:is(html, body):has(#bilibili-player-wrap[class*='video_playerFullScreen']) {
scrollbar-width: none !important;
}
}
`,
				enableFunc: async () => {
					document.removeEventListener("wheel", disableAdjustVolume);
					document.addEventListener("wheel", disableAdjustVolume);
					waitForEle(document.body, ".bpx-player-ctrl-web", (node) => {
						return node.className.includes("bpx-player-ctrl-web");
					}).then((webBtn) => {
						if(webBtn) {
							webBtn.addEventListener("click", () => {
								if(webBtn.classList.contains("bpx-state-entered")) {
									window.scrollTo(0, 0);
								}
							});
						}
					});
				},
				enableFuncRunAt: "document-end",
				disableFunc: async () => document.removeEventListener("wheel", disableAdjustVolume)
			}),
			// 全屏时 页面可滚动
			new CheckboxItem({
				itemID: "fullscreen-scrollable",
				description: "全屏时 页面可滚动 滚轮调音量失效\n（实验功能，Firefox 不适用）",
				itemCSS: `
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) {
overflow: auto !important;
position: relative !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) .home-container {
background-color: white;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) #bilibili-player-wrap {
position: absolute !important;
width: 100vw !important;
height: 100vh !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) .main-container {
position: static !important;
margin: 0 auto !important;
padding-top: calc(100vh + 15px) !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen']) .bpx-player-video-area {
flex: unset !important;
}
body:has(#bilibili-player-wrap[class*='video_playerFullScreen'])::-webkit-scrollbar {
display: none !important;
}
/* firefox */
@-moz-document url-prefix() {
:is(html, body):has(#bilibili-player-wrap[class*='video_playerFullScreen']) {
scrollbar-width: none !important;
}
}
`,
				enableFunc: async () => {
					if(!navigator.userAgent.toLocaleLowerCase().includes("chrome")) {
						return;
					}
					document.removeEventListener("wheel", disableAdjustVolume);
					document.addEventListener("wheel", disableAdjustVolume);
					let cnt = 0;
					const id = setInterval(() => {
						var _a;
						const webBtn = document.body.querySelector(".bpx-player-ctrl-btn.bpx-player-ctrl-web");
						const fullBtn = document.body.querySelector(".bpx-player-ctrl-btn.bpx-player-ctrl-full");
						if(webBtn && fullBtn) {
							clearInterval(id);
							const isFullScreen = () => {
								if(document.fullscreenElement) {
									return "ele";
								} else if(window.innerWidth === screen.width && window.innerHeight === screen.height) {
									return "f11";
								} else {
									return "not";
								}
							};
							const isWebScreen = () => {
								return webBtn.classList.contains("bpx-state-entered");
							};
							const newFullBtn = fullBtn.cloneNode(true);
							newFullBtn.addEventListener("click", () => {
								switch(isFullScreen()) {
									case "ele":
										if(isWebScreen()) {
											webBtn.click();
										} else {
											document.exitFullscreen().then().catch();
										}
										break;
									case "f11":
										if(isWebScreen()) {
											webBtn.click();
										} else {
											webBtn.click();
										}
										break;
									case "not":
										document.body.requestFullscreen().then().catch();
										if(!isWebScreen()) {
											webBtn.click();
										}
										window.scrollTo(0, 0);
										break;
								}
							});
							(_a = fullBtn.parentElement) == null ? void 0 : _a.replaceChild(newFullBtn, fullBtn);
						} else {
							cnt++;
							cnt > 100 && clearInterval(id);
						}
					}, 100);
				},
				enableFuncRunAt: "document-end",
				disableFunc: async () => document.removeEventListener("wheel", disableAdjustVolume)
			}),
			// 普通播放 视频宽度调节
			new NumberItem({
				itemID: "normalscreen-width",
				description: "普通播放 视频宽度调节（-1禁用）",
				defaultValue: -1,
				minValue: -1,
				maxValue: 100,
				disableValue: -1,
				unit: "vw",
				// 官方样式写的棒真是太好了
				itemCSS: `.home-container:not(.wide) {--video-width: ???vw;}`,
				itemCSSPlaceholder: "???"
			})
		];
		bangumiGroupList.push(new Group("player-mode", "播放设定", playerInitItems));
		const playerItems = [
			// 隐藏 播放器内标题
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-top-left-title",
				description: "隐藏 播放器内标题",
				itemCSS: `.bpx-player-top-title {display: none !important;}
/* 播放器上方阴影渐变 */
.bpx-player-top-mask {display: none !important;}`
			}),
			// bangumi独有项：隐藏 追番/追剧按钮, 默认开启
			new CheckboxItem({
				itemID: "bangumi-page-hide-bpx-player-top-follow",
				description: "隐藏 追番/追剧按钮 ★",
				defaultStatus: true,
				itemCSS: `.bpx-player-top-follow {display: none !important;}`
			}),
			// 隐藏 反馈按钮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-top-issue",
				description: "隐藏 反馈按钮",
				defaultStatus: true,
				itemCSS: `.bpx-player-top-issue {display: none !important;}`
			}),
			// 隐藏 视频暂停时大Logo
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-state-wrap",
				description: "隐藏 视频暂停时大Logo",
				itemCSS: `.bpx-player-state-wrap {display: none !important;}`
			}),
			// bangumi独有项：隐藏 视频内封审核号(非内嵌), 默认开启
			new CheckboxItem({
				itemID: "bangumi-page-hide-bpx-player-record-item-wrap",
				description: "隐藏 视频内封审核号(非内嵌) ★",
				defaultStatus: true,
				itemCSS: `.bpx-player-record-item-wrap {display: none !important;}`
			}),
			// 隐藏 弹幕悬停 点赞/复制/举报
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dialog-wrap",
				description: "隐藏 弹幕悬停 点赞/复制/举报",
				itemCSS: `.bpx-player-dialog-wrap {display: none !important;}`
			}),
			// 隐藏 高赞弹幕前点赞按钮
			new CheckboxItem({
				itemID: "video-page-bpx-player-bili-high-icon",
				description: "隐藏 高赞弹幕前点赞按钮",
				itemCSS: `.bili-high-icon {display: none !important}`
			}),
			// 彩色渐变弹幕 变成白色
			new CheckboxItem({
				itemID: "video-page-bpx-player-bili-dm-vip-white",
				description: "彩色渐变弹幕 变成白色",
				itemCSS: `#bilibili-player .bili-dm>.bili-dm-vip {
background: unset !important;
background-size: unset !important;
/* 父元素未指定 var(--textShadow), 默认重墨描边凑合用 */
text-shadow: 1px 0 1px #000000,0 1px 1px #000000,0 -1px 1px #000000,-1px 0 1px #000000 !important;
text-stroke: none !important;
-webkit-text-stroke: none !important;
-moz-text-stroke: none !important;
-ms-text-stroke: none !important;
}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-player", "播放器 (★为独有项)", playerItems));
		const miniPlayerItems = [
			// 隐藏底边进度
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-mini-mode-process",
				description: "隐藏底边进度",
				defaultStatus: true,
				itemCSS: `.bpx-player-container[data-screen=mini]:not(:hover) .bpx-player-mini-progress {display: none;}`
			}),
			// 隐藏弹幕
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-mini-mode-danmaku",
				description: "隐藏弹幕",
				itemCSS: `.bpx-player-container[data-screen=mini] .bpx-player-row-dm-wrap {visibility: hidden !important;}`
			}),
			// 滚轮调节大小
			new CheckboxItem({
				itemID: "video-page-bpx-player-mini-mode-wheel-adjust",
				description: "滚轮调节大小",
				enableFunc: async () => {
					try {
						const insertCSS = (zoom) => {
							const cssText = `
.bpx-player-container[data-screen=mini] {
height: calc(225px * ${zoom}) !important;
width: calc(400px * ${zoom}) !important;
}
.bpx-player-container[data-revision="1"][data-screen=mini],
.bpx-player-container[data-revision="2"][data-screen=mini] {
height: calc(180px * ${zoom}) !important;
width: calc(320px * ${zoom}) !important;
}
@media screen and (min-width:1681px) {
.bpx-player-container[data-revision="1"][data-screen=mini],
.bpx-player-container[data-revision="2"][data-screen=mini] {
height: calc(203px * ${zoom}) !important;
width: calc(360px * ${zoom}) !important;
}
}`.replace(/\n\s*/g, "").trim();
							const node = document.querySelector(`html>style[bili-cleaner-css=video-page-bpx-player-mini-mode-wheel-adjust]`);
							if(node) {
								node.innerHTML = cssText;
							} else {
								const style = document.createElement("style");
								style.innerHTML = cssText;
								style.setAttribute("bili-cleaner-css", "video-page-bpx-player-mini-mode-wheel-adjust");
								document.documentElement.appendChild(style);
							}
						};
						const oldZoom = _GM_getValue("BILICLEANER_video-page-bpx-player-mini-mode-zoom");
						oldZoom && insertCSS(oldZoom);
						let cnt = 0;
						const interval = setInterval(() => {
							const player = document.querySelector(".bpx-player-container");
							if(player) {
								clearInterval(interval);
								let flag = false;
								player.addEventListener("mouseenter", () => {
									if(player.getAttribute("data-screen") === "mini") {
										flag = true;
									}
								});
								player.addEventListener("mouseleave", () => {
									flag = false;
								});
								let lastZoom = oldZoom || 1;
								player.addEventListener("wheel", (e) => {
									if(flag) {
										e.stopPropagation();
										e.preventDefault();
										const scaleSpeed = 5;
										let zoom = lastZoom - Math.sign(e.deltaY) * scaleSpeed / 100;
										zoom = zoom < 0.5 ? 0.5 : zoom;
										zoom = zoom > 3 ? 3 : zoom;
										if(zoom !== lastZoom) {
											lastZoom = zoom;
											insertCSS(zoom);
											_GM_setValue("BILICLEANER_video-page-bpx-player-mini-mode-zoom", zoom);
										}
									}
								});
							} else {
								cnt++;
								if(cnt > 20) {
									clearInterval(interval);
								}
							}
						}, 500);
					} catch (err) {
						error("adjust mini player size error");
						error(err);
					}
				},
				enableFuncRunAt: "document-end",
				disableFunc: async () => {
					var _a;
					(_a = document.querySelector(`style[bili-cleaner-css=video-page-bpx-player-mini-mode-wheel-adjust]`)) == null ? void 0 : _a.remove();
				}
			}),
			// 记录小窗位置
			new CheckboxItem({
				itemID: "video-page-bpx-player-mini-mode-position-record",
				description: "记录小窗位置",
				enableFunc: async () => {
					let player;
					const addMiniPlayerMoveListener = () => {
						if(!player) {
							return;
						}
						player.addEventListener("mouseup", () => {
							if(player.getAttribute("data-screen") !== "mini") {
								return;
							}
							_GM_setValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-right", parseInt(player.style.right));
							_GM_setValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-bottom", parseInt(player.style.bottom));
						});
					};
					const setMiniPlayerState = () => {
						const right = _GM_getValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-right");
						const bottom = _GM_getValue("BILICLEANER_video-page-bpx-player-mini-mode-position-record-bottom");
						if(typeof right === "number" && typeof bottom === "number") {
							if(_unsafeWindow.player) {
								_unsafeWindow.player.__core().uiStore.state.miniScreenRight = right;
								_unsafeWindow.player.__core().uiStore.state.miniScreenBottom = bottom;
							}
						}
					};
					waitForEle(document.body, `#bilibili-player [class^="bpx-player-video"]`, (node) => {
						return node.className.startsWith("bpx-player-video");
					}).then(() => {
						player = document.querySelector("#bilibili-player .bpx-player-container");
						try {
							setMiniPlayerState();
							addMiniPlayerMoveListener();
						} catch {}
					});
				},
				enableFuncRunAt: "document-end"
			})
		];
		bangumiGroupList.push(new Group("bangumi-mini-player", "小窗播放器", miniPlayerItems));
		const playerControlItems = [
			// 隐藏 上一个视频
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-prev",
				description: "隐藏 上一个视频",
				itemCSS: `.bpx-player-ctrl-prev {display: none !important;}`
			}),
			// 隐藏 播放/暂停
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-play",
				description: "隐藏 播放/暂停",
				itemCSS: `.bpx-player-ctrl-play {display: none !important;}`
			}),
			// 隐藏 下一个视频
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-next",
				description: "隐藏 下一个视频",
				itemCSS: `.bpx-player-ctrl-next {display: none !important;}`
			}),
			// 隐藏 Hi-Res无损
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-flac",
				description: "隐藏 Hi-Res无损",
				itemCSS: `.bpx-player-ctrl-flac {display: none !important;}`
			}),
			// 隐藏 清晰度
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-quality",
				description: "隐藏 清晰度",
				itemCSS: `.bpx-player-ctrl-quality {display: none !important;}`
			}),
			// 隐藏 选集
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-eplist",
				description: "隐藏 选集",
				itemCSS: `.bpx-player-ctrl-eplist {display: none !important;}`
			}),
			// 隐藏 倍速
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-playbackrate",
				description: "隐藏 倍速",
				itemCSS: `.bpx-player-ctrl-playbackrate {display: none !important;}`
			}),
			// 隐藏 字幕
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-subtitle",
				description: "隐藏 字幕",
				itemCSS: `.bpx-player-ctrl-subtitle {display: none !important;}`
			}),
			// 隐藏 音量
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-volume",
				description: "隐藏 音量",
				itemCSS: `.bpx-player-ctrl-volume {display: none !important;}`
			}),
			// 隐藏 视频设置
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-setting",
				description: "隐藏 视频设置",
				itemCSS: `.bpx-player-ctrl-setting {display: none !important;}`
			}),
			// 隐藏 画中画(Chrome)
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-pip",
				description: "隐藏 画中画(Chrome)",
				itemCSS: `.bpx-player-ctrl-pip {display: none !important;}`
			}),
			// 隐藏 宽屏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-wide",
				description: "隐藏 宽屏",
				itemCSS: `.bpx-player-ctrl-wide {display: none !important;}`
			}),
			// 隐藏 网页全屏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-web",
				description: "隐藏 网页全屏",
				itemCSS: `.bpx-player-ctrl-web {display: none !important;}`
			}),
			// 隐藏 全屏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-ctrl-full",
				description: "隐藏 全屏",
				itemCSS: `.bpx-player-ctrl-full {display: none !important;}`
			}),
			// 隐藏 高能进度条 图钉按钮
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-pbp-pin",
				description: "隐藏 高能进度条 图钉按钮",
				itemCSS: `.bpx-player-pbp-pin {display: none !important;}`
			}),
			// 隐藏 底边mini视频进度, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-shadow-progress-area",
				description: "隐藏 底边mini视频进度",
				defaultStatus: true,
				itemCSS: `.bpx-player-shadow-progress-area {display: none !important;}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-player-control", "播放控制", playerControlItems));
		const danmakuItems = [
			// 隐藏 同时在看人数
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-info-online",
				description: "隐藏 同时在看人数",
				itemCSS: `.bpx-player-video-info-online, .bpx-player-video-info-divide {display: none !important;}`
			}),
			// 隐藏 载入弹幕数量
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-info-dm",
				description: "隐藏 载入弹幕数量",
				itemCSS: `.bpx-player-video-info-dm, .bpx-player-video-info-divide {display: none !important;}`
			}),
			// 隐藏 弹幕启用
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-switch",
				description: "隐藏 弹幕启用",
				itemCSS: `.bpx-player-dm-switch {display: none !important;}`
			}),
			// 隐藏 弹幕显示设置
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-setting",
				description: "隐藏 弹幕显示设置",
				itemCSS: `.bpx-player-dm-setting {display: none !important;}`
			}),
			// 隐藏 弹幕样式
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-btn-dm",
				description: "隐藏 弹幕样式",
				itemCSS: `.bpx-player-video-btn-dm {display: none !important;}`
			}),
			// 隐藏 占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-input",
				description: "隐藏 占位文字",
				defaultStatus: true,
				itemCSS: `.bpx-player-dm-input::placeholder {color: transparent !important;}`
			}),
			// 隐藏 弹幕礼仪, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-hint",
				description: "隐藏 弹幕礼仪",
				defaultStatus: true,
				itemCSS: `.bpx-player-dm-hint {display: none !important;}`
			}),
			// 隐藏 发送按钮
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-dm-btn-send",
				description: "隐藏 发送按钮",
				itemCSS: `.bpx-player-dm-btn-send {display: none !important;}`
			}),
			// 非全屏下 关闭弹幕栏
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-sending-area",
				description: "非全屏下 关闭弹幕栏",
				itemCSS: `.bpx-player-sending-area {display: none !important;}
/* 关闭弹幕栏后 播放器去黑边 */
#bilibili-player-wrap[class^='video_playerNormal'] {height: calc(var(--video-width)*.5625)}
#bilibili-player-wrap[class^='video_playerWide'] {height: calc(var(--containerWidth)*.5625)}
`
			}),
			// 全屏下 关闭弹幕输入框
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-video-inputbar",
				description: "全屏下 关闭弹幕输入框",
				itemCSS: `.bpx-player-container[data-screen=full] .bpx-player-control-bottom-center .bpx-player-video-inputbar,
.bpx-player-container[data-screen=web] .bpx-player-control-bottom-center .bpx-player-video-inputbar {
display: none !important;
}
.bpx-player-container[data-screen=full] .bpx-player-control-bottom-center,
.bpx-player-container[data-screen=web] .bpx-player-control-bottom-center {
padding: 0 15px !important;
}
/* 弹幕开关按钮贴紧左侧, 有章节列表时增大列表宽度 */
.bpx-player-container[data-screen=full] .bpx-player-control-bottom-left,
.bpx-player-container[data-screen=web] .bpx-player-control-bottom-left {
min-width: unset !important;
}
.bpx-player-container[data-screen=full] .bpx-player-ctrl-viewpoint,
.bpx-player-container[data-screen=web] .bpx-player-ctrl-viewpoint {
width: fit-content !important;
}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-danmaku", "弹幕栏", danmakuItems));
		const toolbarItems = [
			// 投币时不自动点赞 #46
			new CheckboxItem({
				itemID: "video-page-coin-disable-auto-like",
				description: "投币时不自动点赞 (关闭需刷新)",
				enableFunc: async () => {
					const disableAutoLike = () => {
						let counter = 0;
						const timer = setInterval(() => {
							const checkbox = document.querySelector('.main-container [class^="dialogcoin_like_checkbox"] input');
							if(checkbox) {
								checkbox.checked && checkbox.click();
								clearInterval(timer);
							} else {
								counter++;
								if(counter > 100) {
									clearInterval(timer);
								}
							}
						}, 20);
					};
					const coinBtn = document.querySelector("#ogv_weslie_tool_coin_info");
					if(coinBtn) {
						coinBtn.addEventListener("click", disableAutoLike);
					} else {
						document.addEventListener("DOMContentLoaded", () => {
							const coinBtn2 = document.querySelector("#ogv_weslie_tool_coin_info");
							coinBtn2 == null ? void 0 : coinBtn2.addEventListener("click", disableAutoLike);
						});
					}
				}
			}),
			// 隐藏 分享按钮弹出菜单, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-video-share-popover",
				description: "隐藏 分享按钮弹出菜单",
				defaultStatus: true,
				itemCSS: `#share-container-id [class^='Share_share'] {display: none !important;}`
			}),
			// bangumi独有项：隐藏 一起看, 默认开启
			new CheckboxItem({
				itemID: "bangumi-page-hide-watch-together",
				description: "隐藏 一起看 ★",
				defaultStatus: true,
				itemCSS: `.toolbar span:has(>#watch_together_tab) {display: none !important;}`
			}),
			// bangumi独有项：隐藏 整个工具栏(赞币转)
			new CheckboxItem({
				itemID: "bangumi-page-hide-toolbar",
				description: "隐藏 整个工具栏(赞币转) ★",
				itemCSS: `.player-left-components .toolbar {display: none !important;}`
			}),
			// bangumi独有项：隐藏 作品介绍
			new CheckboxItem({
				itemID: "bangumi-page-hide-media-info",
				description: "隐藏 作品介绍 ★",
				itemCSS: `[class^='mediainfo_mediaInfo'] {display: none !important;}`
			}),
			// bangumi独有项：精简 作品介绍, 默认开启
			new CheckboxItem({
				itemID: "bangumi-page-simple-media-info",
				description: "精简 作品介绍 ★",
				defaultStatus: true,
				itemCSS: `[class^='mediainfo_btnHome'], [class^='upinfo_upInfoCard'] {display: none !important;}
[class^='mediainfo_score'] {font-size: 25px !important;}
[class^='mediainfo_mediaDesc']:has( + [class^='mediainfo_media_desc_section']) {
visibility: hidden !important;
height: 0 !important;
margin-bottom: 8px !important;
}
[class^='mediainfo_media_desc_section'] {height: 60px !important;}`
			}),
			// bangumi独有项：隐藏 承包榜
			new CheckboxItem({
				itemID: "bangumi-page-hide-sponsor-module",
				description: "隐藏 承包榜 ★",
				itemCSS: `#sponsor_module {display: none !important;}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-toolbar", "视频下方 工具栏/作品信息", toolbarItems));
		const rightItems = [
			// bangumi独有项：隐藏 大会员按钮, 默认开启
			new CheckboxItem({
				itemID: "bangumi-page-hide-right-container-section-height",
				description: "隐藏 大会员按钮 ★",
				defaultStatus: true,
				itemCSS: `.plp-r [class^='vipPaybar_'], .plp-r [class^='paybar_'] {display: none !important;}`
			}),
			// 隐藏 弹幕列表, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-danmaku",
				description: "隐藏 弹幕列表",
				defaultStatus: true,
				itemCSS: `#danmukuBox {display: none !important;}`
			}),
			// bangumi独有项：隐藏 视频列表 会员/限免标记
			new CheckboxItem({
				itemID: "bangumi-page-hide-eplist-badge",
				description: "隐藏 视频列表 会员/限免标记 ★",
				// 蓝色预告badge不可隐藏
				itemCSS: `[class^='eplist_ep_list_wrapper'] [class^='imageListItem_badge']:not([style*='#00C0FF']) {display: none !important;}
[class^='eplist_ep_list_wrapper'] [class^='numberListItem_badge']:not([style*='#00C0FF']) {display: none !important;}`
			}),
			// bangumi独有项：隐藏 相关作品推荐 ★
			new CheckboxItem({
				itemID: "bangumi-page-hide-recommend",
				description: "隐藏 相关作品推荐 ★",
				itemCSS: `.plp-r [class^='recommend_wrap'] {display: none !important;}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-right", "右栏 作品选集/作品推荐", rightItems));
		const commentItems = [
			// 隐藏 活动/notice, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-notice",
				description: "隐藏 活动/notice",
				defaultStatus: true,
				itemCSS: `.reply-header .reply-notice {display: none !important;}`
			}),
			// 隐藏 整个评论框
			new CheckboxItem({
				itemID: "video-page-hide-main-reply-box",
				description: "隐藏 整个评论框",
				itemCSS: `.main-reply-box {height: 0 !important; visibility: hidden !important;}
.reply-list {margin-top: -20px !important;}`
			}),
			// 隐藏 页面底部 吸附评论框, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-fixed-reply-box",
				description: "隐藏 页面底部 吸附评论框",
				defaultStatus: true,
				itemCSS: `.fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 评论编辑器内占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-box-textarea-placeholder",
				description: "隐藏 评论编辑器内占位文字",
				defaultStatus: true,
				itemCSS: `.main-reply-box .reply-box-textarea::placeholder {color: transparent !important;}
.fixed-reply-box .reply-box-textarea::placeholder {color: transparent !important;}`
			}),
			// 隐藏 评论区用户卡片
			new CheckboxItem({
				itemID: "video-page-hide-comment-user-card",
				description: "隐藏 评论区用户卡片\n鼠标放在用户名上时不显示卡片",
				itemCSS: `.user-card {display: none!important;}`
			}),
			// 隐藏 评论内容右侧装饰
			new CheckboxItem({
				itemID: "video-page-hide-reply-decorate",
				description: "隐藏 评论内容右侧装饰",
				itemCSS: `.reply-decorate {display: none !important;}`
			}),
			// 隐藏 ID后粉丝牌
			new CheckboxItem({
				itemID: "video-page-hide-fan-badge",
				description: "隐藏 ID后粉丝牌",
				itemCSS: `.fan-badge {display: none !important;}`
			}),
			// 隐藏 一级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-user-level",
				description: "隐藏 一级评论用户等级",
				itemCSS: `.user-level {display: none !important;}`
			}),
			// 隐藏 二级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-sub-user-level",
				description: "隐藏 二级评论用户等级",
				itemCSS: `.sub-user-level {display: none !important;}`
			}),
			// 隐藏 用户头像外圈饰品
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-pendent-dom",
				description: "隐藏 用户头像外圈饰品",
				itemCSS: `.root-reply-avatar .bili-avatar-pendent-dom {display: none !important;}
.root-reply-avatar .bili-avatar {width: 48px !important; height:48px !important;}`
			}),
			// 隐藏 用户头像右下小icon
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-nft-icon",
				description: "隐藏 用户头像右下小icon",
				itemCSS: `.bili-avatar-nft-icon {display: none !important;}
.bili-avatar-icon {display: none !important;}`
			}),
			// 隐藏 评论内容下tag(热评)
			new CheckboxItem({
				itemID: "video-page-hide-reply-tag-list",
				description: "隐藏 评论内容下tag(热评)",
				itemCSS: `.reply-tag-list {display: none !important;}`
			}),
			// 隐藏 笔记评论前的小Logo, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-note-prefix",
				description: "隐藏 笔记评论前的小Logo",
				defaultStatus: true,
				itemCSS: `.note-prefix {display: none !important;}`
			}),
			// 隐藏 评论内容搜索关键词高亮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-jump-link-search-word",
				description: "隐藏 评论内容搜索关键词高亮",
				defaultStatus: true,
				itemCSS: `.reply-content .jump-link.search-word {color: inherit !important;}
.reply-content .jump-link.search-word:hover {color: #008AC5 !important;}
.reply-content .icon.search-word {display: none !important;}`
			}),
			// 隐藏 二级评论中的@高亮
			new CheckboxItem({
				itemID: "video-page-hide-reply-content-user-highlight",
				description: "隐藏 二级评论中的@高亮",
				itemCSS: `.sub-reply-container .reply-content .jump-link.user {color: inherit !important;}
.sub-reply-container .reply-content .jump-link.user:hover {color: #40C5F1 !important;}`
			}),
			// 隐藏 召唤AI机器人的评论, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-at-bots",
				description: "隐藏 召唤AI机器人的评论",
				defaultStatus: true,
				itemCSS: (
					// 8455326 @机器工具人
					// 234978716 @有趣的程序员
					// 1141159409 @AI视频小助理
					// 437175450 @AI视频小助理总结一下 (误伤)
					// 1692825065 @AI笔记侠
					// 690155730 @AI视频助手
					// 689670224 @哔哩哔理点赞姬
					// 3494380876859618 @课代表猫
					// 1168527940 @AI课代表呀
					// 439438614 @木几萌Moe
					// 1358327273 @星崽丨StarZai
					// 3546376048741135 @AI沈阳美食家
					// 1835753760 @AI识片酱
					// 9868463 @AI头脑风暴
					// 358243654 @GPT_5
					// 393788832 @Juice_AI
					// 91394217 @AI全文总结
					// 473018527 @AI视频总结
					// 3546639035795567 @AI总结视频
					`.reply-item:has(.jump-link.user[data-user-id="8455326"]),
.reply-item:has(.jump-link.user[data-user-id="234978716"]),
.reply-item:has(.jump-link.user[data-user-id="1141159409"]),
.reply-item:has(.jump-link.user[data-user-id="437175450"]),
.reply-item:has(.jump-link.user[data-user-id="1692825065"]),
.reply-item:has(.jump-link.user[data-user-id="690155730"]),
.reply-item:has(.jump-link.user[data-user-id="689670224"]),
.reply-item:has(.jump-link.user[data-user-id="3494380876859618"]),
.reply-item:has(.jump-link.user[data-user-id="1168527940"]),
.reply-item:has(.jump-link.user[data-user-id="439438614"]),
.reply-item:has(.jump-link.user[data-user-id="1358327273"]),
.reply-item:has(.jump-link.user[data-user-id="3546376048741135"]),
.reply-item:has(.jump-link.user[data-user-id="1835753760"]),
.reply-item:has(.jump-link.user[data-user-id="9868463"]),
.reply-item:has(.jump-link.user[data-user-id="358243654"]),
.reply-item:has(.jump-link.user[data-user-id="393788832"]),
.reply-item:has(.jump-link.user[data-user-id="91394217"]),
.reply-item:has(.jump-link.user[data-user-id="473018527"]),
.reply-item:has(.jump-link.user[data-user-id="3546639035795567"]) {
display: none !important;
}`)
			}),
			// 隐藏 AI机器人发布的评论
			new CheckboxItem({
				itemID: "video-page-hide-bots-reply",
				description: "隐藏 AI机器人发布的评论",
				defaultStatus: false,
				itemCSS: (
					// 8455326 @机器工具人
					// 234978716 @有趣的程序员
					// 1141159409 @AI视频小助理
					// 437175450 @AI视频小助理总结一下 (误伤)
					// 1692825065 @AI笔记侠
					// 690155730 @AI视频助手
					// 689670224 @哔哩哔理点赞姬
					// 3494380876859618 @课代表猫
					// 1168527940 @AI课代表呀
					// 439438614 @木几萌Moe
					// 1358327273 @星崽丨StarZai
					// 3546376048741135 @AI沈阳美食家
					// 1835753760 @AI识片酱
					// 9868463 @AI头脑风暴
					// 358243654 @GPT_5
					// 393788832 @Juice_AI
					// 91394217 @AI全文总结
					// 473018527 @AI视频总结
					// 3546639035795567 @AI总结视频
					`.reply-item:has(.root-reply-container .user-name[data-user-id="8455326"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="234978716"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1141159409"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="437175450"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1692825065"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="690155730"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="689670224"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3494380876859618"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1168527940"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="439438614"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1358327273"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3546376048741135"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1835753760"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="9868463"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="358243654"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="393788832"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="91394217"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="473018527"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3546639035795567"]) {
display: none !important;
}`)
			}),
			// 隐藏 包含@的 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-at-reply",
				description: "隐藏 包含@的 无人点赞评论",
				itemCSS: `.reply-item:has(.root-reply .jump-link.user):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 包含@的 全部评论
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-all",
				description: "隐藏 包含@的 全部评论",
				itemCSS: `.reply-item:has(.root-reply .jump-link.user):not(:has(.delete-reply, .top-icon, .sub-up-icon)) {display: none !important;}`
			}),
			// 隐藏 LV1 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv1-reply",
				description: "隐藏 LV1 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-1):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV2 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv2-reply",
				description: "隐藏 LV2 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-2):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV3 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv3-reply",
				description: "隐藏 LV3 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-3):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 一级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-root-reply-dislike-reply-btn",
				description: "一级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.reply-info:not(:has(i.disliked)) .reply-btn,
.reply-info:not(:has(i.disliked)) .reply-dislike {
visibility: hidden;
}
.reply-item:hover .reply-info .reply-btn,
.reply-item:hover .reply-info .reply-dislike {
visibility: visible !important;
}`
			}),
			// 二级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-sub-reply-dislike-reply-btn",
				description: "二级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.sub-reply-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-btn,
.sub-reply-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-dislike {
visibility: hidden;
}
.sub-reply-container .sub-reply-item:hover .sub-reply-btn,
.sub-reply-container .sub-reply-item:hover .sub-reply-dislike {
visibility: visible !important;
}`
			}),
			// 隐藏 大表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large",
				description: "隐藏 大表情",
				itemCSS: `.emoji-large {display: none !important;}`
			}),
			// 大表情变成小表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large-zoom",
				description: "大表情变成小表情",
				itemCSS: `.emoji-large {zoom: .5;}`
			}),
			// 用户名 全部大会员色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-pink",
				description: "用户名 全部大会员色",
				itemCSS: `.reply-item .user-name, .reply-item .sub-user-name {color: #FB7299 !important;}}`
			}),
			// 用户名 全部恢复默认色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-default",
				description: "用户名 全部恢复默认色",
				itemCSS: `.reply-item .user-name, .reply-item .sub-user-name {color: #61666d !important;}}`
			}),
			// 笔记图片 查看大图优化, 默认开启
			new CheckboxItem({
				itemID: "video-page-reply-view-image-optimize",
				description: "笔记图片 查看大图优化",
				defaultStatus: true,
				// 单图模式隐藏底部图片列表, 多图模式淡化列表, hover复原, 左右按钮增大
				itemCSS: `.reply-view-image .last-image, .reply-view-image .next-image {zoom: 1.4;}
.reply-view-image:has(.preview-item-box:only-child) .last-image {display: none !important;}
.reply-view-image:has(.preview-item-box:only-child) .next-image {display: none !important;}
.reply-view-image .preview-list {display: none !important;}`
			}),
			// 隐藏 整个评论区
			new CheckboxItem({
				itemID: "video-page-hide-comment",
				description: "隐藏 整个评论区",
				itemCSS: `#comment, {display: none;}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-comment", "评论区", commentItems));
		const sidebarItems = [
			// bangumi独有项：隐藏 新版反馈, 默认开启
			new CheckboxItem({
				itemID: "bangumi-page-hide-sidenav-issue",
				description: "隐藏 新版反馈 ★",
				defaultStatus: true,
				itemCSS: `[class*='navTools_navMenu'] [title='新版反馈'] {display: none !important;}`
			}),
			// 隐藏 小窗播放开关
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-mini",
				description: "隐藏 小窗播放开关",
				itemCSS: `[class*='navTools_navMenu'] [title*='迷你播放器'] {display: none !important;}`
			}),
			// 隐藏 客服, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-customer-service",
				description: "隐藏 客服",
				defaultStatus: true,
				itemCSS: `[class*='navTools_navMenu'] [title='帮助反馈'] {display: none !important;}`
			}),
			// 隐藏 回顶部
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-back-to-top",
				description: "隐藏 回顶部",
				itemCSS: `[class*='navTools_navMenu'] [title='返回顶部'] {display: none !important;}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-sidebar", "页面右下角 小按钮", sidebarItems));
	}
	const searchGroupList = [];
	if(isPageSearch()) {
		const basicItems2 = [
			// 顶栏 滚动页面后不再吸附顶部
			new CheckboxItem({
				itemID: "hide-search-page-search-sticky-header",
				description: "顶栏 滚动页面后不再吸附顶部",
				itemCSS: `.search-sticky-header {display: none !important;}`
			}),
			// 隐藏 搜索结果中的广告, 默认开启
			new CheckboxItem({
				itemID: "hide-search-page-ad",
				description: "隐藏 搜索结果中的广告",
				defaultStatus: true,
				itemCSS: `.video-list.row>div:has([href*="cm.bilibili.com"]) {display: none !important;}`
			}),
			// 隐藏 搜索结果顶部 版权作品
			new CheckboxItem({
				itemID: "hide-search-page-bangumi-pgc-list",
				description: "隐藏 搜索结果顶部 版权作品",
				itemCSS: `.bangumi-pgc-list {display: none !important;}`
			}),
			// 隐藏 搜索结果顶部 游戏、热搜话题
			new CheckboxItem({
				itemID: "hide-search-page-activity-game-list",
				description: "隐藏 搜索结果顶部 游戏、热搜话题",
				itemCSS: `.activity-game-list {display: none !important;}`
			}),
			// 隐藏 弹幕数量, 默认开启
			new CheckboxItem({
				itemID: "hide-search-page-danmaku-count",
				description: "隐藏 弹幕数量",
				defaultStatus: true,
				itemCSS: `.bili-video-card .bili-video-card__stats--left .bili-video-card__stats--item:nth-child(2) {display: none !important;}`
			}),
			// 隐藏 视频日期
			new CheckboxItem({
				itemID: "hide-search-page-date",
				description: "隐藏 视频日期",
				itemCSS: `.bili-video-card .bili-video-card__info--date {display: none !important;}`
			}),
			// 隐藏 稍后再看按钮
			new CheckboxItem({
				itemID: "hide-search-page-bili-watch-later",
				description: "隐藏 稍后再看按钮",
				itemCSS: `.bili-video-card .bili-watch-later {display: none !important;}`
			})
		];
		searchGroupList.push(new Group("search-basic", "搜索页 基本功能", basicItems2));
		const sidebarItems = [
			// 隐藏 客服, 默认开启
			new CheckboxItem({
				itemID: "hide-search-page-customer-service",
				description: "隐藏 客服",
				defaultStatus: true,
				itemCSS: `.side-buttons div:has(>a[href*="customer-service"]) {display: none !important;}`
			}),
			// 隐藏 回顶部
			new CheckboxItem({
				itemID: "hide-search-page-btn-to-top",
				description: "隐藏 回顶部",
				itemCSS: `.side-buttons .btn-to-top-wrap {display: none !important;}`
			})
		];
		searchGroupList.push(new Group("search-sidebar", "页面右下角 小按钮", sidebarItems));
	}
	const fontFaceRegular = '@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.a.woff2) format("woff2");unicode-range:U+9aa2-ffe5}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.b.woff2) format("woff2");unicode-range:U+8983-9aa0}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.c.woff2) format("woff2");unicode-range:U+78f2-897b}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.d.woff2) format("woff2");unicode-range:U+646d-78d9}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.e.woff2) format("woff2");unicode-range:U+30e0-6445}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.f.woff2) format("woff2");unicode-range:U+101-30df}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.g.woff2) format("woff2");unicode-range:U+9aa8,U+9ab8,U+9ad3,U+9ad8,U+9b03,U+9b3c,U+9b41-9b42,U+9b44,U+9b4f,U+9b54,U+9c7c,U+9c81,U+9c8d,U+9c9c,U+9ca4,U+9cb8,U+9cc3,U+9cd6,U+9cde,U+9e1f,U+9e21,U+9e23,U+9e25-9e26,U+9e2d,U+9e2f,U+9e33,U+9e35,U+9e3d,U+9e3f,U+9e43,U+9e45,U+9e4a,U+9e4f,U+9e64,U+9e70,U+9e7f,U+9e93,U+9ea6,U+9ebb,U+9ec4,U+9ecd-9ece,U+9ed1,U+9ed4,U+9ed8,U+9f0e,U+9f13,U+9f20,U+9f3b,U+9f50,U+9f7f,U+9f84,U+9f8b,U+9f99-9f9a,U+9f9f,U+ff01,U+ff08-ff09,U+ff0c,U+ff1a-ff1b,U+ff1f}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.h.woff2) format("woff2");unicode-range:U+975b,U+975e,U+9760-9762,U+9769,U+9773-9774,U+9776,U+978b,U+978d,U+9798,U+97a0,U+97ad,U+97e6-97e7,U+97e9,U+97ed,U+97f3,U+97f5-97f6,U+9875-9877,U+9879-987b,U+987d-987f,U+9881-9882,U+9884-9888,U+988a,U+9890-9891,U+9893,U+9896-9898,U+989c-989d,U+98a0,U+98a4,U+98a7,U+98ce,U+98d8,U+98de-98df,U+9910,U+9965,U+996d-9972,U+9975-9976,U+997a,U+997c,U+997f,U+9981,U+9985-9986,U+9988,U+998b,U+998f,U+9992,U+9996,U+9999,U+9a6c-9a71,U+9a73-9a74,U+9a76,U+9a79,U+9a7b-9a7c,U+9a7e,U+9a82,U+9a84,U+9a86-9a87,U+9a8b-9a8c,U+9a8f,U+9a91,U+9a97,U+9a9a,U+9aa1,U+9aa4}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.i.woff2) format("woff2");unicode-range:U+9570,U+9576,U+957f,U+95e8,U+95ea,U+95ed-95f0,U+95f2,U+95f4,U+95f7-95fb,U+95fd,U+9600-9602,U+9605,U+9609,U+960e,U+9610-9611,U+9614,U+961c,U+961f,U+962e,U+9632-9636,U+963b,U+963f-9640,U+9644-9648,U+964b-964d,U+9650,U+9655,U+965b,U+9661-9662,U+9664,U+9668-966a,U+9675-9677,U+9685-9686,U+968b,U+968f-9690,U+9694,U+9698-9699,U+969c,U+96a7,U+96b6,U+96be,U+96c0-96c1,U+96c4-96c7,U+96cc-96cd,U+96cf,U+96d5,U+96e8,U+96ea,U+96f6-96f7,U+96f9,U+96fe,U+9700,U+9704,U+9707,U+9709,U+970d,U+9713,U+9716,U+971c,U+971e,U+9732,U+9738-9739,U+9752,U+9756,U+9759}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.j.woff2) format("woff2");unicode-range:U+9179,U+917f,U+9187,U+9189,U+918b,U+918d,U+9190,U+9192,U+919a-919b,U+91ba,U+91c7,U+91c9-91ca,U+91cc-91cf,U+91d1,U+91dc,U+9274,U+93d6,U+9488-9489,U+948e,U+9492-9493,U+9497,U+9499,U+949d-94a3,U+94a5-94a9,U+94ae,U+94b1,U+94b3,U+94b5,U+94bb,U+94be,U+94c0-94c3,U+94c5-94c6,U+94dc-94dd,U+94e1,U+94e3,U+94ec-94ed,U+94f0-94f2,U+94f6,U+94f8,U+94fa,U+94fe,U+9500-9501,U+9504-9505,U+9508,U+950b-950c,U+9510-9511,U+9517,U+9519-951a,U+9521,U+9523-9526,U+9528,U+952d-9530,U+9539,U+953b,U+9540-9541,U+9547,U+954a,U+954d,U+9550-9551,U+955c,U+9563,U+956d}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.k.woff2) format("woff2");unicode-range:U+9001-9003,U+9005-9006,U+9009-900a,U+900d,U+900f-9012,U+9014,U+9017,U+901a-901b,U+901d-9022,U+902e,U+9038,U+903b-903c,U+903e,U+9041-9042,U+9044,U+9047,U+904d,U+904f-9053,U+9057,U+905b,U+9062-9063,U+9065,U+9068,U+906d-906e,U+9075,U+907d,U+907f-9080,U+9082-9083,U+908b,U+9091,U+9093,U+9099,U+90a2-90a3,U+90a6,U+90aa,U+90ae-90af,U+90b1,U+90b5,U+90b8-90b9,U+90bb,U+90c1,U+90ca,U+90ce,U+90d1,U+90dd,U+90e1,U+90e7-90e8,U+90ed,U+90f4,U+90f8,U+90fd,U+9102,U+9119,U+9149,U+914b-914d,U+9152,U+9157,U+915a,U+915d-915e,U+9161,U+9163,U+9165,U+916a,U+916c,U+916e,U+9171,U+9175-9178}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.l.woff2) format("woff2");unicode-range:U+8e44,U+8e47-8e48,U+8e4a-8e4b,U+8e51,U+8e59,U+8e66,U+8e6c-8e6d,U+8e6f,U+8e72,U+8e74,U+8e76,U+8e7f,U+8e81,U+8e87,U+8e8f,U+8eab-8eac,U+8eaf,U+8eb2,U+8eba,U+8f66-8f69,U+8f6c,U+8f6e-8f72,U+8f74,U+8f7b,U+8f7d,U+8f7f,U+8f83-8f8a,U+8f8d-8f8e,U+8f90-8f91,U+8f93,U+8f95-8f99,U+8f9b-8f9c,U+8f9e-8f9f,U+8fa3,U+8fa8-8fa9,U+8fab,U+8fb0-8fb1,U+8fb9,U+8fbd-8fbe,U+8fc1-8fc2,U+8fc4-8fc5,U+8fc7-8fc8,U+8fce,U+8fd0-8fd1,U+8fd3-8fd5,U+8fd8-8fd9,U+8fdb-8fdf,U+8fe2,U+8fe6,U+8fe8,U+8fea-8feb,U+8fed,U+8ff0,U+8ff3,U+8ff7-8ff9,U+8ffd,U+9000}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.m.woff2) format("woff2");unicode-range:U+8d24-8d31,U+8d34-8d35,U+8d37-8d3f,U+8d41-8d45,U+8d48,U+8d4a-8d4c,U+8d4e-8d50,U+8d54,U+8d56,U+8d58,U+8d5a-8d5b,U+8d5d-8d5e,U+8d60-8d64,U+8d66-8d67,U+8d6b,U+8d70,U+8d74-8d77,U+8d81,U+8d85,U+8d8a-8d8b,U+8d9f,U+8da3,U+8db3-8db4,U+8db8,U+8dbe-8dbf,U+8dc3-8dc4,U+8dcb-8dcc,U+8dd1,U+8dd7,U+8ddb,U+8ddd,U+8ddf,U+8de4,U+8de8,U+8dea,U+8def,U+8df3,U+8df5,U+8df7,U+8dfa-8dfb,U+8e09-8e0a,U+8e0c,U+8e0f,U+8e1d-8e1e,U+8e22,U+8e29-8e2a,U+8e2e,U+8e31,U+8e35,U+8e39,U+8e42}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.n.woff2) format("woff2");unicode-range:U+8bc9-8bcd,U+8bcf,U+8bd1,U+8bd3,U+8bd5,U+8bd7-8bd8,U+8bda-8bdb,U+8bdd-8bde,U+8be0-8be9,U+8beb-8bf5,U+8bf7-8bf8,U+8bfa-8bfb,U+8bfd-8c01,U+8c03-8c06,U+8c08,U+8c0a-8c0b,U+8c0d-8c13,U+8c15,U+8c17,U+8c19-8c1c,U+8c22-8c24,U+8c26-8c2a,U+8c2c-8c2d,U+8c30-8c35,U+8c37,U+8c41,U+8c46,U+8c4c,U+8c61-8c62,U+8c6a-8c6b,U+8c79-8c7a,U+8c82,U+8c89,U+8c8c,U+8d1d-8d1f,U+8d21-8d23}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.o.woff2) format("woff2");unicode-range:U+889c,U+88a4,U+88ab,U+88ad,U+88b1,U+88c1-88c2,U+88c5-88c6,U+88c9,U+88d4-88d5,U+88d8-88d9,U+88df,U+88e3-88e4,U+88e8,U+88f1,U+88f3-88f4,U+88f8-88f9,U+88fe,U+8902,U+8910,U+8912-8913,U+891a-891b,U+8921,U+8925,U+892a-892b,U+8934,U+8936,U+8941,U+8944,U+895e-895f,U+8966,U+897f,U+8981,U+8986,U+89c1-89c2,U+89c4-89c6,U+89c8-89cb,U+89ce,U+89d0-89d2,U+89e3,U+89e5-89e6,U+8a00,U+8a07,U+8a79,U+8a89-8a8a,U+8a93,U+8b66,U+8b6c,U+8ba1-8bab,U+8bad-8bb0,U+8bb2-8bb3,U+8bb6-8bba,U+8bbc-8bc1,U+8bc4-8bc6,U+8bc8}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.p.woff2) format("woff2");unicode-range:U+8695,U+869c,U+86a3-86a4,U+86a7,U+86aa,U+86af,U+86b1,U+86c0,U+86c6-86c7,U+86ca-86cb,U+86d0,U+86d4,U+86d9,U+86db,U+86df,U+86e4,U+86ee,U+86f0,U+86f9,U+86fe,U+8700,U+8702-8703,U+8708-8709,U+870d,U+8712-8713,U+8715,U+8717-8718,U+871a,U+871c,U+8721,U+8725,U+8734,U+8737,U+873b,U+873f,U+8747,U+8749,U+874c,U+874e,U+8757,U+8759,U+8760,U+8763,U+8774,U+8776,U+877c,U+8782-8783,U+8785,U+878d,U+8793,U+879f,U+87af,U+87b3,U+87ba,U+87c6,U+87ca,U+87d1-87d2,U+87e0,U+87e5,U+87f9,U+87fe,U+8815,U+8822,U+8839,U+8840,U+8845,U+884c-884d,U+8854,U+8857,U+8859,U+8861,U+8863,U+8865,U+8868,U+886b-886c,U+8870,U+8877,U+887d-887f,U+8881-8882,U+8884-8885,U+8888,U+888b,U+888d,U+8892,U+8896}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.q.woff2) format("woff2");unicode-range:U+83dc-83dd,U+83e0,U+83e9,U+83f1-83f2,U+8403-8404,U+840b-840e,U+841d,U+8424-8428,U+843d,U+8451,U+8457,U+8459,U+845b,U+8461,U+8463,U+8469,U+846b-846c,U+8471,U+8475,U+847a,U+8482,U+848b,U+8499,U+849c,U+84b2,U+84b8,U+84bf,U+84c4,U+84c9,U+84d1,U+84d6,U+84dd,U+84df,U+84e6,U+84ec,U+8511,U+8513,U+8517,U+851a,U+851f,U+8521,U+852b-852c,U+8537,U+853b-853d,U+8549-854a,U+8559,U+8574,U+857e,U+8584,U+8587,U+858f,U+859b,U+85aa,U+85af-85b0,U+85c9,U+85cf-85d0,U+85d3,U+85d5,U+85e4,U+85e9,U+85fb,U+8611,U+8638,U+864e-8651,U+8654,U+865a,U+865e,U+866b-866c,U+8671,U+8679,U+867d-867e,U+8680-8682,U+868a,U+868c-868d,U+8693}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.r.woff2) format("woff2");unicode-range:U+8273,U+827a,U+827e,U+8282,U+828a-828b,U+828d,U+8292,U+8299,U+829c-829d,U+82a5-82a6,U+82a9,U+82ab-82ad,U+82af,U+82b1,U+82b3,U+82b7-82b9,U+82bd,U+82c7,U+82cd,U+82cf,U+82d1,U+82d3-82d4,U+82d7,U+82db,U+82de-82df,U+82e3,U+82e5-82e6,U+82eb,U+82ef,U+82f1,U+82f9,U+82fb,U+8301-8305,U+8309,U+830e,U+8314,U+8317,U+8327-8328,U+832b-832c,U+832f,U+8335-8336,U+8338-8339,U+8340,U+8346-8347,U+8349,U+834f-8352,U+8354,U+835a,U+835c,U+8361,U+8363-8364,U+8367,U+836b,U+836f,U+8377,U+837c,U+8386,U+8389,U+838e,U+8393,U+839e,U+83a0,U+83ab,U+83b1-83b4,U+83b7,U+83b9-83ba,U+83bd,U+83c1,U+83c5,U+83c7,U+83ca,U+83cc,U+83cf}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.s.woff2) format("woff2");unicode-range:U+80de,U+80e1,U+80e7,U+80ea-80eb,U+80ed,U+80ef-80f0,U+80f3-80f4,U+80f6,U+80f8,U+80fa,U+80fd,U+8102,U+8106,U+8109-810a,U+810d,U+810f-8111,U+8113-8114,U+8116,U+8118,U+811a,U+812f,U+8131,U+8138,U+813e,U+8146,U+814a-814c,U+8150-8151,U+8154-8155,U+8165,U+816e,U+8170,U+8174,U+8179-817c,U+817e-8180,U+818a,U+818f,U+8198,U+819b-819d,U+81a8,U+81b3,U+81ba-81bb,U+81c0,U+81c2-81c3,U+81c6,U+81ca,U+81e3,U+81ea,U+81ec-81ed,U+81f3-81f4,U+81fb-81fc,U+81fe,U+8200,U+8205-8206,U+820c-820d,U+8210,U+8212,U+8214,U+821c,U+821e-821f,U+822a-822c,U+8230-8231,U+8235-8239,U+8247,U+8258,U+826f-8270,U+8272}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.t.woff2) format("woff2");unicode-range:U+7f72,U+7f81,U+7f8a,U+7f8c,U+7f8e,U+7f94,U+7f9a,U+7f9e,U+7fa1,U+7fa4,U+7fb2,U+7fb8-7fb9,U+7fbd,U+7fc1,U+7fc5,U+7fcc,U+7fce,U+7fd4-7fd5,U+7fd8,U+7fdf-7fe1,U+7fe6,U+7fe9,U+7ff0-7ff1,U+7ff3,U+7ffb-7ffc,U+8000-8001,U+8003,U+8005,U+800c-800d,U+8010,U+8012,U+8015,U+8017-8019,U+8027,U+802a,U+8033,U+8036-8038,U+803b,U+803d,U+803f,U+8042,U+8046,U+804a-804c,U+8052,U+8054,U+8058,U+805a,U+806a,U+807f,U+8083-8084,U+8086-8087,U+8089,U+808b-808c,U+8096,U+8098,U+809a-809b,U+809d,U+80a0-80a2,U+80a4-80a5,U+80a9-80aa,U+80ae-80af,U+80b2,U+80b4,U+80ba,U+80be-80c1,U+80c3-80c4,U+80c6,U+80cc,U+80ce,U+80d6,U+80da-80dc}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.u.woff2) format("woff2");unicode-range:U+7eb5-7eba,U+7ebd,U+7ebf,U+7ec2-7eca,U+7ecd-7ed5,U+7ed8-7edf,U+7ee1-7ee3,U+7ee5-7ee7,U+7ee9-7eeb,U+7eed,U+7eef-7ef0,U+7ef3-7ef8,U+7efc-7efd,U+7eff-7f00,U+7f04-7f09,U+7f0e-7f0f,U+7f13-7f16,U+7f18,U+7f1a,U+7f1c-7f1d,U+7f1f-7f22,U+7f24-7f26,U+7f28-7f2a,U+7f2d-7f2e,U+7f30,U+7f34,U+7f38,U+7f3a,U+7f42,U+7f50-7f51,U+7f54-7f55,U+7f57,U+7f5a,U+7f61-7f62,U+7f69-7f6a,U+7f6e}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.v.woff2) format("woff2");unicode-range:U+7b4c,U+7b4f-7b52,U+7b54,U+7b56,U+7b5b,U+7b5d,U+7b75,U+7b77,U+7b79,U+7b7e,U+7b80,U+7b8d,U+7b94-7b95,U+7b97,U+7ba1,U+7ba9-7bab,U+7bad,U+7bb1,U+7bb8,U+7bc6-7bc7,U+7bd1,U+7bd3,U+7bd9,U+7bdd,U+7be1,U+7bee,U+7bf1,U+7bf7,U+7bfe,U+7c07,U+7c0c,U+7c27,U+7c2a,U+7c38,U+7c3f,U+7c41,U+7c4d,U+7c73,U+7c7b,U+7c7d,U+7c89,U+7c92,U+7c95,U+7c97-7c98,U+7c9f,U+7ca4-7ca5,U+7caa,U+7cae,U+7cb1,U+7cb3,U+7cb9,U+7cbc-7cbe,U+7cc5,U+7cca,U+7cd5-7cd7,U+7cd9,U+7cdc,U+7cdf-7ce0,U+7cef,U+7cfb,U+7d0a,U+7d20,U+7d22,U+7d27,U+7d2b,U+7d2f,U+7d6e,U+7e41,U+7e82,U+7ea0-7ea4,U+7ea6-7ea8,U+7eaa-7ead,U+7eaf-7eb3}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.w.woff2) format("woff2");unicode-range:U+7981,U+7984-7985,U+798f,U+79b9,U+79bb,U+79bd-79be,U+79c0-79c1,U+79c3,U+79c6,U+79c9,U+79cb,U+79cd,U+79d1-79d2,U+79d8,U+79df,U+79e3-79e4,U+79e6-79e7,U+79e9,U+79ef-79f0,U+79f8,U+79fb,U+79fd,U+7a00,U+7a0b,U+7a0d-7a0e,U+7a14,U+7a17,U+7a1a,U+7a20,U+7a33,U+7a37,U+7a39,U+7a3b-7a3d,U+7a3f,U+7a46,U+7a51,U+7a57,U+7a74,U+7a76-7a77,U+7a79-7a7a,U+7a7f,U+7a81,U+7a83-7a84,U+7a88,U+7a8d,U+7a91-7a92,U+7a95-7a98,U+7a9c-7a9d,U+7a9f,U+7aa5-7aa6,U+7abf,U+7acb,U+7ad6,U+7ad9,U+7ade-7ae0,U+7ae3,U+7ae5-7ae6,U+7aed,U+7aef,U+7af9,U+7afd,U+7aff,U+7b03,U+7b06,U+7b08,U+7b0b,U+7b11,U+7b14,U+7b19,U+7b1b,U+7b20,U+7b26,U+7b28,U+7b2c,U+7b3a,U+7b3c,U+7b49,U+7b4b}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.x.woff2) format("woff2");unicode-range:U+77aa,U+77ac,U+77b0,U+77b3,U+77b5,U+77bb,U+77bf,U+77d7,U+77db-77dc,U+77e2-77e3,U+77e5,U+77e9,U+77eb,U+77ed-77ee,U+77f3,U+77fd-77ff,U+7801-7802,U+780c-780d,U+7812,U+7814,U+7816,U+781a,U+781d,U+7823,U+7825,U+7827,U+7830,U+7834,U+7837-7838,U+783a,U+783e,U+7840,U+7845,U+784c,U+7852,U+7855,U+785d,U+786b-786c,U+786e,U+787c,U+7887,U+7889,U+788c-788e,U+7891,U+7897-7898,U+789c,U+789f,U+78a5,U+78a7,U+78b0-78b1,U+78b3-78b4,U+78be,U+78c1,U+78c5,U+78ca-78cb,U+78d0,U+78d5,U+78e8,U+78ec,U+78f7,U+78fa,U+7901,U+7934,U+793a,U+793c,U+793e,U+7940-7941,U+7948,U+7956-7957,U+795a-795b,U+795d-7960,U+7965,U+7968,U+796d,U+796f,U+7977-7978,U+797a,U+7980}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.y.woff2) format("woff2");unicode-range:U+761f,U+7624,U+7626,U+7629-762b,U+7634-7635,U+7638,U+763e,U+764c,U+7656,U+765e,U+7663,U+766b,U+7678,U+767b,U+767d-767e,U+7682,U+7684,U+7686-7688,U+768b,U+768e,U+7691,U+7693,U+7696,U+7699,U+76ae,U+76b1,U+76b4,U+76bf,U+76c2,U+76c5-76c6,U+76c8,U+76ca,U+76ce-76d2,U+76d4,U+76d6-76d8,U+76db,U+76df,U+76ee-76ef,U+76f2,U+76f4,U+76f8-76f9,U+76fc,U+76fe,U+7701,U+7708-7709,U+770b,U+771f-7720,U+7726,U+7728-7729,U+772f,U+7736-7738,U+773a,U+773c,U+7740-7741,U+7750-7751,U+775a-775b,U+7761,U+7763,U+7765-7766,U+7768,U+776b-776c,U+7779,U+777d,U+777f,U+7784-7785,U+778c,U+778e,U+7791-7792,U+779f-77a0,U+77a5,U+77a7,U+77a9}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.z.woff2) format("woff2");unicode-range:U+7435-7436,U+743c,U+7455,U+7459-745a,U+745c,U+745e-745f,U+7470,U+7476,U+7480,U+7483,U+7487,U+749c,U+749e,U+74a7-74a8,U+74dc,U+74e2-74e4,U+74e6,U+74ee,U+74f6-74f7,U+7504,U+7518,U+751a,U+751c,U+751f,U+7525,U+7528-7529,U+752b-752d,U+7530-7533,U+7535,U+7537-7538,U+753b,U+7545,U+754c,U+754f,U+7554,U+7559,U+755c,U+7565-7566,U+756a,U+7574,U+7578,U+7583,U+7586,U+758f,U+7591,U+7597,U+7599-759a,U+759f,U+75a1,U+75a4-75a5,U+75ab,U+75ae-75b2,U+75b4-75b5,U+75b9,U+75bc-75be,U+75c5,U+75c7-75ca,U+75cd,U+75d2,U+75d4-75d5,U+75d8,U+75db,U+75de,U+75e2-75e3,U+75e8,U+75ea,U+75f0,U+75f4,U+75f9,U+7600-7601}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.aa.woff2) format("woff2");unicode-range:U+725f,U+7261-7262,U+7267,U+7269,U+7272,U+7275,U+7279-727a,U+7280-7281,U+7284,U+728a,U+7292,U+729f,U+72ac,U+72af,U+72b6-72b9,U+72c1-72c2,U+72c4,U+72c8,U+72ce,U+72d0,U+72d2,U+72d7,U+72d9,U+72de,U+72e0-72e1,U+72e9,U+72ec-72f2,U+72f7-72f8,U+72fc,U+730a,U+730e,U+7316,U+731b-731d,U+7322,U+7325,U+7329-732c,U+732e,U+7334,U+733e-733f,U+7350,U+7357,U+7360,U+736d,U+7384,U+7387,U+7389,U+738b,U+7396,U+739b,U+73a9,U+73ab,U+73af-73b0,U+73b2,U+73b7,U+73ba-73bb,U+73c0,U+73c8,U+73ca,U+73cd,U+73d0-73d1,U+73d9,U+73e0,U+73ed,U+7403,U+7405-7406,U+7409-740a,U+740f-7410,U+741a,U+7422,U+7425,U+742a,U+7433-7434}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ab.woff2) format("woff2");unicode-range:U+706d,U+706f-7070,U+7075-7076,U+7078,U+707c,U+707e-707f,U+7089-708a,U+708e,U+7092,U+7094-7096,U+7099,U+70ab-70af,U+70b1,U+70b3,U+70b8-70b9,U+70bc-70bd,U+70c1-70c3,U+70c8,U+70ca,U+70d8-70d9,U+70db,U+70df,U+70e4,U+70e6-70e7,U+70e9,U+70eb-70ed,U+70ef,U+70f7,U+70f9,U+70fd,U+7109-710a,U+7115,U+7119-711a,U+7126,U+7130-7131,U+7136,U+714c,U+714e,U+715e,U+7164,U+7166-7168,U+716e,U+7172-7173,U+717d,U+7184,U+718a,U+718f,U+7194,U+7198-7199,U+719f-71a0,U+71a8,U+71ac,U+71b9,U+71c3,U+71ce,U+71d5,U+71e5,U+7206,U+722a,U+722c,U+7231,U+7235-7239,U+723d,U+7247-7248,U+724c-724d,U+7252,U+7259,U+725b}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ac.woff2) format("woff2");unicode-range:U+6df7,U+6df9,U+6dfb,U+6e05,U+6e0a,U+6e0d-6e0e,U+6e10,U+6e14,U+6e17,U+6e1a,U+6e1d,U+6e20-6e21,U+6e23-6e25,U+6e29,U+6e2d,U+6e2f,U+6e32,U+6e34,U+6e38,U+6e3a,U+6e43,U+6e4d,U+6e56,U+6e58,U+6e5b,U+6e6e,U+6e7e-6e7f,U+6e83,U+6e85,U+6e89,U+6e90,U+6e9c,U+6ea2,U+6ea5,U+6eaa,U+6eaf,U+6eb6,U+6eba,U+6ec1,U+6ec7,U+6ecb,U+6ed1,U+6ed3-6ed5,U+6eda,U+6ede,U+6ee1,U+6ee4-6ee6,U+6ee8-6ee9,U+6ef4,U+6f02,U+6f06,U+6f09,U+6f0f,U+6f13-6f15,U+6f20,U+6f29-6f2b,U+6f31,U+6f33,U+6f3e,U+6f46-6f47,U+6f4d,U+6f58,U+6f5c,U+6f5e,U+6f62,U+6f66,U+6f6d-6f6e,U+6f84,U+6f88-6f89,U+6f8e,U+6f9c,U+6fa1,U+6fb3,U+6fb9,U+6fc0,U+6fd1-6fd2,U+6fe1,U+7011,U+701a,U+7023,U+704c,U+706b}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ad.woff2) format("woff2");unicode-range:U+6ccc,U+6cd3,U+6cd5,U+6cdb,U+6cde,U+6ce1-6ce3,U+6ce5,U+6ce8,U+6cea-6ceb,U+6cef-6cf1,U+6cf3,U+6cf5,U+6cfb-6cfe,U+6d01,U+6d0b,U+6d12,U+6d17,U+6d1b,U+6d1e,U+6d25,U+6d27,U+6d2a,U+6d31-6d32,U+6d3b-6d3e,U+6d41,U+6d43,U+6d45-6d47,U+6d4a-6d4b,U+6d4e-6d4f,U+6d51,U+6d53,U+6d59-6d5a,U+6d63,U+6d66,U+6d69-6d6a,U+6d6e,U+6d74,U+6d77-6d78,U+6d82,U+6d85,U+6d88-6d89,U+6d8c,U+6d8e,U+6d93,U+6d95,U+6d9b,U+6d9d,U+6d9f-6da1,U+6da3-6da4,U+6da6-6daa,U+6dae-6daf,U+6db2,U+6db5,U+6db8,U+6dc0,U+6dc4-6dc7,U+6dcb-6dcc,U+6dd1,U+6dd6,U+6dd8-6dd9,U+6de1,U+6de4,U+6deb-6dec,U+6dee,U+6df1,U+6df3}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ae.woff2) format("woff2");unicode-range:U+6b92,U+6b96,U+6b9a,U+6ba1,U+6bb4-6bb5,U+6bb7,U+6bbf,U+6bc1,U+6bc5,U+6bcb,U+6bcd,U+6bcf,U+6bd2,U+6bd4-6bd7,U+6bd9,U+6bdb,U+6be1,U+6beb,U+6bef,U+6c05,U+6c0f,U+6c11,U+6c13-6c14,U+6c16,U+6c1b,U+6c1f,U+6c22,U+6c24,U+6c26-6c28,U+6c2e-6c30,U+6c32,U+6c34,U+6c38,U+6c3d,U+6c40-6c42,U+6c47,U+6c49,U+6c50,U+6c55,U+6c57,U+6c5b,U+6c5d-6c61,U+6c64,U+6c68-6c6a,U+6c70,U+6c72,U+6c76,U+6c79,U+6c7d-6c7e,U+6c81-6c83,U+6c86,U+6c88-6c89,U+6c8c,U+6c8f-6c90,U+6c93,U+6c99,U+6c9b,U+6c9f,U+6ca1,U+6ca4-6ca7,U+6caa-6cab,U+6cae,U+6cb3,U+6cb8-6cb9,U+6cbb-6cbf,U+6cc4-6cc5,U+6cc9-6cca}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.af.woff2) format("woff2");unicode-range:U+68ad,U+68af-68b0,U+68b3,U+68b5,U+68c0,U+68c2,U+68c9,U+68cb,U+68cd,U+68d2,U+68d5,U+68d8,U+68da,U+68e0,U+68ee,U+68f1,U+68f5,U+68fa,U+6905,U+690d-690e,U+6912,U+692d,U+6930,U+693d,U+693f,U+6942,U+6954,U+6957,U+695a,U+695e,U+6963,U+696b,U+6977-6978,U+697c,U+6982,U+6984,U+6986,U+6994,U+699c,U+69a8,U+69ad,U+69b4,U+69b7,U+69bb,U+69c1,U+69cc,U+69d0,U+69db,U+69fd,U+69ff,U+6a0a,U+6a1f,U+6a21,U+6a2a,U+6a31,U+6a35,U+6a3d,U+6a44,U+6a47,U+6a58-6a59,U+6a61,U+6a71,U+6a80,U+6a84,U+6a8e,U+6a90,U+6aac,U+6b20-6b23,U+6b27,U+6b32,U+6b3a,U+6b3e,U+6b47,U+6b49,U+6b4c,U+6b62-6b67,U+6b6a,U+6b79,U+6b7b-6b7c,U+6b81,U+6b83-6b84,U+6b86-6b87,U+6b89-6b8b}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ag.woff2) format("woff2");unicode-range:U+6756,U+675c,U+675e-6761,U+6765,U+6768,U+676d,U+676f-6770,U+6773,U+6775,U+6777,U+677c,U+677e-677f,U+6781,U+6784,U+6787,U+6789,U+6790,U+6795,U+6797,U+679a,U+679c-679d,U+67a2-67a3,U+67aa-67ab,U+67ad,U+67af-67b0,U+67b6-67b7,U+67c4,U+67cf-67d4,U+67d9-67da,U+67dc,U+67de,U+67e0,U+67e5,U+67e9,U+67ec,U+67ef,U+67f1,U+67f3-67f4,U+67ff-6800,U+6805,U+6807-6808,U+680b,U+680f,U+6811,U+6813,U+6816-6817,U+6821,U+6829-682a,U+6837-6839,U+683c-683d,U+6840,U+6842-6843,U+6845-6846,U+6848,U+684c,U+6850-6851,U+6853-6854,U+6863,U+6865,U+6868-6869,U+6874,U+6876,U+6881,U+6885-6886,U+6893,U+6897,U+68a2,U+68a6-68a8}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ah.woff2) format("woff2");unicode-range:U+65f7,U+65fa,U+6602,U+6606,U+660a,U+660c,U+660e-660f,U+6613-6614,U+6619,U+661d,U+661f-6620,U+6625,U+6627-6628,U+662d,U+662f,U+6631,U+6635,U+663c,U+663e,U+6643,U+664b-664c,U+664f,U+6652-6653,U+6655-6657,U+665a,U+6664,U+6666,U+6668,U+666e-6670,U+6674,U+6676-6677,U+667a,U+667e,U+6682,U+6684,U+6687,U+668c,U+6691,U+6696-6697,U+669d,U+66a7,U+66ae,U+66b4,U+66d9,U+66dc-66dd,U+66e6,U+66f0,U+66f2-66f4,U+66f9,U+66fc,U+66fe-6700,U+6708-6709,U+670b,U+670d,U+6714-6715,U+6717,U+671b,U+671d,U+671f,U+6726,U+6728,U+672a-672d,U+672f,U+6731,U+6734-6735,U+673a,U+673d,U+6740,U+6742-6743,U+6746,U+6748-6749,U+674e-6751}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ai.woff2) format("woff2");unicode-range:U+6467,U+6469,U+6478-6479,U+6482,U+6485,U+6487,U+6491-6492,U+6495,U+649e,U+64a4,U+64a9,U+64ac-64ae,U+64b0,U+64b5,U+64b8,U+64ba,U+64bc,U+64c2,U+64c5,U+64cd-64ce,U+64d2,U+64d8,U+64de,U+64e2,U+64e6,U+6500,U+6512,U+6518,U+6525,U+652b,U+652f,U+6536,U+6538-6539,U+653b,U+653e-653f,U+6545,U+6548,U+654c,U+654f,U+6551,U+6555-6556,U+6559,U+655b,U+655d-655e,U+6562-6563,U+6566,U+656c,U+6570,U+6572,U+6574,U+6577,U+6587,U+658b-658c,U+6590-6591,U+6593,U+6597,U+6599,U+659c,U+659f,U+65a1,U+65a4-65a5,U+65a7,U+65a9,U+65ab,U+65ad,U+65af-65b0,U+65b9,U+65bd,U+65c1,U+65c4-65c5,U+65cb-65cc,U+65cf,U+65d7,U+65e0,U+65e2,U+65e5-65e9,U+65ec-65ed,U+65f1,U+65f6}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.aj.woff2) format("woff2");unicode-range:U+6323-6325,U+6328,U+632a-632b,U+632f,U+6332,U+633a,U+633d,U+6342,U+6345-6346,U+6349,U+634b-6350,U+6355,U+635e-635f,U+6361-6363,U+6367,U+636e,U+6371,U+6376-6377,U+637a-637b,U+6380,U+6382,U+6387-6389,U+638c,U+638f-6390,U+6392,U+6396,U+6398,U+63a0,U+63a2-63a3,U+63a5,U+63a7-63aa,U+63ac,U+63b0,U+63b3-63b4,U+63b7-63b8,U+63ba,U+63c4,U+63c9,U+63cd,U+63cf-63d0,U+63d2,U+63d6,U+63e1,U+63e3,U+63e9-63ea,U+63ed,U+63f4,U+63f6,U+63fd,U+6400-6402,U+6405,U+640f-6410,U+6413-6414,U+641c,U+641e,U+6421,U+642a,U+642c-642d,U+643a,U+643d,U+6441,U+6444,U+6446-6448,U+644a,U+6452,U+6454,U+6458,U+645e}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ak.woff2) format("woff2");unicode-range:U+6258,U+625b,U+6263,U+6266-6267,U+6269-6270,U+6273,U+6276,U+6279,U+627c,U+627e-6280,U+6284,U+6289-628a,U+6291-6293,U+6295-6298,U+629a-629b,U+62a0-62a2,U+62a4-62a5,U+62a8,U+62ab-62ac,U+62b1,U+62b5,U+62b9,U+62bc-62bd,U+62bf,U+62c2,U+62c4-62ca,U+62cc-62ce,U+62d0,U+62d2-62d4,U+62d6-62d9,U+62db-62dc,U+62df,U+62e2-62e3,U+62e5-62e9,U+62ec-62ed,U+62ef,U+62f1,U+62f3-62f4,U+62f7,U+62fc-62ff,U+6301-6302,U+6307,U+6309,U+630e,U+6311,U+6316,U+631a-631b,U+631d-6321}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.al.woff2) format("woff2");unicode-range:U+60cb,U+60d1,U+60d5,U+60d8,U+60da,U+60dc,U+60df-60e0,U+60e6-60e9,U+60eb-60f0,U+60f3-60f4,U+60f6,U+60f9-60fa,U+6101,U+6108-6109,U+610e-610f,U+6115,U+611a,U+611f-6120,U+6123-6124,U+6127,U+612b,U+613f,U+6148,U+614a,U+614c,U+614e,U+6151,U+6155,U+6162,U+6167-6168,U+6170,U+6175,U+6177,U+618b,U+618e,U+6194,U+61a7-61a9,U+61ac,U+61be,U+61c2,U+61c8,U+61ca,U+61d1-61d2,U+61d4,U+61e6,U+61f5,U+61ff,U+6208,U+620a,U+620c-6212,U+6216,U+6218,U+621a-621b,U+621f,U+622a,U+622c,U+622e,U+6233-6234,U+6237,U+623e-6241,U+6247-6249,U+624b,U+624d-624e,U+6251-6254}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.am.woff2) format("woff2");unicode-range:U+5fcc-5fcd,U+5fcf-5fd2,U+5fd6-5fd9,U+5fdd,U+5fe0-5fe1,U+5fe4,U+5fe7,U+5fea-5feb,U+5ff1,U+5ff5,U+5ffb,U+5ffd-6002,U+6005-6006,U+600d-600f,U+6012,U+6014-6016,U+6019,U+601c-601d,U+6020-6021,U+6025-6028,U+602a,U+602f,U+6035,U+603b-603c,U+6041,U+6043,U+604b,U+604d,U+6050,U+6052,U+6055,U+6059-605a,U+6062-6064,U+6068-606d,U+606f-6070,U+6073,U+6076,U+6078-607c,U+607f,U+6084,U+6089,U+608c-608d,U+6094,U+6096,U+609a,U+609f-60a0,U+60a3,U+60a6,U+60a8,U+60ac,U+60af,U+60b1-60b2,U+60b4,U+60b8,U+60bb-60bc,U+60c5-60c6,U+60ca}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.an.woff2) format("woff2");unicode-range:U+5e7f,U+5e84,U+5e86-5e87,U+5e8a,U+5e8f-5e90,U+5e93-5e97,U+5e99-5e9a,U+5e9c,U+5e9e-5e9f,U+5ea6-5ea7,U+5ead,U+5eb5-5eb8,U+5ec9-5eca,U+5ed1,U+5ed3,U+5ed6,U+5ef6-5ef7,U+5efa,U+5f00,U+5f02-5f04,U+5f08,U+5f0a-5f0b,U+5f0f,U+5f11,U+5f13,U+5f15,U+5f17-5f18,U+5f1b,U+5f1f-5f20,U+5f25-5f27,U+5f29,U+5f2f,U+5f31,U+5f39-5f3a,U+5f52-5f53,U+5f55,U+5f57,U+5f5d,U+5f62,U+5f64,U+5f66,U+5f69-5f6a,U+5f6c-5f6d,U+5f70-5f71,U+5f77,U+5f79,U+5f7b-5f7c,U+5f80-5f81,U+5f84-5f85,U+5f87-5f8b,U+5f90,U+5f92,U+5f95,U+5f97-5f98,U+5fa1,U+5fa8,U+5faa,U+5fad-5fae,U+5fb5,U+5fb7,U+5fbc-5fbd,U+5fc3,U+5fc5-5fc6}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ao.woff2) format("woff2");unicode-range:U+5c7f,U+5c81-5c82,U+5c8c,U+5c94,U+5c96-5c97,U+5c9a-5c9b,U+5ca9,U+5cad,U+5cb3,U+5cb8,U+5cbf,U+5ccb,U+5cd9,U+5ce1,U+5ce5-5ce6,U+5ce8,U+5cea,U+5ced,U+5cf0,U+5cfb,U+5d02,U+5d07,U+5d0e,U+5d14,U+5d16,U+5d1b,U+5d24,U+5d29,U+5d2d,U+5d34,U+5d3d,U+5d4c,U+5d58,U+5d6c,U+5d82,U+5d99,U+5dc5,U+5dcd,U+5ddd-5dde,U+5de1-5de2,U+5de5-5de9,U+5deb,U+5dee,U+5df1-5df4,U+5df7,U+5dfe,U+5e01-5e03,U+5e05-5e06,U+5e08,U+5e0c,U+5e10-5e11,U+5e15-5e16,U+5e18,U+5e1a-5e1d,U+5e26-5e27,U+5e2d-5e2e,U+5e37-5e38,U+5e3c-5e3d,U+5e42,U+5e44-5e45,U+5e4c,U+5e54-5e55,U+5e61-5e62,U+5e72-5e74,U+5e76,U+5e78,U+5e7a-5e7d}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ap.woff2) format("woff2");unicode-range:U+5b85,U+5b87-5b89,U+5b8b-5b8c,U+5b8f,U+5b95,U+5b97-5b9e,U+5ba0-5ba4,U+5ba6,U+5baa-5bab,U+5bb0,U+5bb3-5bb6,U+5bb9,U+5bbd-5bbf,U+5bc2,U+5bc4-5bc7,U+5bcc,U+5bd0,U+5bd2-5bd3,U+5bdd-5bdf,U+5be1,U+5be4-5be5,U+5be8,U+5bf0,U+5bf8-5bfc,U+5bff,U+5c01,U+5c04,U+5c06,U+5c09-5c0a,U+5c0f,U+5c11,U+5c14,U+5c16,U+5c18,U+5c1a,U+5c1d,U+5c24,U+5c27,U+5c2c,U+5c31,U+5c34,U+5c38-5c3a,U+5c3c-5c42,U+5c45,U+5c48-5c4b,U+5c4e-5c51,U+5c55,U+5c5e,U+5c60-5c61,U+5c65,U+5c6f,U+5c71,U+5c79}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.aq.woff2) format("woff2");unicode-range:U+5996,U+5999,U+599e,U+59a5,U+59a8-59aa,U+59ae,U+59b2,U+59b9,U+59bb,U+59be,U+59c6,U+59cb,U+59d0-59d1,U+59d3-59d4,U+59d7-59d8,U+59da,U+59dc-59dd,U+59e3,U+59e5,U+59e8,U+59ec,U+59f9,U+59fb,U+59ff,U+5a01,U+5a03-5a04,U+5a06-5a07,U+5a11,U+5a13,U+5a18,U+5a1c,U+5a1f-5a20,U+5a25,U+5a29,U+5a31-5a32,U+5a34,U+5a36,U+5a3c,U+5a40,U+5a46,U+5a49-5a4a,U+5a5a,U+5a62,U+5a6a,U+5a74,U+5a76-5a77,U+5a7f,U+5a92,U+5a9a-5a9b,U+5ab2-5ab3,U+5ac1-5ac2,U+5ac9,U+5acc,U+5ad4,U+5ad6,U+5ae1,U+5ae3,U+5ae6,U+5ae9,U+5b09,U+5b34,U+5b37,U+5b40,U+5b50,U+5b54-5b55,U+5b57-5b59,U+5b5c-5b5d,U+5b5f,U+5b63-5b64,U+5b66,U+5b69-5b6a,U+5b6c,U+5b70-5b71,U+5b75,U+5b7a,U+5b7d,U+5b81,U+5b83}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ar.woff2) format("woff2");unicode-range:U+57ce,U+57d4,U+57df-57e0,U+57f9-57fa,U+5800,U+5802,U+5806,U+5811,U+5815,U+5821,U+5824,U+582a,U+5830,U+5835,U+584c,U+5851,U+5854,U+5858,U+585e,U+586b,U+587e,U+5883,U+5885,U+5892-5893,U+5899,U+589e-589f,U+58a8-58a9,U+58c1,U+58d1,U+58d5,U+58e4,U+58eb-58ec,U+58ee,U+58f0,U+58f3,U+58f6,U+58f9,U+5904,U+5907,U+590d,U+590f,U+5915-5916,U+5919-591a,U+591c,U+591f,U+5927,U+5929-592b,U+592d-592f,U+5931,U+5934,U+5937-593a,U+5942,U+5944,U+5947-5949,U+594b,U+594e-594f,U+5951,U+5954-5957,U+595a,U+5960,U+5962,U+5965,U+5973-5974,U+5976,U+5978-5979,U+597d,U+5981-5984,U+5986-5988,U+598a,U+598d,U+5992-5993}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.as.woff2) format("woff2");unicode-range:U+561b,U+561e-561f,U+5624,U+562d,U+5631-5632,U+5634,U+5636,U+5639,U+563b,U+563f,U+564c,U+564e,U+5654,U+5657,U+5659,U+565c,U+5662,U+5664,U+5668-566c,U+5676,U+567c,U+5685,U+568e-568f,U+5693,U+56a3,U+56b7,U+56bc,U+56ca,U+56d4,U+56da-56db,U+56de,U+56e0,U+56e2,U+56e4,U+56ed,U+56f0-56f1,U+56f4,U+56f9-56fa,U+56fd-56ff,U+5703,U+5706,U+5708-5709,U+571f,U+5723,U+5728,U+572d,U+5730,U+573a,U+573e,U+5740,U+5747,U+574a,U+574d-5751,U+5757,U+575a-575b,U+575d-5761,U+5764,U+5766,U+5768,U+576a,U+576f,U+5773,U+5777,U+5782-5784,U+578b,U+5792,U+579b,U+57a0,U+57a2-57a3,U+57a6,U+57ab,U+57ae,U+57c2-57c3,U+57cb}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.at.woff2) format("woff2");unicode-range:U+54e5-54ea,U+54ed-54ee,U+54f2,U+54fa,U+54fc-54fd,U+5501,U+5506-5507,U+5509,U+550f-5510,U+5514,U+5520,U+5522,U+5524,U+5527,U+552c,U+552e-5531,U+5533,U+553e-553f,U+5543-5544,U+5546,U+554a,U+5550,U+5555-5556,U+555c,U+5561,U+5564-5567,U+556a,U+556c,U+556e,U+5575,U+5577-5578,U+557b-557c,U+557e,U+5580,U+5582-5584,U+5587,U+5589-558b,U+558f,U+5591,U+5594,U+5598-5599,U+559c-559d,U+559f,U+55a7,U+55b3,U+55b7,U+55bb,U+55bd,U+55c5,U+55d1-55d4,U+55d6,U+55dc-55dd,U+55df,U+55e1,U+55e3-55e6,U+55e8,U+55eb-55ec,U+55ef,U+55f7,U+55fd,U+5600-5601,U+5608-5609,U+560e,U+5618}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.au.woff2) format("woff2");unicode-range:U+5411,U+5413,U+5415,U+5417,U+541b,U+541d-5420,U+5426-5429,U+542b-542f,U+5431,U+5434-5435,U+5438-5439,U+543b-543c,U+543e,U+5440,U+5443,U+5446,U+5448,U+544a,U+5450,U+5453,U+5455,U+5457-5458,U+545b-545c,U+5462,U+5464,U+5466,U+5468,U+5471-5473,U+5475,U+5478,U+547b-547d,U+5480,U+5482,U+5484,U+5486,U+548b-548c,U+548e-5490,U+5492,U+5494-5496,U+5499-549b,U+54a4,U+54a6-54ad,U+54af,U+54b1,U+54b3,U+54b8,U+54bb,U+54bd,U+54bf-54c2,U+54c4,U+54c6-54c9,U+54cd-54ce,U+54d0-54d2,U+54d5,U+54d7,U+54da,U+54dd,U+54df}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.av.woff2) format("woff2");unicode-range:U+5348-534a,U+534e-534f,U+5351-5353,U+5355-5357,U+535a,U+535c,U+535e-5362,U+5364,U+5366-5367,U+536b,U+536f-5371,U+5373-5375,U+5377-5378,U+537f,U+5382,U+5384-5386,U+5389,U+538b-538c,U+5395,U+5398,U+539a,U+539f,U+53a2,U+53a5-53a6,U+53a8-53a9,U+53ae,U+53bb,U+53bf,U+53c1-53c2,U+53c8-53cd,U+53d1,U+53d4,U+53d6-53d9,U+53db,U+53df-53e0,U+53e3-53e6,U+53e8-53f3,U+53f6-53f9,U+53fc-53fd,U+5401,U+5403-5404,U+5408-540a,U+540c-5410}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.aw.woff2) format("woff2");unicode-range:U+5207,U+520a,U+520d-520e,U+5211-5212,U+5217-521b,U+521d,U+5220,U+5224,U+5228-5229,U+522b,U+522d-522e,U+5230,U+5236-523b,U+523d,U+5241-5243,U+524a,U+524c-524d,U+5250-5251,U+5254,U+5256,U+525c,U+5265,U+5267,U+5269-526a,U+526f,U+5272,U+527d,U+527f,U+5288,U+529b,U+529d-52a1,U+52a3,U+52a8-52ab,U+52ad,U+52b1-52b3,U+52be-52bf,U+52c3,U+52c7,U+52c9,U+52cb,U+52d0,U+52d2,U+52d8,U+52df,U+52e4,U+52fa,U+52fe-5300,U+5305-5306,U+5308,U+530d,U+5310,U+5315-5317,U+5319,U+531d,U+5320-5321,U+5323,U+532a,U+532e,U+5339-533b,U+533e-533f,U+5341,U+5343,U+5347}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ax.woff2) format("woff2");unicode-range:U+50cf,U+50d6,U+50da,U+50e7,U+50ee,U+50f3,U+50f5,U+50fb,U+5106,U+510b,U+5112,U+5121,U+513f-5141,U+5143-5146,U+5148-5149,U+514b,U+514d,U+5151,U+5154,U+515a,U+515c,U+5162,U+5165,U+5168,U+516b-516e,U+5170-5171,U+5173-5179,U+517b-517d,U+5180,U+5185,U+5188-5189,U+518c-518d,U+5192,U+5195,U+5197,U+5199,U+519b-519c,U+51a0,U+51a2,U+51a4-51a5,U+51ac,U+51af-51b0,U+51b2-51b3,U+51b5-51b7,U+51bb,U+51bd,U+51c0,U+51c4,U+51c6,U+51c9,U+51cb-51cc,U+51cf,U+51d1,U+51db,U+51dd,U+51e0-51e1,U+51e4,U+51ed,U+51ef-51f0,U+51f3,U+51f6,U+51f8-51fb,U+51fd,U+51ff-5201,U+5203,U+5206}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.ay.woff2) format("woff2");unicode-range:U+4f60,U+4f63,U+4f65,U+4f69,U+4f6c,U+4f6f-4f70,U+4f73-4f74,U+4f7b-4f7c,U+4f7f,U+4f83-4f84,U+4f88,U+4f8b,U+4f8d,U+4f97,U+4f9b,U+4f9d,U+4fa0,U+4fa3,U+4fa5-4faa,U+4fac,U+4fae-4faf,U+4fb5,U+4fbf,U+4fc3-4fc5,U+4fca,U+4fce-4fd1,U+4fd7-4fd8,U+4fda,U+4fdd-4fde,U+4fe1,U+4fe6,U+4fe8-4fe9,U+4fed-4fef,U+4ff1,U+4ff8,U+4ffa,U+4ffe,U+500c-500d,U+500f,U+5012,U+5014,U+5018-501a,U+501c,U+501f,U+5021,U+5026,U+5028-502a,U+502d,U+503a,U+503c,U+503e,U+5043,U+5047-5048,U+504c,U+504e-504f,U+5055,U+505a,U+505c,U+5065,U+5076-5077,U+507b,U+507f-5080,U+5085,U+5088,U+508d,U+50a3,U+50a5,U+50a8,U+50ac,U+50b2,U+50bb}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.az.woff2) format("woff2");unicode-range:U+4e94-4e95,U+4e98,U+4e9a-4e9b,U+4e9f,U+4ea1-4ea2,U+4ea4-4ea9,U+4eab-4eae,U+4eb2,U+4eb5,U+4eba,U+4ebf-4ec1,U+4ec3-4ec7,U+4eca-4ecb,U+4ecd-4ece,U+4ed1,U+4ed3-4ed9,U+4ede-4edf,U+4ee3-4ee5,U+4ee8,U+4eea,U+4eec,U+4ef0,U+4ef2,U+4ef5-4ef7,U+4efb,U+4efd,U+4eff,U+4f01,U+4f0a,U+4f0d-4f11,U+4f17-4f1a,U+4f1e-4f20,U+4f22,U+4f24-4f26,U+4f2a-4f2b,U+4f2f-4f30,U+4f34,U+4f36,U+4f38,U+4f3a,U+4f3c-4f3d,U+4f43,U+4f46,U+4f4d-4f51,U+4f53,U+4f55,U+4f58-4f59,U+4f5b-4f5e}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.a0.woff2) format("woff2");unicode-range:U+d7,U+e0-e1,U+e8-ea,U+ec-ed,U+f2-f3,U+f7,U+f9-fa,U+fc,U+2014,U+2018-2019,U+201c-201d,U+3001-3002,U+300a-300b,U+3010-3011,U+4e00-4e01,U+4e03,U+4e07-4e0b,U+4e0d-4e0e,U+4e10-4e11,U+4e13-4e14,U+4e16,U+4e18-4e1e,U+4e22,U+4e24-4e25,U+4e27,U+4e2a-4e2b,U+4e2d,U+4e30,U+4e32,U+4e34,U+4e38-4e3b,U+4e3d-4e3e,U+4e43,U+4e45,U+4e48-4e49,U+4e4b-4e50,U+4e52-4e54,U+4e56,U+4e58-4e59,U+4e5c-4e61,U+4e66,U+4e70-4e71,U+4e73,U+4e7e,U+4e86,U+4e88-4e89,U+4e8b-4e8c,U+4e8e-4e8f,U+4e91-4e93}@font-face{font-family:HarmonyOS_Regular;font-style:normal;font-weight:400;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Regular.a1.woff2) format("woff2");unicode-range:U+21-7e,U+a4,U+a7-a8,U+b0-b1,U+b7}\n';
	let isCleanLiveDanmakuRunning = false;
	let enableCleanCounter = false;
	let enableCleanRedundant = false;
	const cleanLiveDanmaku = () => {
		if(!location.pathname.match(/^\/\d+/)) {
			return;
		}
		if(isCleanLiveDanmakuRunning) {
			return;
		} else {
			isCleanLiveDanmakuRunning = true;
		}
		const clean = () => {
			if(!enableCleanCounter && !enableCleanRedundant) {
				return;
			}
			const dmList = document.querySelectorAll("#live-player .danmaku-item-container .bili-dm");
			if(!dmList.length) {
				return;
			}
			dmList.forEach((dm) => {
				var _a;
				const dmText = (_a = dm.textContent) == null ? void 0 : _a.trim();
				if(dmText) {
					if(enableCleanCounter && dmText.match(/.+[xXΧ×χ✘✖] ?\d+$/)) {
						debugRules("match danmaku", dmText);
						dm.innerHTML = "";
						return;
					}
					if(enableCleanRedundant) {
						if(dmText.match(/(.+)\1{4,}/)) {
							debugRules("match danmaku", dmText);
							dm.innerHTML = "";
							return;
						}
					}
				}
			});
		};
		setInterval(clean, 500);
	};
	const liveGroupList = [];
	if(isPageLiveRoom()) {
		const basicItems2 = [
			// 隐藏 页面右侧按钮 实验室/关注, 默认开启
			new CheckboxItem({
				itemID: "live-page-sidebar-vm",
				description: "隐藏 页面右侧按钮 实验室/关注",
				defaultStatus: true,
				itemCSS: `#sidebar-vm {display: none !important;}`
			}),
			// 播放器皮肤 恢复默认配色
			new CheckboxItem({
				itemID: "live-page-default-skin",
				description: "播放器皮肤 恢复默认配色",
				itemCSS: `#head-info-vm {
background-image: unset !important;
/* color不加important, 适配Evolved黑暗模式 */
background-color: white;
}
.live-title .text {
color: #61666D !important;
}
.header-info-ctnr .rows-ctnr .upper-row .room-owner-username {
color: #18191C !important;
}
/* 高权限覆盖 */
#head-info-vm .live-skin-coloration-area .live-skin-normal-a-text {
color: unset !important;
}
#head-info-vm .live-skin-coloration-area .live-skin-main-text {
color: #61666D !important;
fill: #61666D !important;
}
/* 礼物栏 */
#gift-control-vm {
background-image: unset !important;
}
/* 右侧弹幕框背景 */
#chat-control-panel-vm .live-skin-coloration-area .live-skin-main-text {
color: #C9CCD0 !important;
fill: #C9CCD0 !important;
}
#chat-control-panel-vm {
background-image: unset !important;
background-color: #f6f7f8;
}
#chat-control-panel-vm .bl-button--primary {
background-color: #23ade5;
}
#chat-control-panel-vm .icon-left-part svg>path {
fill: #C9CCD0;
}
#chat-control-panel-vm .icon-left-part>div:hover svg>path {
fill: #00AEEC;
}
`
			}),
			// 修复字体
			new CheckboxItem({
				itemID: "font-patch",
				description: "修复字体",
				itemCSS: `
${fontFaceRegular}
body,
.gift-item,
.feed-card,
.bb-comment, .comment-bilibili-fold {
font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 400;
}
`
			}),
			// 活动直播页 自动跳转普通直播
			new CheckboxItem({
				itemID: "activity-live-auto-jump",
				description: "活动直播页 自动跳转普通直播 (实验功能)",
				enableFunc: async () => {
					if(document.querySelector("#internationalHeader")) {
						if(!location.href.includes("/blanc/")) {
							window.location.href = location.href.replace("live.bilibili.com/", "live.bilibili.com/blanc/");
						}
					}
				},
				enableFuncRunAt: "document-end"
			})
		];
		liveGroupList.push(new Group("live-basic", "直播页 基本功能", basicItems2));
		const infoItems = [
			// 隐藏 头像饰品
			new CheckboxItem({
				itemID: "live-page-head-info-avatar-pendant",
				description: "隐藏 头像饰品",
				itemCSS: `.blive-avatar :is(.blive-avatar-pendant, .blive-avatar-icons){display: none !important;}`
			}),
			// 隐藏 粉丝团
			new CheckboxItem({
				itemID: "live-page-head-info-vm-upper-row-follow-ctnr",
				description: "隐藏 粉丝团",
				itemCSS: `#head-info-vm .upper-row .follow-ctnr {display: none !important;}`
			}),
			// 隐藏 xx人看过
			new CheckboxItem({
				itemID: "live-page-head-info-vm-upper-row-visited",
				description: "隐藏 xx人看过",
				itemCSS: `#head-info-vm .upper-row .right-ctnr div:has(.watched-icon) {display: none !important;}`
			}),
			// 隐藏 人气
			new CheckboxItem({
				itemID: "live-page-head-info-vm-upper-row-popular",
				description: "隐藏 人气",
				itemCSS: `#head-info-vm .upper-row .right-ctnr div:has(.icon-popular) {display: none !important;}`
			}),
			// 隐藏 点赞
			new CheckboxItem({
				itemID: "live-page-head-info-vm-upper-row-like",
				description: "隐藏 点赞",
				itemCSS: `#head-info-vm .upper-row .right-ctnr div:has(.like-icon) {display: none !important;}`
			}),
			// 隐藏 举报, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-info-vm-upper-row-report",
				description: "隐藏 举报",
				defaultStatus: true,
				itemCSS: `
#head-info-vm .upper-row .right-ctnr div:has(.icon-report, [src*="img/report"]) {display: none !important;}`
			}),
			// 隐藏 分享, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-info-vm-upper-row-share",
				description: "隐藏 分享",
				defaultStatus: true,
				itemCSS: `
#head-info-vm .upper-row .right-ctnr div:has(.icon-share, [src*="img/share"]) {display: none !important;}`
			}),
			// 隐藏 人气榜, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-info-vm-lower-row-hot-rank",
				description: "隐藏 人气榜",
				defaultStatus: true,
				itemCSS: `#head-info-vm .lower-row .right-ctnr .popular-and-hot-rank {display: none !important;}`
			}),
			// 隐藏 礼物
			new CheckboxItem({
				itemID: "live-page-head-info-vm-lower-row-gift-planet-entry",
				description: "隐藏 礼物",
				itemCSS: `#head-info-vm .lower-row .right-ctnr .gift-planet-entry {display: none !important;}`
			}),
			// 隐藏 活动, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-info-vm-lower-row-activity-gather-entry",
				description: "隐藏 活动",
				defaultStatus: true,
				itemCSS: `#head-info-vm .lower-row .right-ctnr .activity-gather-entry {display: none !important;}`
			}),
			// 隐藏 全部直播信息栏
			new CheckboxItem({
				itemID: "live-page-head-info-vm",
				description: "隐藏 关闭整个信息栏",
				itemCSS: `#head-info-vm {display: none !important;}
/* 补齐圆角, 不可important */
#player-ctnr {
border-top-left-radius: 12px;
border-top-right-radius: 12px;
overflow: hidden;
}`
			})
		];
		liveGroupList.push(new Group("live-info", "直播信息栏", infoItems));
		const playerItems = [
			// 隐藏 右上角反馈, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-web-player-icon-feedback",
				description: "隐藏 右上角反馈",
				defaultStatus: true,
				itemCSS: `#live-player .web-player-icon-feedback {display: none !important;}`
			}),
			// 隐藏 购物小橙车提示, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-web-player-shop-popover-vm",
				description: "隐藏 购物小橙车提示",
				defaultStatus: true,
				itemCSS: `#shop-popover-vm {display: none !important;}`
			}),
			// 隐藏 直播PK特效
			new CheckboxItem({
				itemID: "live-page-head-web-player-awesome-pk-vm",
				description: "隐藏 直播PK特效",
				itemCSS: `#pk-vm, #awesome-pk-vm {display: none !important;}`
			}),
			// 隐藏 滚动礼物通告
			new CheckboxItem({
				itemID: "live-page-head-web-player-announcement-wrapper",
				description: "隐藏 滚动礼物通告",
				itemCSS: `#live-player .announcement-wrapper {display: none !important;}`
			}),
			// 隐藏 幻星互动游戏, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-web-player-game-id",
				description: "隐藏 幻星互动游戏",
				defaultStatus: true,
				itemCSS: `#game-id {display: none !important;}`
			}),
			// 隐藏 直播卡顿打分, 默认开启
			new CheckboxItem({
				itemID: "live-page-head-web-player-research-container",
				description: "隐藏 直播卡顿打分",
				defaultStatus: true,
				itemCSS: `.research-container {display: none !important;}`
			}),
			// 隐藏 天选时刻
			new CheckboxItem({
				itemID: "live-page-head-web-player-live-lottery",
				description: "隐藏 天选时刻",
				itemCSS: `#anchor-guest-box-id {display: none !important;}`
			}),
			// 隐藏 播放器顶部复读计数弹幕
			new CheckboxItem({
				itemID: "live-page-combo-danmaku",
				description: "隐藏 播放器顶部变动计数弹幕",
				itemCSS: `.danmaku-item-container > div.combo {display: none !important;}
.bilibili-combo-danmaku-container {display: none !important;}`
			}),
			// 隐藏 计数结尾的弹幕
			new CheckboxItem({
				itemID: "live-page-clean-counter-danmaku",
				description: "隐藏 计数结尾弹幕，如 ???? x24",
				enableFunc: async () => {
					enableCleanCounter = true;
					cleanLiveDanmaku();
				}
			}),
			// 隐藏 文字重复多遍的弹幕
			new CheckboxItem({
				itemID: "live-page-clean-redundant-text-danmaku",
				description: "隐藏 文字重复多遍的弹幕 (n≥5)\n如 prprprprpr, 88888888",
				enableFunc: async () => {
					enableCleanRedundant = true;
					cleanLiveDanmaku();
				}
			}),
			// // 隐藏 弹幕中重复多遍的emoji
			// new CheckboxItem({
			//     itemID: 'live-page-clean-redundant-emoji-danmaku',
			//     description: '隐藏 弹幕中重复多遍的emoji (n≥3)',
			//     itemCSS: `.danmaku-item-container .bili-dm:has(.bili-dm-emoji:nth-child(3)) .bili-dm-emoji {display: none !important;}`,
			// }),
			// 隐藏 弹幕中的小表情
			new CheckboxItem({
				itemID: "live-page-clean-all-danmaku-small-emoji",
				description: "隐藏 弹幕中的小表情",
				itemCSS: `.danmaku-item-container .bili-dm .bili-dm-emoji {display: none !important;}`
			}),
			// 隐藏 弹幕中的大表情
			new CheckboxItem({
				itemID: "live-page-clean-all-danmaku-big-emoji",
				description: "隐藏 弹幕中的大表情",
				itemCSS: `.danmaku-item-container .bili-dm img[style*="width:45px"] {display: none !important;}`
			}),
			// 隐藏 礼物栏
			new CheckboxItem({
				itemID: "live-page-gift-control-vm",
				description: "隐藏 礼物栏",
				itemCSS: `#gift-control-vm, #gift-control-vm-new {display: none !important;}
/* 补齐圆角, 不可important */
#player-ctnr {
border-bottom-left-radius: 12px;
border-bottom-right-radius: 12px;
overflow: hidden;
}`
			}),
			// 全屏下 隐藏弹幕发送框
			new CheckboxItem({
				itemID: "live-page-fullscreen-danmaku-vm",
				description: "全屏下 隐藏弹幕发送框",
				itemCSS: `#fullscreen-danmaku-vm {display: none !important;}`
			})
		];
		liveGroupList.push(new Group("live-player", "播放器", playerItems));
		const rightContainerItems = [
			// 隐藏 高能榜/大航海
			new CheckboxItem({
				itemID: "live-page-rank-list-vm",
				description: "隐藏 高能榜/大航海",
				// calc中强调单位，var变量必须添加单位，否则fallback
				itemCSS: `
#rank-list-vm {
display: none !important;
}
.chat-history-panel {
--rank-list-height: 0px;
height: calc(100% - var(--rank-list-height, 178px) - var(--chat-control-panel-height, 145px)) !important;
}
#chat-control-panel-vm {
height: var(--chat-control-panel-height, 145px) !important;
}
#aside-area-vm {
overflow: hidden;
}
`
			}),
			// 使弹幕列表紧凑, 默认开启
			new CheckboxItem({
				itemID: "live-page-compact-danmaku",
				description: "使弹幕列表紧凑",
				defaultStatus: true,
				itemCSS: `.chat-history-panel .chat-history-list .chat-item.danmaku-item.chat-colorful-bubble {margin: 2px 0 !important;}
.chat-history-panel .chat-history-list .chat-item {padding: 3px 5px !important; font-size: 1.2rem !important;}
.chat-history-panel .chat-history-list .chat-item.danmaku-item .user-name {font-size: 1.2rem !important;}
.chat-history-panel .chat-history-list .chat-item.danmaku-item .reply-uname {font-size: 1.2rem !important;}
.chat-history-panel .chat-history-list .chat-item.danmaku-item .reply-uname .common-nickname-wrapper {font-size: 1.2rem !important;}`
			}),
			// 隐藏 系统提示, 默认开启
			new CheckboxItem({
				itemID: "live-page-convention-msg",
				description: "隐藏 系统提示",
				defaultStatus: true,
				itemCSS: `.convention-msg.border-box {display: none !important;}`
			}),
			// 隐藏 用户排名
			new CheckboxItem({
				itemID: "live-page-rank-icon",
				description: "隐藏 用户排名",
				itemCSS: `.chat-item .rank-icon {display: none !important;}`
			}),
			// 隐藏 头衔装扮
			new CheckboxItem({
				itemID: "live-page-title-label",
				description: "隐藏 头衔装扮",
				itemCSS: `.chat-item .title-label {display: none !important;}`
			}),
			// 隐藏 用户等级, 默认开启
			new CheckboxItem({
				itemID: "live-page-wealth-medal-ctnr",
				description: "隐藏 用户等级",
				defaultStatus: true,
				itemCSS: `.chat-item .wealth-medal-ctnr {display: none !important;}`
			}),
			// 隐藏 团体勋章
			new CheckboxItem({
				itemID: "live-page-group-medal-ctnr",
				description: "隐藏 团体勋章",
				itemCSS: `.chat-item .group-medal-ctnr {display: none !important;}`
			}),
			// 隐藏 粉丝牌
			new CheckboxItem({
				itemID: "live-page-fans-medal-item-ctnr",
				description: "隐藏 粉丝牌",
				itemCSS: `.chat-item .fans-medal-item-ctnr {display: none !important;}`
			}),
			// 隐藏 弹幕高亮底色
			new CheckboxItem({
				itemID: "live-page-chat-item-background-color",
				description: "隐藏 弹幕高亮底色",
				itemCSS: `.chat-item {background-color: unset !important; border-image-source: unset !important;}`
			}),
			// 隐藏 礼物弹幕
			new CheckboxItem({
				itemID: "live-page-gift-item",
				description: "隐藏 礼物弹幕",
				itemCSS: `.chat-item.gift-item, .chat-item.common-danmuku-msg {display: none !important;}`
			}),
			// 隐藏 高能用户提示
			new CheckboxItem({
				itemID: "live-page-chat-item-top3-notice",
				description: "隐藏 高能用户提示",
				itemCSS: `.chat-item.top3-notice {display: none !important;}`
			}),
			// 隐藏 底部滚动提示, 默认开启
			new CheckboxItem({
				itemID: "live-page-brush-prompt",
				description: "隐藏 底部滚动提示",
				defaultStatus: true,
				itemCSS: `#brush-prompt {display: none !important;}
/* 弹幕栏高度 */
.chat-history-panel .chat-history-list.with-brush-prompt {height: 100% !important;}`
			}),
			// 隐藏 互动框 (倒计时互动), 默认开启
			new CheckboxItem({
				itemID: "live-page-combo-card-countdown",
				description: "隐藏 互动框 (倒计时互动)",
				defaultStatus: true,
				itemCSS: `#combo-card:has(.countDownBtn) {display: none !important;}
.chat-history-panel.new {padding-bottom: 0 !important;}`
			}),
			// 隐藏 互动框 (他们都在说), 默认开启
			new CheckboxItem({
				itemID: "live-page-combo-card",
				description: "隐藏 互动框 (他们都在说)",
				defaultStatus: true,
				itemCSS: `#combo-card:has(.combo-tips) {display: none !important;}`
			}),
			// 隐藏 互动框 (找TA玩), 默认开启
			new CheckboxItem({
				itemID: "live-page-service-card-container",
				description: "隐藏 互动框 (找TA玩)",
				defaultStatus: true,
				itemCSS: `.play-together-service-card-container {display: none !important;}`
			}),
			// 隐藏 发送框 左侧功能按钮
			new CheckboxItem({
				itemID: "live-page-control-panel-icon-row-left",
				description: "隐藏 发送框 左侧功能按钮",
				itemCSS: `#chat-control-panel-vm .control-panel-icon-row .icon-left-part {display: none !important;}`
			}),
			// 隐藏 发送框 右侧功能按钮
			new CheckboxItem({
				itemID: "live-page-control-panel-icon-row-right",
				description: "隐藏 发送框 右侧功能按钮",
				itemCSS: `#chat-control-panel-vm .control-panel-icon-row .icon-right-part {display: none !important;}`
			}),
			// 隐藏 发送框 粉丝勋章
			new CheckboxItem({
				itemID: "live-page-chat-input-ctnr-medal-section",
				description: "隐藏 发送框 粉丝勋章",
				itemCSS: `.medal-section {display: none !important;}`
			}),
			// 隐藏 发送框 发送按钮
			new CheckboxItem({
				itemID: "live-page-chat-input-ctnr-send-btn",
				description: "隐藏 发送框 发送按钮 (回车发送)",
				itemCSS: `
:root {
--ctrlh1: calc(145px - 36px);
--chat-control-panel-height: min(min(var(--ctrlh1, 145px), var(--ctrlh2, 145px)), var(--ctrlh3, 145px));
}
.bottom-actions {
display: none !important;
}
.chat-history-panel {
height: calc(100% - var(--rank-list-height, 178px) - var(--chat-control-panel-height, 145px)) !important;
}
#chat-control-panel-vm {
height: var(--chat-control-panel-height, 145px) !important;
}
#aside-area-vm {
overflow: hidden;
}
.chat-history-panel .danmaku-at-prompt {
bottom: calc(var(--chat-control-panel-height) + 3px);
}
`
			}),
			// 隐藏 发送框
			new CheckboxItem({
				itemID: "live-page-chat-input-ctnr",
				description: "隐藏 发送框",
				itemCSS: `
:root {
--ctrlh2: calc(145px - 105px);
--chat-control-panel-height: min(min(var(--ctrlh1, 145px), var(--ctrlh2, 145px)), var(--ctrlh3, 145px));
}
#chat-control-panel-vm .chat-input-ctnr,
#chat-control-panel-vm .bottom-actions {
display: none !important;
}
.chat-history-panel {
height: calc(100% - var(--rank-list-height, 178px) - var(--chat-control-panel-height, 145px)) !important;
}
#chat-control-panel-vm {
height: var(--chat-control-panel-height) !important;
}
#aside-area-vm {
overflow: hidden;
}
.chat-history-panel .danmaku-at-prompt {
bottom: calc(var(--chat-control-panel-height) + 10px);
}
`
			}),
			// 隐藏 弹幕栏底部全部功能
			new CheckboxItem({
				itemID: "live-page-chat-control-panel",
				description: "隐藏 弹幕栏底部全部功能",
				itemCSS: `
:root {
--ctrlh3: 0px;
--chat-control-panel-height: min(min(var(--ctrlh1, 145px), var(--ctrlh2, 145px)), var(--ctrlh3, 145px));
}
#chat-control-panel-vm {
display: none !important;
}
.chat-history-panel, .chat-history-panel.new {
height: calc(100% - var(--rank-list-height, 178px) - var(--chat-control-panel-height, 145px)) !important;
}
.chat-history-panel .chat-history-list {
padding: 10px !important;
}
#chat-control-panel-vm {
height: var(--chat-control-panel-height, 145px) !important;
}
#aside-area-vm {
overflow: hidden;
}
.chat-history-panel .danmaku-at-prompt {
bottom: calc(var(--chat-control-panel-height) + 30px);
}
`
			})
		];
		liveGroupList.push(new Group("live-right-container", "右栏 弹幕列表", rightContainerItems));
		const belowItems = [
			// 隐藏 活动海报, 默认开启
			new CheckboxItem({
				itemID: "live-page-flip-view",
				description: "隐藏 活动海报",
				defaultStatus: true,
				itemCSS: `.flip-view {display: none !important;}`
			}),
			// 隐藏 直播间推荐
			new CheckboxItem({
				itemID: "live-page-room-info-ctnr",
				description: "隐藏 直播间推荐/直播间介绍",
				itemCSS: `#sections-vm .room-info-ctnr {display: none !important;}`
			}),
			// 隐藏 主播动态
			new CheckboxItem({
				itemID: "live-page-room-feed",
				description: "隐藏 主播动态",
				itemCSS: `#sections-vm .room-feed {display: none !important;}`
			}),
			// 隐藏 主播公告
			new CheckboxItem({
				itemID: "live-page-announcement-cntr",
				description: "隐藏 主播公告",
				itemCSS: `#sections-vm .room-detail-box {display: none !important;}`
			}),
			// 隐藏 全部内容
			new CheckboxItem({
				itemID: "live-page-sections-vm",
				description: "隐藏 直播下方全部内容",
				itemCSS: `#sections-vm {display: none !important;}`
			})
		];
		liveGroupList.push(new Group("live-below", "下方页面 主播动态/直播公告", belowItems));
	}
	if(isPageLiveHome() || isPageLiveRoom()) {
		const headerLeftItems = [
			// 隐藏 直播LOGO
			new CheckboxItem({
				itemID: "live-page-header-entry-logo",
				description: "隐藏 直播LOGO",
				itemCSS: `
#main-ctnr a.entry_logo[href="//live.bilibili.com"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
.pre-hold-nav-logo {display: none !important;}
`
			}),
			// 隐藏 首页
			new CheckboxItem({
				itemID: "live-page-header-entry-title",
				description: "隐藏 首页",
				itemCSS: `
#main-ctnr a.entry-title[href="//www.bilibili.com"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href="//www.bilibili.com"]) {display: none !important;}
`
			}),
			// 隐藏 直播
			new CheckboxItem({
				itemID: "live-page-header-live",
				description: "隐藏 直播",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="live"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href="//live.bilibili.com"]) {display: none !important;}
`
			}),
			// 隐藏 网游
			new CheckboxItem({
				itemID: "live-page-header-net-game",
				description: "隐藏 网游",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="网游"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=2"]) {display: none !important;}
`
			}),
			// 隐藏 手游
			new CheckboxItem({
				itemID: "live-page-header-mobile-game",
				description: "隐藏 手游",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="手游"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=3"]) {display: none !important;}
`
			}),
			// 隐藏 单机游戏
			new CheckboxItem({
				itemID: "live-page-header-standalone-game",
				description: "隐藏 单机游戏",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="单机游戏"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=6"]) {display: none !important;}
`
			}),
			// 隐藏 虚拟主播
			new CheckboxItem({
				itemID: "live-page-header-standalone-vtuber",
				description: "隐藏 虚拟主播",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="虚拟主播"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=9"]) {display: none !important;}
`
			}),
			// 隐藏 娱乐
			new CheckboxItem({
				itemID: "live-page-header-standalone-entertainment",
				description: "隐藏 娱乐",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="娱乐"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=1&"]) {display: none !important;}
`
			}),
			// 隐藏 电台
			new CheckboxItem({
				itemID: "live-page-header-standalone-radio",
				description: "隐藏 电台",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="电台"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=5"]) {display: none !important;}
`
			}),
			// 隐藏 赛事
			new CheckboxItem({
				itemID: "live-page-header-standalone-match",
				description: "隐藏 赛事",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="赛事"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=13"]) {display: none !important;}
`
			}),
			// 隐藏 聊天室
			new CheckboxItem({
				itemID: "live-page-header-standalone-chatroom",
				description: "隐藏 聊天室",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="聊天室"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=14"]) {display: none !important;}
`
			}),
			// 隐藏 生活
			new CheckboxItem({
				itemID: "live-page-header-standalone-living",
				description: "隐藏 生活",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="生活"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=10"]) {display: none !important;}
`
			}),
			// 隐藏 知识
			new CheckboxItem({
				itemID: "live-page-header-standalone-knowledge",
				description: "隐藏 知识",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="知识"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=11"]) {display: none !important;}
`
			}),
			// 隐藏 帮我玩
			new CheckboxItem({
				itemID: "live-page-header-standalone-helpmeplay",
				description: "隐藏 帮我玩",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="帮我玩"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=301"]) {display: none !important;}
`
			}),
			// 隐藏 互动玩法
			new CheckboxItem({
				itemID: "live-page-header-standalone-interact",
				description: "隐藏 互动玩法",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="互动玩法"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=15"]) {display: none !important;}
`
			}),
			// 隐藏 购物
			new CheckboxItem({
				itemID: "live-page-header-standalone-shopping",
				description: "隐藏 购物",
				itemCSS: `
#main-ctnr .dp-table-cell a[name="购物"] {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:has(a[href*="parentAreaId=300"]) {display: none !important;}
`
			}),
			// 隐藏 更多, 默认开启
			new CheckboxItem({
				itemID: "live-page-header-showmore-link",
				description: "隐藏 更多",
				defaultStatus: true,
				itemCSS: `
#main-ctnr .showmore-link {display: none !important;}
.link-navbar-more .search-bar-ctnr {margin: 0 auto !important;}
#prehold-nav-vm .nav-item:last-child {display: none !important;}
`
			})
		];
		liveGroupList.push(new Group("live-header-left", "顶栏 左侧", headerLeftItems));
		const headerCenterItems = [
			// 隐藏 搜索框 推荐搜索
			new CheckboxItem({
				itemID: "live-page-nav-search-rcmd",
				description: "隐藏 搜索框 推荐搜索",
				itemCSS: `#nav-searchform input::placeholder {visibility: hidden;}`
			}),
			// 隐藏 搜索框 搜索历史
			new CheckboxItem({
				itemID: "live-page-nav-search-history",
				description: "隐藏 搜索框 搜索历史",
				itemCSS: `#nav-searchform .history {display: none !important;}`
			}),
			// 隐藏 搜索框 bilibili热搜
			new CheckboxItem({
				itemID: "live-page-nav-search-trending",
				description: "隐藏 搜索框 bilibili热搜",
				itemCSS: `#nav-searchform .trending {display: none !important;}`
			}),
			// 隐藏 整个搜索框
			new CheckboxItem({
				itemID: "live-page-header-search-block",
				description: "隐藏 整个搜索框",
				itemCSS: `#nav-searchform {display: none !important;}`
			})
		];
		liveGroupList.push(new Group("live-header-center", "顶栏 搜索框", headerCenterItems));
		const headerRightItems = [
			// 隐藏 头像
			new CheckboxItem({
				itemID: "live-page-header-avatar",
				description: "隐藏 头像",
				itemCSS: `#right-part .user-panel {display: none !important;}`
			}),
			// 隐藏 关注
			new CheckboxItem({
				itemID: "live-page-header-follow-panel",
				description: "隐藏 关注",
				itemCSS: `#right-part .shortcut-item:has(.follow-panel-set) {display: none;}`
			}),
			// 隐藏 购买电池
			new CheckboxItem({
				itemID: "live-page-header-recharge",
				description: "隐藏 购买电池",
				itemCSS: `#right-part .shortcut-item:has(.item-icon-recharge) {display: none;}`
			}),
			// 隐藏 下载客户端
			new CheckboxItem({
				itemID: "live-page-header-bili-download-panel",
				description: "隐藏 下载客户端",
				itemCSS: `#right-part .shortcut-item:has(.bili-download-panel) {visibility: hidden;}`
			}),
			// 隐藏 我要开播, 默认开启
			new CheckboxItem({
				itemID: "live-page-header-go-live",
				description: "隐藏 我要开播",
				defaultStatus: true,
				itemCSS: `#right-part .shortcut-item:has(.download-panel-ctnr) {visibility: hidden;}`
			})
		];
		liveGroupList.push(new Group("live-header-right", "顶栏 右侧", headerRightItems));
	}
	const fontFaceMedium = '@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.a.woff2) format("woff2");unicode-range:U+9aa2-ffe5}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.b.woff2) format("woff2");unicode-range:U+8983-9aa0}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.c.woff2) format("woff2");unicode-range:U+78f2-897b}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.d.woff2) format("woff2");unicode-range:U+646d-78d9}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.e.woff2) format("woff2");unicode-range:U+30e0-6445}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.f.woff2) format("woff2");unicode-range:U+101-30df}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.g.woff2) format("woff2");unicode-range:U+9aa8,U+9ab8,U+9ad3,U+9ad8,U+9b03,U+9b3c,U+9b41-9b42,U+9b44,U+9b4f,U+9b54,U+9c7c,U+9c81,U+9c8d,U+9c9c,U+9ca4,U+9cb8,U+9cc3,U+9cd6,U+9cde,U+9e1f,U+9e21,U+9e23,U+9e25-9e26,U+9e2d,U+9e2f,U+9e33,U+9e35,U+9e3d,U+9e3f,U+9e43,U+9e45,U+9e4a,U+9e4f,U+9e64,U+9e70,U+9e7f,U+9e93,U+9ea6,U+9ebb,U+9ec4,U+9ecd-9ece,U+9ed1,U+9ed4,U+9ed8,U+9f0e,U+9f13,U+9f20,U+9f3b,U+9f50,U+9f7f,U+9f84,U+9f8b,U+9f99-9f9a,U+9f9f,U+ff01,U+ff08-ff09,U+ff0c,U+ff1a-ff1b,U+ff1f}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.h.woff2) format("woff2");unicode-range:U+975b,U+975e,U+9760-9762,U+9769,U+9773-9774,U+9776,U+978b,U+978d,U+9798,U+97a0,U+97ad,U+97e6-97e7,U+97e9,U+97ed,U+97f3,U+97f5-97f6,U+9875-9877,U+9879-987b,U+987d-987f,U+9881-9882,U+9884-9888,U+988a,U+9890-9891,U+9893,U+9896-9898,U+989c-989d,U+98a0,U+98a4,U+98a7,U+98ce,U+98d8,U+98de-98df,U+9910,U+9965,U+996d-9972,U+9975-9976,U+997a,U+997c,U+997f,U+9981,U+9985-9986,U+9988,U+998b,U+998f,U+9992,U+9996,U+9999,U+9a6c-9a71,U+9a73-9a74,U+9a76,U+9a79,U+9a7b-9a7c,U+9a7e,U+9a82,U+9a84,U+9a86-9a87,U+9a8b-9a8c,U+9a8f,U+9a91,U+9a97,U+9a9a,U+9aa1,U+9aa4}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.i.woff2) format("woff2");unicode-range:U+9570,U+9576,U+957f,U+95e8,U+95ea,U+95ed-95f0,U+95f2,U+95f4,U+95f7-95fb,U+95fd,U+9600-9602,U+9605,U+9609,U+960e,U+9610-9611,U+9614,U+961c,U+961f,U+962e,U+9632-9636,U+963b,U+963f-9640,U+9644-9648,U+964b-964d,U+9650,U+9655,U+965b,U+9661-9662,U+9664,U+9668-966a,U+9675-9677,U+9685-9686,U+968b,U+968f-9690,U+9694,U+9698-9699,U+969c,U+96a7,U+96b6,U+96be,U+96c0-96c1,U+96c4-96c7,U+96cc-96cd,U+96cf,U+96d5,U+96e8,U+96ea,U+96f6-96f7,U+96f9,U+96fe,U+9700,U+9704,U+9707,U+9709,U+970d,U+9713,U+9716,U+971c,U+971e,U+9732,U+9738-9739,U+9752,U+9756,U+9759}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.j.woff2) format("woff2");unicode-range:U+9179,U+917f,U+9187,U+9189,U+918b,U+918d,U+9190,U+9192,U+919a-919b,U+91ba,U+91c7,U+91c9-91ca,U+91cc-91cf,U+91d1,U+91dc,U+9274,U+93d6,U+9488-9489,U+948e,U+9492-9493,U+9497,U+9499,U+949d-94a3,U+94a5-94a9,U+94ae,U+94b1,U+94b3,U+94b5,U+94bb,U+94be,U+94c0-94c3,U+94c5-94c6,U+94dc-94dd,U+94e1,U+94e3,U+94ec-94ed,U+94f0-94f2,U+94f6,U+94f8,U+94fa,U+94fe,U+9500-9501,U+9504-9505,U+9508,U+950b-950c,U+9510-9511,U+9517,U+9519-951a,U+9521,U+9523-9526,U+9528,U+952d-9530,U+9539,U+953b,U+9540-9541,U+9547,U+954a,U+954d,U+9550-9551,U+955c,U+9563,U+956d}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.k.woff2) format("woff2");unicode-range:U+9001-9003,U+9005-9006,U+9009-900a,U+900d,U+900f-9012,U+9014,U+9017,U+901a-901b,U+901d-9022,U+902e,U+9038,U+903b-903c,U+903e,U+9041-9042,U+9044,U+9047,U+904d,U+904f-9053,U+9057,U+905b,U+9062-9063,U+9065,U+9068,U+906d-906e,U+9075,U+907d,U+907f-9080,U+9082-9083,U+908b,U+9091,U+9093,U+9099,U+90a2-90a3,U+90a6,U+90aa,U+90ae-90af,U+90b1,U+90b5,U+90b8-90b9,U+90bb,U+90c1,U+90ca,U+90ce,U+90d1,U+90dd,U+90e1,U+90e7-90e8,U+90ed,U+90f4,U+90f8,U+90fd,U+9102,U+9119,U+9149,U+914b-914d,U+9152,U+9157,U+915a,U+915d-915e,U+9161,U+9163,U+9165,U+916a,U+916c,U+916e,U+9171,U+9175-9178}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.l.woff2) format("woff2");unicode-range:U+8e44,U+8e47-8e48,U+8e4a-8e4b,U+8e51,U+8e59,U+8e66,U+8e6c-8e6d,U+8e6f,U+8e72,U+8e74,U+8e76,U+8e7f,U+8e81,U+8e87,U+8e8f,U+8eab-8eac,U+8eaf,U+8eb2,U+8eba,U+8f66-8f69,U+8f6c,U+8f6e-8f72,U+8f74,U+8f7b,U+8f7d,U+8f7f,U+8f83-8f8a,U+8f8d-8f8e,U+8f90-8f91,U+8f93,U+8f95-8f99,U+8f9b-8f9c,U+8f9e-8f9f,U+8fa3,U+8fa8-8fa9,U+8fab,U+8fb0-8fb1,U+8fb9,U+8fbd-8fbe,U+8fc1-8fc2,U+8fc4-8fc5,U+8fc7-8fc8,U+8fce,U+8fd0-8fd1,U+8fd3-8fd5,U+8fd8-8fd9,U+8fdb-8fdf,U+8fe2,U+8fe6,U+8fe8,U+8fea-8feb,U+8fed,U+8ff0,U+8ff3,U+8ff7-8ff9,U+8ffd,U+9000}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.m.woff2) format("woff2");unicode-range:U+8d24-8d31,U+8d34-8d35,U+8d37-8d3f,U+8d41-8d45,U+8d48,U+8d4a-8d4c,U+8d4e-8d50,U+8d54,U+8d56,U+8d58,U+8d5a-8d5b,U+8d5d-8d5e,U+8d60-8d64,U+8d66-8d67,U+8d6b,U+8d70,U+8d74-8d77,U+8d81,U+8d85,U+8d8a-8d8b,U+8d9f,U+8da3,U+8db3-8db4,U+8db8,U+8dbe-8dbf,U+8dc3-8dc4,U+8dcb-8dcc,U+8dd1,U+8dd7,U+8ddb,U+8ddd,U+8ddf,U+8de4,U+8de8,U+8dea,U+8def,U+8df3,U+8df5,U+8df7,U+8dfa-8dfb,U+8e09-8e0a,U+8e0c,U+8e0f,U+8e1d-8e1e,U+8e22,U+8e29-8e2a,U+8e2e,U+8e31,U+8e35,U+8e39,U+8e42}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.n.woff2) format("woff2");unicode-range:U+8bc9-8bcd,U+8bcf,U+8bd1,U+8bd3,U+8bd5,U+8bd7-8bd8,U+8bda-8bdb,U+8bdd-8bde,U+8be0-8be9,U+8beb-8bf5,U+8bf7-8bf8,U+8bfa-8bfb,U+8bfd-8c01,U+8c03-8c06,U+8c08,U+8c0a-8c0b,U+8c0d-8c13,U+8c15,U+8c17,U+8c19-8c1c,U+8c22-8c24,U+8c26-8c2a,U+8c2c-8c2d,U+8c30-8c35,U+8c37,U+8c41,U+8c46,U+8c4c,U+8c61-8c62,U+8c6a-8c6b,U+8c79-8c7a,U+8c82,U+8c89,U+8c8c,U+8d1d-8d1f,U+8d21-8d23}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.o.woff2) format("woff2");unicode-range:U+889c,U+88a4,U+88ab,U+88ad,U+88b1,U+88c1-88c2,U+88c5-88c6,U+88c9,U+88d4-88d5,U+88d8-88d9,U+88df,U+88e3-88e4,U+88e8,U+88f1,U+88f3-88f4,U+88f8-88f9,U+88fe,U+8902,U+8910,U+8912-8913,U+891a-891b,U+8921,U+8925,U+892a-892b,U+8934,U+8936,U+8941,U+8944,U+895e-895f,U+8966,U+897f,U+8981,U+8986,U+89c1-89c2,U+89c4-89c6,U+89c8-89cb,U+89ce,U+89d0-89d2,U+89e3,U+89e5-89e6,U+8a00,U+8a07,U+8a79,U+8a89-8a8a,U+8a93,U+8b66,U+8b6c,U+8ba1-8bab,U+8bad-8bb0,U+8bb2-8bb3,U+8bb6-8bba,U+8bbc-8bc1,U+8bc4-8bc6,U+8bc8}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.p.woff2) format("woff2");unicode-range:U+8695,U+869c,U+86a3-86a4,U+86a7,U+86aa,U+86af,U+86b1,U+86c0,U+86c6-86c7,U+86ca-86cb,U+86d0,U+86d4,U+86d9,U+86db,U+86df,U+86e4,U+86ee,U+86f0,U+86f9,U+86fe,U+8700,U+8702-8703,U+8708-8709,U+870d,U+8712-8713,U+8715,U+8717-8718,U+871a,U+871c,U+8721,U+8725,U+8734,U+8737,U+873b,U+873f,U+8747,U+8749,U+874c,U+874e,U+8757,U+8759,U+8760,U+8763,U+8774,U+8776,U+877c,U+8782-8783,U+8785,U+878d,U+8793,U+879f,U+87af,U+87b3,U+87ba,U+87c6,U+87ca,U+87d1-87d2,U+87e0,U+87e5,U+87f9,U+87fe,U+8815,U+8822,U+8839,U+8840,U+8845,U+884c-884d,U+8854,U+8857,U+8859,U+8861,U+8863,U+8865,U+8868,U+886b-886c,U+8870,U+8877,U+887d-887f,U+8881-8882,U+8884-8885,U+8888,U+888b,U+888d,U+8892,U+8896}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.q.woff2) format("woff2");unicode-range:U+83dc-83dd,U+83e0,U+83e9,U+83f1-83f2,U+8403-8404,U+840b-840e,U+841d,U+8424-8428,U+843d,U+8451,U+8457,U+8459,U+845b,U+8461,U+8463,U+8469,U+846b-846c,U+8471,U+8475,U+847a,U+8482,U+848b,U+8499,U+849c,U+84b2,U+84b8,U+84bf,U+84c4,U+84c9,U+84d1,U+84d6,U+84dd,U+84df,U+84e6,U+84ec,U+8511,U+8513,U+8517,U+851a,U+851f,U+8521,U+852b-852c,U+8537,U+853b-853d,U+8549-854a,U+8559,U+8574,U+857e,U+8584,U+8587,U+858f,U+859b,U+85aa,U+85af-85b0,U+85c9,U+85cf-85d0,U+85d3,U+85d5,U+85e4,U+85e9,U+85fb,U+8611,U+8638,U+864e-8651,U+8654,U+865a,U+865e,U+866b-866c,U+8671,U+8679,U+867d-867e,U+8680-8682,U+868a,U+868c-868d,U+8693}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.r.woff2) format("woff2");unicode-range:U+8273,U+827a,U+827e,U+8282,U+828a-828b,U+828d,U+8292,U+8299,U+829c-829d,U+82a5-82a6,U+82a9,U+82ab-82ad,U+82af,U+82b1,U+82b3,U+82b7-82b9,U+82bd,U+82c7,U+82cd,U+82cf,U+82d1,U+82d3-82d4,U+82d7,U+82db,U+82de-82df,U+82e3,U+82e5-82e6,U+82eb,U+82ef,U+82f1,U+82f9,U+82fb,U+8301-8305,U+8309,U+830e,U+8314,U+8317,U+8327-8328,U+832b-832c,U+832f,U+8335-8336,U+8338-8339,U+8340,U+8346-8347,U+8349,U+834f-8352,U+8354,U+835a,U+835c,U+8361,U+8363-8364,U+8367,U+836b,U+836f,U+8377,U+837c,U+8386,U+8389,U+838e,U+8393,U+839e,U+83a0,U+83ab,U+83b1-83b4,U+83b7,U+83b9-83ba,U+83bd,U+83c1,U+83c5,U+83c7,U+83ca,U+83cc,U+83cf}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.s.woff2) format("woff2");unicode-range:U+80de,U+80e1,U+80e7,U+80ea-80eb,U+80ed,U+80ef-80f0,U+80f3-80f4,U+80f6,U+80f8,U+80fa,U+80fd,U+8102,U+8106,U+8109-810a,U+810d,U+810f-8111,U+8113-8114,U+8116,U+8118,U+811a,U+812f,U+8131,U+8138,U+813e,U+8146,U+814a-814c,U+8150-8151,U+8154-8155,U+8165,U+816e,U+8170,U+8174,U+8179-817c,U+817e-8180,U+818a,U+818f,U+8198,U+819b-819d,U+81a8,U+81b3,U+81ba-81bb,U+81c0,U+81c2-81c3,U+81c6,U+81ca,U+81e3,U+81ea,U+81ec-81ed,U+81f3-81f4,U+81fb-81fc,U+81fe,U+8200,U+8205-8206,U+820c-820d,U+8210,U+8212,U+8214,U+821c,U+821e-821f,U+822a-822c,U+8230-8231,U+8235-8239,U+8247,U+8258,U+826f-8270,U+8272}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.t.woff2) format("woff2");unicode-range:U+7f72,U+7f81,U+7f8a,U+7f8c,U+7f8e,U+7f94,U+7f9a,U+7f9e,U+7fa1,U+7fa4,U+7fb2,U+7fb8-7fb9,U+7fbd,U+7fc1,U+7fc5,U+7fcc,U+7fce,U+7fd4-7fd5,U+7fd8,U+7fdf-7fe1,U+7fe6,U+7fe9,U+7ff0-7ff1,U+7ff3,U+7ffb-7ffc,U+8000-8001,U+8003,U+8005,U+800c-800d,U+8010,U+8012,U+8015,U+8017-8019,U+8027,U+802a,U+8033,U+8036-8038,U+803b,U+803d,U+803f,U+8042,U+8046,U+804a-804c,U+8052,U+8054,U+8058,U+805a,U+806a,U+807f,U+8083-8084,U+8086-8087,U+8089,U+808b-808c,U+8096,U+8098,U+809a-809b,U+809d,U+80a0-80a2,U+80a4-80a5,U+80a9-80aa,U+80ae-80af,U+80b2,U+80b4,U+80ba,U+80be-80c1,U+80c3-80c4,U+80c6,U+80cc,U+80ce,U+80d6,U+80da-80dc}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.u.woff2) format("woff2");unicode-range:U+7eb5-7eba,U+7ebd,U+7ebf,U+7ec2-7eca,U+7ecd-7ed5,U+7ed8-7edf,U+7ee1-7ee3,U+7ee5-7ee7,U+7ee9-7eeb,U+7eed,U+7eef-7ef0,U+7ef3-7ef8,U+7efc-7efd,U+7eff-7f00,U+7f04-7f09,U+7f0e-7f0f,U+7f13-7f16,U+7f18,U+7f1a,U+7f1c-7f1d,U+7f1f-7f22,U+7f24-7f26,U+7f28-7f2a,U+7f2d-7f2e,U+7f30,U+7f34,U+7f38,U+7f3a,U+7f42,U+7f50-7f51,U+7f54-7f55,U+7f57,U+7f5a,U+7f61-7f62,U+7f69-7f6a,U+7f6e}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.v.woff2) format("woff2");unicode-range:U+7b4c,U+7b4f-7b52,U+7b54,U+7b56,U+7b5b,U+7b5d,U+7b75,U+7b77,U+7b79,U+7b7e,U+7b80,U+7b8d,U+7b94-7b95,U+7b97,U+7ba1,U+7ba9-7bab,U+7bad,U+7bb1,U+7bb8,U+7bc6-7bc7,U+7bd1,U+7bd3,U+7bd9,U+7bdd,U+7be1,U+7bee,U+7bf1,U+7bf7,U+7bfe,U+7c07,U+7c0c,U+7c27,U+7c2a,U+7c38,U+7c3f,U+7c41,U+7c4d,U+7c73,U+7c7b,U+7c7d,U+7c89,U+7c92,U+7c95,U+7c97-7c98,U+7c9f,U+7ca4-7ca5,U+7caa,U+7cae,U+7cb1,U+7cb3,U+7cb9,U+7cbc-7cbe,U+7cc5,U+7cca,U+7cd5-7cd7,U+7cd9,U+7cdc,U+7cdf-7ce0,U+7cef,U+7cfb,U+7d0a,U+7d20,U+7d22,U+7d27,U+7d2b,U+7d2f,U+7d6e,U+7e41,U+7e82,U+7ea0-7ea4,U+7ea6-7ea8,U+7eaa-7ead,U+7eaf-7eb3}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.w.woff2) format("woff2");unicode-range:U+7981,U+7984-7985,U+798f,U+79b9,U+79bb,U+79bd-79be,U+79c0-79c1,U+79c3,U+79c6,U+79c9,U+79cb,U+79cd,U+79d1-79d2,U+79d8,U+79df,U+79e3-79e4,U+79e6-79e7,U+79e9,U+79ef-79f0,U+79f8,U+79fb,U+79fd,U+7a00,U+7a0b,U+7a0d-7a0e,U+7a14,U+7a17,U+7a1a,U+7a20,U+7a33,U+7a37,U+7a39,U+7a3b-7a3d,U+7a3f,U+7a46,U+7a51,U+7a57,U+7a74,U+7a76-7a77,U+7a79-7a7a,U+7a7f,U+7a81,U+7a83-7a84,U+7a88,U+7a8d,U+7a91-7a92,U+7a95-7a98,U+7a9c-7a9d,U+7a9f,U+7aa5-7aa6,U+7abf,U+7acb,U+7ad6,U+7ad9,U+7ade-7ae0,U+7ae3,U+7ae5-7ae6,U+7aed,U+7aef,U+7af9,U+7afd,U+7aff,U+7b03,U+7b06,U+7b08,U+7b0b,U+7b11,U+7b14,U+7b19,U+7b1b,U+7b20,U+7b26,U+7b28,U+7b2c,U+7b3a,U+7b3c,U+7b49,U+7b4b}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.x.woff2) format("woff2");unicode-range:U+77aa,U+77ac,U+77b0,U+77b3,U+77b5,U+77bb,U+77bf,U+77d7,U+77db-77dc,U+77e2-77e3,U+77e5,U+77e9,U+77eb,U+77ed-77ee,U+77f3,U+77fd-77ff,U+7801-7802,U+780c-780d,U+7812,U+7814,U+7816,U+781a,U+781d,U+7823,U+7825,U+7827,U+7830,U+7834,U+7837-7838,U+783a,U+783e,U+7840,U+7845,U+784c,U+7852,U+7855,U+785d,U+786b-786c,U+786e,U+787c,U+7887,U+7889,U+788c-788e,U+7891,U+7897-7898,U+789c,U+789f,U+78a5,U+78a7,U+78b0-78b1,U+78b3-78b4,U+78be,U+78c1,U+78c5,U+78ca-78cb,U+78d0,U+78d5,U+78e8,U+78ec,U+78f7,U+78fa,U+7901,U+7934,U+793a,U+793c,U+793e,U+7940-7941,U+7948,U+7956-7957,U+795a-795b,U+795d-7960,U+7965,U+7968,U+796d,U+796f,U+7977-7978,U+797a,U+7980}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.y.woff2) format("woff2");unicode-range:U+761f,U+7624,U+7626,U+7629-762b,U+7634-7635,U+7638,U+763e,U+764c,U+7656,U+765e,U+7663,U+766b,U+7678,U+767b,U+767d-767e,U+7682,U+7684,U+7686-7688,U+768b,U+768e,U+7691,U+7693,U+7696,U+7699,U+76ae,U+76b1,U+76b4,U+76bf,U+76c2,U+76c5-76c6,U+76c8,U+76ca,U+76ce-76d2,U+76d4,U+76d6-76d8,U+76db,U+76df,U+76ee-76ef,U+76f2,U+76f4,U+76f8-76f9,U+76fc,U+76fe,U+7701,U+7708-7709,U+770b,U+771f-7720,U+7726,U+7728-7729,U+772f,U+7736-7738,U+773a,U+773c,U+7740-7741,U+7750-7751,U+775a-775b,U+7761,U+7763,U+7765-7766,U+7768,U+776b-776c,U+7779,U+777d,U+777f,U+7784-7785,U+778c,U+778e,U+7791-7792,U+779f-77a0,U+77a5,U+77a7,U+77a9}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.z.woff2) format("woff2");unicode-range:U+7435-7436,U+743c,U+7455,U+7459-745a,U+745c,U+745e-745f,U+7470,U+7476,U+7480,U+7483,U+7487,U+749c,U+749e,U+74a7-74a8,U+74dc,U+74e2-74e4,U+74e6,U+74ee,U+74f6-74f7,U+7504,U+7518,U+751a,U+751c,U+751f,U+7525,U+7528-7529,U+752b-752d,U+7530-7533,U+7535,U+7537-7538,U+753b,U+7545,U+754c,U+754f,U+7554,U+7559,U+755c,U+7565-7566,U+756a,U+7574,U+7578,U+7583,U+7586,U+758f,U+7591,U+7597,U+7599-759a,U+759f,U+75a1,U+75a4-75a5,U+75ab,U+75ae-75b2,U+75b4-75b5,U+75b9,U+75bc-75be,U+75c5,U+75c7-75ca,U+75cd,U+75d2,U+75d4-75d5,U+75d8,U+75db,U+75de,U+75e2-75e3,U+75e8,U+75ea,U+75f0,U+75f4,U+75f9,U+7600-7601}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.aa.woff2) format("woff2");unicode-range:U+725f,U+7261-7262,U+7267,U+7269,U+7272,U+7275,U+7279-727a,U+7280-7281,U+7284,U+728a,U+7292,U+729f,U+72ac,U+72af,U+72b6-72b9,U+72c1-72c2,U+72c4,U+72c8,U+72ce,U+72d0,U+72d2,U+72d7,U+72d9,U+72de,U+72e0-72e1,U+72e9,U+72ec-72f2,U+72f7-72f8,U+72fc,U+730a,U+730e,U+7316,U+731b-731d,U+7322,U+7325,U+7329-732c,U+732e,U+7334,U+733e-733f,U+7350,U+7357,U+7360,U+736d,U+7384,U+7387,U+7389,U+738b,U+7396,U+739b,U+73a9,U+73ab,U+73af-73b0,U+73b2,U+73b7,U+73ba-73bb,U+73c0,U+73c8,U+73ca,U+73cd,U+73d0-73d1,U+73d9,U+73e0,U+73ed,U+7403,U+7405-7406,U+7409-740a,U+740f-7410,U+741a,U+7422,U+7425,U+742a,U+7433-7434}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ab.woff2) format("woff2");unicode-range:U+706d,U+706f-7070,U+7075-7076,U+7078,U+707c,U+707e-707f,U+7089-708a,U+708e,U+7092,U+7094-7096,U+7099,U+70ab-70af,U+70b1,U+70b3,U+70b8-70b9,U+70bc-70bd,U+70c1-70c3,U+70c8,U+70ca,U+70d8-70d9,U+70db,U+70df,U+70e4,U+70e6-70e7,U+70e9,U+70eb-70ed,U+70ef,U+70f7,U+70f9,U+70fd,U+7109-710a,U+7115,U+7119-711a,U+7126,U+7130-7131,U+7136,U+714c,U+714e,U+715e,U+7164,U+7166-7168,U+716e,U+7172-7173,U+717d,U+7184,U+718a,U+718f,U+7194,U+7198-7199,U+719f-71a0,U+71a8,U+71ac,U+71b9,U+71c3,U+71ce,U+71d5,U+71e5,U+7206,U+722a,U+722c,U+7231,U+7235-7239,U+723d,U+7247-7248,U+724c-724d,U+7252,U+7259,U+725b}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ac.woff2) format("woff2");unicode-range:U+6df7,U+6df9,U+6dfb,U+6e05,U+6e0a,U+6e0d-6e0e,U+6e10,U+6e14,U+6e17,U+6e1a,U+6e1d,U+6e20-6e21,U+6e23-6e25,U+6e29,U+6e2d,U+6e2f,U+6e32,U+6e34,U+6e38,U+6e3a,U+6e43,U+6e4d,U+6e56,U+6e58,U+6e5b,U+6e6e,U+6e7e-6e7f,U+6e83,U+6e85,U+6e89,U+6e90,U+6e9c,U+6ea2,U+6ea5,U+6eaa,U+6eaf,U+6eb6,U+6eba,U+6ec1,U+6ec7,U+6ecb,U+6ed1,U+6ed3-6ed5,U+6eda,U+6ede,U+6ee1,U+6ee4-6ee6,U+6ee8-6ee9,U+6ef4,U+6f02,U+6f06,U+6f09,U+6f0f,U+6f13-6f15,U+6f20,U+6f29-6f2b,U+6f31,U+6f33,U+6f3e,U+6f46-6f47,U+6f4d,U+6f58,U+6f5c,U+6f5e,U+6f62,U+6f66,U+6f6d-6f6e,U+6f84,U+6f88-6f89,U+6f8e,U+6f9c,U+6fa1,U+6fb3,U+6fb9,U+6fc0,U+6fd1-6fd2,U+6fe1,U+7011,U+701a,U+7023,U+704c,U+706b}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ad.woff2) format("woff2");unicode-range:U+6ccc,U+6cd3,U+6cd5,U+6cdb,U+6cde,U+6ce1-6ce3,U+6ce5,U+6ce8,U+6cea-6ceb,U+6cef-6cf1,U+6cf3,U+6cf5,U+6cfb-6cfe,U+6d01,U+6d0b,U+6d12,U+6d17,U+6d1b,U+6d1e,U+6d25,U+6d27,U+6d2a,U+6d31-6d32,U+6d3b-6d3e,U+6d41,U+6d43,U+6d45-6d47,U+6d4a-6d4b,U+6d4e-6d4f,U+6d51,U+6d53,U+6d59-6d5a,U+6d63,U+6d66,U+6d69-6d6a,U+6d6e,U+6d74,U+6d77-6d78,U+6d82,U+6d85,U+6d88-6d89,U+6d8c,U+6d8e,U+6d93,U+6d95,U+6d9b,U+6d9d,U+6d9f-6da1,U+6da3-6da4,U+6da6-6daa,U+6dae-6daf,U+6db2,U+6db5,U+6db8,U+6dc0,U+6dc4-6dc7,U+6dcb-6dcc,U+6dd1,U+6dd6,U+6dd8-6dd9,U+6de1,U+6de4,U+6deb-6dec,U+6dee,U+6df1,U+6df3}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ae.woff2) format("woff2");unicode-range:U+6b92,U+6b96,U+6b9a,U+6ba1,U+6bb4-6bb5,U+6bb7,U+6bbf,U+6bc1,U+6bc5,U+6bcb,U+6bcd,U+6bcf,U+6bd2,U+6bd4-6bd7,U+6bd9,U+6bdb,U+6be1,U+6beb,U+6bef,U+6c05,U+6c0f,U+6c11,U+6c13-6c14,U+6c16,U+6c1b,U+6c1f,U+6c22,U+6c24,U+6c26-6c28,U+6c2e-6c30,U+6c32,U+6c34,U+6c38,U+6c3d,U+6c40-6c42,U+6c47,U+6c49,U+6c50,U+6c55,U+6c57,U+6c5b,U+6c5d-6c61,U+6c64,U+6c68-6c6a,U+6c70,U+6c72,U+6c76,U+6c79,U+6c7d-6c7e,U+6c81-6c83,U+6c86,U+6c88-6c89,U+6c8c,U+6c8f-6c90,U+6c93,U+6c99,U+6c9b,U+6c9f,U+6ca1,U+6ca4-6ca7,U+6caa-6cab,U+6cae,U+6cb3,U+6cb8-6cb9,U+6cbb-6cbf,U+6cc4-6cc5,U+6cc9-6cca}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.af.woff2) format("woff2");unicode-range:U+68ad,U+68af-68b0,U+68b3,U+68b5,U+68c0,U+68c2,U+68c9,U+68cb,U+68cd,U+68d2,U+68d5,U+68d8,U+68da,U+68e0,U+68ee,U+68f1,U+68f5,U+68fa,U+6905,U+690d-690e,U+6912,U+692d,U+6930,U+693d,U+693f,U+6942,U+6954,U+6957,U+695a,U+695e,U+6963,U+696b,U+6977-6978,U+697c,U+6982,U+6984,U+6986,U+6994,U+699c,U+69a8,U+69ad,U+69b4,U+69b7,U+69bb,U+69c1,U+69cc,U+69d0,U+69db,U+69fd,U+69ff,U+6a0a,U+6a1f,U+6a21,U+6a2a,U+6a31,U+6a35,U+6a3d,U+6a44,U+6a47,U+6a58-6a59,U+6a61,U+6a71,U+6a80,U+6a84,U+6a8e,U+6a90,U+6aac,U+6b20-6b23,U+6b27,U+6b32,U+6b3a,U+6b3e,U+6b47,U+6b49,U+6b4c,U+6b62-6b67,U+6b6a,U+6b79,U+6b7b-6b7c,U+6b81,U+6b83-6b84,U+6b86-6b87,U+6b89-6b8b}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ag.woff2) format("woff2");unicode-range:U+6756,U+675c,U+675e-6761,U+6765,U+6768,U+676d,U+676f-6770,U+6773,U+6775,U+6777,U+677c,U+677e-677f,U+6781,U+6784,U+6787,U+6789,U+6790,U+6795,U+6797,U+679a,U+679c-679d,U+67a2-67a3,U+67aa-67ab,U+67ad,U+67af-67b0,U+67b6-67b7,U+67c4,U+67cf-67d4,U+67d9-67da,U+67dc,U+67de,U+67e0,U+67e5,U+67e9,U+67ec,U+67ef,U+67f1,U+67f3-67f4,U+67ff-6800,U+6805,U+6807-6808,U+680b,U+680f,U+6811,U+6813,U+6816-6817,U+6821,U+6829-682a,U+6837-6839,U+683c-683d,U+6840,U+6842-6843,U+6845-6846,U+6848,U+684c,U+6850-6851,U+6853-6854,U+6863,U+6865,U+6868-6869,U+6874,U+6876,U+6881,U+6885-6886,U+6893,U+6897,U+68a2,U+68a6-68a8}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ah.woff2) format("woff2");unicode-range:U+65f7,U+65fa,U+6602,U+6606,U+660a,U+660c,U+660e-660f,U+6613-6614,U+6619,U+661d,U+661f-6620,U+6625,U+6627-6628,U+662d,U+662f,U+6631,U+6635,U+663c,U+663e,U+6643,U+664b-664c,U+664f,U+6652-6653,U+6655-6657,U+665a,U+6664,U+6666,U+6668,U+666e-6670,U+6674,U+6676-6677,U+667a,U+667e,U+6682,U+6684,U+6687,U+668c,U+6691,U+6696-6697,U+669d,U+66a7,U+66ae,U+66b4,U+66d9,U+66dc-66dd,U+66e6,U+66f0,U+66f2-66f4,U+66f9,U+66fc,U+66fe-6700,U+6708-6709,U+670b,U+670d,U+6714-6715,U+6717,U+671b,U+671d,U+671f,U+6726,U+6728,U+672a-672d,U+672f,U+6731,U+6734-6735,U+673a,U+673d,U+6740,U+6742-6743,U+6746,U+6748-6749,U+674e-6751}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ai.woff2) format("woff2");unicode-range:U+6467,U+6469,U+6478-6479,U+6482,U+6485,U+6487,U+6491-6492,U+6495,U+649e,U+64a4,U+64a9,U+64ac-64ae,U+64b0,U+64b5,U+64b8,U+64ba,U+64bc,U+64c2,U+64c5,U+64cd-64ce,U+64d2,U+64d8,U+64de,U+64e2,U+64e6,U+6500,U+6512,U+6518,U+6525,U+652b,U+652f,U+6536,U+6538-6539,U+653b,U+653e-653f,U+6545,U+6548,U+654c,U+654f,U+6551,U+6555-6556,U+6559,U+655b,U+655d-655e,U+6562-6563,U+6566,U+656c,U+6570,U+6572,U+6574,U+6577,U+6587,U+658b-658c,U+6590-6591,U+6593,U+6597,U+6599,U+659c,U+659f,U+65a1,U+65a4-65a5,U+65a7,U+65a9,U+65ab,U+65ad,U+65af-65b0,U+65b9,U+65bd,U+65c1,U+65c4-65c5,U+65cb-65cc,U+65cf,U+65d7,U+65e0,U+65e2,U+65e5-65e9,U+65ec-65ed,U+65f1,U+65f6}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.aj.woff2) format("woff2");unicode-range:U+6323-6325,U+6328,U+632a-632b,U+632f,U+6332,U+633a,U+633d,U+6342,U+6345-6346,U+6349,U+634b-6350,U+6355,U+635e-635f,U+6361-6363,U+6367,U+636e,U+6371,U+6376-6377,U+637a-637b,U+6380,U+6382,U+6387-6389,U+638c,U+638f-6390,U+6392,U+6396,U+6398,U+63a0,U+63a2-63a3,U+63a5,U+63a7-63aa,U+63ac,U+63b0,U+63b3-63b4,U+63b7-63b8,U+63ba,U+63c4,U+63c9,U+63cd,U+63cf-63d0,U+63d2,U+63d6,U+63e1,U+63e3,U+63e9-63ea,U+63ed,U+63f4,U+63f6,U+63fd,U+6400-6402,U+6405,U+640f-6410,U+6413-6414,U+641c,U+641e,U+6421,U+642a,U+642c-642d,U+643a,U+643d,U+6441,U+6444,U+6446-6448,U+644a,U+6452,U+6454,U+6458,U+645e}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ak.woff2) format("woff2");unicode-range:U+6258,U+625b,U+6263,U+6266-6267,U+6269-6270,U+6273,U+6276,U+6279,U+627c,U+627e-6280,U+6284,U+6289-628a,U+6291-6293,U+6295-6298,U+629a-629b,U+62a0-62a2,U+62a4-62a5,U+62a8,U+62ab-62ac,U+62b1,U+62b5,U+62b9,U+62bc-62bd,U+62bf,U+62c2,U+62c4-62ca,U+62cc-62ce,U+62d0,U+62d2-62d4,U+62d6-62d9,U+62db-62dc,U+62df,U+62e2-62e3,U+62e5-62e9,U+62ec-62ed,U+62ef,U+62f1,U+62f3-62f4,U+62f7,U+62fc-62ff,U+6301-6302,U+6307,U+6309,U+630e,U+6311,U+6316,U+631a-631b,U+631d-6321}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.al.woff2) format("woff2");unicode-range:U+60cb,U+60d1,U+60d5,U+60d8,U+60da,U+60dc,U+60df-60e0,U+60e6-60e9,U+60eb-60f0,U+60f3-60f4,U+60f6,U+60f9-60fa,U+6101,U+6108-6109,U+610e-610f,U+6115,U+611a,U+611f-6120,U+6123-6124,U+6127,U+612b,U+613f,U+6148,U+614a,U+614c,U+614e,U+6151,U+6155,U+6162,U+6167-6168,U+6170,U+6175,U+6177,U+618b,U+618e,U+6194,U+61a7-61a9,U+61ac,U+61be,U+61c2,U+61c8,U+61ca,U+61d1-61d2,U+61d4,U+61e6,U+61f5,U+61ff,U+6208,U+620a,U+620c-6212,U+6216,U+6218,U+621a-621b,U+621f,U+622a,U+622c,U+622e,U+6233-6234,U+6237,U+623e-6241,U+6247-6249,U+624b,U+624d-624e,U+6251-6254}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.am.woff2) format("woff2");unicode-range:U+5fcc-5fcd,U+5fcf-5fd2,U+5fd6-5fd9,U+5fdd,U+5fe0-5fe1,U+5fe4,U+5fe7,U+5fea-5feb,U+5ff1,U+5ff5,U+5ffb,U+5ffd-6002,U+6005-6006,U+600d-600f,U+6012,U+6014-6016,U+6019,U+601c-601d,U+6020-6021,U+6025-6028,U+602a,U+602f,U+6035,U+603b-603c,U+6041,U+6043,U+604b,U+604d,U+6050,U+6052,U+6055,U+6059-605a,U+6062-6064,U+6068-606d,U+606f-6070,U+6073,U+6076,U+6078-607c,U+607f,U+6084,U+6089,U+608c-608d,U+6094,U+6096,U+609a,U+609f-60a0,U+60a3,U+60a6,U+60a8,U+60ac,U+60af,U+60b1-60b2,U+60b4,U+60b8,U+60bb-60bc,U+60c5-60c6,U+60ca}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.an.woff2) format("woff2");unicode-range:U+5e7f,U+5e84,U+5e86-5e87,U+5e8a,U+5e8f-5e90,U+5e93-5e97,U+5e99-5e9a,U+5e9c,U+5e9e-5e9f,U+5ea6-5ea7,U+5ead,U+5eb5-5eb8,U+5ec9-5eca,U+5ed1,U+5ed3,U+5ed6,U+5ef6-5ef7,U+5efa,U+5f00,U+5f02-5f04,U+5f08,U+5f0a-5f0b,U+5f0f,U+5f11,U+5f13,U+5f15,U+5f17-5f18,U+5f1b,U+5f1f-5f20,U+5f25-5f27,U+5f29,U+5f2f,U+5f31,U+5f39-5f3a,U+5f52-5f53,U+5f55,U+5f57,U+5f5d,U+5f62,U+5f64,U+5f66,U+5f69-5f6a,U+5f6c-5f6d,U+5f70-5f71,U+5f77,U+5f79,U+5f7b-5f7c,U+5f80-5f81,U+5f84-5f85,U+5f87-5f8b,U+5f90,U+5f92,U+5f95,U+5f97-5f98,U+5fa1,U+5fa8,U+5faa,U+5fad-5fae,U+5fb5,U+5fb7,U+5fbc-5fbd,U+5fc3,U+5fc5-5fc6}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ao.woff2) format("woff2");unicode-range:U+5c7f,U+5c81-5c82,U+5c8c,U+5c94,U+5c96-5c97,U+5c9a-5c9b,U+5ca9,U+5cad,U+5cb3,U+5cb8,U+5cbf,U+5ccb,U+5cd9,U+5ce1,U+5ce5-5ce6,U+5ce8,U+5cea,U+5ced,U+5cf0,U+5cfb,U+5d02,U+5d07,U+5d0e,U+5d14,U+5d16,U+5d1b,U+5d24,U+5d29,U+5d2d,U+5d34,U+5d3d,U+5d4c,U+5d58,U+5d6c,U+5d82,U+5d99,U+5dc5,U+5dcd,U+5ddd-5dde,U+5de1-5de2,U+5de5-5de9,U+5deb,U+5dee,U+5df1-5df4,U+5df7,U+5dfe,U+5e01-5e03,U+5e05-5e06,U+5e08,U+5e0c,U+5e10-5e11,U+5e15-5e16,U+5e18,U+5e1a-5e1d,U+5e26-5e27,U+5e2d-5e2e,U+5e37-5e38,U+5e3c-5e3d,U+5e42,U+5e44-5e45,U+5e4c,U+5e54-5e55,U+5e61-5e62,U+5e72-5e74,U+5e76,U+5e78,U+5e7a-5e7d}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ap.woff2) format("woff2");unicode-range:U+5b85,U+5b87-5b89,U+5b8b-5b8c,U+5b8f,U+5b95,U+5b97-5b9e,U+5ba0-5ba4,U+5ba6,U+5baa-5bab,U+5bb0,U+5bb3-5bb6,U+5bb9,U+5bbd-5bbf,U+5bc2,U+5bc4-5bc7,U+5bcc,U+5bd0,U+5bd2-5bd3,U+5bdd-5bdf,U+5be1,U+5be4-5be5,U+5be8,U+5bf0,U+5bf8-5bfc,U+5bff,U+5c01,U+5c04,U+5c06,U+5c09-5c0a,U+5c0f,U+5c11,U+5c14,U+5c16,U+5c18,U+5c1a,U+5c1d,U+5c24,U+5c27,U+5c2c,U+5c31,U+5c34,U+5c38-5c3a,U+5c3c-5c42,U+5c45,U+5c48-5c4b,U+5c4e-5c51,U+5c55,U+5c5e,U+5c60-5c61,U+5c65,U+5c6f,U+5c71,U+5c79}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.aq.woff2) format("woff2");unicode-range:U+5996,U+5999,U+599e,U+59a5,U+59a8-59aa,U+59ae,U+59b2,U+59b9,U+59bb,U+59be,U+59c6,U+59cb,U+59d0-59d1,U+59d3-59d4,U+59d7-59d8,U+59da,U+59dc-59dd,U+59e3,U+59e5,U+59e8,U+59ec,U+59f9,U+59fb,U+59ff,U+5a01,U+5a03-5a04,U+5a06-5a07,U+5a11,U+5a13,U+5a18,U+5a1c,U+5a1f-5a20,U+5a25,U+5a29,U+5a31-5a32,U+5a34,U+5a36,U+5a3c,U+5a40,U+5a46,U+5a49-5a4a,U+5a5a,U+5a62,U+5a6a,U+5a74,U+5a76-5a77,U+5a7f,U+5a92,U+5a9a-5a9b,U+5ab2-5ab3,U+5ac1-5ac2,U+5ac9,U+5acc,U+5ad4,U+5ad6,U+5ae1,U+5ae3,U+5ae6,U+5ae9,U+5b09,U+5b34,U+5b37,U+5b40,U+5b50,U+5b54-5b55,U+5b57-5b59,U+5b5c-5b5d,U+5b5f,U+5b63-5b64,U+5b66,U+5b69-5b6a,U+5b6c,U+5b70-5b71,U+5b75,U+5b7a,U+5b7d,U+5b81,U+5b83}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ar.woff2) format("woff2");unicode-range:U+57ce,U+57d4,U+57df-57e0,U+57f9-57fa,U+5800,U+5802,U+5806,U+5811,U+5815,U+5821,U+5824,U+582a,U+5830,U+5835,U+584c,U+5851,U+5854,U+5858,U+585e,U+586b,U+587e,U+5883,U+5885,U+5892-5893,U+5899,U+589e-589f,U+58a8-58a9,U+58c1,U+58d1,U+58d5,U+58e4,U+58eb-58ec,U+58ee,U+58f0,U+58f3,U+58f6,U+58f9,U+5904,U+5907,U+590d,U+590f,U+5915-5916,U+5919-591a,U+591c,U+591f,U+5927,U+5929-592b,U+592d-592f,U+5931,U+5934,U+5937-593a,U+5942,U+5944,U+5947-5949,U+594b,U+594e-594f,U+5951,U+5954-5957,U+595a,U+5960,U+5962,U+5965,U+5973-5974,U+5976,U+5978-5979,U+597d,U+5981-5984,U+5986-5988,U+598a,U+598d,U+5992-5993}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.as.woff2) format("woff2");unicode-range:U+561b,U+561e-561f,U+5624,U+562d,U+5631-5632,U+5634,U+5636,U+5639,U+563b,U+563f,U+564c,U+564e,U+5654,U+5657,U+5659,U+565c,U+5662,U+5664,U+5668-566c,U+5676,U+567c,U+5685,U+568e-568f,U+5693,U+56a3,U+56b7,U+56bc,U+56ca,U+56d4,U+56da-56db,U+56de,U+56e0,U+56e2,U+56e4,U+56ed,U+56f0-56f1,U+56f4,U+56f9-56fa,U+56fd-56ff,U+5703,U+5706,U+5708-5709,U+571f,U+5723,U+5728,U+572d,U+5730,U+573a,U+573e,U+5740,U+5747,U+574a,U+574d-5751,U+5757,U+575a-575b,U+575d-5761,U+5764,U+5766,U+5768,U+576a,U+576f,U+5773,U+5777,U+5782-5784,U+578b,U+5792,U+579b,U+57a0,U+57a2-57a3,U+57a6,U+57ab,U+57ae,U+57c2-57c3,U+57cb}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.at.woff2) format("woff2");unicode-range:U+54e5-54ea,U+54ed-54ee,U+54f2,U+54fa,U+54fc-54fd,U+5501,U+5506-5507,U+5509,U+550f-5510,U+5514,U+5520,U+5522,U+5524,U+5527,U+552c,U+552e-5531,U+5533,U+553e-553f,U+5543-5544,U+5546,U+554a,U+5550,U+5555-5556,U+555c,U+5561,U+5564-5567,U+556a,U+556c,U+556e,U+5575,U+5577-5578,U+557b-557c,U+557e,U+5580,U+5582-5584,U+5587,U+5589-558b,U+558f,U+5591,U+5594,U+5598-5599,U+559c-559d,U+559f,U+55a7,U+55b3,U+55b7,U+55bb,U+55bd,U+55c5,U+55d1-55d4,U+55d6,U+55dc-55dd,U+55df,U+55e1,U+55e3-55e6,U+55e8,U+55eb-55ec,U+55ef,U+55f7,U+55fd,U+5600-5601,U+5608-5609,U+560e,U+5618}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.au.woff2) format("woff2");unicode-range:U+5411,U+5413,U+5415,U+5417,U+541b,U+541d-5420,U+5426-5429,U+542b-542f,U+5431,U+5434-5435,U+5438-5439,U+543b-543c,U+543e,U+5440,U+5443,U+5446,U+5448,U+544a,U+5450,U+5453,U+5455,U+5457-5458,U+545b-545c,U+5462,U+5464,U+5466,U+5468,U+5471-5473,U+5475,U+5478,U+547b-547d,U+5480,U+5482,U+5484,U+5486,U+548b-548c,U+548e-5490,U+5492,U+5494-5496,U+5499-549b,U+54a4,U+54a6-54ad,U+54af,U+54b1,U+54b3,U+54b8,U+54bb,U+54bd,U+54bf-54c2,U+54c4,U+54c6-54c9,U+54cd-54ce,U+54d0-54d2,U+54d5,U+54d7,U+54da,U+54dd,U+54df}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.av.woff2) format("woff2");unicode-range:U+5348-534a,U+534e-534f,U+5351-5353,U+5355-5357,U+535a,U+535c,U+535e-5362,U+5364,U+5366-5367,U+536b,U+536f-5371,U+5373-5375,U+5377-5378,U+537f,U+5382,U+5384-5386,U+5389,U+538b-538c,U+5395,U+5398,U+539a,U+539f,U+53a2,U+53a5-53a6,U+53a8-53a9,U+53ae,U+53bb,U+53bf,U+53c1-53c2,U+53c8-53cd,U+53d1,U+53d4,U+53d6-53d9,U+53db,U+53df-53e0,U+53e3-53e6,U+53e8-53f3,U+53f6-53f9,U+53fc-53fd,U+5401,U+5403-5404,U+5408-540a,U+540c-5410}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.aw.woff2) format("woff2");unicode-range:U+5207,U+520a,U+520d-520e,U+5211-5212,U+5217-521b,U+521d,U+5220,U+5224,U+5228-5229,U+522b,U+522d-522e,U+5230,U+5236-523b,U+523d,U+5241-5243,U+524a,U+524c-524d,U+5250-5251,U+5254,U+5256,U+525c,U+5265,U+5267,U+5269-526a,U+526f,U+5272,U+527d,U+527f,U+5288,U+529b,U+529d-52a1,U+52a3,U+52a8-52ab,U+52ad,U+52b1-52b3,U+52be-52bf,U+52c3,U+52c7,U+52c9,U+52cb,U+52d0,U+52d2,U+52d8,U+52df,U+52e4,U+52fa,U+52fe-5300,U+5305-5306,U+5308,U+530d,U+5310,U+5315-5317,U+5319,U+531d,U+5320-5321,U+5323,U+532a,U+532e,U+5339-533b,U+533e-533f,U+5341,U+5343,U+5347}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ax.woff2) format("woff2");unicode-range:U+50cf,U+50d6,U+50da,U+50e7,U+50ee,U+50f3,U+50f5,U+50fb,U+5106,U+510b,U+5112,U+5121,U+513f-5141,U+5143-5146,U+5148-5149,U+514b,U+514d,U+5151,U+5154,U+515a,U+515c,U+5162,U+5165,U+5168,U+516b-516e,U+5170-5171,U+5173-5179,U+517b-517d,U+5180,U+5185,U+5188-5189,U+518c-518d,U+5192,U+5195,U+5197,U+5199,U+519b-519c,U+51a0,U+51a2,U+51a4-51a5,U+51ac,U+51af-51b0,U+51b2-51b3,U+51b5-51b7,U+51bb,U+51bd,U+51c0,U+51c4,U+51c6,U+51c9,U+51cb-51cc,U+51cf,U+51d1,U+51db,U+51dd,U+51e0-51e1,U+51e4,U+51ed,U+51ef-51f0,U+51f3,U+51f6,U+51f8-51fb,U+51fd,U+51ff-5201,U+5203,U+5206}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.ay.woff2) format("woff2");unicode-range:U+4f60,U+4f63,U+4f65,U+4f69,U+4f6c,U+4f6f-4f70,U+4f73-4f74,U+4f7b-4f7c,U+4f7f,U+4f83-4f84,U+4f88,U+4f8b,U+4f8d,U+4f97,U+4f9b,U+4f9d,U+4fa0,U+4fa3,U+4fa5-4faa,U+4fac,U+4fae-4faf,U+4fb5,U+4fbf,U+4fc3-4fc5,U+4fca,U+4fce-4fd1,U+4fd7-4fd8,U+4fda,U+4fdd-4fde,U+4fe1,U+4fe6,U+4fe8-4fe9,U+4fed-4fef,U+4ff1,U+4ff8,U+4ffa,U+4ffe,U+500c-500d,U+500f,U+5012,U+5014,U+5018-501a,U+501c,U+501f,U+5021,U+5026,U+5028-502a,U+502d,U+503a,U+503c,U+503e,U+5043,U+5047-5048,U+504c,U+504e-504f,U+5055,U+505a,U+505c,U+5065,U+5076-5077,U+507b,U+507f-5080,U+5085,U+5088,U+508d,U+50a3,U+50a5,U+50a8,U+50ac,U+50b2,U+50bb}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.az.woff2) format("woff2");unicode-range:U+4e94-4e95,U+4e98,U+4e9a-4e9b,U+4e9f,U+4ea1-4ea2,U+4ea4-4ea9,U+4eab-4eae,U+4eb2,U+4eb5,U+4eba,U+4ebf-4ec1,U+4ec3-4ec7,U+4eca-4ecb,U+4ecd-4ece,U+4ed1,U+4ed3-4ed9,U+4ede-4edf,U+4ee3-4ee5,U+4ee8,U+4eea,U+4eec,U+4ef0,U+4ef2,U+4ef5-4ef7,U+4efb,U+4efd,U+4eff,U+4f01,U+4f0a,U+4f0d-4f11,U+4f17-4f1a,U+4f1e-4f20,U+4f22,U+4f24-4f26,U+4f2a-4f2b,U+4f2f-4f30,U+4f34,U+4f36,U+4f38,U+4f3a,U+4f3c-4f3d,U+4f43,U+4f46,U+4f4d-4f51,U+4f53,U+4f55,U+4f58-4f59,U+4f5b-4f5e}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.a0.woff2) format("woff2");unicode-range:U+d7,U+e0-e1,U+e8-ea,U+ec-ed,U+f2-f3,U+f7,U+f9-fa,U+fc,U+2014,U+2018-2019,U+201c-201d,U+3001-3002,U+300a-300b,U+3010-3011,U+4e00-4e01,U+4e03,U+4e07-4e0b,U+4e0d-4e0e,U+4e10-4e11,U+4e13-4e14,U+4e16,U+4e18-4e1e,U+4e22,U+4e24-4e25,U+4e27,U+4e2a-4e2b,U+4e2d,U+4e30,U+4e32,U+4e34,U+4e38-4e3b,U+4e3d-4e3e,U+4e43,U+4e45,U+4e48-4e49,U+4e4b-4e50,U+4e52-4e54,U+4e56,U+4e58-4e59,U+4e5c-4e61,U+4e66,U+4e70-4e71,U+4e73,U+4e7e,U+4e86,U+4e88-4e89,U+4e8b-4e8c,U+4e8e-4e8f,U+4e91-4e93}@font-face{font-family:HarmonyOS_Medium;font-style:normal;font-weight:500;font-display:swap;src:url(//s1.hdslb.com/bfs/static/jinkela/long/font/HarmonyOS_Medium.a1.woff2) format("woff2");unicode-range:U+21-7e,U+a4,U+a7-a8,U+b0-b1,U+b7}\n';
	const dynamicGroupList = [];
	if(isPageDynamic()) {
		let fontPatchCSS = "";
		if(location.href.match(/www\.bilibili\.com\/opus\/\d+/)) {
			fontPatchCSS = `
${fontFaceRegular}
${fontFaceMedium}
.reply-item .root-reply-container .content-warp .user-info .user-name {
font-family: PingFang SC,HarmonyOS_Medium,Helvetica Neue,Microsoft YaHei,sans-serif !important;
font-weight: 500 !important;
font-size: 14px !important;
}`;
		} else if(location.href.match(/t\.bilibili\.com\/\d+/)) {
			fontPatchCSS = `
${fontFaceRegular}
body {
font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 400;
}`;
		} else if(location.href.includes("www.bilibili.com/v/topic/detail/")) {
			fontPatchCSS = `
${fontFaceRegular}
body {
font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 400;
}`;
		}
		const basicItems2 = [
			// 顶栏 不再吸附顶部
			new CheckboxItem({
				itemID: "hide-dynamic-page-fixed-header",
				description: "顶栏 不再吸附顶部",
				itemCSS: `.fixed-header .bili-header__bar {position: relative !important;}
/* 高权限覆盖*/
aside.right section.sticky {top: 15px !important;}`
			}),
			// 交换 左栏与右栏位置
			new CheckboxItem({
				itemID: "exchange-dynamic-page-left-right-aside",
				description: "交换 左栏与右栏位置",
				itemCSS: `
aside.left {order: 3; margin-right: 0 !important;}
main {order: 2;}
aside.right {order: 1; margin-right: 12px !important;}
.bili-dyn-sidebar {order: 4;}`
			}),
			// 修复字体
			new CheckboxItem({
				itemID: "font-patch",
				description: "修复字体",
				itemCSS: fontPatchCSS
			})
		];
		dynamicGroupList.push(new Group("dynamic-basic", "动态页 基本功能", basicItems2));
		const leftItems = [
			// 隐藏 个人信息框
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-my-info",
				description: "隐藏 个人信息框",
				itemCSS: `aside.left section {display: none !important;}
.bili-dyn-live-users {top: 15px !important;}`
			}),
			// 隐藏 直播中Logo
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-live-users__item__living",
				description: "隐藏 直播中Logo",
				itemCSS: `.bili-dyn-live-users__item__living {display: none !important;}`
			}),
			// 隐藏 整个左栏
			new CheckboxItem({
				itemID: "hide-dynamic-page-aside-left",
				description: "隐藏 整个左栏",
				itemCSS: `aside.left {display: none !important;}`
			})
		];
		dynamicGroupList.push(new Group("dynamic-left", "左栏 个人信息/正在直播", leftItems));
		const rightItems = [
			// 隐藏 社区中心, 默认开启
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-banner",
				description: "隐藏 社区中心",
				defaultStatus: true,
				itemCSS: `.bili-dyn-banner {display: none !important;}`
			}),
			// 隐藏 广告, 默认开启
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-ads",
				description: "隐藏 广告",
				defaultStatus: true,
				itemCSS: `section:has(.bili-dyn-ads) {display: none !important;}
aside.right section {margin-bottom: 0 !important;}
/* header吸附时 */
aside.right section.sticky {top: 72px}`
			}),
			// 隐藏 话题列表
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-topic-box",
				description: "隐藏 话题列表",
				itemCSS: `.bili-dyn-topic-box, .topic-panel {display: none !important;}`
			}),
			// 隐藏 整个右栏
			new CheckboxItem({
				itemID: "hide-dynamic-page-aside-right",
				description: "隐藏 整个右栏",
				itemCSS: `aside.right {display: none !important;}`
			})
		];
		dynamicGroupList.push(new Group("dynamic-right", "右栏 热门话题", rightItems));
		const centerTopItems = [
			// 扩增 中栏宽度
			new CheckboxItem({
				itemID: "expand-dynamic-page-bili-dyn-width",
				description: "扩增 中栏宽度",
				itemCSS: `
main {flex-grow: 0.8 !important;}
/* 限制查看图片时img高度 */
.bili-album__watch__content img {max-height: 80vh !important;}
`
			}),
			// 双行显示 UP 主列表
			new CheckboxItem({
				itemID: "dynamic-page-up-list-dual-line-mode",
				description: "双行显示 UP 主列表",
				itemCSS: `
.bili-dyn-up-list__content {
display: grid !important;
grid-auto-flow: column !important;
grid-template-rows: auto auto !important;
}
.bili-dyn-up-list__content .shim {
display: none !important;
}
.bili-dyn-up-list__item {
height: auto !important;
}
.bili-dyn-up-list__window {
padding: 10px !important;
}
/* 左右按钮突出显示 */
.bili-dyn-up-list__nav__btn {
zoom: 1.4;
transition: background-color 0.1s linear;
}
.bili-dyn-up-list__nav__btn:hover {
background-color: #00AEEC !important;
color: white !important;
}
`
			}),
			// 淡化 UP 主列表 已查看项
			new CheckboxItem({
				itemID: "dynamic-page-up-list-checked-item-opacity",
				description: "淡化 UP 主列表 已查看项",
				itemCSS: `
.bili-dyn-up-list__item:not(.active):has(.bili-dyn-up-list__item__face .bili-dyn-up-list__item__face__img:only-child) {
transition: opacity 0.2s ease-out;
opacity: 0.25;
}
.bili-dyn-up-list__item:hover {
transition: opacity 0.1s linear !important;
opacity: 1 !important;
}`
			}),
			// 隐藏 UP 主列表 已查看项
			new CheckboxItem({
				itemID: "dynamic-page-up-list-checked-item-hide",
				description: "隐藏 UP 主列表 已查看项",
				itemCSS: `
/* keyframes 不支持 display, 但chrome可正常处理, firefox不消失 */
@keyframes disappear {
0% {opacity: 1; width: 68px; margin-right: 6px;}
99% {opacity: 0; width: 0; margin-right: 0;}
100% {opacity: 0; width: 0; margin-right: 0; display: none;}
}
.bili-dyn-up-list__item:not(.active):has(.bili-dyn-up-list__item__face .bili-dyn-up-list__item__face__img:only-child) {
animation: disappear;
animation-duration: .5s;
animation-delay: 1s;
animation-fill-mode: forwards;
}
/* firefox无动画 */
@-moz-document url-prefix() {
.bili-dyn-up-list__item:not(.active):has(.bili-dyn-up-list__item__face .bili-dyn-up-list__item__face__img:only-child) {
display: none;
}
}`
			}),
			// 隐藏 动态发布框
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-publishing",
				description: "隐藏 动态发布框",
				itemCSS: `.bili-dyn-publishing {display: none !important;}
main section:nth-child(1) {margin-bottom: 0 !important;}`
			}),
			// 隐藏 动态分类Tab bar
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-list-tabs",
				description: "隐藏 动态分类Tab bar",
				itemCSS: `.bili-dyn-list-tabs {display: none !important;}`
			})
		];
		dynamicGroupList.push(new Group("dynamic-center-top", "中栏 顶部功能", centerTopItems));
		const centerDynItems = [
			// 隐藏 头像框
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-avatar-pendent",
				description: "隐藏 头像框",
				itemCSS: `
.b-avatar__layer.center {width: 48px !important; height: 48px !important;}
.b-avatar__layers .b-avatar__layer.center:nth-child(2) picture {display: none !important;}
.b-avatar__layers:has(.b-avatar__layer__res[style^="background"]) {display: none !important;}
`
			}),
			// 隐藏 头像徽章
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-avatar-icon",
				description: "隐藏 头像徽章",
				itemCSS: `.b-avatar__layers .b-avatar__layer:last-child:not(.center) {display: none !important;}`
			}),
			// 隐藏 动态右侧饰品
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-ornament",
				description: "隐藏 动态右侧饰品",
				itemCSS: `.bili-dyn-ornament, .bili-dyn-item__ornament {display: none !important;}`
			}),
			// 隐藏 动态内容中 警告notice, 默认开启
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-dispute",
				description: "隐藏 动态内容中 警告notice",
				defaultStatus: true,
				itemCSS: `.bili-dyn-content__dispute {display: none !important;}`
			}),
			// 隐藏 动态内容中 稍后再看按钮
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-watchlater",
				description: "隐藏 动态内容中 稍后再看按钮",
				itemCSS: `.bili-dyn-card-video__mark {display: none !important;}`
			}),
			// 隐藏 动态内容中 官方话题Tag
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-official-topic",
				description: "隐藏 动态内容中 官方话题Tag",
				// 不得隐藏普通tag .bili-rich-text-topic
				itemCSS: `.bili-dyn-content__orig__topic, .bili-dyn-content__forw__topic {
display: none !important;
}`
			}),
			// 动态内容中 普通Tag 去除高亮
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-text-topic",
				description: "动态内容中 普通Tag 去除高亮",
				itemCSS: `.bili-rich-text-topic {color: inherit !important;}
.bili-rich-text-topic:hover {color: var(--brand_blue) !important;}`
			}),
			// 隐藏 动态精选互动 XXX赞了/XXX回复
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-item-interaction",
				description: "隐藏 动态精选互动 XXX赞了/XXX回复",
				itemCSS: `.bili-dyn-item__interaction {display: none !important;}`
			}),
			// 隐藏 视频预约/直播预约动态
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-card-reserve",
				description: "隐藏 视频预约/直播预约动态",
				itemCSS: `.bili-dyn-list__item:has(.bili-dyn-card-reserve) {display: none !important;}`
			}),
			// 隐藏 带货动态
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-card-goods",
				description: "隐藏 带货动态",
				itemCSS: `.bili-dyn-list__item:has(.bili-dyn-card-goods),
.bili-dyn-list__item:has(.bili-rich-text-module.goods),
.bili-dyn-list__item:has([data-type="goods"]) {
visibility: hidden !important;
height: 0 !important;
margin: 0 !important;
}`
			}),
			// 隐藏 抽奖动态(含转发)
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-lottery",
				description: "隐藏 抽奖动态(含转发)",
				itemCSS: `.bili-dyn-list__item:has([data-type="lottery"]) {display: none !important;}`
			}),
			// 隐藏 转发的动态
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-forward",
				description: "隐藏 转发的动态",
				itemCSS: `.bili-dyn-list__item:has(.bili-dyn-content__orig.reference) {
display: none !important;
}`
			}),
			// 隐藏 投票动态
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-vote",
				description: "隐藏 投票动态",
				itemCSS: `.bili-dyn-list__item:has(.bili-dyn-card-vote) {
display: none !important;
}`
			}),
			// 隐藏 直播通知动态
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-live",
				description: "隐藏 直播通知动态",
				itemCSS: `.bili-dyn-list__item:has(.bili-dyn-card-live) {
display: none !important;
}`
			}),
			// 隐藏 被block的充电动态
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-blocked",
				description: "隐藏 被block的充电动态",
				itemCSS: `.bili-dyn-list__item:has(.dyn-blocked-mask) {
display: none !important;
}`
			}),
			// 隐藏 全部充电视频(含已充电)
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-charge-video",
				description: "隐藏 全部充电视频(含已充电)",
				itemCSS: `.bili-dyn-list__item:has(.bili-dyn-card-video__badge [src*="qcRJ6sJU91"]) {
display: none !important;
}`
			}),
			// 自动展开 相同UP主被折叠的动态
			new CheckboxItem({
				itemID: "dynamic-page-unfold-dynamic",
				description: "自动展开 相同UP主被折叠的动态",
				enableFunc: async () => {
					const unfold = () => {
						const dynFoldNodes = document.querySelectorAll("main .bili-dyn-list__item .bili-dyn-item-fold");
						if(dynFoldNodes.length) {
							dynFoldNodes.forEach((e) => {
								e instanceof HTMLDivElement && e.click();
							});
						}
					};
					setInterval(unfold, 500);
				}
			})
		];
		dynamicGroupList.push(new Group("dynamic-center-dyn", "中栏 动态列表", centerDynItems));
		const commentItems = [
			// 隐藏 整个评论区
			new CheckboxItem({
				itemID: "dynamic-page-hide-all-comment",
				description: "隐藏 整个评论区",
				itemCSS: `
/* .bili-dyn-item__panel {padding-bottom: 0 !important;} */
.bili-comment-container, .bili-tabs {display: none !important;}
.bili-opus-view {border-radius: 6px !important;}
.opus-detail {margin-bottom: 10px !important; min-height: unset !important;}
#app .content .dyn-tabs {display: none !important;}
#app .content .card {padding-bottom: 30px!important;}
`
			}),
			// 隐藏 活动/notice, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-notice",
				description: "隐藏 活动/notice",
				defaultStatus: true,
				itemCSS: `.reply-header .reply-notice {display: none !important;}`
			}),
			// 隐藏 投票
			new CheckboxItem({
				itemID: "video-page-hide-top-vote-card",
				description: "隐藏 投票",
				itemCSS: `.comment-container .top-vote-card {display: none !important;}`
			}),
			// 隐藏 整个评论框
			new CheckboxItem({
				itemID: "video-page-hide-main-reply-box",
				description: "隐藏 整个评论框",
				itemCSS: `.main-reply-box, .comment-container .fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 页面底部 吸附评论框, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-fixed-reply-box",
				description: "隐藏 页面底部 吸附评论框",
				defaultStatus: true,
				itemCSS: `.fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 评论编辑器内占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-box-textarea-placeholder",
				description: "隐藏 评论编辑器内占位文字",
				defaultStatus: true,
				itemCSS: `.reply-box-textarea::placeholder {color: transparent !important;}`
			}),
			// 隐藏 评论区用户卡片
			new CheckboxItem({
				itemID: "video-page-hide-comment-user-card",
				description: "隐藏 评论区用户卡片\n鼠标放在用户名上时不显示卡片",
				itemCSS: `.user-card {display: none!important;}`
			}),
			// 隐藏 评论右侧装饰
			new CheckboxItem({
				itemID: "video-page-hide-reply-decorate",
				description: "隐藏 评论右侧装饰",
				itemCSS: `.reply-decorate {display: none !important;}`
			}),
			// 隐藏 ID后粉丝牌
			new CheckboxItem({
				itemID: "video-page-hide-fan-badge",
				description: "隐藏 ID后粉丝牌",
				itemCSS: `.fan-badge {display: none !important;}`
			}),
			// 隐藏 老粉、原始粉丝Tag
			new CheckboxItem({
				itemID: "video-page-hide-contractor-box",
				description: "隐藏 老粉、原始粉丝Tag",
				itemCSS: `.contractor-box {display: none !important;}`
			}),
			// 隐藏 一级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-user-level",
				description: "隐藏 一级评论用户等级",
				itemCSS: `.user-level {display: none !important;}`
			}),
			// 隐藏 二级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-sub-user-level",
				description: "隐藏 二级评论用户等级",
				itemCSS: `.sub-user-level {display: none !important;}`
			}),
			// 隐藏 用户头像外圈饰品
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-pendent-dom",
				description: "隐藏 用户头像外圈饰品",
				itemCSS: `.bili-avatar-pendent-dom {display: none !important;}`
			}),
			// 隐藏 用户头像右下小icon
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-nft-icon",
				description: "隐藏 用户头像右下小icon",
				itemCSS: `.bili-avatar-nft-icon {display: none !important;}
.comment-container .bili-avatar-icon {display: none !important;}`
			}),
			// 隐藏 用户投票 (红方/蓝方)
			new CheckboxItem({
				itemID: "video-page-hide-vote-info",
				description: "隐藏 用户投票 (红方/蓝方)",
				itemCSS: `.comment-container .vote-info {display: none !important;}`
			}),
			// 隐藏 评论内容下tag(UP觉得很赞)
			new CheckboxItem({
				itemID: "video-page-hide-reply-tag-list",
				description: "隐藏 评论内容下tag(UP觉得很赞)",
				itemCSS: `.reply-tag-list {display: none !important;}`
			}),
			// 隐藏 笔记评论前的小Logo, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-note-prefix",
				description: "隐藏 笔记评论前的小Logo",
				defaultStatus: true,
				itemCSS: `.note-prefix {display: none !important;}`
			}),
			// 隐藏 评论内容搜索关键词高亮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-jump-link-search-word",
				description: "隐藏 评论内容搜索关键词高亮",
				defaultStatus: true,
				itemCSS: `.reply-content .jump-link.search-word {color: inherit !important;}
.comment-container .reply-content .icon.search-word {display: none !important;}`
			}),
			// 隐藏 二级评论中的@高亮
			new CheckboxItem({
				itemID: "video-page-hide-reply-content-user-highlight",
				description: "隐藏 二级评论中的@高亮",
				itemCSS: `.sub-reply-container .reply-content .jump-link.user {color: inherit !important;}
.comment-container .sub-reply-container .reply-content .jump-link.user:hover {color: #40C5F1 !important;}`
			}),
			// 隐藏 召唤AI机器人的评论, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-at-bots",
				description: "隐藏 召唤AI机器人的评论",
				defaultStatus: true,
				itemCSS: (
					// 8455326 @机器工具人
					// 234978716 @有趣的程序员
					// 1141159409 @AI视频小助理
					// 437175450 @AI视频小助理总结一下 (误伤)
					// 1692825065 @AI笔记侠
					// 690155730 @AI视频助手
					// 689670224 @哔哩哔理点赞姬
					// 3494380876859618 @课代表猫
					// 1168527940 @AI课代表呀
					// 439438614 @木几萌Moe
					// 1358327273 @星崽丨StarZai
					// 3546376048741135 @AI沈阳美食家
					// 1835753760 @AI识片酱
					// 9868463 @AI头脑风暴
					// 358243654 @GPT_5
					// 393788832 @Juice_AI
					// 91394217 @AI全文总结
					// 473018527 @AI视频总结
					// 3546639035795567 @AI总结视频
					`.reply-item:has(.jump-link.user[data-user-id="8455326"]),
.reply-item:has(.jump-link.user[data-user-id="234978716"]),
.reply-item:has(.jump-link.user[data-user-id="1141159409"]),
.reply-item:has(.jump-link.user[data-user-id="437175450"]),
.reply-item:has(.jump-link.user[data-user-id="1692825065"]),
.reply-item:has(.jump-link.user[data-user-id="690155730"]),
.reply-item:has(.jump-link.user[data-user-id="689670224"]),
.reply-item:has(.jump-link.user[data-user-id="3494380876859618"]),
.reply-item:has(.jump-link.user[data-user-id="1168527940"]),
.reply-item:has(.jump-link.user[data-user-id="439438614"]),
.reply-item:has(.jump-link.user[data-user-id="1358327273"]),
.reply-item:has(.jump-link.user[data-user-id="3546376048741135"]),
.reply-item:has(.jump-link.user[data-user-id="1835753760"]),
.reply-item:has(.jump-link.user[data-user-id="9868463"]),
.reply-item:has(.jump-link.user[data-user-id="358243654"]),
.reply-item:has(.jump-link.user[data-user-id="393788832"]),
.reply-item:has(.jump-link.user[data-user-id="91394217"]),
.reply-item:has(.jump-link.user[data-user-id="473018527"]),
.reply-item:has(.jump-link.user[data-user-id="3546639035795567"]) {
display: none !important;
}`)
			}),
			// 隐藏 AI机器人发布的评论
			new CheckboxItem({
				itemID: "video-page-hide-bots-reply",
				description: "隐藏 AI机器人发布的评论",
				defaultStatus: false,
				itemCSS: (
					// 8455326 @机器工具人
					// 234978716 @有趣的程序员
					// 1141159409 @AI视频小助理
					// 437175450 @AI视频小助理总结一下 (误伤)
					// 1692825065 @AI笔记侠
					// 690155730 @AI视频助手
					// 689670224 @哔哩哔理点赞姬
					// 3494380876859618 @课代表猫
					// 1168527940 @AI课代表呀
					// 439438614 @木几萌Moe
					// 1358327273 @星崽丨StarZai
					// 3546376048741135 @AI沈阳美食家
					// 1835753760 @AI识片酱
					// 9868463 @AI头脑风暴
					// 358243654 @GPT_5
					// 393788832 @Juice_AI
					// 91394217 @AI全文总结
					// 473018527 @AI视频总结
					// 3546639035795567 @AI总结视频
					`.reply-item:has(.root-reply-container .user-name[data-user-id="8455326"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="234978716"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1141159409"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="437175450"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1692825065"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="690155730"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="689670224"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3494380876859618"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1168527940"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="439438614"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1358327273"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3546376048741135"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="1835753760"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="9868463"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="358243654"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="393788832"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="91394217"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="473018527"]),
.reply-item:has(.root-reply-container .user-name[data-user-id="3546639035795567"]) {
display: none !important;
}`)
			}),
			// 隐藏 包含@的 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-at-reply",
				description: "隐藏 包含@的 无人点赞评论",
				itemCSS: `.reply-item:has(.root-reply .jump-link.user):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 包含@的 全部评论
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-all",
				description: "隐藏 包含@的 全部评论",
				itemCSS: `.reply-item:has(.root-reply .jump-link.user):not(:has(.delete-reply, .top-icon, .sub-up-icon)) {display: none !important;}`
			}),
			// 隐藏 LV1 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv1-reply",
				description: "隐藏 LV1 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-1):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV2 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv2-reply",
				description: "隐藏 LV2 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-2):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV3 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv3-reply",
				description: "隐藏 LV3 无人点赞评论",
				itemCSS: `.reply-item:has(.user-level.level-3):not(:has(.delete-reply, .top-icon, .sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 一级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-root-reply-dislike-reply-btn",
				description: "一级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.reply-info:not(:has(i.disliked)) .reply-btn,
.comment-container .reply-info:not(:has(i.disliked)) .reply-dislike {
visibility: hidden;
}
.comment-container .reply-item:hover .reply-btn,
.comment-container .reply-item:hover .reply-dislike {
visibility: visible !important;
}`
			}),
			// 二级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-sub-reply-dislike-reply-btn",
				description: "二级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.sub-reply-item:not(:has(i.disliked)) .sub-reply-btn,
.comment-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-dislike {
visibility: hidden;
}
.comment-container .sub-reply-item:hover .sub-reply-btn,
.comment-container .sub-reply-item:hover .sub-reply-dislike {
visibility: visible !important;
}`
			}),
			// 隐藏 大表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large",
				description: "隐藏 大表情",
				itemCSS: `.emoji-large {display: none !important;}`
			}),
			// 大表情变成小表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large-zoom",
				description: "大表情变成小表情",
				itemCSS: `.emoji-large {zoom: .5;}`
			}),
			// 用户名 全部大会员色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-pink",
				description: "用户名 全部大会员色",
				itemCSS: `.reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #FB7299 !important;}}`
			}),
			// 用户名 全部恢复默认色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-default",
				description: "用户名 全部恢复默认色",
				itemCSS: `.reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #61666d !important;}}`
			}),
			// 笔记图片 查看大图优化, 默认开启
			new CheckboxItem({
				itemID: "video-page-reply-view-image-optimize",
				description: "笔记图片 查看大图优化",
				defaultStatus: true,
				// 单图模式隐藏底部图片列表, 多图模式淡化列表, hover复原, 左右按钮增大
				itemCSS: `.reply-view-image .last-image, .reply-view-image .next-image {zoom: 1.4;}
.reply-view-image:has(.preview-item-box:only-child) .last-image {display: none !important;}
.reply-view-image:has(.preview-item-box:only-child) .next-image {display: none !important;}
.reply-view-image .preview-list {display: none !important;}`
			})
		];
		dynamicGroupList.push(new Group("dynamic-comment", "动态评论区", commentItems));
		const sidebarItems = [
			// 隐藏 回到旧版, 默认开启
			new CheckboxItem({
				itemID: "hide-dynamic-page-sidebar-old-version",
				description: "隐藏 回到旧版",
				defaultStatus: true,
				itemCSS: `.bili-dyn-sidebar .bili-dyn-sidebar__btn:first-child {visibility: hidden !important;}
.opus-detail .side-toolbar__bottom .side-toolbar__btn:not(.backtop) {display: none !important;}`
			}),
			// 隐藏 回顶部
			new CheckboxItem({
				itemID: "hide-dynamic-page-sidebar-back-to-top",
				description: "隐藏 回顶部",
				itemCSS: `.bili-dyn-sidebar .bili-dyn-sidebar__btn:last-child {visibility: hidden !important;}`
			})
		];
		dynamicGroupList.push(new Group("dynamic-sidebar", "页面右下角 小按钮", sidebarItems));
	}
	const popularGroupList = [];
	if(isPagePopular()) {
		const basicItems2 = [
			// 隐藏 横幅banner, 同步首页设定
			new CheckboxItem({
				itemID: "homepage-hide-banner",
				description: "隐藏 横幅banner",
				itemCSS: `
.header-banner__inner, .bili-header__banner {
display: none !important;
}
.bili-header .bili-header__bar:not(.slide-down) {
position: relative !important;
box-shadow: 0 2px 4px #00000014;
}
.bili-header__channel {
margin-top: 5px !important;
}
/* icon和文字颜色 */
.bili-header .right-entry__outside .right-entry-icon {
color: #18191c !important;
}
.bili-header .left-entry .entry-title, .bili-header .left-entry .download-entry, .bili-header .left-entry .default-entry, .bili-header .left-entry .loc-entry {
color: #18191c !important;
}
.bili-header .left-entry .entry-title .zhuzhan-icon {
color: #00aeec !important;
}
.bili-header .right-entry__outside .right-entry-text {
color: #61666d !important;
}
/* header滚动后渐变出现, 否则闪动 */
#i_cecream .bili-header__bar.slide-down {
transition: background-color 0.3s ease-out, box-shadow 0.3s ease-out !important;
}
#i_cecream .bili-header__bar:not(.slide-down) {
transition: background-color 0.3s ease-out !important;
}
/* header高度 */
#biliMainHeader {min-height: unset !important;}
/* 旧版banner */
#internationalHeader .bili-banner {display: none;}
.mini-header__content {box-shadow: 0 2px 4px #00000014;}
.bili-icon_dingdao_zhuzhan:before {color: #00AEEC;}
.mini-header__content .nav-link .nav-link-ul .nav-link-item .link {color: black; text-shadow: unset;}
.mini-header__content .nav-search-box {border: 1px solid #E3E5E7;}
#nav_searchform {background-color: #F2F3F4 !important;}
.bili-header-m .nav-search .nav-search-btn, .international-header .nav-search .nav-search-btn {background-color: #F2F3F4;}
.mini-header__content .nav-user-center .user-con .item .name {color: black; text-shadow: unset;}
`
			}),
			// 隐藏 滚动页面时 顶部吸附顶栏, 同步首页设定
			new CheckboxItem({
				itemID: "homepage-hide-sticky-header",
				description: "隐藏 滚动页面时 顶部吸附顶栏",
				itemCSS: `.bili-header .left-entry__title svg {
display: none !important;
}
/* 高优先覆盖!important */
#i_cecream .bili-feed4 .bili-header .slide-down {
box-shadow: unset !important;
}
#nav-searchform.is-actived:before,
#nav-searchform.is-exper:before,
#nav-searchform.is-exper:hover:before,
#nav-searchform.is-focus:before,
.bili-header .slide-down {
background: unset !important;
}
.bili-header .slide-down {
position: absolute !important;
top: 0;
animation: unset !important;
box-shadow: unset !important;
}
.bili-header .slide-down .left-entry {
margin-right: 30px !important;
}
.bili-header .slide-down .left-entry .default-entry,
.bili-header .slide-down .left-entry .download-entry,
.bili-header .slide-down .left-entry .entry-title,
.bili-header .slide-down .left-entry .entry-title .zhuzhan-icon,
.bili-header .slide-down .left-entry .loc-entry,
.bili-header .slide-down .left-entry .loc-mc-box__text,
.bili-header .slide-down .left-entry .mini-header__title,
.bili-header .slide-down .right-entry .right-entry__outside .right-entry-icon,
.bili-header .slide-down .right-entry .right-entry__outside .right-entry-text {
color: #fff !important;
}
.bili-header .slide-down .download-entry,
.bili-header .slide-down .loc-entry {
display: unset !important;
}
.bili-header .slide-down .center-search-container,
.bili-header .slide-down .center-search-container .center-search__bar {
margin: 0 auto !important;
}
/* 不可添加important, 否则与Evolved的黑暗模式冲突 */
#nav-searchform {
background: #f1f2f3;
}
#nav-searchform:hover {
background-color: var(--bg1) !important;
opacity: 1
}
#nav-searchform.is-focus {
border: 1px solid var(--line_regular) !important;
border-bottom: none !important;
background: var(--bg1) !important;
}
#nav-searchform.is-actived.is-exper4-actived,
#nav-searchform.is-focus.is-exper4-actived {
border-bottom: unset !important;
}`
			}),
			// 隐藏 tips, 默认开启
			new CheckboxItem({
				itemID: "popular-hide-tips",
				description: "隐藏 tips",
				defaultStatus: true,
				itemCSS: `.popular-list .popular-tips,
.rank-container .rank-tips,
.history-list .history-tips {display: none !important;}
.rank-container .rank-tab-wrap {
margin-bottom: 0 !important;
padding: 10px 0 !important;
}`
			}),
			// 隐藏 稍后再看按钮
			new CheckboxItem({
				itemID: "popular-hide-watchlater",
				description: "隐藏 稍后再看按钮",
				itemCSS: `.rank-container .rank-item .van-watchlater,
.history-list .video-card .van-watchlater,
.history-list .video-card .watch-later,
.weekly-list .video-card .van-watchlater,
.weekly-list .video-card .watch-later,
.popular-list .video-card .van-watchlater,
.popular-list .video-card .watch-later {
display: none !important;
}`
			}),
			// 隐藏 弹幕数
			new CheckboxItem({
				itemID: "popular-hide-danmaku-count",
				description: "隐藏 弹幕数",
				itemCSS: `.popular-list .video-stat .like-text,
.weekly-list .video-stat .like-text,
.history-list .video-stat .like-text,
.rank-list .rank-item .detail-state .data-box:nth-child(2) {
display: none !important;
}
.rank-list .rank-item .detail-state .data-box:nth-child(1) {
margin: 0 !important;
}
.video-card .video-stat .play-text {
margin-right: 0 !important;
}`
			}),
			// 修复字体
			new CheckboxItem({
				itemID: "font-patch",
				description: "修复字体",
				itemCSS: `
${fontFaceRegular}
${fontFaceMedium}
#internationalHeader,
.international-header,
.suggest-wrap,
.van-popover {
font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 400;
}
#app {
font-family: PingFang SC, HarmonyOS_Medium, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 500;
}
`
			})
		];
		popularGroupList.push(new Group("popular-basic", "热门/排行榜页 基本功能", basicItems2));
		const layoutItems = [
			// 官方默认 2 列布局, 默认启用
			new RadioItem({
				itemID: "popular-layout-default",
				description: "官方默认 2 列布局",
				radioName: "popular-layout-option",
				radioItemIDList: ["popular-layout-default", "popular-layout-4-column", "popular-layout-5-column", "popular-layout-6-column"],
				itemCSS: `
.cm-module {
display: none !important;
}
/* grid替代flex做双列布局，屏蔽视频后不产生空白 */
.video-list,
.popular-list .card-list,
.history-list .card-list {
display: grid !important;
grid-template-columns: auto auto;
}
.popular-list .card-list .video-card,
.video-list .video-card,
.history-list .card-list .video-card {
width: unset !important;
}
`,
				defaultStatus: true
			}),
			// 强制使用 4 列布局
			new RadioItem({
				itemID: "popular-layout-4-column",
				description: "强制使用 4 列布局\n默认屏蔽Tag和简介，下同",
				radioName: "popular-layout-option",
				radioItemIDList: ["popular-layout-default", "popular-layout-4-column", "popular-layout-5-column", "popular-layout-6-column"],
				itemCSS: `
.cm-module {
display: none !important
}
/* 页面宽度 */
@media (min-width: 1300px) and (max-width: 1399.9px) {
.popular-container {
max-width: 1180px !important;
}
}
@media (max-width: 1139.9px) {
.popular-container {
max-width: 1020px !important;
}
}
/* 布局高度 */
.rank-container .rank-tab-wrap {
margin-bottom: 0 !important;
padding: 10px 0 !important;
}
.nav-tabs {
height: 70px !important;
}
.popular-list {
padding: 10px 0 0 !important;
}
.video-list {
margin-top: 15px !important;
}
/* 屏蔽 Tips */
.popular-list .popular-tips, .rank-container .rank-tips, .history-list .history-tips {
display: none !important;
}
/* 屏蔽 Hint */
.popular-list .popular-tips, .weekly-list .weekly-hint, .history-list .history-hint {
display: none !important;
}
/* 通用：综合热门, 每周必看, 入站必刷, grid布局 */
.card-list, .video-list {
width: 100% !important;
display: grid !important;
grid-gap: 20px !important;
grid-column: span 4 !important;
grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}
.card-list .video-card, .video-list .video-card {
display: unset !important;
width: unset !important;
height: unset !important;
margin-right: unset !important;
margin-bottom: unset !important;
}
.card-list .video-card .video-card__content, .video-list .video-card .video-card__content {
background: none;
width: unset !important;
height: unset !important;
margin: 0 !important;
border-radius: 6px !important;
overflow: hidden !important;
}
.card-list .video-card .video-card__info, .video-list .video-card .video-card__info {
margin-top: 8px !important;
font-size: 14px;
padding: 0 !important;
}
.card-list .video-card .video-card__info .rcmd-tag, .video-list .video-card .video-card__info .rcmd-tag {
display: none !important;
}
.card-list .video-card .video-card__info .video-name, .video-list .video-card .video-card__info .video-name {
font-weight: normal !important;
margin-bottom: 8px !important;
font-size: 15px !important;
line-height: 22px !important;
height: 44px !important;
overflow: hidden !important;
}
.card-list .video-card .video-card__info .up-name, .video-list .video-card .video-card__info .up-name {
margin: unset !important;
font-size: 14px !important;
text-wrap: nowrap !important;
}
.card-list .video-card .video-card__info > div, .video-list .video-card .video-card__info > div {
display: flex !important;
justify-content: space-between !important;
}
.card-list .video-card .video-card__info .video-stat .play-text, .video-list .video-card .video-card__info .video-stat .play-text, .card-list .video-card .video-card__info .video-stat .like-text, .video-list .video-card .video-card__info .video-stat .like-text {
text-wrap: nowrap !important;
}
/* 排行榜, grid布局 */
.rank-list {
width: 100% !important;
display: grid !important;
grid-gap: 20px !important;
grid-column: span 4 !important;
grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}
.rank-list .rank-item {
display: unset !important;
width: unset !important;
height: unset !important;
margin-right: unset !important;
margin-bottom: unset !important;
}
.rank-list .rank-item > .content {
display: unset !important;
padding: unset !important;
}
.rank-list .rank-item > .content > .img {
background: none;
width: unset !important;
height: unset !important;
margin: 0 !important;
border-radius: 6px !important;
overflow: hidden !important;
}
.rank-list .rank-item > .content > .img .num {
font-size: 18px;
zoom: 1.2;
}
.rank-list .rank-item > .content > .info {
margin-top: 8px !important;
margin-left: unset !important;
padding: 0 !important;
font-size: 14px;
height: unset !important;
}
.rank-list .rank-item > .content > .info .title {
height: 44px !important;
line-height: 22px !important;
font-weight: 500 !important;
font-size: 15px !important;
overflow: hidden !important;
}
.rank-list .rank-item > .content > .info .detail {
display: flex !important;
justify-content: space-between !important;
align-items: center !important;
margin-top: 8px !important;
}
.rank-list .rank-item > .content > .info .detail > a .up-name {
margin: unset !important;
font-size: 14px;
text-wrap: nowrap !important;
}
.rank-list .rank-item > .content > .info .detail > .detail-state .data-box {
line-height: unset !important;
margin: 0 12px 0 0;
text-wrap: nowrap !important;
}
.rank-list .rank-item > .content > .info .detail > .detail-state .data-box:nth-child(2) {
margin: 0 !important;
}
.rank-list .rank-item > .content .more-data {
display: none !important;
}`
			}),
			// 强制使用 5 列布局
			new RadioItem({
				itemID: "popular-layout-5-column",
				description: "强制使用 5 列布局",
				radioName: "popular-layout-option",
				radioItemIDList: ["popular-layout-default", "popular-layout-4-column", "popular-layout-5-column", "popular-layout-6-column"],
				itemCSS: `
.cm-module {
display: none !important;
}
/* 页面宽度 */
@media (min-width: 1300px) and (max-width: 1399.9px) {
.popular-container {
max-width: 1180px !important;
}
}
@media (max-width: 1139.9px) {
.popular-container {
max-width: 1020px !important;
}
}
/* 布局高度 */
.rank-container .rank-tab-wrap {
margin-bottom: 0 !important;
padding: 10px 0 !important;
}
.nav-tabs {
height: 70px !important;
}
.popular-list {
padding: 10px 0 0 !important;
}
.video-list {
margin-top: 15px !important;
}
/* 屏蔽 Tips */
.popular-list .popular-tips, .rank-container .rank-tips, .history-list .history-tips {
display: none !important;
}
/* 屏蔽 Hint */
.popular-list .popular-tips, .weekly-list .weekly-hint, .history-list .history-hint {
display: none !important;
}
/* 通用：综合热门, 每周必看, 入站必刷, grid布局 */
.card-list, .video-list {
width: 100% !important;
display: grid !important;
grid-gap: 20px !important;
grid-column: span 5 !important;
grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
}
.card-list .video-card, .video-list .video-card {
display: unset !important;
width: unset !important;
height: unset !important;
margin-right: unset !important;
margin-bottom: unset !important;
}
.card-list .video-card .video-card__content, .video-list .video-card .video-card__content {
background: none;
width: unset !important;
height: unset !important;
margin: 0 !important;
border-radius: 6px !important;
overflow: hidden !important;
}
.card-list .video-card .video-card__info, .video-list .video-card .video-card__info {
margin-top: 8px !important;
font-size: 14px;
padding: 0 !important;
}
.card-list .video-card .video-card__info .rcmd-tag, .video-list .video-card .video-card__info .rcmd-tag {
display: none !important;
}
.card-list .video-card .video-card__info .video-name, .video-list .video-card .video-card__info .video-name {
font-weight: normal !important;
margin-bottom: 8px !important;
font-size: 15px !important;
line-height: 22px !important;
height: 44px !important;
overflow: hidden !important;
}
.card-list .video-card .video-card__info .up-name, .video-list .video-card .video-card__info .up-name {
margin: unset !important;
font-size: 14px !important;
text-wrap: nowrap !important;
}
.card-list .video-card .video-card__info > div, .video-list .video-card .video-card__info > div {
display: flex !important;
justify-content: space-between !important;
}
.card-list .video-card .video-card__info .video-stat .play-text, .video-list .video-card .video-card__info .video-stat .play-text, .card-list .video-card .video-card__info .video-stat .like-text, .video-list .video-card .video-card__info .video-stat .like-text {
text-wrap: nowrap !important;
}
/* 排行榜, grid布局 */
.rank-list {
width: 100% !important;
display: grid !important;
grid-gap: 20px !important;
grid-column: span 5 !important;
grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
}
.rank-list .rank-item {
display: unset !important;
width: unset !important;
height: unset !important;
margin-right: unset !important;
margin-bottom: unset !important;
}
.rank-list .rank-item > .content {
display: unset !important;
padding: unset !important;
}
.rank-list .rank-item > .content > .img {
background: none;
width: unset !important;
height: unset !important;
margin: 0 !important;
border-radius: 6px !important;
overflow: hidden !important;
}
.rank-list .rank-item > .content > .img .num {
font-size: 18px;
zoom: 1.2;
}
.rank-list .rank-item > .content > .info {
margin-top: 8px !important;
margin-left: unset !important;
padding: 0 !important;
font-size: 14px;
height: unset !important;
}
.rank-list .rank-item > .content > .info .title {
height: 44px !important;
line-height: 22px !important;
font-weight: 500 !important;
font-size: 15px !important;
overflow: hidden !important;
}
.rank-list .rank-item > .content > .info .detail {
display: flex !important;
justify-content: space-between !important;
align-items: center !important;
margin-top: 8px !important;
}
.rank-list .rank-item > .content > .info .detail > a .up-name {
margin: unset !important;
font-size: 14px;
text-wrap: nowrap !important;
}
.rank-list .rank-item > .content > .info .detail > .detail-state .data-box {
line-height: unset !important;
margin: 0 12px 0 0;
text-wrap: nowrap !important;
}
.rank-list .rank-item > .content > .info .detail > .detail-state .data-box:nth-child(2) {
margin: 0 !important;
}
.rank-list .rank-item > .content .more-data {
display: none !important;
}`
			}),
			// 强制使用 6 列布局
			new RadioItem({
				itemID: "popular-layout-6-column",
				description: "强制使用 6 列布局，建议开启 隐藏弹幕数",
				radioName: "popular-layout-option",
				radioItemIDList: ["popular-layout-default", "popular-layout-4-column", "popular-layout-5-column", "popular-layout-6-column"],
				itemCSS: `
.cm-module {
display: none !important;
}
/* 页面宽度 */
@media (min-width: 1300px) and (max-width: 1399.9px) {
.popular-container {
max-width: 1180px !important;
}
}
@media (max-width: 1139.9px) {
.popular-container {
max-width: 1020px !important;
}
}
/* 布局高度 */
.rank-container .rank-tab-wrap {
margin-bottom: 0 !important;
padding: 10px 0 !important;
}
.nav-tabs {
height: 70px !important;
}
.popular-list {
padding: 10px 0 0 !important;
}
.video-list {
margin-top: 15px !important;
}
/* 屏蔽 Tips */
.popular-list .popular-tips, .rank-container .rank-tips, .history-list .history-tips {
display: none !important;
}
/* 屏蔽 Hint */
.popular-list .popular-tips, .weekly-list .weekly-hint, .history-list .history-hint {
display: none !important;
}
/* 通用：综合热门, 每周必看, 入站必刷, grid布局 */
.card-list, .video-list {
width: 100% !important;
display: grid !important;
grid-gap: 20px !important;
grid-column: span 6 !important;
grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
}
.card-list .video-card, .video-list .video-card {
display: unset !important;
width: unset !important;
height: unset !important;
margin-right: unset !important;
margin-bottom: unset !important;
}
.card-list .video-card .video-card__content, .video-list .video-card .video-card__content {
background: none;
width: unset !important;
height: unset !important;
margin: 0 !important;
border-radius: 6px !important;
overflow: hidden !important;
}
.card-list .video-card .video-card__info, .video-list .video-card .video-card__info {
margin-top: 8px !important;
font-size: 14px;
padding: 0 !important;
}
.card-list .video-card .video-card__info .rcmd-tag, .video-list .video-card .video-card__info .rcmd-tag {
display: none !important;
}
.card-list .video-card .video-card__info .video-name, .video-list .video-card .video-card__info .video-name {
font-weight: normal !important;
margin-bottom: 8px !important;
font-size: 15px !important;
line-height: 22px !important;
height: 44px !important;
overflow: hidden !important;
}
.card-list .video-card .video-card__info .up-name, .video-list .video-card .video-card__info .up-name {
margin: unset !important;
font-size: 14px !important;
text-wrap: nowrap !important;
}
.card-list .video-card .video-card__info > div, .video-list .video-card .video-card__info > div {
display: flex !important;
justify-content: space-between !important;
}
.card-list .video-card .video-card__info .video-stat .play-text, .video-list .video-card .video-card__info .video-stat .play-text, .card-list .video-card .video-card__info .video-stat .like-text, .video-list .video-card .video-card__info .video-stat .like-text {
text-wrap: nowrap !important;
}
/* 排行榜, grid布局 */
.rank-list {
width: 100% !important;
display: grid !important;
grid-gap: 20px !important;
grid-column: span 6 !important;
grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
}
.rank-list .rank-item {
display: unset !important;
width: unset !important;
height: unset !important;
margin-right: unset !important;
margin-bottom: unset !important;
}
.rank-list .rank-item > .content {
display: unset !important;
padding: unset !important;
}
.rank-list .rank-item > .content > .img {
background: none;
width: unset !important;
height: unset !important;
margin: 0 !important;
border-radius: 6px !important;
overflow: hidden !important;
}
.rank-list .rank-item > .content > .img .num {
font-size: 18px;
zoom: 1.1;
}
.rank-list .rank-item > .content > .info {
margin-top: 8px !important;
margin-left: unset !important;
padding: 0 !important;
font-size: 14px;
height: unset !important;
}
.rank-list .rank-item > .content > .info .title {
height: 44px !important;
line-height: 22px !important;
font-weight: 500 !important;
font-size: 15px !important;
overflow: hidden !important;
}
.rank-list .rank-item > .content > .info .detail {
display: flex !important;
justify-content: space-between !important;
align-items: center !important;
margin-top: 8px !important;
}
.rank-list .rank-item > .content > .info .detail > a .up-name {
margin: unset !important;
font-size: 14px;
text-wrap: nowrap !important;
}
.rank-list .rank-item > .content > .info .detail > .detail-state .data-box {
line-height: unset !important;
margin: 0 12px 0 0;
text-wrap: nowrap !important;
}
.rank-list .rank-item > .content > .info .detail > .detail-state .data-box:nth-child(2) {
margin: 0 !important;
}
.rank-list .rank-item > .content .more-data {
display: none !important;
}`
			})
		];
		popularGroupList.push(new Group("popular-layout", "页面强制布局 (单选)", layoutItems));
		const hotItems = [
			// 隐藏 视频tag (人气飙升/1万点赞)
			new CheckboxItem({
				itemID: "popular-hot-hide-tag",
				description: "隐藏 视频tag (人气飙升/1万点赞)",
				itemCSS: `.popular-list .rcmd-tag {display: none !important;}`
			})
		];
		popularGroupList.push(new Group("popular-hot", "综合热门", hotItems));
		const weeklyItems = [
			// 隐藏 一句话简介
			new CheckboxItem({
				itemID: "popular-weekly-hide-hint",
				description: "隐藏 一句话简介",
				itemCSS: `.weekly-list .weekly-hint {display: none !important;}`
			})
		];
		popularGroupList.push(new Group("popular-weekly", "每周必看", weeklyItems));
		const historyItems = [
			// 隐藏 一句话简介
			new CheckboxItem({
				itemID: "popular-history-hide-hint",
				description: "隐藏 一句话简介",
				itemCSS: `.history-list .history-hint {display: none !important;}`
			})
		];
		popularGroupList.push(new Group("popular-history", "入站必刷", historyItems));
	}
	class BvidFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "bvidSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.bvidSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(bvid) {
			this.bvidSet.add(bvid.trim());
		}
		check(bvid) {
			bvid = bvid.trim();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || bvid.length === 0 || this.bvidSet.size === 0) {
						resolve("Bvid resolve, disable or empty");
					} else if(this.bvidSet.has(bvid)) {
						reject(`Bvid reject, ${bvid} in blacklist`);
					} else {
						resolve("Bvid resolve");
					}
				} catch (err) {
					error(err);
					resolve(`Bvid resolve, error`);
				}
			});
		}
	}
	const bvidFilterInstance = new BvidFilter();
	class DimensionFilter {
		constructor() {
			__publicField(this, "isEnable", false);
		}
		setStatus(status) {
			this.isEnable = status;
		}
		check(dimension) {
			return new Promise((resolve, reject) => {
				if(!this.isEnable) {
					resolve(`Dimension filter disable`);
				} else {
					if(dimension) {
						resolve(`Dimension is horizontal`);
					} else {
						reject(`Dimension is vertical`);
					}
				}
			});
		}
	}
	const dimensionFilterInstance = new DimensionFilter();
	class DurationFilter {
		constructor() {
			// 时长阈值, 单位秒
			__publicField(this, "threshold", 0);
			__publicField(this, "isEnable", false);
			// duration转换为秒数, 支持 HH:MM:SS, MM:SS, 纯数字
			__publicField(this, "durationToSec", (duration) => {
				duration = duration.trim();
				if(duration.match(/^(?:\d+:)?\d+:\d+$/)) {
					const parts = duration.split(":").map((part) => parseInt(part));
					if(parts.length === 3) {
						return parts[0] * 3600 + parts[1] * 60 + parts[2];
					}
					if(parts.length === 2) {
						return parts[0] * 60 + parts[1];
					}
				} else if(duration.match(/^\d+$/)) {
					return parseInt(duration);
				}
				return -1;
			});
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(threshold) {
			this.threshold = threshold;
		}
		check(duration) {
			return new Promise((resolve, reject) => {
				if(!this.isEnable || this.threshold === 0) {
					resolve(`Duration resolve, disable or 0`);
				} else {
					const seconds = this.durationToSec(duration);
					if(seconds > 0 && seconds > this.threshold) {
						resolve(`Duration OK`);
					} else {
						reject(`Duration too short`);
					}
				}
			});
		}
	}
	const durationFilterInstance = new DurationFilter();
	class QualityFilter {
		constructor() {
			// 质量过滤阈值
			__publicField(this, "threshold", 0);
			__publicField(this, "isEnable", false);
			/*
			根据coinLikeRatio计算视频质量
			对爬虫数据中投币点赞比在热门视频中所在排名进行拟合（百分制，4PL Formula）
			保持Quality在5%~80%时的高拟合度
			热门（质量要求适中）：f(x) = (-9.881-168.6)/(1+(x/0.3829)^0.6463)+168.6
			排行榜（较低）：h(x) = (-14.82-115.9)/(1+(x/0.05327)^0.6639)+115.9
			每周必看（严格）：p(x) = (1.534-173.4)/(1+(x/0.7463)^1.401)+173.4
			*/
			__publicField(this, "calcQuality", (ratio) => {
				const A = -9.881;
				const B = 0.6463;
				const C = 0.3829;
				const D = 168.6;
				const ans2 = (A - D) / (1 + Math.pow(ratio / C, B)) + D;
				return ans2 > 0 ? ans2 : 0;
			});
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(threshold) {
			this.threshold = threshold;
		}
		check(ratio) {
			return new Promise((resolve, reject) => {
				if(!this.isEnable || this.threshold === 0) {
					resolve(`Quality resolve, disable or 0`);
				} else {
					const score = this.calcQuality(ratio);
					if(score > 0 && score > this.threshold) {
						resolve(`Quality OK`);
					} else {
						reject(`Quality too bad`);
					}
				}
			});
		}
	}
	const qualityFilterInstance = new QualityFilter();
	class TitleKeywordFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "titleKeywordSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.titleKeywordSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(value) {
			if(value.trim()) {
				this.titleKeywordSet.add(value.trim());
			}
		}
		check(title) {
			title = title.trim().toLowerCase();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || title.length === 0 || this.titleKeywordSet.size === 0) {
						resolve(`TitleKeyword resolve, disable or empty`);
					}
					let flag = false;
					this.titleKeywordSet.forEach((word) => {
						if(word.startsWith("/") && word.endsWith("/")) {
							const pattern = new RegExp(word.slice(1, -1), "iv");
							if(title.match(pattern)) {
								flag = true;
								reject(`TitleKeyword reject, ${title} match ${word} in blacklist`);
							}
						} else {
							if(word && title.includes(word.toLowerCase())) {
								flag = true;
								reject(`TitleKeyword reject, ${title} match ${word} in blacklist`);
							}
						}
					});
					if(!flag) {
						resolve(`TitleKeyword resolve, title not match blacklist`);
					}
				} catch (err) {
					error(err);
					resolve(`TitleKeyword resolve, error`);
				}
			});
		}
	}
	const titleKeywordFilterInstance = new TitleKeywordFilter();
	class TitleKeywordWhitelistFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "titleKeywordSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.titleKeywordSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		check(title) {
			title = title.trim().toLowerCase();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || title.length === 0 || this.titleKeywordSet.size === 0) {
						resolve(`Title Whitelist resolve, disable or empty`);
					}
					let flag = false;
					this.titleKeywordSet.forEach((word) => {
						if(word.startsWith("/") && word.endsWith("/")) {
							const pattern = new RegExp(word.slice(1, -1), "iv");
							if(title.match(pattern)) {
								flag = true;
								reject(`Title Whitelist reject, ${title} match keyword ${word}`);
							}
						} else {
							if(word && title.toLowerCase().includes(word.toLowerCase())) {
								flag = true;
								reject(`Title Whitelist reject, ${title} match keyword ${word}`);
							}
						}
					});
					if(!flag) {
						resolve(`Title Whitelist resolve, title not match whitelist`);
					}
				} catch (err) {
					error(err);
					resolve(`Title Whitelist resolve, error`);
				}
			});
		}
	}
	const titleKeywordWhitelistFilterInstance = new TitleKeywordWhitelistFilter();
	class UploaderFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "uploaderSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.uploaderSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(value) {
			if(value.trim()) {
				this.uploaderSet.add(value.trim());
			}
		}
		check(uploader) {
			uploader = uploader.trim();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || uploader.length === 0 || this.uploaderSet.size === 0) {
						resolve(`Uploader resolve, disable or empty`);
					} else if(this.uploaderSet.has(uploader)) {
						reject(`Uploader reject, uploader ${uploader} in blacklist`);
					} else {
						resolve(`Uploader resolve, uploader not in blacklist`);
					}
				} catch (err) {
					error(err);
					resolve(`Uploader resolve, error`);
				}
			});
		}
	}
	const uploaderFilterInstance = new UploaderFilter();
	class UploaderKeywordFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "uploaderKeywordSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.uploaderKeywordSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(value) {
			if(value.trim()) {
				this.uploaderKeywordSet.add(value.trim());
			}
		}
		check(uploader) {
			uploader = uploader.trim().toLowerCase();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || uploader.length === 0 || this.uploaderKeywordSet.size === 0) {
						resolve(`UploaderKeyword resolve, disable or empty`);
					}
					let flag = false;
					this.uploaderKeywordSet.forEach((word) => {
						if(word.startsWith("/") && word.endsWith("/")) {
							const pattern = new RegExp(word.slice(1, -1), "iv");
							if(uploader.match(pattern)) {
								flag = true;
								reject(`UploaderKeyword reject, ${uploader} match ${word} in blacklist`);
							}
						} else {
							if(word && uploader.includes(word.toLowerCase())) {
								flag = true;
								reject(`UploaderKeyword reject, ${uploader} match ${word} in blacklist`);
							}
						}
					});
					if(!flag) {
						resolve(`UploaderKeyword resolve, uploader not match blacklist`);
					}
				} catch (err) {
					error(err);
					resolve(`UploaderKeyword resolve, error`);
				}
			});
		}
	}
	const uploaderKeywordFilterInstance = new UploaderKeywordFilter();
	class UploaderWhitelistFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "uploaderSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.uploaderSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(value) {
			if(value.trim()) {
				this.uploaderSet.add(value.trim());
			}
		}
		check(uploader) {
			uploader = uploader.trim();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || uploader.length === 0 || this.uploaderSet.size === 0) {
						resolve(`Uploader White resolve, disable or empty`);
					} else if(this.uploaderSet.has(uploader)) {
						reject(`Uploader White reject, ${uploader} in whitelist`);
					} else {
						resolve(`Uploader White resolve, uploader not in whitelist`);
					}
				} catch (err) {
					error(err);
					resolve(`Uploader White resolve, error`);
				}
			});
		}
	}
	const uploaderWhitelistFilterInstance = new UploaderWhitelistFilter();
	class CoreVideoFilter {
		/**
		 * 检测视频列表中每个视频是否合法, 并隐藏不合法的视频
		 * 对选取出的 标题/UP主/时长/BVID 进行并发检测
		 * @param videos 视频列表
		 * @param sign attribute标记
		 * @param selectorFunc 使用selector选取元素的函数
		 */
		checkAll(videos, sign = true, selectorFunc) {
			debugVideoFilter(`checkAll start`);
			try {
				const checkDuration = durationFilterInstance.isEnable && selectorFunc.duration !== void 0;
				const checkQuality = qualityFilterInstance.isEnable && selectorFunc.coinLikeRatio !== void 0;
				const checkDimension = dimensionFilterInstance.isEnable && selectorFunc.dimension !== void 0;
				const checkTitleKeyword = titleKeywordFilterInstance.isEnable && selectorFunc.titleKeyword !== void 0;
				const checkUploader = uploaderFilterInstance.isEnable && selectorFunc.uploader !== void 0;
				const checkUploaderKeyword = uploaderKeywordFilterInstance.isEnable && selectorFunc.uploader !== void 0;
				const checkBvid = bvidFilterInstance.isEnable && selectorFunc.bvid !== void 0;
				const checkUploaderWhitelist = uploaderWhitelistFilterInstance.isEnable && selectorFunc.uploader !== void 0;
				const checkTitleKeywordWhitelist = titleKeywordWhitelistFilterInstance.isEnable && selectorFunc.titleKeyword !== void 0;
				if(!checkDuration && !checkQuality && !checkDimension && !checkTitleKeyword && !checkUploader && !checkUploaderKeyword && !checkBvid) {
					videos.forEach((video) => showEle(video));
					return;
				}
				videos.forEach((video) => {
					var _a, _b, _c, _d, _e;
					const info = {};
					const blackTasks = [];
					const whiteTasks = [];
					if(checkDuration) {
						const duration = selectorFunc.duration(video);
						if(duration) {
							blackTasks.push(durationFilterInstance.check(duration));
							info.duration = duration;
						}
					}
					if(checkQuality) {
						const ratio = selectorFunc.coinLikeRatio(video);
						if(ratio) {
							blackTasks.push(qualityFilterInstance.check(ratio));
							info.coinLikeRatio = ratio;
						}
					}
					if(checkDimension) {
						const dimension = selectorFunc.dimension(video);
						if(dimension !== null) {
							blackTasks.push(dimensionFilterInstance.check(dimension));
							info.dimension = dimension;
						}
					}
					if(checkBvid) {
						const bvid = selectorFunc.bvid(video);
						if(bvid) {
							blackTasks.push(bvidFilterInstance.check(bvid));
							info.bvid = bvid;
						}
					}
					if(checkUploader) {
						const uploader = (_a = selectorFunc.uploader(video)) == null ? void 0 : _a.trim();
						if(uploader) {
							blackTasks.push(uploaderFilterInstance.check(uploader));
							info.uploader = uploader;
						}
					}
					if(checkUploaderKeyword) {
						const uploader = (_b = selectorFunc.uploader(video)) == null ? void 0 : _b.trim();
						if(uploader) {
							blackTasks.push(uploaderKeywordFilterInstance.check(uploader));
							info.uploader = uploader;
						}
					}
					if(checkTitleKeyword) {
						const title = (_c = selectorFunc.titleKeyword(video)) == null ? void 0 : _c.trim();
						if(title) {
							blackTasks.push(titleKeywordFilterInstance.check(title));
							info.title = title;
						}
					}
					if(checkUploaderWhitelist) {
						const uploader = (_d = selectorFunc.uploader(video)) == null ? void 0 : _d.trim();
						if(uploader) {
							whiteTasks.push(uploaderWhitelistFilterInstance.check(uploader));
							info.uploader = uploader;
						}
					}
					if(checkTitleKeywordWhitelist) {
						const title = (_e = selectorFunc.titleKeyword(video)) == null ? void 0 : _e.trim();
						if(title) {
							whiteTasks.push(titleKeywordWhitelistFilterInstance.check(title));
							info.title = title;
						}
					}
					Promise.all(blackTasks).then((_result) => {
						showEle(video);
						Promise.all(whiteTasks).then((_result2) => {}).catch((_result2) => {});
					}).catch((_result) => {
						if(whiteTasks) {
							Promise.all(whiteTasks).then((_result2) => {
								if(!isEleHide(video)) {
									log(`hide video
bvid: ${info.bvid}
time: ${info.duration}
up: ${info.uploader}
ratio: ${info.coinLikeRatio}
title: ${info.title}`);
								}
								hideEle(video);
							}).catch((_result2) => {
								showEle(video);
							});
						} else {
							if(!isEleHide(video)) {
								log(`hide video
bvid: ${info.bvid}
time: ${info.duration}
up: ${info.uploader}
ratio: ${info.coinLikeRatio}
title: ${info.title}`);
							}
							hideEle(video);
						}
					});
					sign && video.setAttribute(settings.filterSign, "");
				});
			} catch (err) {
				error(err);
				error("coreFilter checkAll error");
			}
		}
	}
	const coreVideoFilterInstance = new CoreVideoFilter();
	const contextMenuStyle = "#bili-cleaner-context-menu-container{position:fixed;background:white;border-radius:5px;box-shadow:0 0 6px #0000004d;-webkit-user-select:none;user-select:none;overflow:hidden;z-index:99999}#bili-cleaner-context-menu-container ul{margin-block-start:0;margin-block-end:0;margin-inline-start:0px;margin-inline-end:0px;padding-inline-start:0}#bili-cleaner-context-menu-container li{padding:5px 10px;font-size:1rem}#bili-cleaner-context-menu-container li:hover{background:rgb(251,114,153);font-weight:500;color:#fff}\n";
	class ContextMenu {
		constructor() {
			__publicField(this, "nodeHTML", `
<div id="bili-cleaner-context-menu-container">
<ul>
</ul>
</div>`);
			__publicField(this, "menus", []);
			__publicField(this, "node");
			__publicField(this, "isShowing", false);
		}
		/** 向document.head中添加CSS */
		insertContextMenuCSS() {
			try {
				if(document.head.querySelector("#bili-cleaner-context-menu-css")) {
					return;
				}
				const style = document.createElement("style");
				style.innerHTML = contextMenuStyle;
				style.setAttribute("id", "bili-cleaner-context-menu-css");
				document.head.appendChild(style);
				debugComponents("insertContextMenuCSS OK");
			} catch (err) {
				error(`insertContextMenuCSS failed`);
				error(err);
			}
		}
		/**
		 * 注册右键菜单
		 * @param name 功能名
		 * @param onclick 点击执行的回调函数
		 */
		registerMenu(name, onclick) {
			if(this.isShowing) {
				this.menus = [];
				this.isShowing = false;
			}
			this.menus.push({
				name,
				onclick
			});
		}
		/**
		 * 显示右键菜单
		 * @param x 坐标X
		 * @param y 坐标Y
		 */
		show(x, y) {
			var _a;
			if(!this.node) {
				this.insertContextMenuCSS();
				const wrap = document.createElement("div");
				wrap.innerHTML = this.nodeHTML;
				this.node = wrap.querySelector("#bili-cleaner-context-menu-container");
				(_a = document.body) == null ? void 0 : _a.appendChild(this.node);
			}
			const menuList = this.node.querySelector("ul");
			menuList.innerHTML = "";
			this.menus.forEach((menu) => {
				const li = document.createElement("li");
				li.className = "bili-cleaner-context-menu";
				li.innerHTML = `${menu.name}`;
				li.onclick = menu.onclick;
				menuList.appendChild(li);
			});
			this.node.style.left = `${x + 3}px`;
			this.node.style.top = `${y + 3}px`;
			this.node.style.display = "block";
			this.isShowing = true;
			const hideMenu = () => {
				this.hide();
			};
			document.addEventListener("click", () => {
				hideMenu();
				document.removeEventListener("click", hideMenu);
			});
		}
		/** 隐藏右键菜单 */
		hide() {
			if(this.node) {
				this.node.style.display = "none";
				this.node.querySelector("ul").innerHTML = "";
				this.menus = [];
			}
			this.isShowing = false;
		}
	}
	class WordList {
		/**
		 * WordList用于维护各种string array（up主列表、BVID列表、关键词列表）
		 * @param listID 列表唯一ID, 对应数据存储
		 * @param title 列表标题
		 * @param description 列表详情说明
		 * @param callback 回调函数, 在保存列表时回调
		 */
		constructor(listID, title, description, callback) {
			__publicField(this, "wordArr", []);
			__publicField(this, "wordSet", /* @__PURE__ */ new Set());
			__publicField(this, "nodeHTML", `
<div id="bili-cleaner-wordlist">
<div class="wordlist-header"></div>
<div class="wordlist-description"></div>
<textarea class="wordlist-body" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
<div class="wordlist-footer">
<button class="wordlist-save-button">保存</button>
<button class="wordlist-close-button">关闭</button>
</div>
</div>`);
			this.listID = listID;
			this.title = title;
			this.description = description;
			this.callback = callback;
			this.getValue();
		}
		setValue() {
			_GM_setValue(`BILICLEANER_${this.listID}`, this.wordArr);
		}
		getValue() {
			debugComponents(`key`, `BILICLEANER_${this.listID}`);
			this.wordArr = _GM_getValue(`BILICLEANER_${this.listID}`, []);
			debugComponents(`list ${this.listID} getValue ${this.wordArr.length} lines`);
			this.wordSet = new Set(this.wordArr);
		}
		/** 添加一个值到列表 */
		addValue(value) {
			try {
				this.getValue();
				value = value.trim();
				if(value && !this.wordSet.has(value)) {
					this.wordArr.unshift(value);
					this.wordSet.add(value);
					this.setValue();
				}
				debugComponents(`list ${this.listID} add value ${value}, OK`);
			} catch (err) {
				error(err);
				error(`list ${this.listID} add value ${value}, ERROR`);
			}
		}
		// /** 添加多个值到列表 */
		// addValues(values: string[]) {
		//     try {
		//         this.getValue()
		//         values.forEach((value) => {
		//             value = value.trim()
		//             if (value && !this.wordSet.has(value)) {
		//                 this.wordArr.push(value)
		//                 this.wordSet.add(value)
		//             }
		//         })
		//         this.setValue()
		//         debug(`list ${this.listID} add ${values.length} lines, OK`)
		//     } catch (err) {
		//         error(err)
		//         error(`list ${this.listID} add ${values.length} lines, ERROR`)
		//     }
		// }
		/**
		 * 编辑整个列表
		 * @param values 编辑框内输入的列表
		 * @returns 保存是否成功
		 */
		saveList(values) {
			try {
				const tempSet = /* @__PURE__ */ new Set();
				const tempArr = [];
				values.forEach((value) => {
					value = value.trim();
					if(value && !tempSet.has(value)) {
						tempArr.push(value);
						tempSet.add(value);
					}
				});
				this.wordArr = tempArr;
				this.wordSet = tempSet;
				this.setValue();
				this.callback(this.wordArr);
				debugComponents(`list ${this.listID} saveList, OK`);
				return true;
			} catch (err) {
				error(err);
				error(`list ${this.listID} saveList, ERROR`);
			}
			return false;
		}
		/** 获取列表值, 用于编辑列表 or 初始化过滤器 */
		fetchList() {
			this.getValue();
			debugComponents(`fetchList fetch ${this.wordArr.length} lines`);
			return this.wordArr;
		}
		/** 插入节点, 显示编辑框 */
		insertNode() {
			var _a, _b;
			(_a = document.getElementById("bili-cleaner-wordlist")) == null ? void 0 : _a.remove();
			const e = document.createElement("div");
			e.innerHTML = this.nodeHTML.trim();
			e.querySelector(".wordlist-header").innerHTML = this.title.replace("\n", "<br>");
			e.querySelector(".wordlist-description").innerHTML = this.description.replace("\n", "<br>");
			debugComponents(`insertNode, fetchList ${this.fetchList().length} lines`);
			let lines = this.fetchList().join("\n");
			if(lines) {
				lines += "\n";
			}
			e.querySelector("textarea").value = lines;
			(_b = document.body) == null ? void 0 : _b.appendChild(e.firstChild);
		}
		/** 监听按钮, 保存和取消动作 */
		watchNode() {
			const node = document.getElementById("bili-cleaner-wordlist");
			if(!node) {
				return;
			}
			const cancel = node.querySelector(".wordlist-close-button");
			cancel == null ? void 0 : cancel.addEventListener("click", () => {
				node.remove();
			});
			debugComponents(`list ${this.listID} listen cancel button`);
			const save = node.querySelector(".wordlist-save-button");
			save == null ? void 0 : save.addEventListener("click", () => {
				const textarea = node.querySelector("textarea");
				if(textarea) {
					debugComponents("textarea value", textarea.value);
					const ok = this.saveList(textarea.value.split("\n"));
					if(ok) {
						textarea.value = this.fetchList().join("\n");
						if(textarea.value.trim()) {
							textarea.value += "\n";
						}
						save.style.backgroundColor = "#99CC66";
						save.style.color = "white";
						setTimeout(() => {
							save.style.backgroundColor = "white";
							save.style.color = "black";
						}, 1e3);
					} else {
						save.innerHTML = "保存失败";
						save.style.backgroundColor = "#FF6666";
						save.style.color = "white";
					}
				}
			});
			debugComponents(`list ${this.listID} listen save button`);
		}
		/** 可拖拽bar */
		draggableBar() {
			try {
				const wordlist = document.getElementById("bili-cleaner-wordlist");
				const bar = document.querySelector("#bili-cleaner-wordlist .wordlist-header");
				let isDragging = false;
				let initX, initY, initLeft, initTop;
				bar.addEventListener("mousedown", (e) => {
					isDragging = true;
					initX = e.clientX;
					initY = e.clientY;
					const c = window.getComputedStyle(wordlist);
					initLeft = parseInt(c.getPropertyValue("left"), 10);
					initTop = parseInt(c.getPropertyValue("top"), 10);
				});
				document.addEventListener("mousemove", (e) => {
					if(isDragging) {
						const diffX = e.clientX - initX;
						const diffY = e.clientY - initY;
						wordlist.style.left = `${initLeft + diffX}px`;
						wordlist.style.top = `${initTop + diffY}px`;
						const rect = bar.getBoundingClientRect();
						if(rect.left < 0) {
							wordlist.style.left = `${initLeft + diffX - rect.left}px`;
						}
						if(rect.top < 0) {
							wordlist.style.top = `${initTop + diffY - rect.top}px`;
						}
						if(rect.right > window.innerWidth) {
							wordlist.style.left = `${initLeft + diffX - (rect.right - window.innerWidth)}px`;
						}
						if(rect.bottom > window.innerHeight) {
							wordlist.style.top = `${initTop + diffY - (rect.bottom - window.innerHeight)}px`;
						}
					}
				});
				document.addEventListener("mouseup", () => {
					isDragging = false;
				});
				debugComponents("draggableBar OK");
			} catch (err) {
				error(`draggableBar failed`);
				error(err);
			}
		}
		/** 显示编辑框 */
		show() {
			this.insertNode();
			this.watchNode();
			this.draggableBar();
		}
	}
	class VideoFilterAgency {
		notifyDuration(event, value) {
			switch(event) {
				case "disable":
					durationFilterInstance.setStatus(false);
					break;
				case "enable":
					durationFilterInstance.setStatus(true);
					break;
				case "change":
					if(typeof value === "number") {
						durationFilterInstance.setParams(value);
					}
					break;
			}
		}
		notifyUploader(event, value) {
			switch(event) {
				case "disable":
					uploaderFilterInstance.setStatus(false);
					break;
				case "enable":
					uploaderFilterInstance.setStatus(true);
					break;
				case "add":
					if(typeof value === "string") {
						if(value.trim()) {
							uploaderFilterInstance.addParam(value.trim());
						}
					}
					break;
				case "edit":
					if(Array.isArray(value)) {
						uploaderFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
		notifyQuality(event, value) {
			switch(event) {
				case "disable":
					qualityFilterInstance.setStatus(false);
					break;
				case "enable":
					qualityFilterInstance.setStatus(true);
					break;
				case "change":
					if(typeof value === "number") {
						qualityFilterInstance.setParams(value);
					}
					break;
			}
		}
		notifyDimension(event) {
			switch(event) {
				case "disable":
					dimensionFilterInstance.setStatus(false);
					break;
				case "enable":
					dimensionFilterInstance.setStatus(true);
					break;
			}
		}
		notifyBvid(event, value) {
			switch(event) {
				case "disable":
					bvidFilterInstance.setStatus(false);
					break;
				case "enable":
					bvidFilterInstance.setStatus(true);
					break;
				case "add":
					if(typeof value === "string") {
						if(value.trim()) {
							bvidFilterInstance.addParam(value.trim());
						}
					}
					break;
				case "edit":
					if(Array.isArray(value)) {
						bvidFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
		notifyTitleKeyword(event, value) {
			switch(event) {
				case "disable":
					titleKeywordFilterInstance.setStatus(false);
					break;
				case "enable":
					titleKeywordFilterInstance.setStatus(true);
					break;
				case "add":
					if(typeof value === "string" && value.trim()) {
						titleKeywordFilterInstance.addParam(value.trim());
					}
					break;
				case "edit":
					if(Array.isArray(value)) {
						titleKeywordFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
		notifyUploaderKeyword(event, value) {
			switch(event) {
				case "disable":
					uploaderKeywordFilterInstance.setStatus(false);
					break;
				case "enable":
					uploaderKeywordFilterInstance.setStatus(true);
					break;
				case "add":
					if(typeof value === "string" && value.trim()) {
						uploaderKeywordFilterInstance.addParam(value.trim());
					}
					break;
				case "edit":
					if(Array.isArray(value)) {
						uploaderKeywordFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
		notifyUploaderWhitelist(event, value) {
			switch(event) {
				case "disable":
					uploaderWhitelistFilterInstance.setStatus(false);
					break;
				case "enable":
					uploaderWhitelistFilterInstance.setStatus(true);
					break;
				case "add":
					if(typeof value === "string" && value.trim()) {
						uploaderWhitelistFilterInstance.addParam(value.trim());
					}
					break;
				case "edit":
					if(Array.isArray(value)) {
						uploaderWhitelistFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
		notifyTitleKeywordWhitelist(event, value) {
			switch(event) {
				case "disable":
					titleKeywordWhitelistFilterInstance.setStatus(false);
					break;
				case "enable":
					titleKeywordWhitelistFilterInstance.setStatus(true);
					break;
				case "edit":
					if(Array.isArray(value)) {
						titleKeywordWhitelistFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
	}
	const videoFilterAgencyInstance = new VideoFilterAgency();
	class DurationAction {
		/**
		 * 时长过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.checkVideoList = checkVideoList;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, 60);
			durationFilterInstance.setStatus(this.status);
			durationFilterInstance.setParams(this.value);
		}
		enable() {
			debugVideoFilter(`DurationAction enable`);
			videoFilterAgencyInstance.notifyDuration("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			debugVideoFilter(`DurationAction disable`);
			videoFilterAgencyInstance.notifyDuration("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		change(value) {
			debugVideoFilter(`DurationAction change ${value}`);
			videoFilterAgencyInstance.notifyDuration("change", value);
			this.checkVideoList(true);
		}
	}
	class UploaderAction {
		/**
		 * UP主过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "blacklist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkVideoList = checkVideoList;
			uploaderFilterInstance.setStatus(this.status);
			uploaderFilterInstance.setParams(this.value);
			this.blacklist = new WordList(this.valueKey, "UP主 黑名单", "每行一个UP主昵称，保存时自动去重",
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			videoFilterAgencyInstance.notifyUploader("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			videoFilterAgencyInstance.notifyUploader("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		add(value) {
			this.blacklist.addValue(value);
			videoFilterAgencyInstance.notifyUploader("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑黑名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			videoFilterAgencyInstance.notifyUploader("edit", values);
			this.checkVideoList(true);
		}
	}
	class QualityAction {
		/**
		 * 视频质量过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.checkVideoList = checkVideoList;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, 20);
			qualityFilterInstance.setStatus(this.status);
			qualityFilterInstance.setParams(this.value);
		}
		enable() {
			debugVideoFilter(`QualityAction enable`);
			videoFilterAgencyInstance.notifyQuality("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			debugVideoFilter(`QualityAction disable`);
			videoFilterAgencyInstance.notifyQuality("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		change(value) {
			debugVideoFilter(`QualityAction change ${value}`);
			videoFilterAgencyInstance.notifyQuality("change", value);
			this.checkVideoList(true);
		}
	}
	class DimensionAction {
		/**
		 * 视频横竖屏过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			this.statusKey = statusKey;
			this.checkVideoList = checkVideoList;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			dimensionFilterInstance.setStatus(this.status);
		}
		enable() {
			debugVideoFilter(`DimensionAction enable`);
			videoFilterAgencyInstance.notifyDimension("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			debugVideoFilter(`DimensionAction disable`);
			videoFilterAgencyInstance.notifyDimension("disable");
			this.checkVideoList(true);
			this.status = false;
		}
	}
	class BvidAction {
		/**
		 * BV号过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "blacklist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkVideoList = checkVideoList;
			bvidFilterInstance.setStatus(this.status);
			bvidFilterInstance.setParams(this.value);
			this.blacklist = new WordList(this.valueKey, "BV号 黑名单", "每行一个BV号，保存时自动去重",
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			videoFilterAgencyInstance.notifyBvid("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			videoFilterAgencyInstance.notifyBvid("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		add(value) {
			this.blacklist.addValue(value);
			videoFilterAgencyInstance.notifyBvid("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑黑名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			videoFilterAgencyInstance.notifyBvid("edit", values);
			this.checkVideoList(true);
		}
	}
	class TitleKeywordAction {
		/**
		 * 标题关键字过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "blacklist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkVideoList = checkVideoList;
			titleKeywordFilterInstance.setStatus(this.status);
			titleKeywordFilterInstance.setParams(this.value);
			this.blacklist = new WordList(this.valueKey, "标题关键词 黑名单", `每行一个关键词或正则，不区分大小写
正则无需flag（默认iv模式）语法：/abc|\\d+/`,
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			videoFilterAgencyInstance.notifyTitleKeyword("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			videoFilterAgencyInstance.notifyTitleKeyword("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		add(value) {
			this.blacklist.addValue(value);
			videoFilterAgencyInstance.notifyTitleKeyword("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑黑名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			videoFilterAgencyInstance.notifyTitleKeyword("edit", values);
			this.checkVideoList(true);
		}
	}
	class UploaderKeywordAction {
		/**
		 * 昵称关键字过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "blacklist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkVideoList = checkVideoList;
			uploaderKeywordFilterInstance.setStatus(this.status);
			uploaderKeywordFilterInstance.setParams(this.value);
			this.blacklist = new WordList(this.valueKey, "UP主昵称关键词 黑名单", `每行一个关键词或正则，不区分大小写
正则无需flag（默认iv模式）语法：/abc|\\d+/`,
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			videoFilterAgencyInstance.notifyUploaderKeyword("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			videoFilterAgencyInstance.notifyUploaderKeyword("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		add(value) {
			this.blacklist.addValue(value);
			videoFilterAgencyInstance.notifyUploaderKeyword("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑黑名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			videoFilterAgencyInstance.notifyUploaderKeyword("edit", values);
			this.checkVideoList(true);
		}
	}
	class UploaderWhitelistAction {
		/**
		 * UP主白名单, 不被过滤
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "whitelist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkVideoList = checkVideoList;
			uploaderWhitelistFilterInstance.setStatus(this.status);
			uploaderWhitelistFilterInstance.setParams(this.value);
			this.whitelist = new WordList(this.valueKey, "UP主 白名单", "每行一个UP主昵称，保存时自动去重",
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			videoFilterAgencyInstance.notifyUploaderWhitelist("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			videoFilterAgencyInstance.notifyUploaderWhitelist("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		add(value) {
			this.whitelist.addValue(value);
			videoFilterAgencyInstance.notifyUploaderWhitelist("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑白名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			videoFilterAgencyInstance.notifyUploaderWhitelist("edit", values);
			this.checkVideoList(true);
		}
	}
	class TitleKeywordWhitelistAction {
		/**
		 * 标题关键词白名单, 不被过滤
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkVideoList 检测视频列表函数
		 */
		constructor(statusKey, valueKey, checkVideoList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkVideoList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "whitelist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkVideoList = checkVideoList;
			titleKeywordWhitelistFilterInstance.setStatus(this.status);
			titleKeywordWhitelistFilterInstance.setParams(this.value);
			this.whitelist = new WordList(this.valueKey, "标题关键词 白名单", `每行一个关键词或正则，不区分大小写
正则无需flag（默认iv模式）语法：/abc|\\d+/`,
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			videoFilterAgencyInstance.notifyTitleKeywordWhitelist("enable");
			this.checkVideoList(true);
			this.status = true;
		}
		disable() {
			videoFilterAgencyInstance.notifyTitleKeywordWhitelist("disable");
			this.checkVideoList(true);
			this.status = false;
		}
		// edit由编辑白名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			videoFilterAgencyInstance.notifyTitleKeywordWhitelist("edit", values);
			this.checkVideoList(true);
		}
	}
	const homepagePageVideoFilterGroupList = [];
	let isContextMenuFuncRunning$6 = false;
	let isContextMenuUploaderEnable$4 = false;
	let isContextMenuBvidEnable$4 = false;
	let isFollowingWhitelistEnable = true;
	if(isPageHomepage()) {
		let videoListContainer;
		const rcmdSelectorFunc = {
			duration: (video) => {
				var _a;
				const duration = (_a = video.querySelector("span.bili-video-card__stats__duration")) == null ? void 0 : _a.textContent;
				return duration ? duration : null;
			},
			titleKeyword: (video) => {
				var _a, _b;
				const titleKeyword = ((_a = video.querySelector("h3.bili-video-card__info--tit")) == null ? void 0 : _a.getAttribute("title")) || ((_b = video.querySelector("h3.bili-video-card__info--tit a")) == null ? void 0 : _b.textContent);
				return titleKeyword ? titleKeyword : null;
			},
			bvid: (video) => {
				var _a, _b, _c;
				const href2 = ((_a = video.querySelector("h3.bili-video-card__info--tit a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector("a.bili-video-card__image--link")) == null ? void 0 : _b.getAttribute("href")) || ((_c = video.querySelector("a.bili-video-card__image--link")) == null ? void 0 : _c.getAttribute("data-target-url"));
				if(href2) {
					return matchBvid(href2);
				}
				return null;
			},
			uploader: (video) => {
				var _a;
				const uploader = (_a = video.querySelector("span.bili-video-card__info--author")) == null ? void 0 : _a.textContent;
				return uploader ? uploader : null;
			}
		};
		const feedSelectorFunc = rcmdSelectorFunc;
		const checkVideoList = (fullSite) => {
			if(!videoListContainer) {
				debugVideoFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				let feedVideos;
				let rcmdVideos;
				if(!fullSite) {
					feedVideos = [...videoListContainer.querySelectorAll(`:scope > .feed-card:not([${settings.filterSign}])`)];
					rcmdVideos = [...videoListContainer.querySelectorAll(`:scope > .bili-video-card.is-rcmd:not([${settings.filterSign}])`)];
				} else {
					feedVideos = [...videoListContainer.querySelectorAll(`:scope > .feed-card`)];
					rcmdVideos = [...videoListContainer.querySelectorAll(`:scope > .bili-video-card.is-rcmd`)];
				}
				if(isFollowingWhitelistEnable) {
					feedVideos = feedVideos.filter((video) => {
						var _a, _b;
						const icontext = (_b = (_a = video.querySelector(".bili-video-card__info--icon-text")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
						if(icontext === "已关注") {
							showEle(video);
						}
						return icontext !== "已关注";
					});
					rcmdVideos = rcmdVideos.filter((video) => {
						var _a, _b;
						const icontext = (_b = (_a = video.querySelector(".bili-video-card__info--icon-text")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
						if(icontext === "已关注") {
							showEle(video);
						}
						return icontext !== "已关注";
					});
				}
				feedVideos.length && coreVideoFilterInstance.checkAll(feedVideos, true, feedSelectorFunc);
				rcmdVideos.length && coreVideoFilterInstance.checkAll(rcmdVideos, true, rcmdSelectorFunc);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const homepageDurationAction = new DurationAction("homepage-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const homepageUploaderAction = new UploaderAction("homepage-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const homepageUploaderKeywordAction = new UploaderKeywordAction("homepage-uploader-keyword-filter-status", "global-uploader-keyword-filter-value", checkVideoList);
		const homepageBvidAction = new BvidAction("homepage-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const homepageTitleKeywordAction = new TitleKeywordAction("homepage-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const homepageUploaderWhitelistAction = new UploaderWhitelistAction("homepage-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const homepageTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("homepage-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const watchVideoListContainer = () => {
			const check = async (fullSite) => {
				if(homepageDurationAction.status || homepageUploaderAction.status || homepageUploaderKeywordAction.status || homepageBvidAction.status || homepageTitleKeywordAction.status) {
					checkVideoList(fullSite);
				}
			};
			if(videoListContainer) {
				check(true).then().catch();
				const videoObserver = new MutationObserver(() => {
					check(false).then().catch();
				});
				videoObserver.observe(videoListContainer, {
					childList: true
				});
				debugVideoFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, ".container.is-version8", (node) => {
				return node.className === "container is-version8";
			}).then((ele) => {
				if(ele) {
					videoListContainer = ele;
					watchVideoListContainer();
				}
			});
		} catch (err) {
			error(err);
			error(`watch video list ERROR`);
		}
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$6) {
				return;
			}
			isContextMenuFuncRunning$6 = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
				menu.hide();
				if(e.target instanceof HTMLElement) {
					if(isContextMenuUploaderEnable$4 && e.target.closest(".bili-video-card__info--owner")) {
						const node = (_a = e.target.closest(".bili-video-card__info--owner")) == null ? void 0 : _a.querySelector(".bili-video-card__info--author");
						const uploader = node == null ? void 0 : node.textContent;
						if(uploader) {
							e.preventDefault();
							menu.registerMenu(`◎ 屏蔽UP主：${uploader}`, () => {
								homepageUploaderAction.add(uploader);
							});
							menu.registerMenu(`◎ 将UP主加入白名单`, () => {
								homepageUploaderWhitelistAction.add(uploader);
							});
							menu.registerMenu(`◎ 复制主页链接`, () => {
								var _a2;
								const url = (_a2 = node.closest(".bili-video-card__info--owner")) == null ? void 0 : _a2.getAttribute("href");
								if(url) {
									const matches = url.match(/space\.bilibili\.com\/\d+/g);
									matches && navigator.clipboard.writeText(`https://${matches[0]}`);
								}
							});
							menu.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable$4 && ((_b = e.target.parentElement) == null ? void 0 : _b.classList.contains("bili-video-card__info--tit"))) {
						const node = e.target.parentElement;
						const href2 = (_c = node.querySelector(":scope > a")) == null ? void 0 : _c.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								menu.registerMenu(`◎ 屏蔽视频 ${bvid}`, () => {
									homepageBvidAction.add(bvid);
								});
								menu.registerMenu(`◎ 复制视频链接`, () => {
									navigator.clipboard.writeText(`https://www.bilibili.com/video/${bvid}`).then().catch();
								});
								menu.show(e.clientX, e.clientY);
							}
						}
					} else {
						menu.hide();
					}
				}
			});
			debugVideoFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			// 启用 首页时长过滤
			new CheckboxItem({
				itemID: homepageDurationAction.statusKey,
				description: "启用 时长过滤",
				/**
				 * 需使用匿名函数包装后传参, 否则报错, 下同
				 *
				 * GPT4(对错未知):
				 * 当把一个类的方法作为回调函数直接传递给另一个函数时，
				 * 那个方法会失去它的上下文（也就是它的 this 值），因为它被调用的方式改变了。
				 * 在这种情况下，this 可能会变成 undefined（严格模式）或全局对象（非严格模式）
				 *
				 * 可以在传递方法时使用箭头函数来保持 this 的上下文
				 */
				enableFunc: async () => {
					homepageDurationAction.enable();
				},
				disableFunc: async () => {
					homepageDurationAction.disable();
				}
			}),
			// 设定最低时长
			new NumberItem({
				itemID: homepageDurationAction.valueKey,
				description: "设定最低时长 (0~300s)",
				defaultValue: 60,
				minValue: 0,
				maxValue: 300,
				disableValue: 0,
				unit: "秒",
				callback: async (value) => {
					homepageDurationAction.change(value);
				}
			})
		];
		homepagePageVideoFilterGroupList.push(new Group("homepage-duration-filter-group", "首页 时长过滤", durationItems));
		const uploaderItems = [
			// 启用 首页UP主过滤
			new CheckboxItem({
				itemID: homepageUploaderAction.statusKey,
				description: "启用 UP主过滤 (右键单击UP主)",
				enableFunc: async () => {
					isContextMenuUploaderEnable$4 = true;
					contextMenuFunc();
					homepageUploaderAction.enable();
				},
				disableFunc: async () => {
					isContextMenuUploaderEnable$4 = false;
					homepageUploaderAction.disable();
				}
			}),
			// 按钮功能：打开uploader黑名单编辑框
			new ButtonItem({
				itemID: "homepage-uploader-edit-button",
				description: "编辑 UP主黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					homepageUploaderAction.blacklist.show();
				}
			}),
			// 启用 UP主昵称关键词过滤
			new CheckboxItem({
				itemID: homepageUploaderKeywordAction.statusKey,
				description: "启用 UP主昵称关键词过滤",
				enableFunc: async () => {
					homepageUploaderKeywordAction.enable();
				},
				disableFunc: async () => {
					homepageUploaderKeywordAction.disable();
				}
			}),
			// 编辑 UP主昵称关键词黑名单
			new ButtonItem({
				itemID: "homepage-uploader-keyword-edit-button",
				description: "编辑 UP主昵称关键词黑名单",
				name: "编辑",
				itemFunc: async () => {
					homepageUploaderKeywordAction.blacklist.show();
				}
			})
		];
		homepagePageVideoFilterGroupList.push(new Group("homepage-uploader-filter-group", "首页 UP主过滤", uploaderItems));
		const titleKeywordItems = [
			// 启用 首页关键词过滤
			new CheckboxItem({
				itemID: homepageTitleKeywordAction.statusKey,
				description: "启用 标题关键词过滤",
				enableFunc: async () => {
					homepageTitleKeywordAction.enable();
				},
				disableFunc: async () => {
					homepageTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "homepage-title-keyword-edit-button",
				description: "编辑 标题关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					homepageTitleKeywordAction.blacklist.show();
				}
			})
		];
		homepagePageVideoFilterGroupList.push(new Group("homepage-title-keyword-filter-group", "首页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 首页BV号过滤
			new CheckboxItem({
				itemID: homepageBvidAction.statusKey,
				description: "启用 BV号过滤 (右键单击标题)",
				enableFunc: async () => {
					isContextMenuBvidEnable$4 = true;
					contextMenuFunc();
					homepageBvidAction.enable();
				},
				disableFunc: async () => {
					isContextMenuBvidEnable$4 = false;
					homepageBvidAction.disable();
				}
			}),
			// 按钮功能：打开bvid黑名单编辑框
			new ButtonItem({
				itemID: "homepage-bvid-edit-button",
				description: "编辑 BV号黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					homepageBvidAction.blacklist.show();
				}
			})
		];
		homepagePageVideoFilterGroupList.push(new Group("homepage-bvid-filter-group", "首页 BV号过滤", bvidItems));
		const whitelistItems = [
			// 已关注UP主 免过滤, 默认开启
			new CheckboxItem({
				itemID: "homepage-following-whitelist-filter-status",
				description: "标有 [已关注] 的视频免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isFollowingWhitelistEnable = true;
					checkVideoList(true);
				},
				disableFunc: async () => {
					isFollowingWhitelistEnable = false;
					checkVideoList(true);
				}
			}),
			// 启用 首页UP主白名单
			new CheckboxItem({
				itemID: homepageUploaderWhitelistAction.statusKey,
				description: "启用 UP主白名单 (右键单击UP主)",
				enableFunc: async () => {
					homepageUploaderWhitelistAction.enable();
				},
				disableFunc: async () => {
					homepageUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "homepage-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					homepageUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 首页标题关键词白名单
			new CheckboxItem({
				itemID: homepageTitleKeywordWhitelistAction.statusKey,
				description: "启用 标题关键词白名单",
				enableFunc: async () => {
					homepageTitleKeywordWhitelistAction.enable();
				},
				disableFunc: async () => {
					homepageTitleKeywordWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "homepage-title-keyword-whitelist-edit-button",
				description: "编辑 标题关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					homepageTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		homepagePageVideoFilterGroupList.push(new Group("homepage-whitelist-filter-group", "首页 白名单设定 (免过滤)", whitelistItems));
	}
	const videoPageVideoFilterGroupList = [];
	let isContextMenuFuncRunning$5 = false;
	let isContextMenuUploaderEnable$3 = false;
	let isContextMenuBvidEnable$3 = false;
	let isNextPlayWhitelistEnable = _GM_getValue("BILICLEANER_video-next-play-whitelist-filter-status", true);
	let isEndingWhitelistEnable = _GM_getValue("BILICLEANER_video-ending-whitelist-filter-status", true);
	if(isPageVideo() || isPagePlaylist()) {
		let videoListContainer;
		const rcmdSelectorFunc = {
			duration: (video) => {
				var _a;
				const duration = (_a = video.querySelector(".pic-box span.duration")) == null ? void 0 : _a.textContent;
				return duration ? duration : null;
			},
			titleKeyword: (video) => {
				var _a, _b;
				const titleKeyword = ((_a = video.querySelector(".info > a p")) == null ? void 0 : _a.getAttribute("title")) || ((_b = video.querySelector(".info > a p")) == null ? void 0 : _b.textContent);
				return titleKeyword ? titleKeyword : null;
			},
			bvid: (video) => {
				var _a, _b;
				const href2 = ((_a = video.querySelector(".info > a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector(".pic-box .framepreview-box > a")) == null ? void 0 : _b.getAttribute("href"));
				if(href2) {
					return matchBvid(href2);
				}
				return null;
			},
			uploader: (video) => {
				var _a, _b;
				const uploader = (_b = (_a = video.querySelector(".info > .upname .name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				return uploader ? uploader : null;
			}
		};
		const nextSelectorFunc = rcmdSelectorFunc;
		const checkVideoList = (_fullSite) => {
			if(!videoListContainer) {
				debugVideoFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				const nextVideos = videoListContainer.querySelectorAll(`.next-play .video-page-card-small, .next-play .video-page-operator-card-small`);
				const rcmdVideos = videoListContainer.querySelectorAll(`.rec-list .video-page-card-small, .rec-list .video-page-operator-card-small, .recommend-video-card`);
				rcmdVideos.length && coreVideoFilterInstance.checkAll([...rcmdVideos], false, rcmdSelectorFunc);
				if(isNextPlayWhitelistEnable) {
					nextVideos.forEach((video) => showEle(video));
				} else {
					nextVideos.length && coreVideoFilterInstance.checkAll([...nextVideos], false, nextSelectorFunc);
				}
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const videoDurationAction = new DurationAction("video-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const videoUploaderAction = new UploaderAction("video-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const videoUploaderKeywordAction = new UploaderKeywordAction("video-uploader-keyword-filter-status", "global-uploader-keyword-filter-value", checkVideoList);
		const videoBvidAction = new BvidAction("video-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const videoTitleKeywordAction = new TitleKeywordAction("video-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const videoUploaderWhitelistAction = new UploaderWhitelistAction("video-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const videoTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("video-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const watchVideoListContainer = () => {
			const check = async (fullSite) => {
				if(videoDurationAction.status || videoUploaderAction.status || videoUploaderKeywordAction.status || videoBvidAction.status || videoTitleKeywordAction.status) {
					checkVideoList();
				}
			};
			if(videoListContainer) {
				check().then().catch();
				const videoObserver = new MutationObserver(() => {
					check().then().catch();
				});
				videoObserver.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugVideoFilter("watchVideoListContainer OK");
			}
		};
		const watchPlayerEnding = () => {
			if(isEndingWhitelistEnable) {
				return;
			}
			const video = document.querySelector("video");
			if(!video) {
				return;
			}
			const check = () => {
				const rightList = document.querySelectorAll(`.next-play .video-page-card-small,
.next-play .video-page-operator-card-small,
.rec-list .video-page-card-small,
.rec-list .video-page-operator-card-small,
.recommend-video-card`);
				const blacklistVideoTitle = /* @__PURE__ */ new Set();
				rightList.forEach((video2) => {
					var _a, _b;
					if(isEleHide(video2)) {
						const title = ((_a = video2.querySelector(".info > a p")) == null ? void 0 : _a.getAttribute("title")) || ((_b = video2.querySelector(".info > a p")) == null ? void 0 : _b.textContent);
						title && blacklistVideoTitle.add(title);
					}
				});
				let cnt = 0;
				const endingInterval = setInterval(() => {
					const endingVideos = document.querySelectorAll(".bpx-player-ending-related-item");
					if(endingVideos.length > 0) {
						endingVideos.forEach((video2) => {
							var _a, _b;
							const title = (_b = (_a = video2.querySelector(".bpx-player-ending-related-item-title")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
							if(title && blacklistVideoTitle.has(title)) {
								hideEle(video2);
							} else {
								showEle(video2);
							}
						});
						clearInterval(endingInterval);
					} else {
						cnt++;
						if(cnt > 100) {
							clearInterval(endingInterval);
						}
					}
				}, 10);
			};
			video.ended ? check() : video.addEventListener("ended", check);
		};
		try {
			waitForEle(document, "#reco_list, .recommend-list-container", (node) => {
				return node.id === "reco_list" || node.className === "recommend-list-container";
			}).then((ele) => {
				if(ele) {
					videoListContainer = ele;
					watchVideoListContainer();
				}
			});
			document.addEventListener("DOMContentLoaded", watchPlayerEnding);
		} catch (err) {
			error(err);
			error(`watch video list ERROR`);
		}
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$5) {
				return;
			}
			isContextMenuFuncRunning$5 = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
				menu.hide();
				if(e.target instanceof HTMLElement) {
					const target = e.target;
					if(isContextMenuUploaderEnable$3 && (target.classList.contains("name") || target.classList.contains("up-name") || ((_a = target.parentElement) == null ? void 0 : _a.classList.contains("up-name")) || target.closest(".staff-info"))) {
						const uploader = ((_d = (_c = (_b = target.closest(".staff-info")) == null ? void 0 : _b.querySelector(".staff-name")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim()) || ((_e = target.textContent) == null ? void 0 : _e.trim()) || ((_g = (_f = target.parentElement) == null ? void 0 : _f.textContent) == null ? void 0 : _g.trim());
						if(uploader) {
							e.preventDefault();
							menu.registerMenu(`◎ 屏蔽UP主：${uploader}`, () => {
								videoUploaderAction.add(uploader);
							});
							menu.registerMenu(`◎ 将UP主加入白名单`, () => {
								videoUploaderWhitelistAction.add(uploader);
							});
							const url = (_i = (_h = target.closest(".upname")) == null ? void 0 : _h.querySelector(":scope a")) == null ? void 0 : _i.getAttribute("href");
							if(url) {
								const matches = url.match(/space\.bilibili\.com\/\d+/g);
								matches && menu.registerMenu(`◎ 复制主页链接`, () => {
									navigator.clipboard.writeText(`https://${matches[0]}`).then().catch();
								});
							}
							menu.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable$3 && target.classList.contains("title")) {
						const href2 = (_j = target.parentElement) == null ? void 0 : _j.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								menu.registerMenu(`◎ 屏蔽视频 ${bvid}`, () => {
									videoBvidAction.add(bvid);
								});
								menu.registerMenu(`◎ 复制视频链接`, () => {
									navigator.clipboard.writeText(`https://www.bilibili.com/video/${bvid}`).then().catch();
								});
								menu.show(e.clientX, e.clientY);
							}
						}
					} else {
						menu.hide();
					}
				}
			});
			debugVideoFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			// 启用 播放页时长过滤
			new CheckboxItem({
				itemID: videoDurationAction.statusKey,
				description: "启用 时长过滤",
				enableFunc: async () => {
					videoDurationAction.enable();
				},
				disableFunc: async () => {
					videoDurationAction.disable();
				}
			}),
			// 设定最低时长
			new NumberItem({
				itemID: videoDurationAction.valueKey,
				description: "设定最低时长 (0~300s)",
				defaultValue: 60,
				minValue: 0,
				maxValue: 300,
				disableValue: 0,
				unit: "秒",
				callback: async (value) => {
					videoDurationAction.change(value);
				}
			})
		];
		videoPageVideoFilterGroupList.push(new Group("video-duration-filter-group", "播放页 时长过滤", durationItems));
		const uploaderItems = [
			// 启用 播放页UP主过滤
			new CheckboxItem({
				itemID: videoUploaderAction.statusKey,
				description: "启用 UP主过滤 (右键单击UP主)",
				enableFunc: async () => {
					isContextMenuUploaderEnable$3 = true;
					contextMenuFunc();
					videoUploaderAction.enable();
				},
				disableFunc: async () => {
					isContextMenuUploaderEnable$3 = false;
					videoUploaderAction.disable();
				}
			}),
			// 编辑 UP主黑名单
			new ButtonItem({
				itemID: "video-uploader-edit-button",
				description: "编辑 UP主黑名单",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: async () => {
					videoUploaderAction.blacklist.show();
				}
			}),
			// 启用 UP主昵称关键词过滤
			new CheckboxItem({
				itemID: videoUploaderKeywordAction.statusKey,
				description: "启用 UP主昵称关键词过滤",
				enableFunc: async () => {
					videoUploaderKeywordAction.enable();
				},
				disableFunc: async () => {
					videoUploaderKeywordAction.disable();
				}
			}),
			// 编辑 UP主昵称关键词黑名单
			new ButtonItem({
				itemID: "video-uploader-keyword-edit-button",
				description: "编辑 UP主昵称关键词黑名单",
				name: "编辑",
				itemFunc: async () => {
					videoUploaderKeywordAction.blacklist.show();
				}
			})
		];
		videoPageVideoFilterGroupList.push(new Group("video-uploader-filter-group", "播放页 UP主过滤", uploaderItems));
		const titleKeywordItems = [
			// 启用 播放页关键词过滤
			new CheckboxItem({
				itemID: videoTitleKeywordAction.statusKey,
				description: "启用 标题关键词过滤",
				enableFunc: async () => {
					videoTitleKeywordAction.enable();
				},
				disableFunc: async () => {
					videoTitleKeywordAction.disable();
				}
			}),
			// 编辑 关键词黑名单
			new ButtonItem({
				itemID: "video-title-keyword-edit-button",
				description: "编辑 标题关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: async () => {
					videoTitleKeywordAction.blacklist.show();
				}
			})
		];
		videoPageVideoFilterGroupList.push(new Group("video-title-keyword-filter-group", "播放页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 播放页 BV号过滤
			new CheckboxItem({
				itemID: videoBvidAction.statusKey,
				description: "启用 BV号过滤 (右键单击标题)",
				enableFunc: async () => {
					isContextMenuBvidEnable$3 = true;
					contextMenuFunc();
					videoBvidAction.enable();
				},
				disableFunc: async () => {
					isContextMenuBvidEnable$3 = false;
					videoBvidAction.disable();
				}
			}),
			// 编辑 BV号黑名单
			new ButtonItem({
				itemID: "video-bvid-edit-button",
				description: "编辑 BV号黑名单",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: async () => {
					videoBvidAction.blacklist.show();
				}
			})
		];
		videoPageVideoFilterGroupList.push(new Group("video-bvid-filter-group", "播放页 BV号过滤", bvidItems));
		const whitelistItems = [
			// 接下来播放 免过滤
			new CheckboxItem({
				itemID: "video-next-play-whitelist-filter-status",
				description: "接下来播放 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isNextPlayWhitelistEnable = true;
					checkVideoList();
				},
				disableFunc: async () => {
					isNextPlayWhitelistEnable = false;
					checkVideoList();
				}
			}),
			// 视频播放结束推荐 免过滤
			new CheckboxItem({
				itemID: "video-ending-whitelist-filter-status",
				description: "视频播放结束推荐 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isEndingWhitelistEnable = true;
					document.querySelectorAll(".bpx-player-ending-related-item").forEach((e) => showEle(e));
				},
				disableFunc: async () => {
					isEndingWhitelistEnable = false;
					watchPlayerEnding();
				}
			}),
			// 启用 播放页UP主白名单
			new CheckboxItem({
				itemID: videoUploaderWhitelistAction.statusKey,
				description: "启用 UP主白名单",
				enableFunc: async () => {
					videoUploaderWhitelistAction.enable();
				},
				disableFunc: async () => {
					videoUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "video-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: async () => {
					videoUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 播放页关键词白名单
			new CheckboxItem({
				itemID: videoTitleKeywordWhitelistAction.statusKey,
				description: "启用 标题关键词白名单",
				enableFunc: async () => {
					videoTitleKeywordWhitelistAction.enable();
				},
				disableFunc: async () => {
					videoTitleKeywordWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "video-title-keyword-whitelist-edit-button",
				description: "编辑 标题关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: async () => {
					videoTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		videoPageVideoFilterGroupList.push(new Group("video-whitelist-filter-group", "播放页 白名单设定 (免过滤)", whitelistItems));
	}
	const popularPageVideoFilterGroupList = [];
	let isContextMenuFuncRunning$4 = false;
	let isContextMenuUploaderEnable$2 = false;
	let isContextMenuBvidEnable$2 = false;
	if(isPagePopular()) {
		const videoInfoMap = /* @__PURE__ */ new Map();
		let apiResp = void 0;
		const origFetch = _unsafeWindow.fetch;
		_unsafeWindow.fetch = async (input, init2) => {
			var _a;
			if(typeof input === "string" && input.includes("api.bilibili.com") && ((_a = init2 == null ? void 0 : init2.method) == null ? void 0 : _a.toUpperCase()) === "GET") {
				if(input.match(/web-interface\/(ranking|popular\/series\/one|popular\?ps)/)) {
					const resp = await origFetch(input, init2);
					apiResp = resp.clone();
					return resp;
				}
			}
			return origFetch(input, init2);
		};
		const parseResp = async () => {
			await (apiResp == null ? void 0 : apiResp.clone().json().then((json) => {
				json.data.list.forEach((v) => {
					const bvid = v.bvid;
					if(bvid && !videoInfoMap.has(bvid)) {
						videoInfoMap.set(bvid, {
							duration: v.duration,
							dimension: v.dimension.width > v.dimension.height,
							like: v.stat.like,
							coin: v.stat.coin
						});
					}
				});
			}).catch((err) => {
				error("Error parsing JSON:", err);
			}).finally(() => {
				apiResp = void 0;
			}));
		};
		let videoListContainer;
		const hotSelectorFunc = {
			titleKeyword: (video) => {
				var _a, _b, _c, _d;
				const titleKeyword = ((_a = video.querySelector(".video-card__info .video-name")) == null ? void 0 : _a.getAttribute("title")) || ((_b = video.querySelector(".video-card__info .video-name")) == null ? void 0 : _b.textContent) || ((_c = video.querySelector(".info a.title")) == null ? void 0 : _c.getAttribute("title")) || ((_d = video.querySelector(".info a.title")) == null ? void 0 : _d.textContent);
				return titleKeyword ? titleKeyword : null;
			},
			bvid: (video) => {
				var _a, _b;
				const href2 = ((_a = video.querySelector(".video-card__content > a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector(".content > .img > a")) == null ? void 0 : _b.getAttribute("href"));
				if(href2) {
					return matchBvid(href2);
				}
				return null;
			},
			uploader: (video) => {
				var _a, _b, _c;
				const uploader = ((_a = video.querySelector("span.up-name__text")) == null ? void 0 : _a.textContent) || ((_b = video.querySelector("span.up-name__text")) == null ? void 0 : _b.getAttribute("title")) || ((_c = video.querySelector(".data-box.up-name")) == null ? void 0 : _c.textContent);
				return uploader ? uploader : null;
			},
			duration: (video) => {
				var _a, _b, _c, _d;
				const href2 = ((_a = video.querySelector(".video-card__content > a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector(".content > .img > a")) == null ? void 0 : _b.getAttribute("href"));
				if(href2) {
					const bvid = matchBvid(href2);
					if(bvid) {
						return ((_d = (_c = videoInfoMap.get(bvid)) == null ? void 0 : _c.duration) == null ? void 0 : _d.toString()) || null;
					}
				}
				return null;
			},
			coinLikeRatio: (video) => {
				var _a, _b, _c, _d;
				const href2 = ((_a = video.querySelector(".video-card__content > a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector(".content > .img > a")) == null ? void 0 : _b.getAttribute("href"));
				if(href2) {
					const bvid = matchBvid(href2);
					if(bvid) {
						const coin = (_c = videoInfoMap.get(bvid)) == null ? void 0 : _c.coin;
						const like = (_d = videoInfoMap.get(bvid)) == null ? void 0 : _d.like;
						return coin && like ? coin / like : null;
					}
				}
				return null;
			},
			dimension: (video) => {
				var _a, _b, _c;
				const href2 = ((_a = video.querySelector(".video-card__content > a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector(".content > .img > a")) == null ? void 0 : _b.getAttribute("href"));
				if(href2) {
					const bvid = matchBvid(href2);
					if(bvid) {
						const d = (_c = videoInfoMap.get(bvid)) == null ? void 0 : _c.dimension;
						return typeof d === "boolean" ? d : null;
					}
				}
				return null;
			}
		};
		const checkVideoList = (fullSite) => {
			if(!videoListContainer) {
				debugVideoFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				let hotVideos;
				let weeklyVideos;
				let rankVideos;
				if(!fullSite) {
					hotVideos = videoListContainer.querySelectorAll(`.card-list .video-card:not([${settings.filterSign}])`);
					weeklyVideos = videoListContainer.querySelectorAll(`.video-list .video-card:not([${settings.filterSign}])`);
					rankVideos = videoListContainer.querySelectorAll(`.rank-list .rank-item:not([${settings.filterSign}])`);
				} else {
					hotVideos = videoListContainer.querySelectorAll(`.card-list .video-card`);
					weeklyVideos = videoListContainer.querySelectorAll(`.video-list .video-card`);
					rankVideos = videoListContainer.querySelectorAll(`.rank-list .rank-item`);
				}
				hotVideos.length && coreVideoFilterInstance.checkAll([...hotVideos], false, hotSelectorFunc);
				weeklyVideos.length && coreVideoFilterInstance.checkAll([...weeklyVideos], false, hotSelectorFunc);
				rankVideos.length && coreVideoFilterInstance.checkAll([...rankVideos], false, hotSelectorFunc);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const popularDurationAction = new DurationAction("popular-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const popularQualityAction = new QualityAction("popular-quality-filter-status", "global-quality-filter-value", checkVideoList);
		const popularDimensionAction = new DimensionAction("popular-dimension-filter-status", checkVideoList);
		const popularUploaderAction = new UploaderAction("popular-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const popularUploaderKeywordAction = new UploaderKeywordAction("popular-uploader-keyword-filter-status", "global-uploader-keyword-filter-value", checkVideoList);
		const popularBvidAction = new BvidAction("popular-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const popularTitleKeywordAction = new TitleKeywordAction("popular-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const popularUploaderWhitelistAction = new UploaderWhitelistAction("popular-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const popularTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("popular-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const watchVideoListContainer = async () => {
			const check = async (fullSite) => {
				if(popularDurationAction.status || popularUploaderAction.status || popularQualityAction.status || popularDimensionAction.status || popularUploaderKeywordAction.status || popularBvidAction.status || popularTitleKeywordAction.status) {
					if(location.pathname.match(/\/v\/popular\/(?:all|rank|weekly)/)) {
						popularDurationAction.status || popularQualityAction.status || popularDimensionAction.status ? await parseResp() : parseResp().then().catch();
					}
					checkVideoList(fullSite);
				}
			};
			if(videoListContainer) {
				check(true).then().catch();
				const videoObserver = new MutationObserver(async () => {
					check(true).then().catch();
				});
				videoObserver.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugVideoFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, "#app", (node) => {
				return node.id === "app";
			}).then((ele) => {
				if(ele) {
					videoListContainer = ele;
					watchVideoListContainer().then().catch();
				}
			});
		} catch (err) {
			error(err);
			error(`watch video list ERROR`);
		}
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$4) {
				return;
			}
			isContextMenuFuncRunning$4 = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
				menu.hide();
				if(e.target instanceof HTMLElement) {
					const target = e.target;
					if(isContextMenuUploaderEnable$2 && (target.classList.contains("up-name__text") || target.classList.contains("up-name"))) {
						const uploader = target.textContent;
						if(uploader) {
							e.preventDefault();
							const onclickBlack = () => {
								popularUploaderAction.add(uploader);
							};
							const onclickWhite = () => {
								popularUploaderWhitelistAction.add(uploader);
							};
							menu.registerMenu(`◎ 屏蔽UP主：${uploader}`, onclickBlack);
							menu.registerMenu(`◎ 将UP主加入白名单`, onclickWhite);
							menu.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable$2 && (target.classList.contains("title") && target.closest(".info a") === target || target.classList.contains("video-name") || target.classList.contains("lazy-image"))) {
						let href2 = target.getAttribute("href") || ((_a = target.parentElement) == null ? void 0 : _a.getAttribute("href"));
						if(!href2) {
							href2 = (_c = (_b = target.closest(".video-card")) == null ? void 0 : _b.querySelector(".video-card__content > a")) == null ? void 0 : _c.getAttribute("href");
						}
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								const onclick = () => {
									popularBvidAction.add(bvid);
								};
								menu.registerMenu(`屏蔽视频 ${bvid}`, onclick);
								menu.show(e.clientX, e.clientY);
							}
						}
					} else {
						menu.hide();
					}
				}
			});
		};
		const durationItems = [
			new CheckboxItem({
				itemID: popularDurationAction.statusKey,
				description: "启用 时长过滤 (刷新)",
				enableFunc: async () => {
					popularDurationAction.enable();
				},
				disableFunc: async () => {
					popularDurationAction.disable();
				}
			}),
			new NumberItem({
				itemID: popularDurationAction.valueKey,
				description: "设定最低时长 (0~300s)",
				defaultValue: 60,
				minValue: 0,
				maxValue: 300,
				disableValue: 0,
				unit: "秒",
				callback: async (value) => {
					popularDurationAction.change(value);
				}
			})
		];
		popularPageVideoFilterGroupList.push(new Group("popular-duration-filter-group", "热门页 时长过滤", durationItems));
		const qualityItems = [
			new CheckboxItem({
				itemID: popularDimensionAction.statusKey,
				description: "启用 竖屏视频过滤 (刷新)",
				enableFunc: async () => {
					popularDimensionAction.enable();
				},
				disableFunc: async () => {
					popularDimensionAction.disable();
				}
			}),
			new CheckboxItem({
				itemID: popularQualityAction.statusKey,
				description: "启用 劣质视频过滤 (刷新)",
				enableFunc: async () => {
					popularQualityAction.enable();
				},
				disableFunc: async () => {
					popularQualityAction.disable();
				}
			}),
			new NumberItem({
				itemID: popularQualityAction.valueKey,
				description: "劣质视频过滤百分比 (0~80%)",
				defaultValue: 25,
				minValue: 0,
				maxValue: 80,
				disableValue: 0,
				unit: "%",
				callback: async (value) => {
					popularQualityAction.change(value);
				}
			})
		];
		popularPageVideoFilterGroupList.push(new Group("popular-quality-filter-group", "热门页 视频质量过滤 (实验功能)", qualityItems));
		const uploaderItems = [
			// 启用 热门页 UP主过滤
			new CheckboxItem({
				itemID: popularUploaderAction.statusKey,
				description: "启用 UP主过滤 (右键单击UP主)",
				enableFunc: async () => {
					isContextMenuUploaderEnable$2 = true;
					contextMenuFunc();
					popularUploaderAction.enable();
				},
				disableFunc: async () => {
					isContextMenuUploaderEnable$2 = false;
					popularUploaderAction.disable();
				}
			}),
			// 按钮功能：打开uploader黑名单编辑框
			new ButtonItem({
				itemID: "popular-uploader-edit-button",
				description: "编辑 UP主黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					popularUploaderAction.blacklist.show();
				}
			}),
			// 启用 UP主昵称关键词过滤
			new CheckboxItem({
				itemID: popularUploaderKeywordAction.statusKey,
				description: "启用 UP主昵称关键词过滤",
				enableFunc: async () => {
					popularUploaderKeywordAction.enable();
				},
				disableFunc: async () => {
					popularUploaderKeywordAction.disable();
				}
			}),
			// 编辑 UP主昵称关键词黑名单
			new ButtonItem({
				itemID: "popular-uploader-keyword-edit-button",
				description: "编辑 UP主昵称关键词黑名单",
				name: "编辑",
				itemFunc: async () => {
					popularUploaderKeywordAction.blacklist.show();
				}
			})
		];
		popularPageVideoFilterGroupList.push(new Group("popular-uploader-filter-group", "热门页 UP主过滤", uploaderItems));
		const titleKeywordItems = [
			// 启用 热门页 关键词过滤
			new CheckboxItem({
				itemID: popularTitleKeywordAction.statusKey,
				description: "启用 标题关键词过滤",
				enableFunc: async () => {
					popularTitleKeywordAction.enable();
				},
				disableFunc: async () => {
					popularTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "popular-title-keyword-edit-button",
				description: "编辑 标题关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					popularTitleKeywordAction.blacklist.show();
				}
			})
		];
		popularPageVideoFilterGroupList.push(new Group("popular-title-keyword-filter-group", "热门页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 热门页 BV号过滤
			new CheckboxItem({
				itemID: popularBvidAction.statusKey,
				description: "启用 BV号过滤 (右键单击标题)",
				enableFunc: async () => {
					isContextMenuBvidEnable$2 = true;
					contextMenuFunc();
					popularBvidAction.enable();
				},
				disableFunc: async () => {
					isContextMenuBvidEnable$2 = false;
					popularBvidAction.disable();
				}
			}),
			// 按钮功能：打开bvid黑名单编辑框
			new ButtonItem({
				itemID: "popular-bvid-edit-button",
				description: "编辑 BV号黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					popularBvidAction.blacklist.show();
				}
			})
		];
		popularPageVideoFilterGroupList.push(new Group("popular-bvid-filter-group", "热门页 BV号过滤", bvidItems));
		const whitelistItems = [
			// 启用 热门页 UP主白名单
			new CheckboxItem({
				itemID: popularUploaderWhitelistAction.statusKey,
				description: "启用 UP主白名单 (右键单击UP主)",
				enableFunc: async () => {
					popularUploaderWhitelistAction.enable();
				},
				disableFunc: async () => {
					popularUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "popular-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					popularUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 热门页 标题关键词白名单
			new CheckboxItem({
				itemID: popularTitleKeywordWhitelistAction.statusKey,
				description: "启用 标题关键词白名单",
				enableFunc: async () => {
					popularTitleKeywordWhitelistAction.enable();
				},
				disableFunc: async () => {
					popularTitleKeywordWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "popular-title-keyword-whitelist-edit-button",
				description: "编辑 标题关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					popularTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		popularPageVideoFilterGroupList.push(new Group("popular-whitelist-filter-group", "热门页 白名单设定 (免过滤)", whitelistItems));
	}
	const searchPageVideoFilterGroupList = [];
	let isContextMenuFuncRunning$3 = false;
	let isContextMenuUploaderEnable$1 = false;
	let isContextMenuBvidEnable$1 = false;
	let isTopUploaderWhitelistEnable = _GM_getValue("BILICLEANER_search-top-uploader-whitelist-filter-status", true);
	if(isPageSearch()) {
		let videoListContainer;
		const searchSelectorFunc = {
			duration: (video) => {
				var _a;
				const duration = (_a = video.querySelector("span.bili-video-card__stats__duration")) == null ? void 0 : _a.textContent;
				return duration ? duration : null;
			},
			titleKeyword: (video) => {
				var _a, _b;
				const titleKeyword = ((_a = video.querySelector("h3.bili-video-card__info--tit")) == null ? void 0 : _a.textContent) || ((_b = video.querySelector("h3.bili-video-card__info--tit")) == null ? void 0 : _b.getAttribute("title"));
				return titleKeyword ? titleKeyword : null;
			},
			bvid: (video) => {
				var _a, _b;
				const href2 = ((_a = video.querySelector(".bili-video-card__wrap > a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector(".bili-video-card__info--right > a")) == null ? void 0 : _b.getAttribute("href"));
				if(href2) {
					return matchBvid(href2);
				}
				return null;
			},
			uploader: (video) => {
				var _a;
				const uploader = (_a = video.querySelector("span.bili-video-card__info--author")) == null ? void 0 : _a.textContent;
				return uploader ? uploader : null;
			}
		};
		const checkVideoList = (_fullSite) => {
			if(!videoListContainer) {
				debugVideoFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				const topVideos = [...videoListContainer.querySelectorAll(`.user-video-info .video-list > .video-list-item`)];
				const contentVideos = [...videoListContainer.querySelectorAll(`.video.search-all-list .video-list > div, .search-page-video .video-list > div`)];
				if(isTopUploaderWhitelistEnable) {
					topVideos.forEach((video) => showEle(video));
				} else {
					topVideos.length && coreVideoFilterInstance.checkAll(topVideos, false, searchSelectorFunc);
					debugVideoFilter(`checkVideoList check ${topVideos.length} top videos`);
				}
				contentVideos.length && coreVideoFilterInstance.checkAll(contentVideos, false, searchSelectorFunc);
				debugVideoFilter(`checkVideoList check ${contentVideos.length} content videos`);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const searchDurationAction = new DurationAction("search-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const searchUploaderAction = new UploaderAction("search-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const searchUploaderKeywordAction = new UploaderKeywordAction("search-uploader-keyword-filter-status", "global-uploader-keyword-filter-value", checkVideoList);
		const searchBvidAction = new BvidAction("search-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const searchTitleKeywordAction = new TitleKeywordAction("search-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const searchUploaderWhitelistAction = new UploaderWhitelistAction("search-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const searchTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("search-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const watchVideoListContainer = () => {
			const check = async (fullSite) => {
				if(searchDurationAction.status || searchUploaderAction.status || searchUploaderKeywordAction.status || searchBvidAction.status || searchTitleKeywordAction.status) {
					checkVideoList();
				}
			};
			if(videoListContainer) {
				check().then().catch();
				const videoObserver = new MutationObserver(() => {
					check().then().catch();
				});
				videoObserver.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugVideoFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, ".search-content", (node) => {
				return node.className.includes("search-content");
			}).then((ele) => {
				if(ele) {
					videoListContainer = ele;
					watchVideoListContainer();
				}
			});
		} catch (err) {
			error(err);
			error(`watch video list ERROR`);
		}
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$3) {
				return;
			}
			isContextMenuFuncRunning$3 = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
				menu.hide();
				if(e.target instanceof HTMLElement) {
					debugVideoFilter(e.target.classList);
					if(isContextMenuUploaderEnable$1 && e.target.closest(".bili-video-card__info--owner")) {
						const node = (_a = e.target.closest(".bili-video-card__info--owner")) == null ? void 0 : _a.querySelector(".bili-video-card__info--author");
						const uploader = node == null ? void 0 : node.textContent;
						if(uploader) {
							e.preventDefault();
							menu.registerMenu(`◎ 屏蔽UP主：${uploader}`, () => {
								searchUploaderAction.add(uploader);
							});
							menu.registerMenu(`◎ 将UP主加入白名单`, () => {
								searchUploaderWhitelistAction.add(uploader);
							});
							menu.registerMenu(`◎ 复制主页链接`, () => {
								var _a2;
								const url = (_a2 = node.closest(".bili-video-card__info--owner")) == null ? void 0 : _a2.getAttribute("href");
								if(url) {
									const matches = url.match(/space\.bilibili\.com\/\d+/g);
									matches && navigator.clipboard.writeText(`https://${matches[0]}`);
								}
							});
							menu.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable$1 && e.target.closest(".bili-video-card__info--tit")) {
						const href2 = (_c = (_b = e.target.closest(".bili-video-card__info--right")) == null ? void 0 : _b.querySelector(":scope > a")) == null ? void 0 : _c.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								menu.registerMenu(`◎ 屏蔽视频 ${bvid}`, () => {
									searchBvidAction.add(bvid);
								});
								menu.registerMenu(`◎ 复制视频链接`, () => {
									navigator.clipboard.writeText(`https://www.bilibili.com/video/${bvid}`).then().catch();
								});
								menu.show(e.clientX, e.clientY);
							}
						}
					} else {
						menu.hide();
					}
				}
			});
			debugVideoFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			new CheckboxItem({
				itemID: searchDurationAction.statusKey,
				description: "启用 时长过滤",
				enableFunc: async () => {
					searchDurationAction.enable();
				},
				disableFunc: async () => {
					searchDurationAction.disable();
				}
			}),
			new NumberItem({
				itemID: searchDurationAction.valueKey,
				description: "设定最低时长 (0~300s)",
				defaultValue: 60,
				minValue: 0,
				maxValue: 300,
				disableValue: 0,
				unit: "秒",
				callback: async (value) => {
					searchDurationAction.change(value);
				}
			})
		];
		searchPageVideoFilterGroupList.push(new Group("search-duration-filter-group", "搜索页 时长过滤", durationItems));
		const uploaderItems = [
			new CheckboxItem({
				itemID: searchUploaderAction.statusKey,
				description: "启用 UP主过滤 (右键单击UP主)",
				enableFunc: async () => {
					isContextMenuUploaderEnable$1 = true;
					contextMenuFunc();
					searchUploaderAction.enable();
				},
				disableFunc: async () => {
					isContextMenuUploaderEnable$1 = false;
					searchUploaderAction.disable();
				}
			}),
			// 按钮功能：打开uploader黑名单编辑框
			new ButtonItem({
				itemID: "search-uploader-edit-button",
				description: "编辑 UP主黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					searchUploaderAction.blacklist.show();
				}
			}),
			// 启用 UP主昵称关键词过滤
			new CheckboxItem({
				itemID: searchUploaderKeywordAction.statusKey,
				description: "启用 UP主昵称关键词过滤",
				enableFunc: async () => {
					searchUploaderKeywordAction.enable();
				},
				disableFunc: async () => {
					searchUploaderKeywordAction.disable();
				}
			}),
			// 编辑 UP主昵称关键词黑名单
			new ButtonItem({
				itemID: "search-uploader-keyword-edit-button",
				description: "编辑 UP主昵称关键词黑名单",
				name: "编辑",
				itemFunc: async () => {
					searchUploaderKeywordAction.blacklist.show();
				}
			})
		];
		searchPageVideoFilterGroupList.push(new Group("search-uploader-filter-group", "搜索页 UP主过滤", uploaderItems));
		const titleKeywordItems = [
			new CheckboxItem({
				itemID: searchTitleKeywordAction.statusKey,
				description: "启用 标题关键词过滤",
				enableFunc: async () => {
					searchTitleKeywordAction.enable();
				},
				disableFunc: async () => {
					searchTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "search-title-keyword-edit-button",
				description: "编辑 标题关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					searchTitleKeywordAction.blacklist.show();
				}
			})
		];
		searchPageVideoFilterGroupList.push(new Group("search-title-keyword-filter-group", "搜索页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			new CheckboxItem({
				itemID: searchBvidAction.statusKey,
				description: "启用 BV号过滤 (右键单击标题)",
				enableFunc: async () => {
					isContextMenuBvidEnable$1 = true;
					contextMenuFunc();
					searchBvidAction.enable();
				},
				disableFunc: async () => {
					isContextMenuBvidEnable$1 = false;
					searchBvidAction.disable();
				}
			}),
			// 按钮功能：打开bvid黑名单编辑框
			new ButtonItem({
				itemID: "search-bvid-edit-button",
				description: "编辑 BV号黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					searchBvidAction.blacklist.show();
				}
			})
		];
		searchPageVideoFilterGroupList.push(new Group("search-bvid-filter-group", "搜索页 BV号过滤", bvidItems));
		const whitelistItems = [
			// 顶部匹配UP主 免过滤, 默认开启
			new CheckboxItem({
				itemID: "search-top-uploader-whitelist-filter-status",
				description: "搜索结果顶部UP主视频免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isTopUploaderWhitelistEnable = true;
					checkVideoList();
				},
				disableFunc: async () => {
					isTopUploaderWhitelistEnable = false;
					checkVideoList();
				}
			}),
			new CheckboxItem({
				itemID: searchUploaderWhitelistAction.statusKey,
				description: "启用 UP主白名单",
				enableFunc: async () => {
					searchUploaderWhitelistAction.enable();
				},
				disableFunc: async () => {
					searchUploaderWhitelistAction.disable();
				}
			}),
			new ButtonItem({
				itemID: "search-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					searchUploaderWhitelistAction.whitelist.show();
				}
			}),
			new CheckboxItem({
				itemID: searchTitleKeywordWhitelistAction.statusKey,
				description: "启用 标题关键词白名单",
				enableFunc: async () => {
					searchTitleKeywordWhitelistAction.enable();
				},
				disableFunc: async () => {
					searchTitleKeywordWhitelistAction.disable();
				}
			}),
			new ButtonItem({
				itemID: "search-title-keyword-whitelist-edit-button",
				description: "编辑 标题关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					searchTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		searchPageVideoFilterGroupList.push(new Group("search-whitelist-filter-group", "搜索页 白名单设定 (免过滤)", whitelistItems));
	}
	const channelPageVideoFilterGroupList = [];
	let isContextMenuFuncRunning$2 = false;
	let isContextMenuUploaderEnable = false;
	let isContextMenuBvidEnable = false;
	if(isPageChannel()) {
		let videoListContainer;
		const feedSelectorFunc = {
			duration: (video) => {
				var _a;
				const duration = (_a = video.querySelector("span.bili-video-card__stats__duration")) == null ? void 0 : _a.textContent;
				return duration ? duration : null;
			},
			titleKeyword: (video) => {
				var _a, _b;
				const titleKeyword = ((_a = video.querySelector("h3.bili-video-card__info--tit")) == null ? void 0 : _a.getAttribute("title")) || ((_b = video.querySelector("h3.bili-video-card__info--tit a")) == null ? void 0 : _b.textContent);
				return titleKeyword ? titleKeyword : null;
			},
			bvid: (video) => {
				var _a, _b;
				const href2 = ((_a = video.querySelector("h3.bili-video-card__info--tit a")) == null ? void 0 : _a.getAttribute("href")) || ((_b = video.querySelector("a.bili-video-card__image--link")) == null ? void 0 : _b.getAttribute("href"));
				return href2 ? matchBvid(href2) : null;
			},
			uploader: (video) => {
				var _a;
				const uploader = (_a = video.querySelector("span.bili-video-card__info--author")) == null ? void 0 : _a.textContent;
				return uploader ? uploader : null;
			}
		};
		const checkVideoList = (fullSite) => {
			if(!videoListContainer) {
				debugVideoFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				let feedVideos;
				if(!fullSite) {
					feedVideos = [...videoListContainer.querySelectorAll(`.bili-grid .video-card-body .bili-video-card:not([${settings.filterSign}]),
.feed-card-body .bili-video-card:not([${settings.filterSign}])`)];
				} else {
					feedVideos = [...videoListContainer.querySelectorAll(`.bili-grid .video-card-body .bili-video-card,
.feed-card-body .bili-video-card`)];
				}
				feedVideos.length && coreVideoFilterInstance.checkAll(feedVideos, true, feedSelectorFunc);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const channelDurationAction = new DurationAction("channel-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const channelUploaderAction = new UploaderAction("channel-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const channelUploaderKeywordAction = new UploaderKeywordAction("channel-uploader-keyword-filter-status", "global-uploader-keyword-filter-value", checkVideoList);
		const channelBvidAction = new BvidAction("channel-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const channelTitleKeywordAction = new TitleKeywordAction("channel-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const channelUploaderWhitelistAction = new UploaderWhitelistAction("channel-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const channelTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("channel-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const watchVideoListContainer = () => {
			const check = async (fillSite) => {
				if(channelDurationAction.status || channelUploaderAction.status || channelUploaderKeywordAction.status || channelBvidAction.status || channelTitleKeywordAction.status) {
					checkVideoList(fillSite);
				}
			};
			if(videoListContainer) {
				check(true).then().catch();
				const videoObserver = new MutationObserver(() => {
					check(false).then().catch();
				});
				videoObserver.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugVideoFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, "main.channel-layout", (node) => {
				return node.className === "channel-layout";
			}).then((ele) => {
				if(ele) {
					videoListContainer = ele;
					watchVideoListContainer();
				}
			});
		} catch (err) {
			error(err);
			error(`watch video list ERROR`);
		}
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$2) {
				return;
			}
			isContextMenuFuncRunning$2 = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
				menu.hide();
				if(e.target instanceof HTMLElement) {
					if(isContextMenuUploaderEnable && e.target.closest(".bili-video-card__info--owner")) {
						const node = (_a = e.target.closest(".bili-video-card__info--owner")) == null ? void 0 : _a.querySelector(".bili-video-card__info--author");
						const uploader = node == null ? void 0 : node.textContent;
						if(uploader) {
							e.preventDefault();
							menu.registerMenu(`◎ 屏蔽UP主：${uploader}`, () => {
								channelUploaderAction.add(uploader);
							});
							menu.registerMenu(`◎ 将UP主加入白名单`, () => {
								channelUploaderWhitelistAction.add(uploader);
							});
							menu.registerMenu(`◎ 复制主页链接`, () => {
								var _a2;
								const url = (_a2 = node.closest(".bili-video-card__info--owner")) == null ? void 0 : _a2.getAttribute("href");
								if(url) {
									const matches = url.match(/space\.bilibili\.com\/\d+/g);
									matches && navigator.clipboard.writeText(`https://${matches[0]}`);
								}
							});
							menu.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable && ((_b = e.target.parentElement) == null ? void 0 : _b.classList.contains("bili-video-card__info--tit"))) {
						const node = e.target.parentElement;
						const href2 = (_c = node.querySelector(":scope > a")) == null ? void 0 : _c.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								menu.registerMenu(`◎ 屏蔽视频 ${bvid}`, () => {
									channelBvidAction.add(bvid);
								});
								menu.registerMenu(`◎ 复制视频链接`, () => {
									navigator.clipboard.writeText(`https://www.bilibili.com/video/${bvid}`).then().catch();
								});
								menu.show(e.clientX, e.clientY);
							}
						}
					} else {
						menu.hide();
					}
				}
			});
			debugVideoFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			// 启用 频道页时长过滤
			new CheckboxItem({
				itemID: channelDurationAction.statusKey,
				description: "启用 时长过滤",
				/**
				 * 需使用匿名函数包装后传参, 否则报错, 下同
				 *
				 * GPT4(对错未知):
				 * 当把一个类的方法作为回调函数直接传递给另一个函数时，
				 * 那个方法会失去它的上下文（也就是它的 this 值），因为它被调用的方式改变了。
				 * 在这种情况下，this 可能会变成 undefined（严格模式）或全局对象（非严格模式）
				 *
				 * 可以在传递方法时使用箭头函数来保持 this 的上下文
				 */
				enableFunc: async () => {
					channelDurationAction.enable();
				},
				disableFunc: async () => {
					channelDurationAction.disable();
				}
			}),
			// 设定最低时长
			new NumberItem({
				itemID: channelDurationAction.valueKey,
				description: "设定最低时长 (0~300s)",
				defaultValue: 60,
				minValue: 0,
				maxValue: 300,
				disableValue: 0,
				unit: "秒",
				callback: async (value) => {
					channelDurationAction.change(value);
				}
			})
		];
		channelPageVideoFilterGroupList.push(new Group("channel-duration-filter-group", "频道页 时长过滤", durationItems));
		const uploaderItems = [
			// 启用 UP主过滤
			new CheckboxItem({
				itemID: channelUploaderAction.statusKey,
				description: "启用 UP主过滤 (右键单击UP主)",
				enableFunc: async () => {
					isContextMenuUploaderEnable = true;
					contextMenuFunc();
					channelUploaderAction.enable();
				},
				disableFunc: async () => {
					isContextMenuUploaderEnable = false;
					channelUploaderAction.disable();
				}
			}),
			// 编辑 UP主黑名单
			new ButtonItem({
				itemID: "channel-uploader-edit-button",
				description: "编辑 UP主黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					channelUploaderAction.blacklist.show();
				}
			}),
			// 启用 UP主昵称关键词过滤
			new CheckboxItem({
				itemID: channelUploaderKeywordAction.statusKey,
				description: "启用 UP主昵称关键词过滤",
				enableFunc: async () => {
					channelUploaderKeywordAction.enable();
				},
				disableFunc: async () => {
					channelUploaderKeywordAction.disable();
				}
			}),
			// 编辑 UP主昵称关键词黑名单
			new ButtonItem({
				itemID: "channel-uploader-keyword-edit-button",
				description: "编辑 UP主昵称关键词黑名单",
				name: "编辑",
				itemFunc: async () => {
					channelUploaderKeywordAction.blacklist.show();
				}
			})
		];
		channelPageVideoFilterGroupList.push(new Group("channel-uploader-filter-group", "频道页 UP主过滤", uploaderItems));
		const titleKeywordItems = [
			// 启用 频道页关键词过滤
			new CheckboxItem({
				itemID: channelTitleKeywordAction.statusKey,
				description: "启用 标题关键词过滤",
				enableFunc: async () => {
					channelTitleKeywordAction.enable();
				},
				disableFunc: async () => {
					channelTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "channel-title-keyword-edit-button",
				description: "编辑 标题关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					channelTitleKeywordAction.blacklist.show();
				}
			})
		];
		channelPageVideoFilterGroupList.push(new Group("channel-title-keyword-filter-group", "频道页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 频道页BV号过滤
			new CheckboxItem({
				itemID: channelBvidAction.statusKey,
				description: "启用 BV号过滤",
				enableFunc: async () => {
					isContextMenuBvidEnable = true;
					contextMenuFunc();
					channelBvidAction.enable();
				},
				disableFunc: async () => {
					isContextMenuBvidEnable = false;
					channelBvidAction.disable();
				}
			}),
			// 按钮功能：打开bvid黑名单编辑框
			new ButtonItem({
				itemID: "channel-bvid-edit-button",
				description: "编辑 BV号黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: async () => {
					channelBvidAction.blacklist.show();
				}
			})
		];
		channelPageVideoFilterGroupList.push(new Group("channel-bvid-filter-group", "频道页 BV号过滤 (右键单击标题)", bvidItems));
		const whitelistItems = [
			// 启用 频道页UP主白名单
			new CheckboxItem({
				itemID: channelUploaderWhitelistAction.statusKey,
				description: "启用 UP主白名单 (右键单击UP主)",
				enableFunc: async () => {
					channelUploaderWhitelistAction.enable();
				},
				disableFunc: async () => {
					channelUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "channel-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					channelUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 频道页标题关键词白名单
			new CheckboxItem({
				itemID: channelTitleKeywordWhitelistAction.statusKey,
				description: "启用 标题关键词白名单",
				enableFunc: async () => {
					channelTitleKeywordWhitelistAction.enable();
				},
				disableFunc: async () => {
					channelTitleKeywordWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "channel-title-keyword-whitelist-edit-button",
				description: "编辑 标题关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: async () => {
					channelTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		channelPageVideoFilterGroupList.push(new Group("channel-whitelist-filter-group", "频道页 白名单设定 (免过滤)", whitelistItems));
	}
	class ContentFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "commentKeywordSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.commentKeywordSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(value) {
			if(value.trim()) {
				this.commentKeywordSet.add(value.trim());
			}
		}
		check(title) {
			title = title.trim().toLowerCase();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || title.length === 0 || this.commentKeywordSet.size === 0) {
						resolve(`Content resolve, disable or empty`);
					}
					let flag = false;
					this.commentKeywordSet.forEach((word) => {
						if(word.startsWith("/") && word.endsWith("/")) {
							const pattern = new RegExp(word.slice(1, -1), "iv");
							if(title.match(pattern)) {
								flag = true;
								reject(`Content reject, ${title} match ${word} in blacklist`);
							}
						} else {
							if(word && title.includes(word.toLowerCase())) {
								flag = true;
								reject(`Content reject, ${title} match ${word} in blacklist`);
							}
						}
					});
					if(!flag) {
						resolve(`Content resolve, title not match blacklist`);
					}
				} catch (err) {
					error(err);
					resolve(`Content resolve, error`);
				}
			});
		}
	}
	const contentFilterInstance = new ContentFilter();
	class UsernameFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "usernameSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			this.usernameSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(username) {
			this.usernameSet.add(username.trim());
		}
		check(username) {
			username = username.trim();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || username.length === 0 || this.usernameSet.size === 0) {
						resolve("username resolve, disable or empty");
					} else if(this.usernameSet.has(username)) {
						reject(`username reject, ${username} in blacklist`);
					} else {
						resolve("username resolve");
					}
				} catch (err) {
					error(err);
					resolve(`username resolve, error`);
				}
			});
		}
	}
	const usernameFilterInstance = new UsernameFilter();
	class CommentFilterAgency {
		notifyUsername(event, value) {
			switch(event) {
				case "disable":
					usernameFilterInstance.setStatus(false);
					break;
				case "enable":
					usernameFilterInstance.setStatus(true);
					break;
				case "add":
					if(typeof value === "string") {
						if(value.trim()) {
							usernameFilterInstance.addParam(value.trim());
						}
					}
					break;
				case "edit":
					if(Array.isArray(value)) {
						usernameFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
		notifyContent(event, value) {
			switch(event) {
				case "disable":
					contentFilterInstance.setStatus(false);
					break;
				case "enable":
					contentFilterInstance.setStatus(true);
					break;
				case "add":
					if(typeof value === "string" && value.trim()) {
						contentFilterInstance.addParam(value.trim());
					}
					break;
				case "edit":
					if(Array.isArray(value)) {
						contentFilterInstance.setParams(value.map((v) => v.trim()).filter((v) => v));
					}
					break;
			}
		}
	}
	const commentFilterAgencyInstance = new CommentFilterAgency();
	class UsernameAction {
		/**
		 * 评论区用户过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkCommentList 检测评论列表函数
		 */
		constructor(statusKey, valueKey, checkCommentList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkCommentList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "blacklist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkCommentList = checkCommentList;
			usernameFilterInstance.setStatus(this.status);
			usernameFilterInstance.setParams(this.value);
			this.blacklist = new WordList(this.valueKey, "用户名 黑名单", "每行一个用户名，保存时自动去重",
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			commentFilterAgencyInstance.notifyUsername("enable");
			this.checkCommentList(true);
			this.status = true;
		}
		disable() {
			commentFilterAgencyInstance.notifyUsername("disable");
			this.checkCommentList(true);
			this.status = false;
		}
		add(value) {
			this.blacklist.addValue(value);
			commentFilterAgencyInstance.notifyUsername("add", value);
			this.checkCommentList(true);
		}
		edit(values) {
			commentFilterAgencyInstance.notifyUsername("edit", values);
			this.checkCommentList(true);
		}
	}
	class ContentAction {
		/**
		 * 评论内容关键字过滤操作
		 * @param statusKey 是否启用的GM key
		 * @param valueKey 存储数据的GM key
		 * @param checkCommentList 检测评论列表函数
		 */
		constructor(statusKey, valueKey, checkCommentList) {
			__publicField(this, "statusKey");
			__publicField(this, "valueKey");
			__publicField(this, "checkCommentList");
			__publicField(this, "status");
			__publicField(this, "value");
			__publicField(this, "blacklist");
			this.statusKey = statusKey;
			this.valueKey = valueKey;
			this.status = _GM_getValue(`BILICLEANER_${this.statusKey}`, false);
			this.value = _GM_getValue(`BILICLEANER_${this.valueKey}`, []);
			this.checkCommentList = checkCommentList;
			contentFilterInstance.setStatus(this.status);
			contentFilterInstance.setParams(this.value);
			this.blacklist = new WordList(this.valueKey, "评论关键词 黑名单", `每行一个关键词或正则，不区分大小写
正则无需flag（默认iv模式）语法：/abc|\\d+/`,
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			commentFilterAgencyInstance.notifyContent("enable");
			this.checkCommentList(true);
			this.status = true;
		}
		disable() {
			commentFilterAgencyInstance.notifyContent("disable");
			this.checkCommentList(true);
			this.status = false;
		}
		add(value) {
			this.blacklist.addValue(value);
			commentFilterAgencyInstance.notifyContent("add", value);
			this.checkCommentList(true);
		}
		edit(values) {
			commentFilterAgencyInstance.notifyContent("edit", values);
			this.checkCommentList(true);
		}
	}
	class CoreCommentFilter {
		/**
		 * 检测评论列表中每个评论是否合法, 并隐藏不合法的评论
		 * 对选取出的 发布人/评论内容 进行并发检测
		 * @param comments 评论列表
		 * @param sign 是否标记已过滤项
		 * @param selectorFunc 使用selector选取元素的函数
		 */
		checkAll(comments, sign = true, selectorFunc) {
			try {
				const checkContent = contentFilterInstance.isEnable && selectorFunc.content !== void 0;
				const checkUsername = usernameFilterInstance.isEnable && selectorFunc.username !== void 0;
				if(!checkContent && !checkUsername) {
					comments.forEach((comment) => showEle(comment));
					return;
				}
				comments.forEach((comment) => {
					const info = {};
					const blackTasks = [];
					const whiteTasks = [];
					if(checkContent) {
						const content = selectorFunc.content(comment);
						if(content) {
							blackTasks.push(contentFilterInstance.check(content));
							info.content = content;
						}
					}
					if(checkUsername) {
						const username = selectorFunc.username(comment);
						if(username) {
							blackTasks.push(usernameFilterInstance.check(username));
							info.username = username;
						}
					}
					Promise.all(blackTasks).then((_result) => {
						showEle(comment);
						Promise.all(whiteTasks).then((_result2) => {}).catch((_result2) => {});
					}).catch((_result) => {
						if(whiteTasks) {
							Promise.all(whiteTasks).then((_result2) => {
								if(!isEleHide(comment)) {
									log(`hide comment
username: ${info.username}
content: ${info.content}`);
								}
								hideEle(comment);
							}).catch((_result2) => {
								showEle(comment);
							});
						} else {
							if(!isEleHide(comment)) {
								log(`hide comment
username: ${info.username}
content: ${info.content}`);
							}
							hideEle(comment);
						}
					});
					sign && comment.setAttribute(settings.filterSign, "");
				});
			} catch (err) {
				error(err);
				error("CoreCommentFilter checkAll error");
			}
		}
	}
	const coreCommentFilterInstance = new CoreCommentFilter();
	const videoPageCommentFilterGroupList = [];
	let isContextMenuFuncRunning$1 = false;
	let isContextMenuUsernameEnable$1 = false;
	let isRootCommentWhitelistEnable$1 = _GM_getValue("BILICLEANER_video-comment-root-whitelist-status", false);
	let isSubCommentWhitelistEnable$1 = _GM_getValue("BILICLEANER_video-comment-sub-whitelist-status", false);
	let isUploaderCommentWhitelistEnable$1 = _GM_getValue("BILICLEANER_video-comment-uploader-whitelist-status", true);
	let isPinnedCommentWhitelistEnable$1 = _GM_getValue("BILICLEANER_video-comment-pinned-whitelist-status", true);
	let isNoteCommentWhitelistEnable$1 = _GM_getValue("BILICLEANER_video-comment-note-whitelist-status", true);
	let isLinkCommentWhitelistEnable$1 = _GM_getValue("BILICLEANER_video-comment-link-whitelist-status", true);
	if(isPageVideo() || isPageBangumi() || isPagePlaylist()) {
		let commentListContainer;
		const rootCommentSelectorFunc = {
			username: (comment) => {
				var _a, _b;
				const username = (_b = (_a = comment.querySelector(".root-reply-container .user-name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				return username ? username : null;
			},
			content: (comment) => {
				var _a, _b;
				let content = (_b = (_a = comment.querySelector(".root-reply-container .reply-content")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				const atUsers = comment.querySelectorAll(".root-reply-container .jump-link.user");
				if(atUsers.length) {
					atUsers.forEach((e) => {
						var _a2;
						const username = (_a2 = e.textContent) == null ? void 0 : _a2.trim();
						if(content && username) {
							content = content.replace(username, "");
						}
					});
				}
				return content ? content : null;
			}
		};
		const subCommentSelectorFunc = {
			username: (comment) => {
				var _a, _b;
				const username = (_b = (_a = comment.querySelector(".sub-user-name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				return username ? username : null;
			},
			content: (comment) => {
				var _a, _b;
				let content = (_b = (_a = comment.querySelector(".reply-content")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				const atUsers = comment.querySelectorAll(".reply-content .jump-link.user");
				if(atUsers.length && content) {
					content = content.replace("回复 ", "");
					atUsers.forEach((e) => {
						var _a2;
						const username = (_a2 = e.textContent) == null ? void 0 : _a2.trim();
						if(content && username) {
							content = content.replace(username, "");
						}
					});
				}
				return content ? content : null;
			}
		};
		const checkCommentList = (fullSite) => {
			if(!commentListContainer) {
				debugCommentFilter(`checkCommentList commentListContainer not exist`);
				return;
			}
			try {
				let rootComments, subComments;
				if(fullSite) {
					rootComments = commentListContainer.querySelectorAll(`.reply-item`);
					subComments = commentListContainer.querySelectorAll(`.sub-reply-item:not(.jump-link.user)`);
				} else {
					rootComments = commentListContainer.querySelectorAll(`.reply-item:not([${settings.filterSign}])`);
					subComments = commentListContainer.querySelectorAll(`.sub-reply-item:not(.jump-link.user):not([${settings.filterSign}])`);
				}
				rootComments = Array.from(rootComments).filter((e) => {
					const isWhite = isRootCommentWhitelistEnable$1 || isUploaderCommentWhitelistEnable$1 && e.querySelector(".root-reply-container .up-icon") || isNoteCommentWhitelistEnable$1 && e.querySelector(".root-reply-container .note-prefix") || isPinnedCommentWhitelistEnable$1 && e.querySelector(".root-reply-container .top-icon") || isLinkCommentWhitelistEnable$1 && e.querySelector(`.root-reply-container .jump-link.video-time,
.root-reply-container .jump-link.normal,
.root-reply-container .jump-link.video`);
					if(isWhite) {
						showEle(e);
					}
					return !isWhite;
				});
				subComments = Array.from(subComments).filter((e) => {
					const isWhite = isSubCommentWhitelistEnable$1 || isUploaderCommentWhitelistEnable$1 && e.querySelector(".sub-up-icon") || isLinkCommentWhitelistEnable$1 && e.querySelector(`.jump-link.video-time,
.jump-link.normal,
.jump-link.video`);
					if(isWhite) {
						showEle(e);
					}
					return !isWhite;
				});
				rootComments.length && coreCommentFilterInstance.checkAll([...rootComments], true, rootCommentSelectorFunc);
				debugCommentFilter(`check ${rootComments.length} root comments`);
				subComments.length && coreCommentFilterInstance.checkAll([...subComments], true, subCommentSelectorFunc);
				debugCommentFilter(`check ${subComments.length} sub comments`);
			} catch (err) {
				error(err);
				error("checkCommentList error");
			}
		};
		const usernameAction = new UsernameAction("video-comment-username-filter-status", "global-comment-username-filter-value", checkCommentList);
		const contentAction = new ContentAction("video-comment-content-filter-status", "global-comment-content-filter-value", checkCommentList);
		const watchCommentListContainer = () => {
			if(commentListContainer) {
				if(usernameAction.status || contentAction.status) {
					checkCommentList(true);
				}
				const commentObserver = new MutationObserver(() => {
					if(usernameAction.status || contentAction.status) {
						checkCommentList(false);
					}
				});
				commentObserver.observe(commentListContainer, {
					childList: true,
					subtree: true
				});
			}
		};
		try {
			waitForEle(document, "#comment, #comment-body, .playlist-comment", (node) => {
				return ["comment", "comment-body"].includes(node.id) || node.className === "playlist-comment";
			}).then((ele) => {
				if(ele) {
					commentListContainer = ele;
					watchCommentListContainer();
				}
			});
		} catch (err) {
			error(err);
			error(`watch comment list ERROR`);
		}
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$1) {
				return;
			}
			isContextMenuFuncRunning$1 = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				var _a;
				menu.hide();
				if(e.target instanceof HTMLElement) {
					const target = e.target;
					if(isContextMenuUsernameEnable$1 && (target.classList.contains("user-name") || target.classList.contains("sub-user-name"))) {
						const username = (_a = target.textContent) == null ? void 0 : _a.trim();
						if(username) {
							e.preventDefault();
							menu.registerMenu(`屏蔽用户：${username}`, () => {
								usernameAction.add(username);
							});
							menu.show(e.clientX, e.clientY);
						}
					} else {
						menu.hide();
					}
				}
			});
			debugCommentFilter("contextMenuFunc listen contextmenu");
		};
		const usernameItems = [
			// 启用 播放页UP主过滤
			new CheckboxItem({
				itemID: usernameAction.statusKey,
				description: "启用 评论区 用户名过滤\n(右键单击用户名)",
				enableFunc: async () => {
					isContextMenuUsernameEnable$1 = true;
					contextMenuFunc();
					usernameAction.enable();
				},
				disableFunc: async () => {
					isContextMenuUsernameEnable$1 = false;
					usernameAction.disable();
				}
			}),
			// 编辑 用户名黑名单
			new ButtonItem({
				itemID: "comment-username-edit-button",
				description: "编辑 用户名黑名单",
				name: "编辑",
				itemFunc: async () => {
					usernameAction.blacklist.show();
				}
			})
		];
		videoPageCommentFilterGroupList.push(new Group("comment-username-filter-group", "播放页 评论区 用户过滤", usernameItems));
		const contentItems = [
			// 启用 播放页关键词过滤
			new CheckboxItem({
				itemID: contentAction.statusKey,
				description: "启用 评论区 关键词过滤",
				enableFunc: async () => {
					contentAction.enable();
				},
				disableFunc: async () => {
					contentAction.disable();
				}
			}),
			// 编辑 关键词黑名单
			new ButtonItem({
				itemID: "comment-content-edit-button",
				description: "编辑 评论关键词黑名单（支持正则）",
				name: "编辑",
				itemFunc: async () => {
					contentAction.blacklist.show();
				}
			})
		];
		videoPageCommentFilterGroupList.push(new Group("comment-content-filter-group", "评论区 关键词过滤", contentItems));
		const whitelistItems = [
			// 一级评论 免过滤
			new CheckboxItem({
				itemID: "video-comment-root-whitelist-status",
				description: "一级评论(主评论) 免过滤",
				enableFunc: async () => {
					isRootCommentWhitelistEnable$1 = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isRootCommentWhitelistEnable$1 = false;
					checkCommentList(true);
				}
			}),
			// 二级评论 免过滤
			new CheckboxItem({
				itemID: "video-comment-sub-whitelist-status",
				description: "二级评论(回复) 免过滤",
				enableFunc: async () => {
					isSubCommentWhitelistEnable$1 = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isSubCommentWhitelistEnable$1 = false;
					checkCommentList(true);
				}
			}),
			// UP主的评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "video-comment-uploader-whitelist-status",
				description: "UP主的评论 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isUploaderCommentWhitelistEnable$1 = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isUploaderCommentWhitelistEnable$1 = false;
					checkCommentList(true);
				}
			}),
			// 置顶评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "video-comment-pinned-whitelist-status",
				description: "置顶评论 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isPinnedCommentWhitelistEnable$1 = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isPinnedCommentWhitelistEnable$1 = false;
					checkCommentList(true);
				}
			}),
			// 笔记评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "video-comment-note-whitelist-status",
				description: "笔记/图片评论 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isNoteCommentWhitelistEnable$1 = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isNoteCommentWhitelistEnable$1 = false;
					checkCommentList(true);
				}
			}),
			// 含超链接的评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "video-comment-link-whitelist-status",
				description: "含超链接的评论 免过滤\n（站内视频/URL/播放时间跳转）",
				defaultStatus: true,
				enableFunc: async () => {
					isLinkCommentWhitelistEnable$1 = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isLinkCommentWhitelistEnable$1 = false;
					checkCommentList(true);
				}
			})
		];
		videoPageCommentFilterGroupList.push(new Group("comment-content-filter-whitelist-group", "评论区 白名单设置 (免过滤)", whitelistItems));
	}
	const spacePageVideoFilterGroupList = [];
	if(isPageSpace()) {
		let videoListContainer;
		const submitSelectorFunc = {
			duration: (video) => {
				var _a, _b;
				const duration = (_b = (_a = video.querySelector("span.length")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				return duration ? duration : null;
			},
			titleKeyword: (video) => {
				var _a, _b, _c, _d;
				const titleKeyword = ((_b = (_a = video.querySelector("a.title")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || ((_d = (_c = video.querySelector("a.title")) == null ? void 0 : _c.getAttribute("title")) == null ? void 0 : _d.trim());
				return titleKeyword ? titleKeyword : null;
			},
			bvid: (video) => {
				var _a, _b;
				const href2 = (_b = (_a = video.querySelector("a.title")) == null ? void 0 : _a.getAttribute("href")) == null ? void 0 : _b.trim();
				return href2 ? matchBvid(href2) : null;
			}
		};
		const homeSelectorFunc = submitSelectorFunc;
		const collectionSelectorFunc = submitSelectorFunc;
		const checkVideoList = (_fullSite) => {
			if(!videoListContainer) {
				debugVideoFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				if(location.pathname.match(/^\/\d+$/)) {
					const homeVideos = [...videoListContainer.querySelectorAll(`#page-index .small-item`)];
					homeVideos.length && coreVideoFilterInstance.checkAll(homeVideos, false, homeSelectorFunc);
					debugVideoFilter(`checkVideoList check ${homeVideos.length} home video`);
				}
				if(location.pathname.match(/^\/\d+\/video$/)) {
					const submitVideos = [...videoListContainer.querySelectorAll(`#submit-video :is(.small-item,.list-item)`)];
					submitVideos.length && coreVideoFilterInstance.checkAll(submitVideos, false, submitSelectorFunc);
					debugVideoFilter(`checkVideoList check ${submitVideos.length} submit video`);
				}
				if(location.pathname.match(/^\/\d+\/channel\/(collectiondetail|seriesdetail)/)) {
					const collectionVideos = [...videoListContainer.querySelectorAll(`:is(#page-collection-detail,#page-series-detail) li.small-item`)];
					collectionVideos.length && coreVideoFilterInstance.checkAll(collectionVideos, false, collectionSelectorFunc);
					debugVideoFilter(`checkVideoList check ${collectionVideos.length} collection video`);
				}
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const spaceDurationAction = new DurationAction("space-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const spaceBvidAction = new BvidAction("space-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const spaceTitleKeywordAction = new TitleKeywordAction("space-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const spaceTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("space-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const watchVideoListContainer = () => {
			const check = async (fullSite) => {
				if(spaceDurationAction.status || spaceBvidAction.status || spaceTitleKeywordAction.status) {
					checkVideoList();
				}
			};
			if(videoListContainer) {
				check().then().catch();
				const videoObserver = new MutationObserver(() => {
					check().then().catch();
				});
				videoObserver.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugVideoFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, "#app", (node) => {
				return node.id === "app";
			}).then((ele) => {
				if(ele) {
					videoListContainer = ele;
					watchVideoListContainer();
				}
			});
		} catch (err) {
			error(err);
			error(`watch video list ERROR`);
		}
		let isContextMenuFuncRunning2 = false;
		let isContextMenuBvidEnable2 = false;
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning2) {
				return;
			}
			isContextMenuFuncRunning2 = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				menu.hide();
				if(e.target instanceof HTMLElement) {
					if(isContextMenuBvidEnable2 && e.target.classList.contains("title")) {
						const href2 = e.target.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								menu.registerMenu(`◎ 屏蔽视频 ${bvid}`, () => {
									spaceBvidAction.add(bvid);
								});
								menu.registerMenu(`◎ 复制视频链接`, () => {
									navigator.clipboard.writeText(`https://www.bilibili.com/video/${bvid}`).then().catch();
								});
								menu.show(e.clientX, e.clientY);
							}
						}
					} else {
						menu.hide();
					}
				}
			});
			debugVideoFilter("contextMenuFunc listen contextmenu");
		};
		const patchCSS = `
@media (min-width: 1420px) {
#page-index .video .content .small-item:nth-child(4n+1) {padding-left: 7px !important; padding-right: 7px !important;}
#page-index .video .content .small-item:nth-child(4n+4) {padding-left: 7px !important; padding-right: 7px !important;}
#page-index .video .content .small-item:nth-child(5n+5) {padding-left: 7px !important; padding-right: 7px !important;}
#page-index .video .content .small-item:nth-child(5n+1) {padding-left: 7px !important; padding-right: 7px !important;}
#page-index .video .content .small-item:nth-child(13),
#page-index .video .content .small-item:nth-child(14),
#page-index .video .content .small-item:nth-child(15) {display: block}
}
#page-index .video .content .small-item:nth-child(4n+1) {padding-left: 7px !important; padding-right: 7px !important;}
#page-index .video .content .small-item:nth-child(4n+4) {padding-left: 7px !important; padding-right: 7px !important;}
#page-index .video .content .small-item {padding: 10px 7px !important;}`;
		const durationItems = [
			// 启用 空间页时长过滤
			new CheckboxItem({
				itemID: spaceDurationAction.statusKey,
				description: "启用 时长过滤",
				enableFunc: async () => {
					spaceDurationAction.enable();
				},
				disableFunc: async () => {
					spaceDurationAction.disable();
				},
				itemCSS: patchCSS
			}),
			// 设定最低时长
			new NumberItem({
				itemID: spaceDurationAction.valueKey,
				description: "设定最低时长 (0~300s)",
				defaultValue: 60,
				minValue: 0,
				maxValue: 300,
				disableValue: 0,
				unit: "秒",
				callback: async (value) => {
					spaceDurationAction.change(value);
				}
			})
		];
		spacePageVideoFilterGroupList.push(new Group("space-duration-filter-group", "空间页 时长过滤", durationItems));
		const titleKeywordItems = [
			// 启用 空间页关键词过滤
			new CheckboxItem({
				itemID: spaceTitleKeywordAction.statusKey,
				description: "启用 标题关键词过滤",
				enableFunc: async () => {
					spaceTitleKeywordAction.enable();
				},
				disableFunc: async () => {
					spaceTitleKeywordAction.disable();
				},
				itemCSS: patchCSS
			}),
			// 编辑 标题关键词黑名单
			new ButtonItem({
				itemID: "space-title-keyword-edit-button",
				description: "编辑 标题关键词黑名单（支持正则）",
				name: "编辑",
				itemFunc: async () => {
					spaceTitleKeywordAction.blacklist.show();
				}
			})
		];
		spacePageVideoFilterGroupList.push(new Group("space-title-keyword-filter-group", "空间页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 空间页BV号过滤
			new CheckboxItem({
				itemID: spaceBvidAction.statusKey,
				description: "启用 BV号过滤",
				enableFunc: async () => {
					isContextMenuBvidEnable2 = true;
					contextMenuFunc();
					spaceBvidAction.enable();
				},
				disableFunc: async () => {
					isContextMenuBvidEnable2 = false;
					spaceBvidAction.disable();
				},
				itemCSS: patchCSS
			}),
			// 编辑 BV号黑名单
			new ButtonItem({
				itemID: "space-bvid-edit-button",
				description: "编辑 BV号黑名单",
				name: "编辑",
				itemFunc: async () => {
					spaceBvidAction.blacklist.show();
				}
			})
		];
		spacePageVideoFilterGroupList.push(new Group("space-bvid-filter-group", "空间页 BV号过滤 (右键单击标题)", bvidItems));
		const whitelistItems = [
			// 启用 空间页标题关键词白名单
			new CheckboxItem({
				itemID: spaceTitleKeywordWhitelistAction.statusKey,
				description: "启用 标题关键词白名单",
				enableFunc: async () => {
					spaceTitleKeywordWhitelistAction.enable();
				},
				disableFunc: async () => {
					spaceTitleKeywordWhitelistAction.disable();
				}
			}),
			// 编辑 标题关键词白名单
			new ButtonItem({
				itemID: "space-title-keyword-whitelist-edit-button",
				description: "编辑 标题关键词白名单（支持正则）",
				name: "编辑",
				itemFunc: async () => {
					spaceTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		spacePageVideoFilterGroupList.push(new Group("space-whitelist-filter-group", "空间页 白名单设定 (免过滤)", whitelistItems));
	}
	const dynamicPageCommentFilterGroupList = [];
	let isContextMenuFuncRunning = false;
	let isContextMenuUsernameEnable = false;
	let isRootCommentWhitelistEnable = _GM_getValue("BILICLEANER_dynamic-comment-root-whitelist-status", false);
	let isSubCommentWhitelistEnable = _GM_getValue("BILICLEANER_dynamic-comment-sub-whitelist-status", false);
	let isUploaderCommentWhitelistEnable = _GM_getValue("BILICLEANER_dynamic-comment-uploader-whitelist-status", true);
	let isPinnedCommentWhitelistEnable = _GM_getValue("BILICLEANER_dynamic-comment-pinned-whitelist-status", true);
	let isNoteCommentWhitelistEnable = _GM_getValue("BILICLEANER_dynamic-comment-note-whitelist-status", true);
	let isLinkCommentWhitelistEnable = _GM_getValue("BILICLEANER_dynamic-comment-link-whitelist-status", true);
	if(isPageDynamic()) {
		let commentListContainer;
		const rootCommentSelectorFunc = {
			username: (comment) => {
				var _a, _b;
				const username = (_b = (_a = comment.querySelector(".root-reply-container .user-name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				return username ? username : null;
			},
			content: (comment) => {
				var _a, _b;
				let content = (_b = (_a = comment.querySelector(".root-reply-container .reply-content")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				const atUsers = comment.querySelectorAll(".root-reply-container .jump-link.user");
				if(atUsers.length) {
					atUsers.forEach((e) => {
						var _a2;
						const username = (_a2 = e.textContent) == null ? void 0 : _a2.trim();
						if(content && username) {
							content = content.replace(username, "");
						}
					});
				}
				return content ? content : null;
			}
		};
		const subCommentSelectorFunc = {
			username: (comment) => {
				var _a, _b;
				const username = (_b = (_a = comment.querySelector(".sub-user-name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				return username ? username : null;
			},
			content: (comment) => {
				var _a, _b;
				let content = (_b = (_a = comment.querySelector(".reply-content")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
				const atUsers = comment.querySelectorAll(".reply-content .jump-link.user");
				if(atUsers.length && content) {
					content = content.replace("回复 ", "");
					atUsers.forEach((e) => {
						var _a2;
						const username = (_a2 = e.textContent) == null ? void 0 : _a2.trim();
						if(content && username) {
							content = content.replace(username, "");
						}
					});
				}
				return content ? content : null;
			}
		};
		const checkCommentList = (fullSite) => {
			if(!commentListContainer) {
				debugCommentFilter(`checkCommentList commentListContainer not exist`);
				return;
			}
			try {
				let rootComments, subComments;
				if(fullSite) {
					rootComments = commentListContainer.querySelectorAll(`.reply-item`);
					subComments = commentListContainer.querySelectorAll(`.sub-reply-item:not(.jump-link.user)`);
				} else {
					rootComments = commentListContainer.querySelectorAll(`.reply-item:not([${settings.filterSign}])`);
					subComments = commentListContainer.querySelectorAll(`.sub-reply-item:not(.jump-link.user):not([${settings.filterSign}])`);
				}
				rootComments = Array.from(rootComments).filter((e) => {
					const isWhite = isRootCommentWhitelistEnable || isUploaderCommentWhitelistEnable && e.querySelector(".root-reply-container .up-icon") || isNoteCommentWhitelistEnable && e.querySelector(".root-reply-container .note-prefix") || isPinnedCommentWhitelistEnable && e.querySelector(".root-reply-container .top-icon") || isLinkCommentWhitelistEnable && e.querySelector(`.root-reply-container .jump-link.dynamic-time,
.root-reply-container .jump-link.normal,
.root-reply-container .jump-link.dynamic`);
					if(isWhite) {
						showEle(e);
					}
					return !isWhite;
				});
				subComments = Array.from(subComments).filter((e) => {
					const isWhite = isSubCommentWhitelistEnable || isUploaderCommentWhitelistEnable && e.querySelector(".sub-up-icon") || isLinkCommentWhitelistEnable && e.querySelector(`.jump-link.dynamic-time,
.jump-link.normal,
.jump-link.dynamic`);
					if(isWhite) {
						showEle(e);
					}
					return !isWhite;
				});
				rootComments.length && coreCommentFilterInstance.checkAll([...rootComments], true, rootCommentSelectorFunc);
				debugCommentFilter(`check ${rootComments.length} root comments`);
				subComments.length && coreCommentFilterInstance.checkAll([...subComments], true, subCommentSelectorFunc);
				debugCommentFilter(`check ${subComments.length} sub comments`);
			} catch (err) {
				error(err);
				error("checkCommentList error");
			}
		};
		const usernameAction = new UsernameAction("dynamic-comment-username-filter-status", "global-comment-username-filter-value", checkCommentList);
		const contentAction = new ContentAction("dynamic-comment-content-filter-status", "global-comment-content-filter-value", checkCommentList);
		const watchCommentListContainer = () => {
			const check = async (fullSite) => {
				if(usernameAction.status || contentAction.status) {
					checkCommentList(fullSite);
				}
			};
			if(commentListContainer) {
				check(true).then().catch();
				const commentObserver = new MutationObserver(() => {
					check(false).then().catch();
				});
				commentObserver.observe(commentListContainer, {
					childList: true,
					subtree: true
				});
			}
		};
		try {
			waitForEle(document, ".bili-dyn-home--member, .bili-comment-container, .bili-comment, #app",
				(node) => {
					return node.className === "bili-dyn-home--member" || node.className.includes("bili-comment-container") || node.className.includes("bili-comment") || node.id === "app";
				}).then((ele) => {
				if(ele) {
					commentListContainer = ele;
					watchCommentListContainer();
				}
			});
		} catch (err) {
			error(err);
			error(`watch comment list ERROR`);
		}
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning) {
				return;
			}
			isContextMenuFuncRunning = true;
			const menu = new ContextMenu();
			document.addEventListener("contextmenu", (e) => {
				var _a;
				menu.hide();
				if(e.target instanceof HTMLElement) {
					const target = e.target;
					if(isContextMenuUsernameEnable && (target.classList.contains("user-name") || target.classList.contains("sub-user-name"))) {
						const username = (_a = target.textContent) == null ? void 0 : _a.trim();
						if(username) {
							e.preventDefault();
							menu.registerMenu(`屏蔽用户：${username}`, () => {
								usernameAction.add(username);
							});
							menu.show(e.clientX, e.clientY);
						}
					} else {
						menu.hide();
					}
				}
			});
			debugCommentFilter("contextMenuFunc listen contextmenu");
		};
		const usernameItems = [
			// 启用 动态页UP主过滤
			new CheckboxItem({
				itemID: usernameAction.statusKey,
				description: "启用 评论区 用户名过滤\n(右键单击用户名)",
				enableFunc: async () => {
					isContextMenuUsernameEnable = true;
					contextMenuFunc();
					usernameAction.enable();
				},
				disableFunc: async () => {
					isContextMenuUsernameEnable = false;
					usernameAction.disable();
				}
			}),
			// 编辑 用户名黑名单
			new ButtonItem({
				itemID: "comment-username-edit-button",
				description: "编辑 用户名黑名单",
				name: "编辑",
				itemFunc: async () => {
					usernameAction.blacklist.show();
				}
			})
		];
		dynamicPageCommentFilterGroupList.push(new Group("comment-username-filter-group", "动态页 评论区 用户过滤", usernameItems));
		const contentItems = [
			// 启用 动态页关键词过滤
			new CheckboxItem({
				itemID: contentAction.statusKey,
				description: "启用 评论区 关键词过滤",
				enableFunc: async () => {
					contentAction.enable();
				},
				disableFunc: async () => {
					contentAction.disable();
				}
			}),
			// 编辑 关键词黑名单
			new ButtonItem({
				itemID: "comment-content-edit-button",
				description: "编辑 评论关键词黑名单（支持正则）",
				name: "编辑",
				itemFunc: async () => {
					contentAction.blacklist.show();
				}
			})
		];
		dynamicPageCommentFilterGroupList.push(new Group("comment-content-filter-group", "评论区 关键词过滤", contentItems));
		const whitelistItems = [
			// 一级评论 免过滤
			new CheckboxItem({
				itemID: "dynamic-comment-root-whitelist-status",
				description: "一级评论(主评论) 免过滤",
				enableFunc: async () => {
					isRootCommentWhitelistEnable = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isRootCommentWhitelistEnable = false;
					checkCommentList(true);
				}
			}),
			// 二级评论 免过滤
			new CheckboxItem({
				itemID: "dynamic-comment-sub-whitelist-status",
				description: "二级评论(回复) 免过滤",
				enableFunc: async () => {
					isSubCommentWhitelistEnable = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isSubCommentWhitelistEnable = false;
					checkCommentList(true);
				}
			}),
			// UP主的评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "dynamic-comment-uploader-whitelist-status",
				description: "UP主的评论 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isUploaderCommentWhitelistEnable = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isUploaderCommentWhitelistEnable = false;
					checkCommentList(true);
				}
			}),
			// 置顶评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "dynamic-comment-pinned-whitelist-status",
				description: "置顶评论 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isPinnedCommentWhitelistEnable = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isPinnedCommentWhitelistEnable = false;
					checkCommentList(true);
				}
			}),
			// 笔记评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "dynamic-comment-note-whitelist-status",
				description: "笔记/图片评论 免过滤",
				defaultStatus: true,
				enableFunc: async () => {
					isNoteCommentWhitelistEnable = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isNoteCommentWhitelistEnable = false;
					checkCommentList(true);
				}
			}),
			// 含超链接的评论 免过滤, 默认开启
			new CheckboxItem({
				itemID: "dynamic-comment-link-whitelist-status",
				description: "含超链接的评论 免过滤\n（站内视频/URL/播放时间跳转）",
				defaultStatus: true,
				enableFunc: async () => {
					isLinkCommentWhitelistEnable = true;
					checkCommentList(true);
				},
				disableFunc: async () => {
					isLinkCommentWhitelistEnable = false;
					checkCommentList(true);
				}
			})
		];
		dynamicPageCommentFilterGroupList.push(new Group("comment-content-filter-whitelist-group", "评论区 白名单设置 (免过滤)", whitelistItems));
	}
	const watchlaterGroupList = [];
	if(isPageWatchlater()) {
		const basicItems2 = [
			// 使用 双列布局
			new CheckboxItem({
				itemID: "watchlater-page-layout-2-column",
				description: "使用 双列布局",
				itemCSS: `
.list-box > span {
display: grid !important;
grid-template-columns: repeat(2, calc(50% - 10px)) !important;
column-gap: 20px !important;
row-gap: 16px !important;
}
.watch-later-list {
margin-bottom: 50px !important;
}
.watch-later-list header {
margin: 8px 0 16px !important;
}
.av-item {
width: unset !important;
margin: 0 !important;
border-radius: 8px !important;
padding: 8px 8px 8px 32px !important;
}
.av-item:hover {
box-shadow: 0 0 8px rgba(0, 0, 0, 0.2) !important;
transition: box-shadow 0.1s linear;
}
.av-item .av-about {
display: flex !important;
flex-direction: column !important;
border-bottom: none !important;
}
.av-item .av-pic .branch,
.av-item .av-pic .corner {
font-size: 13px !important;
}
.av-item .av-about .t {
font-size: 15px !important;
font-weight: 500 !important;
width: unset !important;
overflow: unset !important;
text-wrap: wrap !important;
line-height: 1.4em !important;
}
.av-item .av-about .info .state {
margin-left: auto !important;
}
.av-item .av-about .info .state .looked {
font-size: 14px !important;
margin-right: unset !important;
}
.info.clearfix {
margin-top: auto !important;
display: flex !important;
flex-direction: initial !important;
align-items: center !important;
}
.info.clearfix .user {
display: flex !important;
align-items: center !important;
}
.info.clearfix .user span:last-child {
margin: 0 0 0 6px !important;
font-size: 14px !important;
float: unset !important;
}
`
			}),
			// 修复字体
			new CheckboxItem({
				itemID: "font-patch",
				description: "修复字体",
				itemCSS: `
${fontFaceRegular}
${fontFaceMedium}
body {
font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 400;
font-size: 14px;
}
.av-item .av-about .t {
font-family: PingFang SC, HarmonyOS_Medium, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 500 !important;
}
`
			})
		];
		watchlaterGroupList.push(new Group("watchlater-basic", "稍后再看页 基本功能", basicItems2));
	}
	const spaceGroupList = [];
	if(isPageSpace()) {
		const basicItems2 = [
			// 修复字体
			new CheckboxItem({
				itemID: "font-patch",
				description: "修复字体",
				itemCSS: `
${fontFaceRegular}
body,
.h .h-sign,
.reply-item .root-reply-container .content-warp .user-info .user-name,
.bili-comment.browser-pc * {
font-family: PingFang SC, HarmonyOS_Regular, Helvetica Neue, Microsoft YaHei, sans-serif !important;
font-weight: 400;
}
body,
.n .n-text {
font-size: 14px;
}
#page-index .channel .channel-item .small-item,
#page-video .page-head__left .be-tab-item,
.n .n-data .n-data-k,
.n .n-data .n-data-v {
font-size: 13px;
}
`
			})
		];
		spaceGroupList.push(new Group("space-basic", "空间页 基本功能", basicItems2));
	}
	const main = async () => {
		const RULE_GROUPS = [...homepageGroupList, ...popularGroupList, ...videoGroupList, ...bangumiGroupList, ...searchGroupList, ...dynamicGroupList, ...liveGroupList, ...channelGroupList, ...watchlaterGroupList, ...spaceGroupList, ...commonGroupList];
		RULE_GROUPS.forEach((e) => e.enableGroup());
		const VIDEO_FILTER_GROUPS = [...homepagePageVideoFilterGroupList, ...videoPageVideoFilterGroupList, ...popularPageVideoFilterGroupList, ...searchPageVideoFilterGroupList, ...channelPageVideoFilterGroupList, ...spacePageVideoFilterGroupList];
		VIDEO_FILTER_GROUPS.forEach((e) => e.enableGroup());
		const COMMENT_FILTER_GROUPS = [...videoPageCommentFilterGroupList, ...dynamicPageCommentFilterGroupList];
		COMMENT_FILTER_GROUPS.forEach((e) => e.enableGroup());
		let isGroupEnable = true;
		document.addEventListener("keydown", (event) => {
			if(event.altKey && ["b", "B"].includes(event.key) && (event.ctrlKey || navigator.userAgent.toLocaleLowerCase().includes("chrome"))) {
				debugMain("hotkey detected");
				if(isGroupEnable) {
					RULE_GROUPS.forEach((e) => e.disableGroup());
				} else {
					RULE_GROUPS.forEach((e) => e.enableGroup(false));
				}
				isGroupEnable = !isGroupEnable;
			}
		});
		const panel = new Panel();
		const createPanelWithMode = (mode, groups) => {
			switch(panel.mode) {
				case void 0:
					panel.create();
					panel.mode = mode;
					groups.forEach((e) => {
						e.insertGroup();
						e.insertGroupItems();
					});
					panel.show();
					break;
				case mode:
					panel.show();
					break;
				default:
					panel.clearGroups();
					panel.mode = mode;
					groups.forEach((e) => {
						e.insertGroup();
						e.insertGroupItems();
					});
					panel.show();
			}
		};
		const regIDs = [];
		const unregister = () => {
			regIDs.forEach((regID) => _GM_unregisterMenuCommand(regID));
			regIDs.splice(0, regIDs.length);
		};
		const register = () => {
			regIDs.push(_GM_registerMenuCommand("✅页面净化设置", () => createPanelWithMode("rule", RULE_GROUPS)));
			if(isPageHomepage() || isPageVideo() || isPagePopular() || isPageSearch() || isPageChannel() || isPagePlaylist() || isPageSpace()) {
				regIDs.push(_GM_registerMenuCommand("✅视频过滤设置", () => createPanelWithMode("videoFilter", VIDEO_FILTER_GROUPS)));
			}
			if(isPageVideo() || isPageBangumi() || isPagePlaylist() || isPageDynamic()) {
				regIDs.push(_GM_registerMenuCommand("✅评论过滤设置",
					() => createPanelWithMode("commentFilter", COMMENT_FILTER_GROUPS)));
			}
			if(isPageHomepage() || isPageVideo() || isPagePopular() || isPageSearch() || isPageChannel() || isPagePlaylist() || isPageSpace()) {
				const videoFilterSideBtnID = "video-filter-side-btn";
				const sideBtn = new SideBtn(videoFilterSideBtnID, "视频过滤", () => {
					panel.isShowing ? panel.hide() : createPanelWithMode("videoFilter", VIDEO_FILTER_GROUPS);
				});
				if(_GM_getValue(`BILICLEANER_${videoFilterSideBtnID}`, false)) {
					sideBtn.enable();
					regIDs.push(_GM_registerMenuCommand("⚡️关闭 视频过滤 快捷按钮", () => {
						sideBtn.disable();
						unregister();
						register();
					}));
				} else {
					regIDs.push(_GM_registerMenuCommand("⚡️启用 视频过滤 快捷按钮", () => {
						sideBtn.enable();
						unregister();
						register();
					}));
				}
			}
			if(isPageVideo() || isPageBangumi() || isPagePlaylist() || isPageDynamic()) {
				const commentFilterSideBtnID = "comment-filter-side-btn";
				const sideBtn = new SideBtn(commentFilterSideBtnID, "评论过滤", () => {
					panel.isShowing ? panel.hide() : createPanelWithMode("commentFilter", COMMENT_FILTER_GROUPS);
				});
				if(_GM_getValue(`BILICLEANER_${commentFilterSideBtnID}`, false)) {
					sideBtn.enable();
					regIDs.push(_GM_registerMenuCommand("⚡️关闭 评论过滤 快捷按钮", () => {
						sideBtn.disable();
						unregister();
						register();
					}));
				} else {
					regIDs.push(_GM_registerMenuCommand("⚡️启用 评论过滤 快捷按钮", () => {
						sideBtn.enable();
						unregister();
						register();
					}));
				}
			}
		};
		register();
	};
	try {
		if(!isPageInvalid()) {
			log("script start");
			await (init());
			await (main());
			log("script end");
		}
	} catch (err) {
		error(err);
	}
})();
//延迟加载时间：修改“delay”的值（单位为ms，默认3000）
const delay = 3000;;
(function() {
	function process() {
		try {
			const livePlayer = document.querySelector('#live-player')
			livePlayer.dispatchEvent(new Event('mousemove'))
			const qualityWrap = livePlayer.querySelector('.quality-wrap')
			const observer = new MutationObserver(mutations => {
				mutations.some(mutation => {
					try {
						const qualities = mutation.target.querySelectorAll('.list-it')
						if(qualities.length) {
							qualities[0].click()
							livePlayer.dispatchEvent(new Event('mouseleave'))
							return true
						}
						return false
					} catch (e) {
						console.error(e)
						return false
					} finally {
						observer.disconnect()
					}
				})
			})
			observer.observe(qualityWrap, {
				childList: true,
				subtree: true
			})
			qualityWrap.dispatchEvent(new Event('mouseenter'))
		} catch (e) {
			console.error(e)
		}
	}

	function live() {
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				mutation.addedNodes.forEach(node => {
					if(node.nodeName === 'VIDEO') {
						window.setTimeout(process, delay)
						observer.disconnect()
					}
				})
			})
		})
		observer.observe(document, {
			childList: true,
			subtree: true
		})
	}
	live()
})()
(function() {
	// ポーリング間隔を設定します（例：5000ミリ秒）
	var interval = 5000;
	var highestZIndex = 2147483647; // 最上層にボタンを保つための最大の32ビット整数
	// ページの読み込みが完了したらすぐに実行される関数
	function onPageLoad() {
		var targetDiv = document.getElementById('web-player-module-area-mask-panel');
		if(targetDiv) {
			addRemoveButton(targetDiv);
		}
	}
	// 削除ボタンを作成して追加する関数
	function addRemoveButton(targetDiv) {
		var button = document.getElementById('remove-button');
		if(!button) {
			button = document.createElement('button');
			button.id = 'remove-button';
			button.innerHTML = 'モザイクを削除';
			// ボタンのスタイルを設定します
			button.style.position = 'fixed'; // 固定位置を使用します
			button.style.zIndex = highestZIndex.toString(); // 最高のz-index値を設定します
			styleButton(button); // スタイルを適用
			document.body.appendChild(button);
		}
		// ボタンのクリックイベントを設定
		button.onclick = function() {
			targetDiv.remove();
			button.remove();
		};
		// ボタンの位置を更新
		updateButtonPosition(button, targetDiv);
	}
	// ボタンの位置を更新する関数
	function updateButtonPosition(button, targetDiv) {
		var rect = targetDiv.getBoundingClientRect();
		button.style.top = window.scrollY + rect.top + rect.height / 2 + 'px';
		button.style.left = window.scrollX + rect.left + rect.width / 2 + 'px';
	}
	// ボタンのスタイルを設定する関数
	function styleButton(button) {
		// 基本スタイル
		button.style.padding = '10px 15px';
		button.style.fontSize = '1rem';
		button.style.fontWeight = 'bold';
		button.style.color = '#fff';
		button.style.background = '#007bff';
		button.style.border = 'none';
		button.style.borderRadius = '5px';
		button.style.cursor = 'pointer';
		button.style.transition = 'background-color 0.3s, box-shadow 0.3s';
		// 影と遷移効果
		button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
		// マウスオーバー時のスタイル
		button.onmouseover = function() {
			button.style.background = '#0056b3';
			button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
		};
		// マウスアウト時のスタイル
		button.onmouseout = function() {
			button.style.background = '#007bff';
			button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
		};
	}
	// DOMの変更を監視するMutationObserverを使用
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if(mutation.addedNodes.length > 0) {
				var targetDiv = document.getElementById('web-player-module-area-mask-panel');
				if(targetDiv) {
					updateButtonPosition(document.getElementById('remove-button'), targetDiv);
				}
			}
		});
	});
	// ページの読み込みが完了したイベントをリスン
	window.addEventListener('load', onPageLoad);
	// DOMの変更を監視を開始
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	// setInterval関数を使用して、定期的にチェックとボタンの位置を更新
	setInterval(function() {
		var button = document.getElementById('remove-button');
		var targetDiv = document.getElementById('web-player-module-area-mask-panel');
		if(button && targetDiv) {
			updateButtonPosition(button, targetDiv);
		}
	}, interval);
})();