
"use strict";
/**
 * pid-controller -  A node advanced PID controller based on the Arduino PID library
 * github@wilberforce.co.nz Rhys Williams
 * Based on:
 * Arduino PID Library - Version 1.0.1
 * by Brett Beauregard <br3ttb@gmail.com> brettbeauregard.com
 *
 * This Library is licensed under a GPL-3.0 License
 */
var SerialPort = require("serialport");
var Cylon = require("cylon");
var PID = require('pid-controller');
var sleep =require("sleep");
var flag=1;
var hasinit=0;
var turning=0;
var cur=0;
var Input = 30,
	Setpoint = 80;
	//Output;
		var Kp =1.0,
		Ki = 0.0,
		Kd = 0.01;

		var ctr = new PID(Input, Setpoint, Kp, Ki, Kd, 'direct'),
		timeframe = 100;
		 var dis=0;
		 ctr.setOutputLimits(-20,20);
		 ctr.setMode('auto');
		//ctr.setSampleTime(timeframe);
		//Port Configuration
		var portConfig = {
			baudRate: 9600,
			parser: SerialPort.parsers.readline("\n")
		};

		var sp = new SerialPort.SerialPort("/dev/ttyUSB0", portConfig);

		sp.on("open", function ()
		{
		       console.log('Opened serial port, logging turn signal');
		       sp.on('data', function(data)
		       {		console.log( data);

						  var c = data.charAt(0);
						  //var id=data.charAt(1);
						  if(c==1)
						 {
							 	flag = 0;
								console.log('Turn = ' + c);

								//robot.start();
						 }
						 if(c==0)
						 {
							 	flag = 1;
								console.log('Turn = ' + c);
								//robot.start();
						 }

					 });
		});
// module.exports =
// 	foo:function(){
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


			my.esc.angle(65);
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

				if(flag)
				{
					my.esc.angle(65);
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
				if(!flag)
				{

				my.servo.angle(45);



				turning=0;
				}
	})}}).start();
//}
