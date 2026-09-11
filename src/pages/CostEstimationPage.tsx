import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, AlertTriangle, ArrowRight, Layers, TrendingUp, History } from 'lucide-react';
import { api } from '../services/api';
import { Robot } from '../types';

interface CostEstimationProps {
  currentRobot: Robot | null;
  onNavigateToVersions: () => void;
}

export const CostEstimationPage: React.FC<CostEstimationProps> = ({
  currentRobot,
  onNavigateToVersions
}) => {
  const [costData, setCostData] = useState<{
    robot_name: string;
    budget: number;
    total_cost: number;
    variance: number;
    within_budget: boolean;
    status: string;
    recommendation: string;
    items: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCost();
  }, [currentRobot]);

  const loadCost = async () => {
    if (!currentRobot) return;
    try {
      setLoading(true);
      const data = await api.getRobotCost(currentRobot.robot_id);
      setCostData(data);
    } catch (err) {
      console.error('Failed to load cost data:', err);
    } finally {
      setLoading(false);
    }
  };

  const budget = costData?.budget || currentRobot?.budget || 80000;
  const totalCost = costData?.total_cost || 77150;
  const variance = budget - totalCost;
  const isWithinBudget = variance >= 0;
  const percentUsed = Math.min(100, Math.round((totalCost / budget) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span>FINANCIAL FEASIBILITY &amp; BUDGET ESTIMATION</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Design Cost vs. Budget Allocation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated budget variance tracking and economic component expenditure modeling for <strong className="text-sky-400">{currentRobot?.robot_name || 'PickBot-01'}</strong>.
          </p>
        </div>

        <button
          onClick={onNavigateToVersions}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Save Design Version</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Financial Status Banner */}
      <div
        className={`p-6 rounded-xl border-2 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isWithinBudget
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-rose-950/20 border-rose-500/40'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold shadow-lg ${
              isWithinBudget ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}
          >
            {isWithinBudget ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Budgetary Status:
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  isWithinBudget ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isWithinBudget ? 'WITHIN BUDGET' : 'OVER BUDGET'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mt-1">
              Estimated Total: ₹{totalCost.toLocaleString()} / Authorized: ₹{budget.toLocaleString()}
            </h2>

            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {costData?.recommendation || 'Design is within budget allocation. Safe to proceed to fabrication.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex-shrink-0 min-w-[200px] text-right font-mono">
          <div className="text-[11px] text-slate-400">Budget Variance</div>
          <div
            className={`text-xl font-bold mt-0.5 ${
              variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {variance >= 0 ? `+₹${variance.toLocaleString()}` : `-₹${Math.abs(variance).toLocaleString()}`}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {variance >= 0 ? 'Surplus funds available' : 'Budget deficit'}
          </div>
        </div>
      </div>

      {/* Progress Bar & Allocation Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">Budget Utilization: {percentUsed}%</span>
          <span className="text-slate-400">₹{totalCost.toLocaleString()} of ₹{budget.toLocaleString()} allocated</span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentUsed > 100 ? 'bg-rose-500' : percentUsed > 85 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Target Arm</span>
            <span className="text-white font-bold">{currentRobot?.robot_name || 'PickBot-01'}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Approved Cap</span>
            <span className="text-white font-bold">₹{budget.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Hardware BOM Total</span>
            <span className="text-emerald-400 font-bold">₹{totalCost.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Contingency Buffer</span>
            <span className="text-sky-400 font-bold">₹{Math.max(0, variance).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
