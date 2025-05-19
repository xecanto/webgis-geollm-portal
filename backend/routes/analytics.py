from flask import Blueprint, jsonify, request
from utils.database import get_db_connection
import json
import random
import math
from datetime import datetime, timedelta
from config.config import ALLOWED_TABLES

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api')

@analytics_bp.route('/layer_stats/<layer_name>', methods=['GET'])
def get_layer_stats(layer_name):
    """Get statistics about a layer"""
    try:
        # Validate layer name to prevent SQL injection
        if layer_name not in ALLOWED_TABLES:
            return jsonify({"error": "Invalid layer specified"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get feature count
        cursor.execute(f"SELECT COUNT(*) FROM {layer_name}")
        count = cursor.fetchone()[0]
        
        # Get total area or length based on geometry type
        polygon_layers = ['admin0', 'admin1', 'admin2', 'admin3', 'buildings', 'landuse']
        if layer_name in polygon_layers:
            cursor.execute(f"SELECT SUM(ST_Area(geom::geography))/1000000 FROM {layer_name}")
        else:
            cursor.execute(f"SELECT SUM(ST_Length(geom::geography))/1000 FROM {layer_name}")
        measure = cursor.fetchone()[0]
        
        # Get layer metadata
        cursor.execute(f"""
            SELECT 
                f_geometry_column as geom_column,
                srid,
                type
            FROM geometry_columns
            WHERE f_table_name = %s
        """, (layer_name,))
        
        metadata = cursor.fetchone()
        
        # Get column names
        cursor.execute(f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position
        """, (layer_name,))
        
        columns = [{"name": col[0], "type": col[1]} for col in cursor.fetchall()]
        
        # Get bounds
        cursor.execute(f"""
            SELECT 
                ST_XMin(ST_Extent(geom)) as min_x,
                ST_YMin(ST_Extent(geom)) as min_y, 
                ST_XMax(ST_Extent(geom)) as max_x,
                ST_YMax(ST_Extent(geom)) as max_y
            FROM {layer_name}
        """)
        bounds = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "name": layer_name,
            "count": count,
            "measure": round(measure, 2) if measure else None,
            "measure_unit": "km²" if layer_name in ['admin0', 'admin1', 'admin2', 'admin3', 'buildings', 'landuse'] else "km",
            "columns": columns,
            "geometry_type": metadata[2] if metadata else None,
            "srid": metadata[1] if metadata else None,
            "bounds": {
                "minX": bounds[0],
                "minY": bounds[1],
                "maxX": bounds[2],
                "maxY": bounds[3]
            } if bounds else None
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analytics_bp.route('/temperature/trends', methods=['GET'])
def temperature_trends():
    """Get simulated temperature trends for Pakistan"""
    # Generate data for the last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Simulated temperature trends for different regions
    regions = {
        "Islamabad": {"base": 25, "variation": 5},
        "Lahore": {"base": 30, "variation": 7},
        "Karachi": {"base": 33, "variation": 4},
        "Peshawar": {"base": 28, "variation": 6},
        "Quetta": {"base": 22, "variation": 8}
    }
    
    # Generate data
    data = {}
    current_date = start_date
    dates = []
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        dates.append(date_str)
        
        for region, temps in regions.items():
            if region not in data:
                data[region] = []
                
            # Generate a temperature with some randomness but following a trend
            base = temps["base"]
            variation = temps["variation"]
            temperature = round(base + variation * 0.5 * (
                # Add sine wave pattern for seasonal variation
                math.sin(2 * math.pi * (current_date - start_date).days / 30) + 
                # Add random noise
                random.uniform(-0.5, 0.5)
            ), 1)
            
            data[region].append(temperature)
        
        current_date += timedelta(days=1)
    
    # Format the response
    result = {
        "dates": dates,
        "regions": data
    }
    
    return jsonify(result)