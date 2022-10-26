from hashlib import new
from http import client
import socket
from tkinter import Pack #Socket is used to create the packets
import time
import Packets

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
    print(Packet)
    print(type(Packet))
    Size = Packet[0]+Packet[1] #The first 2 bytes are always the size of the Packet
    Type = Packet[2] #The type is always the 3rd byte
    print(Type)
    match Type: # https://docs.openttd.org/source/d0/dec/tcp__admin_8h_source.html #https://github.com/OpenTTD/OpenTTD/blob/master/src/network/core/tcp_admin.h
        case b'\x64': #100
            print("ADMIN_PACKET_SERVER_FULL")
        case b'\x65': #101
            print("ADMIN_PACKET_SERVER_BANNED")
        case b'\x66': #102
            print("ADMIN_PACKET_SERVER_ERROR")
        case b'\x67': #103
            print("ADMIN_PACKET_SERVER_PROTOCOL")
        case b'\x68': #104
            print("ADMIN_PACKET_SERVER_WELCOME")
        case b'\x69': #105
            print("ADMIN_PACKET_SERVER_NEWGAME")
        case b'\x6a': #106
            print("ADMIN_PACKET_SERVER_SHUTDOWN")
        case b'\x6b': #107
            print("ADMON_PACKET_SERVER_DATE")
        case b'\x6c': #108
            print("ADMIN_PACKET_SERVER_CLIENT_JOIN")
        case b'\x6d': #109
            print("ADMIN_PACKET_SERVER_CLIENT_INFO")
        case b'\x6e': #110
            print("ADMIN_PACKET_SERVER_CLIENT_UPDATE")
        case b'\x6f': #111
            print("ADMIN_PACKET_SERVER_CLIENT_QUIT")
        case b'\x70': #112
            print("ADMIN_PACKET_SERVER_CLIENT_ERROR")
        case b'\x71': #113
            print("ADMIN_PACKET_SERVER_COMPANY_INFO")
        case b'\x72': #114
            print("ADMIN_PACKET_SERVER_COMPANY_INFO")
        case b'\x73': #115
            print("ADMIN_PACKET_SERVER_COMPANY_INFO")
        case b'\x74': #116
            print("ADMIN_PACKET_SERVER_COMPANY_REMOVE")
        case b'\x75': #117
            print("ADMIN_PACKET_SERVER_COMPANY_ECONOMY")
        case b'\x76': #118
            print("ADMIN_PACKET_SERVER_COMPANY_STATS")
        case b'\x77': #119
            print("ADMON_PACKET_SERVER_CHAT")
        case b'\x78': #120
            print("ADMIN_PACKET_SERVER_RCON")
        case b'\x79': #121
            print("ADMIN_PACKET_SERVER_CONSOLE")
        case b'\x7a': #122
            print("ADMIN_PACKET_SERVER_CMD_NAMES")
        case b'\x7b': #123
            print("ADMIN_PACKET_SERVER_CMD_LOGGING_OLD")
        case b'\x7c': #124
            print("ADMON_PACKET_SERVER_RCON_END")
        case b'\x7d': #125
            print("ADMIN_PACKET_SERVER_PONG")
        case b'\x7e': #126
            print("ADMIN_PACKET_SERVER_CMD_LOGGING")
        case b'\x7f': #127
            print("ADMIN_PACKET_SERVER_BANNED")
        case b'\xFF':
            print("INVALID_ADMIN_PACKET")
        case _:
            print("Default")
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
UpdateType = b'\x01\x00' #needs to be a unint 16 (2 bytes), admin update date is = 0 = \x00\x00
Freq = b'\x40' #Weekly Frequency
tmp = Size+Type+UpdateType+Freq+b'\x00'
print(tmp)
Sock.send(tmp)
counter = 0
while counter != 5:
    print("Recv")
    Size,Type,Data = DeconstructPacket()
    counter += 1
Sock.send(ConstructPacket(rawType=1,rawData=[])) #Admin Leave Packet

