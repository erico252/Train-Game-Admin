from hashlib import new
from http import client
import socket
from tkinter import Pack #Socket is used to create the packets
import time

#From the OpenTTD Docs...
#Create a TCP connection to the server on port 3977. The application is expected to authenticate within 10 seconds.

#https://docs.python.org/3/library/socket.html

#Create a Socket https://youtu.be/3QiPPX-KeSc?t=2229
 
Sock = socket.socket(
    socket.AF_INET,     #Family = AF_INET (host,port pair)
    socket.SOCK_STREAM  #Type = SOCK_STREAM (TCP)
    )
address = ("127.0.0.1",3977)
Sock.connect(address)

AdminPassword = "Eric"
AdminName = "Erics Bot"
AdminVersion = "1.0"

def ConstructPacket(rawType, rawData):
    #Packet Format is SIZE TYPE \x00 DATA \x00
    #-------
    #lets create the array of data, there may not always be data
    #Also between each var, we need a \x00 (NULL Char i think)
    Data = bytearray()
    if len(rawData) > 0:
        for var in rawData:
            if type(var)== int: Data.extend(bytes([var]))
            else: Data.extend(var.encode('utf-8'))
            Data.extend(bytes(b'\x00'))
    else:Data=b'\x00'
    Type = bytes([rawType])
    Packet = Type + Data
    if len(Packet) <=255:Size = bytes([len(Packet)+2]) + b'\x00'
    else:Size = bytes([len(Packet)])
    Packet = Size + Packet
    print("The Following Packet was Created...")
    print(Packet)        
    return(Packet)

def DeconstructPacket():
    Packet = Sock.recv(1024)
    Size = Packet[0]+Packet[1] #The first 2 bytes are always the size of the Packet
    Type = Packet[2] #The type is always the 3rd byte
    Data = bytearray()
    for byte in range(3,Size):
        Data.extend(bytes([Packet[byte]]))
    return(Size,Type,Data)


Sock.send(ConstructPacket(rawType=0,rawData=[AdminPassword,AdminName,AdminVersion])) #Admin Join Packet
print("Receiving")
print(DeconstructPacket())
print("Receiving")
print(DeconstructPacket())
Size = b'\x07\x00'
Type = b'\x02' #Poll Freq
UpdateType = b'\x00\x00' #needs to be a unint 16 (2 bytes), admin update date is = 0 = \x00\x00
Freq = b'\x08' #Weekly Frequency
tmp = Size+Type+UpdateType+Freq+b'\x00'
print(tmp)
Sock.send(tmp)
counter = 0
while counter != 5:
    Size,Type,Data = DeconstructPacket()
    for byte in Data:
        print(byte)
        #for some reason day one seems to be 30,222,10,0
    counter += 1
Sock.send(ConstructPacket(rawType=1,rawData=[])) #Admin Leave Packet

