const content= document.querySelector('.content');
let catagories= document.getElementsByName('catagory');
let placesArray=[];
let iteneraryArray=[];
getSavedPlaces();

catagories.forEach(catagory=>
    { 
        catagory.addEventListener('change', async e=>{
            catagoryValue= document.querySelector('input[name="catagory"]:checked').value;
            if(catagoryValue==='iteneraries'){
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


async function getSavedIteneraries(){
    const response= await fetch(`api/saved/itenerary`)
    if(response.status!==200){
       return alert(await response.text());
    }
    else{
        result= await response.json()
        content.innerHTML= result.map((itenerary=>{
            const id= Math.random();
            iteneraryArray= [...iteneraryArray, {elementID: id, ...itenerary}];
            return `
            <li id="${id}">
                <span class="placeName">${itenerary.name}</span>
                <span class="deleteIt" title="Delete Place" onClick="deleteItenerary(${id})"> 🗑️ </span> 
            </li>
            `;
        })).join(' ');
    }
       
}

async function deletePlace(elementID){
    const place= placesArray.find(place=>{
        return place.elementID===elementID
    });
    const check= confirm(`Are You Sure You Want To Delete ${place.name}?`);
    if(!check){
        return;
    }
    const response= await fetch(`/delete/place?placeID=${place.placeID}`,{
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

async function deleteItenerary(elementID){
    const itenerary= iteneraryArray.find(itenerary=>{
        return itenerary.elementID===elementID
    });
    const check= confirm(`Are You Sure You Want To Delete ${itenerary.name}?`);
    if(!check){
        return;
    }
    const response= await fetch(`/delete/itenerary?iteneraryID=${itenerary.iteneraryID}`,{
        method: 'DELETE',
    });

    if(response.status===200){
        let deleteItenerary= document.getElementById(itenerary.elementID);
        deleteItenerary.parentNode.removeChild(deleteItenerary);
    }
    else if(response.status===401){
        alert(await response.text())
    }
    else{
        console.log(response.status)
        alert("Something Went Wrong")

    }

}