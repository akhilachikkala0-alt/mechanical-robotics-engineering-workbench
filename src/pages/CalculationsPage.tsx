import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, AlertTriangle, CheckCircle2, RotateCcw, Cpu, FileText } from 'lucide-react';
import { api } from '../services/api';
import { TorqueCalculationResult, Robot } from '../types';

interface CalculationsPageProps {
  currentRobot: Robot | null;
  onNavigateToMotors: (requiredTorque: number) => void;
}

export const CalculationsPage: React.FC<CalculationsPageProps> = ({
  currentRobot,
  onNavigateToMotors
}) => {
  const [payload, setPayload] = useState<number>(currentRobot?.payload || 5.0);
  const [reach, setReach] = useState<number>(currentRobot?.reach ? currentRobot.reach / 1000 : 0.8);
  const [gravity, setGravity] = useState<number>(9.81);
  const [safetyFactor, setSafetyFactor] = useState<number>(1.5);
  const [result, setResult] = useState<TorqueCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runCalculation();
  }, [payload, reach, gravity, safetyFactor]);

  const runCalculation = async () => {
    try {
      setLoading(true);
      const data = await api.calculateTorque({
        payload,
        reach,
        gravity,
        safety_factor: safetyFactor
      });
      setResult(data);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetToStandard = () => {
    setPayload(5.0);
    setReach(0.8);
    setGravity(9.81);
    setSafetyFactor(1.5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Calculator className="w-3.5 h-3.5" />
            <span>MECHANICAL ENGINEERING CALCULATIONS</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Static Joint Holding Torque Analysis</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate free-body gravitational load moments for sizing joint actuators at maximum horizontal extension.
          </p>
        </div>

        <button
          onClick={resetToStandard}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline (5kg @ 0.8m)</span>
        </button>
      </div>

      {/* Inputs & Step-by-Step Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <span>Input Engineering Parameters</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Payload Mass (<span className="text-sky-400 font-mono">m</span>) in kg
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={payload}
                  onChange={(e) => setPayload(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 text-sm focus:border-sky-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono text-xs">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Maximum Lever Arm Reach (<span className="text-sky-400 font-mono">L</span>) in meters
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={reach}
                  onChange={(e) => setReach(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 text-sm focus:border-sky-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono text-xs">m</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Equivalent: {(reach * 1000).toFixed(0)} mm
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Gravitational Acceleration (<span className="text-sky-400 font-mono">g</span>)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={gravity}
                  onChange={(e) => setGravity(parseFloat(e.target.value) || 9.81)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 text-sm focus:border-sky-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono text-xs">m/s²</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Engineering Safety Factor (<span className="text-sky-400 font-mono">SF</span>)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="3.0"
                  value={safetyFactor}
                  onChange={(e) => setSafetyFactor(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 text-sm focus:border-sky-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono text-xs">ratio</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Standard industrial robotics range: 1.3 to 1.8
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block mb-1.5">Load Case Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'PickBot Baseline (5kg, 0.8m)', p: 5.0, r: 0.8 },
                  { label: 'Precision Welder (12kg, 1.4m)', p: 12.0, r: 1.4 },
                  { label: 'SCARA Wafer (3kg, 0.5m)', p: 3.0, r: 0.5 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setPayload(preset.p);
                      setReach(preset.r);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded font-mono transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Mathematical Derivation & Output Panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* Engineering Formula Reference Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-3">
              Mathematical Governing Equations
            </h3>
            <div className="space-y-2 font-mono text-xs text-slate-200">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">1. Gravitational Force:</span>
                <span className="font-bold text-white">F = m × g</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">2. Basic Lever Arm Torque:</span>
                <span className="font-bold text-white">τ_basic = F × L</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">3. Factored Design Torque:</span>
                <span className="font-bold text-amber-400">τ_req = τ_basic × SF</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Numerical Evaluation */}
          {result && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Calculation Derivation</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Precision: 2 decimal places
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Step 1 */}
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">STEP 1: CALCULATE VERTICAL DOWNWARD FORCE (F)</div>
                    <div className="text-slate-200 mt-0.5">{result.calculation_steps.step_1}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">Payload Force</div>
                    <div className="text-sm font-bold text-sky-400 font-mono">{result.results.force_n} N</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">STEP 2: CALCULATE BASIC LEVER ARM TORQUE (τ_basic)</div>
                    <div className="text-slate-200 mt-0.5">{result.calculation_steps.step_2}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">Nominal Torque</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">{result.results.basic_torque_nm} Nm</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold">STEP 3: APPLY ENGINEERING SAFETY FACTOR (1.5)</div>
                    <div className="text-slate-100 font-bold text-sm mt-0.5">{result.calculation_steps.step_3}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-400">Required Joint Torque</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">
                      {result.results.required_torque_nm} Nm
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Proceed to Motor Selection */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 font-mono">
                  Calculated Joint Torque: <strong className="text-emerald-400">{result.results.required_torque_nm} Nm</strong>
                </div>
                <button
                  id="btn-send-torque-to-motor"
                  onClick={() => onNavigateToMotors(result.results.required_torque_nm)}
                  className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Recommend Motors for {result.results.required_torque_nm} Nm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mandatory Engineering Disclaimer Card */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">Engineering Methodological Disclaimer</div>
              <p className="text-amber-200/80 text-[11px] mt-1 leading-relaxed">
                This calculation performs a static holding torque estimation assuming horizontal link cantilever.
                Actual industrial robotic-arm engineering requires rigorous dynamic multibody analysis incorporating
                distributed link mass, center-of-gravity (CoG) offsets, angular acceleration (alpha), rotor inertia (J_rotor),
                gearbox backlash, and friction coefficients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
