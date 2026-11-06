
const PRODUCT_URL = "http://127.0.0.1:5001";
const CATEGORY_URL = "http://127.0.0.1:5002";
const CART_URL = "http://127.0.0.1:5003";
const SHIPPING_URL = "http://127.0.0.1:5004";

// Load products from Product Service
async function loadProducts() {
    try {
        const response = await fetch(PRODUCT_URL + "/products");
        if (!response.ok) throw new Error("Could not load products");

        const products = await response.json();

        const productList = document.getElementById("product-list");
        productList.innerHTML = "";

        if (products.length === 0) {
            productList.innerHTML = "<p>No products available yet.</p>";
            return;
        }

        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";

            const icons = {
                "laptop": "💻",
                "mobile": "📱",
                "phone": "📱",
                "shoes": "👟",
                "headphones": "🎧",
                "watch": "⌚",
                "bag": "👜"
            };

            const icon = icons[product.name.toLowerCase()] || "🛍️";

            card.innerHTML = `
                <div class="product-icon">${icon}</div>
                <h3>${product.name}</h3>
                <p>Product ID: ${product.id}</p>
                <p class="price">₹${product.price}</p>
                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            `;

            productList.appendChild(card);
        });

    } catch (error) {
        document.getElementById("product-list").innerHTML =
            "<p>Unable to load products. Please start Product Service.</p>";
    }
}


// Load categories from Category Service
async function loadCategories() {
    try {
        const response = await fetch(CATEGORY_URL + "/categories");
        if (!response.ok) throw new Error("Could not load categories");

        const categories = await response.json();

        const categoryList = document.getElementById("category-list");
        categoryList.innerHTML = "";

        categories.forEach(category => {
            const card = document.createElement("div");
            card.className = "category-card";
            card.textContent = category.name;

            categoryList.appendChild(card);
        });

    } catch (error) {
        document.getElementById("category-list").textContent =
            "Unable to load categories.";
    }
}


// Add a product to the cart
async function addToCart(productId) {
    try {
        const response = await fetch(CART_URL + "/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        alert(result.message);

        loadCart();

    } catch (error) {
        alert(error.message || "Unable to add product to cart.");
    }
}


// Display cart items
async function loadCart() {
    try {
        const response = await fetch(CART_URL + "/cart");
        if (!response.ok) throw new Error("Could not load cart");

        const result = await response.json();

        const cartItems = document.getElementById("cart-items");
        const cartTotal = document.getElementById("cart-total");

        cartItems.innerHTML = "";

        if (result.items.length === 0) {
            cartItems.innerHTML = "<p>Your cart is empty.</p>";
            cartTotal.textContent = "Total: ₹0";
            return;
        }

        result.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "cart-item";

            const name = document.createElement("strong");
            name.textContent = item.name;

            const price = document.createElement("span");
            price.textContent = "₹" + item.price;

            const quantity = document.createElement("input");
            quantity.type = "number";
            quantity.min = "1";
            quantity.value = item.quantity;
            quantity.addEventListener("change", () => {
                updateQuantity(item.product_id, quantity.value);
            });

            const subtotal = document.createElement("span");
            subtotal.textContent = "Subtotal: ₹" + item.total;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.className = "remove-btn";
            removeButton.addEventListener("click", () => {
                removeItem(item.product_id);
            });

            div.append(name, price, quantity, subtotal, removeButton);
            cartItems.appendChild(div);
        });

        cartTotal.textContent = "Total: ₹" + result.total;

    } catch (error) {
        document.getElementById("cart-items").textContent =
            "Unable to load cart. Please start Cart Service.";
    }
}


// Update quantity
async function updateQuantity(productId, quantity) {
    try {
        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            alert("Quantity must be at least 1.");
            loadCart();
            return;
        }

        const response = await fetch(CART_URL + "/cart/" + productId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quantity: Number(quantity)
            })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        loadCart();

    } catch (error) {
        alert(error.message || "Unable to update quantity.");
    }
}


// Remove product from cart
async function removeItem(productId) {
    try {
        const response = await fetch(CART_URL + "/cart/" + productId, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        loadCart();

    } catch (error) {
        alert(error.message || "Unable to remove product.");
    }
}


// Place order
document.getElementById("checkout-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    try {
        const cartResponse = await fetch(CART_URL + "/cart");
        const cart = await cartResponse.json();

        if (!cart.items.length) {
            alert("Your cart is empty!");
            return;
        }

        const address = document.getElementById("address").value.trim();

        const response = await fetch(SHIPPING_URL + "/shipping", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ address: address })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        const finalAmount = cart.total + result.shipping_charge;

        document.getElementById("order-message").innerHTML = `
            <h3>${result.message}</h3>
            <p>Delivery Address: ${result.address}</p>
            <p>Product Total: ₹${cart.total}</p>
            <p>Shipping: ₹${result.shipping_charge}</p>
            <h3>Final Amount: ₹${finalAmount}</h3>
        `;

        // Clear cart after order
        await fetch(CART_URL + "/cart/clear", {
            method: "DELETE"
        });

        document.getElementById("checkout-form").reset();
        loadCart();

    } catch (error) {
        alert(error.message || "Unable to place order.");
    }
});


// Load everything when website opens
loadProducts();
loadCategories();
loadCart();
