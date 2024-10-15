const express = require('express');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');


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
    cb(null,Date.now() + '-' + file.originalname); // Rename the file to include the timestamp
  },
});
const upload = multer({ storage: storage });

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

app.post('/see', upload.array('files',50), function(req, res) {
    var files = req.files;
    res.send(files.length+ ' Files uploaded successfully');
  }
);

app.post('/view', function (req, res) {
    // console.log(req.body)
    let text = req.body.text;
    let textFile = req.body.title;
    let now = Date.now();
    fs.writeFile(path.join(__dirname, './texts/' + textFile + '-' + now + '.html'), text, console.log);
    res.send('Posted successfully');
  });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

