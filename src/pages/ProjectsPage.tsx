import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, Search, Filter, Trash2, Calendar, User, DollarSign, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Project form state
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [application, setApplication] = useState('Material Handling');
  const [budget, setBudget] = useState(80000);
  const [status, setStatus] = useState<'Planning' | 'Development' | 'Testing' | 'Completed' | 'On Hold'>('Development');

  useEffect(() => {
    loadProjects();
  }, [statusFilter, searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects({ status: statusFilter, search: searchQuery });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await api.createProject({
        project_name: projectName,
        description,
        application,
        budget: Number(budget),
        status,
        engineer_id: 1,
        start_date: new Date().toISOString().split('T')[0]
      });
      setShowModal(false);
      setProjectName('');
      setDescription('');
      loadProjects();
    } catch (err: any) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project and all linked robot designs from MySQL?')) return;
    try {
      await api.deleteProject(id);
      loadProjects();
    } catch (err: any) {
      alert('Error deleting project: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>DATABASE: Project Table</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Robotics Design Projects</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage institutional and industrial robotic arm development projects and allocations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by title, application, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex gap-1 overflow-x-auto text-[11px] font-mono">
            {['All', 'Development', 'Testing', 'Planning', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === st
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.project_id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-sm transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ID: #{p.project_id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    p.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : p.status === 'Testing'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-2.5 tracking-tight">{p.project_name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{p.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  Application:
                </span>
                <span className="text-slate-200 font-semibold">{p.application}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Lead:
                </span>
                <span className="text-slate-300">{p.engineer_name || 'Prof. R. V. Sharma'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  Authorized Budget:
                </span>
                <span className="text-emerald-400 font-bold">₹{p.budget.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Calendar className="w-3 h-3" />
                  Started: {p.start_date}
                </span>
                <button
                  onClick={() => handleDelete(p.project_id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Robotics Project in MySQL</h3>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Palletizing Robotic Arm (15kg Payload)"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Description &amp; Purpose</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  placeholder="Engineering requirements, scope, target cycles..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Application Domain</label>
                  <select
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option>Material Handling</option>
                    <option>Arc Welding</option>
                    <option>Electronics Assembly</option>
                    <option>Painting &amp; Coating</option>
                    <option>Machine Tending</option>
                    <option>Laboratory Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Authorized Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option>Planning</option>
                  <option>Development</option>
                  <option>Testing</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow"
                >
                  Save to MySQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
