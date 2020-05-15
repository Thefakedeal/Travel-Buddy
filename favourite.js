const express= require('express');
const sqlQuery= require('./sqlwrapper');
const router= express.Router();

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(401).send('You must be logged in.');
    }
}

router.get('/places', logincheck, (req,res)=>{
    const userID= req.session.user;
    sqlQuery('SELECT DISTINCT places.placeID, places.name FROM places INNER JOIN userfavouriteplaces ON places.placeID= userfavouriteplaces.placeID WHERE userfavouriteplaces.userID=?',userID)
        .then(places=>{
            res.status(200).json(places)
        })
        .catch(err=>{
            console.log(err)
            res.sendStatus(500);
        })
})

router.get('/itenerararies', logincheck, (req,res)=>{
    const userID= req.session.user;
    sqlQuery('SELECT DISTINCT itenerary.iteneraryID, itenerary.name FROM itenerary INNER JOIN userfavouriteplaces ON itenerary.placeID= userfavouriteitenerary.placeID WHERE userfavouriteplaces.userID=?',userID)
        .then(itenerary=>{
            res.status(200).json(itenerary)
        })
        .catch(err=>{
            console.log(err)
            res.sendStatus(500);
        })
})

router.post('/place', logincheck, (req,res)=>{
    const { star, placeID}= req.body;
    const userID= req.session.user;
    const favourite= parseInt(star);
    if(favourite===1){
        sqlQuery('INSERT INTO userfavouriteplaces(userID, placeID) VALUES(?,?)',[userID, placeID])
            .catch(err=>{

            })
    }
    else if(favourite===0){
        sqlQuery('DELETE FROM userfavouriteplaces WHERE userID=? AND placeID=?',[userID, placeID])
            .catch(err=>{

            })
    }
    else{
        return;
    }
})

router.post('/itenerary', logincheck, (req,res)=>{
    const { star, iteneraryID}= req.body;
    const userID= req.session.user;
    const favourite= parseInt(star);
    if(favourite===1){
        sqlQuery('INSERT INTO userfavouriteitenerary(userID, iteneraryID) VALUES(?,?)',[userID, iteneraryID])
            .catch(err=>{

            })
    }
    else if(favourite===0){
        sqlQuery('DELETE FROM userfavouriteitenerary WHERE userID=? AND iteneraryID=?',[userID, iteneraryID])
            .catch(err=>{

            })
    }
    else{
        return;
    }
})

router.get('/place', logincheck, (req,res)=>{
    const {placeID} = req.query;
    const userID= req.session.user;
    sqlQuery('SELECT COUNT(1) FROM places INNER JOIN userfavouriteplaces ON places.placeID= userfavouriteplaces.placeID WHERE userfavouriteplaces.userID=? AND userfavouriteplaces.placeID=? LIMIT 1',[userID,placeID])
    .then(result=>{
        if(result[0]['COUNT(1)']==1){
            res.status(200).json({favourite: 1})
        }
        else{
            res.status(200).json({favourite: 0})
        }
        })
        .catch(err=>{
            console.log(err)
            res.sendStatus(500);
        })
})

router.get('/itenerary', logincheck, (req,res)=>{
    const {iteneraryID}= req.query;
    const userID= req.session.user;
    sqlQuery('SELECT COUNT(1) FROM itenerary INNER JOIN userfavouriteitenerary ON itenerary.iteneraryID= userfavouriteitenerary.iteneraryID WHERE userfavouriteitenerary.userID=? AND userfavouriteitenerary.iteneraryID=? LIMIT 1',[userID,iteneraryID])
        .then(result=>{
            if(result[0]['COUNT(1)']==1){
                res.status(200).json({favourite: 1})
            }
            else{
                res.status(200).json({favourite: 0})
            }
        })
        .catch(err=>{
            console.log(err)
            res.sendStatus(500);
        })
})

module.exports= router;