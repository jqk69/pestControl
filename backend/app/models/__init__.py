from langchain_huggingface import HuggingFaceEndpoint
from transformers import pipeline
import os

llm = HuggingFaceEndpoint(
    repo_id="HuggingFaceH4/zephyr-7b-beta", 
    temperature=0.5,
    max_new_tokens=300,
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
)

def generate_sql(question):
    schema = """You are an expert MySQL query generator.

Only output a single valid and optimized SELECT SQL query.

❌ Do NOT include any comments, explanations, or additional text.  
✅ Only output raw SQL starting with the SELECT statement.

Schema:
bookings(booking_id, user_id, service_id, booking_date, location_lat, location_lng, requirements, status, created_at, updated_at)  
booking_technicians(id, booking_id, technician_id, assigned_at)  
cart(cart_id, user_id, product_id, quantity, status, delivery_address, phone, order_date, updated_at)  
notifications(id, user_type, message, created_at, user_id)  
payments(payment_id, booking_id, razorpay_payment_id, amount, status, created_at)  
services(service_id, service_type, category, name, technicians_needed, price, description, duration_minutes, pest_type)  
store(id, name, description, price, category, image_path, inventory_amount)  
technicians(technician_id, skills, experience_years, salary, last_job)  
technician_unavailable(id, technician_id, start_datetime, end_datetime, reason, created_at)  
users(id, username, password, role, created_at, name, phone, email, status)  

Now generate an optimized SELECT SQL query to answer this question:

"""

    prompt = f"{schema}\n{question}\n\nOnly return the SQL query without any explanation or comments."
    return llm.invoke(prompt).strip()

sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
