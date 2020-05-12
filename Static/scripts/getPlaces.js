let markerLayer= [];
getCatagory();


(()=>{
    
    if(!sessionStorage.getItem('location')){
        getCurrentLocation()
        .then(result=>{
            sessionStorage.setItem('location', JSON.stringify(result));
            getPlaces(result);
                    getReferencePoint(myPosition, "Current Position");
                })
                .catch(err=>{
                    myPosition= [26.8114,87.2850];
                    sessionStorage.setItem('reference', JSON.stringify(myPosition));
                    getPlaces(myPosition);
                    getReferencePoint(myPosition, "Reference Point: Dharan Bhanu Chowk");
                })
    }

    else{
        myPosition= JSON.parse(sessionStorage.getItem('location'));
        getPlaces(myPosition);                                                   
        getReferencePoint(myPosition, "Current Position");
    }
    
})();


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

async function getCatagory(){
    response= await fetch('/api/places/catagories');
    availableCatagory= await response.json();
    catagories= document.getElementById('catagories');
    catagories.innerHTML+= availableCatagory.map(catagory =>{
        return `
        <label for=${catagory.split(' ').join('_')}> ${catagory} </label> 
        <input type="radio" name="catagory" id="${catagory.split(' ').join('_')}" value="${catagory}">
        `;
    }).join(' ');

   
}



async function getReferencePoint(myPosition, positionDetail){
    const mylocation= L.marker(myPosition).addTo(mymap);
    mylocation.bindPopup(positionDetail);
    mymap.setView(myPosition, 14);
}





async function getPlaces([lat,lon]){
    content= document.getElementById('content');
    response = await fetch(`/api/places?lat=${parseFloat(lat).toFixed(4)}&lon=${parseFloat(lon).toFixed(4)}`);
    places= await response.json();
    content.innerHTML = places.map(addContent).join(' ');
    selectCatagory= document.getElementsByName('catagory');
    selectCatagory.forEach(singleCatagory=>
        {
            singleCatagory.addEventListener('change', async e=>{
                catagory= document.querySelector('input[name="catagory"]:checked').value;
                response = await fetch(`/api/places?lat=${parseFloat(lat).toFixed(4)}&lon=${parseFloat(lon).toFixed(4)}&catagory=${catagory}`);
                places= await response.json();
                markerLayer.forEach(markerObject=>{
                    mymap.removeLayer(markerObject.marker);
                })
                content.innerHTML = places.map(addContent).join(' ');
                
            });
        })
        var div = document.getElementById("loading");
        div.parentNode.removeChild(div)
}

function addContent(place){
    markerToAdd= L.marker([place.lat,place.lon]).addTo(mymap).bindPopup(`${place.name}`);
    placeID= Math.random();
    markerLayer=[...markerLayer,{placeID:placeID, marker: markerToAdd}];
    return `
    
    <a href="${location}/place?id=${place.id}" title="${place.catagory}" onmouseover="popupMarker(${placeID})">
        <li>
            <span class="placeName">${place.name}</span>
            <span class="distance"> ${place.distance} km</span>
        </li>
    </a>
    
    `
}

function popupMarker(placeID){
    markerToPopup= markerLayer.find(marker=>{
        return marker.placeID===placeID;
    });
    markerToPopup.marker.openPopup();
}


