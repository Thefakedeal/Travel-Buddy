
//Page Variables
const placeDatatoSend= new FormData() //Consists PlaceData along with image data to send to servert
let marker; //Marker that shows the exact loace of data
let lat, lon; //Latitude and Longitude Data to Be Stored

//HTML ELEMENTS
const file= document.getElementById('file'); //For Uploading Images To the Page
const imageview= document.querySelector('.imageview'); //Div that Shows uploaded Images
const selectCatagory= document.getElementById('catagory'); //Option Selection For catagory
const submitButton= document.getElementById('submit'); //Submit button for Uploading Plac eData
const form= document.getElementById('form'); //For Uploading PlaceData to the Server


//Functions Initialized at the start
submitButton.disabled= true; //Disabled untill Latitude and Longitude is selected
displayCatagories();
setMyLocation();

//Function To Manupulate the display of data
mymap.on('click', e => {
    //Selects the lat and lon of place and shows it in the map
    lat= e.latlng.lat;
    lon= e.latlng.lng;
    submitButton.disabled= false;
    if(marker!== undefined){
        mymap.removeLayer(marker)
    }
    marker= L.marker([lat,lon]).addTo(mymap);
})


function removeImage(image){
    //removes the image selected from display and upload
    image.parentNode.removeChild(image);
    placeDatatoSend.delete(image.id);
}

//Function to display Data
async function displayCatagories(){
    const catagories= await getCatagories();
    selectCatagory.innerHTML= catagories.map(catagory =>{
        return `
        <option value="${catagory}"> ${catagory} </option>
        `
    }).join(' ');
}

function setMyLocation(){
    if(localStorage.getItem('location')){
        const [lat, lon]= JSON.parse(localStorage.getItem('location'));
        const myLatitude= parseFloat(lat);
        const myLongitude= parseFloat(lon);
        mymap.setView([myLatitude,myLongitude], 17);
        return;
    }
    getCurrentLocation()
    .then(myLocation=>{
        const [lat, lon]= myLocation;
        const myLatitude= parseFloat(lat);
        const myLongitude= parseFloat(lon);
        mymap.setView([myLatitude,myLongitude], 17);
        sessionStorage.setItem('location', JSON.stringify(myLocation));
        mymap.setView([myLocation], 17);
    })
    .then((myLocation)=>{
        window.onload= ()=>{
        myposition=L.marker(myLocation).addTo(mymap).bindPopup(`Starting Postiton`).openPopup();
        }
    })
}

//Functions for upload of data to server

function uploadPlace(place){
    //Sends the place data to server
    return new Promise((resolve,reject)=>{
        fetch('/upload/places',{
            method: 'POST',
            body: place
        })
        .then(response=>{
            okFlag= response.ok;
            return response.text()
        })
        .then(text=>{
            if(okFlag) resolve(text)
            reject(text)
        })
        .catch(err=>{
            console.log(err)
        })
    })
}

//Function to Fetch data from Server
async function getCatagories(){
    //Gets an array of Catagories and returns it if error occurs it returns and empty array
    try {
        const response = await fetch(`/api/places/catagories`);
        if (response.ok)
            return response.json();
        return [];
    }
    catch (err) {
        console.log(err);
        return [];
    }
}

//Function to Get Location From API
function getCurrentLocation(){
    return new Promise((resolve,reject)=>{
      if('geolocation' in navigator){
          navigator.geolocation.getCurrentPosition(
              ({coords: { latitude: myLatitude, longitude: myLongitude}})=>
              {
                  resolve([myLatitude,myLongitude]);
              } ,
              ()=>{
                  reject("No Access");
              }
              ); 
      }
      else{
          reject("No Access")
      }
    })
}

//Event Listeners

file.addEventListener('change', (e)=>{
    //To Upload Images to the page
    const reader= new FileReader();
        
    reader.addEventListener('load', e=>{
        if(file.files[0].size<=(2*1024*1025))
        {
            const img= document.createElement('img');
            img.setAttribute('src',reader.result);
            img.setAttribute('id',Math.random());
            img.setAttribute('class','uploadPhoto');
            img.setAttribute('onclick', `removeImage(this)`);
            imageview.appendChild(img);
            placeDatatoSend.set(img.id, file.files[0]);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(file.files[0]);
});

form.addEventListener('submit', async e=>{
    //To Upload Place to Server
    e.preventDefault();
    const name= document.getElementById('name').value;
    const description= document.getElementById('description').value;
    const catagory= document.getElementById('catagory').value;
    placeDatatoSend.set('reqId',Math.random()*10000);
    placeDatatoSend.set('name',name )
    placeDatatoSend.set('description',description )
    placeDatatoSend.set('catagory',catagory)
    placeDatatoSend.set('lat',parseFloat(lat).toPrecision(10));
    placeDatatoSend.set('lon',parseFloat(lon).toPrecision(10));
        
    uploadPlace(placeDatatoSend)
        .then(placeID=>{
            location= `../places/place?placeID=${placeID}`
        })
        .catch(alertMessage=>{
            alert(alertMessage);
        })        
});