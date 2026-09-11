import React from 'react';
import { Bot, Play, Terminal, LogOut, User, CheckCircle2 } from 'lucide-react';
import { Robot, Engineer } from '../types';

interface TopNavbarProps {
  currentUser: Engineer | null;
  currentRobot: Robot | null;
  robots: Robot[];
  onSelectRobot: (robot: Robot) => void;
  onOpenSqlStudio: () => void;
  onRunDemoScenario: () => void;
  onLogout: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentUser,
  currentRobot,
  robots,
  onSelectRobot,
  onOpenSqlStudio,
  onRunDemoScenario,
  onLogout
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left: Active Robot Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
          <Bot className="w-4 h-4 text-sky-400" />
          <span className="text-slate-400 font-mono">Active Arm:</span>
          <select
            id="top-robot-select"
            value={currentRobot?.robot_id || ''}
            onChange={(e) => {
              const r = robots.find((item) => item.robot_id === Number(e.target.value));
              if (r) onSelectRobot(r);
            }}
            className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer"
          >
            {robots.map((r) => (
              <option key={r.robot_id} value={r.robot_id} className="bg-slate-900 text-slate-100">
                {r.robot_name} ({r.dof}-DOF, {r.payload}kg payload)
              </option>
            ))}
          </select>
        </div>

        {currentRobot && (
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 bg-sky-950/60 border border-sky-800/50 text-sky-300 rounded">
              Reach: <strong className="text-white">{currentRobot.reach} mm</strong>
            </span>
            <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/50 text-amber-300 rounded">
              Torque: <strong className="text-white">{currentRobot.calculated_torque || 58.86} Nm</strong>
            </span>
            <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 rounded">
              Budget: <strong className="text-white">₹{currentRobot.budget.toLocaleString()}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions and User */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Workflow Button */}
        <button
          id="btn-run-demo-scenario"
          onClick={onRunDemoScenario}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
          title="Step-by-step automated workflow of the exact prompt scenario"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Demo Scenario</span>
        </button>

        {/* Live SQL Studio Button */}
        <button
          id="btn-open-sql-studio"
          onClick={onOpenSqlStudio}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors"
          title="Inspect live SQL queries and MySQL database tables"
        >
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">SQL Studio</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Engineer Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
            {currentUser?.name?.charAt(0) || 'E'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-200 tracking-tight leading-tight">
              {currentUser?.name || 'Prof. R. V. Sharma'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-tight">
              {currentUser?.role || 'Senior Robotics Engineer'}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={onLogout}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
