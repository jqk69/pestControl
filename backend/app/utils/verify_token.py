import jwt
from flask import request, jsonify
from functools import wraps
from app.db import create_connection
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')

def token_required(role=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None

            # Get token from Authorization header
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(" ")[1]

            if not token:
                return jsonify({'message': 'Token is missing!'}), 401

            try:
                # Decode the token
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

                if not all(k in data for k in ['id', 'role', 'name']):
                    return jsonify({'message': 'Invalid token payload!'}), 401

                # Role-based access control
                if role and data['role'] != role:
                    return jsonify({'message': 'Unauthorized role access!'}), 403

                # Pass user data to the route
                kwargs['current_user'] = {
                    'id': data['id'],
                    'role': data['role'],
                    'name': data['name']
                }

            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token!'}), 401

            return f(*args, **kwargs)

        return decorated_function
    return decorator
