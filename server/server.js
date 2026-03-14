/**
 * LiveStream Signaling Server
 * Port: 8226
 * Dependencies: express, socket.io, simple-peer (peer connection handled client-side)
 * 
 * Run: node server.js
 * Then expose via Ngrok: ngrok http 8226
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// ─── Active Streams Registry ───────────────────────────────────────────────
// Structure: { streamId: { hostSocketId, title, startedAt, viewerCount } }
const activeStreams = {};

// ─── Socket.io Signaling ────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // ── HOST: Start a new stream ──
  socket.on('host:start', ({ streamId, title }) => {
    activeStreams[streamId] = {
      hostSocketId: socket.id,
      title: title || 'Live Stream',
      startedAt: new Date().toISOString(),
      viewerCount: 0
    };
    socket.join(streamId);
    socket.streamId = streamId;
    socket.role = 'host';
    console.log(`[STREAM] Started: ${streamId} by ${socket.id}`);
    
    // Broadcast updated stream list to all lobby watchers
    io.emit('streams:update', getStreamList());
  });

  // ── HOST: End stream ──
  socket.on('host:end', ({ streamId }) => {
    if (activeStreams[streamId]) {
      delete activeStreams[streamId];
      io.to(streamId).emit('stream:ended');
      io.emit('streams:update', getStreamList());
      console.log(`[STREAM] Ended: ${streamId}`);
    }
  });

  // ── VIEWER: Request stream list ──
  socket.on('streams:list', () => {
    socket.emit('streams:update', getStreamList());
  });

  // ── VIEWER: Join a stream ──
  socket.on('viewer:join', ({ streamId }) => {
    const stream = activeStreams[streamId];
    if (!stream) {
      socket.emit('stream:not-found');
      return;
    }
    socket.join(streamId);
    socket.streamId = streamId;
    socket.role = 'viewer';
    
    // Increment viewer count
    activeStreams[streamId].viewerCount++;
    
    // Notify host that a new viewer wants to connect
    io.to(stream.hostSocketId).emit('viewer:joined', { viewerSocketId: socket.id });
    
    // Update viewer count for everyone in room
    io.to(streamId).emit('viewers:count', { count: activeStreams[streamId].viewerCount });
    io.emit('streams:update', getStreamList());
    
    console.log(`[JOIN] Viewer ${socket.id} joined stream ${streamId}`);
  });

  // ── WebRTC Signaling: Host sends offer to specific viewer ──
  socket.on('signal:offer', ({ to, signal }) => {
    io.to(to).emit('signal:offer', { from: socket.id, signal });
  });

  // ── WebRTC Signaling: Viewer sends answer to host ──
  socket.on('signal:answer', ({ to, signal }) => {
    io.to(to).emit('signal:answer', { from: socket.id, signal });
  });

  // ── WebRTC Signaling: ICE candidates (trickle) ──
  socket.on('signal:ice', ({ to, candidate }) => {
    io.to(to).emit('signal:ice', { from: socket.id, candidate });
  });

  // ── Chat: Broadcast message to stream room ──
  socket.on('chat:message', ({ streamId, message, username, role }) => {
    io.to(streamId).emit('chat:message', {
      id: Date.now(),
      username,
      message,
      role, // 'host' or 'viewer'
      timestamp: new Date().toISOString()
    });
  });

  // ── Disconnect cleanup ──
  socket.on('disconnect', () => {
    console.log(`[-] Socket disconnected: ${socket.id}`);
    
    const streamId = socket.streamId;
    if (!streamId) return;

    if (socket.role === 'host') {
      // Host disconnected — end stream
      if (activeStreams[streamId]) {
        delete activeStreams[streamId];
        io.to(streamId).emit('stream:ended');
        io.emit('streams:update', getStreamList());
        console.log(`[STREAM] Host disconnected, stream ${streamId} ended`);
      }
    } else if (socket.role === 'viewer') {
      // Viewer left
      if (activeStreams[streamId]) {
        activeStreams[streamId].viewerCount = Math.max(0, activeStreams[streamId].viewerCount - 1);
        io.to(streamId).emit('viewers:count', { count: activeStreams[streamId].viewerCount });
        io.emit('streams:update', getStreamList());
        
        // Notify host that viewer left (to cleanup peer connection)
        const stream = activeStreams[streamId];
        if (stream) {
          io.to(stream.hostSocketId).emit('viewer:left', { viewerSocketId: socket.id });
        }
      }
    }
  });
});

// ─── Helper: Serialize stream list ─────────────────────────────────────────
function getStreamList() {
  return Object.entries(activeStreams).map(([streamId, info]) => ({
    streamId,
    title: info.title,
    startedAt: info.startedAt,
    viewerCount: info.viewerCount
  }));
}

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = 8226;
server.listen(PORT, () => {
  console.log(`\n🚀 LiveStream Server running on http://localhost:${PORT}`);
  console.log(`📡 Expose with Ngrok: ngrok http ${PORT}\n`);
});
