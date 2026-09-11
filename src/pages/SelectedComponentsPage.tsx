import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, DollarSign, ArrowRight, Printer, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Robot, RobotComponentAllocation } from '../types';

interface SelectedComponentsProps {
  currentRobot: Robot | null;
  onNavigateToCost: () => void;
  onNavigateToCatalog: () => void;
}

export const SelectedComponentsPage: React.FC<SelectedComponentsProps> = ({
  currentRobot,
  onNavigateToCost,
  onNavigateToCatalog
}) => {
  const [items, setItems] = useState<RobotComponentAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBOM();
  }, [currentRobot]);

  const loadBOM = async () => {
    if (!currentRobot) return;
    try {
      setLoading(true);
      const data = await api.getRobotComponents(currentRobot.robot_id);
      setItems(data);
    } catch (err) {
      console.error('Failed to load BOM:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (id: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      handleDelete(id);
      return;
    }
    try {
      await api.updateRobotComponentQty(id, newQty);
      loadBOM();
    } catch (err: any) {
      alert('Error updating quantity: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteRobotComponent(id);
      loadBOM();
    } catch (err: any) {
      alert('Error removing item from BOM: ' + err.message);
    }
  };

  const totalCost = items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);
  const totalWeight = items.reduce((acc, item) => acc + item.quantity * 2.1, 0); // approx structural weight

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>DATABASE: Robot_Component Junction Table</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Bill of Materials (BOM) &amp; Allocation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Allocated hardware components, actuators, bearings, and structures for <strong className="text-sky-400">{currentRobot?.robot_name || 'PickBot-01'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onNavigateToCatalog}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More from Catalog</span>
          </button>
          <button
            onClick={onNavigateToCost}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5"
          >
            <span>Cost vs Budget Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">BOM Items Count</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">{items.length} unique parts</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Total Hardware Cost</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              ₹{totalCost.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Target Budget Status</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Within ₹{(currentRobot?.budget || 80000).toLocaleString()}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
            {(currentRobot?.budget ? Math.round((totalCost / currentRobot.budget) * 100) : 96)}%
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Itemized Bill of Materials (BOM)</h3>
          <span className="text-xs font-mono text-slate-400">Arm: {currentRobot?.robot_name}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Component Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Subsystem Role / Joint Location</th>
                <th className="py-3 px-3 font-mono text-center">Quantity</th>
                <th className="py-3 px-3 font-mono text-right">Unit Cost (₹)</th>
                <th className="py-3 px-3 font-mono text-right">Subtotal (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-xs">{item.component_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.manufacturer}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800/40">
                      {item.component_type}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-300 font-mono text-xs">
                    {item.role_or_joint}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-white px-1 text-xs">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-right text-slate-300">
                    ₹{item.unit_cost.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-right text-sm">
                    ₹{(item.quantity * item.unit_cost).toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove from BOM"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-slate-950/90 border-t-2 border-slate-800 text-xs font-mono font-bold">
              <tr>
                <td colSpan={5} className="py-3 px-4 text-right text-slate-300 uppercase tracking-wider">
                  Total Bill of Materials Cost:
                </td>
                <td className="py-3 px-3 text-right text-base text-emerald-400">
                  ₹{totalCost.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
