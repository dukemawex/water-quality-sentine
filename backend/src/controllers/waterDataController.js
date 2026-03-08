const { body, query, param, validationResult } = require('express-validator');
const WaterQuality = require('../models/WaterQuality');
const { analyzeWaterQuality } = require('../services/analysisService');

/**
 * GET /api/water-data
 * List all water quality records, with optional bounding-box filter.
 */
const getAllWaterData = async (req, res, next) => {
  try {
    const { swLat, swLng, neLat, neLng, limit = 200 } = req.query;

    let filter = {};

    if (swLat && swLng && neLat && neLng) {
      filter = {
        'location.coordinates': {
          $geoWithin: {
            $box: [
              [parseFloat(swLng), parseFloat(swLat)],
              [parseFloat(neLng), parseFloat(neLat)],
            ],
          },
        },
      };
    }

    const data = await WaterQuality.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    return res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/water-data/:id
 * Get a specific water quality record by ID.
 */
const getWaterDataById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = await WaterQuality.findById(req.params.id).lean();
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/water-data
 * Submit new water quality data. Automatically computes safety analysis.
 */
const createWaterData = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      lat,
      lng,
      locationName,
      ph,
      turbidity,
      tds,
      conductivity,
      temperature,
      dissolvedOxygen,
      recordedBy,
      notes,
    } = req.body;

    const analysis = analyzeWaterQuality({ ph, turbidity, tds, conductivity });

    const record = await WaterQuality.create({
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      locationName,
      ph,
      turbidity,
      tds,
      conductivity,
      temperature,
      dissolvedOxygen,
      recordedBy,
      notes,
      safetyScore: analysis.safetyScore,
      safetyRating: analysis.safetyRating,
      whoCompliance: analysis.whoCompliance,
      nsdqwCompliance: analysis.nsdqwCompliance,
    });

    return res.status(201).json({ record, analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/water-data/:id
 */
const deleteWaterData = async (req, res, next) => {
  try {
    const record = await WaterQuality.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const createDataValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be a float between -90 and 90'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('lng must be a float between -180 and 180'),
  body('ph').isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
  body('turbidity').isFloat({ min: 0 }).withMessage('turbidity must be >= 0'),
  body('tds').isFloat({ min: 0 }).withMessage('TDS must be >= 0'),
  body('conductivity').isFloat({ min: 0 }).withMessage('conductivity must be >= 0'),
  body('temperature').optional().isFloat({ min: 0, max: 100 }),
  body('dissolvedOxygen').optional().isFloat({ min: 0 }),
  body('locationName').optional().trim().isLength({ max: 200 }),
  body('recordedBy').optional().trim().isLength({ max: 100 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

const getByIdValidation = [
  param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
];

module.exports = {
  getAllWaterData,
  getWaterDataById,
  createWaterData,
  deleteWaterData,
  createDataValidation,
  getByIdValidation,
};
