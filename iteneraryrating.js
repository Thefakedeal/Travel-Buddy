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
    const {likes, routeID} = req.body;
    userID = req.session.user;
    query= `UPDATE routeratings.?? SET likes= ? WHERE userID=?`;
   

    try
    {
        const result= await  sqlQuery(query,[routeID,likes, userID]);
        if(result.affectedRows===0){
            if(parseInt(likes)===1){
                ratingquery= 'UPDATE routes SET rank= rank + 1 WHERE routeID=? ';
            }
            else{
                ratingquery= 'UPDATE routes SET rank= rank - 1 WHERE routeID=?';
            }
            const success= await sqlQuery(ratingquery,routeID)
            if(success){
                if(result.affectedRows===0){
                        query= 'INSERT INTO routeratings.?? ( likes, userID ) VALUES (?,?)'
                        await sqlQuery(query,[routeID,likes, userID ])
                    }
            }    
        }
        else if(result.changedRows!==0){
            if(parseInt(likes)===1){
                ratingquery= 'UPDATE routes SET rank= rank + 2 WHERE routeID=?';
            }
            else{
                ratingquery= 'UPDATE routes SET rank= rank - 2 WHERE routeID=?';
            }
            await sqlQuery(ratingquery,routeID);
        }

    }
    catch(error)
    {
        console.log(err)
    }

    // sqlQuery(query,[routeID,likes, userID])
    //     .then(result=>{
    //         if(result.affectedRows===0){
    //             if(parseInt(likes)===1){
    //                 ratingquery= 'UPDATE routes SET rank= rank + 1 WHERE routeID=? ';
    //             }
    //             else{
    //                 ratingquery= 'UPDATE routes SET rank= rank - 1 WHERE routeID=?';
    //             }
    //             sqlQuery(ratingquery,routeID)
    //             .then((res)=>{
    //                 if(result.affectedRows===0){
    //                     query= 'INSERT INTO routeratings.?? ( likes, userID ) VALUES (?,?)'
    //                     sqlQuery(query,[routeID,likes, userID ])
    //                 }
    //             })
    //         }
    //         else if(result.changedRows!==0){
    //             if(parseInt(likes)===1){
    //                 ratingquery= 'UPDATE routes SET rank= rank + 2 WHERE routeID=?';
    //             }
    //             else{
    //                 ratingquery= 'UPDATE routes SET rank= rank - 2 WHERE routeID=?';
    //             }
    //             sqlQuery(ratingquery,routeID);

    //         }
            
    //     })
    //     .catch((err)=>{
    //         console.log(err);
    //     })
    
});

router.post('/comment',logincheck, (req,res)=>{
    const {comment, routeID} = req.body;
    userID = req.session.user;
    name = req.session.name;
    query= `UPDATE routeratings.?? SET comment= ?, name=? WHERE userID=?`;
    sqlQuery(query,[routeID,comment,name, userID])
        .then(result=>{ 
            if(result.affectedRows===0){
                query= 'INSERT INTO routeratings.?? ( comment, userID, name) VALUES (?,?,?)'
                return sqlQuery(query,[routeID,comment, userID, name])
            }
            else{
                res.status(200).send('Comment Edited');
                return 0;
            }
        })
        .then(result=>{
            if(result!==0)
            return res.status(200).send('Comment Added');
        })
        .catch((err)=>{
            console.log(err);
            res.status(500).send("Something Wrong happened")
        })
    
});

router.get('/likes', (req,res)=>{
    const {iteneraryID}= req.query;
    sqlQuery('SELECT COUNT(1) FROM routeratings.?? WHERE likes=1',iteneraryID)
    .then((result)=>{
        likes= result[0]['COUNT(1)'];
        return sqlQuery('SELECT COUNT(1) FROM routeratings.?? WHERE likes=-1',iteneraryID)   
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

router.get('/comments', async (req,res)=>{
    const {iteneraryID}= req.query;
    sqlQuery('SELECT userID, name, comment FROM routeratings.?? WHERE comment IS NOT NULL',iteneraryID)
        .then((result)=>{
                    
            res.status(200).json(result);
        })
        .catch((err)=>{
            res.status(500).send('Something went wrong');
        })
        
})

router.get('/myrating',logincheck, (req,res)=>{
    const {iteneraryID}= req.query;
    const userID= req.session.user;
    sqlQuery('SELECT likes,comment FROM routeratings.?? WHERE userID=?',[iteneraryID,userID])
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