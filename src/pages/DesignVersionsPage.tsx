import React, { useState, useEffect } from 'react';
import { History, Plus, CheckCircle2, ArrowRight, Tag, User, Calendar, FileText } from 'lucide-react';
import { api } from '../services/api';
import { Robot, DesignVersion } from '../types';

interface DesignVersionsProps {
  currentRobot: Robot | null;
  onNavigateToTesting: () => void;
}

export const DesignVersionsPage: React.FC<DesignVersionsProps> = ({
  currentRobot,
  onNavigateToTesting
}) => {
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [versionNumber, setVersionNumber] = useState('2.0');
  const [description, setDescription] = useState('Production ready BOM with Al 6061 links & 60Nm motor');
  const [changesSummary, setChangesSummary] = useState('Updated motor to 60Nm, added SKF 6004 bearings, verified 48V bus power.');
  const [designerName, setDesignerName] = useState('Prof. R. V. Sharma');

  useEffect(() => {
    loadVersions();
  }, [currentRobot]);

  const loadVersions = async () => {
    if (!currentRobot) return;
    try {
      setLoading(true);
      const data = await api.getDesignVersions(currentRobot.robot_id);
      setVersions(data);
    } catch (err) {
      console.error('Failed to load versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRobot) return;
    try {
      await api.createDesignVersion({
        robot_id: currentRobot.robot_id,
        version_number: versionNumber,
        description,
        changes_summary: changesSummary,
        designer_name: designerName,
        total_cost: 77150.0
      });
      setShowModal(false);
      loadVersions();
    } catch (err: any) {
      alert('Error saving version: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <History className="w-3.5 h-3.5" />
            <span>DATABASE: Design_Version Audit Trail</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Design Version Control &amp; Revisions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable engineering revision history for <strong className="text-sky-400">{currentRobot?.robot_name || 'PickBot-01'}</strong> in MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Commit New Version</span>
          </button>
          <button
            onClick={onNavigateToTesting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Proceed to Testing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {versions.map((ver, idx) => (
          <div
            key={ver.version_id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono font-bold flex items-center justify-center text-xs">
                  v{ver.version_number}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{ver.description}</h3>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>Designer: <strong className="text-slate-200">{ver.designer_name}</strong></span>
                    <span>•</span>
                    <span>Date: {ver.created_at}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {ver.status || 'Approved'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  Total BOM: ₹{ver.total_cost?.toLocaleString() || '77,150'}
                </span>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block mb-1">CHANGES SUMMARY:</span>
              {ver.changes_summary}
            </div>
          </div>
        ))}
      </div>

      {/* Commit Version Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Save New Design Revision to MySQL</h3>

            <form onSubmit={handleCreateVersion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Version Number</label>
                  <input
                    type="text"
                    required
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                    placeholder="e.g. 2.0"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Author / Designer</label>
                  <input
                    type="text"
                    required
                    value={designerName}
                    onChange={(e) => setDesignerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Revision Title / Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                  placeholder="e.g. Structural and Actuator Integration Baseline"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Changes Summary / Release Notes</label>
                <textarea
                  rows={3}
                  required
                  value={changesSummary}
                  onChange={(e) => setChangesSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none font-mono text-xs"
                  placeholder="Details of actuator, bearing, and material selections..."
                />
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
                  Commit to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
