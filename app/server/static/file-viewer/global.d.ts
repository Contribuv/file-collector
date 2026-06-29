import { createViewerControllerHandle, defineFileViewerElement, FileViewerElement, FILE_VIEWER_ELEMENT_TAG, FileViewerFullElement, fileViewerFullPreset, getDefaultFullAssetBaseUrl, getFullRendererScriptUrl, mountViewer, preloadFullRenderer, setDefaultFullAssetBaseUrl, withFullMountOptions, withFullViewerOptions } from './iife';
declare const FlyfishFileViewerWebFull: {
    createViewerControllerHandle: (getController: import("@file-viewer/web").ViewerControllerAccessor, dispose: () => void) => import("@file-viewer/web").ViewerControllerHandle;
    defineFileViewerElement: typeof defineFileViewerElement;
    FileViewerElement: typeof FileViewerElement;
    FileViewerFullElement: typeof FileViewerFullElement;
    FILE_VIEWER_ELEMENT_TAG: string;
    fileViewerFullPreset: import("@file-viewer/core").FileViewerRendererPreset<(buffer: ArrayBuffer, target: HTMLDivElement, type?: string, context?: import("@file-viewer/core").FileRenderContext) => Promise<import("@file-viewer/core").FileViewerRenderedInstance>>;
    getDefaultFullAssetBaseUrl: typeof getDefaultFullAssetBaseUrl;
    getFullRendererScriptUrl: typeof getFullRendererScriptUrl;
    mountViewer: typeof mountViewer;
    preloadFullRenderer: typeof preloadFullRenderer;
    setDefaultFullAssetBaseUrl: typeof setDefaultFullAssetBaseUrl;
    withFullMountOptions: typeof withFullMountOptions;
    withFullViewerOptions: typeof withFullViewerOptions;
};
type FlyfishFileViewerWebFullGlobal = typeof FlyfishFileViewerWebFull;
declare global {
    interface Window {
        FlyfishFileViewerWebFull?: FlyfishFileViewerWebFullGlobal;
    }
}
export { createViewerControllerHandle, defineFileViewerElement, FileViewerElement, FileViewerFullElement, FILE_VIEWER_ELEMENT_TAG, fileViewerFullPreset, getDefaultFullAssetBaseUrl, getFullRendererScriptUrl, mountViewer, preloadFullRenderer, setDefaultFullAssetBaseUrl, withFullMountOptions, withFullViewerOptions };
export default FlyfishFileViewerWebFull;
