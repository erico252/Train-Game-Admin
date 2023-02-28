import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom/client";
import Info from "./Info"
import ActiveServerUpdates from "./ActiveServerUpdates";
import ActiveServerClients from "./ActiveServerClients";
import ActiveServerCompanies from "./ActiveServerCompanies";
import { SocketsConnections,IGETSocketRes } from "./WebInterfaces"





function Main(props) {
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
        const APIBase:string = "http://localhost:3000"

        const [serverList, setServerList] = useState<Array<SocketsConnections>>([])
        const [activeServer, setActiveServer] = useState<number|null>(null)
        useEffect(()=>{
            updateConnectionList()
        },[])
        function connectToServer(IP:string,PORT:number,PASS:string){
            console.log("Connecting to a Server!")
            fetch(APIBase+"/socket/connect",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    IP:IP,
                    PORT:PORT,
                    PASS:PASS
                })
            })
            .then((res)=>{return(res.json())})
            .then((res)=>{
                console.log(res)
            })
            .finally(()=>{
                updateConnectionList()
            })
        }
        function disconnectFromServer(ID){
            fetch(APIBase+`/socket/${ID}/disconnect`,{method:"GET"})
            .then((res)=>{console.log(res)})
            .finally(()=>{updateConnectionList()})
        }
        function updateConnectionList(){
            console.log("updating List!")
            fetch(APIBase+"/socket/list",{method:"GET"})
            .then((res)=>{return(res.json())})
            .then((res)=>{
                console.log(res.list)
                setServerList(res.list)
            })
        }

    return(
        <div>
            <div>
                OpenTTD AdminPort Web Interface!
            </div>
                {activeServer == null ?
                    <div>
                        <div>
                            <button onClick={() => updateConnectionList()}>Update!</button>
                            <button onClick={() => connectToServer("127.0.0.1",3977,"Eric")}>Connect To a Server!</button>
                        </div>
                        <div> 
                            <table>
                                <caption>Active Server Connections</caption>
                                <thead>
                                    <tr>
                                        <td scope="col">Server Name</td>
                                        <td scope="col">Server Select</td>
                                        <td scope="col">Disconnect</td>
                                        <td scope="col">Server ID</td>
                                    </tr>
                                </thead>
                                <tbody>
                                {serverList.map((server,index)=>{
                                    return(
                                        <tr key={index}>
                                            <td scope="row">{server.Data.ServerName}</td>
                                            <td><button onClick={() => setActiveServer(server.ID)}>Server Info</button></td>
                                            <td><button onClick={() => disconnectFromServer(server.ID)}>Disconnect</button></td>
                                            <td>{server.ID}</td> 
                                        </tr>
                                    )
                                })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3}>Total Active Connections</td>
                                        <td>{serverList.length}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        
                        </div>
                    </div>:
                    <div>
                        <button onClick={() => setActiveServer(null)}>Return!</button>
                        <Info />
                        <ActiveServerUpdates ID={activeServer}/>
                        <ActiveServerClients ID={activeServer}/>
                        <ActiveServerCompanies ID={activeServer}/>
                        
                    </div>
                }
        </div>
    )
}
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(<Main/>);