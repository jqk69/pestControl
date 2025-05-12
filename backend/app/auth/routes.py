from flask import request, jsonify, Blueprint, current_app
import jwt
from app.db import create_connection
import datetime

auth_bp = Blueprint("auth", __name__, url_prefix='/auth')

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)
        
        if connection == None:
            return jsonify({"message":"Server not found"}),404

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and user["password"] == password:  # Make sure to hash and compare passwords in a real system
            token = jwt.encode({
                'sub': user['id'],
                'role': user['role'],
                'name': user['username']
            }, current_app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({'token': token}), 200
        
        return jsonify({"message": "Invalid username or password"}), 401
    
    except Exception as e:
        # General error handling, log the error message for debugging
        print(f"Error during login: {e}")
        return jsonify({"message": "An error occurred during login. Please try again later."}), 500
    
    finally:
        # Ensure the database connection is always closed
        if cursor:
            cursor.close()
        if connection:
            connection.close()
