const { body, query, validationResult } = require('express-validator');
const WaterQuality = require('../models/WaterQuality');
const { analyzeWaterQuality } = require('../services/analysisService');

/**
 * GET /api/water-status
 * Accepts GPS coordinates (lat, lng) and optional radius (metres).
 * Returns the most recent reading(s) in that area with Safety Score.
 */
const getWaterStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusMetres = parseInt(req.query.radius, 10) || 5000; // default 5 km

    // Find the nearest reading(s) within the given radius
    const readings = await WaterQuality.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusMetres,
        },
      },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (readings.length === 0) {
      return res.status(404).json({
        message: 'No water quality data found near this location.',
        coordinates: { lat, lng },
        radiusMetres,
      });
    }

    // Re-compute live analysis on the most recent reading
    const latest = readings[0];
    const analysis = analyzeWaterQuality({
      ph: latest.ph,
      turbidity: latest.turbidity,
      tds: latest.tds,
      conductivity: latest.conductivity,
    });

    return res.json({
      coordinates: { lat, lng },
      radiusMetres,
      totalReadings: readings.length,
      latestReading: {
        ...latest,
        ...analysis,
      },
      allReadings: readings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/water-status
 * Accepts a payload of water parameters + coordinates and returns a
 * computed Safety Score without persisting to DB.
 */
const analyzeWaterStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng, ph, turbidity, tds, conductivity, locationName } = req.body;

    const analysis = analyzeWaterQuality({ ph, turbidity, tds, conductivity });

    return res.json({
      coordinates: { lat, lng },
      locationName: locationName || null,
      parameters: { ph, turbidity, tds, conductivity },
      ...analysis,
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const getStatusValidation = [
  query('lat')
    .notEmpty()
    .isFloat({ min: -90, max: 90 })
    .withMessage('lat must be a float between -90 and 90'),
  query('lng')
    .notEmpty()
    .isFloat({ min: -180, max: 180 })
    .withMessage('lng must be a float between -180 and 180'),
  query('radius').optional().isInt({ min: 100, max: 100000 }).withMessage('radius must be 100–100000 metres'),
];

const analyzeStatusValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be a float between -90 and 90'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('lng must be a float between -180 and 180'),
  body('ph').isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
  body('turbidity').isFloat({ min: 0 }).withMessage('turbidity must be >= 0'),
  body('tds').isFloat({ min: 0 }).withMessage('TDS must be >= 0'),
  body('conductivity').isFloat({ min: 0 }).withMessage('conductivity must be >= 0'),
];

module.exports = {
  getWaterStatus,
  analyzeWaterStatus,
  getStatusValidation,
  analyzeStatusValidation,
};
