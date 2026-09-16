import React, { useState } from 'react';
import { DollarSign, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatNumber } from './crypto-browser';

export const RoiCalculator: React.FC = () => {
  const [monthlyConversations, setMonthlyConversations] = useState(25000);
  const [activeAgents, setActiveAgents] = useState(50);

  const handleConversationsChange = (val: number) => {
    const clamped = Math.max(2000, Math.min(200000, val));
    setMonthlyConversations(clamped);
  };

  const handleAgentsChange = (val: number) => {
    const clamped = Math.max(5, Math.min(250, val));
    setActiveAgents(clamped);
  };

  // Salesforce Agentforce calculation
  // $2.00 per conversation + $500/month org fee + Data cloud flex credits (~$1,250/mo for 25k)
  const salesforceMonthlyCost = (monthlyConversations * 2.00) + 500 + (monthlyConversations * 0.05);
  const salesforceAnnualCost = salesforceMonthlyCost * 12;

  // ACR OpsRoom calculation
  // Open Source Protocol ($0) + self-hosted or mesh compute (~$0.015 per multi-agent deliberation round)
  const acrMonthlyCost = (monthlyConversations * 0.015) + (activeAgents * 5);
  const acrAnnualCost = acrMonthlyCost * 12;

  const annualSavings = Math.max(0, salesforceAnnualCost - acrAnnualCost);
  const percentSavings = Math.round((annualSavings / salesforceAnnualCost) * 100);

  return (
    <section 
      aria-labelledby="roi-heading"
      className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
    >
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-3">
          <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
          Enterprise ROI &amp; TCO Calculator
        </div>
        <h3 id="roi-heading" className="text-2xl font-extrabold text-white tracking-tight mb-2">
          Calculate Your Migration Savings
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Salesforce charges $2.00 per conversation plus platform taxes. See your annual savings with ACR OpsRoom.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Sliders Input */}
        <div className="space-y-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <label htmlFor="conversations-slider">Monthly Operations Conversations / Actions:</label>
              <span className="text-cyan-400 font-mono text-sm">{formatNumber(monthlyConversations)}</span>
            </div>
            <input
              id="conversations-slider"
              type="range"
              min="2000"
              max="200000"
              step="1000"
              value={monthlyConversations}
              onChange={(e) => handleConversationsChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>2,000</span>
              <span>100,000</span>
              <span>200,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <label htmlFor="agents-slider">Autonomous Agents &amp; Squads Active:</label>
              <span className="text-purple-400 font-mono text-sm">{activeAgents}</span>
            </div>
            <input
              id="agents-slider"
              type="range"
              min="5"
              max="250"
              step="5"
              value={activeAgents}
              onChange={(e) => handleAgentsChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>5 Agents</span>
              <span>125 Agents</span>
              <span>250 Agents</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>100% Free Open Protocol under Apache-2.0. No credit cards, no vendor lock-in.</span>
          </div>
        </div>

        {/* Output Comparison Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
                Salesforce Agentforce Annual Cost
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {formatCurrency(salesforceAnnualCost)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Includes $2.00/conv fee + $500/mo platform seat + Data Cloud consumption credits
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden shadow-xl shadow-emerald-950/20">
            <div className="relative z-10">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                ACR OpsRoom Annual Cost
              </span>
              <div className="text-3xl font-black text-cyan-300 mt-1">
                {formatCurrency(acrAnnualCost)}
              </div>
              <p className="text-[11px] text-slate-300 mt-1 font-medium">
                $0 Protocol Tax + pure bare-metal or mesh token compute
              </p>
            </div>

            <div className="sm:text-right relative z-10">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Net Annual Enterprise Savings
              </div>
              <div className="text-3xl font-black text-white mt-1">
                {formatCurrency(annualSavings)}
              </div>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30">
                {percentSavings}% Cost Reduction
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
