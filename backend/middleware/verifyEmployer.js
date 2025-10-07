const verifyEmployer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'No user found in request' });
  }
  
  if (req.user.role !== 'employer' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      msg: 'Access denied: Only employers and admins can post jobs',
      userRole: req.user.role 
    });
  }
  next();
};

module.exports = verifyEmployer;
