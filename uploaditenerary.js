const express = require('express');
const uuid= require('uuid');
const sharp= require('sharp');
const sqlQuery= require('./sqlwrapper');
const values = require('./variables.json');
const router= express.Router();
const { addItenerary, addImagesToIteneraryDatabase } = require('./itenerary_functions');
const { savePhotos }= require('./savePhotos');

const acceptedFileTypes= values.fileTypes;

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send("You must be logged in first.");
    }

}

 

router.post('/', logincheck, async (req,res)=>{
    const {name, description, places}= req.body;
    const userID= req.session.user;
    const placesToAdd= JSON.parse(places);
    
    if(placesToAdd.length>10 && Array.isArray(placesToAdd)){
        res.status(403).send("Only Upto 10 places Allowed.");
        return;
    }

    try{
        const iteneraryID= await addItenerary(name,description,userID,placesToAdd);
        if(iteneraryID===null){
            res.sendStatus(500);
            return;
        }
        if(req.files!==null){
            const imageIDarrays= await savePhotos(req.files);
            const photosSaved= await addImagesToIteneraryDatabase(iteneraryID,userID,imageIDarrays);
            if(photosSaved){
                console.log(`${imageIDarrays.length} photos saved`);
            }
            else{
                console.log('Failed To Add Photos')
            }
        }
        res.status(200).send(iteneraryID);
    } 
    catch(err){
        res.sendStatus(500);
    }
})


router.post('/photos',logincheck, async (req,res)=>{
    const { iteneraryID }= req.body;
    const userID= req.session.user;
    if(!(req.files && iteneraryID)){
        res.status(500).send("No photos");
       return;
    }
    try{
        const imageIDarrays= await savePhotos(req.files);
        const photosSaved= await addImagesToIteneraryDatabase(iteneraryID,userID,imageIDarrays);
        const numofPhotosAdded= imageIDarrays.length;
        if(!photosSaved || numofPhotosAdded===0 ) 
        {
            res.status(500).send('Something Went Wrong');
            return;
        }
        res.status(200).send(`${numofPhotosAdded} photos Added`)
    }
    catch(err){
        res.status(500).send('Something Went Wrong');
    }
})



module.exports= router;