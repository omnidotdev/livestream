// src/server/index.ts
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
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
    }
  };
}
export {
  createLivekitServer
};
