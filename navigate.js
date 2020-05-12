const express= require('express');
const fetch= require('node-fetch');
const sqlQuery= require('./sqlwrapper');
const optimalRoute= require('./optimalRoute')
const router= express.Router();
function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send('You Must Be Logged in For This Feature');
    }

}

router.get('/place',logincheck, (req,res)=>{
    let {mylat, mylon, placeID} = req.query;
    mylat= parseFloat(mylat).toFixed(4);
    mylon= parseFloat(mylon).toFixed(4);

    sqlQuery('SELECT * FROM places WHERE id=? LIMIT 1',placeID)
        .then(result=>{
            const {lat,lon}= result[0];
            return fetch(`http://localhost:5000/route/v1/foot/${mylon},${mylat};${lon},${lat}?geometries=geojson&continue_straight=false`)
        })
        .then((line)=>{
            return line.json()
        })
        .then((data)=>{
            coordinates= data.routes[0].geometry.coordinates;
            
            res.status(200).json(coordinates);
        })
        .catch(err=>{
            res.status(500).send("Couldn't generate Navigation");
        })

})

router.get('/itenerary',(req,res)=>{
    const {iteneraryID, mylat,mylon}= req.query;
    mylatitude= parseFloat(mylat).toFixed(4);
    mylongitude= parseFloat(mylon).toFixed(4);
    myplace={
        lat: mylatitude,
        lon: mylongitude
    }
    sqlQuery('SELECT * FROM routeplaces WHERE routeID=?', iteneraryID)
        .then((result)=>{
            return optimalRoute(result,myplace)
        })
        .then((places)=>{
            coordinates= places.reduce((coordinates,place)=>{
                return coordinates + `${place.lon},${place.lat};`
            },"");
            coordinates= coordinates + `${myplace.lon},${myplace.lat};`;
            coordinates= coordinates.slice(0,-1);
            return fetch(`http://localhost:5000/route/v1/foot/${coordinates}?geometries=geojson&continue_straight=false`)
        })
        .then((line)=>{
            return line.json()

        })
        .then((data)=>{
            coordinates= data.routes[0].geometry.coordinates;
            res.status(200).json(coordinates);
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).send("Navigation Failed");
        });
})

module.exports= router;