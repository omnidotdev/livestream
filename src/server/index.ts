import {
  AccessToken,
  EgressClient,
  RoomServiceClient,
  S3Upload,
  SegmentedFileOutput,
  SegmentedFileProtocol,
} from "livekit-server-sdk";

/**
 * Server-side LiveKit configuration for one deployment. The host app owns these
 * values (env, secrets manager, etc.) and injects them, so this core stays
 * neutral and reusable across products.
 */
export interface LivekitConfig {
  /** Signaling URL, e.g. wss://livekit.example.com or ws://localhost:7880 */
  url: string;
  apiKey: string;
  apiSecret: string;
}

export interface LivekitServer {
  /** Create (or no-op if it exists) a room, torn down 120s after it empties. */
  createRoom(name: string): Promise<void>;
  /** Delete a room, disconnecting everyone and finalizing any egress. */
  deleteRoom(name: string): Promise<void>;
  /**
   * Mint a room-scoped access token. Publishers may publish + subscribe;
   * viewers may only subscribe. Long TTL so a broadcast never silently drops.
   */
  mintToken(
    room: string,
    identity: string,
    isPublisher: boolean,
  ): Promise<string>;

  /**
   * Start recording a room to segmented HLS in S3-compatible storage. `prefix`
   * is the object-key prefix (e.g. `recordings/<id>/`); the playlist is written
   * to `<prefix>index.m3u8`. Returns the egress id (store it to stop later).
   */
  startRecording(
    room: string,
    prefix: string,
    s3: RecordingS3,
  ): Promise<{ egressId: string }>;

  /** Stop a recording egress, finalizing and uploading the HLS output. */
  stopRecording(egressId: string): Promise<void>;
}

/** S3-compatible storage for recordings (host-provided). */
export interface RecordingS3 {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secret: string;
  region?: string;
}

/**
 * Create the server-side LiveKit helpers. The host app layers its own access
 * control, persistence (which streams exist, who owns them), and chat on top;
 * this only wraps room lifecycle and token minting.
 */
export function createLivekitServer(config: LivekitConfig): LivekitServer {
  const httpUrl = config.url.replace(/^ws(s?)/, "http$1");
  const roomClient = () =>
    new RoomServiceClient(httpUrl, config.apiKey, config.apiSecret);

  return {
    async createRoom(name) {
      await roomClient().createRoom({
        name,
        emptyTimeout: 120,
        maxParticipants: 50,
      });
    },

    async deleteRoom(name) {
      await roomClient().deleteRoom(name);
    },

    async mintToken(room, identity, isPublisher) {
      const at = new AccessToken(config.apiKey, config.apiSecret, {
        identity,
        ttl: "12h",
      });
      at.addGrant({
        roomJoin: true,
        room,
        canPublish: isPublisher,
        canSubscribe: true,
        canPublishData: isPublisher,
      });
      return at.toJwt();
    },

    async startRecording(room, prefix, s3) {
      const egress = new EgressClient(httpUrl, config.apiKey, config.apiSecret);
      // ~6s segments keep the HLS playlist responsive while limiting writes.
      const output = new SegmentedFileOutput({
        protocol: SegmentedFileProtocol.HLS_PROTOCOL,
        filenamePrefix: prefix,
        playlistName: "index.m3u8",
        segmentDuration: 6,
        output: {
          case: "s3",
          value: new S3Upload({
            accessKey: s3.accessKey,
            secret: s3.secret,
            endpoint: s3.endpoint,
            bucket: s3.bucket,
            region: s3.region ?? "us-east-1",
            forcePathStyle: true,
          }),
        },
      });
      const info = await egress.startRoomCompositeEgress(room, output);
      return { egressId: info.egressId };
    },

    async stopRecording(egressId) {
      const egress = new EgressClient(httpUrl, config.apiKey, config.apiSecret);
      await egress.stopEgress(egressId);
    },
  };
}
