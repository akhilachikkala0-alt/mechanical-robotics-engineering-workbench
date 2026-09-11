export interface Engineer {
  engineer_id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  created_at?: string;
}

export interface Project {
  project_id: number;
  project_name: string;
  description: string;
  engineer_id: number;
  engineer_name?: string;
  application: string;
  start_date: string;
  target_date?: string;
  status: 'Planning' | 'Development' | 'Testing' | 'Completed' | 'On Hold';
  budget: number;
  created_at?: string;
}

export interface Robot {
  robot_id: number;
  project_id: number;
  project_name?: string;
  robot_name: string;
  robot_type: string;
  payload: number; // kg
  reach: number; // mm
  dof: number;
  application: string;
  required_speed: number;
  required_accuracy: number;
  budget: number;
  calculated_torque: number;
  status: 'Concept' | 'Under Review' | 'Verified' | 'Fabricated';
  estimated_cost?: number;
  created_at?: string;
}

export interface ComponentItem {
  component_id: number;
  component_name: string;
  component_type: 'Motor' | 'Bearing' | 'Material' | 'Gripper' | 'Sensor' | 'Controller';
  manufacturer: string;
  model_number?: string;
  specification: string;
  cost: number;
  stock_quantity: number;
  availability: 'Available' | 'Low Stock' | 'Out of Stock' | 'Lead Time Required';
  weight?: number;
  created_at?: string;
  // Subtype properties
  motor_type?: string;
  rated_torque?: number;
  peak_torque?: number;
  rpm?: number;
  power?: number;
  voltage?: number;
  shaft_diameter?: number;
  encoder_type?: string;
  bearing_type?: string;
  bore_diameter?: number;
  outer_diameter?: number;
  width?: number;
  dynamic_load_rating?: number;
  static_load_rating?: number;
  max_rpm?: number;
  material_name?: string;
  density?: number;
  yield_strength?: number;
  tensile_strength?: number;
  youngs_modulus?: number;
  corrosion_resistance?: string;
  machinability?: string;
  gripper_type?: string;
  max_payload?: number;
  stroke?: number;
  grip_force?: number;
  actuation_type?: string;
  sensor_type?: string;
  sensing_range?: string;
  accuracy?: string;
  controller_model?: string;
  processor?: string;
  clock_speed?: string;
  ram?: string;
  gpio_count?: number;
}

export interface RobotComponentAllocation {
  id: number;
  robot_id: number;
  component_id: number;
  quantity: number;
  role_or_joint: string;
  unit_cost: number;
  subtotal: number;
  component_name: string;
  component_type: string;
  manufacturer: string;
  specification: string;
}

export interface DesignVersion {
  version_id: number;
  robot_id: number;
  version_number: string;
  description: string;
  changes_summary: string;
  status: string;
  designer_name: string;
  total_cost: number;
  created_at: string;
}

export interface TestRecord {
  test_id: number;
  robot_id: number;
  test_type: string;
  test_name: string;
  expected_value: number;
  actual_value: number;
  unit: string;
  status: 'PASS' | 'FAIL';
  remarks: string;
  tested_by: string;
  test_date: string;
}

export interface MaintenanceRecord {
  maintenance_id: number;
  robot_id: number;
  component_id?: number;
  component_name?: string;
  maintenance_type?: string;
  description?: string;
  problem?: string;
  action_taken?: string;
  technician: string;
  maintenance_date: string;
  next_due_date?: string;
  cost: number;
  status?: string;
  remarks?: string;
}

export interface TorqueCalculationResult {
  inputs: {
    payload_kg: number;
    arm_length_m: number;
    arm_length_mm: number;
    gravity_m_s2: number;
    safety_factor: number;
  };
  formulas: {
    force: string;
    basic_torque: string;
    required_torque: string;
  };
  calculation_steps: {
    step_1: string;
    step_2: string;
    step_3: string;
  };
  results: {
    force_n: number;
    basic_torque_nm: number;
    required_torque_nm: number;
  };
  disclaimer: string;
}

export interface SqlQueryLog {
  id: string;
  sql: string;
  params?: any[];
  timestamp: string;
  durationMs: number;
  rowCount: number;
}
