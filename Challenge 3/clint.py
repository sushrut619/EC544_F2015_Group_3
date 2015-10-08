#!/usr/bin/python

import socket,serial, string
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#ser = serial.Serial('/dev/usb/tts/2', 9600, timeout=1)
s.connect(('155.41.11.15', 9999))

#print s.recv(1024)
s.send('open')
#print s.recv(1024)
    #if s.recv(1024)== '1':
#ser.write(byte('1'))
#else:
#   ser.write(byte('0'))

#s.send('exit')11
s.close()