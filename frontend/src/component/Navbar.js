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
            <button onClick={(e)=>navigate("/profile")}>Profile</button>
            <button onClick={(e)=>navigate("/note/create")}>Create Note</button>
        </div>
    )
}

export default Navbar;