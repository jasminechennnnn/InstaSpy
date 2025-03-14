const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
const historyController = require('../controllers/historyController');

// All routes require authentication
router.use(protect);

router.get('/', historyController.getSearchHistories);
router.get('/:id', historyController.getSearchHistory);
router.delete('/:id', historyController.deleteSearchHistory);

module.exports = router;