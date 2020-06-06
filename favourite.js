const express= require('express');
const { isFavouritePlace ,setPlaceAsFavourite, deletePlaceAsFavourite, getFavouritePlaces } = require('./places_functions');
const { getFavouriteIteneraries, setIteneraryAsFavourite,deleteIteneraryAsFavourite, isFavouriteItenerary} = require('./itenerary_functions.js')
const router= express.Router();

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(401).send('You must be logged in.');
    }
}

router.get('/places', logincheck, async (req,res)=>{
    const userID= req.session.user;
    try{
        const places= await getFavouritePlaces(userID);
        res.status(200).json(places);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/iteneraries', logincheck, async (req,res)=>{
    const userID= req.session.user;
    try{
        const iteneraries= await getFavouriteIteneraries(userID);
        res.status(200).json(iteneraries);
    }
    catch(err){
        res.sendStatus(500);
    }
})

router.post('/place', logincheck, async (req,res)=>{
    const { star, placeID}= req.body;
    const userID= req.session.user;
    const favourite= parseInt(star);
    try {
        if(favourite===1){
            if(await setPlaceAsFavourite(userID,placeID)){
                res.sendStatus(200);
                return;
            }
        }
        else if(favourite===0){
            if(await deletePlaceAsFavourite(userID,placeID)){
              res.sendStatus(200);
              return;  
            }
        }
        res.sendStatus(400);
    }
    catch(err){
        res.sendStatus(500);
    }
    
})

router.post('/itenerary', logincheck, async (req,res)=>{
    const { star, iteneraryID}= req.body;
    const userID= req.session.user;
    const favourite= parseInt(star);
    try{
        if(favourite===1){
            if(await setIteneraryAsFavourite(userID,iteneraryID)){
                res.sendStatus(200);
                return;
            }
        }
        else if(favourite===0){
            if(await deleteIteneraryAsFavourite(userID,iteneraryID)){
                res.sendStatus(200);
                return;
            }
        }
        res.sendStatus(400)
    }
    catch(err){
        res.sendStatus(500);
    }
})

router.get('/place', logincheck, async (req,res)=>{
    const {placeID} = req.query;
    const userID= req.session.user;
    try{
        if(await isFavouritePlace(placeID,userID) ){
            res.status(200).json({favourite: 1})
            return;
        }
        res.status(200).json({favourite: 0});  
    }
    catch(err){
        console.log(err);
        res.status(200).json({favourite: 0});  
    }
})

router.get('/itenerary', logincheck, async (req,res)=>{
    const {iteneraryID}= req.query;
    const userID= req.session.user;
    try{
        if(await isFavouriteItenerary(userID,iteneraryID)){
            res.status(200).json({favourite: 1})
            return;
        }
        res.status(200).json({favourite: 0});  
    }
    catch(err){
        console.log(err);
        res.status(200).json({favourite: 0});  
    }
});

module.exports= router;