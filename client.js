const io = require('socket.io-client');
const rp = require('request-promise');
const socket = io.connect('http://localhost');

socket.on('new_target', function (data) {
    // TODO: Configure and fire agaist a new target
    console.log(data);
});

socket.on('stop', () => {
    // TODO: Stop current attacks
});

socket.on('start', () => {
    // TODO: Resume current attacks
});