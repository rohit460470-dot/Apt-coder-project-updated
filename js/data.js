/**
 * Food Delivery Web Application - Core Data (20 Restaurants, 15 Items Each)
 * Satisfies O(1) Category Filtering, O(n log n) Sorting, and O(n) Searching.
 */

// Category Maps and Image Pools
export const CATEGORY_ICONS = {
  Pizza: "🍕",
  Burger: "🍔",
  Indian: "🍛",
  Chinese: "🍜",
  Italian: "🍝",
  Desserts: "🍰",
  Drinks: "🥤",
  Healthy: "🥗"
};

export const CATEGORY_IMAGES = {
  Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
  Burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  Indian: "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=600&auto=format&fit=crop&q=80",
  Chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
  Italian: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  Desserts: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
  Drinks: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
  Healthy: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80"
};

// Detailed food items pool categorized by cuisine/type (15+ items per category to mix-and-match)
const FOOD_POOL = {
  Pizza: [
    { name: "Classic Margherita Pizza", desc: "Fresh tomatoes, mozzarella, sweet basil, and extra virgin olive oil.", basePrice: 299, veg: true, rating: 4.8 },
    { name: "Double Cheese Margherita", desc: "Loaded with extra liquid cheese and classic fresh mozzarella.", basePrice: 349, veg: true, rating: 4.7 },
    { name: "Spicy Pepperoni Feast", desc: "Zesty pepperoni, Italian sausage, crushed red pepper, and jalapeños.", basePrice: 449, veg: false, rating: 4.9 },
    { name: "Tandoori Paneer Pizza", desc: "Spiced paneer chunks, onions, green bell peppers, and mint mayo drizzle.", basePrice: 399, veg: true, rating: 4.6 },
    { name: "Farmvilla Garden Pizza", desc: "Onions, bell peppers, tomatoes, mushrooms, black olives, and sweet corn.", basePrice: 379, veg: true, rating: 4.5 },
    { name: "BBQ Smoked Chicken Pizza", desc: "Grilled chicken strips, caramelized onions, smoked Gouda, and BBQ sauce.", basePrice: 429, veg: false, rating: 4.8 },
    { name: "Peri Peri Chicken Pizza", desc: "Spicy peri-peri chicken, red paprika, baby spinach, and hot sauce.", basePrice: 419, veg: false, rating: 4.7 },
    { name: "Four Cheese Gourmet (Quattro)", desc: "Mozzarella, Parmesan, Gorgonzola, and Cheddar on garlic herb crust.", basePrice: 499, veg: true, rating: 4.9 },
    { name: "Mexican Salsa Pizza", desc: "Spicy salsa base, beans, jalapeños, onions, tomatoes, and nachos crumble.", basePrice: 389, veg: true, rating: 4.4 },
    { name: "Pesto Supreme Pizza", desc: "Rich basil pesto sauce, cherry tomatoes, pine nuts, and goat cheese.", basePrice: 459, veg: true, rating: 4.8 }
  ],
  Burger: [
    { name: "The Big Boss Cheese Burger", desc: "Thick flame-grilled beef patty, melted cheddar, lettuce, pickles, and secret sauce.", basePrice: 189, veg: false, rating: 4.8 },
    { name: "Crispy Maharaja Veg Burger", desc: "Premium double vegetable patty, fresh tomatoes, jalapenos, and rich tandoori spread.", basePrice: 149, veg: true, rating: 4.6 },
    { name: "Smoky BBQ Chicken Burger", desc: "Crispy fried chicken breast dipped in sweet smoky BBQ sauce, with coleslaw.", basePrice: 199, veg: false, rating: 4.7 },
    { name: "Fiery Jalapeno Spicy Burger", desc: "Hot crispy veg patty, spicy cheddar sauce, sliced jalapenos, and red paprika.", basePrice: 159, veg: true, rating: 4.5 },
    { name: "Classic American Cheeseburger", desc: "Smashed chicken patty, simple cheddar slices, pickles, and classic yellow mustard.", basePrice: 169, veg: false, rating: 4.4 },
    { name: "Aloo Tikki Gold Burger", desc: "The ultimate Indian classic: spiced potato patty, onion slices, sweet and spicy chutneys.", basePrice: 99, veg: true, rating: 4.5 },
    { name: "Mushroom & Swiss Gourmet Burger", desc: "Sautéed button mushrooms, melted Swiss cheese, caramelized onions, and garlic aioli.", basePrice: 249, veg: true, rating: 4.8 },
    { name: "Avocado Ranch Veggie Burger", desc: "Quinoa and sweet potato patty topped with sliced avocado and cool herb ranch dressing.", basePrice: 229, veg: true, rating: 4.7 },
    { name: "Teriyaki Glazed Chicken Burger", desc: "Grilled teriyaki chicken fillet, pineapple ring, lettuce, and wasabi mayonnaise.", basePrice: 219, veg: false, rating: 4.6 },
    { name: "Double Trouble Bacon Burger", desc: "Double grilled patty, crispy bacon strips, double cheddar, and hickory sauce.", basePrice: 279, veg: false, rating: 4.9 }
  ],
  Indian: [
    { name: "Butter Chicken Masala (Murgh Makhani)", desc: "Tender tandoori chicken cooked in creamy, buttery, lightly sweet tomato gravy.", basePrice: 329, veg: false, rating: 4.9 },
    { name: "Paneer Butter Masala", desc: "Cottage cheese cubes simmered in rich cashew-tomato onion gravy with fresh cream.", basePrice: 289, veg: true, rating: 4.8 },
    { name: "Hyderabadi Dum Biryani (Chicken)", desc: "Basmati rice layered with spiced chicken, saffron, mint, and slow-cooked to perfection.", basePrice: 349, veg: false, rating: 4.9 },
    { name: "Dal Makhani (Signature Black Dal)", desc: "Whole black lentils slow-cooked overnight with tomatoes, butter, and rich fresh cream.", basePrice: 249, veg: true, rating: 4.8 },
    { name: "Kadhai Paneer Special", desc: "Paneer cooked with bell peppers, tomatoes, and freshly ground whole spices.", basePrice: 279, veg: true, rating: 4.6 },
    { name: "Garlic Naan (Leavened Flatbread)", desc: "Freshly baked clay oven flatbread infused with chopped garlic and melted butter.", basePrice: 69, veg: true, rating: 4.7 },
    { name: "Chole Bhature (Delhi Style)", desc: "Spiced chickpeas served with two fluffy, golden deep-fried sourdough breads.", basePrice: 179, veg: true, rating: 4.7 },
    { name: "Aloo Gobhi Adraki", desc: "Potatoes and cauliflower florets tossed with fresh ginger, turmeric, and Indian spices.", basePrice: 199, veg: true, rating: 4.4 },
    { name: "Malai Kofta Curry", desc: "Fried potato and paneer balls stuffed with raisins, served in a luscious yellow gravy.", basePrice: 299, veg: true, rating: 4.8 },
    { name: "Mutton Rogan Josh", desc: "Traditional Kashmiri lamb curry slow-cooked in yogurt, ginger, garlic, and red chilies.", basePrice: 429, veg: false, rating: 4.9 }
  ],
  Chinese: [
    { name: "Schezwan Hakka Noodles", desc: "Wok-tossed noodles with colorful vegetables, garlic, and fiery Schezwan sauce.", basePrice: 189, veg: true, rating: 4.6 },
    { name: "Manchurian Fried Rice Combo", desc: "Fluffy fried rice served with crispy vegetable Manchurian balls in thick dark soy gravy.", basePrice: 229, veg: true, rating: 4.7 },
    { name: "Kung Pao Chicken", desc: "Stir-fried chicken cubes with peanuts, bell peppers, chili peppers, in savory-sweet sauce.", basePrice: 299, veg: false, rating: 4.8 },
    { name: "Crispy Spring Rolls (4 Pcs)", desc: "Fried crispy wrappers stuffed with seasoned shredded cabbage, carrots, and glass noodles.", basePrice: 129, veg: true, rating: 4.5 },
    { name: "Pan Fried Dim Sums (Veg/Chicken)", desc: "Delicate steamed dumplings seared on one side, served with hot spicy garlic dip.", basePrice: 169, veg: true, rating: 4.7 },
    { name: "Hot & Sour Veg Soup", desc: "Spicy and tangy thick broth packed with mushrooms, bamboo shoots, tofu, and fresh herbs.", basePrice: 119, veg: true, rating: 4.3 },
    { name: "Chili Chicken Dry", desc: "Wok-fried battered chicken cubes tossed with bell peppers, green chilies, and soy-garlic glaze.", basePrice: 279, veg: false, rating: 4.8 },
    { name: "Honey Chili Potato", desc: "Crispy french fries tossed in sweet honey, hot chili paste, garlic, and toasted sesame seeds.", basePrice: 169, veg: true, rating: 4.5 },
    { name: "Sweet & Sour Paneer", desc: "Fried cottage cheese cubes, pineapple, bell peppers, in a tangy sweet & sour sauce.", basePrice: 259, veg: true, rating: 4.4 },
    { name: "Mapo Tofu (Sichuan Style)", desc: "Silken tofu blocks cooked in a hot, numbing bean-paste gravy with Sichuan peppercorns.", basePrice: 239, veg: true, rating: 4.6 }
  ],
  Italian: [
    { name: "Creamy Fettuccine Alfredo", desc: "Rich flat pasta tossed in a luxurious butter, cream, and aged Parmesan cheese sauce.", basePrice: 289, veg: true, rating: 4.7 },
    { name: "Spaghetti Bolognese", desc: "Slow-simmered rich minced meat ragu in red wine and tomatoes, served over fresh spaghetti.", basePrice: 349, veg: false, rating: 4.8 },
    { name: "Penne Arrabbiata (Spicy)", desc: "Tubular pasta cooked in fiery garlic, tomatoes, dried red chili peppers, and olive oil sauce.", basePrice: 259, veg: true, rating: 4.6 },
    { name: "Gourmet Mushroom Risotto", desc: "Creamy Arborio rice slowly simmered with porcini mushrooms, white wine, and truffle oil.", basePrice: 379, veg: true, rating: 4.9 },
    { name: "Classic Italian Lasagna", desc: "Layered pasta sheets baked with beef bolognese, creamy bechamel, and fresh mozzarella.", basePrice: 399, veg: false, rating: 4.8 },
    { name: "Caprese Salad with Pesto", desc: "Fresh tomatoes, buffalo mozzarella cheese slices, fresh basil leaves, and balsamic glaze.", basePrice: 249, veg: true, rating: 4.5 },
    { name: "Truffle Garlic Bread", desc: "Toasted sourdough bread infused with white truffle oil, minced garlic, herbs, and cheese.", basePrice: 149, veg: true, rating: 4.7 },
    { name: "Baked Gnocchi Sorrentina", desc: "Soft potato dumplings baked with rich tomato sauce, fresh basil, and melted mozzarella.", basePrice: 319, veg: true, rating: 4.8 },
    { name: "Chicken Piccata", desc: "Pan-seared chicken cutlets in a bright tangy sauce of lemon juice, butter, and capers.", basePrice: 369, veg: false, rating: 4.6 },
    { name: "Minestrone Tuscan Soup", desc: "Hearty vegetable broth packed with white beans, seasonal greens, pasta, and herbs.", basePrice: 139, veg: true, rating: 4.4 }
  ],
  Desserts: [
    { name: "Warm Chocolate Lava Cake", desc: "Decadent chocolate cake with a molten liquid hot fudge center, served warm.", basePrice: 129, veg: true, rating: 4.9 },
    { name: "New York Style Cheesecake", desc: "Rich and creamy baked cream cheese slice with a buttery graham cracker crust.", basePrice: 199, veg: true, rating: 4.8 },
    { name: "Signature Red Velvet Slice", desc: "Fluffy red velvet sponge layered with smooth and tangy vanilla cream cheese frosting.", basePrice: 159, veg: true, rating: 4.7 },
    { name: "Death By Chocolate Waffle", desc: "Freshly baked waffle topped with dark chocolate sauce, white chips, and chocolate ice cream.", basePrice: 189, veg: true, rating: 4.8 },
    { name: "Warm Walnut Fudge Brownie", desc: "Fudgy chocolate brownie packed with toasted walnuts and drizzled with hot chocolate syrup.", basePrice: 119, veg: true, rating: 4.6 },
    { name: "Classic Italian Tiramisu", desc: "Layers of coffee-soaked ladyfingers, velvety mascarpone cream, and dark cocoa powder dusting.", basePrice: 229, veg: true, rating: 4.9 },
    { name: "Fresh Strawberry Tart", desc: "Buttery sweet pastry shell filled with vanilla custard and topped with fresh strawberries.", basePrice: 149, veg: true, rating: 4.5 },
    { name: "Mango Cream Pudding", desc: "Creamy Alphonso mango custard layered with vanilla cake crumbles and whipped cream.", basePrice: 129, veg: true, rating: 4.4 },
    { name: "Assorted Macarons (3 Pcs)", desc: "Delicate French almond cookies with chocolate, pistachio, and salted caramel fillings.", basePrice: 169, veg: true, rating: 4.6 },
    { name: "Gooey Caramel Salted Sundae", desc: "Scoops of premium vanilla bean gelato topped with buttery sea salt caramel and nuts.", basePrice: 139, veg: true, rating: 4.7 }
  ],
  Drinks: [
    { name: "Classic Mint Mojito", desc: "Refreshing blend of fresh mint leaves, lime juice, brown sugar, club soda, and crushed ice.", basePrice: 99, veg: true, rating: 4.6 },
    { name: "Double Oreo Shake", desc: "Rich vanilla ice cream blended with milk, Oreo cookies, whipped cream, and chocolate fudge.", basePrice: 149, veg: true, rating: 4.8 },
    { name: "Mango Lassi (Yogurt Drink)", desc: "Traditional sweet Indian yogurt drink blended with fresh sweet mango pulp and cardamom.", basePrice: 119, veg: true, rating: 4.7 },
    { name: "Iced Caramel Macchiato", desc: "Espresso, cold milk, rich sweet vanilla syrup, topped with buttery caramel drizzle and ice.", basePrice: 159, veg: true, rating: 4.7 },
    { name: "Fresh Watermelon Cooler", desc: "Chilled pure watermelon juice with a squeeze of fresh lime and a touch of black salt.", basePrice: 89, veg: true, rating: 4.5 },
    { name: "Belgium Chocolate Shake", desc: "Creamy premium dark chocolate ice cream milkshake topped with shaved dark curls.", basePrice: 159, veg: true, rating: 4.8 },
    { name: "Peach Green Tea Chilled", desc: "Brewed antioxidant green tea infused with natural sweet peach essence, served over ice.", basePrice: 109, veg: true, rating: 4.4 },
    { name: "Virgin Piña Colada", desc: "Tropical cream of coconut blended with pineapple juice, lime juice, and shaved ice.", basePrice: 129, veg: true, rating: 4.6 },
    { name: "Sparkling Berry Lemonade", desc: "Bubbly lemonade infused with fresh raspberries, blueberries, strawberries, and mint.", basePrice: 119, veg: true, rating: 4.5 },
    { name: "Affogato Al Caffe", desc: "A hot shot of espresso poured over a generous scoop of premium vanilla bean gelato.", basePrice: 139, veg: true, rating: 4.9 }
  ],
  Healthy: [
    { name: "Quinoa Avocado Salad Bowl", desc: "Organic quinoa, diced fresh avocado, cherry tomatoes, cucumbers, spinach, and lemon vinaigrette.", basePrice: 249, veg: true, rating: 4.7 },
    { name: "Mediterranean Hummus Platter", desc: "Creamy olive oil hummus served with baked whole-wheat pita bread, cucumber coins, and olives.", basePrice: 219, veg: true, rating: 4.8 },
    { name: "Grilled Chicken Protein Salad", desc: "Tender herb-grilled chicken breast slice, broccoli, boiled egg, mixed greens, and honey mustard.", basePrice: 289, veg: false, rating: 4.8 },
    { name: "Tofu Brown Rice Bowl", desc: "Sautéed organic tofu, brown rice, bell peppers, broccoli, tossed in light low-sodium soy dressing.", basePrice: 229, veg: true, rating: 4.5 },
    { name: "Green Goddess Detox Juice", desc: "Fresh cold-pressed cucumber, celery, green apple, spinach, ginger, and lemon juice.", basePrice: 129, veg: true, rating: 4.6 },
    { name: "Berry Greek Yogurt Parfait", desc: "Low-fat thick Greek yogurt layered with organic berries, house-baked honey granola, and chia seeds.", basePrice: 179, veg: true, rating: 4.7 },
    { name: "Keto Paneer Veggie Wrap", desc: "Almond-flour tortilla wrap filled with grilled paneer, lettuce, bell peppers, and avocado mayo.", basePrice: 199, veg: true, rating: 4.5 },
    { name: "Steam-Baked Salmon Asparagus", desc: "Premium salmon fillet steamed with fresh lemon, dill, garlic, and served with grilled asparagus.", basePrice: 499, veg: false, rating: 4.9 },
    { name: "Vegan Buddha Bowl", desc: "Chickpeas, roasted sweet potato, edamame, red cabbage, spinach, tahini dressing, over black rice.", basePrice: 269, veg: true, rating: 4.8 },
    { name: "Sprouted Moong Salad Mix", desc: "High protein sprouted green gram tossed with pomegranate, onions, tomatoes, cucumber, green chilies, and lime.", basePrice: 149, veg: true, rating: 4.6 }
  ]
};

// High-quality restaurant background images
const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80", // Premium dining
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80", // Cozy Italian
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80", // Fine dining
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80", // Asian/Ramen
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&auto=format&fit=crop&q=80", // Pizzeria
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80", // Indian bistro
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80", // Burger joint
  "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&auto=format&fit=crop&q=80", // Fast food
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80", // Mixed platters
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&auto=format&fit=crop&q=80"  // Cafe/Healthy
];

// Food Item Image mapping by item name keyword
function getFoodImage(name, cat) {
  const keyword = name.toLowerCase();
  if (keyword.includes("pizza") || keyword.includes("margherita")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("burger")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("tikki")) return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("biryani") || keyword.includes("naan")) return "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("butter chicken") || keyword.includes("curry") || keyword.includes("paneer")) return "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("chole bhature")) return "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("noodle") || keyword.includes("ramen")) return "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("dim sum") || keyword.includes("dumpling")) return "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("pasta") || keyword.includes("lasagna") || keyword.includes("spaghetti")) return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("risotto") || keyword.includes("gnocchi")) return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("cake") || keyword.includes("brownie") || keyword.includes("cheesecake")) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("waffle") || keyword.includes("sundae") || keyword.includes("macarons")) return "https://images.unsplash.com/photo-1562376502-6f7694998877?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("shake") || keyword.includes("lassi") || keyword.includes("piña")) return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("mojito") || keyword.includes("cooler") || keyword.includes("lemonade")) return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("salad") || keyword.includes("avocado") || keyword.includes("bowl")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("wrap") || keyword.includes("hummus")) return "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&auto=format&fit=crop&q=80";
  if (keyword.includes("salmon") || keyword.includes("sushi")) return "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80";
  
  // Fallback by category
  return CATEGORY_IMAGES[cat] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80";
}

// 20 High quality, diverse Restaurants list
const BASE_RESTAURANTS = [
  { id: 1, name: "The Pizza Palace", rating: 4.8, category: "Pizza", price: 400, distance: 1.5, deliveryTime: 20, offer: "50% OFF up to ₹120", address: "Gourmet Plaza, Sector 15, City Center" },
  { id: 2, name: "Burger Bistro", rating: 4.6, category: "Burger", price: 250, distance: 2.3, deliveryTime: 25, offer: "FREE Delivery", address: "Tech Hub Avenue, Phase 1, Silicon Marg" },
  { id: 3, name: "Spice Symphony", rating: 4.9, category: "Indian", price: 600, distance: 1.2, deliveryTime: 30, offer: "20% OFF | Use SPICE20", address: "Heritage Square, Old Town Rd" },
  { id: 4, name: "Golden Dragon Bistro", rating: 4.5, category: "Chinese", price: 450, distance: 3.4, deliveryTime: 35, offer: "Free Veg Spring Roll", address: "Chinatown Main Lane, block C" },
  { id: 5, name: "Truffle & Pasta Co.", rating: 4.7, category: "Italian", price: 550, distance: 4.1, deliveryTime: 28, offer: "10% OFF", address: "Mediterranean Blvd, Galleria Mall" },
  { id: 6, name: "The Salad Bowl & Co.", rating: 4.8, category: "Healthy", price: 300, distance: 1.8, deliveryTime: 15, offer: "Buy 1 Get 1 Free", address: "Green Garden Arcade, Sector 21" },
  { id: 7, name: "Sweet Glaze Bakery", rating: 4.7, category: "Desserts", price: 350, distance: 2.1, deliveryTime: 22, offer: "50% OFF | Save big", address: "Sugar Lane, Sweet Heights" },
  { id: 8, name: "The Caffeine Club", rating: 4.6, category: "Drinks", price: 200, distance: 0.9, deliveryTime: 12, offer: "Free Donut on orders above ₹250", address: "Brew House Row, Main Street" },
  { id: 9, name: "La Pino'z Slices", rating: 4.4, category: "Pizza", price: 350, distance: 2.8, deliveryTime: 24, offer: "Weekend Special Deal", address: "Commercial Plaza, Corner Block" },
  { id: 10, name: "Punjab Grill & Tandoor", rating: 4.9, category: "Indian", price: 700, distance: 4.5, deliveryTime: 40, offer: "Flat ₹150 OFF", address: "Imperial Highway, Royal Enclave" },
  { id: 11, name: "The Daily Macro Bowl", rating: 4.7, category: "Healthy", price: 400, distance: 3.1, deliveryTime: 20, offer: "FREE Delivery on Salad Bowls", address: "Fit & Fine Street, Near Gold Gym" },
  { id: 12, name: "Smash Burger Grill", rating: 4.5, category: "Burger", price: 300, distance: 2.7, deliveryTime: 18, offer: "15% OFF", address: "Food Junction Complex, Highway Junction" },
  { id: 13, name: "Noodle Bar & Dimsum", rating: 4.3, category: "Chinese", price: 380, distance: 3.8, deliveryTime: 32, offer: "50% OFF up to ₹100", address: "Neon Alley, Market Square" },
  { id: 14, name: "Gourmet Waffle Wonder", rating: 4.6, category: "Desserts", price: 250, distance: 1.6, deliveryTime: 15, offer: "Free Marshmallows", address: "Carnival Street, Near Fun Park" },
  { id: 15, name: "Taco Fiesta & Nachos", rating: 4.5, category: "Healthy", price: 280, distance: 2.9, deliveryTime: 26, offer: "Taco Tuesday Special", address: "Tex-Mex Block, Galleria Ground Floor" },
  { id: 16, name: "Royal Biryani Darbar", rating: 4.8, category: "Indian", price: 500, distance: 3.5, deliveryTime: 33, offer: "Biryani & Pepsi Combo", address: "Mughlai Court, Old Fort Area" },
  { id: 17, name: "Cafe Matcha Latte", rating: 4.7, category: "Drinks", price: 300, distance: 1.1, deliveryTime: 14, offer: "Free Cookie with Large Brew", address: "Metro Station Exit, Central Mall" },
  { id: 18, name: "The Cozy Italian Trattoria", rating: 4.8, category: "Italian", price: 650, distance: 5.2, deliveryTime: 42, offer: "Free Tiramisu slice above ₹1000", address: "Vineyard Valley Lane, Block 12" },
  { id: 19, name: "Vegan Vitality Bistro", rating: 4.6, category: "Healthy", price: 320, distance: 2.4, deliveryTime: 19, offer: "10% OFF | VEGAN10", address: "Green Lotus Plaza, Sector 40" },
  { id: 20, name: "Gelato Dreamery", rating: 4.9, category: "Desserts", price: 220, distance: 1.3, deliveryTime: 16, offer: "Buy 2 Scoops Get 1 Free", address: "Alpine Frost Avenue, Boulevard" }
];

// Helper to construct exactly 15 detailed items per restaurant
function generateMenuForRestaurant(resCategory, resId) {
  const menu = [];
  let itemCounter = 1;

  // Add 6 items from the primary restaurant category
  const primaryPool = FOOD_POOL[resCategory] || FOOD_POOL.Indian;
  primaryPool.forEach((item, idx) => {
    menu.push({
      id: resId * 100 + itemCounter++,
      name: item.name,
      description: item.desc,
      price: item.basePrice + (resId % 3) * 15, // slight variation in prices across restaurants
      rating: +(item.rating - 0.2 + (idx % 3) * 0.1).toFixed(1),
      category: resCategory,
      veg: item.veg,
      image: getFoodImage(item.name, resCategory)
    });
  });

  // Add 3 items from Healthy
  FOOD_POOL.Healthy.slice(0, 3).forEach((item, idx) => {
    menu.push({
      id: resId * 100 + itemCounter++,
      name: item.name,
      description: item.desc,
      price: item.basePrice + (resId % 2) * 10,
      rating: +(item.rating - 0.1 + (idx % 2) * 0.1).toFixed(1),
      category: "Healthy",
      veg: item.veg,
      image: getFoodImage(item.name, "Healthy")
    });
  });

  // Add 3 items from Desserts
  FOOD_POOL.Desserts.slice(0, 3).forEach((item, idx) => {
    menu.push({
      id: resId * 100 + itemCounter++,
      name: item.name,
      description: item.desc,
      price: item.basePrice + (resId % 4) * 5,
      rating: +(item.rating - 0.1 + (idx % 2) * 0.1).toFixed(1),
      category: "Desserts",
      veg: item.veg,
      image: getFoodImage(item.name, "Desserts")
    });
  });

  // Add 3 items from Drinks
  FOOD_POOL.Drinks.slice(0, 3).forEach((item, idx) => {
    menu.push({
      id: resId * 100 + itemCounter++,
      name: item.name,
      description: item.desc,
      price: item.basePrice + (resId % 2) * 12,
      rating: +(item.rating - 0.1 + (idx % 2) * 0.1).toFixed(1),
      category: "Drinks",
      veg: item.veg,
      image: getFoodImage(item.name, "Drinks")
    });
  });

  // Ensure precisely 15 items by adding extra fallback items if anything is missing
  while (menu.length < 15) {
    const backupItem = FOOD_POOL.Drinks[menu.length % FOOD_POOL.Drinks.length];
    menu.push({
      id: resId * 100 + itemCounter++,
      name: backupItem.name + ` Premium`,
      description: backupItem.desc,
      price: backupItem.basePrice + 20,
      rating: backupItem.rating,
      category: "Drinks",
      veg: true,
      image: getFoodImage(backupItem.name, "Drinks")
    });
  }

  // Double check that it has exactly 15 items
  return menu.slice(0, 15);
}

// Generate the fully populated final array of 20 restaurants with 15 menu items each
export const restaurants = BASE_RESTAURANTS.map((res, idx) => {
  return {
    ...res,
    image: RESTAURANT_IMAGES[idx % RESTAURANT_IMAGES.length],
    menu: generateMenuForRestaurant(res.category, res.id)
  };
});

// Category HashMap for O(1) Fast Lookup Filtering
export const categoriesMap = {};
Object.keys(CATEGORY_ICONS).forEach(cat => {
  // Filters out restaurants having that category
  categoriesMap[cat] = restaurants.filter(res => res.category === cat);
});

// Coupon Codes mapping
export const COUPONS = {
  "WELCOME50": { discountType: "percentage", value: 50, maxDiscount: 120, minCart: 199, desc: "50% OFF up to ₹120" },
  "FREEPERK": { discountType: "delivery", value: 40, minCart: 299, desc: "FREE Delivery above ₹299" },
  "WEEKEND20": { discountType: "percentage", value: 20, maxDiscount: 200, minCart: 499, desc: "20% OFF up to ₹200 on weekends" },
  "SUPER100": { discountType: "flat", value: 100, minCart: 599, desc: "Flat ₹100 OFF on orders above ₹599" }
};
