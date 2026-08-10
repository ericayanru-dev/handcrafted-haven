"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/state/toast-provider";
import {
  addCartItem,
  clearCartItems,
  loadCart,
  removeCartItem,
  setCartItemQuantity,
} from "./cart-api";
import type { AddCartItemInput, CartItem, CartSyncMode } from "./cart-types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isMutating: boolean;
  syncMode: CartSyncMode;
  message: string;
  addToCart: (input: AddCartItemInput) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [syncMode, setSyncMode] = useState<CartSyncMode>("api");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      setIsLoading(true);
      setMessage("");
      try {
        const snapshot = await loadCart();
        if (!isMounted) {
          return;
        }
        setItems(snapshot.items);
        setSyncMode(snapshot.mode);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const nextMessage = error instanceof Error ? error.message : "Could not load your cart right now.";
        setItems([]);
        setSyncMode("api");
        setMessage(nextMessage);
        showToast({
          title: "Cart unavailable",
          message: nextMessage,
          tone: "error",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const applyMutation = useCallback(async (action: () => Promise<{ items: CartItem[]; mode: CartSyncMode; message?: string }>) => {
    setIsMutating(true);
    setMessage("");

    try {
      const result = await action();
      setItems(result.items);
      setSyncMode(result.mode);
      if (result.message) {
        setMessage(result.message);
        showToast({
          title: "Cart updated",
          message: result.message,
          tone: "success",
        });
      }
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Could not update your cart right now.";
      setMessage(nextMessage);
      showToast({
        title: "Cart update failed",
        message: nextMessage,
        tone: "error",
      });
    } finally {
      setIsMutating(false);
    }
  }, [showToast]);

  const addToCart = useCallback(
    async (input: AddCartItemInput) => {
      await applyMutation(() => addCartItem(input));
    },
    [applyMutation]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      await applyMutation(() => setCartItemQuantity(productId, quantity));
    },
    [applyMutation]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      await applyMutation(() => removeCartItem(productId));
    },
    [applyMutation]
  );

  const clearCart = useCallback(async () => {
    await applyMutation(() => clearCartItems());
  }, [applyMutation]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + Math.max(1, item.quantity), 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * Math.max(1, item.quantity), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isLoading,
      isMutating,
      syncMode,
      message,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal, isLoading, isMutating, syncMode, message, addToCart, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
