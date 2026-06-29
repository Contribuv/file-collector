import { DEFAULT_RENDERER_DEFINITIONS } from '@file-viewer/core';
import FlyfishFileViewerWeb, { createViewerControllerHandle, FileViewerElement, FILE_VIEWER_ELEMENT_TAG, mountViewer as mountBaseViewer } from '@file-viewer/web';
export * from '@file-viewer/web';
export { createViewerControllerHandle, FileViewerElement, FILE_VIEWER_ELEMENT_TAG };
const rendererGlobalKey = 'FlyfishFileViewerWebFullRenderers';
const lazyRendererLines = [
    { key: 'word', label: 'Word renderer', scriptName: 'word.iife.js', rendererIds: ['office-word-openxml', 'office-word-binary', 'open-document'] },
    { key: 'pdf', label: 'PDF renderer', scriptName: 'pdf.iife.js', rendererIds: ['pdf'] },
    { key: 'ofd', label: 'OFD renderer', scriptName: 'ofd.iife.js', rendererIds: ['ofd'] },
    { key: 'presentation', label: 'Presentation renderer', scriptName: 'presentation.iife.js', rendererIds: ['office-presentation'] },
    { key: 'spreadsheet', label: 'Spreadsheet renderer', scriptName: 'spreadsheet.iife.js', rendererIds: ['spreadsheet-openxml'] },
    { key: 'cad', label: 'CAD renderer', scriptName: 'cad.iife.js', rendererIds: ['cad'] },
    { key: 'typst', label: 'Typst renderer', scriptName: 'typst.iife.js', rendererIds: ['typst'] },
    { key: 'drawing', label: 'Drawing renderer', scriptName: 'drawing.iife.js', rendererIds: ['drawing'] },
    { key: 'model', label: '3D model renderer', scriptName: 'model.iife.js', rendererIds: ['model'] },
    { key: 'archive', label: 'Archive renderer', scriptName: 'archive.iife.js', rendererIds: ['archive'] },
    { key: 'email', label: 'Email renderer', scriptName: 'email.iife.js', rendererIds: ['email'] },
    { key: 'ebook', label: 'Ebook renderer', scriptName: 'ebook.iife.js', rendererIds: ['epub', 'umd'] },
    { key: 'text', label: 'Text renderer', scriptName: 'text.iife.js', rendererIds: ['code', 'markdown'] },
    { key: 'image', label: 'Image renderer', scriptName: 'image.iife.js', rendererIds: ['image'] },
    { key: 'media', label: 'Media renderer', scriptName: 'media.iife.js', rendererIds: ['audio', 'video'] },
    { key: 'mindmap', label: 'Mind map renderer', scriptName: 'mindmap.iife.js', rendererIds: ['mindmap'] },
    { key: 'geo', label: 'Geo renderer', scriptName: 'geo.iife.js', rendererIds: ['geo'] },
    { key: 'data', label: 'Data asset renderer', scriptName: 'data.iife.js', rendererIds: ['data-asset'] },
    { key: 'eda', label: 'EDA renderer', scriptName: 'eda.iife.js', rendererIds: ['eda'] }
];
const lazyRendererById = new Map();
const lazyRendererByExtension = new Map();
const rendererScriptPromises = new Map();
for (const line of lazyRendererLines) {
    for (const rendererId of line.rendererIds) {
        lazyRendererById.set(rendererId, line);
    }
}
for (const definition of DEFAULT_RENDERER_DEFINITIONS) {
    const line = lazyRendererById.get(definition.id);
    if (!line) {
        continue;
    }
    for (const extension of definition.extensions) {
        lazyRendererByExtension.set(extension, line);
    }
}
let defaultFullAssetBaseUrl = detectCurrentScriptBaseUrl();
function normalizeAssetBaseUrl(baseUrl) {
    if (!baseUrl) {
        return undefined;
    }
    const value = String(baseUrl).trim();
    if (!value) {
        return undefined;
    }
    return value.endsWith('/') ? value : `${value}/`;
}
function detectCurrentScriptBaseUrl() {
    if (typeof document === 'undefined') {
        return undefined;
    }
    const currentScript = document.currentScript;
    const scripts = Array.from(document.scripts);
    const script = (currentScript === null || currentScript === void 0 ? void 0 : currentScript.src)
        ? currentScript
        : scripts.reverse().find(item => /(?:@file-viewer\/web-full|flyfish-file-viewer-web-full)/.test(item.src));
    if (!(script === null || script === void 0 ? void 0 : script.src)) {
        return undefined;
    }
    try {
        return new URL('./', script.src).href;
    }
    catch {
        return undefined;
    }
}
function createFullAssetOptions(assetBaseUrl) {
    const baseUrl = normalizeAssetBaseUrl(assetBaseUrl);
    if (!baseUrl) {
        return {};
    }
    return {
        archive: {
            workerUrl: `${baseUrl}vendor/libarchive/worker-bundle.js`,
            wasmUrl: `${baseUrl}vendor/libarchive/libarchive.wasm`
        },
        cad: {
            wasmPath: `${baseUrl}wasm/cad/`,
            workerUrl: `${baseUrl}wasm/cad/dwg-worker.js`,
            dwfWasmUrl: `${baseUrl}wasm/cad/dwfv-render.wasm`
        },
        data: {
            sqlWasmUrl: `${baseUrl}wasm/data/sql-wasm.wasm`
        },
        docx: {
            workerUrl: `${baseUrl}vendor/docx/docx.worker.js`,
            workerJsZipUrl: `${baseUrl}vendor/docx/jszip.min.js`
        },
        drawing: {
            viewerScriptUrl: `${baseUrl}vendor/drawio/viewer-static.min.js`
        },
        pdf: {
            workerUrl: `${baseUrl}vendor/pdf/pdf.worker.mjs`,
            cMapUrl: `${baseUrl}vendor/pdf/cmaps/`,
            wasmUrl: `${baseUrl}vendor/pdf/wasm/`,
            standardFontDataUrl: `${baseUrl}vendor/pdf/standard_fonts/`
        },
        spreadsheet: {
            workerUrl: `${baseUrl}vendor/xlsx/sheet.worker.js`
        },
        typst: {
            compilerWasmUrl: `${baseUrl}wasm/typst/typst_ts_web_compiler_bg.wasm`,
            rendererWasmUrl: `${baseUrl}wasm/typst/typst_ts_renderer_bg.wasm`,
            fontAssetsUrl: `${baseUrl}wasm/typst/fonts/`
        }
    };
}
function mergeNestedOptions(defaults, overrides) {
    if (!defaults) {
        return overrides;
    }
    if (!overrides) {
        return defaults;
    }
    return {
        ...defaults,
        ...overrides
    };
}
function getRendererBucket() {
    const host = globalThis;
    if (!host[rendererGlobalKey]) {
        host[rendererGlobalKey] = {};
    }
    return host[rendererGlobalKey];
}
function resolveFullRendererLine(input) {
    const normalized = input.trim().toLowerCase().replace(/^\./, '');
    return lazyRendererLines.find(line => line.key === normalized) ||
        lazyRendererById.get(normalized) ||
        lazyRendererByExtension.get(normalized);
}
export function getDefaultFullAssetBaseUrl() {
    return defaultFullAssetBaseUrl;
}
export function setDefaultFullAssetBaseUrl(assetBaseUrl) {
    defaultFullAssetBaseUrl = normalizeAssetBaseUrl(assetBaseUrl);
}
export function getFullRendererScriptUrl(rendererOrExtension, assetBaseUrl = defaultFullAssetBaseUrl) {
    const line = resolveFullRendererLine(rendererOrExtension);
    if (!line) {
        return undefined;
    }
    const baseUrl = normalizeAssetBaseUrl(assetBaseUrl) || './';
    return new URL(`renderers/${line.scriptName}`, baseUrl).href;
}
async function loadFullRendererLine(line) {
    const existing = getRendererBucket()[line.key];
    if (existing) {
        return existing;
    }
    const cached = rendererScriptPromises.get(line.key);
    if (cached) {
        return cached;
    }
    const promise = new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            reject(new Error(`Cannot load ${line.label} outside a browser document.`));
            return;
        }
        const scriptUrl = getFullRendererScriptUrl(line.key);
        if (!scriptUrl) {
            reject(new Error(`Cannot resolve script URL for ${line.label}.`));
            return;
        }
        const previous = document.querySelector(`script[data-file-viewer-full-renderer="${line.key}"]`);
        const onReady = () => {
            const plugin = getRendererBucket()[line.key];
            if (plugin) {
                resolve(plugin);
            }
            else {
                reject(new Error(`${line.label} script loaded but did not register a renderer plugin.`));
            }
        };
        if (previous) {
            previous.addEventListener('load', onReady, { once: true });
            previous.addEventListener('error', () => reject(new Error(`Failed to load ${line.label} from ${scriptUrl}.`)), { once: true });
            if (getRendererBucket()[line.key]) {
                onReady();
            }
            return;
        }
        const script = document.createElement('script');
        script.async = true;
        script.src = scriptUrl;
        script.dataset.fileViewerFullRenderer = line.key;
        script.onload = onReady;
        script.onerror = () => reject(new Error(`Failed to load ${line.label} from ${scriptUrl}.`));
        document.head.appendChild(script);
    });
    rendererScriptPromises.set(line.key, promise);
    try {
        return await promise;
    }
    catch (error) {
        rendererScriptPromises.delete(line.key);
        throw error;
    }
}
function createLazyHandler(line, rendererId) {
    return async (buffer, target, type, context) => {
        var _a;
        const plugin = await loadFullRendererLine(line);
        const registration = (_a = plugin.handlers) === null || _a === void 0 ? void 0 : _a.find(item => item.rendererId === rendererId);
        if (!registration) {
            throw new Error(`${line.label} did not provide handler "${rendererId}".`);
        }
        return registration.handler(buffer, target, type, context);
    };
}
const createLazyRendererPlugin = (line) => ({
    id: `file-viewer-iife-${line.key}-renderer`,
    label: `Lazy ${line.label}`,
    definitions: DEFAULT_RENDERER_DEFINITIONS.filter(definition => line.rendererIds.includes(definition.id)),
    handlers: line.rendererIds.map(rendererId => ({
        rendererId,
        handler: createLazyHandler(line, rendererId)
    }))
});
export const fileViewerFullPreset = {
    id: 'file-viewer-iife-preset-all',
    label: 'Flyfish File Viewer lazy full IIFE preset',
    renderers: lazyRendererLines.map(createLazyRendererPlugin)
};
export function preloadFullRenderer(rendererOrExtension) {
    const line = resolveFullRendererLine(rendererOrExtension);
    if (!line) {
        return Promise.reject(new Error(`Unknown File Viewer renderer or extension: ${rendererOrExtension}`));
    }
    return loadFullRendererLine(line);
}
export function withFullViewerOptions(options = {}, assetBaseUrl = defaultFullAssetBaseUrl) {
    var _a;
    const { preset = fileViewerFullPreset, rendererMode = 'replace', ...rest } = options;
    const assetOptions = createFullAssetOptions(assetBaseUrl);
    return {
        ...rest,
        preset,
        rendererMode,
        autoRenderers: (_a = rest.autoRenderers) !== null && _a !== void 0 ? _a : true,
        archive: mergeNestedOptions(assetOptions.archive, rest.archive),
        cad: mergeNestedOptions(assetOptions.cad, rest.cad),
        data: mergeNestedOptions(assetOptions.data, rest.data),
        docx: mergeNestedOptions(assetOptions.docx, rest.docx),
        drawing: mergeNestedOptions(assetOptions.drawing, rest.drawing),
        pdf: mergeNestedOptions(assetOptions.pdf, rest.pdf),
        spreadsheet: mergeNestedOptions(assetOptions.spreadsheet, rest.spreadsheet),
        typst: mergeNestedOptions(assetOptions.typst, rest.typst)
    };
}
export function withFullMountOptions(options = {}, assetBaseUrl = defaultFullAssetBaseUrl) {
    return {
        ...options,
        options: withFullViewerOptions(options.options, assetBaseUrl)
    };
}
export function mountViewer(container, initialOptions = {}, coreOptions = {}) {
    return mountBaseViewer(container, withFullMountOptions(initialOptions), coreOptions);
}
export class FileViewerFullElement extends FileViewerElement {
    get options() {
        return super.options;
    }
    set options(value) {
        super.options = withFullViewerOptions(value);
    }
    connectedCallback() {
        this.options = super.options;
        super.connectedCallback();
    }
    async load(options) {
        await super.load(withFullMountOptions(options));
    }
    async update(options = {}) {
        await super.update(withFullMountOptions(options));
    }
    get source() {
        return super.source;
    }
    set source(value) {
        if (!value) {
            super.source = value;
            return;
        }
        const { coreOptions, ...mountOptions } = value;
        super.source = {
            ...withFullMountOptions(mountOptions),
            coreOptions
        };
    }
}
export function defineFileViewerElement(tagName = FILE_VIEWER_ELEMENT_TAG) {
    if (typeof window === 'undefined' || !window.customElements) {
        return undefined;
    }
    const existing = window.customElements.get(tagName);
    if (existing) {
        return existing;
    }
    window.customElements.define(tagName, FileViewerFullElement);
    return FileViewerFullElement;
}
const FlyfishFileViewerWebFull = {
    ...FlyfishFileViewerWeb,
    fileViewerFullPreset,
    getDefaultFullAssetBaseUrl,
    getFullRendererScriptUrl,
    preloadFullRenderer,
    setDefaultFullAssetBaseUrl,
    withFullViewerOptions,
    withFullMountOptions,
    defineFileViewerElement,
    FileViewerElement: FileViewerFullElement,
    FileViewerFullElement,
    mountViewer
};
export default FlyfishFileViewerWebFull;
