// initialize everything, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , five = require("johnny-five"),
  board,servo,led,sensor;

var state;

board = new five.Board();

// on board ready
board.on("ready", function() {

  // init an led on pin 13, fade it in
  led = new five.Led(13).strobe(50);
  //led = new five.Led(6).fadeIn(500);

  // poll this sensor every second
  sensor = new five.Sensor({
    pin: "A5",
    freq: 1000
  });

});

// make web server listen on port 9999
app.listen(9999);

// handle web server
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error: Could not find loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}


// on a socket connection
io.sockets.on('connection', function (socket) {
  //console.log('Established connection with ' + socket);
  //socket.emit('news', { hello: 'world' });

  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  console.log('Established connection with ' + clientIp);

  // if board is ready
  if(board.isReady){
    // read in sensor data, pass to browser
    sensor.on("data",function(a){
    var Temp = this.raw;

  Temp = Math.log(((10230000/Temp) - 10000)); // Minus by 10K as that's the resistor in series with the thermistor
  Temp = 1 / (0.001129148 + (0.000234125 * Temp) + (0.0000000876741 * Temp * Temp * Temp));
  Temp = Temp - 273.15; // Convert Kelvin to Celcius
  Temp = Temp.toFixed(2)
  //  a = a + 1000;

     socket.emit('sensor', { raw: Temp + ' °C' });
    //  socket.emit('sensor', a);
    });
  }


  socket.on('ledSet', function (data) {
    console.log('The LED is blinking every ' + data + 'ms');
     if(board.isReady){    led.strobe(data); }
     socket.emit('news', { LED_blink_rate: data });
  });

  socket.on('ledOn', function (data) {
      console.log('The LED state is now: ' + data);
     if(board.isReady){    led.on(); state = 1; }
     socket.emit('news', { LED_State: 'On' });

  });

  socket.on('ledOff', function (data) {
      console.log('The LED state is now: ' + data);
     if(board.isReady){    led.stop().off(); state = 0; }
     socket.emit('news', {LED_State: 'Off'});
  });

});
