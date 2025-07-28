from flask import request, jsonify, Blueprint,g
from app.db import create_connection
from ..utils.verify_token import token_required
from ..utils.grok_model import CreateMessage
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import re
from app.models.agent.blog_agent import run_weekly_blog_pipeline

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
        b.sentiment,
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
@admin_bp.route('/blogs', methods=['GET'])
@token_required(role='admin')
def get_all_blogs():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM blog_posts ORDER BY date DESC")
    blogs = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({'blogs': blogs})
@admin_bp.route('/blogs/<int:blog_id>', methods=['GET'])
@token_required(role='admin')
def get_blog(blog_id):
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM blog_posts WHERE id = %s", (blog_id,))
    blog = cursor.fetchone()
    cursor.close()
    conn.close()
    if blog:
        return jsonify({'blog': blog})
    return jsonify({'error': 'Blog not found'}), 404
@admin_bp.route('/blogs/<int:blog_id>', methods=['DELETE'])
@token_required(role='admin')
def delete_blog(blog_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM blog_posts WHERE id = %s", (blog_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Blog deleted successfully'})
def time_ago(dt):
    now = datetime.utcnow()
    delta = now - dt
    seconds = delta.total_seconds()
    if seconds < 60:
        return f"{int(seconds)} seconds ago"
    minutes = seconds / 60
    if minutes < 60:
        return f"{int(minutes)} minute{'s' if minutes != 1 else ''} ago"
    hours = minutes / 60
    if hours < 24:
        return f"{int(hours)} hour{'s' if hours != 1 else ''} ago"
    days = hours / 24
    return f"{int(days)} day{'s' if days != 1 else ''} ago"
@admin_bp.route('/reports', methods=['GET'])
@token_required(role="admin")
def get_reports():
    connection = create_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    cursor = connection.cursor(dictionary=True)

    try:
        # Total Revenue from Payments
        cursor.execute("""SELECT 
    (
        SELECT COALESCE(SUM(s.price), 0)
        FROM bookings b
        JOIN services s ON b.service_id = s.service_id
        WHERE b.status = 'completed'
        AND YEAR(b.booking_date) = YEAR(CURRENT_DATE)
        AND MONTH(b.booking_date) = MONTH(CURRENT_DATE)
    ) +
    (
        SELECT COALESCE(SUM(c.quantity * s.price), 0)
        FROM cart c
        JOIN store s ON c.product_id = s.id
        WHERE c.status IN ('ordered', 'shipped', 'delivered')
        AND YEAR(c.updated_at) = YEAR(CURRENT_DATE)
        AND MONTH(c.updated_at) = MONTH(CURRENT_DATE)
    ) AS totalRevenue;


        """)
        total_revenue = float(cursor.fetchone()['totalRevenue'])

        # Total Users
        cursor.execute("""
            SELECT COUNT(*) as totalUsers
            FROM users
            WHERE role = 'user' AND status = 'active'
        """)
        total_users = int(cursor.fetchone()['totalUsers'])

        # Total Services
        cursor.execute("""
            SELECT COUNT(*) as totalServices
            FROM services
        """)
        total_services = int(cursor.fetchone()['totalServices'])

        # Completed Bookings
        cursor.execute("""
            SELECT COUNT(*) as completedBookings
            FROM bookings
            WHERE status = 'completed'
        """)
        completed_bookings = int(cursor.fetchone()['completedBookings'])

        # Monthly Revenue Using Service Prices via Bookings
        cursor.execute("""
SELECT 
(
    SELECT COALESCE(SUM(s.price), 0)
    FROM bookings b
    JOIN services s ON b.service_id = s.service_id
    WHERE b.status = 'completed'
    AND YEAR(b.booking_date) = YEAR(CURRENT_DATE)
    AND MONTH(b.booking_date) = MONTH(CURRENT_DATE)
) +
(
    SELECT COALESCE(SUM(c.quantity * s.price), 0)
    FROM cart c
    JOIN store s ON c.product_id = s.id
    WHERE c.status IN ('ordered', 'shipped', 'delivered')
    AND YEAR(c.updated_at) = YEAR(CURRENT_DATE)
    AND MONTH(c.updated_at) = MONTH(CURRENT_DATE)
) AS revenue
""")

        current_revenue = float(cursor.fetchone()['revenue'])

        # Previous Month Revenue (also from services via bookings)
        cursor.execute("""
    SELECT 
    (
        SELECT COALESCE(SUM(s.price), 0)
        FROM bookings b
        JOIN services s ON b.service_id = s.service_id
        WHERE b.status = 'completed'
        AND YEAR(b.booking_date) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
        AND MONTH(b.booking_date) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
    ) +
    (
        SELECT COALESCE(SUM(c.quantity * s.price), 0)
        FROM cart c
        JOIN store s ON c.product_id = s.id
        WHERE c.status IN ('ordered', 'shipped', 'delivered')
        AND YEAR(c.updated_at) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
        AND MONTH(c.updated_at) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
    ) AS revenue
    """)

        last_revenue = float(cursor.fetchone()['revenue'])


        monthly_growth = round((current_revenue - last_revenue) / last_revenue * 100, 1) if last_revenue > 0 else (100.0 if current_revenue > 0 else 0.0)

        # Top Services
        cursor.execute("""
            SELECT s.name, COUNT(b.booking_id) as bookings
            FROM services s
            LEFT JOIN bookings b ON s.service_id = b.service_id
            GROUP BY s.service_id, s.name
            ORDER BY bookings DESC
            LIMIT 3
        """)
        top_services = [
            {'name': row['name'], 'bookings': int(row['bookings'])}
            for row in cursor.fetchall()
        ]

        # Recent Activity
        cursor.execute("""
            (
                SELECT 'New user registration' as action, created_at as time
                FROM users
                WHERE role = 'user'
                ORDER BY created_at DESC
                LIMIT 3
            ) UNION (
                SELECT 'Service booking completed' as action, updated_at as time
                FROM bookings
                WHERE status = 'completed'
                ORDER BY updated_at DESC
                LIMIT 3
            ) UNION (
                SELECT 'Payment received' as action, created_at as time
                FROM payments
                WHERE status = 'completed'
                ORDER BY created_at DESC
                LIMIT 3
            )
            ORDER BY time DESC
            LIMIT 3
        """)
        recent_activity = [
            {'action': row['action'], 'time': time_ago(row['time'])}
            for row in cursor.fetchall()
        ]

        return jsonify({
            'success': True,
            'data': {
                'totalRevenue': total_revenue,
                'totalUsers': total_users,
                'totalServices': total_services,
                'completedBookings': completed_bookings,
                'monthlyGrowth': monthly_growth,
                'topServices': top_services,
                'recentActivity': recent_activity,
                'monthlyServiceBasedIncome': current_revenue 
            }
        })

    except Exception as e:
        print(f"Error fetching reports: {str(e)}")
        return jsonify({'success': False, 'message': f'Failed to fetch reports: {str(e)}'}), 500

    finally:
        cursor.close()
        connection.close()
@admin_bp.route("/generate-report", methods=["POST"])
def generate_report():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Please provide a question."}), 400
    prompt=""" You are an expert MySQL query generator.  
            Only output a single valid and optimized SELECT SQL query.  

            Do NOT include any comments, explanations, or additional text.  
            Only output raw SQL starting with the SELECT statement.  

            Schema:  
            blog_posts(id, title, content, created_at, author_id) -- blog - details  
            bookings(booking_id, user_id, service_id, booking_date, location_lat, location_lng, requirements, status, created_at, updated_at) -- service - booking details -- status can be pending,confirmed,completed,cancelled
            booking_technicians(id, booking_id, technician_id, assigned_at) -- technician details related to bookings  
            cart(cart_id, user_id, product_id, quantity, status, delivery_address, phone, order_date, updated_at) -- products order details  status can be -- in_cart,ordered,shipped,delivered,cancelled
            notifications(id, user_type, message, created_at, user_id) -- different notifications  
            otp_verifications(id, user_id, otp_code, created_at, expires_at) -- otp for service  
            payments(payment_id, booking_id, razorpay_payment_id, amount, status, created_at) -- razorpay details on service payments  
            salary(id, technician_id, amount, month, year, issued_at) -- technician salaries  
            store(id, name, description, price, category, image_path, inventory_amount) -- pest control product store data  
            services(service_id, service_type, category, name, technicians_needed, price, description, duration_minutes, pest_type) -- service related info  
            technicians(technician_id, skills, experience_years, salary, last_job) -- additional info for technicians  
            technician_unavailable(id, technician_id, start_datetime, end_datetime, reason, created_at) -- technician unavailability details (could be job or leave)  
            users(id, username, password, role, created_at, name, phone, email, status) -- user details    """

    # Step 1: Get raw SQL from LLM
    content = CreateMessage(question,prompt)
    raw_sql=content.content
    print(raw_sql)
    # Step 2: Extract SELECT query from any text
    match = re.search(r"(?i)select\s.+", raw_sql.strip(), re.DOTALL)
    if not match:
        return jsonify({'error': 'Only SELECT queries are allowed.'}), 500

    sql = match.group(0).strip()
    sql_lower = sql.lower()

    # Step 3: Block unsafe keywords and patterns
    unsafe_keywords = ["⚠️", "drop", "delete", "update", "insert", "--", "/*", "alter"]
    if any(bad in sql_lower for bad in unsafe_keywords):
        return jsonify({"message":"dangerous queries detected"})

    semicolon_count = sql.count(";")
    if semicolon_count > 1 or (semicolon_count == 1 and not sql.strip().endswith(";")):
        pass

    # Strip trailing semicolon safely
    sql = sql.rstrip(";").strip()

    # Step 4: Verify allowed tables only
    allowed_tables = {
        "bookings", "booking_technicians", "cart", "notifications", "payments",
        "services", "store", "technicians", "technician_unavailable", "users"
    }
    used_tables = set(re.findall(r'from\s+(\w+)|join\s+(\w+)', sql_lower))
    used_tables = {tbl for pair in used_tables for tbl in pair if tbl}

    if not used_tables.intersection(allowed_tables):
        return jsonify({'error': 'SQL must be a SELECT query targeting allowed tables.'}), 500

    # Step 5: Execute query
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(sql)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in rows]
        print(results)

        return jsonify({
            'sql': sql,
            'results': results,
            'message': 'Query executed successfully.'
        })

    except Exception as e:
        print("Database Error:", str(e))
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    finally:
        if conn:
            conn.close() 
@admin_bp.route('/run-weekly-blog', methods=['POST'])
def run_weekly_blog():
    try:
        run_weekly_blog_pipeline()
        return jsonify({'status': 'success', 'message': 'Blog generated and saved successfully'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
@token_required(role='admin')
@admin_bp.route('/stats', methods=['GET'])
def get_admin_stats():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    
    if connection is None:
        return jsonify({"message": "Server not found"}), 404

    try:
        cursor.execute("SELECT COUNT(*) AS total_orders FROM bookings")
        total_orders = cursor.fetchone()['total_orders']

        cursor.execute("SELECT COUNT(*) AS pending_requests FROM bookings WHERE status = 'pending'")
        pending_requests = cursor.fetchone()['pending_requests']

        cursor.execute("SELECT COUNT(*) AS total_products FROM store")
        total_products = cursor.fetchone()['total_products']

        cursor.execute("SELECT COUNT(*) AS total_services FROM services")
        total_services = cursor.fetchone()['total_services']

        return jsonify({
            "total_orders": total_orders,
            "pending_requests": pending_requests,
            "total_products": total_products,
            "total_services": total_services
        })

    except Exception as e:
        return jsonify({"message": "Something went wrong", "error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()
@admin_bp.route('/booking-locations', methods=['GET'])
@token_required(role="admin")
def get_all_booking_locations():
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                b.booking_id, 
                b.location_lat, 
                b.location_lng, 
                b.status,
                s.pest_type
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.service_id
            WHERE b.location_lat IS NOT NULL AND b.location_lng IS NOT NULL
        """
        cursor.execute(query)
        bookings = cursor.fetchall()

        return jsonify({
            "success": True,
            "locations": bookings
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error fetching locations",
            "error": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()
