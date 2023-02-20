import React, {useState, useEffect} from "react";
import { ClientObject } from "./Interfaces";
interface props{
    ClientsArray: Array<ClientObject>
}
export default function ActiveServerClients(props:props) {
    useEffect(()=>{
        console.log(props.ClientsArray,"On First Render of Clients")
    },[])
    return(
        <div>
            Clients
            {props.ClientsArray.length==0 
            ?<div>No Clients</div>
            :props.ClientsArray.map((client) => {
                return(
                    <div>
                        {client.ClientName}
                    </div>
                )
            })
            }
        </div>
    )
}