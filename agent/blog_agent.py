# weekly_blog_agent.py
from typing import TypedDict
import os
import requests
import mysql.connector
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END

# Load secrets from .env
load_dotenv()



# Define the data structure for LangGraph state
class BlogState(TypedDict, total=False):
    search_data: str
    blog_content: str

### Step 1: Tavily search for pest news
def tavily_search(state: BlogState) -> BlogState:
    tavily_key = os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        raise ValueError("Missing TAVILY_API_KEY")

    response = requests.post(
        "https://api.tavily.com/search",
        json={
            "query": "latest pest control news India 2025",
            "max_results": 5
        },
        headers={
            "Authorization": f"Bearer {tavily_key}"
        }
    )

    print("✅ Tavily status:", response.status_code)
    data = response.json()

    results = data.get("results", [])
    if not results:
        return {**state, "search_data": "No pest control news found."}

    summaries = []
    for r in results:
        title = r.get("title", "")
        url = r.get("url", "")
        content = r.get("raw_content") or r.get("content") or ""
        summaries.append(f"{title}\n{url}\n{content}")

    combined = "\n\n".join(summaries)
    return {**state, "search_data": combined}


### Step 2: Use Groq Mixtral to generate a blog
def generate_blog(state: BlogState) -> BlogState:
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("Missing GROQ_API_KEY")

    prompt = f"""
You are a professional blog writer for a pest control company in India.

Using the following pest control news updates:

{state['search_data']}

Generate a full SEO-optimized blog in **HTML format** with:

- A catchy <h1> title
- An introductory <p> paragraph
- Three clearly separated <h2> sections with <ul> or <p> content
- At least 3 customer tips under a <h2>Tips</h2> heading using <ul>
- A <strong>Conclusion</strong> in its own <p> tag

Do not wrap the entire blog in a <html> or <body> tag.
Add useful class names like "blog-title", "blog-section", etc., to help with styling.
Avoid raw copy-paste of news. Summarize and rewrite in your own words.

Keywords to include: season, pests, safety, home, pest control India.
"""

    res = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": "meta-llama/llama-4-scout-17b-16e-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
    )

    data = res.json()
    if "choices" not in data:
        print("❌ Groq API Error Response:", data)
        raise ValueError("Groq API did not return choices.")

    html = data["choices"][0]["message"]["content"]

    return {**state, "blog_content": html}



### Step 3: Store blog in MySQL database
import re

def save_to_mysql(state: BlogState) -> BlogState:
    # Extract <h1> title from content
    html = state["blog_content"]
    match = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.IGNORECASE)
    title = match.group(1).strip() if match else "Weekly Pest Control Blog"
    html_without_title = re.sub(r"<h1[^>]*>.*?</h1>", "", html, flags=re.IGNORECASE)

    print("🔍 Blog Title:", title)

    conn = mysql.connector.connect(
        host="127.0.0.1", 
        port=3306,
        user="root",
        password="vidakuzha92**",
        database="pest_control",
        use_pure=True
    )
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO blog_posts (title, content, date) VALUES (%s, %s, NOW())",
        (title, html_without_title)
    )

    conn.commit()
    cursor.close()
    conn.close()

    print("✅ Blog saved successfully.")
    return state


### Step 4: LangGraph flow definition
builder = StateGraph(BlogState)
builder.add_node("search_news", tavily_search)
builder.add_node("generate_blog", generate_blog)
builder.add_node("save_blog", save_to_mysql)

builder.set_entry_point("search_news")
builder.add_edge("search_news", "generate_blog")
builder.add_edge("generate_blog", "save_blog")
builder.add_edge("save_blog", END)

graph = builder.compile()


### Step 5: Execute
if __name__ == "__main__":
    final_state = graph.invoke({})
    print("\n📝 Final Blog:\n")
    print(final_state["blog_content"])
