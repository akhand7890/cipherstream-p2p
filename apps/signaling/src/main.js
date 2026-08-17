import { WebSocketServer, WebSocket } from 'ws';
import { SignalingEventType } from '@cipherstream/types';

/**
 * Native WebSocket Signaling Gateway (1-to-Many Multi-Peer Mesh Edition)
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
 * @typedef {Object} ReceiverPeer
 * @property {string} peerId
 * @property {WebSocket} socket
 */

/**
 * @typedef {Object} RoomSession
 * @property {string} roomId
 * @property {string} roomCode
 * @property {WebSocket} senderSocket
 * @property {Map<string, ReceiverPeer>} receiverSockets
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
            receiverSockets: new Map(),
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
                payload: { message: 'Invalid or expired room code.' },
                timestamp: Date.now(),
              })
            );
            return;
          }

          const session = rooms.get(roomId);
          const peerId = `peer_${Math.random().toString(36).substring(2, 9)}`;
          session.receiverSockets.set(peerId, { peerId, socket: ws });

          // Send confirmation to receiver
          ws.send(
            JSON.stringify({
              event: SignalingEventType.ROOM_JOINED,
              roomId,
              payload: { role: 'receiver', peerId },
              timestamp: Date.now(),
            })
          );

          // Notify sender of new receiver peer
          if (session.senderSocket && session.senderSocket.readyState === WebSocket.OPEN) {
            session.senderSocket.send(
              JSON.stringify({
                event: SignalingEventType.ROOM_JOINED,
                roomId,
                payload: {
                  role: 'sender',
                  peerId,
                  peerCount: session.receiverSockets.size,
                },
                timestamp: Date.now(),
              })
            );
          }

          console.log(`[Signaling] Receiver ${peerId} Joined Room Code: ${roomCode} | Total Peers: ${session.receiverSockets.size}`);
          break;
        }

        default: {
          // Targeted relay for WebRTC SDP Offers, Answers, and ICE Candidates
          const session = rooms.get(message.roomId);
          if (!session) return;

          if (session.senderSocket === ws) {
            // Sender sending to specific receiver peer
            const targetPeerId = message.targetPeerId || message.payload?.targetPeerId;
            if (targetPeerId && session.receiverSockets.has(targetPeerId)) {
              const targetWs = session.receiverSockets.get(targetPeerId).socket;
              if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify(message));
              }
            } else {
              // Broadcast to all receivers if no target specified
              session.receiverSockets.forEach(({ socket }) => {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify(message));
                }
              });
            }
          } else {
            // Receiver sending to sender
            if (session.senderSocket && session.senderSocket.readyState === WebSocket.OPEN) {
              session.senderSocket.send(JSON.stringify(message));
            }
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
      if (session.senderSocket === ws) {
        // Sender disconnected — notify all receivers
        session.receiverSockets.forEach(({ socket }) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                event: SignalingEventType.PEER_DISCONNECTED,
                roomId,
                timestamp: Date.now(),
              })
            );
          }
        });
        rooms.delete(roomId);
        codeToRoomId.delete(session.roomCode);
      } else {
        // Check if a receiver disconnected
        session.receiverSockets.forEach(({ socket, peerId }, pId) => {
          if (socket === ws) {
            session.receiverSockets.delete(pId);
            if (session.senderSocket && session.senderSocket.readyState === WebSocket.OPEN) {
              session.senderSocket.send(
                JSON.stringify({
                  event: SignalingEventType.PEER_DISCONNECTED,
                  roomId,
                  payload: { peerId: pId, peerCount: session.receiverSockets.size },
                  timestamp: Date.now(),
                })
              );
            }
          }
        });
      }
    });
  });
});

console.log('🚀 Native 1-to-Many Multi-Peer WebSocket Signaling Gateway running on ws://localhost:8080/ws');
