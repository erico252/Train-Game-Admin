import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom/client";
import ActiveServer from "./ActiveServer"
import { SocketsConnections,IGETSocketRes } from "./Interfaces"
const APIBase:string = "http://localhost:3000"



function Main(props) {

    const [serverConnectionsList, setServerConnectionsList] = useState<Array<SocketsConnections>>([])
    const [activeServerID, setAcitveServerID] = useState<number|null>(null)
    useEffect(() => {
        console.log("Render!",serverConnectionsList)
    })
    useEffect(() => {
        refreshServerConnectionsList()
    },[])
    useEffect(() => {
        console.log("The amount of connections has changed!")
        refreshServerConnectionsList()
    },[serverConnectionsList])
    function onPOSTConnectClick(Password:string, IP:string, Port:number){
        console.log("Ive Been Clicked!")
        fetch(APIBase+"/socket/connect",{
            method:'POST',
            mode: "cors",
            headers:{
                'Content-Type': "application/json"
            },
            body:JSON.stringify({
                PASS: Password,
                IP:IP,
                PORT:Port
            })
        })
        .then((res) => {
            res.json()
            console.log("First Then")
        })
        .then((res) => {
            console.log(res)
            console.log("Second Then")
        })
        .catch((err) => {
            console.log("There was an Error",err)
        })
        .finally(() => {
            console.log("Finally")
            refreshServerConnectionsList()
        })
    }
    function onPOSTRemoveConnectionClick(ID){
        console.log(`Removing ${ID}`)
        fetch(APIBase+"/close",{
            method:'POST',
            mode: "cors",
            headers:{
                'Content-Type': "application/json"
            },
            body:JSON.stringify({
                ID:ID
            })
        })
        .then((res) => {
            console.log(res)
        })
        .finally(() => {
            refreshServerConnectionsList()
        })
    }
    function refreshServerConnectionsList(){
        setAcitveServerID(null)
        fetch(APIBase+"/sockets",{
            method:'GET',
            mode: "cors",
            headers:{
                'Content-Type': "application/json"
            }
        })
        .then((res) => res.json())
        .then((res:IGETSocketRes) => {
            if(res.SocketList.length != serverConnectionsList.length){
                setServerConnectionsList(res.SocketList)
            }
        })
        .catch((err) => {
            console.log("There was an Error",err)
        })
    }
    function onPOSTClientsClick(ID){
        console.log("ToDO, probably put in seperate File")
        console.log(`Requesting Clients of Server with id ${ID}`)
        fetch(APIBase+"/connect",{
            method:'POST',
            mode: "cors",
            headers:{
                'Content-Type': "application/json"
            },
            body:JSON.stringify({
                ID:ID
            })
        })
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
        })
        .catch((err) => {
            console.log("There was an Error",err)
        })
    }
    function onPOSTCompaniesClick(ID:number){
        console.log("ToDO, probably put in seperate File")
        console.log(`Requesting Companies of Server with id ${ID}`)
        fetch(APIBase+"/connect",{
            method:'POST',
            mode: "cors",
            headers:{
                'Content-Type': "application/json"
            },
            body:JSON.stringify({
                ID:ID
            })
        })
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
        })
        .catch((err) => {
            console.log("There was an Error",err)
        })
    }

    /*
    We want to be able to reach diffrent endpoints.
    
    First we want to be able to connect to a server
        To connect to a server we need a PASSWORD, IP, PORT
        We will leave BOTNAME and VERSION as constants. Its my bot and i determine the version
    
    When connected we want to be able to dispaly active connections
        This will be done by pgining for a loop of connectison in ocnnectiso array
        then displaying the active connectsion and hteir server IPs (Possiblyt Server Names)

    We want to be able to select a connection and display its ACTIVE COMPANYS and ACTIVE CLIENTS
        We want to be able to expand individual clients and see stats
        We want to be able to expand individual companies and see stats
    
    We want to be able to close connections
        Choose an active connection and close it

    We want to activate certain information
        Choose info
        Choose frequency
        Show active Infos and their frequencys
    */
    return(
       <div>
        Hellow World
        <div>
            <button onClick={() => onPOSTConnectClick("Eric","127.0.0.1",3977)}>Connect!</button>
        </div>
        <div>
            <button onClick={() => refreshServerConnectionsList()}>Get Socket List!</button>
        </div>
        {activeServerID==null ? 
        serverConnectionsList.map((Connection) => {
            return(
                <div>
                    <button onClick={() => {onPOSTRemoveConnectionClick(Connection.ID)}}>x</button>
                    <button onClick={() => {setAcitveServerID(Connection.ID)}}>{Connection.Data.ServerName} {Connection.ID}</button>
                </div>
            )
        })
        : <ActiveServer ID={activeServerID} />}
       </div>
    )
}
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(<Main/>);