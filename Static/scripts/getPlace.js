//Global Constants
const URLSEARCH= new URLSearchParams(location.search);
const PLACEID=URLSEARCH.get('placeID')

//Global Variables
let number= 0; //iteration of how many sets of images have been requested
let sendphoto= new FormData(); //form to send photos
let currentLocationMarker; //Marker for current live location
let myVote= 0; //upvote(1) or downvote(-1), if its none its value is 0

//HTML ELEMENTS
const imageview= document.querySelector('.imageview'); //for images about to be uploaded by user
const file= document.getElementById('file'); //loads images to be updated
const submitPhotos=document.getElementById('submitPhotos'); //submit button for image upload
const submitComment= document.getElementById('submitComment'); //submit button for posting comment
const myRatingElement= document.getElementsByName('rating'); // Upvote and Downvote radio buttons
const navigate= document.getElementById('navigate'); //to get navigation routes
const loadImages= document.getElementById('loadImages'); //load more sets of images
const favourite = document.getElementById('favourite'); //checkbox showing if place is favourited by user or not
const title= document.getElementById('title');
const description= document.getElementById('description');
const button= document.querySelectorAll('input[name="rating"]');
const myComment= document.querySelector('.mycomment');
const imagesElement= document.querySelector('.images');
const comment= document.getElementById('comment');

//Functions initialized on page load
displayPlaceData(PLACEID);
displayLikes(PLACEID);
displayComments(PLACEID)
displayMyReview(PLACEID);
displayImages(PLACEID);
displayFavourite(PLACEID);
displayMyLocation();


/******************************** EVENT LISTENERS **********************************************/
submitComment.addEventListener('click', (e)=>{
    postComment(PLACEID, comment.value)
        .then((response)=>{
            comment.value='';
            displayComments(PLACEID); 
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

myRatingElement.forEach(vote=>
    {
        vote.addEventListener('click', (e)=>{
            const clickedButton= e.target;
            let value = toggleMyVote(clickedButton);
            setMyVote(value);
            sendVote(value);
            
        });
})

navigate.addEventListener('click', async (e)=>{
    try{
        const myLocation = await getCurrentLocation();
        const coordinates=  await getRoute(PLACEID,myLocation);
        startNavigation(coordinates,myLocation);
    }
    catch(err){
        alert(err);
    }
})

loadImages.addEventListener('click', (e)=>{
    number= number+1;
    getImage(PLACEID,number)
        .then(images=>{
            imagesElement.innerHTML += images.map(image=>{
                return `
                <img src=${image}>
                `;
        }).join(' ');
    })
})

submitPhotos.addEventListener('click', async e=>{
    sendphoto.set('placeID',PLACEID);
    response= await fetch('/upload/places/photos',{
        method: 'POST',
        body: sendphoto
    });
    message= await response.text();
    alert(message);
    if(response.ok){
        imageview.innerHTML='';
        submitPhotos.disabled=true;
        sendphoto = new FormData();
        displayImages(PLACEID);

    }
})


file.addEventListener('change', (e)=>{
    submitPhotos.disabled= false;
    const reader= new FileReader();
    const image= file.files[0];    
    reader.addEventListener('load', e=>{
        if(image.size<=(2*1024*1025))
        {   
            const img = createImageElement(reader);
            imageview.appendChild(img);
            sendphoto.append(img.id, image);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(image);
})



/***********************************LOCATION FUNCTIONS*****************************************/
function displayMyLocation(){
    getCurrentLocation()
    .then(myLocation=>{
        const [latitude,longitude]= myLocation;
        const marker=L.marker([latitude,longitude]).addTo(mymap).bindPopup(`You Are Here`).openPopup();
        
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


function displayCurrentLocation(){
    getCurrentLocation()
    .then(([lat,lon])=>{
            if(currentLocationMarker){
                mymap.removeLayer(currentLocationMarker);
            }
            currentLocationMarker= L.marker([lat,lon]).addTo(mymap).bindPopup(`Current Postion`).openPopup();
        })       
}

/**********************************************************************************************/

/*********************************PLACE FUNCTIONS***************************************/

function displayPlaceData(placeID){
    getPlaceData(placeID)
        .then((place)=>{
            document.title= place.name;
            title.innerHTML= place.name;
            description.innerHTML= place.description
            document.getElementById('navigate').disabled=false;
            var div = document.getElementById("loading");
            div.parentNode.removeChild(div);
            addMarker(place);
        })
        .catch(err=>{
            alert('Something Went Wrong');
            location= '../';
        })
}

function getPlaceData(placeID){
    return new Promise((resolve, reject)=>{
    fetch(`/api/places/place?placeID=${placeID}`)
        .then((response)=>{
            if(response.ok){
                return response.json();
            }
            else{
                throw new Error()
            }
        })
        .then((place)=>{
            const {placeID, name,description, lat, lon} = place;
            const returnValue= {
                placeID,
                name,
                description,
                lat,
                lon
            }
            resolve(returnValue);
        })
        .catch((err)=>{
            reject(err);
        })

    })
}

/**********************************************************************************************/

/*********************************MY REVIEWS FUNCTIONS********************************************/

function setMyVote(vote){
    myVote= parseInt(vote);
}

function displayMyReview(placeID){
    getMyReview(placeID)
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

function getMyReview(placeID){
    return fetch(`/rating/place/myrating?placeID=${placeID}`)
        .then(response=>{
            if(response.ok){
                return response.json()
            }
            else{
                throw new Error()
            }
        })
        .then(rating=>{
            return {likes: parseInt(rating.likes) || 0, comment: rating.comment || null}
        })
        .catch(err=>{
            return{ likes: 0, comment: null}
        })      
}

function displayFavourite(placeID){
    getFavourite(placeID)
        .then(response=>{
            if(response.favourite===1){
                favourite.checked=true;
            }
        })
        .catch(err=>{
            favourite.checked=false;
        })
}

function getFavourite(placeID){
    return new Promise((resolve,reject)=>{
        fetch(`/favourite/place?placeID=${placeID}`)
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



/**********************************************************************************************/

/********************************** POST MY REVIEW ******************************************/
function sendVote(value) {
    action = {
        placeID: PLACEID,
        likes: value
    };
    fetch('/rating/place/vote', {
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
        value = clickedValue;
    }
    return value;
}

function setMyFavourite(star) {
    const action = {
        placeID: PLACEID,
        star
    };
    fetch(`/favourite/place`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(action)
    });
}

function postComment(placeID, comment){
    const action= {
        placeID,
        comment
    }
    return new Promise(async (resolve,reject)=>{
        try {
            const response = await fetch('/rating/place/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(action)
            });
            if (response.ok) {
                resolve(response.ok);
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

/************************************** LIKES AND COMMENTS **************************************/

function displayComments(placeID)
{
    getComments(placeID)
        .then(comments=>{
            const commentElements= document.querySelector('.comments')
            commentElements.innerHTML= comments.map(comment=>{
                return `
                <dt> <b> ${comment.name} </b>  <dt>
                <dd> ${comment.comment} </dd>`;
            })
        })
}

async function getComments(placeID){
    try {
        const response = await fetch(`/rating/place/comments?placeID=${placeID}`);
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

function displayLikes(placeID){
    getLikes(placeID)
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

function getLikes(placeID){
    return fetch(`/rating/place/likes?placeID=${placeID}`)
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
/**********************************************************************************************/

/**********************************IMAGES FUNCTION*****************************************/
function createImageElement(reader) {
    const img = document.createElement('img');
    img.setAttribute('src', reader.result);
    img.setAttribute('id', Math.random());
    img.setAttribute('class', 'uploadPhoto');
    img.setAttribute('onclick', `removePhoto(${img.id})`);
    return img;
}

function displayImages(placeID){
    getImage(placeID)
        .then(images=>{
            const imagesElement= document.querySelector('.images');
            imagesElement.innerHTML = images.map(image=>{
                return `
                    <img src=${image}>
                `;
            }).join(' ');
        })
}

async function getImage(placeID,number=0){
    try {
        const response = await fetch(`/api/places/images?placeID=${placeID}&number=${number}`);
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
    item= document.getElementById(id);
    item.parentNode.removeChild(item);
    sendphoto.delete(id);
}

/**********************************************************************************************/

/********************************MAPS AND MARKER FUNCTIONS******************************************/

function addMarker({name, lat, lon}){
    marker=L.marker([lat,lon]).addTo(mymap).bindPopup(`${name}`).openPopup();
    mymap.setView([lat,lon],16);
    return marker;
}


/******************************************* NAVIGATION *****************************************/

function startNavigation(coordinates, myLocation) {
    const polyline = L.polyline(coordinates, { color: 'red' }).addTo(mymap);
    const myposition = L.marker(myLocation).addTo(mymap).bindPopup(`Your Location`);
    mymap.panTo(myLocation, 16);
    displayCurrentLocation();
    setInterval(displayCurrentLocation, 5000);
}


function getRoute(placeID, myLocation=[]){
    const [mylat,mylon]=myLocation;
    return new Promise((resolve,reject)=>{
        fetch(`/navigate/place?placeID=${placeID}&mylat=${mylat}&mylon=${mylon}`)
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

