
/***************************  HTML ELEMENTS  **********************************/
const catagories= document.getElementById('catagories');
const content= document.getElementById('content');
/********************************************************************************************/

/*********************************** GLOBAL VARIABLES **************************************/
let markerLayer= [];
let latitude;
let longitude;
/**********************************************************************************************/

/*********************************** INITIALIZED FUNCTIONS **************************************/
setCurrentLocation();
displayCurrentLocation();
setMyPosition();
displayCatagories();
displayPlaces();

/**********************************************************************************************/


/********************************** LOCATION FUNCTIONS ********************************************/
async function setCurrentLocation(){
    if(sessionStorage.getItem('location')){
        const myPostion= JSON.parse(sessionStorage.getItem('location'));
        const latitude= parseFloat(myPostion[0]);
        const longitude= parseFloat(myPostion[1]);
        setMyPosition(latitude,longitude);
        return;
    }
    try{
        const myPostion= await getCurrentLocation();
        sessionStorage.setItem('location', JSON.stringify(result));
        const latitude= parseFloat(myPostion[0]);
        const longitude= parseFloat(myPostion[0]);
        setMyPosition(latitude,longitude);
        return;
    }
    catch(err){
        const myPosition= [26.8114,87.2850];
        sessionStorage.setItem('reference', JSON.stringify(myPosition));
        const latitude= parseFloat(myPostion[0]);
        const longitude= parseFloat(myPostion[0]);
        setMyPosition(latitude,longitude);
        return;
    }
}

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

function setMyPosition(lat,lon){
    latitude= lat;
    longitude= lon;
}

function getMyPosition(){
    const lat= parseFloat(latitude);
    const lon= parseFloat(longitude);
    return [lat,lon];
}

async function displayCurrentLocation(latitude,longitude){
    const [lat,lon]= getMyPosition();
    const mylocation= L.marker([lat,lon]).addTo(mymap);
    mylocation.bindPopup("Reference Point");
    mymap.setView([lat,lon], 15);
}

/**********************************************************************************************/

/***********************************CATAGORIES FUNCTIONS*****************************************/
async function displayCatagories(){
    const _catagories= await getCatagories();
    _catagories.forEach(catagory => {
        displayCatagory(catagory);
    });
}

function displayCatagory(catagory){
    const id= Math.random();
    catagories.innerHTML +=
        `<label for=${id}> ${catagory} </label> 
        <input type="radio" name="catagory" id="${id}" value=${catagory} onClick="displaySelectedCatagoryPlace(this)">`
}

async function getCatagories(){
    try {
        const response = await fetch('/api/places/catagories');
        if (response.ok)
            return response.json();
        return [];
    }
    catch (err) {
        return [];
    }
}


function displaySelectedCatagoryPlace(catagory){
    const [latitude,longitude]= getMyPosition();
    const selectedCatagory= catagory.value;
    displayPlaces(latitude,longitude,selectedCatagory);
}

/**********************************************************************************************/

/************************************ PLACES FUNCTIONS ****************************************/
async function displayPlaces(catagory){
    const [latitude,longitude]= getMyPosition();
    const places= await getPlaces(latitude,longitude,catagory);
    content.innerHTML= '';
    removeMarkerLayer();
    places.forEach(place=>{
        addToMarkerLayer(place);
        addPlace(place);
    })
    const div = document.getElementById("loading");
    if(div)
    div.parentNode.removeChild(div)
}


async function getPlaces(latitude,longitude,catagory='all'){
    try {
        const response = await fetch(`/api/places?lat=${latitude}&lon=${longitude}&catagory=${catagory}`);
        if (response.ok) {
            return response.json();
        }
        return [];
    }
    catch (err) {
        return [];
    }
}


function addPlace(place){
   content.innerHTML +=
    ` <a href="${location}/place?placeID=${place.placeID}" title="${place.catagory}" onmouseover="popupMarker('${place.placeID}')">
            <li>
                <span class="placeName">${place.name}</span>
                <span class="distance"> ${place.distance} km</span>
            </li>
        </a>
        `
}

/**********************************************************************************************/

/************************************ MARKER FUNCTIONS **************************************/
function addToMarkerLayer(place){
    const markerToAdd= L.marker([place.lat,place.lon]).addTo(mymap).bindPopup(`${place.name}`);
    markerLayer=[...markerLayer,{placeID:place.placeID, marker: markerToAdd}];
}

function removeMarkerLayer(){
    markerLayer.forEach(marker=>{
        mymap.removeLayer(marker.marker);
    })
    markerLayer= [];
}

function popupMarker(placeID){
    markerToPopup= markerLayer.find(marker=>{
        return marker.placeID===placeID;
    });
    markerToPopup.marker.openPopup();
}
/**********************************************************************************************/