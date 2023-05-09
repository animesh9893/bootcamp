const CONSTANT = require("../constants");
const { v4: uuidv4 } = require("uuid");
const { SendMail } = require("./mail");
const { CreateUserFunction } = require("./user");
const _ = require("lodash");

function GetUserIdFromReq(req) {
    let [_1, id, _2] = ["", "6fce61d8-1543-45e5-99b4-9485f0438558", ""];
  
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  
    if (authHeader != undefined) {
      [_1, id, _2] = authHeader && authHeader.split(" ");
  
      if (id === undefined || id === "") {
        id = "";
      }
    }
    return id;
}
  


function CreateNote(id,name="",type="",isProtected=false,password="",link="",data="",userId,isPublic=true){
    return CONSTANT.DB_OBJECT.query("SELECT create_note($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                [id,name,type,isProtected,password,link,data,userId,isPublic])
}

function CreateNoteRoute(req,res){
    const {name,type,isProtected,password,link,data,isPublic,noteId} = req.body;
    let id = uuidv4();
    if(noteId){
        id = noteId;
    }

    const userId = GetUserIdFromReq(req);
    CreateNote(id,name,type,isProtected,password,link,data,userId,isPublic)
        .then((result)=>{
            console.log("note is created",result)
            res.status(200).send({id});
        })
        .catch((error)=>{
            console.log("Error in creating note",error)
            res.status(400).send();
        })
}

function GetMailOfUser(id){
    return CONSTANT.DB_OBJECT.query("select email from users where id=$1",[id]).then((result)=>{
        if(result.rows.length===0){throw "error"}
        return result.rows[0].email;
    }).catch(()=>{
        throw "Error";
    })
}

function AddNoteSharedTo(noteId,userId,rights) {
    return CONSTANT.DB_OBJECT.query("SELECT add_note_shared_to($1,$2,$3)",[noteId,userId,rights]);
}

function AddNoteSharedToRoute(req,res) {
    const {noteId,userId,rights} = req.body;

    AddNoteSharedTo(noteId,userId,rights).then((result)=>{
        console.log("note shared",result);
        GetMailOfUser(userId).then(mail=>{
            SendMail(mail,"note is shared with you",`hi ${CONSTANT.FRONTEND_URL}/note/${noteId} is shared with you as ${rights} acccess. you can use this mail to login and see the content if password protected please ask the owner`);
            res.status(200).send({message:`Successfuly Added ${userId} with ${rights} rights`})
        }).catch(()=>{
            CreateUserFunction
        })
    }).catch((error)=>{
        console.log("unable to share note",error);
        res.status(500).send({message:`error while adding shared route`});
    })
}

function IsUpdateNoteAllowed(noteId,userId){
    return CONSTANT.DB_OBJECT.query("SELECT access_right FROM note_shared_to WHERE note_id=$1 AND user_id=$2",[noteId,userId]).then((result)=>{
        console.log("RIGHT ",result)
        if(result.rows[0]["access_right"]==="owner" || result.rows[0]["access_right"]==="write"){
            return true
        }else{
            throw "No right"
        }
    })
}


function IsUpdateNoteAllowedRoute(req,res){
    const {noteId} = req.params;
    const userId  = GetUserIdFromReq(req);

    console.log(noteId,userId,"req")

    IsUpdateNoteAllowed(noteId,userId).then(()=>{
        res.status(200).send({message:"Allowed"})
    }).catch(()=>{
        res.status(500).send({message:"Not allowed"})
    })
}


function UpdateNote(...input) {
    const args = input.reduce((acc,curr)=>{
        if(curr === undefined || curr === null) {
            acc.push("")
        }else{
            acc.push(curr);
        }
        return acc;
    },[]);

    console.log(args)

    return CONSTANT.DB_OBJECT.query("SELECT update_note($1,$2,$3,$4,$5,$6,$7,$8,$9)",[...args]);
}

function UpdateNoteRoute(req, res) {
    const { noteId, name, type, isProtected, password, link, data, isPublic } = req.body;
    const userId = GetUserIdFromReq(req);

    UpdateNote(noteId, name, type, isProtected, password, link, data,isPublic, userId)
        .then((result) => {
            console.log("note updated", result);
            res.status(200).send({ message: `Successfuly updated note with ID ${noteId}` });
        })
        .catch((error) => {
            console.log("unable to update note", error);
            res.status(500).send({ message: `Error while updating note` });
        });
}

function checkNoteSharedTo(userId, noteId) {
    return CONSTANT.DB_OBJECT.query('SELECT check_note_shared_to($1, $2)', [userId, noteId])
        .then(result => result.rows[0].check_note_shared_to);
}

function CheckNoteSharedToRoute(req, res) {
    const { noteId } = req.body;
    const userId = GetUserIdFromReq(req);

    checkNoteSharedTo(userId, noteId)
        .then(result => {
            res.status(200).send({ isShared: result });
        })
        .catch(error => {
            console.log("unable to check note shared status", error);
            res.status(500).send({ message: "error while checking shared note status" });
        });
}


function noteIsPublic(noteId) {
    return CONSTANT.DB_OBJECT.query("SELECT note_is_public($1)", [noteId]);
}

function CheckNoteIsPublicRoute(req, res) {
    const { noteId } = req.body;

    noteIsPublic(noteId)
        .then(result => {
            if (result.rows[0].note_is_public) {
                res.status(200).send({ message: "Note is public" });
            } else {
                res.status(400).send({ message: "Note is not public" });
            }
        })
        .catch(error => {
            console.log("Error checking if note is public:", error);
            res.status(500).send({ message: "Error checking if note is public" });
        });
}


function GetNote(noteId,userId){
    return CONSTANT.DB_OBJECT.query("SELECT access_right from note_shared_to WHERE note_id = $1 AND user_id = $2",[noteId,userId])
        .then((result)=>{
            if(result.rows.length == 0){
                throw "error";
            }
            return CONSTANT.DB_OBJECT.query("SELECT * from notes WHERE note_id = $1",[noteId])
        })

    // return CONSTANT.DB_OBJECT.query("SELECT get_note($1,$2)",[noteId,userId])
}

function GetSinglePublicNote(id){
    return CONSTANT.DB_OBJECT.query("select * from notes WHERE note_id=$1 AND is_available_for_public=$2",[id,true]);
}

function GetNoteRoute(req,res) {
    const {noteId} = req.body;
    const userId = GetUserIdFromReq(req);

    GetSinglePublicNote(noteId).then((result)=>{
        res.status(200).send({message:"all good",data:result.rows[0]});
        return ;
    }).catch(()=>{
        GetNote(noteId,userId).then((result)=>{
            res.status(200).send({message:"good to go",data:result.rows[0]})
        }).catch((error)=>{
            res.status(500).send({message:"went wrong"})    
        })
    })
}


function GetPublicNote(){
    return CONSTANT.DB_OBJECT.query("select * from notes WHERE is_available_for_public=$1",[true])
}

function GetPublicNoteRoute(req,res){
    GetPublicNote().then((result)=>{
        res.status(200).send({message:"All good",data:result.rows})
    }).catch(()=>{
        res.status(500).send({message:"Error in fething public note"});
    })
}


function Upvote(noteId){
    return CONSTANT.DB_OBJECT.query("select vote from notes where note_id=$1",[noteId]).then((result)=>{
        let vote = result.rows[0].vote;
        if(vote%10==9){
            vote+=1;
        }
        vote+=1;
        CONSTANT.DB_OBJECT.query("update notes set vote = $1 where note_id = $2",[vote,noteId]).then(()=>{
            return CONSTANT.DB_OBJECT.query("select vote from notes where note_id=$1",[noteId]).then(()=>{
                let vote = result.rows[0].vote;
                return vote;
            })
        })
    }).catch(()=>{
        throw "error"
    })
}

function UpvoteRoute(req,res){
    const {noteId} = req.body;
    console.log("upvote");
    Upvote(noteId).then(()=>{
        res.status(200).send({})
    }).catch(()=>{
        res.status(500).send({})
    })
}


function ShareNotes(email,noteId,access){
    return CONSTANT.DB_OBJECT.query("SELECT * from users where email=$1",[email])
        .then((result)=>{
            if(result.rows.length===0){
                throw "error"
            }
            console.log("user exist sharing to ",email);
            return AddNoteSharedTo(noteId,result.rows[0].id,access).then(()=>{
                SendMail(email,"note shared",`${CONSTANT.FRONTEND_URL}/note/${noteId} is shared with you as ${access}.`)
            }).catch((error)=>{
                console.log("error in shareing ",error)
            })
        }).catch(()=>{
            console.log("creating user",email)
            CreateUserFunction(undefined,email,undefined,"").then(({token,id})=>{
                return AddNoteSharedTo(noteId,id,access).then(()=>{
                    SendMail(email,"note shared",`${CONSTANT.FRONTEND_URL}/note/${noteId} is shared with you as ${access}.
                        if you dont have account in website then you can login with this mail as the password is "temp".
                        please reset it.
                    `)
                }).catch((error)=>{
                    console.log("error in shareing 1",error)
                })
            })
        })
}

function ShareNotesRoute(req,res){
    const {email,noteId,access} = req.body;

    ShareNotes(email,noteId,access).then(()=>{
        res.status(200).send({});
    }).catch(()=>{
        res.status(500).send();
    })
}


const arrayUnion = (arr1, arr2, identifier) => {
    const array = [...arr1, ...arr2]

    return _.uniqBy(array, identifier)  
}


function GetCreatedNotes(userId){
    return CONSTANT.DB_OBJECT.query("SELECT * from notes where note_created_by=$1",[userId]).then((res)=>{
        return res.rows
    });
}

function GetCreatedNotesRoute(req,res){
    const {userId} = req.body;

    GetCreatedNotes(userId).then((result)=>{
        res.send({message:"all good",data:[...result]})
    }).catch(()=>{
        res.status(500).send({message:"not good"})
    })
}


function SharedNotes(userId){
    return CONSTANT.DB_OBJECT.query(" select note_id from note_shared_to where user_id = $1",[userId]);
}

function SharedNotesRoute(req,res){
    const {userId} = req.body;
    SharedNotes(userId).then((result)=>{
        res.send({message:"done",data:result.rows})
    }).catch(()=>{
        res.status(500).send({message:"no data",data:[]});
    })

}


function GetAllNote(userId){
    let publicNote = [];
    let createdBy = [];
    let shared = [];

    console.log("GET ID")

    CONSTANT.DB_OBJECT.query("SELECT * from notes where is_available_for_public=$1",[true])
        .then((result)=>{
            result.rows.reduce((acc,curr)=>{
                acc.push(curr);
            },publicNote)
        })
        .then(()=>{
            CONSTANT.DB_OBJECT.query("SELECT * from notes where note_created_by=$1",[userId])
            .then((result)=>{
                result.rows.reduce((acc,curr)=>{
                    acc.push(curr);
                },createdBy) 
            })
        }).then(()=>{
            CONSTANT.DB_OBJECT.query("select note_id from note_shared_to where user_id=$1",[userId]).then((result)=>{
                result.rows.reduce((acc,curr)=>{
                    CONSTANT.DB_OBJECT.query("SELECT * from notes where note_id = $1",[curr.note_id])
                        .then((res)=>{
                            acc.push(res.rows[0]);
                        })
                },shared)
            })
        }).then(()=>{
            let temp = arrayUnion(publicNote,createdBy);
            temp = arrayUnion(temp,shared);

            return temp;
        }).catch((error)=>{
            console.log(error);
            throw "errror"
        })
}


function GetAllNote(req,res){
    const id = req.headers["authorization"].split(" ")[1]

    console.log("ID",id)

    GetAllNote(id).then((result)=>{
        res.status(200).send({message:"all good",data:result})
    }).catch((err)=>{
        res.status(500).send({message:"went wrong"})
    })
}


module.exports = {
    AddNoteSharedToRoute,
    CreateNoteRoute,
    UpdateNoteRoute,
    CheckNoteSharedToRoute,
    CheckNoteIsPublicRoute,
    GetNoteRoute, 
    GetPublicNoteRoute,
    IsUpdateNoteAllowedRoute,
    UpvoteRoute,
    ShareNotesRoute,
    GetAllNote,
    GetCreatedNotesRoute,
    SharedNotesRoute,




    CreateNote,
    GetNote,
}