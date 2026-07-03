// src/client/index.tsx
import"@livekit/components-styles";
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useParticipants,
  useTracks
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { jsxDEV } from "react/jsx-dev-runtime";
function useWatchingCount() {
  return Math.max(0, useParticipants().length - 1);
}
function useCameraOn() {
  return useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]).length > 0;
}
var stageStyle = {
  position: "relative",
  height: "100%",
  background: "#000",
  overflow: "hidden"
};
function CameraStage({
  fallback,
  children
}) {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false }
  ]);
  return /* @__PURE__ */ jsxDEV("div", {
    style: stageStyle,
    children: [
      tracks.length > 0 ? /* @__PURE__ */ jsxDEV(GridLayout, {
        tracks,
        style: { height: "100%" },
        children: /* @__PURE__ */ jsxDEV(ParticipantTile, {}, undefined, false, undefined, this)
      }, undefined, false, undefined, this) : fallback ?? /* @__PURE__ */ jsxDEV("div", {
        style: {
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.7)",
          fontSize: 14
        },
        children: "Camera is off"
      }, undefined, false, undefined, this),
      children,
      /* @__PURE__ */ jsxDEV(RoomAudioRenderer, {}, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
function StagePublisher({
  token,
  serverUrl,
  overlay,
  cameraOffFallback,
  onDisconnected
}) {
  return /* @__PURE__ */ jsxDEV(LiveKitRoom, {
    video: true,
    audio: true,
    token,
    serverUrl,
    onDisconnected,
    style: { height: "100%" },
    children: /* @__PURE__ */ jsxDEV(CameraStage, {
      fallback: cameraOffFallback,
      children: overlay
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
function StageViewer({
  token,
  serverUrl,
  overlay,
  cameraOffFallback,
  onDisconnected
}) {
  return /* @__PURE__ */ jsxDEV(LiveKitRoom, {
    video: false,
    audio: false,
    token,
    serverUrl,
    onDisconnected,
    style: { height: "100%" },
    children: /* @__PURE__ */ jsxDEV(CameraStage, {
      fallback: cameraOffFallback,
      children: overlay
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
export {
  useWatchingCount,
  useCameraOn,
  StageViewer,
  StagePublisher
};
