import { Card } from "@/components/ui";
import styles from "./seller-profile.module.css";

export type SellerProductItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  stock: number;
  category: string;
};

type SellerProductsProps = {
  products: SellerProductItem[];
};

export function SellerProducts({ products }: SellerProductsProps) {
  if (products.length === 0) {
    return <p className={styles.emptyState}>No products have been added yet.</p>;
  }

  return (
    <div className={styles.productsGrid}>
      {products.map((product) => (
        <Card as="article" className={styles.productCard} key={product.id}>
          <p className={styles.productCategory}>{product.category}</p>
          <h3 className={styles.productTitle}>{product.title}</h3>
          <p className={styles.productText}>{product.description}</p>
          <div className={styles.productFooter}>
            <span>{product.price}</span>
            <span>{product.stock} in stock</span>
          </div>
        </Card>
      ))}
    </div>
  );
}