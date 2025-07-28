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
            "query": "pest  news India",
            "max_results": 5
        },
        headers={
            "Authorization": f"Bearer {tavily_key}"
        }
    )
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

    prompt = f"""You are a professional blog writer for a pest control company in India.

Using the following pest related news updates as inspiration:
{state['search_data']}

Generate a full SEO-optimized blog post in **HTML format** with the following requirements:

- A catchy `<h1>` title with class `blog-title text-4xl font-extrabold text-white bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-6`.
- An introductory `<p>` paragraph with class `blog-intro text-gray-200 text-lg max-w-3xl mb-8`.
- Three clearly separated `<h2>` sections with class `blog-section-title text-2xl font-bold text-white mb-4 flex items-center gap-2`, each containing `<p>` or `<ul>` content with class `blog-content text-gray-300 text-base mb-6` for paragraphs or `blog-list list-disc pl-6 text-gray-300 text-base mb-6` for lists. Use Tailwind CSS classes to match a modern, sleek design (e.g., `bg-white/5`, `border-white/10`, `rounded-xl`, `p-4` for any container divs).
- At least 3 customer tips under an `<h2>` heading titled "Tips to Keep Your Home Pest-Free" with class `blog-section-title`, using a `<ul>` with class `blog-list list-disc pl-6 text-gray-300 text-base mb-6`.
- A `<strong>Conclusion</strong>` in its own `<p>` tag with class `blog-conclusion text-gray-200 text-lg mt-8`.
- Wrap each `<h2>` section in a `<div>` with class `blog-section bg-white/5 border border-white/10 rounded-xl p-6 mb-8` to match the GlassCard/NeonCard aesthetic.
- Do not wrap the entire blog in `<html>` or `<body>` tags.
- Use Tailwind CSS classes consistent with a dark gradient theme (`bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900`) and ensure compatibility with the frontend’s modern, professional look (e.g., `text-emerald-400` for highlights, `hover:bg-emerald-500` for interactive elements if applicable).
- Avoid raw copy-pasting of news. Summarize and rewrite in your own words to create engaging, original content.
- Ensure the content is engaging, informative, and tailored to Indian homeowners and businesses, reflecting the latest pest trends (e.g., eco-friendly methods, Integrated Pest Management).
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



def run_weekly_blog_pipeline() -> dict:
    try:
        graph.invoke({})
        return {"status": "success", "message": "Blog generated and saved."}
    except Exception as e:
        print("❌ Error in pipeline:", str(e))
        return {"status": "error", "message": str(e)}
