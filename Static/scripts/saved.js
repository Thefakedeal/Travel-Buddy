const catagoriesSelector= document.getElementById('catagories');
const content= document.querySelector('.content');


function displayPlaces(){
    getPlaces()
        .then(places=>{
            content.innerHTML = places.map(place=>{
                const id= Math.random();
                return `<li id="${id}">
                <span class="placeName">${place.name}</span>
                <span class="deleteIt" title="Delete Place" data-placeID='${place.placeID}' data-name='${place.name}' onClick="deletePlace(this)"> 🗑️ </span> 
                </li>`
            }).join(' ')
        })
        .catch(err=>{
            alert(err);


        })
}

function getPlaces(){
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
                reject(err)
            })
    })
        
}

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

function displayIteneraries(){
    getIteneraries()
        .then(iteneraries=>{
            content.innerHTML = iteneraries.map(itenerary=>{
                const id= Math.random();
                return `<li id="${id}">
                <span class="placeName">${itenerary.name}</span>
                <span class="deleteIt" title="Delete Place" onClick="deletePlace(${id,itenerary.iteneraryID})"> 🗑️ </span> 
                </li>`
            }).join(' ')
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

function displayFavouritePlaces(){
    getFavouritePlaces()
        .then(favouritePlaces=>{
            content.innerHTML = favouritePlaces.map(favouritePlace=>{
                const id= Math.random();
                const starID= Math.random();
                return `<li id="${id}">
                <span class="placeName">${favouritePlace.name}</span>
                <input type="checkbox" name="favourite" id="${starID}" value='1' hidden> 
                <label for="favourite"> ★ </label> 
                </li>`
            })
        })
        .catch(err=>{
            alert(err)
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

function displayFavouriteIteneraries(){
    getFavouriteIteneraries()
    .then(favouriteIteneraries=>{
        content.innerHTML = favouriteIteneraries.map(favouriteItenerary=>{
            const id= Math.random();
            return `<li id="${id}">
            <span class="placeName">${favouriteItenerary.name}</span>
            <span class="deleteIt" title="Delete Place" onClick="deletePlace(${id,favouriteItenerary.iteneraryID})"> 🗑️ </span> 
            </li>`})

    })
    .catch(err=>{
        alert(err)
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

const catagories = 
[
    {
        name: 'Place',
        action: 'displayPlaces()'
    },
    {
        name: 'Itenerary',
        action: 'displayIteneraries()'
    },
    {
        name: 'Liked Places',
        action: 'displayFavouritePlaces()'
    },
    {
        name: 'Liked Iteneraries',
        action: 'displayFavouriteIteneraries()'
    }
    
]


catagories.forEach(catagory=>{
    catagoriesSelector.innerHTML +=
    `
    <label for=${catagory.name.split(' ').join('_')}> <h2> ${catagory.name} </h2> </label> 
    <input type="radio" name="catagory" id="${catagory.name.split(' ').join('_')}" onClick=${catagory.action} hidden>
    `
})

