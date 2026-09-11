import React, { useState } from 'react';
import { X, Play, CheckCircle2, ArrowRight, Bot, Cpu, CircleDot, Layers, HandMetal, ShieldCheck, DollarSign, History, ClipboardCheck, Wrench, Sparkles } from 'lucide-react';
import { ActivePage } from './Sidebar';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: ActivePage) => void;
}

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Step 1: Engineering Requirement & Kinematics',
      page: 'robots' as ActivePage,
      icon: Bot,
      details: 'PickBot-01 configured with 6-DOF articulated geometry, 5.0 kg payload, 800 mm spherical reach, and ₹80,000 authorized budget.',
      sqlNote: 'SELECT * FROM Robot WHERE robot_id = 1;'
    },
    {
      title: 'Step 2: Torque & Safety Factor Derivation',
      page: 'calculations' as ActivePage,
      icon: Cpu,
      details: 'Static holding torque calculated at 39.24 Nm. With ISO 1.5x factor of safety, required joint holding torque is exactly 58.86 Nm.',
      sqlNote: 'Torque Formula: T_req = (m_payload * g * reach) * SF = 58.86 Nm'
    },
    {
      title: 'Step 3: Motor Recommendation (60 Nm)',
      page: 'motors' as ActivePage,
      icon: Cpu,
      details: 'Evaluated 5 catalog motors. Selected TechMotion 60Nm (Rated 60 Nm >= 58.86 Nm, margin +1.14 Nm, shaft Ø20mm, ₹9,000).',
      sqlNote: 'SELECT * FROM Motor WHERE rated_torque >= 58.86 ORDER BY cost ASC;'
    },
    {
      title: 'Step 4: Bearing Bore Matching (Ø20 mm)',
      page: 'bearings' as ActivePage,
      icon: CircleDot,
      details: 'Matched motor drive shaft (Ø20mm) to SKF 6004 Deep Groove Ball Bearing (Bore Ø20mm, dynamic load 9.95 kN, ₹450).',
      sqlNote: 'SELECT * FROM Bearing WHERE bore_diameter = 20;'
    },
    {
      title: 'Step 5: Structural Link Material (Al 6061-T6)',
      page: 'materials' as ActivePage,
      icon: Layers,
      details: 'Selected Aluminium Alloy 6061-T6 for links (density 2.70 g/cm³, yield strength 276 MPa, specific strength 102.2) to minimize rotational inertia.',
      sqlNote: 'SELECT * FROM Material ORDER BY (yield_strength / density) DESC;'
    },
    {
      title: 'Step 6: End-Effector Gripper Selection',
      page: 'grippers' as ActivePage,
      icon: HandMetal,
      details: 'Selected Electric 2-Finger Servo Gripper sized for 5.0 kg payload with 140 N grip clamping force and 40 mm stroke.',
      sqlNote: 'SELECT * FROM Gripper WHERE max_payload >= 5.0;'
    },
    {
      title: 'Step 7: Electromechanical Compatibility Audit',
      page: 'compatibility' as ActivePage,
      icon: ShieldCheck,
      details: 'Checked torque margin (+1.9%), shaft-to-bore fit (Ø20mm = Ø20mm), and 48V power bus. Overall status: COMPATIBLE.',
      sqlNote: 'Multi-criteria rule verification engine passed.'
    },
    {
      title: 'Step 8: Itemized BOM & Cost vs Budget',
      page: 'cost_estimation' as ActivePage,
      icon: DollarSign,
      details: 'Total estimated hardware BOM: ₹77,150. Target budget: ₹80,000. Surplus savings: +₹2,850 (Within Budget).',
      sqlNote: 'SELECT SUM(quantity * unit_cost) FROM Robot_Component WHERE robot_id = 1;'
    },
    {
      title: 'Step 9: Version Control & ISO Testing',
      page: 'testing' as ActivePage,
      icon: ClipboardCheck,
      details: 'Committed Version 1.0 to MySQL Design_Version table. Executed 5kg Payload Hold Test & 60Nm Torque Verification -> PASS.',
      sqlNote: 'INSERT INTO Test (robot_id, test_type, expected_value, actual_value, status) VALUES (1, "Payload Test", 5.0, 5.0, "PASS");'
    }
  ];

  const activeStepData = steps[currentStep];

  const handleGoToStep = (index: number) => {
    setCurrentStep(index);
    onNavigate(steps[index].page);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-sky-950/50 via-slate-900 to-emerald-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Robotic Arm Design Lifecycle — Guided Engineering Tour
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Step {currentStep + 1} of {steps.length} • Demonstration of prompt specification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleGoToStep(idx)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all ${
                currentStep === idx
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : currentStep > idx
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx + 1}. {s.title.split(':')[1]?.trim() || s.title}
            </button>
          ))}
        </div>

        {/* Step Content Card */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
              <activeStepData.icon className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white tracking-tight">
                {activeStepData.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStepData.details}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-emerald-400 space-y-1">
            <span className="text-slate-500 text-[10px] block">DATABASE &amp; CALCULATION TRACE:</span>
            <code>{activeStepData.sqlNote}</code>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStep > 0) handleGoToStep(currentStep - 1);
            }}
            disabled={currentStep === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors"
          >
            Previous
          </button>

          <button
            onClick={() => {
              onNavigate(activeStepData.page);
              onClose();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Open This Module View
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => handleGoToStep(currentStep + 1)}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs shadow flex items-center gap-1 transition-all"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow flex items-center gap-1 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finish Tour</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
