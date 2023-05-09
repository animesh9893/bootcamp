
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
app.post("/resetpassword/done",ROUTES.ResetPasswordRoute);


app.post("/user/profile/image",[ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.SetProfileImageMiddleware],ROUTES.SetProfileImageRoute);
app.get("/user/profile/image/:user",ROUTES.GetProfileImageRoute);

app.post("/user/profile",[ROUTES.BEREAR_TOKEN_MIDDLEWARE],ROUTES.UpdateUser)
app.get("/user/profile/:user",ROUTES.GetUser);


app.post("/note/create",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.CreateNoteRoute);
app.post("/note/update",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.UpdateNoteRoute);
app.get("/note/updateAllowed/:noteId",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.IsUpdateNoteAllowedRoute);

app.post("/note/share/add",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.ShareNotesRoute);
app.post("/note/share/isShared",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.CheckNoteSharedToRoute);
app.post("/note/share/isPublic",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.CheckNoteIsPublicRoute);
app.post("/note/upvote",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.UpvoteRoute)


app.post("/note",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.GetNoteRoute);
app.get("/note/public",ROUTES.GetPublicNoteRoute);
app.get("/note/all",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.GetAllNote);

app.post("/note/createdNote",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.GetCreatedNotesRoute);
app.post("/note/sharedNote",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.SharedNotesRoute);

app.post("/note/extrafile",[ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.SetExtraFileNoteMiddlware],ROUTES.SetExtraFileNote);
app.get("/extrafile/:fileId",ROUTES.GetExtraFileRoute);


app.post("/csvTojson",ROUTES.CSVtoJSONmiddleware,ROUTES.CSVtoJSONroute);
app.post("/csvToNote",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.FetchCSVtoNote);
app.post("/toCSV",ROUTES.BEREAR_TOKEN_MIDDLEWARE,ROUTES.ExportToCSVRoute);


app.listen(CONSTANT.PORT,(err)=>{
    if(err){
        console.log("Error in serve",err);
        // END_DB();
    }else{
        console.log("Listening at port ",CONSTANT.PORT);
    }
})