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
const title= document.getElementById('title');
const description= document.getElementById('description');
const button= document.querySelectorAll('input[name="rating"]');
const myComment= document.querySelector('.mycomment');
const imagesElement= document.querySelector('.images');
const placeList= document.getElementById('placeList');

//Functions Initialized On page load
displayIteneraryData(iteneraryID)
displayImages(iteneraryID);
displayComments(iteneraryID);
displayLikes(iteneraryID);
displayMyReview(iteneraryID);
displayFavourite(iteneraryID);

/************************************** EVENT LISTENERS ***************************************/

file.addEventListener('change', (e)=>{
    submitPhotos.disabled= false;
    const reader= new FileReader();
    const image= file.files[0];

    reader.addEventListener('load', e=>{
        if(file.files[0].size<=(2*1024*1025))
        {   
            let img = createImageElement(reader);
            imageview.appendChild(img);
            sendphoto.append(img.id, image);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(image);
})

loadImages.addEventListener('click', async (e)=>{
    number= number+1;
    try{
        const images= await getImage(iteneraryID,number)
        for (const image of images) {
                imagesElement.innerHTML +=  `<img src=${image}>`
        }
    }
    catch(err){
        console.log(err);
    }
})


myRatingElement.forEach(vote=>
    {
        vote.addEventListener('click', (e)=>{

            const clickedButton= e.target;
            let value = toggleMyVote(clickedButton);

            setMyVote(value);
            sendVote(value);
            
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

navigate.addEventListener('click', async (e)=>{
    try{
        const myLocation = await getCurrentLocation();
        const coordinates=  await getRoute(iteneraryID,myLocation);
        startNavigation(coordinates,myLocation);
    }
    catch(err){
        alert(err);
    }
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
    setMyFavourite(star);
})


/**********************************************************************************************/

/***********************************LOCATION FUNCTIONS*****************************************/
function displayMyLocation(){
    getCurrentLocation()
    .then(myLocation=>{
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

/**********************************************************************************************/

/*****************************ITENERARY/PLACE FUNCTIONS****************************************/

function displayIteneraryData(iteneraryID){
    getIteneraryData(iteneraryID)
        .then(({itenerary,placesData})=>{
            document.title= itenerary.name;
            title.innerHTML= itenerary.name;
            description.innerHTML= itenerary.description;
            placesData.map(addPlace);
            navigate.disabled=false;
            var div = document.getElementById("loading");
            div.parentNode.removeChild(div);
        })
        .catch(err=>{
            alert('something went wrong')
            location= '/..'
        })
}
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

function addPlace(place){
    const {name, lat, lon}= place;
    const id= Math.random();
    let markerToBeAdded= L.marker([lat,lon]).addTo(mymap).bindPopup(`${name}`);
    markerLayer=[...markerLayer, {placeID:id, marker: markerToBeAdded}];
    placeList.innerHTML+= `<li id='${id}' onmouseover="popupMarker(${id})"> ${name} </li>`
}

/**********************************************************************************************/

/************************************MY REVIEWS FUNCTIONS**************************************/
function setMyVote(vote){
    myVote= parseInt(vote);
}

function displayMyReview(iteneraryID){
    getMyReview(iteneraryID)
        .then(myReview=>{
            setMyVote(myReview.likes);
               button.forEach(vote=>{
                   if(vote.value== myReview.likes){
                       vote.checked=true;
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
function setMyFavourite(star) {
    const action = {
        iteneraryID: iteneraryID,
        star
    };
    fetch(`/favourite/itenerary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(action)
    });
}

/**********************************************************************************************/

/************************************* POST MY REVIEW *****************************************/
function sendVote(value) {
    action = {
        iteneraryID: iteneraryID,
        likes: value
    };
    fetch('/rating/itenerary/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(action)
    });
}

function toggleMyVote(clickedButton) {
    const clickedValue = parseInt(clickedButton.value);
    let value;
    if (myVote === clickedValue) {
        value = 0;
        clickedButton.checked = false;
    }
    else {
        value = clickedButton.value;
    }
    return value;
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
/**********************************************************************************************/

/*************************************** LIKES AND COMMENTS ***********************************/

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

/**********************************************************************************************/

/************************************ IMAGES FUNCTIONS ****************************************/
function createImageElement(reader) {
    let img = document.createElement('img');
    img.setAttribute('src', reader.result);
    img.setAttribute('id', Math.random());
    img.setAttribute('class', 'uploadPhoto');
    img.setAttribute('onclick', `removePhoto(${img.id})`);
    return img;
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

function removePhoto(id){
    let item= document.getElementById(id);
    item.parentNode.removeChild(item);
    sendphoto.delete(id);
} 
/**********************************************************************************************/

/********************************** MAPS AND MARKER FUNCTIONS *********************************/

function addMarker({lat, lon}){
    let marker=L.marker([lat,lon]).addTo(mymap);
    mymap.setView([lat,lon],16);
    return marker;
}

function popupMarker(id){
    let markerToPopup= markerLayer.find(marker=>{
        return marker.placeID===id;
    });
    markerToPopup.marker.openPopup();
  
}
/**************************************** NAVIGATION ******************************************/

function startNavigation(coordinates,myLocation) {
    const polyline = L.polyline(coordinates, { color: 'red' }).addTo(mymap);
    const myposition = L.marker(myLocation).addTo(mymap).bindPopup(`Your Location`);
    mymap.panTo(myLocation, 16);
    displayCurrentLocation();
    setInterval(displayCurrentLocation, 5000);
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

/**********************************************************************************************/

