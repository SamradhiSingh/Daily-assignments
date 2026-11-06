
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/shipping', methods=['POST'])
def shipping():
    data = request.json
    address = data.get("address", "").strip()

    if not address:
        return jsonify({"message": "Please enter your address"}), 400

    shipping_charge = 100

    return jsonify({
        "message": "Order placed successfully!",
        "address": address,
        "shipping_charge": shipping_charge
    })


if __name__ == '__main__':
    app.run(port=5004, debug=True)
