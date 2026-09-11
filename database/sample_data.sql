-- ====================================================================
-- Robotic Arm Component Selection & Design Management System
-- Sample Data for database: robotic_arm_dms
-- ====================================================================

USE robotic_arm_dms;

-- 1. Engineers
INSERT INTO Engineer (engineer_id, name, email, password_hash, role, department, phone) VALUES
(1, 'Prof. R. V. Sharma', 'engineer@robotics.edu', 'pbkdf2:sha256:10000$mechdesign$c8f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5', 'Senior Robotics Engineer', 'Robotics & Automation Lab', '+91-9876543210'),
(2, 'Akhila Chikkala', 'akhilachikkala0@gmail.com', 'pbkdf2:sha256:10000$mechdesign$c8f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5', 'Lead Mechanical Design Engineer', 'R&D Mechatronics', '+91-9123456780'),
(3, 'Arun Kumar', 'arun.design@robotics.edu', 'pbkdf2:sha256:10000$mechdesign$c8f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5', 'Mechatronics Systems Engineer', 'Precision Engineering', '+91-9845012345');

-- 2. Projects
INSERT INTO Project (project_id, project_name, description, engineer_id, application, start_date, target_date, status, budget) VALUES
(1, 'Pick and Place Robotic Arm', 'High-speed 6-DOF industrial articulated robot for automated warehouse bin sorting and electronic parts transfer.', 1, 'Material Handling', '2026-01-15', '2026-06-30', 'Development', 80000.00),
(2, 'Precision Arc Welding Robot', 'Rigid articulated arm with high positional repeatability (±0.03mm) designed for automotive sheet metal MIG/TIG welding.', 2, 'Arc Welding', '2025-11-01', '2026-08-15', 'Testing', 150000.00),
(3, 'SCARA High-Speed Packaging Bot', '4-DOF selective compliance assembly robot arm for semiconductor wafer handling and PCB chip placement.', 1, 'Electronics Assembly', '2026-02-10', '2026-07-20', 'Planning', 65000.00);

-- 3. Robots
INSERT INTO Robot (robot_id, project_id, robot_name, robot_type, payload, reach, dof, application, required_speed, required_accuracy, budget, calculated_torque, status) VALUES
(1, 1, 'PickBot-01', '6-DOF Articulated Arm', 5.00, 800.00, 6, 'Material Handling', 1.20, 0.050, 80000.00, 58.86, 'Under Review'),
(2, 2, 'WeldMaster-6X', '6-DOF Heavy Duty Arm', 12.00, 1400.00, 6, 'Arc Welding', 0.80, 0.030, 150000.00, 176.58, 'Verified'),
(3, 3, 'ScaraFast-400', '4-DOF SCARA', 3.00, 500.00, 4, 'Electronics Assembly', 2.50, 0.015, 65000.00, 22.07, 'Concept');

-- 4. Components & Child Tables

-- Component 1: Motor A (30 Nm)
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(1, 'TechMotion AC Servo 30Nm', 'Motor', 'TechMotion Dynamics', 'TM-S30-3000', '30 Nm Rated, 3000 RPM, 400W, 48V DC with optical incremental encoder', 6200.00, 14, 'Available', 2.80);
INSERT INTO Motor (motor_id, component_id, motor_type, rated_torque, peak_torque, rpm, power, voltage, shaft_diameter, encoder_type) VALUES
(1, 1, 'AC Servo', 30.00, 75.00, 3000, 400, 48.0, 14.00, 'Optical 2500 CPR');

-- Component 2: Motor B (50 Nm)
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(2, 'KineticDrive BLDC 50Nm', 'Motor', 'KineticDrive Systems', 'KD-BL50-2500', '50 Nm Rated, 2500 RPM, 650W, 48V DC industrial grade brushless motor', 7800.00, 8, 'Available', 3.90);
INSERT INTO Motor (motor_id, component_id, motor_type, rated_torque, peak_torque, rpm, power, voltage, shaft_diameter, encoder_type) VALUES
(2, 2, 'BLDC Servo', 50.00, 120.00, 2500, 650, 48.0, 19.00, 'Magnetic Absolute 17-bit');

-- Component 3: Motor C (60 Nm) - EXACT REQUIRED SPEC
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(3, 'Servo Motor 60Nm', 'Motor', 'TechMotion', 'TM-60NM-750W', '60 Nm, 3000 RPM, 750 W AC Servo Motor, 48V DC, high torque density', 9000.00, 12, 'Available', 4.50);
INSERT INTO Motor (motor_id, component_id, motor_type, rated_torque, peak_torque, rpm, power, voltage, shaft_diameter, encoder_type) VALUES
(3, 3, 'AC Servo', 60.00, 150.00, 3000, 750, 48.0, 20.00, 'Optical Incremental 2500 CPR');

-- Component 4: Motor D (80 Nm)
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(4, 'RoboTorq Heavy Servo 80Nm', 'Motor', 'RoboTorq Precision', 'RT-80-3000', '80 Nm Rated, 3000 RPM, 1100W, 72V DC heavy payload articulated actuator', 12500.00, 5, 'Available', 6.20);
INSERT INTO Motor (motor_id, component_id, motor_type, rated_torque, peak_torque, rpm, power, voltage, shaft_diameter, encoder_type) VALUES
(4, 4, 'AC Servo', 80.00, 210.00, 3000, 1100, 72.0, 25.00, 'Optical Absolute 20-bit');

-- Component 5: Motor E (120 Nm) - for WeldMaster
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(5, 'MaxTorque Industrial Actuator 180Nm', 'Motor', 'MaxTorque Robotics', 'MT-180-2000', '180 Nm Rated, 2000 RPM, 2200W, 220V AC high rigidity robotic joint motor', 21000.00, 3, 'Available', 11.50);
INSERT INTO Motor (motor_id, component_id, motor_type, rated_torque, peak_torque, rpm, power, voltage, shaft_diameter, encoder_type) VALUES
(5, 5, 'AC Servo', 180.00, 450.00, 2000, 2200, 220.0, 35.00, 'Resolver 24-bit');

-- Component 6: Bearing 6204 Deep Groove Ball
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(6, 'SKF Deep Groove Ball Bearing 6204', 'Bearing', 'SKF Bearings', '6204-2RSH', 'Bore 20mm, OD 47mm, Width 14mm, Dynamic load 13.5 kN, Max 18,000 RPM', 850.00, 50, 'Available', 0.11);
INSERT INTO Bearing (bearing_id, component_id, bearing_type, bore_diameter, outer_diameter, width, dynamic_load_rating, static_load_rating, max_rpm) VALUES
(1, 6, 'Deep Groove Ball', 20.00, 47.00, 14.00, 13.50, 6.55, 18000);

-- Component 7: Bearing 6005
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(7, 'NSK Single Row Ball Bearing 6005', 'Bearing', 'NSK Precision', '6005-DDU', 'Bore 25mm, OD 47mm, Width 12mm, Dynamic load 10.1 kN, Max 15,000 RPM', 920.00, 35, 'Available', 0.08);
INSERT INTO Bearing (bearing_id, component_id, bearing_type, bore_diameter, outer_diameter, width, dynamic_load_rating, static_load_rating, max_rpm) VALUES
(2, 7, 'Deep Groove Ball', 25.00, 47.00, 12.00, 10.10, 5.85, 15000);

-- Component 8: Bearing Crossed Roller CRB-5013
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(8, 'THK High Rigidity Crossed Roller Bearing', 'Bearing', 'THK Japan', 'RB-5013-UU', 'Bore 50mm, OD 80mm, Width 13mm, High radial & moment load rating for robotic arm base joints', 4800.00, 18, 'Available', 0.29);
INSERT INTO Bearing (bearing_id, component_id, bearing_type, bore_diameter, outer_diameter, width, dynamic_load_rating, static_load_rating, max_rpm) VALUES
(3, 8, 'Crossed Roller', 50.00, 80.00, 13.00, 24.80, 38.20, 4500);

-- Component 9: Material - Aluminium Alloy 6061-T6
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(9, 'Aluminium Alloy 6061-T6 Link Billet', 'Material', 'Hindalco Aerospace', 'AL-6061-T6', 'Density 2.70 g/cm³, Yield Strength 276 MPa, Tensile 310 MPa, Youngs Modulus 68.9 GPa, Excellent CNC machinability', 3200.00, 40, 'Available', 4.50);
INSERT INTO Material (material_id, component_id, material_name, density, yield_strength, tensile_strength, youngs_modulus, corrosion_resistance, machinability) VALUES
(1, 9, 'Aluminium Alloy 6061-T6', 2.70, 276.00, 310.00, 68.90, 'Excellent', 'High');

-- Component 10: Material - Carbon Fiber Composite
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(10, 'Toray Carbon Fiber Composite Tubing', 'Material', 'Toray Composites', 'CFRP-T700', 'Density 1.55 g/cm³, Yield Strength 850 MPa, Tensile 1500 MPa, Youngs Modulus 135.0 GPa, Ultra light & stiff', 8500.00, 15, 'Available', 1.80);
INSERT INTO Material (material_id, component_id, material_name, density, yield_strength, tensile_strength, youngs_modulus, corrosion_resistance, machinability) VALUES
(2, 10, 'Carbon Fiber Composite', 1.55, 850.00, 1500.00, 135.00, 'Excellent', 'Moderate (Requires Diamond Tooling)');

-- Component 11: Material - Stainless Steel 304
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(11, 'Stainless Steel 304 High-Strength Base Plate', 'Material', 'Jindal Stainless', 'SS-304-ANN', 'Density 7.93 g/cm³, Yield Strength 215 MPa, Tensile 505 MPa, Youngs Modulus 193.0 GPa, Superior corrosion resistance', 2800.00, 25, 'Available', 9.20);
INSERT INTO Material (material_id, component_id, material_name, density, yield_strength, tensile_strength, youngs_modulus, corrosion_resistance, machinability) VALUES
(3, 11, 'Stainless Steel 304', 7.93, 215.00, 505.00, 193.00, 'Excellent', 'Moderate');

-- Component 12: Gripper - Two Finger Electric
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(12, 'Precision Two-Finger Electric Gripper', 'Gripper', 'Schunk Automations', 'EGP-40-N-N', 'Max payload 6.0 kg, Stroke 40 mm, Grip force 140 N, 24V DC stepper driven, parallel jaw', 6500.00, 10, 'Available', 0.75);
INSERT INTO Gripper (gripper_id, component_id, gripper_type, max_payload, stroke, grip_force, actuation_type, weight) VALUES
(1, 12, 'Two Finger', 6.00, 40.00, 140.00, 'Electric / Servo', 0.75);

-- Component 13: Gripper - Vacuum Suction Gripper
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(13, 'SMC Multi-Pad Vacuum Gripper Assembly', 'Gripper', 'SMC Corporation', 'ZPT-40-VAC', 'Max payload 10.0 kg, 4 suction cups with integrated venturi ejector, ideal for flat sheets and cartons', 4200.00, 16, 'Available', 0.55);
INSERT INTO Gripper (gripper_id, component_id, gripper_type, max_payload, stroke, grip_force, actuation_type, weight) VALUES
(2, 13, 'Vacuum', 10.00, 0.00, 220.00, 'Pneumatic Venturi Vacuum', 0.55);

-- Component 14: Gripper - Three Finger Adaptive
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(14, 'Robotiq 3-Finger Adaptive Robot Gripper', 'Gripper', 'Robotiq Inc', '3F-ADAPT-85', 'Max payload 12.0 kg, Encompassing grip force 300 N, articulated multi-mode gripping for complex geometry', 18500.00, 4, 'Available', 2.30);
INSERT INTO Gripper (gripper_id, component_id, gripper_type, max_payload, stroke, grip_force, actuation_type, weight) VALUES
(3, 14, 'Three Finger', 12.00, 85.00, 300.00, 'Articulated Multi-Servo', 2.30);

-- Component 15: Sensor - Inductive Proximity Sensor
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(15, 'Omron Inductive Proximity Sensor', 'Sensor', 'Omron Electronics', 'E2B-M12KS04-WP-B1', 'Range 0-4 mm, M12 cylindrical, PNP NO, 12-24V DC, IP67 waterproof, for joint homing and limit detection', 1200.00, 60, 'Available', 0.09);
INSERT INTO Sensor (sensor_id, component_id, sensor_type, sensing_range, accuracy, operating_voltage, comm_protocol) VALUES
(1, 15, 'Proximity', '0 - 4 mm', '±0.02 mm', '12-24V DC', 'Digital PNP/NPN');

-- Component 16: Sensor - 6-Axis Force Torque Sensor
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(16, 'ATI Mini40 6-Axis Force/Torque Sensor', 'Sensor', 'ATI Industrial Automation', 'MINI40-SI-40-2', 'Range Fx,Fy: 40N, Fz: 120N, Tx,Ty,Tz: 2 Nm, Strain gage silicon, CAN/Ethernet for collision detection & compliance', 22000.00, 3, 'Available', 0.22);
INSERT INTO Sensor (sensor_id, component_id, sensor_type, sensing_range, accuracy, operating_voltage, comm_protocol) VALUES
(2, 16, 'Force', '±120 N / ±2 Nm', '±0.1% F.S.', '24V DC', 'CANopen / EtherCAT');

-- Component 17: Sensor - Optical Joint Encoder
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(17, 'Renishaw Resolute Optical Rotary Encoder', 'Sensor', 'Renishaw UK', 'RES-26B-32BIT', '32-bit absolute resolution, ±1 arcsecond accuracy, BiSS-C interface, for precision joint position measurement', 8500.00, 18, 'Available', 0.12);
INSERT INTO Sensor (sensor_id, component_id, sensor_type, sensing_range, accuracy, operating_voltage, comm_protocol) VALUES
(3, 17, 'Encoder', '0 - 360 deg', '±1.0 arcsec', '5V DC', 'BiSS-C / SSI');

-- Component 18: Controller - ESP32-WROOM-32D
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(18, 'ESP32 Dual-Core Motion Controller', 'Controller', 'Espressif Systems', 'ESP32-WROOM-32D', 'Dual Tensilica Xtensa 240MHz, 520KB SRAM, Wi-Fi/Bluetooth, CAN, 36 GPIOs, low latency microsecond step generation', 650.00, 80, 'Available', 0.03);
INSERT INTO Controller (controller_id, component_id, controller_model, processor, clock_speed, ram, gpio_count, comm_interfaces, supply_voltage) VALUES
(1, 18, 'ESP32-WROOM-32D', 'Dual-core Xtensa 32-bit LX6', '240 MHz', '520 KB', 36, 'CAN, UART, SPI, I2C, Wi-Fi', '3.3V / 5V DC');

-- Component 19: Controller - Raspberry Pi 4 Model B
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(19, 'Raspberry Pi 4 Model B (4GB)', 'Controller', 'Raspberry Pi Foundation', 'RPI4-4GB', 'Broadcom BCM2711 Quad-core Cortex-A72 1.5GHz, 4GB LPDDR4, Gigabit Ethernet, dual micro-HDMI, ROS2 node host', 5500.00, 25, 'Available', 0.08);
INSERT INTO Controller (controller_id, component_id, controller_model, processor, clock_speed, ram, gpio_count, comm_interfaces, supply_voltage) VALUES
(2, 19, 'Raspberry Pi 4 Model B', 'Quad-core ARM Cortex-A72', '1.5 GHz', '4 GB', 40, 'Gigabit Ethernet, USB 3.0, I2C, SPI, UART', '5.1V / 3A DC');

-- Component 20: Controller - Siemens S7-1200 PLC
INSERT INTO Component (component_id, component_name, component_type, manufacturer, model_number, specification, cost, stock_quantity, availability, weight) VALUES
(20, 'Siemens Simatic S7-1200 Industrial PLC', 'Controller', 'Siemens AG', 'CPU 1214C DC/DC/DC', 'Profinet interface, 14 DI / 10 DO, 2 AI, industrial grade ruggedized motion controller for factory lines', 26000.00, 6, 'Available', 0.50);
INSERT INTO Controller (controller_id, component_id, controller_model, processor, clock_speed, ram, gpio_count, comm_interfaces, supply_voltage) VALUES
(3, 20, 'Siemens S7-1200 CPU 1214C', 'Industrial Siemens ASIC', '100 MHz', '100 KB Work Mem', 24, 'PROFINET, Industrial Ethernet, Modbus TCP', '24V DC');

-- 5. Suppliers
INSERT INTO Supplier (supplier_id, supplier_name, contact_email, phone, address, rating, lead_time_days) VALUES
(1, 'TechMotion Direct India', 'sales@techmotion.in', '+91-80-23456789', 'Peenya Industrial Area, Bangalore 560058', 4.8, 3),
(2, 'SKF Bearing Distributors Ltd', 'order@skfdist.com', '+91-22-67890123', 'MIDC Industrial Estate, Pune 411018', 4.9, 2),
(3, 'Schunk Automation Solutions', 'info@schunk.co.in', '+91-44-34567890', 'Guindy Industrial Estate, Chennai 600032', 4.7, 5),
(4, 'RoboStore Components Hub', 'support@robostore.in', '+91-11-45678901', 'Okhla Industrial Area, New Delhi 110020', 4.6, 4);

-- 6. Component Suppliers
INSERT INTO Component_Supplier (component_id, supplier_id, unit_price, min_order_qty, supplier_sku) VALUES
(3, 1, 9000.00, 1, 'SKU-TM-60NM'),
(6, 2, 850.00, 2, 'SKU-SKF-6204'),
(9, 4, 3200.00, 1, 'SKU-AL-6061'),
(12, 3, 6500.00, 1, 'SKU-SCHUNK-EGP40'),
(15, 4, 1200.00, 3, 'SKU-OMR-PRX12'),
(18, 4, 650.00, 1, 'SKU-ESP32-DEV');

-- 7. PickBot-01 Bill of Materials (Robot_Component)
-- Exactly matches demonstration scenario!
-- Servo Motor x 6 = 6 x 9,000 = 54,000
-- Bearing 6204 x 4 = 4 x 850 = 3,400
-- Aluminium Link x 3 = 3 x 3,200 = 9,600
-- Gripper x 1 = 1 x 6,500 = 6,500
-- Proximity Sensor x 3 = 3 x 1,200 = 3,600
-- Controller ESP32 x 1 = 1 x 650 = 650
-- Total BOM = ₹77,150 (Within ₹80,000 budget!)
INSERT INTO Robot_Component (id, robot_id, component_id, quantity, role_or_joint, unit_cost) VALUES
(1, 1, 3, 6, 'Joint Motors (J1-J6 Actuators)', 9000.00),
(2, 1, 6, 4, 'Joint Pivot Bearings (J1-J4)', 850.00),
(3, 1, 9, 3, 'Upper & Forearm Structural Links', 3200.00),
(4, 1, 12, 1, 'End-Effector Two-Finger Gripper', 6500.00),
(5, 1, 15, 3, 'Joint Homing & Limit Proximity Sensors', 1200.00),
(6, 1, 18, 1, 'Central Kinematics & Motion Controller', 650.00);

-- 8. Design Versions
INSERT INTO Design_Version (version_id, robot_id, version_number, description, changes_summary, status, designer_name, total_cost) VALUES
(1, 1, '1.0', 'Initial baseline mechanical and kinematic design for PickBot-01.', 'Initial baseline design with 6x 60Nm servo actuators, 6061-T6 links, and 2-finger electric gripper.', 'Approved', 'Prof. R. V. Sharma', 77150.00),
(2, 1, '2.0', 'High-payload upgrade evaluation with increased motor torque margin.', 'Upgraded J1 and J2 joint motors to 80Nm variant to handle 6.5kg dynamic peak inertia during rapid acceleration.', 'Draft', 'Akhila Chikkala', 84150.00);

-- 9. Tests
INSERT INTO Test (test_id, robot_id, test_type, test_name, expected_value, actual_value, unit, status, remarks, tested_by, test_date) VALUES
(1, 1, 'Payload Test', 'Static Full-Extension Payload Test (5.0 kg at 800 mm)', 5.00, 5.20, 'kg', 'PASS', 'Arm held 5.20 kg at full horizontal reach for 120s with zero joint sag (<0.02mm deflection).', 'Akhila Chikkala', '2026-03-01'),
(2, 1, 'Torque Test', 'Base Joint J1 Peak Static Torque Verification', 58.86, 60.10, 'Nm', 'PASS', 'Motor delivered required 58.86 Nm continuous holding torque with winding temperature staying at 42°C.', 'Prof. R. V. Sharma', '2026-03-02'),
(3, 1, 'Speed Test', 'End-Effector Linear Velocity at 100% duty', 1.20, 1.25, 'm/s', 'PASS', 'Maximum linear speed clocked 1.25 m/s across 500mm diagonal trajectory.', 'Arun Kumar', '2026-03-03'),
(4, 1, 'Accuracy Test', 'ISO 9283 Pose Repeatability Test (30 cycles)', 0.05, 0.042, 'mm', 'PASS', 'Repeatability measured using dial indicator clocked ±0.042 mm, beating required ±0.050 mm limit.', 'Akhila Chikkala', '2026-03-04'),
(5, 1, 'Gripper Test', 'Grip Force and Slip Detection with 5kg Aluminum Ingot', 140.00, 142.50, 'N', 'PASS', 'Electric jaws secured test workpiece firmly with zero slippage during 1.5G emergency stop.', 'Prof. R. V. Sharma', '2026-03-05');

-- 10. Maintenance
INSERT INTO Maintenance (maintenance_id, robot_id, component_id, problem, action_taken, technician, maintenance_date, cost, remarks) VALUES
(1, 1, 6, 'Slight vibration detected in J2 elbow bearing after 400 continuous test hours', 'Cleaned raceway and repacked with Mobil Polyrex EM synthetic grease. Bearing clearance checked within 5 microns.', 'S. Murthy', '2026-03-08', 450.00, 'Scheduled routine bearing service. No replacement needed.'),
(2, 1, 12, 'Silicone friction jaw pads on two-finger gripper showed surface wear', 'Replaced silicone grip pads with high-friction polyurethane vulcanized strips.', 'V. Deshmukh', '2026-03-09', 350.00, 'Grip retention restored to factory specification.');
