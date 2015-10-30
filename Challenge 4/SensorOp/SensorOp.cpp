/*
  SensorOp.cpp - Library for reading optical reflective sensors.
  Created by César Augusto Hernández E., April 12, 2012.
  Released into the public domain, under Creative Commons License.
  This code aims to ease the use of optical reflective sensors to measure distance
*/

/*
  It includes two functions to read the sensor and filter the noise, taking several samples
*/

#include "Arduino.h"
#include "SensorOp.h"



SensorOp::SensorOp(int ledControl, int sensorPin, int samples)
{
  pinMode(ledControl, OUTPUT);
  _ledControl = ledControl;
  _sensorPin = sensorPin;
  _samples = samples;
}

int SensorOp::readSensor(int val, int fil)	// This function requires the input of the number of samples and filtering (RC) "degree", as the value is increased the noise is reduced but the reaction time is lowered
{
  _outputValue = 0;
  _sensorRead[0] = 0;
  _sensorValue[0] = 0;
  _diff = val;
  _diffN = 0;
  _ratio = 1;
  _acum = 0;

  for(int i=0 ; i < _samples ; i = i + 1)
  {
    digitalWrite(_ledControl,LOW); 
    delay(2);
    _sensorValue[0] = analogRead(_sensorPin); 
    digitalWrite(_ledControl,HIGH); 
    delay(2);
    _sensorRead[0] = analogRead(_sensorPin); 
    _diffN = ((_sensorRead[0] - _sensorValue[0]) + (fil*(_ratio * _diff))) / (fil+1);
    _acum = _acum + _diffN;
    _ratio = _diff / _diffN;
    _diff = _diffN;
  }

  _outputValue = _acum / _samples;

  return(_outputValue);

}


int SensorOp::readSensor(int val)	// This function will take an average of the number of samples, required.
{
  _outputValue = 0;
  _sensorRead[0] = 0;
  _sensorRead[1] = 0;
  _sensorValue[0] = 0;
  _sensorValue[1] = 0;

  for(int i=0 ; i < _samples ; i = i + 1)
  {
    digitalWrite(_ledControl,LOW); 
    delay(2);
    _sensorValue[0] = analogRead(_sensorPin); 
    digitalWrite(_ledControl,HIGH); 
    delay(2);
    _sensorRead[0] = analogRead(_sensorPin); 
    _sensorValue[1] = (_sensorValue[1] + _sensorValue[0]);
    _sensorRead[1] = (_sensorRead[1] + _sensorRead[0]);
  }

  _sensorValue[1] = (_sensorValue[1])/_samples;
  _sensorRead[1] = (_sensorRead[1])/_samples;
  _outputValue = _sensorRead[1] - _sensorValue[1];

  if(_outputValue > 0) 
  {
    return(_outputValue); 
  }
  else
  {
    return(val); 
  }

}


int SensorOp::readSensor()	// This function will read the difference with the envirnmental light.
{
  _outputValue = 0;
  _sensorRead[0] = 0;
  _sensorValue[0] = 0;

  digitalWrite(_ledControl,LOW); 
  delay(2);
  _sensorValue[0] = analogRead(_sensorPin); 
  digitalWrite(_ledControl,HIGH); 
  delay(2);
  _sensorRead[0] = analogRead(_sensorPin); 

  _outputValue = _sensorRead[0] - _sensorValue[0];

  return(_outputValue); 

}