import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Bot, Cpu, CircleDot } from 'lucide-react';
import { api } from '../services/api';
import { Robot } from '../types';

interface CompatibilityProps {
  currentRobot: Robot | null;
  onNavigateToBOM: () => void;
}

export const CompatibilityPage: React.FC<CompatibilityProps> = ({
  currentRobot,
  onNavigateToBOM
}) => {
  const [data, setData] = useState<{
    overall_status: 'Compatible' | 'Not Compatible' | 'Requires Review';
    required_torque: number;
    checks: {
      parameter: string;
      expected: string;
      actual: string;
      status: 'Compatible' | 'Not Compatible' | 'Requires Review';
      reason: string;
    }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runCompatibilityCheck();
  }, [currentRobot]);

  const runCompatibilityCheck = async () => {
    try {
      setLoading(true);
      const res = await api.checkCompatibility({
        robot_id: currentRobot?.robot_id || 1,
        payload: currentRobot?.payload || 5.0,
        reach: currentRobot?.reach || 800
      });
      setData(res);
    } catch (err) {
      console.error('Failed to run compatibility check:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SYSTEM-LEVEL MECHANICAL &amp; ELECTRICAL VERIFICATION</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Component Compatibility &amp; Interface Audit</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated multi-criteria rule engine validating torque margins, shaft-bore interference fits, and electrical buses.
          </p>
        </div>

        <button
          onClick={onNavigateToBOM}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View Bill of Materials (BOM)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Overall Status Banner */}
      {data && (
        <div
          className={`p-6 rounded-xl border-2 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            data.overall_status === 'Compatible'
              ? 'bg-emerald-950/30 border-emerald-500/50'
              : data.overall_status === 'Requires Review'
              ? 'bg-amber-950/30 border-amber-500/50'
              : 'bg-rose-950/30 border-rose-500/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold shadow-lg ${
                data.overall_status === 'Compatible'
                  ? 'bg-emerald-500 text-slate-950'
                  : data.overall_status === 'Requires Review'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {data.overall_status === 'Compatible' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Integration Status:
                </span>
                <span
                  className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                    data.overall_status === 'Compatible'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {data.overall_status.toUpperCase()}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mt-1">
                {data.overall_status === 'Compatible'
                  ? 'All Selected Robotic Components Are Electromechanically Compatible'
                  : 'Subsystem Warnings Detected: Mechanical Coupling Review Required'}
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Active Arm: <strong className="text-sky-400">{currentRobot?.robot_name || 'PickBot-01'}</strong> • Calculated Static Joint Holding Torque: <strong className="text-amber-400">{data.required_torque} Nm</strong>
              </p>
            </div>
          </div>

          <button
            onClick={runCompatibilityCheck}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg border border-slate-700 transition-colors flex-shrink-0"
          >
            Re-run Verification Engine
          </button>
        </div>
      )}

      {/* Checks Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Automated Compatibility Checklist Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Interfacing Parameter</th>
                <th className="py-3 px-3 font-mono">Design Threshold</th>
                <th className="py-3 px-3 font-mono">Actual Component Value</th>
                <th className="py-3 px-3">Evaluation</th>
                <th className="py-3 px-4">Engineering Justification &amp; Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              {data?.checks.map((chk, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {chk.parameter}
                  </td>

                  <td className="py-3 px-3 text-sky-400 font-semibold">
                    {chk.expected}
                  </td>

                  <td className="py-3 px-3 text-slate-200">
                    {chk.actual}
                  </td>

                  <td className="py-3 px-3">
                    {chk.status === 'Compatible' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Pass
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Review
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-sans text-xs text-slate-300 leading-relaxed max-w-md">
                    {chk.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
