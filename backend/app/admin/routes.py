from flask import request, jsonify, Blueprint, current_app
from app.db import create_connection
from ..utils.verify_token import token_required
import os
from werkzeug.utils import secure_filename

admin_bp=Blueprint("admin",__name__,url_prefix="/admin")


@admin_bp.route('/users',methods=["GET"])
@token_required(role='admin')
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


@token_required(role='admin')
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
@token_required(role='admin')
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
        category=request.form.get('category')

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
            SET name=%s, description=%s, price=%s, inventory_amount=%s, image_path=%s,category=%s
            WHERE id=%s
        '''
        cursor.execute(update_query, (name, description, price, stock, image_path,category, id))
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
        upload_folder = current_app.config.get('PRODUCT_IMAGE_FOLDER', os.path.join(current_app.root_path, 'static/products'))
        full_path = os.path.join(upload_folder, image_path)
        if image_path and os.path.exists(full_path):
            os.remove(full_path)
    except Exception as e:
        print(f"Error deleting old image: {e}")

@token_required(role='admin')
@admin_bp.route('/store/add_product', methods=['POST'])
def add_product():
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
        category=request.form.get('category')

        # Validate required fields
        if not all([name, description, price, stock,category]):
            return jsonify({"message": "All fields are required"}), 400

        # Handle image upload
        image_path = None
        if image_file:
            filename = secure_filename(image_file.filename)
            upload_folder = os.path.join(current_app.root_path, 'static/products')
            os.makedirs(upload_folder, exist_ok=True)
            image_file.save(os.path.join(upload_folder, filename))
            image_path = filename

        # Insert product into database
        insert_query = '''
            INSERT INTO store (name, description, price, inventory_amount, image_path,category)
            VALUES (%s, %s, %s, %s, %s,%s)
        '''
        cursor.execute(insert_query, (name, description, price, stock, image_path,category))
        connection.commit()

        return jsonify({"message": "Product added successfully"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Failed to add product"}), 500

    finally:
        cursor.close()
        connection.close()
@token_required(role='admin')
@admin_bp.route('/store/delete_product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    if connection is None:
        return jsonify({"message": "Server not found"}), 404

    try:
        # Check if product exists
        cursor.execute('SELECT * FROM store WHERE id = %s', (product_id,))
        product = cursor.fetchone()

        if not product:
            return jsonify({"message": "Product not found"}), 404

        # Delete product from database
        delete_query = 'DELETE FROM store WHERE id = %s'
        cursor.execute(delete_query, (product_id,))
        connection.commit()

        return jsonify({"message": "Product deleted successfully"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Failed to delete product"}), 500

    finally:
        cursor.close()
        connection.close()
@token_required(role='admin')
@admin_bp.route('/services', methods=['GET'])
def get_all_services():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    
    if connection is None:
        return jsonify({"message": "Server not found"}), 404

    try:
        cursor.execute('SELECT * FROM services')
        services = cursor.fetchall()
        
        if services:
            return jsonify({"services": services}), 200
        else:
            return jsonify({"message": "No services found"}), 404
            
    except Exception as e:
        return jsonify({"message": "Error fetching services", "error": str(e)}), 500
        
    finally:
        cursor.close()
        connection.close()
@token_required(role='admin')
@admin_bp.route('/services/add_service', methods=['POST'])
def add_service():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    if connection is None:
        return jsonify({"message": "Database connection failed"}), 500

    try:
        # Get form data
        service_type = request.form.get('service_type')
        category = request.form.get('category')
        name = request.form.get('name')
        technicians_needed = request.form.get('technicians_needed')
        price = request.form.get('price')
        description = request.form.get('description')

        # Validate required fields
        if not all([service_type, category, name, technicians_needed, price, description]):
            return jsonify({"message": "All fields are required"}), 400

        # Convert numeric fields
        try:
            technicians_needed = int(technicians_needed)
            price = float(price)
        except ValueError:
            return jsonify({"message": "Invalid numeric values"}), 400

        # Insert service into database
        insert_query = '''
            INSERT INTO services 
            (service_type, category, name, technicians_needed, price, description)
            VALUES (%s, %s, %s, %s, %s, %s)
        '''
        cursor.execute(insert_query, (
            service_type, 
            category, 
            name, 
            technicians_needed, 
            price, 
            description
        ))
        connection.commit()

        return jsonify({
            "message": "Service added successfully"
        }), 201

    except Exception as e:
        connection.rollback()
        print(f"Error adding service: {str(e)}")
        return jsonify({"message": "Failed to add service"}), 500

    finally:
        cursor.close()
        connection.close()
@admin_bp.route("/services/edit_service/<int:service_id>", methods=['GET'])
@token_required(role='admin')
def get_service(service_id):
    try:
        connection = create_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        with connection.cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT * FROM services WHERE service_id = %s", 
                (service_id,)
            )
            service = cursor.fetchone()

            if not service:
                return jsonify({"error": f"Service with ID {service_id} not found"}), 404

            return jsonify({
                "status": "success",
                "data": service
            }), 200

    except Exception as e:
        return jsonify({
            
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
@admin_bp.route('/services/edit_service/<int:service_id>', methods=['PATCH'])
@token_required(role='admin')
def update_service(service_id):
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get update data from request
        data = request.get_json()
        
        # Build dynamic update query
        update_fields = []
        values = []
        for field in ['name', 'description', 'price', 'technicians_needed', 'service_type', 'category']:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({"message": "No fields to update"}), 400
            
        values.append(service_id)
        
        query = f"""
            UPDATE services 
            SET {', '.join(update_fields)}
            WHERE service_id = %s
        """
        
        cursor.execute(query, values)
        connection.commit()
        
        return jsonify({"message": "Service updated successfully"}), 200
        
    except Exception as e:
        connection.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if connection: connection.close()   
@token_required(role='admin')
@admin_bp.route('/services/delete_service/<int:id>',methods=["DELETE"])
def delete_service(id):
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)
        
        if connection == None:
            return jsonify({"message":"Server not found"}),404

        cursor.execute("DELETE FROM services WHERE service_id = %s", (id,))
        if cursor.rowcount > 0:
            connection.commit()
            return jsonify({'message': "Service deleted successfully"}), 200
            
        else:
            return jsonify({'message': "Service not found"}), 404
        
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "An error occurred. Please try again later."}), 500
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()