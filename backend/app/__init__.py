from flask import Flask
from flask_cors import CORS
from app.auth.routes import auth_bp
from app.admin.routes import admin_bp
from app.images.routes import image_bp
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():

    import os
    from dotenv import load_dotenv
    load_dotenv()

    app=Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['PRODUCT_IMAGE_FOLDER'] = os.path.join(app.root_path, 'app/static/products')
    CORS(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(image_bp)

    return app

