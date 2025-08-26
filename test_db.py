#!/usr/bin/env python3
"""
Database connection test script
Run this to test database connectivity and debug connection issues
"""

import os
import sys
import mysql.connector
from mysql.connector import Error

# Add the parent directory to the path so we can import our config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Use the render configuration
os.environ['CONFIG_MODULE'] = 'config_render'
from config_render import db_config

def test_connection():
    """Test database connection and print diagnostics"""
    
    print("=== Database Connection Test ===")
    print(f"Host: {db_config['host']}")
    print(f"Port: {db_config['port']}")
    print(f"Database: {db_config['database']}")
    print(f"User: {db_config['user']}")
    print(f"Password: {'Set' if db_config['password'] else 'Not set'}")
    print()
    
    connection = None
    cursor = None
    
    try:
        print("Attempting to connect to MySQL database...")
        
        # Test connection with timeout
        connection = mysql.connector.connect(**db_config)
        
        print("✅ Successfully connected to database!")
        
        cursor = connection.cursor()
        
        # Test basic query
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ MySQL version: {version[0]}")
        
        # Test database selection
        cursor.execute(f"USE {db_config['database']}")
        print(f"✅ Successfully selected database: {db_config['database']}")
        
        # List tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        if tables:
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"   - {table[0]}")
        else:
            print("⚠️  No tables found - database needs initialization")
        
        print("\n🎉 Database connection test PASSED!")
        return True
        
    except Error as e:
        print(f"❌ Database connection FAILED: {e}")
        
        # Provide specific error guidance
        if "timed out" in str(e):
            print("💡 Timeout error - check if database is running and network allows connection")
        elif "Access denied" in str(e):
            print("💡 Access denied - check username and password")
        elif "Unknown database" in str(e):
            print("💡 Database doesn't exist - check database name")
        elif "Can't connect" in str(e):
            print("💡 Can't connect - check host and port")
        
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
        
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("Database connection closed.")

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
