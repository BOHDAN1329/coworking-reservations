const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const Coworking = require('../models/Coworking');

// @route   GET api/workspaces
// @desc    Get all workspaces
// @access  Public
router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find()
      .populate('coworking', 'name address')
      .sort({ createdAt: -1 });
    res.json(workspaces);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/workspaces/coworking/:coworkingId
// @desc    Get workspaces by coworking
// @access  Public
router.get('/coworking/:coworkingId', async (req, res) => {
  try {
    const workspaces = await Workspace.find({ coworking: req.params.coworkingId })
      .populate('coworking', 'name address')
      .sort({ createdAt: -1 });
    res.json(workspaces);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/workspaces/:id
// @desc    Get workspace by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('coworking', 'name address description openingHours');
    
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }
    
    res.json(workspace);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Workspace not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/workspaces
// @desc    Create a workspace
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin rights required' });
    }
    
    const { name, coworkingId, type, pricePerHour, capacity, position } = req.body;
    
    // Check if coworking exists
    const coworking = await Coworking.findById(coworkingId);
    if (!coworking) {
      return res.status(404).json({ msg: 'Coworking not found' });
    }
    
    const newWorkspace = new Workspace({
      name,
      coworking: coworkingId,
      type,
      pricePerHour,
      capacity,
      position
    });
    
    const workspace = await newWorkspace.save();
    res.json(workspace);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/workspaces/:id
// @desc    Update a workspace
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin rights required' });
    }
    
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }
    
    const { name, type, pricePerHour, capacity, available, position } = req.body;
    
    if (name) workspace.name = name;
    if (type) workspace.type = type;
    if (pricePerHour) workspace.pricePerHour = pricePerHour;
    if (capacity) workspace.capacity = capacity;
    if (available !== undefined) workspace.available = available;
    if (position) workspace.position = position;
    
    await workspace.save();
    
    res.json(workspace);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Workspace not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/workspaces/:id
// @desc    Delete a workspace
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin rights required' });
    }
    
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }
    
    await workspace.remove();
    
    res.json({ msg: 'Workspace removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Workspace not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;