from operator import xor
import socket
from sqlite3 import Date
import string
from tabnanny import check
from wsgiref.simple_server import server_version
from xmlrpc.client import Server
 #Socket is used to create the packets
#From the OpenTTD Docs...
#Create a TCP connection to the server on port 3977. The application is expected to authenticate within 10 seconds.

#https://docs.python.org/3/library/socket.html

#Create a Socket https://youtu.be/3QiPPX-KeSc?t=2229
def TwoComplment(byteArray):
    Inversed = bytearray()
    for byte in byteArray:
        Inversed.extend(bytes([xor(byte,255)]))
    return(Inversed)

class ServerInfo:
    def __init__(self):
        print("ServerClass!")
    def setServerName(self,ServerName):
        self.ServerName = ServerName
    def setServerVersion(self,ServerVersion):
        self.ServerVersion = ServerVersion
    def setDedicated(self,Dedicated):
        self.Dedicated = Dedicated
    def setMapName(self,MapName):
        self.MapName = MapName
    def setSeed(self,Seed):
        self.Seed = Seed
    def setLandscape(self,Landscape):
        self.Landscape = Landscape
    def setStartDate(self,StartDate):
        self.StartDate = StartDate
    def setMapWidth(self,MapWidth):
        self.MapWidth = MapWidth
    def setMapHeight(self,MapHeight):
        self.MapHeight = MapHeight
    def setCurrentDate(self,CurrentDate):
        self.CurrentDate = CurrentDate
    def DaysPassed(self):
        self.Days = self.CurrentDate-self.StartDate
    
class CompanyInfo:
    def __init__(self,CompanyID):
        self.CompanyID = CompanyID
        print("CompanyClass!")

class ClientInfo:
    def __init__(self,ClientID):
        self.ClientID = ClientID
        print("ClientClass!")
    
 


AdminPassword = "Eric"
AdminName = "Erics Bot"
AdminVersion = "1.0"


def StringWrite(string):
    tmp = bytearray()
    tmp.extend(string.encode('utf-8'))
    tmp.extend(bytes(b'\x00'))
    return(tmp)
def BoolWrite(bool):
    if bool == True: return(b'\x01')
    else: return(b'\x00')
def Uint8Write(number):
    tmp = bytearray()
    tmp.extend(bytes([number]))
    return(tmp)
def Uint16Write(number):
    if number <= 255:tmp = bytes([number]) + b'\x00'
    else: tmp = bytes([number])
    return(tmp)
def Uint32Write(number):
    if number <= 255:tmp = bytes([number]) + b'\x00' +b'\x00' +b'\x00'
    elif number <= 65535: tmp = bytes([number]) + b'\x00' +b'\x00'
    elif number <= 1677215: tmp = bytes([number]) + b'\x00'
    else: tmp = bytes([number])
    return(tmp)
def ConstructPacket(Type, Data):
    #Packet Format is SIZE TYPE \x00 DATA \x00
    payload = bytearray()
    for var in Data:
        if type(var) == str: payload.extend(StringWrite(var))
        elif type(var) == int: payload.extend(bytes([var]))
        elif type(var) == bytes: payload.extend(var)
        else: pass
    payload = bytes([Type]) + payload
    Packet = Uint16Write(len(payload)+2)+payload
    print("The Following Packet was Created...")
    print(Packet)        
    return(Packet)

def StringRead(Data):
    tmp = bytearray()
    for val in Data:
        byte = bytes([val])
        if byte == b'\x00':break
        else: tmp.extend(byte)
    Data = Data[len(tmp)+1:] #+1 to include the EOS
    tmp = tmp.decode('utf-8')
    return(tmp,Data)
def BoolRead(Data):
    tmp = bytearray()
    tmp.extend(bytes([Data[0]]))
    Data = Data[1:]
    if tmp[0] == 1:tmp = True
    else:tmp = False
    return(tmp,Data)
def Uint8Read(Data):
    tmp = bytearray()
    tmp=Data[0]
    Data = Data[1:]
    return(tmp,Data)
def Uint16Read(Data):
    tmp = bytearray()
    tmp.extend(Data[0:2])
    Data = Data[2:]
    return(int.from_bytes(tmp,'little'),Data)
def Uint32Read(Data):
    tmp = bytearray()
    tmp.extend(Data[0:4])
    Data = Data[4:]
    return(int.from_bytes(tmp,'little'),Data)
def Uint64Read(Data):
    tmp = bytearray()
    tmp.extend(Data[0:8])
    tmp = int.from_bytes(tmp,'little')
    Data = Data[8:]
    return(tmp,Data)
def Sint64Read(Data):
    tmp = bytearray()
    tmp.extend(Data[0:8])
    check = int.from_bytes(tmp,'little')
    if check  > (pow(2,63)):
        tmp = TwoComplment(tmp)
        tmp = int.from_bytes(tmp,'little')*-1
    else:
        tmp = int.from_bytes(tmp,'little')
    Data = Data[8:]
    return(tmp,Data)

def DeconstructPacket(Server:ServerInfo):
    Packet = Sock.recv(1024)
    Size = Packet[0]+Packet[1] #The first 2 bytes are always the size of the Packet
    Data = Packet[3:] #first 3 pices of information are useless to us
    Type = bytes([Packet[2]]) #The type is always the 3rd byte
    #We will scan Packet, make new data packet thats smaller for each piece of info we remove https://docs.openttd.org/source/d0/dec/tcp__admin_8h_source.html
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
            #Unpack Packet
            ServerName, Data = StringRead(Data)
            ServerVersion, Data = StringRead(Data)
            Dedicated, Data = BoolRead(Data)
            MapName, Data = StringRead(Data)
            Seed, Data = Uint32Read(Data)
            Landscape, Data = Uint8Read(Data)
            StartDate, Data = Uint32Read(Data)
            MapWidth, Data = Uint16Read(Data)
            MapHeight, Data = Uint16Read(Data)
            #Assign to Class
            Server.setServerName(ServerName)
            Server.setServerVersion(ServerVersion)
            Server.setDedicated(Dedicated)
            Server.setMapName(MapName)
            Server.setSeed(Seed)
            Server.setLandscape(Landscape)
            Server.setStartDate(StartDate)
            Server.setMapWidth(MapWidth)
            Server.setMapHeight(MapHeight)

        case b'\x69': #105
            print("ADMIN_PACKET_SERVER_NEWGAME")
        case b'\x6a': #106
            print("ADMIN_PACKET_SERVER_SHUTDOWN")
        case b'\x6b': #107
            print("ADMIN_PACKET_SERVER_DATE")
            CurrentDate,Data = Uint32Read(Data)
            Server.setCurrentDate(CurrentDate)
            Server.DaysPassed()
            print(Server.Days)
        case b'\x6c': #108
            print("ADMIN_PACKET_SERVER_CLIENT_JOIN")
            ClientID, Data = Uint32Read(Data)
            Ab = ClientInfo(ClientID)
        case b'\x6d': #109
            print("ADMIN_PACKET_SERVER_CLIENT_INFO")
        case b'\x6e': #110
            print("ADMIN_PACKET_SERVER_CLIENT_UPDATE")
        case b'\x6f': #111
            print("ADMIN_PACKET_SERVER_CLIENT_QUIT")
        case b'\x70': #112
            print("ADMIN_PACKET_SERVER_CLIENT_ERROR")
        case b'\x71': #113
            print("ADMIN_PACKET_SERVER_COMPANY_NEW")
        case b'\x72': #114
            print("ADMIN_PACKET_SERVER_COMPANY_INFO")
        case b'\x73': #115
            print("ADMIN_PACKET_SERVER_COMPANY_UPDATE")
        case b'\x74': #116
            print("ADMIN_PACKET_SERVER_COMPANY_REMOVE")
        case b'\x75': #117
            print("ADMIN_PACKET_SERVER_COMPANY_ECONOMY")
            
            print("---------------------------------------")
            print("---------------------------------------")
            print(Data)
            while len(Data) >1 :
                CompanyID, Data = Uint8Read(Data)
                Money, Data = Sint64Read(Data)
                Loan, Data = Uint64Read(Data)
                Income, Data = Sint64Read(Data)
                Cargo, Data = Uint16Read(Data)
                LastValue, Data = Uint64Read(Data)
                LastPerformance, Data = Uint16Read(Data)
                LastCargo, Data = Uint16Read(Data)
                PrevValue, Data = Uint64Read(Data)
                PrevPerformance, Data = Uint16Read(Data)
                prevCargo, Data = Uint16Read(Data)
                Data = Data[3:]
                

                print("Company ID: ",CompanyID)
                print("Money: ",Money)
                print("Loan: ", Loan)
                print("Income: ",Income)
                print("Cargo: ",Cargo)
                print("Last Value: ", LastValue)
                print("Last Performance: ", LastPerformance)
                print("Last Cargo: ", LastCargo)
                print("Prev Value: ", PrevValue)
                print("Prev Performance: ", PrevPerformance)
                print("Prev Cargo", prevCargo)
                print("---------------------------------------")
                print("---------------------------------------")
                print(Data)
            print("Done company Econ")
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
    return()

Sock = socket.socket(
    socket.AF_INET,     #Family = AF_INET (host,port pair)
    socket.SOCK_STREAM  #Type = SOCK_STREAM (TCP)
    )
print(ConstructPacket(0,[AdminPassword,AdminName,AdminVersion]))
address = ("127.0.0.1",3977)
Sock.connect(address)

Server = ServerInfo()
print(ConstructPacket(0,[AdminPassword,AdminName,AdminVersion]))
Sock.send(ConstructPacket(100,[AdminPassword,AdminName,AdminVersion]))
Sock.send(ConstructPacket(0,[AdminPassword,AdminName,AdminVersion])) #Admin Join Packet
DeconstructPacket(Server)
DeconstructPacket(Server)
Sock.send(ConstructPacket(2,[Uint16Write(0),b'\x04\x00'])) #Update, Date, Weekly
Sock.send(ConstructPacket(2,[Uint16Write(1),b'\x40\x00'])) #Update, Client_Info, Automaitcaly
Sock.send(ConstructPacket(2,[Uint16Write(2),b'\x40\x00'])) #Update, Company_Info, Automaitcaly
Sock.send(ConstructPacket(2,[Uint16Write(3),b'\x04\x00'])) #Update, Company_Info, Automaitcaly

while True:
    DeconstructPacket(Server)
#Sock.send(ConstructPacket(1,[])) #Admin Leave Packet

