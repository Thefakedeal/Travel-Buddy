const sqlQuery= require('./sqlwrapper');
const uuid= require('uuid');

async function addPlace(name,description,lat,lon,catagory,userID){
    
    const placeID= uuid.v4();
    const placeJSON={
        placeID,
        name,
        description,
        catagory,
        lat: parseFloat(lat).toPrecision(8),
        lon: parseFloat(lon).toPrecision(8),
        userID
    }

    try{
        await sqlQuery('INSERT INTO places SET ?', placeJSON)
        return placeID;
    }
    catch(err){
        return null;
    }
}
 
async function getPlaces(minlat,minlon,maxlat,maxlon){
    const values= [minlat,maxlat,minlon,maxlon];
    try{
        const places= await sqlQuery(`SELECT * from places
        WHERE (lat BETWEEN ? AND ?) AND (lon BETWEEN ? AND ?)
        ORDER BY rank DESC`,values);
        return places;
    }
    catch(err){
        return [];
    }  
}

async function getPlacesByCatagory(minlat,minlon,maxlat,maxlon,catagory){
    const values= [catagory,minlat,maxlat,minlon,maxlon]
    try{
        const places = sqlQuery(`SELECT * from places
        WHERE catagory=? AND (lat BETWEEN ? AND ?) AND (lon BETWEEN ? AND ?)
        ORDER BY rank DESC`, values);
        return places;
    }
    catch(err){
        return [];
    }
}

async function getPlace(placeID){
    try{
        result= await sqlQuery('SELECT * from places WHERE placeID=? LIMIT 1',placeID);
        if(result.length===0) return null;
        const place= result[0];
        return place;
    }
    catch(err){
        return null;
    }    
}

async function deletePlaceByUser(placeID,userID){
    try{
        await sqlQuery('DELETE FROM places WHERE placeID=? AND userID=?', [placeID, userID]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function deletePlace(placeID){
    try{
        await sqlQuery('DELETE FROM places WHERE placeID=?', placeID);
        return true;
    }
    catch(err){
        return false;
    }
}

async function getImages(placeID,numberOfImages, offsetAmount){
    const offset= parseInt(numberOfImages * offsetAmount);
    let arrayOfImageAddresses= [];
    try{
        const images= await sqlQuery('SELECT * from placephotos WHERE placeID=? LIMIT 6 OFFSET ?',[placeID,offset])
        if(images.length===0) return [];
        for(const image of images){
            arrayOfImageAddresses= [...arrayOfImageAddresses, `img/${image.imageID}.jpeg`];
        }
        return arrayOfImageAddresses;
    }
    catch(err){
        console.log(err);
        return [];
    }
}

async function addImagesToPlaceDatabase(placeID,userID, imageIDArray=[]){
    let imageDetails= [];
    for (const imageID of imageIDArray) {
        imageDetails= [...imageDetails,[imageID,placeID,userID]];
    }
    try{
        await sqlQuery('INSERT INTO placephotos(imageID,placeID,userID) VALUES ?', [imageDetails]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function getPlacesUploadedByUser(userID){
    try{
        const places= await sqlQuery('SELECT placeID,name,rank from places WHERE userID=?',userID);
        return places;
    }
    catch(err){
        console.log(err);
        return [];
    }
}

async function getVotes(placeID){
    let likes=0,dislikes=0;
    try{
        const votes= await sqlQuery('SELECT likes FROM placeRating WHERE placeID=?',placeID);
        for (const vote of votes) {
            if(vote.likes===1)
            {
                likes++;
                continue;
            }
            if(vote.likes===-1){
                dislikes++;
            }
        }
        const ratio= {likes,dislikes}
        return ratio;
    }
    catch(err){
        return {likes: 0, dislikes:0};
    }
}

async function getComments(placeID){
    try{
        const comments = await sqlQuery(`SELECT placeRating.userID, users.name,placeRating.comment 
                FROM placeRating INNER JOIN users ON placeRating.userID= users.userID
                WHERE (placeRating.placeID=? AND comment IS NOT NULL)`,placeID);
        return comments;
    }
    catch(err){
        console.log(err);
        return [];
    }
       
}

function updateRank(placeID) {
    sqlQuery('SELECT likes FROM placeRating WHERE placeID=?', placeID)
        .then((votes) => {
            const rank = votes.reduce((rank, vote) => {
                return rank = rank + vote.likes;
            }, 0);
            sqlQuery('UPDATE places SET rank=? WHERE placeID=?', [rank, placeID]);
        });
}

async function setMyVote(placeID,userID,vote){
    try{
        if(await postMyNewVote(placeID,userID,vote)) return true;
        if(await updateMyOldVote(placeID,userID,vote)) return true;
        return false;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function postMyNewVote(placeID, userID, vote) {
    const ratingID = uuid.v4();
    try{
        await sqlQuery(`INSERT INTO placeRating(ratingID, placeID, userID, likes) VALUES(?,?,?,?)`,
        [ratingID, placeID, userID, vote]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function updateMyOldVote(placeID,userID,vote){
    try{
        await sqlQuery('UPDATE placeRating SET likes=? WHERE placeID=? AND userID=?', [vote, placeID, userID]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function setMyComment(placeID,userID,comment){
    try{
        if(await postNewComment(placeID,userID,comment)) return true;
        if(await updateOldComment(placeID,userID,comment)) return true;
        return false;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function postNewComment(placeID,userID,comment){
    const ratingID= uuid.v4();
    try{
        await sqlQuery('INSERT INTO placeRating(ratingID, placeID, userID, comment) VALUES(?,?,?,?)',
        [ratingID,placeID,userID,comment]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function updateOldComment(placeID,userID,comment){
    try{
        await sqlQuery('UPDATE placeRating SET comment=? WHERE placeID=? AND userID=?',[comment,placeID,userID]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function getMyRatings(placeID,userID){
    try{
        const myRating= await sqlQuery('SELECT likes,comment FROM placeRating WHERE placeID=? AND userID=? LIMIT 1',
        [placeID,userID]);
        if(myRating.length===0) return {likes:0, comment: null};
        return {likes: parseInt(myRating[0].likes), comment: myRating[0].comment};
    }
    catch(err){
        return {likes:0, comment: null};
    }
}

async function isFavouritePlace(placeID,userID){
    try{
        const result =await sqlQuery(`SELECT COUNT(1) FROM places
        INNER JOIN userfavouriteplaces ON places.placeID= userfavouriteplaces.placeID
        WHERE userfavouriteplaces.userID=? AND userfavouriteplaces.placeID=? LIMIT 1`,[userID,placeID])
        
        if(result[0]['COUNT(1)']==1) return true;
        return false;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function setPlaceAsFavourite(userID,placeID){
    try{
        await sqlQuery('INSERT INTO userfavouriteplaces(userID, placeID) VALUES(?,?)',[userID, placeID]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function deletePlaceAsFavourite(userID,placeID){
    try{
        await sqlQuery('DELETE FROM userfavouriteplaces WHERE userID=? AND placeID=?',[userID, placeID]);
        return true;
    }
    catch(err){
        return false;
    }
    
}

async function getFavouritePlaces(userID){
    try{
       const places= await sqlQuery('SELECT DISTINCT places.placeID, places.name FROM places INNER JOIN userfavouriteplaces ON places.placeID= userfavouriteplaces.placeID WHERE userfavouriteplaces.userID=?',userID)
        return places;
    }
    catch(err){
        console.log(err);
        return [];
    }
}

exports.addPlace= addPlace;
exports.getPlaces= getPlaces;
exports.getPlacesByCatagory= getPlacesByCatagory;
exports.getPlace= getPlace;
exports.deletePlaceByUser= deletePlaceByUser;
exports.deletePlace= deletePlace;
exports.getImages= getImages;
exports.addImagesToPlaceDatabase= addImagesToPlaceDatabase;
exports.getPlacesUploadedByUser= getPlacesUploadedByUser;
exports.getVotes= getVotes;
exports.getComments= getComments;
exports.updateRank= updateRank;
exports.setMyVote= setMyVote;
exports.setMyComment= setMyComment;
exports.getMyRatings= getMyRatings;
exports.isFavouritePlace= isFavouritePlace;
exports.setPlaceAsFavourite= setPlaceAsFavourite;
exports.deletePlaceAsFavourite= deletePlaceAsFavourite;
exports.getFavouritePlaces= getFavouritePlaces;