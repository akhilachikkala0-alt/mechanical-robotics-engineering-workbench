import React, { useState, useEffect } from 'react';
import { Database, Play, Terminal, Table as TableIcon, Layers, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const DbmsStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'console' | 'tables' | 'er'>('console');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT c.component_name, c.component_type, c.cost, m.rated_torque, m.shaft_diameter FROM Component c JOIN Motor m ON c.component_id = m.component_id WHERE m.rated_torque >= 50 ORDER BY c.cost ASC;'
  );
  const [queryResults, setQueryResults] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  // Tables schema state
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('Component');
  const [tableSchema, setTableSchema] = useState<any[]>([]);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableSchema(selectedTable);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    try {
      const list = await api.getDbTables();
      setTables(list);
    } catch (err) {
      console.error('Failed to load tables:', err);
    }
  };

  const loadTableSchema = async (tableName: string) => {
    try {
      const schema = await api.getTableSchema(tableName);
      setTableSchema(schema);
    } catch (err) {
      console.error('Failed to load schema:', err);
    }
  };

  const handleExecute = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    try {
      setExecuting(true);
      setError(null);
      const res = await api.executeRawQuery(q);
      setQueryResults(res);
      setExecutionTime(res.execution_time_ms);
    } catch (err: any) {
      setError(err.message);
      setQueryResults(null);
    } finally {
      setExecuting(false);
    }
  };

  const sampleQueries = [
    {
      title: 'High-Torque Motors (≥ 50 Nm)',
      query:
        'SELECT c.component_name, c.manufacturer, c.cost, m.rated_torque, m.shaft_diameter FROM Component c JOIN Motor m ON c.component_id = m.component_id WHERE m.rated_torque >= 50 ORDER BY m.rated_torque ASC;'
    },
    {
      title: 'Bearings Matching Ø20mm Shaft',
      query:
        'SELECT c.component_name, c.manufacturer, c.cost, b.bore_diameter, b.dynamic_load_rating FROM Component c JOIN Bearing b ON c.component_id = b.component_id WHERE b.bore_diameter = 20;'
    },
    {
      title: 'Active BOM for PickBot-01',
      query:
        'SELECT rc.role_or_joint, c.component_name, c.component_type, rc.quantity, rc.unit_cost, (rc.quantity * rc.unit_cost) AS subtotal FROM Robot_Component rc JOIN Component c ON rc.component_id = c.component_id WHERE rc.robot_id = 1 ORDER BY subtotal DESC;'
    },
    {
      title: 'Test Verification Audit by Robot',
      query:
        'SELECT r.robot_name, t.test_type, t.expected_value, t.actual_value, t.unit, t.status, t.test_date FROM Test t JOIN Robot r ON t.robot_id = r.robot_id ORDER BY t.test_date DESC;'
    },
    {
      title: 'Project Budget vs Hardware Totals',
      query:
        'SELECT p.project_name, r.robot_name, r.budget, SUM(rc.quantity * rc.unit_cost) AS total_bom_cost, (r.budget - SUM(rc.quantity * rc.unit_cost)) AS remaining_budget FROM Project p JOIN Robot r ON p.project_id = r.project_id LEFT JOIN Robot_Component rc ON r.robot_id = rc.robot_id GROUP BY p.project_name, r.robot_name, r.budget;'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Database className="w-3.5 h-3.5" />
            <span>DATABASE: robotic_arm_dms SCHEMA ARCHITECTURE</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">DBMS Studio &amp; SQL Query Console</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query tables, examine foreign key dependencies, and inspect schema structures directly on the MySQL engine.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'console'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Console</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'tables'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Schema Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('er')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'er'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ER Relational Model</span>
          </button>
        </div>
      </div>

      {/* SQL Console Tab */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          {/* Query Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] font-mono text-slate-400 mb-2">QUICK SAMPLE QUERIES:</div>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSqlQuery(sq.query);
                    handleExecute(sq.query);
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 rounded text-[11px] font-mono text-slate-300 transition-all flex items-center gap-1"
                >
                  <Play className="w-2.5 h-2.5 text-sky-400" />
                  <span>{sq.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor & Execute Button */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-sky-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>interactive_sql_shell &gt; robotic_arm_dms</span>
              </span>

              <button
                onClick={() => handleExecute()}
                disabled={executing}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg shadow transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{executing ? 'Executing Query...' : 'Run Query (F5)'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-sky-500 leading-relaxed tracking-wide"
              placeholder="Enter valid SELECT query..."
            />

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>MySQL Execution Error: {error}</span>
              </div>
            )}
          </div>

          {/* Results Table */}
          {queryResults && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300">
                  Returned: <strong className="text-white">{queryResults.rows.length} rows</strong>
                </span>
                {executionTime !== null && (
                  <span className="text-emerald-400 font-bold">Query time: {executionTime} ms</span>
                )}
              </div>

              <div className="overflow-x-auto max-h-[450px]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 sticky top-0 text-[10px] text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      {queryResults.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-3">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {queryResults.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        {queryResults.columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3 whitespace-nowrap">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schema Inspector Tab */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tables List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 md:col-span-1">
            <div className="text-[11px] font-mono text-slate-400 px-2 py-1 uppercase">
              Database Tables ({tables.length})
            </div>
            {tables.map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedTable === tbl
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{tbl}</span>
                <TableIcon className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>

          {/* Table Columns and Types */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:col-span-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-sky-400" />
                <span>Table Schema: robotic_arm_dms.{selectedTable}</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {tableSchema.length} defined fields
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-[10px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">Data Type</th>
                    <th className="py-2.5 px-3">Nullable</th>
                    <th className="py-2.5 px-3">Key Type</th>
                    <th className="py-2.5 px-3">Default Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {tableSchema.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-white">{col.Field}</td>
                      <td className="py-2.5 px-3 text-sky-400">{col.Type}</td>
                      <td className="py-2.5 px-3">{col.Null}</td>
                      <td className="py-2.5 px-3">
                        {col.Key === 'PRI' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            PRIMARY
                          </span>
                        ) : col.Key === 'MUL' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            FOREIGN
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{col.Default || 'NULL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ER Relational Model Tab */}
      {activeTab === 'er' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight">Entity-Relationship Architecture &amp; Referential Integrity</h3>
            <p className="text-xs text-slate-400 mt-1">
              Normalized relational structure (3NF) ensuring referential constraints across engineering assemblies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Engineer & Project */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-sky-400 border-b border-slate-800 pb-1">1. Engineer &amp; Project</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li><strong className="text-white">Engineer</strong> (<u>engineer_id</u>, username, email, role)</li>
                <li><strong className="text-white">Project</strong> (<u>project_id</u>, project_name, engineer_id [FK], client_name, budget)</li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                Cardinality: 1 Engineer ➔ M Projects
              </div>
            </div>

            {/* Robot & Component */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1">2. Robot Arm Assembly</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li><strong className="text-white">Robot</strong> (<u>robot_id</u>, project_id [FK], dof, payload, reach, budget)</li>
                <li><strong className="text-white">Robot_Component</strong> (<u>id</u>, robot_id [FK], component_id [FK], quantity, role_or_joint, unit_cost)</li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                Cardinality: M:N Junction via Robot_Component
              </div>
            </div>

            {/* Component & Subtypes */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-amber-400 border-b border-slate-800 pb-1">3. Component Hierarchy (ISA)</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li><strong className="text-white">Component</strong> (<u>component_id</u>, component_name, component_type, cost)</li>
                <li>Subtypes: <strong className="text-sky-300">Motor</strong>, <strong className="text-sky-300">Bearing</strong>, <strong className="text-sky-300">Material</strong>, <strong className="text-sky-300">Gripper</strong>, <strong className="text-sky-300">Sensor</strong>, <strong className="text-sky-300">Controller</strong></li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                Specialization / Generalization pattern
              </div>
            </div>

            {/* Design Version */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-purple-400 border-b border-slate-800 pb-1">4. Design Version Control</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li><strong className="text-white">Design_Version</strong> (<u>version_id</u>, robot_id [FK], version_number, changes_summary, total_cost)</li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                Audit trail tracking revisions &amp; cost delta
              </div>
            </div>

            {/* Testing */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-teal-400 border-b border-slate-800 pb-1">5. Validation Testing</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li><strong className="text-white">Test</strong> (<u>test_id</u>, robot_id [FK], test_type, expected_value, actual_value, status, remarks)</li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                Automated tolerance checking (PASS / FAIL)
              </div>
            </div>

            {/* Maintenance */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-rose-400 border-b border-slate-800 pb-1">6. Lifecycle Maintenance</div>
              <ul className="text-slate-300 space-y-1 text-[11px]">
                <li><strong className="text-white">Maintenance</strong> (<u>maintenance_id</u>, robot_id [FK], component_id [FK], maintenance_type, cost, next_due_date)</li>
              </ul>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                Preventative servicing &amp; operating cost logs
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
