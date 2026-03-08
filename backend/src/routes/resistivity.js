const express = require('express');
const router = express.Router();
const {
  getAllResistivity,
  getResistivityById,
  createResistivity,
  createResistivityValidation,
  getByIdValidation,
} = require('../controllers/resistivityController');

router.get('/', getAllResistivity);
router.get('/:id', getByIdValidation, getResistivityById);
router.post('/', createResistivityValidation, createResistivity);

module.exports = router;
