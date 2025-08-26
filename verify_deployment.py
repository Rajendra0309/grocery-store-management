#!/usr/bin/env python3
"""
Manual database initialization script for Render
Run this after deployment to set up the database
"""

import os
import sys
import requests
import time

# Your deployed app URL
APP_URL = "https://grocery-store-app-x4wj.onrender.com"

def trigger_db_init():
    """Trigger database initialization via API call"""
    
    print("=== Manual Database Initialization ===")
    print(f"App URL: {APP_URL}")
    print()
    
    # First check app health
    try:
        print("Checking app health...")
        response = requests.get(f"{APP_URL}/health", timeout=30)
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            health_data = response.json()
            print(f"App status: {health_data.get('status')}")
            print(f"Database status: {health_data.get('database', 'unknown')}")
        print()
    except Exception as e:
        print(f"Health check failed: {e}")
        return False
    
    # Create a simple endpoint to test database
    print("Testing database connection...")
    try:
        response = requests.get(f"{APP_URL}/api/products", timeout=30)
        if response.status_code == 200:
            print("✅ Database connection working!")
            products = response.json()
            print(f"Found {len(products)} products")
            return True
        else:
            print(f"❌ Database connection failed: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def check_endpoints():
    """Check all main endpoints"""
    
    endpoints = [
        "/",
        "/health",
        "/products",
        "/customers", 
        "/orders"
    ]
    
    print("\n=== Endpoint Status Check ===")
    
    for endpoint in endpoints:
        try:
            url = f"{APP_URL}{endpoint}"
            response = requests.get(url, timeout=15)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{endpoint:15} {status} {response.status_code}")
        except Exception as e:
            print(f"{endpoint:15} ❌ ERROR: {str(e)[:50]}")
    
    print()

if __name__ == "__main__":
    print("Starting Render deployment verification...")
    time.sleep(2)
    
    # Check endpoints
    check_endpoints()
    
    # Test database
    db_success = trigger_db_init()
    
    if db_success:
        print("🎉 Deployment successful! All systems working.")
    else:
        print("⚠️  App deployed but database needs configuration.")
        print("\nNext steps:")
        print("1. Check Render dashboard for database connection details")
        print("2. Verify environment variables are set correctly")
        print("3. Run database initialization manually if needed")
        print("4. Check deployment logs for specific errors")
        
    sys.exit(0 if db_success else 1)
