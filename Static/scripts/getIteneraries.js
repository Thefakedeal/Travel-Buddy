const content = document.getElementById('content');
const div = document.getElementById("loading");
getCurrentLocation()
    .then(([latitude, longitude]) => {
        displayIteneraries(latitude, longitude);
    })
    .catch(err => {
        alert(err);
    })

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                ({
                    coords: {
                        latitude: myLatitude,
                        longitude: myLongitude
                    }
                }) => {
                    resolve([myLatitude, myLongitude]);
                },
                () => {
                    reject("Can't Access Location");
                }
            );
        } else {
            reject("Can't Access Location")
        }
    })
}

function displayIteneraries(latitude, longitude) {
    getIteneraries(latitude, longitude)
        .then(iteneraries => {
            iteneraries.forEach(itenerary => {
                content.innerHTML += returnIteneraryElement(itenerary);
            });
            div.parentNode.removeChild(div);
        })

}

async function getIteneraries(latitude, longitude) {
    try {
        const response = await fetch(`/api/iteneraries?lat=${latitude}&lon=${longitude}`);
        if (response.ok) {
            return response.json();
        } else {
            return [];
        }
    } catch (err) {
        return [];
    }

}

function returnIteneraryElement(itenerary) {
    return `
    <a href="${location}/itenerary?iteneraryID=${itenerary.iteneraryID}" title="${itenerary.name}">
        <li>
            <span class="placeName"> <b> ${itenerary.name} </b> </span>
        </li>
    </a>
    `
}