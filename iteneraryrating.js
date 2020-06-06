const express= require('express');
const router = express.Router();
const uuid= require('uuid');
const sqlQuery= require('./sqlwrapper');
const {setMyVote, updateRank, getVotes, getComments, setMyComment, getMyRating}= require('./itenerary_functions')


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
    const userID = req.session.user;
    
    let vote=0;
    if(likes<=-1) vote=-1;
    else if(likes>=1) vote=1;
    
    try{
        if(!await setMyVote(iteneraryID,userID,vote)){
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
        updateRank(iteneraryID);
    }
    catch(err){
        res.sendStatus(500);
    }
});
 
router.post('/comment',logincheck, async (req,res)=>{
    const {comment, iteneraryID} = req.body;
    const userID = req.session.user;
    try{
        if(await setMyComment(iteneraryID,userID,comment)) {
            res.sendStatus(200);
            return;
        }
        res.sendStatus(500);
    }
    catch(err){
        res.sendStatus(500)
    }
    
});

router.get('/likes', async (req,res)=>{
    const {iteneraryID}= req.query;
    try{
        const ratio = await getVotes(iteneraryID);
        res.status(200).json(ratio);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

router.get('/comments',  async (req,res)=>{
    const {iteneraryID}= req.query;
    try{
        const comments= await getComments(iteneraryID);
        res.status(200).json(comments);
    }
    catch(err){
        res.sendStatus(500);
    }
        
})

router.get('/myrating',logincheck, async (req,res)=>{
    const {iteneraryID}= req.query;
    const userID= req.session.user;
    try{
        const myRating= await getMyRating(iteneraryID,userID);
        res.status(200).json(myRating)
    }
    catch(err){
        res.status(200).json({likes:0,comment:null});
    }
}
);



module.exports= router;

