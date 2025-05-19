# OpenLayers Integration Backend Helper Routes

import json
from flask import Blueprint, jsonify, request, current_app
from utils.database import get_db_connection
import psycopg2.extras

ol_bp = Blueprint('ol', __name__, url_prefix='/api')

@ol_bp.route('/ol/info', methods=['GET'])
def ol_info():
    """Return OpenLayers version information"""
    return jsonify({
        "name": "OpenLayers Integration Helper",
        "version": "1.0.0",
        "status": "active"
    })

@ol_bp.route('/ol/savestate', methods=['POST'])
def save_map_state():
    """Save current map state for sharing"""
    try:
        data = request.get_json()
        
        # Generate a short ID for the saved state
        # In a real implementation, this would save to a database
        state_id = "MAP" + str(hash(json.dumps(data)) % 10000).zfill(5)
        
        return jsonify({
            "success": True,
            "state_id": state_id,
            "message": "Map state saved successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
