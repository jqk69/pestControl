from flask import request, jsonify, Blueprint,g
from app.db import create_connection
from ..utils.verify_token import token_required
import os
from werkzeug.utils import secure_filename

admin_bp=Blueprint("admin",__name__,url_prefix="/admin")


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

        # Phone number uniqueness check
        if 'phone' in data and data['phone']:
            cursor.execute(
                "SELECT id FROM users WHERE phone = %s AND id != %s", 
                (data['phone'], id)
            )
            if cursor.fetchone():
                return jsonify({'message': "Phone number already exists"}), 409

        # Update users table
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

        if update_fields:
            update_values.append(id)
            update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
            cursor.execute(update_query, update_values)

        # If technician data is provided
        technician_fields = ['skills', 'experience_years', 'salary']
        tech_data_present = any(field in data for field in technician_fields)

        if user['role'] == 'technician' or (data.get('role') == 'technician'):
            # Check if technician record exists
            cursor.execute("SELECT * FROM technicians WHERE technician_id = %s", (id,))
            tech_record = cursor.fetchone()

            if tech_data_present:
                tech_update_fields = []
                tech_update_values = []

                if 'skills' in data:
                    tech_update_fields.append("skills = %s")
                    tech_update_values.append(data['skills'])
                if 'experience_years' in data:
                    tech_update_fields.append("experience_years = %s")
                    tech_update_values.append(data['experience_years'])
                if 'salary' in data:
                    tech_update_fields.append("salary = %s")
                    tech_update_values.append(data['salary'])

                if tech_record:
                    # Update technician
                    tech_update_values.append(id)
                    update_tech_query = f"UPDATE technicians SET {', '.join(tech_update_fields)} WHERE technician_id = %s"
                    cursor.execute(update_tech_query, tech_update_values)
                else:
                    # Insert new technician
                    insert_fields = []
                    insert_values = []
                    placeholders = []

                    if 'skills' in data:
                        insert_fields.append("skills")
                        insert_values.append(data['skills'])
                        placeholders.append("%s")
                    if 'experience_years' in data:
                        insert_fields.append("experience_years")
                        insert_values.append(data['experience_years'])
                        placeholders.append("%s")
                    if 'salary' in data:
                        insert_fields.append("salary")
                        insert_values.append(data['salary'])
                        placeholders.append("%s")

                    insert_fields.append("technician_id")
                    insert_values.append(id)
                    placeholders.append("%s")

                    insert_query = f"INSERT INTO technicians ({', '.join(insert_fields)}) VALUES ({', '.join(placeholders)})"
                    cursor.execute(insert_query, insert_values)

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

        response_data = {'user': user}

        # If user is technician, fetch technician details
        if user.get('role') == 'technician':
            cursor.execute("SELECT * FROM technicians WHERE technician_id = %s", (user['id'],))
            technician = cursor.fetchone()
            response_data['technician'] = technician if technician else {}

        return jsonify(response_data), 200

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
    if connection is None:
        return jsonify({"message": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)

    try:
        service_type = request.form.get('service_type')
        category = request.form.get('category')
        name = request.form.get('name')
        technicians_needed = request.form.get('technicians_needed')
        price = request.form.get('price')
        description = request.form.get('description')
        pest_type = request.form.get('pest_type')
        duration_minutes = request.form.get('duration_minutes')

        # Validate required fields including duration_minutes
        if not all([service_type, category, name, technicians_needed, price, description, pest_type, duration_minutes]):
            return jsonify({"message": "All fields are required"}), 400

        # Convert numeric fields
        try:
            technicians_needed = int(technicians_needed)
            price = float(price)
            duration_minutes = int(duration_minutes)
            if duration_minutes <= 0:
                return jsonify({"message": "Duration must be a positive integer"}), 400
        except ValueError:
            return jsonify({"message": "Invalid numeric values"}), 400

        # Insert service into database, include duration_minutes column
        insert_query = '''
            INSERT INTO services 
            (service_type, category, name, technicians_needed, price, description, pest_type, duration_minutes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        '''
        cursor.execute(insert_query, (
            service_type,
            category,
            name,
            technicians_needed,
            price,
            description,
            pest_type,
            duration_minutes
        ))
        connection.commit()

        return jsonify({"message": "Service added successfully"}), 201

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
    connection = None
    cursor = None
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)

        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400
        
        update_fields = []
        values = []

        # List of allowed fields to update
        allowed_fields = [
            'name', 'description', 'price', 'technicians_needed', 
            'service_type', 'category', 'pest_type', 'duration_minutes'
        ]

        for field in allowed_fields:
            if field in data:
                # Validate numeric fields
                if field in ['price']:
                    try:
                        val = float(data[field])
                    except ValueError:
                        return jsonify({"message": f"Invalid value for {field}"}), 400
                elif field in ['technicians_needed', 'duration_minutes']:
                    try:
                        val = int(data[field])
                        if val < 0:
                            return jsonify({"message": f"{field} must be non-negative"}), 400
                    except ValueError:
                        return jsonify({"message": f"Invalid value for {field}"}), 400
                else:
                    val = data[field]
                update_fields.append(f"{field} = %s")
                values.append(val)

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

        if cursor.rowcount == 0:
            return jsonify({"message": "Service not found"}), 404

        return jsonify({"message": "Service updated successfully"}), 200

    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({"message": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

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
@admin_bp.route('/orders', methods=['GET'])
@token_required(role='admin')
def get_all_orders():
    try:
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)

        # Read optional query params
        status_filter = request.args.get('status')
        search_query = request.args.get('search')

        query = """
            SELECT 
                c.cart_id, c.user_id, c.product_id, c.quantity, c.delivery_address, 
                c.phone, c.order_date, c.status,
                s.name AS product_name, u.name AS user_name
            FROM cart c
            JOIN store s ON c.product_id = s.id
            JOIN users u ON c.user_id = u.id
            WHERE 1=1
        """
        params = []

        if status_filter:
            query += " AND c.status = %s"
            params.append(status_filter)

        if search_query:
            query += " AND (s.name LIKE %s OR u.name LIKE %s)"
            search_term = f"%{search_query}%"
            params.extend([search_term, search_term])

        query += " ORDER BY c.order_date DESC"

        cursor.execute(query, params)
        orders = cursor.fetchall()
        return jsonify({'orders': orders}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'Failed to fetch orders'}), 500

    finally:
        if cursor: cursor.close()
        if connection: connection.close()



@admin_bp.route('/orders/<int:cart_id>', methods=['PATCH'])
@token_required(role='admin')
def update_order_status(cart_id):
    data = request.get_json()
    status = data.get('status')
    if status not in ['shipped', 'cancelled']:
        return jsonify({'message': 'Invalid status'}), 400

    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("UPDATE cart SET status = %s WHERE cart_id = %s", (status, cart_id))
        connection.commit()
        return jsonify({'message': 'Order status updated'}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Server error'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
# Get all custom requests with user names
@admin_bp.route('/bookings/history', methods=['GET'])
@token_required(role="admin")
def get_booking_history():

    connection = create_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT 
        b.booking_id,
        b.booking_date,
        b.status,
        b.location_lat,
        b.location_lng,
        b.requirements,
        b.created_at as booking_created_at,
        b.updated_at as booking_updated_at,

        u.id as user_id,
        u.name as user_name,
        u.phone as user_phone,
        u.email as user_email,

        s.name as service_name,
        s.category,
        s.price,
        s.service_type,
        s.pest_type,
        s.technicians_needed,

        GROUP_CONCAT(tu.name SEPARATOR ', ') AS technicians_assigned

    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN services s ON b.service_id = s.service_id
    LEFT JOIN booking_technicians bt ON b.booking_id = bt.booking_id
    LEFT JOIN users tu ON bt.technician_id = tu.id AND tu.role = 'technician'

    GROUP BY b.booking_id
    ORDER BY b.booking_date DESC
    """

    cursor.execute(query)
    bookings = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({'success': True, 'data': bookings})
@admin_bp.route("/technician-leaves", methods=["GET"])
@token_required(role="admin")
def view_all_leaves():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""SELECT tu.*, u.name 
FROM technician_unavailable tu
JOIN users u ON tu.technician_id = u.id
WHERE tu.reason != 'job'
ORDER BY tu.created_at DESC;

    """)
    leaves = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(leaves)
@admin_bp.route("/technician-leaves/<int:leave_id>", methods=["PATCH"])
@token_required(role="admin")
def update_leave_status(leave_id):
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["approved", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = create_connection()
    cursor = conn.cursor()

    # Check if the leave exists
    cursor.execute("SELECT technician_id FROM technician_unavailable WHERE id = %s", (leave_id,))
    result = cursor.fetchone()
    if not result:
        cursor.close()
        conn.close()
        return jsonify({"error": "Leave not found"}), 404

    technician_id = result[0]

    # Update status
    cursor.execute("""
        UPDATE technician_unavailable SET status = %s WHERE id = %s
    """, (new_status, leave_id))
    conn.commit()

    # Insert notification
    cursor.execute("""
        INSERT INTO notifications (user_id, user_type, message, created_at)
        VALUES (%s, 'technician', %s, NOW())
    """, (
        technician_id,
        f"Your leave request has been {new_status} by admin."
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": f"Leave {new_status}"}), 200
