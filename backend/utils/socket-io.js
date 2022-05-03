const { socketLogger: logger } = require('./logger');

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
      logger.log({
        level: 'info',
        message: 'Client connected',
        metadata: {
          id
        }
      });
    });

    socket.on('error', (err) => {
      logger.log({
        level: 'error',
        message: 'Socket error',
        metadata: {
          stack: err.stack
        }
      });
    });

    socket.on('disconnect', () => {
      conectedClient = conectedClient.filter((client) => client !== connectionId);
      logger.log({
        level: 'info',
        message: 'Client disconnected',
        metadata: {
          id: connectionId
        }
      });
    });
  });
};

exports.sendMessage = (room, key, message) => io.in(room).emit(key, message);

exports.isConnected = (room) => conectedClient.indexOf(room) > -1;
