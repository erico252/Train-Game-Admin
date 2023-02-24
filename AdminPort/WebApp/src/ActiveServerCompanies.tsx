import React, {useState, useEffect} from "react";
import { CompanyObject } from "./WebInterfaces";
const APIBase:string = "http://localhost:3000"
interface props{
    ID:number
}
export default function ActiveServerCompanies(props:props) {
    const [serverCompanies, setServerCompanies] = useState<Array<CompanyObject>>([])
    useEffect(()=>{
        getServerCompaniesList(props.ID)
    },[])
    function getServerCompaniesList(ID:number){
        fetch(APIBase+`/server/${ID}/companies`,{method:"GET"})
        .then((res) => {return(res.json())})
        .then((res)=>{
            console.log(res.list)
            setServerCompanies(res.list)
        })
    }
    return(
        <div>
            <button onClick={() => {getServerCompaniesList(props.ID)}}>Companies</button>
            {serverCompanies.length==0 
            ?<div>No Companies</div>
            :serverCompanies.map((company,index) => {
                return(
                    <div key={index}>
                        {company.CompanyName}
                    </div>
                )
            })
            }
        </div>
    )
}