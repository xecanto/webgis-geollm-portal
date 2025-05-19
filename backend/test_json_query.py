'''
This script tests JSON query functionality of the WebGIS GeolLM Portal.
It sends several test queries to verify different aspects of the functionality.
'''

import requests
import json

# Configuration
BASE_URL = "http://localhost:5000/api"
JSON_QUERY_ENDPOINT = f"{BASE_URL}/json_query"
SQL_QUERY_ENDPOINT = f"{BASE_URL}/query"

def test_json_query(query_json):
    """Test a JSON query and print results"""
    print(f"\n--- Testing JSON Query ---\n{json.dumps(query_json, indent=2)}")
    
    try:
        response = requests.post(
            JSON_QUERY_ENDPOINT,
            headers={"Content-Type": "application/json"},
            json=query_json
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Got {len(result)} results.")
            if len(result) > 0:
                print(f"First result sample: {json.dumps(result[0], indent=2)[:200]}...")
            return result
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {str(e)}")
        return None

def test_sql_natural_query(query_text):
    """Test a natural language query and print results"""
    print(f"\n--- Testing Natural Language Query ---\n{query_text}")
    
    try:
        response = requests.post(
            SQL_QUERY_ENDPOINT,
            headers={"Content-Type": "application/json"},
            json={"natural_query": query_text}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Got {len(result)} results.")
            if len(result) > 0:
                print(f"First result sample: {json.dumps(result[0], indent=2)[:200]}...")
            return result
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {str(e)}")
        return None

def test_geojson_export(query_json):
    """Test exporting a query as GeoJSON"""
    print(f"\n--- Testing GeoJSON Export ---\n{json.dumps(query_json, indent=2)}")
    
    # Add export_format parameter
    query_json["export_format"] = "geojson"
    
    try:
        response = requests.post(
            JSON_QUERY_ENDPOINT,
            headers={"Content-Type": "application/json"},
            json=query_json
        )
        
        if response.status_code == 200:
            # For file downloads, check content type and headers
            content_type = response.headers.get('Content-Type', '')
            content_disposition = response.headers.get('Content-Disposition', '')
            
            print(f"Success! Got response with content type: {content_type}")
            print(f"Content-Disposition: {content_disposition}")
            print(f"Content size: {len(response.content)} bytes")
            return True
        else:
            print(f"Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {str(e)}")
        return False

def test_all():
    """Run all test queries"""
    # Test 1: Simple query with layer only
    test_json_query({
        "layer": "roads",
        "limit": 5
    })
    
    # Test 2: Query with where clause
    test_json_query({
        "layer": "roads",
        "where": {
            "type": "primary"
        },
        "limit": 5
    })
    
    # Test 3: Query with multiple where clauses
    test_json_query({
        "layer": "buildings",
        "where": {
            "type": "residential",
            "height": "3"
        },
        "limit": 5
    })
      # Test 4: Admin boundaries
    test_json_query({
        "layer": "admin1",
        "where": {
            "name_1": "Punjab"
        }
    })
    
    # Test 5: Natural language queries
    test_sql_natural_query("Show me all primary roads")
    test_sql_natural_query("I need to see buildings in Punjab")
    test_sql_natural_query("What rivers are in the database?")
    
    # Test 6: GeoJSON export
    test_geojson_export({
        "layer": "roads",
        "where": {
            "type": "primary"
        },
        "limit": 10
    })
    
    # Test 7: With fuzzy column matching 
    test_json_query({
        "layer": "roads",
        "where": {
            "Type": "primary"  # Note the capitalization difference
        },
        "limit": 10
    })

if __name__ == "__main__":
    print("Starting JSON Query Tests")
    test_all()
    print("\nTests completed.")
