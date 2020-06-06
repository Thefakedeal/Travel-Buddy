const sqlQuery= require('./sqlwrapper');
const uuid= require('uuid');

async function getIteneraries(minlat,minlon,maxlat,maxlon){
    try{
        const iteneraries = await sqlQuery(`SELECT iteneraryID, name FROM itenerary
        WHERE iteneraryID IN 
        (SELECT DISTINCT iteneraryID FROM iteneraryPlaces WHERE (lat BETWEEN ? AND ?) AND (lon BETWEEN ? AND ?))
        ORDER BY rank DESC`, [minlat, maxlat, minlon, maxlon]);
        return iteneraries;
    }
    catch(err){
        console.log(err);
        return [];
    }
}

async function addItenerary(name,description,userID,places=[]){
    const iteneraryID= uuid.v4();
    try{
        await sqlQuery('INSERT INTO itenerary(iteneraryID, name,description, userID) VALUES(?,?,?,?)',[iteneraryID,name,description,userID]);
        if(await addPlacesToItenerary(iteneraryID,places)) return iteneraryID;
        deleteItenerary(iteneraryID);
        return null;
    }
    catch(err){
        console.log(err);
        return null;
    }
}

async function addPlacesToItenerary(iteneraryID,places=[]){
    let placesToBeInserted= []

    for(const place of places){
        const placeID= uuid.v4();
        const name= place.name;
        const latitude= parseFloat(place.lat).toPrecision(8);
        const longitude= parseFloat(place.lon).toPrecision(8);
        placesToBeInserted= [...placesToBeInserted,[placeID,iteneraryID,name,latitude,longitude]];
    }
    
    try{
        await sqlQuery('INSERT INTO iteneraryPlaces(placeID,iteneraryID,name,lat,lon) VALUES ?',[placesToBeInserted]);
        return true;
    }
    catch(err){
        console.log(err)
        return false;
    }
}

async function getItenerary(iteneraryID){
    try{
        const [itenerary=null]= await sqlQuery('SELECT * from itenerary WHERE iteneraryID=? LIMIT 1',iteneraryID);
        return itenerary;
    }
    catch(err){
        return null;
    }
}

async function getIteneraryPlaces(iteneraryID){
    try{
        const places= await sqlQuery('SELECT * FROM iteneraryplaces where iteneraryID=? LIMIT 10',iteneraryID);
        return places;
    }
    catch(err){
        return [];
    }
}

async function getItenerariesSavedByUser(userID) {
    try {
        const iteneraries = await sqlQuery('SELECT iteneraryID,name,rank from itenerary WHERE userID=?', userID);
        return iteneraries;
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function setIteneraryAsFavourite(userID,iteneraryID){
    try{
        await sqlQuery('INSERT INTO userfavouriteitenerary(userID, iteneraryID) VALUES(?,?)',[userID, iteneraryID]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function deleteIteneraryAsFavourite(userID,iteneraryID){
    try{
        await sqlQuery('DELETE FROM userfavouriteitenerary WHERE userID=? AND iteneraryID=?',[userID, iteneraryID])
        return true;
    }
    catch(err){ 
        return false;
    }
}

async function getFavouriteIteneraries(userID){
    try{
        const iteneraries= await sqlQuery(`SELECT DISTINCT itenerary.iteneraryID, itenerary.name
        FROM itenerary INNER JOIN userfavouriteitenerary ON itenerary.iteneraryID= userfavouriteitenerary.iteneraryID
        WHERE userfavouriteitenerary.userID=?`,userID)
        return iteneraries;
    }
    catch(err){
        console.log(err);
        return [];
    }
}

async function isFavouriteItenerary(userID,iteneraryID){
    try{
        const result = await sqlQuery(`SELECT COUNT(1) FROM itenerary
        INNER JOIN userfavouriteitenerary ON itenerary.iteneraryID= userfavouriteitenerary.iteneraryID
        WHERE userfavouriteitenerary.userID=? AND userfavouriteitenerary.iteneraryID=?
        LIMIT 1`, [userID, iteneraryID]);
        if (result[0]['COUNT(1)'] == 1) return true;
        return false;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function deleteItenerary(iteneraryID){
    try{
        await sqlQuery('DELETE FROM itenerary WHERE iteneraryID=?', iteneraryID)
        return true;
    }
    catch(err){
        return false;
    }
}

async function deleteIteneraryByUser(iteneraryID,userID){
    try{
        await  sqlQuery('DELETE FROM itenerary WHERE iteneraryID=? AND userID=?', [iteneraryID, userID]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function getImages(iteneraryID, numOfImages, offsetAmount){
    const offset = parseInt(numOfImages * offsetAmount);
    let arrayOFImageAddresses= [];
    try{
        const images= await sqlQuery('SELECT * from iteneraryPhotos WHERE iteneraryID=? LIMIT 6 OFFSET ?',[iteneraryID,offset])
        if(images.length===0) return [];
        for(const image of images){
            arrayOFImageAddresses= [...arrayOFImageAddresses,`img/${image.imageID}.jpeg`]
        }
        return arrayOFImageAddresses;
    }
    catch(err){
        console.log(err);
        return [];
    } 
}

async function addImagesToIteneraryDatabase(iteneraryID,userID, imageIDArray){
    let imageDetails= [];
    for(const imageID of imageIDArray){
        imageDetails= [...imageDetails,[imageID,iteneraryID,userID]];
    }
    try{
        await sqlQuery('INSERT INTO iteneraryphotos(imageID,iteneraryID, userID) values?', [imageDetails]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function postMyNewVote(iteneraryID,userID,vote){
    const ratingID= uuid.v4();
    try{
        await sqlQuery(`INSERT INTO iteneraryRating(ratingID, iteneraryID, userID, likes)
        VALUES(?,?,?,?)`,[ratingID,iteneraryID,userID,vote]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function updateMyOldVote(iteneraryID,userID,vote){
    try{
       await sqlQuery('UPDATE iteneraryRating SET likes=? WHERE iteneraryID=? AND userID=?', [vote,iteneraryID,userID])
        return true;
    }
    catch(err){
        return false;
    }
}

async function setMyVote(iteneraryID,userID,vote){
    try{
        if(await postMyNewVote(iteneraryID,userID,vote)) return true;
        if(await updateMyOldVote(iteneraryID,userID,vote)) return true;
        return false;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

function updateRank(iteneraryID) {
    sqlQuery('SELECT likes FROM iteneraryRating WHERE iteneraryID=?', iteneraryID)
        .then((votes) => {
            const rank = votes.reduce((rank, vote) => {
                return rank = rank + vote.likes;
            }, 0);
            sqlQuery('UPDATE itenerary SET rank=? WHERE iteneraryID=?', [rank, iteneraryID]);
        })
        .catch(err=>{
            console.log(err);
        })
}

async function getVotes(iteneraryID){
    let likes= 0;
    let dislikes= 0;
    try{
        const votes= await sqlQuery('SELECT likes FROM iteneraryRating WHERE  iteneraryID=?',iteneraryID)
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
        const ratio= {likes,dislikes};
        return ratio;
    }
    catch(err){
        return {likes:0,dislikes:0};
    }
}

async function getComments(iteneraryID){
    try{
        const comments= await sqlQuery(`SELECT iteneraryRating.userID, users.name, iteneraryRating.comment
        FROM iteneraryRating INNER JOIN users ON iteneraryRating.userID= users.userID
        WHERE (iteneraryRating.iteneraryID=? AND comment IS NOT NULL)`,iteneraryID);
        return comments;
    }
    catch(err){
        console.log(err);
        return [];
    }
}

async function postNewComment(iteneraryID,userID,comment){
    const ratingID= uuid.v4();
    try{
        await sqlQuery(`INSERT INTO iteneraryRating(ratingID, iteneraryID, userID, comment)
        VALUES(?,?,?,?)`,[ratingID,iteneraryID,userID,comment]);
        return true;
    }
    catch(err){
        return false;
    }
}

async function updateMyOldComment(iteneraryID,userID,comment){
    try{
        await sqlQuery(`UPDATE iteneraryRating SET comment=? WHERE iteneraryID=? AND userID=?`,[comment,iteneraryID,userID])
        return true;
    }
    catch(err){
        return false;
    }
}
async function setMyComment(iteneraryID,userID,comment){
    try{
        if(await postNewComment(iteneraryID,userID,comment)) return true;
        if(await updateMyOldComment(iteneraryID,userID,comment)) return true;
        return false;
    }
    catch(err){
        return false;
    }
}
async function getMyRating(iteneraryID,userID){
    try{
        const myRating = await sqlQuery('SELECT likes,comment FROM iteneraryRating WHERE iteneraryID=? AND userID=?',[iteneraryID,userID]);
        if(myRating.length===0) return {likes:0,comment: null};
        return { likes: parseInt(myRating[0].likes), comment: myRating[0].comment}
    }
    catch(err){
        return {likes:0,comment: null};
    }
}

exports.addItenerary= addItenerary;
exports.getIteneraries = getIteneraries;
exports.getItenerary = getItenerary;
exports.getIteneraryPlaces = getIteneraryPlaces;
exports.getFavouriteIteneraries = getFavouriteIteneraries;
exports.setIteneraryAsFavourite = setIteneraryAsFavourite;
exports.isFavouriteItenerary = isFavouriteItenerary;
exports.deleteIteneraryAsFavourite = deleteIteneraryAsFavourite;
exports.getItenerariesSavedByUser = getItenerariesSavedByUser;
exports.deleteIteneraryByUser = deleteIteneraryByUser;
exports.deleteItenerary = deleteItenerary;
exports.getImages = getImages;
exports.addImagesToIteneraryDatabase= addImagesToIteneraryDatabase;
exports.setMyVote = setMyVote;
exports.getVotes = getVotes;
exports.updateRank = updateRank;
exports.getComments= getComments;
exports.setMyComment= setMyComment;
exports.getMyRating= getMyRating;