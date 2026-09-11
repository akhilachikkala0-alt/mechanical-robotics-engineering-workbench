"""
Database Connection Handler for MySQL robotic_arm_dms
Provides connection pooling and dictionary cursor helpers.
"""
import mysql.connector
from mysql.connector import Error, pooling
from backend.config import Config

db_pool = None

def init_db_pool():
    global db_pool
    if db_pool is None:
        try:
            db_pool = pooling.MySQLConnectionPool(
                pool_name="robotic_dms_pool",
                pool_size=10,
                pool_reset_session=True,
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DATABASE
            )
            print("[MySQL] Connection pool initialized successfully for database: " + Config.MYSQL_DATABASE)
        except Error as e:
            print(f"[MySQL Error] Failed to initialize connection pool: {e}")
            raise e

def get_db_connection():
    global db_pool
    if db_pool is None:
        init_db_pool()
    return db_pool.get_connection()

def execute_query(query, params=None, fetchone=False, fetchall=True, commit=False):
    """
    Executes parameterized SQL queries safely to prevent SQL injection.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if commit:
            conn.commit()
            last_id = cursor.lastrowid
            affected = cursor.rowcount
            return {"last_id": last_id, "affected_rows": affected}
        
        if fetchone:
            return cursor.fetchone()
        if fetchall:
            return cursor.fetchall()
        return None
    except Error as e:
        if conn and commit:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
