var Cylon = require('cylon');
//require('events').EventEmitter.prototype._maxListeners = 100;
//var options = {uri:headingUri, headers:headerData, maxRedirects:100};
//request.setMaxListeners(0);
//request.get(options, function (error, response, body) {
//}

//Cylon.setMaxListeners(0);

Cylon.robot({
  connections: {
raspi: { adaptor: 'raspi' }
//arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
  },

  devices: {
    servo: { driver: 'servo', pin: 7 }
  },

  work: function(my) {
    var angle = 45 ;
    my.servo.angle(angle);
    every((1).second(), function() {
      angle = angle + 45 ;
      if (angle > 135) {
        angle = 45
      }
      my.servo.angle(angle);
    });
  }
}).start();
