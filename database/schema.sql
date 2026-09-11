-- ====================================================================
-- Robotic Arm Component Selection & Design Management System
-- Database: robotic_arm_dms
-- Engine: MySQL 8.0+ / Relational DBMS
-- ====================================================================

CREATE DATABASE IF NOT EXISTS robotic_arm_dms;
USE robotic_arm_dms;

-- Disable foreign key checks for clean re-creation if needed
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 1. Table: Engineer
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS Maintenance;
DROP TABLE IF EXISTS Test;
DROP TABLE IF EXISTS Robot_Component;
DROP TABLE IF EXISTS Component_Supplier;
DROP TABLE IF EXISTS Supplier;
DROP TABLE IF EXISTS Controller;
DROP TABLE IF EXISTS Sensor;
DROP TABLE IF EXISTS Gripper;
DROP TABLE IF EXISTS Material;
DROP TABLE IF EXISTS Bearing;
DROP TABLE IF EXISTS Motor;
DROP TABLE IF EXISTS Component;
DROP TABLE IF EXISTS Design_Version;
DROP TABLE IF EXISTS Robot;
DROP TABLE IF EXISTS Project;
DROP TABLE IF EXISTS Engineer;

CREATE TABLE Engineer (
    engineer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Robotics Design Engineer',
    department VARCHAR(100) DEFAULT 'Mechanical & Mechatronics R&D',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 2. Table: Project
-- --------------------------------------------------------------------
CREATE TABLE Project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    engineer_id INT NOT NULL,
    application VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE,
    status ENUM('Planning', 'Development', 'Testing', 'Completed', 'On Hold') DEFAULT 'Development',
    budget DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (engineer_id) REFERENCES Engineer(engineer_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 3. Table: Robot
-- --------------------------------------------------------------------
CREATE TABLE Robot (
    robot_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    robot_name VARCHAR(100) NOT NULL,
    robot_type VARCHAR(80) NOT NULL,       -- e.g., '6-DOF Articulated Arm', 'SCARA', 'Delta', 'Cartesian'
    payload DECIMAL(6, 2) NOT NULL,        -- in kg (e.g. 5.00 kg)
    reach DECIMAL(8, 2) NOT NULL,          -- in mm (e.g. 800.00 mm)
    dof INT NOT NULL,                      -- Degrees of Freedom (e.g. 6)
    application VARCHAR(100) NOT NULL,     -- e.g., 'Material Handling', 'Pick and Place', 'Welding'
    required_speed DECIMAL(6, 2),          -- in m/s or deg/s
    required_accuracy DECIMAL(6, 3),       -- in mm (e.g. 0.050 mm)
    budget DECIMAL(12, 2) NOT NULL,        -- in Currency (INR / ₹)
    calculated_torque DECIMAL(8, 2) DEFAULT NULL,
    status ENUM('Concept', 'Under Review', 'Verified', 'Fabricated') DEFAULT 'Under Review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 4. Table: Design_Version
-- --------------------------------------------------------------------
CREATE TABLE Design_Version (
    version_id INT AUTO_INCREMENT PRIMARY KEY,
    robot_id INT NOT NULL,
    version_number VARCHAR(20) NOT NULL,   -- e.g., '1.0', '2.0'
    description TEXT,
    changes_summary TEXT NOT NULL,
    status ENUM('Draft', 'Under Review', 'Approved', 'Archived') DEFAULT 'Under Review',
    designer_name VARCHAR(100) NOT NULL,
    total_cost DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (robot_id) REFERENCES Robot(robot_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 5. Table: Component (Parent polymorphic entity)
-- --------------------------------------------------------------------
CREATE TABLE Component (
    component_id INT AUTO_INCREMENT PRIMARY KEY,
    component_name VARCHAR(150) NOT NULL,
    component_type ENUM('Motor', 'Bearing', 'Material', 'Gripper', 'Sensor', 'Controller') NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model_number VARCHAR(80),
    specification TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    availability ENUM('Available', 'Low Stock', 'Out of Stock', 'Lead Time Required') DEFAULT 'Available',
    weight DECIMAL(8, 2),                  -- in kg
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 6. Table: Motor (Subtype of Component)
-- --------------------------------------------------------------------
CREATE TABLE Motor (
    motor_id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL UNIQUE,
    motor_type VARCHAR(50) NOT NULL,       -- 'AC Servo', 'BLDC', 'Stepper', 'Frameless Direct Drive'
    rated_torque DECIMAL(8, 2) NOT NULL,   -- in Nm
    peak_torque DECIMAL(8, 2) NOT NULL,    -- in Nm
    rpm INT NOT NULL,                      -- Revolutions per Minute
    power INT NOT NULL,                    -- in Watts
    voltage DECIMAL(6, 1) NOT NULL,        -- in Volts (e.g. 48.0V, 220.0V)
    shaft_diameter DECIMAL(6, 2),          -- in mm (for mechanical shaft coupling)
    encoder_type VARCHAR(50) DEFAULT 'Optical Incremental 2500 CPR',
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 7. Table: Bearing (Subtype of Component)
-- --------------------------------------------------------------------
CREATE TABLE Bearing (
    bearing_id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL UNIQUE,
    bearing_type VARCHAR(60) NOT NULL,     -- 'Deep Groove Ball', 'Crossed Roller', 'Angular Contact', 'Thin Section'
    bore_diameter DECIMAL(6, 2) NOT NULL,  -- in mm (Inner diameter)
    outer_diameter DECIMAL(6, 2) NOT NULL, -- in mm
    width DECIMAL(6, 2) NOT NULL,          -- in mm
    dynamic_load_rating DECIMAL(8, 2) NOT NULL, -- in kN
    static_load_rating DECIMAL(8, 2) NOT NULL,  -- in kN
    max_rpm INT NOT NULL,
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 8. Table: Material (Subtype of Component)
-- --------------------------------------------------------------------
CREATE TABLE Material (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL UNIQUE,
    material_name VARCHAR(80) NOT NULL,    -- 'Aluminium Alloy 6061-T6', 'Carbon Fiber Composite', 'Stainless Steel 304'
    density DECIMAL(6, 2) NOT NULL,        -- in g/cm³ (e.g. 2.70 for Al, 7.85 for Steel)
    yield_strength DECIMAL(8, 2) NOT NULL, -- in MPa
    tensile_strength DECIMAL(8, 2) NOT NULL, -- in MPa
    youngs_modulus DECIMAL(8, 2) NOT NULL, -- in GPa (e.g. 68.9 GPa for Al, 200 GPa for Steel)
    corrosion_resistance ENUM('Excellent', 'Good', 'Moderate', 'Poor') DEFAULT 'Good',
    machinability VARCHAR(50) DEFAULT 'High',
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 9. Table: Gripper (Subtype of Component)
-- --------------------------------------------------------------------
CREATE TABLE Gripper (
    gripper_id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL UNIQUE,
    gripper_type ENUM('Two Finger', 'Three Finger', 'Vacuum', 'Magnetic') NOT NULL,
    max_payload DECIMAL(6, 2) NOT NULL,    -- in kg
    stroke DECIMAL(6, 2) NOT NULL,         -- in mm
    grip_force DECIMAL(8, 2) NOT NULL,     -- in N
    actuation_type VARCHAR(50) DEFAULT 'Electric / Servo',
    weight DECIMAL(6, 2) NOT NULL,         -- in kg
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 10. Table: Sensor (Subtype of Component)
-- --------------------------------------------------------------------
CREATE TABLE Sensor (
    sensor_id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL UNIQUE,
    sensor_type ENUM('Proximity', 'Force', 'Position', 'Encoder', 'Temperature', 'Vision') NOT NULL,
    sensing_range VARCHAR(80) NOT NULL,    -- e.g., '0 - 8 mm', '0 - 100 N'
    accuracy VARCHAR(80) NOT NULL,         -- e.g., '±0.01 mm', '±0.5%'
    operating_voltage VARCHAR(40) NOT NULL,-- e.g., '12-24V DC', '5V DC'
    comm_protocol VARCHAR(60) NOT NULL,    -- 'IO-Link', 'CANopen', 'Analog 0-10V', 'I2C / SPI'
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 11. Table: Controller (Subtype of Component)
-- --------------------------------------------------------------------
CREATE TABLE Controller (
    controller_id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL UNIQUE,
    controller_model VARCHAR(80) NOT NULL, -- e.g., 'ESP32-WROOM-32D', 'Raspberry Pi 4', 'Siemens S7-1200 PLC'
    processor VARCHAR(100) NOT NULL,
    clock_speed VARCHAR(50) NOT NULL,      -- e.g. '240 MHz', '1.5 GHz'
    ram VARCHAR(50) NOT NULL,              -- e.g. '520 KB', '4 GB'
    gpio_count INT NOT NULL,
    comm_interfaces VARCHAR(120) NOT NULL, -- e.g. 'CAN, UART, SPI, I2C, Ethernet'
    supply_voltage VARCHAR(40) NOT NULL,
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 12. Table: Supplier
-- --------------------------------------------------------------------
CREATE TABLE Supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(120) NOT NULL,
    contact_email VARCHAR(120),
    phone VARCHAR(25),
    address VARCHAR(255),
    rating DECIMAL(3, 1) DEFAULT 4.5,
    lead_time_days INT DEFAULT 7
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 13. Table: Component_Supplier
-- --------------------------------------------------------------------
CREATE TABLE Component_Supplier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL,
    supplier_id INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    min_order_qty INT DEFAULT 1,
    supplier_sku VARCHAR(60),
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_comp_supp (component_id, supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 14. Table: Robot_Component (BOM - Bill of Materials)
-- --------------------------------------------------------------------
CREATE TABLE Robot_Component (
    id INT AUTO_INCREMENT PRIMARY KEY,
    robot_id INT NOT NULL,
    component_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    role_or_joint VARCHAR(80) DEFAULT 'Joint / Structure', -- e.g. 'Base Joint (J1)', 'Link 1 Material', 'End Effector'
    unit_cost DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (robot_id) REFERENCES Robot(robot_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 15. Table: Test
-- --------------------------------------------------------------------
CREATE TABLE Test (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    robot_id INT NOT NULL,
    test_type VARCHAR(60) NOT NULL,        -- 'Payload Test', 'Torque Test', 'Speed Test', 'Accuracy Test', 'Gripper Test'
    test_name VARCHAR(120) NOT NULL,
    expected_value DECIMAL(8, 2) NOT NULL,
    actual_value DECIMAL(8, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,             -- 'kg', 'Nm', 'm/s', 'mm', 'N'
    status ENUM('PASS', 'FAIL') NOT NULL,
    remarks TEXT,
    tested_by VARCHAR(100) NOT NULL,
    test_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (robot_id) REFERENCES Robot(robot_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 16. Table: Maintenance
-- --------------------------------------------------------------------
CREATE TABLE Maintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    robot_id INT NOT NULL,
    component_id INT,
    problem TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    technician VARCHAR(100) NOT NULL,
    maintenance_date DATE NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (robot_id) REFERENCES Robot(robot_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (component_id) REFERENCES Component(component_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- --------------------------------------------------------------------
CREATE INDEX idx_motor_torque ON Motor(rated_torque);
CREATE INDEX idx_motor_rpm ON Motor(rpm);
CREATE INDEX idx_bearing_bore ON Bearing(bore_diameter);
CREATE INDEX idx_component_type ON Component(component_type);
CREATE INDEX idx_component_cost ON Component(cost);
CREATE INDEX idx_robot_project ON Robot(project_id);
CREATE INDEX idx_rc_robot ON Robot_Component(robot_id);

-- --------------------------------------------------------------------
-- VIEWS
-- --------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_RobotDetailedSummary AS
SELECT 
    r.robot_id,
    r.robot_name,
    r.robot_type,
    r.payload,
    r.reach,
    r.dof,
    r.application,
    r.budget,
    r.calculated_torque,
    p.project_name,
    e.name AS lead_engineer,
    COALESCE(SUM(rc.quantity * rc.unit_cost), 0) AS total_bom_cost,
    COUNT(rc.id) AS total_components_allocated
FROM Robot r
JOIN Project p ON r.project_id = p.project_id
JOIN Engineer e ON p.engineer_id = e.engineer_id
LEFT JOIN Robot_Component rc ON r.robot_id = rc.robot_id
GROUP BY r.robot_id, r.robot_name, r.robot_type, r.payload, r.reach, r.dof, r.application, r.budget, r.calculated_torque, p.project_name, e.name;

-- --------------------------------------------------------------------
-- STORED PROCEDURES
-- --------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE sp_CalculateRobotCost(
    IN p_robot_id INT,
    OUT p_total_cost DECIMAL(12, 2)
)
BEGIN
    SELECT COALESCE(SUM(subtotal), 0.00)
    INTO p_total_cost
    FROM Robot_Component
    WHERE robot_id = p_robot_id;
END //

CREATE PROCEDURE sp_RecommendMotor(
    IN p_required_torque DECIMAL(8, 2),
    IN p_required_rpm INT
)
BEGIN
    SELECT 
        c.component_id,
        c.component_name,
        c.manufacturer,
        m.rated_torque,
        m.peak_torque,
        m.rpm,
        m.power,
        m.voltage,
        c.cost,
        c.availability,
        CASE 
            WHEN m.rated_torque >= p_required_torque THEN 'Suitable'
            ELSE 'Not Suitable'
        END AS suitability_status
    FROM Motor m
    JOIN Component c ON m.component_id = c.component_id
    ORDER BY 
        CASE WHEN m.rated_torque >= p_required_torque THEN 0 ELSE 1 END,
        (m.rated_torque - p_required_torque) ASC,
        c.cost ASC;
END //

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
