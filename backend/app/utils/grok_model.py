from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

api_key=os.getenv("GROQ_API_KEY")

client = Groq(
    api_key=api_key,
)

def CreateMessage(user_message,system_prompt):

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        model="llama-3.3-70b-versatile",
    )
    return chat_completion.choices[0].message
