#include <XBee.h>
#include <SoftwareSerial.h>

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

uint8_t payload[] = {5,6};
XBeeAddress64 broadcastAddr = XBeeAddress64(0x00000000, 0x0000FFFF); 
ZBTxRequest zbTx = ZBTxRequest(broadcastAddr, payload, sizeof(payload));

void setup (){
  Serial.begin(9600);
  xbeeSerial.begin(9600);
  xbee.setSerial(xbeeSerial);
  Serial.println("Initializing transmitter...");
}

void sendTx(ZBTxRequest zbTx){
  xbee.send(zbTx);

   if (xbee.readPacket(5000)) {
    Serial.println("Got a Tx status response!");
    // got a response!

    // should be a znet tx status              
    if (xbee.getResponse().getApiId() == ZB_TX_STATUS_RESPONSE) {
      xbee.getResponse().getZBTxStatusResponse(txStatus);

      // get the delivery status, the fifth byte
      if (txStatus.getDeliveryStatus() == SUCCESS) {
        // success.  time to celebrate
        Serial.println("SUCCESS!");
      } else {
        Serial.println("FAILURE!");
        // the remote XBee did not receive our packet. is it powered on?
      }
    }
    else{
      Serial.println("ZB_TX_STATUS_RESPONSE false");
      Serial.println(txStatus.getDeliveryStatus());
    }
  } else if (xbee.getResponse().isError()) {
    Serial.print("Error reading packet.  Error code: ");  
    Serial.println(xbee.getResponse().getErrorCode());
  } else {
    // local XBee did not provide a timely TX Status Response -- should not happen
    Serial.println("This should never happen...");
  }
}

void loop(){
  sendTx(zbTx);
  delay(1000);
}
