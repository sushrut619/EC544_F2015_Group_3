var express = require('express'),
  	app = express(),
  	server = require('http').createServer(app),
  	io = require('socket.io').listen(server),
    Cylon = require('cylon'),
    sleep = require('sleep'),
    fs = require('fs');
    var SerialPort = require("serialport");
    var PID = require('pid-controller');
    var sleep =require("sleep");
    var ml = require('machine_learning');
    var xbee_api = require('xbee-api');

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var sampleDelay = 1000;
var b1 = 33,b2 = 63 ,b3 = 64,b4 = 83; //kNN variables
var region;

    //var auto = require("./pid");
// fs.writeFile(filename, data, [encoding], [callback])
var flag=1;
var hasinit=0;
var turning=0;
var cur=0;
var robot1;
var stop=0;
var command;
var left=1;
var right=2;
var forward=3;
var back=4;

var count=0;
var divide_count;
var index;

var Input = 30,
  Setpoint = 80;
  //Output;
    var Kp =1.0,
    Ki = 0.0,
    Kd = 0.01;

    var X = [
      [41,67,86],
      [42,66,86],
      [41,70,86],
      [41,68,87],
      [42,69,87],
      [42,65,87],
      [41,72,87],
      [43,70,87],
      [41,69,87],
      [42,67,87],
      [70,46,86],
      [73,46,86],
      [70,45,85],
      [73,47,85],
      [71,45,85],
      [67,48,86],
      [71,47,86],
      [69,45,86],
      [70,45,84],
      [69,45,85],
      [67,80,55],
      [67,81,56],
      [68,80,55],
      [68,80,55],
      [68,79,55],
      [68,81,55],
      [69,80,56],
      [67,82,53],
      [67,84,55],
      [67,80,54]
    ];

    var Y = [
      1,1,1,1,1,1,1,1,1,1,
      2,2,2,2,2,2,2,2,2,2,
      3,3,3,3,3,3,3,3,3,3
    ];

    var knn = new ml.KNN({
        data : X,
        result : Y
    });

    var ctr = new PID(Input, Setpoint, Kp, Ki, Kd, 'direct'),
    timeframe = 100;
     var dis=0;
     ctr.setOutputLimits(-20,20);
     ctr.setMode('auto');
server.listen(9999);
app.use(express.static(__dirname + '/'));

io.sockets.on('connection', function (socket) {
  // var portConfig = {
  //   baudRate: 9600,
  //   parser: SerialPort.parsers.readline("\n")
    var portConfig1 = {
    	baudRate: 9600,
      parser: XBeeAPI.rawParser()
    };
  // };

  var sp;
  sp = new SerialPort.SerialPort("/dev/ttyUSB0", portConfig1);

  //Create a packet to be sent to all other XBEE units on the PAN.
// The value of 'data' is meaningless, for now.
var RSSIRequestPacket = [{
  type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
  destination64: "0013A2004091BD2C",
  broadcastRadius: 0x01,
  options: 0x00,
  data: "test"
},
{
  type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
  destination64: "0013A20040A1A147",
  broadcastRadius: 0x01,
  options: 0x00,
  data: "test"
},
{
  type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
  destination64: "0013A20040A1A1D6",
  broadcastRadius: 0x01,
  options: 0x00,
  data: "test"
}];

var requestRSSI = function(){
  count += 1;
  divide_count = count%3;
  index = Math.floor(divide_count,10);
  //console.log(index + " " + divide_count);
  sp.write(XBeeAPI.buildFrame(RSSIRequestPacket[index]));
}

sp.on("open", function () {
  console.log('open');
  requestRSSI();
  setInterval(requestRSSI, sampleDelay);
});

XBeeAPI.on("frame_object", function(frame) {
  if (frame.type == 144){
    // console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]) + ", turnFlag: " + (frame.data[2]));
    switch(frame.data[1]){
              case 1:
                  b1 = frame.data[0];
                  break;
              case 2:
                  b2 = frame.data[0];
                  break;
              case 3:
                  b3 = frame.data[0];
                  break;
              // case 4:
              //     b4 = frame.data[0];
              //     break;
          }

          region = knn.predict({
              x : [b1,b2,b3],
              k : 3,

              weightf : {type : 'gaussian', sigma : 10.0},
              // default : {type : 'gaussian', sigma : 10.0}
              // {type : 'none'}. weight == 1
              // Or you can use your own weight f
              // weightf : function(distance) {return 1./distance}

              distance : {type : 'euclidean'}
              // default : {type : 'euclidean'}
              // {type : 'pearson'}
              // Or you can use your own distance function
              // distance : function(vecx, vecy) {return Math.abs(dot(vecx,vecy));}
          });

                    if(frame.data[2]==1)
                   {
                      flag = 0;
                      // console.log('Turn = ' + frame.data[2]);
                      console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]) + ", turnFlag: " + (frame.data[2]));
                      console.log("flag is 0 now");
                      //robot.start();


                      //robot.start();
                   }
                   if(frame.data[2]==2)
                   {
                      flag = 1;
                      //.start();
                      // console.log('Turn = ' + frame.data[2]);
                      //robot.start();
                   }
    // console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]) + ", turnFlag: " + (frame.data[2]));
    // socket.emit('sensor', { raw: 'Beacon ID: ' + frame.data[1] + '    RSSI: ' + frame.data[0] + '   Distance: ' + calculatedistance(frame.data[0]).toFixed(2) + ' cm' });
    // // socket.emit('sensor2', frame.data[0]);
    // socket.emit('sensor2', { id: frame.data[1], rssi: frame.data[0], distance: calculatedistance(frame.data[0]) });
    socket.emit('sensor3', { id: frame.data[1], rssi: frame.data[0], region: region.toFixed(0)  });


  }
});





  // var robot=Cylon.robot({
  //     connections: {
  //   raspi: { adaptor: 'raspi' }
  //   //arduino: { adaptor: "firmata", port: "/dev/ttyACM0" }
  //     },
  //
  //     devices: {
  //       lidar: { driver: "lidar-lite" },
  //        servo: { driver: 'servo', pin: 7},
  //        esc: { driver: 'servo', pin:  11}
  //
  //     },
  //
  //
  //        work: function(my) {
  //       // require('events').EventEmitter.prototype._maxListeners = 100;
  //       // var dis=0;
  //       // ctr.setOutputLimits(-30,50);
  //       // ctr.setMode('auto');
  //       if(!hasinit)
  //       {
  //       my.esc.angle(180);
  //        sleep.sleep(1);
  //        my.esc.angle(0);
  //        sleep.sleep(1);
  //        my.esc.angle(90);
  //        sleep.sleep(1);
  //       my.esc.angle(80);
  //       my.servo.angle(110);
  //
  //
  //       my.esc.angle(65);
  //       hasinit=1;
  //       }
  //       // my.servo.angle(160);
  //
  //       // after((3000).milliseconds(), function() {
  //       // my.servo.angle(110);
  //       // my.esc.angle(60);
  //       // after((2000).milliseconds(), function() {
  //       // my.esc.angle(70);
  //       // flag=1;
  //       // //my.servo.angle(160);
  //       // });
  //       // });
  //
  //
  //
  //       every(100, function() {
  //
  //         if(flag)
  //         {
  //           my.esc.angle(65);
  //         //my.servo.angle(160);
  //         my.lidar.distance(function(err, data) {
  //           dis=parseInt(data);
  //         });
  //         if(Math.abs(dis-ctr.getInput())<200)
  //         // if(dis>200)
  //         // 	ctr.setPoint(dis);
  //         // if(dis<150)
  //         // 	ctr.setPoint(30);
  //         //if(1)
  //         {
  //           ctr.setInput(dis);
  //         ctr.compute();
  //         my.servo.angle(110+Math.round(ctr.getOutput()));
  //
  //         }
  //         else
  //           {my.servo.angle(110);
  //           console.log("print no in!");
  //         }
  //         console.log("set"+ctr.getSetPoint()+"distance: " + dis+",output:"+Math.round(ctr.getOutput()));
  //         }
  //         if(!flag)
  //         {
  //
  //         my.servo.angle(45);
  //
  //
  //
  //         turning=0;
  //         }
  //   })}
  //
  //
  //   });
  // var sp = new SerialPort.SerialPort("/dev/ttyUSB0", portConfig1);
  var robot=Cylon.robot({
      connections: {
    raspi: { adaptor: 'raspi' }
    //arduino: { adaptor: "firmata", port: "/dev/ttyACM0" }
      },

      devices: {
        lidar: { driver: "lidar-lite" },
         servo: { driver: 'servo', pin: 7},
         esc: { driver: 'servo', pin:  11}

      },


         work: function(my) {
        // require('events').EventEmitter.prototype._maxListeners = 100;
        // var dis=0;
        // ctr.setOutputLimits(-30,50);
        // ctr.setMode('auto');
        if(!hasinit)
        {
        my.esc.angle(180);
         sleep.sleep(1);
         my.esc.angle(0);
         sleep.sleep(1);
         my.esc.angle(90);
         sleep.sleep(1);
        my.esc.angle(80);
        my.servo.angle(110);


        my.esc.angle(75);
        hasinit=1;
        }
        // my.servo.angle(160);

        // after((3000).milliseconds(), function() {
        // my.servo.angle(110);
        // my.esc.angle(60);
        // after((2000).milliseconds(), function() {
        // my.esc.angle(70);
        // flag=1;
        // //my.servo.angle(160);
        // });
        // });



        every(100, function() {

          if(flag&&!stop)
          {
            my.esc.angle(75);
          //my.servo.angle(160);
          my.lidar.distance(function(err, data) {
            dis=parseInt(data);
          });
          if(Math.abs(dis-ctr.getInput())<200)
          // if(dis>200)
          // 	ctr.setPoint(dis);
          // if(dis<150)
          // 	ctr.setPoint(30);
          //if(1)
          {
            ctr.setInput(dis);
          ctr.compute();
          my.servo.angle(110+Math.round(ctr.getOutput()));

          }
          else
            {my.servo.angle(110);
            console.log("print no in!");
          }
          console.log("set"+ctr.getSetPoint()+"distance: " + dis+",output:"+Math.round(ctr.getOutput()));
          }
          else if(!flag&&!stop)
          {
            console.log("Turing!!!!!!");

          my.servo.angle(45);



        //  turning=0;
          }
          // else {
          //   switch (command){
          //     // case left:
          //     // my.servo.angle(150);
          //     // break;
          //     // case right:
          //     // my.servo.angle(40);
          //     // break;
          //     case back:
          //     my.esc.angle(90);
          //     my.servo.angle(110);
          //     break;
          //     case forward:
          //     my.esc.angle(60);
          //     my.servo.angle(110);
          //     break;
          //     default:
          //     my.servo.angle(90);
          //     my.esc.angle(90);
          //     break;
          //   }
          //
          //
          // }

    })}


  });

  // sp.on("open", function ()
  // {
  //        console.log('Opened serial port, logging turn signal');
  //        sp.on('data', function(data)
  //        {		console.log( data);
  //
  //           var c = data.charAt(0);
  //           //var id=data.charAt(1);
  //           if(c==1)
  //          {
  //             flag = 0;
  //             console.log('Turn = ' + c);
  //
  //             //robot.start();
  //          }
  //          if(c==0)
  //          {
  //             flag = 1;
  //             console.log('Turn = ' + c);
  //             //robot.start();
  //          }
  //
  //        });
  // });
  //console.log('Established connection with ' + socket);
  //socket.emit('news', { hello: 'world' });

  var socketId = socket.id;
  //var clientIp = socket.request.connection.remoteAddress;
  console.log('Established connection with' + socket);

//Auto mode
  socket.on('auto', function (data) {

robot.start();
stop=0;
    //robot.start();

        //ctr.setSampleTime(timeframe);
        //Port Configuration

    // module.exports =
    // 	foo:function(){
// robot.start();
    //}
    //robot1=robot;
    console.log('Auto mode started');
    //console.log(typeof auto.foo);
  });

  socket.on('manual', function (data) {
    //robot.servo.angel();
    stop=1;
    Cylon.robot({
    connections: {
      raspi: { adaptor: 'raspi' }
        },
        devices: {
          servo: { driver: 'servo', pin: 7},
          esc: { driver: 'servo', pin: 11 }
        },

        work: function(my) {
          my.servo.angle(100);
          my.esc.angle(100)

        // work: function(my) {
        //   Cylon.halt();
        //   // my.servo.angle(90);
        //   // my.esc.angle(90);
        //   // every(100, function() {
        //   //   my.servo.angle(90);
        //   //   my.esc.angle(90);
        //   // })
        }

      }).start();
    console.log('Auto mode stopped');
  });

  socket.on('locate', function (data) {
    fs.writeFile('location.txt', data.lat + ' ' +data.lng);
    // fs.writeFile('helloworld.txt', data);
    console.log('coordinates > helloworld.txt');
    console.log(data);
    io.emit('live_location', data);
  });

  socket.on('servoLeft', function (data) {
    // command=left;
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
      // Cylon.halt();
  });


  socket.on('servoRight', function (data) {
    // command=right;
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
    // command=forward;
    console.log(data);
    Cylon.robot({
    connections: {
      raspi: { adaptor: 'raspi' }
        },
        devices: {
          esc: { driver: 'servo', pin: 11 }
        },

        work: function(my) {
          my.esc.angle(data);
        }
      }).start();
      // Cylon.halt();
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
  //   command=back;
  // });

  // });
});
