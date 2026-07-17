# BiteDash | Premium Food Delivery Web Application

A premium, fully responsive multi-page food delivery web application designed using semantic HTML5, CSS3, modern Tailwind CSS v4, and clean ES6+ Vanilla JavaScript. Built to provide a polished, startup-grade user experience with fluid animations, dynamic dark mode, real-time cart state, and instant filtering/searching algorithms.

---

## 🚀 Key Features

- **Multi-Page Layout**: Beautiful, responsive pages including:
  - `index.html`: Immersive landing page with slider offers, smooth scroll categories, and featured restaurants.
  - `restaurants.html`: Discovery grid with advanced multivariable filtering, sorting, loading skeleton screens, and dynamic food menu pages.
  - `checkout.html`: Interactive delivery form, payment toggles, cart summary, and active order timeline tracking.
- **Micro-interactions & Animations**: Shimmer loading skeletons, custom checkmark draw-in, sliding drawers, floating banner carousels, and bouncy heart toggles.
- **Universal Cart Drawer**: Synchronized cart state using LocalStorage with custom pricing, taxes, and coupon managers.
- **Dynamic Dark Mode**: Fluid themes with saved preference remembering.
- **Multi-cuisine Menu Engine**: Supports 15 distinct, yummy, and detailed food items per restaurant with individual quantities, veg/non-veg indicator tags, and active search modifiers.

---

## 🗃️ Data Structures & Complexity Analysis

This application implements **five mandatory data structures** and algorithms to manage state and organize operations efficiently. Below is the detailed breakdown:

| Operation / System | Data Structure | Reason Chosen | Average Time Complexity |
| :--- | :--- | :--- | :--- |
| **1. Cart Management** | **Array of Objects** | Easy to iterate for rendering; stores items sequentially. Allows quick mapping to sum totals. | **Search**: $O(n)$<br>**Add**: $O(1)$ (push)<br>**Delete**: $O(n)$ (splice)<br>**Update**: $O(n)$ (findIndex) |
| **2. Category Filtering** | **HashMap (JS Object)** | Precomputed category lookup by indexing restaurant categories. Eliminates the need to filter the entire restaurant list on every single click. | **Lookup / Filter**: $O(1)$ average |
| **3. Search Engine** | **Array.prototype.filter()** | High efficiency. Dynamically tests restaurant names, cuisines, and food items in a single scan. | **Search**: $O(n)$ where $n$ is total restaurants |
| **4. Restaurant Sorting** | **JavaScript sort()** | Compiles quick-sort variations internally. Custom comparator functions handle Highest Rating, Speed, and Price directions. | **Sort**: $O(n \log n)$ average |
| **5. Recently Viewed** | **Stack (Array-backed)** | Follows Last-In, First-Out (LIFO) tracking. Newly accessed restaurants are pushed to the top; older records are popped once the maximum stack size (5) is exceeded. | **Push/Pop**: $O(1)$ operations |

### 🔍 Detailed Analysis of Implementation

#### 1. Cart Management
- **Representation**: `cart = { restaurantId: 1, restaurantName: "...", items: [ { id: 101, name: "...", price: 299, quantity: 2, veg: true, image: "..." } ] }`
- **Why**: An array of objects allows lightweight rendering and easy serialization to LocalStorage. We perform an $O(n)$ scan to find existing items when updating quantities and use a simple $O(1)$ push to add new items.

#### 2. Precomputed Category HashMap
- **Representation**: `categoriesMap = { "Pizza": [res1, res9], "Burger": [res2, res12], ... }`
- **Why**: Precomputing the map at start time means that when a user clicks "Pizza", we fetch the filtered list instantly in $O(1)$ time rather than filtering all 20 restaurants with an $O(n)$ scan. This ensures zero lag.

#### 3. Deep-Dive Search
- **Why**: Live search uses `Array.filter` to scan the list in $O(n)$ time. It checks if the search keyword is present in the restaurant name, category name, or *any of the 15 dishes in its menu*, providing Google-style instant results.

#### 4. Dual-Mode Sorting
- **Why**: Standard `Array.sort()` is incredibly efficient, running in $O(n \log n)$. We compare rating decimals, speed numbers, and price indicators to organize the grid dynamically on the fly.

#### 5. LIFO Recently Viewed Stack
- **Why**: When a restaurant menu loads, its ID is appended to the stack. If the stack size exceeds 5, the oldest restaurant is popped off the bottom using an $O(1)$ shift, keeping the recently viewed panel clean and relevant.

---

## 💾 LocalStorage Synchronization

State persistence is synchronized in real time to secure smooth experiences:
1. **Cart state**: Saved on every add, subtraction, or clear.
2. **Favorites**: Wishlisted restaurant IDs are persisted so users never lose their saved favorites.
3. **Recently Viewed Stack**: Tracks history across different pages.
4. **Theme Preference**: Stores `'dark'` or `'light'` to prevent theme flashing on subsequent page loads.

---

## 🔮 Future Improvements

1. **Geolocation Integration**: Connect the Google Maps Platform API or native browser Geolocation to load realistic local delivery coordinates and compute real-world travel distances dynamically.
2. **Server-Auth & Orders Persistence**: Integrate a Firestore Database and Firebase Authentication to allow users to sign up, save home addresses, and view real order history.
3. **Live WebSockets Tracking**: Implement socket rooms to stream true real-time GPS coordinates of the assigned delivery partner rather than a timer-simulated progress bar.
4. **Interactive Audio Feedbacks**: Include subtle audio notification chimes when adding items to the cart or on successful checkout order placements.
