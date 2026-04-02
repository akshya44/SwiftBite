const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

// DB health check middleware — returns 503 if not connected
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Please wait a moment and retry.',
    });
  }
  next();
});

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

// Start the server or export for Vercel Serverless
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    connectDB();
  });
}

// In Vercel, the DB connection needs to trigger when the function wakes up
if (process.env.NODE_ENV === 'production') {
  connectDB().catch(console.error);
}

module.exports = app;

// Connect to MongoDB with in-memory fallback
async function connectDB() {
  const uri = process.env.MONGO_URI;

  // First, try connecting to the configured URI (real MongoDB)
  if (uri && uri !== 'mongodb://localhost:27017/swiftbite') {
    try {
      await mongoose.connect(uri);
      console.log('✅ MongoDB connected:', uri);
      return;
    } catch (err) {
      console.error('❌ Custom MONGO_URI failed:', err.message);
    }
  } else if (uri) {
    // Try local MongoDB
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Local MongoDB connected');
      return;
    } catch (err) {
      console.log('ℹ️  Local MongoDB not available, starting in-memory database...');
    }
  }

  // Fallback: use mongodb-memory-server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log('✅ In-memory MongoDB started (development mode)');
    console.log('   ⚠️  Data will be lost on server restart.');
    console.log('   💡 Set MONGO_URI to a real MongoDB URI for persistence.');

    // Auto-seed demo data
    await seedDemoData();
  } catch (err) {
    console.error('❌ Failed to start in-memory MongoDB:', err.message);
    console.error('   Server will return 503 for all API calls.');
  }
}

// Seed demo data for in-memory mode
async function seedDemoData() {
  const User = require('./models/User');
  const Restaurant = require('./models/Restaurant');
  const MenuItem = require('./models/MenuItem');

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return; // Already seeded

  console.log('🌱 Seeding demo data...');

  // Create users
  const owner = await User.create({
    name: 'Restaurant Owner',
    email: 'owner@swiftbite.com',
    password: 'owner123',
    role: 'restaurant',
    address: 'Bangalore, India',
  });

  await User.create({
    name: 'Test Customer',
    email: 'customer@swiftbite.com',
    password: 'customer123',
    role: 'customer',
    address: '42 Main Street, Bangalore',
  });

  const restaurants = [
    {
      name: 'Spice Garden',
      description: 'Authentic Indian cuisine with rich spices and flavours from across India.',
      cuisineType: 'Indian',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      rating: 4.7,
      isOpen: true,
      address: '12 MG Road, Bangalore',
    },
    {
      name: 'Dragon Palace',
      description: 'Traditional Chinese dim sum, noodles and stir-fries prepared fresh daily.',
      cuisineType: 'Chinese',
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
      rating: 4.5,
      isOpen: true,
      address: '45 Connaught Place, Delhi',
    },
    {
      name: 'Pizza Russo',
      description: 'Wood-fired Neapolitan pizzas and creamy pasta made with imported Italian ingredients.',
      cuisineType: 'Italian',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      rating: 4.8,
      isOpen: true,
      address: '8 Park Street, Mumbai',
    },
    {
      name: 'Burger Bros',
      description: 'Juicy smash burgers, crispy fries, and thick shakes.',
      cuisineType: 'American',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      rating: 4.4,
      isOpen: true,
      address: '27 Anna Salai, Chennai',
    },
    {
      name: 'Taco Fiesta',
      description: 'Authentic Mexican tacos, burritos, and fresh guacamole.',
      cuisineType: 'Mexican',
      imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',
      rating: 4.6,
      isOpen: true,
      address: '15 Jubilee Hills, Hyderabad',
    },
    {
      name: 'Tokyo Sushi',
      description: 'Fresh sushi, sashimi, and warm ramen bowls.',
      cuisineType: 'Japanese',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
      rating: 4.9,
      isOpen: true,
      address: '32 Koregaon Park, Pune',
    },
    {
      name: 'Thai Orchid',
      description: 'Sweet, spicy, and sour Thai street food flavors.',
      cuisineType: 'Thai',
      imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
      rating: 4.5,
      isOpen: true,
      address: 'Sector 29, Gurgaon',
    },
    {
      name: 'Sweet Treats',
      description: 'Decadent cakes, pastries, and artisanal coffee.',
      cuisineType: 'Dessert',
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
      rating: 4.8,
      isOpen: true,
      address: 'Bandra West, Mumbai',
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
    const restaurant = await Restaurant.create({ ...rData, ownerId: owner._id });
    const items = menuData[rData.name] || [];
    for (const item of items) {
      await MenuItem.create({ ...item, restaurantId: restaurant._id, isAvailable: true });
    }
    console.log(`  🍽️  ${rData.name} (${items.length} items)`);
  }

  console.log('✅ Demo data seeded!');
  console.log('   📧 customer@swiftbite.com / customer123');
  console.log('   📧 owner@swiftbite.com / owner123');
}
