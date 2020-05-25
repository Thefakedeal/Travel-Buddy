
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
getCurrentLocation()
    .then(([latitude,longitude])=>{
        displayCurrentLocation(latitude,longitude);
        displayCatagories(latitude,longitude);
        displayPlaces(latitude,longitude);
    })
    .catch(err=>{
        alert(err);
    })

/**********************************************************************************************/


/********************************** LOCATION FUNCTIONS ********************************************/

function getCurrentLocation(){
    return new Promise((resolve,reject)=>{
      if('geolocation' in navigator){
          navigator.geolocation.getCurrentPosition(
              ({coords: { latitude: myLatitude, longitude: myLongitude}})=>
              {
                  resolve([myLatitude,myLongitude]);
              } ,
              ()=>{
                  reject("Can't Access Location");
              }
              ); 
      }
      else{
          reject("Can't Access Location")
        }
    })
}

async function displayCurrentLocation(latitude,longitude){
    const mylocation= L.marker([latitude,longitude]).addTo(mymap);
    mylocation.bindPopup("Reference Point");
    mymap.setView([latitude,longitude], 15);
}

/**********************************************************************************************/

/***********************************CATAGORIES FUNCTIONS*****************************************/
async function displayCatagories(latitude,longitude){
    const _catagories= await getCatagories();
    _catagories.forEach(catagory => {
        catagories.innerHTML +=returnCatagoryElement(catagory);
    });
    addCatagoryClickEvent(latitude,longitude);
}

function returnCatagoryElement(catagory){
    const id= Math.random();
    return`
        <label for=${id}> ${catagory} </label> 
        <input type="radio" name="catagory" id="${id}" value="${catagory}">`
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
 function addCatagoryClickEvent(latitude,longitude){
    const catagories= document.getElementsByName('catagory');
    for(const catagory of catagories){
        catagory.addEventListener('click',(e)=>{
        displaySelectedCatagoryPlace(latitude,longitude,e.target);
        })
    }
 }


function displaySelectedCatagoryPlace(latitude,longitude,catagory){
    const selectedCatagory= catagory.value;
    displayPlaces(latitude,longitude,selectedCatagory);
}

/**********************************************************************************************/

/************************************ PLACES FUNCTIONS ****************************************/
async function displayPlaces(latitude,longitude,catagory='all'){
    const places= await getPlaces(latitude,longitude,catagory);
    content.innerHTML= '';
    removeMarkerLayer();
    places.forEach(place=>{
        addToMarkerLayer(place);
        content.innerHTML += returnPlaceElement(place);
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


function returnPlaceElement(place){
  return `
   <a href="${location}/place?placeID=${place.placeID}" title="${place.catagory}" onmouseover="popupMarker('${place.placeID}')">
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