import React, { useState, useEffect } from 'react';
import { Layers, Star, CheckCircle2, ArrowRight, ShoppingCart, Check, Info, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Robot } from '../types';

interface MaterialSelectionProps {
  currentRobot: Robot | null;
  onNavigateToGrippers: () => void;
  onComponentAllocated?: () => void;
}

export const MaterialSelectionPage: React.FC<MaterialSelectionProps> = ({
  currentRobot,
  onNavigateToGrippers,
  onComponentAllocated
}) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [recommendedMaterial, setRecommendedMaterial] = useState<any | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [allocatedIds, setAllocatedIds] = useState<number[]>([]);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await api.recommendMaterial();
      setMaterials(data.all_materials);
      setRecommendedMaterial(data.recommended_material);
      setReason(data.recommendation_reason);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (mat: any) => {
    if (!currentRobot) {
      alert('Please select an active robot first from the top bar.');
      return;
    }
    try {
      await api.addRobotComponent({
        robot_id: currentRobot.robot_id,
        component_id: mat.component_id,
        quantity: 1,
        role_or_joint: 'Structural Link Extrusions (L1 & L2)',
        unit_cost: mat.cost
      });
      setAllocatedIds((prev) => [...prev, mat.component_id]);
      if (onComponentAllocated) onComponentAllocated();
    } catch (err: any) {
      alert('Error allocating material: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Layers className="w-3.5 h-3.5" />
            <span>DATABASE: Material Subtype Query</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Structural Material Selection</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimize robotic arm link strength-to-weight ratio to reduce rotational inertia and actuator strain.
          </p>
        </div>

        <button
          onClick={onNavigateToGrippers}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Next: Gripper Selection</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recommended Material Card */}
      {recommendedMaterial && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Optimal Link Structural Material
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Specific Strength: <strong className="text-emerald-400 font-bold">{recommendedMaterial.specific_strength} MPa·cm³/g</strong>
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                {recommendedMaterial.component_name}
              </h2>

              <p className="text-xs text-amber-200/90 max-w-2xl leading-relaxed">
                {reason}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-300">
                <span>Density: <strong className="text-white">{recommendedMaterial.density} g/cm³</strong></span>
                <span>•</span>
                <span>Yield Strength: <strong className="text-white">{recommendedMaterial.yield_strength} MPa</strong></span>
                <span>•</span>
                <span>Young's Modulus (E): <strong className="text-sky-400">{recommendedMaterial.youngs_modulus} GPa</strong></span>
                <span>•</span>
                <span>Machinability: <strong className="text-emerald-400 font-bold">{recommendedMaterial.machinability}</strong></span>
                <span>•</span>
                <span>Price: <strong className="text-emerald-400 font-bold text-sm">₹{recommendedMaterial.cost.toLocaleString()}</strong></span>
              </div>
            </div>

            <button
              onClick={() => handleAllocate(recommendedMaterial)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add Material Extrusion to BOM</span>
            </button>
          </div>
        </div>
      )}

      {/* Materials Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {materials.map((m) => {
          const isRecommended = m.component_name.includes('6061') || m.component_name.includes('Aluminium');
          const isAllocated = allocatedIds.includes(m.component_id);
          return (
            <div
              key={m.component_id}
              className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between shadow-sm transition-all ${
                isRecommended ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    ID #{m.component_id}
                  </span>
                  {isRecommended && (
                    <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mt-2 tracking-tight">{m.component_name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{m.specification}</p>

                <div className="mt-4 space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Density (ρ):</span>
                    <span className="font-bold">{m.density} g/cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Yield Strength:</span>
                    <span className="text-white font-bold">{m.yield_strength} MPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tensile Strength:</span>
                    <span className="text-white">{m.tensile_strength} MPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Young's Modulus:</span>
                    <span className="text-sky-400">{m.youngs_modulus} GPa</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Spec. Strength:</span>
                    <span className="text-emerald-400 font-bold">{m.specific_strength}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-emerald-400">
                  ₹{m.cost.toLocaleString()}
                </span>

                <button
                  onClick={() => handleAllocate(m)}
                  className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1 transition-all ${
                    isAllocated
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {isAllocated ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Allocated</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3" />
                      <span>Select</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
