from flask import request, jsonify, Blueprint
from app.db import create_connection
from ..utils.verify_token import token_required

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")

@token_required()  # token_required without role so all authenticated users can access
@notifications_bp.route('/', methods=["GET"],strict_slashes=False)
def fetch_notifications():
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)

        if connection is None:
            return jsonify({"message": "Server not found"}), 404
        
        # Get user type from token or query param (example using query param here)
        user_type = request.args.get('user_type')
        if not user_type:
            return jsonify({"message": "user_type query parameter is required"}), 400
        
        query = "SELECT * FROM notifications WHERE user_type = %s ORDER BY id DESC"
        cursor.execute(query, (user_type,))
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
