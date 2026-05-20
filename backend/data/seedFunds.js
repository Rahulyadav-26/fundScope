const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const Fund = require('../models/Fund');
const Portfolio = require('../models/Portfolio');
const { fetchNavFromAPI } = require('../services/navService');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const categorizeFund = (fundName, categoryFromAPI) => {
    // Basic heuristics to assign categories for UI filtering
    const name = fundName.toLowerCase();
    
    let category = "Other";
    let subCategory = "Hybrid";

    if (name.includes('large cap') || name.includes('bluechip')) {
        category = "Large Cap";
        subCategory = "Equity";
    } else if (name.includes('mid cap') || name.includes('midcap')) {
        category = "Mid Cap";
        subCategory = "Equity";
    } else if (name.includes('small cap') || name.includes('smallcap')) {
        category = "Small Cap";
        subCategory = "Equity";
    } else if (name.includes('flexi cap') || name.includes('flexicap') || name.includes('multi cap')) {
        category = "Flexi Cap";
        subCategory = "Equity";
    } else if (name.includes('liquid') || name.includes('bond') || name.includes('debt')) {
        category = "Debt";
        subCategory = "Debt";
    } else if (name.includes('technology') || name.includes('pharma') || name.includes('sector')) {
        category = "Sectoral";
        subCategory = "Equity";
    }

    return { category, subCategory };
};

const seedFunds = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfoliolens');
        console.log('Connected to MongoDB');

        // 1. Read the sample CSV to get the list of funds we care about
        const csvFile = fs.readFileSync(path.join(__dirname, 'samplePortfolio.csv'), 'utf8');
        const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true });
        
        const schemeCodesToFetch = parsed.data.map(row => parseInt(row['Scheme Code']));
        
        console.log(`Need to fetch data for ${schemeCodesToFetch.length} funds...`);

        // 2. Clear existing data
        await Fund.deleteMany({});
        await Portfolio.deleteMany({});
        console.log('Cleared existing collections');

        // 3. Fetch data from MFAPI and create Funds
        for (const code of schemeCodesToFetch) {
            console.log(`Fetching NAV for scheme ${code}...`);
            const apiData = await fetchNavFromAPI(code);
            
            if (apiData) {
                const { category, subCategory } = categorizeFund(apiData.schemeName, apiData.category);

                // Calculate simple mock risk metrics based on category for demo purposes
                let stdDev = 0.15;
                let sharpe = 1.2;
                if(subCategory === 'Debt') { stdDev = 0.05; sharpe = 0.8; }
                if(category === 'Small Cap') { stdDev = 0.25; sharpe = 1.5; }

                const newFund = new Fund({
                    schemeCode: code,
                    schemeName: apiData.schemeName,
                    category: category,
                    subCategory: subCategory,
                    fundHouse: apiData.fundHouse,
                    latestNav: apiData.latestNav,
                    navDate: apiData.navDate,
                    navHistory: apiData.navHistory,
                    riskMetrics: {
                        stdDev1Y: stdDev,
                        sharpeRatio: sharpe,
                        beta: 1.0,
                        alpha: 0.05
                    }
                });
                
                await newFund.save();
                console.log(`Saved fund: ${apiData.schemeName}`);
            }
            // Be nice to the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 4. Create the initial sample Portfolio
        console.log('Creating sample portfolio...');
        const portfolioHoldings = [];
        const portfolioTransactions = [];
        let totalInv = 0;

        for (const row of parsed.data) {
            const code = parseInt(row['Scheme Code']);
            const dbFund = await Fund.findOne({ schemeCode: code });
            
            if (dbFund) {
                const units = parseFloat(row['Units']);
                const invAmt = parseFloat(row['Invested Amount']);
                const pDate = new Date(row['Purchase Date']);
                
                // Find NAV on purchase date, or fallback to earliest available
                let pNav = dbFund.navHistory[0].nav;
                for(let h of dbFund.navHistory) {
                    if (h.date.getTime() >= pDate.getTime()) {
                        pNav = h.nav;
                        break;
                    }
                }

                portfolioHoldings.push({
                    fundCode: code,
                    fundName: dbFund.schemeName,
                    units: units,
                    purchaseDate: pDate,
                    purchaseNav: pNav,
                    investedAmount: invAmt,
                    targetAllocation: parseFloat(row['Target %'])
                });

                portfolioTransactions.push({
                    date: pDate,
                    amount: invAmt,
                    fundCode: code,
                    units: units,
                    nav: pNav
                });
                totalInv += invAmt;
            }
        }

        const samplePortfolio = new Portfolio({
            name: 'Demo Portfolio (Ishaan)',
            holdings: portfolioHoldings,
            transactions: portfolioTransactions,
            totalInvested: totalInv
        });

        await samplePortfolio.save();
        console.log('Sample portfolio created successfully!');
        
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedFunds();
