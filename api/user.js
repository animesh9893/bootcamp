const CONSTANT = require("../constants");
const { v4: uuidv4 } = require("uuid");

function GetUserId(email) {
  return CONSTANT.DB_OBJECT.query("SELECT ID FROM users WHERE email=$1", [
    email,
  ]);
}

function CheckTokenExist(id,token){
    return CONSTANT.DB_OBJECT.query("SELECT check_user_token($1,$2)",[id,token]);
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

  IsUserExist(email, password)
    .then((response) => {
      if (!response["rows"][0]["check_user_exist"]) {
        res.send({
          response: {},
          status: false,
          error: "user not found",
        });
      } else {
        GetUserId(email)
          .then((userIdResponse) => {
            const id = userIdResponse["rows"][0].id;

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
          })
          .catch(() => {
            res.send({
              response: {},
              status: false,
              error: "user not found",
            });
          });
      }
    })
    .catch((err) => {
      res.send({
        response: {},
        status: false,
        error: "user not found",
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
    const { id,name,email,password,profileImage } = req.body;

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

    GetUser(id).then((result)=>{
        res.send(result["row"][0]);
    }).catch(()=>{
        res.send({});
    })
}


module.exports = {
  CreateUser: CreateUserRoute,
  Login: LoginRoute,
  UpdateUser:UpdateUserRoute,
  GetUser : GetUserRoute,

  Function : {
    CheckTokenExist,
    UpdateUser,
    GetUser,
  },
};
