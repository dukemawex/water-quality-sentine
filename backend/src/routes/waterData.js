const express = require('express');
const router = express.Router();
const {
  getAllWaterData,
  getWaterDataById,
  createWaterData,
  deleteWaterData,
  createDataValidation,
  getByIdValidation,
} = require('../controllers/waterDataController');

router.get('/', getAllWaterData);
router.get('/:id', getByIdValidation, getWaterDataById);
router.post('/', createDataValidation, createWaterData);
router.delete('/:id', getByIdValidation, deleteWaterData);

module.exports = router;
