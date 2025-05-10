from flask import request,jsonify,Blueprint,current_app
import jwt
from app.db import create_connection

auth_bp=Blueprint("auth",__name__,url_prefix='/auth')

@auth_bp.route("/login",methods=["POST"])
def login():
    data=request.get_json()
    username=data.get("username")
    password=data.get("password")

    connection=create_connection()
    cursor=connection.cursor(dictionary=True)
    
    try:
        cursor.execute("select * from users where username= %s",(username,))
        user=cursor.fetchone()
    
        if user and user["password"]==password:
            token=jwt.encode({
                'sub':user['id'],
                'role':user['role'],
                'name':user['username']
            },current_app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({'token':token}),200
    finally:
        cursor.close()
        connection.close()
        
    return jsonify({"message":"invalid password or username"}),401
    