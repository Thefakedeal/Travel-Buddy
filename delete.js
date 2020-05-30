const express= require('express');
const router= express.Router();
const { deletePlaceByUser }= require('./places_functions');
const sqlQuery= require('./sqlwrapper');

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
        await deletePlaceByUser(placeID,userID);
        res.sendStatus(200);
    }
    catch(err){
        res.sendStatus(500);
    }
});

router.delete('/itenerary', logincheck, (req,res)=>{
    const {iteneraryID}= req.query;
    sqlQuery('DELETE FROM itenerary WHERE iteneraryID=? AND userID=?', [iteneraryID, req.session.user])
        .then((result)=>{
            res.sendStatus(200);
        })
        .catch(err=>{
            console.log(err);
            res.sendStatus(500);
        })
});


module.exports= router;