const express= require('express');
const router= express.Router();

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.redirect('/login');
    }

}

router.get('/', (req, res)=>{
    res.sendFile(__dirname + '/Static' + '/iteneraries.html');
})

router.get('/itenerary', (req, res)=>{
    res.sendFile(__dirname + '/Static' + '/itenerary.html');
})

router.get('/add',logincheck, (req,res)=>{
    res.sendFile(__dirname + '/Static' + '/addItenerary.html');
})

module.exports= router; 