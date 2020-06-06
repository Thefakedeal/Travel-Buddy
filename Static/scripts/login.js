const form= document.querySelector(".input");
const p= document.getElementById('message');
const emailElement= document.getElementById('email');
const passwordElement= document.getElementById('password');


form.addEventListener('submit', async e=>{
    e.preventDefault();
    const email= emailElement.value;
    const password= passwordElement.value;

    const credentials={
        email,
        password
    }

    try{
        const login = await startLogin(email, password)
        if(login.success){
            location= '../'
            return
        }
        alert(login.message)
    }
    catch(err){
        alert("Something Went Wrong")
    }
})


async function startLogin(email,password){
    const credentials={
        email,
        password
    }

    const response= await fetch('/login', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    try{
        if(response.ok){
            return {success: true, message:"Login Successful"}
        }
    
        return {success: false, message: await response.text()}
    }
    catch(err){
        return {success: false, message: "Something Went Wrong"}
    }
}