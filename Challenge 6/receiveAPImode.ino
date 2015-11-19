#include <SoftwareSerial.h>

#include <XBee.h>
# include <SoftwareSerial.h>

SoftwareSerial xbeeSerial(2,3);

uint8_t BEACON_ID = 1;

XBee xbee = XBee();

XBeeResponse response  = XBeeResponse();

//create reusable objects for responses we expect to handle

ZBRxResponse rx = ZBRxResponse();
ModemStatusResponse msr = ModemStatusResponse();

uint8_t command1[] = {'D','B'};  //command one
AtCommandRequest atRequest = AtCommandRequest(command1);

ZBTxStatusResponse txStatus = ZBTxStatusResponse();
AtCommandResponse atResponse = AtCommandResponse();

uint8_t payload[] = {'h','i'};
XBeeAddress64 broadcastAddr = XBeeAddress64(0x00000000, 0x0000FFFF); 
ZBTxRequest zbTx = ZBTxRequest(broadcastAddr, payload, sizeof(payload));

void processResponse(){
  if (xbee.getResponse().isAvailable()) {
      // got something
      Serial.println("xbee.getResponse is available");     
      if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
        // got a zb rx packet
        
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
        
      }
    } else if (xbee.getResponse().isError()) {
      Serial.print("error code:");
      Serial.println(xbee.getResponse().getErrorCode());
    }
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  xbeeSerial.begin(9600);
  xbee.setSerial(xbeeSerial);
  Serial.println("Initializing receiver...");
}

void loop() {
  // put your main code here, to run repeatedly:
  xbee.readPacket();
  processResponse();
}
