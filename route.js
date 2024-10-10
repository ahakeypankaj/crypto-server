const express = require('express');
const router = express.Router();
const { getStats, getDeviation } = require('./controller');

// Route to get stats for a cryptocurrency
router.get('/stats', getStats);

// Route to get standard deviation for the cryptocurrency price
router.get('/deviation', getDeviation);

module.exports = router;
