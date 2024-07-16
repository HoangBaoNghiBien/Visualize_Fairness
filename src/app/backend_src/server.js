const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();


// Enable CORS for all routes
app.use(cors());

app.use('/files', express.static(path.join(__dirname, 'temporary_files')))


// Configure storage
const storage_pblic = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/dataset')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload_to_pblic = multer({ storage: storage_pblic });


app.get("/", (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

// Upload a file to the server
app.post('/upload', upload_to_pblic.single('file'),(req, res) => {
    if (req.file){
        res.status(200).end()
        console.log(req.file)
        return
    }
    res.status(404).json({
        error: "file not valid?"
    })
});

// Serve the uploaded files to the client
app.get('/api/files', (req, res) => {
    const directoryPath = path.join(__dirname, '../../../public/dataset');
    // console.log(directoryPath);
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            // console.error("Error reading the directory: ", err);
            return res.status(500).send({ message: "Unable to scan files!" });
        }
        res.json(files);
    });
});

app.delete('/temp/:filename(*)', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname,'../../../public/dataset', filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting the file: ", err);
            return res.status(404).json({ error: "File not found" });
        }
        res.status(200).send({ message: "File deleted successfully" });
    });
});

app.listen(3000, () => console.log('Server started on port 3000'));
