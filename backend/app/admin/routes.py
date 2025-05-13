from flask import request, jsonify, Blueprint, current_app
import jwt
from app.db import create_connection
from ..utils.verify_token import token_required

admin_bp=Blueprint("admin",__name__,url_prefix="/admin")

@token_required(role='admin')
@admin_bp.route('/users',methods=["GET"])
def fetch_user():
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)
        
        if connection == None:
            return jsonify({"message":"Server not found"}),404

        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()

        if users :
            return jsonify({'users': users}), 200
        
        return jsonify({"message": "Some Error Occured"}), 401
    
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"message": "An error occurred during login. Please try again later."}), 500
    
    finally:
        # Ensure the database connection is always closed
        if cursor:
            cursor.close()
        if connection:
            connection.close()
@token_required(role='admin')
@admin_bp.route('/users/<id>',methods=["DELETE"])
def delete_user(id):
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)
        
        if connection == None:
            return jsonify({"message":"Server not found"}),404

        cursor.execute("DELETE FROM users WHERE id = %s", (id,))
        if cursor.rowcount > 0:
            connection.commit()
            return jsonify({'message': "User deleted successfully"}), 200
            
        else:
            return jsonify({'message': "User not found"}), 404
        
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "An error occurred. Please try again later."}), 500
    
    finally:
        # Ensure the database connection is always closed
        if cursor:
            cursor.close()
        if connection:
            connection.close()
@token_required(role='admin')
@admin_bp.route('/users/<int:id>', methods=["PATCH"])
def update_user(id):
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No data provided"}), 400

    try:
        connection = create_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)

        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE id = %s", (id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'message': "User not found"}), 404

        # Check if phone number is being updated and already exists
        if 'phone' in data and data['phone']:
            cursor.execute(
                "SELECT id FROM users WHERE phone = %s AND id != %s", 
                (data['phone'], id)
            )
            if cursor.fetchone():
                return jsonify({'message': "Phone number already exists"}), 409

        # Build update query
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append("name = %s")
            update_values.append(data['name'])
        
        if 'email' in data:
            update_fields.append("email = %s")
            update_values.append(data['email'])
        
        if 'phone' in data:
            update_fields.append("phone = %s")
            update_values.append(data['phone'])
        
        if 'password' in data and data['password']:
            hashed_password = generate_password_hash(data['password'])
            update_fields.append("password = %s")
            update_values.append(hashed_password)
        
        if 'role' in data:
            update_fields.append("role = %s")
            update_values.append(data['role'])

        if not update_fields:
            return jsonify({'message': "No valid fields provided for update"}), 400

        update_values.append(id)
        update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        
        cursor.execute(update_query, update_values)
        connection.commit()

        return jsonify({'message': "User updated successfully"}), 200

    except Exception as e:
        connection.rollback()
        print(f"Error updating user: {str(e)}")
        return jsonify({"message": "An error occurred while updating user"}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()