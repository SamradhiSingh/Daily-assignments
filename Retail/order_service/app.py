
from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

orders = []
next_order_id = 1

CART_URL = "http://127.0.0.1:5003"
SHIPPING_URL = "http://127.0.0.1:5004"

@app.route("/orders", methods=["GET"])
def get_orders():
    return jsonify(orders)

@app.route("/orders", methods=["POST"])
def place_order():
    global next_order_id

    try:
        cart_response = requests.get(f"{CART_URL}/cart", timeout=5)
        cart_response.raise_for_status()
        cart_data = cart_response.json()

        if not cart_data["items"]:
            return jsonify({"error": "Your cart is empty"}), 400

        shipping_response = requests.post(
            f"{SHIPPING_URL}/shipping",
            json={"total": cart_data["total"]},
            timeout=5
        )
        shipping_response.raise_for_status()
        shipping_data = shipping_response.json()

        order = {
            "order_id": next_order_id,
            "items": cart_data["items"],
            "subtotal": cart_data["total"],
            "shipping": shipping_data["shipping_charge"],
            "total": shipping_data["final_total"],
            "status": "Order Placed"
        }

        orders.append(order)
        next_order_id += 1

        requests.delete(f"{CART_URL}/cart/clear", timeout=5)

        return jsonify(order), 201

    except requests.RequestException:
        return jsonify({
            "error": "Cart or Shipping service is unavailable"
        }), 503

if __name__ == "__main__":
    app.run(port=5005, debug=True)

