// ==UserScript==
// @name			视频自动小窗模式
// @version			2026090600
// @match			*://*/*
// @icon			https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/PiP.png
// @run-at			document-start
// @downloadURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%A7%86%E9%A2%91%E8%87%AA%E5%8A%A8%E5%B0%8F%E7%AA%97%E6%A8%A1%E5%BC%8F.user.js
// @updateURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E8%A7%86%E9%A2%91%E8%87%AA%E5%8A%A8%E5%B0%8F%E7%AA%97%E6%A8%A1%E5%BC%8F.user.js
// ==/UserScript==
(function() {
    const HOSTNAME = location.hostname;
    const isAliyunDrive = HOSTNAME.includes('aliyundrive.com');
    const isBilibili = HOSTNAME === 'bilibili.com' || HOSTNAME.endsWith('.bilibili.com');
    const CONFIG = {
        enabled: true,
        debug: false,
        // 点击页面后离开浏览器时尝试自动入 PiP；扩展弹窗失焦由工具栏保护逻辑拦截。
        autoPiPOnWindowBlur: true,
        // 原生自动 PiP 在部分 Chromium/站点中被脚本关闭后，下一轮自动进入会要求重新点击页面。
        // auto-close: 回页自动关闭 PiP，但这类站点可能需要再次点击页面才会触发下一轮自动 PiP。
        // continuous: 不自动关闭原生自动 PiP，优先保证反复切 tab 都能继续自动进入。
        nativeAutoPiPReturnMode: 'auto-close',
        nativeAutoPiPFallbackExitDelay: 600,
        refreshVideoOnReturn: !isAliyunDrive,
        lightweightVideoScan: isAliyunDrive,
        stopDynamicObserverAfterFirstVideo: isAliyunDrive,
        conservativePiPRearm: isAliyunDrive,
        minimalMode: false,
        deferAutoPiPAttributeUntilHidden: false,
        setAutoPiPBeforePlaybackOnly: isAliyunDrive,
        autoPiPStablePlaybackDelay: isAliyunDrive ? 3000 : 0,
        hookVideoCreation: false,
        shortcutsOnlyMode: isAliyunDrive,
        isMgtv: HOSTNAME.includes('mgtv.com')
    };
    let hasEverInteracted = false;
    let iframeBlurPending = false; // 标记：是否刚点击了 iframe 等嵌入元素（可能导致假 blur）
    let pointerInBrowserChrome = false; // 鼠标从页面顶部离开后，视为位于浏览器工具栏
    let webFullscreenSession = null;
    let returnToPageTimer = null;
    let lastPipVideo = null;
    let nativeAutoPiPVideo = null;
    let nativeAutoPiPFallbackExitTimer = null;
    let dynamicObserverStopped = false;
    let mediaSessionAutoPiPHandler = null;
    let mediaSessionAutoPiPHandlerInstalled = false;
    let mediaSessionAutoPiPOverriddenByPage = false;
    let mediaSessionSetActionHandlerHooked = false;
    const observedVideos = new Set();
    const documentPiPWindowsWithShortcuts = new WeakSet();
    let bilibiliDocumentPiPClosingUntil = 0;
    let bilibiliDocumentPiPRearmTimer = null;
    let bilibiliManualPiPTransitionInFlight = false;
    const BILIBILI_DOCUMENT_PIP_CLOSE_GRACE = 1500;
    const BROWSER_CHROME_GUARD_MESSAGE = '__videoAutoPiPBrowserChromeGuardV41332__';
    let webFullscreenStyleInjected = false;
    installVideoCreationHook();
    const style = document.createElement('style');
    style.textContent = `
.pip-web-fullscreen-container {
position: fixed !important;
top: 0 !important;
left: 0 !important;
width: 100vw !important;
height: 100vh !important;
z-index: 2147483647 !important;
background: #000 !important;
display: flex !important;
align-items: center !important;
justify-content: center !important;
margin: 0 !important;
padding: 0 !important;
}
.pip-web-fullscreen-container video {
width: 100% !important;
height: 100% !important;
max-width: 100vw !important;
max-height: 100vh !important;
object-fit: contain !important;
}
.pip-web-fullscreen-container:fullscreen,
.pip-web-fs-player:fullscreen {
width: 100vw !important;
height: 100vh !important;
background: #000 !important;
}
.pip-web-fullscreen-container:fullscreen .pip-web-fs-player,
.pip-web-fs-player:fullscreen video {
width: 100% !important;
height: 100% !important;
}
.pip-web-fs-player {
position: fixed !important;
top: 0 !important;
left: 0 !important;
width: 100vw !important;
height: 100vh !important;
z-index: 2147483647 !important;
background: #000 !important;
}
#cloud-director-container.pip-web-fs-player > .player-container {
position: absolute !important;
top: 50% !important;
left: 50% !important;
transform: translate(-50%, -50%) !important;
width: calc(100% - 20px) !important;
max-width: calc(177.77778vh - 20px) !important;
height: auto !important;
}
body.pip-web-fs-active {
overflow: hidden !important;
}
.pip-web-fullscreen-anchor {
display: none !important;
}
`;

    function ensureWebFullscreenStyle() {
        if (webFullscreenStyleInjected) return;
        webFullscreenStyleInjected = true;
        (document.head || document.documentElement)?.appendChild(style);
    }

    function log(type, ...args) {
        if (!CONFIG.debug) return;
        const prefix = `[自动画中画][${location.hostname}]`;
        if (type === 'warn') console.warn(prefix, ...args);
        else if (type === 'error') console.error(prefix, ...args);
        else console.log(prefix, ...args);
    }

    function markVideoForNativeAutoPiP(video) {
        if (!video || !video.isConnected && video.ownerDocument !== document) return;
        video.removeAttribute('disablepictureinpicture');
        // 保留该属性作为 Chromium 自动 PiP 资格标记。
        // B 站新版按钮仅用于手动 P，自动切页继续使用稳定的原生路径。
        video.setAttribute('autopictureinpicture', '');
        if (typeof video.autoPictureInPicture !== 'undefined' && video.autoPictureInPicture !== true) {
            video.autoPictureInPicture = true;
        }
    }

    function installVideoCreationHook() {
        if (!CONFIG.hookVideoCreation || document.__pipCreateElementHooked) return;
        document.__pipCreateElementHooked = true;
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function(tagName, options) {
            const element = originalCreateElement(tagName, options);
            if (String(tagName).toLowerCase() === 'video') {
                markVideoForNativeAutoPiP(element);
            }
            return element;
        };
    }
    let lastActionTime = 0;
    const ACTION_COOLDOWN = 500; // 调优：减少冷却时间，响应更快速
    function getActivationState() {
        const activation = navigator.userActivation;
        return {
            isActive: !!activation?.isActive,
            hasBeenActive: !!activation?.hasBeenActive
        };
    }

    function scheduleReturnToPageExit(delay = 180) {
        if (!CONFIG.enabled) return;
        if (returnToPageTimer) clearTimeout(returnToPageTimer);
        returnToPageTimer = setTimeout(() => {
            returnToPageTimer = null;
            if (document.hidden || !document.hasFocus()) return;
            if (nativeAutoPiPVideo && document.pictureInPictureElement === nativeAutoPiPVideo) {
                if (CONFIG.nativeAutoPiPReturnMode === 'continuous') {
                    log('debug', '检测到原生自动画中画会话，连续模式下保持 PiP 打开');
                    return;
                }
                scheduleNativeAutoPiPFallbackExit();
                return;
            }
            exitPiP();
        }, delay);
    }

    function scheduleNativeAutoPiPFallbackExit(delay = CONFIG.nativeAutoPiPFallbackExitDelay) {
        if (nativeAutoPiPFallbackExitTimer) clearTimeout(nativeAutoPiPFallbackExitTimer);
        log('debug', `检测到原生自动画中画会话，等待浏览器自动退出，delay=${delay}ms`);
        nativeAutoPiPFallbackExitTimer = setTimeout(() => {
            nativeAutoPiPFallbackExitTimer = null;
            if (!CONFIG.enabled || document.hidden || !document.hasFocus()) return;
            if (nativeAutoPiPVideo && document.pictureInPictureElement === nativeAutoPiPVideo) {
                log('debug', '浏览器未自动退出原生画中画，执行延迟兜底退出');
                nativeAutoPiPVideo = null;
                exitPiP();
                scheduleNativeAutoPiPRearm('原生画中画兜底退出后');
            }
        }, delay);
    }

    function refreshVideoRendering(video) {
        if (!CONFIG.refreshVideoOnReturn) return;
        if (!video || !video.isConnected) return;
        if (video.readyState >= 2) {
            video.currentTime = video.currentTime;
        }
        video.style.transform = 'translateZ(0)';
        void video.offsetHeight;
        requestAnimationFrame(() => {
            if (!video.isConnected) return;
            video.style.removeProperty('transform');
        });
    }
    async function exitPiP(pipDocument = document) {
        if (!CONFIG.enabled || Date.now() - lastActionTime < ACTION_COOLDOWN) return;
        const documentPiPWindow = isBilibili ? getActiveDocumentPiPWindowAcrossSameOriginFrames() : null;
        if (documentPiPWindow) {
            closeDocumentPiPWindow(documentPiPWindow, '返回页面, 自动退出 Document Picture-in-Picture');
            return;
        }
        if (pipDocument.pictureInPictureElement) {
            try {
                lastActionTime = Date.now();
                await pipDocument.exitPictureInPicture();
                log('info', '返回页面, 自动退出画中画');
            } catch (err) {}
        }
    }
    async function enterPiP(video, trigger) {
        const activation = getActivationState();
        log('info', `>>> enterPiP 调用: trigger=${trigger}, hasVideo=${!!video}, alreadyPiP=${!!document.pictureInPictureElement}, cooldown=${Date.now() - lastActionTime}ms, activation=${activation.isActive}/${activation.hasBeenActive}`);
        if (!video || document.pictureInPictureElement || Date.now() - lastActionTime < ACTION_COOLDOWN) {
            log('info', `>>> enterPiP 被拦截: noVideo=${!video}, alreadyPiP=${!!document.pictureInPictureElement}, inCooldown=${Date.now() - lastActionTime < ACTION_COOLDOWN}`);
            return;
        }
        if (trigger.startsWith('窗口失焦') && !activation.isActive) {
            log('warn', '窗口失焦时当前没有瞬时用户激活，跳过 requestPictureInPicture 调用；若是标签切换，交给浏览器原生 autoPictureInPicture 处理。');
            return;
        }
        try {
            lastActionTime = Date.now();
            await video.requestPictureInPicture();
            log('info', `成功通过 [${trigger}] 开启画中画`);
        } catch (err) {
            lastActionTime = 0; // 失败时重置冷却，允许立即重试
            log('error', `>>> enterPiP 异常: ${err.name}: ${err.message}`);
            const isGestureError = err.name === 'NotAllowedError' || err.message.includes('user gesture');
            if (isGestureError) {
                const latestActivation = getActivationState();
                log('warn', `受限于安全策略, [${trigger}] 调用当下缺少瞬时用户激活: activation=${latestActivation.isActive}/${latestActivation.hasBeenActive}, everInteracted=${hasEverInteracted}`);
                if (trigger.startsWith('窗口失焦')) {
                    log('warn', '当前 Chromium 策略下，切到别的应用时无法复用之前的页面点击手势；标签切换可继续依赖原生 autoPictureInPicture。');
                } else if (!hasEverInteracted) {
                    console.log('%c 提示: 请先与页面交互，再使用快捷键 P 手动触发画中画。', 'background: #ffcc00; color: #000; font-weight: bold; padding: 5px;');
                }
            } else {
                log('error', `${trigger} 失败:`, err.message);
            }
        }
    }
    // 深度搜索视频元素 (支持 Shadow DOM)
    function findVideosDeep(root = document) {
        let videos = Array.from(root.querySelectorAll('video'));
        const rootDocument = root.ownerDocument || root;
        const walker = rootDocument.createTreeWalker(root, 1, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.shadowRoot) {
                videos = videos.concat(findVideosDeep(node.shadowRoot));
            }
        }
        return videos;
    }
    // 收集当前文档及可直接访问的同源 iframe 文档。
    // 键盘事件不会跨 browsing context 冒泡，因此外层页面收到快捷键时，
    // 需要主动查找同源播放器 iframe；跨域 iframe 仍由其自身获得焦点后处理。
    function getSameOriginDocuments(rootDocument = document, visited = new Set()) {
        if (!rootDocument || visited.has(rootDocument)) return [];
        visited.add(rootDocument);
        const documents = [rootDocument];
        const frames = rootDocument.querySelectorAll('iframe, frame');
        for (const frame of frames) {
            try {
                const frameDocument = frame.contentDocument;
                if (frameDocument) {
                    documents.push(...getSameOriginDocuments(frameDocument, visited));
                }
            } catch (err) {
                // 跨域 frame 无法直接访问，由注入该 frame 的脚本在其获得焦点时处理。
            }
        }
        return documents;
    }

    function findVideosAcrossSameOriginFrames() {
        return getSameOriginDocuments().flatMap(frameDocument => findVideosDeep(frameDocument));
    }

    function getActivePiPDocumentAcrossSameOriginFrames() {
        return getSameOriginDocuments().find(frameDocument => frameDocument.pictureInPictureElement) || null;
    }

    function getActiveDocumentPiPWindowAcrossSameOriginFrames() {
        for (const frameDocument of getSameOriginDocuments()) {
            const pipWindow = frameDocument.defaultView?.documentPictureInPicture?.window;
            if (pipWindow && !pipWindow.closed) return pipWindow;
        }
        return null;
    }

    function isBilibiliDocumentPiPClosing() {
        return isBilibili && Date.now() < bilibiliDocumentPiPClosingUntil;
    }

    function beginBilibiliDocumentPiPClose() {
        if (!isBilibili) return;
        bilibiliDocumentPiPClosingUntil = Math.max(
            bilibiliDocumentPiPClosingUntil,
            Date.now() + BILIBILI_DOCUMENT_PIP_CLOSE_GRACE
        );
        if (bilibiliDocumentPiPRearmTimer) clearTimeout(bilibiliDocumentPiPRearmTimer);
        const rearmDelay = Math.max(0, bilibiliDocumentPiPClosingUntil - Date.now()) + 50;
        bilibiliDocumentPiPRearmTimer = setTimeout(() => {
            bilibiliDocumentPiPRearmTimer = null;
            if (!CONFIG.enabled) return;
            scheduleNativeAutoPiPRearm('B 站 Document PiP 关闭恢复完成');
        }, rearmDelay);
    }

    function closeDocumentPiPWindow(pipWindow, reason) {
        if (!pipWindow || pipWindow.closed) return false;
        beginBilibiliDocumentPiPClose();
        pipWindow.close();
        log('info', reason);
        return true;
    }

    function refreshBilibiliPlayerAfterDocumentPiP() {
        if (!isBilibili) return;
        [0, 120, 500].forEach(delay => {
            setTimeout(() => {
                const video = findVideosDeep().find(item => !item.paused && item.readyState >= 1) ||
                    findVideosDeep().find(item => item.readyState >= 1);
                if (video?.ownerDocument === document) refreshVideoRendering(video);
                window.dispatchEvent(new Event('resize'));
            }, delay);
        });
    }

    function attachDocumentPiPShortcuts(pipWindow) {
        if (!pipWindow || pipWindow.closed || documentPiPWindowsWithShortcuts.has(pipWindow)) return;
        documentPiPWindowsWithShortcuts.add(pipWindow);
        pipWindow.addEventListener('pagehide', () => {
            beginBilibiliDocumentPiPClose();
            refreshBilibiliPlayerAfterDocumentPiP();
        }, {
            once: true
        });
        pipWindow.document.addEventListener('keydown', event => {
            const target = event.target;
            const tagName = target?.tagName?.toLowerCase();
            if (target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;
            if (event.key?.toLowerCase() !== 'p') return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            closeDocumentPiPWindow(pipWindow, '在 Document Picture-in-Picture 窗口内按 P 退出画中画');
        }, true);
    }

    function installDocumentPiPShortcutBridge() {
        const controller = window.documentPictureInPicture;
        if (!isBilibili || !controller || document.__pipDocumentShortcutBridgeInstalled) return;
        document.__pipDocumentShortcutBridgeInstalled = true;
        controller.addEventListener('enter', event => {
            attachDocumentPiPShortcuts(event.window || controller.window);
        });
        attachDocumentPiPShortcuts(controller.window);
    }
    // 全局单例重置尺寸监听器，避免为每个未达到尺寸的视频单独创建而引发内存泄露
    const SharedResizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            const {
                width,
                height
            } = entry.contentRect;
            const video = entry.target;
            if (width >= 200 || height >= 150) {
                applyPipConfig(video);
                SharedResizeObserver.unobserve(video);
            }
        }
    });

    function applyPipConfig(video) {
        if (video.dataset.pipObserved) return;
        video.dataset.pipObserved = 'true';
        observedVideos.add(video);
        if (!CONFIG.setAutoPiPBeforePlaybackOnly || video.paused || video.readyState < 2) {
            enforceNativeAutoPiP(video);
        }
        installMediaSessionAutoPiPHandler();
        if (CONFIG.conservativePiPRearm) {
            const finalizePlayableVideo = () => {
                installMediaSessionAutoPiPHandler();
                scheduleStableAutoPiP(video);
                stopDynamicObserverIfNeeded();
            };
            video.addEventListener('loadedmetadata', () => {
                if (video.paused || video.readyState < 2) enforceNativeAutoPiP(video);
            }, {
                once: true
            });
            video.addEventListener('play', finalizePlayableVideo, {
                once: true
            });
            video.addEventListener('playing', finalizePlayableVideo, {
                once: true
            });
            if (!video.paused || video.readyState >= 2) {
                scheduleStableAutoPiP(video);
                stopDynamicObserverIfNeeded();
            }
        } else {
            video.addEventListener('play', () => {
                enforceNativeAutoPiP(video);
                installMediaSessionAutoPiPHandler();
            });
            video.addEventListener('playing', () => {
                enforceNativeAutoPiP(video);
                installMediaSessionAutoPiPHandler();
            });
        }
        log('info', '检测到有效播放器, 已应用配置');
    }
    // 属性强效守护：确保 autoPictureInPicture 始终启用。
    // 部分站点/Chromium 在退出原生自动 PiP 后会把状态掉回去，需要在下一次切页前重新锁定。
    function enforceNativeAutoPiP(video) {
        if (!video || !video.isConnected) return;
        markVideoForNativeAutoPiP(video);
        if (typeof video.autoPictureInPicture !== 'undefined') {
            log('debug', '重新锁定原生自动画中画属性');
        }
    }

    function scheduleStableAutoPiP(video) {
        if (!CONFIG.autoPiPStablePlaybackDelay || video.dataset.pipStableScheduled) return;
        video.dataset.pipStableScheduled = 'true';
        setTimeout(() => {
            if (!CONFIG.enabled || !video.isConnected || video.paused || video.seeking || video.readyState < 2) {
                video.dataset.pipStableScheduled = '';
                return;
            }
            enforceNativeAutoPiP(video);
        }, CONFIG.autoPiPStablePlaybackDelay);
    }

    function enforceAllNativeAutoPiP() {
        observedVideos.forEach(video => {
            if (!video.isConnected) {
                observedVideos.delete(video);
                return;
            }
            enforceNativeAutoPiP(video);
        });
    }

    function scheduleNativeAutoPiPRearm(reason) {
        if (CONFIG.conservativePiPRearm || isBilibiliDocumentPiPClosing()) return;
        enforceAllNativeAutoPiP();
        installMediaSessionAutoPiPHandler();
        [120, 500, 1200].forEach(delay => {
            setTimeout(() => {
                if (!CONFIG.enabled) return;
                enforceAllNativeAutoPiP();
                installMediaSessionAutoPiPHandler();
                log('debug', `延迟重锁原生自动画中画: ${reason}, delay=${delay}ms`);
            }, delay);
        });
    }

    function getBestAutoPiPVideo() {
        const isUsable = video =>
            video.isConnected &&
            !video.paused &&
            !video.muted &&
            video.readyState >= 2 &&
            video.disablePictureInPicture !== true;
        const observed = Array.from(observedVideos).filter(isUsable);
        return observed[0] || findVideosDeep().find(isUsable);
    }

    function createMediaSessionAutoPiPHandler() {
        if (mediaSessionAutoPiPHandler) return mediaSessionAutoPiPHandler;
        mediaSessionAutoPiPHandler = async () => {
            if (!CONFIG.enabled ||
                document.pictureInPictureElement ||
                getActiveDocumentPiPWindowAcrossSameOriginFrames() ||
                isBilibiliDocumentPiPClosing()) return;
            const video = getBestAutoPiPVideo();
            if (!video) {
                log('debug', '浏览器请求自动画中画，但未找到可用播放视频');
                return;
            }
            try {
                enforceNativeAutoPiP(video);
                await video.requestPictureInPicture();
                log('info', '成功响应浏览器自动画中画请求');
            } catch (err) {
                log('warn', `响应浏览器自动画中画请求失败: ${err.name}: ${err.message}`);
            }
        };
        return mediaSessionAutoPiPHandler;
    }

    function hookMediaSessionSetActionHandler() {
        if (mediaSessionSetActionHandlerHooked) return;
        if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setActionHandler !== 'function') return;
        const originalSetActionHandler = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
        navigator.mediaSession.setActionHandler = (action, handler) => {
            const result = originalSetActionHandler(action, handler);
            if (action === 'enterpictureinpicture') {
                const ownHandler = createMediaSessionAutoPiPHandler();
                if (handler !== ownHandler) {
                    mediaSessionAutoPiPHandlerInstalled = false;
                    mediaSessionAutoPiPOverriddenByPage = true;
                    log('debug', handler ? '页面已接管 Media Session 自动画中画处理器' : '页面清除了 Media Session 自动画中画处理器');
                }
            }
            return result;
        };
        mediaSessionSetActionHandlerHooked = true;
    }

    function installMediaSessionAutoPiPHandler() {
        if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setActionHandler !== 'function') return;
        hookMediaSessionSetActionHandler();
        if (mediaSessionAutoPiPHandlerInstalled || mediaSessionAutoPiPOverriddenByPage) return;
        try {
            navigator.mediaSession.setActionHandler('enterpictureinpicture', createMediaSessionAutoPiPHandler());
            mediaSessionAutoPiPHandlerInstalled = true;
            log('debug', '已注册 Media Session 自动画中画处理器');
        } catch (err) {
            log('warn', `当前浏览器不支持 Media Session 自动画中画处理器: ${err.name}: ${err.message}`);
        }
    }

    function setupVideo(video) {
        if (!video || video.dataset.pipObserved) return;
        if (video.offsetWidth >= 200 || video.offsetHeight >= 150) {
            applyPipConfig(video);
        } else {
            // 如果尺寸不够，交给全局监听器，不要在此新建监听
            SharedResizeObserver.observe(video);
        }
    }

    function scanVideos() {
        const videos = CONFIG.lightweightVideoScan ? Array.from(document.querySelectorAll('video')) : findVideosDeep();
        videos.forEach(setupVideo);
    }

    function stopDynamicObserverIfNeeded() {
        if (!CONFIG.stopDynamicObserverAfterFirstVideo || dynamicObserverStopped) return;
        const hasPlayableVideo = Array.from(observedVideos).some(video => video.isConnected && (!video.paused || video.readyState >= 2));
        if (!hasPlayableVideo) return;
        dynamicObserverStopped = true;
        if (scanTimeout) {
            clearTimeout(scanTimeout);
            scanTimeout = null;
        }
        observer.disconnect();
        log('debug', '检测到可播放视频，已停止动态 DOM 观察以降低播放器页面开销');
    }
    async function toggleManualPiP() {
        const documentPiPWindow = isBilibili ? getActiveDocumentPiPWindowAcrossSameOriginFrames() : null;
        if (documentPiPWindow) {
            closeDocumentPiPWindow(documentPiPWindow, '已通过快捷键 P 关闭 Document Picture-in-Picture 窗口');
            return;
        }
        const activePiPDocument = getActivePiPDocumentAcrossSameOriginFrames();
        const allVideos = findVideosAcrossSameOriginFrames().filter(v => v.readyState >= 2);
        const target = allVideos.find(v => !v.paused) || allVideos[0];
        // 标准 Video PiP 必须通过 Document API 退出，不能再点击 B 站的进入按钮。
        if (activePiPDocument) {
            await exitPiP(activePiPDocument);
            return;
        }
        // B 站的开启和退出必须使用同一个播放器开关，避免站内状态与原生 API 状态脱节。
        if (isBilibili && target) {
            if (bilibiliManualPiPTransitionInFlight) {
                log('debug', 'B 站手动画中画正在切换，忽略重复 P 键');
                return;
            }
            bilibiliManualPiPTransitionInFlight = true;
            try {
                const enteredThroughBilibili = await clickBilibiliPiPButton(target);
                if (enteredThroughBilibili) return;
                if (getActivationState().isActive) {
                    await enterPiP(target, '快捷键 P（B 站按钮未进入后兜底）');
                } else {
                    log('warn', 'B 站画中画按钮未成功，且当前按键的用户激活已失效；可再按一次 P 重试');
                }
            } finally {
                bilibiliManualPiPTransitionInFlight = false;
            }
            return;
        }
        if (allVideos.length === 0) return;
        if (target) await enterPiP(target, '快捷键 P');
    }
    // B 站的按钮会先走播放器自己的 PiP 状态和兼容逻辑。
    // 控件不存在时再回退到 video.requestPictureInPicture() 。
    async function clickBilibiliPiPButton(video) {
        const selectors = [
            '.bpx-player-ctrl-pip',
            '.bilibili-player-video-btn-pip',
            '[aria-label*="画中画"]',
            '[title*="画中画"]'
        ].join(',');
        const playerSelectors = [
            '#bilibili-player',
            '.bpx-player-container',
            '.bilibili-player'
        ].join(',');
        const videoDocument = video?.ownerDocument;
        if (!videoDocument) return false;
        // B 站切 P/换集后可能暂时保留旧播放器 DOM，必须从当前视频反查所属播放器。
        const currentPlayer = video.closest(playerSelectors);
        const candidates = currentPlayer ?
            Array.from(currentPlayer.querySelectorAll(selectors)) :
            Array.from(videoDocument.querySelectorAll(selectors));
        for (const button of candidates) {
            if (!button.isConnected || button.matches('[disabled], [aria-disabled="true"]')) continue;
            const style = videoDocument.defaultView?.getComputedStyle(button);
            const isVisible = button.getClientRects().length > 0 &&
                style?.display !== 'none' &&
                style?.visibility !== 'hidden';
            if (!isVisible) continue;
            const documentPiPController = videoDocument.defaultView?.documentPictureInPicture;
            const entered = await new Promise(resolve => {
                let settled = false;
                const hasActivePiP = () => {
                    const videoPiPActive = !!videoDocument.pictureInPictureElement;
                    const documentPiPActive = !!documentPiPController?.window && !documentPiPController.window.closed;
                    return videoPiPActive || documentPiPActive;
                };
                const finish = success => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timeout);
                    videoDocument.removeEventListener('enterpictureinpicture', onVideoEnter, true);
                    documentPiPController?.removeEventListener('enter', onDocumentEnter);
                    resolve(success);
                };
                const onVideoEnter = () => finish(true);
                const onDocumentEnter = () => finish(true);
                const timeout = setTimeout(() => finish(hasActivePiP()), 400);
                videoDocument.addEventListener('enterpictureinpicture', onVideoEnter, {
                    capture: true,
                    once: true
                });
                documentPiPController?.addEventListener('enter', onDocumentEnter, {
                    once: true
                });
                button.click();
                queueMicrotask(() => {
                    if (hasActivePiP()) finish(true);
                });
            });
            log(entered ? 'info' : 'warn', entered ?
                '已确认通过当前 B 站播放器的自带按钮进入画中画' :
                'B 站播放器按钮已点击，但未观测到画中画成功事件');
            return entered;
        }
        return false;
    }

    function findPlayerContainer(video) {
        let el = video.parentElement;
        let candidate = null;
        while (el && el !== document.body) {
            const id = (el.id || '').toLowerCase();
            const cls = typeof el.className === 'string' ? el.className.toLowerCase() : '';
            const hasPlayerName = /player|video|preview|viewer|media/.test(id) || /player|video|preview|viewer|media/.test(cls);
            const hasControlBar = !!el.querySelector([
                '.bpx-player-control-wrap',
                '.bpx-player-control-bottom',
                '.bilibili-player-video-control',
                '[class*="control" i]',
                '[class*="controller" i]',
                '[class*="progress" i]',
                '[class*="toolbar" i]',
                '[class*="slider" i]',
                'input[type="range"]'
            ].join(','));
            const rect = el.getBoundingClientRect();
            const looksLikePlayerShell = rect.width >= video.offsetWidth && rect.height >= video.offsetHeight && hasControlBar;
            if (looksLikePlayerShell) return el;
            if (!candidate && hasPlayerName) candidate = el;
            el = el.parentElement;
        }
        return candidate;
    }
    async function exitWebFullscreen() {
        if (!webFullscreenSession) return;
        if (webFullscreenSession.exiting) return false;
        const {
            mode
        } = webFullscreenSession;
        if (mode === 'inplace') {
            const {
                container,
                previousStyle,
                chain
            } = webFullscreenSession;
            const fullscreenElement = document.fullscreenElement;
            if (fullscreenElement && container.contains(fullscreenElement)) {
                webFullscreenSession.exiting = true;
                try {
                    await document.exitFullscreen();
                } catch (err) {
                    log('warn', `退出原生全屏失败: ${err.name}: ${err.message}`);
                    return false;
                } finally {
                    webFullscreenSession.exiting = false;
                }
            }
            container.classList.remove('pip-web-fs-player');
            if (previousStyle === null) container.removeAttribute('style');
            else container.setAttribute('style', previousStyle);
            chain.forEach(({
                el,
                prev
            }) => {
                if (prev === null) el.removeAttribute('style');
                else el.setAttribute('style', prev);
            });
            window.dispatchEvent(new Event('resize'));
        } else if (mode === 'container-overlay') {
            const {
                video,
                container,
                anchor,
                overlay,
                previousStyle,
                previousVideoStyle,
                chain
            } = webFullscreenSession;
            const fallbackParent = anchor?.parentNode || document.body;
            container.classList.remove('pip-web-fs-player');
            if (anchor?.parentNode) {
                anchor.parentNode.insertBefore(container, anchor);
                anchor.remove();
            } else if (overlay?.contains(container)) {
                fallbackParent.appendChild(container);
            }
            overlay?.remove();
            if (previousStyle === null) container.removeAttribute('style');
            else container.setAttribute('style', previousStyle);
            if (previousVideoStyle === null) video.removeAttribute('style');
            else video.setAttribute('style', previousVideoStyle);
            chain.forEach(({
                el,
                prev
            }) => {
                if (prev === null) el.removeAttribute('style');
                else el.setAttribute('style', prev);
            });
            window.dispatchEvent(new Event('resize'));
        } else {
            const {
                video,
                anchor,
                overlay,
                previousInlineStyle
            } = webFullscreenSession;
            const fallbackParent = anchor?.parentNode || document.body;
            if (anchor?.parentNode) {
                anchor.parentNode.insertBefore(video, anchor);
                anchor.remove();
            } else if (overlay?.contains(video)) {
                fallbackParent.appendChild(video);
            }
            overlay?.remove();
            if (previousInlineStyle === null) video.removeAttribute('style');
            else video.setAttribute('style', previousInlineStyle);
        }
        document.body.classList.remove('pip-web-fs-active');
        webFullscreenSession = null;
        log('info', '退出网页全屏');
        return true;
    }

    function buildFullscreenChain(video, container) {
        const chain = [];
        let el = video.parentElement;
        while (el && el !== container) {
            chain.push({
                el,
                prev: el.getAttribute('style')
            });
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('height', '100%', 'important');
            el.style.setProperty('max-width', '100vw', 'important');
            el.style.setProperty('max-height', '100vh', 'important');
            el = el.parentElement;
        }
        return chain;
    }

    function getWebFullscreenNativeTarget() {
        if (!webFullscreenSession) return null;
        return webFullscreenSession.overlay || webFullscreenSession.container || webFullscreenSession.video || null;
    }

    function refreshWebFullscreenLayout() {
        if (!webFullscreenSession) return;
        // 直播多机位由站点维护各视频尺寸，不能把某一路视频强制拉满。
        if (webFullscreenSession.mode === 'inplace') return;
        const {
            video,
            container,
            overlay
        } = webFullscreenSession;
        [overlay, container, video].forEach(el => {
            if (!el) return;
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('height', '100%', 'important');
        });
        video.style.setProperty('max-width', '100vw', 'important');
        video.style.setProperty('max-height', '100vh', 'important');
        refreshVideoRendering(video);
    }
    async function toggleNativeFullscreenFromWebFullscreen() {
        if (webFullscreenSession?.exiting) return false;
        const target = getWebFullscreenNativeTarget();
        if (!target || typeof target.requestFullscreen !== 'function') return false;
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await target.requestFullscreen({
                    navigationUI: 'hide'
                });
            }
            refreshWebFullscreenLayout();
            window.dispatchEvent(new Event('resize'));
            requestAnimationFrame(refreshWebFullscreenLayout);
            return true;
        } catch (err) {
            log('warn', `网页全屏内切换原生全屏失败: ${err.name}: ${err.message}`);
            return false;
        }
    }
    async function toggleWebFullscreen() {
        ensureWebFullscreenStyle();
        const allVideos = findVideosDeep().filter(v => v.readyState >= 2);
        if (allVideos.length === 0) return;
        let video = allVideos.find(v => !v.paused) || allVideos[0];
        if (!video) return;
        const container = findPlayerContainer(video);
        if (webFullscreenSession?.video === video) {
            await exitWebFullscreen();
            return;
        }
        if (webFullscreenSession && !await exitWebFullscreen()) return;
        document.body.classList.add('pip-web-fs-active');
        // 云导播的弹幕与统一音量控件是内部播放器的兄弟节点。
        // 保留原 DOM 位置，以维持 .cloud-director 的样式和鼠标事件冒泡。
        const liveContainer = CONFIG.isMgtv ? video.closest('#cloud-director-container') : null;
        if (liveContainer) {
            const previousStyle = liveContainer.getAttribute('style');
            liveContainer.classList.add('pip-web-fs-player');
            webFullscreenSession = {
                video,
                container: liveContainer,
                previousStyle,
                chain: [],
                mode: 'inplace'
            };
            window.dispatchEvent(new Event('resize'));
            log('info', '进入网页全屏 (芒果直播完整容器原位模式)');
            return;
        }
        if (container) {
            const previousStyle = container.getAttribute('style');
            const previousVideoStyle = video.getAttribute('style');
            const parent = container.parentNode;
            if (!parent) return;
            const anchor = document.createElement('div');
            anchor.className = 'pip-web-fullscreen-anchor';
            const overlay = document.createElement('div');
            overlay.className = 'pip-web-fullscreen-container';
            const chain = buildFullscreenChain(video, container);
            parent.insertBefore(anchor, container);
            container.classList.add('pip-web-fs-player');
            overlay.appendChild(container);
            document.body.appendChild(overlay);
            video.style.setProperty('width', '100%', 'important');
            video.style.setProperty('height', '100%', 'important');
            video.style.setProperty('max-width', '100vw', 'important');
            video.style.setProperty('max-height', '100vh', 'important');
            window.dispatchEvent(new Event('resize'));
            webFullscreenSession = {
                video,
                container,
                anchor,
                overlay,
                previousStyle,
                previousVideoStyle,
                chain,
                mode: 'container-overlay'
            };
            log('info', '进入网页全屏 (播放器容器覆盖层模式)');
        } else {
            const parent = video.parentNode;
            if (!parent) return;
            const anchor = document.createElement('div');
            anchor.className = 'pip-web-fullscreen-anchor';
            const overlay = document.createElement('div');
            overlay.className = 'pip-web-fullscreen-container';
            const previousInlineStyle = video.getAttribute('style');
            parent.insertBefore(anchor, video);
            overlay.appendChild(video);
            document.body.appendChild(overlay);
            video.style.removeProperty('max-width');
            video.style.removeProperty('max-height');
            video.style.removeProperty('width');
            video.style.removeProperty('height');
            webFullscreenSession = {
                video,
                anchor,
                overlay,
                previousInlineStyle,
                mode: 'overlay'
            };
            log('info', '进入网页全屏 (覆盖层模式)');
        }
    }

    function isEditableTarget(event) {
        const target = event.target;
        const editableSelector = [
            'input',
            'textarea',
            '[contenteditable=""]',
            '[contenteditable="true"]',
            '[role="textbox"]',
            'bili-comment-rich-textarea',
            '.ql-editor',
            '.reply-box-textarea',
            '.bili-rich-textarea',
            '.brt-editor',
            '.brt-root'
        ].join(',');
        const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
        const isBiliCommentEditor = node => node instanceof Element &&
            node.matches('#editor.active') &&
            !!node.querySelector?.('bili-comment-rich-textarea');
        const closestBiliCommentEditor = node => {
            const editor = node instanceof Element ? node.closest('#editor.active') : null;
            return !!editor?.querySelector?.('bili-comment-rich-textarea');
        };
        if (path.some(isBiliCommentEditor)) return true;
        if (path.some(node => node instanceof Element && (node.matches(editableSelector) || node.isContentEditable))) return true;
        if (!(target instanceof Element)) return false;
        const active = document.activeElement;
        return !!target.closest(editableSelector) ||
            closestBiliCommentEditor(target) ||
            !!active?.closest?.(editableSelector) ||
            closestBiliCommentEditor(active);
    }
    document.addEventListener('keydown', (e) => {
        if (CONFIG.minimalMode) return;
        if (isEditableTarget(e)) return;
        const key = e.key.toLowerCase();
        // 支持按 ESC 退出网页全屏
        if (key === 'escape' && document.body.classList.contains('pip-web-fs-active')) {
            exitWebFullscreen();
            return;
        }
        if (key === 'f' && webFullscreenSession) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleNativeFullscreenFromWebFullscreen();
            return;
        }
        if (key === 'p' || key === 'q') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (key === 'p') toggleManualPiP();
            else if (key === 'q') toggleWebFullscreen();
        }
    }, true);
    document.addEventListener('fullscreenchange', () => {
        if (!webFullscreenSession) return;
        refreshWebFullscreenLayout();
        window.dispatchEvent(new Event('resize'));
        requestAnimationFrame(refreshWebFullscreenLayout);
    });
    window.addEventListener('resize', () => {
        if (!webFullscreenSession) return;
        requestAnimationFrame(refreshWebFullscreenLayout);
    });
    let scanTimeout = null;
    const observer = new MutationObserver(mutations => {
        if (dynamicObserverStopped) return;
        let hasPotentialNodes = false;
        mutations.forEach(m => m.addedNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.tagName === 'VIDEO') {
                setupVideo(node);
            } else if (node.shadowRoot || node.querySelector?.('video')) {
                hasPotentialNodes = true;
            }
        }));
        // 防抖：如果有很多节点被连续插入(例如信息流滚动)，只在最后一次性整体扫描
        // 从而避免 TreeWalker 陷入深渊级的重度算力消耗
        if (hasPotentialNodes) {
            if (scanTimeout) clearTimeout(scanTimeout);
            scanTimeout = setTimeout(() => {
                scanVideos(); // 仅在新增节点可能含视频时全局重扫，避免播放器控件高频 DOM 更新拖慢播放
                scanTimeout = null;
            }, 800);
        }
    });

    function isDirectChildWindow(source) {
        for (let index = 0; index < window.frames.length; index += 1) {
            if (window.frames[index] === source) return true;
        }
        return false;
    }

    function sendBrowserChromeGuardState(target, active = pointerInBrowserChrome) {
        try {
            target.postMessage({
                type: BROWSER_CHROME_GUARD_MESSAGE,
                active
            }, '*');
        } catch (err) {}
    }

    function setBrowserChromeGuardState(active) {
        if (pointerInBrowserChrome === active) return;
        pointerInBrowserChrome = active;
        // 每层 frame 只向直接子 frame 转发，从而覆盖任意深度和跨域的播放器。
        for (let index = 0; index < window.frames.length; index += 1) {
            sendBrowserChromeGuardState(window.frames[index], active);
        }
    }
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || data.type !== BROWSER_CHROME_GUARD_MESSAGE) return;
        if (data.request === true) {
            if (isDirectChildWindow(event.source)) {
                sendBrowserChromeGuardState(event.source);
            }
            return;
        }
        // 子 frame 只接受直接父 frame 同步的状态，避免页面内其他 frame 伪造保护信号。
        if (window !== window.top && event.source === window.parent && typeof data.active === 'boolean') {
            setBrowserChromeGuardState(data.active);
        }
    }, true);
    if (window === window.top) {
        // 只有顶层页面的顶边才通往浏览器 UI；iframe 顶边不能作为判定信号。
        // 必须早于 blur 监听器安装，以覆盖 DOMContentLoaded 之前点击扩展的场景。
        window.addEventListener('mouseout', (e) => {
            if (e.relatedTarget === null && e.clientY <= 0) {
                setBrowserChromeGuardState(true);
                log('debug', '鼠标从页面顶部离开，启用浏览器 UI 失焦保护。');
            }
        }, true);
        window.addEventListener('mouseover', () => {
            setBrowserChromeGuardState(false);
        }, true);
    } else {
        // 动态创建的 frame 可能错过之前的广播，加载时向父 frame 请求当前状态。
        try {
            window.parent.postMessage({
                type: BROWSER_CHROME_GUARD_MESSAGE,
                request: true
            }, '*');
        } catch (err) {}
    }
    window.addEventListener('blur', () => {
        if (CONFIG.shortcutsOnlyMode) return;
        if (CONFIG.minimalMode) return;
        if (!CONFIG.autoPiPOnWindowBlur) {
            log('debug', '已关闭窗口失焦自动画中画，忽略 blur。');
            return;
        }
        if (pointerInBrowserChrome) {
            log('debug', '鼠标位于浏览器工具栏，忽略扩展弹窗或浏览器 UI 导致的 blur。');
            return;
        }
        const activation = getActivationState();
        log('info', `>>> blur 触发! enabled=${CONFIG.enabled}, pipEl=${!!document.pictureInPictureElement}, hidden=${document.hidden}, hasFocus=${document.hasFocus()}, activeEl=${document.activeElement?.tagName}, iframePending=${iframeBlurPending}, activation=${activation.isActive}/${activation.hasBeenActive}, everInteracted=${hasEverInteracted}`);
        if (!CONFIG.enabled || document.pictureInPictureElement || getActiveDocumentPiPWindowAcrossSameOriginFrames() || document.hidden) {
            log('debug', '前置条件不满足，跳过。');
            return;
        }
        // 防御1：焦点转移到页内 iframe
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
            log('debug', '焦点转移到了 iframe 内部，属于页内交互，忽略失焦。');
            return;
        }
        // 防御2：刚刚点击了 iframe/embed/object 元素导致的 blur
        if (iframeBlurPending) {
            iframeBlurPending = false;
            log('debug', '检测到 iframe 点击导致的失焦，忽略。');
            return;
        }
        // 直接同步尝试触发画中画
        const allVideos = findVideosDeep();
        const playing = allVideos.find(v => !v.paused && v.readyState >= 1);
        log('info', `>>> 视频搜索: 总数=${allVideos.length}, 播放中=${playing ? 'YES readyState=' + playing.readyState : 'NO'}, cooldown剩余=${Math.max(0, ACTION_COOLDOWN - (Date.now() - lastActionTime))}ms`);
        if (playing) {
            enterPiP(playing, '窗口失焦');
        } else {
            setTimeout(() => {
                if (!document.hasFocus() && !document.hidden && !document.pictureInPictureElement) {
                    const retryPlaying = findVideosDeep().find(v => !v.paused && v.readyState >= 1);
                    log('info', `>>> 延迟重试: 播放中=${retryPlaying ? 'YES' : 'NO'}`);
                    if (retryPlaying) enterPiP(retryPlaying, '窗口失焦(延迟重试)');
                }
            }, 500);
        }
    });
    window.addEventListener('focus', () => {
        if (CONFIG.shortcutsOnlyMode) return;
        if (CONFIG.minimalMode) return;
        if (!CONFIG.enabled) return;
        if (!CONFIG.conservativePiPRearm) scheduleNativeAutoPiPRearm('页面重新聚焦');
        if (lastPipVideo && lastPipVideo.isConnected) {
            refreshVideoRendering(lastPipVideo);
            setTimeout(() => refreshVideoRendering(lastPipVideo), 120);
            lastPipVideo = null;
        }
        scheduleReturnToPageExit(260);
    });
    document.addEventListener('visibilitychange', () => {
        if (CONFIG.shortcutsOnlyMode) return;
        if (CONFIG.minimalMode) {
            return;
        }
        if (!CONFIG.enabled) return;
        if (!CONFIG.conservativePiPRearm) scheduleNativeAutoPiPRearm(document.hidden ? '页面隐藏' : '页面恢复可见');
        if (!document.hidden) {
            if (lastPipVideo && lastPipVideo.isConnected) {
                refreshVideoRendering(lastPipVideo);
                setTimeout(() => refreshVideoRendering(lastPipVideo), 120);
                lastPipVideo = null;
            }
            log('info', '检测到页面恢复可见, 安排退出画中画...');
            scheduleReturnToPageExit();
        }
    });
    document.addEventListener('leavepictureinpicture', (event) => {
        if (CONFIG.shortcutsOnlyMode) return;
        if (CONFIG.minimalMode) return;
        const video = event.target;
        const wasNativeAutoPiP = nativeAutoPiPVideo === video;
        if (wasNativeAutoPiP) nativeAutoPiPVideo = null;
        if (nativeAutoPiPFallbackExitTimer) {
            clearTimeout(nativeAutoPiPFallbackExitTimer);
            nativeAutoPiPFallbackExitTimer = null;
        }
        lastPipVideo = video;
        if (returnToPageTimer) {
            clearTimeout(returnToPageTimer);
            returnToPageTimer = null;
        }
        if (video instanceof HTMLVideoElement) {
            if (!CONFIG.conservativePiPRearm) {
                enforceNativeAutoPiP(video);
                scheduleNativeAutoPiPRearm('退出画中画');
            }
            refreshVideoRendering(video);
            setTimeout(() => refreshVideoRendering(video), 120);
        }
    }, true);
    document.addEventListener('enterpictureinpicture', (event) => {
        if (CONFIG.shortcutsOnlyMode) return;
        if (CONFIG.minimalMode) return;
        const video = event.target;
        if (video instanceof HTMLVideoElement && document.hidden) {
            nativeAutoPiPVideo = video;
            log('debug', '记录到原生自动画中画会话');
        }
    }, true);

    function init() {
        log('info', `脚本已加载 v4.13.33 [${window.self === window.top ? 'Main' : 'Iframe'}]`);
        if (CONFIG.isMgtv) log('info', '检测到 MGTV, 已应用增强兼容性配置。');
        installDocumentPiPShortcutBridge();
        if (!CONFIG.shortcutsOnlyMode) {
            installMediaSessionAutoPiPHandler();
            scanVideos();
            if (!dynamicObserverStopped) observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        if (!CONFIG.shortcutsOnlyMode && !CONFIG.minimalMode) {
            // 支持触控设备，涵盖鼠标与触摸(iPad等)
            document.addEventListener('pointerdown', (e) => {
                hasEverInteracted = true;
                // 点击 iframe/embed/object 可能导致窗口 blur，设置标记以忽略该次 blur
                if (e.target && (e.target.tagName === 'IFRAME' || e.target.tagName === 'EMBED' || e.target.tagName === 'OBJECT')) {
                    iframeBlurPending = true;
                    setTimeout(() => {
                        iframeBlurPending = false;
                    }, 500);
                    log('info', `记录到页面交互（iframe/嵌入元素点击），activation=${getActivationState().isActive}/${getActivationState().hasBeenActive}`);
                } else {
                    log('info', `记录到页面交互，activation=${getActivationState().isActive}/${getActivationState().hasBeenActive}`);
                }
            }, true);
        }
    }
    if (!CONFIG.shortcutsOnlyMode) {
        hookMediaSessionSetActionHandler();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();