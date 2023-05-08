const CONSTANT = require("../constants");
const { v4: uuidv4 } = require("uuid");
const { SendMail } = require("./mail");


function GetUserIdFromReq(req) {
  let [_1, id, _2] = ["", "6fce61d8-1543-45e5-99b4-9485f0438558", ""];

  const authHeader = req.headers["authorization"];

  if (authHeader != undefined) {
    [_1, id, _2] = authHeader && authHeader.split(" ");

    if (id === undefined || id === "") {
      id = "";
    }
  }

  return id;
}






function GetUserId(email) {
  return CONSTANT.DB_OBJECT.query("SELECT ID FROM users WHERE email=$1", [
    email,
  ]);
}

function CheckTokenExist(id,token){
    return CONSTANT.DB_OBJECT.query("SELECT check_user_token($1,$2)",[id,token]);
}

function IsTokenExpired(userId){
  return CONSTANT.DB_OBJECT.query("SELECT is_token_expired($1)",[userId]);
}

function IsTokenExpiredRoute(req,res){
  const authHeader = req.headers["authorization"];

  const [BEREAR,id,token] = authHeader && authHeader.split(" ");

  IsTokenExpired(id).then((result)=>{
    console.log("result",result);
    res.send({message:"all good"})
  }).catch((error)=>{
    console.log("Error",error)
    res.status(500).send({message:"error in validating"})
  })
}

function ValidateUserRoute(req,res) {
  const authHeader = req.headers["authorization"];

  const [BEREAR,id,token] = authHeader && authHeader.split(" ");

  CheckTokenExist(id,token).then((result)=>{
    res.status(200).send({message:"valid",data:result})
  }).catch((error)=>{
    res.status(500).send({message:"went wrong",data:error})
  })

}

function GenerateToken(userID, tokenType) {
  const query = `CALL insert_token($1,$2,$3,$4)`;
  const token = uuidv4();
  const timestamp = new Date();
  const result = false;

  return {
    promise: CONSTANT.DB_OBJECT.query(query, [
      userID,
      token,
      timestamp,
      tokenType,
    ]),
    token: token,
  };
}

function IsUserExist(email, password) {
  const query = "SELECT check_user_exist($1,$2)";

  return CONSTANT.DB_OBJECT.query(query, [email, password]);
}

function CreateUserRoute(req, res) {
  const { name, email, password, profileImage } = req.body;

  const query = `SELECT insert_user('${name}','${email}','${password}','${profileImage}')`;

  CONSTANT.DB_OBJECT.query(query, (err, result) => {
    if (err) {
      res.send({ response: {}, status: false, error: err });
    } else {
      let id = result.rows[0].insert_user;

      let tokenResponse = GenerateToken(id, "BEREAR_TOKEN");

      tokenResponse.promise
        .then(() => {
          let token = tokenResponse.token;
          res.send({ response: { id, token }, status: true, error: "" });
        })
        .catch(() => {
          res.send({
            response: {},
            status: false,
            error: "Errror in generating token",
          });
        });
    }
  });
}

function LoginRoute(req, res) {
  const { email, password } = req.body;

  CONSTANT.DB_OBJECT.query("SELECT id,name,email,profileImage FROM users WHERE email=$1 AND password=$2",[email,password])
    .then((result)=>{
      try {
        let id = result.rows[0].id;
      
        let tokenResponse = GenerateToken(id, "BEREAR_TOKEN");

        tokenResponse.promise
          .then(() => {
            let token = tokenResponse.token;
              res.send({ message:"All good",data:{token,...result.rows[0]} });
          })
          .catch(() => {
            res.status(500).send({
              message:"something wrong"
            });
          });
      }catch{
        throw "error in login"
      }
      
    }).catch((error) => {
      res.status(500).send({
        message:error
      });
    });
}

function UpdateUser(id,name,email,password,profileImage){
    return CONSTANT.DB_OBJECT.query("CALL update_user($1,$2,$3,$4,$5)",[id,name,email,password,profileImage]);
}

function GetUser(id){
    return CONSTANT.DB_OBJECT.query("SELECT id,email,name,profileImage FROM users WHERE id = $1",[id]);
}

function UpdateUserRoute(req,res){
    const { name,email,password,profileImage } = req.body;
    const id = GetUserIdFromReq(req);
    UpdateUser(id,name,email,password,profileImage)
        .then(()=>{
            GetUser(id).then((result)=>{
                res.send(result["rows"][0]);
            })
        }).catch(()=>{
            res.send({});
        })
}

function GetUserRoute(req,res){
    const id = req.params.user;

    console.log(id);
    GetUser(id).then((result)=>{
      console.log("result",result)
        res.send({message:"All good",data:result["rows"][0]});
    }).catch(()=>{
        res.status(500).send({message:"something went wrong"});
    })
}

function ResetPasswordRequest(email){
  return CONSTANT.DB_OBJECT.query("SELECT id from users WHERE email=$1",[email])
    .then((result)=>{
      const id = result.rows[0].id;
      const response = GenerateToken(id,"RESET")

      const url = `${CONSTANT.FRONTEND_URL}/reset/${response.token}`;

      response.promise.then(()=>{
        SendMail(email,"Reset Password",`click to this link to reset ${url}`).then(()=>{
          return true
        }).catch(()=>{
          throw "error";
        })
      }).catch(()=>{
        throw "error";
      })

    }).catch(()=>{
      throw "Error";
    })
}

function ResetPasswordRequestRoute(req,res){
  const {email} = req.body;

  ResetPasswordRequest(email).then(()=>{
    res.status(200).send({message:"mail is sent"})
  }).catch(()=>{
    res.status(500).send({message:"error in sending email"})
  })
}



function ResetPassword(password,token){
  return CONSTANT.DB_OBJECT.query("SELECT * from tokens WHERE token=$1 AND type=$2",[token,"RESET"])
    .then((result)=>{
      const id = result.rows[0].id;
      return UpdateUser(id,"","",password,"")
    }).catch(()=>{
      throw "error"
    })
}

function ResetPasswordRoute(req,res){
  const {email,password,token} = req.body;

  ResetPassword(password,token)
    .then((result)=>{
      res.status(200)
    })
}


module.exports = {
  CreateUser: CreateUserRoute,
  Login: LoginRoute,
  UpdateUser:UpdateUserRoute,
  GetUser : GetUserRoute,
  IsTokenExpiredRoute,
  ValidateUserRoute,
  ResetPasswordRequestRoute,
  Function : {
    CheckTokenExist,
    UpdateUser,
    GetUser,
  },
};
