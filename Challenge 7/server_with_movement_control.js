var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Cylon = require('cylon')
  , sleep = require('sleep');


app.listen(9999);

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

  socket.on('stop', function (data) {
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

  socket.on('moveForward', function (data) {
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

  socket.on('moveBackward', function (data) {
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
          console.log(data);
        }
      }).start();
  });

  });
});
