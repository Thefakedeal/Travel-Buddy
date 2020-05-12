getCatagories();

let [lat, lon]= JSON.parse(localStorage.getItem('location'));

mymap.setView([lat,lon], 17);

file= document.getElementById('file');
imageview= document.querySelector('.imageview');
selectCatagory= document.getElementById('catagory');
submitButton= document.getElementById('submit');
form= document.getElementById('form');

submitButton.disabled= true;
let placeDatatoSend= new FormData()
let marker;
let uploadJSON=[];


mymap.on('click', e => {
    lat= e.latlng.lat;
    lon= e.latlng.lng;
    submitButton.disabled= false;
    if(marker!== undefined){
        mymap.removeLayer(marker)
    }
    marker= L.marker([lat,lon]).addTo(mymap);
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
            placeDatatoSend.append(img.id, file.files[0]);
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
    catagory= document.getElementById('catagory').value;
        uploadPhoto= document.getElementsByClassName('uploadPhoto');
        placeDatatoSend.set('reqId',Math.random()*10000);
        placeDatatoSend.set('name',name )
        placeDatatoSend.set('description',description )
        placeDatatoSend.set('catagory',catagory)
        placeDatatoSend.set('lat',lat.toFixed(5))
        placeDatatoSend.set('lon',lon.toFixed(5))
        
        
        response= await fetch('/upload/places',{
            method: 'POST',
            body: placeDatatoSend
        })
        
        responseText= await response.text();   
        
        if(response.status===200){
            location= `../places/place?id=${responseText}`
        }
        else{
            alert(responseText);
        }
        
    });
    
    
function removeit(id){
        item= document.getElementById(id);
        item.parentNode.removeChild(item);
        placeDatatoSend.delete(id);
    }




async function getCatagories(){
    response= await fetch('/api/places/catagories');
    availableCatagory= await response.json();
    selectCatagory.innerHTML= availableCatagory.map(catagory =>{
        return `
        <option value="${catagory}"> ${catagory} </option>
        `
    }).join(' ');
}
