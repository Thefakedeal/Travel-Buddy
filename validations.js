function isEmailValid(email) {
    const validEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
    try{
        return validEmail.test(email.toLowerCase())
    }
    catch(err){
        return false
    }
}

function isPasswordValid(password) {
    const validPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    try{
        return validPassword.test(password)
    }
    catch(err){
        return false
    }
}

function emailPasswordValidation(email, password) {
    let errors = [];
    if (!isEmailValid(email)) {
        errors = [...errors, "Invalid Email"];
    }
    if (!isPasswordValid(password)) {
        errors = [...errors, "Invalid Password"];
    }
    return errors;
}

exports.emailPasswordValidation= emailPasswordValidation;