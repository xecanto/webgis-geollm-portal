from flask import Blueprint, jsonify, request, send_file
from utils.database import get_db_connection
import json
import psycopg2
import psycopg2.extras
import io
import csv
import base64
from config.config import ALLOWED_TABLES

json_query_bp = Blueprint('json_query', __name__, url_prefix='/api')

@json_query_bp.route('/json_query', methods=['POST'])
def json_query_data():
    """Execute query using JSON format with automatic spatial filtering"""
    conn = None
    try:
        data = request.get_json()
        
        # Required fields
        if 'layer' not in data:
            return jsonify({"error": "Missing required field: layer"}), 400
            
        layer = data.get('layer')
        where_clauses = data.get('where', {})
        limit = data.get('limit', 100)  # Default limit to 100
        offset = data.get('offset', 0)
        export_format = data.get('export_format', None)  # Optional export format
        
        # Validate layer name to prevent SQL injection
        if layer not in ALLOWED_TABLES:
            return jsonify({"error": f"Invalid layer: {layer}. Allowed layers: {', '.join(ALLOWED_TABLES)}"}), 400
            
        # Build the SQL query from JSON parameters
        sql = f"SELECT * FROM {layer}"
        
        # Process where conditions
        params = []
        if where_clauses:
            sql += " WHERE "
            conditions = []
            
            for key, value in where_clauses.items():
                # Basic sanitization and escaping
                sanitized_key = key.replace('"', '').replace("'", "")
                
                if isinstance(value, list):
                    # Handle IN conditions
                    placeholders = ', '.join([f'%s' for _ in value])
                    conditions.append(f"\"{sanitized_key}\" IN ({placeholders})")
                    params.extend(value)
                elif value is None:
                    # Handle NULL values
                    conditions.append(f"\"{sanitized_key}\" IS NULL")
                else:
                    # Simple equality - use double quotes for column names to handle case sensitivity
                    conditions.append(f"\"{sanitized_key}\" = %s")
                    params.append(value)
                    
            sql += " AND ".join(conditions)
        
        # Add limit and offset
        sql += f" LIMIT {limit}"
        if offset > 0:
            sql += f" OFFSET {offset}"
            
        # Execute query
        conn = get_db_connection()
        cursor = None
        try:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cursor.execute(sql, params)
            
            # Process results
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
                
            # Handle export if specified
            if export_format == 'csv':
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=[c for c in columns if c != 'geom'])
                writer.writeheader()
                
                for row in results:
                    # Remove geometry field for CSV export
                    row_copy = {k: v for k, v in row.items() if k != 'geom'}
                    writer.writerow(row_copy)
                
                output.seek(0)
                return send_file(
                    io.BytesIO(output.getvalue().encode('utf-8')),
                    mimetype='text/csv',
                    download_name=f"{layer}_export.csv",
                    as_attachment=True
                )
            elif export_format == 'geojson':
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
                
                return send_file(
                    io.BytesIO(json.dumps(geojson_output).encode('utf-8')),
                    mimetype='application/geo+json',
                    download_name=f"{layer}_export.geojson",
                    as_attachment=True
                )
                
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        
        return jsonify(results)
    
    except psycopg2.Error as e:
        # Handle database-specific errors
        if conn:
            conn.rollback()
        error_message = f"Database error: {e.pgerror if hasattr(e, 'pgerror') and e.pgerror else str(e)}"
        return jsonify({"error": error_message}), 500
    except Exception as e:
        return jsonify({"error": f"Error executing query: {str(e)}"}), 500

@json_query_bp.route('/download_map', methods=['POST'])
def download_map():
    """Download current map view as an image"""
    try:
        data = request.get_json()
        map_image = data.get('image')  # Base64 encoded image data
        format_type = data.get('format', 'png')  # Default to PNG
        
        if not map_image or not map_image.startswith('data:image'):
            return jsonify({"error": "Invalid image data"}), 400
            
        # Extract the base64 data part
        image_data = map_image.split(',')[1]
        
        # Decode and return as downloadable file
        image_binary = io.BytesIO(base64.b64decode(image_data))
        
        return send_file(
            image_binary,
            mimetype=f'image/{format_type}',
            download_name=f"map_export.{format_type}",
            as_attachment=True
        )
    except Exception as e:
        return jsonify({"error": f"Error processing map export: {str(e)}"}), 500
