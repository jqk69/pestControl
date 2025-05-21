from flask import request, jsonify, Blueprint, current_app
from app.db import create_connection
from ..utils.verify_token import token_required
import os
from werkzeug.utils import secure_filename

user_bp=Blueprint('user',__name__,url_prefix="/user")

@user_bp.route("/services", methods=['GET'])
@token_required(role='user')
def get_services():
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT service_id, service_type, category, name, technicians_needed, price, description FROM services WHERE 1"
        
        cursor.execute(query)
        services = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "services": services
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching services: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch services."
        }), 500
@user_bp.route("/service/<int:service_id>", methods=['GET'])
@token_required(role='user')
def get_service_detail(service_id):
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT service_id, service_type, category, name, technicians_needed, price, description
            FROM services
            WHERE service_id = %s
        """
        cursor.execute(query, (service_id,))
        service = cursor.fetchone()

        cursor.close()
        conn.close()

        if service:
            return jsonify({
                "success": True,
                "service": service
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Service not found"
            }), 404

    except Exception as e:
        current_app.logger.error(f"Error fetching service details: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch service details."
        }), 500

