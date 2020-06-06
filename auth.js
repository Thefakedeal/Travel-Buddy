 const express= require('express');
 const session= require('express-session');
 const bcrypt= require('bcrypt');
 const uuid= require('uuid');
 const router= express.Router();
 const {emailPasswordValidation}= require('./validations')
 const { createAccount, isEmailInUse, accountLogin} = require('./user_account_functions')
 const sqlQuery= require('./sqlwrapper')


 const days= 86400000;
 const sessionName= 'travelbuddy';

 router.use(session({
     name: sessionName,
     secret: 'secret',
     resave: false,
     saveUninitialized: false,
     cookie:{
         secure:false,
         sameSite: true,
         expires: new Date(Date.now() + (30 * days)),
         maxAge: 30 * days
         
     }
 }))


router.get('/login', (req,res)=>{
    if(req.session.user){
        res.sendFile(__dirname + '/Static' + '/loggedin.html')
    }
    else{
        res.sendFile(__dirname + '/Static' + '/login.html')
    }
});


router.post('/login', async (req,res)=>{
    const{email, password}=req.body;
    const [userID,userErr] = await accountLogin(email, password)
    
    if(userID===null){
        if(userErr===null){
            res.sendStatus(500)
            return;
        }
        res.status(400).send(userErr)
        return;
    }
    req.session.user= userID;
    res.sendStatus(200)
});

router.get('/signup', (req,res)=>{
    res.sendFile(__dirname + '/Static' + '/signup.html')
});


router.post('/signup', async (req,res)=>{
    const {email, name, password}= req.body;
    const errors= emailPasswordValidation(email,password);
    if(errors.length>0){
        res.status(400).json(errors)
        return;
    }

    try{
        const [emailInUse, err] = await isEmailInUse(email)
        if(err){
            res.sendStatus(500)
            return;
        }

        if(emailInUse){
            res.status(400).send("Email Is Already In Use.")
            return;
        }

        const userID = await createAccount(name,email,password)
        if(userID === null) {
            res.sendStatus(500)
            return;
        }
        req.session.user= userID;
        res.sendStatus(200);
    }
    catch(err){
        console.log(err)
        res.sendStatus(500)
    }
});

router.post('/logout', (req,res)=>{
    // Logout Only if User is already logged in.
    if(req.session.user){
        req.session.destroy();
        res.clearCookie(sessionName);
        res.sendStatus(200);
    }
    else{
        res.status(403).send("Not Logged in to logout")
    }
})

 module.exports= router;