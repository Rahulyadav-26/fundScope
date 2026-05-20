const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  schemeCode: { type: Number, required: true, unique: true },
  schemeName: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  fundHouse: { type: String },
  latestNav: { type: Number },
  navDate: { type: Date },
  navHistory: [{
    date: { type: Date },
    nav: { type: Number }
  }],
  riskMetrics: {
    stdDev1Y: { type: Number },
    sharpeRatio: { type: Number },
    beta: { type: Number },
    alpha: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Fund', fundSchema);
