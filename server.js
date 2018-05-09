const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(80);

io.on('connection', function (socket) {
    socket.emit('new_target', {
        server: '127.0.0.1',
        port: 8888,
        protocol: 'http'
    });
});