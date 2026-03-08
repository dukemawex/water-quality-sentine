import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get water status near GPS coordinates.
 * @param {number} lat
 * @param {number} lng
 * @param {number} [radius=5000]
 */
export const getWaterStatus = async (lat, lng, radius = 5000) => {
  const { data } = await api.get('/api/water-status', {
    params: { lat, lng, radius },
  });
  return data;
};

/**
 * Analyse water parameters without saving to DB.
 * @param {{ lat, lng, ph, turbidity, tds, conductivity, locationName? }} params
 */
export const analyzeWaterStatus = async (params) => {
  const { data } = await api.post('/api/water-status', params);
  return data;
};

/**
 * Get all water quality records (with optional bounding box).
 * @param {{ swLat?, swLng?, neLat?, neLng? }} [bounds]
 */
export const getAllWaterData = async (bounds = {}) => {
  const { data } = await api.get('/api/water-data', { params: bounds });
  return data;
};

/**
 * Submit new water quality data.
 * @param {object} payload
 */
export const submitWaterData = async (payload) => {
  const { data } = await api.post('/api/water-data', payload);
  return data;
};

/**
 * Get resistivity survey records.
 */
export const getAllResistivityData = async () => {
  const { data } = await api.get('/api/resistivity');
  return data;
};

export default api;
