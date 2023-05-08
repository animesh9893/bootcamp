import { useNavigate } from "react-router-dom";
import Protected from "./Protected"
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constant";

function Note(props){
    const navigate = useNavigate();

    return (
        <div onClick={()=>navigate(`/note/${props?.note_id || "notAvailable"}`)} style={{border:"1px solid black"}}>
            <div>{props?.note_name}</div>
            <div>{props?.note_data}</div>
        </div>
    )
}


function Home(props){
    const navigate = useNavigate();

    const [notes,setNotes] = useState([]);

    useEffect(()=>{
        const obj = JSON.parse(localStorage.getItem("data"))

        axios.get(`${BASE_URL}/note/public`,{
            headers:{
                "Authorization":`Bearer ${obj.id} ${obj.token}`
            }
        }).then((result)=>{
            // console.log(result)
            setNotes(result.data.data || []);
        })
    },[])


    return (
        <div>
            <div>Public Note</div>
            {
                notes.map((item)=>(
                    <Note key={item.note_id || "1"} {...item} />
                ))
            }
        </div>
    )
}

export default Home;