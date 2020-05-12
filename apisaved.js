const express= require('express');
const router= express.Router();
const sqlQuery= require('./sqlwrapper')

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send("You must be logged in first.");
    }

}


router.get('/places', logincheck, (req,res)=>{
    sqlQuery('SELECT id,name,rank from places WHERE userID=?',req.session.user)
        .then(places=>{
            res.status(200).json(places);
        })
        .catch(err=>{
            res.status(500).send("Something Went Wrong");
            console.log(err);
        })
});

router.get('/itenerary', logincheck, (req,res)=>{
    sqlQuery('SELECT routeID,name,rank from places WHERE userID=?',req.session.user)
        .then(places=>{
            res.status(200).json(places);
        })
        .catch(err=>{
            res.status(500).send("Something Went Wrong");
            console.log(err);
        })
});





module.exports= router;
