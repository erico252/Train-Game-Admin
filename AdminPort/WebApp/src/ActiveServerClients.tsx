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
            :serverClients.map((client,index) => {
                return(
                    <div key={index}>
                        {client.ClientName}
                        {client.ID}
                    </div>
                )
            })
            }
        </div>
    )
}