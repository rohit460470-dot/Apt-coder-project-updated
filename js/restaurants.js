/**
 * Food Delivery Web Application - Restaurant Listing & Food Menu Controller
 */

import { restaurants, CATEGORY_ICONS, categoriesMap } from './data.js';
import { cartManager } from './cart.js';
import { toggleFavoriteRestaurant } from './app.js';

// Global state for Listing page
let activeFilters = {
  search: '',
  category: '',
  vegOnly: false,
  nonVegOnly: false,
  rating: 0,
  maxDeliveryTime: 60,
  maxPrice: 1000
};

let activeSort = 'rating'; // default sort

// Stack-based Recently Viewed Restaurants structure (Mandatory Data Structure #5)
class RecentlyViewedStack {
  constructor() {
    this.key = 'recently_viewed_restaurants';
    this.maxSize = 5;
  }

  push(restaurantId) {
    let stack = this.getStack();
    // Remove if already exists to float it to top
    stack = stack.filter(id => id !== restaurantId);
    
    stack.push(restaurantId);
    
    if (stack.length > this.maxSize) {
      stack.shift(); // pop from bottom
    }
    localStorage.setItem(this.key, JSON.stringify(stack));
  }

  getStack() {
    const saved = localStorage.getItem(this.key);
    return saved ? JSON.parse(saved) : [];
  }
  
  clear() {
    localStorage.removeItem(this.key);
  }
}

const recentlyViewedStack = new RecentlyViewedStack();

document.addEventListener('DOMContentLoaded', () => {
  // Sync URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');
  const catParam = urlParams.get('category');
  const searchParam = urlParams.get('search');

  if (restaurantId) {
    // Mode A: Render Food Menu Page
    loadMenuPage(parseInt(restaurantId));
  } else {
    // Mode B: Render Restaurants Listing Page
    if (catParam) activeFilters.category = catParam;
    if (searchParam) activeFilters.search = searchParam;
    
    initListingPage();
  }
});

// ==========================================
// MODE A: DYNAMIC FOOD MENU PAGE
// ==========================================

function loadMenuPage(restaurantId) {
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) {
    document.getElementById('listing-section').innerHTML = `
      <div class="text-center py-20 px-4">
        <span class="text-6xl">😕</span>
        <h2 class="text-2xl font-bold mt-4 text-gray-800 dark:text-zinc-100">Restaurant Not Found</h2>
        <p class="text-gray-500 mt-2">The restaurant you are looking for does not exist or has been removed.</p>
        <a href="restaurants.html" class="inline-block mt-6 bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600">Back to Listings</a>
      </div>
    `;
    return;
  }

  // Push to Recently Viewed Stack (O(1) operation)
  recentlyViewedStack.push(restaurant.id);

  // Toggle layout sections
  const listingSec = document.getElementById('listing-section');
  const menuSec = document.getElementById('menu-section');
  if (listingSec) listingSec.classList.add('hidden');
  if (menuSec) menuSec.classList.remove('hidden');

  renderMenuHeader(restaurant);
  renderRecentlyViewedOnMenu();

  // Menu filters state
  let menuSearch = '';
  let menuVegOnly = false;
  let menuNonVegOnly = false;
  let menuActiveCategory = 'All';

  const filterAndRenderMenu = () => {
    let filteredMenu = restaurant.menu;

    // Filter by search
    if (menuSearch) {
      filteredMenu = filteredMenu.filter(item => 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuSearch.toLowerCase())
      );
    }

    // Filter by Veg/Non-Veg
    if (menuVegOnly) {
      filteredMenu = filteredMenu.filter(item => item.veg === true);
    } else if (menuNonVegOnly) {
      filteredMenu = filteredMenu.filter(item => item.veg === false);
    }

    // Filter by Menu categories
    if (menuActiveCategory !== 'All') {
      filteredMenu = filteredMenu.filter(item => item.category === menuActiveCategory);
    }

    renderMenuItems(filteredMenu, restaurant);
  };

  // Setup Menu page listeners
  const menuSearchInput = document.getElementById('menu-search');
  if (menuSearchInput) {
    menuSearchInput.addEventListener('input', (e) => {
      menuSearch = e.target.value.trim();
      filterAndRenderMenu();
    });
  }

  const vegToggle = document.getElementById('menu-veg-only');
  const nonVegToggle = document.getElementById('menu-non-veg-only');

  if (vegToggle) {
    vegToggle.addEventListener('change', (e) => {
      menuVegOnly = e.target.checked;
      if (menuVegOnly && nonVegToggle) nonVegToggle.checked = false;
      menuNonVegOnly = false;
      filterAndRenderMenu();
    });
  }

  if (nonVegToggle) {
    nonVegToggle.addEventListener('change', (e) => {
      menuNonVegOnly = e.target.checked;
      if (menuNonVegOnly && vegToggle) vegToggle.checked = false;
      menuVegOnly = false;
      filterAndRenderMenu();
    });
  }

  // Generate and render Category Navigation tab links
  renderMenuCategoryTabs(restaurant, (category) => {
    menuActiveCategory = category;
    filterAndRenderMenu();
  });

  // Initial menu render
  filterAndRenderMenu();

  // Listen to cart update events to refresh menu item quantities
  window.addEventListener('cart-updated', () => {
    filterAndRenderMenu();
  });
}

function renderMenuHeader(restaurant) {
  const headerContainer = document.getElementById('menu-restaurant-header');
  if (!headerContainer) return;

  const isFav = JSON.parse(localStorage.getItem('food_favorites') || '[]').includes(restaurant.id);

  headerContainer.innerHTML = `
    <!-- Large Banner Image -->
    <div class="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-md">
      <img src="${restaurant.image}" alt="${restaurant.name}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
      
      <!-- Back Link -->
      <a href="restaurants.html" class="absolute left-6 top-6 bg-white/90 dark:bg-zinc-950/90 text-gray-800 dark:text-zinc-200 p-2.5 rounded-full hover:scale-105 active:scale-95 shadow-md transition-all flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </a>

      <!-- Favorite Overlay -->
      <button class="absolute right-6 top-6 w-11 h-11 rounded-full bg-white/90 dark:bg-zinc-950/90 flex items-center justify-center hover:scale-110 active:scale-95 shadow-md transition-all menu-fav-btn cursor-pointer" data-id="${restaurant.id}">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}" fill="${isFav ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <!-- Restaurant details Overlay -->
      <div class="absolute bottom-6 left-6 right-6 text-white">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="bg-orange-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">${restaurant.offer}</span>
            <h1 class="text-3xl md:text-5xl font-black mt-2 tracking-tight">${restaurant.name}</h1>
            <p class="text-white/85 text-sm mt-1.5 font-medium">${restaurant.category} • ${restaurant.address}</p>
          </div>
          
          <div class="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto">
            <div class="text-center pr-4 border-r border-white/20">
              <div class="flex items-center justify-center gap-1 text-green-400 font-extrabold text-base">
                <span>★</span> ${restaurant.rating}
              </div>
              <div class="text-[10px] text-white/75 uppercase tracking-wider font-semibold mt-0.5">Rating</div>
            </div>
            <div class="text-center pr-4 border-r border-white/20">
              <div class="text-white font-extrabold text-base">${restaurant.deliveryTime}m</div>
              <div class="text-[10px] text-white/75 uppercase tracking-wider font-semibold mt-0.5">Speed</div>
            </div>
            <div class="text-center">
              <div class="text-white font-extrabold text-base">₹${restaurant.price}</div>
              <div class="text-[10px] text-white/75 uppercase tracking-wider font-semibold mt-0.5">For Two</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind favorite in menu header
  headerContainer.querySelector('.menu-fav-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const id = parseInt(btn.getAttribute('data-id'));
    toggleFavoriteRestaurant(id, btn);
  });
}

function renderMenuCategoryTabs(restaurant, onSelectCategory) {
  const container = document.getElementById('menu-category-tabs');
  if (!container) return;

  // Extract unique categories in the restaurant's menu
  const menuCats = ['All', ...new Set(restaurant.menu.map(item => item.category))];
  
  container.innerHTML = menuCats.map((cat, idx) => `
    <button class="px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${idx === 0 ? 'bg-orange-500 text-white shadow-xs' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  // Bind click handlers
  const tabs = container.querySelectorAll('button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.className = "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700");
      tab.className = "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer bg-orange-500 text-white shadow-xs";
      onSelectCategory(tab.getAttribute('data-cat'));
    });
  });
}

function renderMenuItems(items, restaurant) {
  const container = document.getElementById('menu-items-grid');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <span class="text-5xl">🔍</span>
        <h3 class="font-bold text-lg text-gray-800 dark:text-zinc-100 mt-3">No Dishes Found</h3>
        <p class="text-xs text-gray-400 dark:text-zinc-500 mt-1">Try adjusting your search query or food filters.</p>
      </div>
    `;
    return;
  }

  const cart = cartManager.getCart();

  container.innerHTML = items.map(item => {
    // Check if item is already in cart to show appropriate buttons
    const cartItem = cart.items.find(i => i.id === item.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    return `
      <div class="group bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 shadow-xs hover:border-orange-200 dark:hover:border-orange-500/60 hover:shadow-md transition-all duration-300 flex justify-between gap-4 relative" id="food-item-card-${item.id}">
        <!-- Details Column -->
        <div class="flex-grow flex flex-col justify-between max-w-[65%]">
          <div>
            <!-- Veg / Non veg icon -->
            <span class="inline-flex w-4 h-4 border ${item.veg ? 'border-green-600 bg-green-500/10' : 'border-red-600 bg-red-500/10'} rounded-xs items-center justify-center shrink-0">
              <span class="w-1.5 h-1.5 ${item.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full"></span>
            </span>
            
            <h3 class="font-bold text-gray-800 dark:text-zinc-100 text-base mt-1.5 leading-snug line-clamp-1">${item.name}</h3>
            
            <span class="inline-flex items-center gap-0.5 text-xs text-orange-500 dark:text-orange-400 font-extrabold mt-1">
              ★ ${item.rating}
            </span>
            
            <p class="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-normal">${item.description}</p>
          </div>
          
          <div class="mt-3">
            <span class="font-extrabold text-gray-900 dark:text-zinc-100 text-lg">₹${item.price}</span>
          </div>
        </div>

        <!-- Image and Adding Controllers Column -->
        <div class="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 border border-gray-50 dark:border-zinc-700/60">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          
          <!-- Controller Placement -->
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] z-10 shadow-md">
            ${quantityInCart > 0 ? `
              <!-- Dynamic Quantity Controller -->
              <div class="flex items-center justify-between bg-orange-500 text-white rounded-lg h-8 overflow-hidden">
                <button class="px-2.5 h-full text-white font-black hover:bg-orange-600 transition-colors cursor-pointer menu-qty-btn" data-id="${item.id}" data-delta="-1">-</button>
                <span class="text-xs font-bold select-none">${quantityInCart}</span>
                <button class="px-2.5 h-full text-white font-black hover:bg-orange-600 transition-colors cursor-pointer menu-qty-btn" data-id="${item.id}" data-delta="1">+</button>
              </div>
            ` : `
              <!-- Add to Cart Button -->
              <button class="w-full bg-white dark:bg-zinc-900 hover:bg-orange-500 dark:hover:bg-orange-500 text-orange-500 dark:text-orange-400 hover:text-white! font-extrabold text-xs py-2 rounded-lg border border-orange-100 dark:border-zinc-700 transition-all cursor-pointer text-center flex items-center justify-center gap-1 menu-add-btn" data-id="${item.id}">
                <span>+ ADD</span>
              </button>
            `}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    `;
  }).join('');

  // Bind Add Buttons
  container.querySelectorAll('.menu-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      const item = restaurant.menu.find(m => m.id === id);
      
      const res = cartManager.addToCart(item, restaurant);
      
      if (res.status === 'conflict') {
        // Render replacement confirmation overlay
        showCartConflictModal(item, restaurant, res.currentRestaurantName);
      }
    });
  });

  // Bind Quantity Changers
  container.querySelectorAll('.menu-qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      const delta = parseInt(btn.getAttribute('data-delta'));
      cartManager.updateQuantity(id, delta);
    });
  });
}

function showCartConflictModal(item, restaurant, otherRestaurantName) {
  // Create dialog overlay
  const modal = document.createElement('div');
  modal.className = "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in";
  modal.id = "cart-conflict-modal";
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-zinc-700 animate-slide-up">
      <div class="text-center">
        <span class="text-4xl">⚠️</span>
        <h3 class="text-lg font-extrabold text-gray-900 dark:text-zinc-100 mt-3">Reset Cart Items?</h3>
        <p class="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
          Your cart contains dishes from <strong class="text-orange-500">${otherRestaurantName}</strong>. 
          Do you want to discard your current cart and start a fresh order from <strong>${restaurant.name}</strong>?
        </p>
      </div>
      <div class="flex items-center gap-3 mt-6">
        <button class="flex-1 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer" id="conflict-cancel-btn">
          Cancel
        </button>
        <button class="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer" id="conflict-confirm-btn">
          Yes, Start Fresh
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cancelBtn = modal.querySelector('#conflict-cancel-btn');
  const confirmBtn = modal.querySelector('#conflict-confirm-btn');

  const destroyModal = () => {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.remove(), 200);
  };

  cancelBtn.addEventListener('click', destroyModal);
  confirmBtn.addEventListener('click', () => {
    cartManager.forceAddToCart(item, restaurant);
    destroyModal();
  });
}

function renderRecentlyViewedOnMenu() {
  const container = document.getElementById('menu-recently-viewed');
  if (!container) return;

  const stack = recentlyViewedStack.getStack();
  
  // Filter out the restaurant currently open
  const urlParams = new URLSearchParams(window.location.search);
  const currentId = parseInt(urlParams.get('id'));
  const list = stack
    .filter(id => id !== currentId)
    .map(id => restaurants.find(r => r.id === id))
    .filter(Boolean)
    .reverse(); // Reverse stack so last viewed is shown first

  if (list.length === 0) {
    container.parentElement.classList.add('hidden');
    return;
  }

  container.parentElement.classList.remove('hidden');

  container.innerHTML = list.map(res => `
    <a href="restaurants.html?id=${res.id}" class="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:border-orange-200 border border-transparent shadow-xs transition-all shrink-0">
      <img src="${res.image}" alt="${res.name}" class="w-10 h-10 rounded-lg object-cover">
      <div class="text-left">
        <h4 class="font-bold text-xs text-gray-800 dark:text-zinc-200 line-clamp-1">${res.name}</h4>
        <span class="text-[10px] text-green-500 font-bold">★ ${res.rating}</span>
      </div>
    </a>
  `).join('');
}


// ==========================================
// MODE B: RESTAURANT LISTING PAGE
// ==========================================

function initListingPage() {
  // Show skeletons initially
  showShimmerSkeletons();

  // Load and render category filters bar (HashMap-driven, O(1) representation)
  renderListingCategories();
  renderListingRecentlyViewed();

  // Setup search input
  const searchInput = document.getElementById('restaurant-search');
  if (searchInput) {
    if (activeFilters.search) searchInput.value = activeFilters.search;
    
    searchInput.addEventListener('input', (e) => {
      activeFilters.search = e.target.value.trim();
      filterAndRenderRestaurants();
    });
  }

  // Bind advanced filter widgets
  const vegCheck = document.getElementById('filter-veg');
  const ratingSelect = document.getElementById('filter-rating');
  const priceSelect = document.getElementById('filter-price');
  const deliverySelect = document.getElementById('filter-delivery');
  const sortSelect = document.getElementById('sort-dropdown');

  if (vegCheck) {
    vegCheck.addEventListener('change', (e) => {
      activeFilters.vegOnly = e.target.checked;
      filterAndRenderRestaurants();
    });
  }

  if (ratingSelect) {
    ratingSelect.addEventListener('change', (e) => {
      activeFilters.rating = parseFloat(e.target.value) || 0;
      filterAndRenderRestaurants();
    });
  }

  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      activeFilters.maxPrice = parseInt(e.target.value) || 1000;
      filterAndRenderRestaurants();
    });
  }

  if (deliverySelect) {
    deliverySelect.addEventListener('change', (e) => {
      activeFilters.maxDeliveryTime = parseInt(e.target.value) || 60;
      filterAndRenderRestaurants();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndRenderRestaurants();
    });
  }

  // Simulate network delay to show skeletons before rendering data
  setTimeout(() => {
    filterAndRenderRestaurants();
  }, 750);
}

function showShimmerSkeletons() {
  const container = document.getElementById('restaurants-grid');
  if (!container) return;

  container.innerHTML = Array.from({ length: 8 }).map(() => `
    <div class="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-700 p-3 shadow-xs animate-pulse">
      <!-- Image Shimmer -->
      <div class="bg-gray-200 dark:bg-zinc-700 aspect-video rounded-xl w-full"></div>
      
      <!-- Content Shimmer -->
      <div class="p-3">
        <div class="flex items-center justify-between">
          <div class="bg-gray-200 dark:bg-zinc-700 h-5 w-2/3 rounded-md"></div>
          <div class="bg-gray-200 dark:bg-zinc-700 h-5 w-8 rounded-md"></div>
        </div>
        <div class="bg-gray-100 dark:bg-zinc-700/60 h-3 w-1/2 rounded-md mt-2"></div>
        
        <!-- Details Row Shimmer -->
        <div class="flex items-center justify-between border-t border-gray-100 dark:border-zinc-700 mt-4 pt-3">
          <div class="bg-gray-100 dark:bg-zinc-700/60 h-4 w-12 rounded-md"></div>
          <div class="bg-gray-100 dark:bg-zinc-700/60 h-4 w-12 rounded-md"></div>
          <div class="bg-gray-100 dark:bg-zinc-700/60 h-4 w-12 rounded-md"></div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderListingCategories() {
  const container = document.getElementById('listing-categories-container');
  if (!container) return;

  const cats = ['All', ...Object.keys(CATEGORY_ICONS)];
  
  container.innerHTML = cats.map(cat => {
    const isSelected = cat === (activeFilters.category || 'All');
    return `
      <button class="px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${isSelected ? 'bg-orange-500 text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-zinc-700 hover:border-orange-200'}" data-cat="${cat}">
        <span>${cat !== 'All' ? CATEGORY_ICONS[cat] : '🏠'}</span>
        <span>${cat}</span>
      </button>
    `;
  }).join('');

  // Bind category button clicks
  const buttons = container.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const catVal = btn.getAttribute('data-cat');
      activeFilters.category = catVal === 'All' ? '' : catVal;
      
      // Update active states
      buttons.forEach(b => b.className = "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-zinc-700 hover:border-orange-200");
      btn.className = "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 bg-orange-500 text-white shadow-xs";
      
      filterAndRenderRestaurants();
    });
  });
}

function renderListingRecentlyViewed() {
  const container = document.getElementById('listing-recently-viewed');
  if (!container) return;

  const stack = recentlyViewedStack.getStack();
  const list = stack
    .map(id => restaurants.find(r => r.id === id))
    .filter(Boolean)
    .reverse();

  if (list.length === 0) {
    container.parentElement.classList.add('hidden');
    return;
  }

  container.parentElement.classList.remove('hidden');

  container.innerHTML = list.map(res => `
    <a href="restaurants.html?id=${res.id}" class="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl hover:border-orange-200 border border-gray-100 dark:border-zinc-700 shadow-xs transition-all shrink-0">
      <img src="${res.image}" alt="${res.name}" class="w-10 h-10 rounded-lg object-cover">
      <div class="text-left">
        <h4 class="font-bold text-xs text-gray-800 dark:text-zinc-200 line-clamp-1">${res.name}</h4>
        <span class="text-[10px] text-green-500 font-bold">★ ${res.rating}</span>
      </div>
    </a>
  `).join('');
}

function filterAndRenderRestaurants() {
  const container = document.getElementById('restaurants-grid');
  if (!container) return;

  let results = [...restaurants];

  // 1. Filter by category (HashMap backed logic O(1))
  if (activeFilters.category) {
    // Check if the precomputed categoriesMap contains this category
    results = categoriesMap[activeFilters.category] || [];
  }

  // 2. Filter by Search Query (O(n) filter)
  if (activeFilters.search) {
    const q = activeFilters.search.toLowerCase();
    results = results.filter(res => 
      res.name.toLowerCase().includes(q) || 
      res.category.toLowerCase().includes(q) ||
      // Search menus too!
      res.menu.some(item => item.name.toLowerCase().includes(q))
    );
  }

  // 3. Filter by Veg Only
  if (activeFilters.vegOnly) {
    // If restaurant has any veg dish
    results = results.filter(res => res.menu.some(item => item.veg === true));
  }

  // 4. Filter by Rating
  if (activeFilters.rating > 0) {
    results = results.filter(res => res.rating >= activeFilters.rating);
  }

  // 5. Filter by Price Max
  if (activeFilters.maxPrice < 1000) {
    results = results.filter(res => res.price <= activeFilters.maxPrice);
  }

  // 6. Filter by Delivery Time Max
  if (activeFilters.maxDeliveryTime < 60) {
    results = results.filter(res => res.deliveryTime <= activeFilters.maxDeliveryTime);
  }

  // 7. Sort Restaurants (O(n log n) standard sort)
  if (activeSort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (activeSort === 'deliveryTime') {
    results.sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (activeSort === 'alphabetical') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (activeSort === 'price-low') {
    results.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-high') {
    results.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'newest') {
    // Simulate newest by sorting by descending ID
    results.sort((a, b) => b.id - a.id);
  }

  renderRestaurantCards(results);
}

function renderRestaurantCards(list) {
  const container = document.getElementById('restaurants-grid');
  if (!container) return;

  const countEl = document.getElementById('results-count-text');
  if (countEl) {
    countEl.textContent = `${list.length} Restaurants found`;
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-24 bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-zinc-700 shadow-xs max-w-lg mx-auto">
        <span class="text-6xl">🍲</span>
        <h3 class="font-extrabold text-xl text-gray-800 dark:text-zinc-100 mt-4">No Restaurants Match</h3>
        <p class="text-xs text-gray-400 dark:text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
          We couldn't find any listings for your current filtering settings. Try clearing some filters or searching for something else!
        </p>
        <button class="mt-6 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer" id="reset-filters-btn">
          Reset All Filters
        </button>
      </div>
    `;

    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
      activeFilters = {
        search: '',
        category: '',
        vegOnly: false,
        nonVegOnly: false,
        rating: 0,
        maxDeliveryTime: 60,
        maxPrice: 1000
      };
      
      const searchInput = document.getElementById('restaurant-search');
      if (searchInput) searchInput.value = '';
      
      const vegCheck = document.getElementById('filter-veg');
      if (vegCheck) vegCheck.checked = false;

      const ratingSelect = document.getElementById('filter-rating');
      if (ratingSelect) ratingSelect.value = '0';

      const priceSelect = document.getElementById('filter-price');
      if (priceSelect) priceSelect.value = '1000';

      const deliverySelect = document.getElementById('filter-delivery');
      if (deliverySelect) deliverySelect.value = '60';

      renderListingCategories();
      filterAndRenderRestaurants();
    });
    return;
  }

  const savedFavorites = JSON.parse(localStorage.getItem('food_favorites') || '[]');

  container.innerHTML = list.map(res => {
    const isFav = savedFavorites.includes(res.id);
    
    // Check if open/closed based on delivery speed (simulate closed if time > 40m for realism!)
    const isOpen = res.deliveryTime <= 40;

    return `
      <div class="group bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-xs border border-gray-100 dark:border-zinc-700 hover:border-orange-100 dark:hover:border-orange-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between" id="restaurant-card-${res.id}">
        <!-- Image & Badges -->
        <div class="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-900">
          <img src="${res.image}" alt="${res.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          
          <!-- Offer Badge -->
          <span class="absolute left-3 bottom-3 bg-orange-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md shadow-sm z-10">${res.offer}</span>
          
          <!-- Status Badge -->
          <span class="absolute left-3 top-3 ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'} text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm shadow-sm z-10">
            ${isOpen ? 'Open Now' : 'Closed'}
          </span>

          <!-- Favorite Button (Floating) -->
          <button class="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-950/90 flex items-center justify-center hover:scale-110 active:scale-95 shadow-sm transition-all favorite-btn z-10 cursor-pointer" data-id="${res.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-colors ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}" fill="${isFav ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <!-- Info Section -->
        <div class="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-extrabold text-gray-800 dark:text-zinc-100 text-base line-clamp-1 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">${res.name}</h3>
              <!-- Rating Pill -->
              <span class="flex items-center gap-1 bg-green-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-sm shrink-0">
                ${res.rating}★
              </span>
            </div>
            
            <p class="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">${res.category} • Italian, Continental</p>
          </div>

          <!-- Extra details: time, distance, price -->
          <div class="flex items-center justify-between border-t border-gray-50 dark:border-zinc-700/60 mt-3 pt-3 text-[11px] text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
            <span class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ${res.deliveryTime} mins
            </span>
            <span>•</span>
            <span>${res.distance} km</span>
            <span>•</span>
            <span class="text-gray-600 dark:text-zinc-300 font-bold">₹${res.price} For Two</span>
          </div>
          
          <div class="mt-4 flex gap-2">
            <a href="restaurants.html?id=${res.id}" class="w-full inline-flex items-center justify-center gap-1 text-center bg-gray-50 dark:bg-zinc-900 group-hover:bg-orange-500 hover:bg-orange-600 group-hover:text-white text-gray-700 dark:text-zinc-300 text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs">
              View Menu
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind favorite buttons
  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      toggleFavoriteRestaurant(id, btn);
      renderListingRecentlyViewed(); // update listings viewed panel too
    });
  });
}
