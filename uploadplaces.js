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


function savePhotos(file_array, id){
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

                            imageDetails= [...imageDetails, [imageID,id]]
                        }
                    }
                }   
        }
    }

    sqlQuery('INSERT INTO images(imageID,placeID) values?', [imageDetails])
        .catch(err=> console.log(err))

    return flag;
}



router.post('/', logincheck, (req,res)=>{
  
    let {name, description, lat, lon, catagory} = req.body;
    lat= parseFloat(lat).toFixed(5);
    lon= parseFloat(lon).toFixed(5);
     
    placeJSON= {
        name: name,
        description: description,
        lat: lat,
        lon: lon,
        userID: req.session.user,
        catagory: catagory,
    }

    placeJSON.id= uuid.v4();
    
    if(accepted_catagory.includes(placeJSON.catagory) )
    {
        sqlQuery('INSERT INTO places SET ?', placeJSON)
            .then((results)=>{
                query= `CREATE TABLE places.?? (userID VARCHAR(36) NOT NULL, name VARCHAR(36) NULL, likes BOOLEAN NULL, comment TEXT NULL, PRIMARY KEY(userID), FOREIGN KEY(userID) REFERENCES travelbuddydb.users(userID) ON DELETE CASCADE)`;
                return sqlQuery(query, placeJSON.id)
            })
            .then(results=>{
                if(req.files){
                    savePhotos(req.files, placeJSON.id);
                }
                res.status(200).send(placeJSON.id);
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
    let { id }= req.body;
    if(Array.isArray(id)){
        id= id[0];
    }
    if(req.files && id){
        message= savePhotos(req.files, id)
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