const content= document.querySelector('.content');
const catagories= document.getElementsByName('catagory');
let placesArray=[];
getSavedPlaces();

catagories.forEach(catagory=>
    {
        catagory.addEventListener('change', async e=>{
            catagory= document.querySelector('input[name="catagory"]:checked').value;
            if(catagory==='iteneraries'){
                getSavedIteneraries();
            }
            else{
                getSavedPlaces()
            }
        });
    })


async function getSavedPlaces(){
    const response= await fetch(`api/saved/places`)
    if(response.status!==200){
       return alert(await response.text());
    }
    else{
        result= await response.json()
        content.innerHTML= result.map((place=>{
            const id= Math.random();
            placesArray= [...placesArray, {elementID: id, ...place}];
            return `
            <li id="${id}">
                <span class="placeName">${place.name}</span>
                <span class="deleteIt" title="Delete Place" onClick="deletePlace(${id})"> 🗑️ </span> 
            </li>
            `;
        })).join(' ');
    }
       
}

async function deletePlace(elementID){
    const place= placesArray.find(place=>{
        return place.elementID= elementID
    });
    const check= confirm(`Are You Sure You Want To Delete ${place.name}?`);
    if(!check){
        return;
    }
    const response= await fetch(`/delete/place?placeID=${place.id}`,{
        method: 'DELETE',
    });

    if(response.status===200){
        let deletePlace= document.getElementById(place.elementID);
        deletePlace.parentNode.removeChild(deletePlace);
    }
    else if(response.status===401){
        alert(await response.text())
    }
    else{
        console.log(response.status)
        alert("Something Went Wrong")

    }


}

