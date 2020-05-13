var urlSearch= new URLSearchParams(location.search);
const placeID=urlSearch.get('placeID')
var myLocation= JSON.parse(sessionStorage.getItem('location'));
let number= 0;
file= document.getElementById('file');
imageview= document.querySelector('.imageview');
const submitPhotos=document.getElementById('submitPhotos');
sendphoto= new FormData();


displayPlaceData(placeID);
displayLikes(placeID);
displayComments(placeID)
displayMyReview(placeID);
displayImages(placeID);


function displayMyReview(placeID){
    getMyReview(placeID)
        .then(myReview=>{
            const button= document.querySelectorAll('input[name="rating"]');
            const myComment= document.querySelector('.mycomment');
               button.forEach(vote=>{
                   if(vote.value== myReview.likes){
                       vote.checked=true;
                       sessionStorage.setItem('myVote', myReview.likes);
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
        .then((response)=>{
            if(response.status===200){
                return response.json();
            }
            else{
                return [{likes: 0, comment: null}];
            }
        })
        .then((rating)=>{
            return rating[0];
        })
        .catch(err=>{
            console.log(err);
            return {likes: 0, comment: null};
        })
 }



function displayPlaceData(placeID){
    getPlaceData(placeID)
        .then((place)=>{
            document.title= place.name;
            document.getElementById('title').innerHTML= place.name;
            document.getElementById('description').innerHTML= place.description
            let {lat, lon} = place;
            sessionStorage.setItem('placelocation', JSON.stringify([lat,lon]))
            document.getElementById('navigate').disabled=false;
            var div = document.getElementById("loading");
            div.parentNode.removeChild(div);
            addMarker(place);
        })
}

function getPlaceData(placeID){
    return fetch(`/api/places/place?placeID=${placeID}`)
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
            return {
                placeID,
                name,
                description,
                lat,
                lon
            }
        })
        .catch((err)=>{
            alert('Something Went Wrong');
            location= '../';
            return {
                placeID: null, name: null, description: null, lat: null, lon: null
            }

        })
}

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


function getComments(placeID){
    return fetch(`/rating/place/comments?placeID=${placeID}`)
        .then(response=>{
            if(response.ok){
                return response.json()
            }
            else{
                throw new Error()
            }
        })
        .catch(err=>{
            return [];
        })
        
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

function getImage(placeID,number=0){
    return fetch(`/api/places/images?placeID=${placeID}&number=${number}`)
        .then(response=>{
            if(response.ok){
                return response.json();
            }
            else{
                throw new Error();
            }
        })
        .catch(err=>{
            return [];
        })
}

const loadImages= document.getElementById('loadImages');

loadImages.addEventListener('click', (e)=>{
    number= number+1;
    getImage(placeID,number)
        .then(images=>{
            const imagesElement= document.querySelector('.images');
            imagesElement.innerHTML = images.map(image=>{
                return `
                <img src=${image}>
                `;
        }).join(' ');
    })
})


function addMarker({name, lat, lon}){
    marker=L.marker([lat,lon]).addTo(mymap).bindPopup(`${name}`).openPopup();
    mymap.setView([lat,lon],16);
    return marker;
}
  






file.addEventListener('change', (e)=>{
    submitPhotos.disabled= false;
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
            sendphoto.append(img.id, file.files[0]);
        }
        else{
            alert("File Size Too Large. Please Use Image Less than 2MB")
        }
            
    })

    reader.readAsDataURL(file.files[0]);
})

function removeit(id){
    item= document.getElementById(id);
    item.parentNode.removeChild(item);
    sendphoto.delete(id);
}

submitPhotos.addEventListener('click', async e=>{
    sendphoto.set('placeID',placeID);
    reader= new FileReader();
    response= await fetch('/upload/places/photos',{
        method: 'POST',
        body: sendphoto
    });
    message= await response.text();
    alert(message);
    if(response.status===200){
        imageview.innerHTML='';
        submitPhotos.disabled=true;
        sendphoto = new FormData();
        displayImages(placeID);

    }
})

async function getRoute(){
    if(!sessionStorage.getItem('location')){
        alert("Please Allow Location");
        return;
    }
    [mylat, mylon]= JSON.parse(sessionStorage.getItem('location'));
    response= await fetch(`/navigate/place?placeID=${placeID}&mylat=${mylat}&mylon=${mylon}`);
    if(response.status===200){
        coordinates= await response.json();
        let routes=[];
        coordinates.forEach(coordinate => {
            routes= [...routes, [coordinate[1], coordinate[0]]];
        });
        polyline = L.polyline(routes, {color: 'red'}).addTo(mymap);
      
    }
    else{
        alert(await response.text());
    }
    myposition=L.marker([mylat,mylon]).addTo(mymap).bindPopup(`Your Location`);
    mymap.panTo([mylat,mylon],16);
}
 


const myRatingElement= document.getElementsByName('rating');

myRatingElement.forEach(vote=>
    {
        vote.addEventListener('click', async (e)=>{
            const myVote= parseInt(sessionStorage.getItem('myVote')) || 0;
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
            sessionStorage.setItem('myVote', value);
            action={
                placeID: placeID,
                likes: value
            }
            fetch('/rating/place/vote',{
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

    postComment(placeID, comment.value)
        .then((response)=>{
            if(response.ok){
                comment.value='';
                displayComments(placeID);
            }
            else if(response.status===403){
                response.text()
                    .then(value=>alert(value))
            }
            else{
                alert('Something Went Wrong')
            }
        })     

})


function postComment(placeID, comment){
    const action= {
        placeID,
        comment
    }
    return fetch('/rating/place/comment',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(action)
    })
    .then(response=>{
       return response;
    })
    
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
            if(response.ok){
                return response.json()
            }
            else{
                throw new Error();
            }
        })
        .then(ratio=>{
            return { likes: parseInt(ratio.likes), dislikes: parseInt(ratio.dislikes)}
        })
        .catch(err=>{
            return {likes: 0, dislikes: 0}
        })

}

async function getLike(){
        ratio= document.getElementById('ratio');
        likes= document.getElementById('likes');
        dislikes= document.getElementById('dislikes');
        response = await fetch(`/rating/place/likes?placeID=${placeID}`);
        result= await response.json();
        likeCount= parseInt(result.likes);
        dislikeCount= parseInt(result.dislikes);
        totalratio= document.getElementById('totalratio');
        totalratio.innerHTML= `Likes: <b> ${likeCount}</b> Dislikes: <b> ${dislikeCount} </b>`
        if(response.status===200 && (likeCount!==0 || dislikeCount!==0 )){
            likes.style.flex= likeCount;
            dislikes.style.flex= dislikeCount;
            ratio.style.display= 'flex'
        }
    }
