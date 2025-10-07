const express = require('express');
const Company = require('../models/Company');
const { validateCompanyCreation, sanitizeBody, handleValidationError } = require('../middleware/validation');
const router = express.Router();

// POST /api/companies
router.post('/', require('../middleware/verifyToken'), sanitizeBody, validateCompanyCreation, async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Remove any companyId field that might cause duplicate key errors
    const companyData = { ...req.body };
    delete companyData.companyId;
    
    console.log('🏢 Creating company for user:', req.user.id);
    
    const company = await Company.create(companyData);
    console.log('✅ Company created:', company.name);
    
    // Automatically associate the company with the user who created it
    const user = await User.findById(req.user.id);
    if (user) {
      // If user doesn't have a primary company, set this as primary
      if (!user.companyId) {
        user.companyId = company._id;
        console.log('🏢 Set as primary company for user');
      } else {
        // Add to additional companies array if not already present
        if (!user.companies) {
          user.companies = [];
        }
        if (!user.companies.includes(company._id)) {
          user.companies.push(company._id);
          console.log('🏢 Added to additional companies for user');
        }
      }
      
      await user.save();
      console.log('✅ User associated with company');
    }
    
    res.status(201).json({
      success: true,
      message: 'Company created and associated successfully',
      company
    });
  } catch (err) {
    console.error('❌ Error creating company:', err);
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/companies/user - Get companies for current user (must come before /:id)
router.get('/user', require('../middleware/verifyToken'), async (req, res) => {
  try {
    const User = require('../models/User');
    
    console.log('🔍 Fetching companies for user:', req.user.id);
    
    const user = await User.findById(req.user.id).populate('companyId').populate('companies');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('👤 User found:', {
      id: user._id,
      email: user.email,
      hasCompanyId: !!user.companyId,
      hasCompanies: user.companies?.length || 0
    });
    
    // Collect all companies user has access to
    const userCompanies = [];
    
    // Add primary company if exists
    if (user.companyId) {
      userCompanies.push(user.companyId);
      console.log('🏢 Added primary company:', user.companyId.name);
    }
    
    // Add additional companies if they exist
    if (user.companies && user.companies.length > 0) {
      userCompanies.push(...user.companies);
      console.log('🏢 Added additional companies:', user.companies.length);
    }
    
    console.log('📊 Total user companies:', userCompanies.length);
    
    res.json({
      success: true,
      data: userCompanies,
      count: userCompanies.length
    });
    
  } catch (err) {
    console.error('❌ Error fetching user companies:', err);
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/companies
router.get('/', async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

// GET /api/companies/:id
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// PUT /api/companies/:id - Update a company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.json(company);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE /api/companies/:id - Delete a company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndDelete(id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.json({ msg: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Add error handling middleware
router.use(handleValidationError);

module.exports = router;
