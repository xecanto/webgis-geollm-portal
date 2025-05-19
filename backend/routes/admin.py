from flask import Blueprint, jsonify
from utils.database import postgis_to_geojson

admin_bp = Blueprint('admin', __name__, url_prefix='/api')

@admin_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "GeoLLM Backend is running"})

@admin_bp.route('/admin_boundaries/<level>', methods=['GET'])
def get_admin_boundaries(level):
    """Get administrative boundaries at specified level (0, 1, 2, or 3)"""
    if level not in ['0', '1', '2', '3']:
        return jsonify({"error": "Invalid admin level. Use 0, 1, 2, or 3"}), 400
    
    table_name = f"admin{level}"
    query = f"""
        SELECT gid, name_{level} as name, geom 
        FROM {table_name}
        ORDER BY name_{level}
    """
    
    # Handle country level which doesn't have name_0
    if level == '0':
        query = """
            SELECT gid, country as name, geom 
            FROM admin0
        """
    
    geojson = postgis_to_geojson(query)
    return jsonify(geojson)