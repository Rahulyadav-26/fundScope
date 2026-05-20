const Portfolio = require('../models/Portfolio');
const Fund = require('../models/Fund');
const engine = require('../services/analyticsEngine');

exports.getReturns = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id) || await Portfolio.findOne();
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

        // Calculate XIRR
        const cashFlows = portfolio.transactions.map(t => t.amount); // positive
        const dates = portfolio.transactions.map(t => t.date);
        
        // Add current value as a negative cashflow on today's date
        let currentValue = 0;
        for (const holding of portfolio.holdings) {
             const fund = await Fund.findOne({ schemeCode: holding.fundCode });
             if (fund) {
                 currentValue += holding.units * fund.latestNav;
             }
        }
        
        cashFlows.push(-currentValue);
        dates.push(new Date());

        let xirrValue = 0;
        try {
            xirrValue = engine.xirr(cashFlows, dates) * 100; // to percentage
        } catch(e) {
            console.error("XIRR error", e);
        }

        // TWRR estimation (simplified for demo: assuming 1 year return weighted)
        // A true TWRR requires daily portfolio valuation history
        let weightedReturns = 0;
        for (const holding of portfolio.holdings) {
             const fund = await Fund.findOne({ schemeCode: holding.fundCode });
             if (fund && fund.navHistory.length > 252) { // approx 1 year
                 const nav1Yago = fund.navHistory[fund.navHistory.length - 252].nav;
                 const return1Y = (fund.latestNav - nav1Yago) / nav1Yago;
                 const weight = holding.investedAmount / portfolio.totalInvested;
                 weightedReturns += (return1Y * weight);
             }
        }
        const twrrEst = weightedReturns * 100;

        res.json({
            xirr: xirrValue,
            twrr: twrrEst,
            absoluteReturn: ((currentValue - portfolio.totalInvested) / portfolio.totalInvested) * 100,
            totalInvested: portfolio.totalInvested,
            currentValue: currentValue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFactors = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id) || await Portfolio.findOne();
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

        const marketCap = { 'Large Cap': 0, 'Mid Cap': 0, 'Small Cap': 0, 'Flexi Cap': 0, 'Debt': 0, 'Sectoral': 0, 'Other': 0 };
        const assetClass = { 'Equity': 0, 'Debt': 0, 'Hybrid': 0 };
        
        let totalValue = 0;

        for (const holding of portfolio.holdings) {
             const fund = await Fund.findOne({ schemeCode: holding.fundCode });
             if (fund) {
                 const val = holding.units * fund.latestNav;
                 totalValue += val;
                 
                 marketCap[fund.category] = (marketCap[fund.category] || 0) + val;
                 assetClass[fund.subCategory] = (assetClass[fund.subCategory] || 0) + val;
             }
        }

        // Convert to percentages
        Object.keys(marketCap).forEach(k => marketCap[k] = (marketCap[k] / totalValue) * 100 || 0);
        Object.keys(assetClass).forEach(k => assetClass[k] = (assetClass[k] / totalValue) * 100 || 0);

        res.json({ marketCap, assetClass });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRebalance = async (req, res) => {
     try {
        const portfolio = await Portfolio.findById(req.params.id) || await Portfolio.findOne();
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

        let totalValue = 0;
        const currentVals = [];

        for (const holding of portfolio.holdings) {
             const fund = await Fund.findOne({ schemeCode: holding.fundCode });
             if (fund) {
                 const val = holding.units * fund.latestNav;
                 totalValue += val;
                 currentVals.push({ holding, val });
             }
        }

        const recommendations = [];
        for (const { holding, val } of currentVals) {
             const currentAlloc = (val / totalValue) * 100;
             const targetAlloc = holding.targetAllocation;
             const drift = currentAlloc - targetAlloc;
             
             // If drift is more than 2% absolute
             if (Math.abs(drift) > 2) {
                 const targetVal = totalValue * (targetAlloc / 100);
                 const diff = targetVal - val; // Positive means buy, negative means sell
                 
                 recommendations.push({
                     fundName: holding.fundName,
                     currentAllocation: currentAlloc,
                     targetAllocation: targetAlloc,
                     drift: drift,
                     action: diff > 0 ? 'BUY' : 'SELL',
                     amount: Math.abs(diff)
                 });
             }
        }

        res.json({ recommendations, totalValue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getPortfolioHistory = async (req, res) => {
    // Construct a synthetic portfolio history for the chart
    try {
        const portfolio = await Portfolio.findById(req.params.id) || await Portfolio.findOne();
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

        // We'll generate history for the last 1 year (252 trading days roughly)
        const historyLength = 250; 
        const portfolioHistory = [];
        
        // Fetch all relevant funds
        const funds = {};
        for (const holding of portfolio.holdings) {
             const fund = await Fund.findOne({ schemeCode: holding.fundCode });
             if(fund) funds[holding.fundCode] = fund;
        }

        // Generate daily valuation
        // This is a simplified simulation assuming holdings were constant
        if (Object.values(funds).length > 0) {
            const sampleFund = Object.values(funds)[0];
            const maxDays = Math.min(historyLength, sampleFund.navHistory.length);
            
            for(let i=0; i < maxDays; i++) {
                // Read from end to get recent data
                const idxOffset = sampleFund.navHistory.length - maxDays + i;
                if (idxOffset < 0) continue;
                
                const date = sampleFund.navHistory[idxOffset].date;
                let dailyValue = 0;
                
                for (const holding of portfolio.holdings) {
                    const fund = funds[holding.fundCode];
                    if(fund && fund.navHistory[idxOffset]) {
                        dailyValue += holding.units * fund.navHistory[idxOffset].nav;
                    }
                }
                
                // Mock Nifty 50 for comparison (just a slightly different curve)
                const mockNiftyBase = 20000;
                const progress = i / maxDays;
                // Add some noise and trend
                const mockNiftyReturn = 0.15 * progress + 0.05 * Math.sin(progress * 10);
                const niftyValue = portfolio.totalInvested * (1 + mockNiftyReturn);
                
                portfolioHistory.push({
                    date: date,
                    value: dailyValue,
                    invested: portfolio.totalInvested,
                    benchmark: niftyValue
                });
            }
        }

        res.json(portfolioHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getRiskMetrics = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id) || await Portfolio.findOne();
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

        // Calculate a blended portfolio return series to get real risk metrics
        // (Simplified for demo)
        
        let blendedStdDev = 0;
        let blendedSharpe = 0;
        let totalValue = 0;

        for (const holding of portfolio.holdings) {
             const fund = await Fund.findOne({ schemeCode: holding.fundCode });
             if (fund) {
                 const val = holding.units * fund.latestNav;
                 totalValue += val;
                 
                 const weight = holding.investedAmount / portfolio.totalInvested;
                 blendedStdDev += (fund.riskMetrics.stdDev1Y * weight);
                 blendedSharpe += (fund.riskMetrics.sharpeRatio * weight);
             }
        }

        res.json({
            standardDeviation: blendedStdDev,
            sharpeRatio: blendedSharpe,
            maxDrawdown: -0.12, // Mocked for demo as real MDD calc needs daily total portfolio value history
            sortinoRatio: blendedSharpe * 1.3 // Rough proxy
        });

    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}
