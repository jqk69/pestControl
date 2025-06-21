from flask import request, jsonify, Blueprint,g
from app.db import create_connection
from ..utils.verify_token import token_required

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")

 # token_required without role so all authenticated users can access
@notifications_bp.route('/', methods=["GET"],strict_slashes=False)
@token_required() 
def fetch_notifications():
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)

        if connection is None:
            return jsonify({"message": "Server not found"}), 404
        
        user_type = request.args.get('user_type')
        if not user_type:
            return jsonify({"message": "user_type query parameter is required"}), 400
        if user_type =="admin":
            query = "SELECT * FROM notifications WHERE user_type = %s and is_seen=0 ORDER BY id DESC"
            cursor.execute(query, (user_type,))
        elif user_type=="user" or user_type=='technician':
            user_id=g.current_user['sub']
            query = "SELECT * FROM notifications WHERE user_type = %s and user_id=%s and is_seen=0 ORDER BY id DESC"
            cursor.execute(query, (user_type,user_id))
        notifications = cursor.fetchall()

        return jsonify({"notifications": notifications}), 200

    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return jsonify({"message": "Failed to fetch notifications"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
@notifications_bp.route("/<int:notification_id>/seen", methods=["PATCH"])
@token_required()
def mark_notification_seen(notification_id):
    try:
        technician_id = g.current_user["sub"]
        user_type=g.current_user['role']
        conn = create_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE notifications 
            SET is_seen = TRUE 
            WHERE id = %s 
              AND user_type = %s 
              AND user_id = %s
        """, (notification_id,user_type, technician_id))
        
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Notification not found or not authorized"}), 404

        conn.commit()
        return jsonify({"success": True})
    
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500
