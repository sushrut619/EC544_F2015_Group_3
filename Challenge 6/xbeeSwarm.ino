#include <SoftwareSerial.h>

#include <XBee.h>
# include <SoftwareSerial.h>

SoftwareSerial xbeeSerial(2, 3);

const uint8_t MY_BEACON_ID = 3;

boolean LEADER_ELECTED_FLAG;    // to check if a leader has been elected on the network yet
boolean I_AM_LEADER;            // set to 1 if this xbee is the leader
boolean INFECTED_FLAG;          // to set or clear the infection
uint8_t LEADER_BEACON_ID;      
uint8_t XMITTER_BEACON_ID;
//uint8_t MIN_BEACON_ID;
uint8_t response_count;        // to count number of packets received successfully

int packetsSent;              // counts the number of packets sent since the last packet was received
int readtime;                 // to vary the readtime dynamically

const int red =  5;          // the number of the LED pin
const int green =  6;
const int blue =  7;

int sending = 0;
int buttonpressed = 0;
//debounce
// these variables are not used currently in this code
// used to toggle the LED red or green and debounce the switch
int lastButtonState = LOW;   // the previous reading from the input pin
long lastDebounceTime = 0;  // the last time the output pin was toggled
long debounceDelay = 50;    // the debounce time; increase if the output flickers
volatile long long timeout = 1000; // 0.5 seconds
volatile long long last_change_time = 0;

XBee xbee = XBee();

XBeeResponse response  = XBeeResponse();    //create an xbee object

//create reusable objects for responses we expect to handle
//uint8_t payload[] = {MY_BEACON_ID, LEADER_ELECTED_FLAG, INFECTED_FLAG, LEADER_BEACON_ID, response_count}; //payoad template
ZBRxResponse rx = ZBRxResponse();
ModemStatusResponse msr = ModemStatusResponse();

//  uint8_t command1[] = {'D','B'};  //command one
//  AtCommandRequest atRequest = AtCommandRequest(command1);

ZBTxStatusResponse txStatus = ZBTxStatusResponse();
AtCommandResponse atResponse = AtCommandResponse();


XBeeAddress64 broadcastAddr = XBeeAddress64(0x00000000, 0x0000FFFF);


void processResponse() {

  if (xbee.getResponse().isAvailable()) 
    {
    // got something
      Serial.println("xbee.getResponse is Available");
    // even if a response is available sometimes it neither gives an error not a ZB_RX_RESPONSE
    if(xbee.getResponse().isError())
    {
      Serial.print("Error Code: ");              // somehow an error is never displayed
      Serial.println(xbee.getResponse().getErrorCode());  
    }
    if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
      // got a zb rx packet
      Serial.println(response_count);
      Serial.println("xbee.getResponse is available");
      // now fill our zb rx class
      xbee.getResponse().getZBRxResponse(rx);

      Serial.println("Got an rx packet!");

      if (rx.getOption() == ZB_PACKET_ACKNOWLEDGED) {
        // the sender got an ACK
        Serial.println("packet acknowledged");
      } else {
        Serial.println("packet not acknowledged");
      }

      Serial.print("checksum is ");
      Serial.println(rx.getChecksum(), HEX);

      Serial.print("packet length is ");
      Serial.println(rx.getPacketLength(), DEC);

      for (int i = 0; i < rx.getDataLength(); i++) {
        Serial.print("payload [");
        Serial.print(i, DEC);
        Serial.print("] is ");
        Serial.println(rx.getData()[i], HEX);
      }

      for (int i = 0; i < xbee.getResponse().getFrameDataLength(); i++) {
        Serial.print("frame data [");
        Serial.print(i, DEC);
        Serial.print("] is ");
        Serial.println(xbee.getResponse().getFrameData()[i], HEX);
      }
      // read the received packet into local variables
      XMITTER_BEACON_ID = rx.getData()[0];
      LEADER_ELECTED_FLAG = rx.getData()[1];
      INFECTED_FLAG = rx.getData()[2];
      LEADER_BEACON_ID = rx.getData()[3];
      response_count = rx.getData()[4];
      
      // increment the response count for each successful response
      // used to check if the connection with leader has been lost
      response_count += 1;                //it is reset everytime a packet from leader is received 
      packetsSent = 0;
      if (XMITTER_BEACON_ID == LEADER_BEACON_ID) { //if leader checks in the response count is reset
        response_count = 0;                        // since this is also sent in payload, this counter has common value on all nodes
      }


      if (response_count >= 15) {         // if leader did not check in for 15 responses
        LEADER_ELECTED_FLAG = 0;          // reset the leader
      }
      /*
            if (LEADER_BEACON_ID == 0) {
              LEADER_BEACON_ID = rx.getData()[3];
            }

            if (XMITTER_BEACON_ID < MIN_BEACON_ID) {
              // since we choose to elect the beacon with smallest beacon id as the leader, find the smallest beacon id
              MIN_BEACON_ID = XMITTER_BEACON_ID;
            }
      */


    }
  } else if (xbee.getResponse().isError()) {
    Serial.print("error code:");
    Serial.println(xbee.getResponse().getErrorCode());
  }
  if (packetsSent >= 50) {            // if 50 packets have been sent since last packet received this means the xbee has lost connection with network
    LEADER_ELECTED_FLAG = 0;          // reset the leader
  }
  // leader election algortihm
  if (!LEADER_ELECTED_FLAG) {                       // if no leader has been elected yet
    elect_leader();                                // elect a new leader
  }
  sendTx();
}

void sendTx() {
  uint8_t payload[] = {MY_BEACON_ID, LEADER_ELECTED_FLAG, INFECTED_FLAG, LEADER_BEACON_ID, response_count};
  ZBTxRequest zbTx = ZBTxRequest(broadcastAddr, payload, sizeof(payload));
  Serial.println("sending frame....");
  Serial.print("Leader ID: ");
  Serial.println(LEADER_BEACON_ID);
  Serial.print("packets Sent: ");
  Serial.println(packetsSent);
  xbee.send(zbTx);          // send it once
  packetsSent += 1;
}

void elect_leader() {
  I_AM_LEADER = 1;                              //elect itself as the leader
  LEADER_ELECTED_FLAG = 1;
  LEADER_BEACON_ID = MY_BEACON_ID;
  response_count = 0;
  Serial.println("Leader Elected");
}

// function to debounce the button, nothing to do with leader election or communication
// funtion not used in this code
void up() {
  if (!digitalRead(9) == 1)
  {
    //  Serial.println("-------------GOING UP-------------");
    //  Serial.print("Current Time - ");
    //  Serial.println(millis());
    //  Serial.print("Last Change Time - ");
    //  Serial.println((long) last_change_time);
    //  int difference = millis() - last_change_time;
    //  Serial.print("Difference - ");
    //Serial.println((long) difference);
    //  Serial.print("Within Threshold? - ");
    /*
    if (difference > timeout || last_change_time == 0)
    { Serial.println((long) difference);
      Serial.println("Botton Pressed");
    }
    else
    {
      //Serial.println("NO");
    }
    */

    if (( ((millis() - last_change_time) > timeout)) || last_change_time == 0)
    {
      INFECTED_FLAG = 1;
      if (!I_AM_LEADER) {
        digitalWrite(red, HIGH);
        digitalWrite(green, LOW);
      }
      /*
      if (!MY_LEADER_ELECTED_FLAG)
      {
        MY_INFECTED_FLAG = 1;
        digitalWrite(red, HIGH);
        digitalWrite(green, LOW);
      }
      else
      {
        MY_INFECTED_FLAG = 1;
        //sendTx();
      }
      */
      //ledState=!ledState;
      last_change_time = millis();

    }

    //Serial.print("New Gear = ");
    //Serial.println(current_gear);
    delay(150);
  }
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  xbeeSerial.begin(9600);
  xbee.setSerial(xbeeSerial);
  Serial.print("Initializing beacon...");
  Serial.println(MY_BEACON_ID);

  // initialize variables and flags
  LEADER_ELECTED_FLAG = 0;
  I_AM_LEADER = 0;
  INFECTED_FLAG = 0;
  LEADER_BEACON_ID = 0;
  packetsSent = 0;
  // MIN_BEACON_ID = 100;

  Serial.println("listening for broadcast");
  if (xbee.readPacket(10000)) {
    Serial.println("initial response from network...");
    processResponse();
  } else {
    elect_leader();
    sendTx;
    delay(1000);
  }
}

void loop() {
  // make the xbee read for longer time if it has sent many packets without receiving any
  // packetsSent is reset once this xbee receives a successful ZR_RX_RESPONSE
  readtime = 5000+packetsSent*200;
  xbee.readPacket(readtime);
  processResponse();
  //delay(1000);
}
