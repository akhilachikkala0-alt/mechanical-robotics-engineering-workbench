import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Bot,
  Calculator,
  Database,
  Cpu,
  CircleDot,
  Layers,
  HandMetal,
  Radio,
  TerminalSquare,
  Columns3,
  ShieldCheck,
  ShoppingBag,
  DollarSign,
  History,
  ClipboardCheck,
  Wrench,
  FileSpreadsheet,
  Binary
} from 'lucide-react';

export type ActivePage =
  | 'dashboard'
  | 'projects'
  | 'robots'
  | 'calculations'
  | 'components'
  | 'motors'
  | 'bearings'
  | 'materials'
  | 'grippers'
  | 'sensors'
  | 'controllers'
  | 'comparison'
  | 'compatibility'
  | 'selected_components'
  | 'cost_estimation'
  | 'design_versions'
  | 'testing'
  | 'maintenance'
  | 'reports'
  | 'dbms_studio';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedComponentsCount?: number;
  databaseConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  selectedComponentsCount = 6,
  databaseConnected = true
}) => {
  const navSections = [
    {
      title: 'CORE MANAGEMENT',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: FolderGit2 },
        { id: 'robots', label: 'Robots & Arm Config', icon: Bot },
        { id: 'calculations', label: 'Design Analysis & Torque', icon: Calculator }
      ]
    },
    {
      title: 'COMPONENT SELECTION',
      items: [
        { id: 'components', label: 'Component Database', icon: Database },
        { id: 'motors', label: 'Motor Selection', icon: Cpu },
        { id: 'bearings', label: 'Bearing Selection', icon: CircleDot },
        { id: 'materials', label: 'Material Selection', icon: Layers },
        { id: 'grippers', label: 'Gripper Selection', icon: HandMetal },
        { id: 'sensors', label: 'Sensors', icon: Radio },
        { id: 'controllers', label: 'Controllers', icon: TerminalSquare },
        { id: 'comparison', label: 'Component Comparison', icon: Columns3 }
      ]
    },
    {
      title: 'DESIGN INTEGRATION',
      items: [
        { id: 'compatibility', label: 'Compatibility Check', icon: ShieldCheck },
        {
          id: 'selected_components',
          label: 'Selected Components (BOM)',
          icon: ShoppingBag,
          badge: selectedComponentsCount
        },
        { id: 'cost_estimation', label: 'Cost Estimation', icon: DollarSign },
        { id: 'design_versions', label: 'Design Versions', icon: History }
      ]
    },
    {
      title: 'VALIDATION & LIFECYCLE',
      items: [
        { id: 'testing', label: 'Testing Module', icon: ClipboardCheck },
        { id: 'maintenance', label: 'Maintenance Log', icon: Wrench },
        { id: 'reports', label: 'Final Design Report', icon: FileSpreadsheet },
        { id: 'dbms_studio', label: 'DBMS Studio & SQL', icon: Binary }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
            Robotic Arm DMS
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Mech &amp; Robotics Suite
          </div>
        </div>
      </div>

      {/* Database Connection Pill */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">Database:</span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          robotic_arm_dms
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
        {navSections.map((sec) => (
          <div key={sec.title}>
            <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-500 tracking-wider font-mono">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => setActivePage(item.id as ActivePage)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-all text-left ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-mono text-[10px]">B.Tech Capstone Project</span>
        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">v2.4</span>
      </div>
    </aside>
  );
};
