from dotenv import load_dotenv
import os
import mysql.connector
from mysql.connector import Error

load_dotenv()

db_host=os.getenv("DB_HOST")
db_port=os.getenv("DB_PORT")
db_user=os.getenv("DB_USER")
db_password=os.getenv("DB_PASSWORD")
db_name=os.getenv("DB_NAME")

def create_connection():
    connection=None
    try:
        connection=mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )
    except Error as e:
        pass
    return connection