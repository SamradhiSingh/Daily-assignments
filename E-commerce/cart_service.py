
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import requests
import os

app = Flask(__name__)
CORS(app)

os.makedirs("data", exist_ok=True)

FILE = "data/cart.csv"
if not os.path.exists(FILE):
    pd.DataFrame(
        columns=["product_id", "name", "price", "quantity"]
    ).to_csv(FILE, index=False)


def load_cart():
    return pd.read_csv(FILE)


@app.route('/cart', methods=['GET'])
def view_cart():
    cart = load_cart()

    if cart.empty:
        return jsonify({"items": [], "total": 0})

    cart["total"] = cart["price"] * cart["quantity"]

    return jsonify({
        "items": cart.to_dict(orient="records"),
        "total": float(np.sum(cart["total"]))
    })


@app.route('/cart', methods=['POST'])
def add_to_cart():
    data = request.json

    product_id = int(data["product_id"])
    quantity = int(data["quantity"])

    if quantity <= 0:
        return jsonify({"message": "Invalid quantity"}), 400

    response = requests.get(
        f"http://127.0.0.1:5001/products/{product_id}"
    )

    if response.status_code != 200:
        return jsonify({"message": "Product not found"}), 404

    product = response.json()
    cart = load_cart()

    if product_id in cart["product_id"].values:
        cart.loc[
            cart["product_id"] == product_id, "quantity"
        ] += quantity
    else:
        new_item = pd.DataFrame([{
            "product_id": product_id,
            "name": product["name"],
            "price": product["price"],
            "quantity": quantity
        }])

        cart = pd.concat([cart, new_item], ignore_index=True)

    cart.to_csv(FILE, index=False)

    return jsonify({"message": "Product added to cart!"})


@app.route('/cart/<int:product_id>', methods=['PUT'])
def update_cart(product_id):
    data = request.json
    quantity = int(data["quantity"])

    if quantity <= 0:
        return jsonify({"message": "Quantity must be positive"}), 400

    cart = load_cart()

    if product_id not in cart["product_id"].values:
        return jsonify({"message": "Item not found"}), 404

    cart.loc[
        cart["product_id"] == product_id, "quantity"
    ] = quantity

    cart.to_csv(FILE, index=False)

    return jsonify({"message": "Quantity updated"})


@app.route('/cart/<int:product_id>', methods=['DELETE'])
def remove_from_cart(product_id):
    cart = load_cart()
    cart = cart[cart["product_id"] != product_id]
    cart.to_csv(FILE, index=False)

    return jsonify({"message": "Product removed from cart"})


@app.route('/cart/clear', methods=['DELETE'])
def clear_cart():
    pd.DataFrame(
        columns=["product_id", "name", "price", "quantity"]
    ).to_csv(FILE, index=False)

    return jsonify({"message": "Cart cleared"})


if __name__ == '__main__':
    app.run(port=5003, debug=True)
