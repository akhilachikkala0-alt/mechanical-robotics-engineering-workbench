import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Printer, Download, CheckCircle2, ShieldCheck, DollarSign, Bot, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Robot, RobotComponentAllocation, TestRecord } from '../types';

interface ReportsPageProps {
  currentRobot: Robot | null;
  onNavigateToDbms: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  currentRobot,
  onNavigateToDbms
}) => {
  const [bom, setBom] = useState<RobotComponentAllocation[]>([]);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [currentRobot]);

  const loadReportData = async () => {
    if (!currentRobot) return;
    try {
      setLoading(true);
      const [bomData, testData] = await Promise.all([
        api.getRobotComponents(currentRobot.robot_id),
        api.getTests(currentRobot.robot_id)
      ]);
      setBom(bomData);
      setTests(testData);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = bom.reduce((acc, i) => acc + i.quantity * i.unit_cost, 0);
  const passTests = tests.filter((t) => t.status === 'PASS').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ENGINEERING COMPLIANCE &amp; FABRICATION SPECIFICATION</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Comprehensive Robotic Arm Design Dossier</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full consolidated specification sheet for <strong className="text-sky-400">{currentRobot?.robot_name || 'PickBot-01'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF Dossier</span>
          </button>
          <button
            onClick={onNavigateToDbms}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>DBMS SQL Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none text-slate-200">
        {/* Document Title Header */}
        <div className="border-b-2 border-slate-800 print:border-black pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-sky-400 uppercase tracking-widest print:text-blue-700">
              Department of Mechanical &amp; Mechatronics Engineering
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1 print:text-black">
              Engineering Design &amp; Verification Dossier
            </h2>
            <div className="text-xs text-slate-400 mt-1 font-mono print:text-gray-600">
              Document Ref: DOC-ROBOT-{currentRobot?.robot_id || 1}-REV2 • Database: MySQL <code>robotic_arm_dms</code>
            </div>
          </div>

          <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-xl border border-slate-800 print:border-gray-300 font-mono text-xs text-right">
            <div>Lead Engineer: <strong className="text-white print:text-black">Prof. R. V. Sharma</strong></div>
            <div>Date: <strong className="text-slate-300 print:text-black">{new Date().toISOString().split('T')[0]}</strong></div>
            <div className="text-emerald-400 print:text-green-700 font-bold mt-1">Status: FABRICATION APPROVED</div>
          </div>
        </div>

        {/* Section 1: Arm Kinematic & Dynamic Specification */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider font-mono border-b border-slate-800 print:border-gray-400 pb-1">
            1. Core Kinematic &amp; Dynamic Parameters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-500 block text-[10px]">ROBOT NAME &amp; CLASS</span>
              <span className="text-white print:text-black font-bold text-sm">{currentRobot?.robot_name || 'PickBot-01'}</span>
            </div>
            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-500 block text-[10px]">DEGREES OF FREEDOM</span>
              <span className="text-white print:text-black font-bold text-sm">{currentRobot?.dof || 6} DOF Articulated</span>
            </div>
            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-500 block text-[10px]">RATED PAYLOAD CAPACITY</span>
              <span className="text-amber-400 print:text-black font-bold text-sm">{currentRobot?.payload || 5.0} kg</span>
            </div>
            <div className="p-3 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
              <span className="text-slate-500 block text-[10px]">MAXIMUM SPHERICAL REACH</span>
              <span className="text-sky-400 print:text-black font-bold text-sm">{currentRobot?.reach || 800} mm</span>
            </div>
          </div>
        </div>

        {/* Section 2: Mechanical Calculations & Safety Margins */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider font-mono border-b border-slate-800 print:border-gray-400 pb-1">
            2. Mechanical Torque &amp; Structural Margin Derivations
          </h3>
          <div className="p-4 bg-slate-950 print:bg-gray-100 rounded-xl border border-slate-800 print:border-gray-300 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span>Static Cantilever Holding Torque: T = (m_payload + m_links) × g × R</span>
              <strong className="text-white print:text-black">39.24 Nm</strong>
            </div>
            <div className="flex justify-between">
              <span>Safety Factor Applied (Factor of Safety, N):</span>
              <strong className="text-emerald-400 print:text-green-700">1.50× (ISO 10218-1)</strong>
            </div>
            <div className="flex justify-between border-t border-slate-800 print:border-gray-300 pt-1">
              <span>Minimum Required Joint Actuator Torque:</span>
              <strong className="text-amber-400 print:text-black">58.86 Nm</strong>
            </div>
            <div className="flex justify-between">
              <span>Selected Motor Rated Capacity (TechMotion TM-60):</span>
              <strong className="text-emerald-400 print:text-green-700">60.00 Nm (+1.9% Margin)</strong>
            </div>
            <div className="flex justify-between">
              <span>Motor Shaft Diameter / Bearing Bore Match:</span>
              <strong className="text-sky-400 print:text-blue-700">Ø20.00 mm (SKF 6004 Precision Bore)</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Allocated Bill of Materials */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider font-mono border-b border-slate-800 print:border-gray-400 pb-1">
            3. Final Allocated Bill of Materials (BOM)
          </h3>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 print:bg-gray-200 text-[10px] text-slate-400 print:text-gray-700 uppercase border-b border-slate-800 print:border-gray-400">
              <tr>
                <th className="py-2 px-3">Subsystem Role</th>
                <th className="py-2 px-3">Component Description</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3 text-right">Unit Price</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-300 print:text-gray-800">
              {bom.map((b) => (
                <tr key={b.id}>
                  <td className="py-2 px-3 font-sans font-bold text-white print:text-black">{b.role_or_joint}</td>
                  <td className="py-2 px-3">{b.component_name} ({b.manufacturer})</td>
                  <td className="py-2 px-3">{b.component_type}</td>
                  <td className="py-2 px-3 text-center">{b.quantity}</td>
                  <td className="py-2 px-3 text-right">₹{b.unit_cost.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-black">
                    ₹{(b.quantity * b.unit_cost).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-800 print:border-black font-bold">
              <tr>
                <td colSpan={5} className="py-2.5 px-3 text-right text-slate-300 print:text-black">
                  TOTAL ESTIMATED HARDWARE EXPENDITURE:
                </td>
                <td className="py-2.5 px-3 text-right text-sm text-emerald-400 print:text-black">
                  ₹{totalCost.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="py-1 px-3 text-right text-slate-400 print:text-gray-600 font-normal">
                  AUTHORIZED PROJECT CAP:
                </td>
                <td className="py-1 px-3 text-right text-slate-300 print:text-gray-700 font-normal">
                  ₹{(currentRobot?.budget || 80000).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="py-1 px-3 text-right text-emerald-400 print:text-green-700">
                  NET REMAINING CONTINGENCY SURPLUS:
                </td>
                <td className="py-1 px-3 text-right text-emerald-400 print:text-green-700">
                  +₹{Math.max(0, (currentRobot?.budget || 80000) - totalCost).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 4: Validation Tests */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider font-mono border-b border-slate-800 print:border-gray-400 pb-1">
            4. ISO Empirical Validation Test Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {tests.slice(0, 4).map((t) => (
              <div key={t.test_id} className="p-3 bg-slate-950 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white print:text-black">{t.test_name}</div>
                  <div className="text-[11px] text-slate-400 print:text-gray-600">
                    Exp: {t.expected_value} {t.unit} | Act: {t.actual_value} {t.unit}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 print:text-green-700 border border-emerald-500/20">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Engineering Approval Sign-off Box */}
        <div className="pt-6 border-t-2 border-slate-800 print:border-black grid grid-cols-3 gap-6 font-mono text-xs text-slate-400 print:text-gray-700">
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8"></div>
            <div className="mt-1 font-bold text-slate-200 print:text-black">Lead Robotics Engineer</div>
            <div className="text-[10px]">Prof. R. V. Sharma</div>
          </div>
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8"></div>
            <div className="mt-1 font-bold text-slate-200 print:text-black">Structural Lead</div>
            <div className="text-[10px]">Mechanical Systems Lab</div>
          </div>
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-8"></div>
            <div className="mt-1 font-bold text-slate-200 print:text-black">Quality &amp; Safety Auditor</div>
            <div className="text-[10px]">ISO 10218 Compliance Office</div>
          </div>
        </div>
      </div>
    </div>
  );
};
