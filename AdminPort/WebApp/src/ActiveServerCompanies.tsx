import React, {useState, useEffect} from "react";
import { CompanyObject } from "./WebInterfaces";
const APIBase:string = "http://localhost:3000"
interface props{
    ID:number
}
export default function ActiveServerCompanies(props:props) {
    const [serverCompanies, setServerCompanies] = useState<Array<CompanyObject>>([])
    const [activeCompany, setActiveCompany] = useState<number|null>(null)
    const [companyInfo, setCompanyInfo] = useState<CompanyObject>()
    useEffect(()=>{
        getServerCompaniesList(props.ID)
    },[])
    useEffect(() => {
        setActiveCompanyInfo(activeCompany)
    },[activeCompany])
    function getServerCompaniesList(ID:number){
        fetch(APIBase+`/server/${ID}/companies`,{method:"GET"})
        .then((res) => {return(res.json())})
        .then((res)=>{
            console.log(res.list)
            setServerCompanies(res.list)
        })
    }
    function setActiveCompanyInfo(CompanyID){
        let comp = serverCompanies.find((company) => {
            return company.ID == activeCompany
        })
        if(comp==undefined){console.log("ID not exist")}
        else{
            setCompanyInfo(comp)
        }
    }
    return(
        <div>
            <button onClick={() => {getServerCompaniesList(props.ID)}}>Companies</button>
            {serverCompanies.length==0 
            ?<div>No Companies</div>
            :<div>
                <table>
                    <caption>Company List</caption>
                    <thead>
                        <tr>
                            <td scope="col">Company Name</td>
                            <td scope="col">Client ID</td>
                            <td scope="col">Company Cash</td>
                        </tr>
                    </thead>
                    <tbody>
                        {serverCompanies.map((company,index) => {
                            return(
                                <tr>
                                    <td scope="row"><button onClick={() => setActiveCompany(company.ID)}>{company.CompanyName}</button></td>
                                    <td>{company.ID}</td>
                                    <td>${company.Economy.Money}</td>
                                </tr>
                                    
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td scope="row" colSpan={2}>Total Companies</td>
                            <td>{serverCompanies.length}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            }
            <button onClick={() => {setActiveCompany(null)}}>Clear Compnay Info</button>
            {activeCompany == null
            ?<div>No Company Selected</div>
            :<div>
                <table>
                    <caption>{companyInfo?.CompanyName} Info</caption>
                    <thead>
                        <tr>
                            <td scope="col" colSpan={2}>Stat</td>
                            <td scope="col">Value</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td rowSpan={5}>Econ</td>
                            <td>Money</td>
                            <td>{companyInfo?.Economy.Money}</td>
                        </tr>
                        <tr>
                            <td>Loan</td>
                            <td>{companyInfo?.Economy.Loan}</td>
                        </tr>
                        <tr>
                            <td>Income</td>
                            <td>{companyInfo?.Economy.Income}</td>
                        </tr>
                        <tr>
                            <td>Last Value</td>
                            <td>{companyInfo?.Economy.LastCompanyValue}</td>
                        </tr>
                        <tr>
                            <td>This Delivered Cargo</td>
                            <td>{companyInfo?.Economy.ThisDeliveredCargo}</td>
                        </tr>
                        <tr>
                            <td rowSpan={5}>Stat</td>
                            <td>Stations</td>
                            <td>{companyInfo?.Stats.TrainStations}</td>
                        </tr>
                        <tr>
                            <td>Trains</td>
                            <td>{companyInfo?.Stats.Trains}</td>
                        </tr>
                        <tr>
                            <td>Truck Stops</td>
                            <td>{companyInfo?.Stats.LorryStations}</td>
                        </tr>
                        <tr>
                            <td>Trucks</td>
                            <td>{companyInfo?.Stats.Lorries}</td>
                        </tr>
                        <tr>
                            <td>Ships</td>
                            <td>{companyInfo?.Stats.Ships}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            }
        </div>
    )
}