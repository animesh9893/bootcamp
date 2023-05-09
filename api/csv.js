const multer = require('multer');
const csvParser = require('csv-parser');
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const axios = require('axios');
const csv = require('csv-parser');
const CONSTANT = require("../constants");
const { GetNote } = require('./note');
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter;


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


const upload = multer({ dest: path.resolve(__dirname, "..", "uploads/") });

async function fetchCsvAndConvertToJson(url) {
    try {
      const response = await axios.get(url);
      const results = [];
  
      return new Promise((resolve, reject) => {
        const { data } = response;
        resolve(data);
      });
    } catch (error) {
      throw new Error('Error fetching CSV from URL: ' + error.message);
    }
  }
  

function CreateNote(id,name="",type="",isProtected=false,password="",link="",data="",userId,isPublic=true){
    return CONSTANT.DB_OBJECT.query("SELECT create_note($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                [id,name,type,isProtected,password,link,data,userId,isPublic])
}



function FetchCSVtoNote(req,res){
    const {url} = req.body;
    const userId = GetUserIdFromReq(req);
    
    let id = uuidv4();
    
    fetchCsvAndConvertToJson(url).then((result)=>{
        CreateNote(id,uuidv4(),"",false,"","",result,userId,true).then(()=>{
            res.send({message:"all good",data:{
                id,
                stringData:result,
            }})
        })
    }).catch((err)=>{
        console.log(err);
        res.status(500).send({message:"went wrong"})
    })

}


function ExportToCSVRoute(req,res){
    const {noteId} = req.body;
    const userId = GetUserIdFromReq(req);

    console.log(noteId);

    GetNote(noteId,userId).then((response)=>{
          const jsonData = response.rows
          try {
            const csvWriter = createObjectCsvWriter({
              path: 'output.csv',
              header: Object.keys(jsonData[0]).map((key) => ({ id: key, title: key })),
            });
        
            csvWriter
              .writeRecords(jsonData)
              .then(() => {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
                res.sendFile('output.csv', { root: __dirname }, (error) => {
                  if (error) {
                    console.error('Error:', error);
                    res.status(500).send('Error while sending the CSV file.');
                  }
                  // Delete the CSV file after sending it
                  fs.unlinkSync('output.csv');
                });
              })
              .catch((error) => {
                console.error('Error:', error);
                res.status(500).send('Error while writing the CSV file.');
              });
          } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Error while processing the input data.');
          }
    })
}





module.exports = {
    CSVtoJSONmiddleware:upload.single('file'),
    CSVtoJSONroute : (req, res) => {
        const csvFilePath = req.file.path;
        const results = [];
      
        // Read and parse the CSV file
        fs.createReadStream(csvFilePath)
          .pipe(csvParser())
          .on('data', (data) => {
            results.push(data);
          })
          .on('end', () => {
            fs.unlinkSync(req.file.path);
            res.json(results);
          });
    },
    FetchCSVtoNote,
    ExportToCSVRoute,
}