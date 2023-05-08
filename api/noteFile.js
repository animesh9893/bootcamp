const CONSTANT = require("../constants");
const { v4: uuidv4 } = require("uuid");


// Set up the multer storage engine and file filter
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.resolve(__dirname, "..", "uploads/note");
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
  