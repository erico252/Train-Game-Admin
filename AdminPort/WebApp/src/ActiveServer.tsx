import React, {useState, useEffect} from "react";
import ActiveServerClients from "./ActiveServerClients";
import ActiveServerCompanies from "./ActiveServerCompanies";
import { CompanyObject, ClientObject } from "./WebInterfaces";
const APIBase:string = "http://localhost:3000"


interface Properties{
    ID: number
}
export default function ActiveServer(props:Properties) {
    const [serverCompanies, setServerCompanies] = useState<Array<CompanyObject>>([])
    const [serverClients, setServerClients] = useState<Array<ClientObject>>([])

    useEffect(()=>{
        queryClients(props.ID)
        queryCompanies(props.ID)
        getServerClientsList(props.ID)
        getServerCompaniesList(props.ID)
    },[])
    function getServerCompaniesList(ID:number){
        fetch(APIBase+`/server/${ID}/companies`,{method:"GET"})
        .then((res) => {return(res.json())})
        .then((res)=>{
            setServerCompanies(res.list)
        })
    }
    function getServerClientsList(ID:number){
        fetch(APIBase+`/server/${ID}/clients`,{method:"GET"})
        .then((res) => {return(res.json())})
        .then((res)=>{
            setServerClients(res.list)
        })
    }
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
            <ActiveServerClients ClientsArray={serverClients}/>
            <ActiveServerCompanies CompaniesArray={serverCompanies} />
        </div>
    )
}
