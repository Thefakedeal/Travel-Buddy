const express= require('express');
const router = express.Router();
const placeRating= require('./placerating');
const iteneraryRating= require('./iteneraryrating');

router.use('/place', placeRating);
router.use('/itenerary', iteneraryRating);


module.exports= router;
 