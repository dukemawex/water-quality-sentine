const mongoose = require('mongoose');

/**
 * Schema for water quality measurements at a geographic location.
 * Parameters are validated against WHO and NSDQW standards.
 */
const waterQualitySchema = new mongoose.Schema(
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

    // Core water quality parameters
    ph: {
      type: Number,
      required: true,
      min: 0,
      max: 14,
    },

    turbidity: {
      type: Number, // NTU (Nephelometric Turbidity Units)
      required: true,
      min: 0,
    },

    tds: {
      type: Number, // Total Dissolved Solids in mg/L
      required: true,
      min: 0,
    },

    conductivity: {
      type: Number, // Electrical conductivity in µS/cm
      required: true,
      min: 0,
    },

    // Additional optional parameters
    temperature: {
      type: Number, // Celsius
      min: 0,
      max: 100,
    },

    dissolvedOxygen: {
      type: Number, // mg/L
      min: 0,
    },

    // Computed safety score (0–100)
    safetyScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    safetyRating: {
      type: String,
      enum: ['Safe', 'Marginal', 'Unsafe', 'Highly Unsafe'],
    },

    // Compliance flags per standard
    whoCompliance: {
      ph: Boolean,
      turbidity: Boolean,
      tds: Boolean,
      conductivity: Boolean,
      overall: Boolean,
    },

    nsdqwCompliance: {
      ph: Boolean,
      turbidity: Boolean,
      tds: Boolean,
      conductivity: Boolean,
      overall: Boolean,
    },

    recordedBy: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location-based queries
waterQualitySchema.index({ location: '2dsphere' });

// Compound index for efficient time-range queries at a location
waterQualitySchema.index({ 'location.coordinates': 1, createdAt: -1 });

const WaterQuality = mongoose.model('WaterQuality', waterQualitySchema);

module.exports = WaterQuality;
