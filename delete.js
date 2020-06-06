const express= require('express');
const router= express.Router();
const { deletePlaceByUser }= require('./places_functions');
const { deleteIteneraryByUser}= require('./itenerary_functions');


function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(401).send('You must be logged in.');
    }
}


router.delete('/place', logincheck, async (req,res)=>{
    const {placeID}= req.query;
    const userID= req.session.user;
    try{
        const placeDeleted= await deletePlaceByUser(placeID,userID);
        if(placeDeleted){
            res.sendStatus(200);
            return;
        }
        res.sendStatus(500);
    }
    catch(err){
        res.sendStatus(500);
    }
});

router.delete('/itenerary', logincheck, async (req,res)=>{
    const {iteneraryID}= req.query;
    const userID= req.session.user;
    try{
        const iteneraryDeleted= await deleteIteneraryByUser(iteneraryID,userID);
        if(iteneraryDeleted){
            res.sendStatus(200);
            return;
        }
        res.sendStatus(500);
    }
    catch(err){
        res.sendStatus(500);
    }
});


module.exports= router;