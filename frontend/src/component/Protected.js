import axios from "axios";
import { React, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../constant";
import Navbar from "./Navbar";


export default function Protected(props) {
    const navigate = useNavigate();
    const [valid,setValid] = useState(null);

    function redirectToLogin(){
        navigate("/signup");
    }


    useEffect(()=>{
        const obj = JSON.parse(localStorage.getItem("data"))
        
        if(obj===null) {
            redirectToLogin()
        }else{
            const id = obj["id"];
            const token = obj["token"];
            
            axios.get(`${BASE_URL}/user/token`,{
                headers:{
                    "Authorization":`Berear ${id} ${token}`
                }
            }).then(()=>{
                setValid(true);
            }).catch(()=>{
                setValid(false);
            })
        }
    },[])

    if(valid===null){
        return <div>Loading</div>
    }else if(valid === true){
        return <>
            <Navbar></Navbar>
            {props.children}
        </>
    }else{
        redirectToLogin();
    }
}