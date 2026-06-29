import { createViewerControllerHandle, FileViewerElement, FILE_VIEWER_ELEMENT_TAG } from '@file-viewer/web';
import type { ViewerController, ViewerCoreOptions, FileViewerElementSource, ViewerMountOptions, ViewerOptions } from '@file-viewer/web';
export * from '@file-viewer/web';
export { createViewerControllerHandle, FileViewerElement, FILE_VIEWER_ELEMENT_TAG };
export declare const fileViewerFullPreset: import("@file-viewer/core").FileViewerRendererPreset<(buffer: ArrayBuffer, target: HTMLDivElement, type?: string, context?: import("@file-viewer/core").FileRenderContext) => Promise<import("@file-viewer/core").FileViewerRenderedInstance>>;
export declare function getDefaultFullAssetBaseUrl(): string | undefined;
export declare function setDefaultFullAssetBaseUrl(assetBaseUrl?: string | URL | null): void;
export declare function withFullViewerOptions(options?: ViewerOptions, assetBaseUrl?: string | URL | null | undefined): ViewerOptions;
export declare function withFullMountOptions(options?: ViewerMountOptions, assetBaseUrl?: string | URL | null | undefined): ViewerMountOptions;
export declare function mountViewer(container: HTMLElement, initialOptions?: ViewerMountOptions, coreOptions?: ViewerCoreOptions): ViewerController;
export declare class FileViewerFullElement extends FileViewerElement {
    get options(): ViewerOptions | undefined;
    set options(value: ViewerOptions | undefined);
    connectedCallback(): void;
    load(options: ViewerMountOptions): Promise<void>;
    update(options?: ViewerMountOptions): Promise<void>;
    get source(): FileViewerElementSource;
    set source(value: FileViewerElementSource | undefined);
}
export declare function defineFileViewerElement(tagName?: string): CustomElementConstructor | undefined;
declare const FlyfishFileViewerWebFull: {
    fileViewerFullPreset: import("@file-viewer/core").FileViewerRendererPreset<(buffer: ArrayBuffer, target: HTMLDivElement, type?: string, context?: import("@file-viewer/core").FileRenderContext) => Promise<import("@file-viewer/core").FileViewerRenderedInstance>>;
    getDefaultFullAssetBaseUrl: typeof getDefaultFullAssetBaseUrl;
    setDefaultFullAssetBaseUrl: typeof setDefaultFullAssetBaseUrl;
    withFullViewerOptions: typeof withFullViewerOptions;
    withFullMountOptions: typeof withFullMountOptions;
    defineFileViewerElement: typeof defineFileViewerElement;
    FileViewerElement: typeof FileViewerFullElement;
    mountViewer: typeof mountViewer;
    createViewerControllerHandle: (getController: import("@file-viewer/web").ViewerControllerAccessor, dispose: () => void) => import("@file-viewer/web").ViewerControllerHandle;
    FILE_VIEWER_ELEMENT_TAG: string;
};
export default FlyfishFileViewerWebFull;
