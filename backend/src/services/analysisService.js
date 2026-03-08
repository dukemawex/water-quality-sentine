/**
 * Water Quality Analysis Service
 * Compares water parameters against:
 *   - WHO (World Health Organization) Guidelines for Drinking-water Quality
 *   - NSDQW (Nigerian Standard for Drinking Water Quality) NIS 554:2015
 */

// WHO Guidelines for Drinking-water Quality (4th edition)
const WHO_STANDARDS = {
  ph: { min: 6.5, max: 8.5 },
  turbidity: { max: 4 }, // NTU
  tds: { max: 1000 }, // mg/L (aesthetic guideline)
  conductivity: { max: 2500 }, // µS/cm (derived from TDS)
};

// Nigerian Standard for Drinking Water Quality (NIS 554:2015)
const NSDQW_STANDARDS = {
  ph: { min: 6.5, max: 8.5 },
  turbidity: { max: 5 }, // NTU
  tds: { max: 500 }, // mg/L (more stringent than WHO)
  conductivity: { max: 1000 }, // µS/cm
};

/**
 * Check a single parameter against a standard's limits.
 * @param {number} value
 * @param {{ min?: number, max?: number }} limits
 * @returns {boolean}
 */
const checkCompliance = (value, limits) => {
  if (value === null || value === undefined) return false;
  if (limits.min !== undefined && value < limits.min) return false;
  if (limits.max !== undefined && value > limits.max) return false;
  return true;
};

/**
 * Calculate a weighted Safety Score (0–100) from water parameters.
 *
 * Scoring logic:
 *   Each parameter contributes equally (25 points maximum).
 *   Within each parameter, score degrades linearly as the value moves
 *   outside the WHO acceptable range.
 *
 * @param {{ ph: number, turbidity: number, tds: number, conductivity: number }} params
 * @returns {number} score 0–100
 */
const calculateSafetyScore = ({ ph, turbidity, tds, conductivity }) => {
  const scores = [];

  // pH score: optimal 6.5–8.5; penalise deviation
  const phScore = (() => {
    const { min, max } = WHO_STANDARDS.ph;
    if (ph >= min && ph <= max) return 100;
    const deviation = ph < min ? min - ph : ph - max;
    return Math.max(0, 100 - deviation * 20); // -20 pts per unit outside range
  })();
  scores.push(phScore);

  // Turbidity score (lower is better; WHO max = 4 NTU)
  const turbidityScore = (() => {
    const { max } = WHO_STANDARDS.turbidity;
    if (turbidity <= max) return 100;
    return Math.max(0, 100 - ((turbidity - max) / max) * 50);
  })();
  scores.push(turbidityScore);

  // TDS score (lower is better; WHO max = 1000 mg/L)
  const tdsScore = (() => {
    const { max } = WHO_STANDARDS.tds;
    if (tds <= max) return 100;
    return Math.max(0, 100 - ((tds - max) / max) * 50);
  })();
  scores.push(tdsScore);

  // Conductivity score (lower is better; WHO max = 2500 µS/cm)
  const conductivityScore = (() => {
    const { max } = WHO_STANDARDS.conductivity;
    if (conductivity <= max) return 100;
    return Math.max(0, 100 - ((conductivity - max) / max) * 50);
  })();
  scores.push(conductivityScore);

  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(average * 10) / 10;
};

/**
 * Derive a human-readable safety rating from a numeric score.
 * @param {number} score
 * @returns {string}
 */
const getRating = (score) => {
  if (score >= 80) return 'Safe';
  if (score >= 60) return 'Marginal';
  if (score >= 40) return 'Unsafe';
  return 'Highly Unsafe';
};

/**
 * Full analysis of a set of water quality parameters.
 *
 * @param {{ ph: number, turbidity: number, tds: number, conductivity: number }} params
 * @returns {{
 *   safetyScore: number,
 *   safetyRating: string,
 *   whoCompliance: object,
 *   nsdqwCompliance: object,
 *   parameterDetails: object
 * }}
 */
const analyzeWaterQuality = (params) => {
  const { ph, turbidity, tds, conductivity } = params;

  const safetyScore = calculateSafetyScore(params);
  const safetyRating = getRating(safetyScore);

  const whoCompliance = {
    ph: checkCompliance(ph, WHO_STANDARDS.ph),
    turbidity: checkCompliance(turbidity, WHO_STANDARDS.turbidity),
    tds: checkCompliance(tds, WHO_STANDARDS.tds),
    conductivity: checkCompliance(conductivity, WHO_STANDARDS.conductivity),
  };
  whoCompliance.overall = Object.values(whoCompliance).every(Boolean);

  const nsdqwCompliance = {
    ph: checkCompliance(ph, NSDQW_STANDARDS.ph),
    turbidity: checkCompliance(turbidity, NSDQW_STANDARDS.turbidity),
    tds: checkCompliance(tds, NSDQW_STANDARDS.tds),
    conductivity: checkCompliance(conductivity, NSDQW_STANDARDS.conductivity),
  };
  nsdqwCompliance.overall = Object.values(nsdqwCompliance).every(Boolean);

  const parameterDetails = {
    ph: {
      value: ph,
      whoLimit: WHO_STANDARDS.ph,
      nsdqwLimit: NSDQW_STANDARDS.ph,
      whoCompliant: whoCompliance.ph,
      nsdqwCompliant: nsdqwCompliance.ph,
      unit: 'pH units',
    },
    turbidity: {
      value: turbidity,
      whoLimit: WHO_STANDARDS.turbidity,
      nsdqwLimit: NSDQW_STANDARDS.turbidity,
      whoCompliant: whoCompliance.turbidity,
      nsdqwCompliant: nsdqwCompliance.turbidity,
      unit: 'NTU',
    },
    tds: {
      value: tds,
      whoLimit: WHO_STANDARDS.tds,
      nsdqwLimit: NSDQW_STANDARDS.tds,
      whoCompliant: whoCompliance.tds,
      nsdqwCompliant: nsdqwCompliance.tds,
      unit: 'mg/L',
    },
    conductivity: {
      value: conductivity,
      whoLimit: WHO_STANDARDS.conductivity,
      nsdqwLimit: NSDQW_STANDARDS.conductivity,
      whoCompliant: whoCompliance.conductivity,
      nsdqwCompliant: nsdqwCompliance.conductivity,
      unit: 'µS/cm',
    },
  };

  return {
    safetyScore,
    safetyRating,
    whoCompliance,
    nsdqwCompliance,
    parameterDetails,
  };
};

module.exports = {
  analyzeWaterQuality,
  calculateSafetyScore,
  getRating,
  WHO_STANDARDS,
  NSDQW_STANDARDS,
};
