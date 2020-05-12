const express = require('express');
const uploadPlaces= require('./uploadplaces');
const uploadItenerary= require('./uploaditenerary')
const router= express.Router();


router.use('/places', uploadPlaces)
router.use('/itenerary', uploadItenerary)



module.exports = router;


