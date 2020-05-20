export function insertPlace(name, lat, lon) {
    return new Promise((resolve, reject) => {
        if (name.length <= 0) {
            reject(`Name Cannot Be  Empty`);
        }
        if (lat === undefined || lon === undefined) {
            reject('Please Add Place Value');
        }
        const key = Math.random();
        const marker = L.marker([lat, lon]).addTo(mymap).bindPopup(`${name}`);
        const placeObject = { key, name, lat, lon };
        const markerObject = { key, marker };
        resolve({ place: placeObject, marker: markerObject });
    });
}

export function deletePlace(place){
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