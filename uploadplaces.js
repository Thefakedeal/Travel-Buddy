const express = require('express');
const { savePhotos } = require('./savePhotos.js');
const values = require('./variables.json');
const { addPlace, addImagesToPlaceDatabase } = require('./places_functions');

const router= express.Router();



const accepted_catagory= values.catagories;

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send("You must be logged in first.");
    }

}






router.post('/', logincheck, async (req,res)=>{
  
    const {name, description, lat, lon, catagory} = req.body;
    const userID= req.session.user;

    if(accepted_catagory.includes(catagory)){
        try{
            const placeID= await addPlace(name,description,lat,lon,catagory,userID);
            if(!placeID){
                res.sendStatus(500);
                return;
            }
            if(req.files!==null){
                const savedPhotosIDs = await savePhotos(req.files);
                const photosAdded= await addImagesToPlaceDatabase(placeID,userID, savedPhotosIDs);
                if(photosAdded){
                    console.log(`${savedPhotosIDs.length} ptotos added`)
                }
                else{
                    console.log('Failed To Add Photos')
                }
            }
            res.status(200).send(placeID);
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        res.status(403).send(`${catagory} is unsupported`);
    }
    

})


router.post('/photos',logincheck, async (req,res)=>{
    const { placeID }= req.body;
    const userID= req.session.user;
    if(!(req.files && placeID)){
        res.status(404).send('No Photos Found');
        return;
    }
    try{
        const savedPhotosIDs = await savePhotos(req.files);
        const photosAdded= await addImagesToPlaceDatabase(placeID,userID, savedPhotosIDs);
        const numOfPhotosAdded= savedPhotosIDs.length;
        if(numOfPhotosAdded===0 || !(photosAdded)){
            res.status(500).send('Something Went Wrong');
            return;
        }
        res.status(200).send(`${numOfPhotosAdded} Photo(s) Uploaded`);
    }
    catch(err){
        res.status(500).send('Something Went Wrong');
    }
})

module.exports=router