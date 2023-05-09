const USER = require("./user").Function;
const fs = require('fs');

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



// Middleware function
function requestLogger(req, res, next) {
  const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url} header - ${JSON.stringify(req.headers)}\n`;

  // Log the request to the console
  console.log(logMessage);

  // Append the log message to a log file
  fs.appendFile('request.log', logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // Move to the next middleware
  next();
}

module.exports = requestLogger;


module.exports = {
    BEREAR_TOKEN_MIDDLEWARE,
    LOGGER : requestLogger,
}