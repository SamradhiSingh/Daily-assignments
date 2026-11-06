

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

os.makedirs("data", exist_ok=True)

FILE = "data/categories.csv"

if not os.path.exists(FILE):
    pd.DataFrame(
        columns=["id", "name"]
    ).to_csv(FILE, index=False)


def load_categories():
    return pd.read_csv(FILE)


@app.route('/categories', methods=['GET'])
def get_categories():
    categories = load_categories()
    return jsonify(categories.to_dict(orient="records"))


@app.route('/categories', methods=['POST'])
def add_category():
    data = request.json
    categories = load_categories()

    category_id = int(data["id"])

    if category_id in categories["id"].values:
        return jsonify({"message": "Category ID already exists"}), 400

    new_category = pd.DataFrame([{
        "id": category_id,
        "name": data["name"]
    }])

    categories = pd.concat([categories, new_category], ignore_index=True)
    categories.to_csv(FILE, index=False)

    return jsonify({"message": "Category added successfully!"})


if __name__ == '__main__':
    app.run(port=5002, debug=True)
