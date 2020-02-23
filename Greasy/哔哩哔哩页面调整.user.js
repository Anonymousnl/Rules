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
	var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
	const settings = {
		debugRulesMode: false,
		debugFiltersMode: false,
		// 标记视频过滤器检测过的视频
		filterSign: "bili-cleaner-filter-visited"
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
	const debug = wrapper(console.log, settings.debugRulesMode);
	const debugFilter = wrapper(console.log, settings.debugFiltersMode);
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
					debug(`insertItem ${this.option.itemID} OK`);
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
					debug(`insertItemCSS ${this.option.itemID} CSS exist, ignore`);
					return;
				}
				const style = document.createElement("style");
				style.innerHTML = this.option.itemCSS.replace(/\n\s*/g, "").trim();
				style.setAttribute("bili-cleaner-css", this.option.itemID);
				document.documentElement.appendChild(style);
				debug(`insertItemCSS ${this.option.itemID} OK`);
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
					debug(`removeItemCSS ${this.option.itemID} OK`);
				}
			}
		}
		/** 监听item chekbox开关 */
		watchItem() {
			try {
				this.itemEle = document.querySelector(`#${this.option.itemID} input`);
				this.itemEle.addEventListener("change", (event) => {
					if(event.target.checked) {
						this.setStatus(true);
						this.insertItemCSS();
						if(this.option.itemFunc !== void 0) {
							this.option.itemFunc();
						}
					} else {
						this.setStatus(false);
						this.removeItemCSS();
						if(typeof this.option.callback === "function") {
							this.option.callback();
						}
					}
				});
				debug(`watchItem ${this.option.itemID} OK`);
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
					if(enableFunc && this.option.itemFunc instanceof Function) {
						this.option.itemFunc();
					}
					debug(`enableItem ${this.option.itemID} OK`);
				} catch (err) {
					error(`enableItem ${this.option.itemID} Error`);
					error(err);
				}
			}
		}
		/**
		 * 重载item, 用于非页面刷新但URL变动情况, 此时已注入CSS只重新运行func, 如: 非刷新式切换视频
		 */
		reloadItem() {
			if(this.option.isItemFuncReload && this.isEnable && this.option.itemFunc instanceof Function) {
				try {
					this.option.itemFunc();
					debug(`reloadItem ${this.option.itemID} OK`);
				} catch (err) {
					error(`reloadItem ${this.option.itemID} Error`);
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
					debug(`insertItem ${this.option.itemID} OK`);
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
					debug(`insertItemCSS ${this.option.itemID} CSS exist, ignore`);
					return;
				}
				const style = document.createElement("style");
				style.innerHTML = this.option.itemCSS.replace(/\n\s*/g, "").trim();
				style.setAttribute("bili-cleaner-css", this.option.itemID);
				document.documentElement.appendChild(style);
				debug(`insertItemCSS ${this.option.itemID} OK`);
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
					debug(`removeItemCSS ${this.option.itemID} OK`);
				}
			}
		}
		/** 监听item option开关 */
		watchItem() {
			try {
				this.itemEle = document.querySelector(`#${this.option.itemID} input`);
				this.itemEle.addEventListener("change", (event) => {
					if(event.target.checked) {
						debug(`radioItem ${this.option.itemID} checked`);
						this.setStatus(true);
						this.insertItemCSS();
						if(this.option.itemFunc !== void 0) {
							this.option.itemFunc();
						}
						this.option.radioItemIDList.forEach((targetID) => {
							var _a;
							if(targetID !== this.option.itemID) {
								const style = document.querySelector(`html>style[bili-cleaner-css=${targetID}]`);
								if(style) {
									(_a = style.parentNode) == null ? void 0 : _a.removeChild(style);
									debug(`removeItemCSS ${targetID} OK`);
								}
								this.setStatus(false, targetID);
								debug(`disable same name radioItem ${targetID}, OK`);
							}
						});
					}
				});
				debug(`watchItem ${this.option.itemID} OK`);
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
					if(enableFunc && this.option.itemFunc instanceof Function) {
						this.option.itemFunc();
					}
					debug(`enableItem ${this.option.itemID} OK`);
				} catch (err) {
					error(`enableItem ${this.option.itemID} Error`);
					error(err);
				}
			}
		}
		/**
		 * 重载item, 用于非页面刷新但URL变动情况, 此时已注入CSS只重新运行func, 如: 非刷新式切换视频
		 */
		reloadItem() {
			this.getStatus();
			if(this.option.isItemFuncReload && this.isEnable && this.option.itemFunc instanceof Function) {
				try {
					this.option.itemFunc();
					debug(`reloadItem ${this.option.itemID} OK`);
				} catch (err) {
					error(`reloadItem ${this.option.itemID} Error`);
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
		/** 获取数值, 初次安装使用禁用值 */
		getValue() {
			this.itemValue = _GM_getValue(`BILICLEANER_${this.option.itemID}`);
			if(this.itemValue === void 0) {
				this.itemValue = this.option.disableValue;
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
					debug(`insertItem ${this.option.itemID} OK`);
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
					debug(`insertItemCSS ${this.option.itemID} CSS exist, ignore`);
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
				debug(`insertItemCSS ${this.option.itemID} OK`);
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
					debug(`removeItemCSS ${this.option.itemID} OK`);
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
					debug(`${this.option.itemID} currValue ${itemEle.value}`);
					this.reloadItem();
					if(this.option.callback && typeof this.option.callback === "function") {
						this.option.callback(parseInt(itemEle.value));
					}
				});
				debug(`watchItem ${this.option.itemID} OK`);
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
					debug(`enableItem ${this.option.itemID} OK`);
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
					debug(`insertItem ${this.option.itemID} OK`);
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
					debug(`button ${this.option.itemID} click`);
					this.option.itemFunc();
				});
				debug(`watchItem ${this.option.itemID} OK`);
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
				debug(`insertGroupItems ${this.groupID} OK`);
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
				debug(`enableGroup ${this.groupID} OK`);
			} catch (err) {
				error(`enableGroup ${this.groupID} err`);
				error(err);
			}
		}
		/** 在URL变动时, 重载group内需要重载的项目 */
		reloadGroup() {
			try {
				this.items.forEach((e) => {
					if(e instanceof CheckboxItem || e instanceof RadioItem || e instanceof NumberItem) {
						e.reloadItem();
					}
				});
				debug(`reloadGroup ${this.groupID} OK`);
			} catch (err) {
				error(`reloadGroup ${this.groupID} err`);
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
				debug(`disableGroup ${this.groupID} OK`);
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
		if(host === "t.bilibili.com" || href.includes("bilibili.com/opus/")) {
			return "dynamic";
		}
		if(host === "live.bilibili.com") {
			if(pathname.match(/^\/(?:blanc\/)?\d+/)) {
				return "liveRoom";
			}
			return "liveHome";
		}
		if(href.includes("bilibili.com/bangumi/play/")) {
			return "bangumi";
		}
		if(href.includes("bilibili.com/list/watchlater") || href.includes("bilibili.com/list/ml")) {
			return "playlist";
		}
		if(!href.includes("bilibili.com/v/popular/") && href.includes("bilibili.com/v/")) {
			return "channel";
		}
		if(href.match(/bilibili\.com\/festival\/20\d\dbnj/) || href.includes("bilibili.com/festival/bnj20")) {
			return "bnj";
		}
		return "";
	};
	const ans = currPage();
	const isPageHomepage = () => ans === "homepage";
	const isPageVideo = () => ans === "video";
	const isPagePopular = () => ans === "popular";
	const isPageSearch = () => ans === "search";
	const isPageDynamic = () => ans === "dynamic";
	const isPageLiveHome = () => ans === "liveHome";
	const isPageLiveRoom = () => ans === "liveRoom";
	const isPageBangumi = () => ans === "bangumi";
	const isPagePlaylist = () => ans === "playlist";
	const isPageBnj = () => ans === "bnj";
	const isPageChannel = () => ans === "channel";
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
                }`
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
				description: "强制使用 6 列布局 (刷新)\n建议 隐藏发布时间，可选 显示活动轮播",
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
                    font-size: unset !important;
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
				itemCSS: `main:not(:has(.bilibili-app-recommend-root)) .bili-video-card__stats--item:nth-child(2) {visibility: hidden;}`
			}),
			// 隐藏 稍后再看按钮
			new CheckboxItem({
				itemID: "homepage-hide-bili-watch-later",
				description: "隐藏 稍后再看按钮",
				itemCSS: `.bili-watch-later {display: none !important;}`
			}),
			// 隐藏 广告, 默认开启
			new CheckboxItem({
				itemID: "homepage-hide-ad-card",
				description: "隐藏 广告",
				defaultStatus: true,
				itemCSS: `.feed-card:has(.bili-video-card__info--ad, [href*="cm.bilibili.com"]) {
                    display: none !important;
                }
                .bili-video-card.is-rcmd:has(.bili-video-card__info--ad, [href*="cm.bilibili.com"]) {
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
			// 关闭 视频载入 骨架动效(skeleton animation) 实验性
			new CheckboxItem({
				itemID: "homepage-hide-skeleton-animation",
				description: "关闭 视频载入 骨架动效 (实验性)",
				itemCSS: `.bili-video-card .loading_animation .bili-video-card__skeleton--light,
                .bili-video-card .loading_animation .bili-video-card__skeleton--text,
                .bili-video-card .loading_animation .bili-video-card__skeleton--face,
                .bili-video-card .loading_animation .bili-video-card__skeleton--cover {
                    animation: none !important;
                }
                .skeleton .skeleton-item {
                    animation: none !important;
                }`
			}),
			// 隐藏 视频载入 骨架(skeleton) 实验性
			new CheckboxItem({
				itemID: "homepage-hide-skeleton",
				description: "隐藏 视频载入 骨架 (实验性)",
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
				description: "增大 视频载入 视频数量 (实验性)",
				itemCSS: `
            /* 扩增载入后会产生奇怪的骨架空位 */
            .floor-single-card:has(.skeleton, .skeleton-item) {
                display: none;
            }`,
				itemFunc: () => {
					const origFetch = _unsafeWindow.fetch;
					_unsafeWindow.fetch = (input, init2) => {
						var _a;
						if(typeof input == "string" && input.includes("api.bilibili.com") && input.includes("feed/rcmd") && ((_a = init2 == null ? void 0 : init2.method) == null ? void 0 : _a.toUpperCase()) === "GET") {
							input = input.replace("&ps=12&", "&ps=24&");
						}
						return origFetch(input, init2);
					};
				}
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
	const cleanURL = () => {
		const keysToRemove = /* @__PURE__ */ new Set(["from_source", "spm_id_from", "search_source", "vd_source", "unique_k", "is_story_h5", "from_spmid", "share_plat", "share_medium", "share_from", "share_source", "share_tag", "up_id", "timestamp", "mid", "live_from", "launch_id", "session_id", "share_session_id", "broadcast_type", "is_room_feed", "spmid", "plat_id", "goto", "report_flow_data", "trackid", "live_form", "track_id", "from", "visit_id", "extra_jump_from"]);
		if(isPageSearch()) {
			keysToRemove.add("vt");
		}
		const url = location.href;
		const urlObj = new URL(url);
		const params = new URLSearchParams(urlObj.search);
		const temp = [];
		for(const k of params.keys()) {
			if(keysToRemove.has(k)) {
				temp.push(k);
			}
		}
		for(const k of temp) {
			params.delete(k);
		}
		if(params.has("p") && params.get("p") == "1") {
			params.delete("p");
		}
		urlObj.search = params.toString();
		let newURL = urlObj.toString();
		if(newURL.endsWith("/")) {
			newURL = newURL.slice(0, -1);
		}
		if(newURL !== url) {
			history.replaceState(null, "", newURL);
		}
		debug("cleanURL complete");
	};
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
                    scrollbar-width: thin !important;
                }
            }`
		}),
		// URL参数净化, 在urlchange时需重载, 默认开启, 关闭功能需刷新
		// 以前会出现URL缺少参数导致充电窗口载入失败报错NaN的bug, 现无法复现, 猜测已修复
		new CheckboxItem({
			itemID: "url-cleaner",
			description: "URL参数净化",
			defaultStatus: true,
			itemFunc: cleanURL,
			isItemFuncReload: true
		})
	];
	commonGroupList.push(new Group("common-basic", "全站通用项 基本功能", basicItems));
	if(!isPageLiveHome()) {
		const headerLeftItems = [
			// 隐藏 主站Logo
			new CheckboxItem({
				itemID: "common-hide-nav-homepage-logo",
				description: "隐藏 主站Logo",
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href="//www.bilibili.com"]) svg {
                    display: none !important;
                }
                /* 旧版header */
                #internationalHeader li.nav-link-item:has(>span>a[href="//www.bilibili.com"], >span>a[href="www.bilibili.com/"]) .navbar_logo {
                    display: none !important;
                }
                #biliMainHeader .left-entry .v-popover-wrap a[href="https://www.bilibili.com/"]>svg {
                    display: none !important;
                }`
			}),
			// 隐藏 首页
			new CheckboxItem({
				itemID: "common-hide-nav-homepage",
				description: "隐藏 首页",
				itemCSS: `div.bili-header__bar li:has(>a[href="//www.bilibili.com"]) span {
                    display: none !important;
                }
                div.bili-header__bar .left-entry .v-popover-wrap:has(>a[href="//www.bilibili.com"]) div {
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
                }`
			}),
			// 隐藏 番剧
			new CheckboxItem({
				itemID: "common-hide-nav-anime",
				description: "隐藏 番剧",
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href="//www.bilibili.com/anime/"]) {
                    display: none !important;
                }
                /* 旧版header */
                #internationalHeader li.nav-link-item:has(>a[href*="bilibili.com/anime"]) {
                    display: none !important;
                }
                #biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="bilibili.com/anime"]) {
                    display: none !important;
                }`
			}),
			// 隐藏 直播
			new CheckboxItem({
				itemID: "common-hide-nav-live",
				description: "隐藏 直播",
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href="//live.bilibili.com"], >a[href="//live.bilibili.com/"]) {
                    display: none !important;
                }
                /* 旧版header */
                #internationalHeader li.nav-link-item:has(>span>a[href*="live.bilibili.com"]) {
                    display: none !important;
                }
                #biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="live.bilibili.com"]) {
                    display: none !important;
                }`
			}),
			// 隐藏 游戏中心
			new CheckboxItem({
				itemID: "common-hide-nav-game",
				description: "隐藏 游戏中心",
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href^="//game.bilibili.com"]) {
                    display: none !important;
                }
                /* 旧版header */
                #internationalHeader li.nav-link-item:has(>span>a[href*="game.bilibili.com"]) {
                    display: none !important;
                }
                #biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="game.bilibili.com"]) {
                    display: none !important;
                }`
			}),
			// 隐藏 会员购
			new CheckboxItem({
				itemID: "common-hide-nav-vipshop",
				description: "隐藏 会员购",
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href^="//show.bilibili.com"]) {
                    display: none !important;
                }
                /* 旧版header */
                #internationalHeader li.nav-link-item:has(>a[href*="show.bilibili.com"]) {
                    display: none !important;
                }
                #biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="show.bilibili.com"]) {
                    display: none !important;
                }`
			}),
			// 隐藏 漫画
			new CheckboxItem({
				itemID: "common-hide-nav-manga",
				description: "隐藏 漫画",
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href^="//manga.bilibili.com"]) {
                    display: none !important;
                }
                /* 旧版header */
                #internationalHeader li.nav-link-item:has(>span>a[href*="manga.bilibili.com"]) {
                    display: none !important;
                }
                #biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="manga.bilibili.com"]) {
                    display: none !important;
                }`
			}),
			// 隐藏 赛事
			new CheckboxItem({
				itemID: "common-hide-nav-match",
				description: "隐藏 赛事",
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href^="//www.bilibili.com/match/"], >a[href^="//www.bilibili.com/v/game/match/"]) {
                    display: none !important;
                }
                /* 旧版header */
                #internationalHeader li.nav-link-item:has(>a[href*="bilibili.com/match/"]) {
                    display: none !important;
                }
                #biliMainHeader .left-entry .v-popover-wrap:has(>a[href*="bilibili.com/match/"]) {
                    display: none !important;
                }`
			}),
			// 隐藏 活动/活动直播
			new CheckboxItem({
				itemID: "common-hide-nav-moveclip",
				description: "隐藏 活动/活动直播",
				itemCSS: `div.bili-header__bar li:has(.loc-mc-box) {
                    display: none !important;
                }
                div.bili-header__bar .left-entry li:not(:has(.v-popover)):has([href^="https://live.bilibili.com/"]) {
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
				itemCSS: `div.bili-header__bar .left-entry li:has(>div>a[href*="bilibili.com/BPU20"]) {display: none !important;}`
			}),
			// 隐藏 下载客户端, 默认开启
			new CheckboxItem({
				itemID: "common-hide-nav-download-app",
				description: "隐藏 下载客户端",
				defaultStatus: true,
				itemCSS: `div.bili-header__bar .left-entry li:has(a[href="//app.bilibili.com"]) {
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
				itemCSS: `div.bili-header__bar .left-entry li:has(>a[href*="bilibili.com/blackboard"]) {
                    display: none !important;
                }
                div.bili-header__bar .left-entry li:has(>div>a[href*="bilibili.com/blackboard"]) {
                    display: none !important;
                }
                div.bili-header__bar .left-entry li:has(>a[href*="bilibili.com/video/"]) {
                    display: none !important;
                }
                div.bili-header__bar .left-entry li:has(>div>a[href*="bilibili.com/video/"]) {
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
				itemCSS: `#nav-searchform .nav-search-input::placeholder {color: transparent;}
                /* 旧版header */
                #internationalHeader #nav_searchform input::placeholder {color: transparent;}`
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
                .right-entry .v-popover-wrap:has([href*="//message.bilibili.com"], [data-idx="message"]) .red-num--message {
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
			// 收藏、稍后再看 相关 一组互斥选项
			// 显示收藏 (官方默认), 默认开启
			new RadioItem({
				itemID: "common-nav-favorite-watchlater-default",
				description: "显示 收藏 (官方默认)\n新增稍后再看视频时，自动切换为稍后再看",
				radioName: "common-header-fav-option",
				radioItemIDList: ["common-nav-favorite-watchlater-default", "common-hide-nav-favorite", "common-hide-nav-favorite-keep-watchlater", "common-nav-keep-watchlater"],
				defaultStatus: true
			}),
			// 隐藏 收藏, 隐藏 稍后再看
			new RadioItem({
				itemID: "common-hide-nav-favorite",
				description: "隐藏 收藏，隐藏 稍后再看",
				radioName: "common-header-fav-option",
				radioItemIDList: ["common-nav-favorite-watchlater-default", "common-hide-nav-favorite", "common-hide-nav-favorite-keep-watchlater", "common-nav-keep-watchlater"],
				itemCSS: `.right-entry .v-popover-wrap:has(.header-favorite-container, [data-idx="fav"]) {
                        display: none !important;
                    }
                    /* 旧版header */
                    #internationalHeader .nav-user-center .item:has(.mini-favorite) {
                        display: none !important;
                    }`
			}),
			// 隐藏 收藏, 显示 稍后再看
			new RadioItem({
				itemID: "common-hide-nav-favorite-keep-watchlater",
				description: "隐藏 收藏，显示 稍后再看",
				radioName: "common-header-fav-option",
				radioItemIDList: ["common-nav-favorite-watchlater-default", "common-hide-nav-favorite", "common-hide-nav-favorite-keep-watchlater", "common-nav-keep-watchlater"],
				itemCSS: `
                    /* 移除加入稍后再看时的上翻动画 */
                    .right-entry .v-popover-wrap .header-favorite-container-box {
                        animation: unset !important;
                    }
                    .right-entry .v-popover-wrap .header-favorite-container-box .header-favorite-container__up {
                        display: none !important;
                    }
                    .right-entry .v-popover-wrap .header-favorite-container-box .header-favorite-container__down {
                        margin-top: 4px !important;
                    }
                    @media (max-width: 1279.9px) {
                        .right-entry .v-popover-wrap .header-favorite-container-box .header-favorite-container__down {
                            top: 10px;
                        }
                    }`
			}),
			// 显示 收藏, 显示 稍后再看(实验性)
			new RadioItem({
				itemID: "common-nav-keep-watchlater",
				description: "显示 收藏，显示 稍后再看(实验性)",
				radioName: "common-header-fav-option",
				radioItemIDList: ["common-nav-favorite-watchlater-default", "common-hide-nav-favorite", "common-hide-nav-favorite-keep-watchlater", "common-nav-keep-watchlater"],
				itemCSS: `
                    /* 移除加入稍后再看时的上翻动画 */
                    .right-entry .v-popover-wrap .header-favorite-container-box {
                        display: flex !important;
                        animation: unset !important;
                    }
                    .right-entry .v-popover-wrap .header-favorite-container-box .header-favorite-container__down {
                        margin-top: 0 !important;
                    }
                    @media (max-width: 1279.9px) {
                        .right-entry .v-popover-wrap .header-favorite-container-box .header-favorite-container__down {
                            top: 15px;
                        }
                    }`
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
				itemCSS: `.bili-header .bili-header__bar {padding-left: ???px !important;}`,
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
				itemCSS: `.bili-header .center-search-container .center-search__bar {
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
				itemCSS: `.bili-header .bili-header__bar {padding-right: ???px !important;}`,
				itemCSSPlaceholder: "???"
			})
		];
		commonGroupList.push(new Group("common-header-bar-value", "全站通用项 顶栏 数值设定 (-1禁用)", headerWidthItems));
	}
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
	const hideVideo = (video) => {
		video.style.setProperty("display", "none", "important");
	};
	const showVideo = (video) => {
		if(video.style.display === "none") {
			video.style.removeProperty("display");
		}
	};
	const isVideoHide = (video) => {
		return video.style.display === "none";
	};
	const waitForEle = async (watchEle, selector, isTargetNode) => {
		let ele = watchEle.querySelector(selector);
		if(ele) {
			return ele;
		}
		return await new Promise((resolve) => {
			const obverser = new MutationObserver((mutationList) => {
				mutationList.forEach((mutation) => {
					if(mutation.addedNodes) {
						mutation.addedNodes.forEach((node) => {
							if(isTargetNode(node)) {
								obverser.disconnect();
								ele = watchEle.querySelector(selector);
								resolve(ele);
							}
						});
					}
				});
			});
			obverser.observe(watchEle, {
				childList: true,
				subtree: true
			});
		});
	};
	const bv2av = () => {
		const dec = (x) => {
			const table = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF";
			const tr = {};
			for(let i = 0; i < 58; i++) {
				tr[table[i]] = i;
			}
			const s = [11, 10, 3, 8, 4, 6];
			const xor = 177451812;
			const add = 8728348608;
			let r = 0;
			for(let i = 0; i < 6; i++) {
				r += tr[x[s[i]]] * 58 ** i;
			}
			const aid = r - add ^ xor;
			return aid > 0 ? aid : aid + 2147483648;
		};
		const getAid = () => {
			var _a;
			return (_a = window.vd) == null ? void 0 : _a.aid;
		};
		if(location.href.includes("bilibili.com/video/BV")) {
			const bvid = matchBvid(location.href);
			if(bvid) {
				let partNum = "";
				const params = new URLSearchParams(location.search);
				if(params.has("p")) {
					partNum += `?p=${params.get("p")}`;
				}
				const aid = getAid() ?? dec(bvid);
				const newURL = `https://www.bilibili.com/video/av${aid}${partNum}${location.hash}`;
				history.replaceState(null, "", newURL);
				debug("bv2av complete");
			}
		}
	};
	let isSimpleShareBtn = false;
	const simpleShare = () => {
		if(isSimpleShareBtn) {
			return;
		}
		let shareBtn;
		let counter = 0;
		const checkElement = setInterval(() => {
			counter++;
			shareBtn = document.getElementById("share-btn-outer");
			if(shareBtn) {
				isSimpleShareBtn = true;
				clearInterval(checkElement);
				shareBtn.addEventListener("click", () => {
					var _a, _b;
					let title = (_a = document.querySelector("#viewbox_report > h1")) == null ? void 0 : _a.textContent;
					if(!title) {
						title = (_b = document.querySelector(".video-title-href")) == null ? void 0 : _b.textContent;
						if(!title) {
							return;
						}
					}
					if(!"（({【[［《「＜｛〔〖<〈『".includes(title[0]) && !"）)}】]］》」＞｝〕〗>〉』".includes(title.slice(-1))) {
						title = `【${title}】`;
					}
					const avbv = matchAvidBvid(location.href);
					let shareText = `${title}
https://www.bilibili.com/video/${avbv}`;
					const urlObj = new URL(location.href);
					const params = new URLSearchParams(urlObj.search);
					if(params.has("p")) {
						shareText += `?p=${params.get("p")}`;
					}
					navigator.clipboard.writeText(shareText);
				});
				debug("simpleShare complete");
			} else if(counter > 50) {
				clearInterval(checkElement);
				debug("simpleShare timeout");
			}
		}, 200);
	};
	const overridePlayerHeight = () => {
		const genSizeCSS = () => {
			const e = window.isWide;
			const i = window.innerHeight;
			const t = Math.max(document.body && document.body.clientWidth || window.innerWidth, 1100);
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
			if(window.isWide) {
				a -= 125;
				d -= 100;
			}
			let l;
			if(window.hasBlackSide && !window.isWide) {
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
				debug("override setSize OK");
			} else {
				overrideStyle.innerHTML = genSizeCSS();
				debug("refresh setSize OK");
			}
		};
		const observeStyle = new MutationObserver(() => {
			if(document.getElementById("setSizeStyle")) {
				overrideCSS();
				observeStyle.disconnect();
			}
		});
		if(document.head) {
			observeStyle.observe(document.head, {
				childList: true
			});
		}
		let isWide = window.isWide;
		const observeBtn = new MutationObserver(() => {
			const wideBtn = document.querySelector("#bilibili-player .bpx-player-ctrl-wide");
			if(wideBtn) {
				wideBtn.addEventListener("click", () => {
					debug("wideBtn click detected");
					window.isWide = !isWide;
					isWide = !isWide;
					overrideCSS();
				});
				observeBtn.disconnect();
			}
		});
		document.addEventListener("DOMContentLoaded", () => {
			observeBtn.observe(document, {
				childList: true,
				subtree: true
			});
		});
	};
	const coinDisableAutoLike$1 = () => {
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
	};
	const videoGroupList = [];
	if(isPageVideo() || isPagePlaylist()) {
		const basicItems2 = [
			// BV号转AV号, 在url变化时需重载, 关闭功能需刷新
			new CheckboxItem({
				itemID: "video-page-bv2av",
				description: "BV号转AV号",
				itemFunc: bv2av,
				isItemFuncReload: true
			}),
			// 净化分享, 默认开启, 关闭功能需刷新
			new CheckboxItem({
				itemID: "video-page-simple-share",
				description: "净化分享功能 (充电时需关闭)",
				defaultStatus: true,
				itemFunc: simpleShare,
				itemCSS: `.video-share-popover .video-share-dropdown .dropdown-bottom {display: none !important;}
                .video-share-popover .video-share-dropdown .dropdown-top {padding: 15px !important;}
                .video-share-popover .video-share-dropdown .dropdown-top .dropdown-top-right {display: none !important;}
                .video-share-popover .video-share-dropdown .dropdown-top .dropdown-top-left {padding-right: 0 !important;}`
			}),
			// 顶栏 滚动页面后不再吸附顶部
			new CheckboxItem({
				itemID: "video-page-hide-fixed-header",
				description: "顶栏 滚动页面后不再吸附顶部",
				itemCSS: `.fixed-header .bili-header__bar {position: relative !important;}`
			}),
			// 播放器和视频信息 交换位置(实验性)
			new CheckboxItem({
				itemID: "video-page-exchange-player-position",
				description: "播放器和视频信息 交换位置(实验性)",
				itemCSS: `.left-container {
                    display: flex !important;
                    flex-direction: column !important;
                    padding-top: 50px !important;
                }
                #viewbox_report {order: 2;}
                #playerWrap {order: 1;}
                #arc_toolbar_report {order: 3;}
                .left-container-under-player {order: 4;}
                .video-info-container {height: unset !important; padding-top: 16px !important;}
                .video-toolbar-container {padding-top: 12px !important;}`
			})
		];
		videoGroupList.push(new Group("video-basic", "播放页 基本功能", basicItems2));
		const infoItems = [
			// 隐藏 弹幕数
			new CheckboxItem({
				itemID: "video-page-hide-video-info-danmaku-count",
				description: "隐藏 弹幕数",
				itemCSS: `.video-info-detail .dm {display: none !important;}`
			}),
			// 隐藏 发布日期
			new CheckboxItem({
				itemID: "video-page-hide-video-info-pubdate",
				description: "隐藏 发布日期",
				itemCSS: `.video-info-detail .pubdate-ip {display: none !important;}`
			}),
			// 隐藏 版权声明
			new CheckboxItem({
				itemID: "video-page-hide-video-info-copyright",
				description: "隐藏 版权声明",
				itemCSS: `.video-info-detail .copyright {display: none !important;}`
			}),
			// 隐藏 视频荣誉(排行榜/每周必看)
			new CheckboxItem({
				itemID: "video-page-hide-video-info-honor",
				description: "隐藏 视频荣誉(排行榜/每周必看)",
				itemCSS: `.video-info-detail .honor-rank, .video-info-detail .honor-weekly {display: none !important;}`
			}),
			// 隐藏 温馨提示(饮酒/危险/AI生成), 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-video-info-argue",
				description: "隐藏 温馨提示(饮酒/危险/AI生成)",
				defaultStatus: true,
				itemCSS: `.video-info-detail .argue, .video-info-detail .video-argue {display: none !important;}`
			})
		];
		videoGroupList.push(new Group("video-info", "视频信息", infoItems));
	}
	if(isPageVideo() || isPagePlaylist() || isPageBnj()) {
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
			// 隐藏 打卡弹窗
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-clock",
				description: "隐藏 打卡弹窗",
				itemCSS: `.bpx-player-video-area .bili-clock {display: none !important;}`
			}),
			// 隐藏 视频预告
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-reserve",
				description: "隐藏 视频预告",
				itemCSS: `.bpx-player-video-area .bili-reserve {display: none !important;}`
			}),
			// 隐藏 视频链接
			new CheckboxItem({
				itemID: "video-page-hide-bpx-player-bili-link",
				description: "隐藏 视频链接",
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
			// 隐藏 爆炸特效弹幕
			new CheckboxItem({
				itemID: "video-page-bpx-player-bili-dm-boom",
				description: "隐藏 爆炸特效弹幕",
				itemCSS: `.bili-boom {display: none !important}`
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
				description: "非全屏下 关闭弹幕栏 (刷新去黑边)",
				itemFunc: overridePlayerHeight,
				// video page的player height由JS动态设定
				itemCSS: `.bpx-player-sending-area {display: none !important;}
                /* 活动播放器直接去黑边 */
                .page-main-content:has(.festival-video-player) .video-player-box {height: fit-content !important;}
                .festival-video-player {height: fit-content !important;}
                .festival-video-player #bilibili-player:not(.mode-webscreen) {height: calc(100% - 46px) !important;}`
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
				itemFunc: coinDisableAutoLike$1
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
				itemCSS: `.comment-container .top-vote-card {display: none !important;}`
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
                .up-avatar-wrap .up-avatar {background-color: transparent !important;}`
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
                .video-sections-head_first-line .next-button {display: none !important;}`
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
                    display: none !important;
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
				itemCSS: `#right-bottom-banner {display: none !important;}`
			}),
			// 隐藏 直播间推荐, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-right-container-live",
				description: "隐藏 直播间推荐",
				defaultStatus: true,
				itemCSS: `.right-container .pop-live-small-mode {display: none !important;}`
			})
		];
		videoGroupList.push(new Group("video-right", "右侧 视频栏", rightItems));
		const commentItems = [
			// 隐藏 活动/notice, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-notice",
				description: "隐藏 活动/notice",
				defaultStatus: true,
				itemCSS: `.comment-container .reply-header .reply-notice {display: none !important;}`
			}),
			// 隐藏 整个评论框
			new CheckboxItem({
				itemID: "video-page-hide-main-reply-box",
				description: "隐藏 整个评论框",
				// 不可使用display: none, 会使底部吸附评论框宽度变化
				itemCSS: `.comment-container .main-reply-box {height: 0 !important; visibility: hidden !important;}
                .comment-container .reply-list {margin-top: -20px !important;}`
			}),
			// 隐藏 页面底部 吸附评论框, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-fixed-reply-box",
				description: "隐藏 页面底部 吸附评论框",
				defaultStatus: true,
				itemCSS: `.comment-container .fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 评论编辑器内占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-box-textarea-placeholder",
				description: "隐藏 评论编辑器内占位文字",
				defaultStatus: true,
				itemCSS: `.main-reply-box .reply-box-textarea::placeholder {color: transparent !important;}
                .fixed-reply-box .reply-box-textarea::placeholder {color: transparent !important;}`
			}),
			// 隐藏 评论内容右侧装饰
			new CheckboxItem({
				itemID: "video-page-hide-reply-decorate",
				description: "隐藏 评论内容右侧装饰",
				itemCSS: `.comment-container .reply-decorate {display: none !important;}`
			}),
			// 隐藏 ID后粉丝牌
			new CheckboxItem({
				itemID: "video-page-hide-fan-badge",
				description: "隐藏 ID后粉丝牌",
				itemCSS: `.comment-container .fan-badge {display: none !important;}`
			}),
			// 隐藏 一级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-user-level",
				description: "隐藏 一级评论用户等级",
				itemCSS: `.comment-container .user-level {display: none !important;}`
			}),
			// 隐藏 二级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-sub-user-level",
				description: "隐藏 二级评论用户等级",
				itemCSS: `.comment-container .sub-user-level {display: none !important;}`
			}),
			// 隐藏 用户头像外圈饰品
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-pendent-dom",
				description: "隐藏 用户头像外圈饰品",
				itemCSS: `.comment-container .root-reply-avatar .bili-avatar-pendent-dom {display: none !important;}
            .comment-container .root-reply-avatar .bili-avatar {width: 48px !important; height:48px !important;}`
			}),
			// 隐藏 用户头像右下小icon
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-nft-icon",
				description: "隐藏 用户头像右下小icon",
				itemCSS: `.comment-container .bili-avatar-nft-icon {display: none !important;}
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
				itemCSS: `.comment-container .reply-tag-list {display: none !important;}`
			}),
			// 隐藏 笔记评论前的小Logo, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-note-prefix",
				description: "隐藏 笔记评论前的小Logo",
				defaultStatus: true,
				itemCSS: `.comment-container .note-prefix {display: none !important;}`
			}),
			// 隐藏 评论内容搜索关键词高亮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-jump-link-search-word",
				description: "隐藏 评论内容搜索关键词高亮",
				defaultStatus: true,
				itemCSS: `.comment-container .reply-content .jump-link.search-word {color: inherit !important;}
                .comment-container .reply-content .jump-link.search-word:hover {color: #008AC5 !important;}
                .comment-container .reply-content .icon.search-word {display: none !important;}`
			}),
			// 隐藏 二级评论中的@高亮
			new CheckboxItem({
				itemID: "video-page-hide-reply-content-user-highlight",
				description: "隐藏 二级评论中的@高亮",
				itemCSS: `.comment-container .sub-reply-container .reply-content .jump-link.user {color: inherit !important;}
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
                .reply-item:has(.jump-link.user[data-user-id="473018527"]) {
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
                .reply-item:has(.root-reply-container .user-name[data-user-id="473018527"]) {
                    display: none !important;
                }`)
			}),
			// 隐藏 包含@的 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-at-reply",
				description: "隐藏 包含@的 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.root-reply .jump-link.user):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 包含@的 全部评论
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-all",
				description: "隐藏 包含@的 全部评论",
				itemCSS: `.comment-container .reply-item:has(.root-reply .jump-link.user):not(:has(.sub-up-icon)) {display: none !important;}`
			}),
			// 隐藏 LV1 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv1-reply",
				description: "隐藏 LV1 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.st1.lv1):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV2 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv2-reply",
				description: "隐藏 LV2 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.st1.lv2):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV3 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv3-reply",
				description: "隐藏 LV3 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.st1.lv3):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 一级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-root-reply-dislike-reply-btn",
				description: "一级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.comment-container .reply-info:not(:has(i.disliked)) .reply-btn,
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
				itemCSS: `.comment-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-btn,
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
				itemCSS: `.comment-container .emoji-large {display: none !important;}`
			}),
			// 大表情变成小表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large-zoom",
				description: "大表情变成小表情",
				itemCSS: `.comment-container .emoji-large {zoom: .5;}`
			}),
			// 用户名 全部大会员色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-pink",
				description: "用户名 全部大会员色",
				itemCSS: `.comment-container .reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #FB7299 !important;}}`
			}),
			// 用户名 全部恢复默认色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-default",
				description: "用户名 全部恢复默认色",
				itemCSS: `.comment-container .reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #61666d !important;}}`
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
                .reply-view-image .preview-list:has(.preview-item-box:only-child) {display: none !important;}
                .reply-view-image .preview-list {opacity: 0.2; transition: opacity 0.1s ease-in-out;}
                .reply-view-image .preview-list:hover {opacity: 1; transition: opacity 0.1s ease-in-out;}`
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
			// 隐藏 小窗播放器
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-right-container-live",
				description: "隐藏 小窗播放器",
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
	let isBangumiSimpleShareBtn = false;
	const bangumiSimpleShare = () => {
		if(isBangumiSimpleShareBtn) {
			return;
		}
		let shareBtn;
		let counter = 0;
		const checkElement = setInterval(() => {
			counter++;
			shareBtn = document.getElementById("share-container-id");
			if(shareBtn) {
				isBangumiSimpleShareBtn = true;
				clearInterval(checkElement);
				shareBtn.addEventListener("click", () => {
					var _a, _b;
					const mainTitle = (_a = document.querySelector("[class^='mediainfo_mediaTitle']")) == null ? void 0 : _a.textContent;
					const subTitle = (_b = document.getElementById("player-title")) == null ? void 0 : _b.textContent;
					const shareText = `《${mainTitle}》${subTitle}
https://www.bilibili.com${location.pathname}`;
					navigator.clipboard.writeText(shareText);
				});
				debug("bangumiSimpleShare complete");
			} else if(counter > 50) {
				clearInterval(checkElement);
				debug("bangumiSimpleShare timeout");
			}
		}, 200);
	};
	const coinDisableAutoLike = () => {
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
	};
	if(isPageBangumi()) {
		const basicItems2 = [
			// 净化分享功能, 默认开启, 关闭功能需刷新
			new CheckboxItem({
				itemID: "video-page-simple-share",
				description: "净化分享功能",
				defaultStatus: true,
				itemFunc: bangumiSimpleShare,
				itemCSS: `#share-container-id [class^='Share_boxBottom'] {display: none !important;}
                        #share-container-id [class^='Share_boxTop'] {padding: 15px !important;}
                        #share-container-id [class^='Share_boxTopRight'] {display: none !important;}
                        #share-container-id [class^='Share_boxTopLeft'] {padding: 0 !important;}`
			}),
			// 顶栏 滚动页面后不再吸附顶部
			new CheckboxItem({
				itemID: "video-page-hide-fixed-header",
				description: "顶栏 滚动页面后不再吸附顶部",
				itemCSS: `.fixed-header .bili-header__bar {position: relative !important;}`
			})
		];
		bangumiGroupList.push(new Group("bangumi-basic", "版权视频播放页 基本功能", basicItems2));
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
				itemFunc: coinDisableAutoLike
			}),
			// 隐藏 分享按钮弹出菜单, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-video-share-popover",
				description: "隐藏 分享按钮弹出菜单",
				defaultStatus: true,
				itemCSS: `#share-container-id [class^='Share_share'] {display: none !important;}`
			}),
			// bangumi独有项：隐藏 用手机观看, 默认开启
			new CheckboxItem({
				itemID: "bangumi-page-hide-watch-on-phone",
				description: "隐藏 用手机观看 ★",
				defaultStatus: true,
				itemCSS: `.toolbar span:has(>[class^='Phone_mobile']) {display: none !important;}`
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
				itemCSS: `[class^='vipPaybar_'] {display: none !important;}`
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
				itemCSS: `#comment-module .reply-header .reply-notice {display: none !important;}`
			}),
			// 隐藏 整个评论框
			new CheckboxItem({
				itemID: "video-page-hide-main-reply-box",
				description: "隐藏 整个评论框",
				itemCSS: `#comment-module .main-reply-box {height: 0 !important; visibility: hidden !important;}
                #comment-module .reply-list {margin-top: -20px !important;}`
			}),
			// 隐藏 页面底部 吸附评论框, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-fixed-reply-box",
				description: "隐藏 页面底部 吸附评论框",
				defaultStatus: true,
				itemCSS: `#comment-module .fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 评论编辑器内占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-box-textarea-placeholder",
				description: "隐藏 评论编辑器内占位文字",
				defaultStatus: true,
				itemCSS: `#comment-module .main-reply-box .reply-box-textarea::placeholder {color: transparent !important;}
                #comment-module .fixed-reply-box .reply-box-textarea::placeholder {color: transparent !important;}`
			}),
			// 隐藏 评论内容右侧装饰
			new CheckboxItem({
				itemID: "video-page-hide-reply-decorate",
				description: "隐藏 评论内容右侧装饰",
				itemCSS: `#comment-module .reply-decorate {display: none !important;}`
			}),
			// 隐藏 ID后粉丝牌
			new CheckboxItem({
				itemID: "video-page-hide-fan-badge",
				description: "隐藏 ID后粉丝牌",
				itemCSS: `#comment-module .fan-badge {display: none !important;}`
			}),
			// 隐藏 一级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-user-level",
				description: "隐藏 一级评论用户等级",
				itemCSS: `#comment-module .user-level {display: none !important;}`
			}),
			// 隐藏 二级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-sub-user-level",
				description: "隐藏 二级评论用户等级",
				itemCSS: `#comment-module .sub-user-level {display: none !important;}`
			}),
			// 隐藏 用户头像外圈饰品
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-pendent-dom",
				description: "隐藏 用户头像外圈饰品",
				itemCSS: `#comment-module .root-reply-avatar .bili-avatar-pendent-dom {display: none !important;}
            #comment-module .root-reply-avatar .bili-avatar {width: 48px !important; height:48px !important;}`
			}),
			// 隐藏 用户头像右下小icon
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-nft-icon",
				description: "隐藏 用户头像右下小icon",
				itemCSS: `#comment-module .bili-avatar-nft-icon {display: none !important;}
                #comment-module .bili-avatar-icon {display: none !important;}`
			}),
			// 隐藏 评论内容下tag(热评)
			new CheckboxItem({
				itemID: "video-page-hide-reply-tag-list",
				description: "隐藏 评论内容下tag(热评)",
				itemCSS: `#comment-module .reply-tag-list {display: none !important;}`
			}),
			// 隐藏 笔记评论前的小Logo, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-note-prefix",
				description: "隐藏 笔记评论前的小Logo",
				defaultStatus: true,
				itemCSS: `#comment-module .note-prefix {display: none !important;}`
			}),
			// 隐藏 评论内容搜索关键词高亮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-jump-link-search-word",
				description: "隐藏 评论内容搜索关键词高亮",
				defaultStatus: true,
				itemCSS: `#comment-module .reply-content .jump-link.search-word {color: inherit !important;}
                #comment-module .reply-content .jump-link.search-word:hover {color: #008AC5 !important;}
                #comment-module .reply-content .icon.search-word {display: none !important;}`
			}),
			// 隐藏 二级评论中的@高亮
			new CheckboxItem({
				itemID: "video-page-hide-reply-content-user-highlight",
				description: "隐藏 二级评论中的@高亮",
				itemCSS: `#comment-module .sub-reply-container .reply-content .jump-link.user {color: inherit !important;}
                #comment-module .sub-reply-container .reply-content .jump-link.user:hover {color: #40C5F1 !important;}`
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
                .reply-item:has(.jump-link.user[data-user-id="473018527"]) {
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
                .reply-item:has(.root-reply-container .user-name[data-user-id="473018527"]) {
                    display: none !important;
                }`)
			}),
			// 隐藏 包含@的 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-at-reply",
				description: "隐藏 包含@的 无人点赞评论",
				itemCSS: `#comment-module .reply-item:has(.root-reply .jump-link.user):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 包含@的 全部评论
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-all",
				description: "隐藏 包含@的 全部评论",
				itemCSS: `#comment-module .reply-item:has(.root-reply .jump-link.user):not(:has(.sub-up-icon)) {display: none !important;}`
			}),
			// 隐藏 LV1 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv1-reply",
				description: "隐藏 LV1 无人点赞评论",
				itemCSS: `#comment-module .reply-item:has(.st1.lv1):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV2 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv2-reply",
				description: "隐藏 LV2 无人点赞评论",
				itemCSS: `#comment-module .reply-item:has(.st1.lv2):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV3 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv3-reply",
				description: "隐藏 LV3 无人点赞评论",
				itemCSS: `#comment-module .reply-item:has(.st1.lv3):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 一级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-root-reply-dislike-reply-btn",
				description: "一级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `#comment-module .reply-info:not(:has(i.disliked)) .reply-btn,
                #comment-module .reply-info:not(:has(i.disliked)) .reply-dislike {
                    visibility: hidden;
                }
                #comment-module .reply-item:hover .reply-info .reply-btn,
                #comment-module .reply-item:hover .reply-info .reply-dislike {
                    visibility: visible !important;
                }`
			}),
			// 二级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-sub-reply-dislike-reply-btn",
				description: "二级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `#comment-module .sub-reply-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-btn,
                #comment-module .sub-reply-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-dislike {
                    visibility: hidden;
                }
                #comment-module .sub-reply-container .sub-reply-item:hover .sub-reply-btn,
                #comment-module .sub-reply-container .sub-reply-item:hover .sub-reply-dislike {
                    visibility: visible !important;
                }`
			}),
			// 隐藏 大表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large",
				description: "隐藏 大表情",
				itemCSS: `#comment-module .emoji-large {display: none !important;}`
			}),
			// 大表情变成小表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large-zoom",
				description: "大表情变成小表情",
				itemCSS: `#comment-module .emoji-large {zoom: .5;}`
			}),
			// 用户名 全部大会员色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-pink",
				description: "用户名 全部大会员色",
				itemCSS: `#comment-module .reply-item .user-name, #comment-module .reply-item .sub-user-name {color: #FB7299 !important;}}`
			}),
			// 用户名 全部恢复默认色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-default",
				description: "用户名 全部恢复默认色",
				itemCSS: `#comment-module .reply-item .user-name, #comment-module .reply-item .sub-user-name {color: #61666d !important;}}`
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
                .reply-view-image .preview-list:has(.preview-item-box:only-child) {display: none !important;}
                .reply-view-image .preview-list {opacity: 0.2; transition: opacity 0.1s ease-in-out;}
                .reply-view-image .preview-list:hover {opacity: 1; transition: opacity 0.1s ease-in-out;}`
			}),
			// 隐藏 整个评论区
			new CheckboxItem({
				itemID: "video-page-hide-comment",
				description: "隐藏 整个评论区",
				itemCSS: `#comment, #comment-module {display: none;}`
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
			// 隐藏 小窗播放器
			new CheckboxItem({
				itemID: "video-page-hide-sidenav-mini",
				description: "隐藏 小窗播放器",
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
						debug("match danmaku", dmText);
						dm.innerHTML = "";
						return;
					}
					if(enableCleanRedundant) {
						if(dmText.match(/(.+)\1{4,}/)) {
							debug("match danmaku", dmText);
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
                `
			})
		];
		liveGroupList.push(new Group("live-basic", "直播页 基本功能", basicItems2));
		const infoItems = [
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
			// 隐藏 播放器顶部复读计数弹幕
			new CheckboxItem({
				itemID: "live-page-combo-danmaku",
				description: "隐藏 播放器顶部变动计数弹幕",
				itemCSS: `.danmaku-item-container > div.combo {display: none !important;}`
			}),
			// 隐藏 计数结尾的弹幕
			new CheckboxItem({
				itemID: "live-page-clean-counter-danmaku",
				description: "隐藏 计数结尾弹幕，如 ???? x24",
				itemFunc: () => {
					enableCleanCounter = true;
					cleanLiveDanmaku();
				}
			}),
			// 隐藏 文字重复多遍的弹幕
			new CheckboxItem({
				itemID: "live-page-clean-redundant-text-danmaku",
				description: "隐藏 文字重复多遍的弹幕 (n≥5)\n如 prprprprpr, 88888888",
				itemFunc: () => {
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
			// 隐藏 高能榜/大航海 (需刷新)
			new CheckboxItem({
				itemID: "live-page-rank-list-vm",
				description: "隐藏 高能榜/大航海 (需刷新)",
				itemCSS: `#rank-list-vm {display: none !important;}
                #aside-area-vm {overflow: hidden;}
                .chat-history-panel {height: calc(100% - 145px) !important; padding-top: 8px;}`
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
			// 隐藏 弹幕的高亮底色
			new CheckboxItem({
				itemID: "live-page-chat-item-background-color",
				description: "隐藏 弹幕的高亮底色",
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
			// 隐藏 互动框(他们都在说)
			new CheckboxItem({
				itemID: "live-page-combo-card",
				description: "隐藏 互动框(他们都在说)",
				itemCSS: `#combo-card:has(.combo-tips) {display: none !important;}`
			}),
			// 隐藏 互动框(找TA玩)
			new CheckboxItem({
				itemID: "live-page-service-card-container",
				description: "隐藏 互动框(找TA玩)",
				itemCSS: `.play-together-service-card-container {display: none !important;}`
			}),
			// 弹幕栏 使弹幕列表紧凑, 默认开启
			new CheckboxItem({
				itemID: "live-page-compact-danmaku",
				description: "弹幕栏 使弹幕列表紧凑",
				defaultStatus: true,
				itemCSS: `.chat-history-panel .chat-history-list .chat-item.danmaku-item.chat-colorful-bubble {margin: 2px 0 !important;}
                .chat-history-panel .chat-history-list .chat-item {padding: 3px 5px !important; font-size: 1.2rem !important;}
                .chat-history-panel .chat-history-list .chat-item.danmaku-item .user-name {font-size: 1.2rem !important;}
                .chat-history-panel .chat-history-list .chat-item.danmaku-item .reply-uname {font-size: 1.2rem !important;}
                .chat-history-panel .chat-history-list .chat-item.danmaku-item .reply-uname .common-nickname-wrapper {font-size: 1.2rem !important;}`
			}),
			// 隐藏 弹幕控制按钮 左侧
			new CheckboxItem({
				itemID: "live-page-control-panel-icon-row-left",
				description: "隐藏 弹幕控制按钮 左侧",
				itemCSS: `#chat-control-panel-vm .control-panel-icon-row .icon-left-part {display: none !important;}`
			}),
			// 隐藏 弹幕控制按钮 右侧
			new CheckboxItem({
				itemID: "live-page-control-panel-icon-row-right",
				description: "隐藏 弹幕控制按钮 右侧",
				itemCSS: `#chat-control-panel-vm .control-panel-icon-row .icon-right-part {display: none !important;}`
			}),
			// 隐藏 弹幕发送框
			new CheckboxItem({
				itemID: "live-page-chat-input-ctnr",
				description: "隐藏 弹幕发送框",
				itemCSS: `#chat-control-panel-vm .chat-input-ctnr, #chat-control-panel-vm .bottom-actions {display: none !important;}
                .chat-control-panel {height: unset !important;}
                .chat-history-panel {height: calc(100% - 45px) !important; padding-top: 8px;}
                .chat-history-panel .danmaku-at-prompt {bottom: 50px !important;}`
			}),
			// 隐藏 关闭全部互动框和控制栏
			new CheckboxItem({
				itemID: "live-page-chat-control-panel",
				description: "隐藏 关闭全部互动框和控制栏",
				itemCSS: `#chat-control-panel-vm {display: none !important;}
                /* 高权限调高度 */
                #aside-area-vm .chat-history-panel {height: 100% !important;}`
			})
		];
		liveGroupList.push(new Group("live-right-container", "右栏 高能榜/弹幕列表", rightContainerItems));
		const belowItems = [
			// 隐藏 活动海报, 默认开启
			new CheckboxItem({
				itemID: "live-page-flip-view",
				description: "隐藏 活动海报",
				defaultStatus: true,
				itemCSS: `.flip-view {display: none !important;}`
			}),
			// 隐藏 直播间介绍
			new CheckboxItem({
				itemID: "live-page-room-info-ctnr",
				description: "隐藏 直播间介绍",
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
				itemCSS: `#sections-vm .announcement-cntr {display: none !important;}`
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
				itemCSS: `#main-ctnr a.entry_logo[href="//live.bilibili.com"] {display: none !important;}`
			}),
			// 隐藏 首页
			new CheckboxItem({
				itemID: "live-page-header-entry-title",
				description: "隐藏 首页",
				itemCSS: `#main-ctnr a.entry-title[href="//www.bilibili.com"] {display: none !important;}`
			}),
			// 隐藏 直播
			new CheckboxItem({
				itemID: "live-page-header-live",
				description: "隐藏 直播",
				itemCSS: `#main-ctnr .dp-table-cell a[name="live"] {display: none !important;}`
			}),
			// 隐藏 全部
			new CheckboxItem({
				itemID: "live-page-header-all",
				description: "隐藏 全部",
				itemCSS: `#main-ctnr .dp-table-cell a[name="all"] {display: none !important;}`
			}),
			// 隐藏 网游
			new CheckboxItem({
				itemID: "live-page-header-net-game",
				description: "隐藏 网游",
				itemCSS: `#main-ctnr .dp-table-cell a[name="网游"] {display: none !important;}`
			}),
			// 隐藏 手游
			new CheckboxItem({
				itemID: "live-page-header-mobile-game",
				description: "隐藏 手游",
				itemCSS: `#main-ctnr .dp-table-cell a[name="手游"] {display: none !important;}`
			}),
			// 隐藏 单机游戏
			new CheckboxItem({
				itemID: "live-page-header-standalone-game",
				description: "隐藏 单机游戏",
				itemCSS: `#main-ctnr .dp-table-cell a[name="单机游戏"] {display: none !important;}`
			}),
			// 隐藏 娱乐
			new CheckboxItem({
				itemID: "live-page-header-standalone-entertainment",
				description: "隐藏 娱乐",
				itemCSS: `#main-ctnr .dp-table-cell a[name="娱乐"] {display: none !important;}`
			}),
			// 隐藏 电台
			new CheckboxItem({
				itemID: "live-page-header-standalone-radio",
				description: "隐藏 电台",
				itemCSS: `#main-ctnr .dp-table-cell a[name="电台"] {display: none !important;}`
			}),
			// 隐藏 虚拟主播
			new CheckboxItem({
				itemID: "live-page-header-standalone-vtuber",
				description: "隐藏 虚拟主播",
				itemCSS: `#main-ctnr .dp-table-cell a[name="虚拟主播"] {display: none !important;}`
			}),
			// 隐藏 聊天室
			new CheckboxItem({
				itemID: "live-page-header-standalone-chatroom",
				description: "隐藏 聊天室",
				itemCSS: `#main-ctnr .dp-table-cell a[name="聊天室"] {display: none !important;}`
			}),
			// 隐藏 生活
			new CheckboxItem({
				itemID: "live-page-header-standalone-living",
				description: "隐藏 生活",
				itemCSS: `#main-ctnr .dp-table-cell a[name="生活"] {display: none !important;}`
			}),
			// 隐藏 知识
			new CheckboxItem({
				itemID: "live-page-header-standalone-knowledge",
				description: "隐藏 知识",
				itemCSS: `#main-ctnr .dp-table-cell a[name="知识"] {display: none !important;}`
			}),
			// 隐藏 赛事
			new CheckboxItem({
				itemID: "live-page-header-standalone-match",
				description: "隐藏 赛事",
				itemCSS: `#main-ctnr .dp-table-cell a[name="赛事"] {display: none !important;}`
			}),
			// 隐藏 帮我玩
			new CheckboxItem({
				itemID: "live-page-header-standalone-helpmeplay",
				description: "隐藏 帮我玩",
				itemCSS: `#main-ctnr .dp-table-cell a[name="帮我玩"] {display: none !important;}`
			}),
			// 隐藏 互动玩法
			new CheckboxItem({
				itemID: "live-page-header-standalone-interact",
				description: "隐藏 互动玩法",
				itemCSS: `#main-ctnr .dp-table-cell a[name="互动玩法"] {display: none !important;}`
			}),
			// 隐藏 购物
			new CheckboxItem({
				itemID: "live-page-header-standalone-shopping",
				description: "隐藏 购物",
				itemCSS: `#main-ctnr .dp-table-cell a[name="购物"] {display: none !important;}`
			}),
			// 隐藏 更多, 默认开启
			new CheckboxItem({
				itemID: "live-page-header-showmore-link",
				description: "隐藏 顶栏-更多",
				defaultStatus: true,
				itemCSS: `#main-ctnr .showmore-link {display: none !important;}`
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
			// 隐藏 关闭搜索框
			new CheckboxItem({
				itemID: "live-page-header-search-block",
				description: "隐藏 关闭搜索框",
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
			// 隐藏 动态
			new CheckboxItem({
				itemID: "live-page-header-dynamic",
				description: "隐藏 动态",
				itemCSS: `#right-part .shortcuts-ctnr .shortcut-item:has(.link-panel-ctnr) {display: none !important;}`
			}),
			// 隐藏 签到
			new CheckboxItem({
				itemID: "live-page-header-checkin",
				description: "隐藏 签到",
				itemCSS: `#right-part .shortcuts-ctnr .shortcut-item:has(.calendar-checkin) {display: none !important;}`
			}),
			// 隐藏 幻星互动, 默认开启
			new CheckboxItem({
				itemID: "live-page-header-interact",
				description: "隐藏 幻星互动",
				defaultStatus: true,
				itemCSS: `#right-part .shortcuts-ctnr .shortcut-item:has(.fanbox-panel-ctnr) {display: none !important;}`
			}),
			// 隐藏 我要开播, 默认开启
			new CheckboxItem({
				itemID: "live-page-header-go-live",
				description: "隐藏 我要开播",
				defaultStatus: true,
				itemCSS: `#right-part .shortcuts-ctnr .shortcut-item:has(.download-panel-ctnr) {visibility: hidden;}`
			})
		];
		liveGroupList.push(new Group("live-header-right", "顶栏 右侧", headerRightItems));
	}
	const dynamicUnfold = () => {
		const unfold = () => {
			const dynFoldNodes = document.querySelectorAll("main .bili-dyn-list__item .bili-dyn-item-fold");
			if(dynFoldNodes.length) {
				dynFoldNodes.forEach((e) => {
					if(e instanceof HTMLDivElement) {
						e.click();
					}
				});
				debug(`unfold ${dynFoldNodes.length} fold`);
			}
		};
		setInterval(unfold, 500);
	};
	const dynamicGroupList = [];
	if(isPageDynamic()) {
		const basicItems2 = [
			// 顶栏 不再吸附顶部
			new CheckboxItem({
				itemID: "hide-dynamic-page-fixed-header",
				description: "顶栏 不再吸附顶部",
				itemCSS: `.fixed-header .bili-header__bar {position: relative !important;}
                /* 高权限覆盖*/
                aside.right section.sticky {top: 15px !important;}`
			})
		];
		dynamicGroupList.push(new Group("dynamic-basic", "动态页 基本功能", basicItems2));
		const leftItems = [
			// 隐藏 个人信息框
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-my-info",
				description: "隐藏 个人信息框",
				itemCSS: `section:has(> .bili-dyn-my-info) {display: none !important;}
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
		const centerItems = [
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
			}),
			// 隐藏 动态右侧饰品
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-ornament",
				description: "隐藏 动态右侧饰品",
				itemCSS: `.bili-dyn-ornament {display: none !important;}`
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
			// 隐藏 转发的动态
			new CheckboxItem({
				itemID: "hide-dynamic-page-bili-dyn-forward",
				description: "隐藏 转发的动态",
				itemCSS: `.bili-dyn-list__item:has(.bili-dyn-content__orig.reference) {
                    visibility: hidden !important;
                    height: 0 !important;
                    margin: 0 !important;
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
			// 自动展开 相同UP主被折叠的动态
			new CheckboxItem({
				itemID: "dynamic-page-unfold-dynamic",
				description: "自动展开 相同UP主被折叠的动态",
				itemFunc: dynamicUnfold
			})
		];
		dynamicGroupList.push(new Group("dynamic-center", "中栏 动态列表", centerItems));
		const commentItems = [
			// 隐藏 活动/notice, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-notice",
				description: "隐藏 活动/notice",
				defaultStatus: true,
				itemCSS: `.comment-container .reply-header .reply-notice {display: none !important;}`
			}),
			// 隐藏 整个评论框
			new CheckboxItem({
				itemID: "video-page-hide-main-reply-box",
				description: "隐藏 整个评论框",
				itemCSS: `.comment-container .main-reply-box, .comment-container .fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 页面底部 吸附评论框, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-fixed-reply-box",
				description: "隐藏 页面底部 吸附评论框",
				defaultStatus: true,
				itemCSS: `.comment-container .fixed-reply-box {display: none !important;}`
			}),
			// 隐藏 评论编辑器内占位文字, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-reply-box-textarea-placeholder",
				description: "隐藏 评论编辑器内占位文字",
				defaultStatus: true,
				itemCSS: `.comment-container .reply-box-textarea::placeholder {color: transparent !important;}`
			}),
			// 隐藏 评论右侧装饰
			new CheckboxItem({
				itemID: "video-page-hide-reply-decorate",
				description: "隐藏 评论右侧装饰",
				itemCSS: `.comment-container .reply-decorate {display: none !important;}`
			}),
			// 隐藏 ID后粉丝牌
			new CheckboxItem({
				itemID: "video-page-hide-fan-badge",
				description: "隐藏 ID后粉丝牌",
				itemCSS: `.comment-container .fan-badge {display: none !important;}`
			}),
			// 隐藏 一级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-user-level",
				description: "隐藏 一级评论用户等级",
				itemCSS: `.comment-container .user-level {display: none !important;}`
			}),
			// 隐藏 二级评论用户等级
			new CheckboxItem({
				itemID: "video-page-hide-sub-user-level",
				description: "隐藏 二级评论用户等级",
				itemCSS: `.comment-container .sub-user-level {display: none !important;}`
			}),
			// 隐藏 用户头像外圈饰品
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-pendent-dom",
				description: "隐藏 用户头像外圈饰品",
				itemCSS: `.comment-container .bili-avatar-pendent-dom {display: none !important;}`
			}),
			// 隐藏 用户头像右下小icon
			new CheckboxItem({
				itemID: "video-page-hide-bili-avatar-nft-icon",
				description: "隐藏 用户头像右下小icon",
				itemCSS: `.comment-container .bili-avatar-nft-icon {display: none !important;}
                .comment-container .bili-avatar-icon {display: none !important;}`
			}),
			// 隐藏 评论内容下tag(UP觉得很赞)
			new CheckboxItem({
				itemID: "video-page-hide-reply-tag-list",
				description: "隐藏 评论内容下tag(UP觉得很赞)",
				itemCSS: `.comment-container .reply-tag-list {display: none !important;}`
			}),
			// 隐藏 笔记评论前的小Logo, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-note-prefix",
				description: "隐藏 笔记评论前的小Logo",
				defaultStatus: true,
				itemCSS: `.comment-container .note-prefix {display: none !important;}`
			}),
			// 隐藏 评论内容搜索关键词高亮, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-jump-link-search-word",
				description: "隐藏 评论内容搜索关键词高亮",
				defaultStatus: true,
				itemCSS: `.comment-container .reply-content .jump-link.search-word {color: inherit !important;}
                .comment-container .reply-content .icon.search-word {display: none !important;}`
			}),
			// 隐藏 二级评论中的@高亮
			new CheckboxItem({
				itemID: "video-page-hide-reply-content-user-highlight",
				description: "隐藏 二级评论中的@高亮",
				itemCSS: `.comment-container .sub-reply-container .reply-content .jump-link.user {color: inherit !important;}
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
                .reply-item:has(.jump-link.user[data-user-id="358243654"]) {
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
                .reply-item:has(.root-reply-container .user-name[data-user-id="358243654"]) {
                    display: none !important;
                }`)
			}),
			// 隐藏 包含@的 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-at-reply",
				description: "隐藏 包含@的 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.root-reply .jump-link.user):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 包含@的 全部评论
			new CheckboxItem({
				itemID: "video-page-hide-at-reply-all",
				description: "隐藏 包含@的 全部评论",
				itemCSS: `.comment-container .reply-item:has(.root-reply .jump-link.user):not(:has(.sub-up-icon)) {display: none !important;}`
			}),
			// 隐藏 LV1 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv1-reply",
				description: "隐藏 LV1 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.st1.lv1):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV2 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv2-reply",
				description: "隐藏 LV2 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.st1.lv2):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 隐藏 LV3 无人点赞评论
			new CheckboxItem({
				itemID: "video-page-hide-zero-like-lv3-reply",
				description: "隐藏 LV3 无人点赞评论",
				itemCSS: `.comment-container .reply-item:has(.st1.lv3):not(:has(.sub-up-icon, .reply-info .reply-like span)) {display: none !important;}`
			}),
			// 一级评论 踩/回复 只在hover时显示, 默认开启
			new CheckboxItem({
				itemID: "video-page-hide-root-reply-dislike-reply-btn",
				description: "一级评论 踩/回复 只在hover时显示",
				defaultStatus: true,
				itemCSS: `.comment-container .reply-info:not(:has(i.disliked)) .reply-btn,
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
				itemCSS: `.comment-container .sub-reply-item:not(:has(i.disliked)) .sub-reply-btn,
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
				itemCSS: `.comment-container .emoji-large {display: none !important;}`
			}),
			// 大表情变成小表情
			new CheckboxItem({
				itemID: "video-page-hide-emoji-large-zoom",
				description: "大表情变成小表情",
				itemCSS: `.comment-container .emoji-large {zoom: .5;}`
			}),
			// 用户名 全部大会员色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-pink",
				description: "用户名 全部大会员色",
				itemCSS: `.comment-container .reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #FB7299 !important;}}`
			}),
			// 用户名 全部恢复默认色
			new CheckboxItem({
				itemID: "video-page-reply-user-name-color-default",
				description: "用户名 全部恢复默认色",
				itemCSS: `.comment-container .reply-item .user-name, .comment-container .reply-item .sub-user-name {color: #61666d !important;}}`
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
                .reply-view-image .preview-list:has(.preview-item-box:only-child) {display: none !important;}
                .reply-view-image .preview-list {opacity: 0.2; transition: opacity 0.1s ease-in-out;}
                .reply-view-image .preview-list:hover {opacity: 1; transition: opacity 0.1s ease-in-out;}`
			})
		];
		dynamicGroupList.push(new Group("dynamic-comment", "动态评论区", commentItems));
		const sidebarItems = [
			// 隐藏 新版反馈, 默认开启
			new CheckboxItem({
				itemID: "hide-dynamic-page-sidebar-feedback",
				description: "隐藏 新版反馈",
				defaultStatus: true,
				itemCSS: `.bili-dyn-sidebar .bili-dyn-sidebar__btn:nth-child(1) {visibility: hidden !important;}`
			}),
			// 隐藏 回到旧版, 默认开启
			new CheckboxItem({
				itemID: "hide-dynamic-page-sidebar-old-version",
				description: "隐藏 回到旧版",
				defaultStatus: true,
				itemCSS: `.bili-dyn-sidebar .bili-dyn-sidebar__btn:nth-child(2) {visibility: hidden !important;}`
			}),
			// 隐藏 回顶部
			new CheckboxItem({
				itemID: "hide-dynamic-page-sidebar-back-to-top",
				description: "隐藏 回顶部",
				itemCSS: `.bili-dyn-sidebar .bili-dyn-sidebar__btn:nth-child(3) {visibility: hidden !important;}`
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
                /* header高度 */
                #biliMainHeader {min-height: unset !important;}
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
				defaultStatus: true
			}),
			// 强制使用 4 列布局
			new RadioItem({
				itemID: "popular-layout-4-column",
				description: "强制使用 4 列布局\n默认屏蔽Tag和简介，下同",
				radioName: "popular-layout-option",
				radioItemIDList: ["popular-layout-default", "popular-layout-4-column", "popular-layout-5-column", "popular-layout-6-column"],
				itemCSS: `/* 页面宽度 */
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
				itemCSS: `/* 页面宽度 */
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
				itemCSS: `/* 页面宽度 */
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
		popularGroupList.push(new Group("popular-layout", "页面强制布局 (单选，实验性)", layoutItems));
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
	class DurationFilter {
		constructor() {
			// 匹配时长的正则
			__publicField(this, "pattern", /^(\d+:)?\d\d:\d\d$/g);
			// 时长阈值, 单位秒
			__publicField(this, "threshold", 0);
			__publicField(this, "isEnable", false);
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(threshold) {
			this.threshold = threshold;
		}
		isLegal(duration) {
			const hhmmss = duration.split(":");
			if(hhmmss.length == 2) {
				return parseInt(hhmmss[0]) * 60 + parseInt(hhmmss[1]) >= this.threshold;
			} else if(hhmmss.length > 2) {
				return true;
			}
			return true;
		}
		check(duration) {
			duration = duration.trim();
			return new Promise((resolve, reject) => {
				try {
					if(!this.isEnable || this.threshold === 0) {
						resolve(`Duration resolve, disable or 0`);
						return;
					} else if(duration && duration.match(this.pattern)) {
						if(this.isLegal(duration)) {
							resolve(`Duration resolve, duration OK`);
						} else {
							reject(`Duration reject, ${duration} < ${this.threshold}s`);
						}
					} else {
						resolve(`Duration resolve`);
					}
				} catch (err) {
					error(err);
					resolve(`Duration resolve, error`);
				}
			});
		}
	}
	const durationFilterInstance = new DurationFilter();
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
			debugFilter(`TitleKeywordWhitelist`, Array.from(this.titleKeywordSet).join("|"));
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
	class UploaderWhitelistFilter {
		constructor() {
			__publicField(this, "isEnable", false);
			__publicField(this, "uploaderSet", /* @__PURE__ */ new Set());
		}
		setStatus(status) {
			this.isEnable = status;
		}
		setParams(values) {
			debugFilter(`UploaderWhitelist`, Array.from(this.uploaderSet).join("|"));
			this.uploaderSet = new Set(values.map((v) => v.trim()).filter((v) => v));
		}
		addParam(value) {
			debugFilter(`UploaderWhitelist`, Array.from(this.uploaderSet).join("|"));
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
	class CoreFilter {
		/**
		 * 检测视频列表中每个视频是否合法, 并隐藏不合法的视频
		 * 对选取出的 标题/UP主/时长/BVID 进行并发检测
		 * @param videos 视频列表
		 * @param sign attribute标记
		 * @param selectorFunc 使用selector选取元素的函数
		 */
		checkAll(videos, sign = true, selectorFunc) {
			debugFilter(`checkAll start`);
			try {
				const checkDuration = durationFilterInstance.isEnable && selectorFunc.duration !== void 0;
				const checkTitleKeyword = titleKeywordFilterInstance.isEnable && selectorFunc.titleKeyword !== void 0;
				const checkUploader = uploaderFilterInstance.isEnable && selectorFunc.uploader !== void 0;
				const checkBvid = bvidFilterInstance.isEnable && selectorFunc.bvid !== void 0;
				const checkUploaderWhitelist = uploaderWhitelistFilterInstance.isEnable && selectorFunc.uploader !== void 0;
				const checkTitleKeywordWhitelist = titleKeywordWhitelistFilterInstance.isEnable && selectorFunc.uploader !== void 0;
				if(!checkDuration && !checkTitleKeyword && !checkUploader && !checkBvid) {
					videos.forEach((video) => showVideo(video));
					return;
				}
				videos.forEach((video) => {
					var _a, _b, _c, _d;
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
					if(checkTitleKeyword) {
						const title = (_b = selectorFunc.titleKeyword(video)) == null ? void 0 : _b.trim();
						if(title) {
							blackTasks.push(titleKeywordFilterInstance.check(title));
							info.title = title;
						}
					}
					if(checkUploaderWhitelist) {
						const uploader = (_c = selectorFunc.uploader(video)) == null ? void 0 : _c.trim();
						if(uploader) {
							whiteTasks.push(uploaderWhitelistFilterInstance.check(uploader));
							info.uploader = uploader;
						}
					}
					if(checkTitleKeywordWhitelist) {
						const title = (_d = selectorFunc.titleKeyword(video)) == null ? void 0 : _d.trim();
						if(title) {
							whiteTasks.push(titleKeywordWhitelistFilterInstance.check(title));
							info.title = title;
						}
					}
					Promise.all(blackTasks).then((_result) => {
						showVideo(video);
						Promise.all(whiteTasks).then((_result2) => {}).catch((_result2) => {});
					}).catch((_result) => {
						if(whiteTasks) {
							Promise.all(whiteTasks).then((_result2) => {
								if(!isVideoHide(video)) {
									log(`hide video
bvid: ${info.bvid}
time: ${info.duration}
up: ${info.uploader}
title: ${info.title}`);
								}
								hideVideo(video);
							}).catch((_result2) => {
								showVideo(video);
							});
						} else {
							if(!isVideoHide(video)) {
								log(`hide video
bvid: ${info.bvid}
time: ${info.duration}
up: ${info.uploader}
title: ${info.title}`);
							}
							hideVideo(video);
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
	const coreFilterInstance = new CoreFilter();
	class ContextMenu {
		constructor() {
			__publicField(this, "nodeHTML", `
        <div id="bili-cleaner-context-menu-container">
            <ul>
            </ul>
        </div>`);
			__publicField(this, "nodeCSS", `
    #bili-cleaner-context-menu-container {
        position: fixed;
        background: white;
        border-radius: 5px;
        box-shadow: 0 0 6px rgba(0,0,0,.3);
        user-select: none;
        overflow: hidden;
        z-index: 99999;
    }
    #bili-cleaner-context-menu-container li {
        padding: 6px 12px;
        font-size: 1rem;
    }
    #bili-cleaner-context-menu-container li:hover {
        background: rgb(251, 114, 153);
        font-weight: 500;
        color: white;
    }
    `);
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
				style.innerHTML = this.nodeCSS.replace(/\n\s*/g, "").trim();
				style.setAttribute("id", "bili-cleaner-context-menu-css");
				document.head.appendChild(style);
				debug("insertContextMenuCSS OK");
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
	const contextMenuInstance = new ContextMenu();
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
        <textarea class="wordlist-body" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"></textarea>
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
			debug(`key`, `BILICLEANER_${this.listID}`);
			this.wordArr = _GM_getValue(`BILICLEANER_${this.listID}`, []);
			debug(`list ${this.listID} getValue ${this.wordArr.length} lines`);
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
				debug(`list ${this.listID} add value ${value}, OK`);
			} catch (err) {
				error(err);
				error(`list ${this.listID} add value ${value}, ERROR`);
			}
		}
		/** 添加多个值到列表 */
		addValues(values) {
			try {
				this.getValue();
				values.forEach((value) => {
					value = value.trim();
					if(value && !this.wordSet.has(value)) {
						this.wordArr.push(value);
						this.wordSet.add(value);
					}
				});
				this.setValue();
				debug(`list ${this.listID} add ${values.length} lines, OK`);
			} catch (err) {
				error(err);
				error(`list ${this.listID} add ${values.length} lines, ERROR`);
			}
		}
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
				debug(`list ${this.listID} saveList, OK`);
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
			debug(`fetchList fetch ${this.wordArr.length} lines`);
			return this.wordArr;
		}
		/** 插入节点, 显示编辑框 */
		insertNode() {
			var _a;
			const node = document.getElementById("bili-cleaner-wordlist");
			if(node) {
				return;
			}
			const e = document.createElement("div");
			e.innerHTML = this.nodeHTML.trim();
			e.querySelector(".wordlist-header").innerHTML = this.title.replace("\n", "<br>");
			e.querySelector(".wordlist-description").innerHTML = this.description.replace("\n", "<br>");
			debug(`insertNode, fetchList ${this.fetchList().length} lines`);
			let lines = this.fetchList().join("\n");
			if(lines) {
				lines += "\n";
			}
			e.querySelector("textarea").value = lines;
			(_a = document.body) == null ? void 0 : _a.appendChild(e.firstChild);
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
			debug(`list ${this.listID} listen cancel button`);
			const save = node.querySelector(".wordlist-save-button");
			save == null ? void 0 : save.addEventListener("click", () => {
				const textarea = node.querySelector("textarea");
				if(textarea) {
					debug("textarea value", textarea.value);
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
			debug(`list ${this.listID} listen save button`);
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
					}
				});
				document.addEventListener("mouseup", () => {
					isDragging = false;
				});
				debug("draggableBar OK");
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
	class FilterAgency {
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
	const agencyInstance = new FilterAgency();
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
			debugFilter(`DurationAction enable`);
			agencyInstance.notifyDuration("enable");
			this.checkVideoList(true);
		}
		disable() {
			debugFilter(`DurationAction disable`);
			agencyInstance.notifyDuration("disable");
			this.checkVideoList(true);
		}
		change(value) {
			debugFilter(`DurationAction change ${value}`);
			agencyInstance.notifyDuration("change", value);
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
			this.blacklist = new WordList(this.valueKey, "UP主 黑名单", "保存时自动去重，实时生效", (values) => {
				this.edit(values);
			});
		}
		enable() {
			agencyInstance.notifyUploader("enable");
			this.checkVideoList(true);
		}
		disable() {
			agencyInstance.notifyUploader("disable");
			this.checkVideoList(true);
		}
		add(value) {
			this.blacklist.addValue(value);
			agencyInstance.notifyUploader("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑黑名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			agencyInstance.notifyUploader("edit", values);
			this.checkVideoList(true);
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
			this.blacklist = new WordList(this.valueKey, "BV号 黑名单", "保存时自动去重，实时生效", (values) => {
				this.edit(values);
			});
		}
		enable() {
			agencyInstance.notifyBvid("enable");
			this.checkVideoList(true);
		}
		disable() {
			agencyInstance.notifyBvid("disable");
			this.checkVideoList(true);
		}
		add(value) {
			this.blacklist.addValue(value);
			agencyInstance.notifyBvid("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑黑名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			agencyInstance.notifyBvid("edit", values);
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
			this.blacklist = new WordList(this.valueKey, "标题关键词 黑名单", `每行一个关键词，支持正则(iv)，语法：/abc|\\d+/`,
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			agencyInstance.notifyTitleKeyword("enable");
			this.checkVideoList(true);
		}
		disable() {
			agencyInstance.notifyTitleKeyword("disable");
			this.checkVideoList(true);
		}
		add(value) {
			this.blacklist.addValue(value);
			agencyInstance.notifyTitleKeyword("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑黑名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			agencyInstance.notifyTitleKeyword("edit", values);
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
			this.whitelist = new WordList(this.valueKey, "UP主 白名单", "保存时自动去重，实时生效", (values) => {
				this.edit(values);
			});
		}
		enable() {
			agencyInstance.notifyUploaderWhitelist("enable");
			this.checkVideoList(true);
		}
		disable() {
			agencyInstance.notifyUploaderWhitelist("disable");
			this.checkVideoList(true);
		}
		add(value) {
			this.whitelist.addValue(value);
			agencyInstance.notifyUploaderWhitelist("add", value);
			this.checkVideoList(true);
		}
		// edit由编辑白名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			agencyInstance.notifyUploaderWhitelist("edit", values);
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
			this.whitelist = new WordList(this.valueKey, "标题关键词 白名单", `每行一个关键词，支持正则(iv)，语法：/abc|\\d+/`,
				(values) => {
					this.edit(values);
				});
		}
		enable() {
			agencyInstance.notifyTitleKeywordWhitelist("enable");
			this.checkVideoList(true);
		}
		disable() {
			agencyInstance.notifyTitleKeywordWhitelist("disable");
			this.checkVideoList(true);
		}
		// edit由编辑白名单的保存动作回调, 数据由编辑器实例存储
		edit(values) {
			agencyInstance.notifyTitleKeywordWhitelist("edit", values);
			this.checkVideoList(true);
		}
	}
	const homepageFilterGroupList = [];
	let isContextMenuFuncRunning$4 = false;
	let isContextMenuUploaderEnable$4 = false;
	let isContextMenuBvidEnable$4 = false;
	let isFollowingWhitelistEnable = _GM_getValue("BILICLEANER_homepage-following-whitelist-filter-status", true);
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
				debugFilter(`checkVideoList videoListContainer not exist`);
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
							showVideo(video);
						}
						return icontext !== "已关注";
					});
					rcmdVideos = rcmdVideos.filter((video) => {
						var _a, _b;
						const icontext = (_b = (_a = video.querySelector(".bili-video-card__info--icon-text")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
						if(icontext === "已关注") {
							showVideo(video);
						}
						return icontext !== "已关注";
					});
				}
				feedVideos.length && coreFilterInstance.checkAll(feedVideos, true, feedSelectorFunc);
				rcmdVideos.length && coreFilterInstance.checkAll(rcmdVideos, true, rcmdSelectorFunc);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const watchVideoListContainer = () => {
			if(videoListContainer) {
				debugFilter("watchVideoListContainer start");
				checkVideoList(true);
				const videoObverser = new MutationObserver(() => {
					checkVideoList(false);
				});
				videoObverser.observe(videoListContainer, {
					childList: true
				});
				debugFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, ".container.is-version8", (node) => {
				return node instanceof HTMLElement && node.className === "container is-version8";
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
		const homepageDurationAction = new DurationAction("homepage-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const homepageUploaderAction = new UploaderAction("homepage-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const homepageBvidAction = new BvidAction("homepage-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const homepageTitleKeywordAction = new TitleKeywordAction("homepage-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const homepageUploaderWhitelistAction = new UploaderWhitelistAction("homepage-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const homepageTitleKeyworldWhitelistAction = new TitleKeywordWhitelistAction("homepage-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$4) {
				return;
			}
			isContextMenuFuncRunning$4 = true;
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
				if(e.target instanceof HTMLElement) {
					if(isContextMenuUploaderEnable$4 && (e.target.classList.contains("bili-video-card__info--author") || e.target.classList.contains("bili-video-card__info--date"))) {
						const node = (_a = e.target.parentElement) == null ? void 0 : _a.querySelector(".bili-video-card__info--author");
						const uploader = node == null ? void 0 : node.textContent;
						if(uploader) {
							e.preventDefault();
							const onclickBlack = () => {
								homepageUploaderAction.add(uploader);
							};
							const onclickWhite = () => {
								homepageUploaderWhitelistAction.add(uploader);
							};
							contextMenuInstance.registerMenu(`◎ 屏蔽UP主：${uploader}`, onclickBlack);
							contextMenuInstance.registerMenu(`◎ 将UP主加入白名单`, onclickWhite);
							contextMenuInstance.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable$4 && ((_b = e.target.parentElement) == null ? void 0 : _b.classList.contains("bili-video-card__info--tit"))) {
						const node = e.target.parentElement;
						const href2 = (_c = node.querySelector(":scope > a")) == null ? void 0 : _c.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								const onclick = () => {
									homepageBvidAction.add(bvid);
								};
								contextMenuInstance.registerMenu(`屏蔽视频：${bvid}`, onclick);
								contextMenuInstance.show(e.clientX, e.clientY);
							}
						}
					} else {
						contextMenuInstance.hide();
					}
				}
			});
			document.addEventListener("click", () => {
				contextMenuInstance.hide();
			});
			debugFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			// 启用 首页时长过滤
			new CheckboxItem({
				itemID: homepageDurationAction.statusKey,
				description: "启用 首页时长过滤",
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
				itemFunc: () => {
					homepageDurationAction.enable();
				},
				callback: () => {
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
				callback: (value) => {
					homepageDurationAction.change(value);
				}
			})
		];
		homepageFilterGroupList.push(new Group("homepage-duration-filter-group", "首页 视频时长过滤", durationItems));
		const uploaderItems = [
			// 启用 首页UP主过滤
			new CheckboxItem({
				itemID: homepageUploaderAction.statusKey,
				description: "启用 首页UP主过滤",
				itemFunc: () => {
					isContextMenuUploaderEnable$4 = true;
					contextMenuFunc();
					homepageUploaderAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					homepageUploaderAction.blacklist.show();
				}
			})
		];
		homepageFilterGroupList.push(new Group("homepage-uploader-filter-group", "首页 UP主过滤 (右键单击UP主)", uploaderItems));
		const titleKeywordItems = [
			// 启用 首页关键词过滤
			new CheckboxItem({
				itemID: homepageTitleKeywordAction.statusKey,
				description: "启用 首页关键词过滤",
				itemFunc: () => {
					homepageTitleKeywordAction.enable();
				},
				callback: () => {
					homepageTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "homepage-title-keyword-edit-button",
				description: "编辑 关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: () => {
					homepageTitleKeywordAction.blacklist.show();
				}
			})
		];
		homepageFilterGroupList.push(new Group("homepage-title-keyword-filter-group", "首页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 首页BV号过滤
			new CheckboxItem({
				itemID: homepageBvidAction.statusKey,
				description: "启用 首页BV号过滤",
				itemFunc: () => {
					isContextMenuBvidEnable$4 = true;
					contextMenuFunc();
					homepageBvidAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					homepageBvidAction.blacklist.show();
				}
			})
		];
		homepageFilterGroupList.push(new Group("homepage-bvid-filter-group", "首页 BV号过滤 (右键单击标题)", bvidItems));
		const whitelistItems = [
			// 已关注UP主 免过滤, 默认开启
			new CheckboxItem({
				itemID: "homepage-following-whitelist-filter-status",
				description: "标有 [已关注] 的视频免过滤",
				defaultStatus: true,
				itemFunc: () => {
					isFollowingWhitelistEnable = true;
					checkVideoList(true);
				},
				callback: () => {
					isFollowingWhitelistEnable = false;
					checkVideoList(true);
				}
			}),
			// 启用 首页UP主白名单
			new CheckboxItem({
				itemID: homepageUploaderWhitelistAction.statusKey,
				description: "启用 首页UP主白名单",
				itemFunc: () => {
					homepageUploaderWhitelistAction.enable();
				},
				callback: () => {
					homepageUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "homepage-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					homepageUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 首页标题关键词白名单
			new CheckboxItem({
				itemID: homepageTitleKeyworldWhitelistAction.statusKey,
				description: "启用 首页标题关键词白名单",
				itemFunc: () => {
					homepageTitleKeyworldWhitelistAction.enable();
				},
				callback: () => {
					homepageTitleKeyworldWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "homepage-title-keyword-whitelist-edit-button",
				description: "编辑 关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					homepageTitleKeyworldWhitelistAction.whitelist.show();
				}
			})
		];
		homepageFilterGroupList.push(new Group("homepage-whitelist-filter-group", "首页 白名单设定 (免过滤)", whitelistItems));
	}
	class Panel {
		constructor() {
			__publicField(this, "panelCSS", `
    #bili-cleaner{position:fixed;left:50%;top:50%;transform:translate(-50%, -50%);width:max(32vw,300px);height:90vh;border-radius:10px;background:#f4f5f7;box-shadow:0 0 8px rgba(0,0,0,.25);overflow:auto;z-index:2147483640;overscroll-behavior:contain}#bili-cleaner #bili-cleaner-bar{width:max(32vw,300px);height:6vh;background:#00aeec;border-top-left-radius:10px;border-top-right-radius:10px;cursor:move;-webkit-user-select:none;-moz-user-select:none;user-select:none}#bili-cleaner #bili-cleaner-bar #bili-cleaner-title{width:max(32vw,300px);height:6vh;display:flex;justify-content:center;align-items:center;color:#fff;font-weight:bold;font-size:22px}#bili-cleaner #bili-cleaner-bar #bili-cleaner-title span{text-align:center}#bili-cleaner #bili-cleaner-bar #bili-cleaner-close{position:absolute;top:0;right:0;width:6vh;height:6vh;border-radius:6vh;display:flex;justify-content:center;align-items:center;cursor:auto}#bili-cleaner #bili-cleaner-bar #bili-cleaner-close:hover{background:rgba(255,255,255,.2)}#bili-cleaner #bili-cleaner-bar #bili-cleaner-close svg{text-align:center}#bili-cleaner #bili-cleaner-group-list{height:84vh;overflow:auto;scrollbar-width:none !important;overscroll-behavior:contain}#bili-cleaner #bili-cleaner-group-list::-webkit-scrollbar{display:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group{margin:14px;background:#fff;border-radius:6px;padding:8px 16px;border:1px solid #ddd;-webkit-user-select:none;-moz-user-select:none;user-select:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group hr{border:1px solid #eee;margin:5px 0 10px 0}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-group-title{font-size:20px;font-weight:bold;padding:2px;color:#000;letter-spacing:1px}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-list label{display:flex;align-items:center;margin:6px 0 6px 10px;font-size:16px;color:#000}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-list hr{border:1px solid #eee;margin:15px 20px}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox{width:50px;min-width:50px;height:27px;margin:0 1em 0 0;position:relative;border:1px solid #dfdfdf;background-color:#fdfdfd;box-shadow:#dfdfdf 0 0 0 0 inset;border-radius:50px;-moz-appearance:none;appearance:none;-webkit-appearance:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox:before{content:"";width:25px;height:25px;position:absolute;top:0px;left:0;border-radius:50px;background-color:#fff;box-shadow:0 1px 3px rgba(0,0,0,.5)}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox:checked{border-color:#00aeec;box-shadow:#00aeec 0 0 0 16px inset;background-color:#00aeec}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-checkbox:checked:before{left:25px}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-number{width:50px;min-width:50px;height:27px;margin:0 .5em 0 .5em;position:relative;border:1px solid #dfdfdf;background-color:#fdfdfd;box-shadow:#dfdfdf 0 0 0 0 inset;border-radius:5px;-moz-appearance:none;appearance:none;-webkit-appearance:none;text-align:center;color:blue;font-size:16px;-moz-appearance:textfield}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-number::-webkit-inner-spin-button,#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-number::-webkit-inner-spin-button{-webkit-appearance:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-button{width:50px;background-color:#fff;border:1px solid #666;border-radius:6px;box-sizing:border-box;cursor:pointer;display:inline-block;font-size:16px;margin:0 1em 0 0;outline:none;padding:5px 0;position:relative;text-align:center;text-decoration:none;touch-action:manipulation;transition:box-shadow .2s,transform .1s;-moz-user-select:none;user-select:none;-webkit-user-select:none}#bili-cleaner #bili-cleaner-group-list .bili-cleaner-group .bili-cleaner-item-button:active{background-color:#f7f7f7;border-color:#000;transform:scale(0.96)}#bili-cleaner-wordlist{background:#fff;border-radius:5px;box-shadow:0 0 8px rgba(0,0,0,.25);overflow:hidden;position:fixed;left:50%;top:50%;transform:translate(-50%, -50%);display:flex;flex-direction:column;z-index:2147483641;overscroll-behavior:contain}#bili-cleaner-wordlist .wordlist-header{background-color:#00aeec;color:#fff;font-size:22px;font-weight:bold;margin:0;height:100%;width:100%;line-height:36px;text-align:center;-webkit-user-select:none;-moz-user-select:none;user-select:none}#bili-cleaner-wordlist .wordlist-description{font-size:16px;margin:6px auto;line-height:18px;text-align:center}#bili-cleaner-wordlist textarea.wordlist-body{width:400px;height:500px;margin:0 12px;border:2px solid #ccc;overflow-y:scroll;font-size:16px;line-height:22px;padding:5px 10px;flex-grow:1;resize:none;overscroll-behavior:contain}#bili-cleaner-wordlist textarea.wordlist-body:focus{outline:none !important}#bili-cleaner-wordlist .wordlist-footer{height:50px;display:flex;justify-content:space-evenly;padding:0 10px;align-items:center}#bili-cleaner-wordlist .wordlist-footer button{width:100px;height:30px;border-radius:5px;border:1px solid #666;font-size:18px}#bili-cleaner-wordlist .wordlist-footer button:hover{background-color:#666;color:#fff}
    `);
			__publicField(this, "panelHTML", `
    <div id="bili-cleaner">
        <div id="bili-cleaner-bar">
            <div id="bili-cleaner-title">
                <span>页面净化设置</span>
            </div>
            <div id="bili-cleaner-close">
                <svg t="1699601981125" class="icon" viewBox="0 0 1026 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5964" width="20" height="20"><path d="M996.742543 154.815357L639.810328 511.747572l356.932215 356.932215a90.158906 90.158906 0 0 1-127.490994 127.490994L512.319334 639.195998l-356.932215 356.889647A90.158906 90.158906 0 1 1 27.896126 868.637219L384.82834 511.747572 27.896126 154.815357A90.158906 90.158906 0 1 1 155.387119 27.324364L512.319334 384.256578 869.251549 27.324364a90.158906 90.158906 0 1 1 127.490994 127.490993z" fill="#ffffff" p-id="5965"></path></svg>
            </div>
        </div>
        <div id="bili-cleaner-group-list">
        </div>
    </div>`);
			// mode用于记录panel中功能类型, 如 屏蔽元素/视频过滤器
			__publicField(this, "mode");
		}
		/** 向document.head中添加panel CSS */
		insertPanelCSS() {
			try {
				if(document.head.querySelector("#bili-cleaner-panel-css")) {
					return;
				}
				const style = document.createElement("style");
				style.innerHTML = this.panelCSS.replace(/\n\s*/g, "").trim();
				style.setAttribute("id", "bili-cleaner-panel-css");
				document.head.appendChild(style);
				debug("insertPanelCSS OK");
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
				const html = document.createElement("div");
				html.innerHTML = this.panelHTML;
				document.body.appendChild(html);
				debug("insertPanelHTML OK");
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
				debug("watchCloseBtn OK");
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
					}
				});
				document.addEventListener("mouseup", () => {
					isDragging = false;
				});
				debug("draggableBar OK");
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
		}
		/** 显示panel */
		show() {
			const panel = document.getElementById("bili-cleaner");
			if(panel) {
				panel.style.removeProperty("display");
			}
		}
		/** 清空panel内groups, 用于替换功能group */
		clearGroups() {
			const groupList = document.getElementById("bili-cleaner-group-list");
			if(groupList) {
				groupList.innerHTML = "";
			}
			debug("panel clearGroups OK");
		}
	}
	const panelInstance = new Panel();
	const videoFilterGroupList = [];
	let isContextMenuFuncRunning$3 = false;
	let isContextMenuUploaderEnable$3 = false;
	let isContextMenuBvidEnable$3 = false;
	let isNextPlayWhitelistEnable = _GM_getValue("BILICLEANER_video-next-play-whitelist-filter-status", true);
	if(isPageVideo()) {
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
				var _a;
				const uploader = (_a = video.querySelector(".info > .upname a")) == null ? void 0 : _a.textContent;
				return uploader ? uploader : null;
			}
		};
		const nextSelectorFunc = rcmdSelectorFunc;
		const checkVideoList = (_fullSite) => {
			if(!videoListContainer) {
				debugFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				const nextVideos = videoListContainer.querySelectorAll(`.next-play .video-page-card-small, .next-play .video-page-operator-card-small`);
				const rcmdVideos = videoListContainer.querySelectorAll(`.rec-list .video-page-card-small, .rec-list .video-page-operator-card-small`);
				rcmdVideos.length && coreFilterInstance.checkAll([...rcmdVideos], false, rcmdSelectorFunc);
				if(isNextPlayWhitelistEnable) {
					nextVideos.forEach((video) => showVideo(video));
				} else {
					nextVideos.length && coreFilterInstance.checkAll([...nextVideos], false, nextSelectorFunc);
				}
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const watchVideoListContainer = () => {
			if(videoListContainer) {
				debugFilter("watchVideoListContainer start");
				checkVideoList();
				const videoObverser = new MutationObserver(() => {
					checkVideoList();
				});
				videoObverser.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, "#reco_list", (node) => {
				return node instanceof HTMLElement && node.id === "reco_list";
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
		const videoDurationAction = new DurationAction("video-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const videoUploaderAction = new UploaderAction("video-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const videoBvidAction = new BvidAction("video-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const videoTitleKeywordAction = new TitleKeywordAction("video-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const videoUploaderWhitelistAction = new UploaderWhitelistAction("video-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const videoTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("video-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$3) {
				return;
			}
			isContextMenuFuncRunning$3 = true;
			document.addEventListener("contextmenu", (e) => {
				var _a;
				if(e.target instanceof HTMLElement) {
					const target = e.target;
					if(isContextMenuUploaderEnable$3 && target.classList.contains("name")) {
						const uploader = target.textContent;
						if(uploader) {
							e.preventDefault();
							const onclickBlack = () => {
								videoUploaderAction.add(uploader);
							};
							const onclickWhite = () => {
								videoUploaderWhitelistAction.add(uploader);
							};
							contextMenuInstance.registerMenu(`◎ 屏蔽UP主：${uploader}`, onclickBlack);
							contextMenuInstance.registerMenu(`◎ 将UP主加入白名单`, onclickWhite);
							contextMenuInstance.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable$3 && target.classList.contains("title")) {
						const href2 = (_a = target.parentElement) == null ? void 0 : _a.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								const onclick = () => {
									videoBvidAction.add(bvid);
								};
								contextMenuInstance.registerMenu(`屏蔽视频：${bvid}`, onclick);
								contextMenuInstance.show(e.clientX, e.clientY);
							}
						}
					} else {
						contextMenuInstance.hide();
					}
				}
			});
			document.addEventListener("click", () => {
				contextMenuInstance.hide();
			});
			debugFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			// 启用 播放页时长过滤
			new CheckboxItem({
				itemID: videoDurationAction.statusKey,
				description: "启用 播放页时长过滤",
				itemFunc: () => {
					videoDurationAction.enable();
				},
				callback: () => {
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
				callback: (value) => {
					videoDurationAction.change(value);
				}
			})
		];
		videoFilterGroupList.push(new Group("video-duration-filter-group", "播放页 视频时长过滤", durationItems));
		const uploaderItems = [
			// 启用 播放页UP主过滤
			new CheckboxItem({
				itemID: videoUploaderAction.statusKey,
				description: "启用 播放页UP主过滤",
				itemFunc: () => {
					isContextMenuUploaderEnable$3 = true;
					contextMenuFunc();
					videoUploaderAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					videoUploaderAction.blacklist.show();
				}
			})
		];
		videoFilterGroupList.push(new Group("video-uploader-filter-group", "播放页 UP主过滤 (右键单击UP主)", uploaderItems));
		const titleKeywordItems = [
			// 启用 播放页关键词过滤
			new CheckboxItem({
				itemID: videoTitleKeywordAction.statusKey,
				description: "启用 播放页关键词过滤",
				itemFunc: () => {
					videoTitleKeywordAction.enable();
				},
				callback: () => {
					videoTitleKeywordAction.disable();
				}
			}),
			// 编辑 关键词黑名单
			new ButtonItem({
				itemID: "video-title-keyword-edit-button",
				description: "编辑 关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: () => {
					videoTitleKeywordAction.blacklist.show();
				}
			})
		];
		videoFilterGroupList.push(new Group("video-title-keyword-filter-group", "播放页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 播放页 BV号过滤
			new CheckboxItem({
				itemID: videoBvidAction.statusKey,
				description: "启用 播放页BV号过滤",
				itemFunc: () => {
					isContextMenuBvidEnable$3 = true;
					contextMenuFunc();
					videoBvidAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					videoBvidAction.blacklist.show();
				}
			})
		];
		videoFilterGroupList.push(new Group("video-bvid-filter-group", "播放页 BV号过滤 (右键单击标题)", bvidItems));
		const whitelistItems = [
			// 接下来播放 免过滤
			new CheckboxItem({
				itemID: "video-next-play-whitelist-filter-status",
				description: "接下来播放 免过滤",
				defaultStatus: true,
				itemFunc: () => {
					isNextPlayWhitelistEnable = true;
					checkVideoList();
				},
				callback: () => {
					isNextPlayWhitelistEnable = false;
					checkVideoList();
				}
			}),
			// 启用 播放页UP主白名单
			new CheckboxItem({
				itemID: videoUploaderWhitelistAction.statusKey,
				description: "启用 播放页UP主白名单",
				itemFunc: () => {
					videoUploaderWhitelistAction.enable();
				},
				callback: () => {
					videoUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "video-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: () => {
					videoUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 播放页关键词白名单
			new CheckboxItem({
				itemID: videoTitleKeywordWhitelistAction.statusKey,
				description: "启用 播放页关键词白名单",
				itemFunc: () => {
					videoTitleKeywordWhitelistAction.enable();
				},
				callback: () => {
					videoTitleKeywordWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "video-title-keyword-whitelist-edit-button",
				description: "编辑 关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：打开编辑器
				itemFunc: () => {
					videoTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		videoFilterGroupList.push(new Group("video-whitelist-filter-group", "播放页 白名单设定 (免过滤)", whitelistItems));
	}
	const popularFilterGroupList = [];
	let isContextMenuFuncRunning$2 = false;
	let isContextMenuUploaderEnable$2 = false;
	let isContextMenuBvidEnable$2 = false;
	if(isPagePopular()) {
		let videoListContainer;
		const hotSelectorFunc = {
			// popular页 无duration
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
			}
		};
		const checkVideoList = (fullSite) => {
			if(!videoListContainer) {
				debugFilter(`checkVideoList videoListContainer not exist`);
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
				hotVideos.length && coreFilterInstance.checkAll([...hotVideos], false, hotSelectorFunc);
				weeklyVideos.length && coreFilterInstance.checkAll([...weeklyVideos], false, hotSelectorFunc);
				rankVideos.length && coreFilterInstance.checkAll([...rankVideos], false, hotSelectorFunc);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const watchVideoListContainer = () => {
			if(videoListContainer) {
				debugFilter("watchVideoListContainer start");
				checkVideoList(true);
				const videoObverser = new MutationObserver(() => {
					checkVideoList(true);
				});
				videoObverser.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, "#app", (node) => {
				return node instanceof HTMLElement && node.id === "app";
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
		const popularUploaderAction = new UploaderAction("popular-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const popularBvidAction = new BvidAction("popular-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const popularTitleKeywordAction = new TitleKeywordAction("popular-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const popularUploaderWhitelistAction = new UploaderWhitelistAction("popular-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const popularTitleKeywordWhitelistAction = new TitleKeywordWhitelistAction("popular-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$2) {
				return;
			}
			isContextMenuFuncRunning$2 = true;
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
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
							contextMenuInstance.registerMenu(`◎ 屏蔽UP主：${uploader}`, onclickBlack);
							contextMenuInstance.registerMenu(`◎ 将UP主加入白名单`, onclickWhite);
							contextMenuInstance.show(e.clientX, e.clientY);
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
								contextMenuInstance.registerMenu(`屏蔽视频：${bvid}`, onclick);
								contextMenuInstance.show(e.clientX, e.clientY);
							}
						}
					} else {
						contextMenuInstance.hide();
					}
				}
			});
			document.addEventListener("click", () => {
				contextMenuInstance.hide();
			});
			debugFilter("contextMenuFunc listen contextmenu");
		};
		const uploaderItems = [
			// 启用 热门页 UP主过滤
			new CheckboxItem({
				itemID: popularUploaderAction.statusKey,
				description: "启用 热门页 UP主过滤",
				itemFunc: () => {
					isContextMenuUploaderEnable$2 = true;
					contextMenuFunc();
					popularUploaderAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					popularUploaderAction.blacklist.show();
				}
			})
		];
		popularFilterGroupList.push(new Group("popular-uploader-filter-group", "热门页 UP主过滤 (右键单击UP主)", uploaderItems));
		const titleKeywordItems = [
			// 启用 热门页 关键词过滤
			new CheckboxItem({
				itemID: popularTitleKeywordAction.statusKey,
				description: "启用 热门页 关键词过滤",
				itemFunc: () => {
					popularTitleKeywordAction.enable();
				},
				callback: () => {
					popularTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "popular-title-keyword-edit-button",
				description: "编辑 关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: () => {
					popularTitleKeywordAction.blacklist.show();
				}
			})
		];
		popularFilterGroupList.push(new Group("popular-title-keyword-filter-group", "热门页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 热门页 BV号过滤
			new CheckboxItem({
				itemID: popularBvidAction.statusKey,
				description: "启用 热门页 BV号过滤",
				itemFunc: () => {
					isContextMenuBvidEnable$2 = true;
					contextMenuFunc();
					popularBvidAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					popularBvidAction.blacklist.show();
				}
			})
		];
		popularFilterGroupList.push(new Group("popular-bvid-filter-group", "热门页 BV号过滤 (右键单击标题)", bvidItems));
		const whitelistItems = [
			// 启用 热门页 UP主白名单
			new CheckboxItem({
				itemID: popularUploaderWhitelistAction.statusKey,
				description: "启用 热门页 UP主白名单",
				itemFunc: () => {
					popularUploaderWhitelistAction.enable();
				},
				callback: () => {
					popularUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "popular-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					popularUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 热门页 标题关键词白名单
			new CheckboxItem({
				itemID: popularTitleKeywordWhitelistAction.statusKey,
				description: "启用 热门页 标题关键词白名单",
				itemFunc: () => {
					popularTitleKeywordWhitelistAction.enable();
				},
				callback: () => {
					popularTitleKeywordWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "popular-title-keyword-whitelist-edit-button",
				description: "编辑 关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					popularTitleKeywordWhitelistAction.whitelist.show();
				}
			})
		];
		popularFilterGroupList.push(new Group("popular-whitelist-filter-group", "热门页 白名单设定 (免过滤)", whitelistItems));
	}
	const searchFilterGroupList = [];
	let isContextMenuFuncRunning$1 = false;
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
				debugFilter(`checkVideoList videoListContainer not exist`);
				return;
			}
			try {
				const topVideos = [...videoListContainer.querySelectorAll(`.user-video-info .video-list > .video-list-item`)];
				const contentVideos = [...videoListContainer.querySelectorAll(`.video.search-all-list .video-list > div, .search-page-video .video-list > div`)];
				if(isTopUploaderWhitelistEnable) {
					topVideos.forEach((video) => showVideo(video));
				} else {
					topVideos.length && coreFilterInstance.checkAll(topVideos, false, searchSelectorFunc);
					debugFilter(`checkVideoList check ${topVideos.length} top videos`);
				}
				contentVideos.length && coreFilterInstance.checkAll(contentVideos, false, searchSelectorFunc);
				debugFilter(`checkVideoList check ${contentVideos.length} content videos`);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const watchVideoListContainer = () => {
			if(videoListContainer) {
				debugFilter("watchVideoListContainer start");
				checkVideoList();
				const videoObverser = new MutationObserver(() => {
					checkVideoList();
				});
				videoObverser.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, ".search-content", (node) => {
				var _a;
				return node instanceof HTMLElement && ((_a = node.className) == null ? void 0 : _a.includes("search-content"));
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
		const searchDurationAction = new DurationAction("search-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const searchUploaderAction = new UploaderAction("search-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const searchBvidAction = new BvidAction("search-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const searchTitleKeywordAction = new TitleKeywordAction("search-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const searchUploaderWhitelistAction = new UploaderWhitelistAction("search-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const searchTitleKeyworldWhitelistAction = new TitleKeywordWhitelistAction("search-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning$1) {
				return;
			}
			isContextMenuFuncRunning$1 = true;
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
				if(e.target instanceof HTMLElement) {
					debugFilter(e.target.classList);
					if(isContextMenuUploaderEnable$1 && (e.target.classList.contains("bili-video-card__info--author") || e.target.classList.contains("bili-video-card__info--date"))) {
						const node = (_a = e.target.parentElement) == null ? void 0 : _a.querySelector(".bili-video-card__info--author");
						const uploader = node == null ? void 0 : node.textContent;
						if(uploader) {
							e.preventDefault();
							const onclickBlack = () => {
								searchUploaderAction.add(uploader);
							};
							const onclickWhite = () => {
								searchUploaderWhitelistAction.add(uploader);
							};
							contextMenuInstance.registerMenu(`◎ 屏蔽UP主：${uploader}`, onclickBlack);
							contextMenuInstance.registerMenu(`◎ 将UP主加入白名单`, onclickWhite);
							contextMenuInstance.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable$1 && (e.target.classList.contains("bili-video-card__info--tit") || e.target.classList.contains("keyword") && ((_b = e.target.parentElement) == null ? void 0 : _b.classList.contains("bili-video-card__info--tit")))) {
						const node = e.target.closest(".bili-video-card__info--right");
						const href2 = (_c = node == null ? void 0 : node.querySelector(":scope > a")) == null ? void 0 : _c.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								const onclick = () => {
									searchBvidAction.add(bvid);
								};
								contextMenuInstance.registerMenu(`屏蔽视频：${bvid}`, onclick);
								contextMenuInstance.show(e.clientX, e.clientY);
							}
						}
					} else {
						contextMenuInstance.hide();
					}
				}
			});
			document.addEventListener("click", () => {
				contextMenuInstance.hide();
			});
			debugFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			new CheckboxItem({
				itemID: searchDurationAction.statusKey,
				description: "启用 搜索页时长过滤",
				itemFunc: () => {
					searchDurationAction.enable();
				},
				callback: () => {
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
				callback: (value) => {
					searchDurationAction.change(value);
				}
			})
		];
		searchFilterGroupList.push(new Group("search-duration-filter-group", "搜索页 视频时长过滤", durationItems));
		const uploaderItems = [
			new CheckboxItem({
				itemID: searchUploaderAction.statusKey,
				description: "启用 搜索页UP主过滤",
				itemFunc: () => {
					isContextMenuUploaderEnable$1 = true;
					contextMenuFunc();
					searchUploaderAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					searchUploaderAction.blacklist.show();
				}
			})
		];
		searchFilterGroupList.push(new Group("search-uploader-filter-group", "搜索页 UP主过滤 (右键单击UP主)", uploaderItems));
		const titleKeywordItems = [
			new CheckboxItem({
				itemID: searchTitleKeywordAction.statusKey,
				description: "启用 搜索页关键词过滤",
				itemFunc: () => {
					searchTitleKeywordAction.enable();
				},
				callback: () => {
					searchTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "search-title-keyword-edit-button",
				description: "编辑 关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: () => {
					searchTitleKeywordAction.blacklist.show();
				}
			})
		];
		searchFilterGroupList.push(new Group("search-title-keyword-filter-group", "搜索页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			new CheckboxItem({
				itemID: searchBvidAction.statusKey,
				description: "启用 搜索页BV号过滤",
				itemFunc: () => {
					isContextMenuBvidEnable$1 = true;
					contextMenuFunc();
					searchBvidAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					searchBvidAction.blacklist.show();
				}
			})
		];
		searchFilterGroupList.push(new Group("search-bvid-filter-group", "搜索页 BV号过滤 (右键单击标题)", bvidItems));
		const whitelistItems = [
			// 顶部匹配UP主 免过滤, 默认开启
			new CheckboxItem({
				itemID: "search-top-uploader-whitelist-filter-status",
				description: "搜索结果顶部UP主视频免过滤",
				defaultStatus: true,
				itemFunc: () => {
					isTopUploaderWhitelistEnable = true;
					checkVideoList();
				},
				callback: () => {
					isTopUploaderWhitelistEnable = false;
					checkVideoList();
				}
			}),
			new CheckboxItem({
				itemID: searchUploaderWhitelistAction.statusKey,
				description: "启用 搜索页UP主白名单",
				itemFunc: () => {
					searchUploaderWhitelistAction.enable();
				},
				callback: () => {
					searchUploaderWhitelistAction.disable();
				}
			}),
			new ButtonItem({
				itemID: "search-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					searchUploaderWhitelistAction.whitelist.show();
				}
			}),
			new CheckboxItem({
				itemID: searchTitleKeyworldWhitelistAction.statusKey,
				description: "启用 搜索页标题关键词白名单",
				itemFunc: () => {
					searchTitleKeyworldWhitelistAction.enable();
				},
				callback: () => {
					searchTitleKeyworldWhitelistAction.disable();
				}
			}),
			new ButtonItem({
				itemID: "search-title-keyword-whitelist-edit-button",
				description: "编辑 关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					searchTitleKeyworldWhitelistAction.whitelist.show();
				}
			})
		];
		searchFilterGroupList.push(new Group("search-whitelist-filter-group", "搜索页 白名单设定 (免过滤)", whitelistItems));
	}
	class SideBtn {
		constructor(btnID, btnContent, showFunc, hideFunc) {
			__publicField(this, "nodeHTML", `<button class="bili-cleaner-side-btn" type="button"></button>`);
			__publicField(this, "nodeCSS", `
    button.bili-cleaner-side-btn {
        border: 1px #E3E5E7 solid;
        width: 40px;
        height: 40px;
        padding: 0;
        font-size: 13px;
        color: black;
        border-radius: 6px;
        background-color: white;
        transition: background-color 0.1s linear;
        position: fixed;
        bottom: 220px;
        right: 6px;
        z-index: 99999;
        cursor: pointer;
        &:hover {
            background-color: #e3e5e7;
            curser: pointer;
        }
    }
    /* 全屏播放时隐藏 */
    html:has(#bilibili-player.mode-webscreen) button.bili-cleaner-side-btn {
        display: none !important;
    }`);
			this.btnID = btnID;
			this.btnContent = btnContent;
			this.showFunc = showFunc;
			this.hideFunc = hideFunc;
		}
		enable() {
			var _a, _b;
			try {
				(_a = document.querySelector(`#bili-cleaner-${this.btnID}`)) == null ? void 0 : _a.remove();
				(_b = document.querySelector(`style[bili-cleaner-css="${this.btnID}"]`)) == null ? void 0 : _b.remove();
				_GM_setValue(`BILICLEANER_${this.btnID}`, true);
				const style = document.createElement("style");
				style.innerHTML = this.nodeCSS.replace(/\n\s*/g, "").trim();
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
				let isShowing = false;
				node.addEventListener("click", () => {
					if(!isShowing) {
						this.showFunc();
						isShowing = true;
					} else {
						this.hideFunc();
						isShowing = false;
					}
				});
				document.documentElement.appendChild(node);
				debug(`SideBtn ${this.btnID} enable OK`);
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
	const channelGroupList = [];
	if(isPageChannel()) {
		const basicItems2 = [
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
				itemCSS: `.eva-banner:has([href*="cm.bilibili.com"]) {display: none !important;}
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
	const channelFilterGroupList = [];
	let isContextMenuFuncRunning = false;
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
				debugFilter(`checkVideoList videoListContainer not exist`);
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
				feedVideos.length && coreFilterInstance.checkAll(feedVideos, true, feedSelectorFunc);
			} catch (err) {
				error(err);
				error("checkVideoList error");
			}
		};
		const watchVideoListContainer = () => {
			if(videoListContainer) {
				debugFilter("watchVideoListContainer start");
				checkVideoList(true);
				const videoObverser = new MutationObserver(() => {
					checkVideoList(false);
				});
				videoObverser.observe(videoListContainer, {
					childList: true,
					subtree: true
				});
				debugFilter("watchVideoListContainer OK");
			}
		};
		try {
			waitForEle(document, "main.channel-layout", (node) => {
				return node instanceof HTMLElement && node.className === "channel-layout";
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
		const channelDurationAction = new DurationAction("channel-duration-filter-status", "global-duration-filter-value", checkVideoList);
		const channelUploaderAction = new UploaderAction("channel-uploader-filter-status", "global-uploader-filter-value", checkVideoList);
		const channelBvidAction = new BvidAction("channel-bvid-filter-status", "global-bvid-filter-value", checkVideoList);
		const channelTitleKeywordAction = new TitleKeywordAction("channel-title-keyword-filter-status", "global-title-keyword-filter-value", checkVideoList);
		const channelUploaderWhitelistAction = new UploaderWhitelistAction("channel-uploader-whitelist-filter-status", "global-uploader-whitelist-filter-value", checkVideoList);
		const channelTitleKeyworldWhitelistAction = new TitleKeywordWhitelistAction("channel-title-keyword-whitelist-filter-status", "global-title-keyword-whitelist-filter-value", checkVideoList);
		const contextMenuFunc = () => {
			if(isContextMenuFuncRunning) {
				return;
			}
			isContextMenuFuncRunning = true;
			document.addEventListener("contextmenu", (e) => {
				var _a, _b, _c;
				if(e.target instanceof HTMLElement) {
					if(isContextMenuUploaderEnable && (e.target.classList.contains("bili-video-card__info--author") || e.target.classList.contains("bili-video-card__info--date"))) {
						const node = (_a = e.target.parentElement) == null ? void 0 : _a.querySelector(".bili-video-card__info--author");
						const uploader = node == null ? void 0 : node.textContent;
						if(uploader) {
							e.preventDefault();
							const onclickBlack = () => {
								channelUploaderAction.add(uploader);
							};
							const onclickWhite = () => {
								channelUploaderWhitelistAction.add(uploader);
							};
							contextMenuInstance.registerMenu(`◎ 屏蔽UP主：${uploader}`, onclickBlack);
							contextMenuInstance.registerMenu(`◎ 将UP主加入白名单`, onclickWhite);
							contextMenuInstance.show(e.clientX, e.clientY);
						}
					} else if(isContextMenuBvidEnable && ((_b = e.target.parentElement) == null ? void 0 : _b.classList.contains("bili-video-card__info--tit"))) {
						const node = e.target.parentElement;
						const href2 = (_c = node.querySelector(":scope > a")) == null ? void 0 : _c.getAttribute("href");
						if(href2) {
							const bvid = matchBvid(href2);
							if(bvid) {
								e.preventDefault();
								const onclick = () => {
									channelBvidAction.add(bvid);
								};
								contextMenuInstance.registerMenu(`屏蔽视频：${bvid}`, onclick);
								contextMenuInstance.show(e.clientX, e.clientY);
							}
						}
					} else {
						contextMenuInstance.hide();
					}
				}
			});
			document.addEventListener("click", () => {
				contextMenuInstance.hide();
			});
			debugFilter("contextMenuFunc listen contextmenu");
		};
		const durationItems = [
			// 启用 频道页时长过滤
			new CheckboxItem({
				itemID: channelDurationAction.statusKey,
				description: "启用 频道页时长过滤",
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
				itemFunc: () => {
					channelDurationAction.enable();
				},
				callback: () => {
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
				callback: (value) => {
					channelDurationAction.change(value);
				}
			})
		];
		channelFilterGroupList.push(new Group("channel-duration-filter-group", "频道页 视频时长过滤", durationItems));
		const uploaderItems = [
			// 启用 频道页UP主过滤
			new CheckboxItem({
				itemID: channelUploaderAction.statusKey,
				description: "启用 频道页UP主过滤",
				itemFunc: () => {
					isContextMenuUploaderEnable = true;
					contextMenuFunc();
					channelUploaderAction.enable();
				},
				callback: () => {
					isContextMenuUploaderEnable = false;
					channelUploaderAction.disable();
				}
			}),
			// 按钮功能：打开uploader黑名单编辑框
			new ButtonItem({
				itemID: "channel-uploader-edit-button",
				description: "编辑 UP主黑名单",
				name: "编辑",
				// 按钮功能
				itemFunc: () => {
					channelUploaderAction.blacklist.show();
				}
			})
		];
		channelFilterGroupList.push(new Group("channel-uploader-filter-group", "频道页 UP主过滤 (右键单击UP主)", uploaderItems));
		const titleKeywordItems = [
			// 启用 频道页关键词过滤
			new CheckboxItem({
				itemID: channelTitleKeywordAction.statusKey,
				description: "启用 频道页关键词过滤",
				itemFunc: () => {
					channelTitleKeywordAction.enable();
				},
				callback: () => {
					channelTitleKeywordAction.disable();
				}
			}),
			// 按钮功能：打开titleKeyword黑名单编辑框
			new ButtonItem({
				itemID: "channel-title-keyword-edit-button",
				description: "编辑 关键词黑名单（支持正则）",
				name: "编辑",
				// 按钮功能
				itemFunc: () => {
					channelTitleKeywordAction.blacklist.show();
				}
			})
		];
		channelFilterGroupList.push(new Group("channel-title-keyword-filter-group", "频道页 标题关键词过滤", titleKeywordItems));
		const bvidItems = [
			// 启用 频道页BV号过滤
			new CheckboxItem({
				itemID: channelBvidAction.statusKey,
				description: "启用 频道页BV号过滤",
				itemFunc: () => {
					isContextMenuBvidEnable = true;
					contextMenuFunc();
					channelBvidAction.enable();
				},
				callback: () => {
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
				itemFunc: () => {
					channelBvidAction.blacklist.show();
				}
			})
		];
		channelFilterGroupList.push(new Group("channel-bvid-filter-group", "频道页 BV号过滤 (右键单击标题)", bvidItems));
		const whitelistItems = [
			// 启用 频道页UP主白名单
			new CheckboxItem({
				itemID: channelUploaderWhitelistAction.statusKey,
				description: "启用 频道页UP主白名单",
				itemFunc: () => {
					channelUploaderWhitelistAction.enable();
				},
				callback: () => {
					channelUploaderWhitelistAction.disable();
				}
			}),
			// 编辑 UP主白名单
			new ButtonItem({
				itemID: "channel-uploader-whitelist-edit-button",
				description: "编辑 UP主白名单",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					channelUploaderWhitelistAction.whitelist.show();
				}
			}),
			// 启用 频道页标题关键词白名单
			new CheckboxItem({
				itemID: channelTitleKeyworldWhitelistAction.statusKey,
				description: "启用 频道页标题关键词白名单",
				itemFunc: () => {
					channelTitleKeyworldWhitelistAction.enable();
				},
				callback: () => {
					channelTitleKeyworldWhitelistAction.disable();
				}
			}),
			// 编辑 关键词白名单
			new ButtonItem({
				itemID: "channel-title-keyword-whitelist-edit-button",
				description: "编辑 关键词白名单（支持正则）",
				name: "编辑",
				// 按钮功能：显示白名单编辑器
				itemFunc: () => {
					channelTitleKeyworldWhitelistAction.whitelist.show();
				}
			})
		];
		channelFilterGroupList.push(new Group("channel-whitelist-filter-group", "频道页 白名单设定 (免过滤)", whitelistItems));
	}
	log("script start");
	const main = async () => {
		try {
			await init();
		} catch (err) {
			error(err);
			error("init error, try continue");
		}
		const RULE_GROUPS = [...homepageGroupList, ...popularGroupList, ...videoGroupList, ...bangumiGroupList, ...searchGroupList, ...dynamicGroupList, ...liveGroupList, ...channelGroupList, ...commonGroupList];
		RULE_GROUPS.forEach((e) => e.enableGroup());
		const VIDEO_FILTER_GROUPS = [...homepageFilterGroupList, ...videoFilterGroupList, ...popularFilterGroupList, ...searchFilterGroupList, ...channelFilterGroupList];
		VIDEO_FILTER_GROUPS.forEach((e) => e.enableGroup());
		let lastURL = location.href;
		setInterval(() => {
			const currURL = location.href;
			if(currURL !== lastURL) {
				debug("url change detected");
				RULE_GROUPS.forEach((e) => e.reloadGroup());
				lastURL = currURL;
				debug("url change reload groups complete");
			}
		}, 500);
		let isGroupEnable = true;
		document.addEventListener("keydown", (event) => {
			let flag = false;
			if(event.altKey && event.ctrlKey && (event.key === "b" || event.key === "B")) {
				flag = true;
			} else if(event.altKey && (event.key === "b" || event.key === "B")) {
				if(navigator.userAgent.toLocaleLowerCase().includes("chrome")) {
					flag = true;
				}
			}
			if(flag) {
				debug("hotkey detected");
				if(isGroupEnable) {
					RULE_GROUPS.forEach((e) => e.disableGroup());
					isGroupEnable = false;
				} else {
					RULE_GROUPS.forEach((e) => e.enableGroup(false));
					isGroupEnable = true;
				}
			}
		});
		const createPanelWithMode = (mode, groups) => {
			switch(panelInstance.mode) {
				case void 0:
					debug(`${mode} panel create start`);
					panelInstance.create();
					panelInstance.mode = mode;
					groups.forEach((e) => {
						e.insertGroup();
						e.insertGroupItems();
					});
					panelInstance.show();
					debug(`${mode} panel create complete`);
					break;
				case mode:
					debug(`${mode} panel exist, just show it`);
					panelInstance.show();
					break;
				default:
					debug(`${mode} panel replace other panel`);
					panelInstance.clearGroups();
					panelInstance.mode = mode;
					groups.forEach((e) => {
						e.insertGroup();
						e.insertGroupItems();
					});
					panelInstance.show();
					debug(`${mode} panel replace complete`);
			}
		};
		_GM_registerMenuCommand("✅页面净化设置", () => {
			createPanelWithMode("rule", RULE_GROUPS);
		});
		if(isPageHomepage() || isPageVideo() || isPagePopular() || isPageSearch() || isPageChannel()) {
			_GM_registerMenuCommand("✅视频过滤设置", () => {
				createPanelWithMode("filter", VIDEO_FILTER_GROUPS);
			});
			const videoFilterSideBtnID = "video-filter-side-btn";
			const sideBtn = new SideBtn(videoFilterSideBtnID, "视频过滤",
				() => {
					createPanelWithMode("filter", VIDEO_FILTER_GROUPS);
				},
				() => {
					panelInstance.hide();
				});
			if(_GM_getValue(`BILICLEANER_${videoFilterSideBtnID}`, false)) {
				sideBtn.enable();
				_GM_registerMenuCommand("⚡️关闭 过滤器快捷按钮 (需刷新)", () => {
					sideBtn.disable();
				});
			} else {
				_GM_registerMenuCommand("⚡️启用 过滤器快捷按钮 (需刷新)", () => {
					sideBtn.enable();
				});
			}
		}
		debug("register menu complete");
	};
	try {
		await (main());
	} catch (err) {
		error(err);
	}
	log("script end");
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