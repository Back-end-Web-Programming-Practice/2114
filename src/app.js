const express = require('express');
const morgan = require('morgan');
const session = require("express-session");
const path = require('path');
const dotenv = require('dotenv');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');

try {
    fs.readdirSync('uploads');
} catch (e) {
    console.error('uploads 폴더가 없어서 만든다');
    fs.mkdirSync('uploads');
}

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 8000);

app.use(morgan('dev'));
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.use(cookieParser(process.env.COOKIE_SECRET));

// app.use(
//     session({
//         resave: false,
//         saveUninitialized: false,
//         secret: process.env.COOKIE_SECRET,
//         cookie: {
//             httpOnly: true,
//             secure: false,
//         },
//         name: "session-cookie",
//     })
// );


const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads/');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
});


app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'multipart.html'));
});

app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file, req.body);
    res.send("ok");
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트');
});