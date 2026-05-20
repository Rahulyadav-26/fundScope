// Financial math helper functions

const xnpv = (rate, values, dates) => {
  let result = 0;
  for (let i = 0; i < values.length; i++) {
    const t = (dates[i] - dates[0]) / (1000 * 60 * 60 * 24 * 365);
    result += values[i] / Math.pow(1 + rate, t);
  }
  return result;
};

const xirr = (values, dates, guess = 0.1) => {
  if (values.length !== dates.length) throw new Error('Values and dates must have same length');
  
  let positive = false;
  let negative = false;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 0) positive = true;
    if (values[i] < 0) negative = true;
  }
  if (!positive || !negative) return 0; // Need both positive and negative cash flows

  let limit = 100;
  let rate = guess;
  
  while (limit > 0) {
    let f1 = xnpv(rate, values, dates);
    let f2 = xnpv(rate + 0.0001, values, dates);
    let fPrime = (f2 - f1) / 0.0001;
    
    let newRate = rate - f1 / fPrime;
    if (Math.abs(newRate - rate) < 0.00001) {
      return newRate;
    }
    rate = newRate;
    limit--;
  }
  
  return rate; // or throw Error('XIRR did not converge')
};

const calculateStandardDeviation = (returns) => {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  // Annualize daily standard deviation (assuming 252 trading days)
  return Math.sqrt(variance) * Math.sqrt(252);
};

const calculateSharpeRatio = (returns, riskFreeRate = 0.07) => {
    if (returns.length === 0) return 0;
    
    // Convert annual risk free rate to daily
    const dailyRf = Math.pow(1 + riskFreeRate, 1/252) - 1;
    
    // Calculate daily excess returns
    const excessReturns = returns.map(r => r - dailyRf);
    
    const meanExcessReturn = excessReturns.reduce((a,b) => a+b, 0) / excessReturns.length;
    
    const stdDev = calculateStandardDeviation(returns) / Math.sqrt(252); // Daily std dev
    
    if (stdDev === 0) return 0;
    
    // Annualize Sharpe ratio
    return (meanExcessReturn / stdDev) * Math.sqrt(252);
};


const calculateMaxDrawdown = (navHistory) => {
    if (!navHistory || navHistory.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = navHistory[0].nav;
    
    for (let i = 1; i < navHistory.length; i++) {
        const currentNav = navHistory[i].nav;
        if (currentNav > peak) {
            peak = currentNav;
        }
        
        const drawdown = (currentNav - peak) / peak;
        if (drawdown < maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }
    
    return maxDrawdown;
};

// Calculate daily returns array from NAV history
const calculateReturns = (navHistory) => {
    const returns = [];
    for(let i=1; i < navHistory.length; i++) {
        returns.push((navHistory[i].nav - navHistory[i-1].nav) / navHistory[i-1].nav);
    }
    return returns;
}


module.exports = {
  xirr,
  calculateStandardDeviation,
  calculateSharpeRatio,
  calculateMaxDrawdown,
  calculateReturns
};
