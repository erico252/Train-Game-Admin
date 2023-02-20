import * as net from "net";
//--INTERFACES--

export interface ServerObject {
    UUID:number|null
    Companies:Array<CompanyObject>
    CompanyEconomies:Array<CompanyEconomyObject>
    CompanyStats:Array<CompanyStatsObject>
    Clients:Array<ClientObject>
    CurrentDate:number
    ServerName:string
    ServerVersion:string
    DedicatedFlag:boolean
    MapName:string
    MapSeed:number
    Landscape:number
    MapHeight:number
    MapWidth:number
    StartDate:number
    
}
export interface CompanyObject {
    ID:number
    CompanyName:string|null
    ManagerName:string|null
    Color:number|null
    PasswordFlag:boolean|null
    Share1:number|null
    Share2:number|null
    Share3:number|null
    Share4:number|null
    Economy: CompanyEconomyObject
    Stats: CompanyStatsObject
}
export interface ClientObject {
    ID:number
    ClientName:string|null
    ClientCompanyID:number|null
}
export interface CompanyEconomyObject {
    Money:number
    Loan:number
    Income:number
    ThisDeliveredCargo:number
    LastCompanyValue:number
    LastPerformance:number
    LastDeliveredCargo:number
    PrevCompanyValue:number
    PrevPerformance:number
    PrevDeliveredCargo:number

}
export interface CompanyStatsObject {
    Trains:number
    Lorries:number
    Busses:number
    Planes:number
    Ships:number
    TrainStations:number
    LorryStations:number
    BusStops:number
    AirPorts:number
    Harbours:number
}