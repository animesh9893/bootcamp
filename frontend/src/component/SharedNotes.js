import { useNavigate } from "react-router-dom";
import Protected from "./Protected"
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constant";

function Note(props){
    const navigate = useNavigate();

    function upvote(e){
        e.preventDefault();

        if(props.note_id){
            const obj = JSON.parse(localStorage.getItem("data"))

            axios.post(`${BASE_URL}/note/upvote`,{
                noteId:props.note_id
            },{
                headers:{
                    "Authorization":`Bearer ${obj.id} ${obj.token}`
                }
            }).then(()=>{
                window.location.reload();
            })
        }
        
    }

    return (
        <>
            <div onClick={()=>navigate(`/note/${props?.note_id || "notAvailable"}`)} style={{border:"1px solid black"}}>
                <div>{props?.note_id}</div>
                <div>{props?.note_name}</div>
                <div>{props?.note_data}</div>
            </div>
            Vote : {props?.vote}
            <button onClick={upvote}>Vote</button>
        </>
    )
}


function Home(props){
    const navigate = useNavigate();

    const [notes,setNotes] = useState([]);
    const [noteIds,setNoteIds] = useState([]);

    useEffect(()=>{
        const obj = JSON.parse(localStorage.getItem("data"))

        axios.post(`${BASE_URL}/note/sharedNote`,{
            userId:obj.id,
        },{
            headers:{
                "Authorization":`Bearer ${obj.id} ${obj.token}`
            }
        }).then((result)=>{
            console.log("SHARED ",result)
            setNoteIds(result.data.data);
        })
    },[])

    return (
        <div>
            <div>Public Note</div>
            {
                noteIds.map((item)=>(
                    <Note key={item.note_id || "1"} {...item} />
                ))
            }
        </div>
    )
}

export default Home;