const { body, query, param, validationResult } = require('express-validator');
const ResistivityData = require('../models/ResistivityData');

/**
 * GET /api/resistivity
 */
const getAllResistivity = async (req, res, next) => {
  try {
    const data = await ResistivityData.find()
      .populate('waterQualityRef', 'ph turbidity tds conductivity safetyScore safetyRating createdAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resistivity/:id
 */
const getResistivityById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = await ResistivityData.findById(req.params.id)
      .populate('waterQualityRef')
      .lean();

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/resistivity
 */
const createResistivity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      lat,
      lng,
      locationName,
      layers,
      surveyMethod,
      maxElectrodeSpacing,
      aquifer,
      contaminationRisk,
      waterQualityRef,
      surveyDate,
      surveyedBy,
      notes,
    } = req.body;

    const record = await ResistivityData.create({
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      locationName,
      layers,
      surveyMethod,
      maxElectrodeSpacing,
      aquifer,
      contaminationRisk,
      waterQualityRef,
      surveyDate,
      surveyedBy,
      notes,
    });

    return res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

// Validation rules
const createResistivityValidation = [
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
  body('layers').isArray({ min: 1 }).withMessage('At least one layer is required'),
  body('layers.*.depth').isFloat({ min: 0 }),
  body('layers.*.resistivity').isFloat({ min: 0 }),
];

const getByIdValidation = [
  param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
];

module.exports = {
  getAllResistivity,
  getResistivityById,
  createResistivity,
  createResistivityValidation,
  getByIdValidation,
};
