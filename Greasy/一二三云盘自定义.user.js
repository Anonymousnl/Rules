// ==UserScript==
// @name        一二三云盘自定义
// @version     2025092100
// @match       *://*.123684.com/*
// @match       *://*.123865.com/*
// @match       *://*.123912.com/*
// @match       *://*.123952.com/*
// @match       *://*.123pan.cn/*
// @match       *://*.123pan.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/123pan.png
// @grant       GM_getValue
// @grant       GM_info
// @grant       GM_registerMenuCommand
// @grant       GM_setClipboard
// @grant       GM_setValue
// @grant       GM_unregisterMenuCommand
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// @run-at      document-start
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E4%B8%80%E4%BA%8C%E4%B8%89%E4%BA%91%E7%9B%98%E8%87%AA%E5%AE%9A%E4%B9%89.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E4%B8%80%E4%BA%8C%E4%B8%89%E4%BA%91%E7%9B%98%E8%87%AA%E5%AE%9A%E4%B9%89.user.js
// ==/UserScript==
(function() {
    // 检测unsafeWindow
    if (typeof(unsafeWindow) === 'undefined') window.unsafeWindow = window;
    // 从存储中读取配置
    var user = {
        vip: GM_getValue('vip', 1),
        svip: GM_getValue('svip', 1),
        pvip: GM_getValue('pvip', 0),
        ad: GM_getValue('ad', 1),
        name: GM_getValue('name', ""),
        photo: GM_getValue('photo', ""),
        mail: GM_getValue('mail', ""),
        phone: GM_getValue('phone', ""),
        id: GM_getValue('id', ""),
        level: GM_getValue('level', 128),
        endtime: GM_getValue('endtime', 253402185600),
        debug: GM_getValue('debug', 0),
    }
    // 保存原始方法
    const originalXHR = unsafeWindow.XMLHttpRequest;
    const originalFetch = unsafeWindow.fetch;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    // 创建唯一标识符
    const requestURLSymbol = Symbol('requestURL');
    const modifiedHeadersSymbol = Symbol('modifiedHeaders');
    // 规则配置
    const rules = [{
            // 用户信息
            runat: "end",
            match: (url) => url.pathname.includes('api/user/info'),
            condition: () => user.vip === 1,
            action: (res) => {
                if (!res.data) return res;
                res.data.Vip = true;
                res.data.VipLevel = user.pvip ? 3 : (user.svip ? 2 : 1);
                if (user.ad === 1) res.data.IsShowAdvertisement = false;
                // 确保UserVipDetail存在
                if (!res.data.UserVipDetail) {
                    res.data.UserVipDetail = {};
                }
                res.data.UserVipDetail.VipCode = res.data.VipLevel;
                if (user.pvip === 1) {
                    // 长期会员
                    res.data.VipExpire = "永久有效";
                    res.data.UserVipDetail.UserPermanentVIPDetailInfos = [{
                        VipDesc: "长期VIP会员",
                        TimeDesc: " 永久有效",
                        IsUse: true
                    }];
                    res.data.UserVipDetailInfos = [];
                } else if (user.svip === 1) {
                    // 超级会员
                    let time = new Date(user.endtime * 1000);
                    res.data.VipExpire = time.toLocaleString();
                    res.data.UserVipDetailInfos = [{
                        VipDesc: "SVIP 会员",
                        TimeDesc: time.toLocaleDateString() + " 到期",
                        IsUse: time >= new Date()
                    }];
                } else {
                    // 普通会员
                    let time = new Date(user.endtime * 1000);
                    res.data.VipExpire = time.toLocaleString();
                    res.data.UserVipDetailInfos = [{
                        VipDesc: "VIP 会员",
                        TimeDesc: time.toLocaleDateString() + " 到期",
                        IsUse: time >= new Date()
                    }];
                }
                if (user.name) res.data.Nickname = user.name;
                if (user.photo) res.data.HeadImage = user.photo;
                if (user.mail) res.data.Mail = user.mail;
                if (user.phone) res.data.Passport = Number(user.phone);
                if (user.id) res.data.UID = Number(user.id);
                if (user.level) res.data.GrowSpaceAddCount = Number(user.level);
                return res;
            }
        },
        {
            // 用户报告信息
            runat: "end",
            match: (url) => url.pathname.includes('user/report/info'),
            condition: () => user.vip === 1,
            action: (res) => {
                if (res && res.data) {
                    res.data.vipType = user.pvip ? 3 : (user.svip ? 2 : 1);
                    res.data.vipSub = user.pvip ? 3 : (user.svip ? 2 : 1);
                    res.data.developSub = user.pvip ? 3 : (user.svip ? 2 : 1);
                }
                return res;
            }
        },
        {
            // 下载请求头处理
            runat: "header",
            match: (url) => [
                'file/download_info',
                'file/batch_download_info',
                'share/download/info',
                'file/batch_download_share_info'
            ].some(path => url.pathname.includes(path)),
            condition: () => true,
            action: (headers) => {
                headers.platform = 'android';
                return headers;
            }
        },
        {
            // 下载信息处理
            runat: "end",
            match: (url) => [
                'file/download_info',
                'file/batch_download_info',
                'share/download/info',
                'file/batch_download_share_info'
            ].some(path => url.pathname.includes(path)),
            condition: () => true,
            action: (res, url) => {
                // 处理下载限制错误
                if (res?.code === 5113 || res?.code === 5114 || res?.message?.includes("下载流量已超出")) {
                    if (url.pathname.includes("batch_download")) {
                        return {
                            code: 400,
                            message: "【123云盘解锁】请勿多选文件！已为您拦截支付下载窗口",
                            data: null
                        };
                    } else {
                        return {
                            code: 400,
                            message: "【123云盘解锁】您今日下载流量已超出限制，已为您拦截支付窗口",
                            data: null
                        };
                    }
                }
                if (res.data && (res.data.DownloadUrl || res.data.DownloadURL)) {
                    // 统一处理下载链接
                    let origKey = res.data.DownloadUrl ? 'DownloadUrl' : 'DownloadURL';
                    let origURL = new URL(res.data[origKey]);
                    let finalURL;
                    if (origURL.origin.includes("web-pro")) {
                        let params = (() => {
                            try {
                                return decodeURIComponent(atob(origURL.searchParams.get('params')));
                            } catch {
                                return atob(origURL.searchParams.get('params'));
                            }
                        })();
                        let directURL = new URL(params, origURL.origin);
                        directURL.searchParams.set('auto_redirect', 0);
                        origURL.searchParams.set('params', btoa(encodeURI(directURL.href)));
                        finalURL = decodeURIComponent(origURL.href);
                    } else {
                        origURL.searchParams.set('auto_redirect', 0);
                        let newURL = new URL('https://web-pro2.123952.com/download-v2/', origURL.origin);
                        newURL.searchParams.set('params', btoa(encodeURI(origURL.href)));
                        newURL.searchParams.set('is_s3', 0);
                        finalURL = decodeURIComponent(newURL.href);
                    }
                    res.data[origKey] = finalURL;
                }
                return res;
            }
        },
        {
            // 屏蔽数据收集请求
            runat: "start",
            match: (url) => url.pathname.includes('web_logs') || url.pathname.includes('metrics'),
            condition: () => true,
            action: () => {
                throw new Error('【123云盘解锁】已屏蔽此数据收集器');
            }
        }
    ];
    // 工具函数
    function findMatchingRule(url, phase) {
        return rules.find(rule =>
            rule.match(url) &&
            rule.condition() &&
            rule.runat === phase
        );
    }

    function processData(data) {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {
                return data;
            }
        }
        return data;
    }

    function debugLog(method, phase, url, original, modified) {
        if (user.debug) {
            console.log(`[123云盘解锁] ${method} ${phase}`, {
                url: url.href,
                original: original,
                modified: modified
            });
        }
    }

    function applyRule(rule, data, url, method, phase) {
        const originalData = processData(data);
        let result = rule.action(originalData, url);
        // 处理header格式化
        if (phase === 'header' && result && typeof result === 'object') {
            const headers = {};
            Object.entries(result).forEach(([key, value]) => {
                const formattedKey = key.toLowerCase()
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('-');
                headers[formattedKey] = value;
            });
            result = headers;
        }
        debugLog(method, phase, url, originalData, result);
        // 非header返回字符串
        if (phase !== 'header' && result && typeof result === 'object') {
            return JSON.stringify(result);
        }
        return result;
    }
    // 修复后的Fetch拦截
    unsafeWindow.fetch = async function(input, init = {}) {
        const url = new URL(typeof input === 'string' ? input : input.url, location.origin);
        // 检查start规则
        const startRule = findMatchingRule(url, 'start');
        if (startRule) {
            try {
                const result = applyRule(startRule, null, url, 'fetch', 'start');
                return new Response(result, {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.warn('[123云盘解锁] fetch start错误:', error);
            }
        }
        // 检查header规则
        const headerRule = findMatchingRule(url, 'header');
        if (headerRule) {
            if (!init.headers) init.headers = {};
            let headers = {};
            if (init.headers instanceof Headers) {
                init.headers.forEach((value, key) => headers[key] = value);
            } else {
                headers = {
                    ...init.headers
                };
            }
            const modifiedHeaders = applyRule(headerRule, headers, url, 'fetch', 'header');
            init.headers = new Headers(modifiedHeaders);
        }
        // 执行原始请求
        const response = await originalFetch.call(this, input, init);
        // 检查end规则
        const endRule = findMatchingRule(url, 'end');
        if (endRule) {
            try {
                const responseText = await response.clone().text();
                const modifiedResponse = applyRule(endRule, responseText, url, 'fetch', 'end');
                return new Response(modifiedResponse, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            } catch (error) {
                console.warn('[123云盘解锁] fetch end错误:', error);
            }
        }
        return response;
    };
    // 修复后的XMLHttpRequest拦截
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        const fullUrl = new URL(url, location.origin);
        this[requestURLSymbol] = fullUrl;
        // 使用箭头函数保持this上下文
        const handleStateChange = () => {
            if (this.readyState === 4) {
                const endRule = findMatchingRule(fullUrl, 'end');
                if (endRule) {
                    try {
                        const modifiedResponse = applyRule(
                            endRule,
                            this.responseText,
                            fullUrl,
                            'XHR',
                            'end'
                        );
                        Object.defineProperty(this, 'responseText', {
                            value: modifiedResponse,
                            writable: false,
                            configurable: true
                        });
                        Object.defineProperty(this, 'response', {
                            value: modifiedResponse,
                            writable: false,
                            configurable: true
                        });
                    } catch (error) {
                        console.warn('[123云盘解锁] XHR响应错误:', error);
                    }
                }
            }
        };
        this.addEventListener('readystatechange', handleStateChange);
        return originalOpen.call(this, method, url, ...args);
    };
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        const url = this[requestURLSymbol];
        if (!url) return originalSetRequestHeader.call(this, name, value);
        const headerRule = findMatchingRule(url, 'header');
        if (headerRule) {
            if (!this[modifiedHeadersSymbol]) this[modifiedHeadersSymbol] = {};
            this[modifiedHeadersSymbol][name] = value;
            const modifiedHeaders = applyRule(headerRule, this[modifiedHeadersSymbol], url, 'XHR', 'header');
            this[modifiedHeadersSymbol] = modifiedHeaders;
            return;
        }
        return originalSetRequestHeader.call(this, name, value);
    };
    XMLHttpRequest.prototype.send = function(data) {
        const url = this[requestURLSymbol];
        if (!url) return originalSend.call(this, data);
        // 应用修改的headers
        const modifiedHeaders = this[modifiedHeadersSymbol];
        if (modifiedHeaders) {
            Object.entries(modifiedHeaders).forEach(([name, value]) => {
                originalSetRequestHeader.call(this, name, value);
            });
        }
        // 检查start规则
        const startRule = findMatchingRule(url, 'start');
        if (startRule) {
            try {
                const result = applyRule(startRule, null, url, 'XHR', 'start');
                // 设置响应属性
                Object.defineProperty(this, 'readyState', {
                    value: 4,
                    configurable: true
                });
                Object.defineProperty(this, 'status', {
                    value: 200,
                    configurable: true
                });
                Object.defineProperty(this, 'responseText', {
                    value: result,
                    configurable: true
                });
                Object.defineProperty(this, 'response', {
                    value: result,
                    configurable: true
                });
                // 触发事件
                setTimeout(() => {
                    ['readystatechange', 'load', 'loadend'].forEach(eventType => {
                        try {
                            this.dispatchEvent(new Event(eventType));
                            const handler = this[`on${eventType}`];
                            if (typeof handler === 'function') handler.call(this);
                        } catch (error) {
                            console.warn(`[123云盘解锁] 事件错误 ${eventType}:`, error);
                        }
                    });
                }, 0);
                return;
            } catch (error) {
                console.warn('[123云盘解锁] XHR start错误:', error);
            }
        }
        return originalSend.call(this, data);
    };
    // 格式化设置项
    const formatSetting = (key, value, comment) => {
        const item = document.createElement('div');
        item.className = 'setting-item';
        const content = document.createElement('div');
        content.className = 'setting-content';
        const keyElement = document.createElement('div');
        keyElement.className = 'setting-key';
        keyElement.textContent = key;
        content.appendChild(keyElement);
        // 判断设置类型 - 修复等级1被误判为开关的问题
        const switchKeys = ['VIP状态', 'SVIP显示', '长期会员显示', '广告控制', '调试模式'];
        const isSwitch = switchKeys.includes(key) && typeof value === 'number' && (value === 0 || value === 1);
        const isEditable = ['用户名', '头像', '等级', '过期时间'].includes(key);
        if (isSwitch) {
            // 创建开关按钮
            const switchContainer = document.createElement('label');
            switchContainer.className = 'switch';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = value === 1;
            const slider = document.createElement('span');
            slider.className = 'slider round';
            switchContainer.appendChild(input);
            switchContainer.appendChild(slider);
            // 添加点击事件
            input.addEventListener('change', () => {
                let newValue = input.checked ? 1 : 0;
                // 更新用户配置
                switch (key) {
                    case 'VIP状态':
                        user.vip = newValue;
                        GM_setValue('vip', newValue);
                        break;
                    case 'SVIP显示':
                        user.svip = newValue;
                        GM_setValue('svip', newValue);
                        // 如果SVIP关闭，长期会员也应该关闭
                        if (newValue === 0 && user.pvip === 1) {
                            user.pvip = 0;
                            GM_setValue('pvip', 0);
                        }
                        break;
                    case '长期会员显示':
                        user.pvip = newValue;
                        GM_setValue('pvip', newValue);
                        // 如果长期会员开启，SVIP必须开启
                        if (newValue === 1 && user.svip === 0) {
                            user.svip = 1;
                            GM_setValue('svip', 1);
                        }
                        break;
                    case '广告控制':
                        user.ad = newValue;
                        GM_setValue('ad', newValue);
                        break;
                    case '调试模式':
                        user.debug = newValue;
                        GM_setValue('debug', newValue);
                        break;
                }
                // 刷新页面以应用更改
                setTimeout(() => location.reload(), 300);
            });
            content.appendChild(switchContainer);
        } else if (isEditable) {
            // 创建输入框
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';
            const inputElement = document.createElement('input');
            // 根据不同的设置项设置输入框类型和属性
            if (key === '等级') {
                inputElement.type = 'number';
                inputElement.min = 0;
                inputElement.max = 128;
                inputElement.value = value;
            } else if (key === '过期时间') {
                inputElement.type = 'datetime-local';
                // 将时间戳转换为datetime-local格式
                const date = new Date(value * 1000);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                inputElement.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            } else {
                inputElement.type = 'text';
                inputElement.value = value;
            }
            inputElement.className = 'setting-input';
            // 添加保存按钮
            const saveButton = document.createElement('button');
            saveButton.textContent = '保存';
            saveButton.className = 'save-btn';
            // 保存按钮点击事件
            saveButton.addEventListener('click', () => {
                let newValue = inputElement.value;
                // 验证和转换不同类型的输入
                if (key === '等级') {
                    newValue = parseInt(newValue);
                    if (isNaN(newValue) || newValue < 0 || newValue > 128) {
                        alert('等级必须在 0-128 之间');
                        return;
                    }
                } else if (key === '过期时间') {
                    // 将datetime-local格式转换为时间戳
                    const date = new Date(newValue);
                    if (isNaN(date.getTime())) {
                        alert('请输入有效的日期时间');
                        return;
                    }
                    newValue = Math.floor(date.getTime() / 1000);
                } else if (key === '头像' && newValue && !newValue.match(/^https?:\/\/.+/)) {
                    if (!confirm('头像URL似乎不是有效的HTTP/HTTPS地址，是否继续保存？')) {
                        return;
                    }
                }
                // 更新配置
                switch (key) {
                    case '用户名':
                        user.name = newValue;
                        GM_setValue('name', newValue);
                        break;
                    case '头像':
                        user.photo = newValue;
                        GM_setValue('photo', newValue);
                        break;
                    case '等级':
                        user.level = newValue;
                        GM_setValue('level', newValue);
                        break;
                    case '过期时间':
                        user.endtime = newValue;
                        GM_setValue('endtime', newValue);
                        break;
                }
                // 显示保存成功提示
                saveButton.textContent = '已保存';
                saveButton.classList.add('saved');
                setTimeout(() => {
                    saveButton.textContent = '保存';
                    saveButton.classList.remove('saved');
                    location.reload();
                }, 1500);
            });
            inputContainer.appendChild(inputElement);
            inputContainer.appendChild(saveButton);
            content.appendChild(inputContainer);
        } else {
            // 非编辑项的显示
            const valueElement = document.createElement('div');
            valueElement.className = 'setting-value';
            valueElement.textContent = key === '过期时间' ? new Date(value * 1000).toLocaleString() : value;
            content.appendChild(valueElement);
        }
        item.appendChild(content);
        if (comment) {
            const commentElement = document.createElement('div');
            commentElement.className = 'setting-comment';
            commentElement.textContent = comment;
            item.appendChild(commentElement);
        }
        return item;
    };

    function createSettingsPanel() {
        // 检查是否已存在面板
        if (document.getElementById('vip-settings-panel')) {
            return;
        }
        // 创建面板容器
        const panel = document.createElement('div');
        panel.id = 'vip-settings-panel';
        panel.className = 'settings-panel';
        // 创建标题栏
        const header = document.createElement('div');
        header.className = 'panel-header';
        // 创建标题容器
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        const title = document.createElement('h3');
        title.textContent = '123云盘脚本设置';
        titleContainer.appendChild(title);
        // 添加GitHub图标
        const githubIcon = document.createElement('a');
        githubIcon.href = 'https://github.com/QingJ01/123pan_unlock';
        githubIcon.target = '_blank';
        githubIcon.className = 'github-icon';
        githubIcon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; shape-rendering: geometricPrecision;">
<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
</svg>
`;
        githubIcon.title = '访问GitHub项目';
        titleContainer.appendChild(githubIcon);
        header.appendChild(titleContainer);
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'close-btn';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => panel.remove());
        header.appendChild(closeButton);
        panel.appendChild(header);
        // 创建设置列表
        const settingsList = document.createElement('div');
        settingsList.className = 'settings-list';
        // 添加所有设置项
        const settings = [{
                key: 'VIP状态',
                value: user.vip,
                comment: '会员修改总开关'
            },
            {
                key: 'SVIP显示',
                value: user.svip,
                comment: '显示为超级会员 (关闭将自动关闭长期会员)'
            },
            {
                key: '长期会员显示',
                value: user.pvip,
                comment: '显示为长期会员 (开启将自动开启 SVIP 显示)'
            },
            {
                key: '广告控制',
                value: user.ad,
                comment: '关闭广告'
            },
            {
                key: '用户名',
                value: user.name,
                comment: '自定义用户名（支持中文、英文、数字）'
            },
            {
                key: '头像',
                value: user.photo,
                comment: '自定义头像URL（建议使用HTTPS地址）'
            },
            {
                key: '等级',
                value: user.level,
                comment: '成长容量等级（0-128，数字越大容量越大）'
            },
            {
                key: '过期时间',
                value: user.endtime,
                comment: '会员过期时间（可自定义任意时间）'
            },
            {
                key: '调试模式',
                value: user.debug,
                comment: '调试信息显示级别'
            }
        ];
        settings.forEach(setting => {
            settingsList.appendChild(formatSetting(setting.key, setting.value, setting.comment));
        });
        panel.appendChild(settingsList);
        // 添加交流群按钮
        const groupButton = document.createElement('a');
        groupButton.href = 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=GGU3-kUsPnz1bq-jwN7e8D41yxZ-DyI2&authKey=ujGsFKDnF5zD3j1z9krJR5xHlWWAKHOJV2oarfAgNmqZAl0xmTb45QwsqgYPPF7e&noverify=0&group_code=1035747022';
        groupButton.target = '_blank';
        groupButton.className = 'group-btn';
        groupButton.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
</svg>
<span>加入交流群</span>
`;
        panel.appendChild(groupButton);
        document.body.appendChild(panel);
    }

    function addTriggerButton() {
        const trigger = document.createElement('button');
        trigger.id = 'settings-trigger';
        trigger.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="3"></circle>
<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
</svg>
`;
        trigger.addEventListener('click', createSettingsPanel);
        document.body.appendChild(trigger);
    }
    // 添加样式 - 修复版本
    function addStyles() {
        // 先移除可能存在的旧样式
        const existingStyle = document.getElementById('vip-settings-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        const style = document.createElement('style');
        style.id = 'vip-settings-style';
        style.textContent = `
/* 全局样式 */
.settings-panel {
position: fixed !important;
top: 50% !important;
left: 50% !important;
transform: translate(-50%, -50%) !important;
background: rgba(255, 255, 255, 0.95) !important;
backdrop-filter: blur(20px) !important;
-webkit-backdrop-filter: blur(20px) !important;
border: 1px solid rgba(255, 255, 255, 0.2) !important;
border-radius: 16px !important;
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
z-index: 10000 !important;
width: 90% !important;
max-width: 500px !important;
max-height: 80vh !important;
overflow: hidden !important;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif !important;
color: #333 !important;
animation: panelFadeIn 0.3s ease !important;
-webkit-font-smoothing: antialiased !important;
-moz-osx-font-smoothing: grayscale !important;
text-rendering: optimizeLegibility !important;
}
@keyframes panelFadeIn {
from { opacity: 0; transform: translate(-50%, -48%); }
to { opacity: 1; transform: translate(-50%, -50%); }
}
.panel-header {
display: flex !important;
justify-content: space-between !important;
align-items: center !important;
padding: 16px 20px !important;
border-bottom: 1px solid rgba(238, 238, 238, 0.6) !important;
background: rgba(248, 249, 250, 0.8) !important;
backdrop-filter: blur(10px) !important;
-webkit-backdrop-filter: blur(10px) !important;
border-radius: 16px 16px 0 0 !important;
}
.title-container {
display: flex !important;
align-items: center !important;
gap: 10px !important;
-webkit-font-smoothing: antialiased !important;
-moz-osx-font-smoothing: grayscale !important;
}
.panel-header h3 {
margin: 0 !important;
font-size: 18px !important;
font-weight: 600 !important;
color: #1a73e8 !important;
text-rendering: optimizeLegibility !important;
-webkit-font-smoothing: antialiased !important;
-moz-osx-font-smoothing: grayscale !important;
letter-spacing: 0.01em !important;
}
.github-icon {
display: flex !important;
align-items: center !important;
justify-content: center !important;
width: 30px !important;
height: 30px !important;
background: rgba(26, 115, 232, 0.1) !important;
border: 1px solid rgba(26, 115, 232, 0.2) !important;
border-radius: 6px !important;
color: #1a73e8 !important;
text-decoration: none !important;
transition: all 0.3s ease !important;
backdrop-filter: blur(5px) !important;
-webkit-backdrop-filter: blur(5px) !important;
image-rendering: -webkit-optimize-contrast !important;
image-rendering: crisp-edges !important;
shape-rendering: geometricPrecision !important;
}
.github-icon:hover {
background: rgba(26, 115, 232, 0.15) !important;
border-color: rgba(26, 115, 232, 0.4) !important;
transform: scale(1.05) !important;
color: #1557b0 !important;
}
.close-btn {
background: none !important;
border: none !important;
font-size: 24px !important;
cursor: pointer !important;
color: #70757a !important;
padding: 0 !important;
width: 30px !important;
height: 30px !important;
display: flex !important;
align-items: center !important;
justify-content: center !important;
border-radius: 50% !important;
transition: background 0.2s !important;
}
.close-btn:hover {
background: #f1f3f4 !important;
color: #d93025 !important;
}
.settings-list {
padding: 16px 20px !important;
overflow-y: auto !important;
max-height: calc(80vh - 180px) !important;
padding-bottom: 20px !important;
}
.setting-item {
margin-bottom: 16px !important;
padding: 12px !important;
background: rgba(248, 249, 250, 0.7) !important;
backdrop-filter: blur(5px) !important;
-webkit-backdrop-filter: blur(5px) !important;
border-radius: 12px !important;
border: 1px solid rgba(232, 234, 237, 0.6) !important;
transition: all 0.3s ease !important;
}
.setting-item:hover {
background: rgba(248, 249, 250, 0.9) !important;
border-color: rgba(26, 115, 232, 0.3) !important;
transform: translateY(-1px) !important;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}
.setting-content {
display: flex !important;
justify-content: space-between !important;
align-items: center !important;
margin-bottom: 8px !important;
}
.setting-key {
font-weight: 500 !important;
flex: 1 !important;
}
.setting-value {
color: #1a73e8 !important;
font-weight: 500 !important;
text-align: right !important;
}
.setting-comment {
font-size: 12px !important;
color: #70757a !important;
line-height: 1.4 !important;
}
/* 开关样式 */
.switch {
position: relative !important;
display: inline-block !important;
width: 40px !important;
height: 20px !important;
}
.switch input {
opacity: 0 !important;
width: 0 !important;
height: 0 !important;
}
.slider {
position: absolute !important;
cursor: pointer !important;
top: 0 !important;
left: 0 !important;
right: 0 !important;
bottom: 0 !important;
background-color: #ccc !important;
transition: .3s !important;
}
.slider:before {
position: absolute !important;
content: "" !important;
height: 16px !important;
width: 16px !important;
left: 2px !important;
bottom: 2px !important;
background-color: white !important;
transition: .3s !important;
}
input:checked + .slider {
background-color: #1a73e8 !important;
}
input:checked + .slider:before {
transform: translateX(20px) !important;
}
.slider.round {
border-radius: 34px !important;
}
.slider.round:before {
border-radius: 50% !important;
}
/* 输入框和按钮样式 */
.input-container {
display: flex !important;
gap: 8px !important;
}
.setting-input {
padding: 6px 10px !important;
border: 1px solid #dadce0 !important;
border-radius: 4px !important;
font-size: 14px !important;
flex: 1 !important;
min-width: 0 !important;
}
.setting-input:focus {
outline: none !important;
border-color: #1a73e8 !important;
}
.save-btn {
padding: 6px 12px !important;
background: #1a73e8 !important;
color: white !important;
border: none !important;
border-radius: 4px !important;
cursor: pointer !important;
font-size: 12px !important;
transition: background 0.2s !important;
white-space: nowrap !important;
}
.save-btn:hover {
background: #1557b0 !important;
}
.save-btn.saved {
background: #188038 !important;
}
/* 交流群按钮 */
.group-btn {
display: flex !important;
align-items: center !important;
justify-content: center !important;
gap: 8px !important;
position: sticky !important;
bottom: 0 !important;
margin: 8px 20px 20px 20px !important;
padding: 12px 16px !important;
background: linear-gradient(135deg, rgba(26, 115, 232, 0.9), rgba(21, 87, 176, 0.9)) !important;
backdrop-filter: blur(15px) !important;
-webkit-backdrop-filter: blur(15px) !important;
color: white !important;
border: 1px solid rgba(255, 255, 255, 0.2) !important;
border-radius: 12px !important;
cursor: pointer !important;
text-decoration: none !important;
font-weight: 500 !important;
transition: all 0.3s ease !important;
box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2), 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
z-index: 10 !important;
}
.group-btn:hover {
transform: translateY(-2px) !important;
box-shadow: 0 8px 20px rgba(26, 115, 232, 0.4), 0 -4px 15px rgba(0, 0, 0, 0.15) !important;
background: linear-gradient(135deg, rgba(26, 115, 232, 1), rgba(21, 87, 176, 1)) !important;
}
/* 触发按钮 */
#settings-trigger {
position: fixed !important;
bottom: 20px !important;
right: 20px !important;
width: 54px !important;
height: 54px !important;
background: rgba(26, 115, 232, 0.9) !important;
backdrop-filter: blur(15px) !important;
-webkit-backdrop-filter: blur(15px) !important;
color: white !important;
border: 1px solid rgba(255, 255, 255, 0.2) !important;
border-radius: 50% !important;
cursor: pointer !important;
z-index: 9999 !important;
box-shadow: 0 6px 20px rgba(26, 115, 232, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
display: flex !important;
align-items: center !important;
justify-content: center !important;
transition: all 0.3s ease !important;
}
#settings-trigger:hover {
background: rgba(21, 87, 176, 0.95) !important;
transform: scale(1.05) rotate(90deg) !important;
box-shadow: 0 8px 25px rgba(26, 115, 232, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
}
/* 响应式设计 */
@media (max-width: 600px) {
.settings-panel {
width: 95% !important;
max-height: 85vh !important;
}
.panel-header {
padding: 14px 16px !important;
}
.settings-list {
padding: 12px 16px !important;
max-height: calc(85vh - 160px) !important;
padding-bottom: 16px !important;
}
.setting-content {
flex-direction: column !important;
align-items: flex-start !important;
gap: 8px !important;
}
.input-container {
width: 100% !important;
}
.group-btn {
margin: 8px 16px 16px 16px !important;
padding: 10px 14px !important;
}
.title-container {
gap: 8px !important;
}
.github-icon {
width: 28px !important;
height: 28px !important;
}
.github-icon svg {
width: 18px !important;
height: 18px !important;
}
#settings-trigger {
bottom: 16px !important;
right: 16px !important;
width: 44px !important;
height: 44px !important;
}
}
`;
        document.head.appendChild(style);
    }
    // 注册菜单命令
    GM_registerMenuCommand('⚙️ 打开设置面板', createSettingsPanel);
    // 等待页面加载完成
    function waitForBody() {
        if (document.body) {
            addStyles(); // 先添加样式
            addTriggerButton(); // 再添加按钮
        } else {
            setTimeout(waitForBody, 100);
        }
    }
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForBody);
    } else {
        waitForBody();
    }
    // 输出版本信息
    console.log('[123云盘解锁] v1.1.3 已加载完成');
})();