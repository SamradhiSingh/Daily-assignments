
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

cart = []

@app.route("/cart", methods=["GET"])
def get_cart():
    total = sum(item["price"] * item["quantity"] for item in cart)

    return jsonify({
        "items": cart,
        "total": total
    })

@app.route("/cart", methods=["POST"])
def add_to_cart():
    data = request.get_json()

    for item in cart:
        if item["product_id"] == data["product_id"]:
            item["quantity"] += data.get("quantity", 1)
            break
    else:
        cart.append({
            "product_id": data["product_id"],
            "name": data["name"],
            "price": data["price"],
            "quantity": data.get("quantity", 1)
        })

    return jsonify({"message": "Product added to cart", "cart": cart}), 201

@app.route("/cart/<int:product_id>", methods=["DELETE"])
def remove_from_cart(product_id):
    global cart
    cart = [item for item in cart if item["product_id"] != product_id]

    return jsonify({"message": "Product removed from cart"})

@app.route("/cart/clear", methods=["DELETE"])
def clear_cart():
    cart.clear()
    return jsonify({"message": "Cart cleared"})

if __name__ == "__main__":
    app.run(port=5003, debug=True)
