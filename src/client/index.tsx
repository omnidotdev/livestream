import "@livekit/components-styles";
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { CSSProperties, ReactNode } from "react";

/**
 * Number of participants other than the single broadcaster (i.e. viewers).
 * Use inside a StagePublisher/StageViewer overlay to show a live watcher count.
 */
export function useWatchingCount(): number {
  return Math.max(0, useParticipants().length - 1);
}

/** Whether the broadcaster's camera track is currently live. */
export function useCameraOn(): boolean {
  return (
    useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]).length >
    0
  );
}

const stageStyle: CSSProperties = {
  position: "relative",
  height: "100%",
  background: "#000",
  overflow: "hidden",
};

function CameraStage({
  fallback,
  children,
}: {
  fallback?: ReactNode;
  children?: ReactNode;
}) {
  // Only render participants who actually publish a camera (the broadcaster).
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);
  return (
    <div style={stageStyle}>
      {tracks.length > 0 ? (
        <GridLayout tracks={tracks} style={{ height: "100%" }}>
          <ParticipantTile />
        </GridLayout>
      ) : (
        (fallback ?? (
          <div
            style={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
            }}
          >
            Camera is off
          </div>
        ))
      )}
      {children}
      <RoomAudioRenderer />
    </div>
  );
}

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
export function StagePublisher({
  token,
  serverUrl,
  overlay,
  cameraOffFallback,
  onDisconnected,
}: StageProps) {
  return (
    <LiveKitRoom
      video
      audio
      token={token}
      serverUrl={serverUrl}
      onDisconnected={onDisconnected}
      style={{ height: "100%" }}
    >
      <CameraStage fallback={cameraOffFallback}>{overlay}</CameraStage>
    </LiveKitRoom>
  );
}

/**
 * Viewer stage: connects without publishing and renders the broadcaster's
 * camera + audio. The host app supplies chat/overlay UI via `overlay`.
 */
export function StageViewer({
  token,
  serverUrl,
  overlay,
  cameraOffFallback,
  onDisconnected,
}: StageProps) {
  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={serverUrl}
      onDisconnected={onDisconnected}
      style={{ height: "100%" }}
    >
      <CameraStage fallback={cameraOffFallback}>{overlay}</CameraStage>
    </LiveKitRoom>
  );
}
