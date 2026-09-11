import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Bot,
  Cpu,
  Layers,
  Activity,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Robot, Project, ComponentItem } from '../types';
import { KinematicsDiagram } from '../components/KinematicsDiagram';
import { ActivePage } from '../components/Sidebar';

interface DashboardProps {
  currentRobot: Robot | null;
  onNavigate: (page: ActivePage) => void;
  onSelectRobot: (robot: Robot) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  currentRobot,
  onNavigate,
  onSelectRobot
}) => {
  const [stats, setStats] = useState<{
    total_projects: number;
    total_robots: number;
    total_components: number;
    total_motors: number;
    total_bearings: number;
    total_designs: number;
    pending_tests: number;
    total_maintenance_cost: number;
  }>({
    total_projects: 3,
    total_robots: 3,
    total_components: 20,
    total_motors: 5,
    total_bearings: 3,
    total_designs: 2,
    pending_tests: 0,
    total_maintenance_cost: 800
  });

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentRobots, setRecentRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data.counts);
      setRecentProjects(data.recent_projects);
      setRecentRobots(data.recent_robots);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Projects',
      value: stats.total_projects,
      subtitle: 'Robotics R&D projects',
      icon: FolderGit2,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      page: 'projects' as ActivePage
    },
    {
      title: 'Robotic Arms',
      value: stats.total_robots,
      subtitle: 'Configured kinematic arms',
      icon: Bot,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      page: 'robots' as ActivePage
    },
    {
      title: 'Components Catalog',
      value: stats.total_components,
      subtitle: 'Motors, bearings, grippers',
      icon: Cpu,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      page: 'components' as ActivePage
    },
    {
      title: 'Design Versions',
      value: stats.total_designs,
      subtitle: 'Audited revisions',
      icon: Layers,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      page: 'design_versions' as ActivePage
    },
    {
      title: 'Verified Tests',
      value: `${stats.pending_tests > 0 ? stats.pending_tests + ' Failed' : 'All PASS'}`,
      subtitle: 'Payload & torque checks',
      icon: ShieldCheck,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      page: 'testing' as ActivePage
    },
    {
      title: 'Maint. Spend',
      value: `₹${stats.total_maintenance_cost.toLocaleString()}`,
      subtitle: 'Lifecycle logs tracked',
      icon: DollarSign,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      page: 'maintenance' as ActivePage
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-96 h-full bg-sky-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ROBOTIC ARM COMPONENT SELECTION &amp; DESIGN MANAGEMENT SYSTEM</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Mechanical &amp; Robotics Engineering Workbench
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Design articulated robotic arms by entering engineering requirements, calculating static joint torques,
              querying catalog components, verifying coupling compatibility, and maintaining full lifecycle records in MySQL.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigate('calculations')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <span>Torque Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('motors')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-all"
            >
              Select Motor
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => onNavigate(card.page)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all hover:translate-y-[-2px] cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.border} border flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
              <div className="text-lg font-bold text-white font-mono tracking-tight">{card.value}</div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">{card.title}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{card.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Kinematics Diagram & Live Active Arm Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KinematicsDiagram
            payloadKg={currentRobot?.payload || 5.0}
            reachMm={currentRobot?.reach || 800}
            dof={currentRobot?.dof || 6}
            calculatedTorqueNm={currentRobot?.calculated_torque || 58.86}
            robotName={currentRobot?.robot_name || 'PickBot-01'}
          />
        </div>

        {/* Engineering Flow Navigation Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Design &amp; Selection Workflow</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { step: '1', name: 'Define Requirements (Payload & Reach)', page: 'robots' as ActivePage, status: 'Done' },
                { step: '2', name: 'Calculate Static Torque (τ = 58.86 Nm)', page: 'calculations' as ActivePage, status: 'Done' },
                { step: '3', name: 'Recommend Suitable Motor (60 Nm)', page: 'motors' as ActivePage, status: 'Recommended' },
                { step: '4', name: 'Match Bearing to Shaft (Ø20 mm)', page: 'bearings' as ActivePage, status: 'Matched' },
                { step: '5', name: 'Select Link Material (Al 6061-T6)', page: 'materials' as ActivePage, status: 'Selected' },
                { step: '6', name: 'Verify Interface Compatibility', page: 'compatibility' as ActivePage, status: 'Pass' },
                { step: '7', name: 'Review Cost & BOM Allocation', page: 'cost_estimation' as ActivePage, status: 'Within Budget' }
              ].map((item) => (
                <div
                  key={item.step}
                  onClick={() => onNavigate(item.page)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-sky-950 text-sky-400 font-mono text-[10px] font-bold flex items-center justify-center border border-sky-800/40">
                      {item.step}
                    </span>
                    <span className="text-slate-200 font-medium text-[11px]">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white rounded-lg text-xs font-mono font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Full Design Verification Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dual Table Section: Recent Projects & Recent Robots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Active Projects</h2>
              <p className="text-[11px] text-slate-400 font-mono">Stored in MySQL Project Table</p>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentProjects.map((p) => (
              <div
                key={p.project_id}
                onClick={() => onNavigate('projects')}
                className="p-3 bg-slate-950/50 hover:bg-slate-800/50 rounded-lg border border-slate-800/80 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{p.project_name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      p.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : p.status === 'Testing'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                  <span>Lead: {p.engineer_name || 'Prof. Sharma'}</span>
                  <span>Budget: ₹{p.budget.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configured Robots */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Configured Robotic Arms</h2>
              <p className="text-[11px] text-slate-400 font-mono">Kinematic Linkage Specifications</p>
            </div>
            <button
              onClick={() => onNavigate('robots')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentRobots.map((r) => {
              const isSelected = currentRobot?.robot_id === r.robot_id;
              return (
                <div
                  key={r.robot_id}
                  onClick={() => onSelectRobot(r)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500/40'
                      : 'bg-slate-950/50 hover:bg-slate-800/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-200">{r.robot_name}</h4>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[9px] font-mono rounded">
                            Active Arm
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {r.dof} DOF • {r.payload} kg Payload • Reach: {r.reach} mm
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      τ = {r.calculated_torque || 58.86} Nm
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <span>Type: {r.robot_type}</span>
                    <span className="text-emerald-400">Status: {r.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
