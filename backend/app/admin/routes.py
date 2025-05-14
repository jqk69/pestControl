from flask import request, jsonify, Blueprint, current_app
import jwt
from app.db import create_connection
from ..utils.verify_token import token_required
import os
from werkzeug.utils import secure_filename
import time
from PIL import Image

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
            hashed_password = data['password']
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
@token_required(role='admin')
@admin_bp.route('/users/<int:id>', methods=["GET"])
def get_user(id):
    try:
        connection = create_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)

        # Fetch user by ID
        cursor.execute("SELECT * FROM users WHERE id = %s", (id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'message': "User not found"}), 404

        return jsonify({'user': user}), 200

    except Exception as e:
        print(f"Error fetching user: {str(e)}")
        return jsonify({"message": "An error occurred while fetching user data"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
@token_required(role='admin')
@admin_bp.route('/store', methods=['GET'])
def get_store_items():
    try:
        connection = create_connection()  # Create a DB connection
        cursor = connection.cursor(dictionary=True)

        if connection is None:
            return jsonify({"message": "Server not found"}), 404

        # Extract query parameters for filtering
        category = request.args.get('category', 'normal')  # Default to 'normal' category

        # Fetch all products for the requested category
        cursor.execute(
            "SELECT * FROM store WHERE category = %s",
            (category,)
        )
        items = cursor.fetchall()

        # Return the response with items
        return jsonify({
            "items": items
        }), 200

    except Exception as e:
        print(f"Error fetching store items: {e}")
        return jsonify({"message": "An error occurred. Please try again later."}), 500

    finally:
        # Ensure the database connection is closed
        if cursor:
            cursor.close()
        if connection:
            connection.close()
@admin_bp.route('/store/product_image_by_id/<id>', methods=['GET'])
@token_required
def get_product_image_by_id(id):
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    
    if connection is None:
        return jsonify({"message": "Server not found"}), 404

    try:
        cursor.execute('SELECT image_path FROM store WHERE id = %s', (id,))
        product = cursor.fetchone()

        if product and product['image_path']:
            filename = product['image_path']
            # Serve image from static/products folder
            return send_from_directory('static/products', filename)

        return jsonify({"message": "Image not found"}), 404

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

    finally:
        cursor.close()
        connection.close()


@token_required
@admin_bp.route('/store/edit_product/<id>',methods=['GET'])
def get_product_details(id):
    connection=create_connection()
    cursor=connection.cursor(dictionary=True)
    if connection is None:
            return jsonify({"message": "Server not found"}), 404
    try:
        cursor.execute('select * from store where id=%s',(id,))
        product=cursor.fetchone()
        if product is not None:
            return jsonify({"product":product})
        else:
            return jsonify({"message":"product not found"})
    except Exception as e:
        return jsonify({"message":"noes"})
    finally:
        cursor.close()
        connection.close()
@token_required
@admin_bp.route('/store/edit_product/<id>', methods=['PATCH'])
def update_product(id):
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    if connection is None:
        return jsonify({"message": "Server not found"}), 404

    try:
        # Get form data
        name = request.form.get('name')
        description = request.form.get('description')
        price = request.form.get('price')
        stock = request.form.get('inventory_amount')
        image_file = request.files.get('image')

        # Check if product exists
        cursor.execute('SELECT * FROM store WHERE id = %s', (id,))
        product = cursor.fetchone()
        if product is None:
            return jsonify({"message": "Product not found"}), 404

        # Handle image upload if present
        image_path = product['image_path']  # keep old image by default
        if image_file:
            delete_old_image(product['image_path']) 

            filename = secure_filename(image_file.filename)
            upload_folder = os.path.join(current_app.root_path, 'static/products')
            os.makedirs(upload_folder, exist_ok=True)  # ensure folder exists
            image_file.save(os.path.join(upload_folder, filename))
            image_path = filename  # <-- only filename stored


        # Update product in database
        update_query = '''
            UPDATE store 
            SET name=%s, description=%s, price=%s, inventory_amount=%s, image_path=%s
            WHERE id=%s
        '''
        cursor.execute(update_query, (name, description, price, stock, image_path, id))
        connection.commit()

        return jsonify({"message": "Product updated successfully"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Failed to update product"}), 500

    finally:
        cursor.close()
        connection.close()
def delete_old_image(image_path):
    try:
        if image_path and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], image_path)):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], image_path))
    except Exception as e:
        print(f"Error deleting old image: {e}")