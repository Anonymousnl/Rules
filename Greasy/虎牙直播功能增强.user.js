// ==UserScript==
// @name        虎牙直播功能增强
// @version     2025022200
// @match       *://*.huya.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/huya.png
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_getValue
// @grant       GM_setValue
// @require     https://cdnjs.cloudflare.com/ajax/libs/vue/2.7.13/vue.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/element-ui/2.15.14/index.js
// @resource    elementStyle https://cdnjs.cloudflare.com/ajax/libs/element-ui/2.15.14/theme-chalk/index.css
// @run-at      document-end
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// ==/UserScript==
;
(function() {
	// 创建一个容器
	const container = document.createElement('div')
	container.id = 'huya-lab'
	container.innerHTML = `<hy-lab-icon />`
	document.body.appendChild(container)
	// 添加 element-ui 样式
	const elementStyle = GM_getResourceText('elementStyle')
	GM_addStyle(elementStyle)
	// 添加样式
	initStyle()
	// 记录获取播放器控制栏获取失败的次数
	let failCount = 0
	// 播放器控制栏
	let playerControl = null
	// 等待播放器的控制栏加载完成
	const timer = setInterval(() => {
		// 如果加载失败超过 100 次，提示插件初始化失败
		if(failCount >= 100) {
			clearInterval(timer)
			Vue.prototype.$message.error('虎牙实验室插件加载失败，请刷新重试~')
		} else {
			if(playerControl === null) {
				failCount += 1
				playerControl = document.getElementById('player-ctrl-wrap')
			} else {
				clearInterval(timer)
				// 开始初始化
				init()
			}
		}
	}, 1500)

	function init() {
		// 创建元素方法
		Vue.prototype.createPlayerButton = option => {
			const btn = document.createElement(option.tagName)
			btn.id = option.id ? option.id : ''
			btn.className = option.className ? option.className : ''
			btn.title = option.title ? option.title : ''
			btn.innerHTML = option.innerHTML ? option.innerHTML : ''
			btn.style = option.style ? option.style : ''
			btn.tabIndex = option.tabIndex ? option.tabIndex : ''
			if(option.clickEventListener) btn.addEventListener('click', option.clickEventListener)
			return btn
		}
		// 自动选择最高画质
		const selectHightestQuality = {
			data() {
				return {
					autoSelect: false
				}
			},
			created() {
				// 初始化状态
				this.autoSelect = GM_getValue('selectHightestQuality') ? true : false
				this.toggleState(this.autoSelect)
			},
			methods: {
				// 功能初始化
				toggleState(value) {
					if(value) {
						const hightest = document.querySelector('.player-videotype-list').children[0]
						console.log(hightest)
						if(hightest.className === 'on') return
						hightest.click()
						// 防止切换画质时视频停止播放
						const timer = setInterval(() => {
							if(document.querySelector('.player-play-btn')) {
								document.querySelector('.player-play-btn')[0].click()
								document.querySelector('#player-tip-pause').remove()
								clearInterval(timer)
							}
						}, 500)
					}
					// 保存状态
					GM_setValue('selectHightestQuality', value)
				}
			},
			template: `
<div class="lab-item">
<span class="lab-item__title">自动选择最高画质功能</span>
<el-switch v-model="autoSelect" active-color="#ff9600" inactive-color="#e3ebec"  @change="toggleState"></el-switch>
</div>
`
		}
		// 网页全屏
		const pageFullScreen = {
			data() {
				return {
					enabled: false,
					dynamicStyle: null // 动态样式
				}
			},
			created() {
				// 初始化状态
				this.enabled = GM_getValue('pageFullScreen') ? true : false
				this.toggleState(this.enabled)
			},
			methods: {
				// 功能初始化
				toggleState(value) {
					// 保存状态
					GM_setValue('pageFullScreen', value)
					// 如果是 true 则开启网页全屏
					if(value) {
						// 添加全屏动态样式
						this.addDynamicStyle()
						if(!playerControl) {
							this.$message.warning('虎牙播放器控制条还没有加载完成，请稍后操作~')
							this.enabled = !this.enabled
						} else {
							// 获取 剧场模式 按钮并点击
							playerControl.querySelector('#player-fullpage-btn').click()
							// 获取 右侧聊天框 并点击
							const danmuChat = document.querySelector('#player-fullpage-right-btn')
							if(Array.from(danmuChat.classList).indexOf('player-fullpage-right-open') === -1) {
								danmuChat.click()
							}
							// 隐藏 礼物栏
							document.querySelector('#player-gift-wrap').style.display = 'none'
							// 隐藏 全屏按钮
							playerControl.querySelector('#player-fullscreen-btn').style.display = 'none'
							// 播放器高度设为 100%
							document.querySelector('#player-wrap').style.height = '100%'
							// 显示弹幕输入框
							playerControl.querySelector('#player-full-input').style.display = 'block'
							// 隐藏 控制栏
							playerControl.classList.add('hidden-controls')
							// 退出剧场模式事件
							this.quitFullScreen()
							// 添加鼠标事件
							this.addEvent()
						}
					}
				},
				// 添加样式
				addDynamicStyle() {
					// 添加网页全屏样式
					this.dynamicStyle = GM_addStyle(`
.hidden-controls {
bottom: -44px!important;
}
.show-controls {
bottom: 0px!important;
}
`)
				},
				// 添加事件
				addEvent() {
					const mouseWrap = document.querySelector('#player-mouse-event-wrap')
					const danMuInput = playerControl.querySelector('#player-full-input-txt')
					mouseWrap.addEventListener('mousemove', this.throttle(this.showControls, 300))
					mouseWrap.addEventListener('mousemove', this.debounce(this.hiddenControls, 1200)) // 1.2s 后隐藏控制栏
					playerControl.addEventListener('mouseover', this.showControls, true)
					// 回车显示并聚焦输入框
					document.addEventListener('keydown', e => {
						if(e.key.toLowerCase() === 'enter') {
							this.showControls()
							danMuInput.focus()
						}
					})
					// 回车发送弹幕
					danMuInput.addEventListener('keydown', e => {
						e.stopPropagation()
						if(e.key.toLowerCase() === 'enter') {
							playerControl.querySelector('#player-full-input-btn').click()
							document.querySelector('#ex-settings').focus()
							this.hiddenControls()
						}
					})
				},
				// 退出网页全屏
				quitFullScreen() {
					const narrowPageBtn = playerControl.querySelector('.player-narrowpage')
					narrowPageBtn.onclick = () => {
						this.enabled = !this.enabled
						GM_setValue('pageFullScreen', this.enabled)
						if(!this.enabled) {
							// 移除网页全屏样式
							this.dynamicStyle.parentNode.removeChild(this.dynamicStyle)
							narrowPageBtn.onclick = null
							// 显示 全屏按钮
							playerControl.querySelector('#player-fullscreen-btn').style.display = 'block'
						}
					}
				},
				// 显示 控制栏
				showControls() {
					playerControl.classList.add('show-controls')
					playerControl.classList.remove('hidden-controls')
				},
				// 隐藏 控制栏
				hiddenControls() {
					playerControl.classList.remove('show-controls')
					playerControl.classList.add('hidden-controls')
				},
				// 节流函数
				throttle(fn, delay) {
					let valid = true
					return function() {
						if(!valid) {
							return false
						}
						valid = false
						setTimeout(() => {
							fn()
							valid = true
						}, delay)
					}
				},
				// 防抖函数
				debounce(fn, delay) {
					let timer = null
					return function() {
						if(timer) {
							clearTimeout(timer)
						}
						timer = setTimeout(fn, delay)
					}
				}
			},
			template: `
<div class="lab-item">
<span class="lab-item__title">自动网页全屏功能</span>
<el-switch v-model="enabled" active-color="#ff9600" inactive-color="#e3ebec" @change="toggleState"></el-switch>
</div>
`
		}
		// 实验室
		const lab = {
			components: {
				selectHightestQuality,
				pageFullScreen
			},
			data() {
				return {
					lab: {
						pageFullScreen: false
					}
				}
			},
			created() {
				this.removeAdvertisement()
			},
			methods: {
				// 移除虎牙自带的广告
				removeAdvertisement() {
					let advertisement = document.querySelector('.duya-header-ad')
					const timer = setInterval(() => {
						if(advertisement) {
							advertisement.parentNode.removeChild(advertisement)
							clearInterval(timer)
						} else {
							advertisement = document.querySelector('.duya-header-ad')
						}
					})
				}
			},
			template: `
<el-popover placement="left" width="263" trigger="click">
<div style="padding: 4px;">
<select-hightest-quality />
<auto-get-chests />
<page-full-screen />
</div>
<div class="hy-lab-icon" slot="reference">
<svg class="icon" xmlns="http://www.w3.org/2000/svg"xmlns:xlink="http://www.w3.org/1999/xlink"width="26px"height="26px"viewBox="0 0 26 26"version="1.1"><g id="画板"stroke="none"stroke-width="1"fill="none"fill-rule="evenodd"><g><path d="M13.2203914,1.95507469 L10.9329537,2.81637936 L10.2495628,6.32050592 L10,10.6096247 C7.09751244,14.3492529 5.64626865,16.219067 5.64626865,16.219067 C5.64626865,16.219067 4.49870538,18.098234 2.20357885,21.8565678 L2.20357885,23.1169883 C4.55214088,23.7163809 5.81761459,24.0160773 6,24.0160773 C6.18238541,24.0160773 11.3766967,24.095117 21.5829339,24.2531964 L23.0797297,23.4262547 C23.3907316,22.3686578 23.4684821,21.7666371 23.3129811,21.6201925 C23.0797297,21.4005256 17.8766462,12.5138666 17.8766462,12.2765988 C17.8766462,12.0393309 16.0955752,7.84973079 16.0955752,7.58122389 C16.0955752,7.4022193 16.0955752,5.81393778 16.0955752,2.81637936 L14.5,1.95507469 L13.2203914,1.95507469 Z"id="路径"fill="#FFFFFF"/><path d="M23.6397358,22.4561247 L23.6307339,22.4405345 L16.7149927,12.5207127 L16.7149927,12.442539 L16.7149927,6.91002628 C16.7149927,5.85514789 15.8598448,5 14.8049664,5 C13.750088,5 12.8949401,5.85514789 12.8949401,6.91002628 L12.8949401,12.3051225 L12.8949401,12.3051225 C12.8790137,12.3253898 12.8580094,12.3496659 12.842083,12.3688196 C12.811846,12.4042316 12.777685,12.4443207 12.7458323,12.4879733 L5.37284244,22.4334076 L5.3601475,22.4556793 C4.96152641,23.1360802 4.89020394,23.7893096 5.1641838,24.2481069 C5.44970453,24.7249443 6.09322253,25 6.9294728,25 L22.0711029,25 C22.9059683,25 23.5483322,24.7256125 23.8354687,24.2476615 C24.1099102,23.788196 24.0385877,23.1356347 23.6397358,22.4561247 Z"id="形状"fill="#f7d3a2"fill-rule="nonzero"/><path d="M12.2708897,0.75 L12.0864657,0.755144789 C10.3773444,0.850754073 9.02088965,2.26696854 9.02088965,4 L9.02,9.618 L1.37407216,20.3028731 L1.27873181,20.4584508 C0.67413816,21.5418497 0.552772148,22.7078682 1.08543874,23.6444527 C1.63687713,24.6114378 2.73625331,25.1035707 4.02135246,25.1035707 L21.9792507,25.1035707 C23.2629629,25.1035707 24.3603177,24.6120252 24.9125969,23.6467681 C25.413952,22.7654468 25.338656,21.6856826 24.8226961,20.6515207 L24.7084614,20.435836 L24.650173,20.3402454 L17.618,9.891 L17.6180876,4 C17.6180876,2.20507456 16.163013,0.75 14.3680876,0.75 L12.2708897,0.75 Z M12.2708897,3.25 L14.3680876,3.25 C14.7823011,3.25 15.1180876,3.58578644 15.1180876,4 L15.1180876,10.6542368 L22.541,21.684 L22.5272688,21.6576305 C22.7548226,22.064752 22.7828944,22.3345117 22.7411311,22.4079272 C22.6930337,22.4919827 22.4439182,22.6035707 21.9792507,22.6035707 L4.02135246,22.6035707 C3.55603835,22.6035707 3.305954,22.491621 3.25784906,22.4072659 L3.24699912,22.3760993 C3.2284504,22.2865831 3.26010738,22.0810773 3.40142443,21.7925304 L3.451,21.695 L11.1613239,10.9241092 L11.2716586,10.7846083 L11.5208897,10.451589 L11.5208897,4 C11.5208897,3.58578644 11.8566761,3.25 12.2708897,3.25 Z"id="形状"fill="#ff9600"fill-rule="nonzero"/><path d="M8.00002923,18.200377 C7.19109442,18.200377 6.46181711,18.6752807 6.1522739,19.403631 C5.8427307,20.1319812 6.01388433,20.9703338 6.58592243,21.527748 C7.15796053,22.0851622 8.01822353,22.2518586 8.76555359,21.9501034 C9.51288364,21.6483481 10.0000984,20.9375702 10,20.1492194 C9.99865845,19.0733529 9.10398715,18.2015534 8.00002923,18.200377 L8.00002923,18.200377 Z M18.0852941,19.4005256 C17.5330094,19.4005256 17.0852941,19.8482408 17.0852941,20.4005256 C17.0852941,20.9528103 17.5330094,21.4005256 18.0852941,21.4005256 C18.6375789,21.4005256 19.0852941,20.9528103 19.0852941,20.4005256 C19.0846199,19.8485203 18.6372994,19.4011998 18.0852941,19.4005256 Z M13.500516,15.9999999 C12.8937865,15.9998002 12.3466885,16.3651314 12.1143647,16.925619 C11.8820409,17.4861065 12.0102507,18.1313548 12.4392025,18.560448 C12.8681544,18.9895411 13.5133604,19.1179635 14.0739245,18.8858244 C14.6344886,18.6536852 15,18.1067076 15,17.4999781 C14.9989119,16.6722071 14.3282867,16.0013608 13.500516,15.9999999 L13.500516,15.9999999 Z"id="形状"fill="#ff9600"fill-rule="nonzero"/><path d="M12.4401786,15.1761652 C14.7686478,13.8884645 17.4740449,13.8884645 20.4584253,15.1136923 C21.0970558,15.37588 21.402223,16.1061374 21.1400353,16.7447679 C20.8778476,17.3833984 20.1475902,17.6885656 19.5089597,17.4263779 C17.2847443,16.5132335 15.4310726,16.4735315 13.8622283,17.2525987 L13.6500524,17.363905 C11.5739316,18.5120509 9.01436809,18.5120509 6.03619849,17.4470397 C5.38615677,17.214581 5.04763891,16.499173 5.28009769,15.8491312 C5.51255646,15.1990895 6.22796447,14.8605717 6.87800619,15.0930304 C9.12725076,15.8973736 10.8991346,15.9339347 12.2500485,15.2750193 L12.4401786,15.1761652 Z"id="路径-2"fill="#ff9600"fill-rule="nonzero"/></g></g></svg>
<span style="margin-top: 4px; font-size: 12px;line-height: 16px;">实验室</span>
</div>
</el-popover>
`
		}
		// 创建 vue 实例
		const app = new Vue({
			el: container,
			components: {
				'hy-lab-icon': lab
			}
		})
	}
	// 添加自定义样式
	function initStyle() {
		GM_addStyle(`
@font-face {
font-family: element-icons;
src:url(https://unpkg.com/element-ui/lib/theme-chalk/fonts/element-icons.woff) format("woff");
}
#huya-lab {
position: fixed;
right: 0;
bottom: 20%;
padding: 12px 4px;
border: 1px solid #e3e5e7;
border-radius: 12px 0 0 12px;
background: #fff;
z-index: 10;
transform: translate3d(0,0,0);
transition: height cubic-bezier(.22,.58,.12,.98) .4s;
box-shadow: 0 0 20px 0 rgba(0, 85, 255, 0.1);
}
.hy-lab-icon {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
margin: 4px 0;
padding: 5px 4px;
color: #ff9600;
cursor: pointer;
}
.hy-lab-icon:hover .icon {
animation: jumping cubic-bezier(.22,.58,.12,.98) 1.5s infinite;
}
@keyframes jumping {
0% {
transform: translate(0,0) scale(1);
}
10% {
transform: translate(0,4px) scale(.8);
}
30% {
transform: translate(0,-13px) scale(.95);
}
45% {
transform: translate(0,4px) scale(.8);
}
50% {
transform: translate(0,0) scale(1);
}
53% {
transform: translate(0,0) scale(.9);
}
55% {
transform: translate(0,0) scale(1);
}
57% {
transform: translate(0,0) scale(.9);
}
61% {
transform: translate(0,0) scale(1);
}
100% {
transform: translate(0,0) scale(1);
}
}
.lab-item {
display: flex;
justify-content: space-between;
align-items: center;
color: #ff9600;
height: 40px;
}
.lab-item__title {
font-size: 16px;
line-height: 24px;
}
`)
	}
})()