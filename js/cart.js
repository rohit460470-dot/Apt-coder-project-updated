/**
 * Food Delivery Web Application - Cart & Coupon Management
 * Provides O(1) Adding, O(n) Deletion/Updates, and LocalStorage synchronization.
 */

import { COUPONS } from './data.js';

class CartManager {
  constructor() {
    this.cart = this.loadFromStorage();
    this.activeCoupon = this.loadCouponFromStorage();
    this.deliveryFee = 40;
    this.gstPercentage = 5; // 5% GST
  }

  loadFromStorage() {
    const saved = localStorage.getItem('food_cart');
    return saved ? JSON.parse(saved) : { restaurantId: null, restaurantName: null, items: [] };
  }

  saveToStorage() {
    localStorage.setItem('food_cart', JSON.stringify(this.cart));
    // Dispatch a custom event to notify other parts of the application (e.g. Nav Bar badge)
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: this.cart }));
  }

  loadCouponFromStorage() {
    const saved = localStorage.getItem('food_cart_coupon');
    return saved ? JSON.parse(saved) : null;
  }

  saveCouponToStorage() {
    if (this.activeCoupon) {
      localStorage.setItem('food_cart_coupon', JSON.stringify(this.activeCoupon));
    } else {
      localStorage.removeItem('food_cart_coupon');
    }
  }

  getCart() {
    return this.cart;
  }

  addToCart(item, restaurant) {
    // If cart is from another restaurant, we must alert or confirm replacement
    if (this.cart.restaurantId && this.cart.restaurantId !== restaurant.id && this.cart.items.length > 0) {
      // Return a status indicating conflict, handled by UI to prompt user
      return { status: 'conflict', currentRestaurantName: this.cart.restaurantName };
    }

    if (!this.cart.restaurantId || this.cart.items.length === 0) {
      this.cart.restaurantId = restaurant.id;
      this.cart.restaurantName = restaurant.name;
    }

    const existingIndex = this.cart.items.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      this.cart.items[existingIndex].quantity += 1;
    } else {
      this.cart.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        veg: item.veg,
        image: item.image,
        quantity: 1
      });
    }

    this.saveToStorage();
    this.renderCartDrawer();
    return { status: 'success' };
  }

  forceAddToCart(item, restaurant) {
    this.cart.restaurantId = restaurant.id;
    this.cart.restaurantName = restaurant.name;
    this.cart.items = [{
      id: item.id,
      name: item.name,
      price: item.price,
      veg: item.veg,
      image: item.image,
      quantity: 1
    }];
    this.activeCoupon = null; // Reset coupon on cart reset
    this.saveCouponToStorage();
    this.saveToStorage();
    this.renderCartDrawer();
  }

  updateQuantity(itemId, change) {
    const itemIndex = this.cart.items.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
      this.cart.items[itemIndex].quantity += change;
      if (this.cart.items[itemIndex].quantity <= 0) {
        this.cart.items.splice(itemIndex, 1);
      }
      
      if (this.cart.items.length === 0) {
        this.cart.restaurantId = null;
        this.cart.restaurantName = null;
        this.activeCoupon = null;
        this.saveCouponToStorage();
      }
      
      this.saveToStorage();
      this.renderCartDrawer();
    }
  }

  clearCart() {
    this.cart = { restaurantId: null, restaurantName: null, items: [] };
    this.activeCoupon = null;
    this.saveCouponToStorage();
    this.saveToStorage();
    this.renderCartDrawer();
  }

  getCartCount() {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getGSTAmount() {
    const subtotal = this.getSubtotal();
    return Math.round(subtotal * (this.gstPercentage / 100));
  }

  getDeliveryFee() {
    if (this.cart.items.length === 0) return 0;
    if (this.activeCoupon && this.activeCoupon.code === 'FREEPERK') return 0;
    
    // Make delivery free above ₹350 as a premium visual perk
    if (this.getSubtotal() >= 350) return 0;
    
    return this.deliveryFee;
  }

  getDiscountAmount() {
    if (!this.activeCoupon || this.cart.items.length === 0) return 0;
    const subtotal = this.getSubtotal();
    
    if (subtotal < this.activeCoupon.minCart) return 0;

    if (this.activeCoupon.discountType === 'percentage') {
      const discount = (subtotal * this.activeCoupon.value) / 100;
      return Math.min(discount, this.activeCoupon.maxDiscount || Infinity);
    } else if (this.activeCoupon.discountType === 'flat') {
      return this.activeCoupon.value;
    } else if (this.activeCoupon.discountType === 'delivery') {
      return this.deliveryFee;
    }
    return 0;
  }

  getGrandTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    
    const gst = this.getGSTAmount();
    const delivery = this.getDeliveryFee();
    const discount = this.getDiscountAmount();
    
    return subtotal + gst + delivery - discount;
  }

  applyCouponCode(code) {
    const upperCode = code.trim().toUpperCase();
    const couponInfo = COUPONS[upperCode];
    
    if (!couponInfo) {
      return { success: false, message: 'Invalid Promo Code!' };
    }

    const subtotal = this.getSubtotal();
    if (subtotal < couponInfo.minCart) {
      return { success: false, message: `Minimum cart value of ₹${couponInfo.minCart} required!` };
    }

    this.activeCoupon = { code: upperCode, ...couponInfo };
    this.saveCouponToStorage();
    this.saveToStorage();
    this.renderCartDrawer();
    return { success: true, message: `Coupon "${upperCode}" applied successfully!` };
  }

  removeCoupon() {
    this.activeCoupon = null;
    this.saveCouponToStorage();
    this.saveToStorage();
    this.renderCartDrawer();
  }

  // Auto-renders the Cart Drawer if the relevant elements exist in the DOM
  renderCartDrawer() {
    const cartCountBadges = document.querySelectorAll('.cart-count-badge');
    const count = this.getCartCount();
    
    cartCountBadges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
        badge.classList.add('flex', 'scale-100');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex', 'scale-100');
      }
    });

    const drawerContainer = document.getElementById('cart-drawer-items');
    if (!drawerContainer) return; // Drawer elements not on this page

    const subtotalEl = document.getElementById('cart-summary-subtotal');
    const gstEl = document.getElementById('cart-summary-gst');
    const deliveryEl = document.getElementById('cart-summary-delivery');
    const discountRow = document.getElementById('cart-summary-discount-row');
    const discountEl = document.getElementById('cart-summary-discount');
    const grandTotalEl = document.getElementById('cart-summary-total');
    const activeRestaurantNameEl = document.getElementById('cart-restaurant-name');
    const emptyStateEl = document.getElementById('cart-empty-state');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    const checkoutContainer = document.getElementById('cart-checkout-section');
    const couponMessageEl = document.getElementById('coupon-message');
    const removeCouponBtn = document.getElementById('remove-coupon-btn');
    const couponAppliedSection = document.getElementById('coupon-applied-section');
    const couponTextEl = document.getElementById('applied-coupon-text');

    if (this.cart.items.length === 0) {
      // Empty state
      drawerContainer.innerHTML = '';
      if (emptyStateEl) emptyStateEl.classList.remove('hidden');
      if (checkoutContainer) checkoutContainer.classList.add('hidden');
      if (activeRestaurantNameEl) activeRestaurantNameEl.textContent = 'Empty Cart';
      if (couponAppliedSection) couponAppliedSection.classList.add('hidden');
      return;
    }

    // Hide empty state and show checkout section
    if (emptyStateEl) emptyStateEl.classList.add('hidden');
    if (checkoutContainer) checkoutContainer.classList.remove('hidden');
    if (activeRestaurantNameEl) activeRestaurantNameEl.textContent = this.cart.restaurantName;

    // Render items
    drawerContainer.innerHTML = this.cart.items.map(item => `
      <div class="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-xl mb-3 shadow-xs border border-gray-100 dark:border-zinc-700 transition-all hover:border-orange-200">
        <div class="flex items-center gap-3">
          <div class="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-700">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-3 h-3 border ${item.veg ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'} rounded-xs shrink-0 flex items-center justify-center">
                <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
              <h4 class="font-medium text-sm text-gray-800 dark:text-zinc-200 line-clamp-1">${item.name}</h4>
            </div>
            <p class="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">₹${item.price} each</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- Quantity Selector -->
          <div class="flex items-center border border-gray-200 dark:border-zinc-600 rounded-lg overflow-hidden h-8 bg-gray-50 dark:bg-zinc-900">
            <button class="px-2.5 text-gray-500 hover:text-orange-500 dark:text-zinc-400 font-bold transition-colors cart-decrease-btn" data-id="${item.id}">-</button>
            <span class="px-2 text-sm font-semibold text-gray-800 dark:text-zinc-200">${item.quantity}</span>
            <button class="px-2.5 text-gray-500 hover:text-orange-500 dark:text-zinc-400 font-bold transition-colors cart-increase-btn" data-id="${item.id}">+</button>
          </div>
          <!-- Price total -->
          <span class="font-semibold text-sm text-gray-800 dark:text-zinc-200 w-16 text-right">₹${item.price * item.quantity}</span>
        </div>
      </div>
    `).join('');

    // Bind item buttons
    drawerContainer.querySelectorAll('.cart-decrease-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        this.updateQuantity(id, -1);
      });
    });

    drawerContainer.querySelectorAll('.cart-increase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        this.updateQuantity(id, 1);
      });
    });

    // Update Totals
    const subtotal = this.getSubtotal();
    const gst = this.getGSTAmount();
    const delivery = this.getDeliveryFee();
    const discount = this.getDiscountAmount();
    const grandTotal = this.getGrandTotal();

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (gstEl) gstEl.textContent = `₹${gst}`;
    
    if (deliveryEl) {
      if (delivery === 0) {
        deliveryEl.innerHTML = `<span class="text-green-500 font-medium">FREE</span> <span class="line-through text-gray-400 text-xs ml-1">₹40</span>`;
      } else {
        deliveryEl.textContent = `₹${delivery}`;
      }
    }

    if (discount > 0) {
      if (discountRow) discountRow.classList.remove('hidden');
      if (discountEl) discountEl.textContent = `-₹${discount}`;
    } else {
      if (discountRow) discountRow.classList.add('hidden');
    }

    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;

    // Manage coupon UI
    if (this.activeCoupon) {
      const isEligible = subtotal >= this.activeCoupon.minCart;
      if (isEligible) {
        if (couponAppliedSection) couponAppliedSection.classList.remove('hidden');
        if (couponTextEl) couponTextEl.textContent = `${this.activeCoupon.code} Applied (-₹${discount})`;
        if (couponMessageEl) {
          couponMessageEl.textContent = `Saving of ₹${discount} unlocked!`;
          couponMessageEl.className = 'text-xs text-green-500 mt-1 font-medium';
        }
      } else {
        // Disqualify due to value drop
        this.activeCoupon = null;
        this.saveCouponToStorage();
        if (couponAppliedSection) couponAppliedSection.classList.add('hidden');
        if (couponMessageEl) {
          couponMessageEl.textContent = `Coupon removed: Minimum value ₹${this.activeCoupon ? this.activeCoupon.minCart : 0} required.`;
          couponMessageEl.className = 'text-xs text-red-500 mt-1';
        }
      }
    } else {
      if (couponAppliedSection) couponAppliedSection.classList.add('hidden');
    }
  }

  // Setup the slide out UI triggers
  initCartDrawerUI() {
    const openBtns = document.querySelectorAll('.cart-drawer-open-btn');
    const closeBtns = document.querySelectorAll('.cart-drawer-close-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const applyCouponForm = document.getElementById('coupon-apply-form');
    const couponInput = document.getElementById('coupon-input');
    const couponMessageEl = document.getElementById('coupon-message');
    const removeCouponBtn = document.getElementById('remove-coupon-btn');

    const toggleDrawer = (isOpen) => {
      if (!cartDrawer) return;
      if (isOpen) {
        cartDrawer.classList.remove('translate-x-full');
        if (cartOverlay) cartOverlay.classList.remove('hidden', 'opacity-0');
        if (cartOverlay) cartOverlay.classList.add('opacity-50');
        this.renderCartDrawer();
      } else {
        cartDrawer.classList.add('translate-x-full');
        if (cartOverlay) {
          cartOverlay.classList.remove('opacity-50');
          cartOverlay.classList.add('opacity-0');
          setTimeout(() => cartOverlay.classList.add('hidden'), 300);
        }
      }
    };

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleDrawer(true);
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleDrawer(false);
      });
    });

    if (cartOverlay) {
      cartOverlay.addEventListener('click', () => {
        toggleDrawer(false);
      });
    }

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
          this.clearCart();
        }
      });
    }

    if (applyCouponForm && couponInput) {
      applyCouponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = couponInput.value;
        if (!code) return;
        const res = this.applyCouponCode(code);
        if (couponMessageEl) {
          couponMessageEl.textContent = res.message;
          if (res.success) {
            couponMessageEl.className = 'text-xs text-green-500 mt-1 font-medium';
            couponInput.value = '';
          } else {
            couponMessageEl.className = 'text-xs text-red-500 mt-1';
          }
        }
      });
    }

    if (removeCouponBtn) {
      removeCouponBtn.addEventListener('click', () => {
        this.removeCoupon();
        if (couponMessageEl) {
          couponMessageEl.textContent = 'Coupon removed';
          couponMessageEl.className = 'text-xs text-gray-500 mt-1';
        }
      });
    }

    // Run initial render
    this.renderCartDrawer();
  }
}

export const cartManager = new CartManager();
