var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');

var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];

var sampleDelay = 1000;

var count = 0;
var divide_count;
var index;

//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
	
	baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);


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
    console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]) + ", turnFlag: " + (frame.data[2]));
  }
});