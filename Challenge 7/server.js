var express = require('express'),
  	app = express(),
  	server = require('http').createServer(app),
  	io = require('socket.io').listen(server),
    Cylon = require('cylon'),
    sleep = require('sleep');

server.listen(9999);
app.use(express.static(__dirname + '/'));

io.sockets.on('connection', function (socket) {
  //console.log('Established connection with ' + socket);
  //socket.emit('news', { hello: 'world' });

  var socketId = socket.id;
  //var clientIp = socket.request.connection.remoteAddress;
  console.log('Established connection with' + socket);

  socket.on('servoLeft', function (data) {
    console.log(data);
    Cylon.robot({
    connections: {
      raspi: { adaptor: 'raspi' }
        },
        devices: {
          servo: { driver: 'servo', pin: 7 }
        },

        work: function(my) {
          my.servo.angle(data);
        }
      }).start();

  socket.on('servoRight', function (data) {
    console.log(data);
    Cylon.robot({
    connections: {
      raspi: { adaptor: 'raspi' }
        },
        devices: {
          servo: { driver: 'servo', pin: 7 }
        },

        work: function(my) {
          my.servo.angle(data);
        }
      }).start();
  });

  socket.on('move', function (data) {
    console.log(data);
    Cylon.robot({
    connections: {
      raspi: { adaptor: 'raspi' }
        },
        devices: {
          servo: { driver: 'servo', pin: 7 }
        },

        work: function(my) {
          my.servo.angle(data);
        }
      }).start();
  });

  // socket.on('moveForward', function (data) {
  //   console.log(data);
  //   Cylon.robot({
  //   connections: {
  //     raspi: { adaptor: 'raspi' }
  //       },
  //       devices: {
  //         servo: { driver: 'servo', pin: 7 }
  //       },
  //
  //       work: function(my) {
  //         //my.servo.angle(data);
  //         console.log(data);
  //       }
  //     }).start();
  // });

  // socket.on('moveBackward', function (data) {
  //   console.log(data);
  //   Cylon.robot({
  //   connections: {
  //     raspi: { adaptor: 'raspi' }
  //       },
  //       devices: {
  //         servo: { driver: 'servo', pin: 7 }
  //       },
  //
  //       work: function(my) {
  //         //my.servo.angle(data);
  //         console.log(data);
  //       }
  //     }).start();
  // });

  });
});
