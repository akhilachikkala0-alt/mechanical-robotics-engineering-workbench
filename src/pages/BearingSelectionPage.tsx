import React, { useState, useEffect } from 'react';
import { CircleDot, CheckCircle2, XCircle, Star, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { api } from '../services/api';
import { ComponentItem, Robot } from '../types';

interface BearingSelectionProps {
  currentRobot: Robot | null;
  initialShaftDiameter?: number;
  onNavigateToMaterials: () => void;
  onComponentAllocated?: () => void;
}

export const BearingSelectionPage: React.FC<BearingSelectionProps> = ({
  currentRobot,
  initialShaftDiameter = 20,
  onNavigateToMaterials,
  onComponentAllocated
}) => {
  const [shaftDiameter, setShaftDiameter] = useState<number>(initialShaftDiameter);
  const [bearings, setBearings] = useState<any[]>([]);
  const [recommendedBearing, setRecommendedBearing] = useState<any | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [allocatedIds, setAllocatedIds] = useState<number[]>([]);

  useEffect(() => {
    evaluateBearings();
  }, [shaftDiameter]);

  const evaluateBearings = async () => {
    try {
      setLoading(true);
      const data = await api.recommendBearing({ shaft_diameter: shaftDiameter });
      setBearings(data.all_bearings);
      setRecommendedBearing(data.recommended_bearing);
      setReason(data.recommendation_reason);
    } catch (err) {
      console.error('Failed to evaluate bearings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (bearing: any) => {
    if (!currentRobot) {
      alert('Please select an active robot first from the top bar.');
      return;
    }
    try {
      await api.addRobotComponent({
        robot_id: currentRobot.robot_id,
        component_id: bearing.component_id,
        quantity: 2, // 2 bearings per joint support
        role_or_joint: 'Joint 2 Support Bearings (Pair)',
        unit_cost: bearing.cost
      });
      setAllocatedIds((prev) => [...prev, bearing.component_id]);
      if (onComponentAllocated) onComponentAllocated();
    } catch (err: any) {
      alert('Error allocating bearing: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <CircleDot className="w-3.5 h-3.5" />
            <span>DATABASE: Bearing Subtype Query</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Bearing Selection &amp; Shaft Coupling</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Match joint support rolling element bearings to motor shaft diameter and radial load capacities.
          </p>
        </div>

        {/* Shaft Diameter Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-slate-300 font-medium">Motor Shaft Diameter:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={shaftDiameter}
              onChange={(e) => setShaftDiameter(parseInt(e.target.value) || 10)}
              className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sky-400 font-mono font-bold text-sm focus:outline-none focus:border-sky-500"
            />
            <span className="text-xs font-mono text-slate-400">mm</span>
          </div>
        </div>
      </div>

      {/* Recommended Bearing Highlight Banner */}
      {recommendedBearing && (
        <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/30 border-2 border-sky-500/50 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-sky-500 text-slate-950 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Exact Shaft Bore Match
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Bore Diameter: <strong className="text-white">Ø{recommendedBearing.bore_diameter} mm</strong>
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                {recommendedBearing.component_name}
              </h2>

              <p className="text-xs text-sky-200/90 max-w-2xl leading-relaxed">
                {reason} Precision radial deep-groove ball bearing engineered for high rotational concentricity and low frictional moment.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-300">
                <span>Mfg: <strong className="text-white">{recommendedBearing.manufacturer}</strong></span>
                <span>•</span>
                <span>OD: <strong className="text-slate-200">Ø{recommendedBearing.outer_diameter} mm</strong></span>
                <span>•</span>
                <span>Width: <strong className="text-slate-200">{recommendedBearing.width} mm</strong></span>
                <span>•</span>
                <span>Dyn. Load (C): <strong className="text-emerald-400">{recommendedBearing.dynamic_load_rating} kN</strong></span>
                <span>•</span>
                <span>Price: <strong className="text-emerald-400 font-bold text-sm">₹{recommendedBearing.cost.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleAllocate(recommendedBearing)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add Bearing Pair to BOM</span>
              </button>

              <button
                onClick={onNavigateToMaterials}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Material Selection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Bearings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Bearing Catalog Evaluated for Ø{shaftDiameter}mm Drive Shaft</h3>
          <span className="text-xs font-mono text-slate-400">Total: {bearings.length} bearings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Bearing Name &amp; Type</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3 font-mono">Bore (d)</th>
                <th className="py-3 px-3 font-mono">OD (D)</th>
                <th className="py-3 px-3 font-mono">Width (B)</th>
                <th className="py-3 px-3 font-mono">Dyn. Load (C)</th>
                <th className="py-3 px-3 font-mono">Unit Cost</th>
                <th className="py-3 px-3">Fit Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {bearings.map((b) => {
                const isMatch = Math.abs(b.bore_diameter - shaftDiameter) < 0.1;
                const isAllocated = allocatedIds.includes(b.component_id);
                return (
                  <tr key={b.component_id} className={`hover:bg-slate-800/40 ${isMatch ? 'bg-sky-950/15' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{b.component_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{b.bearing_type || 'Ball Bearing'}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-medium">{b.manufacturer}</td>

                    <td className="py-3 px-3 font-mono text-sm font-bold text-sky-400">
                      Ø{b.bore_diameter} mm
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">Ø{b.outer_diameter} mm</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{b.width} mm</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{b.dynamic_load_rating} kN</td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-sm">
                      ₹{b.cost.toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      {isMatch ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Exact Fit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Bore Mismatch
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleAllocate(b)}
                        className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1 transition-all ${
                          isAllocated
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                            : isMatch
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {isAllocated ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Allocated</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            <span>Select</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
