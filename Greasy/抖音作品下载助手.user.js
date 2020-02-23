// ==UserScript==
// @name			抖音作品下载助手
// @version			2026101920
// @connect			*
// @match			*://*.douyin.com/*
// @require			https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.umd.js#sha256=62c4ffea400078c0eda7f435b22726b4961ebdf74c8506f188e92bec41d8ac51
// @grant			GM_addValueChangeListener
// @grant			GM_deleteValue
// @grant			GM_download
// @grant			GM_getValue
// @grant			GM_setClipboard
// @grant			GM_setValue
// @grant			GM_xmlhttpRequest
// @grant			unsafeWindow
// @noframes
// @icon			https://raw.githubusercontent.com/Anonymousnl/Rules/master/Greasy/Icons/douyin.png
// @run-at			document-start
// @downloadURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%8A%96%E9%9F%B3%E4%BD%9C%E5%93%81%E4%B8%8B%E8%BD%BD%E5%8A%A9%E6%89%8B.user.js
// @updateURL		https://github.com/Anonymousnl/Rules/raw/master/Greasy/%E6%8A%96%E9%9F%B3%E4%BD%9C%E5%93%81%E4%B8%8B%E8%BD%BD%E5%8A%A9%E6%89%8B.user.js
// ==/UserScript==
(function() {
    const APP = Object.freeze({
        name: "DouYinX",
        version: "1.2.4",
        logPrefix: "[DouYinX]",
    });
    const NativeURL = globalThis.URL;
    const nativeFetch =
        typeof globalThis.fetch === "function" ?
        globalThis.fetch.bind(globalThis) :
        null;
    const uiRuntime = (() => {
        const runtime = globalThis.htmPreact;
        if (!runtime) return null;
        const {
            html,
            render,
            useEffect,
            useMemo,
            useRef,
            useState
        } = runtime;
        if (
            typeof html !== "function" ||
            typeof render !== "function" ||
            typeof useEffect !== "function" ||
            typeof useMemo !== "function" ||
            typeof useRef !== "function" ||
            typeof useState !== "function"
        ) {
            return null;
        }
        return Object.freeze({
            html,
            render,
            useEffect,
            useMemo,
            useRef,
            useState,
        });
    })();
    const parseJson = globalThis.JSON.parse;
    const stringifyJson = globalThis.JSON.stringify;
    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    const UNSAFE_OBJECT_KEYS = new Set([
        "__proto__",
        "prototype",
        "constructor",
    ]);

    function isPlainObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            Object.getPrototypeOf(value) === Object.prototype
        );
    }

    function deepMerge(base, incoming) {
        const output = isPlainObject(base) ? {
            ...base
        } : base;
        if (!isPlainObject(output) || !isPlainObject(incoming)) return output;
        for (const [key, value] of Object.entries(incoming)) {
            if (UNSAFE_OBJECT_KEYS.has(key)) continue;
            output[key] =
                isPlainObject(value) && isPlainObject(output[key]) ?
                deepMerge(output[key], value) :
                value;
        }
        return output;
    }

    function clamp(value, min, max) {
        const number = Number(value);
        if (!Number.isFinite(number)) return min;
        return Math.min(max, Math.max(min, number));
    }

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function uniqueStrings(values) {
        return Array.from(
            new Set(
                values.filter((value) => typeof value === "string" && value.trim()),
            ),
        );
    }

    function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
        const safeDate =
            date instanceof Date && !Number.isNaN(date.valueOf()) ?
            date :
            new Date(0);
        const values = {
            YYYY: safeDate.getFullYear(),
            MM: String(safeDate.getMonth() + 1).padStart(2, "0"),
            DD: String(safeDate.getDate()).padStart(2, "0"),
            HH: String(safeDate.getHours()).padStart(2, "0"),
            mm: String(safeDate.getMinutes()).padStart(2, "0"),
            ss: String(safeDate.getSeconds()).padStart(2, "0"),
        };
        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => values[token]);
    }

    function resolvePath(source, path) {
        return String(path)
            .split(".")
            .reduce((value, key) => {
                if (
                    value == null ||
                    UNSAFE_OBJECT_KEYS.has(key) ||
                    !Object.prototype.hasOwnProperty.call(Object(value), key)
                ) {
                    return undefined;
                }
                return value[key];
            }, source);
    }

    function renderFilenameTemplate(template, context) {
        let source = String(template || "").trim();
        if (source.startsWith("`") && source.endsWith("`")) {
            source = source.slice(1, -1);
        }
        return source.replace(
            /\$\{([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\}/g,
            (_, path) => {
                const value = resolvePath(context, path);
                return value == null ? "" : String(value);
            },
        );
    }

    function utf8ByteLength(value) {
        let bytes = 0;
        for (const symbol of Array.from(String(value || ""))) {
            const point = symbol.codePointAt(0);
            bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
        }
        return bytes;
    }

    function truncateUtf8(value, maxBytes) {
        let bytes = 0;
        let output = "";
        for (const symbol of Array.from(String(value || ""))) {
            const point = symbol.codePointAt(0);
            const size =
                point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
            if (bytes + size > maxBytes) break;
            output += symbol;
            bytes += size;
        }
        return output;
    }

    function normalizeFilename(name, options = {}) {
        const maxLength = Math.floor(clamp(options.maxLength ?? 180, 12, 240));
        const maxBytes = Math.floor(clamp(options.maxBytes ?? 240, 64, 255));
        let replacementChar = String(options.replacementChar ?? "_").slice(0, 1);
        if (!replacementChar || /[\\/:*?"<>|\x00-\x1f\x7f]/.test(replacementChar)) {
            replacementChar = "_";
        }
        const input =
            typeof name === "string" ?
            name
            .normalize("NFC")
            .replace(/[\u200b\u200e\u200f\u202a-\u202e\u2060-\u2069\ufeff]/giu, "") :
            "";
        const lastDot = input.lastIndexOf(".");
        const hasExtension =
            lastDot > 0 && lastDot < input.length - 1 && input.length - lastDot <= 12;
        let extension = hasExtension ?
            input.slice(lastDot).replace(/[\\/:*?"<>|\s]/g, "") :
            "";
        let baseName = hasExtension ? input.slice(0, lastDot) : input;
        baseName = baseName
            .replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g, replacementChar)
            .replace(/\s+/g, " ")
            .trim()
            .replace(/^[.\s]+|[.\s]+$/g, "");
        const repeatedReplacement = new RegExp(
            escapeRegExp(replacementChar) + "{2,}",
            "g",
        );
        baseName = baseName.replace(repeatedReplacement, replacementChar);
        const edgeReplacement = new RegExp(
            "^" + escapeRegExp(replacementChar) + "+|" + escapeRegExp(replacementChar) + "+$",
            "g",
        );
        baseName = baseName.replace(edgeReplacement, "");
        if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(baseName)) {
            baseName = replacementChar + baseName;
        }
        if (!baseName) baseName = "douyinx";
        if (extension.length >= maxLength) {
            extension = extension.slice(0, Math.max(0, maxLength - 1));
        }
        const maxBaseLength = Math.max(1, maxLength - extension.length);
        if (Array.from(baseName).length > maxBaseLength) {
            baseName = Array.from(baseName).slice(0, maxBaseLength).join("");
        }
        const maxBaseBytes = Math.max(1, maxBytes - utf8ByteLength(extension));
        if (utf8ByteLength(baseName) > maxBaseBytes) {
            baseName = truncateUtf8(baseName, maxBaseBytes);
        }
        if (!baseName) baseName = "douyinx";
        return baseName + extension;
    }

    function isH265Variant(variant) {
        const fields = [
                variant?.gearName,
                variant?.videoFormat,
                variant?.format,
                variant?.codecType,
                variant?.codec_type,
            ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return (
            variant?.isH265 === 1 ||
            variant?.isH265 === true ||
            fields.includes("h265") ||
            fields.includes("hevc") ||
            fields.includes("hvc1")
        );
    }

    function variantUrls(variant) {
        if (!variant) return [];
        const addresses = Array.isArray(variant.playAddr) ? variant.playAddr : [];
        return uniqueStrings([
            variant.playApi,
            ...addresses.map((address) =>
                typeof address === "string" ? address : address?.src,
            ),
        ]);
    }

    function variantQualityHeight(variant) {
        const width = Number(variant?.width || 0);
        const height = Number(variant?.height || 0);
        if (width > 0 && height > 0) return Math.min(width, height);
        return height > 0 ? height : width > 0 ? width : 0;
    }

    function collectImageUrls(imageItem) {
        if (!imageItem) return [];
        const preferred = Array.isArray(imageItem.urlList) ? imageItem.urlList : [];
        const originals = Array.isArray(imageItem.downloadUrlList) ?
            imageItem.downloadUrlList : [];
        return uniqueStrings([...preferred, ...originals]);
    }

    function selectVideoVariants(
        video,
        mode = "max",
        codecPreference = "default",
    ) {
        if (!video) return [];
        const allRates = Array.isArray(video.bitRateList) ? video.bitRateList : [];
        const progressive = allRates.filter(
            (item) => String(item?.format || "").toLowerCase() !== "dash",
        );
        let candidates = progressive.length ? progressive : allRates;
        const directH264 = uniqueStrings([
            video.playApi,
            ...(Array.isArray(video.playAddr) ?
                video.playAddr.map((address) =>
                    typeof address === "string" ? address : address?.src,
                ) : []),
        ]);
        const directH265 = uniqueStrings([
            video.playApiH265,
            ...(Array.isArray(video.playAddrH265) ?
                video.playAddrH265.map((address) =>
                    typeof address === "string" ? address : address?.src,
                ) : []),
        ]);
        let preferredDirect = [];
        let codecFallbackCandidates = [];
        let codecFallbackDirect = [];
        if (codecPreference !== "default") {
            const wantsH265 = codecPreference.includes("h265");
            const prefersCodec = codecPreference.endsWith("_prefer");
            const matches = candidates.filter(
                (item) => isH265Variant(item) === wantsH265,
            );
            if (matches.length) {
                if (prefersCodec) {
                    codecFallbackCandidates = candidates.filter(
                        (item) => isH265Variant(item) !== wantsH265,
                    );
                    codecFallbackDirect = wantsH265 ? directH264 : directH265;
                }
                candidates = matches;
            } else {
                const directFallback = wantsH265 ? directH265 : directH264;
                if (!prefersCodec) return directFallback;
                preferredDirect = [
                    ...directFallback,
                    ...(wantsH265 ? directH264 : directH265),
                ];
            }
        }
        const area = (item) => Number(item?.width || 0) * Number(item?.height || 0);
        const fileSize = (item) => Number(item?.dataSize || item?.size || 0);
        const bitRate = (item) => Number(item?.bitRate || item?.bitrate || 0);
        const sortCandidates = (items) => [...items].sort((a, b) => {
            if (area(a) !== area(b)) return area(b) - area(a);
            if (fileSize(a) !== fileSize(b)) return fileSize(b) - fileSize(a);
            return bitRate(b) - bitRate(a);
        });
        const sorted = sortCandidates(candidates);
        const sortedCodecFallback = sortCandidates(codecFallbackCandidates);
        if (mode === "default") {
            const defaultUrls = [...preferredDirect];
            if (
                codecPreference === "default" ||
                codecPreference.includes("h264")
            ) {
                defaultUrls.push(...directH264);
            }
            if (
                codecPreference === "default" ||
                codecPreference.includes("h265")
            ) {
                defaultUrls.push(...directH265);
            }
            defaultUrls.push(...sorted.flatMap(variantUrls));
            defaultUrls.push(...codecFallbackDirect);
            defaultUrls.push(...sortedCodecFallback.flatMap(variantUrls));
            return uniqueStrings(defaultUrls);
        }
        if (sorted.length > 1) {
            let targetValue = null;
            let valueOf = null;
            if (mode === "max") {
                valueOf = area;
                targetValue = Math.max(...sorted.map(valueOf));
            } else if (mode === "min") {
                valueOf = area;
                targetValue = Math.min(...sorted.map(valueOf));
            } else if (mode === "max_file") {
                valueOf = fileSize;
                targetValue = Math.max(...sorted.map(valueOf));
            } else if (mode === "min_file") {
                valueOf = fileSize;
                targetValue = Math.min(...sorted.map(valueOf));
            } else {
                const targetHeights = {
                    "4K": 2160,
                    "2K": 1440,
                    "1080P": 1080,
                    "720P": 720,
                    "540P": 540,
                    "360P": 360,
                };
                const targetHeight = targetHeights[mode];
                if (targetHeight) {
                    const lowerHeights = sorted
                        .map(variantQualityHeight)
                        .filter((height) => height > 0 && height <= targetHeight);
                    const availableHeights = sorted
                        .map(variantQualityHeight)
                        .filter((height) => height > 0);
                    if (availableHeights.length) {
                        const selectedHeight = lowerHeights.length ?
                            Math.max(...lowerHeights) :
                            Math.min(...availableHeights);
                        candidates = sorted.filter(
                            (item) => variantQualityHeight(item) === selectedHeight,
                        );
                    }
                }
            }
            if (valueOf && targetValue !== null) {
                candidates = sorted.filter((item) => valueOf(item) === targetValue);
            }
        } else {
            candidates = sorted;
        }
        const selectedUrls = [
            ...preferredDirect,
            ...candidates.flatMap(variantUrls),
        ];
        if (codecPreference === "default" || codecPreference.includes("h264")) {
            selectedUrls.push(...directH264);
        }
        if (codecPreference === "default" || codecPreference.includes("h265")) {
            selectedUrls.push(...directH265);
        }
        selectedUrls.push(...codecFallbackDirect);
        selectedUrls.push(...sortedCodecFallback.flatMap(variantUrls));
        return uniqueStrings(selectedUrls);
    }

    function normalizeHttpUrl(value) {
        if (typeof value !== "string" || !value.trim()) return "";
        try {
            const url = new NativeURL(value, "https://www.douyin.com/");
            return url.protocol === "http:" || url.protocol === "https:" ?
                url.href :
                "";
        } catch {
            return "";
        }
    }
    const MEDIA_HOST_ROOTS = Object.freeze([
        "douyin.com",
        "douyinpic.com",
        "douyinvod.com",
        "idouyinvod.com",
        "douyincdn.com",
        "douyinstatic.com",
        "zjcdn.com",
        "byteimg.com",
        "snssdk.com",
    ]);

    function normalizeMediaUrl(value) {
        const normalized = normalizeHttpUrl(value);
        if (!normalized) return "";
        try {
            const url = new NativeURL(normalized);
            if (url.protocol !== "https:") return "";
            const hostname = url.hostname.toLowerCase();
            if (!MEDIA_HOST_ROOTS.some(
                    (root) => hostname === root || hostname.endsWith("." + root),
                )) {
                return "";
            }
            url.username = "";
            url.password = "";
            return url.href;
        } catch {
            return "";
        }
    }

    function normalizeDouyinPageUrl(value) {
        const normalized = normalizeHttpUrl(value);
        if (!normalized) return "";
        try {
            const url = new NativeURL(normalized);
            const hostname = url.hostname.toLowerCase();
            if (
                url.protocol !== "https:" ||
                (hostname !== "douyin.com" && !hostname.endsWith(".douyin.com"))
            ) {
                return "";
            }
            url.username = "";
            url.password = "";
            return url.href;
        } catch {
            return "";
        }
    }

    function isLoopbackUrl(value) {
        try {
            const hostname = new NativeURL(value).hostname.toLowerCase();
            return (
                hostname === "localhost" ||
                hostname === "127.0.0.1" ||
                hostname === "[::1]" ||
                hostname === "::1"
            );
        } catch {
            return false;
        }
    }

    function safeJsonStringify(value, space = 2) {
        const seen = new WeakSet();
        try {
            return (
                stringifyJson(
                    value,
                    (_, item) => {
                        if (typeof item === "bigint") return String(item);
                        if (item && typeof item === "object") {
                            if (seen.has(item)) return "[循环引用]";
                            seen.add(item);
                        }
                        return item;
                    },
                    space,
                ) || ""
            );
        } catch {
            return "无法读取作品数据";
        }
    }

    function createAbortError(message = "操作已取消") {
        const error = new Error(message);
        error.name = "AbortError";
        return error;
    }

    function isAbortError(error) {
        return error?.name === "AbortError";
    }

    function snapshotMedia(media) {
        if (!media || typeof media !== "object") return null;
        try {
            if (typeof structuredClone === "function") return structuredClone(media);
        } catch {
            // Page proxies and functions are handled by the serializable fallback.
        }
        try {
            const parsed = parseJson(safeJsonStringify(media, 0));
            if (parsed && typeof parsed === "object") return parsed;
        } catch {
            // Fall through to the minimal immutable download identity.
        }
        return {
            awemeId: String(media.awemeId || ""),
            groupId: String(media.groupId || ""),
            createTime: Number(media.createTime || 0),
            desc: String(media.desc || ""),
            authorUserId: String(media.authorUserId || ""),
            authorInfo: {
                uid: String(media.authorInfo?.uid || ""),
                nickname: String(media.authorInfo?.nickname || ""),
            },
            shareInfo: {
                shareUrl: normalizeDouyinPageUrl(media.shareInfo?.shareUrl),
            },
            textExtra: [],
            images: [],
            video: null,
        };
    }
    const eventTrustGetter = (() => {
        if (typeof Event !== "function") return null;
        try {
            const probe = new Event("dyx-trust-probe");
            return getOwnPropertyDescriptor(probe, "isTrusted")?.get || null;
        } catch {
            return null;
        }
    })();
    const eventComposedPath = (() => {
        if (typeof Event !== "function") return null;
        try {
            const method = getOwnPropertyDescriptor(
                Event.prototype,
                "composedPath",
            )?.value;
            return typeof method === "function" ? method : null;
        } catch {
            return null;
        }
    })();
    const eventCurrentTargetGetter = (() => {
        if (typeof Event !== "function") return null;
        try {
            return (
                getOwnPropertyDescriptor(Event.prototype, "currentTarget")?.get ||
                null
            );
        } catch {
            return null;
        }
    })();
    const eventDefaultPreventedGetter = (() => {
        if (typeof Event !== "function") return null;
        try {
            return (
                getOwnPropertyDescriptor(Event.prototype, "defaultPrevented")?.get ||
                null
            );
        } catch {
            return null;
        }
    })();
    const keyboardEventGetters = (() => {
        if (typeof KeyboardEvent !== "function") return null;
        try {
            const getters = {};
            for (const name of ["key", "repeat", "metaKey", "ctrlKey", "altKey"]) {
                const getter = getOwnPropertyDescriptor(
                    KeyboardEvent.prototype,
                    name,
                )?.get;
                if (typeof getter !== "function") return null;
                getters[name] = getter;
            }
            return Object.freeze(getters);
        } catch {
            return null;
        }
    })();

    function isTrustedEvent(event) {
        if (!event || typeof eventTrustGetter !== "function") return false;
        try {
            return eventTrustGetter.call(event) === true;
        } catch {
            return false;
        }
    }

    function getEventCurrentTarget(event) {
        if (!event || typeof eventCurrentTargetGetter !== "function") return null;
        try {
            return eventCurrentTargetGetter.call(event);
        } catch {
            return null;
        }
    }

    function getKeyboardEventState(event) {
        if (
            !keyboardEventGetters ||
            typeof eventDefaultPreventedGetter !== "function"
        ) {
            return null;
        }
        try {
            return {
                key: keyboardEventGetters.key.call(event),
                repeat: keyboardEventGetters.repeat.call(event),
                metaKey: keyboardEventGetters.metaKey.call(event),
                ctrlKey: keyboardEventGetters.ctrlKey.call(event),
                altKey: keyboardEventGetters.altKey.call(event),
                defaultPrevented: eventDefaultPreventedGetter.call(event),
            };
        } catch {
            return null;
        }
    }

    function isTrustedEventFor(event, currentTarget) {
        return (
            isTrustedEvent(event) &&
            getEventCurrentTarget(event) === currentTarget &&
            Boolean(currentTarget?.isConnected || currentTarget === document)
        );
    }

    function isTrustedDialogEvent(event, currentTarget) {
        const overlay = Dialog.active?.overlay;
        if (
            !overlay ||
            !isTrustedEventFor(event, currentTarget) ||
            typeof eventComposedPath !== "function"
        ) {
            return false;
        }
        try {
            let includesTarget = false;
            let includesOverlay = false;
            for (const item of eventComposedPath.call(event)) {
                if (item === currentTarget) includesTarget = true;
                if (item === overlay) includesOverlay = true;
            }
            return includesTarget && includesOverlay;
        } catch {
            return false;
        }
    }
    const LEGACY_DEFAULT_FILENAME_TEMPLATE =
        "`\${nickname}_\${short_id}_\${tags}_\${desc}`";
    const DEFAULT_FEATURES = Object.freeze({
        download_video_mode: "max",
        video_download_codecs: "default",
        filename_template: "\${nickname}_\${desc}_\${create_date_YYYYMMDD}",
        filename_max_length: 96,
        image_convert_codecs: "default",
        image_resize_codecs: "default",
        image_quality: 88,
        using_downloader: "browser",
        downloader_config: {
            browser: {},
            abdm: {
                domain: "http://localhost",
                port: "15151",
                dir: {
                    video: "`./douyin/\${user_dir}/videos`",
                    image: "`./douyin/\${user_dir}/images`",
                    other: "`./douyin/\${user_dir}/others`",
                },
            },
            aria2: {
                domain: "http://localhost",
                port: "6800",
                path: "/jsonrpc",
                dir: {
                    video: "`./douyin/\${user_dir}/videos`",
                    image: "`./douyin/\${user_dir}/images`",
                    other: "`./douyin/\${user_dir}/others`",
                },
            },
        },
    });

    function cloneFeatures(value = DEFAULT_FEATURES) {
        return parseJson(stringifyJson(value));
    }

    function scrubStoredSecrets(value) {
        if (typeof value !== "string") return value;
        const isWhitespace = (character) =>
            character === " " ||
            character === "\n" ||
            character === "\r" ||
            character === "\t";
        const isTokenKeyAt = (index) =>
            value[index] === '"' &&
            value[index + 1] === "t" &&
            value[index + 2] === "o" &&
            value[index + 3] === "k" &&
            value[index + 4] === "e" &&
            value[index + 5] === "n" &&
            value[index + 6] === '"';
        let output = "";
        let index = 0;
        while (index < value.length) {
            if (!isTokenKeyAt(index)) {
                output += value[index];
                index += 1;
                continue;
            }
            let cursor = index + 7;
            while (isWhitespace(value[cursor])) cursor += 1;
            if (value[cursor] !== ":") {
                output += value[index];
                index += 1;
                continue;
            }
            cursor += 1;
            while (isWhitespace(value[cursor])) cursor += 1;
            if (value[cursor] !== '"') {
                output += value[index];
                index += 1;
                continue;
            }
            cursor += 1;
            while (cursor < value.length) {
                if (value[cursor] === "\\") {
                    cursor += 2;
                    continue;
                }
                if (value[cursor] === '"') {
                    cursor += 1;
                    break;
                }
                cursor += 1;
            }
            output += '"token":""';
            index = cursor;
        }
        return output;
    }
    const storage = Object.freeze({
        read(key, options = {}) {
            try {
                if (typeof GM_getValue === "function") {
                    const secured = GM_getValue(key, null);
                    if (secured !== null && secured !== undefined) {
                        let legacyValue = null;
                        try {
                            legacyValue = localStorage.getItem(key);
                        } catch {
                            // The userscript store remains readable without page storage.
                        }
                        return {
                            value: secured,
                            source: "userscript",
                            legacyValue
                        };
                    }
                    const legacy = localStorage.getItem(key);
                    if (
                        legacy !== null &&
                        options.migrate !== false &&
                        typeof GM_setValue === "function"
                    ) {
                        GM_setValue(key, legacy);
                        localStorage.removeItem(key);
                    }
                    return {
                        value: legacy,
                        source: legacy === null ? "none" : "legacy",
                    };
                }
                const fallback = localStorage.getItem(key);
                return {
                    value: fallback,
                    source: fallback === null ? "none" : "fallback",
                };
            } catch (error) {
                console.warn(APP.logPrefix, "存储读取失败", error);
                return {
                    value: null,
                    source: "none"
                };
            }
        },
        set(key, value) {
            if (typeof GM_setValue === "function") {
                GM_setValue(key, value);
                try {
                    localStorage.removeItem(key);
                } catch {
                    // Ignore cleanup failures after a successful secure write.
                }
                return;
            }
            localStorage.setItem(key, value);
        },
        remove(key) {
            let removed = false;
            if (typeof GM_deleteValue === "function") {
                GM_deleteValue(key);
                removed = true;
            }
            try {
                localStorage.removeItem(key);
                removed = true;
            } catch (error) {
                if (!removed) throw error;
            }
        },
    });
    class Config {
        static STORAGE_KEY = "__fishknowsss-douyinx-config-v1__";
        constructor() {
            this.listeners = new Set();
            this.features = cloneFeatures();
            this.hadLegacyAria2Secret = false;
            this.load();
            this.listenForRemoteChanges();
        }
        normalize(features) {
            const value = deepMerge(cloneFeatures(), features);
            const videoModes = new Set([
                "default",
                "max",
                "min",
                "max_file",
                "min_file",
                "4K",
                "2K",
                "1080P",
                "720P",
                "540P",
                "360P",
            ]);
            const codecs = new Set([
                "default",
                "h264",
                "h265",
                "h264_prefer",
                "h265_prefer",
            ]);
            const imageFormats = new Set(["default", "png", "jpg", "webp"]);
            const imageSizes = new Set([
                "default",
                "2k_max",
                "1k_max",
                "960_max",
                "640_max",
                "512_max",
            ]);
            const downloaders = new Set(["browser", "abdm", "aria2"]);
            value.download_video_mode = videoModes.has(value.download_video_mode) ?
                value.download_video_mode :
                DEFAULT_FEATURES.download_video_mode;
            value.video_download_codecs = codecs.has(value.video_download_codecs) ?
                value.video_download_codecs :
                "default";
            value.image_convert_codecs = imageFormats.has(value.image_convert_codecs) ?
                value.image_convert_codecs :
                "default";
            value.image_resize_codecs = imageSizes.has(value.image_resize_codecs) ?
                value.image_resize_codecs :
                "default";
            value.using_downloader = downloaders.has(value.using_downloader) ?
                value.using_downloader :
                "browser";
            value.filename_template =
                typeof value.filename_template === "string" &&
                value.filename_template.trim() ?
                value.filename_template.slice(0, 500) :
                DEFAULT_FEATURES.filename_template;
            value.filename_max_length = Math.round(
                clamp(value.filename_max_length, 24, 180),
            );
            value.image_quality = Math.round(clamp(value.image_quality, 20, 100));
            const normalizeDomain = (input, fallback) => {
                try {
                    const source = String(input || fallback).trim();
                    const url = new NativeURL(
                        /^[a-z]+:\/\//i.test(source) ? source : "http://" + source,
                    );
                    if (!/^https?:$/.test(url.protocol)) throw new Error("协议不支持");
                    url.username = "";
                    url.password = "";
                    url.search = "";
                    url.hash = "";
                    url.pathname = "";
                    return url.origin;
                } catch {
                    return fallback;
                }
            };
            const normalizePort = (input, fallback) => {
                const port = Number(input);
                return Number.isInteger(port) && port >= 1 && port <= 65535 ?
                    String(port) :
                    fallback;
            };
            const normalizeDirectory = (input, fallback) =>
                typeof input === "string" ? input.slice(0, 500) : fallback;
            const normalizedDownloaders = cloneFeatures().downloader_config;
            for (const type of ["abdm", "aria2"]) {
                const defaults = DEFAULT_FEATURES.downloader_config[type];
                const incoming = isPlainObject(value.downloader_config?.[type]) ?
                    value.downloader_config[type] : {};
                const directories = isPlainObject(incoming.dir) ? incoming.dir : {};
                normalizedDownloaders[type] = {
                    ...defaults,
                    domain: type === "aria2" ?
                        DEFAULT_FEATURES.downloader_config.aria2.domain : normalizeDomain(incoming.domain, defaults.domain),
                    port: normalizePort(incoming.port, defaults.port),
                    dir: {
                        video: normalizeDirectory(directories.video, defaults.dir.video),
                        image: normalizeDirectory(directories.image, defaults.dir.image),
                        other: normalizeDirectory(directories.other, defaults.dir.other),
                    },
                    ...(type === "aria2" ? {
                        path: (() => {
                            const raw = String(incoming.path || defaults.path).slice(
                                0,
                                240,
                            );
                            return raw.startsWith("/") ? raw : defaults.path;
                        })(),
                    } : {}),
                };
            }
            value.downloader_config = normalizedDownloaders;
            return value;
        }
        load() {
            let migratedLegacyFilename = false;
            let migratedPageStorage = false;
            let removedLegacySecret = false;
            let canonicalObjectWriteback = false;
            try {
                const entry = storage.read(Config.STORAGE_KEY, {
                    migrate: false
                });
                migratedPageStorage =
                    entry.source === "legacy" || entry.legacyValue != null;
                const stored = entry.value;
                const scrubbedStored = scrubStoredSecrets(stored);
                canonicalObjectWriteback =
                    stored !== null &&
                    stored !== undefined &&
                    typeof stored !== "string";
                const objectFeatures = canonicalObjectWriteback ?
                    stored?.features || stored :
                    null;
                const objectAria2 = objectFeatures?.downloader_config?.aria2;
                removedLegacySecret =
                    scrubbedStored !== stored ||
                    Boolean(
                        objectAria2 &&
                        getOwnPropertyDescriptor(objectAria2, "token"),
                    );
                this.hadLegacyAria2Secret = removedLegacySecret;
                const parsed =
                    typeof scrubbedStored === "string" ?
                    parseJson(scrubbedStored) :
                    scrubbedStored || null;
                let storedFeatures = parsed?.features || parsed || {};
                const sanitizeLegacy = (features) => {
                    if (!isPlainObject(features)) return {};
                    const safe = {
                        ...features
                    };
                    delete safe.downloader_config;
                    safe.using_downloader = "browser";
                    return safe;
                };
                if (entry.source === "legacy") {
                    storedFeatures = sanitizeLegacy(storedFeatures);
                }
                migratedLegacyFilename =
                    storedFeatures?.filename_template ===
                    LEGACY_DEFAULT_FILENAME_TEMPLATE;
                if (migratedLegacyFilename) {
                    storedFeatures = {
                        ...storedFeatures,
                        filename_template: DEFAULT_FEATURES.filename_template,
                    };
                }
                this.features = this.normalize(storedFeatures);
            } catch (error) {
                console.warn(APP.logPrefix, "配置读取失败，已恢复默认值", error);
                this.features = cloneFeatures();
            }
            if (
                migratedLegacyFilename ||
                migratedPageStorage ||
                removedLegacySecret ||
                canonicalObjectWriteback
            ) {
                try {
                    storage.set(
                        Config.STORAGE_KEY,
                        stringifyJson({
                            version: 1,
                            features: this.features
                        }),
                    );
                } catch (error) {
                    console.warn(APP.logPrefix, "旧版文件名配置写回失败", error);
                }
            }
        }
        save() {
            this.features = this.normalize(this.features);
            try {
                storage.set(
                    Config.STORAGE_KEY,
                    stringifyJson({
                        version: 1,
                        features: this.features
                    }),
                );
            } catch (error) {
                console.error(APP.logPrefix, "配置保存失败", error);
                return false;
            }
            this.listeners.forEach((listener) => {
                try {
                    listener(this.clone());
                } catch (error) {
                    console.warn(APP.logPrefix, "配置监听器执行失败", error);
                }
            });
            return true;
        }
        latestClone() {
            try {
                const entry = storage.read(Config.STORAGE_KEY, {
                    migrate: false
                });
                if (entry.source !== "userscript") return this.clone();
                const scrubbed = scrubStoredSecrets(entry.value);
                const parsed =
                    typeof scrubbed === "string" ? parseJson(scrubbed) : scrubbed || null;
                let features = parsed?.features || parsed || {};
                if (
                    features?.filename_template === LEGACY_DEFAULT_FILENAME_TEMPLATE
                ) {
                    features = {
                        ...features,
                        filename_template: DEFAULT_FEATURES.filename_template,
                    };
                }
                return cloneFeatures(this.normalize(features));
            } catch (error) {
                console.warn(APP.logPrefix, "读取最新设置失败", error);
                return this.clone();
            }
        }
        listenForRemoteChanges() {
            if (typeof GM_addValueChangeListener !== "function") return;
            try {
                GM_addValueChangeListener(
                    Config.STORAGE_KEY,
                    (_name, _oldValue, newValue, remote) => {
                        if (!remote) return;
                        try {
                            const scrubbed = scrubStoredSecrets(newValue);
                            const parsed =
                                typeof scrubbed === "string" ?
                                parseJson(scrubbed) :
                                scrubbed || null;
                            const next = this.normalize(parsed?.features || parsed || {});
                            if (stringifyJson(next) === stringifyJson(this.features)) {
                                return;
                            }
                            this.features = next;
                            this.listeners.forEach((listener) => {
                                try {
                                    listener(this.clone());
                                } catch (error) {
                                    console.warn(APP.logPrefix, "配置监听器执行失败", error);
                                }
                            });
                        } catch (error) {
                            console.warn(APP.logPrefix, "同步其他标签页设置失败", error);
                        }
                    },
                );
            } catch (error) {
                console.warn(APP.logPrefix, "跨标签页设置同步不可用", error);
            }
        }
        replace(features) {
            this.features = this.normalize(features);
            return this.save();
        }
        clone() {
            return cloneFeatures(this.features);
        }
        subscribe(listener) {
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        }
    }
    const config = new Config();
    class DownloadHistory {
        static STORAGE_KEY = "__fishknowsss-douyinx-history-v1__";
        static MAX_ITEMS = 50;
        static get() {
            try {
                const entry = storage.read(this.STORAGE_KEY, {
                    migrate: false
                });
                const sanitize = (raw) => {
                    let parsed = [];
                    try {
                        parsed = typeof raw === "string" ? parseJson(raw) : raw || [];
                    } catch {
                        return [];
                    }
                    if (!Array.isArray(parsed)) return [];
                    return parsed
                        .filter((item) => isPlainObject(item))
                        .map((item) => ({
                            id: String(item.id || "").slice(0, 128),
                            desc: String(item.desc || "未命名作品").slice(0, 500),
                            author: String(item.author || "").slice(0, 120),
                            shareUrl: normalizeDouyinPageUrl(item.shareUrl),
                            downloadTime: Number.isFinite(Number(item.downloadTime)) ?
                                Number(item.downloadTime) : 0,
                        }))
                        .filter((item) => item.id);
                };
                let records = sanitize(entry.value);
                if (entry.legacyValue !== null && entry.legacyValue !== undefined) {
                    const byId = new Map();
                    [...records, ...sanitize(entry.legacyValue)]
                    .sort((a, b) => b.downloadTime - a.downloadTime)
                        .forEach((item) => {
                            if (!byId.has(item.id)) byId.set(item.id, item);
                        });
                    records = [...byId.values()];
                }
                records = records.slice(0, this.MAX_ITEMS);
                if (entry.source === "legacy" || entry.legacyValue != null) {
                    storage.set(this.STORAGE_KEY, stringifyJson(records));
                }
                return records;
            } catch {
                return [];
            }
        }
        static add(media) {
            if (!media) return;
            const id = String(media.awemeId || media.groupId || Date.now());
            const record = {
                id,
                desc: media.desc || "未命名作品",
                author: media.authorInfo?.nickname || "",
                shareUrl: normalizeDouyinPageUrl(media.shareInfo?.shareUrl),
                downloadTime: Date.now(),
            };
            const next = [
                record,
                ...this.get().filter((item) => String(item.id) !== id),
            ].slice(0, this.MAX_ITEMS);
            try {
                storage.set(this.STORAGE_KEY, stringifyJson(next));
            } catch (error) {
                console.warn(APP.logPrefix, "下载历史保存失败", error);
            }
        }
        static clear() {
            try {
                storage.remove(this.STORAGE_KEY);
                return true;
            } catch (error) {
                console.warn(APP.logPrefix, "下载历史清空失败", error);
                return false;
            }
        }
    }
    class ToastCenter {
        constructor() {
            this.region = null;
        }
        ensureRegion() {
            if (this.region?.isConnected) return this.region;
            const region = document.createElement("div");
            region.id = "dyx-toast-region";
            region.className = "dyx-toast-region";
            region.setAttribute("aria-live", "polite");
            region.setAttribute("aria-atomic", "true");
            document.body.appendChild(region);
            this.region = region;
            return region;
        }
        show(message, options = {}) {
            const rawDuration = Number(options.duration ?? 2800);
            const duration = Number.isFinite(rawDuration) ?
                clamp(rawDuration, 0, 60_000) :
                2800;
            const toast = document.createElement("div");
            toast.className = "dyx-toast dyx-toast--" + (options.type || "info");
            toast.setAttribute("role", options.type === "error" ? "alert" : "status");
            toast.textContent = String(message);
            const region = this.ensureRegion();
            while (region.childElementCount >= 4) region.firstElementChild?.remove();
            region.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add("is-visible"));
            let timer = null;
            const close = () => {
                if (timer) clearTimeout(timer);
                toast.classList.remove("is-visible");
                setTimeout(() => toast.remove(), 180);
            };
            const update = (nextMessage, nextOptions = {}) => {
                toast.textContent = String(nextMessage);
                if (nextOptions.type) {
                    toast.className = "dyx-toast dyx-toast--" + nextOptions.type;
                    requestAnimationFrame(() => toast.classList.add("is-visible"));
                    toast.setAttribute(
                        "role",
                        nextOptions.type === "error" ? "alert" : "status",
                    );
                }
                if (timer) clearTimeout(timer);
                const rawNextDuration = Number(nextOptions.duration ?? duration);
                const nextDuration = Number.isFinite(rawNextDuration) ?
                    clamp(rawNextDuration, 0, 60_000) :
                    duration;
                if (nextDuration > 0) timer = setTimeout(close, nextDuration);
            };
            if (duration > 0) timer = setTimeout(close, duration);
            return {
                close,
                update
            };
        }
    }
    const toasts = new ToastCenter();
    const notify = (message, options) => toasts.show(message, options);

    function injectStyles() {
        if (document.getElementById("dyx-styles")) return;
        const styleHost = document.head || document.documentElement;
        if (!styleHost) {
            window.addEventListener("DOMContentLoaded", injectStyles, {
                once: true
            });
            return;
        }
        const style = document.createElement("style");
        style.id = "dyx-styles";
        style.textContent = `
:root {
--dyx-bg: #171821;
--dyx-surface: #1f2029;
--dyx-surface-2: #292a34;
--dyx-surface-3: #353640;
--dyx-text: #f2f2f4;
--dyx-muted: #a9abb5;
--dyx-accent: #cf173e;
--dyx-accent-hover: #d91d45;
--dyx-danger: #ff5c75;
--dyx-radius-lg: 16px;
--dyx-radius-md: 12px;
--dyx-radius-sm: 8px;
--dyx-shadow: 0 24px 70px rgba(8, 8, 10, 0.48);
--dyx-z-controls: 30;
--dyx-z-menu: 40;
--dyx-z-dialog: 2147483000;
--dyx-z-toast: 2147483200;
}
.dyx-sr-only {
position: absolute !important;
width: 1px !important;
height: 1px !important;
padding: 0 !important;
margin: -1px !important;
overflow: hidden !important;
clip: rect(0, 0, 0, 0) !important;
white-space: nowrap !important;
border: 0 !important;
}
.dyx-toast-region {
position: fixed;
left: 50%;
bottom: max(28px, env(safe-area-inset-bottom));
z-index: var(--dyx-z-toast);
display: grid;
gap: 10px;
width: min(420px, calc(100vw - 32px));
transform: translateX(-50%);
pointer-events: none;
}
.dyx-toast {
justify-self: center;
max-width: 100%;
padding: 11px 16px;
border-radius: var(--dyx-radius-md);
background: rgba(31, 32, 41, 0.97);
color: var(--dyx-text);
box-shadow: 0 12px 32px rgba(8, 8, 10, 0.34);
font: 500 14px/1.45 -apple-system, BlinkMacSystemFont, "PingFang SC",
"Microsoft YaHei", sans-serif;
opacity: 0;
transform: translateY(8px) scale(0.98);
transition: opacity 180ms ease, transform 180ms ease;
overflow-wrap: anywhere;
}
.dyx-toast.is-visible { opacity: 1; transform: translateY(0) scale(1); }
.dyx-toast--success { background: #19382c; }
.dyx-toast--error { background: #462129; }
.dyx-overlay {
position: fixed;
inset: 0;
z-index: var(--dyx-z-dialog);
display: grid;
place-items: center;
padding: 28px;
background: rgba(7, 8, 13, 0.72);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
animation: dyx-fade-in 180ms ease-out;
}
.dyx-dialog {
box-sizing: border-box;
width: min(860px, 100%);
max-height: min(820px, calc(100dvh - 56px));
overflow: hidden;
border-radius: var(--dyx-radius-lg);
background: var(--dyx-bg);
color: var(--dyx-text);
color-scheme: dark;
box-shadow: var(--dyx-shadow);
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
"Microsoft YaHei", sans-serif;
animation: dyx-dialog-in 220ms cubic-bezier(.2,.8,.2,1);
}
.dyx-dialog--wide { width: min(1040px, 100%); }
.dyx-dialog--fixed { height: min(820px, calc(100dvh - 56px)); }
.dyx-shell { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; max-height: inherit; }
.dyx-dialog--fixed .dyx-shell { height: 100%; }
.dyx-header {
display: flex;
align-items: center;
justify-content: space-between;
gap: 20px;
padding: 22px 24px 18px;
}
.dyx-brand { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.dyx-brand h1 { margin: 0; min-width: 0; overflow-wrap: anywhere; font-size: 20px; line-height: 1.2; letter-spacing: -0.02em; }
.dyx-brand span { overflow: hidden; color: var(--dyx-muted); font-size: 14px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.dyx-icon-button,
.dyx-button,
.dyx-tab,
.dyx-menu-item,
.dyx-control-button {
appearance: none;
border: 0;
font: inherit;
cursor: pointer;
-webkit-tap-highlight-color: transparent;
}
.dyx-icon-button {
display: grid;
width: 36px;
height: 36px;
place-items: center;
border-radius: 10px;
background: var(--dyx-surface-2);
color: var(--dyx-text);
transition: background 180ms ease, transform 120ms ease;
}
.dyx-icon-button > span { font-size: 22px; line-height: 1; transform: translateY(-1px); }
.dyx-icon-button:hover { background: var(--dyx-surface-3); }
.dyx-icon-button:active { transform: scale(0.96); }
.dyx-icon-button:focus-visible,
.dyx-button:focus-visible,
.dyx-tab:focus-visible,
.dyx-menu-item:focus-visible,
.dyx-control-button:focus-visible,
.dyx-input:focus-visible,
.dyx-select:focus-visible {
outline: 2px solid #ff6683;
outline-offset: 2px;
}
.dyx-tabs {
display: flex;
gap: 24px;
padding: 0 24px;
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
overflow-x: auto;
}
.dyx-tab {
flex: 0 0 auto;
padding: 10px 1px 12px;
border-bottom: 2px solid transparent;
border-radius: 0;
background: transparent;
color: var(--dyx-muted);
font-size: 14px;
font-weight: 600;
transition: color 180ms ease, background 180ms ease;
}
.dyx-tab:hover { color: var(--dyx-text); background: transparent; }
.dyx-tab.is-active { color: var(--dyx-text); border-bottom-color: var(--dyx-accent); background: transparent; }
.dyx-content { min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 6px 24px 28px; scrollbar-gutter: stable; }
.dyx-stack { display: grid; gap: 0; }
.dyx-section {
display: grid;
gap: 16px;
padding: 22px 0;
border-radius: 0;
background: transparent;
}
.dyx-section + .dyx-section { border-top: 1px solid rgba(255, 255, 255, 0.06); }
.dyx-section-title { margin: 0; font-size: 15px; line-height: 1.3; font-weight: 650; }
.dyx-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.dyx-field { display: grid; gap: 8px; min-width: 0; color: var(--dyx-text); font-size: 13px; font-weight: 600; }
.dyx-field-label { color: var(--dyx-text); font-size: 13px; font-weight: 600; }
.dyx-input,
.dyx-select {
box-sizing: border-box;
width: 100%;
min-height: 42px;
padding: 9px 11px;
border: 1px solid #626570;
border-radius: var(--dyx-radius-sm);
background: var(--dyx-surface-2);
color: var(--dyx-text);
font: 500 14px/1.4 -apple-system, BlinkMacSystemFont, "PingFang SC",
"Microsoft YaHei", sans-serif;
transition: border-color 180ms ease, background 180ms ease;
}
.dyx-input:hover,
.dyx-select:hover { background: var(--dyx-surface-3); }
.dyx-input::placeholder { color: #8f9199; }
.dyx-static-value { min-height: 42px; display: flex; align-items: center; color: var(--dyx-text); font-size: 14px; font-weight: 600; }
.dyx-help { margin: 0; color: var(--dyx-muted); font-size: 13px; line-height: 1.55; }
.dyx-code {
padding: 10px 12px;
border-radius: var(--dyx-radius-sm);
background: #121316;
color: #e8e8ea;
font: 500 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
overflow-wrap: anywhere;
}
.dyx-actions {
display: flex;
align-items: center;
justify-content: flex-end;
gap: 10px;
padding: 16px 24px 20px;
background: var(--dyx-bg);
}
.dyx-actions-spacer { flex: 1 1 auto; }
.dyx-actions-message { font-size: 14px; font-weight: 650; }
.dyx-button {
min-height: 38px;
padding: 8px 15px;
border-radius: 9px;
background: var(--dyx-surface-2);
color: var(--dyx-text);
font-size: 14px;
font-weight: 650;
transition: background 180ms ease, transform 120ms ease;
}
.dyx-button:hover { background: var(--dyx-surface-3); }
.dyx-button:active { transform: translateY(1px) scale(0.985); }
.dyx-button--primary { background: var(--dyx-accent); color: #fff; }
.dyx-button--primary:hover { background: var(--dyx-accent-hover); }
.dyx-button--text { background: transparent; color: var(--dyx-muted); }
.dyx-button--danger { background: rgba(224, 102, 102, 0.14); color: #ff9a9a; }
.dyx-button:disabled,
.dyx-control-button:disabled,
.dyx-menu-item:disabled { opacity: .48; cursor: not-allowed; }
.dyx-button[aria-busy="true"],
.dyx-control-button[aria-busy="true"],
.dyx-menu-item[aria-busy="true"] { cursor: progress; }
.dyx-empty { padding: 54px 20px; color: var(--dyx-muted); text-align: center; font-size: 14px; }
.dyx-history { display: grid; gap: 10px; }
.dyx-history-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; padding: 15px 16px; border-radius: 10px; background: var(--dyx-surface); }
.dyx-history-main { min-width: 0; }
.dyx-history-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 600; }
.dyx-history-meta { margin-top: 5px; color: var(--dyx-muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.dyx-link { color: #ff6f89; text-decoration: none; font-weight: 600; }
.dyx-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.dyx-range-row { display: flex; align-items: center; gap: 12px; }
.dyx-range { flex: 1; accent-color: var(--dyx-accent); }
.dyx-range-value { width: 44px; text-align: right; font-variant-numeric: tabular-nums; font-size: 13px; }
.dyx-summary { display: grid; grid-template-columns: 116px minmax(0, 1fr) auto; gap: 18px; align-items: center; padding: 18px; border-radius: var(--dyx-radius-md); background: var(--dyx-surface); }
.dyx-summary-cover { width: 116px; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 10px; background: var(--dyx-surface-2); }
.dyx-summary-copy { min-width: 0; }
.dyx-summary-copy h2 { margin: 0; font-size: 17px; line-height: 1.45; text-wrap: pretty; }
.dyx-summary-copy p { margin: 7px 0 0; color: var(--dyx-muted); font-size: 13px; }
.dyx-resource-list { display: grid; gap: 10px; }
.dyx-resource { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 14px 15px; border-radius: 10px; background: var(--dyx-surface); }
.dyx-resource-main { display: flex; flex-wrap: wrap; gap: 7px 14px; align-items: baseline; min-width: 0; }
.dyx-resource-main strong { font-size: 14px; }
.dyx-resource-main span { color: var(--dyx-muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.dyx-inline-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.dyx-media-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.dyx-media-card { overflow: hidden; border-radius: 11px; background: var(--dyx-surface); }
.dyx-media-card img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; background: var(--dyx-surface-2); }
.dyx-media-card footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px; font-size: 13px; }
.dyx-image-action { position: absolute !important; right: 24px !important; bottom: 24px !important; z-index: 30 !important; }
.dyx-image-host { position: relative !important; }
.dyx-media-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dyx-image-action { right: 16px !important; bottom: 16px !important; }
.dyx-kv { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 16px; padding: 11px 0; }
.dyx-kv + .dyx-kv { border-top: 1px solid rgba(255, 255, 255, 0.06); }
.dyx-kv dt { color: var(--dyx-muted); font-size: 13px; }
.dyx-kv dd { margin: 0; min-width: 0; overflow-wrap: anywhere; font-size: 14px; }
.dyx-info { margin: 0; }
.dyx-controls-patched > .xg-left-grid { min-width: 0; }
.dyx-control-host { flex-wrap: nowrap !important; }
.dyx-player-control { position: relative; z-index: var(--dyx-z-controls); display: flex; flex: 0 0 auto; align-items: center; height: 100%; }
.dyx-control-button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-width: 42px; height: 34px; padding: 0 9px; border-radius: 8px; background: transparent; color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; transition: background 160ms ease, transform 120ms ease; }
.dyx-control-button:hover { background: rgba(255, 255, 255, 0.13); }
.dyx-control-button:active { transform: scale(0.96); }
.dyx-control-button--more { min-width: 32px; padding: 0 6px; }
.dyx-control-button[aria-busy="true"] { opacity: 0.65; cursor: progress; }
.dyx-player-control > .dyx-player-menu {
box-sizing: border-box !important;
position: absolute !important;
right: 0 !important;
bottom: calc(100% + 10px) !important;
z-index: var(--dyx-z-menu) !important;
display: grid !important;
gap: 5px !important;
width: min(232px, calc(100vw - 24px)) !important;
max-width: calc(100vw - 24px) !important;
max-height: min(380px, calc(100vh - 88px)) !important;
max-height: min(380px, calc(100dvh - 88px)) !important;
overflow-x: hidden !important;
overflow-y: auto !important;
overscroll-behavior: contain;
padding: 10px !important;
margin: 0 !important;
border: 1px solid rgba(255, 255, 255, .14) !important;
border-radius: 16px !important;
background: rgba(29, 30, 39, .98) !important;
color: #f5f5f7 !important;
box-shadow: 0 18px 48px rgba(4, 5, 10, .5), 0 2px 8px rgba(0, 0, 0, .2) !important;
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
opacity: 0;
visibility: hidden;
transform: translateY(6px) scale(.98);
transform-origin: bottom right;
transition: opacity 150ms ease, transform 150ms ease, visibility 150ms;
}
.dyx-player-control > .dyx-player-menu.is-open {
opacity: 1 !important;
visibility: visible !important;
transform: translateY(0) scale(1) !important;
}
.dyx-player-control > .dyx-player-menu > .dyx-menu-item {
appearance: none !important;
-webkit-appearance: none !important;
box-sizing: border-box !important;
display: flex !important;
align-items: center !important;
justify-content: flex-start !important;
gap: 12px !important;
width: 100% !important;
min-width: 0 !important;
max-width: 100% !important;
min-height: 42px !important;
margin: 0 !important;
padding: 10px 12px !important;
border: 0 !important;
border-radius: 10px !important;
background: transparent !important;
color: #f5f5f6 !important;
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif !important;
font-size: 13px !important;
line-height: 1.4 !important;
font-weight: 550 !important;
text-align: left !important;
white-space: nowrap;
cursor: pointer;
transition: background 150ms ease, color 150ms ease, transform 120ms ease;
}
.dyx-player-control > .dyx-player-menu > .dyx-menu-item::before {
content: attr(data-icon) !important;
box-sizing: border-box !important;
flex: 0 0 24px !important;
width: 24px !important;
min-width: 24px !important;
height: 24px !important;
margin: 0 !important;
padding: 0 !important;
border: 0 !important;
display: inline-grid !important;
place-items: center !important;
border-radius: 7px !important;
background: rgba(255, 255, 255, .08) !important;
color: #ff8197 !important;
font-size: 15px !important;
line-height: 1 !important;
}
.dyx-player-control > .dyx-player-menu > .dyx-menu-item:focus-visible {
outline: 2px solid #ff6683 !important;
outline-offset: -2px !important;
background: rgba(255, 255, 255, .09) !important;
}
.dyx-player-control > .dyx-player-menu > .dyx-menu-item:active {
background: rgba(207, 23, 62, .18) !important;
transform: scale(.99);
}
.dyx-player-control > .dyx-player-menu > .dyx-menu-item:hover {
background: rgba(255, 255, 255, .09) !important;
color: #fff !important;
}
.dyx-player-control > .dyx-player-menu > .dyx-menu-separator {
height: 1px !important;
margin: 6px 8px !important;
background: rgba(255, 255, 255, .12) !important;
}
@keyframes dyx-fade-in { from { opacity: 0; } }
@keyframes dyx-dialog-in { from { opacity: 0; transform: translateY(12px) scale(.985); } }
@media (max-width: 720px) {
.dyx-overlay { align-items: end; padding: 12px env(safe-area-inset-right) 0 env(safe-area-inset-left); }
.dyx-dialog,
.dyx-dialog--wide { width: 100%; max-height: calc(100dvh - 12px); border-radius: 20px 20px 0 0; }
.dyx-dialog--fixed { height: calc(100dvh - 12px); }
.dyx-header { padding: 20px 18px 16px; }
.dyx-tabs { padding: 0 18px; }
.dyx-content { padding: 8px 18px 24px; }
.dyx-actions { flex-wrap: wrap; padding: 14px 18px calc(16px + env(safe-area-inset-bottom)); }
.dyx-grid { grid-template-columns: minmax(0, 1fr); }
.dyx-summary { grid-template-columns: 86px minmax(0, 1fr); }
.dyx-summary-cover { width: 86px; }
.dyx-summary > .dyx-button { grid-column: 1 / -1; }
.dyx-resource { grid-template-columns: minmax(0, 1fr); }
.dyx-inline-actions { justify-content: flex-start; }
.dyx-kv { grid-template-columns: 96px minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
.dyx-overlay,
.dyx-dialog,
.dyx-toast,
.dyx-player-menu,
.dyx-button,
.dyx-icon-button,
.dyx-control-button,
.dyx-tab,
.dyx-input,
.dyx-select,
.dyx-menu-item { animation: none !important; transition-duration: 1ms !important; }
}
`;
        styleHost.appendChild(style);
    }
    injectStyles();
    class ImageProcessor {
        constructor(features) {
            this.features = features;
            this.resizeMap = {
                "2k_max": 2048,
                "1k_max": 1024,
                "960_max": 960,
                "640_max": 640,
                "512_max": 512,
            };
        }
        async decode(blob) {
            if (typeof createImageBitmap === "function") {
                try {
                    return await createImageBitmap(blob);
                } catch {
                    // Safari and some animated formats need the HTMLImageElement fallback.
                }
            }
            const url = NativeURL.createObjectURL(blob);
            try {
                const image = new Image();
                image.decoding = "async";
                image.src = url;
                await image.decode();
                return image;
            } finally {
                NativeURL.revokeObjectURL(url);
            }
        }
        async process(blob) {
            const format = this.features.image_convert_codecs;
            const sizeMode = this.features.image_resize_codecs;
            if (format === "default" && sizeMode === "default") {
                return {
                    blob,
                    contentType: blob.type || "application/octet-stream"
                };
            }
            if (Number(blob.size || 0) > 64 * 1024 * 1024) {
                throw new Error("图片过大，跳过处理");
            }
            const image = await this.decode(blob);
            const sourceWidth = image.width || image.naturalWidth;
            const sourceHeight = image.height || image.naturalHeight;
            if (sourceWidth * sourceHeight > 80_000_000) {
                if (typeof image.close === "function") image.close();
                throw new Error("图片尺寸过大，跳过处理");
            }
            const maxEdge = this.resizeMap[sizeMode] || Infinity;
            const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
            const width = Math.max(1, Math.round(sourceWidth * scale));
            const height = Math.max(1, Math.round(sourceHeight * scale));
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            try {
                const context = canvas.getContext("2d", {
                    alpha: format !== "jpg"
                });
                if (!context) throw new Error("无法创建图片画布");
                if (format === "jpg") {
                    context.fillStyle = "#ffffff";
                    context.fillRect(0, 0, width, height);
                }
                context.drawImage(image, 0, 0, width, height);
            } finally {
                if (typeof image.close === "function") image.close();
            }
            const contentType =
                format === "png" ?
                "image/png" :
                format === "jpg" ?
                "image/jpeg" :
                format === "webp" ?
                "image/webp" :
                blob.type || "image/png";
            const quality = clamp(this.features.image_quality, 20, 100) / 100;
            const output = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (value) =>
                    value ? resolve(value) : reject(new Error("图片转码失败")),
                    contentType,
                    quality,
                );
            });
            return {
                blob: output,
                contentType: output.type || contentType
            };
        }
    }
    class RequestBridge {
        static parseHeaders(rawHeaders) {
            const map = new Map();
            String(rawHeaders || "")
                .split(/\r?\n/)
                .forEach((line) => {
                    const index = line.indexOf(":");
                    if (index <= 0) return;
                    map.set(
                        line.slice(0, index).trim().toLowerCase(),
                        line.slice(index + 1).trim(),
                    );
                });
            return {
                get(name) {
                    return map.get(String(name).toLowerCase()) || null;
                },
            };
        }
        static gmRequest(options) {
            const request =
                typeof GM_xmlhttpRequest === "function" ?
                GM_xmlhttpRequest :
                typeof GM !== "undefined" && typeof GM.xmlHttpRequest === "function" ?
                GM.xmlHttpRequest :
                null;
            if (!request) return Promise.reject(new Error("GM 请求接口不可用"));
            return new Promise((resolve, reject) => {
                const {
                    signal,
                    ...requestOptions
                } = options;
                let control = null;
                let settled = false;
                const cleanup = () => signal?.removeEventListener("abort", onAbort);
                const finish = (callback, value) => {
                    if (settled) return;
                    settled = true;
                    cleanup();
                    callback(value);
                };
                const onAbort = () => {
                    try {
                        control?.abort?.();
                    } finally {
                        finish(reject, createAbortError("网络请求已取消"));
                    }
                };
                if (signal?.aborted) {
                    finish(reject, createAbortError("网络请求已取消"));
                    return;
                }
                signal?.addEventListener("abort", onAbort, {
                    once: true
                });
                try {
                    control = request({
                        timeout: 30000,
                        withCredentials: true,
                        ...requestOptions,
                        onload: (response) => finish(resolve, response),
                        onerror: () => finish(reject, new Error("网络请求失败")),
                        ontimeout: () => finish(reject, new Error("网络请求超时")),
                        onabort: () =>
                            finish(reject, createAbortError("网络请求已取消")),
                    });
                } catch (error) {
                    finish(reject, error);
                }
            });
        }
        static async json(url, options = {}) {
            const response = await this.gmRequest({
                method: options.method || "GET",
                url,
                headers: options.headers || {},
                data: options.body,
                responseType: "json",
                signal: options.signal,
            });
            let data = response.response ?? response.responseText ?? null;
            if (typeof data === "string" && data.trim()) {
                data = parseJson(data);
            }
            return {
                ok: response.status >= 200 && response.status < 300,
                data
            };
        }
    }

    function inferExtension(contentType, url, kind = "other") {
        const normalizedType = String(contentType || "")
            .split(";")[0]
            .toLowerCase();
        const typeMap = {
            "video/mp4": "mp4",
            "video/webm": "webm",
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "audio/mpeg": "mp3",
            "audio/mp4": "m4a",
            "text/plain": "txt",
        };
        if (typeMap[normalizedType]) return typeMap[normalizedType];
        const allowedByKind = {
            video: new Set(["mp4", "webm"]),
            image: new Set(["jpg", "jpeg", "png", "webp", "gif"]),
            other: new Set(["txt", "ass", "bin"]),
        };
        try {
            const pathname = new NativeURL(url, location.href).pathname;
            const match = pathname.match(/\.([a-z0-9]{2,5})$/i);
            const candidate = match?.[1]?.toLowerCase();
            if (candidate && allowedByKind[kind]?.has(candidate)) return candidate;
        } catch {
            // Use the media-kind fallback below.
        }
        return kind === "video" ? "mp4" : kind === "image" ? "jpg" : "bin";
    }

    function filenameFromDisposition(value) {
        const source = String(value || "");
        const utf8 = source.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8) {
            try {
                return decodeURIComponent(utf8[1].replace(/^"|"$/g, ""));
            } catch {
                return utf8[1];
            }
        }
        const basic = source.match(/filename="?([^";]+)"?/i);
        return basic?.[1] || "";
    }

    function buildEndpoint(domain, port, path = "") {
        const rawDomain = String(domain || "http://localhost").trim();
        const url = new NativeURL(
            /^[a-z]+:\/\//i.test(rawDomain) ? rawDomain : "http://" + rawDomain,
        );
        if (!/^https?:$/.test(url.protocol)) throw new Error("下载器地址协议不支持");
        url.username = "";
        url.password = "";
        url.search = "";
        url.hash = "";
        if (port) url.port = String(port);
        url.pathname = path || url.pathname || "/";
        return url.toString();
    }

    function safeReferrer() {
        try {
            return new NativeURL("/", location.origin).toString();
        } catch {
            return "https://www.douyin.com/";
        }
    }

    function assertMediaResponse(contentType, kind) {
        const type = String(contentType || "")
            .split(";", 1)[0]
            .trim()
            .toLowerCase();
        if (!type || type === "application/octet-stream") return;
        const valid =
            kind === "video" ?
            type.startsWith("video/") :
            kind === "image" ?
            type.startsWith("image/") :
            true;
        if (!valid) {
            throw new Error("下载地址返回的不是" + (kind === "video" ? "视频" : "图片"));
        }
    }
    class Downloader {
        constructor(appConfig) {
            this.config = appConfig;
            this.activeDownloads = new Set();
            this.activeRequests = new Set();
            this.cancelGeneration = 0;
        }
        getCancellationToken() {
            return this.cancelGeneration;
        }
        isCancelled(generation) {
            return generation !== this.cancelGeneration;
        }
        assertNotCancelled(generation) {
            if (generation !== this.cancelGeneration) throw createAbortError();
        }
        maxBlobBytes(kind) {
            if (kind === "image") return 64 * 1024 * 1024;
            if (kind === "video") return 768 * 1024 * 1024;
            return 128 * 1024 * 1024;
        }
        assertBlobSize(size, kind) {
            const bytes = Number(size || 0);
            if (bytes > this.maxBlobBytes(kind)) {
                throw new Error(
                    kind === "video" ?
                    "视频过大，无法使用兼容下载方式" :
                    "文件过大，已停止处理",
                );
            }
        }
        async fetchBlob(url, generation, kind = "other") {
            this.assertNotCancelled(generation);
            const verifyRedirect = Boolean(normalizeMediaUrl(url));
            const controller = new AbortController();
            this.activeRequests.add(controller);
            try {
                let fetchError = null;
                try {
                    if (!nativeFetch) throw new Error("浏览器不支持网络请求");
                    const response = await nativeFetch(url, {
                        credentials: "include",
                        referrer: safeReferrer(),
                        signal: controller.signal,
                    });
                    if (response.ok) {
                        if (
                            verifyRedirect &&
                            response.url &&
                            !normalizeMediaUrl(response.url)
                        ) {
                            const error = new Error("下载地址跳转到了非抖音资源");
                            error.code = "unsafe_redirect";
                            throw error;
                        }
                        this.assertBlobSize(
                            response.headers.get("content-length"),
                            kind,
                        );
                        const blob = await response.blob();
                        this.assertBlobSize(blob.size, kind);
                        this.assertNotCancelled(generation);
                        return {
                            blob,
                            headers: response.headers
                        };
                    }
                    fetchError = new Error("HTTP " + response.status);
                } catch (error) {
                    if (isAbortError(error) || controller.signal.aborted) {
                        throw createAbortError();
                    }
                    if (error?.code === "unsafe_redirect") throw error;
                    fetchError = error;
                }
                try {
                    const response = await RequestBridge.gmRequest({
                        method: "GET",
                        url,
                        responseType: "blob",
                        timeout: 180_000,
                        headers: {
                            Referer: safeReferrer()
                        },
                        signal: controller.signal,
                    });
                    if (response.status < 200 || response.status >= 300) {
                        throw new Error("HTTP " + response.status);
                    }
                    if (
                        verifyRedirect &&
                        response.finalUrl &&
                        !normalizeMediaUrl(response.finalUrl)
                    ) {
                        throw new Error("下载地址跳转到了非抖音资源");
                    }
                    this.assertNotCancelled(generation);
                    const blob =
                        response.response instanceof Blob ?
                        response.response :
                        new Blob([response.response || response.responseText || ""]);
                    this.assertBlobSize(blob.size, kind);
                    return {
                        blob,
                        headers: RequestBridge.parseHeaders(response.responseHeaders),
                    };
                } catch (gmError) {
                    if (isAbortError(gmError) || controller.signal.aborted) {
                        throw createAbortError();
                    }
                    throw fetchError || gmError;
                }
            } finally {
                this.activeRequests.delete(controller);
            }
        }
        normalizeOutputFilename(filename, profile = this.config.features) {
            return normalizeFilename(filename, {
                maxLength: profile?.filename_max_length,
            });
        }
        async downloadBlob(blob, filename, profile = this.config.clone()) {
            const anchor = document.createElement("a");
            const objectUrl = NativeURL.createObjectURL(blob);
            anchor.href = objectUrl;
            anchor.download = this.normalizeOutputFilename(filename, profile);
            anchor.click();
            setTimeout(() => NativeURL.revokeObjectURL(objectUrl), 1500);
        }
        startNativeDownload(url, baseName, kind, generation, profile) {
            this.assertNotCancelled(generation);
            if (typeof GM_download !== "function") {
                return Promise.reject(new Error("原生下载接口不可用"));
            }
            const extension = inferExtension("", url, kind);
            const filename = this.normalizeOutputFilename(
                String(baseName || "douyinx").replace(/\.[a-z0-9]{2,5}$/i, "") +
                "." +
                extension,
                profile,
            );
            return new Promise((resolve, reject) => {
                let settled = false;
                let control = null;
                let entry = null;
                const finish = (callback, value) => {
                    if (settled) return;
                    settled = true;
                    if (entry) this.activeDownloads.delete(entry);
                    callback(value);
                };
                const fail = (reason) => {
                    if (isAbortError(reason)) {
                        finish(reject, reason);
                        return;
                    }
                    const error = new Error(
                        String(reason?.error || reason?.message || reason || "下载失败"),
                    );
                    error.code = reason?.error || reason?.code || "download_failed";
                    finish(reject, error);
                };
                entry = {
                    abort: () => {
                        try {
                            control?.abort?.();
                        } finally {
                            finish(reject, createAbortError("下载已取消"));
                        }
                    },
                };
                try {
                    control = GM_download({
                        url,
                        name: filename,
                        headers: {
                            Referer: safeReferrer()
                        },
                        saveAs: false,
                        conflictAction: "uniquify",
                        onload: () => finish(resolve, true),
                        onabort: () => fail(createAbortError("下载已取消")),
                        onerror: (error) => fail(error),
                        ontimeout: () => fail(new Error("下载超时")),
                    });
                    if (!settled) this.activeDownloads.add(entry);
                } catch (error) {
                    fail(error);
                }
            });
        }
        cancelActiveDownloads() {
            this.cancelGeneration += 1;
            const downloads = [...this.activeDownloads];
            const requests = [...this.activeRequests];
            this.activeDownloads.clear();
            this.activeRequests.clear();
            downloads.forEach((entry) => {
                try {
                    entry.abort();
                } catch {
                    // A completed download can disappear between listing and aborting.
                }
            });
            requests.forEach((controller) => controller.abort());
            return downloads.length + requests.length;
        }
        async downloadWithBrowser(url, baseName, kind, generation, profile) {
            this.assertNotCancelled(generation);
            if (kind === "video" && typeof GM_download === "function") {
                try {
                    return await this.startNativeDownload(
                        url,
                        baseName,
                        kind,
                        generation,
                        profile,
                    );
                } catch (error) {
                    if (isAbortError(error)) throw error;
                    const compatibilityErrors = new Set([
                        "not_enabled",
                        "not_permitted",
                        "not_supported",
                        "not_whitelisted",
                    ]);
                    if (!compatibilityErrors.has(error?.code)) throw error;
                    console.warn(APP.logPrefix, "原生下载不可用，改用兼容方式", error);
                }
            }
            const {
                blob: sourceBlob,
                headers
            } = await this.fetchBlob(
                url,
                generation,
                kind,
            );
            const contentType = sourceBlob.type || headers.get("content-type") || "";
            assertMediaResponse(contentType, kind);
            const dispositionName = filenameFromDisposition(
                headers.get("content-disposition"),
            );
            let extension = inferExtension(contentType, url, kind);
            let blob = sourceBlob;
            let outputType = contentType;
            if (kind === "image" || contentType.startsWith("image/")) {
                try {
                    const processed = await new ImageProcessor(profile).process(blob);
                    blob = processed.blob;
                    outputType = processed.contentType;
                } catch (error) {
                    console.warn(APP.logPrefix, "图片处理失败，改存原图", error);
                    notify("图片处理失败，已改存原图", {
                        type: "error",
                        duration: 3600,
                    });
                }
                extension = inferExtension(outputType, url, "image");
            }
            this.assertNotCancelled(generation);
            const rawName = baseName || dispositionName || "douyinx";
            const withoutExtension = rawName.replace(/\.[a-z0-9]{2,5}$/i, "");
            await this.downloadBlob(
                blob,
                withoutExtension + "." + extension,
                profile,
            );
            return true;
        }
        getExternalDirectory(kind, media, downloaderType, profile) {
            const features = profile || this.config.features;
            const selected = downloaderType || features.using_downloader;
            const template =
                features.downloader_config?.[selected]?.dir?.[kind] ||
                features.downloader_config?.[selected]?.dir?.other ||
                "";
            const userDir = normalizeFilename(
                [media?.authorInfo?.uid, media?.authorInfo?.nickname]
                .filter(Boolean)
                .join("_") || "unknown",
            );
            return renderFilenameTemplate(template, {
                user_dir: userDir
            });
        }
        async downloadExternal(
            url,
            baseName,
            kind,
            media,
            generation,
            downloaderType,
            profile,
        ) {
            this.assertNotCancelled(generation);
            const safeUrl = normalizeMediaUrl(url);
            if (!safeUrl) throw new Error("下载地址协议不支持");
            url = safeUrl;
            const controller = new AbortController();
            this.activeRequests.add(controller);
            const features = profile || this.config.features;
            const type = downloaderType || features.using_downloader;
            const external = features.downloader_config?.[type] || {};
            const filename = this.normalizeOutputFilename(
                baseName + "." + inferExtension("", url, kind),
                features,
            );
            const directory = this.getExternalDirectory(
                kind,
                media,
                type,
                features,
            );
            try {
                if (type === "abdm") {
                    const endpoint = buildEndpoint(
                        external.domain,
                        external.port,
                        "/start-headless-download",
                    );
                    const result = await RequestBridge.gmRequest({
                        method: "POST",
                        url: endpoint,
                        headers: {
                            "Content-Type": "text/plain;charset=UTF-8"
                        },
                        data: stringifyJson({
                            downloadSource: {
                                link: url,
                                headers: {
                                    Referer: safeReferrer()
                                },
                                downloadPage: normalizeDouyinPageUrl(media?.shareInfo?.shareUrl) ||
                                    safeReferrer(),
                            },
                            name: filename,
                            ...(directory ? {
                                folder: directory
                            } : {}),
                        }),
                        signal: controller.signal,
                    });
                    if (result.status < 200 || result.status >= 300) {
                        throw new Error("AB Download Manager 返回 HTTP " + result.status);
                    }
                    const responseText = String(
                        result.responseText || result.response || "",
                    ).trim();
                    if (responseText !== "OK") {
                        throw new Error("AB Download Manager 未接受任务");
                    }
                    this.assertNotCancelled(generation);
                    return true;
                }
                if (type === "aria2") {
                    const endpoint = buildEndpoint(
                        external.domain,
                        external.port,
                        external.path || "/jsonrpc",
                    );
                    const options = {
                        out: filename,
                        "auto-file-renaming": "true",
                        "follow-torrent": "false",
                        "follow-metalink": "false",
                        "seed-time": "0",
                        ...(directory ? {
                            dir: directory
                        } : {}),
                        header: ["Referer: " + safeReferrer()],
                    };
                    const params = [
                        [url], options
                    ];
                    const response = await RequestBridge.json(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: stringifyJson({
                            jsonrpc: "2.0",
                            id: Date.now(),
                            method: "aria2.addUri",
                            params,
                        }),
                        signal: controller.signal,
                    });
                    if (!response.ok || !response.data?.result) {
                        throw new Error(
                            response.data?.error?.message || "Aria2 未接受下载任务",
                        );
                    }
                    this.assertNotCancelled(generation);
                    return true;
                }
                return false;
            } finally {
                this.activeRequests.delete(controller);
            }
        }
        async downloadFile(source, baseName, fallbackSources = [], options = {}) {
            const kind = options.kind || "other";
            const profile = options.profile || this.config.clone();
            const needsLocalImageProcessing =
                kind === "image" &&
                (profile.image_convert_codecs !== "default" ||
                    profile.image_resize_codecs !== "default");
            const downloaderType = needsLocalImageProcessing ?
                "browser" :
                profile.using_downloader;
            const usingBrowser = downloaderType === "browser";
            const urls = uniqueStrings(
                uniqueStrings([source, ...fallbackSources])
                .map((value) => {
                    const httpUrl = normalizeMediaUrl(value);
                    if (httpUrl) return httpUrl;
                    if (!usingBrowser || kind !== "image") return "";
                    if (/^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(value)) {
                        return value;
                    }
                    try {
                        const url = new NativeURL(value);
                        return url.protocol === "blob:" && url.origin === location.origin ?
                            url.href :
                            "";
                    } catch {
                        return "";
                    }
                })
                .filter(Boolean),
            );
            if (!urls.length) {
                notify("没有可用的下载地址", {
                    type: "error"
                });
                return false;
            }
            const generation = options.generation ?? this.cancelGeneration;
            let lastError = null;
            for (const url of urls) {
                try {
                    this.assertNotCancelled(generation);
                    const ok =
                        downloaderType === "browser" ?
                        await this.downloadWithBrowser(
                            url,
                            baseName,
                            kind,
                            generation,
                            profile,
                        ) :
                        await this.downloadExternal(
                            url,
                            baseName,
                            kind,
                            options.media,
                            generation,
                            downloaderType,
                            profile,
                        );
                    if (ok) return true;
                } catch (error) {
                    if (isAbortError(error)) return false;
                    lastError = error;
                    console.warn(APP.logPrefix, "下载地址失败，尝试下一个", url, error);
                }
            }
            notify(
                lastError?.message ?
                "下载失败：" + lastError.message :
                "下载失败，请刷新后重试", {
                    type: "error",
                    duration: 4200
                },
            );
            return false;
        }
    }
    class Dialog {
        static active = null;
        constructor(options = {}) {
            this.options = options;
            this.previousOverflow = null;
            this.overlay = document.createElement("div");
            this.overlay.className = "dyx-overlay";
            this.dialog = document.createElement("section");
            this.dialog.className =
                "dyx-dialog" +
                (options.wide ? " dyx-dialog--wide" : "") +
                (options.fixed ? " dyx-dialog--fixed" : "");
            this.dialog.tabIndex = -1;
            this.dialog.setAttribute("role", "dialog");
            this.dialog.setAttribute("aria-modal", "true");
            if (options.labelledBy) {
                this.dialog.setAttribute("aria-labelledby", options.labelledBy);
            } else {
                this.dialog.setAttribute("aria-label", options.label || APP.name);
            }
            this.overlay.appendChild(this.dialog);
            this.onPointerDown = (event) => {
                if (event.target === this.overlay) this.requestClose();
            };
            this.onKeyDown = (event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    this.requestClose();
                    return;
                }
                if (event.key !== "Tab") return;
                const focusable = Array.from(
                    this.dialog.querySelectorAll(
                        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
                    ),
                ).filter((element) => element.getClientRects().length);
                if (!focusable.length) {
                    event.preventDefault();
                    this.dialog.focus();
                    return;
                }
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            };
            this.overlay.addEventListener("pointerdown", this.onPointerDown);
            document.addEventListener("keydown", this.onKeyDown, true);
        }
        open() {
            Dialog.active?.close();
            this.previousFocus = document.activeElement;
            Dialog.active = this;
            this.previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            (document.fullscreenElement || document.body).appendChild(this.overlay);
            requestAnimationFrame(() => {
                this.dialog?.focus({
                    preventScroll: true
                });
            });
            return this;
        }
        requestClose() {
            if (this.options.onRequestClose?.() === false) return false;
            this.close();
            return true;
        }
        close() {
            if (!this.overlay) return;
            this.options.onBeforeClose?.();
            this.overlay.removeEventListener("pointerdown", this.onPointerDown);
            document.removeEventListener("keydown", this.onKeyDown, true);
            this.overlay.remove();
            document.body.style.overflow = this.previousOverflow ?? "";
            if (Dialog.active === this) Dialog.active = null;
            if (this.previousFocus?.isConnected) this.previousFocus.focus();
            this.options.onClose?.();
            this.overlay = null;
            this.dialog = null;
        }
    }
    class PlayerLocator {
        getCurrentPlayer() {
            const localWindow = typeof window !== "undefined" ? window : null;
            const pageWindow =
                typeof unsafeWindow !== "undefined" ? unsafeWindow : localWindow;
            return pageWindow?.player || localWindow?.player || null;
        }
        getPlayerRoot(player) {
            const ownedRoot = this.getPlayerOwnedRoot(player);
            if (ownedRoot) return ownedRoot;
            if (typeof document === "undefined") return null;
            const currentRoot = this.getCurrentVideoRoot(document);
            if (currentRoot) return currentRoot;
            const activeRoots = document.querySelectorAll(
                "xg-player.xgplayer-is-active, .xgplayer.xgplayer-is-active",
            );
            if (activeRoots.length === 1) return activeRoots[0];
            if (activeRoots.length > 1) return null;
            const roots = document.querySelectorAll("xg-player, .xgplayer");
            return roots.length === 1 ? roots[0] : null;
        }
        getPlayerOwnedRoot(player) {
            const videoRoot = player?.video?.closest?.("xg-player, .xgplayer");
            if (videoRoot?.isConnected !== false) return videoRoot || null;
            const direct = player?.root;
            if (
                direct?.isConnected !== false &&
                typeof direct?.querySelector === "function"
            ) {
                return direct;
            }
            return null;
        }
        getCurrentVideoRoot(scope) {
            if (!scope?.querySelectorAll) return null;
            const roots = Array.from(
                new Set(scope.querySelectorAll("xg-player, .xgplayer")),
            );
            const view = scope.defaultView ||
                (typeof window !== "undefined" ? window : null);
            const viewportWidth = Number(
                scope.documentElement?.clientWidth || view?.innerWidth || 0,
            );
            const viewportHeight = Number(
                scope.documentElement?.clientHeight || view?.innerHeight || 0,
            );
            if (!viewportWidth || !viewportHeight) return null;
            const candidates = roots
                .filter(
                    (root) =>
                    root?.isConnected !== false &&
                    !root.classList?.contains("xgplayer-live"),
                )
                .map((root) => {
                    const video = root.querySelector?.("video");
                    const rect = root.getBoundingClientRect?.();
                    if (!video || !rect) return null;
                    const left = Math.max(0, Number(rect.left || 0));
                    const right = Math.min(
                        viewportWidth,
                        Number(rect.right ?? left + Number(rect.width || 0)),
                    );
                    const top = Math.max(0, Number(rect.top || 0));
                    const bottom = Math.min(
                        viewportHeight,
                        Number(rect.bottom ?? top + Number(rect.height || 0)),
                    );
                    const visibleWidth = Math.max(0, right - left);
                    const visibleHeight = Math.max(0, bottom - top);
                    const visibleArea = visibleWidth * visibleHeight;
                    if (!visibleArea) return null;
                    const area = Math.max(
                        1,
                        Number(rect.width || right - left) *
                        Number(rect.height || bottom - top),
                    );
                    const centerX = Number(rect.left || 0) + Number(rect.width || 0) / 2;
                    const centerY = Number(rect.top || 0) + Number(rect.height || 0) / 2;
                    return {
                        root,
                        centerHit: Number(rect.left || 0) <= viewportWidth / 2 &&
                            Number(rect.right || 0) >= viewportWidth / 2 &&
                            Number(rect.top || 0) <= viewportHeight / 2 &&
                            Number(rect.bottom || 0) >= viewportHeight / 2,
                        playing: !video.paused && !video.ended,
                        visibleArea,
                        visibleRatio: visibleArea / area,
                        centerDistance: Math.abs(centerX - viewportWidth / 2) +
                            Math.abs(centerY - viewportHeight / 2),
                    };
                })
                .filter(Boolean)
                .sort(
                    (a, b) =>
                    Number(b.centerHit) - Number(a.centerHit) ||
                    Number(b.playing) - Number(a.playing) ||
                    b.visibleArea - a.visibleArea ||
                    b.visibleRatio - a.visibleRatio ||
                    a.centerDistance - b.centerDistance,
                );
            return candidates[0]?.root || null;
        }
        isPlayerBoundToCurrentVideo(player, scope) {
            if (!player || !scope?.querySelectorAll) return false;
            const ownedRoot = this.getPlayerOwnedRoot(player);
            if (!ownedRoot) return false;
            const currentRoot = this.getCurrentVideoRoot(scope);
            if (currentRoot) return ownedRoot === currentRoot;
            const roots = Array.from(
                new Set(scope.querySelectorAll("xg-player, .xgplayer")),
            ).filter(
                (root) =>
                root?.isConnected !== false &&
                !root.classList?.contains("xgplayer-live"),
            );
            return roots.length === 1 && roots[0] === ownedRoot;
        }
    }
    class MediaHandler {
        constructor(downloader, playerLocator, appConfig) {
            this.downloader = downloader;
            this.playerLocator = playerLocator;
            this.config = appConfig;
            this.player = null;
            this.currentMedia = null;
            this.currentMediaKey = "";
            this.downloading = false;
            this.listeners = new Set();
            this.playerBindings = [];
            this.interval = null;
            this.detect = null;
            this.onVisibilityChange = () => {
                if (!document.hidden) this.detect?.();
            };
            this.downloadCurrentMedia = this.withLock(
                this.downloadCurrentMediaLogic.bind(this),
            );
        }
        static toShortId(value) {
            try {
                return BigInt(value).toString(36);
            } catch {
                return String(value || "");
            }
        }
        start() {
            if (this.interval) return;
            this.detect = () => {
                if (document.hidden) return;
                const currentPlayer = this.playerLocator.getCurrentPlayer();
                if (currentPlayer !== this.player) this.bindPlayer(currentPlayer);
                this.updateMedia();
            };
            this.detect();
            this.interval = window.setInterval(this.detect, 800);
            document.addEventListener("visibilitychange", this.onVisibilityChange);
        }
        stop() {
            if (this.interval) clearInterval(this.interval);
            this.interval = null;
            this.detect = null;
            document.removeEventListener(
                "visibilitychange",
                this.onVisibilityChange,
            );
            this.unbindPlayer();
        }
        bindPlayer(player) {
            this.unbindPlayer();
            this.player = player || null;
            if (!this.player) {
                this.setMedia(null);
                return;
            }
            const update = () => {
                this.updateMedia();
            };
            ["play", "loadeddata", "canplay", "definition_change"].forEach(
                (event) => {
                    try {
                        this.player.on?.(event, update);
                        this.playerBindings.push([event, update]);
                    } catch (error) {
                        console.debug(APP.logPrefix, "播放器事件不可用", event, error);
                    }
                },
            );
            update();
        }
        unbindPlayer() {
            if (this.player) {
                this.playerBindings.forEach(([event, handler]) => {
                    try {
                        this.player.off?.(event, handler);
                    } catch {
                        // Old XGPlayer builds may not expose off().
                    }
                });
            }
            this.playerBindings = [];
        }
        updateMedia() {
            const media = this.player?.config?.awemeInfo || null;
            const mediaKey = String(media?.awemeId || media?.groupId || "");
            if (!media) {
                if (this.currentMedia) this.setMedia(null);
            } else if (
                media !== this.currentMedia ||
                mediaKey !== this.currentMediaKey
            ) {
                this.setMedia(media);
            }
        }
        setMedia(media) {
            this.currentMedia = media;
            this.currentMediaKey = String(media?.awemeId || media?.groupId || "");
            this.emit();
        }
        subscribe(listener) {
            this.listeners.add(listener);
            listener(this.getState());
            return () => this.listeners.delete(listener);
        }
        emit() {
            const state = this.getState();
            this.listeners.forEach((listener) => listener(state));
        }
        getState() {
            return {
                player: this.player,
                media: this.currentMedia,
                downloading: this.downloading,
            };
        }
        buildFilename(
            media = this.currentMedia,
            features = this.config.features,
        ) {
            if (!media) return "douyinx";
            const template = features.filename_template;
            const nickname = media.authorInfo?.nickname || "未知作者";
            const awemeId = media.awemeId || media.groupId || "";
            const tagList = (Array.isArray(media.textExtra) ? media.textExtra : [])
                .map((item) => item?.hashtagName)
                .filter(Boolean);
            let description = String(media.desc || "");
            tagList.forEach((tag) => {
                description = description.replace(
                    new RegExp("#" + escapeRegExp(tag) + "\\s*", "gu"),
                    "",
                );
            });
            const now = new Date();
            const createdTimestamp = Number(media.createTime || 0) * 1000;
            const created =
                createdTimestamp > 0 && Number.isFinite(createdTimestamp) ?
                new Date(createdTimestamp) :
                null;
            const context = {
                nickname,
                short_id: MediaHandler.toShortId(awemeId),
                tags: tagList.map((tag) => "#" + tag).join("_"),
                desc: description.trim(),
                aweme_id: awemeId,
                media,
                author_info: media.authorInfo || {},
                uid: media.authorUserId || media.authorInfo?.uid || "",
                music_name: media.music?.musicName || "",
                now_date: now,
                create_date: created || "",
                now_YYYYMMDD: formatDate(now, "YYYYMMDD"),
                now_YYYYMMDD_HHmmss: formatDate(now, "YYYYMMDD_HHmmss"),
                create_date_YYYYMMDD: created ? formatDate(created, "YYYYMMDD") : "",
                create_date_YYYYMMDD_HHmmss: created ?
                    formatDate(created, "YYYYMMDD_HHmmss") : "",
            };
            const rendered =
                renderFilenameTemplate(template, context) ||
                renderFilenameTemplate(DEFAULT_FEATURES.filename_template, context);
            return normalizeFilename(rendered.replace(/\./g, "_"), {
                maxLength: features.filename_max_length,
            });
        }
        setDownloading(value) {
            this.downloading = value;
            this.emit();
        }
        withLock(task) {
            return async (...args) => {
                if (this.downloading) {
                    notify("当前任务尚未完成", {
                        type: "error"
                    });
                    return false;
                }
                this.setDownloading(true);
                try {
                    return await task(...args);
                } catch (error) {
                    console.error(APP.logPrefix, "下载任务执行失败", error);
                    notify("操作失败，请稍后重试", {
                        type: "error"
                    });
                    return false;
                } finally {
                    this.setDownloading(false);
                }
            };
        }
        async downloadCurrentMediaLogic(mediaOverride = null) {
            const liveMedia = mediaOverride || this.currentMedia;
            if (!liveMedia) {
                notify("请先打开一个作品", {
                    type: "error"
                });
                return false;
            }
            const media = snapshotMedia(liveMedia);
            if (!media) return false;
            const profile = this.config.clone();
            const generation = this.downloader.getCancellationToken();
            const baseName = this.buildFilename(media, profile);
            const images = Array.isArray(media.images) ? media.images : [];
            if (images.length) {
                const toast = notify("正在下载图集 0/" + images.length, {
                    duration: 0,
                });
                let downloaded = 0;
                for (let index = 0; index < images.length; index += 1) {
                    if (this.downloader.isCancelled(generation)) break;
                    toast.update("正在下载图集 " + (index + 1) + "/" + images.length, {
                        duration: 0,
                    });
                    const item = images[index];
                    const itemName = baseName + "_" + (index + 1);
                    let urls = [];
                    let kind = "image";
                    if (item?.video) {
                        kind = "video";
                        urls = selectVideoVariants(
                            item.video,
                            profile.download_video_mode,
                            profile.video_download_codecs,
                        );
                    } else {
                        urls = collectImageUrls(item);
                    }
                    if (!urls.length) continue;
                    const ok = await this.downloader.downloadFile(
                        urls[0],
                        itemName,
                        urls.slice(1), {
                            kind,
                            media,
                            generation,
                            profile
                        },
                    );
                    if (this.downloader.isCancelled(generation)) break;
                    if (ok) downloaded += 1;
                }
                if (this.downloader.isCancelled(generation)) {
                    toast.update("下载已取消", {
                        duration: 2200
                    });
                    return false;
                }
                if (downloaded) DownloadHistory.add(media);
                if (downloaded === images.length) {
                    toast.update("图集已下载", {
                        type: "success",
                        duration: 2200
                    });
                } else if (downloaded) {
                    toast.update("已下载 " + downloaded + "/" + images.length + " 项", {
                        type: "error",
                        duration: 3200,
                    });
                } else {
                    toast.update("图集下载失败", {
                        type: "error",
                        duration: 3200
                    });
                }
                return downloaded > 0;
            }
            const urls = selectVideoVariants(
                media.video,
                profile.download_video_mode,
                profile.video_download_codecs,
            );
            if (!urls.length) {
                notify("当前作品没有可用地址", {
                    type: "error"
                });
                return false;
            }
            const toast = notify("正在下载", {
                duration: 0
            });
            const ok = await this.downloader.downloadFile(
                urls[0],
                baseName,
                urls.slice(1), {
                    kind: "video",
                    media,
                    generation,
                    profile
                },
            );
            if (this.downloader.isCancelled(generation)) {
                toast.update("下载已取消", {
                    duration: 2200
                });
                return false;
            }
            if (ok) {
                DownloadHistory.add(media);
                toast.update("下载已开始", {
                    type: "success",
                    duration: 2200
                });
            } else {
                toast.close();
            }
            return ok;
        }
        async downloadThumb() {
            const media = snapshotMedia(this.currentMedia);
            if (!media) {
                notify("请先打开一个作品", {
                    type: "error"
                });
                return false;
            }
            const video = media.video || {};
            const profile = this.config.clone();
            const urls = uniqueStrings([
                ...(Array.isArray(video.originCoverUrlList) ? [...video.originCoverUrlList].reverse() : []),
                ...(Array.isArray(video.coverUrlList) ? video.coverUrlList : []),
                ...(Array.isArray(video.dynamicCoverUrlList) ?
                    video.dynamicCoverUrlList : []),
            ]);
            return this.downloader.downloadFile(
                urls[0],
                "封面_" + this.buildFilename(media, profile),
                urls.slice(1), {
                    kind: "image",
                    media,
                    profile
                },
            );
        }
    }
    class VideoHandler {
        constructor(downloader, mediaHandler) {
            this.downloader = downloader;
            this.mediaHandler = mediaHandler;
        }
        getVisibleVideo(playerRoot = null) {
            let selected = null;
            let largestArea = 0;
            const scope = playerRoot instanceof Element ? playerRoot : document;
            scope
                .querySelectorAll("xg-video-container video, video")
                .forEach((video) => {
                    const rect = video.getBoundingClientRect();
                    const visible =
                        rect.width > 0 &&
                        rect.height > 0 &&
                        rect.bottom > 0 &&
                        rect.right > 0 &&
                        rect.top < innerHeight &&
                        rect.left < innerWidth;
                    const area = visible ? rect.width * rect.height : 0;
                    if (area > largestArea) {
                        largestArea = area;
                        selected = video;
                    }
                });
            return selected;
        }
        async capture(playerRoot = null) {
            const video = this.getVisibleVideo(playerRoot);
            if (!video || !video.videoWidth || !video.videoHeight) {
                notify("请先播放视频", {
                    type: "error"
                });
                return null;
            }
            try {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext("2d");
                if (!context) throw new Error("无法创建画布");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                return await new Promise((resolve, reject) => {
                    canvas.toBlob(
                        (blob) => (blob ? resolve(blob) : reject(new Error("截帧失败"))),
                        "image/png",
                    );
                });
            } catch (error) {
                console.warn(APP.logPrefix, "截取视频帧失败", error);
                notify("当前视频不允许截帧", {
                    type: "error"
                });
                return null;
            }
        }
        async copy(playerRoot = null) {
            const blob = await this.capture(playerRoot);
            if (!blob) return false;
            try {
                if (
                    !navigator.clipboard?.write ||
                    typeof ClipboardItem !== "function"
                ) {
                    throw new Error("浏览器不支持图片剪贴板");
                }
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "image/png": blob
                    }),
                ]);
                notify("画面已复制", {
                    type: "success"
                });
                return true;
            } catch (error) {
                console.warn(APP.logPrefix, "复制视频帧失败", error);
                notify("无法复制画面", {
                    type: "error"
                });
                return false;
            }
        }
        async download(playerRoot = null) {
            const media = snapshotMedia(this.mediaHandler.currentMedia);
            const profile = this.mediaHandler.config.clone();
            const baseName = this.mediaHandler.buildFilename(media, profile);
            const blob = await this.capture(playerRoot);
            if (!blob) return false;
            const filename =
                "视频帧_" +
                baseName +
                "_" +
                formatDate(new Date(), "HHmmss") +
                ".png";
            await this.downloader.downloadBlob(blob, filename, profile);
            notify("画面已下载", {
                type: "success"
            });
            return true;
        }
    }

    function setObjectPath(source, path, value) {
        const clone = parseJson(stringifyJson(source));
        const keys = String(path).split(".");
        let target = clone;
        keys.slice(0, -1).forEach((key) => {
            if (!isPlainObject(target[key])) target[key] = {};
            target = target[key];
        });
        target[keys[keys.length - 1]] = value;
        return clone;
    }

    function getChangedPaths(base, next, prefix = "") {
        if (isPlainObject(base) && isPlainObject(next)) {
            const keys = new Set([...Object.keys(base), ...Object.keys(next)]);
            return [...keys]
                .filter((key) => !UNSAFE_OBJECT_KEYS.has(key))
                .flatMap((key) =>
                    getChangedPaths(
                        base[key],
                        next[key],
                        prefix ? prefix + "." + key : key,
                    ),
                );
        }
        return stringifyJson(base) === stringifyJson(next) || !prefix ? [] : [prefix];
    }

    function applyChangedPaths(base, draft, paths) {
        return paths.reduce(
            (current, path) => setObjectPath(current, path, resolvePath(draft, path)),
            cloneFeatures(base),
        );
    }

    function formatFileSize(value) {
        const bytes = Number(value || 0);
        if (!Number.isFinite(bytes) || bytes <= 0) return "";
        const units = ["B", "KB", "MB", "GB"];
        let amount = bytes;
        let unit = units[0];
        for (let index = 1; index < units.length && amount >= 1024; index += 1) {
            amount /= 1024;
            unit = units[index];
        }
        return (amount >= 100 ? amount.toFixed(0) : amount.toFixed(1)) + " " + unit;
    }

    function getMediaCover(media) {
        const video = media?.video || {};
        return uniqueStrings([
            ...(Array.isArray(video.originCoverUrlList) ? [...video.originCoverUrlList].reverse() : []),
            ...(Array.isArray(video.coverUrlList) ? video.coverUrlList : []),
            ...(Array.isArray(media?.images?.[0]?.urlList) ?
                media.images[0].urlList : []),
        ])[0];
    }

    function getVideoResources(media) {
        const video = media?.video;
        if (!video) return [];
        const source = Array.isArray(video.bitRateList) ?
            video.bitRateList.filter(
                (item) => String(item?.format || "").toLowerCase() !== "dash",
            ) : [];
        const rows = source
            .map((item, index) => {
                const urls = variantUrls(item);
                return {
                    key: String(item?.gearName || item?.bitRate || index),
                    label: (variantQualityHeight(item) ?
                            variantQualityHeight(item) + "P" :
                            "") ||
                        String(item?.gearName || "视频"),
                    codec: isH265Variant(item) ? "H.265" : "H.264",
                    size: formatFileSize(item?.dataSize || item?.size),
                    urls,
                    width: Number(item?.width || 0),
                    height: Number(item?.height || 0),
                };
            })
            .filter((item) => item.urls.length)
            .sort((a, b) => b.width * b.height - a.width * a.height);
        if (rows.length) return rows;
        const urls = selectVideoVariants(video, "default", "default");
        return urls.length ? [{
            key: "default",
            label: "视频",
            codec: "",
            size: "",
            urls,
            width: Number(video.width || 0),
            height: Number(video.height || 0),
        }, ] : [];
    }

    function getImageResources(media) {
        return (Array.isArray(media?.images) ? media.images : [])
            .map((item, index) => ({
                key: String(index),
                index,
                urls: collectImageUrls(item),
            }))
            .filter((item) => item.urls.length);
    }

    function createUI(dependencies) {
        const runtime = uiRuntime;
        if (!runtime) return null;
        const {
            html,
            render,
            useEffect,
            useMemo,
            useRef,
            useState
        } = runtime;
        const {
            appConfig,
            downloader,
            mediaHandler
        } = dependencies;
        const trustedAction = (action) => (event) => {
            const currentTarget = getEventCurrentTarget(event);
            if (!isTrustedDialogEvent(event, currentTarget)) return;
            return action(Object.freeze({
                currentTarget
            }));
        };

        function Header({
            title,
            subtitle,
            onClose
        }) {
            return html`
<header class="dyx-header">
<div class="dyx-brand">
<h1 id="dyx-dialog-title">${title}</h1>
${subtitle ? html`<span>${subtitle}</span>` : null}
</div>
<button
type="button"
class="dyx-icon-button"
aria-label="关闭"
onClick=${onClose}
>
<span aria-hidden="true">×</span>
</button>
</header>
`;
        }

        function Tabs({
            items,
            value,
            onChange,
            idPrefix
        }) {
            const activate = (index, container) => {
                const item = items[index];
                if (!item) return;
                onChange(item.value);
                requestAnimationFrame(() => {
                    container
                        ?.querySelector(`#${idPrefix}-tab-${item.value}`)
                        ?.focus();
                });
            };
            const onKeyDown = (event) => {
                const currentIndex = items.findIndex((item) => item.value === value);
                let nextIndex = currentIndex;
                if (event.key === "ArrowRight") {
                    nextIndex = (currentIndex + 1) % items.length;
                } else if (event.key === "ArrowLeft") {
                    nextIndex = (currentIndex - 1 + items.length) % items.length;
                } else if (event.key === "Home") {
                    nextIndex = 0;
                } else if (event.key === "End") {
                    nextIndex = items.length - 1;
                } else {
                    return;
                }
                event.preventDefault();
                activate(nextIndex, event.currentTarget);
            };
            return html`
<nav
class="dyx-tabs"
role="tablist"
aria-label="页面"
onKeyDown=${onKeyDown}
>
${items.map(
(item) => html`
<button
key=${item.value}
id=${idPrefix + "-tab-" + item.value}
type="button"
role="tab"
aria-selected=${value === item.value}
aria-controls=${idPrefix + "-panel-" + item.value}
tabIndex=${value === item.value ? 0 : -1}
class=${"dyx-tab" + (value === item.value ? " is-active" : "")}
onClick=${() => onChange(item.value)}
>
${item.label}
</button>
`,
)}
</nav>
`;
        }

        function Section({
            title,
            children
        }) {
            return html`
<section class="dyx-section">
<h2 class="dyx-section-title">${title}</h2>
${children}
</section>
`;
        }

        function Field({
            label,
            children,
            wide = false
        }) {
            return html`
<label class=${"dyx-field" + (wide ? " dyx-field--wide" : "")}>
<span class="dyx-field-label">${label}</span>
${children}
</label>
`;
        }

        function Select({
            value,
            onChange,
            children,
            label,
            name
        }) {
            return html`
<select
class="dyx-select"
aria-label=${label}
name=${name}
value=${value}
onChange=${trustedAction((event) =>
onChange(event.currentTarget.value))}
>
${children}
</select>
`;
        }

        function SettingsApp({
            onClose,
            onCloseNow,
            registerCloseGuard
        }) {
            const createSettingsDraft = () => {
                return appConfig.clone();
            };
            const initialDraft = useRef(null);
            if (!initialDraft.current) initialDraft.current = createSettingsDraft();
            const baseDraft = useRef(cloneFeatures(initialDraft.current));
            const [tab, setTab] = useState("general");
            const [draft, setDraft] = useState(() =>
                cloneFeatures(initialDraft.current),
            );
            const [history, setHistory] = useState(() => DownloadHistory.get());
            const [confirmClear, setConfirmClear] = useState(false);
            const [confirmDiscard, setConfirmDiscard] = useState(false);
            const [confirmExternal, setConfirmExternal] = useState(false);
            const changedPaths = useMemo(
                () => getChangedPaths(baseDraft.current, draft),
                [draft],
            );
            const dirty = changedPaths.length > 0;
            useEffect(() => {
                registerCloseGuard(() => {
                    if (!dirty) return true;
                    setConfirmDiscard(true);
                    return false;
                });
                return () => registerCloseGuard(null);
            }, [dirty, registerCloseGuard]);
            useEffect(
                () =>
                appConfig.subscribe((features) => {
                    if (dirty) return;
                    const fresh = cloneFeatures(features);
                    baseDraft.current = cloneFeatures(fresh);
                    setDraft(fresh);
                }),
                [dirty],
            );
            const setValue = (path, value) => {
                setConfirmDiscard(false);
                setConfirmExternal(false);
                setDraft((current) => setObjectPath(current, path, value));
            };
            const save = () => {
                const current = appConfig.latestClone();
                const candidate = applyChangedPaths(current, draft, changedPaths);
                const externalChanged =
                    stringifyJson({
                        using_downloader: candidate.using_downloader,
                        downloader_config: candidate.downloader_config,
                    }) !==
                    stringifyJson({
                        using_downloader: current.using_downloader,
                        downloader_config: current.downloader_config,
                    });
                if (externalChanged && !confirmExternal) {
                    setConfirmExternal(true);
                    return;
                }
                if (appConfig.replace(candidate)) {
                    notify("设置已保存", {
                        type: "success"
                    });
                    onCloseNow();
                } else {
                    notify("保存失败", {
                        type: "error"
                    });
                }
            };
            const clearHistory = () => {
                if (!confirmClear) {
                    setConfirmClear(true);
                    return;
                }
                if (!DownloadHistory.clear()) {
                    notify("清空失败，请稍后重试", {
                        type: "error"
                    });
                    return;
                }
                setHistory([]);
                setConfirmClear(false);
                notify("历史已清空", {
                    type: "success"
                });
            };
            const downloaderType = draft.using_downloader;
            const external =
                downloaderType === "browser" ?
                null :
                draft.downloader_config?.[downloaderType] || {};
            const insecureExternalConnection =
                Boolean(external?.domain) &&
                String(external.domain).toLowerCase().startsWith("http://") &&
                !isLoopbackUrl(external.domain);
            return html`
<div class="dyx-shell">
<${Header}
title="设置"
onClose=${onClose}
/>
<${Tabs}
items=${[
{ value: "general", label: "常规" },
{ value: "downloader", label: "下载" },
{ value: "history", label: "历史" },
]}
value=${tab}
idPrefix="dyx-settings"
onChange=${(value) => {
setTab(value);
setConfirmClear(false);
setConfirmDiscard(false);
setConfirmExternal(false);
}}
/>
<section
id=${"dyx-settings-panel-" + tab}
class="dyx-content"
role="tabpanel"
aria-labelledby=${"dyx-settings-tab-" + tab}
>
${tab === "general"
? html`
<div class="dyx-stack">
<${Section} title="视频">
<div class="dyx-grid">
<${Field} label="下载画质">
<${Select}
label="下载画质"
name="video-quality"
value=${draft.download_video_mode}
onChange=${(value) =>
setValue("download_video_mode", value)}
>
<option value="max">最高画质</option>
<option value="4K">4K 优先</option>
<option value="2K">2K 优先</option>
<option value="1080P">1080P</option>
<option value="720P">720P</option>
<option value="540P">540P</option>
<option value="min">最低画质</option>
<option value="max_file">最大文件</option>
<option value="min_file">最小文件</option>
<option value="default">抖音默认</option>
</${Select}>
</${Field}>
<${Field} label="视频编码">
<${Select}
label="视频编码"
name="video-codec"
value=${draft.video_download_codecs}
onChange=${(value) =>
setValue("video_download_codecs", value)}
>
<option value="default">自动</option>
<option value="h264_prefer">优先 H.264</option>
<option value="h265_prefer">优先 H.265</option>
<option value="h264">仅 H.264</option>
<option value="h265">仅 H.265</option>
</${Select}>
</${Field}>
</div>
</${Section}>
<${Section} title="文件名">
<${Field} label="命名规则" wide=${true}>
<input
class="dyx-input"
name="filename-template"
autocomplete="off"
value=${draft.filename_template}
spellcheck="false"
onInput=${trustedAction((event) =>
setValue(
"filename_template",
event.currentTarget.value,
))}
/>
</${Field}>
<div class="dyx-code">
${"可用字段：${nickname} ${desc} ${create_date_YYYYMMDD} ${short_id} ${tags}"}
</div>
<${Field} label="最长字符">
<div class="dyx-range-row">
<input
class="dyx-range"
type="range"
name="filename-length"
aria-label="文件名最长字符"
min="24"
max="180"
value=${draft.filename_max_length}
onInput=${trustedAction((event) =>
setValue(
"filename_max_length",
Number(event.currentTarget.value),
))}
/>
<span class="dyx-range-value">
${draft.filename_max_length}
</span>
</div>
</${Field}>
</${Section}>
<${Section} title="图片">
<div class="dyx-grid dyx-grid--three">
<${Field} label="格式">
<${Select}
label="图片格式"
name="image-format"
value=${draft.image_convert_codecs}
onChange=${(value) =>
setValue("image_convert_codecs", value)}
>
<option value="default">保持原样</option>
<option value="jpg">JPG</option>
<option value="png">PNG</option>
<option value="webp">WebP</option>
</${Select}>
</${Field}>
<${Field} label="尺寸">
<${Select}
label="图片尺寸"
name="image-size"
value=${draft.image_resize_codecs}
onChange=${(value) =>
setValue("image_resize_codecs", value)}
>
<option value="default">保持原样</option>
<option value="2k_max">最长边 2048</option>
<option value="1k_max">最长边 1024</option>
<option value="960_max">最长边 960</option>
<option value="640_max">最长边 640</option>
<option value="512_max">最长边 512</option>
</${Select}>
</${Field}>
<${Field} label="质量">
<div class="dyx-range-row">
<input
class="dyx-range"
type="range"
name="image-quality"
aria-label="图片质量"
min="20"
max="100"
value=${draft.image_quality}
onInput=${trustedAction((event) =>
setValue(
"image_quality",
Number(event.currentTarget.value),
))}
/>
<span class="dyx-range-value">
${draft.image_quality}
</span>
</div>
</${Field}>
</div>
</${Section}>
</div>
`
: null}
${tab === "downloader"
? html`
<div class="dyx-stack">
<${Section} title="下载器">
<${Field} label="保存方式">
<${Select}
label="保存方式"
name="downloader-type"
value=${draft.using_downloader}
onChange=${(value) =>
setValue("using_downloader", value)}
>
<option value="browser">浏览器</option>
<option value="abdm">AB Download Manager</option>
<option value="aria2">本机 Aria2</option>
</${Select}>
</${Field}>
</${Section}>
${
external
? html`
<${Section} title="连接">
<div class="dyx-grid">
<${Field} label="地址">
${downloaderType === "aria2"
? html`<span class="dyx-static-value">本机</span>`
: html`
<input
class="dyx-input"
type="url"
name=${downloaderType + "-domain"}
autocomplete="off"
spellcheck="false"
value=${external.domain || ""}
onInput=${trustedAction((event) =>
setValue(
"downloader_config." +
downloaderType +
".domain",
event.currentTarget.value,
))}
/>`}
</${Field}>
<${Field} label="端口">
<input
class="dyx-input"
type="number"
name=${downloaderType + "-port"}
min="1"
max="65535"
autocomplete="off"
inputmode="numeric"
value=${external.port || ""}
onInput=${trustedAction((event) =>
setValue(
"downloader_config." +
downloaderType +
".port",
event.currentTarget.value,
))}
/>
</${Field}>
${
downloaderType === "aria2"
? html`
<${Field} label="路径">
<input
class="dyx-input"
name="aria2-path"
autocomplete="off"
spellcheck="false"
value=${external.path || "/jsonrpc"}
onInput=${trustedAction((event) =>
setValue(
"downloader_config.aria2.path",
event.currentTarget.value,
))}
/>
</${Field}>
`
: null
}
</div>
</${Section}>
<${Section} title="目录">
<div class="dyx-grid">
${[
["video", "视频"],
["image", "图片"],
["other", "其他"],
].map(
([key, label]) => html`
<${Field} key=${key} label=${label}>
<input
class="dyx-input"
name=${downloaderType + "-dir-" + key}
autocomplete="off"
spellcheck="false"
value=${external.dir?.[key] || ""}
onInput=${trustedAction((event) =>
setValue(
"downloader_config." +
downloaderType +
".dir." +
key,
event.currentTarget.value,
))}
/>
</${Field}>
`,
)}
</div>
</${Section}>
`
: null
}
</div>
`
: null}
${tab === "history"
? history.length
? html`
<div class="dyx-history">
${history.map(
(item) => html`
<article class="dyx-history-item" key=${item.id}>
<div class="dyx-history-main">
<div class="dyx-history-title">
${item.desc || "未命名作品"}
</div>
<div class="dyx-history-meta">
${[
item.author,
formatDate(
new Date(item.downloadTime),
"YYYY-MM-DD HH:mm",
),
]
.filter(Boolean)
.join(" · ")}
</div>
</div>
${item.shareUrl
? html`
<a
class="dyx-button dyx-button--text"
href=${item.shareUrl}
target="_blank"
rel="noopener noreferrer"
>
打开
</a>
`
: null}
</article>
`,
)}
</div>
`
: html`<div class="dyx-empty">下载作品后会显示在这里</div>`
: null}
</section>
<footer class="dyx-actions">
${confirmDiscard
? html`<strong class="dyx-actions-message">放弃未保存的更改？</strong>`
: confirmExternal
? html`<strong class="dyx-actions-message">${insecureExternalConnection
? "连接未加密，仍要保存？"
: "确认修改下载连接？"}</strong>`
: null}
${!confirmDiscard && tab === "history" && history.length
? html`
<button
type="button"
class=${"dyx-button " +
(confirmClear ? "dyx-button--danger" : "dyx-button--text")}
onClick=${trustedAction(clearHistory)}
>
${confirmClear ? "确认清空" : "清空历史"}
</button>
`
: null}
<span class="dyx-actions-spacer"></span>
${!confirmDiscard &&
(tab === "general" || tab === "downloader")
? html`
<button
type="button"
class="dyx-button dyx-button--text"
onClick=${trustedAction(() => {
setConfirmDiscard(false);
setConfirmExternal(false);
setDraft(cloneFeatures());
})}
>
恢复默认
</button>
`
: null}
${confirmDiscard
? html`
<button
type="button"
class="dyx-button"
onClick=${trustedAction(() => setConfirmDiscard(false))}
>
继续编辑
</button>
<button
type="button"
class="dyx-button dyx-button--danger"
onClick=${trustedAction(onCloseNow)}
>
放弃
</button>
`
: dirty
? html`
<button type="button" class="dyx-button" onClick=${onClose}>
取消
</button>
<button
type="button"
class="dyx-button dyx-button--primary"
onClick=${trustedAction(save)}
>
${confirmExternal ? "确认保存" : "保存"}
</button>
`
: html`
<button type="button" class="dyx-button" onClick=${onClose}>
关闭
</button>
`}
</footer>
</div>
`;
        }

        function MediaApp({
            media,
            onClose
        }) {
            const [tab, setTab] = useState("resources");
            const [busy, setBusy] = useState("");
            const busyRef = useRef(false);
            const videos = useMemo(() => getVideoResources(media), [media]);
            const images = useMemo(() => getImageResources(media), [media]);
            const cover = getMediaCover(media);
            const filename = mediaHandler.buildFilename(media);
            const hasResources = videos.length > 0 || images.length > 0;
            const run = async (key, task, successMessage = "下载已开始") => {
                if (busyRef.current) return;
                busyRef.current = true;
                setBusy(key);
                try {
                    const ok = await task();
                    if (ok && successMessage) {
                        notify(successMessage, {
                            type: "success"
                        });
                    }
                    return ok;
                } catch (error) {
                    console.error(APP.logPrefix, "作品操作失败", error);
                    notify("操作失败，请稍后重试", {
                        type: "error"
                    });
                    return false;
                } finally {
                    busyRef.current = false;
                    setBusy("");
                }
            };
            const downloadDirect = async (resource, name, kind) => {
                const ok = await downloader.downloadFile(
                    resource.urls[0],
                    name,
                    resource.urls.slice(1), {
                        kind,
                        media
                    },
                );
                if (ok) DownloadHistory.add(media);
                return ok;
            };
            return html`
<div class="dyx-shell">
<${Header}
title="作品详情"
subtitle=${media.authorInfo?.nickname || ""}
onClose=${onClose}
/>
<${Tabs}
items=${[
{ value: "resources", label: "资源" },
{ value: "info", label: "信息" },
]}
value=${tab}
onChange=${setTab}
idPrefix="dyx-media"
/>
<section
id=${"dyx-media-panel-" + tab}
class="dyx-content"
role="tabpanel"
aria-labelledby=${"dyx-media-tab-" + tab}
>
${tab === "resources"
? html`
<div class="dyx-stack">
<section class="dyx-summary">
${cover
? html`
<img
class="dyx-summary-cover"
src=${cover}
alt=""
width="232"
height="174"
/>
`
: html`<div class="dyx-summary-cover"></div>`}
<div class="dyx-summary-copy">
<h2>${media.desc || "未命名作品"}</h2>
<p>
${images.length
? images.length + " 张图片"
: videos.length
? videos.length + " 个视频版本"
: "暂无可用资源"}
</p>
</div>
<button
type="button"
class="dyx-button dyx-button--primary"
aria-busy=${busy === "primary"}
disabled=${Boolean(busy) || !hasResources}
onClick=${trustedAction(() =>
run(
"primary",
() => mediaHandler.downloadCurrentMedia(media),
"",
))}
>
${busy === "primary" ? "下载中" : "下载作品"}
</button>
</section>
${videos.length
? html`
<${Section} title="视频">
<div class="dyx-resource-list">
${videos.map(
(resource, index) => html`
<article
class="dyx-resource"
key=${resource.key}
>
<div class="dyx-resource-main">
<strong>${resource.label}</strong>
${resource.codec
? html`<span>${resource.codec}</span>`
: null}
${resource.size
? html`<span>${resource.size}</span>`
: null}
</div>
<button
type="button"
class="dyx-button"
aria-busy=${busy === "video-" + index}
disabled=${Boolean(busy)}
onClick=${trustedAction(() =>
run("video-" + index, () =>
downloadDirect(
resource,
filename +
"_" +
resource.label +
"_" +
resource.codec,
"video",
),
))}
>
${busy === "video-" + index
? "下载中"
: "下载"}
</button>
</article>
`,
)}
</div>
</${Section}>
`
: null}
${images.length
? html`
<${Section} title="图集">
<div class="dyx-media-grid">
${images.map(
(resource) => html`
<article
class="dyx-media-card"
key=${resource.key}
>
<img
loading="lazy"
src=${resource.urls[0]}
alt=${"图集第 " +
(resource.index + 1) +
" 张"}
width="320"
height="320"
/>
<footer>
<span>第 ${resource.index + 1} 张</span>
<button
type="button"
class="dyx-button dyx-button--text"
aria-busy=${busy ===
"image-" + resource.index}
disabled=${Boolean(busy)}
onClick=${trustedAction(() =>
run("image-" + resource.index, () =>
downloadDirect(
resource,
filename +
"_" +
(resource.index + 1),
"image",
),
))}
>
${busy === "image-" + resource.index
? "下载中"
: "下载"}
</button>
</footer>
</article>
`,
)}
</div>
</${Section}>
`
: null}
${!hasResources
? html`<div class="dyx-empty">请刷新作品后重试</div>`
: null}
</div>
`
: null}
${tab === "info"
? html`
<dl class="dyx-info">
${[
["作者", media.authorInfo?.nickname || ""],
["作品 ID", media.awemeId || media.groupId || ""],
[
"发布时间",
media.createTime
? formatDate(
new Date(Number(media.createTime) * 1000),
"YYYY-MM-DD HH:mm:ss",
)
: "",
],
["音乐", media.music?.musicName || ""],
["描述", media.desc || ""],
].map(
([label, value]) => html`
<div class="dyx-kv" key=${label}>
<dt>${label}</dt>
<dd>${value || "—"}</dd>
</div>
`,
)}
</dl>
`
: null}
</section>
<footer class="dyx-actions">
<span class="dyx-actions-spacer"></span>
<button type="button" class="dyx-button" onClick=${onClose}>
关闭
</button>
</footer>
</div>
`;
        }

        function mount(Component, props, options = {}) {
            let dialog = null;
            let closeGuard = null;
            const registerCloseGuard = (guard) => {
                closeGuard = typeof guard === "function" ? guard : null;
            };
            const requestClose = () => dialog?.requestClose();
            const closeNow = () => dialog?.close();
            dialog = new Dialog({
                wide: options.wide,
                fixed: options.fixed,
                label: options.label,
                onRequestClose: () => closeGuard?.() !== false,
                onBeforeClose: () => {
                    if (dialog?.dialog) render(null, dialog.dialog);
                },
            });
            render(
                html`<${Component}
...${props}
onClose=${requestClose}
onCloseNow=${closeNow}
registerCloseGuard=${registerCloseGuard}
/>`,
                dialog.dialog,
            );
            dialog.open();
            return dialog;
        }
        return {
            openSettings() {
                return mount(SettingsApp, {}, {
                    label: "DouYinX 设置",
                    fixed: true
                });
            },
            openMedia(media) {
                if (!media) {
                    notify("请先打开一个作品", {
                        type: "error"
                    });
                    return null;
                }
                const mediaSnapshot = snapshotMedia(media);
                if (!mediaSnapshot) return null;
                return mount(
                    MediaApp, {
                        media: mediaSnapshot
                    }, {
                        label: "作品详情",
                        wide: true,
                        fixed: true
                    },
                );
            },
        };
    }
    class PlayerControl {
        constructor(options) {
            this.options = options;
            this.root = null;
            this.menu = null;
            this.mainButton = null;
            this.moreButton = null;
            this.open = false;
            this.unsubscribe = null;
            this.onDocumentPointerDown = (event) => {
                if (this.open && !this.root?.contains(event.target))
                    this.setOpen(false);
            };
            this.onDocumentKeyDown = (event) => {
                if (event.key === "Escape" && this.open) {
                    this.setOpen(false);
                }
            };
            this.onMenuKeyDown = (event) => {
                if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                    return;
                }
                const items = Array.from(
                    this.menu?.querySelectorAll("button:not(:disabled)") || [],
                );
                if (!items.length) return;
                event.preventDefault();
                const currentIndex = items.indexOf(document.activeElement);
                let nextIndex = currentIndex;
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End") nextIndex = items.length - 1;
                if (event.key === "ArrowDown") {
                    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
                }
                if (event.key === "ArrowUp") {
                    nextIndex =
                        currentIndex < 0 ?
                        items.length - 1 :
                        (currentIndex - 1 + items.length) % items.length;
                }
                items[nextIndex]?.focus();
            };
        }
        isCurrentPlayerContext() {
            const playerLocator = this.options.mediaHandler.playerLocator;
            const player = this.options.mediaHandler.player;
            if (
                player &&
                !playerLocator.isPlayerBoundToCurrentVideo(player, document)
            ) {
                return false;
            }
            const currentRoot =
                playerLocator.getCurrentVideoRoot(document) ||
                playerLocator.getPlayerRoot(player);
            if (currentRoot) return currentRoot === this.options.playerRoot;
            const roots = document.querySelectorAll("xg-player, .xgplayer");
            return roots.length === 1 && roots[0] === this.options.playerRoot;
        }
        createButton(label, action, options = {}) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "dyx-menu-item";
            button.setAttribute("role", "menuitem");
            const iconMap = {
                "\u4f5c\u54c1\u8be6\u60c5": "\u25c9",
                "\u4e0b\u8f7d\u5c01\u9762": "\u25a7",
                "\u590d\u5236\u753b\u9762": "\u25a3",
                "\u4e0b\u8f7d\u753b\u9762": "\u2193",
                "\u8bbe\u7f6e": "\u2699",
            };
            button.dataset.icon = iconMap[label] || "\u2022";
            button.textContent = label;
            if (options.requiresMedia !== false) {
                button.dataset.requiresMedia = "true";
            }
            button.addEventListener("click", async (event) => {
                if (!isTrustedEventFor(event, button) || button.disabled) return;
                event.stopPropagation();
                if (
                    options.requiresMedia !== false &&
                    !this.isCurrentPlayerContext()
                ) {
                    this.setOpen(false);
                    notify("请先播放当前作品", {
                        type: "error"
                    });
                    return;
                }
                button.disabled = true;
                button.setAttribute("aria-busy", "true");
                this.setOpen(false);
                try {
                    await action();
                } catch (error) {
                    console.error(APP.logPrefix, "菜单操作失败", error);
                    notify("操作失败，请稍后重试", {
                        type: "error"
                    });
                } finally {
                    button.disabled = false;
                    button.removeAttribute("aria-busy");
                    this.moreButton?.focus();
                }
            });
            return button;
        }
        render() {
            const {
                mediaHandler,
                videoHandler,
                ui
            } = this.options;
            const root = document.createElement("xg-icon");
            root.className = "dyx-player-control";
            root.setAttribute("data-state", "active");
            root.setAttribute("data-index", "9.5");
            const mainButton = document.createElement("button");
            mainButton.type = "button";
            mainButton.className = "dyx-control-button";
            mainButton.textContent = "下载";
            mainButton.setAttribute("aria-label", "下载当前作品");
            mainButton.addEventListener("click", (event) => {
                if (!isTrustedEventFor(event, mainButton) || mainButton.disabled) return;
                event.stopPropagation();
                if (!this.isCurrentPlayerContext()) {
                    notify("请先播放当前作品", {
                        type: "error"
                    });
                    return;
                }
                void mediaHandler.downloadCurrentMedia();
            });
            const moreButton = document.createElement("button");
            moreButton.type = "button";
            moreButton.className = "dyx-control-button dyx-control-button--more";
            moreButton.textContent = "•••";
            moreButton.setAttribute("aria-label", "更多");
            moreButton.setAttribute("aria-haspopup", "menu");
            moreButton.setAttribute("aria-expanded", "false");
            moreButton.addEventListener("click", (event) => {
                if (!isTrustedEventFor(event, moreButton)) return;
                event.stopPropagation();
                this.setOpen(!this.open);
            });
            moreButton.addEventListener("keydown", (event) => {
                if (
                    !isTrustedEventFor(event, moreButton) ||
                    !["Enter", " ", "ArrowDown", "ArrowUp", "Home", "End"].includes(
                        event.key,
                    )
                ) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                const shouldOpen = !["Enter", " "].includes(event.key) || !this.open;
                this.setOpen(shouldOpen);
                if (!shouldOpen) return;
                const items = Array.from(
                    this.menu?.querySelectorAll("button:not(:disabled)") || [],
                );
                const useLast = event.key === "ArrowUp" || event.key === "End";
                (useLast ? items.at(-1) : items[0])?.focus();
            });
            const menu = document.createElement("div");
            menu.className = "dyx-player-menu";
            menu.setAttribute("role", "menu");
            menu.setAttribute("aria-hidden", "true");
            menu.inert = true;
            menu.addEventListener("keydown", this.onMenuKeyDown);
            [
                this.createButton("作品详情", () =>
                    ui.openMedia(mediaHandler.currentMedia),
                ),
                this.createButton("下载封面", async () => {
                    const ok = await mediaHandler.downloadThumb();
                    if (ok) notify("封面已开始下载", {
                        type: "success"
                    });
                }),
                this.createButton("复制画面", () =>
                    videoHandler.copy(this.options.playerRoot),
                ),
                this.createButton("下载画面", () =>
                    videoHandler.download(this.options.playerRoot),
                ),
            ].forEach((button) => menu.appendChild(button));
            const separator = document.createElement("div");
            separator.className = "dyx-menu-separator";
            separator.setAttribute("role", "separator");
            menu.appendChild(separator);
            menu.appendChild(
                this.createButton("设置", () => ui.openSettings(), {
                    requiresMedia: false,
                }),
            );
            root.append(mainButton, moreButton, menu);
            this.root = root;
            this.menu = menu;
            this.mainButton = mainButton;
            this.moreButton = moreButton;
            this.unsubscribe = mediaHandler.subscribe(({
                downloading,
                media
            }) => {
                mainButton.disabled = downloading || !media;
                mainButton.setAttribute("aria-busy", String(downloading));
                mainButton.textContent = downloading ? "下载中" : "下载";
                menu
                    .querySelectorAll("[data-requires-media='true']")
                    .forEach((button) => {
                        button.disabled = !media;
                    });
            });
            document.addEventListener(
                "pointerdown",
                this.onDocumentPointerDown,
                true,
            );
            document.addEventListener("keydown", this.onDocumentKeyDown, true);
            return root;
        }
        setOpen(value) {
            if (!value && this.menu?.contains(document.activeElement)) {
                this.moreButton?.focus();
            }
            this.open = Boolean(value);
            this.menu?.classList.toggle("is-open", this.open);
            this.menu?.setAttribute("aria-hidden", String(!this.open));
            if (this.menu) this.menu.inert = !this.open;
            this.moreButton?.setAttribute("aria-expanded", String(this.open));
        }
        destroy() {
            this.unsubscribe?.();
            this.menu?.removeEventListener("keydown", this.onMenuKeyDown);
            document.removeEventListener(
                "pointerdown",
                this.onDocumentPointerDown,
                true,
            );
            document.removeEventListener("keydown", this.onDocumentKeyDown, true);
            this.root?.remove();
        }
    }
    class DOMPatcher {
        constructor(options) {
            this.options = options;
            this.controls = new Map();
            this.queued = false;
            this.rafId = 0;
            this.running = false;
            this.pendingRoots = new Set();
            this.liveRoots = new Set();
            this.liveStateObserver = new MutationObserver((records) => {
                records.forEach((record) => {
                    record.target
                        .querySelectorAll("xg-controls")
                        .forEach((controls) => this.patchControls(controls));
                });
            });
            this.observer = new MutationObserver((records) => {
                const roots = records.flatMap((record) =>
                    Array.from(record.addedNodes).filter(
                        (node) =>
                        node.nodeType === Node.ELEMENT_NODE &&
                        !node.matches?.(
                            ".dyx-overlay, .dyx-toast-region, .dyx-player-control",
                        ) &&
                        !node.closest?.(".dyx-overlay, .dyx-toast-region"),
                    ),
                );
                this.pruneControls();
                if (roots.length) this.scheduleScan(roots);
            });
        }
        start() {
            if (this.running) return;
            this.running = true;
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            this.scan(document);
        }
        stop() {
            this.running = false;
            this.observer.disconnect();
            this.liveStateObserver.disconnect();
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = 0;
            this.queued = false;
            this.controls.forEach((control, controls) => {
                control.destroy();
                this.clearControlHost(controls);
            });
            this.controls.clear();
            this.pendingRoots.clear();
            this.liveRoots.clear();
        }
        clearControlHost(controls) {
            const rightGrid = controls.querySelector(".xg-right-grid");
            rightGrid?.classList.remove("dyx-control-host");
            rightGrid?.parentElement?.classList.remove("dyx-controls-patched");
        }
        pruneControls() {
            this.controls.forEach((control, controls) => {
                if (controls.isConnected && control.root?.isConnected) return;
                control.destroy();
                this.clearControlHost(controls);
                this.controls.delete(controls);
            });
            const connectedLiveRoots = [...this.liveRoots].filter(
                (root) => root.isConnected,
            );
            if (connectedLiveRoots.length !== this.liveRoots.size) {
                this.liveStateObserver.disconnect();
                this.liveRoots = new Set(connectedLiveRoots);
                connectedLiveRoots.forEach((root) =>
                    this.liveStateObserver.observe(root, {
                        attributes: true,
                        attributeFilter: ["class"],
                    }));
            }
        }
        scheduleScan(roots) {
            if (!this.running) return;
            roots.forEach((root) => this.pendingRoots.add(root));
            if (this.queued) return;
            this.queued = true;
            this.rafId = requestAnimationFrame(() => {
                this.rafId = 0;
                this.queued = false;
                if (!this.running) return;
                const pending = Array.from(this.pendingRoots);
                this.pendingRoots.clear();
                if (!pending.length) return;
                pending.forEach((root) => this.scan(root));
            });
        }
        scan(root) {
            if (!(root instanceof Element || root instanceof Document)) return;
            const controlNodes = new Set();
            if (root instanceof Element) {
                const ownerControls =
                    root.localName === "xg-controls" ? root : root.closest("xg-controls");
                if (ownerControls) controlNodes.add(ownerControls);
            }
            root
                .querySelectorAll("xg-controls")
                .forEach((controls) => controlNodes.add(controls));
            controlNodes.forEach((controls) => this.patchControls(controls));
            this.patchImageViewer(root);
        }
        placePlayerControl(rightGrid, node) {
            const autoplay = rightGrid.querySelector(
                ":scope > .xgplayer-autoplay-setting, [data-e2e='video-player-auto-play']",
            );
            const reversed =
                getComputedStyle(rightGrid).flexDirection === "row-reverse";
            if (autoplay) {
                let anchor = autoplay;
                while (anchor.parentElement && anchor.parentElement !== rightGrid) {
                    anchor = anchor.parentElement;
                }
                if (anchor.parentElement !== rightGrid) anchor = null;
                if (!anchor) return;
                const expectedSibling = reversed ?
                    anchor.nextElementSibling :
                    anchor.previousElementSibling;
                if (expectedSibling !== node) {
                    if (reversed) anchor.after(node);
                    else anchor.before(node);
                }
                return;
            }
            if (reversed) {
                if (rightGrid.lastElementChild !== node) rightGrid.append(node);
            } else if (rightGrid.firstElementChild !== node) {
                rightGrid.prepend(node);
            }
        }
        patchControls(controls) {
            const rightGrid = controls.querySelector(".xg-right-grid");
            if (!rightGrid) return;
            const playerRoot = controls.closest("xg-player, .xgplayer");
            if (playerRoot && !this.liveRoots.has(playerRoot)) {
                this.liveRoots.add(playerRoot);
                this.liveStateObserver.observe(playerRoot, {
                    attributes: true,
                    attributeFilter: ["class"],
                });
            }
            const currentPlayer = this.options.mediaHandler.player;
            const playerLocator = this.options.mediaHandler.playerLocator;
            const ownedPlayerRoot = playerLocator.getPlayerRoot(currentPlayer);
            const visibleVideoRoot = playerLocator.getCurrentVideoRoot(document);
            const currentRoot =
                currentPlayer?.config?.isLive ?
                ownedPlayerRoot :
                visibleVideoRoot || ownedPlayerRoot;
            const roots = document.querySelectorAll("xg-player, .xgplayer");
            const isCurrentRoot = currentRoot ?
                currentRoot === playerRoot :
                roots.length === 1 && roots[0] === playerRoot;
            const isLive =
                playerRoot?.classList.contains("xgplayer-live") ||
                (isCurrentRoot && currentPlayer?.config?.isLive);
            const existing = rightGrid.querySelector(":scope > .dyx-player-control");
            if (isLive) {
                const control = this.controls.get(controls);
                if (control) control.destroy();
                else existing?.remove();
                this.controls.delete(controls);
                this.clearControlHost(controls);
                return;
            }
            rightGrid.classList.add("dyx-control-host");
            rightGrid.parentElement?.classList.add("dyx-controls-patched");
            if (existing) {
                this.placePlayerControl(rightGrid, existing);
                return;
            }
            this.controls.get(controls)?.destroy();
            const control = new PlayerControl({
                ...this.options,
                playerRoot
            });
            const node = control.render();
            this.placePlayerControl(rightGrid, node);
            this.controls.set(controls, control);
        }
        patchImageViewer(root) {
            const closeSelector = "#svg_icon_ic_close, [aria-label='关闭']";
            const closeNodes = new Set();
            if (root instanceof Element && root.matches(closeSelector)) {
                closeNodes.add(root);
            }
            root
                .querySelectorAll(closeSelector)
                .forEach((close) => closeNodes.add(close));
            const candidates = new Set();
            closeNodes.forEach((close) => {
                const candidate = close.closest(
                    "[role='dialog'], .semi-portal, body > div",
                );
                if (candidate && !candidate.closest(".dyx-overlay")) {
                    candidates.add(candidate);
                }
            });
            candidates.forEach((candidate) => {
                if (candidate.querySelector(".dyx-image-action")) return;
                const images = Array.from(candidate.querySelectorAll("img")).filter(
                    (image) => image.currentSrc || image.src,
                );
                if (!images.length) return;
                const image = images.sort((a, b) => {
                    const areaA = a.clientWidth * a.clientHeight;
                    const areaB = b.clientWidth * b.clientHeight;
                    return areaB - areaA;
                })[0];
                if (image.clientWidth < 240 || image.clientHeight < 240) return;
                const container = image.parentElement;
                if (!container) return;
                if (getComputedStyle(container).position === "static") {
                    container.classList.add("dyx-image-host");
                }
                const button = document.createElement("button");
                button.type = "button";
                button.className = "dyx-button dyx-button--primary dyx-image-action";
                button.textContent = "下载图片";
                button.addEventListener("click", async (event) => {
                    if (!isTrustedEventFor(event, button) || button.disabled) return;
                    event.stopPropagation();
                    button.disabled = true;
                    button.setAttribute("aria-busy", "true");
                    button.textContent = "下载中";
                    const source = image.currentSrc || image.src;
                    try {
                        const ok = await this.options.downloader.downloadFile(
                            source,
                            "抖音图片_" + formatDate(new Date(), "YYYYMMDD_HHmmss"),
                            [], {
                                kind: "image",
                                media: this.options.mediaHandler.currentMedia
                            },
                        );
                        if (ok) notify("图片已开始下载", {
                            type: "success"
                        });
                    } finally {
                        button.disabled = false;
                        button.removeAttribute("aria-busy");
                        button.textContent = "下载图片";
                    }
                });
                container.appendChild(button);
            });
        }
    }
    class HotkeyManager {
        constructor() {
            this.disposers = [];
        }
        add(key, callback) {
            const handler = (event) => {
                const keyboard = getKeyboardEventState(event);
                if (
                    !keyboard ||
                    !isTrustedEventFor(event, document) ||
                    keyboard.defaultPrevented ||
                    keyboard.repeat ||
                    keyboard.metaKey ||
                    keyboard.ctrlKey ||
                    keyboard.altKey ||
                    Dialog.active ||
                    (keyboard.key !== key && keyboard.key !== key.toUpperCase())
                ) {
                    return;
                }
                const active = document.activeElement;
                if (
                    active?.matches("input, textarea, select, [role='textbox']") ||
                    active?.isContentEditable
                ) {
                    return;
                }
                event.preventDefault();
                callback();
            };
            document.addEventListener("keydown", handler);
            this.disposers.push(() =>
                document.removeEventListener("keydown", handler),
            );
        }
        destroy() {
            this.disposers.splice(0).forEach((dispose) => dispose());
        }
    }
    let runtimeStarted = false;

    function bootstrap() {
        if (runtimeStarted) return;
        runtimeStarted = true;
        const downloader = new Downloader(config);
        const playerLocator = new PlayerLocator();
        const mediaHandler = new MediaHandler(downloader, playerLocator, config);
        const videoHandler = new VideoHandler(downloader, mediaHandler);
        const ui = createUI({
            appConfig: config,
            downloader,
            mediaHandler
        });
        if (!ui) {
            runtimeStarted = false;
            console.error(APP.logPrefix, "界面运行库未加载");
            return;
        }
        if (config.hadLegacyAria2Secret) {
            notify("本机 Aria2 不再使用 RPC 密钥，请检查连接");
        }
        const domPatcher = new DOMPatcher({
            downloader,
            mediaHandler,
            videoHandler,
            ui
        });
        const hotkeys = new HotkeyManager();
        hotkeys.add("m", () => mediaHandler.downloadCurrentMedia());
        mediaHandler.start();
        domPatcher.start();
        console.info(APP.logPrefix, APP.version, "已启动");
    }
    if (document.body) {
        bootstrap();
    } else {
        window.addEventListener("DOMContentLoaded", bootstrap, {
            once: true
        });
    }
})();