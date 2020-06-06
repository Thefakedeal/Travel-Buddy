const express = require('express');
const router = express.Router();
const { getMinMaxLatitudeLongitude } = require('./location.js')
const {getIteneraries, getItenerary, getIteneraryPlaces,getImages} = require('./itenerary_functions.js');
const sqlQuery = require('./sqlwrapper');

router.get('/', async (req,res)=>{
    const {lat, lon} = req.query;
    const [minlat,minlon,maxlat,maxlon] = getMinMaxLatitudeLongitude(lat,lon,0.2);
    try{
        const iteneraries= await getIteneraries(minlat,minlon,maxlat,maxlon);
        res.status(200).json(iteneraries);
    }
    catch(err){
        res.sendStatus(500);
    }
})

router.get('/images', async (req,res)=>{
    const { iteneraryID,number=0 }= req.query;
    const NUMBER_OF_IMAGES= 6;
    try{
        const images= await getImages(iteneraryID,NUMBER_OF_IMAGES,number);
        res.status(200).json(images);
    }
    catch(err){
        res.sendStatus(500);
    }
})


router.get('/itenerary', async (req,res)=>{
    const {iteneraryID}= req.query;
    let response= {}

    try{
        const itenerary = await getItenerary(iteneraryID);
        if(itenerary===null){
            res.status(404).send('Itenerary Not Found');
            return;
        }
        const places= await getIteneraryPlaces(iteneraryID);
        const response= {itenerary,places};
        res.status(200).json(response);
    }
    catch(err){
        res.sendStatus(500);
    }
});


module.exports= router;



