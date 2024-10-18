require('dotenv').config()
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const {google} = require("googleapis");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));


// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() +' - '+file.originalname); // Rename the file to include the timestamp
  },
});
const upload = multer({ storage: storage });

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.client_email,
    private_key: process.env.private_key
  },
  scopes: ["https://www.googleapis.com/auth/drive"]
});
const drive = google.drive({version: "v3", auth});

const uploadFile = async (fileObject) => {
  // fileObject.path.replace("\\","/");
  console.log(fileObject);
  console.log("current Dir: ", __dirname, " :: ", path.dirname(__filename));
  
  fs.readdirSync("./" + fileObject.path.split("\\")[0]).forEach(file => {
    console.log(file);
  });
  
  const fileMetadata ={
    name: fileObject.filename
  }
  const media = {
    mimeType: fileObject.mimeType,
    body: fs.createReadStream(fileObject.path)
  }
  drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id"
  }, (err, file)=>{
    if(err){
      console.log("Error uploading files", err);
    }else{
      console.log("File uploaded, file ID : ", file.data.id);
      const destinationFolderId = '1HyM9HRvsrnsOUQMooFTbxPblS29O9O-D';
      const copyMetaData = {
        parents: [destinationFolderId]
      };
      drive.files.copy(
        {
          fileId: file.data.id,
          resource: copyMetaData
        },
        (err, copiedFile)=>{
          if(err){
            console.log("Error copying files", err);
          }else{
            console.log("File Copied, file ID : ", copiedFile.data.id);
          }
        }
      )
    }
  });

};

app.get('/',(req,res)=>{
    fs.readFile(__dirname + '/index.html', 'utf8', (err, text) => {
        res.send(text);
    });
})


// Initialize Multer with the storage configuration
app.post('/upload', upload.single('file'), (req, res) => {
  // req.file contains the uploaded file details
  // req.body contains other form data if any
  res.send('File uploaded successfully');
});

app.post('/see', upload.array('files',50), async function(req, res) {
  
    var files = req.files;
    for (let f = 0; f < files.length; f += 1) {
      await uploadFile(files[f]);
    }
    res.send(files.length+ ' Files uploaded successfully');
  }
);

app.post('/view', async function (req, res) {
    // console.log(req.body)
    let text = req.body.text;
    let textFile = req.body.title;
    let now = Date.now();
    let filename = textFile + '-' + now + '.html';
    let filePath = path.join(__dirname, './texts/' + filename);
    fs.writeFile(filePath, text, err => {
      if (err) {
        console.error("Error uploading files", err);
      } else {
        // console.log(filePath);
        uploadFile({
          fieldname: 'files',
          encoding: '7bit',
          mimetype: 'text/html',
          destination: 'texts/',
          filename: filename,
          path: 'texts\\'+filename
        });
      }
    });
    res.send('Posted successfully');
  });

app.listen(PORT, () => {
  console.log('Server is running on port '+PORT);
});

