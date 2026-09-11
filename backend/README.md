# Robotic Arm Component Selection & Design Management System
## Backend Architecture & Execution Guide (Python / Flask / MySQL)

### 1. Overview
The backend provides high-performance RESTful APIs designed for mechanical and robotics engineers.
It integrates with MySQL database `robotic_arm_dms` to perform:
- Engineering static torque calculations ($T_{req} = m \cdot g \cdot L \cdot SF$)
- Database-driven component recommendation based on kinematic constraints
- Bill of Materials (BOM) cost estimation and variance analysis
- Multi-table CRUD on projects, robotic arms, components, suppliers, testing, and maintenance.

### 2. Setup & Installation

```bash
# 1. Clone/Navigate to backend directory
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install required Python packages
pip install -r requirements.txt

# 4. Import MySQL Database Schema & Sample Data
mysql -u root -p < ../database/schema.sql
mysql -u root -p robotic_arm_dms < ../database/sample_data.sql

# 5. Configure environment variables in .env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=robotic_arm_dms
SECRET_KEY=super_secret_robotics_key

# 6. Run the Flask REST API Server
python app.py
```
Server starts on `http://localhost:5000` with CORS enabled.
