import allRenderers from '@file-viewer/preset-all';
import FlyfishFileViewerWeb, { createViewerControllerHandle, FileViewerElement, FILE_VIEWER_ELEMENT_TAG, mountViewer as mountBaseViewer } from '@file-viewer/web';
export * from '@file-viewer/web';
export { createViewerControllerHandle, FileViewerElement, FILE_VIEWER_ELEMENT_TAG };
export const fileViewerFullPreset = allRenderers;
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
export function getDefaultFullAssetBaseUrl() {
    return defaultFullAssetBaseUrl;
}
export function setDefaultFullAssetBaseUrl(assetBaseUrl) {
    defaultFullAssetBaseUrl = normalizeAssetBaseUrl(assetBaseUrl);
}
export function withFullViewerOptions(options = {}, assetBaseUrl = defaultFullAssetBaseUrl) {
    var _a;
    const { preset = allRenderers, rendererMode = 'replace', ...rest } = options;
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
    setDefaultFullAssetBaseUrl,
    withFullViewerOptions,
    withFullMountOptions,
    defineFileViewerElement,
    FileViewerElement: FileViewerFullElement,
    mountViewer
};
export default FlyfishFileViewerWebFull;
