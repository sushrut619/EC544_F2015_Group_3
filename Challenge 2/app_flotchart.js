/**
 * Module dependencies.
 */
var res = 0 ;
var SerialPort = require("serialport");
var express = require('express')
  , os = require('os')
  , routes = require('./routes')
  , config = require('./config')

var app = module.exports = express.createServer();
function gt() {
	return (new Date()).getTime()-18000000;
}

// Configuration

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.readline("\n")
}; //new

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout:false, pretty:true});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/flot', routes.flot);

sp = new SerialPort.SerialPort("/dev/cu.usbserial-AD01STE2", portConfig);
sp.on("open", function ()
{
       console.log('Opened serial port, logging temp');
       sp.on('data', function(data)
       {
        //   var c = data.substring(0,1);
        //  if(c==3)
        // {
        //     console.log('data from sensor 3: ' + data);
        //     // var a = data.substring(1,v.length-1);
        //     // res = a;
        // } else
        // if(c==4)
        // {
        //     console.log('data from sensor 4: ' + data);
        //     // var b = data.substring(1,v.length-1);
        //     // res = b;
        // }

         console.log('data received: ' + data); //data is the data received from the XBee

var now = 0;
//var res = [];
var time =new Date().toLocaleTimeString('en-US',
{ hour12: false, hour: "numeric", minute: "numeric", second: "numeric"}).toString(); //moved the time inside the loop

             //c={"temp":data.substring(1,data.length-1),"sensor":data.substring(0,1),"time":time};
             //obj.temperature.push(c);
             //res.push([data.substring(0,1), data.substring(1,data.length-1)]);
             //res = data.substring(1,data.length-1);

             res = data;
             now++;
       });


});

var io=require('socket.io').listen(app);
app.listen(3000);
var limit=config.limit, interval=config.interval, all_d=[]; // use all_d to hold config.limit number of data sets for initial connections
(function schedule() {
	setTimeout( function () {
    //var uptime_arr = [];
    var uptime_arr=os.loadavg();
		var ts=(new Date()).getTime();
		for(var i=0, l=uptime_arr.length;i<l;i++) {
			uptime_arr[i]=res;
		}
		uptime_arr.unshift(ts);
		all_d.push(uptime_arr)
		if(all_d.length>limit) {
			all_d=all_d.slice(0-limit);
		}
		io.sockets.emit('newdata', uptime_arr);
		schedule();
	}, interval*450);
})();

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
