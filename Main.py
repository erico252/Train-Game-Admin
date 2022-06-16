from http import client
import socket #Socket is used to create the packets

#From the OpenTTD Docs...
#Create a TCP connection to the server on port 3977. The application is expected to authenticate within 10 seconds.

#https://docs.python.org/3/library/socket.html

#Create a Socket https://youtu.be/3QiPPX-KeSc?t=2229
 
AdminPort = socket.socket(
    socket.AF_INET,     #Family = AF_INET (host,port pair)
    socket.SOCK_STREAM  #Type = SOCK_STREAM (TCP)
    )
address = ("127.0.0.1",3977)
AdminPort.connect(address)

AdminPassword = ("Eric")
AdminName = ("botname")
AdminVersion = ("version")
AdminType = 0
AdminLength = len(AdminPassword) + len(AdminName) + len(AdminVersion) + 5

Packet = bytes([AdminLength])+bytes([AdminType])+("\0"+AdminPassword+"\0"+AdminName+"\0"+AdminVersion+"\0").encode("utf-8")

#Fake it till we make it 

print(Packet)
AdminPort.send(Packet)

