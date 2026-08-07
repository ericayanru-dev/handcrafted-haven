import { ProductCard } from "@/components/product/product-card";
import styles from "./marketplace.module.css";
import type { MappedProduct } from "./types";

type ProductGridProps = {
  products: MappedProduct[];
  onAddToCart: (product: MappedProduct) => void;
  isBusy?: boolean;
};

export function ProductGrid({ products, onAddToCart, isBusy }: ProductGridProps) {
  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          onAddToCart={() => onAddToCart(product)}
          product={product}
          addToCartDisabled={isBusy || product.stock <= 0}
        />
      ))}
    </div>
  );
}
