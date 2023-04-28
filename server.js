const CONSTANT = require("./constants")

const express = require("express")
const cors = require('cors')

const db = require("./db");

[CONSTANT.DB_OBJECT,CONSTANT.END_DB] = db.ConnectDB();

// route
const ROUTES = require("./api");

const app =  express();

app.use(cors())

app.get("/",ROUTES.HomeRouteTest);


app.listen(CONSTANT.PORT,(err)=>{
    if(err){
        console.log("Error in serve",err);
        // END_DB();
    }else{
        console.log("Listening at port ",CONSTANT.PORT);
    }
})