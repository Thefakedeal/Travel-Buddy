let urlSearch= new URLSearchParams(location.search);
let iteneraryID=urlSearch.get('id')
let myLocation= JSON.parse(sessionStorage.getItem('location'));
let number= 0;
let markerLayer=[];
let placeList= document.getElementById('placeList');
let currentLocation;

let file= document.getElementById('file');
let imageview= document.querySelector('.imageview');
let submitButton=document.getElementById('submit');
let sendphoto= new FormData();

getCurrentLocation()
    .then(mylocation=>{
        sessionStorage.setItem('location', JSON.stringify(mylocation));
    })

window.onload= ()=>{
    const myLocation= JSON.parse(sessionStorage.getItem('location'));
    const myposition=L.marker(myLocation).addTo(mymap).bindPopup(`Starting Postiton`).openPopup();
}

getItenerary(iteneraryID);
getImage(iteneraryID);
getComments();
getLikes();
myRating();

async function getItenerary(iteneraryID){
    let response = await fetch(`/api/iteneraries/itenerary?iteneraryID=${iteneraryID}`);
    if(response.status===200)
    {
        const {itenerary, places: placesData}= await response.json();
        document.title= itenerary.name;
        document.getElementById('title').innerHTML= itenerary.name;
        document.getElementById('description').innerHTML= itenerary.description;
        placesData.map(addPlace);
        document.getElementById('navigate').disabled=false;
        var div = document.getElementById("loading");
        div.parentNode.removeChild(div);
        
    }
    else{
        alert( await response.text())
        location= '/..'
    }
}


async function getImage(iteneraryID){
    let number=0;
    let response = await fetch(`/api/iteneraries/images?iteneraryID=${iteneraryID}&number=${number}`);
    if(response.status===200)
    {   let images= document.querySelector('.images');
        let imagesResponse= await response.json();
        images.innerHTML = imagesResponse.map(images=>{
            return `
                <img src=${images}>
            `;
        }).join(' ');

    }
    
}

function addMarker({lat, lon}){
    let marker=L.marker([lat,lon]).addTo(mymap);
    mymap.setView([lat,lon],16);
    return marker;
}
  






file.addEventListener('change', (e)=>{
    submitButton.disabled= false;
    let reader= new FileReader();
        
    reader.addEventListener('load', e=>{
        if(file.files[0].size<=(2*1024*1025))
        {   
            let img= document.createElement('img');
            img.setAttribute('src',reader.result);
            img.setAttribute('id',Math.random());
            img.setAttribute('class','uploadPhoto');
            img.setAttribute('onclick', `removeit(${img.id})`);
            imageview.appendChild(img);
            sendphoto.append(img.id, file.files[0]);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(file.files[0]);
})

function removeit(id){
    let item= document.getElementById(id);
    item.parentNode.removeChild(item);
    sendphoto.delete(id);
}

submitButton.addEventListener('click', async e=>{
    sendphoto.delete('id');
    sendphoto.append('id', iteneraryID);
    let response= await fetch('/upload/itenerary/photos',{
        method: 'POST',
        body: sendphoto
    });
    let message= await response.text();
    alert(message);
    if(response.status===200){
        imageview.innerHTML='';
        submitButton.disabled=true;
        sendphoto = new FormData();
        getImage(iteneraryID);

    }
})


 

async function loadPics(){
    number++;
    let response = await fetch(`/api/iteneraries/images?iteneraryID=${iteneraryID}&number=${number}`);
    if(response.status===200)
    {   let images= document.querySelector('.images');
        let imagesResponse= await response.json();
        images.innerHTML += imagesResponse.map(images=>{
            return `
                <img src=${images}>
            `;
        }).join(' ');

    }
}


let rating= document.getElementsByName('rating');

rating.forEach(vote=>
    {
        vote.addEventListener('change', async e=>{
            let likes= document.querySelector('input[name="rating"]:checked').value;
            let action={
                routeID: iteneraryID,
                likes: likes
            }
            fetch('/rating/itenerary/vote',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(action)
            })
            
        });
    })
 

   async function submitComment(){
        let comment= document.getElementById('comment');
        let action= {
            routeID: iteneraryID,
            comment: comment.value
        }
        let response= await fetch('/rating/itenerary/comment',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(action)
        })
        if(response.status===200){
            comment.value='';
            getComments()
            myRating()
        }
        else if(response.status===403){
            alert(await response.text())
        }
        
    }

    async function getComments(){
        let comments= document.querySelector('.comments')
        let response = await fetch(`/rating/itenerary/comments?iteneraryID=${iteneraryID}`);
        let result= await response.json();
        comments.innerHTML= result.map(comment=>{
            return `
            <dt> <b> ${comment.name} </b>  <dt>
            <dd> ${comment.comment} </dd>`;
        }).join(' ')
    }

    async function getLikes(){
        let ratio= document.getElementById('ratio');
        let likes= document.getElementById('likes');
        let dislikes= document.getElementById('dislikes');
        let response = await fetch(`/rating/itenerary/likes?iteneraryID=${iteneraryID}`);
        let result= await response.json();
        let likeCount= parseInt(result.likes);
        let dislikeCount= parseInt(result.dislikes);
        let totalratio= document.getElementById('totalratio');
        totalratio.innerHTML= `Likes: <b> ${likeCount}</b> Dislikes: <b> ${dislikeCount} </b>`
        if(response.status===200 && (likeCount!==0 || dislikeCount!==0 )){
            likes.style.flex= likeCount;
            dislikes.style.flex= dislikeCount;
            ratio.style.display= 'flex'
        }
    }

    async function myRating(){
       let response= await fetch(`/rating/itenerary/myrating?iteneraryID=${iteneraryID}`);
       let myComment= document.querySelector('.mycomment');
       if(response.status===200){
           let rating= await response.json();
           let button= document.querySelectorAll('input[name="rating"]');
           button.forEach(vote=>{
               if(vote.value== rating[0].likes){
                   vote.checked=true
               }
           })
           if(rating[0].comment.length!==0){
                myComment.innerHTML= 
                `   <dl>
                        <dt> <b> You Said... </b> <dt>
                        <dd> ${rating[0].comment} </dd>
                    </dl>
                `
           }
       }
    }

function addPlace(place){
    const {name, lat, lon}= place;
    const id= Math.random();
    let markerToBeAdded= L.marker([lat,lon]).addTo(mymap).bindPopup(`${name}`);
    markerLayer=[...markerLayer, {placeID:id, marker: markerToBeAdded}];
    placeList.innerHTML+= `<li id='${id}' onmouseover="popupMarker(${id})"> ${name} </li>`
}

function popupMarker(id){
    let markerToPopup= markerLayer.find(marker=>{
        return marker.placeID===id;
    });
    markerToPopup.marker.openPopup();
  
}

async function getRoute(){
    if(!sessionStorage.getItem('location')){
        alert("Please Allow Location");
        return;
    }
    let [mylat, mylon]= JSON.parse(sessionStorage.getItem('location'));
    let lat= parseFloat(mylat).toFixed(4);
    let lon= parseFloat(mylon).toFixed(4);
    let response= await fetch(`/navigate/itenerary?iteneraryID=${iteneraryID}&mylat=${lat}&mylon=${lon}`);
    if(response.status===200){
        let coordinates= await response.json();
        let routes=[];
        coordinates.forEach(coordinate => {
            routes= [...routes, [coordinate[1], coordinate[0]]];
        });
        polyline = L.polyline(routes, {color: 'red'}).addTo(mymap);
    }
    else{
        alert(await response.text());
    }
    displayCurrentLocation();
    setInterval(displayCurrentLocation, 5000)
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

function displayCurrentLocation(){
    getCurrentLocation()
    .then(([lat,lon])=>{
            if(currentLocation){
                mymap.removeLayer(currentLocation);
            }
            let currentLocation= L.marker([lat,lon]).addTo(mymap).bindPopup(`Current Postion`).openPopup();
        })
        
}

