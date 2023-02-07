class Packet:
    def __init__(self, socket):
        self.type = b'\x00'
        self.data = b'\x00'
        self.size = b'\x03'
        self.socket = socket

    #Setting Methods
    def setType(self, type):
        self.type = type
    def setData(self, data):
        if type(data) == bytearray or type(data) ==  bytes:
            self.data = data
        else:
            self.data = data.encode('utf-8')

    def setPacket(self, type, data):
        self.type = type
        self.data = data

    #Creating the Payload
    def createPayload(self):
        #Size (2bytes)
        #Type (1bytes)
        #Data (xbytes)
        information = self.type + self.data
        if len(information) <=255:self.size = bytes([len(information)+2]) + b'\x00'
        else:self.size = bytes([len(information)]) 
        self.payload = self.size + information

    def sendPayload(self):
        socket = self.socket
        socket.send(self.pay)




#we need to understad that we will decode packets based on their type and the data recieved will be interpreted diffrently
def decode(socketrecived)
