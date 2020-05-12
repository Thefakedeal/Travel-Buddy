const express= require('express');
const router = express.Router();
const sqlQuery= require('./sqlwrapper');

router.get('/', (req,res)=>{
    let {lat, lon} = req.query;
    lat= parseFloat(lat).toFixed(4);
    lon= parseFloat(lon).toFixed(4);
    let minlat= parseFloat(lat) - 0.02;
    let maxlat= parseFloat(lat) + 0.02;
    let minlon= parseFloat(lon) - 0.02;
    let maxlon= parseFloat(lon) + 0.02;


    sqlQuery('SELECT routeID, name FROM routes WHERE routeID IN (SELECT DISTINCT routeID FROM routeplaces WHERE (lat BETWEEN ? AND ?) AND (lon BETWEEN ? AND ?)) ORDER BY rank DESC', [minlat,maxlat,minlon,maxlon])
        .then((result)=>{
            res.status(200).json(result);
        })
        .catch(err=>{
            res.sendStatus(500);
        })
})

router.get('/images', (req,res)=>{
    const { iteneraryID,number=0 }= req.query;
    offset= number * 6;
    sqlQuery('SELECT * from routeimage WHERE routeID=? LIMIT 6 OFFSET ?',[iteneraryID,offset])
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


router.get('/itenerary', (req,res)=>{
    const {iteneraryID}= req.query;
    let response= {}

    sqlQuery('SELECT * from routes WHERE routeID=? LIMIT 1',iteneraryID)
        .then(result=>{
            if(result.length !== 0)
            {
                response.itenerary = result[0];
                return sqlQuery('SELECT * FROM routeplaces where routeID=? LIMIT 10',iteneraryID)
                    
            }
            else{
                res.status(404).send("Route Doesn't exist")
                return 0;
            } 
        })
        .then((result)=>{
            if(result!==0){
                response.places= result;
                res.status(200).json(response);
            }
        }) 
        .catch(err=>{
            console.log(err);
            res.status(500).send("Sorry! Cant Fetch Place.")
        })
        
    
});


module.exports= router;



