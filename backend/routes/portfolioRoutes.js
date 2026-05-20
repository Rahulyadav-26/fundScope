const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

router.get('/:id', auth, portfolioController.getPortfolio);
router.get('/', auth, portfolioController.getPortfolio); // Default/first portfolio for demo
router.post('/import', auth, portfolioController.importPortfolio);

module.exports = router;
