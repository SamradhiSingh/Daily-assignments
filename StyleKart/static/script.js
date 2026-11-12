
let cart = [];

function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
    alert(name + " added to cart!");
}

function updateCart() {
    document.getElementById("cart-count").innerText = cart.length;

    let cartItems = document.getElementById("cart-items");
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "Your cart is empty.";
    } else {
        cartItems.innerHTML = "";

        cart.forEach((item, index) => {
            total += item.price;

            cartItems.innerHTML += `
                <p>
                    ${item.name} - ₹${item.price}
                    <button onclick="removeItem(${index})">Remove</button>
                </p>
            `;
        });
    }

    document.getElementById("total").innerText = "Total: ₹" + total;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function showCart() {
    document.getElementById("cart-section").scrollIntoView({
        behavior: "smooth"
    });
}

function scrollToProducts() {
    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
}

document.getElementById("search").addEventListener("input", function() {
    let searchValue = this.value.toLowerCase();

    document.querySelectorAll(".product").forEach(product => {
        let name = product.querySelector("h3").innerText.toLowerCase();

        product.style.display = name.includes(searchValue) ? "" : "none";
    });
});
