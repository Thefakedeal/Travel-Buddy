const urlSearch= new URLSearchParams(location.search);
const iteneraryID=urlSearch.get('iteneraryID');
let number= 0;
let markerLayer=[];
const placeList= document.getElementById('placeList');
let currentLocation;
const favourite= document.getElementById('favourite');
const file= document.getElementById('file');
const imageview= document.querySelector('.imageview');
const submitPhotos=document.getElementById('submitPhotos');
let sendphoto= new FormData();
let myVote= 0;

getCurrentLocation()
    .then(mylocation=>{
        sessionStorage.setItem('location', JSON.stringify(mylocation));
    })

window.onload= ()=>{
    const myLocation= JSON.parse(sessionStorage.getItem('location'));
    const myposition=L.marker(myLocation).addTo(mymap).bindPopup(`Starting Postiton`).openPopup();
}

// getItenerary(iteneraryID);
displayIteneraryData(iteneraryID)
// getImage(iteneraryID);
displayImages(iteneraryID);
displayComments(iteneraryID);
// getComments();
displayLikes(iteneraryID);
// getLikes();
displayMyReview(iteneraryID);
// myRating();
displayFavourite(iteneraryID);


function setMyVote(vote){
    myVote= parseInt(vote);
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

function displayIteneraryData(iteneraryID){
    getItenerary(iteneraryID)
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
function getItenerary(iteneraryID){
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


// async function getItenerary(iteneraryID){
//     let response = await fetch(`/api/iteneraries/itenerary?iteneraryID=${iteneraryID}`);
//     if(response.status===200)
//     {
//         const {itenerary, places: placesData}= await response.json();
//         document.title= itenerary.name;
//         document.getElementById('title').innerHTML= itenerary.name;
//         document.getElementById('description').innerHTML= itenerary.description;
//         placesData.map(addPlace);
//         document.getElementById('navigate').disabled=false;
//         var div = document.getElementById("loading");
//         div.parentNode.removeChild(div);
        
//     }
//     else{
//         alert( await response.text())
//         location= '/..'
//     }
// }


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


function addMarker({lat, lon}){
    let marker=L.marker([lat,lon]).addTo(mymap);
    mymap.setView([lat,lon],16);
    return marker;
}
  






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

const loadImages= document.getElementById('loadImages');

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


const myRatingElement= document.getElementsByName('rating');

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
 
const submitComment= document.getElementById('submitComment');

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
    
    
    async function getLikes(iteneraryID){
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
    

    async function getLike(){
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

const navigate= document.getElementById('navigate');

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
            currentLocation= L.marker([lat,lon]).addTo(mymap).bindPopup(`Current Postion`).openPopup();
        })
        
}


//For Listing and unlisting the itenerary as a favourite.

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

//To Display if the itenerary is in user's favourite or not

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