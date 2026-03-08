const express = require('express');
const router = express.Router();
const {
  getWaterStatus,
  analyzeWaterStatus,
  getStatusValidation,
  analyzeStatusValidation,
} = require('../controllers/waterStatusController');

/**
 * GET /api/water-status?lat=6.857&lng=7.393&radius=5000
 * Returns the safety status for water near the given coordinates.
 */
router.get('/', getStatusValidation, getWaterStatus);

/**
 * POST /api/water-status
 * Accepts water parameters + coordinates and returns a Safety Score
 * without persisting data to the database.
 */
router.post('/', analyzeStatusValidation, analyzeWaterStatus);

module.exports = router;
