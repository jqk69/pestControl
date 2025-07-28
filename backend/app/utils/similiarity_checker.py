from flask import jsonify
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

engine = create_engine(f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}")
model = SentenceTransformer('all-MiniLM-L6-v2')  # load once

def get_recommendations_for_pest(pest: str = None):
    if pest is None:
        raise ValueError("Pest type is required")

    query = "SELECT service_id, name, description, price FROM services"
    df = pd.read_sql(query, engine)

    df['combined_text'] = df['name'] + ". " + df['description']

    model = SentenceTransformer('all-MiniLM-L6-v2')
    df['embedding'] = df['combined_text'].apply(lambda x: model.encode(x))

    pest_vector = model.encode(pest).reshape(1, -1)
    service_vectors = np.vstack(df['embedding'].values)

    similarities = cosine_similarity(pest_vector, service_vectors)[0]
    df['similarity'] = similarities

    # Filter by similarity threshold
    filtered_df = df[df['similarity'] > 0.4].sort_values(by="similarity", ascending=False)

    if filtered_df.empty:
        return [{"message": "No related services found for this pest type"}]

    return filtered_df[['service_id', 'name', 'similarity', 'price']].head(3).to_dict(orient='records')
