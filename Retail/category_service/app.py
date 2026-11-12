
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

categories = [
    {"id": 1, "name": "Men"},
    {"id": 2, "name": "Women"},
    {"id": 3, "name": "Kids"},
    {"id": 4, "name": "Beauty"}
]

@app.route("/categories", methods=["GET"])
def get_categories():
    return jsonify(categories)

if __name__ == "__main__":
    app.run(port=5002, debug=True)
