from flask import Blueprint, request, Response
import ollama
import json
from prompts import FILTER_PROMPT, CHAT_PROMPT

chat_bp = Blueprint("chat", __name__)

LLM_GENERAL = "gemma3:1b"
LLM_FILTER = "qwen3:0.6b"


def ai_filter(user_message: str) -> dict:
    """
    Run the filter model on the user's latest message to determine if it is allowed.
    Returns a dictionary containing the filter decision.
    """
    response = ollama.chat(
        model=LLM_FILTER,
        messages=[
            {"role": "system", "content": FILTER_PROMPT},
            {"role": "user", "content": user_message},
        ],
        stream=False,
        options={"temperature": 0.0}
    )

    raw_reply = response["message"]["content"].strip()
    start = raw_reply.find("{")
    end = raw_reply.rfind("}") + 1
    if start != -1 and end != -1:
        reply = raw_reply[start:end]
    else:
        reply = raw_reply

    print("==== Filter model output ====")
    print(f"{reply}\n")

    try:
        result = json.loads(reply)
    except Exception:
        print("==== JSON parsing failed, applying fallback logic ====\n")
        result = {"allowed": False}

    print(f"==== Final filter decision ====\n{result}\n")
    return result


@chat_bp.route("/chat", methods=["POST"])
def chat():
    """
    Handle incoming chat requests.
    Applies the filter model to the latest user message and either denies the request
    or streams a response from the general LLM model.
    """
    system_prompt = CHAT_PROMPT

    print("\n==== Receiving incoming request payload ====")
    payload = request.get_json(force=True)
    messages = payload.get("messages", [])
    print(f"Incoming messages: {messages}\n")
    
    user_message = messages[-1].get("content", "")
    print("==== Running filter on latest user message ====\n")
    filter_result = ai_filter(user_message)

    if not filter_result.get("allowed", False):
        print("==== Filter decision: Request denied ====\n")
        def deny_stream():
            """Stream denial message to client."""
            yield "<div style='color:red;'>Sorry, this line of questioning is restricted by Ushinar.</div>"
        return Response(deny_stream(), mimetype="text/html")

    print("==== Filter decision: Request allowed. Proceeding to chat ====\n")

    def generate():
        """
        Stream response chunks from the general LLM model back to the client.
        """
        print("==== Starting streaming response from LLM ====\n")
        stream = ollama.chat(
            model=LLM_GENERAL,
            messages=[{"role": "system", "content": system_prompt}] + messages,
            stream=True,
            options={"temperature": 0.1, "num_ctx": 8192, "num_thread": 12},
        )
        for chunk in stream:
            if "message" in chunk and "content" in chunk["message"]:
                print(chunk["message"]["content"], end="", flush=True)
                yield chunk["message"]["content"]

    return Response(generate(), mimetype="text/plain")
