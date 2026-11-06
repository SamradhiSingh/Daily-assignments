
import requests

PRODUCT_URL = "http://127.0.0.1:5001"
CATEGORY_URL = "http://127.0.0.1:5002"


def add_product():
    print("\n--- ADD PRODUCT ---")

    try:
        data = {
            "id": int(input("Enter Product ID: ")),
            "name": input("Enter Product Name: ").strip(),
            "price": float(input("Enter Product Price: ")),
            "category_id": int(input("Enter Category ID: "))
        }

        if not data["name"] or data["price"] < 0:
            print("Enter a valid name and price.")
            return

        response = requests.post(
            PRODUCT_URL + "/products", json=data
        )

        print(response.json()["message"])

    except ValueError:
        print("Please enter valid numbers.")
    except requests.RequestException:
        print("Product Service is not running.")


def view_products():
    try:
        response = requests.get(PRODUCT_URL + "/products")
        response.raise_for_status()

        print("\n--- ALL PRODUCTS ---")

        for product in response.json():
            print(product)

    except requests.RequestException:
        print("Could not connect to Product Service.")


def add_category():
    print("\n--- ADD CATEGORY ---")

    try:
        data = {
            "id": int(input("Enter Category ID: ")),
            "name": input("Enter Category Name: ").strip()
        }

        if not data["name"]:
            print("Category name cannot be empty.")
            return

        response = requests.post(
            CATEGORY_URL + "/categories", json=data
        )

        print(response.json()["message"])

    except ValueError:
        print("Enter a valid category ID.")
    except requests.RequestException:
        print("Category Service is not running.")


def view_categories():
    try:
        response = requests.get(CATEGORY_URL + "/categories")
        response.raise_for_status()

        print("\n--- ALL CATEGORIES ---")

        for category in response.json():
            print(category)

    except requests.RequestException:
        print("Could not connect to Category Service.")


def main():
    while True:
        print("\n========== E-COMMERCE ADMIN ==========")
        print("1. Add Product")
        print("2. View Products")
        print("3. Add Category")
        print("4. View Categories")
        print("5. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_product()
        elif choice == "2":
            view_products()
        elif choice == "3":
            add_category()
        elif choice == "4":
            view_categories()
        elif choice == "5":
            print("Exiting application.")
            break
        else:
            print("Invalid choice.")


if __name__ == "__main__":
    main()
