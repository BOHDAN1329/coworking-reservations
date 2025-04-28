// server/models/Coworking.js
const mongoose = require('mongoose');

const coworkingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  facilities: [{
    type: String,
    enum: ['wifi', 'coffee', 'printer', 'meeting_room', 'parking', 'lockers', 'free_snacks']
  }],
  parkingSpaces: {
    total: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    }
  },
  maxCapacity: {
    type: Number,
    default: 0
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  openingHours: {
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    }
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Coworking = mongoose.model('Coworking', coworkingSchema);

module.exports = Coworking;