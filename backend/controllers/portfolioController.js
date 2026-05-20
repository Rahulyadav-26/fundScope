const Portfolio = require('../models/Portfolio');
const Fund = require('../models/Fund');
const User = require('../models/User');

exports.getPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.portfolioId) {
            return res.status(404).json({ message: 'No portfolio linked to this user' });
        }

        const portfolio = await Portfolio.findById(user.portfolioId);
        
        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        // Enrich holdings with latest NAVs
        const enrichedHoldings = [];
        let totalValue = 0;

        for (const holding of portfolio.holdings) {
            const fund = await Fund.findOne({ schemeCode: holding.fundCode });
            if (fund) {
                const currentValue = holding.units * fund.latestNav;
                totalValue += currentValue;
                
                enrichedHoldings.push({
                    ...holding.toObject(),
                    currentNav: fund.latestNav,
                    currentValue: currentValue,
                    absoluteReturn: ((currentValue - holding.investedAmount) / holding.investedAmount) * 100,
                    category: fund.category,
                    subCategory: fund.subCategory
                });
            } else {
                 enrichedHoldings.push(holding);
            }
        }

        // Calculate current allocation %
        const finalHoldings = enrichedHoldings.map(h => ({
            ...h,
            currentAllocation: (h.currentValue / totalValue) * 100
        }));

        res.json({
            ...portfolio.toObject(),
            holdings: finalHoldings,
            currentValue: totalValue,
            absoluteReturn: ((totalValue - portfolio.totalInvested) / portfolio.totalInvested) * 100
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.importPortfolio = async (req, res) => {
    // This will be implemented to handle CSV upload and parsing on backend
    // For now, assume frontend parses and sends JSON
    try {
        const { name, holdings } = req.body;
        
        let totalInvested = 0;
        const portfolioHoldings = [];
        const portfolioTransactions = [];

        for (const h of holdings) {
            const fund = await Fund.findOne({ schemeCode: h.fundCode });
            if (!fund) continue; // Skip unknown funds

            totalInvested += h.investedAmount;
            
            portfolioHoldings.push({
                fundCode: h.fundCode,
                fundName: fund.schemeName,
                units: h.units,
                purchaseDate: new Date(h.purchaseDate),
                purchaseNav: h.purchaseNav,
                investedAmount: h.investedAmount,
                targetAllocation: h.targetAllocation
            });

            portfolioTransactions.push({
                date: new Date(h.purchaseDate),
                amount: h.investedAmount,
                fundCode: h.fundCode,
                units: h.units,
                nav: h.purchaseNav
            });
        }

        const portfolio = new Portfolio({
            name: name || 'Imported Portfolio',
            holdings: portfolioHoldings,
            transactions: portfolioTransactions,
            totalInvested
        });

        await portfolio.save();
        res.status(201).json(portfolio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
