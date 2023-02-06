from operator import xor
import socket
from sqlite3 import Date
import string
from tabnanny import check
from wsgiref.simple_server import server_version
from xmlrpc.client import Server

Sock = socket.socket(
    socket.AF_INET,     #Family = AF_INET (host,port pair)
    socket.SOCK_STREAM  #Type = SOCK_STREAM (TCP)
    )
address = ("127.0.0.1",8080)
Sock.connect(address)
print("Sending Bytes")
Sock.send(b'\x00\x01\x02\x03')
print("sent Bytes")