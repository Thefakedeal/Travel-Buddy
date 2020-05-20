//page Constants
const catagories = 
[
    {
        name: 'Saved Places',
        action: 'displayPlaces()'
    },
    {
        name: 'Saved Iteneraries',
        action: 'displayIteneraries()'
    },
    {
        name: 'Favourite Places',
        action: 'displayFavouritePlaces()'
    },
    {
        name: 'Favourite Iteneraries',
        action: 'displayFavouriteIteneraries()'
    }
    
]


//HTML ELEMENTS
const catagoriesSelector= document.getElementById('catagories');
const content= document.querySelector('.content');

//Functions Initialized on start
catagories.forEach(catagory=>{
    catagoriesSelector.innerHTML +=
    `
    <label for=${catagory.name.split(' ').join('_')}> <h3> ${catagory.name} </h3> </label> 
    <input type="radio" name="catagory" id="${catagory.name.split(' ').join('_')}" onClick=${catagory.action} hidden>
    `
})

displayPlaces();

//Display Data on Page
function displayPlaces(){
    getPlaces()
        .then(places=>{
            content.innerHTML = places.map(place=>{
                return `<li>
                <span class="placeName">${place.name}</span>
                <span class="deleteIt" title="Delete Place" data-placeID='${place.placeID}' data-name='${place.name}' onClick="deletePlace(this)"> 🗑️  </span> 
                </li>`
            }).join(' ')
        })
        .catch(err=>{
            alert(err);


        })
}

function displayIteneraries(){
    getIteneraries()
        .then(iteneraries=>{
            content.innerHTML = iteneraries.map(itenerary=>{
                return `<li>
                <span class="placeName">${itenerary.name}</span>
                <span class="deleteIt" title="Delete Place" data-name='${itenerary.name}' data-iteneraryID='${itenerary.iteneraryID}' onClick="deleteItenerary(this)"> 🗑️ </span> 
                </li>`
            }).join(' ')
        })
        .catch(err=>{
            console.log(err)
        })
}

function displayFavouritePlaces(){
    getFavouritePlaces()
        .then(favouritePlaces=>{
            content.innerHTML = favouritePlaces.map(favouritePlace=>{
                const starID= Math.random();
                return `<li>
                <span class="placeName">${favouritePlace.name}</span>
                <input type="checkbox" class="favourite" id="${starID}" value='1' data-placeID='${favouritePlace.placeID}' onClick='changeFavouritePlace(this)' checked hidden> 
                <label for="${starID}"> ★  </label> 
                </li>`
            })
        })
        .catch(err=>{
            alert(err)
        })
}

function displayFavouriteIteneraries(){
    getFavouriteIteneraries()
    .then(favouriteIteneraries=>{
        content.innerHTML = favouriteIteneraries.map(favouriteItenerary=>{
            const starID= Math.random()
            return `<li>
            <span class="iteneraryName">${favouriteItenerary.name}</span>
            <input type="checkbox" class="favourite" id="${starID}" value='1' data-iteneraryID='${favouriteItenerary.iteneraryID}' onClick='changeFavouriteItenerary(this)' checked hidden> 
            <label for="${starID}"> ★ </label>
            </li>`})

    })
    .catch(err=>{
        alert(err)
    })
}


//Change Data in page

function deletePlace(place){
    const placeID= place.getAttribute('data-placeID');
    const name= place.getAttribute('data-name')
    const check= confirm(`Are You Sure You Want To Delete ${name}?`);
    if(!check) return;
    deletePlaceFromDatabase(placeID)
        .then(()=>{
            const deleteNode=place.parentNode;
            deleteNode.parentNode.removeChild(deleteNode);
        })
        .catch(err=>{
            alert(err)
        })
}

function deleteItenerary(itenerary){
    const iteneraryID= itenerary.getAttribute('data-iteneraryID');
    const name= itenerary.getAttribute('data-name')
    const check= confirm(`Are You Sure You Want To Delete ${name}?`);
    if(!check) return;
    deleteIteneraryFromDatabase(iteneraryID)
        .then(()=>{
            const deleteNode=itenerary.parentNode;
            deleteNode.parentNode.removeChild(deleteNode);
        })
        .catch(err=>{
            alert(err)
        })
}

function changeFavouritePlace(favouritePlace){
    const placeID= favouritePlace.getAttribute('data-placeID');
    let star= 0;
    if(favouritePlace.checked){
        star=1;
    }
    changeFavouritePlace(placeID,star);
}

function changeFavouriteItenerary(favouriteItenerary){
    const iteneraryID= favouriteItenerary.getAttribute('data-iteneraryID');
    let star= 0;
    if(favouriteItenerary.checked){
        star=1;
    }
    changeFavouriteItenerary(iteneraryID,star)
}

//Functions to change data in  the network

function deletePlaceFromDatabase(placeID){
    return new Promise((resolve,reject)=>{
        fetch(`/delete/place?placeID=${placeID}`,{
            method: 'DELETE',
        })
        .then(response=>{
            if(response.ok){
                resolve()
            }
            return response.text()
        })
        .then(text=>{
            reject(text)
        })
        .catch(err=>{
            console.log(err)
        })
    })
}

function deleteIteneraryFromDatabase(iteneraryID){
    return new Promise((resolve,reject)=>{
        fetch(`/delete/itenerary?iteneraryID=${iteneraryID}`,{
            method: 'DELETE',
        })
        .then(response=>{
            if(response.ok){
                resolve()
            }
            return response.text()
        })
        .then(text=>{
            reject(text)
        })
        .catch(err=>{
            console.log(err)
        })
    })
}

function changeFavouritePlaceOnDatabase(placeID,star){
    const action={
        placeID: placeID,
        star
    }
    fetch(`/favourite/place`,{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(action)
    })
}

function changeFavouriteIteneraryOnDatabase(iteneraryID,star){
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
}


//Functions to get data from network

function getPlaces(){
    let okFlag;
    return new Promise((resolve, reject)=>{
        fetch(`/api/saved/places`) 
            .then(response=>{
                okFlag= response.ok
                if(response.ok) return response.json()
                return response.text()
            })
            .then(placesResponse=>{
                if(okFlag)

                return placesResponse.map(place=>{
                    return {placeID:place.placeID, name: place.name}
                })
                reject(placesResponse)
            })
            .then(placeArray=>{
                resolve(placeArray)
            })
            .catch(err=>{
                console.log(err)
            })
    })
        
}

function getIteneraries(){
    return new Promise((resolve, reject)=>{
        fetch(`/api/saved/iteneraries`) 
            .then(response=>{
                okFlag= response.ok
                if(response.ok) return response.json()
                return response.text()
            })
            .then(itenerariesResponse=>{
                if(okFlag)
                return itenerariesResponse.map(itenerary=>{
                    return {iteneraryID:itenerary.iteneraryID, name: itenerary.name}
                })
                reject(itenerariesResponse)
            })
            .then(iteneraryArray=>{
                resolve(iteneraryArray)
            })
            .catch(err=>{
                reject(err)
            })
    })
}

function getFavouritePlaces(){
    return new Promise((resolve, reject)=>{
        fetch(`/favourite/places`) 
            .then(response=>{
                okFlag= response.ok
                if(response.ok) return response.json()
                return response.text()
            })
            .then(favouritePlaceResponse=>{
                if(okFlag)
                return favouritePlaceResponse.map(place=>{
                    return {placeID:place.placeID, name: place.name}
                })
                reject(favouritePlaceResponse)
            })
            .then(placeArray=>{
                resolve(placeArray)
            })
            .catch(err=>{
                reject(err)
            })
    })
}

function getFavouriteIteneraries(){
    return new Promise((resolve, reject)=>{
        fetch(`/favourite/iteneraries`) 
            .then(response=>{
                okFlag= response.ok
                if(response.ok) return response.json()
                return response.text()
            })
            .then(favouriteIteneraryResponse=>{
                if(okFlag)
                return favouriteIteneraryResponse.map(itenerary=>{
                    return {iteneraryID:itenerary.iteneraryID, name: itenerary.name}
                })
                reject(favouriteIteneraryResponse)
            })
            .then(iteneraryArray=>{
                resolve(iteneraryArray)
            })
            .catch(err=>{
                reject(err)
            })
    })
}