import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('swiftbite_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCartItems(parsed.items || []);
      setRestaurantId(parsed.restaurantId || null);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('swiftbite_cart', JSON.stringify({ items: cartItems, restaurantId }));
  }, [cartItems, restaurantId]);

  const addToCart = (item, restId) => {
    // If adding from a different restaurant, clear cart first
    if (restaurantId && restaurantId !== restId) {
      if (!window.confirm('Your cart has items from another restaurant. Clear cart and add this item?')) return;
      setCartItems([]);
      setRestaurantId(restId);
    }

    setRestaurantId(restId);
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const next = prev.filter((i) => i._id !== itemId);
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  };

  const updateQuantity = (itemId, qty) => {
    if (qty < 1) return removeFromCart(itemId);
    setCartItems((prev) => prev.map((i) => i._id === itemId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    localStorage.removeItem('swiftbite_cart');
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, restaurantId,
      addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
