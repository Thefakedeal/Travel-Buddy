function getMinMaxLatitudeLongitude(latitude,longitude, range=0.0){
    const lat= parseFloat(latitude).toFixed(8);
    const lon= parseFloat(longitude).toFixed(8);
    const minlat= parseFloat(lat) - range;
    const maxlat= parseFloat(lat) + range;
    const minlon= parseFloat(lon) - range;
    const maxlon= parseFloat(lon) + range;
    return [minlat,maxlat,minlon,maxlon];
}

exports.getMinMaxLatitudeLongitude= getMinMaxLatitudeLongitude;