const { setDistance } = require("./setDistance");
const { getPlaces,getPlacesByCatagory, getPlace, getImages } = require('./places_functions.js');
const { getMinMaxLatitudeLongitude }= require('./location.js')
const express= require('express');
const router = express.Router();
const variables= require('./variables.json')

// Accepted Catagories- All the Catagories Of Places available
const accepted_catagory= variables.catagories;


router.get('/', async (req,res)=>{
    const {lat, lon, catagory='all'} = req.query;

    if(!(accepted_catagory.includes(catagory) || catagory==='all')){
        res.sendStatus(400);
        return;
    }

    const [minlat,maxlat,minlon,maxlon]= getMinMaxLatitudeLongitude(lat,lon,0.02);

    let places= [];

    try{
        if(catagory==='all'){
            places= await getPlaces(minlat,minlon,maxlat,maxlon);
        }
        else{
            places= await getPlacesByCatagory(minlat,minlon,maxlat,maxlon,catagory);
        }
        const placesWithDistance= await setDistance(places,lat,lon);
        res.status(200).json(placesWithDistance);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});


router.get('/catagories', (req,res)=>{
    res.status(200).json(accepted_catagory);
})

router.get('/place', async (req,res)=>{
    const {placeID}= req.query;
    try{
        const place= await getPlace(placeID);
        if(place===null){
            res.status(404).send('Place Not Found');
            return;
        }
        res.status(200).send(place);
    }
    catch(err){
        res.status(500).send('Something Went Wrong');
        console.log(err);
    }
});


router.get('/images', async (req,res)=>{
    const {placeID,num=0}= req.query;
    const NUMBER_OF_IMAGES= 6;
    try{
        const images= await getImages(placeID, NUMBER_OF_IMAGES,num);
        res.status(200).json(images);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports= router;