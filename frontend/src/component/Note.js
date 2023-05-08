import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../constant";
import { useNavigate } from "react-router-dom";


function Note(props){   
    const [id,setId] = useState("");
    const navigate = useNavigate();
    const [data,setData] = useState({});
    const [isAllowed,setIsAllowed] = useState(false);
    const [tempPassword,setTempPassword] = useState("");
    const [editAllowed,setEditAllowed] = useState(false);


    useEffect(()=>{
        const urlPart = window.location.href.split("/");

        setId(urlPart[urlPart.length-1]);

        if(urlPart[urlPart.length-1]==="create"){
            setId(urlPart[urlPart.length-2]);
        }
    },[])

    useEffect(()=>{
        const obj = {
            noteId:id,
            userId:JSON.parse(localStorage.getItem("data")).id,
        }
        console.log(obj);
        axios.post(`${BASE_URL}/note`,obj,{
            headers:{
                "Authorization":`Berear ${JSON.parse(localStorage.getItem("data")).id} ${JSON.parse(localStorage.getItem("data")).token}` 
            }
        }).then((result)=>{
            setData(result.data.data);
            if(result.data.data.note_is_protected){
                setIsAllowed(false);
            }else{
                setIsAllowed(true);
            }
        })
    },[id])

    function editNote(e){
        e.preventDefault();

        axios.get(`${BASE_URL}/note/updateAllowed/${id}`,{
            headers:{
                "Authorization":`Berear ${JSON.parse(localStorage.getItem("data")).id} ${JSON.parse(localStorage.getItem("data")).token}` 
            }
        }).then(()=>{
            setEditAllowed(true);
        }).catch(()=>{
            setEditAllowed(false);
        })
    }


    return (
        <div>
            <div>Note of {id}</div>
            <br/>
            {
                !isAllowed && <div>
                    password : <input type="password" onChange={(e)=>setTempPassword(e.target.value)}/>
                    <button onClick={
                        (e)=>{
                            e.preventDefault();
                            if(tempPassword===data?.note_password){
                                setIsAllowed(true);
                            }else if(isAllowed===true){
                                setIsAllowed(false);
                            }
                        }
                    }>Validated</button>
                </div>
            }

            {
                isAllowed && <ShowNote {...data} />
            }


            <br/>
            <button onClick={editNote}>Edit</button>

            {
                editAllowed && <EditNote data = {data} id={id}/>
            }
        </div>
    )
}

function ShowNote(props){
    return (
        <div>
            {
                Object.keys(props).map((key)=>{
                    if(key!="note_password")
                        return <div>{key} : {String(props[key])}</div>
                })
            }
        </div>
    )
}


function EditNote(props){
    const [data,setData] = useState(props?.data || {});

    useEffect(()=>{
        setData(props.data);
    },[])

    return (
        <div>
            {JSON.stringify(props)}
            <div>Id : {data.note_id}</div>
            <div>
                Note Name<input type="text" value={data.note_name} onChange={(e)=>{
                    setData({...data,note_name:e.target.value})
                }} />
            </div>


            <div>
                Type : <input type="text" value={data.note_type} onChange={(e)=>{
                    setData({...data,note_type:e.target.value})
                }} />
            </div>

            <div>
                protected : {JSON.stringify(data.note_is_protected)} <button
                    onClick={(e)=>{
                        e.preventDefault();
                        setData({...data,note_is_protected:!data.note_is_protected});
                    }}
                >Change</button>
            </div>

            <div>
                Password : <input type="text" value={data.note_password} onChange={(e)=>{
                    e.preventDefault();
                    setData({...data,note_password:e.target.value});
                }} />
            </div>

            <div>
                vote : {data.vote}
            </div>

            <div>
                IS Public : {JSON.stringify(data.is_available_for_public)} <button
                    onClick={(e)=>{
                        e.preventDefault();
                        setData({...data,is_available_for_public:!data.is_available_for_public});
                    }}
                >Change</button>
            </div>


            <div>
                <div>
                    Data : 
                    <textarea style={{minHeight:"10rem",minWidth:"40rem"}} value={data.note_data}
                        onChange={(e)=>{
                            e.preventDefault();
                            setData({...data,note_data:data.note_data})
                        }}
                    >

                    </textarea>
                </div>
            </div>
            <hr/>
            <div>
                Preview <ShowNote {...data} />
            </div>
                        
        </div>
    )
}


export default Note;


