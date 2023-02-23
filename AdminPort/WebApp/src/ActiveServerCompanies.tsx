import React, {useState, useEffect} from "react";
import { CompanyObject } from "./WebInterfaces";
interface props{
    CompaniesArray: Array<CompanyObject>
}
export default function ActiveServerCompanies(props:props) {
    return(
        <div>
            Companies
            {props.CompaniesArray.length==0 
            ?<div>No Companies</div>
            :props.CompaniesArray.map((company) => {
                return(
                    <div>
                        {company.CompanyName}
                    </div>
                )
            })
            }
        </div>
    )
}