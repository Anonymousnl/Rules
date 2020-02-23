// ==UserScript==
// @name        一二三云盘自定义
// @version     2025092000
// @match       *://*.123684.com/*
// @match       *://*.123865.com/*
// @match       *://*.123912.com/*
// @match       *://*.123952.com/*
// @match       *://*.123pan.cn/*
// @match       *://*.123pan.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/123pan.png
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @grant       GM_setClipboard
// @grant       GM_setValue
// @grant       unsafeWindow
// @run-at      document-start
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E4%B8%80%E4%BA%8C%E4%B8%89%E4%BA%91%E7%9B%98%E8%87%AA%E5%AE%9A%E4%B9%89.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E4%B8%80%E4%BA%8C%E4%B8%89%E4%BA%91%E7%9B%98%E8%87%AA%E5%AE%9A%E4%B9%89.user.js
// ==/UserScript==
(function() {
    // 从存储中读取用户配置，若无则使用默认值
    const user = {
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
    };
    // 保存原始的XMLHttpRequest和fetch方法
    const originalXHR = unsafeWindow.XMLHttpRequest;
    const originalFetch = unsafeWindow.fetch;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    // 创建存储URL的符号
    const requestURL = Symbol('requestURL');
    //构建模板匹配功能
    const models = [{
        // 用户信息
        runat: "end",
        match: (url) => url.pathname.includes('api/user/info'),
        condition: () => user.vip === 1,
        action: (res) => {
            if (!res.data) return res;
            res.data.Vip = true;
            res.data.VipLevel = user.pvip ? 3 : (user.svip ? 2 : 1);
            if (user.ad === 1) res.data.IsShowAdvertisement = false;
            if (!res.data.UserVipDetail) {
                res.data.UserVipDetail = {};
            }
            res.data.UserVipDetail.VipCode = res.data.VipLevel;
            if (user.pvip === 1) {
                res.data.VipExpire = "永久有效";
                res.data.UserVipDetail.UserPermanentVIPDetailInfos = [{
                    VipDesc: "长期VIP会员",
                    TimeDesc: " 永久有效",
                    IsUse: true
                }];
                res.data.UserVipDetailInfos = [];
            } else if (user.svip === 1) {
                let time = new Date(user.endtime * 1000);
                res.data.VipExpire = time.toLocaleString();
                res.data.UserVipDetailInfos = [{
                    VipDesc: "SVIP 会员",
                    TimeDesc: time.toLocaleDateString() + " 到期",
                    IsUse: time >= new Date()
                }];
            } else {
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
    }, {
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
    }, {
        // 下载信息（请求头修改）
        runat: "header",
        match: (url) => ['file/download_info', 'file/batch_download_info', 'share/download/info', 'file/batch_download_share_info'].some(path => url.pathname.includes(path)),
        condition: () => true,
        action: (headers) => {
            headers.platform = 'android';
            return headers;
        }
    }, {
        // 下载信息（响应体修改）
        runat: "end",
        match: (url) => ['file/download_info', 'file/batch_download_info', 'share/download/info', 'file/batch_download_share_info'].some(path => url.pathname.includes(path)),
        condition: () => true,
        action: (res, url) => {
            if (res.data && (res.data.DownloadUrl || res.data.DownloadURL)) {
                res.data.DownloadUrl = rewriteDownloadUrl(res.data.DownloadUrl || res.data.DownloadURL);
                res.data.DownloadURL = res.data.DownloadUrl;
            }
            return res;
        }
    }, {
        // 下载限制错误拦截
        runat: "end",
        match: (url) => ['file/download_info', 'file/batch_download_info', 'share/download/info', 'file/batch_download_share_info'].some(path => url.pathname.includes(path)),
        condition: () => true,
        action: (res, url) => {
            if (res?.code === 5113 || res?.code === 5114 || res?.message?.includes("下载流量已超出")) {
                return {
                    code: 400,
                    message: "【123云盘解锁】本次下载出现问题，本脚本不支持多文件下载哦！",
                    data: null
                };
            }
            return res;
        }
    }, {
        // 屏蔽数据收集请求
        runat: "start",
        match: (url) => url.pathname.includes('web_logs') || url.pathname.includes('metrics'),
        condition: () => true,
        action: () => {
            throw new Error('【123云盘解锁】已屏蔽此数据收集器');
        }
    }];
    /**
     * 优化下载链接的重写逻辑，使其支持直接下载。
     * @param {string} urlString 原始下载URL。
     * @returns {string} 优化后的下载URL。
     */
    function rewriteDownloadUrl(urlString) {
        try {
            const originalURL = new URL(urlString);
            const isWebPro = originalURL.origin.includes("web-pro");
            // 统一设置 auto_redirect 参数
            originalURL.searchParams.set('auto_redirect', 0);
            if (isWebPro) {
                // 处理 web-pro 域名的情况
                let params = ((url) => {
                    try {
                        return decodeURIComponent(atob(url));
                    } catch {
                        return atob(url);
                    }
                })(originalURL.searchParams.get('params'));
                const directURL = new URL(params, originalURL.origin);
                directURL.searchParams.set('auto_redirect', 0);
                originalURL.searchParams.set('params', btoa(directURL.href));
                return decodeURIComponent(originalURL.href);
            } else {
                // 处理其他域名的情况
                const newURL = new URL('https://web-pro2.123952.com/download-v2/', originalURL.origin);
                newURL.searchParams.set('params', btoa(encodeURI(originalURL.href)));
                newURL.searchParams.set('is_s3', 0);
                return decodeURIComponent(newURL.href);
            }
        } catch (e) {
            if (user.debug) console.error('Download URL modification error:', e);
            return urlString;
        }
    }
    /**
     * 自定义XMLHttpRequest类，用于拦截和修改请求及响应。
     */
    function CustomXHR() {
        const xhr = new originalXHR();
        xhr[requestURL] = null;
        xhr.open = function(method, url, ...args) {
            try {
                const fullURL = new URL(url, location.origin);
                this[requestURL] = fullURL;
                return originalOpen.call(this, method, fullURL.href, ...args);
            } catch (e) {
                if (user.debug) console.error('XHR open error:', e);
                return originalOpen.call(this, method, url, ...args);
            }
        };
        xhr.setRequestHeader = function(name, value) {
            return originalSetRequestHeader.call(this, name, value);
        };
        xhr.addEventListener('readystatechange', function() {
            if (this.readyState === 4 && this[requestURL]) {
                try {
                    const matchedRules = models.filter(r => r.match(this[requestURL]) && r.condition() && r.runat === "end");
                    if (matchedRules.length > 0) {
                        let responseText;
                        try {
                            responseText = JSON.parse(this.responseText);
                        } catch {
                            responseText = this.responseText;
                        }
                        let modifiedResponse = responseText;
                        matchedRules.forEach(rule => {
                            modifiedResponse = rule.action(modifiedResponse, this[requestURL]);
                        });
                        if (modifiedResponse !== undefined) {
                            Object.defineProperty(this, 'responseText', {
                                value: typeof modifiedResponse === 'string' ? modifiedResponse : JSON.stringify(modifiedResponse),
                                writable: false
                            });
                            Object.defineProperty(this, 'response', {
                                value: typeof modifiedResponse === 'string' ? modifiedResponse : JSON.stringify(modifiedResponse),
                                writable: false
                            });
                        }
                    }
                } catch (e) {
                    if (user.debug) console.error('XHR response handler error:', e);
                }
            }
        });
        return xhr;
    }
    // 替换原始的XMLHttpRequest
    unsafeWindow.XMLHttpRequest = CustomXHR;
    /**
     * 重写fetch方法，用于拦截和修改请求及响应。
     */
    unsafeWindow.fetch = async function(input, init = {}) {
        const request = new Request(input, init);
        const url = new URL(request.url);
        // 应用请求发起前的规则（如屏蔽）
        const startRules = models.filter(r => r.match(url) && r.condition() && r.runat === "start");
        startRules.forEach(rule => {
            rule.action();
        });
        // 应用请求头修改规则
        const headerRules = models.filter(r => r.match(url) && r.condition() && r.runat === "header");
        headerRules.forEach(rule => {
            if (init.headers) {
                init.headers = rule.action({
                    ...init.headers
                }, url);
            }
        });
        const response = await originalFetch.call(this, request, init);
        // 应用响应修改规则
        const responseRules = models.filter(r => r.match(url) && r.condition() && r.runat === "end");
        if (responseRules.length > 0) {
            const clonedResponse = response.clone();
            let responseData;
            try {
                responseData = await clonedResponse.json();
            } catch {
                responseData = await clonedResponse.text();
            }
            let modifiedData = responseData;
            responseRules.forEach(rule => {
                modifiedData = rule.action(modifiedData, url);
            });
            return new Response(typeof modifiedData === 'string' ? modifiedData : JSON.stringify(modifiedData), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        }
        return response;
    };
    /**
     * 格式化设置项并创建DOM元素。
     * @param {string} key 设置项的名称。
     * @param {*} value 设置项的当前值。
     * @param {string} comment 设置项的说明。
     * @returns {HTMLElement} 创建的DOM元素。
     */
    const formatSetting = (key, value, comment) => {
        const item = document.createElement('div');
        item.className = 'setting-item';
        const content = document.createElement('div');
        content.className = 'setting-content';
        const keyElement = document.createElement('div');
        keyElement.className = 'setting-key';
        keyElement.textContent = key;
        content.appendChild(keyElement);
        const isSwitch = typeof value === 'number' && (value === 0 || value === 1);
        const isEditable = ['用户名', '头像', '等级'].includes(key);
        if (isSwitch) {
            const switchContainer = document.createElement('label');
            switchContainer.className = 'switch';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = value === 1;
            const slider = document.createElement('span');
            slider.className = 'slider round';
            switchContainer.appendChild(input);
            switchContainer.appendChild(slider);
            input.addEventListener('change', () => {
                let newValue = input.checked ? 1 : 0;
                switch (key) {
                    case 'VIP状态':
                        user.vip = newValue;
                        GM_setValue('vip', newValue);
                        break;
                    case 'SVIP显示':
                        user.svip = newValue;
                        GM_setValue('svip', newValue);
                        if (newValue === 0 && user.pvip === 1) {
                            user.pvip = 0;
                            GM_setValue('pvip', 0);
                        }
                        break;
                    case '长期会员显示':
                        user.pvip = newValue;
                        GM_setValue('pvip', newValue);
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
                setTimeout(() => location.reload(), 300);
            });
            content.appendChild(switchContainer);
        } else if (isEditable) {
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';
            const inputElement = document.createElement('input');
            inputElement.type = key === '等级' ? 'number' : 'text';
            inputElement.value = value;
            inputElement.className = 'setting-input';
            if (key === '等级') {
                inputElement.min = 0;
                inputElement.max = 128;
            }
            const saveButton = document.createElement('button');
            saveButton.textContent = '保存';
            saveButton.className = 'save-btn';
            saveButton.addEventListener('click', () => {
                let newValue = inputElement.value;
                if (key === '等级') {
                    newValue = parseInt(newValue);
                    if (isNaN(newValue) || newValue < 0 || newValue > 128) {
                        alert('等级必须在 0-128 之间');
                        return;
                    }
                }
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
                }
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
    /**
     * 创建并显示设置面板。
     */
    function createSettingsPanel() {
        if (document.getElementById('vip-settings-panel')) {
            return;
        }
        const panel = document.createElement('div');
        panel.id = 'vip-settings-panel';
        panel.className = 'settings-panel';
        const header = document.createElement('div');
        header.className = 'panel-header';
        const title = document.createElement('h3');
        title.textContent = '123云盘脚本设置';
        header.appendChild(title);
        const closeButton = document.createElement('button');
        closeButton.className = 'close-btn';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => panel.remove());
        header.appendChild(closeButton);
        panel.appendChild(header);
        const settingsList = document.createElement('div');
        settingsList.className = 'settings-list';
        const settings = [{
            key: 'VIP状态',
            value: user.vip,
            comment: '会员修改总开关'
        }, {
            key: 'SVIP显示',
            value: user.svip,
            comment: '显示为超级会员 (关闭将自动关闭长期会员)'
        }, {
            key: '长期会员显示',
            value: user.pvip,
            comment: '显示为长期会员 (开启将自动开启 SVIP 显示)'
        }, {
            key: '广告控制',
            value: user.ad,
            comment: '关闭广告'
        }, {
            key: '用户名',
            value: user.name,
            comment: '自定义用户名'
        }, {
            key: '头像',
            value: user.photo,
            comment: '自定义头像URL'
        }, {
            key: '等级',
            value: user.level,
            comment: '成长容量等级(最高128)'
        }, {
            key: '过期时间',
            value: user.endtime,
            comment: '会员过期时间'
        }, {
            key: '调试模式',
            value: user.debug,
            comment: '调试信息显示级别'
        }];
        settings.forEach(setting => {
            settingsList.appendChild(formatSetting(setting.key, setting.value, setting.comment));
        });
        panel.appendChild(settingsList);
        addStyles();
        document.body.appendChild(panel);
    }
    /**
     * 创建设置面板的触发按钮。
     */
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
    /**
     * 为设置面板和触发按钮添加CSS样式。
     */
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
.settings-panel {
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: #fff;
border-radius: 12px;
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
z-index: 10000;
width: 90%;
max-width: 500px;
max-height: 80vh;
overflow-y: auto;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
color: #333;
animation: panelFadeIn 0.3s ease;
}
@keyframes panelFadeIn {
from { opacity: 0; transform: translate(-50%, -48%); }
to { opacity: 1; transform: translate(-50%, -50%); }
}
.panel-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 16px 20px;
border-bottom: 1px solid #eee;
background: #f8f9fa;
border-radius: 12px 12px 0 0;
}
.panel-header h3 {
margin: 0;
font-size: 18px;
font-weight: 600;
color: #1a73e8;
}
.close-btn {
background: none;
border: none;
font-size: 24px;
cursor: pointer;
color: #70757a;
padding: 0;
width: 30px;
height: 30px;
display: flex;
align-items: center;
justify-content: center;
border-radius: 50%;
transition: background 0.2s;
}
.close-btn:hover {
background: #f1f3f4;
color: #d93025;
}
.settings-list {
padding: 16px 20px;
}
.setting-item {
margin-bottom: 16px;
padding: 12px;
background: #f8f9fa;
border-radius: 8px;
border: 1px solid #e8eaed;
}
.setting-content {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 8px;
}
.setting-key {
font-weight: 500;
flex: 1;
}
.setting-value {
color: #1a73e8;
font-weight: 500;
text-align: right;
}
.setting-comment {
font-size: 12px;
color: #70757a;
line-height: 1.4;
}
.switch {
position: relative;
display: inline-block;
width: 40px;
height: 20px;
}
.switch input {
opacity: 0;
width: 0;
height: 0;
}
.slider {
position: absolute;
cursor: pointer;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: #ccc;
transition: .3s;
}
.slider:before {
position: absolute;
content: "";
height: 16px;
width: 16px;
left: 2px;
bottom: 2px;
background-color: white;
transition: .3s;
}
input:checked + .slider {
background-color: #1a73e8;
}
input:checked + .slider:before {
transform: translateX(20px);
}
.slider.round {
border-radius: 34px;
}
.slider.round:before {
border-radius: 50%;
}
.input-container {
display: flex;
gap: 8px;
}
.setting-input {
padding: 6px 10px;
border: 1px solid #dadce0;
border-radius: 4px;
font-size: 14px;
flex: 1;
min-width: 0;
}
.setting-input:focus {
outline: none;
border-color: #1a73e8;
}
.save-btn {
padding: 6px 12px;
background: #1a73e8;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
font-size: 12px;
transition: background 0.2s;
white-space: nowrap;
}
.save-btn:hover {
background: #1557b0;
}
.save-btn.saved {
background: #188038;
}
.group-btn {
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
margin: 16px 20px;
padding: 10px 16px;
background: linear-gradient(135deg, #1a73e8, #1557b0);
color: white;
border: none;
border-radius: 8px;
cursor: pointer;
text-decoration: none;
font-weight: 500;
transition: all 0.3s;
}
.group-btn:hover {
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
}
#settings-trigger {
position: fixed;
bottom: 20px;
right: 20px;
width: 50px;
height: 50px;
background: #1a73e8;
color: white;
border: none;
border-radius: 50%;
cursor: pointer;
z-index: 9999;
box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
display: flex;
align-items: center;
justify-content: center;
transition: all 0.3s;
}
#settings-trigger:hover {
background: #1557b0;
transform: scale(1.05);
}
@media (max-width: 600px) {
.settings-panel {
width: 95%;
max-height: 85vh;
}
.panel-header {
padding: 14px 16px;
}
.settings-list {
padding: 12px 16px;
}
.setting-content {
flex-direction: column;
align-items: flex-start;
gap: 8px;
}
.input-container {
width: 100%;
}
#settings-trigger {
bottom: 16px;
right: 16px;
width: 44px;
height: 44px;
}
}
`;
        document.head.appendChild(style);
    }
    // 注册菜单命令，方便用户从脚本管理器中打开设置面板
    GM_registerMenuCommand('⚙️ 打开设置面板', createSettingsPanel);
    // 确保在页面加载完成后添加触发按钮和样式
    function waitForBody() {
        if (document.body) {
            addTriggerButton();
            addStyles();
        } else {
            setTimeout(waitForBody, 100);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForBody);
    } else {
        waitForBody();
    }
})()