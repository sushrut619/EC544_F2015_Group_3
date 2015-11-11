/**
 * Created by sushrut on 11/10/2015.
 */
var SerialPort = require("serialport");
//var app = require('express')();
var xbee_api = require('xbee-api');
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

var ml = require('machine_learning');

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
    api_mode: 2
});

var portName = process.argv[2];

var sampleDelay = 100;

var b1 = 33,b2 = 63 ,b3 = 64,b4 = 83;
var region;
//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
    baudRate: 9600,
    parser: XBeeAPI.rawParser()
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

app.listen(9999);

//the following code implements the knn algorithm
var X = [[32,61,61,85],
    [31,62,62,84],
    [35,64,63,81],
    [37,60,61,85],
    [42,48,74,75],
    [45,45,75,76],
    [41,47,77,78],
    [43,46,74,76],
    [47,43,76,72],
    [49,41,79,72],
    [45,44,77,76],
    [42,48,78,75],
    [61,32,61,85],
    [63,31,62,84],
    [65,35,63,81],
    [63,37,61,85]];

var Y = [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4];

var knn = new ml.KNN({
    data : X,
    result : Y
});



//console.log("region: "+region);
// end of knn function
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


            console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]) + "region: " + region);
            socket.emit('sensor', { raw: 'Beacon ID: ' + frame.data[1] + '    RSSI: ' + frame.data[0] });
            // socket.emit('sensor2', frame.data[0]);
            socket.emit('sensor2', { id: frame.data[1], rssi: frame.data[0], region: region  });
        }
    });

});