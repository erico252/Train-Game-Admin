import React, {useState, useEffect} from "react";
import { ClientObject } from "./WebInterfaces";
const APIBase:string = "http://localhost:3000"
interface props{
    ID:number
}
export default function ActiveServerClients(props:props) {
    const [serverClients, setServerClients] = useState<Array<ClientObject>>([])
    useEffect(()=>{
        getServerClientsList(props.ID)
    },[])
    function getServerClientsList(ID:number){
        fetch(APIBase+`/server/${ID}/clients`,{method:"GET"})
        .then((res) => {return(res.json())})
        .then((res)=>{
            setServerClients(res.list)
        })
    }
    return(
        <div>
            <button onClick={() => {getServerClientsList(props.ID)}}>clients</button>
            {serverClients.length==0 
            ?<div>No Clients</div>
            :<div>
                <table>
                    <caption>Client List</caption>
                    <thead>
                        <tr>
                            <td scope="col">Client Name</td>
                            <td scope="col">Client ID</td>
                        </tr>
                    </thead>
                    <tbody>
                        {serverClients.map((client,index) => {
                            return(
                                <tr>
                                    <td scope="row">{client.ClientName}</td>
                                    <td>{client.ID}</td>
                                </tr>
                                     
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td scope="row">Total Clients</td>
                            <td>{serverClients.length}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            }
        </div>
    )
}