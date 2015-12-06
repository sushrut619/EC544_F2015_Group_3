#include <SoftwareSerial.h>
SoftwareSerial XBee(2,3);

const int pwPin = 13; 
//variables needed to store values
long pulse, inches, cm;
int flag = 0;
void setup() {

  //This opens up a serial connection to shoot the results back to the PC console
  Serial.begin(9600);
  XBee.begin(9600);
}

void loop() {

  pinMode(pwPin, INPUT);
    //Used to read in the pulse that is being sent by the MaxSonar device.
  //Pulse Width representation with a scale factor of 147 uS per Inch.

  pulse = pulseIn(pwPin, HIGH);
  //147uS per inch
  inches = pulse/147;
  //change inches to centimetres
  cm = inches * 2.54;
//  Serial.print(inches);
//  Serial.print("in, "); 

 if (cm < 140) {
  flag = 1;
  XBee.print(flag);
 }
 else {
  flag = 0;
  XBee.print(flag);
 }
  Serial.print(cm);
  Serial.print("cm");
  Serial.println();
  delay(5);
}
