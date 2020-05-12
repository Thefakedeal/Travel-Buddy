
const mymap = L.map('map');
let positions= [];
let myPosition= [];
let markers= [];
polyline = L.polyline(positions, {color: 'red'});
    
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);


mymap.setView([26.8114,87.2850], 13);

    
    


