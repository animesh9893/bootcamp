import { useState } from "react"
import axios from 'axios';
import { BASE_URL } from "../constant";
import { useNavigate } from "react-router-dom";


export function ResetRequest(props){
    const [email,setEmail] = useState("")
    const [message,setMessage] = useState("");
    function requestReset(e){
        e.preventDefault();
        axios.post(`${BASE_URL}/resetpassword`,{email:email},{
            headers:{
                "Content-Type":"application/json"
            }
        }).then(()=>{
            setMessage("check mail");
        }).catch(()=>{
            setMessage("something went wrong");
        })
    }

    return (
        <div>
            {message}
            <br/>
            email : <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button onClick={requestReset}>Submit</button>
        </div>
    )
}

export function ResetPassword(props){
    const [password,setPassword] = useState("");
    const navigate = useNavigate();

    function save(e){
        e.preventDefault();
        axios.post(`${BASE_URL}/resetpassword/done`,{
            password,token:window.location.href.split("/").reduce((acc,curr)=>{return curr},""),
        }).then(()=>{
            navigate("/");
        })
    }


    return (
        <div>
            New Password : <input type="password" onChange={(e)=>setPassword(e.target.value)} value={password}/>
            <button onClick={save}>Change</button>
        </div>
    )
}


export default function SignUp(props) {
    const navigate = useNavigate();
    const [data,setData] = useState({
        "name":"",
        "password":"",
        "email":"",
        "profileImage":"n/a"
    });

    const [activeLogin,setActiveLogin] = useState(false);
    const [message,setMessage] = useState("Fill the details");

    function signUp(e){
        e.preventDefault();
        for(let [key,value] of Object.entries(data)){
            if(value.length===0){
                setMessage(`please fill something in ${key}`);
                setActiveLogin(false);
                return ;
            }
        }

        axios.post(`${BASE_URL}/user/create`,data,{
            headers:{
                "Content-Type":"application/json"
            }
        }).then((result)=>{
            const obj = {
                name : data.name,
                email : data.email,
                id : result.data.response.id,
                token : result.data.response.token
            };

            localStorage.setItem("data",JSON.stringify(obj));

            navigate("/");
        }).catch((error)=>{
            setMessage("Error in login please try after some time");
        })
    }

    return (
        <div style={{minHeight:"100%"}}>
            <div>{message}</div>

            Name : <input type="text" onChange={(e)=>{setActiveLogin(true);setData({...data,name:e.target.value})}} value={data.name} name="name" /><br/>
            password : <input type="password" onChange={(e)=>{setActiveLogin(true);setData({...data,password:e.target.value})}} value={data.password} name="password" /><br/>
            confirmPassword : <input type="password" onChange={(e)=>{
                if(e.target.value === data.password){
                    setActiveLogin(true);
                }else{
                    setActiveLogin(false);
                    setMessage("password is not matching")
                }
            }} name="confirmPassword" /><br/>
            email : <input type="email" onChange={(e)=>{setActiveLogin(true);setData({...data,email:e.target.value})}} value={data.email} name="email" /><br/>
            <br/>
            <div>
                <button onClick={signUp}>Login</button>
            </div>
        </div>
    )
}

export function Login(props){
    const navigate = useNavigate();
    const [data,setData] = useState({
        "password":"",
        "email":"",
    });

    const [activeLogin,setActiveLogin] = useState(false);
    const [message,setMessage] = useState("Fill the details");

    function login(e){
        e.preventDefault();
        for(let [key,value] of Object.entries(data)){
            if(value.length===0){
                setMessage(`please fill something in ${key}`);
                setActiveLogin(false);
                return ;
            }
        }

        axios.post(`${BASE_URL}/user/login`,data,{
            headers:{
                "Content-Type":"application/json"
            }
        }).then((result)=>{
            const obj = {
                name : result.data.data.name,
                email : data.email,
                id : result.data.data.id,
                token : result.data.data.token
            };

            localStorage.setItem("data",JSON.stringify(obj));

            navigate("/");
        }).catch((error)=>{
            setMessage("Error in login please try after some time");
        })
    }

    return (
        <div style={{minHeight:"100%"}}>
            <div>{message}</div>

            password : <input type="password" onChange={(e)=>{setActiveLogin(true);setData({...data,password:e.target.value})}} value={data.password} name="password" /><br/>
            email : <input type="email" onChange={(e)=>{setActiveLogin(true);setData({...data,email:e.target.value})}} value={data.email} name="email" /><br/>
            <br/>
            <div>
                <button onClick={login}>Login</button>
            </div>
        </div>
    )
}