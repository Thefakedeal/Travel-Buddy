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
    res.sendFile(__dirname + '/Static' + '/saved.html');
});

module.exports= router;