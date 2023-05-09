const CONSTANT = require("../constants");
const USER = require("./user");
const util = require("./utility");
const { v4: uuidv4 } = require("uuid");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up the multer storage engine and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(__dirname, "..", "uploads/note");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const {noteId} = req.body;
    const extension = path.extname(file.originalname);
    cb(null, (noteId ? noteId : GetUserId(req)) + "-" + file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1000000 }, // Limit file size to 1 MB
});


function GetUserId(req) {
    let [_1, id, _2] = ["", "6fce61d8-1543-45e5-99b4-9485f0438558", ""];
  
    const authHeader = req.headers["authorization"];
  
    if (authHeader != undefined) {
      [_1, id, _2] = authHeader && authHeader.split(" ");
  
      if (id === undefined || id === "") {
        id = "";
      }
    }
  
    return id;
  }
  
function InsertExtraFile(fileId,userId,noteId,name,path){
    console.log(arguments)
    return CONSTANT.DB_OBJECT.query(`    
            INSERT INTO extra_file (file_id, name, file_created_by, note_id,link,type)
            VALUES ($1, $2, $3, $4,$5,$6);
        `,[fileId,name,userId,noteId,path,"image"])
}


function SetExtraFileNote(req, res) {
    // try{
        const { file,noteId } = req.body;

        const filePath = req.file.path;
        const id = GetUserId(req);
        const filename = filePath.split("/").reduce((acc,current)=>{
            acc = current;
            return acc;
        },"");

        const fileId = uuidv4();

        console.log(filePath)

        InsertExtraFile(fileId,id,noteId,filename,filePath.split("uploads")[1])
        .then(()=>{
            res.status(200).send({
                message:"all good to go",
                data:{
                    url : `${CONSTANT.BACKEND_URL}/extrafile/${fileId}`,
                    id:fileId,
                }
            })
        }).catch((err)=>{
            console.log(err);
            res.status(500).send({
                message:"went wrong"
            })
        })
    // }catch{
    //     res.status(500).send({
    //         message:"went wrong"
    //     })
    // }
}

function IsFileExist(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        reject();
        // File doesn't exist or can't be accessed
      } else {
        resolve();
        // File exists and can be accessed
      }
    });
  });
}

function GetExtraFile(id) {
    return CONSTANT.DB_OBJECT.query("SELECT name from extra_file WHERE file_id=$1",[id])
        .then((result)=>{
            if(result.rows.length === 0 ){
                throw "Error"
            }
            return result.rows[0].name;
        }).catch(()=>{throw "error"})
}

function GetExtraFileRoute(req, res) {
  const userId = GetUserId(req);
  const fileId = req.params.fileId;

  GetExtraFile(fileId).then((fileName)=>{
    const imagePath = `${path.resolve(
        __dirname,
        "..",
        "uploads/note"
      )}/${fileName}`;
    
    

    IsFileExist(imagePath)
    .then(() => {
        res.sendFile(imagePath);
    })
    .catch(() => {
        res.status(500).send({message:"no file"});
    });
  }).catch(() => {
    res.status(500).send({message:"not allowrd"});
});

  
}

module.exports = {
    SetExtraFileNote,
    SetExtraFileNoteMiddlware : upload.single("file"),
    GetExtraFileRoute,
};
