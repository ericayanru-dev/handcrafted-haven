"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import { DashboardNavigation } from "@/components/seller-dashboard";
import { StoreNotFoundState } from "@/components/seller-profile/store-not-found-state";
import styles from "@/components/product/product-pages.module.css";

type SellerProduct = {
  id: string;
  title: string;
  description: string;
  price: unknown;
  stock: number;
  category?: string | null;
  imageUrl?: string | null;
};

type SellerApiResponse = {
  success: boolean;
  data?: {
    storeName: string;
    products: SellerProduct[];
  };
  message?: string;
  error?: string;
};

type DeleteApiResponse = {
  success: boolean;
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

export default function SellerProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [missingProfile, setMissingProfile] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [products, setProducts] = useState<SellerProduct[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setMissingProfile(false);

      try {
        const response = await fetch("/api/seller/get-seller", { method: "GET" });
        const result = (await response.json()) as SellerApiResponse;

        if (!isMounted) {
          return;
        }

        if (response.status === 404) {
          setMissingProfile(true);
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          setErrorMessage(result.message ?? result.error ?? "Could not load your products.");
          return;
        }

        setStoreName(result.data.storeName);
        setProducts(result.data.products ?? []);
      } catch {
        if (isMounted) {
          setErrorMessage("Could not load your products right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const productCountLabel = useMemo(() => {
    return products.length === 1 ? "1 product" : `${products.length} products`;
  }, [products.length]);

  async function handleDeleteProduct(productId: string, title: string) {
    const confirmed = window.confirm(`Delete ${title}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeletingId(productId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/product/delete/${productId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as DeleteApiResponse;

      if (!response.ok || !result.success) {
        setErrorMessage(result.message ?? result.error ?? "Could not delete this product.");
        return;
      }

      setProducts((current) => current.filter((product) => product.id !== productId));
      setSuccessMessage(`${title} was deleted.`);
    } catch {
      setErrorMessage("Could not delete this product right now.");
    } finally {
      setIsDeletingId(null);
    }
  }

  if (isLoading) {
    return <Loading message="Loading your products..." title="My products" />;
  }

  if (missingProfile) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <div className={styles.section}>
            <StoreNotFoundState />
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.section}>
          <DashboardNavigation />

          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Seller products</p>
              <h1 className={styles.title}>Manage your product listings</h1>
            </div>
            <p className={styles.lead}>
              Review the products in {storeName || "your store"}, then update or remove listings from one place.
            </p>
          </div>

          <div className={styles.actions}>
            <Button href="/dashboard/products/create">Add product</Button>
            <Button href="/products" variant="secondary">
              View public catalog
            </Button>
          </div>

          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
          {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

          {products.length === 0 ? (
            <Card className={styles.statusCard}>
              <p className={styles.eyebrow}>No products yet</p>
              <p className={styles.lead}>Create your first product listing so shoppers can discover your store.</p>
              <div className={styles.actions}>
                <Button href="/dashboard/products/create">Create product</Button>
              </div>
            </Card>
          ) : (
            <>
              <p className={styles.hint}>{productCountLabel} in {storeName || "your store"}</p>

              <div className={styles.listGrid}>
                {products.map((product) => (
                  <Card as="article" className={styles.card} key={product.id}>
                    {product.imageUrl ? (
                      <img alt={product.title} className={styles.cardImage} src={product.imageUrl} />
                    ) : (
                      <div aria-hidden="true" className={styles.cardImage} />
                    )}

                    <div className={styles.cardHeader}>
                      <p className={styles.cardCategory}>{product.category || "General"}</p>
                      <h2 className={styles.cardTitle}>{product.title}</h2>
                    </div>

                    <p className={styles.cardText}>{product.description}</p>

                    <div className={styles.metaList}>
                      <span className={styles.cardPrice}>{formatPrice(product.price)}</span>
                      <span>{product.stock} in stock</span>
                    </div>

                    <div className={styles.cardActionsStack}>
                      <Button href={`/dashboard/products/edit/${product.id}`}>Edit product</Button>
                      <Button
                        disabled={isDeletingId === product.id}
                        onClick={() => handleDeleteProduct(product.id, product.title)}
                        variant="secondary"
                      >
                        {isDeletingId === product.id ? "Deleting..." : "Delete product"}
                      </Button>
                      <Button href={`/products/${product.id}`} variant="ghost">
                        View public page
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}