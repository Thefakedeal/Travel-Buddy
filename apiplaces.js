const { setDistance } = require("./setDistance");

const express= require('express');
const router = express.Router();
const sqlQuery= require('./sqlwrapper');
const variables= require('./variables.json')



// Accepted Catagories- All the Catagories Of Places available
const accepted_catagory= variables.catagories;

router.get('/', (req,res)=>{
    let {lat, lon, catagory='all'} = req.query;
    lat= parseFloat(lat).toFixed(4);
    lon= parseFloat(lon).toFixed(4);
    let minlat= parseFloat(lat) - 0.02;
    let maxlat= parseFloat(lat) + 0.02;
    let minlon= parseFloat(lon) - 0.02;
    let maxlon= parseFloat(lon) + 0.02;
    if(accepted_catagory.includes(catagory) || catagory==='all')
    {
        if(catagory==='all'){
            query= 'SELECT * from places WHERE (lat BETWEEN ? AND ?) AND (lon BETWEEN ? AND ?) ORDER BY rank DESC';
            value= [minlat,maxlat,minlon,maxlon];
        }
        else{
            query= 'SELECT * from places WHERE catagory=? AND (lat BETWEEN ? AND ?) AND (lon BETWEEN ? AND ?) ORDER BY rank DESC';
            value= [catagory,minlat,maxlat,minlon,maxlon];
        }
       

        sqlQuery(query,value)
            .then((result)=>{
                return setDistance(result,lat,lon)
            })
            .then((returnedval)=>{
                res.status(200).json(returnedval);
            })
            .catch((err)=>{
                console.log(err);
                res.status(500).send("Something Wrong Happened");
            });
                

    }
    else{
        res.status(404).send("No Result")
    }
});


router.get('/catagories', (req,res)=>{
    res.status(200).json(accepted_catagory);
})

router.get('/place', (req,res)=>{
    const {placeID}= req.query;
    

    sqlQuery('SELECT * from places WHERE placeID=? LIMIT 1',placeID)
        .then(result=>{
            if(result.length !== 0)
            {
                response= result[0];
                res.status(200).json(response);
            }
            else{
                res.status(404).send("Place Doesn't exist")
            } 
        })
        .catch(err=>{
            console.log(err);
            res.status(500).send("Sorry! Cant Fetch Place.")
        })
    
});


router.get('/images', (req,res)=>{
    const {placeID,num=0}= req.query;
    offset= num * 6;
    sqlQuery('SELECT * from placephotos WHERE placeID=? LIMIT 6 OFFSET ?',[placeID,offset])
        .then((result)=>{
            if(result.length !== 0)
            {
                let response=[];
                result.forEach(image => {
                    response= [...response, `img/${image.imageID}.jpeg`];
                });
                res.status(200).json(response);
            }
            else{
                res.status(404).send("Place Doesn't exist")
                
            }
        })
        .catch((err)=>{
            res.status(500).send("Sorry! Cant Fetch Place.")
        });

})



 





module.exports= router;