from flask import Blueprint, send_from_directory, current_app, jsonify
import os
from app.db import create_connection  # Import the function to connect to the database

# Define the blueprint
image_bp = Blueprint('image_bp', __name__)

# Route to serve images based on product ID
@image_bp.route('/static/products/<int:product_id>', methods=['GET'])
def serve_image(product_id):
    try:
        # Connect to the database
        connection = create_connection()
        cursor = connection.cursor(dictionary=True)

        # Query the database for the image path of the product by product_id
        cursor.execute("SELECT image_path FROM store WHERE id = %s", (product_id,))
        product = cursor.fetchone()

        # If the product exists and has an image path
        if product and product['image_path']:
            image_filename = product['image_path']  # Get image file name from DB
            image_folder = current_app.config['PRODUCT_IMAGE_FOLDER']  # Get the image folder from config

            # Send the image from the directory
            return send_from_directory(image_folder, image_filename)

        # If no product or image found
        return jsonify({"message": "Image not found"}), 404

    except Exception as e:
        return jsonify({"message": f"Error fetching image: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()
