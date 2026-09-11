import React, { useState, useEffect } from 'react';
import { HandMetal, Star, CheckCircle2, XCircle, ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Robot } from '../types';

interface GripperSelectionProps {
  currentRobot: Robot | null;
  onNavigateToSensors: () => void;
  onComponentAllocated?: () => void;
}

export const GripperSelectionPage: React.FC<GripperSelectionProps> = ({
  currentRobot,
  onNavigateToSensors,
  onComponentAllocated
}) => {
  const [grippers, setGrippers] = useState<any[]>([]);
  const [recommendedGripper, setRecommendedGripper] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [allocatedIds, setAllocatedIds] = useState<number[]>([]);
  const payloadTarget = currentRobot?.payload || 5.0;

  useEffect(() => {
    loadGrippers();
  }, [payloadTarget]);

  const loadGrippers = async () => {
    try {
      setLoading(true);
      const data = await api.recommendGripper({ payload: payloadTarget });
      setGrippers(data.all_grippers);
      setRecommendedGripper(data.recommended_gripper);
      setReason(data.recommendation_reason);
    } catch (err) {
      console.error('Failed to load grippers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (grip: any) => {
    if (!currentRobot) {
      alert('Please select an active robot first from the top bar.');
      return;
    }
    try {
      await api.addRobotComponent({
        robot_id: currentRobot.robot_id,
        component_id: grip.component_id,
        quantity: 1,
        role_or_joint: 'Tool Flange End-Effector',
        unit_cost: grip.cost
      });
      setAllocatedIds((prev) => [...prev, grip.component_id]);
      if (onComponentAllocated) onComponentAllocated();
    } catch (err: any) {
      alert('Error allocating gripper: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <HandMetal className="w-3.5 h-3.5" />
            <span>DATABASE: Gripper Subtype Query</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">End-Effector &amp; Gripper Selection</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select mechanical clamping, vacuum, or magnetic end-effectors sized for workpiece mass ({payloadTarget} kg).
          </p>
        </div>

        <button
          onClick={onNavigateToSensors}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Next: Sensors &amp; Controllers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recommended Gripper Banner */}
      {recommendedGripper && (
        <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-teal-950/30 border-2 border-teal-500/50 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Recommended Gripper for {payloadTarget}kg Payload
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Rated Capacity: <strong className="text-white">{recommendedGripper.max_payload} kg</strong>
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                {recommendedGripper.component_name}
              </h2>

              <p className="text-xs text-teal-200/90 max-w-2xl leading-relaxed">
                {reason}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-300">
                <span>Type: <strong className="text-white">{recommendedGripper.gripper_type}</strong></span>
                <span>•</span>
                <span>Jaw Stroke: <strong className="text-sky-400">{recommendedGripper.stroke} mm</strong></span>
                <span>•</span>
                <span>Grip Force: <strong className="text-emerald-400">{recommendedGripper.grip_force} N</strong></span>
                <span>•</span>
                <span>Actuation: <strong className="text-slate-200">{recommendedGripper.actuation_type}</strong></span>
                <span>•</span>
                <span>Price: <strong className="text-emerald-400 font-bold text-sm">₹{recommendedGripper.cost.toLocaleString()}</strong></span>
              </div>
            </div>

            <button
              onClick={() => handleAllocate(recommendedGripper)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add Gripper to Robot BOM</span>
            </button>
          </div>
        </div>
      )}

      {/* Catalog Grippers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grippers.map((g) => {
          const isSuitable = g.max_payload >= payloadTarget;
          const isAllocated = allocatedIds.includes(g.component_id);
          return (
            <div
              key={g.component_id}
              className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between shadow-sm transition-all ${
                isSuitable ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/60 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {g.gripper_type}
                  </span>
                  {isSuitable ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      Cap: {g.max_payload} kg
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                      Under-capacity
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mt-2 tracking-tight">{g.component_name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{g.specification}</p>

                <div className="mt-4 space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grip Force:</span>
                    <span className="text-emerald-400 font-bold">{g.grip_force} N</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stroke / Area:</span>
                    <span className="text-white">{g.stroke} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Actuation:</span>
                    <span className="text-slate-300">{g.actuation_type}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-emerald-400">
                  ₹{g.cost.toLocaleString()}
                </span>

                <button
                  onClick={() => handleAllocate(g)}
                  className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1 transition-all ${
                    isAllocated
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : isSuitable
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
