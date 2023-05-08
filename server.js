
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
app.get("/user/token/isValid",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.IsTokenExpiredRoute);
app.get("/user/token",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.ValidateUserRoute);


app.post("/resetpassword",ROUTES.ResetPasswordRequestRoute);

app.post("/user/profile/image",[ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.SetProfileImageMiddleware],ROUTES.SetProfileImageRoute);
app.get("/user/profile/image/:user",ROUTES.GetProfileImageRoute);

app.post("/user/profile",[ROUTES.BEREAR_TOKEN_MIDDLEWARE],ROUTES.UpdateUser)
app.get("/user/profile/:user",ROUTES.GetUser);


app.post("/note/create",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.CreateNoteRoute);
app.post("/note/update",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.UpdateNoteRoute);
app.get("/note/updateAllowed/:noteId",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.IsUpdateNoteAllowedRoute);

app.post("/note/share/add",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.AddNoteSharedToRoute);
app.post("/note/share/isShared",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.CheckNoteSharedToRoute);
app.post("/note/share/isPublic",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.CheckNoteIsPublicRoute);

app.post("/note",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.GetNoteRoute);
app.get("/note/public",ROUTES.GetPublicNoteRoute);

app.listen(CONSTANT.PORT,(err)=>{
    if(err){
        console.log("Error in serve",err);
        // END_DB();
    }else{
        console.log("Listening at port ",CONSTANT.PORT);
    }
})