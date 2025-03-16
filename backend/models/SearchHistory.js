const mongoose = require('mongoose');

// followeeSchema
const followeeSchema = new mongoose.Schema({
  username: String,
  full_name: String
}, { _id: false });

// analysisResultSchema
const analysisResultSchema = new mongoose.Schema({
  model: {
    type: String,
    default: ''
  },
  time: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getTime() + (8 * 60 * 60 * 1000)); // utc+8
    }
  },
  result: {
    type: String,
    default: ''
  }
}, { _id: false });

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searcherUsername: {
    type: String,
    default: ''
  },
  targetUsername: {
    type: String,
    required: true
  },
  followeeList: {
    type: [followeeSchema],
    default: []
  },
  analysisResult: {
    type: analysisResultSchema,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getTime() + (8 * 60 * 60 * 1000)); // utc+8
    }
  }
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);