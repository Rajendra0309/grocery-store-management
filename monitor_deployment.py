#!/usr/bin/env python3
"""
Monitor Render deployment and test endpoints
"""

import requests
import time
import sys
from datetime import datetime

# Your Render app URL
BASE_URL = "https://grocery-store-app-x4wj.onrender.com"

def test_endpoint(endpoint, expected_status=200):
    """Test a specific endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        print(f"Testing {url}...")
        response = requests.get(url, timeout=30)
        
        print(f"Status: {response.status_code}")
        if response.status_code == expected_status:
            print("✅ PASS")
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    data = response.json()
                    print(f"Response: {data}")
                except:
                    print(f"Response: {response.text[:200]}...")
            else:
                print(f"Response length: {len(response.text)} chars")
        else:
            print("❌ FAIL")
            print(f"Response: {response.text[:200]}...")
        
        return response.status_code == expected_status
        
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT (30s)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def monitor_deployment():
    """Monitor the deployment progress"""
    
    print("=== Render Deployment Monitor ===")
    print(f"Time: {datetime.now()}")
    print(f"Base URL: {BASE_URL}")
    print()
    
    # Test endpoints in order of importance
    endpoints = [
        ("/health", 200),
        ("/test", 200),
        ("/", 200),
        ("/products", 200),
        ("/customers", 200),
        ("/orders", 200)
    ]
    
    results = {}
    
    for endpoint, expected_status in endpoints:
        print(f"\n--- Testing {endpoint} ---")
        success = test_endpoint(endpoint, expected_status)
        results[endpoint] = success
        
        # Wait between requests
        time.sleep(2)
    
    # Summary
    print(f"\n{'='*50}")
    print("DEPLOYMENT TEST SUMMARY")
    print(f"{'='*50}")
    
    total_tests = len(results)
    passed_tests = sum(1 for success in results.values() if success)
    
    for endpoint, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{endpoint:15} {status}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! Deployment is successful!")
        return True
    elif passed_tests > 0:
        print("⚠️  Partial success - some endpoints working")
        return False
    else:
        print("❌ Deployment failed - no endpoints working")
        return False

if __name__ == "__main__":
    success = monitor_deployment()
    
    if not success:
        print("\n💡 Troubleshooting tips:")
        print("1. Check Render deployment logs")
        print("2. Verify database connection configuration")
        print("3. Check environment variables in Render dashboard")
        print("4. Monitor /health endpoint for database status")
    
    sys.exit(0 if success else 1)
