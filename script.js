let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Check Login Status
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  window.location.href = "login.html";
}

// Display Role in Navbar
if (document.getElementById("user-role")) {
  document.getElementById("user-role").textContent = user.role.toUpperCase();
}

// Logout Function
if (document.getElementById("logout")) {
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

// Add to cart functionality
function attachAddToCartListeners() {
  const buttons = document.querySelectorAll(".add-cart");
  console.log("Found", buttons.length, "add to cart buttons");
  
  buttons.forEach((btn, index) => {
    // Skip if already has listener
    if (btn.hasAttribute('data-cart-listener')) {
      return;
    }
    
    // Mark as having listener
    btn.setAttribute('data-cart-listener', 'true');
    const originalText = btn.textContent.trim();
    const originalBg = btn.style.background || '';
    
    // Add click event listener
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const name = this.getAttribute('data-name');
      const priceStr = this.getAttribute('data-price');
      const price = parseFloat(priceStr);
      
      console.log("Add to cart clicked:", { name, price, index });
      
      if (!name || isNaN(price) || price <= 0) {
        console.error("Invalid item data:", { name, price, priceStr });
        alert("Error: Invalid item data. Please try again.");
        return;
      }
      
      // Add item to cart
      const item = { name, price };
      cart.push(item);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCart();
      
      // Show visual feedback
      this.textContent = "✓ Added!";
      this.style.background = "#28a745";
      this.style.color = "white";
      this.disabled = true;
      
      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = originalBg;
        this.style.color = "";
        this.disabled = false;
      }, 1000);
    });
  });
  
  console.log("Attached listeners to", document.querySelectorAll(".add-cart[data-cart-listener='true']").length, "buttons");
}

// Initialize add to cart listeners when DOM is ready
function initCartListeners() {
  attachAddToCartListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartListeners);
} else {
  // DOM already loaded, run immediately
  initCartListeners();
}

// Also re-attach after a short delay to catch dynamically added buttons
setTimeout(initCartListeners, 500);

// Cart Sidebar Functions
function toggleCart() {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
    updateCart();
  }
}

function closeCart() {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");
  if (sidebar && overlay) {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const cartContent = document.getElementById("cart-sidebar-content");
  const cartTotal = document.getElementById("cart-total");
  const cartBadge = document.getElementById("cart-badge");
  const checkoutBtn = document.getElementById("checkout");
  
  // Update badge
  if (cartBadge) {
    cartBadge.textContent = cart.length;
    cartBadge.style.display = cart.length > 0 ? 'flex' : 'none';
  }
  
  // Update cart content
  if (cartContent) {
    if (cart.length === 0) {
      cartContent.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add items from the menu to get started!</p>
        </div>
      `;
    } else {
      let total = 0;
      cartContent.innerHTML = cart.map((item, index) => {
        total += parseFloat(item.price) || 0;
        return `
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">₱${(parseFloat(item.price) || 0).toFixed(2)}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
          </div>
        `;
      }).join('');
    }
  }
  
  // Update total
  if (cartTotal) {
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    cartTotal.textContent = total.toFixed(2);
  }
  
  // Enable/disable checkout button
  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }
}

function checkout() {
  const paymentSelect = document.getElementById("payment");
  if (!paymentSelect) {
    alert("Payment method not found!");
    return;
  }
  
  const payment = paymentSelect.value;
  const user = JSON.parse(localStorage.getItem("user"));

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  const newOrder = {
    id: Date.now(),
    items: [...cart], // Copy cart items
    paymentMethod: payment,
    status: "Preparing",
    customer: user.username, // Associate with customer
    orderDate: new Date().toISOString()
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  localStorage.removeItem("cart");
  updateCart();
  closeCart();

  window.location.href = "order_success.html";
}

// Initialize cart on page load
updateCart();

// Make functions globally available
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.attachAddToCartListeners = attachAddToCartListeners;
window.updateCart = updateCart;
