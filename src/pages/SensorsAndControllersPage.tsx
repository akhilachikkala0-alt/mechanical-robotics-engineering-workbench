import React, { useState, useEffect } from 'react';
import { Radio, TerminalSquare, Star, ShoppingCart, Check, ArrowRight, Cpu, Zap, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Robot } from '../types';

interface SensorsControllersProps {
  currentRobot: Robot | null;
  onNavigateToComparison: () => void;
  onComponentAllocated?: () => void;
}

export const SensorsAndControllersPage: React.FC<SensorsControllersProps> = ({
  currentRobot,
  onNavigateToComparison,
  onComponentAllocated
}) => {
  const [activeTab, setActiveTab] = useState<'sensors' | 'controllers'>('sensors');
  const [sensors, setSensors] = useState<any[]>([]);
  const [controllers, setControllers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocatedIds, setAllocatedIds] = useState<number[]>([]);

  useEffect(() => {
    loadHardware();
  }, []);

  const loadHardware = async () => {
    try {
      setLoading(true);
      const [sList, cList] = await Promise.all([api.getSensors(), api.getControllers()]);
      setSensors(sList);
      setControllers(cList);
    } catch (err) {
      console.error('Failed to load sensors/controllers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (item: any, role: string) => {
    if (!currentRobot) {
      alert('Please select an active robot first from the top bar.');
      return;
    }
    try {
      await api.addRobotComponent({
        robot_id: currentRobot.robot_id,
        component_id: item.component_id,
        quantity: 1,
        role_or_joint: role,
        unit_cost: item.cost
      });
      setAllocatedIds((prev) => [...prev, item.component_id]);
      if (onComponentAllocated) onComponentAllocated();
    } catch (err: any) {
      alert('Error allocating item: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Radio className="w-3.5 h-3.5" />
            <span>DATABASE: Sensor &amp; Controller Subtypes</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sensors &amp; Motion Controllers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select joint position encoders, force sensors, and microsecond real-time motion controllers.
          </p>
        </div>

        <button
          onClick={onNavigateToComparison}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Next: Component Comparison</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('sensors')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'sensors'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Feedback Sensors ({sensors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('controllers')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'controllers'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <TerminalSquare className="w-4 h-4" />
          <span>Motion Controllers &amp; Embedded Hosts ({controllers.length})</span>
        </button>
      </div>

      {/* Sensor Tab Content */}
      {activeTab === 'sensors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sensors.map((s) => {
            const isAllocated = allocatedIds.includes(s.component_id);
            return (
              <div
                key={s.component_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800/40">
                      {s.sensor_type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID #{s.component_id}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 tracking-tight">{s.component_name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.specification}</p>

                  <div className="mt-4 space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sensing Range:</span>
                      <span className="text-white font-bold">{s.sensing_range}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accuracy:</span>
                      <span className="text-emerald-400 font-bold">{s.accuracy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Protocol:</span>
                      <span className="text-sky-400">{s.comm_protocol}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    ₹{s.cost.toLocaleString()}
                  </span>

                  <button
                    onClick={() => handleAllocate(s, `${s.sensor_type} Feedback`)}
                    className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1 transition-all ${
                      isAllocated
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    {isAllocated ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Allocated</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Select</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controller Tab Content */}
      {activeTab === 'controllers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {controllers.map((ctrl) => {
            const isAllocated = allocatedIds.includes(ctrl.component_id);
            return (
              <div
                key={ctrl.component_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                      Motion Controller
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID #{ctrl.component_id}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 tracking-tight">{ctrl.component_name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ctrl.specification}</p>

                  <div className="mt-4 space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Processor Core:</span>
                      <span className="text-white font-bold">{ctrl.processor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Clock Speed:</span>
                      <span className="text-emerald-400 font-bold">{ctrl.clock_speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RAM:</span>
                      <span className="text-slate-200">{ctrl.ram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GPIO Channels:</span>
                      <span className="text-sky-400 font-bold">{ctrl.gpio_count} pins</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    ₹{ctrl.cost.toLocaleString()}
                  </span>

                  <button
                    onClick={() => handleAllocate(ctrl, 'Central Motion Controller')}
                    className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1 transition-all ${
                      isAllocated
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    {isAllocated ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Allocated</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Select</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
