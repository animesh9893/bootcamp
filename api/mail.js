const nodemailer = require("nodemailer")

let mailtransporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"animesh.bootcamp@gmail.com",
        pass:"pfkrvpdpvfwzwjfp"
    }
})




function SendMail(to,subject,text){

    let details = {
        from :"animesh.bootcamp@gmail.com",
        to,
        subject,
        text,
    }

    return new Promise((res,rej)=>{mailtransporter.sendMail(details,(err)=>{
        if(err){
            console.log("mail err")
            rej();
        }else{
            console.log("mail done")
            res();
        }
    })})
    
}

module.exports = {
    SendMail,
}