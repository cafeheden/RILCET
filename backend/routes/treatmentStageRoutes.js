const express = require('express');
const router = express.Router();
const { getTreatmentStages, checkValueRange, getTreatmentStageByName, updateTreatmentStage } = require('../controllers/treatmentStageController');

// Routes
router.get('/', getTreatmentStages);
router.get('/:name', getTreatmentStageByName);
router.put('/:name', updateTreatmentStage);
router.post('/check', checkValueRange); // Keep this route for checking values

module.exports = router;