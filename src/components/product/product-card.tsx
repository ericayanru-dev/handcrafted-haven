import { Button, Card } from "@/components/ui";
import styles from "./product-pages.module.css";

export type ProductCardData = {
  id: string;
  title: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  imageUrl?: string | null;
  storeName?: string;
};

type ProductCardProps = {
  product: ProductCardData;
  showEdit?: boolean;
  onAddToCart?: () => void;
  addToCartDisabled?: boolean;
};

export function ProductCard({
  product,
  showEdit = false,
  onAddToCart,
  addToCartDisabled,
}: ProductCardProps) {
  return (
    <Card as="article" className={styles.card}>
      {product.imageUrl ? (
        <img alt={product.title} className={styles.cardImage} src={product.imageUrl} />
      ) : (
        <div aria-hidden="true" className={styles.cardImage} />
      )}

      <div className={styles.cardHeader}>
        <p className={styles.cardCategory}>{product.category}</p>
        <h3 className={styles.cardTitle}>{product.title}</h3>
      </div>

      <p className={styles.cardText}>{product.description}</p>

      <div className={styles.cardMeta}>
        <span className={styles.cardPrice}>{product.price}</span>
        <span>{product.stock} in stock</span>
      </div>

      {product.storeName ? <p className={styles.hint}>Sold by {product.storeName}</p> : null}

      <div className={styles.cardActions}>
        <Button href={`/products/${product.id}`} size="sm" variant="secondary">
          View details
        </Button>
        {onAddToCart ? (
          <Button disabled={addToCartDisabled} onClick={onAddToCart} size="sm">
            {product.stock > 0 ? "Add to cart" : "Out of stock"}
          </Button>
        ) : null}
        {showEdit ? (
          <Button href={`/dashboard/products/edit/${product.id}`} size="sm">
            Edit
          </Button>
        ) : null}
      </div>
    </Card>
  );
}