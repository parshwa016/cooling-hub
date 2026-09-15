import React, { createContext, useContext, useState } from 'react';
import { usePopup } from './PopupContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { showToast } = usePopup();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [compareItems, setCompareItems] = useState([]);
  const [pincode, setPincode] = useState('110001');

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const toggleCompare = (product) => {
    setCompareItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      if (prev.length >= 3) {
        showToast({
          type: 'warning',
          title: 'Comparison Limit Reached',
          message: 'You can compare up to 3 AC products simultaneously.'
        });
        return prev;
      }
      return [...prev, product];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        wishlist,
        toggleWishlist,
        compareItems,
        toggleCompare,
        pincode,
        setPincode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
