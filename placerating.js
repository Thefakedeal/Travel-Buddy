const express= require('express');
const router = express.Router();
const sqlQuery= require('./sqlwrapper');
const uuid= require('uuid');

function logincheck(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        res.status(403).send("You must be logged in first.");
    }

}


router.post('/vote',logincheck, (req,res)=>{
    const {likes, placeID} = req.body;
    userID = req.session.user;
    ratingID= uuid.v4();

    let vote=0;
    if(likes<=-1) vote=-1;
    else if(likes>=1) vote=1;

    query= `INSERT INTO placeRating(ratingID, placeID, userID, likes) VALUES(?,?,?,?)`;

    sqlQuery(query,[ratingID,placeID,userID,vote])
        .catch(err=>{
            return sqlQuery('UPDATE placeRating SET likes=? WHERE placeID=? AND userID=?', [vote,placeID,userID])
        })
        .finally(()=>{
            updateRank(placeID);    
        })
        .catch(err=>{
                console.log(err);
        })        
    
});

router.post('/comment',logincheck, (req,res)=>{

    const {comment, placeID} = req.body;
    const userID = req.session.user;
    const ratingID= uuid.v4();

    let query= 'INSERT INTO placeRating(ratingID, placeID, userID, comment) VALUES(?,?,?,?)';
    sqlQuery(query,[ratingID,placeID,userID,comment])
        .then((result)=>{
            res.status(201).send('Comment Added');
        })
        .catch(err=>{
            return sqlQuery('UPDATE placeRating SET comment=? WHERE placeID=? AND userID=?',[comment,placeID,userID]);
        })
        .then((result)=>{
            res.status(200).send('Comment Succesful');
        })
        .catch((err)=>{
            res.status(500).send("Something Wrong happened")
            console.log(err);
        })
    
});


router.get('/comments', async (req,res)=>{
    const {placeID}= req.query;
    sqlQuery('SELECT placeRating.userID, users.name,placeRating.comment FROM placeRating INNER JOIN users ON placeRating.userID= users.userID WHERE (placeRating.placeID=? AND comment IS NOT NULL)',placeID)
        .then(result=>{
            res.status(200).json(result);
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).send('Something went wrong');
        })

})

router.get('/likes', (req,res)=>{
    const {placeID}= req.query;
    sqlQuery('SELECT likes FROM placeRating WHERE placeID=?',placeID)
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

router.get('/myrating',logincheck, (req,res)=>{
    const {placeID}= req.query;
    const userID= req.session.user;
    sqlQuery('SELECT likes,comment FROM placeRating WHERE placeID=? AND userID=?',[placeID,userID])
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

function updateRank(placeID) {
    sqlQuery('SELECT likes FROM placeRating WHERE placeID=?', placeID)
        .then((votes) => {
            const rank = votes.reduce((rank, vote) => {
                return rank = rank + vote.likes;
            }, 0);
            sqlQuery('UPDATE places SET rank=? WHERE placeID=?', [rank, placeID]);
        });
}
