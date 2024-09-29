const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const app = express();

app.use(cors());

app.use('/files', express.static(path.join(__dirname, 'temporary_files')));
app.use('/templates', express.static(path.join(__dirname, 'public/templates')));


app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    console.log(res.getHeaders());  // Log headers to verify the response contains correct headers
    next();
});
// Configure storage
const storage_pblic = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/dataset')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const storage_fairness = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './fairness')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload_to_fairness = multer({ storage: storage_fairness });
const upload_to_pblic = multer({ storage: storage_pblic });

function runPythonScript() {
    return new Promise((resolve, reject) => {
        console.log("Running Python script");

        const pythonProcess = spawn('python3', ['fairness/get_metrics.py', '-c', 'fairness/config.json'], {
            timeout: 10000 // 10 seconds timeout
        });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('error', (err) => {
            reject(`Failed to start Python script: ${err.message}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0 || errorOutput) {
                reject(errorOutput || `Python script exited with code ${code}`);
            } else {
                resolve(output);
            }
        });
    });
}


app.get('/run-python', async (req, res) => {
    try {
        const result = await runPythonScript();
        res.send({ output: result });
    } catch (error) {
        console.error("Error running Python script:", error);
        res.status(500).send({ error: "Failed to run the Python script." });
    }
});




app.get("/", (req, res) => {
    // make this runs for 15 seconds
    setTimeout(() => {
        res.send("Hello World");
    }, 15000);
})

// Upload a file to the server
app.post('/upload', upload_to_pblic.single('file'), (req, res) => {
    if (req.file) {
        res.status(200).end()
        console.log(req.file)
        return
    }
    res.status(404).json({
        error: "file not valid?"
    })
});

app.post('/upload/fairness', upload_to_fairness.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded or file not valid"
            });
        }
        console.log("File uploaded successfully:", req.file);
        res.status(200).end();
    } catch (err) {
        console.error("Error uploading file:", err);
        res.status(500).json({
            error: "Internal server error during file upload"
        });
    }
});



// upload the modified file to the server
app.put('/upload/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../../public/dataset', filename
    );
    fs.writeFile(filePath, JSON.stringify(req.body), (err) => {
        if (err) {
            console.error("Error writing the file: ", err);
            return res.status(500).send({ message: "Unable to write the file!" });
        }
        res.status(200).send({ message: "File written successfully" });
    }
    );
});

// Serve the uploaded files to the client
app.get('/api/files', (req, res) => {
    const directoryPath = path.join(__dirname, '../../../public/dataset');
    // console.log(directoryPath);
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            console.error("Error reading the directory: ", err);
            return res.status(500).send({ message: "Unable to scan files!" });
        }
        console.log(files);
        res.json(files);
    });
});

// Serve the uploaded files to the client
app.get('/api/templates', (req, res) => {
    const directoryPath = path.join(__dirname, '../../../public/templates');
    // console.log(directoryPath);
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            // console.error("Error reading the directory: ", err);
            return res.status(500).send({ message: "Unable to scan files!" });
        }
        res.json(files);
    });
});


app.get('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../../public/dataset', filename
    );
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file: ", err);
            return res.status(404).json({ error: "File not found" });
        }
        res.json(JSON.parse(data));
    }
    );
});

app.delete('/temp/:filename(*)', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../../public/dataset', filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting the file: ", err);
            return res.status(404).json({ error: "File not found" });
        }
        res.status(200).send({ message: "File deleted successfully" });
    });
});

var server = app.listen(3000, () => console.log('Server started on port 3000'));
server.keepAliveTimeout = 30000;
server.timeout = 30000;




