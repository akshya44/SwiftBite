const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { db, initDb } = require('./database/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// CORS
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173']
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuild, 'index.html'));
    }
  });
}

// Start the server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    initDb();
    console.log('✅ SQLite Database initialized');
    await seedDemoData();
  });
}

// In Vercel, the DB connection needs to trigger when the function wakes up
if (process.env.NODE_ENV === 'production') {
  initDb();
  console.log('✅ SQLite Database initialized (production)');
  seedDemoData().catch(console.error);
}

module.exports = app;

// Seed demo data
async function seedDemoData() {
  const existingUsers = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (existingUsers > 0) return; // Already seeded

  console.log('🌱 Seeding demo data...');

  const insertUser = db.prepare('INSERT INTO users (_id, name, email, password, role, address) VALUES (?, ?, ?, ?, ?, ?)');
  const insertRestaurant = db.prepare('INSERT INTO restaurants (_id, name, description, cuisineType, imageUrl, rating, isOpen, ownerId, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertMenuItem = db.prepare('INSERT INTO menu_items (_id, restaurantId, name, description, price, category, imageUrl, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  // Hash passwords
  const salt = bcrypt.genSaltSync(10);
  const ownerPassword = bcrypt.hashSync('owner123', salt);
  const customerPassword = bcrypt.hashSync('customer123', salt);

  const ownerId = crypto.randomUUID();
  const customerId = crypto.randomUUID();

  db.transaction(() => {
    // Create users
    insertUser.run(ownerId, 'Restaurant Owner', 'owner@swiftbite.com', ownerPassword, 'restaurant', 'Bangalore, India');
    insertUser.run(customerId, 'Test Customer', 'customer@swiftbite.com', customerPassword, 'customer', '42 Main Street, Bangalore');

    const restaurants = [
      {
        name: 'Spice Garden', description: 'Authentic Indian cuisine with rich spices and flavours from across India.',
        cuisineType: 'Indian', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', rating: 4.7, address: '12 MG Road, Bangalore'
      },
      {
        name: 'Dragon Palace', description: 'Traditional Chinese dim sum, noodles and stir-fries prepared fresh daily.',
        cuisineType: 'Chinese', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', rating: 4.5, address: '45 Connaught Place, Delhi'
      },
      {
        name: 'Pizza Russo', description: 'Wood-fired Neapolitan pizzas and creamy pasta made with imported Italian ingredients.',
        cuisineType: 'Italian', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', rating: 4.8, address: '8 Park Street, Mumbai'
      },
      {
        name: 'Burger Bros', description: 'Juicy smash burgers, crispy fries, and thick shakes.',
        cuisineType: 'American', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', rating: 4.4, address: '27 Anna Salai, Chennai'
      },
      {
        name: 'Taco Fiesta', description: 'Authentic Mexican tacos, burritos, and fresh guacamole.',
        cuisineType: 'Mexican', imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800', rating: 4.6, address: '15 Jubilee Hills, Hyderabad'
      },
      {
        name: 'Tokyo Sushi', description: 'Fresh sushi, sashimi, and warm ramen bowls.',
        cuisineType: 'Japanese', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', rating: 4.9, address: '32 Koregaon Park, Pune'
      },
      {
        name: 'Thai Orchid', description: 'Sweet, spicy, and sour Thai street food flavors.',
        cuisineType: 'Thai', imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800', rating: 4.5, address: 'Sector 29, Gurgaon'
      },
      {
        name: 'Sweet Treats', description: 'Decadent cakes, pastries, and artisanal coffee.',
        cuisineType: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', rating: 4.8, address: 'Bandra West, Mumbai'
      }
    ];

    const menuData = {
      'Spice Garden': [
        { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 320, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
        { name: 'Paneer Tikka', description: 'Grilled cottage cheese marinated in spices', price: 280, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
        { name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter and cream', price: 240, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
        { name: 'Garlic Naan', description: 'Soft leavened bread with garlic and butter', price: 60, category: 'Bread' },
        { name: 'Mango Lassi', description: 'Chilled yoghurt drink with Alphonso mango', price: 120, category: 'Drinks' },
        { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose syrup', price: 80, category: 'Desserts' },
      ],
      'Dragon Palace': [
        { name: 'Veg Fried Rice', description: 'Wok-fried rice with seasonal vegetables', price: 220, category: 'Rice & Noodles', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
        { name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts and chilies', price: 340, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400' },
        { name: 'Spring Rolls (4 pcs)', description: 'Crispy rolls stuffed with cabbage and noodles', price: 160, category: 'Starters' },
        { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables and soy sauce', price: 240, category: 'Rice & Noodles' },
        { name: 'Hot & Sour Soup', description: 'Classic tangy soup with mushrooms and bamboo shoots', price: 180, category: 'Soups' },
      ],
      'Pizza Russo': [
        { name: 'Margherita Pizza', description: 'San Marzano tomatoes, mozzarella, fresh basil', price: 480, category: 'Pizzas', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
        { name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni and mozzarella', price: 560, category: 'Pizzas', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
        { name: 'Spaghetti Carbonara', description: 'Creamy pasta with pancetta, egg yolk and parmesan', price: 420, category: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400' },
        { name: 'Tiramisu', description: 'Classic Italian dessert with mascarpone and espresso', price: 240, category: 'Desserts' },
        { name: 'Garlic Bread', description: 'Toasted baguette with herb butter', price: 140, category: 'Sides' },
      ],
      'Burger Bros': [
        { name: 'Classic Smash Burger', description: 'Double smashed beef patty, cheddar, special sauce', price: 380, category: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
        { name: 'Crispy Chicken Burger', description: 'Southern fried chicken, coleslaw, pickles', price: 340, category: 'Burgers' },
        { name: 'Loaded Fries', description: 'Seasoned fries topped with cheese sauce and jalapenos', price: 220, category: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400' },
        { name: 'Thick Shake', description: 'Choose from chocolate, vanilla, or strawberry', price: 180, category: 'Drinks' },
        { name: 'Onion Rings', description: 'Beer-battered crispy onion rings', price: 160, category: 'Sides' },
      ],
      'Taco Fiesta': [
        { name: 'Chicken Burrito', description: 'Flour tortilla packed with grilled chicken, rice, beans, and cheese', price: 280, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400' },
        { name: 'Beef Tacos (3 pcs)', description: 'Hard shell tacos with seasoned beef and fresh salsa', price: 250, category: 'Mains' },
        { name: 'Chips & Guacamole', description: 'Freshly made crispy tortilla chips with homemade guac', price: 190, category: 'Sides' },
        { name: 'Churros', description: 'Fried dough pastry dusted with cinnamon sugar', price: 120, category: 'Desserts' }
      ],
      'Tokyo Sushi': [
        { name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy mayo and cucumber', price: 350, category: 'Sushi', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400' },
        { name: 'Salmon Sashimi', description: '5 pieces of premium cut fresh salmon', price: 420, category: 'Sushi' },
        { name: 'Miso Ramen', description: 'Rich pork broth with chashu, soft egg, and noodles', price: 480, category: 'Mains' },
        { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 150, category: 'Sides' }
      ],
      'Thai Orchid': [
        { name: 'Pad Thai', description: 'Classic stir-fried rice noodles with shrimp and peanuts', price: 320, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400' },
        { name: 'Green Curry', description: 'Spicy and sweet coconut curry with chicken and basil', price: 360, category: 'Mains' },
        { name: 'Tom Yum Soup', description: 'Hot and sour soup with lemongrass and prawns', price: 220, category: 'Soups' },
        { name: 'Mango Sticky Rice', description: 'Sweet sticky rice served with fresh mango', price: 180, category: 'Desserts' }
      ],
      'Sweet Treats': [
        { name: 'Chocolate Truffle Pastry', description: 'Rich chocolate sponge layered with dark chocolate ganache', price: 140, category: 'Pastries', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
        { name: 'Red Velvet Cupcake', description: 'Classic red velvet with cream cheese frosting', price: 90, category: 'Pastries' },
        { name: 'Iced Latte', description: 'Double espresso shot with cold milk and ice', price: 160, category: 'Beverages' },
        { name: 'Blueberry Cheesecake', description: 'Creamy baked cheesecake topped with blueberry compote', price: 210, category: 'Pastries' }
      ]
    };

    for (const rData of restaurants) {
      const restId = crypto.randomUUID();
      insertRestaurant.run(restId, rData.name, rData.description, rData.cuisineType, rData.imageUrl || '', rData.rating, 1, ownerId, rData.address);
      
      const items = menuData[rData.name] || [];
      for (const item of items) {
        const itemId = crypto.randomUUID();
        insertMenuItem.run(itemId, restId, item.name, item.description || '', item.price, item.category, item.imageUrl || '', 1);
      }
      console.log(`  🍽️  ${rData.name} (${items.length} items)`);
    }
  })(); // Run transaction

  console.log('✅ Demo data seeded!');
  console.log('   📧 customer@swiftbite.com / customer123');
  console.log('   📧 owner@swiftbite.com / owner123');
}
