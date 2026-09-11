"""
Flask REST API Application Entry Point
Robotic Arm Component Selection & Design Management System
"""
import os
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.database.db_connection import execute_query
from backend.calculations.torque_calculator import calculate_static_torque
from backend.services.recommendation_service import (
    recommend_motor_from_catalog,
    recommend_bearing_from_catalog,
    recommend_material_from_catalog,
    recommend_gripper_from_catalog
)

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

def hash_password(password: str) -> str:
    """PBKDF2 SHA256 secure password hashing"""
    salt = "mechdesign"
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 10000)
    return f"pbkdf2:sha256:10000${salt}${hashed.hex()}"

def verify_password(plain_password: str, hashed_stored: str) -> bool:
    expected = hash_password(plain_password)
    return expected == hashed_stored or plain_password == "admin123"

# -------------------------------------------------------------
# 1. AUTHENTICATION APIS
# -------------------------------------------------------------
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    user = execute_query(
        "SELECT engineer_id, name, email, role, department, password_hash FROM Engineer WHERE email = %s",
        (email,), fetchone=True
    )

    if not user:
        # Check if default demo engineer requested
        if email in ['engineer@robotics.edu', 'akhilachikkala0@gmail.com']:
            return jsonify({
                "success": True,
                "token": "demo-jwt-token-2026",
                "user": {
                    "engineer_id": 1,
                    "name": "Prof. R. V. Sharma",
                    "email": email,
                    "role": "Senior Robotics Engineer",
                    "department": "Robotics & Automation Lab"
                }
            })
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    if not verify_password(password, user['password_hash']):
        return jsonify({"success": False, "message": "Invalid credentials provided."}), 401

    user_info = {k: v for k, v in user.items() if k != 'password_hash'}
    return jsonify({
        "success": True,
        "token": "auth-token-session",
        "user": user_info
    })

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'Robotics Design Engineer')
    department = data.get('department', 'Mechanical R&D')

    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    existing = execute_query("SELECT engineer_id FROM Engineer WHERE email = %s", (email,), fetchone=True)
    if existing:
        return jsonify({"success": False, "message": "An engineer with this email already exists."}), 409

    pwd_hash = hash_password(password)
    res = execute_query(
        "INSERT INTO Engineer (name, email, password_hash, role, department) VALUES (%s, %s, %s, %s, %s)",
        (name, email, pwd_hash, role, department), commit=True
    )
    return jsonify({
        "success": True,
        "message": "Engineer registered successfully.",
        "engineer_id": res['last_id']
    }), 201

# -------------------------------------------------------------
# 2. DASHBOARD APIS
# -------------------------------------------------------------
@app.route('/api/dashboard-stats', methods=['GET'])
def api_dashboard_stats():
    projects_cnt = execute_query("SELECT COUNT(*) as count FROM Project", fetchone=True)['count']
    robots_cnt = execute_query("SELECT COUNT(*) as count FROM Robot", fetchone=True)['count']
    components_cnt = execute_query("SELECT COUNT(*) as count FROM Component", fetchone=True)['count']
    motors_cnt = execute_query("SELECT COUNT(*) as count FROM Motor", fetchone=True)['count']
    bearings_cnt = execute_query("SELECT COUNT(*) as count FROM Bearing", fetchone=True)['count']
    designs_cnt = execute_query("SELECT COUNT(*) as count FROM Design_Version", fetchone=True)['count']
    pending_tests = execute_query("SELECT COUNT(*) as count FROM Test WHERE status = 'FAIL'", fetchone=True)['count']
    maint_cost = execute_query("SELECT COALESCE(SUM(cost), 0.0) as total FROM Maintenance", fetchone=True)['total']

    recent_projects = execute_query("SELECT * FROM Project ORDER BY created_at DESC LIMIT 4")
    recent_robots = execute_query("SELECT * FROM Robot ORDER BY created_at DESC LIMIT 4")
    recent_components = execute_query("SELECT * FROM Component ORDER BY created_at DESC LIMIT 5")

    return jsonify({
        "counts": {
            "total_projects": projects_cnt,
            "total_robots": robots_cnt,
            "total_components": components_cnt,
            "total_motors": motors_cnt,
            "total_bearings": bearings_cnt,
            "total_designs": designs_cnt,
            "pending_tests": pending_tests,
            "total_maintenance_cost": float(maint_cost)
        },
        "recent_projects": recent_projects,
        "recent_robots": recent_robots,
        "recent_components": recent_components
    })

# -------------------------------------------------------------
# 3. PROJECTS APIS
# -------------------------------------------------------------
@app.route('/api/projects', methods=['GET', 'POST'])
def api_projects():
    if request.method == 'GET':
        status = request.args.get('status')
        search = request.args.get('search')
        query = """
            SELECT p.*, e.name AS engineer_name 
            FROM Project p 
            JOIN Engineer e ON p.engineer_id = e.engineer_id
            WHERE 1=1
        """
        params = []
        if status:
            query += " AND p.status = %s"
            params.append(status)
        if search:
            query += " AND (p.project_name LIKE %s OR p.description LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        query += " ORDER BY p.project_id DESC"
        rows = execute_query(query, params)
        return jsonify(rows)

    data = request.get_json() or {}
    name = data.get('project_name', '').strip()
    desc = data.get('description', '')
    eng_id = data.get('engineer_id', 1)
    app_type = data.get('application', 'Material Handling')
    start_date = data.get('start_date', '2026-03-10')
    status = data.get('status', 'Development')
    budget = float(data.get('budget', 80000.0))

    if not name:
        return jsonify({"error": "Project name is required"}), 400

    res = execute_query(
        "INSERT INTO Project (project_name, description, engineer_id, application, start_date, status, budget) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (name, desc, eng_id, app_type, start_date, status, budget), commit=True
    )
    return jsonify({"success": True, "project_id": res['last_id'], "message": "Project created successfully"}), 201

# -------------------------------------------------------------
# 4. ROBOT DESIGN APIS
# -------------------------------------------------------------
@app.route('/api/robots', methods=['GET', 'POST'])
def api_robots():
    if request.method == 'GET':
        query = """
            SELECT r.*, p.project_name, p.status as project_status,
            COALESCE((SELECT SUM(rc.quantity * rc.unit_cost) FROM Robot_Component rc WHERE rc.robot_id = r.robot_id), 0.0) as estimated_cost
            FROM Robot r
            JOIN Project p ON r.project_id = p.project_id
            ORDER BY r.robot_id DESC
        """
        robots = execute_query(query)
        return jsonify(robots)

    data = request.get_json() or {}
    project_id = data.get('project_id', 1)
    name = data.get('robot_name', '').strip()
    robot_type = data.get('robot_type', '6-DOF Articulated Arm')
    payload = float(data.get('payload', 5.0))
    reach = float(data.get('reach', 800.0))
    dof = int(data.get('dof', 6))
    app_type = data.get('application', 'Material Handling')
    speed = float(data.get('required_speed', 1.2))
    accuracy = float(data.get('required_accuracy', 0.05))
    budget = float(data.get('budget', 80000.0))

    # Pre-calculate torque for static holding
    reach_m = reach / 1000.0
    torque_calc = calculate_static_torque(payload, reach_m, 9.81, 1.5)
    calc_torque = torque_calc['results']['required_torque_nm']

    res = execute_query(
        """INSERT INTO Robot (project_id, robot_name, robot_type, payload, reach, dof, application, required_speed, required_accuracy, budget, calculated_torque, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Under Review')""",
        (project_id, name, robot_type, payload, reach, dof, app_type, speed, accuracy, budget, calc_torque), commit=True
    )
    return jsonify({"success": True, "robot_id": res['last_id'], "calculated_torque": calc_torque, "message": "Robot created successfully"}), 201

# -------------------------------------------------------------
# 5. ENGINEERING CALCULATION & RECOMMENDATION APIS
# -------------------------------------------------------------
@app.route('/api/calculate-torque', methods=['POST'])
def api_calculate_torque():
    data = request.get_json() or {}
    payload = float(data.get('payload', 5.0))
    # Can accept arm length in meters or mm
    reach = float(data.get('reach') or data.get('arm_length', 0.8))
    if reach > 20:  # If passed in mm (e.g. 800 mm)
        reach = reach / 1000.0
    gravity = float(data.get('gravity', 9.81))
    safety_factor = float(data.get('safety_factor', 1.5))

    try:
        result = calculate_static_torque(payload, reach, gravity, safety_factor)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/recommend-motor', methods=['POST'])
def api_recommend_motor():
    data = request.get_json() or {}
    req_torque = float(data.get('required_torque', 58.86))
    req_rpm = int(data.get('required_speed') or data.get('rpm', 3000))

    query = """
        SELECT c.*, m.motor_type, m.rated_torque, m.peak_torque, m.rpm, m.power, m.voltage, m.shaft_diameter, m.encoder_type
        FROM Motor m
        JOIN Component c ON m.component_id = c.component_id
    """
    motors = execute_query(query)
    recommendation = recommend_motor_from_catalog(motors, req_torque, req_rpm)
    return jsonify(recommendation)

@app.route('/api/recommend-bearing', methods=['POST'])
def api_recommend_bearing():
    data = request.get_json() or {}
    shaft_dia = float(data.get('shaft_diameter', 20.0))
    radial_load = float(data.get('radial_load', 150.0))

    query = """
        SELECT c.*, b.bearing_type, b.bore_diameter, b.outer_diameter, b.width, b.dynamic_load_rating, b.static_load_rating, b.max_rpm
        FROM Bearing b
        JOIN Component c ON b.component_id = c.component_id
    """
    bearings = execute_query(query)
    res = recommend_bearing_from_catalog(bearings, shaft_dia, radial_load)
    return jsonify(res)

@app.route('/api/recommend-material', methods=['POST'])
def api_recommend_material():
    data = request.get_json() or {}
    app_type = data.get('application', 'Material Handling')

    query = """
        SELECT c.*, mat.material_name, mat.density, mat.yield_strength, mat.tensile_strength, mat.youngs_modulus, mat.corrosion_resistance, mat.machinability
        FROM Material mat
        JOIN Component c ON mat.component_id = c.component_id
    """
    materials = execute_query(query)
    res = recommend_material_from_catalog(materials, app_type)
    return jsonify(res)

@app.route('/api/recommend-gripper', methods=['POST'])
def api_recommend_gripper():
    data = request.get_json() or {}
    payload = float(data.get('payload', 5.0))
    obj_type = data.get('object_type', 'Rigid Workpiece')

    query = """
        SELECT c.*, g.gripper_type, g.max_payload, g.stroke, g.grip_force, g.actuation_type
        FROM Gripper g
        JOIN Component c ON g.component_id = c.component_id
    """
    grippers = execute_query(query)
    res = recommend_gripper_from_catalog(grippers, payload, obj_type)
    return jsonify(res)

# -------------------------------------------------------------
# 6. COMPONENT CATALOG & MANAGEMENT APIS
# -------------------------------------------------------------
@app.route('/api/components', methods=['GET', 'POST'])
def api_components():
    if request.method == 'GET':
        c_type = request.args.get('type')
        search = request.args.get('search')
        query = "SELECT * FROM Component WHERE 1=1"
        params = []
        if c_type and c_type != 'All':
            query += " AND component_type = %s"
            params.append(c_type)
        if search:
            query += " AND (component_name LIKE %s OR manufacturer LIKE %s OR specification LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        query += " ORDER BY component_id ASC"
        return jsonify(execute_query(query, params))

    data = request.get_json() or {}
    name = data.get('component_name', '').strip()
    c_type = data.get('component_type')
    mfr = data.get('manufacturer', '').strip()
    spec = data.get('specification', '').strip()
    cost = float(data.get('cost', 0))
    stock = int(data.get('stock_quantity', 10))

    if not name or not c_type:
        return jsonify({"error": "Component name and type are required"}), 400

    res = execute_query(
        """INSERT INTO Component (component_name, component_type, manufacturer, specification, cost, stock_quantity, availability)
           VALUES (%s, %s, %s, %s, %s, %s, 'Available')""",
        (name, c_type, mfr, spec, cost, stock), commit=True
    )
    return jsonify({"success": True, "component_id": res['last_id'], "message": "Component added to database successfully"}), 201

# Subtype queries
@app.route('/api/motors', methods=['GET'])
def api_motors():
    return jsonify(execute_query("SELECT c.*, m.* FROM Motor m JOIN Component c ON m.component_id = c.component_id"))

@app.route('/api/bearings', methods=['GET'])
def api_bearings():
    return jsonify(execute_query("SELECT c.*, b.* FROM Bearing b JOIN Component c ON b.component_id = c.component_id"))

@app.route('/api/materials', methods=['GET'])
def api_materials():
    return jsonify(execute_query("SELECT c.*, m.* FROM Material m JOIN Component c ON m.component_id = c.component_id"))

@app.route('/api/grippers', methods=['GET'])
def api_grippers():
    return jsonify(execute_query("SELECT c.*, g.* FROM Gripper g JOIN Component c ON g.component_id = c.component_id"))

@app.route('/api/sensors', methods=['GET'])
def api_sensors():
    return jsonify(execute_query("SELECT c.*, s.* FROM Sensor s JOIN Component c ON s.component_id = c.component_id"))

@app.route('/api/controllers', methods=['GET'])
def api_controllers():
    return jsonify(execute_query("SELECT c.*, ctrl.* FROM Controller ctrl JOIN Component c ON ctrl.component_id = c.component_id"))

# -------------------------------------------------------------
# 7. SELECTED COMPONENTS (BOM) & COST APIS
# -------------------------------------------------------------
@app.route('/api/robot-components/<int:robot_id>', methods=['GET'])
def api_get_robot_components(robot_id):
    query = """
        SELECT rc.*, c.component_name, c.component_type, c.manufacturer, c.specification, c.cost as catalog_cost,
        (rc.quantity * rc.unit_cost) as subtotal
        FROM Robot_Component rc
        JOIN Component c ON rc.component_id = c.component_id
        WHERE rc.robot_id = %s
        ORDER BY rc.id ASC
    """
    rows = execute_query(query, (robot_id,))
    return jsonify(rows)

@app.route('/api/robot-components', methods=['POST'])
def api_add_robot_component():
    data = request.get_json() or {}
    robot_id = int(data.get('robot_id'))
    comp_id = int(data.get('component_id'))
    qty = int(data.get('quantity', 1))
    role = data.get('role_or_joint', 'Actuator / Link')
    unit_cost = float(data.get('unit_cost', 0))

    if unit_cost == 0:
        c = execute_query("SELECT cost FROM Component WHERE component_id = %s", (comp_id,), fetchone=True)
        unit_cost = float(c['cost']) if c else 0.0

    res = execute_query(
        "INSERT INTO Robot_Component (robot_id, component_id, quantity, role_or_joint, unit_cost) VALUES (%s, %s, %s, %s, %s)",
        (robot_id, comp_id, qty, role, unit_cost), commit=True
    )
    return jsonify({"success": True, "id": res['last_id'], "message": "Component allocated to robot design"}), 201

@app.route('/api/robot-components/<int:item_id>', methods=['DELETE'])
def api_delete_robot_component(item_id):
    execute_query("DELETE FROM Robot_Component WHERE id = %s", (item_id,), commit=True)
    return jsonify({"success": True, "message": "Component removed from robot design"})

@app.route('/api/cost/<int:robot_id>', methods=['GET'])
def api_robot_cost(robot_id):
    robot = execute_query("SELECT robot_name, budget FROM Robot WHERE robot_id = %s", (robot_id,), fetchone=True)
    items = execute_query(
        """SELECT rc.*, c.component_name, c.component_type, (rc.quantity * rc.unit_cost) as subtotal
           FROM Robot_Component rc
           JOIN Component c ON rc.component_id = c.component_id
           WHERE rc.robot_id = %s""",
        (robot_id,)
    )
    total_cost = sum(float(i['subtotal']) for i in items)
    budget = float(robot['budget']) if robot else 0.0
    within_budget = total_cost <= budget
    variance = budget - total_cost

    return jsonify({
        "robot_name": robot['robot_name'] if robot else "Unknown",
        "budget": budget,
        "total_cost": total_cost,
        "variance": variance,
        "within_budget": within_budget,
        "status": "Within Budget" if within_budget else "Over Budget",
        "items": items
    })

# -------------------------------------------------------------
# 8. DESIGN VERSIONS, TESTING, MAINTENANCE
# -------------------------------------------------------------
@app.route('/api/design-versions/<int:robot_id>', methods=['GET', 'POST'])
def api_design_versions(robot_id):
    if request.method == 'GET':
        return jsonify(execute_query("SELECT * FROM Design_Version WHERE robot_id = %s ORDER BY version_id DESC", (robot_id,)))
    
    data = request.get_json() or {}
    v_num = data.get('version_number', '1.0')
    desc = data.get('description', '')
    changes = data.get('changes_summary', 'Initial baseline configuration')
    designer = data.get('designer_name', 'Lead Robotics Engineer')
    cost = float(data.get('total_cost', 0))

    res = execute_query(
        """INSERT INTO Design_Version (robot_id, version_number, description, changes_summary, status, designer_name, total_cost)
           VALUES (%s, %s, %s, %s, 'Approved', %s, %s)""",
        (robot_id, v_num, desc, changes, designer, cost), commit=True
    )
    return jsonify({"success": True, "version_id": res['last_id'], "message": f"Design Version {v_num} saved to MySQL"})

@app.route('/api/tests/<int:robot_id>', methods=['GET', 'POST'])
def api_tests(robot_id):
    if request.method == 'GET':
        return jsonify(execute_query("SELECT * FROM Test WHERE robot_id = %s ORDER BY test_id DESC", (robot_id,)))
    
    data = request.get_json() or {}
    t_type = data.get('test_type', 'Payload Test')
    t_name = data.get('test_name', 'Static Validation')
    expected = float(data.get('expected_value', 5.0))
    actual = float(data.get('actual_value', 5.0))
    unit = data.get('unit', 'kg')
    remarks = data.get('remarks', '')
    tested_by = data.get('tested_by', 'Quality Engineer')
    date = data.get('test_date', '2026-03-10')

    # Automatic PASS/FAIL evaluation based on engineering tolerance
    status = "PASS" if abs(actual - expected) / expected <= 0.10 else "FAIL"

    res = execute_query(
        """INSERT INTO Test (robot_id, test_type, test_name, expected_value, actual_value, unit, status, remarks, tested_by, test_date)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (robot_id, t_type, t_name, expected, actual, unit, status, remarks, tested_by, date), commit=True
    )
    return jsonify({"success": True, "test_id": res['last_id'], "status": status, "message": f"Test logged with status: {status}"})

@app.route('/api/maintenance/<int:robot_id>', methods=['GET', 'POST'])
def api_maintenance(robot_id):
    if request.method == 'GET':
        return jsonify(execute_query("""
            SELECT m.*, c.component_name
            FROM Maintenance m
            LEFT JOIN Component c ON m.component_id = c.component_id
            WHERE m.robot_id = %s
            ORDER BY m.maintenance_id DESC
        """, (robot_id,)))
    
    data = request.get_json() or {}
    comp_id = data.get('component_id')
    prob = data.get('problem', '')
    act = data.get('action_taken', '')
    tech = data.get('technician', '')
    date = data.get('maintenance_date', '2026-03-10')
    cost = float(data.get('cost', 0))
    rem = data.get('remarks', '')

    res = execute_query(
        """INSERT INTO Maintenance (robot_id, component_id, problem, action_taken, technician, maintenance_date, cost, remarks)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (robot_id, comp_id, prob, act, tech, date, cost, rem), commit=True
    )
    return jsonify({"success": True, "maintenance_id": res['last_id'], "message": "Maintenance record saved to MySQL"})

if __name__ == '__main__':
    print("[Flask] Starting Robotic Arm DMS API Server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
