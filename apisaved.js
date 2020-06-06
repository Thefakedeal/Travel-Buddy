const express= require('express');
const router= express.Router();
const {getPlacesUploadedByUser}= require('./places_functions');
const {getItenerariesSavedByUser}= require('./itenerary_functions');
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

router.get('/iteneraries', logincheck, async (req,res)=>{
    const userID= req.session.user;
    try{
        const iteneraries= await getItenerariesSavedByUser(userID)
        res.status(200).json(iteneraries);
    }
    catch(err){
        res.sendStatus(500);
    }
});





module.exports= router;
