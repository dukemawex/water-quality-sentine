const mongoose = require('mongoose');

/**
 * Schema for geophysical resistivity data.
 * Correlates subsurface soil electrical resistivity with potential
 * groundwater contamination pathways.
 */
const resistivityDataSchema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: (coords) =>
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          message: 'Coordinates must be [longitude, latitude] within valid ranges',
        },
      },
    },

    locationName: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    // Vertical Electrical Sounding (VES) data layers
    layers: [
      {
        depth: {
          type: Number, // meters
          required: true,
          min: 0,
        },
        thickness: {
          type: Number, // meters
          min: 0,
        },
        resistivity: {
          type: Number, // Ohm-meters
          required: true,
          min: 0,
        },
        // Interpreted lithology based on resistivity range
        lithology: {
          type: String,
          enum: [
            'Topsoil',
            'Clay',
            'Sandy Clay',
            'Sand',
            'Gravel',
            'Laterite',
            'Weathered Rock',
            'Fresh Basement Rock',
            'Unknown',
          ],
          default: 'Unknown',
        },
      },
    ],

    // Survey method used
    surveyMethod: {
      type: String,
      enum: ['VES', 'ERT', 'SP', 'IP', 'Other'],
      default: 'VES',
    },

    // Electrode spacing (Schlumberger/Wenner array AB/2)
    maxElectrodeSpacing: {
      type: Number, // meters
      min: 0,
    },

    // Interpreted aquifer characteristics
    aquifer: {
      topDepth: Number, // meters
      bottomDepth: Number, // meters
      resistivity: Number, // Ohm-meters
      type: {
        type: String,
        enum: ['Unconfined', 'Confined', 'Perched', 'Unknown'],
        default: 'Unknown',
      },
      // Vulnerability index: higher = more vulnerable to contamination
      vulnerabilityIndex: {
        type: Number,
        min: 0,
        max: 10,
      },
    },

    // Contamination risk derived from resistivity patterns
    contaminationRisk: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Very High', 'Unknown'],
      default: 'Unknown',
    },

    // Link to water quality readings at the same site
    waterQualityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WaterQuality',
    },

    surveyDate: {
      type: Date,
    },

    surveyedBy: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

resistivityDataSchema.index({ location: '2dsphere' });

const ResistivityData = mongoose.model('ResistivityData', resistivityDataSchema);

module.exports = ResistivityData;
