const CONSTANT  = require("../constants");


function HomeRouteTest(req,res){
    TestDB(CONSTANT.DB_OBJECT);
    console.log(CONSTANT)
    res.send("Hello F");
}

function TestDB(connect){
    connect.query("select * from users;",(err,res)=>{
        console.log("ERRROR",err);
        console.log("respo",res);
    })
}

module.exports = {
    HomeRouteTest,
};