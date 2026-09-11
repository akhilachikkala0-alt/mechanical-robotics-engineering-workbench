import React, { useState, useEffect } from 'react';
import { Columns3, Check, Star, Plus, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { ComponentItem, Robot } from '../types';

interface ComparisonPageProps {
  currentRobot: Robot | null;
  onNavigateToCompatibility: () => void;
  onComponentAllocated?: () => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  currentRobot,
  onNavigateToCompatibility,
  onComponentAllocated
}) => {
  const [category, setCategory] = useState<'Motor' | 'Bearing' | 'Material' | 'Gripper'>('Motor');
  const [catalogItems, setCatalogItems] = useState<ComponentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    loadCategoryItems();
  }, [category]);

  const loadCategoryItems = async () => {
    try {
      const data = await api.getComponents({ type: category });
      setCatalogItems(data);
      // Pre-select first 3 items of this category
      if (data.length >= 2) {
        setSelectedIds(data.slice(0, 3).map((d) => d.component_id));
      }
    } catch (err) {
      console.error('Failed to load category items:', err);
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('Please keep at least 2 components selected for side-by-side comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare a maximum of 4 components simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedItems = catalogItems.filter((item) => selectedIds.includes(item.component_id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Columns3 className="w-3.5 h-3.5" />
            <span>TRADE-OFF ENGINEERING ANALYSIS</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Multi-Component Trade-Off Matrix</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare mechanical torque, mass density, dynamic ratings, and commercial pricing across competing components.
          </p>
        </div>

        <button
          onClick={onNavigateToCompatibility}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Next: Compatibility Check</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Pills & Selection Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Category:</span>
          {(['Motor', 'Bearing', 'Material', 'Gripper'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>

        {/* Checkbox Chips of available components */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-mono mr-1">Select to Compare:</span>
          {catalogItems.map((item) => {
            const isChecked = selectedIds.includes(item.component_id);
            return (
              <button
                key={item.component_id}
                onClick={() => toggleSelect(item.component_id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1 ${
                  isChecked
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {isChecked && <Check className="w-3 h-3 text-sky-400" />}
                <span>{item.component_name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-48 font-mono text-slate-400 uppercase text-[10px]">
                  Comparison Metric
                </th>
                {comparedItems.map((item) => (
                  <th key={item.component_id} className="py-3 px-4 min-w-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{item.component_name}</span>
                      <button
                        onClick={() => toggleSelect(item.component_id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.manufacturer} • {item.model_number || 'OEM'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
              {/* Unit Cost */}
              <tr className="bg-slate-950/30">
                <td className="py-3 px-4 text-slate-400 font-sans font-medium">Unit Price (₹)</td>
                {comparedItems.map((item) => (
                  <td key={item.component_id} className="py-3 px-4">
                    <span className="text-emerald-400 font-bold text-sm">
                      ₹{item.cost.toLocaleString()}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Mass */}
              <tr>
                <td className="py-3 px-4 text-slate-400 font-sans font-medium">Component Mass (kg)</td>
                {comparedItems.map((item) => (
                  <td key={item.component_id} className="py-3 px-4">
                    {item.weight ? `${item.weight} kg` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Category-Specific Rows */}
              {category === 'Motor' && (
                <>
                  <tr className="bg-slate-950/30">
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Rated Torque (Nm)</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4">
                        <span className="font-bold text-white text-sm">{item.rated_torque || '-'} Nm</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Shaft Diameter</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4 text-sky-400 font-bold">
                        Ø{item.shaft_diameter || '-'} mm
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-950/30">
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Rated RPM &amp; Power</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4 text-slate-200">
                        {item.rpm || '-'} RPM / {item.power || '-'} W
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {category === 'Bearing' && (
                <>
                  <tr className="bg-slate-950/30">
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Bore Diameter (d)</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4 text-sky-400 font-bold">
                        Ø{item.bore_diameter || '-'} mm
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Dynamic Load (C)</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4 text-emerald-400 font-bold">
                        {item.dynamic_load_rating || '-'} kN
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-950/30">
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Outer Dia &amp; Width</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4 text-slate-300">
                        Ø{item.outer_diameter || '-'} mm × {item.width || '-'} mm
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {category === 'Material' && (
                <>
                  <tr className="bg-slate-950/30">
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Density (ρ)</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4">
                        {item.density || '-'} g/cm³
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Yield Strength (σ_y)</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4 text-white font-bold">
                        {item.yield_strength || '-'} MPa
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-950/30">
                    <td className="py-3 px-4 text-slate-400 font-sans font-medium">Young's Modulus (E)</td>
                    {comparedItems.map((item) => (
                      <td key={item.component_id} className="py-3 px-4 text-sky-400">
                        {item.youngs_modulus || '-'} GPa
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* Technical Specification Summary */}
              <tr>
                <td className="py-3 px-4 text-slate-400 font-sans font-medium">Specification Detail</td>
                {comparedItems.map((item) => (
                  <td key={item.component_id} className="py-3 px-4 font-sans text-xs text-slate-300 leading-relaxed">
                    {item.specification}
                  </td>
                ))}
              </tr>

              {/* Stock Status */}
              <tr className="bg-slate-950/30">
                <td className="py-3 px-4 text-slate-400 font-sans font-medium">Inventory Stock</td>
                {comparedItems.map((item) => (
                  <td key={item.component_id} className="py-3 px-4">
                    <span className="text-emerald-400 font-bold">{item.stock_quantity} units</span> in stock
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
