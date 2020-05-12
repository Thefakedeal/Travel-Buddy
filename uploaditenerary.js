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

    sqlQuery('INSERT INTO routeimage(imageID,routeID) values?', [imageDetails])
        .catch(err=> console.log(err))

    return flag;
}


router.post('/', logincheck, (req,res)=>{
    let {name, description, places}= req.body;
    const userID= req.session.user;
    const routeID= uuid.v4();
    let insertplaces=[]
    places= JSON.parse(places);
    if(places.length>10 && Array.isArray(places)){
        res.status(403).send("Only Upto 10 places Allowed.");
        return;
    }
    
    places.forEach(({name, lat, lon})=> {
        insertplaces= [...insertplaces,[uuid.v4(),routeID,name, parseFloat(lat).toFixed(5),parseFloat(lon).toFixed(5)]];
    });

    sqlQuery('INSERT INTO routes(routeID, name, userID, description) VALUES(?,?,?,?)',[routeID,name,userID,description])
        .then((result)=>{
            query=`CREATE TABLE routeratings.?? (userID VARCHAR(36) NOT NULL, name VARCHAR(36) NULL, likes BOOLEAN NULL, comment TEXT NULL, PRIMARY KEY(userID), FOREIGN KEY(userID) REFERENCES travelbuddydb.users(userID) ON DELETE CASCADE)`;
            return sqlQuery(query, routeID)
        })
        .then((result)=>{
            return sqlQuery('INSERT INTO routeplaces(placeID,routeID,name,lat,lon) VALUES ?',[insertplaces])
               
        })
        .then((result)=>{
            if(req.files){
                flag= savePhotos(req.files, routeID);
                if(flag==='fail'){
                    throw new Error(flag);
                }
            }
            res.status(201).send(routeID);
        })
        .catch((err)=>{
            sqlQuery('DELETE FROM routes WHERE routeID=?',routeID);
            sqlQuery('DROP TABLE routeratings.??', routeID);
            console.log(err);
            res.status(500).send('Some Thing Went Wrong');
        })
     
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



module.exports= router;