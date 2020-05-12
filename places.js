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
    res.sendFile(__dirname + '/Static' + '/places.html');
})

router.get('/place', (req, res)=>{
    res.sendFile(__dirname + '/Static' + '/place.html');
})

router.get('/add',logincheck, (req,res)=>{
    res.sendFile(__dirname + '/Static' + '/addplace.html');
})
module.exports= router; 