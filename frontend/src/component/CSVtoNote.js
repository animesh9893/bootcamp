import axios from "axios";
import { useState } from "react"
import { BASE_URL } from "../constant";
import { useNavigate } from "react-router-dom";

function CSVtoNote(props){
    const [url,setURL] = useState("");
    const navigate = useNavigate();

    function create(e){
        e.preventDefault();
        const obj = JSON.parse(localStorage.getItem("data"))

        axios.post(`${BASE_URL}/csvToNote`,{
            url
        },{
            headers:{
                "Authorization":`Bearer ${obj.id} ${obj.token}`
            }
        }).then((result)=>{
            navigate("/noteShared")
        })
    }

    return (
        <div>
            <input type="text" onChange={(e)=>setURL(e.target.value)} value={url}/>
            <button onClick={create}>Create Note</button>
        </div>
    )
}


export default CSVtoNote;