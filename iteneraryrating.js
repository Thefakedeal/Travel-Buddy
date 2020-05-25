const express= require('express');
const router = express.Router();
const uuid= require('uuid');
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
    const {likes, iteneraryID} = req.body;
    userID = req.session.user;
    ratingID= uuid.v4();

    let vote=0;
    if(likes<=-1) vote=-1;
    else if(likes>=1) vote=1;

    query= `INSERT INTO iteneraryRating(ratingID, iteneraryID, userID, likes) VALUES(?,?,?,?)`;

    sqlQuery(query,[ratingID,iteneraryID,userID,vote])
        .catch(err=>{
            return sqlQuery('UPDATE iteneraryRating SET likes=? WHERE iteneraryID=? AND userID=?', [vote,iteneraryID,userID])
        })
        .finally(()=>{
            updateRank(iteneraryID);    
        })
        .catch(err=>{
                console.log(err);
        })
});

router.post('/comment',logincheck, (req,res)=>{
    const {comment, iteneraryID} = req.body;
    const userID = req.session.user;
    const ratingID= uuid.v4();
    let query= 'INSERT INTO iteneraryRating(ratingID, iteneraryID, userID, comment) VALUES(?,?,?,?)';
    sqlQuery(query,[ratingID,iteneraryID,userID,comment])
        .then((result)=>{
            res.status(201).send('Comment Added');
        })
        .catch(err=>{
            return sqlQuery('UPDATE iteneraryRating SET comment=? WHERE iteneraryID=? AND userID=?',[comment,iteneraryID,userID]);
        }) 
        .then((result)=>{
            res.status(200).send('Comment Succesful');
        })
        .catch((err)=>{
            res.status(500).send("Something Wrong happened")
            console.log(err);
        })
    
});

router.get('/likes', (req,res)=>{
    const {iteneraryID}= req.query;
    sqlQuery('SELECT likes FROM iteneraryRating WHERE  iteneraryID=?',iteneraryID)
    .then((votes)=>{
        let likes= 0;
        let dislikes= 0;
     for (const vote of votes) {
          if(vote.likes===1)
          {
              likes++;
              continue;
          }
          if(vote.likes===-1){
              dislikes++;
          }
      }
      const ratio= {likes:likes, dislikes:dislikes}
      res.status(200).json(ratio);
    })
})

router.get('/comments',  (req,res)=>{
    const {iteneraryID}= req.query;
    sqlQuery('SELECT iteneraryRating.userID, users.name, iteneraryRating.comment FROM iteneraryRating INNER JOIN users ON iteneraryRating.userID= users.userID WHERE (iteneraryRating.iteneraryID=? AND comment IS NOT NULL)',iteneraryID)
        .then(result=>{
            res.status(200).json(result);
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).send('Something went wrong');
        })
        
})

router.get('/myrating',logincheck, (req,res)=>{
    const {iteneraryID}= req.query;
    const userID= req.session.user;
    sqlQuery('SELECT likes,comment FROM iteneraryRating WHERE iteneraryID=? AND userID=?',[iteneraryID,userID])
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

function updateRank(iteneraryID) {
    sqlQuery('SELECT likes FROM iteneraryRating WHERE  iteneraryID=?', iteneraryID)
        .then((votes) => {
            const rank = votes.reduce((rank, vote) => {
                return rank = rank + vote.likes;
            }, 0);
            sqlQuery('UPDATE itenerary SET rank=? WHERE iteneraryID=?', [rank, iteneraryID]);
        });
}
