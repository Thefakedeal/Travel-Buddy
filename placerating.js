const express= require('express');
const router = express.Router();
const sqlQuery= require('./sqlwrapper');
const {getVotes, getComments, setMyVote, updateRank, setMyComment,getMyRatings } = require('./places_functions');

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
    const userID = req.session.user;
    
    let vote=0;
    if(likes<=-1) vote=-1;
    else if(likes>=1) vote=1;
    
    try{
        if(! await setMyVote(placeID, userID, vote)){
            res.sendStatus(500);
            return;
        } 
        res.sendStatus(200);
        updateRank(placeID);
    }
    catch(err){
        console.log(err);
    }
    
});

router.post('/comment',logincheck, async (req,res)=>{

    const {comment, placeID} = req.body;
    const userID = req.session.user;
    try{
        if( await setMyComment(placeID,userID,comment) ){
            res.status(200).send();
            return;
        }
        res.sendStatus(500);
    }
    catch(err){
        res.sendStatus(500);
    }
});   


router.get('/comments', async (req,res)=>{
    const {placeID}= req.query;
    try{
        const comments= await getComments(placeID);
        res.status(200).json(comments);
    }
    catch(err){
        console.log(err)
        res.sendStatus(500);
    }

})

router.get('/likes', async (req,res)=>{
    const {placeID}= req.query;
    try
    {
        const ratio= await getVotes(placeID);
        if(ratio===null){
            res.status(200).json({likes:0,dislikes:0});
            return;
        }
        res.status(200).json(ratio);
    }
    catch(err){
        res.sendStatus(500);
    }
})


router.get('/myrating',logincheck, async (req,res)=>{
    const {placeID}= req.query;
    const userID= req.session.user;
    try{
        const myRatings= await getMyRatings(placeID,userID);
        res.status(200).json(myRatings);
    }
    catch(err){
        console.log(err);
        res.status(200).json({likes:0,comment:null});
    }
    }
);


module.exports= router;


