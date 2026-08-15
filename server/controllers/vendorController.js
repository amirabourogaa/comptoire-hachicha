const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'vendor' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// GET all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single vendor
exports.getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE vendor
exports.createVendor = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if vendor with email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'Un vendeur avec cet email existe déjà' });
    }
    
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// CREATE vendor account (set password)
exports.createVendorAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit avoir au moins 8 caractères' });
    }
    
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    
    if (vendor.password) {
      return res.status(400).json({ message: 'Ce vendeur a déjà un compte' });
    }
    
    vendor.password = password;
    await vendor.save();
    
    res.json({ message: 'Compte créé avec succès', vendor: { ...vendor.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor login
exports.vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const vendor = await Vendor.findOne({ email }).select('+password');
    if (!vendor) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    if (!vendor.password) {
      return res.status(401).json({ message: 'Ce compte n\'a pas encore été activé' });
    }
    
    const isMatch = await vendor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    if (!vendor.is_active) {
      return res.status(401).json({ message: 'Ce compte vendeur est désactivé' });
    }
    
    res.json({
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      logo_url: vendor.logo_url,
      token: generateToken(vendor._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor profile (for logged in vendor)
exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE vendor
exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    
    res.json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    res.json({ message: 'Vendeur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET vendor stats
exports.getVendorStats = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ is_active: true });
    const verifiedVendors = await Vendor.countDocuments({ is_verified: true });
    
    res.json({
      total: totalVendors,
      active: activeVendors,
      verified: verifiedVendors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle vendor status
exports.toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    
    vendor.is_active = !vendor.is_active;
    await vendor.save();
    
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify vendor
exports.verifyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { is_verified: true },
      { new: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
