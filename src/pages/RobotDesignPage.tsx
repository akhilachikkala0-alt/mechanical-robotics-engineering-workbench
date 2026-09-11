import React, { useState, useEffect } from 'react';
import { Bot, Plus, Calculator, ArrowRight, CheckCircle2, Sliders, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../services/api';
import { Robot, Project } from '../types';
import { KinematicsDiagram } from '../components/KinematicsDiagram';

interface RobotDesignPageProps {
  currentRobot: Robot | null;
  onSelectRobot?: (robot: Robot) => void;
  onRobotUpdated?: (robot: Robot) => void;
  onNavigateToCalculations?: () => void;
  onNavigateToMotors?: () => void;
}

export const RobotDesignPage: React.FC<RobotDesignPageProps> = ({
  currentRobot,
  onSelectRobot,
  onRobotUpdated,
  onNavigateToCalculations,
  onNavigateToMotors
}) => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Requirement inputs for PickBot-01 or new arm
  const [robotName, setRobotName] = useState('PickBot-01');
  const [projectId, setProjectId] = useState<number>(1);
  const [robotType, setRobotType] = useState('6-DOF Articulated Arm');
  const [payload, setPayload] = useState<number>(5.0);
  const [reach, setReach] = useState<number>(800); // mm
  const [dof, setDof] = useState<number>(6);
  const [application, setApplication] = useState('Material Handling');
  const [speed, setSpeed] = useState<number>(1.2);
  const [accuracy, setAccuracy] = useState<number>(0.05);
  const [budget, setBudget] = useState<number>(80000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rList, pList] = await Promise.all([api.getRobots(), api.getProjects()]);
      setRobots(rList);
      setProjects(pList);
    } catch (err) {
      console.error('Failed to load robots:', err);
    }
  };

  // Instant live mathematical calculation
  const massKg = Number(payload) || 5.0;
  const reachM = (Number(reach) || 800) / 1000.0;
  const liveForceN = Math.round(massKg * 9.81 * 100) / 100;
  const liveBasicTorque = Math.round(liveForceN * reachM * 100) / 100;
  const liveRequiredTorque = Math.round(liveBasicTorque * 1.5 * 100) / 100;

  const handleSaveRobot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createRobot({
        project_id: projectId,
        robot_name: robotName,
        robot_type: robotType,
        payload,
        reach,
        dof,
        application,
        required_speed: speed,
        required_accuracy: accuracy,
        budget
      });

      alert(`Robotic Arm '${robotName}' saved to MySQL with static calculated torque of ${res.calculated_torque} Nm!`);
      setShowCreateModal(false);
      const updated = await api.getRobots();
      setRobots(updated);
      const newlyCreated = updated.find((r) => r.robot_id === res.robot_id);
      if (newlyCreated) {
        onSelectRobot?.(newlyCreated);
        onRobotUpdated?.(newlyCreated);
      }
    } catch (err: any) {
      alert('Error creating robot: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Bot className="w-3.5 h-3.5" />
            <span>DATABASE: Robot Table</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Robotic Arm Specification &amp; Design Requirements</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure mechanical engineering parameters, joint kinematics, and payload requirements.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Robot Configuration</span>
        </button>
      </div>

      {/* Primary Arm Kinematics & Interactive Parameter Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Engineering Requirements Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Engineering Parameters: {currentRobot?.robot_name || robotName}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              Safety Factor = 1.5
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Payload Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Payload Capacity (m):</span>
                <span className="font-mono font-bold text-sky-400">{payload} kg</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={payload}
                onChange={(e) => setPayload(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>0.5 kg (Micro Assembly)</span>
                <span>25 kg (Heavy Duty)</span>
              </div>
            </div>

            {/* Reach Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Maximum Working Reach (L):</span>
                <span className="font-mono font-bold text-sky-400">{reach} mm ({(reach / 1000).toFixed(2)} m)</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={reach}
                onChange={(e) => setReach(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>200 mm</span>
                <span>2000 mm</span>
              </div>
            </div>

            {/* Degrees of Freedom & Speed */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Degrees of Freedom (DOF)</label>
                <input
                  type="number"
                  min="3"
                  max="7"
                  value={dof}
                  onChange={(e) => setDof(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">End-Effector Speed (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                />
              </div>
            </div>

            {/* Repeatability & Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Repeatability / Accuracy (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={accuracy}
                  onChange={(e) => setAccuracy(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Authorized Budget (₹)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                />
              </div>
            </div>

            {/* Static Holding Torque Prediction Box */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2 mt-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Calculated Joint Torque:</span>
                <span className="text-amber-400 font-bold font-mono text-sm">{liveRequiredTorque} Nm</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                <div>• Force = {payload} kg × 9.81 m/s² = {liveForceN} N</div>
                <div>• Basic Torque = {liveForceN} N × {reachM} m = {liveBasicTorque} Nm</div>
                <div>• Required Torque (SF 1.5) = {liveBasicTorque} × 1.5 = <strong className="text-emerald-400">{liveRequiredTorque} Nm</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onNavigateToCalculations}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Full Engineering Analysis</span>
              </button>
              <button
                onClick={onNavigateToMotors}
                className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Find Suitable Motors</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Kinematics FBD & Arm Registry */}
        <div className="lg:col-span-7 space-y-6">
          <KinematicsDiagram
            payloadKg={payload}
            reachMm={reach}
            dof={dof}
            calculatedTorqueNm={liveRequiredTorque}
            robotName={currentRobot?.robot_name || robotName}
          />

          {/* Existing Configured Arms Registry Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-3">Database Arms in robotic_arm_dms</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-2">Robot Name</th>
                    <th className="py-2 px-2">Kinematic Type</th>
                    <th className="py-2 px-2">Payload</th>
                    <th className="py-2 px-2">Reach</th>
                    <th className="py-2 px-2">Req. Torque</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {robots.map((r) => {
                    const isSelected = currentRobot?.robot_id === r.robot_id;
                    return (
                      <tr key={r.robot_id} className={`hover:bg-slate-800/40 ${isSelected ? 'bg-sky-950/20' : ''}`}>
                        <td className="py-2 px-2 font-bold text-white flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                          {r.robot_name}
                        </td>
                        <td className="py-2 px-2 text-slate-400">{r.robot_type}</td>
                        <td className="py-2 px-2 text-sky-400">{r.payload} kg</td>
                        <td className="py-2 px-2">{r.reach} mm</td>
                        <td className="py-2 px-2 text-amber-400 font-bold">{r.calculated_torque || 58.86} Nm</td>
                        <td className="py-2 px-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            onClick={() => {
                              onSelectRobot?.(r);
                              onRobotUpdated?.(r);
                              setRobotName(r.robot_name);
                              setPayload(r.payload);
                              setReach(r.reach);
                              setDof(r.dof);
                              setBudget(r.budget);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-sans font-semibold transition-colors ${
                              isSelected
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isSelected ? 'Active' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Robot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add New Robotic Arm Configuration</h3>

            <form onSubmit={handleSaveRobot} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Robot Identifier / Name</label>
                <input
                  type="text"
                  required
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. ArticulatedBot-02"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Parent Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {projects.map((p) => (
                      <option key={p.project_id} value={p.project_id}>
                        {p.project_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Kinematic Architecture</label>
                  <select
                    value={robotType}
                    onChange={(e) => setRobotType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option>6-DOF Articulated Arm</option>
                    <option>4-DOF SCARA</option>
                    <option>3-DOF Cylindrical</option>
                    <option>Cartesian / Gantry</option>
                    <option>Delta Parallel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Target Payload (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={payload}
                    onChange={(e) => setPayload(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Max Reach (mm)</label>
                  <input
                    type="number"
                    value={reach}
                    onChange={(e) => setReach(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Target Speed (m/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Target Repeatability (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={accuracy}
                    onChange={(e) => setAccuracy(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Budget Allocation (₹)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow"
                >
                  Calculate &amp; Save Arm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
