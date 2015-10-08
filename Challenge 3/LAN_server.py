#!/usr/bin/python
import socket, serial, string,threading,time
ser = serial.Serial('/dev/cu.usbmodem1421', 9600, timeout=1)
ser.write(bytes('2'))
def tcplink(sock, addr):
	print 'Accept new connection from %s:%s...' % addr
	#ser.write(bytes('1'))
	while True:
		data = sock.recv(5)
		if data == 'open':
        		ser.write(bytes('1'))
       		elif data == 'close':
        		ser.write(bytes('2'))
		print 'data is %s' % data
		time.sleep(1)	
		#if data == "exit" or not data :
		#	break
        #if data =='1':
        #	print 'enter'
            #ser.write(bytes('1'))
	sock.close()
	print 'Connection from %s:%s closed.' % addr
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('0.0.0.0', 9999))
s.listen(5)
print 'Waiting for connection...'
while True:

	sock, addr = s.accept()
	t = threading.Thread(target=tcplink, args=(sock, addr))
	t.start()


	
