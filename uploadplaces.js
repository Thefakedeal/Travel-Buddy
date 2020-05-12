const express = require('express');
const uuid= require('uuid');
const sharp= require('sharp');
const sqlQuery= require('./sqlwrapper');
const values = require('./variables.json')

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


function reduceImgSizeAndConvertToJpeg(image){
    imageID= uuid.v4()
    randomstringpath= `images/${imageID}.jpeg`
    sharp(image.data)
        .resize(400,400,{fit: "inside"})
            .toFile(`${randomstringpath}`, (err, info) => { 
      if(err){
          return new Error(err);
      }
  });
    return imageID;
}


function savePhotos(file_array, placeID, userID){
    let flag= 'success';
    let imageDetails=[];
    for(image in file_array){
        if(file_array[image].size <= (1024*1024*2))
        {   
            filetype= (file_array[image].name).split('.').pop();

            if(acceptedFileTypes.includes(filetype)){
                    imageID=reduceImgSizeAndConvertToJpeg(file_array[image]);
                    if(typeof(imageID) === typeof(Error)){
                        return flag= 'fail';
                    }
                    else{
                        if(imageID){

                            imageDetails= [...imageDetails, [imageID,placeID,userID]]
                        }
                    }
                }   
        }
    }

    sqlQuery('INSERT INTO placephotos(imageID,placeID,userID) VALUES ?', [imageDetails])
        .catch(err=> console.log(err))

    return flag;
}



router.post('/', logincheck, (req,res)=>{
  
    const {name, description, lat, lon, catagory} = req.body;
    const userID= req.session.user;

    const placeJSON={
        placeID: uuid.v4(),
        name: name,
        catagory: catagory,
        description: description,
        lat: parseFloat(lat).toPrecision(10),
        lon: parseFloat(lon).toPrecision(10),
        userID: userID,
    }
    
    if(accepted_catagory.includes(placeJSON.catagory) )
    {
        sqlQuery('INSERT INTO places SET ?', placeJSON)
            .then(results=>{
                if(req.files){
                    const flag=savePhotos(req.files, placeJSON.placeID, userID);
                    if(flag==='fail'){
                        throw new Error(flag);
                    }
                }
                res.status(200).send(placeJSON.placeID);
            })
            .catch(err=>{
                sqlQuery('DELETE FROM PLACES WHERE id=?',placeJSON.id);
                console.log(err);
                if(err.errno===1062)
                { res.status(403).send('The Given Place Already Exists');}
                else{
                    res.status(500).send('Some Thing Went Wrong')
                 }
            })
            
    }
    else
    {
        res.status(403).send('Catagory Unsupported');
    }
})


router.post('/photos',logincheck, (req,res)=>{
    let { placeID }= req.body;
    const userID= req.session.user;
    if(Array.isArray(placeID)){
        placeID= id[0];
    }
    if(req.files && placeID){
        message= savePhotos(req.files, placeID,userID)
        if(message=== 'fail'){
            res.status(500).send(message);
        }
        else if(message=== 'success'){
            res.status(200).send(message);
        }
    }
   else{
        res.status(500).send("No photos");
   }
})

module.exports=router