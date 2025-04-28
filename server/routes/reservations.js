// server/routes/reservations.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @route   GET api/reservations
// @desc    Get all reservations (admin) or user reservations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let reservations;
    
    // If admin, get all reservations
    if (req.user.role === 'admin') {
      reservations = await Reservation.find()
        .populate('user', 'name email')
        .populate({
          path: 'workspace',
          select: 'name type coworking pricePerHour',
          populate: {
            path: 'coworking',
            select: 'name address'
          }
        })
        .sort({ startTime: -1 });
    } else {
      // If regular user, get only their reservations
      reservations = await Reservation.find({ user: req.user.id })
        .populate({
          path: 'workspace',
          select: 'name type coworking pricePerHour',
          populate: {
            path: 'coworking',
            select: 'name address'
          }
        })
        .sort({ startTime: -1 });
    }
    
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reservations/:id
// @desc    Get reservation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'workspace',
        select: 'name type pricePerHour coworking',
        populate: {
          path: 'coworking',
          select: 'name address'
        }
      });
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    // Check if the reservation belongs to the user or if the user is an admin
    if (reservation.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.status(500).send('Server error');
  }
});

// Допоміжна функція для розрахунку загальної вартості та знижки
const calculatePrice = (pricePerHour, startTime, endTime, discounts) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Розрахунок тривалості в годинах
  const durationHours = (end - start) / (1000 * 60 * 60);
  
  // Базова вартість
  let basePrice = pricePerHour * durationHours;
  
  // Визначення знижки залежно від тривалості
  let discountPercent = 0;
  
  // Робочий день (8 годин)
  if (durationHours >= 8 && durationHours < 24 * 30) {
    discountPercent = discounts.day;
  } 
  // Місяць (30 днів)
  else if (durationHours >= 24 * 30 && durationHours < 24 * 365) {
    discountPercent = discounts.month;
  } 
  // Рік
  else if (durationHours >= 24 * 365) {
    discountPercent = discounts.year;
  }
  
  // Розрахунок знижки
  const discountAmount = basePrice * (discountPercent / 100);
  const finalPrice = basePrice - discountAmount;
  
  return {
    basePrice: parseFloat(basePrice.toFixed(2)),
    discountPercent,
    finalPrice: parseFloat(finalPrice.toFixed(2))
  };
};

// @route   POST api/reservations
// @desc    Create a reservation
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { workspaceId, startTime, endTime, couponCode } = req.body;
    
    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }
    
    // Check if workspace is available
    if (!workspace.available) {
      return res.status(400).json({ msg: 'Workspace is not available' });
    }
    
    // Check if there are overlapping reservations
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (startDate >= endDate) {
      return res.status(400).json({ msg: 'End time must be after start time' });
    }
    
    const overlappingReservation = await Reservation.findOne({
      workspace: workspaceId,
      status: 'confirmed',
      $or: [
        {
          startTime: { $lt: endDate },
          endTime: { $gt: startDate }
        }
      ]
    });
    
    if (overlappingReservation) {
      return res.status(400).json({ msg: 'This workspace is already reserved for the selected time period' });
    }
    
    // Calculate price with duration-based discount
    const priceDetails = calculatePrice(
      workspace.pricePerHour, 
      startTime, 
      endTime, 
      workspace.discounts
    );
    
    let finalPrice = priceDetails.finalPrice;
    let appliedCoupon = null;
    
    // Apply coupon if provided
    if (couponCode) {
      const user = await User.findById(req.user.id);
      const coupon = user.coupons.find(c => c.code === couponCode && !c.used && new Date(c.expiryDate) > new Date());
      
      if (coupon) {
        // Apply coupon discount
        const couponDiscount = finalPrice * (coupon.discountPercent / 100);
        finalPrice = finalPrice - couponDiscount;
        
        // Mark coupon as used
        user.coupons.id(coupon._id).used = true;
        await user.save();
        
        appliedCoupon = couponCode;
      } else {
        return res.status(400).json({ msg: 'Invalid or expired coupon' });
      }
    }
    
    // Create the reservation
    const newReservation = new Reservation({
      user: req.user.id,
      workspace: workspaceId,
      startTime: startDate,
      endTime: endDate,
      totalPrice: finalPrice,
      discountApplied: priceDetails.discountPercent,
      couponCode: appliedCoupon,
      status: 'confirmed' // Auto-confirm for simplicity
    });
    
    const reservation = await newReservation.save();
    
    // Check if user qualifies for a new coupon (total spending >= 10000)
    const userReservations = await Reservation.find({
      user: req.user.id,
      status: 'confirmed'
    });
    
    const totalSpent = userReservations.reduce((sum, res) => sum + res.totalPrice, 0);
    
    if (totalSpent >= 10000) {
      // Generate coupon
      const user = await User.findById(req.user.id);
      const couponExpiry = new Date();
      couponExpiry.setMonth(couponExpiry.getMonth() + 3); // Valid for 3 months
      
      user.coupons.push({
        code: 'LOYAL' + uuidv4().substring(0, 6).toUpperCase(),
        discountPercent: 15,
        expiryDate: couponExpiry,
        used: false
      });
      
      await user.save();
    }
    
    await reservation.populate([
      { path: 'workspace', select: 'name type coworking' },
      { path: 'user', select: 'name email' }
    ]);
    
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    // Check if the reservation belongs to the user or if the user is an admin
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Only pending or confirmed reservations can be cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ msg: 'This reservation is already cancelled' });
    }
    
    // If a coupon was used for this reservation, refund it
    if (reservation.couponCode) {
      const user = await User.findById(req.user.id);
      const coupon = user.coupons.find(c => c.code === reservation.couponCode);
      
      if (coupon) {
        user.coupons.id(coupon._id).used = false;
        await user.save();
      }
    }
    
    reservation.status = 'cancelled';
    await reservation.save();
    
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/reservations/user/coupons
// @desc    Get user's coupons
// @access  Private
router.get('/user/coupons', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Filter to only return valid, unused coupons
    const validCoupons = user.coupons.filter(
      coupon => !coupon.used && new Date(coupon.expiryDate) > new Date()
    );
    
    res.json(validCoupons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;