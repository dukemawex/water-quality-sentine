const {
  analyzeWaterQuality,
  calculateSafetyScore,
  getRating,
  WHO_STANDARDS,
  NSDQW_STANDARDS,
} = require('../services/analysisService');

describe('analysisService', () => {
  describe('calculateSafetyScore', () => {
    it('returns 100 for perfect water quality', () => {
      const score = calculateSafetyScore({ ph: 7.0, turbidity: 1, tds: 200, conductivity: 400 });
      expect(score).toBe(100);
    });

    it('returns 0 or near 0 for very bad water quality', () => {
      const score = calculateSafetyScore({ ph: 0, turbidity: 1000, tds: 50000, conductivity: 100000 });
      expect(score).toBeLessThanOrEqual(10);
    });

    it('penalises pH outside WHO range', () => {
      const goodScore = calculateSafetyScore({ ph: 7.0, turbidity: 1, tds: 200, conductivity: 400 });
      const badScore = calculateSafetyScore({ ph: 4.0, turbidity: 1, tds: 200, conductivity: 400 });
      expect(badScore).toBeLessThan(goodScore);
    });

    it('penalises high turbidity', () => {
      const goodScore = calculateSafetyScore({ ph: 7.0, turbidity: 1, tds: 200, conductivity: 400 });
      const badScore = calculateSafetyScore({ ph: 7.0, turbidity: 50, tds: 200, conductivity: 400 });
      expect(badScore).toBeLessThan(goodScore);
    });
  });

  describe('getRating', () => {
    it('returns Safe for score >= 80', () => expect(getRating(85)).toBe('Safe'));
    it('returns Marginal for score 60–79', () => expect(getRating(65)).toBe('Marginal'));
    it('returns Unsafe for score 40–59', () => expect(getRating(50)).toBe('Unsafe'));
    it('returns Highly Unsafe for score < 40', () => expect(getRating(20)).toBe('Highly Unsafe'));
  });

  describe('analyzeWaterQuality', () => {
    it('marks compliant water as Safe', () => {
      const result = analyzeWaterQuality({ ph: 7.0, turbidity: 1, tds: 200, conductivity: 400 });
      expect(result.safetyRating).toBe('Safe');
      expect(result.whoCompliance.overall).toBe(true);
      expect(result.nsdqwCompliance.overall).toBe(true);
    });

    it('flags WHO non-compliance for high TDS', () => {
      const result = analyzeWaterQuality({ ph: 7.0, turbidity: 1, tds: 2000, conductivity: 400 });
      expect(result.whoCompliance.tds).toBe(false);
      expect(result.whoCompliance.overall).toBe(false);
    });

    it('flags NSDQW non-compliance for borderline TDS (>500 mg/L)', () => {
      // NSDQW TDS max = 500, WHO = 1000
      const result = analyzeWaterQuality({ ph: 7.0, turbidity: 1, tds: 700, conductivity: 400 });
      expect(result.whoCompliance.tds).toBe(true);
      expect(result.nsdqwCompliance.tds).toBe(false);
    });

    it('includes parameterDetails with units', () => {
      const result = analyzeWaterQuality({ ph: 7.0, turbidity: 2, tds: 300, conductivity: 500 });
      expect(result.parameterDetails.ph.unit).toBe('pH units');
      expect(result.parameterDetails.turbidity.unit).toBe('NTU');
      expect(result.parameterDetails.tds.unit).toBe('mg/L');
      expect(result.parameterDetails.conductivity.unit).toBe('µS/cm');
    });

    it('exposes WHO and NSDQW standards', () => {
      expect(WHO_STANDARDS.ph).toEqual({ min: 6.5, max: 8.5 });
      expect(NSDQW_STANDARDS.tds.max).toBe(500);
    });
  });
});
