import {
  Engineer,
  Project,
  Robot,
  ComponentItem,
  RobotComponentAllocation,
  DesignVersion,
  TestRecord,
  MaintenanceRecord,
  TorqueCalculationResult,
  SqlQueryLog
} from '../types';

const BASE_URL = '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data.error || data.message) errorMsg = data.error || data.message;
    } catch {
      // Ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchJson<{ success: boolean; token: string; user: any }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (payload: any) =>
    fetchJson<{ success: boolean; message: string; engineer_id: number }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getEngineers: () => fetchJson<Engineer[]>('/api/engineers'),

  // Dashboard
  getDashboardStats: () =>
    fetchJson<{
      counts: {
        total_projects: number;
        total_robots: number;
        total_components: number;
        total_motors: number;
        total_bearings: number;
        total_designs: number;
        pending_tests: number;
        total_maintenance_cost: number;
      };
      recent_projects: Project[];
      recent_robots: Robot[];
      recent_components: ComponentItem[];
    }>('/api/dashboard-stats'),

  // Projects
  getProjects: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return fetchJson<Project[]>(`/api/projects?${query.toString()}`);
  },

  createProject: (project: Partial<Project>) =>
    fetchJson<{ success: boolean; project_id: number; message: string }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    }),

  deleteProject: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/projects/${id}`, {
      method: 'DELETE'
    }),

  // Robots
  getRobots: () => fetchJson<Robot[]>('/api/robots'),

  createRobot: (robot: Partial<Robot>) =>
    fetchJson<{ success: boolean; robot_id: number; calculated_torque: number; message: string }>('/api/robots', {
      method: 'POST',
      body: JSON.stringify(robot)
    }),

  // Calculations & Recommendations
  calculateTorque: (params: { payload: number; reach: number; gravity?: number; safety_factor?: number }) =>
    fetchJson<TorqueCalculationResult>('/api/calculate-torque', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  recommendMotor: (params: { required_torque: number; speed?: number }) =>
    fetchJson<{
      required_torque: number;
      all_motors: (ComponentItem & { is_suitable: boolean; suitability_status: string; margin_nm: number; margin_pct: number; reason: string })[];
      recommended_motor: ComponentItem | null;
      recommendation_reason: string;
    }>('/api/recommend-motor', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  recommendBearing: (params: { shaft_diameter: number; radial_load?: number }) =>
    fetchJson<{
      shaft_diameter: number;
      all_bearings: (ComponentItem & { is_compatible: boolean; suitability_status: string; reason: string })[];
      recommended_bearing: ComponentItem | null;
      recommendation_reason: string;
    }>('/api/recommend-bearing', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  recommendMaterial: (params?: { application?: string }) =>
    fetchJson<{
      all_materials: (ComponentItem & { specific_strength: number; is_recommended: boolean; reason: string })[];
      recommended_material: ComponentItem | null;
      recommendation_reason: string;
    }>('/api/recommend-material', {
      method: 'POST',
      body: JSON.stringify(params || {})
    }),

  recommendGripper: (params: { payload: number; object_type?: string }) =>
    fetchJson<{
      payload: number;
      all_grippers: (ComponentItem & { is_suitable: boolean; suitability_status: string; reason: string })[];
      recommended_gripper: ComponentItem | null;
      recommendation_reason: string;
    }>('/api/recommend-gripper', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  checkCompatibility: (params: { robot_id?: number; motor_id?: number; bearing_id?: number; payload?: number; reach?: number }) =>
    fetchJson<{
      overall_status: 'Compatible' | 'Not Compatible' | 'Requires Review';
      required_torque: number;
      checks: {
        parameter: string;
        expected: string;
        actual: string;
        status: 'Compatible' | 'Not Compatible' | 'Requires Review';
        reason: string;
      }[];
    }>('/api/check-compatibility', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  // Components Catalog
  getComponents: (params?: { type?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'All') query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    return fetchJson<ComponentItem[]>(`/api/components?${query.toString()}`);
  },

  createComponent: (component: Partial<ComponentItem>) =>
    fetchJson<{ success: boolean; component_id: number; message: string }>('/api/components', {
      method: 'POST',
      body: JSON.stringify(component)
    }),

  deleteComponent: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/components/${id}`, {
      method: 'DELETE'
    }),

  getMotors: () => fetchJson<ComponentItem[]>('/api/motors'),
  getBearings: () => fetchJson<ComponentItem[]>('/api/bearings'),
  getMaterials: () => fetchJson<ComponentItem[]>('/api/materials'),
  getGrippers: () => fetchJson<ComponentItem[]>('/api/grippers'),
  getSensors: () => fetchJson<ComponentItem[]>('/api/sensors'),
  getControllers: () => fetchJson<ComponentItem[]>('/api/controllers'),

  // Selected Components (BOM)
  getRobotComponents: (robotId: number) => fetchJson<RobotComponentAllocation[]>(`/api/robot-components/${robotId}`),

  addRobotComponent: (payload: { robot_id: number; component_id: number; quantity?: number; role_or_joint?: string; unit_cost?: number }) =>
    fetchJson<{ success: boolean; message: string }>('/api/robot-components', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateRobotComponentQty: (id: number, quantity: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/robot-components/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),

  deleteRobotComponent: (id: number) =>
    fetchJson<{ success: boolean; message: string }>(`/api/robot-components/${id}`, {
      method: 'DELETE'
    }),

  // Cost Estimation
  getRobotCost: (robotId: number) =>
    fetchJson<{
      robot_name: string;
      budget: number;
      total_cost: number;
      variance: number;
      within_budget: boolean;
      status: string;
      recommendation: string;
      items: any[];
    }>(`/api/cost/${robotId}`),

  // Design Versions
  getDesignVersions: (robotId: number) => fetchJson<DesignVersion[]>(`/api/design-versions/${robotId}`),

  createDesignVersion: (payload: Partial<DesignVersion>) =>
    fetchJson<{ success: boolean; version_id: number; message: string }>('/api/design-versions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Testing
  getTests: (robotId: number) => fetchJson<TestRecord[]>(`/api/tests/${robotId}`),

  createTest: (payload: Partial<TestRecord>) =>
    fetchJson<{ success: boolean; test_id: number; status: 'PASS' | 'FAIL'; message: string }>('/api/tests', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Maintenance
  getMaintenance: async (robotId: number): Promise<MaintenanceRecord[]> => {
    const res = await fetchJson<any>(`/api/maintenance/${robotId}`);
    return Array.isArray(res) ? res : res.records || [];
  },

  createMaintenance: (payload: Partial<MaintenanceRecord>) =>
    fetchJson<{ success: boolean; maintenance_id: number; message: string }>('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // DBMS Inspector & SQL Studio
  getDbSchema: () =>
    fetchJson<{
      database_name: string;
      engine: string;
      tables: string[];
      table_details: Record<string, any[]>;
    }>('/api/db/schema'),

  getDbTables: async (): Promise<string[]> => {
    const schema = await api.getDbSchema();
    return schema.tables || [];
  },

  getTableSchema: async (tableName: string): Promise<any[]> => {
    const schema = await api.getDbSchema();
    return schema.table_details[tableName] || [];
  },

  executeRawQuery: async (sql: string): Promise<{ columns: string[]; rows: any[]; execution_time_ms: number }> => {
    const res = await api.executeSql(sql);
    if (res.error) throw new Error(res.error);
    const rows = res.rows || [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { columns, rows, execution_time_ms: 3 };
  },

  getSqlLogs: () => fetchJson<SqlQueryLog[]>('/api/db/query-logs'),

  executeSql: (sql: string) =>
    fetchJson<{ success: boolean; rowCount?: number; rows?: any[]; changes?: number; error?: string }>('/api/db/execute-sql', {
      method: 'POST',
      body: JSON.stringify({ sql })
    })
};
