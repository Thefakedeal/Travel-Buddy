// Standard Modules 
const express= require('express');
const path= require('path');
const xss= require('xss-clean')
const ratelimit= require('express-rate-limit');
const file_upload = require('express-fileupload');
const fs= require('fs');
const https= require('https');

const privateKey= fs.readFileSync('./key.pem');
const certificate= fs.readFileSync('./cert.pem');
const credentials = {key: privateKey, cert: certificate};

const upload_rate_limit = ratelimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "Too many places and photos added. Try again later"
}) 

const api_rate_limit = ratelimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Too Many Requests Too Soon"
}) 

// App Middlewares
app= express();
app.use(express.json({limit: '10kb'}));
app.use('/upload',express.json({limit: '10mb'}));

app.use(file_upload());
app.use('/upload',express.urlencoded({extended:false}));
app.use('/upload', upload_rate_limit);
app.use('/api', api_rate_limit);

app.use(xss());



// Custom modules
const api        =  require('./api');
const upload     =  require('./upload');
const places     =  require('./places');
const iteneraries=  require('./iteneraries');
const navigate   =  require('./navigate');
const auth       =  require('./auth')
const rating     =  require('./rating');
const saved      =  require('./saved')
const del     =  require('./delete');


// Serving Images
// img route is for pictures Saved
// image route is for default images used

app.use('*/img',        express.static(path.join(__dirname, './images')));
app.use('*/images',     express.static(path.join(__dirname, './Static/images')));


// Routes
app.use('/', auth);
app.use('/api', api); //Sends Data of Places, Routes Requested by User
app.use('/upload', upload); //Where User uploads Data
app.use('/places', places); //Serves HTML For Places
app.use('/iteneraries', iteneraries); //Serves HTML for Routes
app.use('/navigate', navigate); // Returns Navigation Data
app.use('/rating', rating); //Takes User Input of Ratings
app.use('/saved', saved); // For User Saved places and iteneraries
app.use('/delete', del); // For User Saved places and iteneraries

app.get('*/styles/:style', (req, res)=>{
    const {style}= req.params;
    res.sendFile(`${__dirname}/Static/styles/${style}`);
} );

app.get('*/scripts/:script', (req, res)=>{
    const {script}= req.params;
    res.sendFile(`${__dirname}/Static/scripts/${script}`);
});

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/Static' + '/index.html');
})










var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443)
app.listen(800);
