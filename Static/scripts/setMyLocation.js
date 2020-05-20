export function setMyLocation() {
    if (localStorage.getItem('location')) {
        const [lat, lon] = JSON.parse(localStorage.getItem('location'));
        const myLatitude = parseFloat(lat);
        const myLongitude = parseFloat(lon);
        mymap.setView([myLatitude, myLongitude], 17);
        return;
    }
    getCurrentLocation()
        .then(myLocation => {
            const [lat, lon] = myLocation;
            const myLatitude = parseFloat(lat);
            const myLongitude = parseFloat(lon);
            mymap.setView([myLatitude, myLongitude], 17);
            sessionStorage.setItem('location', JSON.stringify(myLocation));
            mymap.setView([myLocation], 17);
        })
        .then((myLocation) => {
            window.onload = () => {
                myposition = L.marker(myLocation).addTo(mymap).bindPopup(`Starting Postiton`).openPopup();
            };
        });
    
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