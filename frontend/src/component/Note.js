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

function replaceUrls(string) {
    const regex = /\[\[\[(.*?)\]\]\]/g;
    return string.replace(regex, '<img src="$1" alt="image" />');
  }
  
  function RenderHTMLString({ htmlString }) {
    console.log("HTML string",htmlString)
    return (
      <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    );
  }


export function ShowNote(props){
    console.log("props",props);
    const navigate = useNavigate();

    function toCSV(e){
        e.preventDefault();
        axios.post(`${BASE_URL}/toCSV`,{
            noteId:props.note_id,
        },{
            headers:{
                "Authorization":`Berear ${JSON.parse(localStorage.getItem("data")).id} ${JSON.parse(localStorage.getItem("data")).token}` 
            }
        }).then(()=>{
            console.log("done")
        })
    }

    return (
        <div>
            {
                Object.keys(props).map((key)=>{
                    if(key==="note_created_by"){
                        return <div>id : {props[key]} <button onClick={()=>navigate(`/profile/${props[key]}`)}>Profile</button></div>
                    }
                    if(key!="note_password")
                        {
                            return <div>{key} : <RenderHTMLString htmlString={replaceUrls(String(props[key]))} /></div>
                        }
                })
            }

            <div>
                To CSV : <button onClick={toCSV}>TO CSV</button>
            </div>
        </div>
    )
}


export function UploadProfilePic(props) {
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



export function UploadCSV(props) {
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
        
        let config = {
            method: 'post',
            url: `${BASE_URL}/csvTojson`,
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
                props?.setData(JSON.stringify(response.data));
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
            <button variant="dark" onClick={(e) => save(e)}>Upload CSV</button>
        </div>
    );
}

export function EditNote(props){
    const [data,setData] = useState(props?.data || {});
    const [addFile,setAddFile] = useState("");

    const [share,setShare] = useState("");
    const [right,setRight] = useState("");

    const [csvData,setCSVdata] = useState("");
    const navigate = useNavigate();

    useEffect(()=>{
        setData(props.data);
    },[])

    useEffect(()=>{
        if(addFile!=""){
            setData({...data,note_data:`${data.note_data} [[[${addFile}]]]`});
            setAddFile("");
        }
    },[addFile])

    function save(e){
        e.preventDefault();

        console.log("saving ",data);

        if(data.note_is_protected===true && data.note_password===""){
            console.log("please enter password");
            return ;
        }

        axios.post(`${BASE_URL}/note/update`,{
            noteId:data.note_id, name:data.note_name, 
            type:data.note_type, isProtected:data.note_is_protected, 
            password:data.note_password, link:"", data:data.note_data, 
            isPublic:data.is_available_for_public,
        },{
            headers:{
                'Authorization': `Berear ${JSON.parse(localStorage.getItem("data")).id} ${JSON.parse(localStorage.getItem("data")).token}` 
            }
        }).then(()=>{
            window.location.reload(false);
        }).catch((err)=>{
            console.log("error in updating",err);
        })
    }

    function shareNote(e){
        e.preventDefault();

        axios.post(`${BASE_URL}/note/share/add`,{
            email:share,noteId:data.note_id,access:right
        },{
            headers:{
                'Authorization': `Berear ${JSON.parse(localStorage.getItem("data")).id} ${JSON.parse(localStorage.getItem("data")).token}` 
            }
        }).then(()=>{
            console.log("sent");
        }).catch(()=>{
            console.log("error");
        })
    }

    useEffect(()=>{
        setData({...data,note_data:data.note_data+` ${csvData}`});
    },[csvData])


    function saveToDraft(e){
        e.preventDefault();
        localStorage.setItem(`${data.note_id}`,JSON.stringify(data));
        navigate("/")
    }

    function loadDraft(e){
        e.preventDefault();
        setData(JSON.parse(localStorage.getItem(`${data.note_id}`)))
    }

    return (
        <div>
            <div>Id : {data.note_id}</div>

            <div>
                email : <input type="email" value={share} onChange={(e)=>setShare(e.target.value)} />
                Right (write/owner/read) <input type="text" value={right} onChange={(e)=>setRight(e.target.value)} />
                <button onClick={shareNote}>Share</button>
            </div>

            <div>
                Add data from csv : <UploadCSV setData={setCSVdata}/>
            </div>


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

            <div style={{border:"1px solid black"}}>
                Upload File : <UploadProfilePic note_id={data.note_id} setData={setAddFile} />
            </div>

            <div>
                <div>
                    Data : 
                    <textarea style={{minHeight:"10rem",minWidth:"40rem"}} 
                        value={data.note_data}
                        onChange={(e)=>{
                            // e.preventDefault();
                            setData({...data,note_data:e.target.value})
                        }}
                    >

                    </textarea>
                </div>
            </div>

            <button onClick={save}>Save</button>
            <button onClick={saveToDraft}>Draft</button>
            <button onClick={loadDraft}>Load Draft</button>

            <hr/>
            <div>
                Preview <ShowNote {...data} />
            </div>
                        
        </div>
    )
}




export default Note;


