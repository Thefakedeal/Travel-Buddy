//Page Constants
const sendIteneraryData= new FormData()

//Page Variables
let marker;
let uploadJSON=[];
let places=[];
let markerLayer=[];
let lat,lon;


//HTML ELEMENTS
const file= document.getElementById('file');
const imageview= document.querySelector('.imageview');
const selectCatagory= document.getElementById('catagory');
const submit= document.getElementById('submit');
const form= document.getElementById('form');
const placeName= document.getElementById('placeName');
const addButton= document.getElementById('addButton');
const placeList= document.getElementById('placeList');

//Initialized Functions

submit.disabled= true;
setMyLocation();

//Leaflet Functions
mymap.on('click', e => {
    if(marker!== undefined){
        mymap.removeLayer(marker)
    }
    lat= e.latlng.lat;
    lon= e.latlng.lng;
    placeName.focus();
    marker= L.marker([lat,lon]).addTo(mymap);
})

function popupMarker(key){
    markerToPopup= markerLayer.find(marker=>{
        return marker.key===key;
    });
    markerToPopup.marker.openPopup();
}

//Functions to create Place Data
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

function makePlace(name,lat,lon){
    return new Promise((resolve,reject)=>{
        if(name.length<=0){
            reject(`Name Cannot Be  Empty`);
        }
        if(lat===undefined || lon===undefined){
            reject('Please Add Place Value')
        }
        const key= Math.random();
        const marker= L.marker([lat,lon]).addTo(mymap).bindPopup(`${name}`);
        const placeObject= {key,name,lat,lon};
        const markerObject= {key,marker};
        resolve({place: placeObject, marker: markerObject});
    })
}


//Functions to Delete te page data

function deletePlace(place){
    const key= parseFloat(place.getAttribute('data-key'));
    places= places.filter(place=>{
        return place.key!=key;
    })

    const markerToDelete= markerLayer.find(marker=>{
        return marker.key===key;
    });
    mymap.removeLayer(markerToDelete.marker);

    const elementToRemove= place.parentNode;
    elementToRemove.parentNode.removeChild(elementToRemove);

    markerLayer= markerLayer.filter(marker=>{
        return marker.key!==key;
    });

    if(places.length>=0||places.length<=10){
        submit.disabled=true;
    }
    else{
        submit.disabled=false;
    }
}

function removeImage(image){
    //removes the image selected from display and upload
    image.parentNode.removeChild(image);
    placeDatatoSend.delete(image.id);
}

//Function To Upload Data to the server

function uploadItenerary(itenerary){
    return new Promise((resolve,reject)=>{
        fetch('/upload/itenerary',{
            method: 'POST',
            body: itenerary
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
    const reader= new FileReader();    
    reader.addEventListener('load', e=>{
        if(file.files[0].size<=(2*1024*1025))
        {
            img= document.createElement('img');
            img.setAttribute('src',reader.result);
            img.setAttribute('id',Math.random());
            img.setAttribute('class','uploadPhoto');
            img.setAttribute('onclick', `removeImage(this)`);
            imageview.appendChild(img);
            sendIteneraryData.set(img.id, file.files[0]);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(file.files[0]);
});

addButton.addEventListener('click',(e)=>{
    const name= placeName.value;
    if(places.length>=10){
        alert('No. of Places Should be less than 10');
        return;
    }
    makePlace(name,lat,lon)
        .then(result=>{
            key= result.marker.key;
            mymap.removeLayer(marker);
            places= [...places, result.place];
            markerLayer= [...markerLayer, result.marker];
        })
        .then(()=>{
            placeName.value=null;
            lat = undefined;
            lon = undefined;
            placeList.innerHTML+= `<li onmouseover="popupMarker(${key})"> <span> ${name} </span> <span class="deleteIt" title="Delete Place"  data-key='${key}' onClick="deletePlace(this)"> 🗑️ </span>  </li>`
            submit.disabled=false;
        })
        .catch(err=>{
            if(placeName.value.length===0){
                placeName.style.borderColor='red';
            }
            alert(err)
        })
    

});

form.addEventListener('submit', async e=>{
    e.preventDefault();
    name= document.getElementById('name').value;
    description= document.getElementById('description').value;
        sendIteneraryData.set('name',name );
        sendIteneraryData.set('description',description );
        sendIteneraryData.set('places',JSON.stringify(places));
        
        uploadItenerary(sendIteneraryData)
        .then(iteneraryID=>{
            location= `../iteneraries/itenerary?iteneraryID=${iteneraryID}`
        })
        .catch(alertMessage=>{
            alert(alertMessage);
        })  
        
});