from flask import request, jsonify, Blueprint, current_app, g
from app.db import create_connection
from ..utils.verify_token import token_required

payment_bp = Blueprint('payment', __name__, url_prefix="/payment")

import traceback

@payment_bp.route('/verify', methods=['POST'])
@token_required()
def verify_payment_test():
    data = request.json
    booking_id = data.get('booking_id')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_signature = data.get('razorpay_signature')
    amount = data.get('amount')

    try:
        conn = create_connection()
        cursor = conn.cursor()

        cursor.execute("""INSERT INTO payments (booking_id, razorpay_payment_id, amount, status)
        VALUES (%s, %s, %s, 'success')
        """, (booking_id, razorpay_payment_id,amount))

        cursor.execute("""
            UPDATE bookings SET status = 'confirmed' WHERE booking_id = %s
        """, (booking_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'message': 'Payment recorded and booking confirmed'})

    except Exception as e:
        error_trace = traceback.format_exc()
        current_app.logger.error(f"Payment verify error: {error_trace}")
        return jsonify({'status': 'failure', 'message': str(e)}), 500
