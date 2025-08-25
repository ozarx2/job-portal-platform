const express = require('express');
const Company = require('../models/Company');
const router = express.Router();

// POST /api/companies
router.post('/', async (req, res) => {
  const company = await Company.create(req.body);
  res.json(company);
});

// GET /api/companies
router.get('/', async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

// GET /api/companies/:id
router.get('/:id', async (req, res) => {
  const company = await Company.findById(req.params.id);
  res.json(company);
});

module.exports = router;
