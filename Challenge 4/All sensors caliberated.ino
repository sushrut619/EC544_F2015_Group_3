#include <Wire.h>

#define    LIDARLite_ADDRESS   0x62          // Default I2C Address of LIDAR-Lite.
#define    RegisterMeasure     0x00          // Register to write to initiate ranging.
#define    MeasureValue        0x04          // Value to initiate ranging.
#define    RegisterHighLowB    0x8f          // Register to get both High and Low bytes in 1 call.

#include <Servo.h>

Servo myservo;
Servo wheels; // servo for turning the wheels
Servo esc; // not actually a servo, but controlled like one!
int pos = 0;         // Position of the servo (degress, [0, 180])
int distanceright, distanceleft, distance, LidarLeft, LidarRight;    // Distance measured
int startupDelay = 1000; // time to pause at each calibration step
const int pwPin = 7; //Sonar pin init
unsigned long pulse_width;

void setup()
{
  // Serial out
 
  Serial.begin(9600);
  Serial.println("< START >");
  //pinMode(Lidarleft, OUTPUT);
  //digitalWrite(Lidarleft, LOW); 
  //pinMode(Lidarright, OUTPUT);
  //digitalWrite(Lidarright, LOW);
  // Servo control
  myservo.attach(5); 
  wheels.attach(8); // initialize wheel servo to Digital IO Pin #8
  esc.attach(9); // initialize ESC to Digital IO Pin #9
  calibrateESC();
  // LIDAR control
  Wire.begin(); // join i2c bus
  pinMode(2, OUTPUT); // Set pin 2 as trigger pin for LidarLeft
  pinMode(3, INPUT); // Set pin 3 as monitor pin
  pinMode(4, OUTPUT); // Set pin 4 to control power enable line
  digitalWrite(4,HIGH); //Turn sensor on
  digitalWrite(2, LOW); // Set trigger LOW for continuous read
}

// Get a measurement from the LIDAR Lite

int lidarGetRangeLeft(void)
{  
pulse_width = pulseIn(3, HIGH); // Count how long the pulse is high in microseconds
  if(pulse_width != 0){ // If we get a reading that isn't zero, let's print it
        pulse_width = pulse_width/10; // 10usec = 1 cm of distance for LIDAR-Lite
    //Serial.println(pulse_width); // Print the distance
    return(pulse_width);
  }else{ // We read a zero which means we're locking up. 
    digitalWrite(4,LOW); // Turn off the sensor
    delay(1);// Wait 1ms
    digitalWrite(4,HIGH); //Turn on te sensor
    delay(1);//Wait 1ms for it to turn on.
  }
  delay(1); //Delay so we don't overload the serial port
}

int lidarGetRangeRight(void)
{  
  int val = -1;
  
  Wire.beginTransmission((int)LIDARLite_ADDRESS); // transmit to LIDAR-Lite
  Wire.write((int)RegisterMeasure); // sets register pointer to  (0x00)  
  Wire.write((int)MeasureValue); // sets register pointer to  (0x00)  
  Wire.endTransmission(); // stop transmitting

  delay(20); // Wait 20ms for transmit

  Wire.beginTransmission((int)LIDARLite_ADDRESS); // transmit to LIDAR-Lite
  Wire.write((int)RegisterHighLowB); // sets register pointer to (0x8f)
  Wire.endTransmission(); // stop transmitting

  delay(20); // Wait 20ms for transmit
  
  Wire.requestFrom((int)LIDARLite_ADDRESS, 2); // request 2 bytes from LIDAR-Lite

  if(2 <= Wire.available()) // if two bytes were received
  {
    val = Wire.read(); // receive high byte (overwrites previous reading)
    val = val << 8; // shift high byte to be high 8 bits
    val |= Wire.read(); // receive low byte as lower 8 bits
  }
  
  return val;
}

//void serialPrintRange(int pos, int distance)
//{
//    Serial.print("Position (deg): ");
//    Serial.print(pos);
//    Serial.print("\t\tDistance (cm): ");
//    Serial.println(distance);
//}

void calibrateESC(){
    esc.write(180); // full backwards
    delay(startupDelay);
    esc.write(0); // full forwards
    delay(startupDelay);
    esc.write(90); // neutral
    delay(startupDelay);
    esc.write(90); // reset the ESC to neutral (non-moving) value
}

void turn(int distanceright,int distanceleft,int front)
{ if(distanceleft<distanceright)//more closer to left 
  {
  if(front>120)
  {
  if(distanceleft<30)
  wheels.write(90 + 40);
  else if(distanceleft>30 )
  wheels.write(90 - 15);
  else
   wheels.write(90);
  }
  else
  wheels.write(90 + 90);
  }
  if(distanceleft>distanceright) //more closer to right
  {
  if(front>120)
  {
  if(distanceright<30)
  wheels.write(90 - 15);
  else if(distanceright>30 )
  wheels.write(90 + 40);
  else
   wheels.write(90);
  }
  else
  wheels.write(90 + 90);
  }
  
}

int sonar( int pin)
{
   pinMode(pin, INPUT);
    //Used to read in the pulse that is being sent by the MaxSonar device.
  //Pulse Width representation with a scale factor of 147 uS per Inch.
  long pulse, inches, cm;

  pulse = pulseIn(pin, HIGH);
  //147uS per inch
  inches = pulse/147;
  //change inches to centimetres
  cm = inches * 2.54;
  if (pin == 7)
  {
      Serial.print("Sonar pin right: ");
      Serial.println(cm);
  }
  else if (pin == 6)
  {
      Serial.print("Sonar pin left: ");
      Serial.println(cm);
  }
  return cm;
    
}

int IR(int pin){
  float volts = analogRead(pin)*0.0048828125;   // value from sensor * (5/1024) - if running 3.3.volts then change 5 to 3.3
  float distance = 65*pow(volts, -1.10);          // worked out from graph 65 = theretical distance / (1/Volts)S - luckylarry.co.uk

  if (pin == 0)
  {
    Serial.print("\t\tIR Front: ");
    Serial.println(distance);
    //return distance;
  }
  else if (pin == 1)
  {
    Serial.print("\t\tIR Back: ");
    Serial.println(distance);
  }
  return distance;
}
void loop()
{  
//
    //distanceright = sonar(7);
    //distanceleft = sonar(6);
    //serialPrintRange(pos, distance); 

    //turn(distanceright,distanceleft,getLidarRange()); 
    
   esc.write(75);
    IR(0);
   //IR(1);
    //lidarleft = getLidarRange(2);
    delay(20);
    LidarRight = lidarGetRangeRight();
    delay(20);
    LidarLeft = lidarGetRangeLeft();
//    Serial.print("\t\t\t\tLidar Left: ");
//    Serial.println(LidarLeft);
//    Serial.print("\t\t\t\tLidar Right: ");
//    Serial.println(LidarRight);
   // delay(100);

}
