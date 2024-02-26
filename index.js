import express from 'express';
import multer from 'multer';
import fs from "fs";
import Jimp from "jimp";
import qrCode from "qrcode-reader";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import morgan from "morgan";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 4000;


// Set up storage for multer -> storage setup for the image on the system
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/public/uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, "qr" + path.extname(file.originalname));
    }
});


// Serve static files from the 'public' folder -> this makes the css and  js file to work
app.use(express.static(path.join(__dirname, 'public')));

// to console log the requests
app.use(morgan("tiny"));


// creating an storage object
const upload = multer({ storage: storage });


// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Handle the file upload 
app.post('/upload', upload.single('image'), (req, res) => {
    const buffer = fs.readFileSync(__dirname + `/public/uploads/${req.file.filename}`);

    Jimp.read(buffer, function (err, image) {
        if (err) {
            console.error(err);
        }
        let qrcode = new qrCode();
        qrcode.callback = function (err, value) {
            if (err) {
                console.error(err);
            }
            // Printing the decrypted value
            console.log(value.result);
            res.send(value.result);
        };
        // Decoding the QR code
        qrcode.decode(image.bitmap);
    })

});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
