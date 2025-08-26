#!/usr/bin/env python3
"""
Database initialization script for production deployment
Run this script once after database creation to set up tables and initial data
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

def create_database_schema():
    """Create database tables and insert initial data"""
    
    connection = None
    cursor = None
    
    try:
        # Connect to MySQL server
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        print("Connected to MySQL database successfully")
        
        # Read and execute the SQL file
        sql_file_path = os.path.join(os.path.dirname(__file__), 'db.sql')
        
        with open(sql_file_path, 'r', encoding='utf-8') as file:
            sql_commands = file.read()
        
        # Split by semicolon and execute each command
        commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip()]
        
        for command in commands:
            if command.upper().startswith('CREATE DATABASE'):
                # Skip database creation as Render creates the database
                continue
            if command.upper().startswith('USE'):
                # Skip USE statement as we're already connected to the right database
                continue
            
            try:
                cursor.execute(command)
                connection.commit()
                print(f"Executed: {command[:50]}...")
            except Error as e:
                if "already exists" in str(e):
                    print(f"Skipping (already exists): {command[:50]}...")
                else:
                    print(f"Error executing command: {e}")
                    print(f"Command: {command}")
        
        print("Database schema created successfully!")
        
    except Error as e:
        print(f"Error: {e}")
        sys.exit(1)
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

if __name__ == "__main__":
    create_database_schema()
