import React, {useState, useEffect} from "react";
import ActiveServerClients from "./ActiveServerClients";
import ActiveServerCompanies from "./ActiveServerCompanies";
import { CompanyObject, ClientObject } from "./Interfaces";
const APIBase:string = "http://localhost:3000"



export default function ActiveServer(props) {
    const [activeCompanies, setActiveCompanies] = useState<Array<CompanyObject>>([])
    const [activeClients, setActiveClients] = useState<Array<ClientObject>>([])
    useEffect(() => {
        onPOSTClientsClick(props.ID)
        onPOSTCompaniesClick(props.ID)
    },[])
    interface ClientsResponse{
        ClientList: Array<ClientObject>
    }
    function onPOSTClientsClick(ID){
        console.log(`Requesting Clients of Server with id ${ID}`)
        fetch(APIBase+"/Server/Clients",{
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
        .then((res:ClientsResponse) => {
            setActiveClients(res.ClientList)
        })
        .catch((err) => {
            console.log("There was an Error",err)
        })
    }
    interface CompaniesResponse{
        CompaniesList: Array<CompanyObject>
    }
    function onPOSTCompaniesClick(ID:number){
        console.log(`Requesting Companies of Server with id ${ID}`)
        fetch(APIBase+"/Server/Companies",{
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
        .then((res:CompaniesResponse) => {
            setActiveCompanies(res.CompaniesList)
        })
        .catch((err) => {
            console.log("There was an Error",err)
        })
    }    
  
    return(
        <div>
            <ActiveServerClients ClientsArray={activeClients}/>
            <ActiveServerCompanies CompaniesArray={activeCompanies} />
        </div>
    )
}
