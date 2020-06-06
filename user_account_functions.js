const uuid= require('uuid');
const bcrypt= require('bcrypt');
const sqlQuery= require('./sqlwrapper');

function createHashedPasswordWithSalt(password,saltLength){
    return new Promise((resolve,reject)=>{
        bcrypt.hash(password,saltLength,(err,hash)=>{
            if(err){
                reject(err.message)
            }
            else{
                resolve(hash)
            }
        })
    })
}

async function createAccount(name,email,password){
    const userID= uuid.v4();
    const saltLength=10;
    try{
        const hashedPassword = await createHashedPasswordWithSalt(password,saltLength);
        await sqlQuery(`INSERT INTO users (userID, email, name, password) VALUES (?,?,?,?)`,
        [userID, email, name, hashedPassword])
        return userID;
    }
    catch(err){
        console.log(err);
        return null;
    }
}

async function isEmailInUse(email){
    const err= true
    const noerr= false
    try{
        const usedEmail = await sqlQuery('SELECT 1 FROM users where email=?',email);
        if(usedEmail.length === 0) return [false,noerr];
        return [true,noerr];
    }
    catch(err){
        return [false,noerr]
    }
}

async function accountLogin(email,password){
    try{
        const [userID,hashedPassword] = await getUserIDAndPassword(email)
        if(userID === null){
            return [null,"User Doesn't Exist"]
        }
        const isValidPassword= await comparePasswordWithHashedPassword(password,hashedPassword)
        if(isValidPassword) return [userID,null]
        return [null,"Invalid Password"]
    }
    catch(err){
        return [null,null]
    }
}

async function getUserIDAndPassword(email){
    try{
        const result= await sqlQuery("SELECT * FROM users WHERE email=? LIMIT 1", email);
        if(result.length === 0){
            return [null,null]
        }
        return [result[0].userID,result[0].password]
    }
    catch(err){
        return [null,null]
    }
}

async function comparePasswordWithHashedPassword(password,hashedPassword){
    return new Promise((resolve,reject)=>{
        bcrypt.compare(password, hashedPassword,(err,isSame)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(isSame)
            }
        })
    })
}

exports.createAccount= createAccount;
exports.isEmailInUse = isEmailInUse;
exports.accountLogin= accountLogin;