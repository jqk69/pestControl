from flask import Flask
from flask_cors import CORS
from app.auth.routes import auth_bp
from dotenv import load_dotenv

load_dotenv()

def create_app():

    import os
    from dotenv import load_dotenv
    load_dotenv()

    app=Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    CORS(app)
    app.register_blueprint(auth_bp)

    return app

