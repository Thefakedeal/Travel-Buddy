initialization()

function initialization(){
    if(sessionStorage.getItem('location')){
        const [lat, lon]= JSON.parse(localStorage.getItem('location'));
        const latitude= parseFloat(lat);
        const longitude= parseFloat(lon);
        displayIteneraries(latitude,longitude);
        return;
    }
    
    getCurrentLocation()
    .then(result=>{
        sessionStorage.setItem('location', JSON.stringify(result));
        const latitude= parseFloat(result[0]);
        const longitude= parseFloat(result[1]);
        displayIteneraries(latitude,longitude);
        })
        .catch(err=>{
            myPosition= [26.8114,87.2850];
            sessionStorage.setItem('reference', JSON.stringify(myPosition)); 
            const latitude= parseFloat(myPosition[0]);
            const longitude= parseFloat(myPosition[1]);
            displayIteneraries(latitude,longitude);
        })      
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

function displayIteneraries(latitude,longitude){
    const content= document.getElementById('content');
    getIteneraries(latitude,longitude)
        .then(iteneraries=>{
            content.innerHTML = iteneraries.map(addContent).join(' ');
            const div = document.getElementById("loading");
            div.parentNode.removeChild(div);
        })
    
}

async function getIteneraries(latitude,longitude){
   try {
        const response = await fetch(`/api/iteneraries?lat=${latitude}&lon=${longitude}`);
        if (response.ok) {
            return response.json();
        }
        else {
            return [];
        }
    }
    catch (err) {
        return [];
    }

}

function addContent(itenerary){   
    return `
    
    <a href="${location}/itenerary?iteneraryID=${itenerary.iteneraryID}" title="${itenerary.name}">
        <li>
            <span class="placeName"> <b> ${itenerary.name} </b> </span>
        </li>
    </a>
    `
}

