import { WebSocketServer, WebSocket } from 'ws';
import { SignalingEventType } from '@cipherstream/types';

/**
 * Native WebSocket Signaling Gateway (JavaScript + JSDoc Annotated)
 * Zero build step, runs natively in Node.js ES Modules
 */

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT, path: '/ws' });

wss.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by another process.`);
    console.error(`👉 Run 'Get-Process node | Stop-Process -Force' in PowerShell to free port ${PORT}.\n`);
  } else {
    console.error('[Signaling] WebSocket Server error:', err);
  }
});

/**
 * @typedef {Object} RoomSession
 * @property {string} roomId
 * @property {string} roomCode
 * @property {WebSocket} [senderSocket]
 * @property {WebSocket} [receiverSocket]
 * @property {number} createdAt
 */

/** @type {Map<string, RoomSession>} */
const rooms = new Map();

/** @type {Map<string, string>} */
const codeToRoomId = new Map();

wss.on('connection', (ws) => {
  console.log('[Signaling] New WebSocket peer connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      switch (message.event) {
        case SignalingEventType.CREATE_ROOM: {
          const roomId = `room_${Math.random().toString(36).substring(2, 9)}`;
          const requestedCode = message.payload?.customCode?.trim()?.toUpperCase();
          const roomCode = (requestedCode && requestedCode.length >= 4 && !codeToRoomId.has(requestedCode))
            ? requestedCode
            : Math.floor(100000 + Math.random() * 900000).toString();

          /** @type {RoomSession} */
          const session = {
            roomId,
            roomCode,
            senderSocket: ws,
            createdAt: Date.now(),
          };

          rooms.set(roomId, session);
          codeToRoomId.set(roomCode, roomId);

          ws.send(
            JSON.stringify({
              event: SignalingEventType.ROOM_CREATED,
              roomId,
              payload: { roomCode, expiresAt: Date.now() + 15 * 60 * 1000 },
              timestamp: Date.now(),
            })
          );
          console.log(`[Signaling] Room Created: ID ${roomId} | Code ${roomCode}`);
          break;
        }

        case SignalingEventType.JOIN_ROOM: {
          const roomCode = message.payload?.roomCode;
          const roomId = codeToRoomId.get(roomCode);
          if (!roomId || !rooms.has(roomId)) {
            ws.send(
              JSON.stringify({
                event: SignalingEventType.ERROR,
                payload: { message: 'Invalid or expired 6-digit room code.' },
                timestamp: Date.now(),
              })
            );
            return;
          }

          const session = rooms.get(roomId);
          session.receiverSocket = ws;

          ws.send(
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

          console.log(`[Signaling] Peer Joined Room Code: ${roomCode}`);
          break;
        }

        default: {
          // Relay SDP / ICE / ECDH Key messages to paired peer
          const session = rooms.get(message.roomId);
          if (!session) return;
          const targetSocket = session.senderSocket === ws ? session.receiverSocket : session.senderSocket;
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify(message));
          }
          break;
        }
      }
    } catch (err) {
      console.error('[Signaling] Parse error:', err);
    }
  });

  ws.on('close', () => {
    console.log('[Signaling] Peer disconnected');
    rooms.forEach((session, roomId) => {
      if (session.senderSocket === ws || session.receiverSocket === ws) {
        const otherSocket = session.senderSocket === ws ? session.receiverSocket : session.senderSocket;
        if (otherSocket && otherSocket.readyState === WebSocket.OPEN) {
          otherSocket.send(
            JSON.stringify({
              event: SignalingEventType.PEER_DISCONNECTED,
              roomId,
              timestamp: Date.now(),
            })
          );
        }
        rooms.delete(roomId);
        codeToRoomId.delete(session.roomCode);
      }
    });
  });
});

console.log('🚀 Native WebSocket Signaling Gateway running on ws://localhost:8080/ws');
