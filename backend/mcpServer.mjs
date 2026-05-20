import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mongoose from "mongoose";
import Fund from "./models/Fund.js";
import Portfolio from "./models/Portfolio.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const server = new Server(
  {
    name: "PortfolioLens-Jetro-Integration",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio_lens")
  .then(() => console.error("MCP Server Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_portfolio_summary",
        description: "Returns total AUM, total invested, and overall portfolio metrics.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_fund_holdings",
        description: "Lists all mutual funds currently tracked in the user's portfolio.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "analyze_risk_return",
        description: "Analyzes the standard deviation and returns of funds in the database.",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum number of funds to analyze" }
          },
          required: [],
        },
      },
      {
        name: "rebalance_portfolio",
        description: "Calculates the buy/sell amounts needed to rebalance the portfolio to its target allocation.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get_portfolio_summary": {
      try {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) throw new Error("No portfolio found.");
        
        // Calculate current value
        let currentValue = 0;
        for (const holding of portfolio.holdings) {
          const fund = await Fund.findOne({ schemeCode: holding.fundCode });
          if (fund && fund.latestNav) {
            currentValue += holding.units * fund.latestNav;
          } else {
            currentValue += holding.units * holding.purchaseNav;
          }
        }
        
        const absoluteReturn = ((currentValue - portfolio.totalInvested) / portfolio.totalInvested) * 100;
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                totalInvested: portfolio.totalInvested,
                currentValue: currentValue,
                absoluteReturnPct: absoluteReturn.toFixed(2),
                holdingsCount: portfolio.holdings.length
              }, null, 2),
            },
          ],
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }] };
      }
    }
    
    case "get_fund_holdings": {
      try {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) throw new Error("No portfolio found.");
        
        const holdingsData = await Promise.all(portfolio.holdings.map(async h => {
          const fund = await Fund.findOne({ schemeCode: h.fundCode });
          return {
            fundName: h.fundName,
            units: h.units,
            investedAmount: h.investedAmount,
            currentNav: fund ? fund.latestNav : h.purchaseNav,
            targetAllocation: h.targetAllocation
          };
        }));
        
        return {
          content: [{ type: "text", text: JSON.stringify(holdingsData, null, 2) }]
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }] };
      }
    }
    
    case "analyze_risk_return": {
      try {
        const limit = request.params.arguments?.limit || 50;
        const funds = await Fund.find({ 'riskMetrics.sharpeRatio': { $exists: true } }).limit(limit);
        
        const data = funds.map(f => ({
          name: f.schemeName,
          category: f.category,
          sharpeRatio: f.riskMetrics.sharpeRatio,
          stdDev1Y: f.riskMetrics.stdDev1Y,
          latestNav: f.latestNav
        }));
        
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }] };
      }
    }
    
    case "rebalance_portfolio": {
      try {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) throw new Error("No portfolio found.");
        
        let currentValue = 0;
        const holdingsWithCurrent = await Promise.all(portfolio.holdings.map(async h => {
          const fund = await Fund.findOne({ schemeCode: h.fundCode });
          const val = h.units * (fund ? fund.latestNav : h.purchaseNav);
          currentValue += val;
          return { ...h.toObject(), currentVal: val };
        }));
        
        const rebalanceActions = holdingsWithCurrent.map(h => {
          const currentAlloc = (h.currentVal / currentValue) * 100;
          const targetValue = currentValue * (h.targetAllocation / 100);
          const difference = targetValue - h.currentVal;
          
          return {
            fund: h.fundName,
            currentAllocation: currentAlloc.toFixed(2) + "%",
            targetAllocation: h.targetAllocation + "%",
            action: difference > 0 ? 'BUY' : 'SELL',
            amount: Math.abs(difference).toFixed(2)
          };
        });
        
        return {
          content: [{ type: "text", text: JSON.stringify(rebalanceActions, null, 2) }]
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }] };
      }
    }

    default:
      throw new Error("Unknown tool");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PortfolioLens MCP Server running on stdio");
}

main().catch(console.error);
