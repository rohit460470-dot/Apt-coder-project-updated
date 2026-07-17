/**
 * Food Delivery Web Application - Homepage / Global Application Controller
 */

import { restaurants, CATEGORY_ICONS, CATEGORY_IMAGES, COUPONS } from './data.js';
import { cartManager } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialise Global Systems
  initDarkMode();
  initAuthSystem();
  initGlobalCart();
  initOffersSystem();
  
  // 2. Page Specific Initialisation
  const isHomepage = document.getElementById('hero-section') !== null;
  if (isHomepage) {
    initHomepage();
  }
});

// ==========================================
// 1. GLOBAL SYSTEMS
// ==========================================

function initDarkMode() {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;

  const updateIcon = (isDark) => {
    toggleBtn.innerHTML = isDark 
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
    
    // Dynamically adjust title and aria-label to convey mode switching action clearly
    const themeLabel = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    toggleBtn.setAttribute('title', themeLabel);
    toggleBtn.setAttribute('aria-label', themeLabel);
  };

  // Check LocalStorage or preferred media query
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateIcon(isDark);

  toggleBtn.addEventListener('click', () => {
    const willBeDark = !document.documentElement.classList.contains('dark');
    if (willBeDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    updateIcon(willBeDark);
  });
}

function initGlobalCart() {
  cartManager.initCartDrawerUI();
  
  // Mobile Nav Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  
  if (mobileMenuBtn && mobileNav) {
    const toggleMobileNav = (isOpen) => {
      if (isOpen) {
        mobileNav.classList.remove('-translate-x-full');
        if (mobileNavOverlay) mobileNavOverlay.classList.remove('hidden', 'opacity-0');
        if (mobileNavOverlay) mobileNavOverlay.classList.add('opacity-40');
      } else {
        mobileNav.classList.add('-translate-x-full');
        if (mobileNavOverlay) {
          mobileNavOverlay.classList.remove('opacity-40');
          mobileNavOverlay.classList.add('opacity-0');
          setTimeout(() => mobileNavOverlay.classList.add('hidden'), 300);
        }
      }
    };

    mobileMenuBtn.addEventListener('click', () => toggleMobileNav(true));
    if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', () => toggleMobileNav(false));
    
    // Links inside mobile nav
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMobileNav(false));
    });
  }
}

// ==========================================
// 2. HOMEPAGE SPECIFIC CONTROLLER
// ==========================================

function initHomepage() {
  renderCategories();
  initPromoSlider();
  renderFeaturedRestaurants();
  initHomepageSearch();
}

function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const cats = Object.keys(CATEGORY_ICONS);
  container.innerHTML = cats.map(cat => `
    <a href="restaurants.html?category=${cat}" class="group relative flex flex-col items-center justify-end p-4 h-40 bg-gray-100 dark:bg-zinc-900 rounded-3xl shadow-xs border border-gray-150 dark:border-zinc-800 hover:border-orange-500 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden" id="category-card-${cat}">
      <!-- Background Image and Overlay (Covers whole div) -->
      <div class="absolute inset-0 z-0">
        <img src="${CATEGORY_IMAGES[cat]}" alt="${cat}" referrerPolicy="no-referrer" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15 group-hover:via-black/50 transition-colors duration-300"></div>
      </div>
      
      <!-- Icon / Image Wrapper (The Circle) -->
      <div class="relative z-10 w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border-2 border-white/40 shadow-sm">
        <img src="${CATEGORY_IMAGES[cat]}" alt="${cat}" referrerPolicy="no-referrer" class="w-full h-full object-cover" />
      </div>
      
      <span class="relative z-10 font-bold text-sm text-white tracking-wide uppercase drop-shadow-md group-hover:text-orange-450 dark:group-hover:text-orange-400 transition-colors">${cat}</span>
      <p class="relative z-10 text-[9px] text-orange-300/90 font-extrabold uppercase tracking-widest mt-0.5">Explore Deals</p>
    </a>
  `).join('');
}

function initPromoSlider() {
  const sliderTrack = document.getElementById('promo-slider-track');
  const prevBtn = document.getElementById('promo-prev-btn');
  const nextBtn = document.getElementById('promo-next-btn');
  const dotsContainer = document.getElementById('promo-dots');
  
  if (!sliderTrack) return;

  const slidesData = [
    {
      title: "50% OFF up to ₹120",
      sub: "Valid on all restaurants | Use code: WELCOME50",
      btnText: "Order Now",
      bg: "linear-gradient(135deg, #FC8019 0%, #FF9E43 100%)",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "FREE Delivery on Delicious Bites",
      sub: "No delivery charges on orders above ₹350",
      btnText: "Claim Free Delivery",
      bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "Flat ₹100 OFF with SUPER100",
      sub: "Order delicious meals over ₹599 and save big!",
      btnText: "Redeem Offer",
      bg: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      img: "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=800&auto=format&fit=crop&q=80"
    }
  ];

  // Render Slides
  sliderTrack.innerHTML = slidesData.map(slide => `
    <div class="w-full shrink-0 relative rounded-3xl overflow-hidden shadow-lg p-8 md:p-12 flex flex-col justify-between text-white" style="background: ${slide.bg}; height: 260px;">
      <!-- Decorative vector image inside banner -->
      <div class="absolute right-0 top-0 bottom-0 w-1/2 md:w-2/5 opacity-25 md:opacity-85 pointer-events-none">
        <img src="${slide.img}" alt="promo food" class="w-full h-full object-cover">
        <!-- Overlay fade -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
      </div>
      <div class="relative z-10 max-w-[60%]">
        <span class="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Limited Offer</span>
        <h2 class="text-2xl md:text-4xl font-extrabold mt-3 leading-tight tracking-tight">${slide.title}</h2>
        <p class="text-white/95 text-xs md:text-sm mt-2 font-medium">${slide.sub}</p>
      </div>
      <div class="relative z-10 mt-4">
        <a href="restaurants.html" class="inline-flex items-center gap-1.5 bg-white text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all text-xs md:text-sm shadow-sm">
          ${slide.btnText}
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </a>
      </div>
    </div>
  `).join('');

  // Render Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = slidesData.map((_, i) => `
      <button class="w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-all cursor-pointer ${i === 0 ? 'bg-white! w-6' : ''}" data-idx="${i}"></button>
    `).join('');
  }

  let currentSlide = 0;
  const numSlides = slidesData.length;

  const updateSlide = (idx) => {
    currentSlide = idx;
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update Dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('button');
      dots.forEach((dot, dIdx) => {
        if (dIdx === currentSlide) {
          dot.classList.add('bg-white!', 'w-6');
        } else {
          dot.classList.remove('bg-white!', 'w-6');
        }
      });
    }
  };

  const nextSlide = () => {
    const nextIdx = (currentSlide + 1) % numSlides;
    updateSlide(nextIdx);
  };

  const prevSlide = () => {
    const prevIdx = (currentSlide - 1 + numSlides) % numSlides;
    updateSlide(prevIdx);
  };

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  if (dotsContainer) {
    dotsContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        updateSlide(idx);
      });
    });
  }

  // Auto sliding every 5 seconds
  let slideTimer = setInterval(nextSlide, 5000);

  // Pause timer on hover
  const sliderContainer = document.getElementById('promo-slider-container');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', () => clearInterval(slideTimer));
    sliderContainer.addEventListener('mouseleave', () => {
      slideTimer = setInterval(nextSlide, 5000);
    });
  }
}

function renderFeaturedRestaurants() {
  const container = document.getElementById('featured-restaurants-container');
  if (!container) return;

  // Filter 6 restaurants with high ratings to feature
  const featured = restaurants
    .filter(res => res.rating >= 4.7)
    .slice(0, 6);

  const savedFavorites = JSON.parse(localStorage.getItem('food_favorites') || '[]');

  container.innerHTML = featured.map(res => {
    const isFav = savedFavorites.includes(res.id);
    return `
      <div class="group relative bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-xs border border-gray-100 dark:border-zinc-700 hover:border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between" id="restaurant-card-${res.id}">
        <!-- Image & Badges -->
        <div class="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-900">
          <img src="${res.image}" alt="${res.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
          
          <!-- Offer Badge -->
          <span class="absolute left-3 bottom-3 bg-orange-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md shadow-sm z-10">${res.offer}</span>
          
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
              <h3 class="font-bold text-gray-800 dark:text-zinc-100 text-base line-clamp-1 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">${res.name}</h3>
              <!-- Rating Pill -->
              <span class="flex items-center gap-1 bg-green-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-sm shrink-0">
                ${res.rating}★
              </span>
            </div>
            
            <p class="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">${res.category} • Italian Cuisine</p>
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
          
          <div class="mt-4">
            <a href="restaurants.html?id=${res.id}" class="w-full inline-flex items-center justify-center gap-1 text-center bg-gray-50 dark:bg-zinc-900 group-hover:bg-orange-500 hover:bg-orange-600 group-hover:text-white text-gray-700 dark:text-zinc-300 text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs">
              View Menu
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind favorite hearts
  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      toggleFavoriteRestaurant(id, btn);
    });
  });
}

function toggleFavoriteRestaurant(id, btnElement) {
  let savedFavorites = JSON.parse(localStorage.getItem('food_favorites') || '[]');
  const index = savedFavorites.indexOf(id);
  
  const svg = btnElement.querySelector('svg');
  if (index > -1) {
    savedFavorites.splice(index, 1);
    svg.classList.remove('text-red-500', 'fill-red-500');
    svg.classList.add('text-gray-400');
    svg.setAttribute('fill', 'none');
  } else {
    savedFavorites.push(id);
    svg.classList.add('text-red-500', 'fill-red-500');
    svg.classList.remove('text-gray-400');
    svg.setAttribute('fill', 'currentColor');
    
    // Smooth micro-interaction scaling bounce
    btnElement.classList.add('scale-125');
    setTimeout(() => btnElement.classList.remove('scale-125'), 200);
  }
  
  localStorage.setItem('food_favorites', JSON.stringify(savedFavorites));
}

function initHomepageSearch() {
  const searchForm = document.getElementById('home-search-form');
  const searchInput = document.getElementById('home-search-input');
  
  if (!searchForm || !searchInput) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `restaurants.html?search=${encodeURIComponent(query)}`;
    }
  });
}

// ==========================================
// 3. PREMIUM AUTHENTICATION & PROFILE SYSTEM
// ==========================================

function initAuthSystem() {
  // Pre-populate bitedash_users in localStorage with a premium demo account if empty
  let users = JSON.parse(localStorage.getItem('bitedash_users') || '[]');
  if (users.length === 0) {
    users.push({
      name: 'Rohit Mishra',
      email: 'rohitmishra04647@gmail.com',
      phone: '9876543210',
      password: 'password123'
    });
    localStorage.setItem('bitedash_users', JSON.stringify(users));
  }

  // Handle active order recording hook on checkout
  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      const form = document.getElementById('checkout-form');
      if (form && form.reportValidity()) {
        const cart = JSON.parse(localStorage.getItem('bitedash_cart') || '{"items":[]}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (cart && cart.items && cart.items.length > 0) {
          let orders = JSON.parse(localStorage.getItem('bitedash_orders') || '[]');
          const newOrder = {
            id: "BITEDASH-" + Math.floor(1000 + Math.random() * 9000),
            date: new Date().toLocaleString(),
            items: cart.items,
            subtotal: cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            status: 'Preparing your gourmet meal',
            userEmail: currentUser ? currentUser.email : 'guest@bitedash.com'
          };
          orders.unshift(newOrder);
          localStorage.setItem('bitedash_orders', JSON.stringify(orders));
        }
      }
    });
  }

  updateAuthStateUI();
}

function updateAuthStateUI() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const loginBtn = document.getElementById('login-btn');
  const mobileAuthContainer = document.getElementById('mobile-auth-container');

  if (currentUser) {
    // 1. Desktop Profile Dropdown
    if (loginBtn) {
      const wrapper = document.createElement('div');
      wrapper.id = 'user-menu-wrapper';
      wrapper.className = 'relative inline-block text-left';
      wrapper.innerHTML = `
        <button id="user-menu-toggle-btn" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-150 dark:border-zinc-700 text-gray-800 dark:text-white font-extrabold text-xs uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-zinc-750 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs">
          <div class="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black uppercase">
            ${currentUser.name.charAt(0)}
          </div>
          <span>Hi, ${currentUser.name.split(' ')[0]}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2.5 w-60 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-xl z-55 py-2 overflow-hidden transform origin-top-right transition-all duration-150">
          <div class="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20">
            <p class="text-xs font-extrabold text-gray-900 dark:text-white truncate">${currentUser.name}</p>
            <p class="text-[10px] text-gray-400 dark:text-zinc-500 truncate font-semibold">${currentUser.email}</p>
          </div>
          
          <button id="view-orders-btn" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-zinc-850 dark:hover:text-orange-400 transition-colors text-left cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>My Premium Orders</span>
          </button>

          <button id="logout-btn" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-550/10 transition-colors text-left border-t border-gray-100 dark:border-zinc-800/60 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      `;

      loginBtn.parentNode.replaceChild(wrapper, loginBtn);

      const menuBtn = wrapper.querySelector('#user-menu-toggle-btn');
      const dropdownMenu = wrapper.querySelector('#user-dropdown-menu');

      if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = dropdownMenu.classList.contains('hidden');
          if (isHidden) {
            dropdownMenu.classList.remove('hidden');
            setTimeout(() => {
              dropdownMenu.classList.remove('opacity-0', 'scale-95');
              dropdownMenu.classList.add('opacity-100', 'scale-100');
            }, 10);
          } else {
            dropdownMenu.classList.remove('opacity-100', 'scale-100');
            dropdownMenu.classList.add('opacity-0', 'scale-95');
            setTimeout(() => dropdownMenu.classList.add('hidden'), 150);
          }
        });

        document.addEventListener('click', () => {
          dropdownMenu.classList.remove('opacity-100', 'scale-100');
          dropdownMenu.classList.add('opacity-0', 'scale-95');
          setTimeout(() => dropdownMenu.classList.add('hidden'), 150);
        });
      }

      const viewOrdersBtn = wrapper.querySelector('#view-orders-btn');
      if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', () => showOrdersModal());
      }

      const logoutBtn = wrapper.querySelector('#logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('currentUser');
          showToast('Signed out successfully');
          setTimeout(() => window.location.reload(), 800);
        });
      }
    }

    // 2. Mobile Nav Drawer Profiling
    if (mobileAuthContainer) {
      mobileAuthContainer.innerHTML = `
        <div class="bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-black uppercase shrink-0">
              ${currentUser.name.charAt(0)}
            </div>
            <div class="truncate">
              <p class="text-xs font-black text-gray-900 dark:text-white truncate">${currentUser.name}</p>
              <p class="text-[10px] text-gray-400 dark:text-zinc-500 truncate font-semibold">${currentUser.email}</p>
            </div>
          </div>
          
          <button id="mobile-view-orders-btn" class="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5">
            <span>My Active Orders</span>
          </button>

          <button id="mobile-logout-btn" class="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      `;

      const mobileOrdersBtn = mobileAuthContainer.querySelector('#mobile-view-orders-btn');
      if (mobileOrdersBtn) {
        mobileOrdersBtn.addEventListener('click', () => {
          const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
          if (mobileNavOverlay) mobileNavOverlay.click();
          showOrdersModal();
        });
      }

      const mobileLogoutBtn = mobileAuthContainer.querySelector('#mobile-logout-btn');
      if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
          localStorage.removeItem('currentUser');
          showToast('Signed out successfully');
          setTimeout(() => window.location.reload(), 800);
        });
      }
    }

    // 3. Pre-fill address fields on checkout.html
    const checkoutName = document.getElementById('checkout-name');
    const checkoutPhone = document.getElementById('checkout-phone');
    if (checkoutName && !checkoutName.value) checkoutName.value = currentUser.name;
    if (checkoutPhone && !checkoutPhone.value) checkoutPhone.value = currentUser.phone;

  } else {
    // Guest State: Bind triggers
    if (loginBtn) {
      loginBtn.addEventListener('click', () => showAuthModal());
    }
    const mobLoginBtn = document.getElementById('mobile-login-btn');
    if (mobLoginBtn) {
      mobLoginBtn.addEventListener('click', () => {
        const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
        if (mobileNavOverlay) mobileNavOverlay.click();
        showAuthModal();
      });
    }
  }
}

function showAuthModal() {
  if (document.getElementById('auth-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 opacity-0';
  modal.innerHTML = `
    <div class="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 transform scale-95 transition-transform duration-300 opacity-0" id="auth-modal-content">
      <!-- Close button -->
      <button id="close-auth-btn" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-850 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-black text-lg cursor-pointer" aria-label="Close modal">×</button>
      
      <!-- SIGN IN PANE -->
      <div id="signin-pane">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-3 font-black text-xl">B</div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white">Welcome back to BiteDash</h3>
          <p class="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 font-bold uppercase tracking-wider">Login to access your premium kitchen feeds</p>
        </div>
        <form id="signin-form" class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Email Address</label>
            <input type="email" id="signin-email" placeholder="rohitmishra04647@gmail.com" class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold focus:border-orange-500 outline-hidden text-gray-850 dark:text-zinc-200" required>
          </div>
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center">
              <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Password</label>
              <button type="button" id="to-forgot-btn" class="text-[10px] font-black uppercase tracking-wider text-orange-500 hover:text-orange-650 cursor-pointer">Forgot Password?</button>
            </div>
            <input type="password" id="signin-password" placeholder="••••••••" class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold focus:border-orange-500 outline-hidden text-gray-850 dark:text-zinc-200" required>
          </div>
          
          <div id="signin-error" class="text-xs text-red-500 font-bold hidden"></div>

          <button type="submit" id="signin-submit-btn" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-orange-500/25 cursor-pointer text-center flex justify-center items-center gap-2">
            <span>Sign In</span>
          </button>
          
          <p class="text-xs text-center text-gray-500 dark:text-zinc-400 mt-4">
            Don't have an account? 
            <button type="button" id="to-signup-btn" class="text-orange-500 font-bold hover:underline cursor-pointer">Sign Up</button>
          </p>
        </form>
      </div>

      <!-- SIGN UP PANE -->
      <div id="signup-pane" class="hidden">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-3 font-black text-xl">B</div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white">Join BiteDash Premium</h3>
          <p class="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 font-bold uppercase tracking-wider">Create an account for personalized curation</p>
        </div>
        <form id="signup-form" class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Full Name</label>
            <input type="text" id="signup-name" placeholder="Rohit Mishra" class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold focus:border-orange-500 outline-hidden text-gray-850 dark:text-zinc-200" required>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Email Address</label>
            <input type="email" id="signup-email" placeholder="rohitmishra04647@gmail.com" class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold focus:border-orange-500 outline-hidden text-gray-850 dark:text-zinc-200" required>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Phone Number</label>
            <input type="tel" id="signup-phone" placeholder="9876543210" class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold focus:border-orange-500 outline-hidden text-gray-850 dark:text-zinc-200" required>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Password</label>
            <input type="password" id="signup-password" placeholder="••••••••" class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold focus:border-orange-500 outline-hidden text-gray-850 dark:text-zinc-200" required>
          </div>
          
          <div id="signup-error" class="text-xs text-red-500 font-bold hidden"></div>

          <button type="submit" id="signup-submit-btn" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-orange-500/25 cursor-pointer text-center flex justify-center items-center gap-2">
            <span>Create Account</span>
          </button>
          
          <p class="text-xs text-center text-gray-500 dark:text-zinc-400 mt-4">
            Already have an account? 
            <button type="button" id="to-signin-btn-2" class="text-orange-500 font-bold hover:underline cursor-pointer">Sign In</button>
          </p>
        </form>
      </div>

      <!-- FORGOT PASSWORD PANE -->
      <div id="forgot-pane" class="hidden">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-3 font-black text-xl">?</div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white">Recover Password</h3>
          <p class="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 font-bold uppercase tracking-wider">Enter your email for premium verification link</p>
        </div>
        <form id="forgot-form" class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Email Address</label>
            <input type="email" id="forgot-email" placeholder="rohitmishra04647@gmail.com" class="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold focus:border-orange-500 outline-hidden text-gray-850 dark:text-zinc-200" required>
          </div>
          
          <div id="forgot-success" class="text-xs text-green-500 font-bold hidden"></div>

          <button type="submit" id="forgot-submit-btn" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-orange-500/25 cursor-pointer text-center flex justify-center items-center gap-2">
            <span>Send Recovery Link</span>
          </button>
          
          <p class="text-xs text-center text-gray-500 dark:text-zinc-400 mt-4">
            Remember password? 
            <button type="button" id="to-signin-btn-3" class="text-orange-500 font-bold hover:underline cursor-pointer">Sign In</button>
          </p>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animations
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.querySelector('#auth-modal-content').classList.remove('scale-95', 'opacity-0');
  }, 10);

  // Close animation
  const closeModal = () => {
    modal.classList.add('opacity-0');
    modal.querySelector('#auth-modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.remove(), 300);
  };

  // Close clicks
  modal.querySelector('#close-auth-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC Close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Toggle Panes
  const signinPane = modal.querySelector('#signin-pane');
  const signupPane = modal.querySelector('#signup-pane');
  const forgotPane = modal.querySelector('#forgot-pane');

  const toSignupBtn = modal.querySelector('#to-signup-btn');
  const toSigninBtn2 = modal.querySelector('#to-signin-btn-2');
  const toForgotBtn = modal.querySelector('#to-forgot-btn');
  const toSigninBtn3 = modal.querySelector('#to-signin-btn-3');

  toSignupBtn.addEventListener('click', () => {
    signinPane.classList.add('hidden');
    signupPane.classList.remove('hidden');
    forgotPane.classList.add('hidden');
  });

  toSigninBtn2.addEventListener('click', () => {
    signinPane.classList.remove('hidden');
    signupPane.classList.add('hidden');
    forgotPane.classList.add('hidden');
  });

  toForgotBtn.addEventListener('click', () => {
    signinPane.classList.add('hidden');
    signupPane.classList.add('hidden');
    forgotPane.classList.remove('hidden');
  });

  toSigninBtn3.addEventListener('click', () => {
    signinPane.classList.remove('hidden');
    signupPane.classList.add('hidden');
    forgotPane.classList.add('hidden');
  });

  // FORM SUBMISSIONS
  const signinForm = modal.querySelector('#signin-form');
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = modal.querySelector('#signin-email').value.trim();
    const password = modal.querySelector('#signin-password').value.trim();
    const errorEl = modal.querySelector('#signin-error');
    const submitBtn = modal.querySelector('#signin-submit-btn');

    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> <span>Verifying...</span>`;

    setTimeout(() => {
      let users = JSON.parse(localStorage.getItem('bitedash_users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast(`Welcome back, ${user.name}!`);
        closeModal();
        updateAuthStateUI();
        
        // Auto reload if on checkout to bind pre-fills
        if (window.location.pathname.includes('checkout.html')) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Sign In</span>`;
        errorEl.textContent = 'Invalid email address or password.';
        errorEl.classList.remove('hidden');
      }
    }, 1200);
  });

  const signupForm = modal.querySelector('#signup-form');
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = modal.querySelector('#signup-name').value.trim();
    const email = modal.querySelector('#signup-email').value.trim();
    const phone = modal.querySelector('#signup-phone').value.trim();
    const password = modal.querySelector('#signup-password').value.trim();
    const errorEl = modal.querySelector('#signup-error');
    const submitBtn = modal.querySelector('#signup-submit-btn');

    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> <span>Securing Credentials...</span>`;

    setTimeout(() => {
      let users = JSON.parse(localStorage.getItem('bitedash_users') || '[]');
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (emailExists) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Create Account</span>`;
        errorEl.textContent = 'An account with this email address already exists.';
        errorEl.classList.remove('hidden');
      } else {
        const newUser = { name, email, phone, password };
        users.push(newUser);
        localStorage.setItem('bitedash_users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        showToast(`Premium registration complete! Welcome ${name}`);
        closeModal();
        updateAuthStateUI();

        if (window.location.pathname.includes('checkout.html')) {
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    }, 1500);
  });

  const forgotForm = modal.querySelector('#forgot-form');
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = modal.querySelector('#forgot-email').value.trim();
    const successEl = modal.querySelector('#forgot-success');
    const submitBtn = modal.querySelector('#forgot-submit-btn');

    successEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> <span>Transmitting...</span>`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Send Recovery Link</span>`;
      successEl.innerHTML = `✓ Premium recovery key dispatched to <strong>${email}</strong>! Please verify your inbox.`;
      successEl.classList.remove('hidden');
      modal.querySelector('#forgot-email').value = '';
    }, 1500);
  });
}

function showOrdersModal() {
  if (document.getElementById('orders-modal')) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    showToast('Please login to view your orders', 'error');
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'orders-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 opacity-0';
  
  let orders = JSON.parse(localStorage.getItem('bitedash_orders') || '[]');
  orders = orders.filter(o => o.userEmail === currentUser.email);

  let ordersContentHTML = '';
  if (orders.length === 0) {
    ordersContentHTML = `
      <div class="text-center py-12">
        <span class="text-5xl">🍲</span>
        <h4 class="font-extrabold text-lg text-gray-800 dark:text-zinc-100 mt-4">No active orders yet</h4>
        <p class="text-xs text-gray-400 dark:text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed">
          You haven't placed any premium orders on BiteDash yet. Explore restaurants to begin!
        </p>
        <a href="restaurants.html" class="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">
          Explore Cuisines
        </a>
      </div>
    `;
  } else {
    ordersContentHTML = `
      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hidden">
        ${orders.map(order => `
          <div class="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/60 shadow-xs">
            <div class="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <div>
                <p class="text-[10px] font-black uppercase text-orange-500 tracking-wider">${order.id}</p>
                <p class="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">${order.date}</p>
              </div>
              <span class="text-[10px] bg-emerald-500/10 text-emerald-500 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wide">
                ${order.status}
              </span>
            </div>
            
            <div class="space-y-1.5 mb-3">
              ${order.items.map(item => `
                <div class="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  <span>${item.name} <strong class="text-orange-500 font-bold">x${item.quantity}</strong></span>
                  <span>₹${item.price * item.quantity}</span>
                </div>
              `).join('')}
            </div>

            <div class="flex justify-between items-center border-t border-gray-100 dark:border-zinc-800 pt-2.5">
              <span class="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500">Paid Amount</span>
              <span class="text-sm font-black text-gray-900 dark:text-white">₹${order.subtotal + Math.round(order.subtotal * 0.05) + 40}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 transform scale-95 transition-transform duration-300 opacity-0" id="orders-modal-content">
      <!-- Close button -->
      <button id="close-orders-btn" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-850 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-black text-lg cursor-pointer" aria-label="Close modal">×</button>
      
      <div class="mb-6">
        <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <span>Premium Order History</span>
          <span class="text-xs bg-orange-500/10 text-orange-500 font-black px-2.5 py-1 rounded-md uppercase tracking-wider">${orders.length} orders</span>
        </h3>
        <p class="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-semibold uppercase tracking-wider">Review real-time status of your culinary deliveries</p>
      </div>

      ${ordersContentHTML}
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animations
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.querySelector('#orders-modal-content').classList.remove('scale-95', 'opacity-0');
  }, 10);

  // Close animation
  const closeModal = () => {
    modal.classList.add('opacity-0');
    modal.querySelector('#orders-modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.remove(), 300);
  };

  modal.querySelector('#close-orders-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-55 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-2xl shadow-xl flex items-center gap-3 bg-white dark:bg-zinc-900 border text-xs font-bold transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto ${
    type === 'success' 
      ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-450' 
      : 'border-orange-500/30 text-orange-600 dark:text-orange-450'
  }`;

  const icon = type === 'success' 
    ? `<div class="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 font-extrabold text-xs">✓</div>`
    : `<div class="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 font-extrabold text-xs">!</div>`;

  toast.innerHTML = `
    ${icon}
    <div class="flex-grow">${message}</div>
    <button class="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 font-extrabold cursor-pointer ml-2 leading-none">×</button>
  `;

  toast.querySelector('button').addEventListener('click', () => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-y-4');
  }, 10);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

export { toggleFavoriteRestaurant, showToast, initAuthSystem, updateAuthStateUI, showAuthModal, showOrdersModal, initOffersSystem, showOffersModal };

// ==========================================
// 4. PREMIUM OFFERS & VOUCHER SYSTEM
// ==========================================

function initOffersSystem() {
  const findOffersElements = () => {
    const list = [];
    
    // Exact selector provided by user (and standard header link)
    const desktopLink = document.querySelector('header#main-nav nav a:nth-of-type(3)') || 
                        document.querySelector('header#main-nav nav a[href*="category=Pizza"]') ||
                        document.querySelector('header#main-nav:nth-of-type(1) > div:nth-of-type(1) > nav:nth-of-type(1) > a:nth-of-type(3)');
    if (desktopLink) list.push(desktopLink);

    // Mobile nav drawer links
    const mobileLinks = Array.from(document.querySelectorAll('a')).filter(a => {
      const text = a.textContent.toLowerCase();
      return text.includes('offers') || text.includes('deals');
    });
    
    mobileLinks.forEach(link => {
      if (!list.includes(link)) list.push(link);
    });

    return list;
  };

  const links = findOffersElements();
  links.forEach(link => {
    link.classList.add('relative', 'cursor-pointer');
    
    // Add a hot badge if not present and not in the mobile drawer (keep desktop nav extra clean but exciting)
    const isMobileNav = link.closest('#mobile-nav-overlay') || link.closest('.md\\:hidden');
    if (!link.querySelector('.offers-badge') && !isMobileNav) {
      const badge = document.createElement('span');
      badge.className = 'offers-badge absolute -top-1 -right-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-black uppercase tracking-wider scale-95 animate-pulse';
      badge.innerText = 'HOT';
      link.appendChild(badge);
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Close mobile menu if open
      const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
      if (mobileNavOverlay && !mobileNavOverlay.classList.contains('hidden')) {
        const closeBtn = document.getElementById('mobile-menu-close-btn') || mobileNavOverlay.querySelector('button');
        if (closeBtn) closeBtn.click();
        mobileNavOverlay.classList.add('hidden');
      }

      showOffersModal();
    });
  });
}

function showOffersModal() {
  if (document.getElementById('offers-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'offers-modal';
  modal.className = 'fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 opacity-0';

  let couponsHTML = '';
  Object.entries(COUPONS).forEach(([code, details]) => {
    const isWelcome = code.includes('WELCOME');
    const accentClass = isWelcome ? 'border-orange-500/30 dark:border-orange-500/20 bg-orange-500/5' : 'border-gray-150 dark:border-zinc-800/60 bg-gray-50/50 dark:bg-zinc-950/20';
    const badgeColor = isWelcome ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200';

    couponsHTML += `
      <div class="p-4 sm:p-5 rounded-2xl border ${accentClass} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:scale-[1.01]">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${badgeColor}">
              ${details.discountType === 'percentage' ? `${details.value}% OFF` : details.discountType === 'delivery' ? 'FREE DELIVERY' : `₹${details.value} OFF`}
            </span>
            ${isWelcome ? `<span class="text-[9px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide animate-pulse">BEST VALUE</span>` : ''}
          </div>
          <p class="text-sm font-black text-gray-900 dark:text-white mt-1.5">${details.desc}</p>
          <p class="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
            Min. Order: ₹${details.minCart} ${details.maxDiscount ? `• Max Discount: ₹${details.maxDiscount}` : ''}
          </p>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div class="border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl px-4 py-2 text-xs font-black tracking-widest text-gray-850 dark:text-zinc-100 select-all font-mono uppercase shrink-0">
            ${code}
          </div>
          <button data-code="${code}" class="copy-coupon-btn bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0">
            Copy
          </button>
        </div>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 transform scale-95 transition-transform duration-300 opacity-0" id="offers-modal-content">
      <!-- Close button -->
      <button id="close-offers-btn" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-850 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-black text-lg cursor-pointer" aria-label="Close modal">×</button>
      
      <div class="mb-6">
        <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <span>Exclusive Bites & Vouchers</span>
          <span class="text-xs bg-orange-500/10 text-orange-500 font-black px-2.5 py-1 rounded-md uppercase tracking-wider">4 Active Deals</span>
        </h3>
        <p class="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-semibold uppercase tracking-wider">Apply these exclusive coupon codes at checkout to enjoy premium discounts</p>
      </div>

      <div class="space-y-4 max-h-[55vh] overflow-y-auto pr-1 scrollbar-hidden">
        ${couponsHTML}
      </div>

      <div class="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500 font-black uppercase tracking-wider">
        <span>✓ 100% verified codes</span>
        <span>Expires soon</span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animations
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.querySelector('#offers-modal-content').classList.remove('scale-95', 'opacity-0');
  }, 10);

  // Close animation
  const closeModal = () => {
    modal.classList.add('opacity-0');
    modal.querySelector('#offers-modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.remove(), 300);
  };

  modal.querySelector('#close-offers-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Bind copy buttons
  modal.querySelectorAll('.copy-coupon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      
      // Copy functionality
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          handleCopiedState(btn, code);
        }).catch(() => {
          fallbackCopyText(btn, code);
        });
      } else {
        fallbackCopyText(btn, code);
      }
    });
  });

  const fallbackCopyText = (btn, text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      handleCopiedState(btn, text);
    } catch (err) {
      showToast('Could not copy automatically. Please select and copy manually.', 'error');
    }
    document.body.removeChild(textArea);
  };

  const handleCopiedState = (btn, code) => {
    const originalText = btn.innerText;
    btn.innerText = 'Copied! ✓';
    btn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
    btn.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
    
    showToast(`Coupon "${code}" copied! Enjoy your delicious meal.`);
    
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
      btn.classList.add('bg-orange-500', 'hover:bg-orange-600');
    }, 2000);
  };
}
