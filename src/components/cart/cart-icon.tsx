"use client";

import { useCart } from "./cart-provider";
import styles from "./cart.module.css";

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <a aria-label={`View cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`} className={styles.cartIcon} href="/cart">
      <span aria-hidden="true" className={styles.cartGlyph}>
        <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <circle cx="10" cy="20" r="1.2" fill="currentColor" />
          <circle cx="18" cy="20" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <span className={styles.cartLabel}>Cart</span>
      {itemCount > 0 ? <span className={styles.cartCount}>{itemCount}</span> : null}
    </a>
  );
}
