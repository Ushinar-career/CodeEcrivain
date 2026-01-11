from flask import Flask
from flask_cors import CORS
from routes import chat_bp

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:3000", "http://localhost:3000"])

# Register blueprint
app.register_blueprint(chat_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
