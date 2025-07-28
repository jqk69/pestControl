from flask import request, jsonify, Blueprint, current_app,g
from app.db import create_connection
from ..utils.verify_token import token_required
import os
from datetime import datetime, timedelta
import traceback
import requests
from dotenv import load_dotenv  
import traceback

load_dotenv()

tech_bp=Blueprint("technician",__name__,url_prefix="/technician")

def serialize_datetimes(obj):
    if isinstance(obj, list):
        return [serialize_datetimes(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in obj.items()}
    return obj

@tech_bp.route("/dashboard", methods=["GET"])
@token_required(role="technician")
def home():
    try:
        technician_id = g.current_user["sub"]  # from token

        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Today’s assigned services
        cursor.execute("""
            SELECT b.booking_id, s.name AS service_type, b.booking_date, b.status, b.location_lat, b.location_lng
            FROM bookings b
            JOIN booking_technicians bt ON b.booking_id = bt.booking_id
            JOIN services s ON b.service_id = s.service_id
            WHERE bt.technician_id = %s AND DATE(b.booking_date) = CURDATE()
            ORDER BY b.booking_date ASC
        """, (technician_id,))
        todays_services = cursor.fetchall()

        # 2. Upcoming services (future)
        cursor.execute("""
            SELECT b.booking_id, s.name AS service_type, b.booking_date, b.status
            FROM bookings b
            JOIN booking_technicians bt ON b.booking_id = bt.booking_id
            JOIN services s ON b.service_id = s.service_id
            WHERE bt.technician_id = %s AND b.booking_date > NOW()
            ORDER BY b.booking_date ASC
        """, (technician_id,))
        upcoming_services = cursor.fetchall()

        # 3. Service history (past and completed)
        cursor.execute("""
            SELECT b.booking_id, s.name AS service_type, b.booking_date, b.status
            FROM bookings b
            JOIN booking_technicians bt ON b.booking_id = bt.booking_id
            JOIN services s ON b.service_id = s.service_id
            WHERE bt.technician_id = %s AND b.status = 'completed'
            ORDER BY b.booking_date DESC
        """, (technician_id,))
        service_history = cursor.fetchall()

        # 4. Availability info
        cursor.execute("""
            SELECT start_datetime, end_datetime, reason,status
            FROM technician_unavailable
            WHERE technician_id = %s AND end_datetime >= NOW() and reason !='job' and status = 'approved'
            ORDER BY start_datetime ASC
        """, (technician_id,))
        upcoming_unavailability = cursor.fetchall()

        # 5. Earnings summary (sum of payment amounts)
        cursor.execute("""
            SELECT SUM(s.salary) as total_earned
            FROM salary s where technician_id =%s
        """, (technician_id,))
        earnings = cursor.fetchone()

        # 6. Latest notifications (limit 5)
        cursor.execute("""
            SELECT id, message, created_at
            FROM notifications
            WHERE user_type = 'technician' 
            AND user_id = %s
            AND is_seen = FALSE
            ORDER BY created_at DESC
            LIMIT 5
        """, (technician_id,))
        notifications = cursor.fetchall()

        # ✅ Convert datetime fields to ISO strings for frontend
        from datetime import timezone

        def format_datetime_fields(items, keys):
            for item in items:
                for key in keys:
                    if key in item and isinstance(item[key], (str, bytes)) is False:
                        # Convert to UTC and then to ISO string
                        item[key] = item[key].astimezone(timezone.utc).isoformat()
            return items


        format_datetime_fields(todays_services, ["booking_date"])
        format_datetime_fields(upcoming_services, ["booking_date"])
        format_datetime_fields(service_history, ["booking_date"])
        format_datetime_fields(upcoming_unavailability, ["start_datetime", "end_datetime"])
        format_datetime_fields(notifications, ["created_at"])

        return jsonify({
            "success": True,
            "today_services": todays_services,
            "upcoming_services": upcoming_services,
            "service_history": service_history,
            "availability": upcoming_unavailability,
            "earnings": earnings.get("total_earned", 0),
            "notifications": notifications
        })

    except Exception as e:
        print("Error:", e)
        current_app.logger.error(f"Technician dashboard error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500
@tech_bp.route("/assigned-services", methods=["GET"])
@token_required(role="technician")
def get_assigned_services():
    try:
        technician_id = g.current_user["sub"]
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
                    SELECT 
                        b.booking_id, 
                        s.name AS service_name, 
                        b.booking_date, 
                        b.status, 
                        b.location_lat, 
                        b.location_lng,
                        u.username
                    FROM bookings b
                    JOIN booking_technicians bt ON b.booking_id = bt.booking_id
                    JOIN services s ON b.service_id = s.service_id
                    JOIN users u ON b.user_id = u.id
                    WHERE bt.technician_id = %s
                    ORDER BY b.booking_date ASC;
        """, (technician_id,))
        assigned_services = cursor.fetchall()

        return jsonify({"assigned_services": assigned_services})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
@tech_bp.route("/service/<int:booking_id>", methods=["GET"])
@token_required(role="technician")
def get_service_detail(booking_id):
    technician_id = g.current_user["sub"]
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            b.booking_id,
            b.booking_date,
            b.status,
            b.location_lat,
            b.location_lng,
            b.created_at,
            b.updated_at,
            b.requirements,
            s.name AS service_name,
            u.id AS user_id,
            u.name AS user_name,
            u.phone AS user_phone,
            u.email AS user_email
        FROM bookings b
        JOIN booking_technicians bt ON b.booking_id = bt.booking_id
        JOIN services s ON b.service_id = s.service_id
        JOIN users u ON b.user_id = u.id
        WHERE b.booking_id = %s AND bt.technician_id = %s
    """, (booking_id, technician_id))

    details = cursor.fetchone()
    
    if not details:
        return jsonify({"success": False, "message": "Booking not found"}), 404

    return jsonify({
        "success": True,
        "details": details
    })
import random
from datetime import datetime, timedelta

@tech_bp.route("/send_otp/<int:booking_id>", methods=["POST"])
@token_required(role="technician")
def send_otp(booking_id):
    technician_id = g.current_user["sub"]
    conn = create_connection()
    cursor = conn.cursor()

    # Check if the booking belongs to this technician
    cursor.execute("""
        SELECT b.user_id FROM bookings b
        JOIN booking_technicians bt ON b.booking_id = bt.booking_id
        WHERE b.booking_id = %s AND bt.technician_id = %s
    """, (booking_id, technician_id))
    result = cursor.fetchone()
    if not result:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    user_id = result[0]
    otp = str(random.randint(100000, 999999))

    # Store OTP
    cursor.execute("""
        INSERT INTO otp_verifications (booking_id, otp, expires_at, verified)
        VALUES (%s, %s, %s, FALSE)
        ON DUPLICATE KEY UPDATE otp=%s, expires_at=%s, verified=FALSE
    """, (
        booking_id, otp, datetime.utcnow() + timedelta(minutes=5),
        otp, datetime.utcnow() + timedelta(minutes=5)
    ))
    conn.commit()

    # Optional: Send OTP via SMS/email here using a service like Twilio or SMTP
    print(f"Send OTP {otp} to user_id {user_id}")

    return jsonify({"success": True, "message": "OTP sent to user"})
@tech_bp.route("/verify_otp/<int:booking_id>", methods=["POST"])
@token_required(role="technician")
def verify_otp(booking_id):
    data = request.get_json()
    input_otp = data.get("otp")
    technician_id = g.current_user["sub"]

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT otp, expires_at, verified FROM otp_verifications
        WHERE booking_id = %s
    """, (booking_id,))
    result = cursor.fetchone()

    if not result:
        return jsonify({"success": False, "message": "OTP not sent"}), 400

    otp, expires_at, verified = result

    if verified:
        return jsonify({"success": False, "message": "OTP already used"}), 400

    if otp != input_otp:
        return jsonify({"success": False, "message": "Invalid OTP"}), 401

    if datetime.utcnow() > expires_at:
        return jsonify({"success": False, "message": "OTP expired"}), 410

    # Mark as verified
    cursor.execute("""
        UPDATE otp_verifications SET verified = TRUE WHERE booking_id = %s
    """, (booking_id,))

    # Update booking status
    cursor.execute("""
        UPDATE bookings SET status = 'completed', updated_at = NOW()
        WHERE booking_id = %s
    """, (booking_id,))

    conn.commit()
    return jsonify({"success": True, "message": "Booking marked as completed"})

@tech_bp.route("/leaves", methods=["GET"])
@token_required(role="technician")
def get_technician_leave():
    technician_id = g.current_user["sub"]
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, start_datetime, end_datetime, reason, created_at,status
        FROM technician_unavailable
        WHERE technician_id = %s and reason !='job'
        ORDER BY start_datetime DESC
    """, (technician_id,))
    return jsonify(cursor.fetchall())
@tech_bp.route("/leaves", methods=["POST"])
@token_required(role="technician")
def apply_leave():
    data = request.json
    technician_id = g.current_user["sub"]

    start = data.get("start_datetime")
    end = data.get("end_datetime")
    reason = data.get("reason")

    if not start or not end:
        return jsonify({"message": "Start and end time required"}), 400

    conn = create_connection()
    cursor = conn.cursor()

    # Check for overlapping entries (leave or job)
    cursor.execute("""
        SELECT reason FROM technician_unavailable
        WHERE technician_id = %s
          AND (
                (start_datetime <= %s AND end_datetime >= %s) OR
                (start_datetime <= %s AND end_datetime >= %s) OR
                (start_datetime >= %s AND end_datetime <= %s)
              )
    """, (technician_id, start, start, end, end, start, end))

    conflict = cursor.fetchone()
    if conflict:
        reason_text = conflict[0].lower()
        if reason_text == "job":
            message = "You have a job assigned during this time. Leave cannot be applied."
        else:
            message = "You already have a leave or unavailability during this time."
        cursor.close()
        conn.close()
        return jsonify({"message": message}), 409

    # Insert new leave
    cursor.execute("""
        INSERT INTO technician_unavailable (technician_id, start_datetime, end_datetime, reason)
        VALUES (%s, %s, %s, %s)
    """, (technician_id, start, end, reason))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Leave request submitted successfully"}), 201

@tech_bp.route("/leaves/<int:leave_id>", methods=["DELETE"])
@token_required(role="technician")
def delete_technician_leave(leave_id):
    technician_id = g.current_user["sub"]

    conn = create_connection()
    cursor = conn.cursor()

    # Verify leave belongs to the technician
    cursor.execute("""
        SELECT id FROM technician_unavailable
        WHERE id = %s AND technician_id = %s
    """, (leave_id, technician_id))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        return jsonify({"error": "Leave not found or not authorized"}), 404

    # Perform deletion
    cursor.execute("DELETE FROM technician_unavailable WHERE id = %s", (leave_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Leave cancelled successfully"}), 200
@tech_bp.route("/service-history",methods=["GET"])
@token_required(role="technician")
def get_service_history():
    try:
        technician_id = g.current_user["sub"]
        conn = create_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT b.booking_id, s.name AS service_name, b.booking_date, b.status, b.location_lat, b.location_lng
            FROM bookings b
            JOIN booking_technicians bt ON b.booking_id = bt.booking_id
            JOIN services s ON b.service_id = s.service_id
            WHERE bt.technician_id = %s and status ="completed"
            ORDER BY b.booking_date ASC
        """, (technician_id,))
        assigned_services = cursor.fetchall()

        return jsonify({"assigned_services": assigned_services})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500