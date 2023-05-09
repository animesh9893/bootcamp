import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../constant";

export default function Profile(props) {
  const [id, setId] = useState("");
  const [data, setData] = useState({});


  const [tdata, setTData] = useState({
    name:"",
    password : "",
  });
  const [isProfile, setIsProfile] = useState(false);

  useEffect(() => {
    if (isProfile == true) {
      window.location.reload();
    }
  }, [isProfile]);


  useEffect(() => {
    // const urlPart = window.location.href.split("/");
    // setId(urlPart[urlPart.length - 1]);
    // console.log("id", id, urlPart);
    let id = window.location.href.split("/").reduce((acc,curr)=>{
      return curr
    },"")
    if (id != "") {
      axios
        .get(`${BASE_URL}/user/profile/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Berear ${
              JSON.parse(localStorage.getItem("data")).id
            } ${JSON.parse(localStorage.getItem("data")).token}`,
          },
        })
        .then((result) => {
          setData({ ...result.data.data });
          console.log("ADTA", data, result);
        });
    }

    setId(id);
  }, []);


  function save(e){
    e.preventDefault();
    const obj = {
      name:tdata.name,
      email:data.email,
      password:tdata.password,
    }

    axios.post(`${BASE_URL}/user/profile`,obj,{
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Berear ${
          JSON.parse(localStorage.getItem("data")).id
        } ${JSON.parse(localStorage.getItem("data")).token}`,
      },
    }).finally(()=>{
      window.location.reload(); 
    })
  }




  return (
    <div>
      Profile {id}
      {JSON.stringify(data)}
      <br />
      <div>
        <div>Name : {data?.name}</div>
        <div>email : {data?.email}</div>
        <div>
          image :{" "}
          <img src={`${BASE_URL}/user/profile/image/${id}`} alt={"image"} />
        </div>
      </div>
      <hr />
      <div>Edit</div>
      



    <div>
      <div>
        <div>
          Name :{" "}
          <input
            type="text"
            value={tdata.name}
            onChange={(e) => {
              setTData({ ...tdata, name: e.target.value });
            }}
          />
        </div>
          <div>
            Password : <input type="password" value={tdata.password} onChange={(e)=>setTData({...tdata,password:e.target.value})} />
          </div>
        <div>
          PRofile image : <UploadProfilePic setData={setIsProfile} />
        </div>
      </div>

      <br />
      <div>Preview</div>
      <div>
        <div>Name : {tdata?.name}</div>
        <div>email : {data?.email}</div>
      </div>
      <div>
        <button onClick={save}>Save</button>
      </div>
    </div>



    </div>
  );
}

export function ShowProfile(props) {
  const [data, setData] = useState(props.data);

  return (
    <div>
      <div>Name : {data?.name}</div>
      <div>email : {data?.email}</div>
      <div>
        image : <img src={data?.profileimage} alt={"image"} />
      </div>
    </div>
  );
}

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
    formData.append("file", data?.file);

    let config = {
      method: "post",
      url: `${BASE_URL}/user/profile/image`,
      headers: {
        "Content-Type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Berear ${JSON.parse(localStorage.getItem("data")).id} ${
          JSON.parse(localStorage.getItem("data")).token
        }`,
      },
      data: formData,
    };

    axios(config)
      .then((response) => {
        setData(true);
      })
      .catch((e) => {});
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={(e) => handleFile(e)} />
      <button variant="dark" onClick={(e) => save(e)}>
        Upload image
      </button>
    </div>
  );
}
