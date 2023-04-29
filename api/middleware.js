const USER = require("./user").Function;


function BEREAR_TOKEN_MIDDLEWARE(req,res,next){
    const authHeader = req.headers["authorization"];

    const [BEREAR,id,token] = authHeader && authHeader.split(" ");

    if(!token || !id) return res.status(401).send('Access denied. No token provided.');

    USER.CheckTokenExist(id,token).then((result)=>{
        if(result["rows"][0]["check_user_token"]){
            next();
        }else{
            res.status(401).send('Access denied.');
        }
    }).catch(()=>{ 
        res.status(401).send('Access denied.');
    })
}