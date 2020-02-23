// ==UserScript==
// @name        斗鱼直播页面调整
// @match       *://*.douyu.com/*
// @icon        https://www.douyu.com/favicon.ico
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// ==/UserScript==

if(window.top === window) {
	GM_addStyle(`
    .MatchFocusFullPic, .Prompt-container {
        display: none !important;
    }
    .HeaderGif-left, .HeaderGif-right {
        display: none !important;
    }
    /*"直播"等栏顶部2个横幅广告*/
    section.layout-Banner {
        display: none !important;
    }
    /*嵌入各个直播间尾部分类广告*/
    .AdCover {
        display: none !important;
    }
    /*各种嵌入广告*/
    .DropMenuList-ad, .DropPane-ad, .CloudGameLink, .Search-ad, .FishShopTip, .RedEnvelopAd-adBox, .ChargeTask, [class^="recommendAD-"], [class^="recommendApp-"], .wm-pc-imgLink, [class^="code_box-"], .layout-Slider-link.is-advert {
        display: none !important;
    }
    /*直播页面主要几个广告*/
    .Bottom-ad, #js-room-activity, .ScreenBannerAd, .XinghaiAd, .PlayerToolbar-ContentCell .PlayerToolbar-signCont, .SignBarrage, .IconCardAdCard {
        display: none !important;
    }
    `);
	/***********************************屏蔽****************************/
	GM_addStyle(`
    /*屏蔽网页全屏与直播全屏右上角关注提示框，直播间点赞*/
    .FullPageFollowGuide, .LiveRoomDianzan, .FollowGuide{
        display: none !important;
    }
    /*屏蔽宝箱礼物特效*/
    .layout-Player-effect {
        display: none !important;
    }
    /*屏蔽直播间上方第三行内容*/
    .Title-row:nth-of-type(3) {
        display: none !important;
    }
    /*金铲铲、和平手册*/
    .JinChanChanGame, .PeacehandBarrage{
        display: none !important;
    }
    `);
	/************************setting、overlay、dialog、close、table、toggle、scrollbar...CSS ************************/
	GM_addStyle(`
    /**********************************设置按钮setting*****************************/
    #ca_btn_setting{
        position: fixed;
        top:14px;
        right:14px;
        width: 32px;
        height: 32px;
        display: block;
        transition: transform 0.3s ease-in-out;
        cursor: pointer;
        z-index: 10000;
        opacity: 0.9;
    }
    #ca_btn_setting:hover{
        transform: rotate(60deg);
    }
    /***************************遮罩层overlay、对话框dialog***************************/
    #ca_overlay *{
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE 10+ */
        user-select: none;
    }
    #ca_overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    }
    @keyframes show {
        0% {
            transform: rotateX(30deg);
        }
        58% {
            opacity: 1;
            transform: rotateX(-12deg);
        }
        100% {
            opacity: 1;
        }
    }
    #ca_dialog {
        display: block;
        position: absolute;
        width: 320px;
        height: 300px;
        background-color: #fff;
        color: #333;
        font-size: 16px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        padding: 20px;
        transition: all 0.3s ease-in-out;
        /* transform-style: preserve-3d; */
        transform-origin: center center;
        animation: show 0.3s ease-in-out;
    }
    #ca_dialog h2{
        font-size: 24px;
        display: block;
        margin-bottom: 12px;
        font-weight: bold;
    }
    /***************************关闭close***************************/
    #ca_btn_close {
        position: absolute;
        top: 20px;
        right: 20px;
        margin: 3px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        box-sizing: border-box;
    }
    #ca_btn_close:hover::before,
    #ca_btn_close:hover::after {
        background: red;
    }
    #ca_btn_close:before {
        position: absolute;
        content: '';
        width: 1px;
        height: 25px;
        background-color: var(--theme-color2);
        transition: background-color 0.3s;
        transform: rotate(45deg);
        top: -3px;
        left: 11px;
    }
    #ca_btn_close:after {
        content: '';
        position: absolute;
        width: 1px;
        height: 25px;
        background-color: var(--theme-color2);
        transition: background-color 0.3s;
        transform: rotate(-45deg);
        top: -3px;
        left: 11px;
    }
    /***************************** 表格table **************************/
    .ca_table {
        display: block;
        width: 300px;
        height: 220px;
        margin: auto;
        border-collapse: collapse;
        overflow-y: scroll;
        scrollbar-width: thin;
    }
    .ca_table tr {
        border-top: 1px solid #ddd;
    }
    .ca_table tr:first-child {
        border-top: none;
    }
    .ca_table td {
        font-size: 16px;
        padding: 10px;
    }
    .ca_table td:first-child {
        width: 250px;
        text-align: left;
    }
    .ca_table td:last-child {
        width: 50px;
        text-align: right;
    }
    /**************************** checkbox ***************************/
    .ca_toggle {
        position: absolute;
        margin-left: -9999px;
        visibility: hidden;
    }
    .ca_toggle+label {
        display: block;
        position: relative;
        cursor: pointer;
        outline: none;
        user-select: none;
        margin-right: 0px;
        transition: box-shadow 0.3s;
    }
    .ca_toggle+label:hover {
        box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.24), 0 8px 12px 0 rgba(0, 0, 0, 0.19);
    }
    input.ca_toggle-round+label {
        padding: 2px;
        width: 40px;
        height: 20px;
        background-color: #dddddd;
        border-radius: 20px;
    }
    input.ca_toggle-round+label:before,
    input.ca_toggle-round+label:after {
        display: block;
        position: absolute;
        top: 1px;
        left: 1px;
        bottom: 1px;
        content: "";
    }
    input.ca_toggle-round+label:before {
        right: 1px;
        background-color: #f1f1f1;
        border-radius: 20px;
        transition: background-color 0.3s;
    }
    input.ca_toggle-round+label:after {
        width: 20px;
        background-color: #fff;
        border-radius: 100%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        transition: background-color 0.3s, margin 0.3s;
    }
    input.ca_toggle-round:checked+label:before {
        background-color: #8ce196;
    }
    input.ca_toggle-round:checked+label:after {
        margin-left: 20px;
    }
    /****************************** 滚动条scrollbar *****************************/
    #ca_dialog ::-webkit-scrollbar {
        width: 5px;
        height: 10px;
    }
    #ca_dialog ::-webkit-scrollbar-track {
        width: 6px;
        background: rgba(#101F1C, 0.1);
        -webkit-border-radius: 2em;
        -moz-border-radius: 2em;
        border-radius: 2em;
    }
    #ca_dialog ::-webkit-scrollbar-thumb {
        background-color: rgba(144, 147, 153, .3);
        background-clip: padding-box;
        min-height: 28px;
        -webkit-border-radius: 2em;
        -moz-border-radius: 2em;
        border-radius: 2em;
        transition: background-color .3s;
        cursor: pointer;
    }
    #ca_dialog ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(144, 147, 153, .5);
    }
    /****************************** radiobutton切换 *****************************/
    #ca_ul {
        position: relative;
        width: 300px;
        margin: -4px 0 0 10px;
        padding: 0;
    }
    #ca_ul li {
        list-style: none;
    }
    #ca_ul li input {
        display: none;
    }
    #ca_ul li .rb-label {
        float: left;
        width: 150px;
        text-align: center;
        line-height: 30px;
        border: 1px solid #000;
        border-right: 0;
        box-sizing: border-box;
        cursor: pointer;
        transition-property: background-color;
        transition-duration: .3s;
    }
    #ca_ul #rb-label1 {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }
    #ca_ul #rb-label2 {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }
    #tab1:checked+.rb-label,
    #tab2:checked+.rb-label {
        color: #eee !important;
        background-color: #000 !important;
    }
    #ca_ul li:last-child .rb-label {
        border-right: 1px solid #000;
    }
    .ca_content {
        opacity: 0;
        visibility: hidden;
        position: absolute;
        left: 0;
        top: 40px;
        width: 100%;
        box-sizing: border-box;
        font-size: 24px;
        text-align: center;
        transition-property: opacity;
        transition-duration: .3s;
    }
    #ca_ul li input:checked~.ca_content {
        opacity: 1;
        visibility: visible;
    }
    `);
	/**********************************************************************************************/
	(function() {
		window.onload = function() {
			/* 各个隐藏css */
			const hide_head_css = '.public-DropMenu.Video,.public-DropMenu.Game,.HeaderNav,.Header-download-wrap,.Header-createcenter-wrap,.Header-broadcast-wrap{display:none}';
			const hide_aside_css = '.Aside-shrink-item[title="游戏"],.Aside-shrink-item[title="云游戏"],a.Aside-nav-item[href="https://wan.douyu.com"],a.Aside-nav-item[href="https://cloudgame.douyu.com"]{display:none}';
			const hide_chattop_css = '.layout-Player-rank,.layout-Player-announce{display:none}.layout-Player-barrage{top:0}';
			const hide_bottom_css = '.Bottom{display:none}';
			const hide_guess_css = '.ToolbarActivityArea{display:none}';
			const hide_level_css = '.Barrage-listItem .UserLevel,.Barrage-listItem img[class^="Supreme"],.Barrage-listItem .Barrage-noble,.Barrage-listItem .FansMedalBox,.Barrage-listItem .ChatAchievement,.Barrage-listItem .Barrage-roomVipIcon,.Barrage-listItem a.Baby,.Barrage-listItem .TeamFansMedalJSX,.Barrage-listItem .UserGameDataMedal,.MatchSystemTeamMedal{display:none !important}';
			const hide_chattool_css = '.Horn4Category,.ChatNobleBarrage,.PopularBarrage,.BarrageWord{display:none !important}';
			// 创建隐藏style
			let style_hide_head = document.createElement('style');
			style_hide_head.innerHTML = hide_head_css;
			let style_hide_aside = document.createElement('style');
			style_hide_aside.innerHTML = hide_aside_css;
			let style_hide_chattop = document.createElement('style');
			style_hide_chattop.innerHTML = hide_chattop_css;
			let style_hide_bottom = document.createElement('style');
			style_hide_bottom.innerHTML = hide_bottom_css;
			let style_hide_guess = document.createElement('style');
			style_hide_guess.innerHTML = hide_guess_css;
			let style_hide_level = document.createElement('style');
			style_hide_level.innerHTML = hide_level_css;
			let style_hide_chattool = document.createElement('style');
			style_hide_chattool.innerHTML = hide_chattool_css;
			// 创建一个“设置”按钮
			const btn_setting_html = `
            <svg t="1689689573324" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2559" width="32" height="32">
                <path d="M919.6 405.6l-57.2-8c-12.7-1.8-23-10.4-28-22.1-11.3-26.7-25.7-51.7-42.9-74.5-7.7-10.2-10-23.5-5.2-35.3l21.7-53.5c6.7-16.4 0.2-35.3-15.2-44.1L669.1 96.6c-15.4-8.9-34.9-5.1-45.8 8.9l-35.4 45.3c-7.9 10.2-20.7 14.9-33.5 13.3-14-1.8-28.3-2.8-42.8-2.8-14.5 0-28.8 1-42.8 2.8-12.8 1.6-25.6-3.1-33.5-13.3l-35.4-45.3c-10.9-14-30.4-17.8-45.8-8.9L230.4 168c-15.4 8.9-21.8 27.7-15.2 44.1l21.7 53.5c4.8 11.9 2.5 25.1-5.2 35.3-17.2 22.8-31.7 47.8-42.9 74.5-5 11.8-15.3 20.4-28 22.1l-57.2 8C86 408 72.9 423 72.9 440.8v142.9c0 17.7 13.1 32.7 30.6 35.2l57.2 8c12.7 1.8 23 10.4 28 22.1 11.3 26.7 25.7 51.7 42.9 74.5 7.7 10.2 10 23.5 5.2 35.3l-21.7 53.5c-6.7 16.4-0.2 35.3 15.2 44.1L354 927.8c15.4 8.9 34.9 5.1 45.8-8.9l35.4-45.3c7.9-10.2 20.7-14.9 33.5-13.3 14 1.8 28.3 2.8 42.8 2.8 14.5 0 28.8-1 42.8-2.8 12.8-1.6 25.6 3.1 33.5 13.3l35.4 45.3c10.9 14 30.4 17.8 45.8 8.9l123.7-71.4c15.4-8.9 21.8-27.7 15.2-44.1l-21.7-53.5c-4.8-11.8-2.5-25.1 5.2-35.3 17.2-22.8 31.7-47.8 42.9-74.5 5-11.8 15.3-20.4 28-22.1l57.2-8c17.6-2.5 30.6-17.5 30.6-35.2V440.8c0.2-17.8-12.9-32.8-30.5-35.2z m-408 245.5c-76.7 0-138.9-62.2-138.9-138.9s62.2-138.9 138.9-138.9 138.9 62.2 138.9 138.9-62.2 138.9-138.9 138.9z"
                fill="#17abe3" p-id="2560" data-spm-anchor-id="a313x.7781069.0.i13" class="selected"></path>
            </svg>
            `;
			let btn_setting = document.createElement('div');
			btn_setting.id = 'ca_btn_setting';
			btn_setting.title = '设置';
			btn_setting.innerHTML = btn_setting_html;
			document.body.appendChild(btn_setting);
			// 创建一个遮罩层及其内部的对话框
			const overlay_dialog_html = `
            <div id="ca_dialog">
                <h2 style="margin-top: -4px;">设置<a style="font-size: 16px; color: #ff9600;"</a></h2>
                <ul id="ca_ul">
                    <li><input id="tab1" type="radio" name="tab" checked><label id="rb-label1" class="rb-label" for="tab1">简化</label>
                        <div class="ca_content">
                            <table class="ca_table">
                                <tr title="简化隐藏顶部导航栏的部分内容">
                                    <td>导航栏-顶部部分内容</td>
                                    <td>
                                        <div class="switch"><input id="ca_toggle1" class="ca_toggle ca_toggle-round" type="checkbox" checked><label for="ca_toggle1"></label></div>
                                    </td>
                                </tr>
                                <tr title="隐藏侧边栏的游戏以及云游戏">
                                    <td>侧边栏-游戏及云游戏</td>
                                    <td>
                                        <div class="switch"><input id="ca_toggle2" class="ca_toggle ca_toggle-round" type="checkbox" checked><label for="ca_toggle2"></label></div>
                                    </td>
                                </tr>
                                <tr title="隐藏直播间聊天栏顶部的主播投稿视频、房间用户活跃度、贵宾等">
                                    <td>直播间-聊天栏顶部内容</td>
                                    <td>
                                        <div class="switch"><input id="ca_toggle3" class="ca_toggle ca_toggle-round" type="checkbox" checked><label for="ca_toggle3"></label></div>
                                    </td>
                                </tr>
                                <tr title="隐藏直播间底部鱼吧、友邻等内容">
                                    <td>直播间-页面下方部分内容</td>
                                    <td>
                                        <div class="switch"><input id="ca_toggle4" class="ca_toggle ca_toggle-round" type="checkbox" checked><label for="ca_toggle4"></label></div>
                                    </td>
                                </tr>
                                <tr title="隐藏直播间礼物栏旁的各种活动内容，包含预言竞猜">
                                    <td>直播间-礼物栏旁部分内容</td>
                                    <td>
                                        <div class="switch"><input id="ca_toggle5" class="ca_toggle ca_toggle-round" type="checkbox" checked><label for="ca_toggle5"></label></div>
                                    </td>
                                </tr>
                                <tr title="隐藏直播间聊天栏的等级、贵族牌、粉丝牌、成就、房间VIP、消息后缀图片等内容，但保留了房管标识">
                                    <td>直播间-聊天栏等级等内容</td>
                                    <td>
                                        <div class="switch"><input id="ca_toggle6" class="ca_toggle ca_toggle-round" type="checkbox" checked><label for="ca_toggle6"></label></div>
                                    </td>
                                </tr>
                                <tr title="隐藏直播间聊天发送框上面的部分内容，包括喇叭、贵族、梗、令等，保留了表情、粉丝弹幕与火力全开">
                                    <td>直播间-发送框上方部分内容</td>
                                    <td>
                                        <div class="switch"><input id="ca_toggle7" class="ca_toggle ca_toggle-round" type="checkbox" checked><label for="ca_toggle7"></label></div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </li>
                    <li><input id="tab2" type="radio" name="tab"><label id="rb-label2" class="rb-label" for="tab2">功能</label>
                        <div class="ca_content">
                            <table class="ca_table">
                                <tr title="进入直播间自动网页全屏">
                                    <td>自动网页全屏</td>
                                    <td>
                                        <div class="switch">
                                            <input id="cb_auto_wfs" class="ca_toggle ca_toggle-round" type="checkbox" checked>
                                            <label for="cb_auto_wfs"></label>
                                        </div>
                                    </td>
                                </tr>
                                <tr title="进入直播间自动关闭弹幕">
                                    <td>自动关闭弹幕</td>
                                    <td>
                                        <div class="switch">
                                            <input id="cb_auto_cdm" class="ca_toggle ca_toggle-round" type="checkbox" checked>
                                            <label for="cb_auto_cdm"></label>
                                        </div>
                                    </td>
                                </tr>
                                <tr title="进入直播间自动选择当前直播间最高画质">
                                    <td>自动最高画质</td>
                                    <td>
                                        <div class="switch">
                                            <input id="cb_auto_shr" class="ca_toggle ca_toggle-round" type="checkbox" checked>
                                            <label for="cb_auto_shr"></label>
                                        </div>
                                    </td>
                                </tr>
                                <tr title="自动佩戴对应直播间的粉丝牌（如果已拥有）">
                                    <td>自动佩戴粉丝牌</td>
                                    <td>
                                        <div class="switch">
                                            <input id="cb_auto_wfm" class="ca_toggle ca_toggle-round" type="checkbox" checked>
                                            <label for="cb_auto_wfm"></label>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </li>
                </ul>
                <div id="ca_btn_close"></div>
            </div>
            `;
			let ca_overlay = document.createElement('div');
			ca_overlay.id = 'ca_overlay';
			ca_overlay.innerHTML = overlay_dialog_html;
			document.body.appendChild(ca_overlay);
			// 获取设置对话框等对象
			let ca_dialog = document.getElementById('ca_dialog');
			let ca_btn_close = document.getElementById('ca_btn_close');
			// 给设置按钮添加点击事件
			btn_setting.addEventListener('click', function() {
				showca_dialog();
			});
			// 显示遮罩层和对话框
			function showca_dialog() {
				ca_overlay.style.display = 'flex';
			}
			// 隐藏遮罩层和对话框
			function hideca_dialog() {
				ca_overlay.style.display = 'none';
			}
			// 给关闭按钮添加点击事件
			ca_btn_close.addEventListener('click', function() {
				hideca_dialog();
			});
			/************************************获取插件添加的元素对象***************************************/
			// 获取各个checkbox按钮对象
			let cb_1 = document.getElementById('ca_toggle1');
			let cb_2 = document.getElementById('ca_toggle2');
			let cb_3 = document.getElementById('ca_toggle3');
			let cb_4 = document.getElementById('ca_toggle4');
			let cb_5 = document.getElementById('ca_toggle5');
			let cb_6 = document.getElementById('ca_toggle6');
			let cb_7 = document.getElementById('ca_toggle7');
			// 自动网页全屏
			let cb_auto_wfs = document.getElementById('cb_auto_wfs');
			// 自动关闭弹幕
			let cb_auto_cdm = document.getElementById('cb_auto_cdm');
			// 自动选择最高画质
			let cb_auto_shr = document.getElementById('cb_auto_shr');
			// 自动佩戴粉丝牌
			let cb_auto_wfm = document.getElementById('cb_auto_wfm');
			/******************************************************************************************/
			// 开启自动佩戴粉丝牌后隐藏掉斗鱼自带的佩戴提示框
			let style_hide_wfm = document.createElement('style');
			style_hide_wfm.innerHTML = '.FansMedalDialog{opacity:0;}';
			/* 判断各个Value的值，即用户保存的设置（隐藏内容、开启的功能）*/
			judgeGM_Value();

			function judgeGM_Value() {
				// 直播间功能
				if(document.querySelector('.layout-Player-aside')) { // 如果页面有侧边栏则该页面为直播间
					// 全屏自动隐藏插件按钮
					// 监听 DOM 变化的方法
					var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
					// 创建一个观察器实例
					var observer = new MutationObserver(function(mutations) {
						mutations.forEach(function(mutation) {
							// 检查是否是 body 元素的类名发生变化
							if(mutation.target === document.body && mutation.attributeName === 'class') {
								if(document.body.classList.contains('is-fullScreenPage')) {
									document.getElementById('ca_btn_setting').style.display = 'none';
								} else {
									document.getElementById('ca_btn_setting').style.display = 'block';
								}
							}
						});
					});
					// 配置观察选项（只针对body元素本身类名，因此childList和subtree为False，尽量节省资源）
					var config = {
						attributes: true,
						childList: false,
						subtree: false
					};
					observer.observe(document.body, config);
					// 自动网页全屏（fast）
					if(GM_getValue('is_autowfs')) {
						let notalive; // nal定时返回对象
						// 【网页全屏1】先快速网页全屏
						setTimeout(function() {
							document.body.classList.add('is-fullScreenPage');
						}, 3000);
						// 如果该直播间 未开播
						let nal_limit_time = 0;
						notalive = setInterval(function() {
							let obj_notalive = document.body.querySelector('[class^="labelDes-"]');
							if(obj_notalive) {
								if(document.body.classList.contains('is-fullScreenPage')) {
									document.body.classList.remove('is-fullScreenPage');
								}
								clearInterval(notalive);
							}
							if(nal_limit_time > 10) {
								clearInterval(notalive);
							}
						}, 1 * 1000); // 每1秒执行一次
					}
					// h5视频功能
					if(GM_getValue('is_autowfs') || GM_getValue('is_autocdm') || GM_getValue('is_aotoshr')) {
						let h5function; // 返回定时对象
						// 【网页全屏2】然后再button网页全屏（修复原本需要两次双击才能退出的bug）
						let h5function_limit_time = 0;
						h5function = setInterval(function() {
							let btn_wfs = document.body.querySelector('[class^="wfs-"]');
							if(btn_wfs) { // 另外几个选项都是h5工具栏，因此只需要一个存在，其他的都存在
								if(GM_getValue('is_autowfs')) {
									// 自动网页全屏（enhance）
									btn_wfs.click();
									console.log("【ClearAds】auto webfullscreen success.");
								}
								if(GM_getValue('is_autocdm')) {
									// 自动关闭弹幕
									document.body.querySelector('[class^="showdanmu-"]').click();
									console.log("【ClearAds】auto closedanmu success.");
								}
								if(GM_getValue('is_autoshr')) {
									// 自动选择最高画质
									document.body.querySelector('[class^="rate-"][title="清晰度"] ul>li').click();
									console.log("【ClearAds】auto select highest rate success.");
								}
								// 清除定时
								clearInterval(h5function);
							}
							if(h5function_limit_time > 10) {
								clearInterval(h5function);
								console.log("【ClearAds】h5 function open failed.");
							}
							h5function_limit_time++;
						}, 1 * 1000); // 每1秒执行一次
					}
					// 自动佩戴粉丝牌
					if(GM_getValue('is_autowfm')) {
						document.head.appendChild(style_hide_wfm);
						let wearfansmedal_limit_time = 0;
						let wfm = setInterval(function() {
							let btn_wfm = document.body.querySelector('p.FansMedalDialog-wareMedal');
							if(btn_wfm) {
								btn_wfm.click();
								clearInterval(wfm);
								console.log("【ClearAds】auto wear fansmedal success.");
							}
							if(wearfansmedal_limit_time > 10) {
								clearInterval(wfm);
								console.log("【ClearAds】auto wear fansmedal failure.");
							}
							wearfansmedal_limit_time++;
						}, 1 * 1000); // 每1秒执行一次
					}
				}
				// cb 自动网页全屏
				if(GM_getValue('is_autowfs')) {
					cb_auto_wfs.checked = true;
				} else {
					cb_auto_wfs.checked = false;
				}
				// cb 自动关闭弹幕
				if(GM_getValue('is_autocdm')) {
					cb_auto_cdm.checked = true;
				} else {
					cb_auto_cdm.checked = false;
				}
				// cb 自动选择最高画质
				if(GM_getValue('is_autoshr')) {
					cb_auto_shr.checked = true;
				} else {
					cb_auto_shr.checked = false;
				}
				// cb 自动佩戴粉丝牌
				if(GM_getValue('is_autowfm')) {
					cb_auto_wfm.checked = true;
				} else {
					cb_auto_wfm.checked = false;
				}
				// 其他各个隐藏checkbox
				if(GM_getValue('is_hide1')) {
					cb_1.checked = true;
					document.head.appendChild(style_hide_head);
				} else {
					cb_1.checked = false;
					style_hide_head.remove();
				}
				if(GM_getValue('is_hide2')) {
					cb_2.checked = true;
					document.head.appendChild(style_hide_aside);
				} else {
					cb_2.checked = false;
					style_hide_aside.remove();
				}
				if(GM_getValue('is_hide3')) {
					cb_3.checked = true;
					document.head.appendChild(style_hide_chattop);
				} else {
					cb_3.checked = false;
					style_hide_chattop.remove();
				}
				if(GM_getValue('is_hide4')) {
					cb_4.checked = true;
					document.head.appendChild(style_hide_bottom);
				} else {
					cb_4.checked = false;
					style_hide_bottom.remove();
				}
				if(GM_getValue('is_hide5')) {
					cb_5.checked = true;
					document.head.appendChild(style_hide_guess);
				} else {
					cb_5.checked = false;
					style_hide_guess.remove();
				}
				if(GM_getValue('is_hide6')) {
					cb_6.checked = true;
					document.head.appendChild(style_hide_level);
				} else {
					cb_6.checked = false;
					style_hide_level.remove();
				}
				if(GM_getValue('is_hide7')) {
					cb_7.checked = true;
					document.head.appendChild(style_hide_chattool);
				} else {
					cb_7.checked = false;
					style_hide_chattool.remove();
				}
			} // function judgeGM_Value()
			/******************* 为各个CheckBox添加点击事件*****************/
			// 自动网页全屏cb
			cb_auto_wfs.addEventListener("click", function() {
				if(cb_auto_wfs.checked) {
					GM_setValue('is_autowfs', true);
				} else {
					GM_setValue('is_autowfs', false);
				}
			});
			// 自动关闭弹幕
			cb_auto_cdm.addEventListener("click", function() {
				if(cb_auto_cdm.checked) {
					GM_setValue('is_autocdm', true);
				} else {
					GM_setValue('is_autocdm', false);
				}
			})
			// 自动选择最高画质
			cb_auto_shr.addEventListener("click", function() {
				if(cb_auto_shr.checked) {
					GM_setValue('is_autoshr', true);
				} else {
					GM_setValue('is_autoshr', false);
				}
			})
			// 自动佩戴粉丝牌cb
			cb_auto_wfm.addEventListener("click", function() {
				if(cb_auto_wfm.checked) {
					GM_setValue('is_autowfm', true);
					document.head.appendChild(style_hide_wfm);
				} else {
					GM_setValue('is_autowfm', false);
					style_hide_wfm.remove();
				}
			});
			// 其他CheckBox的点击事件
			cb_1.addEventListener("click", function() {
				if(cb_1.checked) {
					document.head.appendChild(style_hide_head);
					GM_setValue('is_hide1', true);
				} else {
					style_hide_head.remove();
					GM_setValue('is_hide1', false);
				}
			});
			cb_2.addEventListener("click", function() {
				if(cb_2.checked) {
					document.head.appendChild(style_hide_aside);
					GM_setValue('is_hide2', true);
				} else {
					style_hide_aside.remove();
					GM_setValue('is_hide2', false);
				}
			});
			cb_3.addEventListener("click", function() {
				if(cb_3.checked) {
					document.head.appendChild(style_hide_chattop);
					GM_setValue('is_hide3', true);
				} else {
					style_hide_chattop.remove();
					GM_setValue('is_hide3', false);
				}
			});
			cb_4.addEventListener("click", function() {
				if(cb_4.checked) {
					document.head.appendChild(style_hide_bottom);
					GM_setValue('is_hide4', true);
				} else {
					style_hide_bottom.remove();
					GM_setValue('is_hide4', false);
				}
			});
			cb_5.addEventListener("click", function() {
				if(cb_5.checked) {
					document.head.appendChild(style_hide_guess);
					GM_setValue('is_hide5', true);
				} else {
					style_hide_guess.remove();
					GM_setValue('is_hide5', false);
				}
			});
			cb_6.addEventListener("click", function() {
				if(cb_6.checked) {
					document.head.appendChild(style_hide_level);
					GM_setValue('is_hide6', true);
				} else {
					style_hide_level.remove();
					GM_setValue('is_hide6', false);
				}
			});
			cb_7.addEventListener("click", function() {
				if(cb_7.checked) {
					document.head.appendChild(style_hide_chattool);
					GM_setValue('is_hide7', true);
				} else {
					style_hide_chattool.remove();
					GM_setValue('is_hide7', false);
				}
			});

			function keydownEventHandle() {
				document.addEventListener('keydown', function(event) {
					var target = event.target || event.srcElement;
					if(target.tagName.toLowerCase() !== 'input' && target.tagName.toLowerCase() !== 'textarea') {
						if(event.key === 'Enter') {
							event.preventDefault();
							// 聚焦直播间聊天输入框
							document.querySelector('textarea.ChatSend-txt').focus();
						}
						if(event.key === 'Escape') {
							event.preventDefault();
							// 退出网页全屏
							if(document.body.classList.contains('is-fullScreenPage')) {
								document.querySelector('#room-html5-player [class^="wfs-exit-"]').click();
							}
						}
						if(event.key === 'f') {
							event.preventDefault();
							// 全屏/取消全屏
							document.querySelectorAll('#room-html5-player [class^="fs-"]').forEach(function(elem) {
								if(!elem.classList.toString().includes('removed')) {
									elem.click();
								}
							});
						}
						if(event.key === 'w') {
							event.preventDefault();
							// 网页全屏/取消网页全屏
							if(document.body.classList.contains('is-fullScreenPage')) {
								document.querySelector('#room-html5-player [class^="wfs-exit-"]').click();
							} else {
								document.querySelector('#room-html5-player [class^="wfs-"]').click();
							}
						}
						if(event.key === 'm') {
							event.preventDefault();
							// 静音/取消静音
							document.querySelector('#room-html5-player [class^="volume-"]').click();
						}
						if(event.key === 'r') {
							event.preventDefault();
							// 重新加载直播
							document.querySelector('#room-html5-player [class^="reload-"]').click();
						}
						if(event.key === 'd') {
							event.preventDefault();
							// 开关弹幕
							if(document.querySelector('#room-html5-player [class^="hidedanmu-"]').classList.toString().includes('removed')) {
								document.querySelector('#room-html5-player [class^="showdanmu-"]').click();
							} else {
								document.querySelector('#room-html5-player [class^="hidedanmu-"]').click();
							}
						}
						if(event.key === 's') {
							event.preventDefault();
							// 打开设置
							document.querySelector('#ca_overlay').style.display = "flex";
						}
					} else {
						if(event.key === 'Escape') {
							event.preventDefault();
							// 取消聚焦聊天输入框
							target.blur();
						}
					}
				});
			} // function keydownEventHandle()键盘事件处理
		} // onload -- function
	})(); // 主function -- function
}; // 最外层判断当前页面是否是主页面