import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, CheckCircle2, XCircle, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Robot, TestRecord } from '../types';

interface TestingPageProps {
  currentRobot: Robot | null;
  onNavigateToMaintenance: () => void;
}

export const TestingPage: React.FC<TestingPageProps> = ({
  currentRobot,
  onNavigateToMaintenance
}) => {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Test State
  const [testType, setTestType] = useState('Payload Test');
  const [testName, setTestName] = useState('Rated 5kg Payload Pick & Hold');
  const [expectedValue, setExpectedValue] = useState<number>(5.0);
  const [actualValue, setActualValue] = useState<number>(5.0);
  const [unit, setUnit] = useState('kg');
  const [remarks, setRemarks] = useState('No slip or joint drift observed over 10 min hold.');
  const [testedBy, setTestedBy] = useState('Test Engineer (Lab A)');

  useEffect(() => {
    loadTests();
  }, [currentRobot]);

  const loadTests = async () => {
    if (!currentRobot) return;
    try {
      setLoading(true);
      const data = await api.getTests(currentRobot.robot_id);
      setTests(data);
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRobot) return;
    try {
      const res = await api.createTest({
        robot_id: currentRobot.robot_id,
        test_type: testType,
        test_name: testName,
        expected_value: Number(expectedValue),
        actual_value: Number(actualValue),
        unit,
        remarks,
        tested_by: testedBy,
        test_date: new Date().toISOString().split('T')[0]
      });
      alert(`Test record logged in MySQL. Result: ${res.status}!`);
      setShowModal(false);
      loadTests();
    } catch (err: any) {
      alert('Error recording test: ' + err.message);
    }
  };

  const passCount = tests.filter((t) => t.status === 'PASS').length;
  const failCount = tests.filter((t) => t.status === 'FAIL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>DATABASE: Test Table</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Kinematic &amp; Dynamic Testing Protocol</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical ISO 9283 validation testing logs for <strong className="text-sky-400">{currentRobot?.robot_name || 'PickBot-01'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Test Result</span>
          </button>
          <button
            onClick={onNavigateToMaintenance}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Proceed to Maintenance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Total Recorded Tests</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">{tests.length} tests</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Passed Verification</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{passCount} PASS</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-mono">Failed / Out of Tolerance</div>
            <div className="text-xl font-bold text-slate-300 font-mono mt-0.5">
              {failCount === 0 ? '0 (Clean Record)' : `${failCount} FAIL`}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">ISO Experimental Testing Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-sans">Test Name &amp; Type</th>
                <th className="py-3 px-3">Expected</th>
                <th className="py-3 px-3">Actual Measured</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 font-sans">Remarks / Observations</th>
                <th className="py-3 px-3">Tester</th>
                <th className="py-3 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {tests.map((t) => (
                <tr key={t.test_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-white text-xs">{t.test_name}</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 border border-slate-700">
                      {t.test_type}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-300 font-bold">
                    {t.expected_value} {t.unit}
                  </td>

                  <td className="py-3 px-3 text-sky-400 font-bold">
                    {t.actual_value} {t.unit}
                  </td>

                  <td className="py-3 px-3">
                    {t.status === 'PASS' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        PASS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        FAIL
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-sans text-xs text-slate-300 max-w-xs leading-relaxed">
                    {t.remarks}
                  </td>

                  <td className="py-3 px-3 text-slate-400">{t.tested_by}</td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">{t.test_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Test Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Record Engineering Test in MySQL</h3>

            <form onSubmit={handleCreateTest} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Test Protocol</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option>Payload Test</option>
                    <option>Torque Test</option>
                    <option>Speed Test</option>
                    <option>Accuracy Test</option>
                    <option>Gripper Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    placeholder="kg, Nm, m/s, mm, N"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Test Description / Title</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Full Extension ISO Payload Holding Test"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Expected Specification Value</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Actual Measured Sensor Value</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={actualValue}
                    onChange={(e) => setActualValue(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Remarks &amp; Environmental Conditions</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
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
                  Save Test Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
