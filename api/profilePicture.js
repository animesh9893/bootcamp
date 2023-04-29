const CONSTANT = require("../constants");
const USER = require("./user");
const util = require("./utility");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// Set up the multer storage engine and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(__dirname, "..", "uploads");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const id = GetUserId(req);
    const extension = path.extname(file.originalname);
    cb(null, id + extension);
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

function SetProfileImageRoute(req, res) {
  try {
    const { file } = req.body;
    const filePath = req.file.path;

    const id = GetUserId(req);

    USER.Function.UpdateUser(id, "", "", "", filePath)
      .then(() => {
        res
          .status(200)
          .send(`File uploaded successfully. ${filePath}  --- ${file}`);
      })
      .catch((error) => {
        res.status(400).send(error.message);
      });
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
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

function GetProfileImageRoute(req, res) {
  const userId = req.params.user;
  const imagePath = `${path.resolve(
    __dirname,
    "..",
    "uploads"
  )}/${userId}.jpeg`;

  IsFileExist(imagePath)
    .then(() => {
      res.sendFile(imagePath);
    })
    .catch(() => {
      res.status(400).send();
    });
}

module.exports = {
  SetProfileImageRoute,
  SetProfileImageMiddleware: upload.single("file"),
  GetProfileImageRoute,
};
