import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';


import { fileURLToPath } from 'url';
import { uploadToInstagram } from './uploadingImage/uploadingImages.js';


// Resolve the __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);
// import { uploadToInstagram } from './uploadingImage/uploadingImages.js';


// uploads/1720550759241.jpeg
// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.static('public')); // Serve static files (e.g., your EJS file)
app.use(express.json());

// Set up the view engine to use EJS
app.set('view engine', 'ejs');

// Route to render the upload form
app.get('/', (req, res) => {
    res.render('index');
});


// const image = `\\opt\\render\\project\\src\\`
const image = `C:\\Users\\Aliyu\\postgresqltesting\\`
console.log(_dirname);

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log(req.file);
    if (req.file) {
     await uploadToInstagram(`${image}${req.file.path}`)
        res.json({ message: 'File uploaded successfully', file: req.file });
    } else {
        res.status(400).json({ message: 'File upload failed' });
    }
});

// Start the server
const PORT = process.env.PORT || 2020;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});