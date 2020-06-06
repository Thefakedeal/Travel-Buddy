const form= document.querySelector(".input");
const errorMessages= document.getElementById('message');
const emailElement= document.getElementById('email');
const nameElement= document.getElementById('name');
const passwordElement= document.getElementById('password');
const repasswordElement= document.getElementById('repassword');

console.log("Hello World")

form.addEventListener('submit', async e=>{
    e.preventDefault();
    const email= emailElement.value
    const name= nameElement.value
    const password= passwordElement.value
    const repassword= repasswordElement.value
    clearAllErrorMsgs()

    const inputsValid= validateInputsAndDisplayErrors(email,password,repassword)
    if(!inputsValid) return;

    try{
        const signUp = await sendForSignUp(email,name,password)
    
        if(signUp.success){
            location= '../'
            return;
        }
        alert(signUp.message)
    }
    catch(err){
        alert("Something Went Wrong")
    }
})

async function sendForSignUp(email,name,password){
    const credentials={
        email,
        name,
        password
    }
    try{
        const response= await fetch('/signup', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        
        if(response.ok){
            return {success: true, message:"Successful"}
        }
        return {success:false, message: await response.text()}
    }
    catch(err){
        return {success: false, message: "Something Went Wrong"}
    }
}


function validateInputsAndDisplayErrors(email,password,repassword){
    let errors= []
    const emailValid= isEmailValid(email)
    const passwordValid= isPasswordValid(password)
    const repasswordValid= arePasswordsEqual(password,repassword)

    if(!emailValid.valid) emailElement.style.borderColor='red';
    if(!passwordValid.valid) passwordElement.style.borderColor='red';
    if(!repasswordValid.valid) repasswordElement.style.borderColor='red';

    errors= [...emailValid.errors, ...passwordValid.errors,...repasswordValid.errors]
    for (const err of errors) {
        addErrorMessage(err)
    }
    
    return errors.length===0;
}


function isEmailValid(email) {
    const validEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
    const isValid= validEmail.test(email.toLowerCase())
    let errors= []
    if(!isValid) errors= [...errors, "Invalid Email"]
    return {
        valid: isValid,
        errors: errors
    }
}

function isPasswordValid(password) {
    const hasADigit =  /\d/gm
    const hasALetter= /[a-z]/gm
    const hasUpperCaseLetter = /[A-Z]/gm
    let errors= []
    if(!hasADigit.test(password)) errors= [...errors, "Password Must Have Atleast One Digit"]
    if(!hasALetter.test(password)) errors= [...errors, "Password Must Have Atleast One Lowercase letter"]
    if(!hasUpperCaseLetter.test(password)) errors= [...errors, "Password Must Have Atleast One Uppercase Letter"]
    return {
        valid: errors.length==0,
        errors: errors
    }
}


function arePasswordsEqual(password,repassword){
    if(password == repassword)
    {
        return{
            valid: true,
            errors: []
        }
    }
    return{
        valid: false,
        errors: ["Two Passwords Donot Match"]
    }
    
}

function addErrorMessage(message){
    errorMessages.innerHTML += `${message} <br>`;
}

function clearAllErrorMsgs(){
    errorMessages.innerHTML= " ";
    emailElement.style.borderColor= '';
    passwordElement.style.borderColor='';
    repasswordElement.style.borderColor='';

}