const CONSTANT = require("./constants")

const express = require("express")
const cors = require('cors')

// route
const ROUTES = require("./api");

const app =  express();

app.use(cors())

app.get("/",ROUTES.HomeRouteTest);


app.listen(CONSTANT.PORT,(err)=>{
    if(err){
        console.log("Error in serve",err);
    }else{
        console.log("Listening at port 8080");
    }
})