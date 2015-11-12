var mongo = require('mongodb'),
Server = mongo.Server,
Db = mongo.Db;
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('ch5_db2', server); //ch5_db2

var ml = require('machine_learning');

db.open(function(err, db) {
        if(!err) {
        console.log("We are connected");
        }
        });

var SerialPort = require("serialport");
//var app = require('express')();
var xbee_api = require('xbee-api');
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app)
var fs = require('fs');

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];

var sampleDelay = 100;
var txPower = 21;
var b1 = 33,b2 = 63 ,b3 = 64,b4 = 83; //kNN variables
var region;

var X = [[42,52,55,54],
[45,55,51,49],
[46,55,54,54],
[45,49,46,54],
[45,51,55,54],
[45,51,54,54],
[44,53,54,58],
[42,53,55,59],
[40,54,54,59],
[50,56,68,49],  //2
[48,54,62,48],
[51,55,53,46],
[52,46,51,51],
[53,51,56,43],
[49,53,56,46],
[47,35,60,60],  //3
[50,35,56,51],
[48,36,64,58],
[51,33,63,64],
[49,36,63,64],
[52,36,64,54],
[51,39,67,51],
[53,39,62,57],
[44,50,46,48],  //4
[43,46,47,49],
[45,47,49,46],
[47,45,47,52],
[46,49,46,45],
[51,43,44,48],
[51,44,45,47],
[49,43,44,46],
[42,47,58,51],  //5
[43,43,55,47],
[39,43,57,52],
[39,45,54,52],
[37,45,51,46],
[38,43,52,51],
[38,45,51,46],
[39,42,59,44],
[48,47,49,48],  //6
[57,49,53,56],
[52,48,53,63],
[63,46,54,57],
[61,48,52,60],
[54,47,58,56],
[57,49,49,58],
[55,48,49,62],
[58,46,62,55],
[56,66,38,55],  //7
[54,57,39,59],
[57,64,39,58],
[51,58,39,56],
[58,61,39,55],
[61,51,37,55],
[55,57,39,52],
[64,54,42,48],    //8
[66,54,42,57],
[67,52,47,55],
[63,57,45,53],
[61,51,42,54],
[65,64,42,50],
[59,57,48,66],
[53,67,51,46],  //9
[52,59,51,65],
[53,60,49,45],
[54,51,52,55],
[53,60,49,45],
[54,51,52,55],
[53,60,50,55],
[52,57,51,49],
[51,62,55,49],
[53,61,54,49]
        ];

var Y = [1,1,1,1,1,1,1,1,1,
2,2,2,2,2,2,
3,3,3,3,3,3,3,3,
4,4,4,4,4,4,4,4,
5,5,5,5,5,5,5,5,
6,6,6,6,6,6,6,6,6,
7,7,7,7,7,7,7,
8,8,8,8,8,8,8,
9,9,9,9,9,9,9,9,9,9,
];

var knn = new ml.KNN({
    data : X,
    result : Y
});


//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
	baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

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

function calculatedistance(rssi) {

 if (rssi == 0) return -1.0; // if we cannot determine accuracy, return -1.
 var ratio = rssi*1.0/txPower;
 if (ratio < 1.0) return Math.pow(ratio,10);
 else return  (0.89976) * Math.pow(ratio,7.7095) + 0.111;          // The function returns the product of p1 and p2
}

io.sockets.on('connection', function (socket) {
  //console.log('Established connection with ' + socket);
  //socket.emit('news', { hello: 'world' });
  // var socketId = socket.id;
  // var clientIp = socket.request.connection.remoteAddress;
  // console.log('Established connection with ' + clientIp);


//Create a packet to be sent to all other XBEE units on the PAN.
// The value of 'data' is meaningless, for now.
  var RSSIRequestPacket = {
    type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
    destination64: "000000000000ffff",
    broadcastRadius: 0x01,
    options: 0x00,
    data: "test"
  }

  var requestRSSI = function(){
    sp.write(XBeeAPI.buildFrame(RSSIRequestPacket));
  }
  console.log('open');
    requestRSSI();
    setInterval(requestRSSI, sampleDelay);

// sp.on("open", function () {
//   console.log('open');
//   requestRSSI();
//   setInterval(requestRSSI, sampleDelay);
// });

  XBeeAPI.on("frame_object", function(frame) {
    if (frame.type == 144){

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
                case 4:
                    b4 = frame.data[0];
                    break;
            }

            region = knn.predict({
                x : [b1,b2,b3,b4],
                k : 4,

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


      console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]));
      socket.emit('sensor', { raw: 'Beacon ID: ' + frame.data[1] + '    RSSI: ' + frame.data[0] + '   Distance: ' + calculatedistance(frame.data[0]).toFixed(2) + ' cm' });
      // socket.emit('sensor2', frame.data[0]);
      socket.emit('sensor2', { id: frame.data[1], rssi: frame.data[0], distance: calculatedistance(frame.data[0]) });
      socket.emit('sensor3', { id: frame.data[1], rssi: frame.data[0], region: region.toFixed(0)  });

      var time =new Date().toLocaleTimeString('en-US', { hour12: false,
                                              hour: "numeric",
                                              minute: "numeric",
                                              second: "numeric"}).toString();

      db.open(function(err, db) {
              if(!err) {
              db.collection('bar', function(err, collection) {
                var doc1 = { id: frame.data[1], rssi: frame.data[0], distance: calculatedistance(frame.data[0]).toFixed(2), time: time};
                collection.insert(doc1); //add data to database
                console.log("We are connected");
                //var bar = db.bar.find({ id: 1 }, { distance: 1, _id:0 }).sort( { $natural: -1 } ).limit(1);

                //collection.find(({ id: 1 }, { distance: 1, _id:0 }).sort({ $natural: -1 }).limit(1), function(error, bar){
                collection.findOne({ id: 1 }, { distance: 1, _id:0, time: 1 }, { $natural: -1 }, function(error, bar){
                  console.log(bar);
                  var d1 = bar;
                });
                              });
                        }
              });
    }

  });

});
