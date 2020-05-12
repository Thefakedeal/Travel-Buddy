const express= require('express');
const router = express.Router();
const apiplaces= require('./apiplaces')
const iteneraries= require('./apiitenerary')
const apisaved= require('./apisaved');

router.use('/places', apiplaces);
router.use('/iteneraries', iteneraries);
router.use('/saved', apisaved);

module.exports= router;