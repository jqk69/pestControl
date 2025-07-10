from flask import request, jsonify, Blueprint, current_app,g
from app.db import create_connection
from app.models import generate_sql,sentiment_pipeline
from ..utils.verify_token import token_required
import os
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import traceback
import requests
from dotenv import load_dotenv   
from langchain_huggingface import HuggingFaceEndpoint
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
import pandas as pd
import numpy as np
from surprise import Dataset, Reader, KNNBasic
import re


 
load_dotenv()
user_bp=Blueprint('user',__name__,url_prefix="/user")

def get_sqlalchemy_engine():
    return create_engine(f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}")

@user_bp.route("/services", methods=['GET'])
@token_required(role='user')
def get_services():
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT service_id, service_type, category, name, technicians_needed, price,pest_type, description FROM services WHERE 1"
        
        cursor.execute(query)
        services = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "services": services
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching services: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch services."
        }), 500
@user_bp.route("/service/<int:service_id>", methods=['GET'])
@token_required(role='user')
def get_service_detail(service_id):
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT service_id, service_type, category, name, technicians_needed, price, description
            FROM services
            WHERE service_id = %s
        """
        cursor.execute(query, (service_id,))
        service = cursor.fetchone()

        cursor.close()
        conn.close()

        if service:
            return jsonify({
                "success": True,
                "service": service
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Service not found"
            }), 404

    except Exception as e:
        current_app.logger.error(f"Error fetching service details: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch service details."
        }), 500
@user_bp.route("/service/<int:service_id>/book", methods=['POST'])
@token_required(role='user')
def book_service(service_id):
    try:
        data = request.get_json()
        user_id = int(g.current_user['sub'])

        booking_date = data['booking_date']  # Format: 'YYYY-MM-DD'
        location_lat = data['lat']
        location_lng = data['lng']
        requirements = data.get('requirements', '')

        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        now = datetime.utcnow()

        # 1. Insert into bookings
        insert_booking = """
            INSERT INTO bookings
            (user_id, service_id, booking_date, location_lat, location_lng, requirements, status, created_at, updated_at, feedback, sentiment)
            VALUES (%s, %s, %s, %s, %s, %s, 'pending', %s, %s, '', '')
        """
        cursor.execute(insert_booking, (
            user_id, service_id, booking_date, location_lat, location_lng, requirements, now, now
        ))
        booking_id = cursor.lastrowid

        # 2. Get number of technicians needed
        cursor.execute("SELECT technicians_needed FROM services WHERE service_id = %s", (service_id,))
        service = cursor.fetchone()
        if not service:
            return jsonify({"success": False, "message": "Service not found"}), 404
        tech_needed = service['technicians_needed']

        # 3. Find available technicians (exclude those unavailable that day)
        query_tech = """
            SELECT t.technician_id, COALESCE(MAX(b.booking_date), '1970-01-01') AS last_job_date
            FROM technicians t
            LEFT JOIN booking_technicians bt ON t.technician_id = bt.technician_id
            LEFT JOIN bookings b ON bt.booking_id = b.booking_id
            WHERE t.technician_id NOT IN (
                SELECT technician_id FROM technician_unavailable
                WHERE DATE(%s) BETWEEN DATE(start_datetime) AND DATE(end_datetime)
            )
            GROUP BY t.technician_id
            ORDER BY last_job_date ASC
            LIMIT %s
        """
        cursor.execute(query_tech, (booking_date, tech_needed))
        available_techs = cursor.fetchall()

        if len(available_techs) < tech_needed:
            return jsonify({
                "success": False,
                "message": "Not enough technicians available for the selected date"
            }), 400

        # 4. Assign technicians to booking and mark as unavailable
        insert_bt = "INSERT INTO booking_technicians (booking_id, technician_id) VALUES (%s, %s)"
        update_tech_last_job = "UPDATE technicians SET last_job = %s WHERE technician_id = %s"
        insert_unavailable = """
            INSERT INTO technician_unavailable
            (technician_id, start_datetime, end_datetime, reason, status)
            VALUES (%s, %s, %s, 'job', 'approved')
        """

        # Set the full day range
        start_dt = datetime.strptime(booking_date, "%Y-%m-%d %H:%M:%S")
        end_dt = start_dt + timedelta(days=1)

        for tech in available_techs:
            tid = tech['technician_id']
            cursor.execute(insert_bt, (booking_id, tid))
            cursor.execute(update_tech_last_job, (now, tid))
            cursor.execute(insert_unavailable, (tid, start_dt, end_dt))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Service booked successfully",
            "booking_id": booking_id,
            "assigned_technicians": [t['technician_id'] for t in available_techs]
        }), 201

    except Exception as e:
        current_app.logger.error(f"Booking error: {traceback.format_exc()}")
        return jsonify({
            "success": False,
            "message": "Failed to book service.",
            "error": str(e)
        }), 500

@user_bp.route('/bookings', methods=['GET'])
@token_required(role='user')
def get_user_bookings():
    user_id = int(g.current_user['sub'])

    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT
                b.booking_id,
                b.booking_date,
                b.status,
                s.name AS service_name,
                s.price AS bill_amount,
                u.name AS technician_name,
                u.phone AS technician_phone,
                b.location_lat,
                b.location_lng,feedback
            FROM bookings b
            JOIN services s ON b.service_id = s.service_id
            LEFT JOIN booking_technicians bt ON b.booking_id = bt.booking_id
            LEFT JOIN technicians t ON bt.technician_id = t.technician_id
            LEFT JOIN users u ON t.technician_id = u.id
            WHERE b.user_id = %s
            ORDER BY b.booking_date DESC
        """

        cursor.execute(query, (user_id,))
        bookings = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({"bookings": bookings}), 200

    except Exception as e:
        print("Booking history error:", e)
        return jsonify({"error": "Failed to retrieve bookings"}), 500
@user_bp.route('/bookings/<int:booking_id>', methods=['GET'])
@token_required(role='user')
def get_booking(booking_id):
    user_id = g.current_user['sub']

    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch booking info + related user info
        query = """SELECT b.booking_id, b.user_id, b.service_id, s.price AS amount
FROM bookings b
JOIN services s ON b.service_id = s.service_id
WHERE b.booking_id = %s AND b.user_id = %s

        """
        cursor.execute(query, (booking_id, user_id))
        booking = cursor.fetchone()

        if not booking:
            return jsonify({"success": False, "message": "Booking not found"}), 404

        return jsonify(booking)

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@user_bp.route('/cart', methods=['GET'])
@token_required(role='user')
def get_cart():
    user = g.current_user
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT c.cart_id, c.quantity, s.id AS product_id, s.name, s.description, s.price, s.image_path
        FROM cart c
        JOIN store s ON c.product_id = s.id
        WHERE c.user_id = %s AND c.status = 'in_cart'
    """
    cursor.execute(query, (user['sub'],))
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({'items': items})


@user_bp.route('/cart/add', methods=['POST'])
@token_required(role='user')
def add_to_cart():
    user = g.current_user
    data = request.json
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT inventory_amount FROM store WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    if product[0] < quantity:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Not enough inventory'}), 400

    cursor.execute("SELECT quantity FROM cart WHERE user_id = %s AND product_id = %s AND status = 'in_cart'",
                   (user['sub'], product_id))
    existing = cursor.fetchone()
    if existing:
        new_qty = existing[0] + quantity
        if product[0] < new_qty:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Not enough inventory for update'}), 400
        cursor.execute("UPDATE cart SET quantity = %s, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s AND product_id = %s AND status = 'in_cart'",
                       (new_qty, user['sub'], product_id))
    else:
        cursor.execute("INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
                       (user['sub'], product_id, quantity))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Added to cart successfully'})


@user_bp.route('/cart/remove/<int:product_id>', methods=['DELETE'])
@token_required(role='user')
def remove_from_cart(product_id):
    user = g.current_user

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM cart WHERE user_id = %s AND product_id = %s AND status = 'in_cart'
    """, (user['sub'], product_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Item removed from cart'})
@user_bp.route('/cart/confirm-payment', methods=['POST'])
@token_required(role='user')
def confirm_payment():
    user = g.current_user
    data = request.get_json()

    cart_ids = data.get('cart_ids')
    delivery_address = data.get('delivery_address')
    phone = data.get('phone')
    razorpay_payment_id = data.get('razorpay_payment_id')  # you can store or ignore

    if not cart_ids or not delivery_address or not phone:
        return jsonify({'error': 'Missing fields'}), 400

    try:
        conn = create_connection()
        cursor = conn.cursor()

        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        placeholders = ','.join(['%s'] * len(cart_ids))

        query = f"""
            UPDATE cart
            SET status = 'ordered',
                delivery_address = %s,
                phone = %s,
                order_date = %s,
                updated_at = %s
            WHERE cart_id IN ({placeholders}) AND user_id = %s
        """

        params = [delivery_address, phone, now, now, *cart_ids, user['sub']]
        cursor.execute(query, params)
        conn.commit()

        cursor.close()
        conn.close()
        return jsonify({'message': 'Order placed successfully'}), 200

    except Exception as e:
        print("Confirm payment error:", e)
        return jsonify({'error': 'Internal server error'}), 500
@user_bp.route('/cart/orders', methods=['GET'])
@token_required(role='user')
def get_orders():
    user_id = g.current_user['sub']  # or g.current_user['id'] depending on your token payload
    try:
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                c.cart_id,
                c.product_id,
                c.quantity,
                c.status,
                c.delivery_address,
                c.phone,
                c.order_date,
                s.name,
                s.price,
                s.category,
                s.image_path
            FROM cart c
            JOIN store s ON c.product_id = s.id
            WHERE c.user_id = %s AND c.status != 'in_cart'
            ORDER BY c.order_date DESC
        """, (user_id,))
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'orders': orders})
    except Exception as e:
        print("Error fetching orders:", e)
        return jsonify({'error': 'Internal Server Error'}), 500
@user_bp.route('/booking-locations', methods=['GET'])
@token_required(role="user")
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
@user_bp.route("/predict-pest",methods=['POST'])
@token_required(role='user')
def predict_species():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded'}), 400

    file = request.files['file']
    files = {'image': (file.filename, file.stream, file.content_type)}

    try:
        response = requests.post(
            'https://api.inaturalist.org/v1/computervision/score_image',
            files=files
        )
        data = response.json()

        if 'results' in data and data['results']:
            top_result = data['results'][0]['taxon']
            return jsonify({
                'success': True,
                'predicted_class': top_result.get('preferred_common_name', 'Unknown'),
                'scientific_name': top_result.get('name', 'Unknown')
            })
        else:
            return jsonify({'success': False, 'message': 'No match found'})

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'message': 'Prediction failed'})


llm = HuggingFaceEndpoint(
    repo_id="tencent/Hunyuan-A13B-Instruct",
    provider="hf-inference",  # Explicitly set a supported provider
    temperature=0.5,
    max_new_tokens=150,
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
)

@user_bp.route("/chat", methods=["POST"])
def user_chat():
    # Validate request
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        # Call LLM with request to keep it short
        bot_reply = llm.invoke(f"{user_message}, answer as short and clearly formatted list if needed")

        # Validate response
        if not bot_reply or not isinstance(bot_reply, str):
            return jsonify({"error": "Invalid response from AI service"}), 500

        # Format response to insert newlines after numbered items
        formatted_reply = bot_reply
        formatted_reply = formatted_reply.replace(". ", ".\n")  # New line after numbered points
        formatted_reply = "\n".join(line.strip() for line in formatted_reply.splitlines() if line.strip())
        return jsonify({"reply": formatted_reply})

    except Exception as e:
        # Proper error logging
        print(f"Error calling LLM: {str(e)}")
        return jsonify({"error": "AI service unavailable"}), 503
    

def get_hybrid_recommendations(user_id, engine):
    """Enhanced recommendation system combining multiple approaches"""
    # Load all necessary data
    store_df = pd.read_sql("SELECT id, name, category, description FROM store", engine)
    cart_df = pd.read_sql(f"""
        SELECT product_id 
        FROM cart 
        WHERE user_id = {user_id} AND status != 'in_cart'
    """, engine)
    
    if cart_df.empty or store_df.empty:
        return []

    # 1. Content-Based (TF-IDF) - Improved version
    store_df['text'] = (
        store_df['name'] + ' ' + 
        store_df['category'] + ' ' + 
        store_df['description'].fillna('')
    )
    
    # Improved text preprocessing
    tfidf = TfidfVectorizer(
        stop_words='english',
        min_df=2,  # Ignore terms that appear in only 1 product
        max_df=0.8  # Ignore terms that appear in >80% of products
    )
    tfidf_matrix = tfidf.fit_transform(store_df['text'])

    # 2. Collaborative Filtering (if we have purchase history)
    try:
        ratings_data = pd.read_sql(f"""
            SELECT 
                user_id, 
                product_id, 
                CASE 
                    WHEN status = 'delivered' THEN 5 
                    WHEN status = 'shipped' THEN 3 
                    ELSE 1 
                END as rating
            FROM cart 
            WHERE user_id = {user_id} AND status != 'in_cart'
        """, engine)
        
        if not ratings_data.empty:
            reader = Reader(rating_scale=(1, 5))
            data = Dataset.load_from_df(ratings_data[['user_id', 'product_id', 'rating']], reader)
            trainset = data.build_full_trainset()
            sim_options = {'name': 'cosine', 'user_based': False}
            algo = KNNBasic(sim_options=sim_options)
            algo.fit(trainset)
    except Exception as e:
        print(f"Collaborative filtering skipped: {str(e)}")

    # Get cart items
    cart_product_ids = cart_df['product_id'].unique().tolist()
    cart_indices = store_df[store_df['id'].isin(cart_product_ids)].index.tolist()

    if not cart_indices:
        return []

    # Hybrid scoring
    def calculate_scores(product_id):
        # Content-based score
        idx = store_df[store_df['id'] == product_id].index[0]
        content_score = cosine_similarity(
            np.asarray(tfidf_matrix[cart_indices].mean(axis=0)).reshape(1, -1),
            np.asarray(tfidf_matrix[idx].toarray()).reshape(1, -1)
        )[0][0]

        
        # Collaborative score (if available)
        collab_score = 0
        if not ratings_data.empty:
            try:
                pred = algo.predict(user_id, product_id)
                collab_score = pred.est / 5  # Normalize to 0-1
            except:
                pass
        
        # Combine scores (weighted)
        return 0.7 * content_score + 0.3 * collab_score

    # Calculate scores for all products not in cart
    recommendations = store_df[~store_df['id'].isin(cart_product_ids)].copy()
    recommendations['similarity'] = recommendations['id'].apply(calculate_scores)
    
    # Get top 3 recommendations
    top_recommendations = recommendations.sort_values(
        by='similarity', 
        ascending=False
    ).head(3)

    return top_recommendations[['id', 'name', 'category', 'description']].to_dict(orient='records')


@user_bp.route("/store", methods=["GET"])
@token_required(role='user')
def get_user_store():
    try:
        conn = create_connection()  # For cursor use
        engine = get_sqlalchemy_engine()  # For pandas
        current_user = g.current_user

        # Fetch all items using cursor
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM store")
        items = cursor.fetchall()

        # Get recommendations using the improved engine
        recommended_items = get_hybrid_recommendations(current_user['sub'], engine)

        return jsonify({
    "success": True,
    "items": items,
    "recommended": recommended_items
})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500 # Replace with your function that calls HuggingFace

@user_bp.route("/generate-report", methods=["POST"])
def generate_report():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Please provide a question."}), 400

    # Step 1: Get raw SQL from LLM
    raw_sql = generate_sql(question)
    print("Raw SQL from LLM:", raw_sql)  # Debug only

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
@user_bp.route("/feedback", methods=["PATCH"])
@token_required(role="user")
def submit_feedback():
    try:
        data = request.get_json()
        booking_id = data.get("booking_id")
        feedback_text = data.get("feedback", "").strip()

        if not booking_id or not feedback_text:
            return jsonify({"error": "Missing booking_id or feedback"}), 400

        user_id = g.current_user["sub"]

        conn = create_connection()
        cursor = conn.cursor()

        # Verify ownership
        cursor.execute("SELECT booking_id FROM bookings WHERE booking_id = %s AND user_id = %s", (booking_id, user_id))
        if not cursor.fetchone():
            return jsonify({"error": "Booking not found or unauthorized"}), 403

        # Sentiment prediction
        result = sentiment_pipeline(feedback_text)[0]
        label = result['label'].lower()  # "positive" or "negative"
        if label not in ['positive', 'negative']:
            label = 'neutral'

        # Update DB
        cursor.execute("""
            UPDATE bookings
            SET feedback = %s, sentiment = %s
            WHERE booking_id = %s
        """, (feedback_text, label, booking_id))
        conn.commit()

        return jsonify({"message": "Feedback submitted", "sentiment": label}), 200

    except Exception as e:
        print("Error in submit_feedback:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        if conn:
            cursor.close()
            conn.close()
@user_bp.route('/buysingle/<int:product_id>', methods=['POST'])
@token_required(role='user')
def buy_single(product_id):
    user = g.current_user
    data = request.get_json()
    quantity = data.get('quantity', 1)

    conn = create_connection()
    cursor = conn.cursor()

    # Validate product and inventory
    cursor.execute("SELECT inventory_amount FROM store WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    if product[0] < quantity:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Not enough inventory'}), 400

    # Insert into cart with status='in_cart' (or update if already present)
    cursor.execute("""
        SELECT cart_id, quantity FROM cart 
        WHERE user_id = %s AND product_id = %s AND status = 'in_cart'
    """, (user['sub'], product_id))
    existing = cursor.fetchone()

    if existing:
        new_qty = existing[1] + quantity
        if product[0] < new_qty:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Not enough inventory for update'}), 400
        cursor.execute("""
            UPDATE cart 
            SET quantity = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE cart_id = %s
        """, (new_qty, existing[0]))
        cart_id = existing[0]
    else:
        cursor.execute("""
            INSERT INTO cart (user_id, product_id, quantity) 
            VALUES (%s, %s, %s)
        """, (user['sub'], product_id, quantity))
        cart_id = cursor.lastrowid

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Buy now item inserted into cart', 'cart_id': cart_id})
@user_bp.route('/blogs', methods=['GET'])
@token_required(role='user')
def list_all_blogs():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, title,date
        FROM blog_posts
        ORDER BY date DESC
    """)
    blogs = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({'blogs': blogs})
@user_bp.route('/blogs/<int:blog_id>', methods=['GET'])
@token_required(role='user')
def view_blog(blog_id):
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, title, content, date
        FROM blog_posts
        WHERE id = %s
    """, (blog_id,))
    blog = cursor.fetchone()

    cursor.close()
    conn.close()

    if not blog:
        return jsonify({'error': 'Blog not found'}), 404

    return jsonify({'blog': blog})
