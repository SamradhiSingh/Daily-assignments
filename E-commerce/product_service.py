
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

os.makedirs("data", exist_ok=True)

FILE = "data/products.csv"

if not os.path.exists(FILE):
    pd.DataFrame(
        columns=["id", "name", "price", "category_id"]
    ).to_csv(FILE, index=False)


def load_products():
    return pd.read_csv(FILE)


@app.route('/products', methods=['GET'])
def get_products():
    products = load_products()
    return jsonify(products.to_dict(orient="records"))


@app.route('/products', methods=['POST'])
def add_product():
    data = request.json
    products = load_products()

    product_id = int(data["id"])

    if product_id in products["id"].values:
        return jsonify({"message": "Product ID already exists"}), 400

    new_product = pd.DataFrame([{
        "id": product_id,
        "name": data["name"],
        "price": float(data["price"]),
        "category_id": int(data["category_id"])
    }])

    products = pd.concat([products, new_product], ignore_index=True)
    products.to_csv(FILE, index=False)

    return jsonify({"message": "Product added successfully!"})


@app.route('/products/<int:product_id>', methods=['GET'])
def search_product(product_id):
    products = load_products()
    result = products[products["id"] == product_id]

    if result.empty:
        return jsonify({"message": "Product not found"}), 404

    return jsonify(result.iloc[0].to_dict())


if __name__ == '__main__':
    app.run(port=5001, debug=True)

    