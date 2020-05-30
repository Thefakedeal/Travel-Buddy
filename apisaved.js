const express= require('express');
const router= express.Router();
const {getPlacesUploadedByUser}= require('./places_functions');
const sqlQuery= require('./sqlwrapper');

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send("You must be logged in first.");
    }

}


router.get('/places', logincheck, async (req,res)=>{
    const userID= req.session.user;
    try{
        const places= await getPlacesUploadedByUser(userID);
        res.status(200).json(places);
    }
    catch(err){
        res.status(500).send('Something Went Wrong');
    }
});

router.get('/iteneraries', logincheck, (req,res)=>{
    sqlQuery('SELECT iteneraryID,name,rank from itenerary WHERE userID=?',req.session.user)
        .then(itenerary=>{
            res.status(200).json(itenerary);
        })
        .catch(err=>{
            res.status(500).send("Something Went Wrong");
            console.log(err);
        })
});





module.exports= router;
