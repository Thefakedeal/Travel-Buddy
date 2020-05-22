//Global Constants
const urlSearch= new URLSearchParams(location.search);
const iteneraryID=urlSearch.get('iteneraryID');

//Global Variables
let number= 0; //iteration of how many times setrs of image has been requested
let markerLayer=[]; //collection of markers for different places
let currentLocationMarker; //marker for current live location
let sendphoto= new FormData(); //form where photos to be uploaded are added
let myVote= 0; // upvote(1) downvote(-1) or none(0) 


//HTML ELEMENTS
const loadImages= document.getElementById('loadImages'); //load more sets of images
const myRatingElement= document.getElementsByName('rating'); // Upvote and Downvote radio buttons
const submitComment= document.getElementById('submitComment'); //submit button for posting comment
const navigate= document.getElementById('navigate'); //to get navigation routes
const favourite= document.getElementById('favourite');  //checkbox showing if place is favourited by user or not
const file= document.getElementById('file'); //loads images to be updated
const imageview= document.querySelector('.imageview'); //for images about to be uploaded by user
const submitPhotos=document.getElementById('submitPhotos'); //submit button for image upload

//Functions Initialized On page load
displayIteneraryData(iteneraryID)
displayImages(iteneraryID);
displayComments(iteneraryID);
displayLikes(iteneraryID);
displayMyReview(iteneraryID);
displayFavourite(iteneraryID);


//used to change the global variable myVote from promises
function setMyVote(vote){
    myVote= parseInt(vote);
}

//miscellaneous functions used to create and delete html/map elements
function displayMyLocation(){
    if(localStorage.getItem('location')){
        const [lat, lon]= JSON.parse(localStorage.getItem('location'));
        const myLatitude= parseFloat(lat);
        const myLongitude= parseFloat(lon);
        window.onload= ()=>{
            myposition=L.marker([myLatitude,myLongitude]).addTo(mymap).bindPopup(`Starting Postiton`).openPopup();
        }
        return;
    }
    getCurrentLocation()
    .then(myLocation=>{
        sessionStorage.setItem('location', JSON.stringify(myLocation));
        return myLocation;
    })
    .then((myLocation)=>{
        window.onload= ()=>{
        myposition=L.marker(myLocation).addTo(mymap).bindPopup(`Starting Postiton`).openPopup();
        }
    })
}

function displayCurrentLocation(){
    getCurrentLocation()
    .then(([lat,lon])=>{
            if(currentLocationMarker){
                mymap.removeLayer(currentLocationMarker);
            }
            currentLocationMarker= L.marker([lat,lon]).addTo(mymap).bindPopup(`Current Postion`).openPopup();
        })       
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

function addMarker({lat, lon}){
    let marker=L.marker([lat,lon]).addTo(mymap);
    mymap.setView([lat,lon],16);
    return marker;
}

function removePhoto(id){
    let item= document.getElementById(id);
    item.parentNode.removeChild(item);
    sendphoto.delete(id);
} 

//Functions Used to display datas fetched from network request

function displayIteneraryData(iteneraryID){
    getIteneraryData(iteneraryID)
        .then(({itenerary,placesData})=>{
            document.title= itenerary.name;
            document.getElementById('title').innerHTML= itenerary.name;
            document.getElementById('description').innerHTML= itenerary.description;
            placesData.map(addPlace);
            document.getElementById('navigate').disabled=false;
            var div = document.getElementById("loading");
            div.parentNode.removeChild(div);
        })
        .catch(err=>{
            alert('something went wrong')
            location= '/..'
        })
}

function displayMyReview(iteneraryID){
    getMyReview(iteneraryID)
        .then(myReview=>{
            const button= document.querySelectorAll('input[name="rating"]');
            const myComment= document.querySelector('.mycomment');
            setMyVote(myReview.likes);
               button.forEach(vote=>{
                   if(vote.value== myReview.likes){
                       vote.checked=true;
                    //    sessionStorage.setItem('myVote', myReview.likes);
                   }
               })
            if(myReview.comment!==null){
                myComment.innerHTML= 
                `   <dl>
                        <dt> <b> You Said... </b> <dt>
                        <dd> ${myReview.comment} </dd>
                    </dl>
                `
           }
    
        })
        .catch((err)=>{
            console.log(err);
        })
}

function displayFavourite(iteneraryID){
    getFavourite(iteneraryID)
        .then(response=>{
            if(response.favourite===1){
                favourite.checked=true;
            }
        })
        .catch(err=>{
            favourite.checked=false;
        })
}

function displayImages(iteneraryID){
    getImage(iteneraryID)
        .then(images=>{
            const imagesElement= document.querySelector('.images');
            imagesElement.innerHTML = images.map(image=>{
                return `
                    <img src=${image}>
                `;
            }).join(' ');
        })
}

function displayLikes(iteneraryID){
    getLikes(iteneraryID)
        .then((ratio)=>{
            const ratioElement= document.getElementById('ratio');
            const likes= document.getElementById('likes');
            const dislikes= document.getElementById('dislikes');
            const totalratio= document.getElementById('totalratio');
            totalratio.innerHTML= `Likes: <b> ${ratio.likes}</b> Dislikes: <b> ${ratio.dislikes} </b>`
            if(ratio.likes!==0 || ratio.dislikes!==0 ){
                likes.style.flex= ratio.likes;
                dislikes.style.flex= ratio.dislikes;
                ratioElement.style.display= 'flex'
        }
    
        })      
}

function displayComments(iteneraryID)
{
    getComments(iteneraryID)
        .then(comments=>{
            const commentElements= document.querySelector('.comments')
            commentElements.innerHTML= comments.map(comment=>{
                return `
                <dt> <b> ${comment.name} </b>  <dt>
                <dd> ${comment.comment} </dd>`;
            })
        })
}

//Wrapper Functions for network requests

function getIteneraryData(iteneraryID){
    return new Promise((resolve,reject)=>{
        fetch(`/api/iteneraries/itenerary?iteneraryID=${iteneraryID}`)
            .then(response=>{
                if(response.ok){
                    return response.json();
                }
                else{
                    throw new Error()
                }
            })
            .then(data=>{
                const iteneraryData= {
                    itenerary: data.itenerary,
                    placesData: data.places
                }
                resolve(iteneraryData);
            })
            .catch(err=>{
                reject(err);
            })
    })
}

function getMyReview(iteneraryID){
    return fetch(`/rating/itenerary/myrating?iteneraryID=${iteneraryID}`)
        .then(response=>{
            if(response.ok){
                return response.json()
            }
            else{
                throw new Error()
            }
        })
        .then(rating=>{
            return {likes: parseInt(rating[0].likes) || 0, comment: rating[0].comment || null}
        })
        .catch(err=>{
            return{ likes: 0, comment: null}
        })      
}

async function getImage(iteneraryID,number=0){
    try {
        const response = await fetch(`/api/iteneraries/images?iteneraryID=${iteneraryID}&number=${number}`);
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error();
        }
    }
    catch (err) {
        return [];
    }
}

async function getComments(iteneraryID){
    try {
        const response = await fetch(`/rating/itenerary/comments?iteneraryID=${iteneraryID}`);
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error();
        }
    }
    catch (err) {
        return [];
    }
        
}

function getLikes(iteneraryID){
    return fetch(`/rating/itenerary/likes?iteneraryID=${iteneraryID}`)
         .then(response=>{
             if (response.ok) {
                 return response.json();
             }
             else {
                 throw new Error();
             }
         })
         .then(ratio=>{
             return { likes: parseInt(ratio.likes), dislikes: parseInt(ratio.dislikes) };
         })
     .catch (err =>{
          return { likes: 0, dislikes: 0 };
     }  )
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

function getFavourite(iteneraryID){
    return new Promise((resolve,reject)=>{
        fetch(`/favourite/itenerary?iteneraryID=${iteneraryID}`)
            .then(response=>{
              if(response.ok){
                  return response.json()
              }
              else{
                  throw Error(response.statusText)
              } 
            })
            .then(status=>{
                resolve({favourite: parseInt(status.favourite)})
            })
            .catch(err=>{
                reject(err)
            })

    })
}

function getRoute(iteneraryID, myLocation=[]){
    const [mylat,mylon]=myLocation;
    return new Promise((resolve,reject)=>{
        fetch(`/navigate/itenerary?iteneraryID=${iteneraryID}&mylat=${mylat}&mylon=${mylon}`)
            .then(response=>{
                if(response.ok){
                    return response.json()
                }
                else{
                    response.text()
                        .then(text=>{
                            reject(text);
                        })
                }
            })
            .then(coordinates=>{
                let coordinatesSorted=[];
                coordinates.forEach(coordinate => {
                coordinatesSorted= [...coordinatesSorted, [parseFloat(coordinate[1]), parseFloat(coordinate[0])]];
                });
                resolve(coordinatesSorted);
            })
            .catch(err=>{
                console.log(err);
            })
            
    })
}

function postComment(iteneraryID, comment){
    const action= {
        iteneraryID,
        comment
    }
    return new Promise(async (resolve,reject)=>{
        try {
            const response = await fetch('/rating/itenerary/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(action)
            });
            if (response.ok) {
                resolve();
            }
            else if (response.status === 403) {
                response.text()
                    .then(text => {
                        reject(text);
                    });
            }
        }
        catch (err) {
            console.log(err);
        }
})
}


//Event Listeners


file.addEventListener('change', (e)=>{
    submitPhotos.disabled= false;
    let reader= new FileReader();
        
    reader.addEventListener('load', e=>{
        if(file.files[0].size<=(2*1024*1025))
        {   
            let img= document.createElement('img');
            img.setAttribute('src',reader.result);
            img.setAttribute('id',Math.random());
            img.setAttribute('class','uploadPhoto');
            img.setAttribute('onclick', `removePhoto(${img.id})`);
            imageview.appendChild(img);
            sendphoto.append(img.id, file.files[0]);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(file.files[0]);
})

loadImages.addEventListener('click', (e)=>{
    number= number+1;
    getImage(iteneraryID,number)
        .then(images=>{
            const imagesElement= document.querySelector('.images');
            imagesElement.innerHTML = images.map(image=>{
                return `
                <img src=${image}>
                `;
        }).join(' ');
    })
})


myRatingElement.forEach(vote=>
    {
        vote.addEventListener('click', (e)=>{

            const clickedButton= e.target;
            const clickedValue= parseInt(clickedButton.value)
            let value;
            if(myVote===clickedValue){
                value=0;
                clickedButton.checked=false;
            }
            else{
                value= clickedButton.value;
            }

            setMyVote(value);
            action={
                iteneraryID: iteneraryID,
                likes: value
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
 
submitPhotos.addEventListener('click', async e=>{
    sendphoto.set('iteneraryID',iteneraryID);
    let response= await fetch('/upload/itenerary/photos',{
        method: 'POST',
        body: sendphoto
    });
    let message= await response.text();
    alert(message);
    if(response.status===200){
        imageview.innerHTML='';
        submitPhotos.disabled=true;
        sendphoto = new FormData();
        displayImages(iteneraryID);
    }
})

navigate.addEventListener('click', (e)=>{
    if(!sessionStorage.getItem('location')){
        alert("Please Allow Location");
        return;
    }
    const myLocation= JSON.parse(sessionStorage.getItem('location'));
    getRoute(iteneraryID,myLocation)
        .then(coordinates=>{
            const polyline = L.polyline(coordinates, {color: 'red'}).addTo(mymap);
            const myposition=L.marker(myLocation).addTo(mymap).bindPopup(`Your Location`);
            mymap.panTo(myLocation,16);
            displayCurrentLocation();
            setInterval(displayCurrentLocation, 5000)
        })
        .catch(err=>{
            alert(err)
        })
})

submitComment.addEventListener('click', (e)=>{
    
    const comment= document.getElementById('comment');
    postComment(iteneraryID, comment.value)
        .then((response)=>{
            comment.value='';
            displayComments(iteneraryID); 
        }) 
        .catch(text=>{
            alert(text);
        })   

})

favourite.addEventListener('change', (e)=>{
    let star= 0;
    if(favourite.checked){
        star=1;
    }
    const action={
        iteneraryID: iteneraryID,
        star
    }
    fetch(`/favourite/itenerary`,{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(action)
    })
})