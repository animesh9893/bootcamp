import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../constant";
import { useNavigate } from "react-router-dom";
import {ShowNote} from './Note';
import {v4 as uuidv4} from 'uuid';

function UploadProfilePic(props) {
    const [data, setData] = useState({
        file: {},
    });

    function handleFile(e) {
        console.log(e.target?.files);
        setData({ ...data, file: e.target?.files[0] });
    }

    function save(e) {
        const formData = new FormData();
        formData.append('file', data?.file);
        formData.append('noteId', props.note_id);
        
        let config = {
            method: 'post',
            url: `${BASE_URL}/note/extrafile`,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Berear ${JSON.parse(localStorage.getItem("data")).id} ${JSON.parse(localStorage.getItem("data")).token}` 
            },
            data: formData,
        };

        axios(config)
            .then((response) => {
                console.log("done");
                props?.setData(response.data.data.url);
            })
            .catch((e) => {
                console.log('Error hai bhai', e);
            });
    }

    return (
        <div>
            <input
                type='file'
                accept='image/*'
                onChange={(e) => handleFile(e)}
            />
            <button variant="dark" onClick={(e) => save(e)}>Upload image</button>
        </div>
    );
}


function CreateNote(props){
    const [id,setId] = useState("");
    const navigate = useNavigate();
    const [data,setData] = useState(
        {
            "note_name": "",
            "note_type": "",
            "note_is_protected": false,
            "note_password": "",
            "note_link": "",
            "note_data": "",
            "vote": 0,
            "is_available_for_public": true,
            "note_id":id,
        }
    );
    const [addFile,setAddFile] = useState("");

    useEffect(()=>{
        setId(uuidv4());
        setData({...data,note_id:id});
    },[])


    function save(e){
        e.preventDefault();

        if(data.note_is_protected===true && data.note_password===""){
            console.log("please enter password");
            return ;
        }

        axios.post(`${BASE_URL}/note/create`,{
            noteId:data.note_id, name:data.note_name, 
            type:data.note_type, isProtected:data.note_is_protected, 
            password:data.note_password, link:"", data:data.note_data, 
            isPublic:data.is_available_for_public,
        },{
            headers:{
                'Authorization': `Berear ${JSON.parse(localStorage.getItem("data")).id} ${JSON.parse(localStorage.getItem("data")).token}` 
            }
        }).then(()=>{
            navigate(`/note/${data.note_id}`);
        }).catch((err)=>{
            console.log("error in updating",err);
        })
    }

    return (
        <div>
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
                            setData({...data,note_data:e.target.value})
                        }}
                    >

                    </textarea>
                </div>
            </div>

            <button onClick={save}>Save</button>

            <hr/>
            <div>
                Preview <ShowNote {...data} />
            </div>
                        
        </div>
    )
}



export default CreateNote;