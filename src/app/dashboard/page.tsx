"use client";

import { useEffect, useMemo, useState } from "react";
import { loadOrderHistory, type OrderRecord } from "@/components/orders";
import {
  DashboardNavigation,
  SalesSummaryCards,
  SellerOverview,
} from "@/components/seller-dashboard";
import { StoreNotFoundState } from "@/components/seller-profile/store-not-found-state";
import styles from "@/components/seller-dashboard/seller-dashboard.module.css";
import { Loading } from "@/components/state/loading";
import { Button, Card, Container } from "@/components/ui";

type SellerApiProduct = {
  id: string;
  title: string;
  price: unknown;
  stock: number;
  category?: string | null;
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

type SellerProfileErrorCode = "SELLER_PROFILE_NOT_FOUND" | "UNKNOWN";

function getSellerProfileErrorCode(status: number, body: SellerApiResponse): SellerProfileErrorCode {
  if (status === 404 || body.message?.toLowerCase().includes("seller profile not found")) {
    return "SELLER_PROFILE_NOT_FOUND";
  }

  return "UNKNOWN";
}

function toPrice(value: unknown) {
  const asNumber = typeof value === "number" ? value : Number(value);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
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

export default function SellerDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [missingProfile, setMissingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sellerPayload, setSellerPayload] = useState<SellerApiResponse["data"]>(undefined);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersMode, setOrdersMode] = useState<"api" | "local">("local");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setMissingProfile(false);
      setErrorMessage("");

      try {
        const sellerResponse = await fetch("/api/seller/get-seller", { method: "GET" });
        const sellerResult = (await sellerResponse.json()) as SellerApiResponse;

        if (!isMounted) {
          return;
        }

        if (getSellerProfileErrorCode(sellerResponse.status, sellerResult) === "SELLER_PROFILE_NOT_FOUND") {
          setMissingProfile(true);
          setIsLoading(false);
          return;
        }

        if (!sellerResponse.ok || !sellerResult.success || !sellerResult.data) {
          setErrorMessage(sellerResult.message ?? sellerResult.error ?? "Could not load seller dashboard.");
          setIsLoading(false);
          return;
        }

        setSellerPayload(sellerResult.data);

        const ordersResult = await loadOrderHistory();
        if (!isMounted) {
          return;
        }

        setOrders(ordersResult.orders);
        setOrdersMode(ordersResult.mode);
      } catch {
        if (isMounted) {
          setErrorMessage("Could not load seller dashboard right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const derived = useMemo(() => {
    if (!sellerPayload) {
      return null;
    }

    const productIds = new Set(sellerPayload.products.map((product) => product.id));
    const storeName = sellerPayload.storeName;

    const matchingOrders = orders
      .map((order) => {
        const items = order.items.filter(
          (item) => item.storeName === storeName || productIds.has(item.productId)
        );
        return { ...order, items };
      })
      .filter((order) => order.items.length > 0);

    const soldUnits = matchingOrders.reduce(
      (sum, order) => sum + order.items.reduce((inner, item) => inner + item.quantity, 0),
      0
    );

    const revenue = matchingOrders.reduce(
      (sum, order) => sum + order.items.reduce((inner, item) => inner + item.price * item.quantity, 0),
      0
    );

    const pendingOrders = matchingOrders.filter(
      (order) => order.status === "PLACED" || order.status === "PROCESSING"
    ).length;

    const completedOrders = matchingOrders.filter(
      (order) => order.status === "DELIVERED" || order.status === "SHIPPED"
    ).length;

    const totalStock = sellerPayload.products.reduce((sum, product) => sum + (product.stock || 0), 0);
    const catalogValue = sellerPayload.products.reduce(
      (sum, product) => sum + toPrice(product.price) * (product.stock || 0),
      0
    );

    const categoryCounts = new Map<string, number>();
    for (const product of sellerPayload.products) {
      const category = (product.category || "General").trim();
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }

    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const averageOrderValue = matchingOrders.length > 0 ? revenue / matchingOrders.length : 0;

    return {
      seller: {
        storeName: sellerPayload.storeName,
        ownerName: sellerPayload.user?.name ?? "Seller",
        location: sellerPayload.user?.location ?? "Location not set",
        bio: sellerPayload.bio ?? "No store bio yet.",
        rating: sellerPayload.rating ? sellerPayload.rating.toFixed(1) : "N/A",
        yearsSelling: getYearsSelling(sellerPayload.createdAt),
        productCount: sellerPayload.products.length,
        totalStock,
      },
      sales: {
        revenue,
        orders: matchingOrders.length,
        soldUnits,
        averageOrderValue,
        pendingOrders,
        completedOrders,
      },
      product: {
        catalogValue,
        topCategories,
      },
    };
  }, [orders, sellerPayload]);

  if (isLoading) {
    return <Loading message="Loading seller dashboard..." title="Seller dashboard" />;
  }

  if (missingProfile) {
    return (
      <main>
        <Container size="narrow">
          <div className={styles.section}>
            <StoreNotFoundState />
          </div>
        </Container>
      </main>
    );
  }

  if (errorMessage || !derived) {
    return (
      <main>
        <Container size="narrow">
          <Card className={styles.status}>
            <p>{errorMessage || "Could not load seller dashboard."}</p>
            <div className={styles.actions}>
              <Button href="/dashboard">Retry</Button>
              <Button href="/dashboard/seller-profile" variant="secondary">
                Seller profile
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  const summaryCards = [
    {
      label: "Revenue",
      value: formatCurrency(derived.sales.revenue),
      note: ordersMode === "local" ? "Local estimate until dashboard API is connected." : "Synced from API.",
    },
    {
      label: "Orders",
      value: String(derived.sales.orders),
      note: `${derived.sales.pendingOrders} pending / ${derived.sales.completedOrders} completed`,
    },
    {
      label: "Units sold",
      value: String(derived.sales.soldUnits),
      note: "Combined quantity from orders linked to your listings.",
    },
    {
      label: "Average order",
      value: formatCurrency(derived.sales.averageOrderValue),
      note: "Average value per order containing your products.",
    },
  ];

  return (
    <main className={styles.page}>
      <Container>
        <section className={styles.section}>
          <header className={styles.header}>
            <div>
              <p className={styles.sectionEyebrow}>Seller dashboard</p>
              <h1 className={styles.title}>Store performance overview</h1>
            </div>
            <p className={styles.lead}>
              Track your current sales signals, listing activity, and order flow from one place.
            </p>
          </header>

          <DashboardNavigation />

          {ordersMode === "local" ? (
            <p className={styles.info}>
              Sales and order stats are in local preview mode while backend dashboard endpoints are being implemented.
            </p>
          ) : null}

          <SellerOverview {...derived.seller} />

          <div className={styles.stack}>
            <div>
              <p className={styles.sectionEyebrow}>Sales summary</p>
              <h2 className={styles.sectionTitle}>Key business metrics</h2>
            </div>
            <SalesSummaryCards cards={summaryCards} />
          </div>

          <div className={styles.twoColumn}>
            <Card className={styles.stack}>
              <div>
                <p className={styles.sectionEyebrow}>Product summary</p>
                <h2 className={styles.sectionTitle}>Listing snapshot</h2>
              </div>

              <div className={styles.list}>
                <div className={styles.listRow}>
                  <span>Products listed</span>
                  <strong>{derived.seller.productCount}</strong>
                </div>
                <div className={styles.listRow}>
                  <span>Total units in stock</span>
                  <strong>{derived.seller.totalStock}</strong>
                </div>
                <div className={styles.listRow}>
                  <span>Catalog value</span>
                  <strong>{formatCurrency(derived.product.catalogValue)}</strong>
                </div>
              </div>

              <div className={styles.stack}>
                <p className={styles.metricLabel}>Top categories</p>
                {derived.product.topCategories.length > 0 ? (
                  <div className={styles.list}>
                    {derived.product.topCategories.map(([name, count]) => (
                      <div className={styles.listRow} key={name}>
                        <span>{name}</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.sectionText}>No product categories yet.</p>
                )}
              </div>
            </Card>

            <Card className={styles.stack}>
              <div>
                <p className={styles.sectionEyebrow}>Seller actions</p>
                <h2 className={styles.sectionTitle}>Next steps</h2>
              </div>

              <div className={styles.list}>
                <div className={styles.listRow}>
                  <span>Pending orders</span>
                  <strong>{derived.sales.pendingOrders}</strong>
                </div>
                <div className={styles.listRow}>
                  <span>Completed orders</span>
                  <strong>{derived.sales.completedOrders}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <Button href="/dashboard/products/create">Add product</Button>
                <Button href="/dashboard/seller-profile/edit" variant="secondary">
                  Edit profile
                </Button>
                <Button href="/orders" variant="ghost">
                  View orders
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </Container>
    </main>
  );
}
