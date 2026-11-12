
// ==========================================
// STYLEKART - MICROservices CONNECTIONS
// ==========================================

const PRODUCT_URL = "http://127.0.0.1:5001";
const CATEGORY_URL = "http://127.0.0.1:5002";
const CART_URL = "http://127.0.0.1:5003";
const SHIPPING_URL = "http://127.0.0.1:5004";
const ORDER_URL = "http://127.0.0.1:5005";

let allProducts = [];


// ==========================================
// PRODUCT IMAGES
// ==========================================


const productImages = {
    1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    2: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
    3: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
    4: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    5: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600",
    6: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",

    // Women's collection
    7: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
    8: "https://www.watthebrand.com/cdn/shop/files/9.--Black-cotton-wide-leg-trouser_c08c12f3-f329-44c7-8d36-ede21f270242_1380x.jpg?v=1769098445",
    9: "https://nextsteplb.com/cdn/shop/files/102804295.jpg?v=1771329646",
    10: "https://assets.loft.com/image/upload/t_fullpdpzoom/v1781733849/LO/786602_9000",
    11: "https://ektithi.com/uploads/products/75/7567ec05-f8b8-408b-9ac5-c61e23cfcd40.png",
    12: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
    13: "https://funktribe.in/cdn/shop/files/sRlIhl3WR1aPwjYHaKRDrQ.webp?v=1733053217",

    14: "https://media.splashfashions.com/i/splash/3023478-COMBATCARGO-SPS24110124_01-2100.jpg",

    15: "https://storage.biddabari.online/biddabari-bucket/uploads/all/uSV1yiwD7K4UhHXkmRd2gpnMDIFwHPpr05GVf0QE.webp",
};



// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const container = document.getElementById("product-list");

    try {

        const response = await fetch(`${PRODUCT_URL}/products`);

        if (!response.ok) {
            throw new Error("Product service error");
        }

        allProducts = await response.json();

        displayProducts(allProducts);

    } catch (error) {

        console.error("Product loading error:", error);

        container.innerHTML = `
            <p>Unable to load products. Please check whether Product Service is running.</p>
        `;
    }
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(products) {

    const container = document.getElementById("product-list");

    if (products.length === 0) {

        container.innerHTML = `
            <p>No products found. Try changing your filters.</p>
        `;

        return;
    }

    container.innerHTML = products.map(product => `

        <div class="shop-product">

            <img
                src="${productImages[product.id] || productImages[1]}"
                alt="${product.name}"
                onerror="this.src='https://placehold.co/600x700/f0e9df/333333?text=StyleKart'"
            >

            <h3>${product.name}</h3>

            <p>${product.category} Collection</p>

            <p class="product-price">₹${product.price}</p>

            <button onclick="addProductToCart(${product.id})">
                ADD TO BAG
            </button>

        </div>

    `).join("");
}


// ==========================================
// ADD PRODUCT TO CART
// ==========================================

async function addProductToCart(productId) {

    try {

        const productResponse = await fetch(
            `${PRODUCT_URL}/products/${productId}`
        );

        if (!productResponse.ok) {
            throw new Error("Product not found");
        }

        const product = await productResponse.json();

        const response = await fetch(`${CART_URL}/cart`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1

            })

        });

        if (!response.ok) {
            throw new Error("Unable to add product");
        }

        alert(`${product.name} added to your bag!`);

        await loadCart();

    } catch (error) {

        console.error(error);

        alert("Unable to add product. Please check your Cart Service.");

    }
}


// ==========================================
// LOAD CART
// ==========================================

async function loadCart() {

    try {

        const response = await fetch(`${CART_URL}/cart`);

        if (!response.ok) {
            throw new Error("Cart service error");
        }

        const data = await response.json();

        const cartCount = document.getElementById("cart-count");
        const cartItems = document.getElementById("cart-items");
        const total = document.getElementById("total");

        const itemCount = data.items.reduce(
            (sum, item) => sum + item.quantity, 0
        );

        if (cartCount) {
            cartCount.textContent = itemCount;
        }

        if (cartItems) {

            if (data.items.length === 0) {

                cartItems.innerHTML = "Your shopping bag is empty.";

            } else {

                cartItems.innerHTML = data.items.map(item => `

                    <p>
                        <span>
                            ${item.name} × ${item.quantity}
                            — ₹${item.price * item.quantity}
                        </span>

                        <button onclick="removeFromCart(${item.product_id})">
                            REMOVE
                        </button>
                    </p>

                `).join("");

            }
        }

        if (total) {
            total.textContent = `Subtotal: ₹${data.total}`;
        }

    } catch (error) {

        console.error("Cart loading error:", error);

    }
}


// ==========================================
// REMOVE PRODUCT FROM CART
// ==========================================

async function removeFromCart(productId) {

    try {

        const response = await fetch(
            `${CART_URL}/cart/${productId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to remove product");
        }

        await loadCart();

    } catch (error) {

        console.error(error);

        alert("Could not remove this product.");

    }
}


// ==========================================
// PLACE ORDER
// ==========================================

async function placeOrder() {

    try {

        const cartResponse = await fetch(`${CART_URL}/cart`);
        const cartData = await cartResponse.json();

        if (!cartData.items || cartData.items.length === 0) {

            alert("Your shopping bag is empty!");
            return;

        }

        const response = await fetch(`${ORDER_URL}/orders`, {

            method: "POST"

        });

        const order = await response.json();

        if (!response.ok) {
            throw new Error(order.error || "Order could not be placed");
        }

        alert(
            "ORDER PLACED SUCCESSFULLY!\n\n" +
            "Order ID: " + order.order_id + "\n" +
            "Subtotal: ₹" + order.subtotal + "\n" +
            "Shipping: ₹" + order.shipping + "\n" +
            "Final Total: ₹" + order.total
        );

        await loadCart();

    } catch (error) {

        console.error("Order error:", error);

        alert(error.message || "Unable to place order. Please try again.");

    }
}


// ==========================================
// SEARCH AND FILTER PRODUCTS
// ==========================================

function filterProducts() {

    let filteredProducts = [...allProducts];

    // CATEGORY FILTER

    const selectedCategories = Array.from(
        document.querySelectorAll(".category-filter:checked")
    ).map(input => input.value);

    if (selectedCategories.length > 0) {

        filteredProducts = filteredProducts.filter(product =>
            selectedCategories.includes(product.category)
        );

    }

    // PRICE FILTER

    const selectedPrice = document.querySelector(
        'input[name="price"]:checked'
    )?.value || "all";

    if (selectedPrice === "500") {

        filteredProducts = filteredProducts.filter(
            product => product.price < 500
        );

    } else if (selectedPrice === "1000") {

        filteredProducts = filteredProducts.filter(
            product => product.price >= 500 && product.price <= 1000
        );

    } else if (selectedPrice === "2000") {

        filteredProducts = filteredProducts.filter(
            product => product.price > 1000
        );

    }

    // SEARCH FILTER

    const searchValue = document.getElementById("search")
        ?.value.toLowerCase().trim() || "";

    filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue)
    );

    // SORT PRODUCTS

    const sortValue = document.getElementById("sort")?.value || "default";

    if (sortValue === "low") {

        filteredProducts.sort((a, b) => a.price - b.price);

    } else if (sortValue === "high") {

        filteredProducts.sort((a, b) => b.price - a.price);

    } else if (sortValue === "name") {

        filteredProducts.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    }

    displayProducts(filteredProducts);

}


// ==========================================
// CLEAR FILTERS
// ==========================================

function clearFilters() {

    document.querySelectorAll(".category-filter").forEach(input => {
        input.checked = false;
    });

    const allPrice = document.querySelector(
        'input[name="price"][value="all"]'
    );

    if (allPrice) {
        allPrice.checked = true;
    }

    document.getElementById("search").value = "";

    document.getElementById("sort").value = "default";

    filterProducts();

}


// ==========================================
// LOAD CATEGORIES
// ==========================================

async function loadCategories() {

    try {

        const response = await fetch(`${CATEGORY_URL}/categories`);

        const categories = await response.json();

        console.log("Categories loaded:", categories);

    } catch (error) {

        console.error("Category Service error:", error);

    }
}


// ==========================================
// INITIALIZE WEBSITE
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    await loadProducts();

    await loadCart();

    await loadCategories();

    // Search event
    document.getElementById("search")
        ?.addEventListener("input", filterProducts);

    // Category filter events
    document.querySelectorAll(".category-filter")
        .forEach(input => {
            input.addEventListener("change", filterProducts);
        });

    // Price filter events
    document.querySelectorAll('input[name="price"]')
        .forEach(input => {
            input.addEventListener("change", filterProducts);
        });

    // Sorting event
    document.getElementById("sort")
        ?.addEventListener("change", filterProducts);

});
