// src/server/index.ts
import {
  AccessToken,
  EgressClient,
  RoomServiceClient,
  S3Upload,
  SegmentedFileOutput,
  SegmentedFileProtocol
} from "livekit-server-sdk";
function createLivekitServer(config) {
  const httpUrl = config.url.replace(/^ws(s?)/, "http$1");
  const roomClient = () => new RoomServiceClient(httpUrl, config.apiKey, config.apiSecret);
  return {
    async createRoom(name) {
      await roomClient().createRoom({
        name,
        emptyTimeout: 120,
        maxParticipants: 50
      });
    },
    async deleteRoom(name) {
      await roomClient().deleteRoom(name);
    },
    async mintToken(room, identity, isPublisher) {
      const at = new AccessToken(config.apiKey, config.apiSecret, {
        identity,
        ttl: "12h"
      });
      at.addGrant({
        roomJoin: true,
        room,
        canPublish: isPublisher,
        canSubscribe: true,
        canPublishData: isPublisher
      });
      return at.toJwt();
    },
    async startRecording(room, prefix, s3) {
      const egress = new EgressClient(httpUrl, config.apiKey, config.apiSecret);
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
            forcePathStyle: true
          })
        }
      });
      const info = await egress.startRoomCompositeEgress(room, output);
      return { egressId: info.egressId };
    },
    async stopRecording(egressId) {
      const egress = new EgressClient(httpUrl, config.apiKey, config.apiSecret);
      await egress.stopEgress(egressId);
    }
  };
}
export {
  createLivekitServer
};
