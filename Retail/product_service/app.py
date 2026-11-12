
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["stylekart_db"]
products_collection = db["products"]

# Initial products
initial_products = [
    {"id": 1, "name": "Classic White T-Shirt", "category": "Men", "price": 499},
    {"id": 2, "name": "Blue Denim Jeans", "category": "Men", "price": 999},
    {"id": 3, "name": "Stylish Heels", "category": "Women", "price": 1299},
    {"id": 4, "name": "Casual Jacket", "category": "Women", "price": 1499},
    {"id": 5, "name": "Kids T-Shirt", "category": "Kids", "price": 399},
    {"id": 6, "name": "Beauty Essentials", "category": "Beauty", "price": 599}
]

# Insert initial products only if collection is empty
if products_collection.count_documents({}) == 0:
    products_collection.insert_many(initial_products)
    print("Initial products added to MongoDB!")


# GET all products
@app.route("/products", methods=["GET"])
def get_products():
    products = list(products_collection.find({}, {"_id": 0}))
    return jsonify(products)


# GET a single product
@app.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = products_collection.find_one(
        {"id": product_id},
        {"_id": 0}
    )

    if product:
        return jsonify(product)

    return jsonify({"error": "Product not found"}), 404


# ADD a new product
@app.route("/products", methods=["POST"])
def add_product():
    data = request.get_json()

    last_product = products_collection.find_one(
        sort=[("id", -1)]
    )

    new_id = last_product["id"] + 1 if last_product else 1

    new_product = {
        "id": new_id,
        "name": data["name"],
        "category": data["category"],
        "price": data["price"]
    }

    products_collection.insert_one(new_product)

    # Return JSON without MongoDB's ObjectId
    return jsonify({
        "id": new_product["id"],
        "name": new_product["name"],
        "category": new_product["category"],
        "price": new_product["price"]
    }), 201


if __name__ == "__main__":
    app.run(port=5001, debug=True)
