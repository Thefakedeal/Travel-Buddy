const uuid= require('uuid');
const sharp= require('sharp');
const values = require('./variables.json');
const acceptedFileTypes= values.fileTypes;

function reduceImgSizeAndConvertToJpeg(image) {
    imageID = uuid.v4()
    randomstringpath = `images/${imageID}.jpeg`;

    return new Promise((resolve, reject) => {
        sharp(image.data)
            .resize(400, 400, {
                fit: "inside"
            })
            .toFile(`${randomstringpath}`, (err, info) => {
                if (err) reject();
                resolve(imageID);
            });
    })
}


async function savePhotos(file_array){
    let imageIDArrays=[];

    for(image in file_array){
        if(file_array[image].size <= (1024*1024*2))
        {   
            const filetype= (file_array[image].name).split('.').pop();

            if(acceptedFileTypes.includes(filetype)){
                    try{
                        const imageID= await reduceImgSizeAndConvertToJpeg(file_array[image]);
                        imageIDArrays= [...imageIDArrays,imageID];
                    }
                    catch(err){
                        continue;
                    }   
                }   
        }
    }

   return imageIDArrays;
}

exports.savePhotos= savePhotos;