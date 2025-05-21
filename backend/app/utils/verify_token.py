import jwt
import os
from flask import request, jsonify, current_app, g
from functools import wraps
from dotenv import load_dotenv
from app.db import create_connection

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')

def token_required(role=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None

            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(" ")[1]

            if token is None:
                return jsonify({'message': 'Token is missing!'}), 401

            try:

                data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])

                if not all(k in data for k in ['sub', 'role', 'name']):
                    return jsonify({'message': 'Invalid token payload!'}), 401

                if role and data['role'] != role:
                    return jsonify({'message': 'Unauthorized role access!'}), 403

                # Set current user globally
                g.current_user = {
                    'sub': str(data['sub']),
                    'role': data['role'],
                    'name': data['name']
                }

            except jwt.InvalidTokenError as e:
                print(f"InvalidTokenError: {str(e)}")
                return jsonify({'message': 'Invalid token!'}), 401

            return f(*args, **kwargs)

        return decorated_function
    return decorator
