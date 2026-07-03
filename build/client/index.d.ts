import "@livekit/components-styles";
import type { ReactNode } from "react";
/**
 * Number of participants other than the single broadcaster (i.e. viewers).
 * Use inside a StagePublisher/StageViewer overlay to show a live watcher count.
 */
export declare function useWatchingCount(): number;
/** Whether the broadcaster's camera track is currently live. */
export declare function useCameraOn(): boolean;
export interface StageProps {
    /** Room-scoped access token from the server. */
    token: string;
    /** LiveKit signaling URL (wss/ws). */
    serverUrl: string;
    /** Absolute-positioned overlay (controls, chat, viewer count, etc.). */
    overlay?: ReactNode;
    /** Fallback shown when no camera is live. */
    cameraOffFallback?: ReactNode;
    onDisconnected?: () => void;
}
/**
 * Broadcaster stage: connects and publishes camera + mic to the room, previewing
 * the local camera. The host app supplies controls/chat via `overlay`.
 */
export declare function StagePublisher({ token, serverUrl, overlay, cameraOffFallback, onDisconnected, }: StageProps): import("react").JSX.Element;
/**
 * Viewer stage: connects without publishing and renders the broadcaster's
 * camera + audio. The host app supplies chat/overlay UI via `overlay`.
 */
export declare function StageViewer({ token, serverUrl, overlay, cameraOffFallback, onDisconnected, }: StageProps): import("react").JSX.Element;
