const http = require('http').createServer(handler);
const fs = require('fs');
const io = require('socket.io')(http);

http.listen(3000);

const Gpio = require('onoff').Gpio;

const LED4 = new Gpio(4, 'out');
const LED17 = new Gpio(17, 'out');

const leds = [LED4, LED17];

function handler(req, res) {
    fs.readFile(__dirname + '/public/index.html', function (err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end('404 Not Found');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
}

io.sockets.on('connection', function (socket) {
    socket.on('leds', ({ledGreen, ledRed}) => {
        if (LED4.readSync() !== ledGreen)
            LED4.writeSync(ledGreen);
        if (LED17.readSync() !== ledRed)
            LED17.writeSync(ledRed);
    });
});

process.on('SIGINT', function () {
    leds.forEach((curr) => {
        curr.writeSync(0);
        curr.unexport();
    });
    process.exit();
});