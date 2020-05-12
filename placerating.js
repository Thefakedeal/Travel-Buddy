const express= require('express');
const router = express.Router();
const sqlQuery= require('./sqlwrapper');

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send("You must be logged in first.");
    }

}


router.post('/vote',logincheck, async (req,res)=>{
    const {likes, placeID} = req.body;
    userID = req.session.user;
    query= `UPDATE places.?? SET likes= ? WHERE userID=?`;

    try{
        const result= await sqlQuery(query,[placeID,likes, userID]);
        if(result.affectedRows===0){
            if(parseInt(likes)===1){
                ratingquery= 'UPDATE places SET rank= rank + 1 WHERE id=?';
            }
            else{
                ratingquery= 'UPDATE places SET rank= rank - 1 WHERE id=?';
            }
            const success= await sqlQuery(ratingquery, placeID)
            if(success){
                if(result.affectedRows===0)
                {
                    query= 'INSERT INTO places.?? ( likes, userID ) VALUES (?,?)'
                    await sqlQuery(query,[placeID,likes, userID ])
                }
            }
               
        }
        else if(result.changedRows!==0){
            if(parseInt(likes)===1){
                ratingquery= 'UPDATE places SET rank= rank + 2 WHERE id=?';
            }
            else{
                ratingquery= 'UPDATE places SET rank= rank - 2 WHERE id=?';
            }
            await sqlQuery(ratingquery,placeID);

        }
    }
    catch(error)
    {
        console.log(err)
    }
   
    // sqlQuery(query,[placeID,likes, userID])
    //     .then(result=>{
    //         if(result.affectedRows===0){
    //             if(parseInt(likes)===1){
    //                 ratingquery= 'UPDATE places SET rank= rank + 1 WHERE id=?';
    //             }
    //             else{
    //                 ratingquery= 'UPDATE places SET rank= rank - 1 WHERE id=?';
    //             }
    //             sqlQuery(ratingquery, placeID)
    //             .then((res)=>{
    //                 if(result.affectedRows===0){
    //                     query= 'INSERT INTO places.?? ( likes, userID ) VALUES (?,?)'
    //                     sqlQuery(query,[placeID,likes, userID ])
    //                 }
    //             })
    //         }
    //         else if(result.changedRows!==0){
    //             if(parseInt(likes)===1){
    //                 ratingquery= 'UPDATE places SET rank= rank + 2 WHERE id=?';
    //             }
    //             else{
    //                 ratingquery= 'UPDATE places SET rank= rank - 2 WHERE id=?';
    //             }
    //             sqlQuery(ratingquery,placeID);

    //         }
            
    //     })
    //     .catch((err)=>{
    //         console.log(err);
    //     })
    
});

router.post('/comment',logincheck, (req,res)=>{

    const {comment, placeID} = req.body;
    userID = req.session.user;
    name = req.session.name;
    query= `UPDATE places.?? SET comment= ?, name=? WHERE userID=?`;
    sqlQuery(query,[placeID,comment,name, userID])
        .then(result=>{ 
            if(result.affectedRows===0){
                query= 'INSERT INTO places.?? ( comment, userID, name) VALUES (?,?,?)'
                return sqlQuery(query,[placeID,comment, userID, name])
            }
            else{
                res.status(200).send('Comment Edited');
                return 0;
            }
        })
        .then(result=>{
            if(result!==0)
            res.status(200).send('Comment Added');
        })
        .catch((err)=>{
            res.status(500).send("Something Wrong happened")
            console.log(err);
        })
    
});


router.get('/comments', async (req,res)=>{
    const {placeID}= req.query;
    sqlQuery('SELECT userID, name, comment FROM places.?? WHERE comment IS NOT NULL',placeID)
        .then((result)=>{
            
            res.status(200).json(result);
        })
        .catch((err)=>{
            res.status(500).send('Something went wrong');
        })

})

router.get('/likes', (req,res)=>{
    const {placeID}= req.query;
    sqlQuery('SELECT COUNT(1) FROM places.?? WHERE likes=1',placeID)
    .then((result)=>{
        likes= result[0]['COUNT(1)'];
        return sqlQuery('SELECT COUNT(1) FROM places.?? WHERE likes=-1',placeID)    
    })
    .then(result=>{
        dislikes= result[0]['COUNT(1)'];
        ratio= {likes:likes, dislikes:dislikes}
        res.status(200).json(ratio);
    })
    .catch((err)=>{
         res.status(500).send('Something went wrong');
    })
})

router.get('/myrating',logincheck, (req,res)=>{
    const {placeID}= req.query;
    const userID= req.session.user;
    sqlQuery('SELECT likes,comment FROM places.?? WHERE userID=?',[placeID,userID])
        .then((result)=>{
            if(result.length===0){
                res.status(404).send("No Review")
            }
            else{
                res.status(200).json(result);
            }
        })
        .catch((err)=>{
            res.status(500).send("Something went wrong")
         })
    }
);


module.exports= router;