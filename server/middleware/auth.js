const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};

// Protect vendor routes
exports.protectVendor = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'vendor') {
      return res.status(401).json({ message: 'Accès réservé aux vendeurs' });
    }
    
    req.vendor = await Vendor.findById(decoded.id).select('-password');
    
    if (!req.vendor) {
      return res.status(401).json({ message: 'Vendeur non trouvé' });
    }
    
    if (!req.vendor.is_active) {
      return res.status(401).json({ message: 'Ce compte vendeur est désactivé' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Vous n\'avez pas la permission d\'effectuer cette action' 
      });
    }
    next();
  };
};
