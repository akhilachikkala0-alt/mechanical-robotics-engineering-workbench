import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'robotic-arm-dms-secret-key-2026')
    
    # MySQL Database Configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'rootpassword')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'robotic_arm_dms')
    
    # Engineering Calculation Defaults
    STANDARD_GRAVITY = 9.80665  # m/s^2 (Standard ISO)
    DEFAULT_SAFETY_FACTOR = 1.5
