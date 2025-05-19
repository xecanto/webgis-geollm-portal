from flask import Blueprint, jsonify, request, send_file
from utils.database import get_db_connection, postgis_to_geojson
import json
import re
import io
import difflib
import psycopg2
import psycopg2.extras
from config.config import ALLOWED_TABLES

query_bp = Blueprint('query', __name__, url_prefix='/api')

# Regular expressions for detecting unsafe SQL
UNSAFE_SQL_PATTERN = re.compile(r'\b(delete|drop|alter|update|insert|truncate|grant|revoke|create)\b', re.IGNORECASE)
COMMENT_PATTERN = re.compile(r'--.*$|/\*.*?\*/', re.DOTALL | re.MULTILINE)

def is_safe_query(sql):
    """Check if SQL query is safe to execute"""
    # Remove comments to prevent comment-based bypasses
    sql_no_comments = COMMENT_PATTERN.sub('', sql)
    # Check for unsafe operations
    if UNSAFE_SQL_PATTERN.search(sql_no_comments):
        return False
    # Ensure it's a SELECT query
    if not sql_no_comments.strip().lower().startswith('select'):
        return False
    return True

def find_closest_table(table_name):
    """Find the closest matching table name from allowed tables"""
    if table_name in ALLOWED_TABLES:
        return table_name
    
    # Use fuzzy matching to find closest match
    matches = difflib.get_close_matches(table_name.lower(), 
                                       [t.lower() for t in ALLOWED_TABLES], 
                                       n=1, 
                                       cutoff=0.6)
    
    if matches:
        # Return the original case version
        return ALLOWED_TABLES[[t.lower() for t in ALLOWED_TABLES].index(matches[0])]
    
    return None

def find_closest_column(conn, table_name, column_name):
    """Find the closest matching column name in a table"""
    try:
        cursor = conn.cursor()
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = %s", (table_name,))
        columns = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        if column_name in columns:
            return column_name
            
        # Use fuzzy matching to find closest match
        matches = difflib.get_close_matches(column_name.lower(), 
                                          [c.lower() for c in columns], 
                                          n=1, 
                                          cutoff=0.6)
        
        if matches:
            # Return the original case version
            return columns[[c.lower() for c in columns].index(matches[0])]
            
        return None
        
    except Exception:
        return None

def parse_natural_language_query(query_text):
    """Parse natural language query to extract table name and conditions"""
    query_text = query_text.lower().strip()
    
    # Extract potential table names
    potential_table = None
    for table in ALLOWED_TABLES:
        if table.lower() in query_text:
            potential_table = table
            break
    
    if not potential_table:
        # Look for general categories that might map to tables
        if any(word in query_text for word in ['country', 'countries', 'nation', 'border']):
            potential_table = 'admin0'
        elif any(word in query_text for word in ['province', 'state', 'region']):
            potential_table = 'admin1'
        elif any(word in query_text for word in ['district', 'city', 'town']):
            potential_table = 'admin2'
        elif any(word in query_text for word in ['village', 'tehsil', 'local']):
            potential_table = 'admin3'
        elif any(word in query_text for word in ['building', 'house', 'structure']):
            potential_table = 'buildings'
        elif any(word in query_text for word in ['land', 'area', 'zone']):
            potential_table = 'landuse'
        elif any(word in query_text for word in ['road', 'street', 'highway']):
            potential_table = 'roads'
        elif any(word in query_text for word in ['railway', 'train', 'track']):
            potential_table = 'railways'
        elif any(word in query_text for word in ['water', 'river', 'lake', 'stream']):
            potential_table = 'waterways'
    
    return potential_table

@query_bp.route('/query', methods=['POST'])
def query_data():
    """Execute custom SQL query (restricted for security)"""
    try:
        data = request.get_json()
        sql = data.get('sql')
        natural_query = data.get('natural_query')
        export_format = data.get('export_format')
        
        # If natural language query is provided, try to parse it
        if natural_query and not sql:
            potential_table = parse_natural_language_query(natural_query)
            if potential_table:
                sql = f"SELECT * FROM {potential_table} LIMIT 100"
            else:
                return jsonify({"error": "Could not determine what data you're looking for. Please try again with more specific terms or use SQL."}), 400
        
        # Security validation for SQL queries
        if not is_safe_query(sql):
            return jsonify({"error": "Unsafe SQL operation detected. Only SELECT queries are allowed."}), 403
            
        # Check for table name patterns and replace with closest matches
        for table in ALLOWED_TABLES:
            # Match patterns like "FROM table_name" with various spacing
            pattern = re.compile(rf'\bFROM\s+([a-zA-Z0-9_]+)', re.IGNORECASE)
            matches = pattern.findall(sql)
            
            for match in matches:
                if match.lower() != table.lower() and match not in ALLOWED_TABLES:
                    closest = find_closest_table(match)
                    if closest:
                        sql = re.sub(rf'\bFROM\s+{match}\b', f"FROM {closest}", sql, flags=re.IGNORECASE)
        
        # Execute query and return results
        conn = get_db_connection()
        cursor = None
        
        try:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cursor.execute(sql)
            
            columns = [desc[0] for desc in cursor.description]
            results = []
            
            for row in cursor:
                result = {}
                for i, col in enumerate(columns):
                    if col == 'geom':
                        # Convert geometry to GeoJSON
                        cursor2 = conn.cursor()
                        try:
                            cursor2.execute("SELECT ST_AsGeoJSON(%s::geometry) AS geojson", (row[i],))
                            geojson = cursor2.fetchone()[0]
                            result[col] = json.loads(geojson) if geojson else None
                        finally:
                            cursor2.close()
                    else:
                        result[col] = row[i]
                results.append(result)
            
            # If export is requested, return the file instead of JSON response
            if export_format == 'geojson' and results:
                # Convert to GeoJSON FeatureCollection
                features = []
                for row in results:
                    geom = row.pop('geom', None)
                    feature = {
                        "type": "Feature",
                        "properties": row,
                        "geometry": geom
                    }
                    features.append(feature)
                
                geojson_output = {
                    "type": "FeatureCollection",
                    "features": features
                }
                
                # Create in-memory file-like object
                geojson_bytes = json.dumps(geojson_output).encode('utf-8')
                
                return send_file(
                    io.BytesIO(geojson_bytes),
                    mimetype='application/geo+json',
                    download_name='query_results.geojson',
                    as_attachment=True
                )
            
            return jsonify(results)
            
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    except Exception as e:
        return jsonify({"error": f"Query error: {str(e)}"}), 500
        
@query_bp.route('/export', methods=['POST'])
def export_data():
    """Export query results to GeoJSON format"""
    try:
        data = request.get_json()
        sql = data.get('sql')
        result_data = data.get('data')  # Use pre-fetched data if provided
        
        # If no data is provided but SQL is, execute the query
        if not result_data and sql:
            if not is_safe_query(sql):
                return jsonify({"error": "Unsafe SQL operation detected. Only SELECT queries are allowed."}), 403
                
            # Generate GeoJSON directly from query
            geojson = postgis_to_geojson(sql)
            
            # Send as downloadable file
            geojson_bytes = json.dumps(geojson).encode('utf-8')
            return send_file(
                io.BytesIO(geojson_bytes),
                mimetype='application/geo+json',
                download_name='export_data.geojson',
                as_attachment=True
            )
            
        # If pre-fetched data is provided, convert it to GeoJSON
        elif result_data:
            # Assume the data is already in the right format from the query endpoint
            # Convert to GeoJSON FeatureCollection if it's not already
            if not isinstance(result_data, dict) or "type" not in result_data or result_data["type"] != "FeatureCollection":
                features = []
                for item in result_data:
                    geom = item.pop('geom', None)
                    feature = {
                        "type": "Feature",
                        "properties": item,
                        "geometry": geom
                    }
                    features.append(feature)
                
                result_data = {
                    "type": "FeatureCollection",
                    "features": features
                }
                
            # Send as downloadable file
            geojson_bytes = json.dumps(result_data).encode('utf-8')
            return send_file(
                io.BytesIO(geojson_bytes),
                mimetype='application/geo+json',
                download_name='export_data.geojson',
                as_attachment=True
            )
            
        else:
            return jsonify({"error": "No data or SQL query provided for export"}), 400
            
    except Exception as e:
        return jsonify({"error": f"Export error: {str(e)}"}), 500