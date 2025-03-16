const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
const analyzerController = require('../controllers/analyzerController');

// All routes require authentication
router.use(protect);

// Main routes
router.post('/login', analyzerController.loginInstagram);
router.get('/fetch', analyzerController.getFollowees);
router.post('/logout', analyzerController.logoutInstagram);

// test LLM api
router.post('/analysis/:id', analyzerController.triggerAnalysisProcess);

module.exports = router;