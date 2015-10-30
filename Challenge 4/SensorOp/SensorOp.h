/*
  SensorOp.h - Library for reading optical reflective sensors.
  Created by César Augusto Hernández E., April 12, 2012.
  Released into the public domain, under Creative Commons License.
*/

#ifndef SensorOp_h
#define SensorOp_h

#include "Arduino.h"

class SensorOp
{
  public:
    SensorOp(int ledControl, int sensorPin, int samples);
    int readSensor(int val, int fil);
    int readSensor(int val);
    int readSensor();
  private:
    int _ledControl;
    int _sensorPin;
    int _sensorValue[2];
    int _sensorRead[2];
    int _outputValue;
    int _samples;
    float _diff;
    float _diffN;
    float _ratio;
    float _acum;
};

#endif