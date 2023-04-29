
const express = require("express")
const cors = require('cors')
const bodyParser = require('body-parser');

const db = require("./db");
const CONSTANT = require("./constants")

// route
const ROUTES = require("./api");


const app =  express();
[CONSTANT.DB_OBJECT,CONSTANT.END_DB] = db.ConnectDB();


app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get("/",ROUTES.HomeRouteTest);


app.post("/user/create",ROUTES.CreateUser);
app.post("/user/login",ROUTES.Login);

app.post("/user/profile/image",ROUTES.SetProfileImageMiddleware,ROUTES.SetProfileImageRoute);
app.get("/user/profile/image/:user",ROUTES.GetProfileImageRoute);

app.post("/user/profile",ROUTES.UpdateUser)
app.get("/user/profile",ROUTES.GetUser);


app.listen(CONSTANT.PORT,(err)=>{
    if(err){
        console.log("Error in serve",err);
        // END_DB();
    }else{
        console.log("Listening at port ",CONSTANT.PORT);
    }
})