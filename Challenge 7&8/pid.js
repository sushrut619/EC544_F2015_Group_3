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

var Cylon = require("cylon");
var PID = require('pid-controller');
var sleep =require("sleep");
var flag=0;
var Input = 30,
	Setpoint = 30;
	//Output;
		var Kp = 3.0,
		Ki = 0.0,
		Kd = 0.1

		var ctr = new PID(Input, Setpoint, Kp, Ki, Kd, 'direct'),
		timeframe = 100;
		//ctr.setSampleTime(timeframe);



Cylon.robot({
		connections: {
	raspi: { adaptor: 'raspi' }
	//arduino: { adaptor: "firmata", port: "/dev/ttyACM0" }
		},

		devices: {
			lidar: { driver: "lidar-lite" },
			 servo: { driver: 'servo', pin: 7 },
			 esc: { driver: 'servo', pin:  12}

		},


		work: function(my) {
			require('events').EventEmitter.prototype._maxListeners = 10;
			var dis=0;
			ctr.setOutputLimits(-30,50);
			ctr.setMode('auto');
			my.esc.angle(180);
			 sleep.sleep(1);
			 my.esc.angle(0);
			 sleep.sleep(1);
			 my.esc.angle(90);
			 sleep.sleep(1);
			my.esc.angle(60);
			
			my.servo.angle(160);

			after((3000).milliseconds(), function() {
			my.servo.angle(110);
			my.esc.angle(60);
			after((2000).milliseconds(), function() {
			my.esc.angle(70);
			flag=1;
			//my.servo.angle(160);
			});
			});



			every(100, function() {
				if(flag)
				{
				my.servo.angle(160);
				my.lidar.distance(function(err, data) {
					dis=data;	
				});
				ctr.setInput(dis);
				ctr.compute();
				my.servo.angle(110+Math.round(ctr.getOutput()));
				console.log("set"+ctr.getSetPoint()+"distance: " + dis+",output:"+Math.round(ctr.getOutput()));
			}
			});
		}
	}).start()
//setInterval(temperturesimulation, timeframe);
