const express = require('express');
const uuid= require('uuid');
const sharp= require('sharp');
const sqlQuery= require('./sqlwrapper');
const values = require('./variables.json');
const router= express.Router();


const acceptedFileTypes= values.fileTypes;

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

function savePhotos(file_array, iteneraryID, userID){
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

                            imageDetails= [...imageDetails, [imageID, iteneraryID, userID]]
                        }
                    }
                }   
        }
    }
 
    sqlQuery('INSERT INTO iteneraryphotos(imageID,iteneraryID, userID) values?', [imageDetails])
        .catch(err=> console.log(err))

    return flag;
}


router.post('/', logincheck, (req,res)=>{
    let {name, description, places}= req.body;
    const userID= req.session.user;
    const iteneraryID= uuid.v4();
    let insertplaces=[]
    places= JSON.parse(places);
    if(places.length>10 && Array.isArray(places)){
        res.status(403).send("Only Upto 10 places Allowed.");
        return;
    }
    
    places.forEach(({name, lat, lon})=> {
        insertplaces= [...insertplaces,[uuid.v4(),iteneraryID,name, parseFloat(lat).toPrecision(8),parseFloat(lon).toPrecision(8)]];
    });

    sqlQuery('INSERT INTO itenerary(iteneraryID, name,description, userID) VALUES(?,?,?,?)',[iteneraryID,name,description,userID])
        .then((result)=>{
            return sqlQuery('INSERT INTO iteneraryPlaces(placeID,iteneraryID,name,lat,lon) VALUES ?',[insertplaces])    
        })
        .then((result)=>{
            if(req.files){
                flag= savePhotos(req.files, iteneraryID,userID);
                if(flag==='fail'){
                    throw new Error(flag);
                }
            }
            res.status(201).send(iteneraryID);
        })
        .catch((err)=>{
            sqlQuery('DELETE FROM itenerary WHERE iteneraryID=?',iteneraryID);
            console.log(err);
            res.status(500).send('Some Thing Went Wrong');
        })
     
})


router.post('/photos',logincheck, (req,res)=>{
    let { iteneraryID }= req.body;
    if(Array.isArray(iteneraryID)){
        iteneraryID= iteneraryID[0];
    }
    const userID= req.session.user;
    if(req.files && iteneraryID){
        message= savePhotos(req.files, iteneraryID,userID)
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



module.exports= router;