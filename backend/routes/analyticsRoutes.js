const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/returns/:id', auth, analyticsController.getReturns);
router.get('/factors/:id', auth, analyticsController.getFactors);
router.get('/rebalance/:id', auth, analyticsController.getRebalance);
router.get('/history/:id', auth, analyticsController.getPortfolioHistory);
router.get('/risk/:id', auth, analyticsController.getRiskMetrics);

// Fallbacks for when no ID is provided (uses default portfolio)
router.get('/returns', auth, analyticsController.getReturns);
router.get('/factors', auth, analyticsController.getFactors);
router.get('/rebalance', auth, analyticsController.getRebalance);
router.get('/history', auth, analyticsController.getPortfolioHistory);
router.get('/risk', auth, analyticsController.getRiskMetrics);

module.exports = router;
