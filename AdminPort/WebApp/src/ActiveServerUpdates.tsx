import { type } from "os";
import React, {useState, useEffect} from "react";
import ActiveServerClients from "./ActiveServerClients";
import ActiveServerCompanies from "./ActiveServerCompanies";
import { CompanyObject, ClientObject } from "./WebInterfaces";
const APIBase:string = "http://localhost:3000"
interface Properties{
    ID: number
}
export default function ActiveServerUpdates(props:Properties) {
    const [updateType, setUpdateType] = useState<number>(0)
    const [updateFreq, setUpdateFreq] = useState<number>(0)
    const [updateID, setUpdateID] = useState<number>(4294967295)
    const SHOW_ALL:number = 4294967295
    useEffect(()=>{
        serverPoll(props.ID,1,1,SHOW_ALL)//Poll all Clients
        serverPoll(props.ID,2,1,SHOW_ALL)//Poll all Companies
    },[])
    function serverQuery(ID,Type,Frequency){
        fetch(APIBase+`/server/${ID}/query`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                UpdateType:Type,
                UpdateFrequency:Frequency
            })
        })
        .then((res)=>{console.log(res.body)})
    }
    function serverPoll(ID,Type,Frequency,UpID){
        fetch(APIBase+`/server/${ID}/poll`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                UpdateType:Type,
                UpdateFrequency:Frequency,
                UpdateID:UpID
            })
        })
        .then((res)=>{console.log(res.body)})
    }
    function serverUpdate(Type, Freq, updID, servID){
        console.log(Type)
        if(Freq == 1){
            serverPoll(servID,Type,Freq,updID)
        }else{
            serverQuery(servID,Type,Freq)
        }
    }
    return(
        <div>
            <input title="Type" onChange={(event)=>{setUpdateType(Number(event.target.value))}}></input>
            <input title="Freq" onChange={(event)=>{setUpdateFreq(Number(event.target.value))}}></input>
            <input title="Update ID" onChange={(event)=>{setUpdateID(Number(event.target.value))}}></input>
            <button onClick={()=>serverUpdate(updateType,updateFreq,updateID,props.ID)}>Update!</button>
        </div>
    )
}
