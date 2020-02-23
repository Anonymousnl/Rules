// ==UserScript==
// @name        虎牙直播功能增强
// @version     2025030100
// @match       *://*.huya.com/*
// @icon        https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/huya.png
// @downloadURL https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// @updateURL   https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%99%8E%E7%89%99%E7%9B%B4%E6%92%AD%E5%8A%9F%E8%83%BD%E5%A2%9E%E5%BC%BA.user.js
// ==/UserScript==
const {
	host
} = window.location
/**
 * 获取画质元素选择器
 * @returns {string} - 画质元素选择器
 */
const getQualityElementSelector = () => {
	if(host.includes('huya')) return '.player-videotype-list li' // 虎牙
}
const clickMaxQuality = setInterval(() => {
	document.querySelector(getQualityElementSelector())?.click()
}, 1000)
setTimeout(() => {
	clearInterval(clickMaxQuality)
}, 10000)