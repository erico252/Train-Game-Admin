import React, {useState, useEffect} from "react";
import ActiveServerClients from "./ActiveServerClients";
import ActiveServerCompanies from "./ActiveServerCompanies";
import { CompanyObject, ClientObject } from "./WebInterfaces";
const APIBase:string = "http://localhost:3000"
interface Properties{
    ID: number
}
export default function ActiveServer(props:Properties) {
    useEffect(()=>{
        queryClients(props.ID)
        queryCompanies(props.ID)
    },[])
    
    function sendServerQuery(ID:number,Type, Freq){
        fetch(APIBase+`/server/${ID}/query`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                UpdateType:Type,
                UpdateFrequency:Freq
            })
        })
        .finally(()=>{console.log("Completed Query")})
    }
    function queryClients(ID){
        fetch(APIBase+`/server/${ID}/query`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                UpdateType:1,
                UpdateFrequency:1
            })
        })
    }
    function queryCompanies(ID){
        fetch(APIBase+`/server/${ID}/query`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                UpdateType:2,
                UpdateFrequency:1
            })
        })
    }
    return(
        <div>
            <button onClick={()=>queryCompanies(props.ID)}>Hello</button>
            <ActiveServerClients ID={props.ID} />
            <ActiveServerCompanies ID={props.ID}/>
        </div>
    )
}
