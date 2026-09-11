import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ArrowRight, Calendar, User } from 'lucide-react';
import { api } from '../services/api';
import { Robot, MaintenanceRecord } from '../types';

interface MaintenancePageProps {
  currentRobot: Robot | null;
  onNavigateToDbms: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  currentRobot,
  onNavigateToDbms
}) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Maintenance State
  const [componentId, setComponentId] = useState<number>(1);
  const [maintType, setMaintType] = useState('Lubrication');
  const [description, setDescription] = useState('Synthetic grease replenishment on harmonic drive bearings');
  const [cost, setCost] = useState<number>(750);
  const [technician, setTechnician] = useState('Senior Tech (Mechatronics Shop)');
  const [nextDueDate, setNextDueDate] = useState('2026-10-15');

  useEffect(() => {
    loadMaintenance();
  }, [currentRobot]);

  const loadMaintenance = async () => {
    if (!currentRobot) return;
    try {
      setLoading(true);
      const data = await api.getMaintenance(currentRobot.robot_id);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRobot) return;
    try {
      await api.createMaintenance({
        robot_id: currentRobot.robot_id,
        component_id: componentId,
        maintenance_type: maintType,
        description,
        cost: Number(cost),
        technician,
        maintenance_date: new Date().toISOString().split('T')[0],
        next_due_date: nextDueDate,
        status: 'Completed'
      });
      setShowModal(false);
      loadMaintenance();
    } catch (err: any) {
      alert('Error creating maintenance log: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Wrench className="w-3.5 h-3.5" />
            <span>DATABASE: Maintenance Table</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Preventative Maintenance &amp; Asset Lifecycle</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log lubrication schedules, bearing wear inspections, and servo calibrations for <strong className="text-sky-400">{currentRobot?.robot_name || 'PickBot-01'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule / Log Service</span>
          </button>
          <button
            onClick={onNavigateToDbms}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Open DBMS Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Maintenance Ledger</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Service Type &amp; Component</th>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-3 font-mono">Date Serviced</th>
                <th className="py-3 px-3 font-mono">Next Due Date</th>
                <th className="py-3 px-3 font-mono text-right">Cost (₹)</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {records.map((r) => (
                <tr key={r.maintenance_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-white text-xs">{r.maintenance_type}</span>
                    <div className="text-[11px] text-sky-400 font-mono mt-0.5">{r.component_name || 'System Assembly'}</div>
                  </td>

                  <td className="py-3 px-4 text-xs text-slate-300 max-w-sm leading-relaxed">
                    {r.description}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-400">{r.maintenance_date}</td>
                  <td className="py-3 px-3 font-mono text-amber-400 font-semibold">{r.next_due_date || 'N/A'}</td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-right">
                    ₹{r.cost.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-slate-300">{r.technician}</td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Log Maintenance Operation in MySQL</h3>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Maintenance Operation</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option>Lubrication</option>
                    <option>Inspection</option>
                    <option>Bearing Replacement</option>
                    <option>Calibration</option>
                    <option>Belt Tensioning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Service Cost (₹)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Maintenance Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Technician Name</label>
                  <input
                    type="text"
                    required
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Next Service Due Date</label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow"
                >
                  Commit Log to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
