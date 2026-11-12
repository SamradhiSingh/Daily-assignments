
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/shipping", methods=["POST"])
def calculate_shipping():
    data = request.get_json()
    total = float(data.get("total", 0))

    shipping_charge = 0 if total >= 1000 else 50

    return jsonify({
        "order_total": total,
        "shipping_charge": shipping_charge,
        "final_total": total + shipping_charge
    })

if __name__ == "__main__":
    app.run(port=5004, debug=True)
