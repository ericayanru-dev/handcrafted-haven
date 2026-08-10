"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardNavigation, SellerOverview } from "@/components/seller-dashboard";
import { StoreNotFoundState } from "@/components/seller-profile/store-not-found-state";
import { Loading } from "@/components/state/loading";
import { Button, Card, Container } from "@/components/ui";
import styles from "./page.module.css";

type SellerApiProduct = {
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
    id: string;
    storeName: string;
    bio: string | null;
    rating: number | null;
    createdAt?: string;
    user: {
      name: string;
      location?: string | null;
    };
    products: SellerApiProduct[];
  };
  message?: string;
  error?: string;
};

type UpdateProductResponse = {
  success?: boolean;
  data?: {
    id: string;
    stock?: number;
  };
  message?: string;
  error?: string;
};

type StockStatus = "healthy" | "low" | "out";

function formatCurrency(value: unknown) {
  const asNumber = typeof value === "number" ? value : Number(value);

  if (Number.isFinite(asNumber)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(asNumber);
  }

  return "$0.00";
}

function toStockStatus(stock: number): StockStatus {
  if (stock <= 0) {
    return "out";
  }

  if (stock <= 5) {
    return "low";
  }

  return "healthy";
}

function getStockLabel(stock: number) {
  const status = toStockStatus(stock);

  if (status === "out") {
    return "Out of stock";
  }

  if (status === "low") {
    return "Low stock";
  }

  return "In stock";
}

function getYearsSelling(createdAt?: string) {
  if (!createdAt) {
    return 1;
  }

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const years = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 365.25));
  return Math.max(1, years);
}

export default function InventoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [missingProfile, setMissingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sellerPayload, setSellerPayload] = useState<SellerApiResponse["data"]>(undefined);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadInventory() {
      setIsLoading(true);
      setMissingProfile(false);
      setErrorMessage("");
      setStatusMessage("");

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
          setErrorMessage(result.message ?? result.error ?? "Could not load inventory.");
          return;
        }

        setSellerPayload(result.data);
        setStockDrafts(
          Object.fromEntries(
            result.data.products.map((product) => [product.id, String(product.stock ?? 0)])
          )
        );
      } catch {
        if (isMounted) {
          setErrorMessage("Could not load inventory right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const products = sellerPayload?.products ?? [];

    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
    const outOfStock = products.filter((product) => product.stock <= 0).length;
    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    const catalogValue = products.reduce(
      (sum, product) => sum + Number(product.price || 0) * (product.stock || 0),
      0
    );

    return {
      totalStock,
      lowStock,
      outOfStock,
      catalogValue,
      productCount: products.length,
    };
  }, [sellerPayload]);

  async function handleSaveStock(productId: string) {
    if (!sellerPayload) {
      return;
    }

    const nextStock = Number(stockDrafts[productId]);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setErrorMessage("Stock must be a whole number that is zero or higher.");
      return;
    }

    setSavingId(productId);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch(`/api/product/edit/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock: nextStock }),
      });

      const result = (await response.json()) as UpdateProductResponse;

      if (!response.ok || !result.success) {
        setErrorMessage(result.message ?? result.error ?? "Could not update stock.");
        return;
      }

      setSellerPayload((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          products: current.products.map((product) =>
            product.id === productId ? { ...product, stock: nextStock } : product
          ),
        };
      });

      setStockDrafts((current) => ({
        ...current,
        [productId]: String(nextStock),
      }));
      setStatusMessage("Inventory updated.");
    } catch {
      setErrorMessage("Could not update stock right now.");
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) {
    return <Loading message="Loading inventory..." title="Inventory management" />;
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

  if (errorMessage || !sellerPayload) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <div>
              <p className={styles.eyebrow}>Inventory management</p>
              <h1 className={styles.title}>We couldn't load your inventory.</h1>
            </div>
            <p className={styles.errorMessage}>{errorMessage || "Please try again."}</p>
            <div className={styles.statusActions}>
              <Button href="/dashboard/inventory">Retry</Button>
              <Button href="/dashboard/products" variant="secondary">
                Back to products
              </Button>
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
          <DashboardNavigation />

          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Inventory management</p>
              <h1 className={styles.title}>Track stock across your catalog</h1>
            </div>
            <p className={styles.lead}>
              Update quantities, watch for low stock, and keep your storefront ready for new orders.
            </p>
          </div>

          <SellerOverview
            bio={sellerPayload.bio ?? "No store bio yet."}
            yearsSelling={getYearsSelling(sellerPayload.createdAt)}
            location={sellerPayload.user?.location ?? "Location not set"}
            ownerName={sellerPayload.user?.name ?? "Seller"}
            productCount={summary.productCount}
            rating={sellerPayload.rating ? sellerPayload.rating.toFixed(1) : "N/A"}
            storeName={sellerPayload.storeName}
            totalStock={summary.totalStock}
          />

          <div className={styles.summaryGrid}>
            <Card className={styles.summaryCard}>
              <p className={styles.metricLabel}>Total stock</p>
              <p className={styles.metricValue}>{summary.totalStock}</p>
              <p className={styles.metricNote}>Units currently listed across all products.</p>
            </Card>
            <Card className={styles.summaryCard}>
              <p className={styles.metricLabel}>Low stock items</p>
              <p className={styles.metricValue}>{summary.lowStock}</p>
              <p className={styles.metricNote}>Products with 1 to 5 units left.</p>
            </Card>
            <Card className={styles.summaryCard}>
              <p className={styles.metricLabel}>Out of stock</p>
              <p className={styles.metricValue}>{summary.outOfStock}</p>
              <p className={styles.metricNote}>Listings that need restocking before buyers can order.</p>
            </Card>
            <Card className={styles.summaryCard}>
              <p className={styles.metricLabel}>Catalog value</p>
              <p className={styles.metricValue}>{formatCurrency(summary.catalogValue)}</p>
              <p className={styles.metricNote}>Estimated value of all units currently in stock.</p>
            </Card>
          </div>

          {statusMessage ? <p className={styles.successMessage}>{statusMessage}</p> : null}
          {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}

          <div className={styles.inventoryGrid}>
            {sellerPayload.products.map((product) => {
              const stockStatus = toStockStatus(product.stock);
              const stockLabel = getStockLabel(product.stock);
              const draftValue = stockDrafts[product.id] ?? String(product.stock ?? 0);

              return (
                <Card as="article" className={styles.inventoryCard} key={product.id}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.cardCategory}>{product.category || "General"}</p>
                      <h2 className={styles.cardTitle}>{product.title}</h2>
                    </div>
                    <span className={`${styles.stockBadge} ${styles[stockStatus]}`}>{stockLabel}</span>
                  </div>

                  <p className={styles.cardText}>{product.description}</p>

                  {product.imageUrl ? (
                    <img alt={product.title} className={styles.cardImage} src={product.imageUrl} />
                  ) : null}

                  <div className={styles.cardMeta}>
                    <span>Current stock: {product.stock}</span>
                    <span>Price: {formatCurrency(product.price)}</span>
                  </div>

                  <label className={styles.fieldGroup} htmlFor={`stock-${product.id}`}>
                    <span className={styles.fieldLabel}>Update stock</span>
                    <input
                      className={styles.field}
                      id={`stock-${product.id}`}
                      inputMode="numeric"
                      min="0"
                      onChange={(event) =>
                        setStockDrafts((current) => ({
                          ...current,
                          [product.id]: event.target.value,
                        }))
                      }
                      type="number"
                      value={draftValue}
                    />
                  </label>

                  <div className={styles.cardActions}>
                    <Button
                      disabled={savingId === product.id}
                      onClick={() => handleSaveStock(product.id)}
                      type="button"
                    >
                      {savingId === product.id ? "Saving..." : "Save stock"}
                    </Button>
                    <Button href={`/dashboard/products/edit/${product.id}`} variant="secondary">
                      Full edit
                    </Button>
                    <Button href={`/products/${product.id}`} variant="ghost">
                      Public page
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </main>
  );
}