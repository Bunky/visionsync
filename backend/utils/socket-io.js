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
      console.info(`Client connected [${id}]`);
    });

    socket.on('disconnect', () => {
      conectedClient = conectedClient.filter(client => client !== connectionId);
      console.info(`Client disconnected [${connectionId}]`);
    });
  });
};

exports.sendMessage = (room, key, message) => io.in(room).emit(key, message);

exports.isConnected = (room) => conectedClient.indexOf(room) > -1;
