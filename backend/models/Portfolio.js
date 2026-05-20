const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'My Portfolio' },
  holdings: [{
    fundCode: { type: Number, required: true },
    fundName: { type: String, required: true },
    units: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
    purchaseNav: { type: Number, required: true },
    investedAmount: { type: Number, required: true },
    targetAllocation: { type: Number, required: true }
  }],
  transactions: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true }, // +ve = investment, -ve = redemption
    fundCode: { type: Number, required: true },
    units: { type: Number, required: true },
    nav: { type: Number, required: true }
  }],
  totalInvested: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
