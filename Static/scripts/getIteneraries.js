
(()=>{

    if(!sessionStorage.getItem('location')){
        getCurrentLocation()
                .then(result=>{
                    sessionStorage.setItem('location', JSON.stringify(result));
                })
                .catch(err=>{
                    myPosition= [26.8114,87.2850];
                    sessionStorage.setItem('reference', JSON.stringify(myPosition));
                    
                })
                .finally(()=>{
                    getTravelRoutes()
                })
    }
    else{
        getTravelRoutes()
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


async function getTravelRoutes(){
    if(sessionStorage.getItem('location')){
        [lat, lon]= JSON.parse(sessionStorage.getItem('location'));
    }
    else{
        [lat, lon]= JSON.parse(sessionStorage.getItem('reference'));
    }
    content= document.getElementById('content');
    response = await fetch(`/api/iteneraries?lat=${lat}&lon=${lon}`);
    travelroutes= await response.json();
    content.innerHTML = travelroutes.map(addContent).join(' ');
    var div = document.getElementById("loading");
    div.parentNode.removeChild(div);
}

function addContent(itenerary){   
    return `
    
    <a href="${location}/itenerary?id=${itenerary.routeID}" title="${itenerary.name}">
        <li>
            <span class="placeName"> <b> ${itenerary.name} </b> </span>
        </li>
    </a>
    `
}

