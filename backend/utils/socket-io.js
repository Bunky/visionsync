const { socketLogger: log } = require('./logger');

let io;
let conectedClient = [];

exports.socketConnection = (server) => {
  io = require('socket.io')(server);
  io.on('connection', (socket) => {
    let connectionId;
    socket.on('create', (id) => {
      connectionId = id;
      conectedClient.push(id);
      socket.join(id);
      log.info('Client connected', { id });
    });

    socket.on('error', (err) => {
      log.error('Socket error', err);
    });

    socket.on('disconnect', () => {
      conectedClient = conectedClient.filter((client) => client !== connectionId);
      log.info('Client disconnected', { id: connectionId });
    });
  });
};

exports.sendMessage = (room, key, message) => io.in(room).emit(key, message);

exports.isConnected = (room) => conectedClient.indexOf(room) > -1;
