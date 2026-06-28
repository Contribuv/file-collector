import { createViewerControllerHandle, defineFileViewerElement, FileViewerElement, FILE_VIEWER_ELEMENT_TAG, FileViewerFullElement, fileViewerFullPreset, getDefaultFullAssetBaseUrl, getFullRendererScriptUrl, mountViewer, preloadFullRenderer, setDefaultFullAssetBaseUrl, withFullMountOptions, withFullViewerOptions } from './iife';
const FlyfishFileViewerWebFull = {
    createViewerControllerHandle,
    defineFileViewerElement,
    FileViewerElement,
    FileViewerFullElement,
    FILE_VIEWER_ELEMENT_TAG,
    fileViewerFullPreset,
    getDefaultFullAssetBaseUrl,
    getFullRendererScriptUrl,
    mountViewer,
    preloadFullRenderer,
    setDefaultFullAssetBaseUrl,
    withFullMountOptions,
    withFullViewerOptions
};
if (typeof window !== 'undefined') {
    window.FlyfishFileViewerWebFull = FlyfishFileViewerWebFull;
    defineFileViewerElement();
}
export { createViewerControllerHandle, defineFileViewerElement, FileViewerElement, FileViewerFullElement, FILE_VIEWER_ELEMENT_TAG, fileViewerFullPreset, getDefaultFullAssetBaseUrl, getFullRendererScriptUrl, mountViewer, preloadFullRenderer, setDefaultFullAssetBaseUrl, withFullMountOptions, withFullViewerOptions };
export default FlyfishFileViewerWebFull;
