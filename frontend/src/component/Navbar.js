import { useNavigate } from "react-router-dom"


function Navbar(props){
    const navigate = useNavigate();

    function logout(e){
        e.preventDefault();
        localStorage.setItem("data",null);
        navigate("/signup");
    }

    return (
        <div>
            <button onClick={(e)=>logout(e)}>Logout</button>
            <button onClick={(e)=>navigate(`/profile/${JSON.parse(localStorage.getItem("data")).id}`)}>Profile</button>
            <button onClick={(e)=>navigate("/note/create")}>Create Note</button>
            <button onClick={(e)=>navigate("/")}>Home</button>
            <button onClick={(e)=>navigate("/createdNotes")}>Created Notes</button>
            <button onClick={(e)=>navigate("/noteShared")}>Shared Notes</button>
            <button onClick={(e)=>navigate("/csvToNote")}>CSV TO Notes</button>
        </div>
    )
}

export function NormalNav(props){
    const navigate = useNavigate();

    return (
        <>
        <div>
            <button onClick={(e)=>navigate("/login")}>Login</button>
            <button onClick={(e)=>navigate("/signup")}>Sign Up</button>
            <button onClick={(e)=>navigate("/reset")}>Reset</button>
        </div>
        {props.children}
        </>
        
    )
}


export default Navbar;