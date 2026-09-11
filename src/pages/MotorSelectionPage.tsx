import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, XCircle, Star, ArrowRight, ShoppingCart, Check, Sliders, Info, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { ComponentItem, Robot } from '../types';

interface MotorSelectionProps {
  currentRobot: Robot | null;
  initialTorque?: number;
  onNavigateToBearings: (shaftDiameter: number) => void;
  onComponentAllocated?: () => void;
}

export const MotorSelectionPage: React.FC<MotorSelectionProps> = ({
  currentRobot,
  initialTorque = 58.86,
  onNavigateToBearings,
  onComponentAllocated
}) => {
  const [requiredTorque, setRequiredTorque] = useState<number>(initialTorque);
  const [motors, setMotors] = useState<any[]>([]);
  const [recommendedMotor, setRecommendedMotor] = useState<any | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMotorId, setSelectedMotorId] = useState<number | null>(null);
  const [allocatedIds, setAllocatedIds] = useState<number[]>([]);

  useEffect(() => {
    evaluateMotors();
  }, [requiredTorque]);

  const evaluateMotors = async () => {
    try {
      setLoading(true);
      const data = await api.recommendMotor({ required_torque: requiredTorque, speed: 3000 });
      setMotors(data.all_motors);
      setRecommendedMotor(data.recommended_motor);
      setReason(data.recommendation_reason);
      if (data.recommended_motor) {
        setSelectedMotorId(data.recommended_motor.component_id);
      }
    } catch (err) {
      console.error('Failed to evaluate motors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (motor: any) => {
    if (!currentRobot) {
      alert('Please select an active robot first from the top bar.');
      return;
    }
    try {
      await api.addRobotComponent({
        robot_id: currentRobot.robot_id,
        component_id: motor.component_id,
        quantity: 1,
        role_or_joint: 'Joint 2 (Shoulder Actuator)',
        unit_cost: motor.cost
      });
      setAllocatedIds((prev) => [...prev, motor.component_id]);
      if (onComponentAllocated) onComponentAllocated();
    } catch (err: any) {
      alert('Error allocating motor: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>DATABASE: Motor Subtype Query</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Actuator &amp; Motor Selection Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate catalog servo motors against calculated static and dynamic joint torque requirements.
          </p>
        </div>

        {/* Required Torque Interactive Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-slate-300 font-medium">Design Torque Requirement:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.5"
              value={requiredTorque}
              onChange={(e) => setRequiredTorque(parseFloat(e.target.value) || 1)}
              className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-sky-500"
            />
            <span className="text-xs font-mono text-slate-400">Nm</span>
          </div>
        </div>
      </div>

      {/* Recommended Motor Banner */}
      {recommendedMotor && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/30 border-2 border-emerald-500/50 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Optimal Recommendation
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Rated Torque: <strong className="text-white">{recommendedMotor.rated_torque} Nm</strong> (≥ {requiredTorque} Nm required)
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                {recommendedMotor.component_name}
              </h2>

              <p className="text-xs text-emerald-200/90 max-w-2xl leading-relaxed">
                {reason}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-300">
                <span>Mfg: <strong className="text-white">{recommendedMotor.manufacturer}</strong></span>
                <span>•</span>
                <span>Shaft: <strong className="text-sky-400">Ø{recommendedMotor.shaft_diameter} mm</strong></span>
                <span>•</span>
                <span>Power: <strong className="text-white">{recommendedMotor.power} W</strong></span>
                <span>•</span>
                <span>RPM: <strong className="text-white">{recommendedMotor.rpm}</strong></span>
                <span>•</span>
                <span>Price: <strong className="text-emerald-400 font-bold text-sm">₹{recommendedMotor.cost.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleAllocate(recommendedMotor)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add Recommended Motor to BOM</span>
              </button>

              <button
                onClick={() => onNavigateToBearings(recommendedMotor.shaft_diameter || 20)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Find Bearings for Ø{recommendedMotor.shaft_diameter}mm Shaft</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Catalog Motors Evaluated Against Design Load ({requiredTorque} Nm)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Total Evaluated: {motors.length} motors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Motor Name &amp; Model</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3 font-mono">Rated Torque</th>
                <th className="py-3 px-3 font-mono">Torque Margin</th>
                <th className="py-3 px-3 font-mono">Shaft Dia.</th>
                <th className="py-3 px-3 font-mono">Cost</th>
                <th className="py-3 px-3">Suitability Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {motors.map((m) => {
                const isRecommended = recommendedMotor?.component_id === m.component_id;
                const isAllocated = allocatedIds.includes(m.component_id);
                return (
                  <tr
                    key={m.component_id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isRecommended ? 'bg-emerald-950/15' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isRecommended && <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                        <div>
                          <div className="font-bold text-white text-xs">{m.component_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{m.model_number || 'TM-OEM'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-medium">{m.manufacturer}</td>

                    <td className="py-3 px-3 font-mono text-sm font-bold text-white">
                      {m.rated_torque} Nm
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {m.margin_nm >= 0 ? (
                        <span className="text-emerald-400 font-semibold">+{m.margin_nm} Nm (+{m.margin_pct}%)</span>
                      ) : (
                        <span className="text-rose-400 font-semibold">{m.margin_nm} Nm ({m.margin_pct}%)</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-sky-400 font-bold">
                      Ø{m.shaft_diameter} mm
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-sm">
                      ₹{m.cost.toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      {m.is_suitable ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Suitable
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Not Suitable
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleAllocate(m)}
                        className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1 transition-all ${
                          isAllocated
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                            : m.is_suitable
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                        title={m.is_suitable ? 'Allocate to BOM' : 'Torque insufficient for design payload'}
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
