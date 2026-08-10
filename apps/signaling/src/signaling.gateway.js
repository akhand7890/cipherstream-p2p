import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { SignalingEventType } from '@cipherstream/types';

/**
 * @typedef {Object} RoomSession
 * @property {string} roomId
 * @property {string} roomCode
 * @property {WebSocket} [senderSocket]
 * @property {WebSocket} [receiverSocket]
 * @property {number} createdAt
 */

@WebSocketGateway(8080, { path: '/ws' })
export class SignalingGateway {
  @WebSocketServer()
  server;

  /** @type {Map<string, RoomSession>} */
  rooms = new Map();
  /** @type {Map<string, string>} */
  codeToRoomId = new Map();

  /**
   * @param {WebSocket} client
   */
  handleConnection(client) {
    console.log('[Signaling] New WebSocket peer connected');
  }

  /**
   * @param {WebSocket} client
   */
  handleDisconnect(client) {
    console.log('[Signaling] Peer disconnected');
    this.rooms.forEach((session, roomId) => {
      if (session.senderSocket === client || session.receiverSocket === client) {
        const otherSocket = session.senderSocket === client ? session.receiverSocket : session.senderSocket;
        if (otherSocket && otherSocket.readyState === WebSocket.OPEN) {
          otherSocket.send(
            JSON.stringify({
              event: SignalingEventType.PEER_DISCONNECTED,
              roomId,
              timestamp: Date.now(),
            })
          );
        }
        this.rooms.delete(roomId);
        this.codeToRoomId.delete(session.roomCode);
      }
    });
  }

  /**
   * @param {WebSocket} client
   */
  @SubscribeMessage(SignalingEventType.CREATE_ROOM)
  handleCreateRoom(@ConnectedSocket() client) {
    const roomId = `room_${Math.random().toString(36).substring(2, 9)}`;
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

    /** @type {RoomSession} */
    const session = {
      roomId,
      roomCode,
      senderSocket: client,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, session);
    this.codeToRoomId.set(roomCode, roomId);

    client.send(
      JSON.stringify({
        event: SignalingEventType.ROOM_CREATED,
        roomId,
        payload: { roomCode, expiresAt: Date.now() + 15 * 60 * 1000 },
        timestamp: Date.now(),
      })
    );
    console.log(`[Signaling] Room Created: ID ${roomId} | Code ${roomCode}`);
  }

  /**
   * @param {WebSocket} client
   * @param {{ roomCode: string }} data
   */
  @SubscribeMessage(SignalingEventType.JOIN_ROOM)
  handleJoinRoom(@ConnectedSocket() client, @MessageBody() data) {
    const roomId = this.codeToRoomId.get(data.roomCode);
    if (!roomId || !this.rooms.has(roomId)) {
      client.send(
        JSON.stringify({
          event: SignalingEventType.ERROR,
          payload: { message: 'Invalid or expired 6-digit room code.' },
          timestamp: Date.now(),
        })
      );
      return;
    }

    const session = this.rooms.get(roomId);
    session.receiverSocket = client;

    client.send(
      JSON.stringify({
        event: SignalingEventType.ROOM_JOINED,
        roomId,
        payload: { role: 'receiver' },
        timestamp: Date.now(),
      })
    );

    if (session.senderSocket && session.senderSocket.readyState === WebSocket.OPEN) {
      session.senderSocket.send(
        JSON.stringify({
          event: SignalingEventType.ROOM_JOINED,
          roomId,
          payload: { role: 'sender' },
          timestamp: Date.now(),
        })
      );
    }

    console.log(`[Signaling] Peer Joined Room Code: ${data.roomCode}`);
  }

  /**
   * @param {WebSocket} client
   * @param {import('@cipherstream/types').SignalingMessage} message
   */
  @SubscribeMessage(SignalingEventType.ECDH_PUBLIC_KEY)
  @SubscribeMessage(SignalingEventType.SIGNAL_OFFER)
  @SubscribeMessage(SignalingEventType.SIGNAL_ANSWER)
  @SubscribeMessage(SignalingEventType.SIGNAL_ICE_CANDIDATE)
  handleRelayMessage(@ConnectedSocket() client, @MessageBody() message) {
    const session = this.rooms.get(message.roomId);
    if (!session) return;

    const targetSocket = session.senderSocket === client ? session.receiverSocket : session.senderSocket;
    if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
      targetSocket.send(JSON.stringify(message));
    }
  }
}
