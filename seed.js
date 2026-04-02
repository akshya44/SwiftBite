/**
 * SwiftBite Database Seeder
 * 
 * Run: node server/seed.js
 * This creates a test admin user, sample restaurants, and menu items.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

const User = require('./server/models/User');
const Restaurant = require('./server/models/Restaurant');
const MenuItem = require('./server/models/MenuItem');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in server/.env');
  process.exit(1);
}

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
];

const menuData = {
  'Spice Garden': [
    { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 320, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese marinated in spices', price: 280, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter and cream', price: 240, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
    { name: 'Garlic Naan', description: 'Soft leavened bread with garlic and butter', price: 60, category: 'Bread', imageUrl: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400' },
    { name: 'Mango Lassi', description: 'Chilled yoghurt drink with Alphonso mango', price: 120, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400' },
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
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create owner user
  const owner = await User.create({
    name: 'Restaurant Owner',
    email: 'owner@swiftbite.com',
    password: 'owner123',
    role: 'restaurant',
    address: 'Bangalore, India',
  });

  // Create customer user
  await User.create({
    name: 'Test Customer',
    email: 'customer@swiftbite.com',
    password: 'customer123',
    role: 'customer',
    address: '42 Main Street, Bangalore',
  });

  console.log('👤 Created test users:');
  console.log('   📧 owner@swiftbite.com / owner123 (Restaurant Owner)');
  console.log('   📧 customer@swiftbite.com / customer123 (Customer)');

  // Create restaurants and menus
  for (const rData of restaurants) {
    const restaurant = await Restaurant.create({ ...rData, ownerId: owner._id });
    const items = menuData[rData.name] || [];
    for (const item of items) {
      await MenuItem.create({ ...item, restaurantId: restaurant._id, isAvailable: true });
    }
    console.log(`🍽️  Created: ${rData.name} (${items.length} menu items)`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('   Now restart the server and open http://localhost:5173');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
