let places=[];
let markerLayer=[];

let [lat, lon]= JSON.parse(localStorage.getItem('location'));
let placeLatitude,placeLongitude;
mymap.setView([lat,lon], 17);

file= document.getElementById('file');
imageview= document.querySelector('.imageview');
selectCatagory= document.getElementById('catagory');
submit= document.getElementById('submit');
form= document.getElementById('form');
placeName= document.getElementById('placeName');
addButton= document.getElementById('addButton');
placeList= document.getElementById('placeList');


submit.disabled= true;
let sendplacedata= new FormData()
let marker;
let uploadJSON=[];


mymap.on('click', e => {
    if(typeof(marker)===typeof(L.marker(1,1))){
        mymap.removeLayer(marker)
    }
    placeLatitude= e.latlng.lat;
    placeLongitude= e.latlng.lng;
    placeName.focus();
    marker= L.marker([placeLatitude,placeLongitude]).addTo(mymap);
})

    

file.addEventListener('change', (e)=>{

    reader= new FileReader();
        
    reader.addEventListener('load', e=>{
        if(file.files[0].size<=(2*1024*1025))
        {
            img= document.createElement('img');
            img.setAttribute('src',reader.result);
            img.setAttribute('id',Math.random());
            img.setAttribute('class','uploadPhoto');
            img.setAttribute('onclick', `removeit(${img.id})`);
            imageview.appendChild(img);
            sendplacedata.append(img.id, file.files[0]);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(file.files[0]);
});


form.addEventListener('submit', async e=>{
    e.preventDefault();
    name= document.getElementById('name').value;
    description= document.getElementById('description').value;
        sendplacedata.set('name',name );
        sendplacedata.set('description',description );
        sendplacedata.set('places',JSON.stringify(places));
        
        response= await fetch('/upload/itenerary',{
            method: 'POST',
            body: sendplacedata
        })
        
        responseText= await response.text();   
        
        if(response.status===201){
            location= `../iteneraries/itenerary?id=${responseText}`
        }
        else{
            alert(responseText);
        }
        
    });
    
    
function removeit(id){
        item= document.getElementById(id);
        item.parentNode.removeChild(item);
        sendplacedata.delete(id);
    }

function addPlace(){
    if(placeName.value.length!==0 && placeLatitude!==undefined && placeLongitude!==undefined){
        placeName.style.borderColor=null;
        mymap.removeLayer(marker)
        randomKey= Math.random();
        placeData= {
            key: randomKey,
            name: placeName.value,
            lat: placeLatitude.toFixed(5),
            lon: placeLongitude.toFixed(5)
        }
        if(places.length<=10){
            places=[...places,placeData];
            markerToBeAdded= L.marker([placeLatitude,placeLongitude]).addTo(mymap).bindPopup(`${placeName.value}`);
            markerLayer=[...markerLayer, {key:randomKey, marker: markerToBeAdded}];
            placeList.innerHTML+= `<li id='${randomKey}' onmouseover="popupMarker(${randomKey})"> <span> ${placeName.value} </span> <span class="deleteIt" title="Delete Place" onClick="deletePlace(${randomKey})"> 🗑️ </span>  </li>`
            submit.disabled=false;
        }
        else{
            submit.disabled=true;
            alert("Only Upto 10 places allowed");
        }
        placeName.value=null;
        placeLatitude= undefined;
        placeLongitude=undefined;
    }
    else if(placeName.value.length===0){
        placeName.style.borderColor='red';
    }
    else{
        alert("Add Place Location from Map")
    }
    
}

function deletePlace(key){
    places= places.filter(place=>{
        return place.key!=key;
    })
    elementToRemove= document.getElementById(key);
    elementToRemove.parentNode.removeChild(elementToRemove);
    markerToDelete= markerLayer.find(marker=>{
        return marker.key===key;
    })
    mymap.removeLayer(markerToDelete.marker);
    if(places.length>=0||places.length<=10){
        submit.disabled=true;
    }
    else{
        submit.disabled=false;
    }
}

function popupMarker(key){
    markerToPopup= markerLayer.find(marker=>{
        return marker.key===key;
    });
    markerToPopup.marker.openPopup();
}

function checkPlaceLength(){
    if(places.length<=0||places.length>=0){
        submit.disabled= true; 
    }
    else{
        submit.disabled= false; 
    }
}