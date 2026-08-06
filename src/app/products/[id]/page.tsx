"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import styles from "@/components/product/product-pages.module.css";

type ProductDetailsResponse = {
  success: boolean;
  data?: {
    id: string;
    title: string;
    description: string;
    price: unknown;
    stock: number;
    category: string;
    imageUrl?: string | null;
    seller?: {
      id: string;
      storeName: string;
      user?: {
        name: string;
      };
    };
  };
  message?: string;
  error?: string;
};

function formatPrice(value: unknown) {
  const asNumber = typeof value === "number" ? value : Number(value);
  if (!Number.isNaN(asNumber)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(asNumber);
  }
  return "$0.00";
}

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { addToCart, isMutating: cartIsMutating, message: cartMessage } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<ProductDetailsResponse["data"]>(undefined);
  const [addedMessage, setAddedMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      setIsLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await fetch(`/api/product/get-product/${params.id}`);
        const result = (await response.json()) as ProductDetailsResponse;

        if (!isMounted) {
          return;
        }

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          setError(result.message ?? result.error ?? "Could not load this product.");
          return;
        }

        setProduct(result.data);
      } catch {
        if (isMounted) {
          setError("Could not load this product right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const price = useMemo(() => formatPrice(product?.price), [product?.price]);

  async function handleAddToCart() {
    if (!product) {
      return;
    }

    await addToCart({
      productId: product.id,
      title: product.title,
      price: Number(product.price) || 0,
      imageUrl: product.imageUrl,
      category: product.category,
      storeName: product.seller?.storeName,
      stock: product.stock,
      quantity: 1,
    });
    setAddedMessage(`${product.title} added to cart.`);
  }

  if (isLoading) {
    return <Loading message="Loading product details..." title="Product details" />;
  }

  if (notFound) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.section}>
            <p className={styles.eyebrow}>Product details</p>
            <h1 className={styles.title}>Product not found</h1>
            <p className={styles.lead}>
              This product may have been removed or the link is no longer valid.
            </p>
            <div className={styles.actions}>
              <Button href="/products">Back to products</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.section}>
            <p className={styles.error}>{error || "Could not load product."}</p>
            <div className={styles.actions}>
              <Button href="/products">Back to products</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.section}>
          <div className={styles.detailLayout}>
            {product.imageUrl ? (
              <img alt={product.title} className={styles.detailImage} src={product.imageUrl} />
            ) : (
              <div aria-hidden="true" className={styles.detailImage} />
            )}

            <div className={styles.detailInfo}>
              <p className={styles.eyebrow}>{product.category}</p>
              <h1 className={styles.title}>{product.title}</h1>
              <p className={styles.detailPrice}>{price}</p>
              <p className={styles.lead}>{product.description}</p>
              <div className={styles.detailMeta}>
                <span>{product.stock} in stock</span>
                <span>Store: {product.seller?.storeName ?? "Unknown"}</span>
                <span>Seller: {product.seller?.user?.name ?? "Unknown"}</span>
              </div>

              {addedMessage || cartMessage ? (
                <p className={styles.success}>{addedMessage || cartMessage}</p>
              ) : null}

              <div className={styles.actions}>
                <Button
                  disabled={cartIsMutating || product.stock <= 0}
                  onClick={handleAddToCart}
                  type="button"
                >
                  {product.stock > 0 ? "Add to cart" : "Out of stock"}
                </Button>
                <Button href={`/dashboard/products/edit/${product.id}`}>Edit product</Button>
                <Button href="/products" variant="secondary">
                  Back to products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
