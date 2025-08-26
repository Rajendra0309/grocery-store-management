#!/usr/bin/env python3
"""
Test script to verify configuration loading
"""

import os
import sys

print("=== Configuration Test ===")

# Test render config
os.environ['CONFIG_MODULE'] = 'config_render'

try:
    from config_render import db_config
    print("✅ Successfully imported config_render")
    print(f"Host: {db_config.get('host', 'NOT SET')}")
    print(f"Port: {db_config.get('port', 'NOT SET')}")
    print(f"Database: {db_config.get('database', 'NOT SET')}")
    print(f"User: {db_config.get('user', 'NOT SET')}")
    print(f"Password: {'SET' if db_config.get('password') else 'NOT SET'}")
    print()
    
    # Test environment variables
    print("Environment Variables:")
    env_vars = ['DATABASE_URL', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
    for var in env_vars:
        value = os.environ.get(var)
        print(f"{var}: {'SET' if value else 'NOT SET'}")
    
except Exception as e:
    print(f"❌ Error importing config: {e}")
    sys.exit(1)
