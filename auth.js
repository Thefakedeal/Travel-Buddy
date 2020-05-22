 const express= require('express');
 const session= require('express-session');
 const bcrypt= require('bcrypt');
 const uuid= require('uuid');
 const router= express.Router();
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


router.post('/login', (req,res)=>{
    const{email, password}=req.body;
    sqlQuery("SELECT * FROM users WHERE email=? LIMIT 1", email)
        .then((result)=>{
            if( result.length=== 0){
                res.status(404).send("No Such User exists");
            }
            else{
                // Comparing Password with hashed password
                bcrypt.compare(password, result[0].password,(err,compareResult)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send("Something went Wrong");
                    }
                    else{
                        if(compareResult){
                            sess= req.session;
                            sess.user= result[0].userID;
                            sess.name= result[0].name;
                            res.status(200).redirect('/');
                        }
                        else{
                            res.status(403).send("Password Doesnt Match");
                        }
                    }
                })
            }
        })
        .catch((err)=>{
            console.log(err);
            res.status(500).send("Something went Wrong");
        })

});

router.get('/signup', (req,res)=>{
    res.sendFile(__dirname + '/Static' + '/signup.html')
});


router.post('/signup', (req,res)=>{
    const {email, name, password}= req.body;
    const userID= uuid.v4();

    sqlQuery('SELECT 1 FROM users where email=?',email)
        .then((result)=>{
            // If Email isn't in database, we can create the user
            if(result.length===0){
                const sql= 'INSERT INTO users (userID, email, name, password) VALUES (?,?,?,?)';
                const saltLength=10;
                bcrypt.hash(password,saltLength,(err,hash)=>{
                    if(err){
                        throw new Error(err);
                    }
                    else{
                        return sqlQuery(sql,[userID,email,name,hash])
                    }
                });
            }
            // If Email is in database
            else{
                res.status(403).send("The Email is already in use. Please Use a different Email");
                return 0;
            }
        })
        .then((result)=>{
            if(result!==0){

                req.session.user= userID;
                res.status(200).redirect('/');
            }
        })
        .catch((err)=>{
            console.log(err);
            res.status(500).send("Some Problem Occured Try again Later");
        })
});

router.post('/logout', (req,res)=>{
    // Logout Only if User is already logged in.
    if(req.session.user){
        req.session.destroy();
        res.clearCookie(sessionName);
    }
    else{
        res.status(403).send("Not Logged in to logout")
    }
})

 module.exports= router;