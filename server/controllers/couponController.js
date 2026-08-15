const Coupon = require('../models/Coupon');

// GET all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single coupon
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon non trouvé' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VALIDATE coupon by code
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon invalide ou expiré' });
    }
    
    // Check dates
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({ message: 'Ce coupon n\'est pas encore actif' });
    }
    if (coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({ message: 'Ce coupon a expiré' });
    }
    
    // Check usage limit
    if (coupon.maximumUses && coupon.currentUses >= coupon.maximumUses) {
      return res.status(400).json({ message: 'Ce coupon a atteint sa limite d\'utilisation' });
    }
    
    // Check minimum amount
    if (coupon.minimumAmount && cartTotal < coupon.minimumAmount) {
      return res.status(400).json({ 
        message: `Montant minimum requis: ${coupon.minimumAmount}€` 
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE coupon
exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE coupon
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon non trouvé' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon non trouvé' });
    }
    res.json({ message: 'Coupon supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
