const axios = require('axios');
const Fund = require('../models/Fund');

const fetchNavFromAPI = async (schemeCode) => {
    try {
        const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`);
        if (response.data && response.data.data && response.data.data.length > 0) {
             const meta = response.data.meta;
             // Parse the date (dd-mm-yyyy to Date object)
             const navHistory = response.data.data.map(item => {
                 const [day, month, year] = item.date.split('-');
                 return {
                     date: new Date(`${year}-${month}-${day}`),
                     nav: parseFloat(item.nav)
                 };
             });

             // Sort by date ascending
             navHistory.sort((a, b) => a.date - b.date);

             return {
                 schemeCode: meta.scheme_code,
                 schemeName: meta.scheme_name,
                 fundHouse: meta.fund_house,
                 category: meta.scheme_category,
                 latestNav: navHistory[navHistory.length - 1].nav,
                 navDate: navHistory[navHistory.length - 1].date,
                 navHistory: navHistory
             };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching NAV for scheme ${schemeCode}:`, error.message);
        return null;
    }
};

const updateFundNavs = async () => {
    try {
        const funds = await Fund.find({});
        console.log(`Starting NAV update for ${funds.length} funds...`);
        
        for (const fund of funds) {
            const apiData = await fetchNavFromAPI(fund.schemeCode);
            if (apiData) {
                // Keep only last 3 years of history to save space
                const threeYearsAgo = new Date();
                threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
                
                const filteredHistory = apiData.navHistory.filter(h => h.date >= threeYearsAgo);

                fund.latestNav = apiData.latestNav;
                fund.navDate = apiData.navDate;
                fund.navHistory = filteredHistory;
                // Also update other metadata if needed, but usually it doesn't change
                
                await fund.save();
                console.log(`Updated NAV for ${fund.schemeName}: ${fund.latestNav}`);
            }
            
            // Basic rate limiting to respect the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log('Finished NAV update.');
    } catch (error) {
         console.error('Error in bulk NAV update:', error);
    }
};

module.exports = {
    fetchNavFromAPI,
    updateFundNavs
};
