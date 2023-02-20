"use strict";
exports.__esModule = true;
exports.SERVER_CMD_LOGGING = exports.SERVER_PONG = exports.SERVER_RCON_END = exports.SERVER_GAMESCRIPT = exports.SERVER_CMD_LOGGING_OLD = exports.SERVER_CMD_NAMES = exports.SERVER_CONSOLE = exports.SERVER_RCON = exports.SERVER_CHAT = exports.SERVER_COMPANY_STATS = exports.SERVER_COMPANY_ECONOMY = exports.SERVER_COMPANY_REMOVE = exports.SERVER_COMPANY_UPDATE = exports.SERVER_COMPANY_INFO = exports.SERVER_COMPANY_NEW = exports.SERVER_CLIENT_ERROR = exports.SERVER_CLIENT_QUIT = exports.SERVER_CLIENT_UPDATE = exports.SERVER_CLIENT_INFO = exports.SERVER_CLIENT_JOIN = exports.SERVER_DATE = exports.SERVER_SHUTDOWN = exports.SERVER_NEWGAME = exports.SERVER_WELCOME = exports.SERVER_PROTOCOL = exports.SERVER_ERROR = exports.SERVER_BANNED = exports.SERVER_FULL = void 0;
function ExtractBOOL(InputData) {
    var Value;
    var OutputData;
    var RawBuffer = InputData.subarray(0, 1);
    if (RawBuffer[0] == 0) {
        Value = false;
    }
    else {
        Value = true;
    }
    OutputData = InputData.subarray(1);
    return [Value, OutputData];
}
function ExtractUINT8(InputData) {
    var Value;
    var OutputData;
    Value = InputData.subarray(0, 1).readInt8(0);
    OutputData = InputData.subarray(1);
    //console.log(Value,OutputData)
    return [Value, OutputData];
}
function ExtractUINT16(InputData) {
    var Value;
    var RawValue;
    var OutputData;
    RawValue = InputData.subarray(0, 2);
    OutputData = InputData.subarray(2);
    Value = RawValue.readUInt16LE(0);
    //console.log(Value,OutputData)
    return [Value, OutputData];
}
function ExtractUINT32(InputData) {
    var Value;
    var RawValue;
    var OutputData;
    RawValue = InputData.subarray(0, 4);
    OutputData = InputData.subarray(4);
    Value = RawValue.readUInt32LE(0);
    //console.log(Value,OutputData)
    return [Value, OutputData];
}
function ExtractUINT64(InputData) {
    var Value;
    var RawValue;
    var OutputData;
    RawValue = InputData.subarray(0, 8);
    OutputData = InputData.subarray(8);
    Value = RawValue.readBigUInt64LE(0);
    //console.log(Value,OutputData)
    return [Value, OutputData];
}
function ExtractINT64(InputData) {
    var Value;
    var RawValue;
    var OutputData;
    RawValue = InputData.subarray(0, 8);
    OutputData = InputData.subarray(8);
    Value = RawValue.readBigInt64LE(0);
    //console.log(Value,OutputData)
    return [Value, OutputData];
}
function ExtractSTRING(InputData) {
    var Value;
    var RawValue;
    var OutputData;
    RawValue = InputData.subarray(0, InputData.indexOf(0x00));
    OutputData = InputData.subarray(InputData.indexOf(0x00) + 1);
    Value = RawValue.toString();
    //console.log(Value,OutputData)
    return [Value, OutputData];
}
//https://github.com/OpenTTD/OpenTTD/blob/master/src/network/core/tcp_admin.h
function SERVER_FULL(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    return ("Server Is Full");
}
exports.SERVER_FULL = SERVER_FULL;
function SERVER_BANNED(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    return ("The source IP address is banned");
}
exports.SERVER_BANNED = SERVER_BANNED;
function SERVER_ERROR(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Netowrk Error Code UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_ERROR = SERVER_ERROR;
function SERVER_PROTOCOL(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    var DataFlag = true;
    //Extract Protocol Version UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Furthur Data? BOOL
    Res = ExtractBOOL(NextData);
    DataFlag = (Res[0]);
    NextData = Res[1];
    //While More Data
    while (DataFlag == true) {
        //Extract Update Type UINT16
        Res = ExtractUINT16(NextData);
        Values.push(Res[0]);
        NextData = Res[1];
        //Extract Freqs Allowed UINT16
        Res = ExtractUINT16(NextData);
        Values.push(Res[0]);
        NextData = Res[1];
        //Extract Furthur Data? BOOL
        Res = ExtractBOOL(NextData);
        DataFlag = Res[0];
        NextData = Res[1];
    }
    return (Values);
}
exports.SERVER_PROTOCOL = SERVER_PROTOCOL;
function SERVER_WELCOME(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Name of Server STRING
    Res = ExtractSTRING(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract OpenTTDV Version STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Dedicated Flag BOOL
    Res = ExtractBOOL(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Map STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Seed UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Landscape UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Start Date UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Width UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Height UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //
    return (Values);
}
exports.SERVER_WELCOME = SERVER_WELCOME;
function SERVER_NEWGAME(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    return (["New Game Started!"]);
}
exports.SERVER_NEWGAME = SERVER_NEWGAME;
function SERVER_SHUTDOWN(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    return (["Server Shutting Down!"]);
}
exports.SERVER_SHUTDOWN = SERVER_SHUTDOWN;
function SERVER_DATE(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Current Date UINT32
    Res = ExtractUINT32(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_DATE = SERVER_DATE;
function SERVER_CLIENT_JOIN(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Client ID UINT32
    Res = ExtractUINT32(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_CLIENT_JOIN = SERVER_CLIENT_JOIN;
function SERVER_CLIENT_INFO(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of company UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Company STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Manager STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Color UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Password Flag BOOL
    Res = ExtractBOOL(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Founding Year UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract AI Flag BOOL
    Res = ExtractBOOL(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_CLIENT_INFO = SERVER_CLIENT_INFO;
function SERVER_CLIENT_UPDATE(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Client STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract ID of Clients Company UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_CLIENT_UPDATE = SERVER_CLIENT_UPDATE;
function SERVER_CLIENT_QUIT(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_CLIENT_QUIT = SERVER_CLIENT_QUIT;
function SERVER_CLIENT_ERROR(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Error Caused by Client UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_CLIENT_ERROR = SERVER_CLIENT_ERROR;
function SERVER_COMPANY_NEW(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Company ID UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_COMPANY_NEW = SERVER_COMPANY_NEW;
function SERVER_COMPANY_INFO(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Company STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Company Manager STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Color UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Password Flag BOOL
    Res = ExtractBOOL(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Company Start Date UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract AI Flag BOOL
    Res = ExtractBOOL(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_COMPANY_INFO = SERVER_COMPANY_INFO;
function SERVER_COMPANY_UPDATE(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of company UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Company  STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Name of Manager STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Color UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Password Flag BOOL
    Res = ExtractBOOL(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Share 1 UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Share 2 UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Share 3 UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Share 4 UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_COMPANY_UPDATE = SERVER_COMPANY_UPDATE;
function SERVER_COMPANY_REMOVE(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Removal Resaon UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_COMPANY_REMOVE = SERVER_COMPANY_REMOVE;
function SERVER_COMPANY_ECONOMY(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Money UINT64
    Res = ExtractUINT64(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Loan UINT64
    Res = ExtractUINT64(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Income INT64
    Res = ExtractINT64(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Delivered Cargo This Quarter UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Company Value Last Quarter UINT64
    Res = ExtractUINT64(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Performace Last Quarter UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Delivered Cargo Last Quarter UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Compnay Value Prev Quarter UINT64
    Res = ExtractUINT64(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Performace Prev Quarter UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Delivered Cargo Prev Quarter UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_COMPANY_ECONOMY = SERVER_COMPANY_ECONOMY;
function SERVER_COMPANY_STATS(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Trains UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Lorries UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Busses UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Planes UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Ships UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Train Stations UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Lorry Stations UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Bus Stops UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Airports UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Number of Harbours UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_COMPANY_STATS = SERVER_COMPANY_STATS;
function SERVER_CHAT(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    var Action;
    //Extract Action UINT8
    Res = ExtractUINT8(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    Action = Res[0];
    //Extract Destination UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Client ID INT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Message STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //If Action is Give Money(0x06)
    if (Action == 6) {
        //Extract Money UINT64
        Res = ExtractUINT64(NextData);
        Values.push(Res[0]);
        NextData = Res[1];
    }
    return (Values);
}
exports.SERVER_CHAT = SERVER_CHAT;
function SERVER_RCON(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Color UINT16
    Res = ExtractUINT16(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Output STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_RCON = SERVER_RCON;
function SERVER_CONSOLE(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Origin STRING
    Res = ExtractSTRING(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Text STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_CONSOLE = SERVER_CONSOLE;
function SERVER_CMD_NAMES(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    var DataFlag = true;
    //Extract DataFlag BOOL
    Res = ExtractBOOL(InputData);
    DataFlag = Res[0];
    NextData = Res[1];
    //While More Data to Come
    while (DataFlag == true) {
        //Extract ID of DoCommand UINT16
        Res = ExtractUINT16(NextData);
        Values.push(Res[0]);
        NextData = Res[1];
        //Extract Name of DoCommand STRING
        Res = ExtractSTRING(NextData);
        Values.push(Res[0]);
        NextData = Res[1];
        //ExtractDataFlag BOOL
        Res = ExtractBOOL(InputData);
        DataFlag = Res[0];
        NextData = Res[1];
    }
    return (Values);
}
exports.SERVER_CMD_NAMES = SERVER_CMD_NAMES;
function SERVER_CMD_LOGGING_OLD(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    return ("Not In Use!");
}
exports.SERVER_CMD_LOGGING_OLD = SERVER_CMD_LOGGING_OLD;
function SERVER_GAMESCRIPT(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    return ("Not In Use!");
}
exports.SERVER_GAMESCRIPT = SERVER_GAMESCRIPT;
function SERVER_RCON_END(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Command Requested STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_RCON_END = SERVER_RCON_END;
function SERVER_PONG(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract Integer ID UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_PONG = SERVER_PONG;
function SERVER_CMD_LOGGING(InputData) {
    var NextData = Buffer.from([0x00]);
    var Values = [];
    var Res = [];
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract ID of Company UINT8
    Res = ExtractUINT8(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract ID of Command UINT16
    Res = ExtractUINT16(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract P1 UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract P2 UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Tile UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Text pass to command STRING
    Res = ExtractSTRING(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    //Extract Frame of Execution UINT32
    Res = ExtractUINT32(NextData);
    Values.push(Res[0]);
    NextData = Res[1];
    return (Values);
}
exports.SERVER_CMD_LOGGING = SERVER_CMD_LOGGING;
