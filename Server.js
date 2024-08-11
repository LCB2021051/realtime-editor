const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      userName: userSocketMap[socketId],
    })
  );
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
    const existingClient = Object.values(userSocketMap).find(
      (name) => name === userName && io.sockets.adapter.rooms.get(roomId)?.has(socket.id)
    );

    if (existingClient) {
      socket.emit(ACTIONS.ERROR, { message: 'Username already taken in this room.' });
      return;
    }

    userSocketMap[socket.id] = userName;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        userName,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    if (code) {
      console.log('Server: CodeUpdated');
      io.to(roomId).emit(ACTIONS.CODE_CHANGE, {
        code,
      });
    }
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });

  socket.on('disconnect', () => {
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log('Listening on port', PORT));
