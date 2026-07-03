# @omnidotdev/livestream

Shared LiveKit live-streaming core for the Omni ecosystem. A neutral server +
client toolkit; each product layers its own access control, persistence, and
chat on top, so the core stays reusable (extracted from thrivestream's
livestream module).

## Server (`@omnidotdev/livestream/server`)

```ts
import { createLivekitServer } from "@omnidotdev/livestream/server";

const livekit = createLivekitServer({
  url: process.env.LIVEKIT_URL!,
  apiKey: process.env.LIVEKIT_API_KEY!,
  apiSecret: process.env.LIVEKIT_API_SECRET!,
});

await livekit.createRoom(roomName);
const broadcasterToken = await livekit.mintToken(roomName, creatorId, true);
const viewerToken = await livekit.mintToken(roomName, `viewer-${id}`, false);
await livekit.deleteRoom(roomName); // on stream end, finalizes egress
```

## Client (`@omnidotdev/livestream/client`)

```tsx
import { StagePublisher, StageViewer } from "@omnidotdev/livestream/client";

// Broadcaster (publishes camera + mic)
<StagePublisher token={token} serverUrl={url} overlay={<Controls />} />

// Viewer (subscribe only)
<StageViewer token={token} serverUrl={url} overlay={<Chat />} />
```

Peer deps (host provides): `react`, `@livekit/components-react`,
`@livekit/components-styles`, `livekit-client`. Overlay UI (controls, chat,
viewer count) is the host's; `useWatchingCount()` and `useCameraOn()` hooks are
exported for use inside an overlay.
