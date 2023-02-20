import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom/client";
import ActiveServer from "./ActiveServer"
import { SocketsConnections,IGETSocketRes } from "./Interfaces"
const APIBase:string = "http://localhost:3000"



function Main(props) {

    const [serverConnections, setServerConnections] = useState<Array<SocketsConnections>>([])
    const [activeServerID, setAcitveServerID] = useState<number|null>(null)
    useEffect(() => {
        console.log("Render!")
    })
    useEffect(() => {
        onGETSocketsClick()
    },[])
    useEffect(() => {
        console.log("The amount of connections has changed!")
    },[serverConnections])
    function onPOSTConnectClick(Password:string, IP:string, Port:number){
        console.log("Ive Been Clicked!")
        fetch(APIBase+"/connect",{
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
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
        })
        .catch((err) => {
            console.log("There was an Error",err)
        })
    }
    function onGETSocketsClick(){
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
            setServerConnections(res.SocketList)
            res.SocketList.forEach((val) => {
                console.log(val)
            })
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
            <button onClick={() => onGETSocketsClick()}>Get Socket List!</button>
        </div>
        {activeServerID==null ? 
        serverConnections.map((Connection) => {
            return(
                <div>
                    <button onClick={() => {setAcitveServerID(Connection.ID)}}>{Connection.Data.ServerName}</button>
                </div>
            )
        })
        : <ActiveServer ID={activeServerID} />}
       </div>
    )
}
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(<Main/>);