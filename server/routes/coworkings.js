const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Coworking = require('../models/Coworking');

// @route   GET api/coworkings
// @desc    Get all coworkings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const coworkings = await Coworking.find().sort({ createdAt: -1 });
    res.json(coworkings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/coworkings/:id
// @desc    Get coworking by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const coworking = await Coworking.findById(req.params.id);
    
    if (!coworking) {
      return res.status(404).json({ msg: 'Coworking not found' });
    }
    
    res.json(coworking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Coworking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/coworkings
// @desc    Create a coworking
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin rights required' });
    }
    
    const { name, address, description, facilities, openingHours, images } = req.body;
    
    const newCoworking = new Coworking({
      name,
      address,
      description,
      facilities,
      openingHours,
      images
    });
    
    const coworking = await newCoworking.save();
    res.json(coworking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/coworkings/:id
// @desc    Update a coworking
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin rights required' });
    }
    
    const coworking = await Coworking.findById(req.params.id);
    
    if (!coworking) {
      return res.status(404).json({ msg: 'Coworking not found' });
    }
    
    const { name, address, description, facilities, openingHours, images } = req.body;
    
    if (name) coworking.name = name;
    if (address) coworking.address = address;
    if (description) coworking.description = description;
    if (facilities) coworking.facilities = facilities;
    if (openingHours) coworking.openingHours = openingHours;
    if (images) coworking.images = images;
    
    await coworking.save();
    
    res.json(coworking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Coworking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/coworkings/:id
// @desc    Delete a coworking
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin rights required' });
    }
    
    const coworking = await Coworking.findById(req.params.id);
    
    if (!coworking) {
      return res.status(404).json({ msg: 'Coworking not found' });
    }
    
    await coworking.remove();
    
    res.json({ msg: 'Coworking removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Coworking not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;