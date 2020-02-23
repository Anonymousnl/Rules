// ==UserScript==
// @name			视频自动小窗模式
// @version			2026101740
// @match			*://*/*
// @grant			none
// @icon			https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/PiP.png
// @run-at			document-end
// @downloadURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%A7%86%E9%A2%91%E8%87%AA%E5%8A%A8%E5%B0%8F%E7%AA%97%E6%A8%A1%E5%BC%8F.user.js
// @updateURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%A7%86%E9%A2%91%E8%87%AA%E5%8A%A8%E5%B0%8F%E7%AA%97%E6%A8%A1%E5%BC%8F.user.js
// ==/UserScript==
;
(() => {
    if (window.__jvtLoaded) return
    window.__jvtLoaded = true
    const MIN_WIDTH = 320
    const MIN_HEIGHT = 180
    const SIZE_TOLERANCE = 16
    const SAME_PLAYER_AREA_RATIO = 2.5
    const HIDE_DELAY = 650
    const IDLE_HIDE_DELAY = 3500
    // 每个网站 origin 独立保存工具栏位置；只保存位置比例，不保存任何视频或浏览数据。
    const POSITION_STORAGE_KEY = "__jvt_toolbar_position_v1"

    function loadSavedPosition() {
        try {
            const raw = window.localStorage.getItem(POSITION_STORAGE_KEY)
            if (!raw) return null
            const saved = JSON.parse(raw)
            if (!saved || saved.version !== 1 ||
                !Number.isFinite(saved.x) || !Number.isFinite(saved.y) ||
                saved.x < 0 || saved.x > 1 || saved.y < 0 || saved.y > 1) return null
            return {
                x: saved.x,
                y: saved.y
            }
        } catch (err) {
            // localStorage 可能被隐私设置或浏览器策略禁用；此时脚本仍可正常使用，只是不跨重启保存。
            return null
        }
    }
    const MSG_KEY = "__jvt"
    // 默认只接受同源 iframe 的控制消息。若要允许跨域 iframe 向父页面申请网页全屏，请把该 iframe 的完整 origin 加入此集合。
    // 例如："https://www.youtube.com"。请只添加你信任的网站 origin。
    const TRUSTED_IFRAME_ORIGINS = new Set([
        // "https://player.example.com",
    ])
    const isTop = window.top === window.self
    const text = /^zh/i.test(navigator.language) ? {
        web: "网页全屏 ( ] )",
        exitWeb: "退出网页全屏 ( Esc )",
        full: "全屏",
        exitFull: "退出全屏",
        pip: "画中画 ( [ )",
        exitPip: "退出画中画 ( [ )",
        pipFail: "这个视频不支持画中画",
        fullFail: "当前页面不允许全屏",
        noVideo: "没有找到可用的视频",
        actionFail: "操作失败，请重试",
        dragTitle: "拖动工具栏；方向键微调；Home 恢复自动定位",
    } : {
        web: "Web fullscreen ( ] )",
        exitWeb: "Exit web fullscreen ( Esc )",
        full: "Fullscreen",
        exitFull: "Exit fullscreen",
        pip: "Picture-in-picture ( [ )",
        exitPip: "Exit picture-in-picture ( [ )",
        pipFail: "Picture-in-picture is not available for this video",
        fullFail: "Fullscreen is blocked on this page",
        noVideo: "No video found",
        actionFail: "The action failed. Please try again.",
        dragTitle: "Drag toolbar; arrow keys nudge; Home resets position",
    }
    const ICONS = {
        // 网页全屏：在屏幕框内显示向外展开的取景角标。
        web: [
            ["rect", {
                x: 3,
                y: 4,
                width: 18,
                height: 16,
                rx: 2.5
            }],
            ["path", {
                d: "M7 10V8h2 M15 8h2v2 M7 14v2h2 M17 14v2h-2"
            }],
        ],
        // 退出网页全屏：取景角标向内收拢。
        exitWeb: [
            ["rect", {
                x: 3,
                y: 4,
                width: 18,
                height: 16,
                rx: 2.5
            }],
            ["path", {
                d: "M9 8v2H7 M15 8v2h2 M9 16v-2H7 M15 16v-2h2"
            }],
        ],
        // 浏览器原生全屏：四角向外扩展。
        full: [
            ["path", {
                d: "M9 4H4v5 M15 4h5v5 M20 15v5h-5 M9 20H4v-5"
            }],
        ],
        // 退出原生全屏：四角向内收拢。
        exitFull: [
            ["path", {
                d: "M9 4v5H4 M20 9h-5V4 M15 20v-5h5 M4 15h5v5"
            }],
        ],
        // 画中画：主画面中叠放一个独立的小窗口。
        pip: [
            ["rect", {
                x: 3,
                y: 4,
                width: 18,
                height: 16,
                rx: 2.5
            }],
            ["path", {
                d: "M6.5 7.5h4"
            }],
            ["rect", {
                x: 12,
                y: 11,
                width: 7,
                height: 6,
                rx: 1.4,
                class: "pip-window"
            }],
        ],
        // 拖动手柄：两列均匀排列的圆点，保持小尺寸下的辨识度。
        drag: [
            ["circle", {
                cx: 8,
                cy: 7,
                r: 1.15,
                class: "solid"
            }],
            ["circle", {
                cx: 16,
                cy: 7,
                r: 1.15,
                class: "solid"
            }],
            ["circle", {
                cx: 8,
                cy: 12,
                r: 1.15,
                class: "solid"
            }],
            ["circle", {
                cx: 16,
                cy: 12,
                r: 1.15,
                class: "solid"
            }],
            ["circle", {
                cx: 8,
                cy: 17,
                r: 1.15,
                class: "solid"
            }],
            ["circle", {
                cx: 16,
                cy: 17,
                r: 1.15,
                class: "solid"
            }],
        ],
    }
    // 每个脚本实例使用独立类名前缀，避免与网站原有 class 冲突。
    const CLS_PREFIX = "jvt-" + Math.random().toString(36).slice(2, 10) + "-"
    const CLS = {
        target: `${CLS_PREFIX}target`,
        fill: `${CLS_PREFIX}fill`,
        ancestor: `${CLS_PREFIX}ancestor`,
        unfix: `${CLS_PREFIX}unfix`,
        lock: `${CLS_PREFIX}lock`,
    }
    // 网页全屏时祖先元素的 transform / filter / contain 等会让 position:fixed 相对祖先而不是视口定位，必须临时清掉
    const PAGE_CSS = `
html.${CLS.lock}, html.${CLS.lock} body { overflow: hidden !important; }
.${CLS.ancestor} { transform: none !important; filter: none !important; backdrop-filter: none !important; perspective: none !important; contain: none !important; will-change: auto !important; clip-path: none !important; mask: none !important; isolation: auto !important; z-index: auto !important; }
.${CLS.unfix} { position: static !important; }
.${CLS.target} { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; max-width: none !important; max-height: none !important; min-width: 0 !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; transform: none !important; filter: none !important; backdrop-filter: none !important; perspective: none !important; contain: none !important; will-change: auto !important; clip-path: none !important; mask: none !important; -webkit-mask: none !important; isolation: auto !important; z-index: 2147483646 !important; background: #000 !important; }
.${CLS.fill} { top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; margin: 0 !important; transform: none !important; }
video.${CLS.target}, video.${CLS.fill} { object-fit: contain !important; }
`
    const BAR_CSS = `
.bar { box-sizing: border-box; position: fixed; top: 0; left: 0; display: flex; gap: 4px; padding: 5px; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 999px; background: rgba(18, 22, 31, 0.88); box-shadow: 0 7px 22px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(14px) saturate(165%); -webkit-backdrop-filter: blur(14px) saturate(165%); opacity: 0; visibility: hidden; pointer-events: none; user-select: none; -webkit-user-select: none; transition: opacity 0.18s ease, visibility 0s linear 0.18s; }
.bar.on { opacity: 1; visibility: visible; pointer-events: auto; transition: opacity 0.18s ease; }
button { all: unset; box-sizing: border-box; width: 32px; height: 30px; display: grid; place-items: center; border-radius: 999px; color: rgba(244, 247, 252, 0.92); cursor: pointer; }
button[hidden] { display: none; }
button:hover { background: rgba(255, 255, 255, 0.10); color: #fff; }
button[data-act] { transition: background 0.16s ease, color 0.16s ease, transform 0.12s ease; }
button[data-act]:active { transform: scale(0.94); }
button[data-act="web"]:hover { background: rgba(96, 165, 250, 0.18); color: #93c5fd; }
button[data-act="full"]:hover { background: rgba(52, 211, 153, 0.16); color: #6ee7b7; }
button[data-act="pip"]:hover { background: rgba(167, 139, 250, 0.18); color: #c4b5fd; }
button:focus-visible { outline: 2px solid #8ab4ff; outline-offset: 1px; }
.drag-handle { width: 20px; cursor: grab; touch-action: none; opacity: 0.76; }
.drag-handle:hover { opacity: 1; color: #dbeafe; background: rgba(255, 255, 255, 0.08); }
.drag-handle:active, .bar.dragging .drag-handle { cursor: grabbing; }
.bar.dragging { transition: none; }
svg { width: 18px; height: 18px; overflow: visible; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.solid { fill: currentColor; stroke: none; }
.pip-window { fill: currentColor; fill-opacity: 0.22; stroke: currentColor; stroke-width: 1.5; }
.toast { position: fixed; left: 0; top: 0; box-sizing: border-box; width: max-content; max-width: calc(100vw - 16px); padding: 8px 14px; border-radius: 8px; background: rgba(20, 24, 32, 0.88); color: #fff; font: 13px/1.4 system-ui, sans-serif; text-align: center; white-space: normal; overflow-wrap: anywhere; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
.toast.on { opacity: 1; }
`
    const state = {
        video: null,
        shown: false,
        web: null,
        x: -1,
        y: -1,
        frame: 0,
        hideTimer: 0,
        idleTimer: 0,
        toastTimer: 0,
        pipOverride: null,
        // 用户拖动后记住工具栏位置；切换视频、隐藏/显示时保留，双击拖动柄或按 Home 恢复自动定位。
        // manualPosition 是当前页面中的视口坐标；savedPosition 是 localStorage 中相对于可移动范围的比例。
        manualPosition: null,
        savedPosition: loadSavedPosition(),
        drag: null,
    }
    // ---------- 工具栏（放在封闭的 Shadow DOM 里，不受网站样式影响；全部用 DOM API 构建，兼容 Trusted Types 站点） ----------
    const host = document.createElement("jvt-root")
    host.setAttribute(
        "style",
        "all: initial !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 0 !important; height: 0 !important; z-index: 2147483647 !important;"
    )
    const shadow = host.attachShadow({
        mode: "closed"
    })
    const barStyle = document.createElement("style")
    barStyle.textContent = BAR_CSS
    const bar = document.createElement("div")
    bar.className = "bar"
    bar.inert = true
    const dragHandle = document.createElement("button")
    dragHandle.type = "button"
    dragHandle.className = "drag-handle"
    setButton(dragHandle, "drag", text.dragTitle)
    dragHandle.setAttribute("aria-keyshortcuts", "ArrowUp ArrowDown ArrowLeft ArrowRight Home")
    const btnWeb = makeButton("web")
    const btnFull = makeButton("full")
    const btnPip = makeButton("pip")
    bar.append(dragHandle, btnWeb, btnFull, btnPip)
    const toastEl = document.createElement("div")
    toastEl.className = "toast"
    shadow.append(barStyle, bar, toastEl)

    function makeButton(action) {
        const btn = document.createElement("button")
        btn.type = "button"
        btn.dataset.act = action
        return btn
    }

    function makeIcon(name) {
        const NS = "http://www.w3.org/2000/svg"
        const svg = document.createElementNS(NS, "svg")
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.setAttribute("aria-hidden", "true")
        for (const [tag, attrs] of ICONS[name]) {
            const el = document.createElementNS(NS, tag)
            for (const key in attrs) el.setAttribute(key, attrs[key])
            svg.appendChild(el)
        }
        return svg
    }

    function setButton(btn, icon, title) {
        if (btn.dataset.icon !== icon) {
            btn.dataset.icon = icon
            btn.replaceChildren(makeIcon(icon))
        }
        btn.title = title
        btn.setAttribute("aria-label", title)
    }

    function refreshButtons() {
        setButton(btnWeb, state.web ? "exitWeb" : "web", state.web ? text.exitWeb : text.web)
        const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement)
        setButton(btnFull, isFull ? "exitFull" : "full", isFull ? text.exitFull : text.full)
        setButton(btnPip, "pip", document.pictureInPictureElement ? text.exitPip : text.pip)
        btnPip.hidden = document.pictureInPictureEnabled !== true
    }

    function mountHost() {
        if (!host.isConnected) document.documentElement.appendChild(host)
    }
    // 普通模式以当前视频元素的可见区域为边界；网页全屏模式以整个视口为边界。
    function getOverlayBounds(fallbackToViewport = false) {
        const vw = document.documentElement.clientWidth
        const vh = document.documentElement.clientHeight
        let rect
        if (state.web) {
            rect = {
                left: 0,
                top: 0,
                right: vw,
                bottom: vh
            }
        } else if (state.video && state.video.isConnected) {
            rect = state.video.getBoundingClientRect()
        } else if (fallbackToViewport) {
            rect = {
                left: 0,
                top: 0,
                right: vw,
                bottom: vh
            }
        } else {
            return null
        }
        return {
            left: Math.max(0, rect.left),
            top: Math.max(0, rect.top),
            right: Math.min(vw, rect.right),
            bottom: Math.min(vh, rect.bottom),
        }
    }

    function clampOverlayPosition(left, top, width, height, bounds, padding = 4) {
        if (!bounds) return null
        const minLeft = bounds.left + padding
        const minTop = bounds.top + padding
        const maxLeft = bounds.right - width - padding
        const maxTop = bounds.bottom - height - padding
        // 可见视频区域容不下完整控件时，不把控件溢出到视频窗口外。
        if (maxLeft < minLeft || maxTop < minTop) return null
        return {
            left: Math.max(minLeft, Math.min(left, maxLeft)),
            top: Math.max(minTop, Math.min(top, maxTop)),
        }
    }

    function getSavedOverlayPosition(bounds, width, height) {
        const saved = state.savedPosition
        if (!saved || !bounds) return null
        const minLeft = bounds.left + 4
        const minTop = bounds.top + 4
        const maxLeft = bounds.right - width - 4
        const maxTop = bounds.bottom - height - 4
        if (maxLeft < minLeft || maxTop < minTop) return null
        return {
            left: minLeft + saved.x * (maxLeft - minLeft),
            top: minTop + saved.y * (maxTop - minTop),
        }
    }

    function persistManualPosition() {
        if (!state.manualPosition) return
        const bounds = getOverlayBounds()
        if (!bounds) return
        const width = bar.offsetWidth
        const height = bar.offsetHeight
        const position = clampOverlayPosition(
            state.manualPosition.left,
            state.manualPosition.top,
            width,
            height,
            bounds
        )
        if (!position) return
        const minLeft = bounds.left + 4
        const minTop = bounds.top + 4
        const maxLeft = bounds.right - width - 4
        const maxTop = bounds.bottom - height - 4
        const xRange = maxLeft - minLeft
        const yRange = maxTop - minTop
        const saved = {
            x: xRange > 0 ? (position.left - minLeft) / xRange : 0.5,
            y: yRange > 0 ? (position.top - minTop) / yRange : 0.5,
        }
        saved.x = Math.max(0, Math.min(1, saved.x))
        saved.y = Math.max(0, Math.min(1, saved.y))
        state.manualPosition = {
            ...position
        }
        state.savedPosition = saved
        try {
            window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify({
                version: 1,
                x: saved.x,
                y: saved.y,
            }))
        } catch (err) {
            // 写入失败不影响当前页面中的拖动和定位。
        }
    }

    function clearSavedPosition() {
        state.manualPosition = null
        state.savedPosition = null
        try {
            window.localStorage.removeItem(POSITION_STORAGE_KEY)
        } catch (err) {
            // 即使存储不可用，也在当前页面恢复默认位置。
        }
    }

    function placeBar() {
        if (!state.web && (!state.video || !state.video.isConnected)) return
        const bounds = getOverlayBounds()
        const w = bar.offsetWidth
        const h = bar.offsetHeight
        const savedPosition = getSavedOverlayPosition(bounds, w, h)
        const desired = state.manualPosition || savedPosition || {
            left: bounds ? bounds.right - w - 10 : 0,
            top: bounds ? bounds.top + 10 : 0,
        }
        const position = clampOverlayPosition(desired.left, desired.top, w, h, bounds)
        if (!position) {
            if (state.shown) hideBar()
            return
        }
        if (state.manualPosition) state.manualPosition = {
            ...position
        }
        bar.style.left = position.left + "px"
        bar.style.top = position.top + "px"
    }

    function showBar() {
        clearTimeout(state.hideTimer)
        mountHost()
        if (!state.shown) {
            refreshButtons()
            state.shown = true
            bar.inert = false
            bar.classList.add("on")
        }
        placeBar()
    }

    function hideBar() {
        clearTimeout(state.hideTimer)
        clearTimeout(state.idleTimer)
        if (!state.shown) {
            bar.inert = true
            return
        }
        state.shown = false
        bar.classList.remove("on")
        bar.inert = true
    }

    function hideLater() {
        clearTimeout(state.hideTimer)
        state.hideTimer = setTimeout(hideBar, HIDE_DELAY)
    }

    function armIdleHide() {
        clearTimeout(state.idleTimer)
        state.idleTimer = setTimeout(() => {
            if (!isOverBar(state.x, state.y)) hideBar()
        }, IDLE_HIDE_DELAY)
    }

    function isOverBar(x, y) {
        if (!state.shown) return false
        const r = bar.getBoundingClientRect()
        return x >= r.left && x < r.right && y >= r.top && y < r.bottom
    }

    function placeToast() {
        const bounds = getOverlayBounds(true)
        if (!bounds) return false
        const availableWidth = bounds.right - bounds.left - 8
        if (availableWidth < 80 || bounds.bottom - bounds.top < 32) return false
        toastEl.style.maxWidth = Math.max(0, availableWidth) + "px"
        const w = toastEl.offsetWidth
        const h = toastEl.offsetHeight
        const desiredLeft = bounds.left + (bounds.right - bounds.left - w) / 2
        const desiredTop = bounds.bottom - h - 12
        const position = clampOverlayPosition(desiredLeft, desiredTop, w, h, bounds)
        if (!position) return false
        toastEl.style.left = position.left + "px"
        toastEl.style.top = position.top + "px"
        toastEl.style.bottom = "auto"
        toastEl.style.transform = "none"
        return true
    }

    function toast(message) {
        mountHost()
        toastEl.textContent = message
        toastEl.classList.add("on")
        if (!placeToast()) toastEl.classList.remove("on")
        clearTimeout(state.toastTimer)
        state.toastTimer = setTimeout(() => toastEl.classList.remove("on"), 2500)
    }
    // ---------- 视频识别 ----------
    function getParent(el) {
        if (el.parentElement) return el.parentElement
        const root = el.getRootNode()
        return root instanceof ShadowRoot ? root.host : null
    }

    function composedContains(ancestor, node) {
        for (let n = node; n; n = getParent(n)) {
            if (n === ancestor) return true
        }
        return false
    }
    // 指针下方的元素和视频的最近公共祖先不比视频大太多，才算同一个播放器（字幕、弹幕、遮罩层都满足；整页弹窗不满足）
    function isSamePlayer(video, videoRect, hit) {
        for (let p = video; p; p = getParent(p)) {
            if (composedContains(p, hit)) {
                const r = p.getBoundingClientRect()
                return r.width * r.height <= videoRect.width * videoRect.height * SAME_PLAYER_AREA_RATIO
            }
        }
        return false
    }

    function isBigEnough(rect) {
        return rect.width >= MIN_WIDTH && rect.height >= MIN_HEIGHT
    }
    // 缓存视频候选项。DOM 结构变化时刷新；已发现的文档和开放 Shadow DOM 分别观察。
    // 这样常见鼠标移动路径只遍历缓存视频，不必每帧扫描整棵 DOM 树。
    const videoCache = {
        list: [],
        dirty: true
    }
    const observedRoots = new WeakSet()
    const rootList = []
    let videoMutationObserver = null

    function collectDeep(selector, root = document) {
        const found = []
        const visit = scope => {
            if (!scope || typeof scope.querySelectorAll !== "function") return
            for (const match of scope.querySelectorAll(selector)) found.push(match)
            for (const hostEl of scope.querySelectorAll("*")) {
                if (hostEl.shadowRoot) visit(hostEl.shadowRoot)
            }
        }
        visit(root)
        return found
    }

    function discoverOpenRoots(scope) {
        if (!scope || typeof scope.querySelectorAll !== "function") return
        if (scope.nodeType === 1 && scope.shadowRoot) observeRoot(scope.shadowRoot)
        for (const hostEl of scope.querySelectorAll("*")) {
            if (hostEl.shadowRoot) observeRoot(hostEl.shadowRoot)
        }
    }

    function observeRoot(root) {
        if (!root || observedRoots.has(root)) return
        observedRoots.add(root)
        rootList.push(root)
        videoCache.dirty = true
        if (videoMutationObserver) {
            try {
                videoMutationObserver.observe(root, {
                    childList: true,
                    subtree: true
                })
            } catch (err) {}
        }
        discoverOpenRoots(root)
    }

    function cleanupDetachedRoots() {
        if (!videoMutationObserver) return
        let removed = false
        for (let i = rootList.length - 1; i >= 1; i--) {
            const root = rootList[i]
            if (!root.host || !root.host.isConnected || root.host.ownerDocument !== document) {
                observedRoots.delete(root)
                rootList.splice(i, 1)
                removed = true
            }
        }
        if (!removed) return
        // MutationObserver 没有单独 unobserve；有 detached root 时重建观察目标，避免长期持有已移除的 Shadow DOM。
        videoMutationObserver.disconnect()
        for (const root of rootList) {
            try {
                videoMutationObserver.observe(root, {
                    childList: true,
                    subtree: true
                })
            } catch (err) {}
        }
        videoCache.dirty = true
    }
    if (typeof MutationObserver === "function") {
        videoMutationObserver = new MutationObserver((records) => {
            videoCache.dirty = true
            for (const record of records) {
                for (const node of record.addedNodes) {
                    if (node.nodeType === 1) discoverOpenRoots(node)
                }
            }
            cleanupDetachedRoots()
            // 播放器在 SPA 页面中可能原地替换 video；避免网页全屏残留在空播放器上。
            if (state.web && (!state.web.target.isConnected ||
                    (state.web.video && !state.web.video.isConnected))) exitWeb("self")
            // 当前视频被动态移除时，重新检查指针下方的内容，避免工具栏悬空。
            if (!state.web && state.shown && state.video && !state.video.isConnected) scheduleUpdate()
        })
    }
    observeRoot(document)

    function getVideos() {
        if (!videoMutationObserver) return collectDeep("video")
        if (videoCache.dirty) {
            videoCache.list = []
            for (const root of rootList) {
                for (const video of root.querySelectorAll("video")) videoCache.list.push(video)
            }
            videoCache.dirty = false
        }
        return videoCache.list
    }

    function isVideoVisible(video, rect = video && video.getBoundingClientRect(), requireViewport = true) {
        if (!video || !video.isConnected || video.ownerDocument !== document || !rect || !isBigEnough(rect)) return false
        if (requireViewport) {
            const vw = document.documentElement.clientWidth
            const vh = document.documentElement.clientHeight
            if (Math.min(rect.right, vw) <= Math.max(rect.left, 0) ||
                Math.min(rect.bottom, vh) <= Math.max(rect.top, 0)) return false
        }
        const ownStyle = getComputedStyle(video)
        if (ownStyle.visibility === "hidden" || ownStyle.visibility === "collapse" ||
            ownStyle.display === "none" || ownStyle.contentVisibility === "hidden" ||
            Number(ownStyle.opacity) === 0) return false
        for (let p = getParent(video); p; p = getParent(p)) {
            const style = getComputedStyle(p)
            if (style.display === "none" || style.contentVisibility === "hidden" ||
                Number(style.opacity) === 0) return false
            if (p === document.documentElement) break
        }
        return true
    }

    function findVideoAt(x, y) {
        const hit = document.elementFromPoint(x, y)
        if (!hit) return null
        // elementFromPoint 在开放 Shadow DOM 外通常只返回 host；借此发现动态挂载的根。
        if (hit.shadowRoot) observeRoot(hit.shadowRoot)
        let best = null
        let bestArea = Infinity
        for (const video of getVideos()) {
            const r = video.getBoundingClientRect()
            if (x < r.left || x >= r.right || y < r.top || y >= r.bottom || !isBigEnough(r)) continue
            if (!isVideoVisible(video, r, false) || !isSamePlayer(video, r, hit)) continue
            const area = r.width * r.height
            if (area < bestArea) {
                best = video
                bestArea = area
            }
        }
        return best
    }

    function findLargestVisibleVideo() {
        // 键盘快捷键触发时补扫一次，以覆盖“宿主已存在、之后才 attachShadow”的少见情况。
        if (videoMutationObserver) discoverOpenRoots(document)
        const vw = document.documentElement.clientWidth
        const vh = document.documentElement.clientHeight
        let best = null
        let bestArea = 0
        for (const video of getVideos()) {
            const r = video.getBoundingClientRect()
            if (!isVideoVisible(video, r)) continue
            const visible = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) *
                Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
            if (visible > bestArea) {
                best = video
                bestArea = visible
            }
        }
        return best
    }

    function currentVideo() {
        if (state.web && state.web.video && state.web.video.isConnected) return state.web.video
        if (state.video && isVideoVisible(state.video)) return state.video
        return findLargestVisibleVideo()
    }
    // 从视频向外找尺寸基本一致的最外层容器，作为播放器整体
    function getPlayerBox(video) {
        const vr = video.getBoundingClientRect()
        let box = video
        for (let p = getParent(video); p && p !== document.body && p !== document.documentElement; p = getParent(p)) {
            const r = p.getBoundingClientRect()
            if (Math.abs(r.width - vr.width) > SIZE_TOLERANCE || Math.abs(r.height - vr.height) > SIZE_TOLERANCE) break
            box = p
        }
        return box
    }
    // ---------- 网页全屏 ----------
    const pageStyles = new WeakMap()

    function ensurePageStyle(node, styleRoots) {
        const root = node.getRootNode()
        let style = pageStyles.get(root)
        if (!style || !style.isConnected) {
            style = document.createElement("style")
            style.textContent = PAGE_CSS;
            (root === document ? document.head || document.documentElement : root).appendChild(style)
            pageStyles.set(root, style)
        }
        styleRoots.add(root)
        return style
    }

    function addClass(el, styleRoots, ...names) {
        ensurePageStyle(el, styleRoots)
        const added = []
        for (const name of names) {
            if (el.classList.contains(name)) continue
            el.classList.add(name)
            added.push(name)
        }
        return added
    }

    function enterWeb(target, video, fromChild) {
        if (!target || !target.isConnected) return
        if (state.web) exitWeb("self")
        const classChanges = []
        const styleRoots = new Set()
        const trackClass = (el, ...names) => {
            const added = addClass(el, styleRoots, ...names)
            if (added.length) classChanges.push({
                el,
                names: added
            })
        }
        for (let p = getParent(target); p && p !== document.documentElement; p = getParent(p)) {
            const position = getComputedStyle(p).position
            if (position === "fixed" || position === "sticky") trackClass(p, CLS.ancestor, CLS.unfix)
            else trackClass(p, CLS.ancestor)
        }
        if (video && video !== target) {
            for (let p = video; p && p !== target; p = getParent(p)) trackClass(p, CLS.fill)
        }
        trackClass(target, CLS.target)
        // 该样式必须位于 document 根样式域，即使视频位于 Shadow DOM 内也要锁定页面滚动。
        trackClass(document.documentElement, CLS.lock)
        state.web = {
            target,
            video,
            fromChild,
            classChanges,
            styleRoots
        }
        if (!isTop) postToParent("enter")
        window.dispatchEvent(new Event("resize"))
        refreshButtons()
        if (!fromChild) {
            showBar()
            armIdleHide()
        }
    }
    // source: self=本页面退出；parent=上层页面通知；child=内层 iframe 通知；navigation=iframe 导航后清理
    function exitWeb(source) {
        const web = state.web
        if (!web) return
        state.web = null
        for (const change of web.classChanges) {
            for (const name of change.names) change.el.classList.remove(name)
        }
        for (const root of web.styleRoots) {
            const style = pageStyles.get(root)
            if (style) style.remove()
            pageStyles.delete(root)
        }
        if (source !== "parent" && !isTop) postToParent("exit")
        if (source !== "child" && source !== "navigation" && web.fromChild && web.target.contentWindow) {
            web.target.contentWindow.postMessage({
                [MSG_KEY]: "exit"
            }, "*")
        }
        window.dispatchEvent(new Event("resize"))
        refreshButtons()
        hideBar()
    }
    // iframe 导航、刷新或进入 BFCache 前主动通知父页面，避免父页面残留网页全屏状态。
    window.addEventListener("pagehide", () => {
        if (state.web) exitWeb("navigation")
    })

    function toggleWeb() {
        if (state.web) return exitWeb("self")
        const video = currentVideo()
        if (!video) return toast(text.noVideo)
        enterWeb(getPlayerBox(video), video, false)
    }

    function postToParent(type) {
        window.parent.postMessage({
            [MSG_KEY]: type
        }, "*")
    }

    function findFrameOf(win) {
        for (const frame of collectDeep("iframe, frame")) {
            if (frame.contentWindow === win) return frame
        }
        return null
    }

    function isTrustedIframeOrigin(origin) {
        return typeof origin === "string" && origin !== "null" &&
            (origin === window.location.origin || TRUSTED_IFRAME_ORIGINS.has(origin))
    }
    window.addEventListener("message", (e) => {
        const data = e.data
        if (!data || typeof data !== "object" || Array.isArray(data) || e.source === window) return
        const type = data[MSG_KEY]
        if (type !== "enter" && type !== "exit") return
        // 来自父窗口的消息只允许退出操作；退出不会扩大页面权限。
        if (!isTop && e.source === window.parent) {
            if (type === "exit") exitWeb("parent")
            return
        }
        if (!isTrustedIframeOrigin(e.origin)) return
        const frame = findFrameOf(e.source)
        if (!frame) return
        if (type === "enter" && !(state.web && state.web.target === frame)) enterWeb(frame, null, true)
        else if (type === "exit" && state.web && state.web.target === frame) exitWeb("child")
    })
    // ---------- 系统全屏 / 画中画 ----------
    async function toggleFullscreen() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            const exit = document.exitFullscreen || document.webkitExitFullscreen
            if (!exit) return toast(text.fullFail)
            try {
                await exit.call(document)
            } catch (err) {
                toast(text.fullFail)
            }
            return
        }
        if (state.web && state.web.fromChild) {
            exitWeb("self")
            return
        }
        const video = currentVideo()
        if (!video) return toast(text.noVideo)
        if (state.web) exitWeb("self")
        const box = getPlayerBox(video)
        for (const el of box === video ? [video] : [box, video]) {
            const request = el.requestFullscreen || el.webkitRequestFullscreen
            if (!request) continue
            try {
                await request.call(el)
                return
            } catch (err) {}
        }
        toast(text.fullFail)
    }

    function restorePipOverride(video = null) {
        const override = state.pipOverride
        if (!override || (video && override.video !== video)) return
        state.pipOverride = null
        try {
            override.video.disablePictureInPicture = override.original
        } catch (err) {}
    }
    async function togglePip() {
        if (document.pictureInPictureElement) {
            if (typeof document.exitPictureInPicture !== "function") return toast(text.pipFail)
            try {
                await document.exitPictureInPicture()
                restorePipOverride()
            } catch (err) {
                toast(text.pipFail)
            }
            return
        }
        const video = currentVideo()
        if (!video) return toast(text.noVideo)
        if (document.pictureInPictureEnabled !== true || typeof video.requestPictureInPicture !== "function") {
            return toast(text.pipFail)
        }
        restorePipOverride()
        try {
            // 仅在请求期间临时解除网站的禁用标记，失败或离开画中画后恢复原值。
            if (video.disablePictureInPicture) {
                state.pipOverride = {
                    video,
                    original: video.disablePictureInPicture
                }
                video.disablePictureInPicture = false
            }
            await video.requestPictureInPicture()
        } catch (err) {
            restorePipOverride(video)
            toast(text.pipFail)
        }
    }
    // ---------- 事件 ----------
    const actions = {
        web: toggleWeb,
        full: toggleFullscreen,
        pip: togglePip
    }
    for (const type of ["pointerdown", "mousedown", "mouseup", "click", "dblclick"]) {
        bar.addEventListener(type, (e) => e.stopPropagation())
    }
    // 仅拖动柄负责移动，避免用户点击全屏/画中画按钮时误拖动工具栏。
    dragHandle.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || !state.shown) return
        e.preventDefault()
        clearTimeout(state.hideTimer)
        clearTimeout(state.idleTimer)
        const rect = bar.getBoundingClientRect()
        state.drag = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            moved: false,
        }
        bar.classList.add("dragging")
        try {
            dragHandle.setPointerCapture(e.pointerId)
        } catch (err) {}
    })
    dragHandle.addEventListener("pointermove", (e) => {
        const drag = state.drag
        if (!drag || e.pointerId !== drag.pointerId) return
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        if (!drag.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return
        drag.moved = true
        state.manualPosition = {
            left: drag.startLeft + dx,
            top: drag.startTop + dy,
        }
        placeBar()
    })

    function finishDrag(e) {
        const drag = state.drag
        if (!drag || (e && e.pointerId !== drag.pointerId)) return
        state.drag = null
        bar.classList.remove("dragging")
        if (state.manualPosition) {
            placeBar()
            if (drag.moved) persistManualPosition()
        }
        if (state.web && !state.web.fromChild) armIdleHide()
        // 拖动结束后重新评估指针位置；若已离开视频，正常启动自动隐藏。
        scheduleUpdate()
    }
    dragHandle.addEventListener("pointerup", finishDrag)
    dragHandle.addEventListener("pointercancel", finishDrag)
    dragHandle.addEventListener("lostpointercapture", finishDrag)
    dragHandle.addEventListener("dblclick", (e) => {
        e.preventDefault()
        clearSavedPosition()
        placeBar()
    })
    // 键盘用户也可以移动工具栏：方向键每次移动 8px，按住 Shift 移动 24px，Home 恢复自动定位。
    dragHandle.addEventListener("keydown", (e) => {
        if (e.key === "Home") {
            clearSavedPosition()
            placeBar()
            if (state.web && !state.web.fromChild) armIdleHide()
            e.preventDefault()
            e.stopPropagation()
            return
        }
        const step = e.shiftKey ? 24 : 8
        let dx = 0
        let dy = 0
        if (e.key === "ArrowLeft") dx = -step
        else if (e.key === "ArrowRight") dx = step
        else if (e.key === "ArrowUp") dy = -step
        else if (e.key === "ArrowDown") dy = step
        else return
        const rect = bar.getBoundingClientRect()
        state.manualPosition = {
            left: rect.left + dx,
            top: rect.top + dy
        }
        placeBar()
        persistManualPosition()
        if (state.web && !state.web.fromChild) armIdleHide()
        e.preventDefault()
        e.stopPropagation()
    })
    bar.addEventListener("click", (e) => {
        const btn = e.target.closest("button")
        if (!btn) return
        e.preventDefault()
        const action = actions[btn.dataset.act]
        if (!action) return
        try {
            const result = action()
            if (result && typeof result.catch === "function") {
                result.catch(() => toast(text.actionFail))
            }
            if (state.web && !state.web.fromChild) armIdleHide()
        } catch (err) {
            toast(text.actionFail)
        }
    })

    function update() {
        state.frame = 0
        // 拖动时由 pointermove 专门更新位置，避免自动隐藏逻辑与拖动互相干扰。
        if (state.drag) return
        const {
            x,
            y
        } = state
        // 系统全屏优先级高于网页全屏，避免系统全屏期间重新显示工具栏。
        if (document.fullscreenElement || document.webkitFullscreenElement) return hideBar()
        if (state.web) {
            if (!state.web.target.isConnected) return exitWeb("self")
            if (state.web.fromChild) return
            if (!state.shown) showBar()
            else placeBar()
            return
        }
        if (isOverBar(x, y)) return clearTimeout(state.hideTimer)
        const video = findVideoAt(x, y)
        if (video) {
            state.video = video
            showBar()
        } else if (state.shown) {
            hideLater()
        }
    }

    function scheduleUpdate() {
        if (!state.frame) state.frame = requestAnimationFrame(update)
    }
    window.addEventListener(
        "pointermove",
        (e) => {
            state.x = e.clientX
            state.y = e.clientY
            if (state.web && !state.web.fromChild) armIdleHide()
            scheduleUpdate()
        }, {
            capture: true,
            passive: true
        }
    )
    for (const type of ["scroll", "resize"]) {
        window.addEventListener(
            type,
            () => {
                if (state.shown) scheduleUpdate()
                if (toastEl.classList.contains("on")) {
                    if (!placeToast()) toastEl.classList.remove("on")
                }
            }, {
                capture: true,
                passive: true
            }
        )
    }
    document.documentElement.addEventListener("mouseleave", () => {
        if (!state.web) hideLater()
    })
    for (const type of ["fullscreenchange", "webkitfullscreenchange"]) {
        document.addEventListener(type, () => {
            refreshButtons()
            hideBar()
        })
    }
    for (const type of ["enterpictureinpicture", "leavepictureinpicture"]) {
        document.addEventListener(type, () => {
            if (type === "leavepictureinpicture") restorePipOverride()
            refreshButtons()
        }, true)
    }

    function isEditable(el) {
        return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
    }
    document.addEventListener(
        "keydown",
        (e) => {
            const path = typeof e.composedPath === "function" ? e.composedPath() : [e.target]
            if (e.repeat || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey ||
                e.isComposing || path.includes(host) || isEditable(path[0])) return
            let handled = false
            if (e.key === "Escape") {
                // 系统全屏时保留浏览器默认 Esc 行为，不抢先退出网页全屏。
                if (state.web && !document.fullscreenElement && !document.webkitFullscreenElement) {
                    exitWeb("self")
                    handled = true
                }
            } else if (e.key === "]") {
                if (state.web || currentVideo()) {
                    toggleWeb()
                    handled = true
                }
            } else if (e.key === "[") {
                if (document.pictureInPictureElement || currentVideo()) {
                    togglePip()
                    handled = true
                }
            }
            if (handled) {
                e.preventDefault()
                e.stopPropagation()
            }
        },
        true
    )
})()