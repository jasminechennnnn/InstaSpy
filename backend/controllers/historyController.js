const SearchHistory = require('../models/SearchHistory');

// @desc    Get all search histories for a user
// @route   GET /api/history
// @access  Private
exports.getSearchHistories = async (req, res) => {
  try {
    const searchHistories = await SearchHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: searchHistories.length,
      data: searchHistories.map(history => ({
        id: history._id,
        targetUsername: history.targetUsername,
        status: history.status,
        createdAt: history.createdAt
        
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete search history
// @route   DELETE /api/history/:id
// @access  Private
exports.deleteSearchHistory = async (req, res) => {
  try {
    const searchHistory = await SearchHistory.findById(req.params.id);

    if (!searchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Search history not found'
      });
    }

    // Ensure users can only delete their own history records
    if (searchHistory.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this search history'
      });
    }

    // remove(), deleteOne()
    await searchHistory.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single search history details
// @route   GET /api/history/:id
// @access  Private
exports.getSearchHistory = async (req, res) => {
  try {
    const searchHistory = await SearchHistory.findById(req.params.id);

    if (!searchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Search history not found'
      });
    }

    // Ensure users can only view their own history records
    if (searchHistory.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this search history'
      });
    }

    // Format analysisResult for response based on its structure
    const formattedHistory = {
      ...searchHistory.toObject(),
      analysisResult: searchHistory.analysisResult
    };

    // If analysisResult is a string (old format), convert to the new object structure
    if (typeof formattedHistory.analysisResult === 'string') {
      formattedHistory.analysisResult = {
        model: '',
        time: formattedHistory.createdAt,
        result: formattedHistory.analysisResult || ''
      };
    }

    res.status(200).json({
      success: true,
      data: formattedHistory
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};