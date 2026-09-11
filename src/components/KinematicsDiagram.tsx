import React from 'react';

interface KinematicsProps {
  payloadKg?: number;
  reachMm?: number;
  dof?: number;
  calculatedTorqueNm?: number;
  robotName?: string;
}

export const KinematicsDiagram: React.FC<KinematicsProps> = ({
  payloadKg = 5.0,
  reachMm = 800,
  dof = 6,
  calculatedTorqueNm = 58.86,
  robotName = 'PickBot-01'
}) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase text-emerald-400 font-semibold">
            Kinematic Linkage & Static Free-Body Diagram
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Model: <span className="text-amber-400 font-medium">{robotName}</span> | DOF: <span className="text-sky-400 font-medium">{dof}</span>
        </div>
      </div>

      <div className="relative w-full h-64 flex items-center justify-center">
        {/* Technical Grid Background */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg viewBox="0 0 640 240" className="w-full h-full max-w-2xl drop-shadow-md">
          {/* Ground & Pedestal */}
          <line x1="80" y1="210" x2="200" y2="210" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="90" y1="218" x2="110" y2="228" stroke="#475569" strokeWidth="2" />
          <line x1="130" y1="218" x2="150" y2="228" stroke="#475569" strokeWidth="2" />
          <line x1="170" y1="218" x2="190" y2="228" stroke="#475569" strokeWidth="2" />

          {/* Base Joint J1 Column */}
          <rect x="120" y="160" width="40" height="50" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="140" y="190" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">J1</text>

          {/* Shoulder Pivot J2 */}
          <circle cx="140" cy="150" r="16" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="140" cy="150" r="6" fill="#f59e0b" />
          <text x="140" y="130" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">J2 (Shoulder)</text>

          {/* Upper Arm Link (L1) */}
          <line x1="140" y1="150" x2="280" y2="90" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />
          <line x1="140" y1="150" x2="280" y2="90" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />

          {/* Elbow Joint J3 */}
          <circle cx="280" cy="90" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
          <circle cx="280" cy="90" r="5" fill="#10b981" />
          <text x="280" y="70" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">J3 (Elbow)</text>

          {/* Forearm Link (L2) */}
          <line x1="280" y1="90" x2="440" y2="90" stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" />
          <line x1="280" y1="90" x2="440" y2="90" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />

          {/* Wrist Assembly J4, J5, J6 */}
          <circle cx="440" cy="90" r="10" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" />
          <rect x="445" y="83" width="18" height="14" rx="2" fill="#334155" stroke="#a855f7" strokeWidth="1.5" />
          <text x="440" y="72" fill="#a855f7" fontSize="10" fontFamily="monospace" textAnchor="middle">J4-J6</text>

          {/* Gripper Jaws */}
          <path d="M 465 80 L 485 80 L 485 70" fill="none" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 465 100 L 485 100 L 485 110" fill="none" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />

          {/* Payload Workpiece */}
          <rect x="480" y="75" width="30" height="30" rx="3" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" opacity="0.9" />
          <text x="495" y="93" fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            {payloadKg}kg
          </text>

          {/* Gravity Vector F = m*g */}
          <line x1="495" y1="110" x2="495" y2="155" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrow-down)" />
          <polygon points="495,160 491,150 499,150" fill="#ef4444" />
          <text x="505" y="140" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
            F = {(payloadKg * 9.81).toFixed(1)} N
          </text>

          {/* Reach Dimension Line */}
          <line x1="140" y1="210" x2="495" y2="210" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="140" cy="210" r="3" fill="#94a3b8" />
          <circle cx="495" cy="210" r="3" fill="#94a3b8" />
          <text x="315" y="202" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            Effective Reach L = {reachMm} mm ({(reachMm / 1000).toFixed(2)} m)
          </text>

          {/* Torque Curved Arrow at Shoulder Joint J2 */}
          <path d="M 115 150 A 25 25 0 0 1 140 125" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <polygon points="113,153 118,145 110,147" fill="#f59e0b" />
          <text x="110" y="112" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
            τ = {calculatedTorqueNm} Nm
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400">Payload Force (F)</div>
          <div className="text-sm font-bold text-rose-400 font-mono">{(payloadKg * 9.81).toFixed(2)} N</div>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400">Lever Arm (L)</div>
          <div className="text-sm font-bold text-sky-400 font-mono">{(reachMm / 1000).toFixed(3)} m</div>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400">Basic Static Torque</div>
          <div className="text-sm font-bold text-amber-400 font-mono">{(payloadKg * 9.81 * (reachMm / 1000)).toFixed(2)} Nm</div>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400">Required Joint Torque (SF=1.5)</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">{calculatedTorqueNm} Nm</div>
        </div>
      </div>
    </div>
  );
};
