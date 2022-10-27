(0,0,0,0 0,0,0,0)
(0,Automatic,Anually,Quarterly Monthly,Weekly,Daily,Poll)
(0,\x40,\x20,\x10 \x08,\x04,\x02,\x01)

\x01 Protocol
\x01 Bool
\x00\x00 Packet Type (DATE)
?\x00 Allowed freqs, Bitwise (0011 1111)
\x01 Bool
\x01\x00 Packet Type (CLIENT INFO)
A\x00 Allowed freqs, Bitwise (0100 0001)
\x01 Bool
\x02\x00 Packet TYpe (COMPANY INFO)
A\x00 Allowed freqs, Bitwise (0100 0001)
\x01 Bool
\x03\x00 Packet Type (COMPANY ECONOMY)
=\x00 Allowed freqs, Bitwise (0011 1101)
\x01 Bool
\x04\x00 Packet Type (COMPAN STATS)
=\x00 Allowed freqs, Bitwise (0011 1101)
\x01 Bool
\x05\x00 Packet Type (CHAT)
@\x00 Allowed freqs, Bitwise (0100 0000)
\x01 Bool
\x06\x00 Packet Type (CONSOLE)
@\x00 Allowed freqs, Bitwise (0100 0000)
\x01 Bool
\x07\x00 Packet Type (CMD NAMES)
\x01\x00 Allowed freqs, Bitwise (0000 0001)
\x01 Bool
\x08\x00 Packet Type (CMD LOGGING)
@\x00 Allowed freqs, Bitwise (0100 0000)
\x01 Bool 
\t\x00 Packet Type (GAMESCRIPT)
@\x00 Allowed freqs, Bitwise (0100 0000)
\x00 Bool (End)


\xff\xff\xff\xff\xff\xff\xd8\x0f
1111 1111 1111 1111 1111 1111 1111 1111 1111 1111 1111 1111 1101 1000 0000 1111

