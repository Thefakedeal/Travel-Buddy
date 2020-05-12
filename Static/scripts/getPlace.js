var urlSearch= new URLSearchParams(location.search);
var placeID=urlSearch.get('placeID')
var myLocation= JSON.parse(sessionStorage.getItem('location'));
let number= 0;

file= document.getElementById('file');
imageview= document.querySelector('.imageview');
submit=document.getElementById('submit');
sendphoto= new FormData();

getPlace(placeID);
getImage(placeID);
getComments();
getLikes();
myRating();

async function getPlace(placeID){
    content= document.querySelector('.content');
    response = await fetch(`/api/places/place?placeID=${placeID}`);
    if(response.status===200)
    {
        place= await response.json();
        document.title= place.name;
        document.getElementById('title').innerHTML= place.name;
        document.getElementById('description').innerHTML= place.description
        let {lat, lon} = place;
        sessionStorage.setItem('placelocation', JSON.stringify([lat,lon]))
        document.getElementById('navigate').disabled=false;
        var div = document.getElementById("loading");
        div.parentNode.removeChild(div);
        
        addMarker(place);
    }
    else{
        alert( await response.text())
        location= '../'
    }
}


async function getImage(placeID){
    number=0;
    response = await fetch(`/api/places/images?placeID=${placeID}&number=${number}`);
    if(response.status===200)
    {   images= document.querySelector('.images');
        imagesResponse= await response.json();
        images.innerHTML = imagesResponse.map(images=>{
            return `
                <img src=${images}>
            `;
        }).join(' ');

    }
    
}

function addMarker({lat, lon}){
    marker=L.marker([lat,lon]).addTo(mymap);
    mymap.setView([lat,lon],16);
    return marker;
}
  






file.addEventListener('change', (e)=>{
    submit.disabled= false;
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

submit.addEventListener('click', async e=>{
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
        submit.disabled=true;
        sendphoto = new FormData();
        getImage(placeID);

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
 

async function loadPics(){
    number++;
    response = await fetch(`/api/places/images?placeID=${placeID}&number=${number}`);
    if(response.status===200)
    {   images= document.querySelector('.images');
        imagesResponse= await response.json();
        images.innerHTML += imagesResponse.map(images=>{
            return `
                <img src=${images}>
            `;
        }).join(' ');

    }
}


rating= document.getElementsByName('rating');

rating.forEach(vote=>
    {
        vote.addEventListener('change', async e=>{
            likes= document.querySelector('input[name="rating"]:checked').value;
            action={
                placeID: placeID,
                likes: likes
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


   async function submitComment(){
        comment= document.getElementById('comment');
        action= {
            placeID: placeID,
            comment: comment.value
        }
        response= await fetch('/rating/place/comment',{
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
        comments= document.querySelector('.comments')
        response = await fetch(`/rating/place/comments?placeID=${placeID}`);
        result= await response.json();
        comments.innerHTML= result.map(comment=>{
            return `
            <dt> <b> ${comment.name} </b>  <dt>
            <dd> ${comment.comment} </dd>`;
        })
    }

    async function getLikes(){
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

    async function myRating(){
       response= await fetch(`/rating/place/myrating?placeID=${placeID}`);
       myComment= document.querySelector('.mycomment');
       if(response.status===200){
           rating= await response.json();
           button= document.querySelectorAll('input[name="rating"]');
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