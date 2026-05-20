import { create } from 'zustand';
import api from '@/lib/axios';

const usePortfolioStore = create((set, get) => ({
    portfolio: null,
    analytics: {
        returns: null,
        factors: null,
        rebalance: null,
        history: null,
        risk: null
    },
    isLoading: false,
    error: null,

    fetchPortfolioData: async () => {
        set({ isLoading: true, error: null });
        try {
            // 1. Fetch main portfolio
            const portRes = await api.get(`/portfolio`);
            const portfolioData = portRes.data;
            const portId = portfolioData._id;

            // 2. Fetch all analytics in parallel
            const [returnsRes, factorsRes, rebalanceRes, historyRes, riskRes] = await Promise.all([
                api.get(`/analytics/returns/${portId}`),
                api.get(`/analytics/factors/${portId}`),
                api.get(`/analytics/rebalance/${portId}`),
                api.get(`/analytics/history/${portId}`),
                api.get(`/analytics/risk/${portId}`)
            ]);

            set({
                portfolio: portfolioData,
                analytics: {
                    returns: returnsRes.data,
                    factors: factorsRes.data,
                    rebalance: rebalanceRes.data,
                    history: historyRes.data,
                    risk: riskRes.data
                },
                isLoading: false
            });
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
            set({ error: error.message || 'Failed to fetch data', isLoading: false });
        }
    },

    importCSV: async (csvData) => {
        // Implementation later
        console.log("Importing CSV...", csvData);
    }
}));

export default usePortfolioStore;
