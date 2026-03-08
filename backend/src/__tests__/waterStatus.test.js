/**
 * Integration tests for water-status API routes.
 * These tests mock the MongoDB connection and Mongoose models.
 */

jest.mock('../config/database', () => jest.fn());
jest.mock('../models/WaterQuality');

const request = require('supertest');
const app = require('../app');
const WaterQuality = require('../models/WaterQuality');

describe('POST /api/water-status (analyse without persisting)', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/water-status').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('returns 400 for out-of-range pH', async () => {
    const res = await request(app).post('/api/water-status').send({
      lat: 6.857,
      lng: 7.393,
      ph: 20,
      turbidity: 2,
      tds: 300,
      conductivity: 500,
    });
    expect(res.status).toBe(400);
  });

  it('returns a safety score for valid parameters', async () => {
    const res = await request(app).post('/api/water-status').send({
      lat: 6.857,
      lng: 7.393,
      ph: 7.0,
      turbidity: 2,
      tds: 300,
      conductivity: 500,
      locationName: 'Nsukka Test',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('safetyScore');
    expect(res.body).toHaveProperty('safetyRating');
    expect(res.body).toHaveProperty('whoCompliance');
    expect(res.body).toHaveProperty('nsdqwCompliance');
    expect(res.body.safetyRating).toBe('Safe');
  });
});

describe('GET /api/water-status', () => {
  it('returns 400 when lat/lng are missing', async () => {
    const res = await request(app).get('/api/water-status');
    expect(res.status).toBe(400);
  });

  it('returns 404 when no records found near location', async () => {
    WaterQuality.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app).get('/api/water-status?lat=0&lng=0');
    expect(res.status).toBe(404);
  });

  it('returns latest reading with analysis when records exist', async () => {
    const mockRecord = {
      _id: '64abc123',
      ph: 7.2,
      turbidity: 1.5,
      tds: 250,
      conductivity: 480,
      locationName: 'Nsukka',
      location: { type: 'Point', coordinates: [7.393, 6.857] },
      createdAt: new Date(),
    };

    WaterQuality.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockRecord]),
    });

    const res = await request(app).get('/api/water-status?lat=6.857&lng=7.393');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('latestReading');
    expect(res.body.latestReading).toHaveProperty('safetyScore');
    expect(res.body.latestReading.ph).toBe(7.2);
  });
});

describe('Health check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
