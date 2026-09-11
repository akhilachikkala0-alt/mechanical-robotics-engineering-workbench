import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, Filter, Trash2, ShoppingCart, Check, Tag, Cpu, Info } from 'lucide-react';
import { api } from '../services/api';
import { ComponentItem, Robot } from '../types';

interface ComponentDatabaseProps {
  currentRobot: Robot | null;
  onComponentAllocated?: () => void;
}

export const ComponentDatabasePage: React.FC<ComponentDatabaseProps> = ({
  currentRobot,
  onComponentAllocated
}) => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [allocatedIds, setAllocatedIds] = useState<number[]>([]);

  // Add Component Form State
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState<ComponentItem['component_type']>('Motor');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [specification, setSpecification] = useState('');
  const [cost, setCost] = useState<number>(5000);
  const [stockQty, setStockQty] = useState<number>(10);
  const [weight, setWeight] = useState<number>(1.5);

  // Subtype inputs
  const [ratedTorque, setRatedTorque] = useState<number>(60);
  const [boreDiameter, setBoreDiameter] = useState<number>(20);
  const [yieldStrength, setYieldStrength] = useState<number>(276);
  const [maxPayload, setMaxPayload] = useState<number>(5);

  useEffect(() => {
    loadComponents();
  }, [typeFilter, searchQuery]);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const data = await api.getComponents({ type: typeFilter, search: searchQuery });
      setComponents(data);
    } catch (err) {
      console.error('Failed to load components:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createComponent({
        component_name: compName,
        component_type: compType,
        manufacturer,
        model_number: modelNumber,
        specification,
        cost: Number(cost),
        stock_quantity: Number(stockQty),
        weight: Number(weight),
        rated_torque: compType === 'Motor' ? ratedTorque : undefined,
        bore_diameter: compType === 'Bearing' ? boreDiameter : undefined,
        yield_strength: compType === 'Material' ? yieldStrength : undefined,
        max_payload: compType === 'Gripper' ? maxPayload : undefined
      });
      setShowAddModal(false);
      // Reset
      setCompName('');
      setManufacturer('');
      setSpecification('');
      loadComponents();
    } catch (err: any) {
      alert('Error adding component: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this component from the MySQL catalog?')) return;
    try {
      await api.deleteComponent(id);
      loadComponents();
    } catch (err: any) {
      alert('Error deleting component: ' + err.message);
    }
  };

  const handleAllocateToRobot = async (comp: ComponentItem) => {
    if (!currentRobot) {
      alert('Please select an active robot first from the top bar.');
      return;
    }
    try {
      await api.addRobotComponent({
        robot_id: currentRobot.robot_id,
        component_id: comp.component_id,
        quantity: 1,
        role_or_joint: `${comp.component_type} Allocation`,
        unit_cost: comp.cost
      });
      setAllocatedIds((prev) => [...prev, comp.component_id]);
      if (onComponentAllocated) onComponentAllocated();
    } catch (err: any) {
      alert('Allocation error: ' + err.message);
    }
  };

  const filterTabs = ['All', 'Motor', 'Bearing', 'Material', 'Gripper', 'Sensor', 'Controller'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Database className="w-3.5 h-3.5" />
            <span>DATABASE: Component &amp; Subtype Tables</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Component Database &amp; Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query motors, bearings, materials, grippers, sensors, and controllers from the relational database.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Component to MySQL</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by component name, manufacturer, specification, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                typeFilter === tab
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Components Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Component Details</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Manufacturer &amp; Model</th>
                <th className="py-3 px-3">Key Technical Spec</th>
                <th className="py-3 px-3 font-mono">Weight</th>
                <th className="py-3 px-3 font-mono">Unit Price</th>
                <th className="py-3 px-3 font-mono">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {components.map((c) => {
                const isAllocated = allocatedIds.includes(c.component_id);
                return (
                  <tr key={c.component_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{c.component_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: #{c.component_id}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-400 border border-sky-800/40">
                        {c.component_type}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">{c.manufacturer}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.model_number || 'Standard OEM'}</div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                        {c.specification}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      {c.weight ? `${c.weight} kg` : '-'}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-sm">
                      ₹{c.cost.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="text-slate-300">{c.stock_quantity}</span>
                      <span className="text-[9px] text-slate-500 block">units</span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleAllocateToRobot(c)}
                        className={`px-2.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1 transition-all ${
                          isAllocated
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-600 hover:bg-sky-500 text-white'
                        }`}
                        title="Add to active robot Bill of Materials"
                      >
                        {isAllocated ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add to BOM</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(c.component_id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Add New Component to MySQL Catalog</h3>

            <form onSubmit={handleAddComponent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Component Name</label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Servo Motor 60Nm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Component Category</label>
                  <select
                    value={compType}
                    onChange={(e) => setCompType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Motor">Motor</option>
                    <option value="Bearing">Bearing</option>
                    <option value="Material">Material</option>
                    <option value="Gripper">Gripper</option>
                    <option value="Sensor">Sensor</option>
                    <option value="Controller">Controller</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. TechMotion Dynamics"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Model / Part Number</label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. TM-60NM-750W"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Technical Specification</label>
                <textarea
                  rows={2}
                  required
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  placeholder="Voltage, RPM, torque, dimensions, communication bus..."
                />
              </div>

              {/* Subtype Specific Fields */}
              {compType === 'Motor' && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-sky-400 font-mono font-bold text-[11px]">Motor Subtype Parameters</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Rated Torque (Nm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ratedTorque}
                        onChange={(e) => setRatedTorque(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Shaft Diameter (mm)</label>
                      <input
                        type="number"
                        value={boreDiameter}
                        onChange={(e) => setBoreDiameter(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {compType === 'Bearing' && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-sky-400 font-mono font-bold text-[11px]">Bearing Subtype Parameters</span>
                  <div>
                    <label className="block text-slate-400 mb-1">Bore Diameter (mm)</label>
                    <input
                      type="number"
                      value={boreDiameter}
                      onChange={(e) => setBoreDiameter(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
