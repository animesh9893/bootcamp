const CONSTANT  = require("../constants");

function DB_QUERY(query){
    let response = null;
    let error = null;

    CONSTANT.DB_OBJECT.query(query)
        .then(result=>{
            response = [...result.rows];
            // return [...result.rows]
        })
        .catch(err=>{
            error = err;
            return [];
        })

    console.log("DB",response);

    return {response};
}


function GetIdTokenFromReq(req){
    const authHeader = req.headers["authorization"];

    const [BEREAR,id,token] = authHeader && authHeader.split(" ");

    return [BEREAR,id,token];
}

module.exports = {
    DB_QUERY,
    GetIdTokenFromReq,
}