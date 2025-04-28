// server/models/Workspace.js
const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  coworking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coworking',
    required: true
  },
  type: {
    type: String,
    enum: ['desk', 'office', 'meeting_room'],
    required: true
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    default: 1
  },
  available: {
    type: Boolean,
    default: true
  },
  position: {
    x: Number,
    y: Number
  },
  discounts: {
    day: {
      type: Number,
      default: 10 // 10% знижка за день
    },
    month: {
      type: Number,
      default: 20 // 20% знижка за місяць
    },
    year: {
      type: Number,
      default: 30 // 30% знижка за рік
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;