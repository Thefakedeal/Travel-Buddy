const express = require('express');
const uuid= require('uuid');
const sharp= require('sharp');
const sqlQuery= require('./sqlwrapper');
const values = require('./variables.json');
const { addPlace, addImagesToPlaceDatabase } = require('./places_functions');

const router= express.Router();


const acceptedFileTypes= values.fileTypes;
const accepted_catagory= values.catagories;

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send("You must be logged in first.");
    }

}


function reduceImgSizeAndConvertToJpeg(image) {
    imageID = uuid.v4()
    randomstringpath = `images/${imageID}.jpeg`;

    return new Promise((resolve, reject) => {
        sharp(image.data)
            .resize(400, 400, {
                fit: "inside"
            })
            .toFile(`${randomstringpath}`, (err, info) => {
                if (err) reject();
                resolve(imageID);
            });
    })
}


async function savePhotos(file_array){
    let imageIDArrays=[];

    for(image in file_array){
        if(file_array[image].size <= (1024*1024*2))
        {   
            const filetype= (file_array[image].name).split('.').pop();

            if(acceptedFileTypes.includes(filetype)){
                    try{
                        const imageID= await reduceImgSizeAndConvertToJpeg(file_array[image]);
                        imageIDArrays= [...imageIDArrays,imageID];
                    }
                    catch(err){
                        continue;
                    }   
                }   
        }
    }

   return imageIDArrays;
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
            if(req.files===null){
                res.status(200).send(placeID);
                return;
            }
            const savedPhotosIDs = await savePhotos(req.files);
            const photosAdded= await addImagesToPlaceDatabase(placeID,userID, savedPhotosIDs);
            res.status(200).send(placeID);
            let numOfPhotosAdded= 0;
            if(photosAdded) numOfPhotosAdded= savedPhotosIDs.length;
            console.log(`${numOfPhotosAdded} photos Added for, placeID: ${placeID}`);
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