function ExtractBOOL(InputData){
    let Value:boolean
    let OutputData:Buffer
    let RawBuffer:Buffer = InputData.subarray(0,1)
    if(RawBuffer[0] == 0){Value = false}
    else{Value = true}
    OutputData = InputData.subarray(1)
    return [Value,OutputData]
}
function ExtractUINT8(InputData){
    let Value:number
    let OutputData:Buffer
    Value = InputData.subarray(0,1).readInt8(0)
    OutputData = InputData.subarray(1)
    //console.log(Value,OutputData)
    return [Value,OutputData]
}
function ExtractUINT16(InputData){
    let Value:number
    let RawValue:Buffer
    let OutputData:Buffer
    RawValue = InputData.subarray(0,2)
    OutputData = InputData.subarray(2)
    Value = RawValue.readUInt16LE(0)
    //console.log(Value,OutputData)
    return [Value,OutputData]
}
function ExtractUINT32(InputData){
    let Value:number
    let RawValue:Buffer
    let OutputData:Buffer
    RawValue = InputData.subarray(0,4)
    OutputData = InputData.subarray(4)
    Value = RawValue.readUInt32LE(0)
    //console.log(Value,OutputData)
    return [Value,OutputData]
}
function ExtractUINT64(InputData){
    let Value:bigint
    let RawValue:Buffer
    let OutputData:Buffer
    RawValue = InputData.subarray(0,8)
    OutputData = InputData.subarray(8)
    Value = RawValue.readBigUInt64LE(0)
    //console.log(Value,OutputData)
    return [Value,OutputData]
}
function ExtractINT64(InputData){
    let Value:bigint
    let RawValue:Buffer
    let OutputData:Buffer
    RawValue = InputData.subarray(0,8)
    OutputData = InputData.subarray(8)
    Value = RawValue.readBigInt64LE(0)
    //console.log(Value,OutputData)
    return [Value,OutputData]
}
function ExtractSTRING(InputData){
    let Value:string
    let RawValue:Buffer
    let OutputData:Buffer
    RawValue = InputData.subarray(0,InputData.indexOf(0x00))
    OutputData = InputData.subarray(InputData.indexOf(0x00)+1)
    Value = RawValue.toString()
    //console.log(Value,OutputData)
    return [Value,OutputData]
}
//https://github.com/OpenTTD/OpenTTD/blob/master/src/network/core/tcp_admin.h
export function SERVER_FULL(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    return("Server Is Full")
}
export function SERVER_BANNED(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    return("The source IP address is banned")
} 
export function SERVER_ERROR(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Netowrk Error Code UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_PROTOCOL(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    let DataFlag:boolean = true
    //Extract Protocol Version UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Furthur Data? BOOL
    Res = ExtractBOOL(NextData)
    DataFlag = (Res[0])
    NextData = Res[1]
    //While More Data
    while(DataFlag == true){
        //Extract Update Type UINT16
        Res = ExtractUINT16(NextData)
        Values.push(Res[0])
        NextData = Res[1]
        //Extract Freqs Allowed UINT16
        Res = ExtractUINT16(NextData)
        Values.push(Res[0])
        NextData = Res[1]
        //Extract Furthur Data? BOOL
        Res = ExtractBOOL(NextData)
        DataFlag = Res[0]
        NextData = Res[1]
    }
    return(Values)
}
export function SERVER_WELCOME(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Name of Server STRING
    Res = ExtractSTRING(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract OpenTTDV Version STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Dedicated Flag BOOL
    Res = ExtractBOOL(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Map STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Seed UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Landscape UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Start Date UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Width UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Height UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //
    return(Values)

}
export function SERVER_NEWGAME(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    return(["New Game Started!"])
}
export function SERVER_SHUTDOWN(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    return(["Server Shutting Down!"])
}
export function SERVER_DATE(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Current Date UINT32
    Res = ExtractUINT32(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CLIENT_JOIN(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Client ID UINT32
    Res = ExtractUINT32(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CLIENT_INFO(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of company UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Company STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Manager STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Color UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Password Flag BOOL
    Res = ExtractBOOL(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Founding Year UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract AI Flag BOOL
    Res = ExtractBOOL(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CLIENT_UPDATE(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Client STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract ID of Clients Company UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
    
}
export function SERVER_CLIENT_QUIT(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CLIENT_ERROR(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Error Caused by Client UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_COMPANY_NEW(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Company ID UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_COMPANY_INFO(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Company STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Company Manager STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Color UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Password Flag BOOL
    Res = ExtractBOOL(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Company Start Date UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract AI Flag BOOL
    Res = ExtractBOOL(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_COMPANY_UPDATE(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of company UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Company  STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Name of Manager STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Color UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Password Flag BOOL
    Res = ExtractBOOL(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Share 1 UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Share 2 UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Share 3 UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Share 4 UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_COMPANY_REMOVE(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Removal Resaon UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_COMPANY_ECONOMY(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Money UINT64
    Res = ExtractUINT64(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Loan UINT64
    Res = ExtractUINT64(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Income INT64
    Res = ExtractINT64(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Delivered Cargo This Quarter UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Company Value Last Quarter UINT64
    Res = ExtractUINT64(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Performace Last Quarter UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Delivered Cargo Last Quarter UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Compnay Value Prev Quarter UINT64
    Res = ExtractUINT64(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Performace Prev Quarter UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Delivered Cargo Prev Quarter UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_COMPANY_STATS(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Company UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Trains UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Lorries UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Busses UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Planes UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Ships UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Train Stations UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Lorry Stations UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Bus Stops UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Airports UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Number of Harbours UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CHAT(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    let Action:number
    //Extract Action UINT8
    Res = ExtractUINT8(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    Action = Res[0]
    //Extract Destination UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Client ID INT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Message STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //If Action is Give Money(0x06)
    if(Action==6){
        //Extract Money UINT64
        Res = ExtractUINT64(NextData)
        Values.push(Res[0])
        NextData = Res[1]
    }
    return(Values)    
}
export function SERVER_RCON(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Color UINT16
    Res = ExtractUINT16(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Output STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CONSOLE(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Origin STRING
    Res = ExtractSTRING(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Text STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CMD_NAMES(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    let DataFlag:boolean = true
    //Extract DataFlag BOOL
    Res = ExtractBOOL(InputData)
    DataFlag=Res[0]
    NextData = Res[1]
    //While More Data to Come
    while(DataFlag==true){
        //Extract ID of DoCommand UINT16
        Res = ExtractUINT16(NextData)
        Values.push(Res[0])
        NextData = Res[1]
        //Extract Name of DoCommand STRING
        Res = ExtractSTRING(NextData)
        Values.push(Res[0])
        NextData = Res[1]
        //ExtractDataFlag BOOL
        Res = ExtractBOOL(InputData)
        DataFlag=Res[0]
        NextData = Res[1]
    }
    return(Values)
}
export function SERVER_CMD_LOGGING_OLD(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    return("Not In Use!")
}
export function SERVER_GAMESCRIPT(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    return("Not In Use!")
}
export function SERVER_RCON_END(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Command Requested STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_PONG(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract Integer ID UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}
export function SERVER_CMD_LOGGING(InputData){
    let NextData:Buffer = Buffer.from([0x00])
    let Values:Array<any> = []
    let Res:Array<any> = []
    //Extract ID of Client UINT32
    Res = ExtractUINT32(InputData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract ID of Company UINT8
    Res = ExtractUINT8(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract ID of Command UINT16
    Res = ExtractUINT16(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract P1 UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract P2 UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Tile UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Text pass to command STRING
    Res = ExtractSTRING(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    //Extract Frame of Execution UINT32
    Res = ExtractUINT32(NextData)
    Values.push(Res[0])
    NextData = Res[1]
    return(Values)
}