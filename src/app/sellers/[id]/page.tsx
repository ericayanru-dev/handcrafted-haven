"use client";

import { use, useEffect, useMemo, useState } from "react";
import { SellerInformation } from "@/components/seller-profile/seller-information";
import { ProductCard } from "@/components/product/product-card";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import styles from "@/components/seller-profile/seller-profile.module.css";
import productStyles from "@/components/product/product-pages.module.css";

type SellerProduct = {
  id: string;
  title: string;
  description: string;
  price: unknown;
  stock: number;
  category: string | null;
  imageUrl: string | null;
};

type SellerByIdResponse = {
  success: boolean;
  data?: {
    id: string;
    storeName: string;
    bio: string | null;
    rating: number | null;
    createdAt: string;
    user: {
      name: string;
      location: string | null;
    };
    products: SellerProduct[];
  };
  message?: string;
  error?: string;
};

function formatPrice(value: unknown) {
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

function getYearsSelling(createdAt: string) {
  const years = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return Math.max(1, years);
}

export default function PublicSellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState<SellerByIdResponse["data"]>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function loadSeller() {
      setIsLoading(true);
      setNotFound(false);
      setErrorMessage("");

      try {
        const response = await fetch(`/api/seller/get-by-id/${id}`);
        const result = (await response.json()) as SellerByIdResponse;

        if (!isMounted) return;

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          setErrorMessage(result.message ?? result.error ?? "Could not load this seller.");
          return;
        }

        setPayload(result.data);
      } catch {
        if (isMounted) setErrorMessage("Could not load this seller right now.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSeller();
    return () => { isMounted = false; };
  }, [id]);

  const sellerProfile = useMemo(() => {
    if (!payload) return null;
    return {
      storeName: payload.storeName,
      ownerName: payload.user?.name ?? "Seller",
      rating: payload.rating,
      bio: payload.bio,
      location: payload.user?.location ?? "Location not set",
      productsCount: payload.products?.length ?? 0,
      yearsSelling: getYearsSelling(payload.createdAt),
    };
  }, [payload]);

  const mappedProducts = useMemo(() => {
    if (!payload?.products) return [];
    return payload.products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: formatPrice(product.price),
      stock: product.stock,
      category: product.category ?? "General",
      imageUrl: product.imageUrl,
      storeName: payload.storeName,
    }));
  }, [payload]);

  if (isLoading) {
    return <Loading message="Loading seller profile..." title="Seller profile" />;
  }

  if (notFound) {
    return (
      <main>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <div>
              <p className={styles.productCategory}>Seller not found</p>
              <h1 className={styles.sectionTitle}>We couldn't find this seller.</h1>
            </div>
            <p className={styles.sectionText}>The seller profile may have been removed or the link is incorrect.</p>
            <div className={styles.statusActions}>
              <Button href="/marketplace">Browse marketplace</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  if (errorMessage || !sellerProfile) {
    return (
      <main>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <p className={styles.sectionText}>{errorMessage || "Could not load seller profile."}</p>
            <div className={styles.statusActions}>
              <Button href="/marketplace">Browse marketplace</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Seller profile</p>
              <h1 className={styles.sectionTitle}>{sellerProfile.storeName}</h1>
            </div>
            <Button href="/marketplace" variant="secondary">
              Back to marketplace
            </Button>
          </div>

          <SellerInformation seller={sellerProfile} />
        </div>
      </Container>

      <Container>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Products</p>
              <h2 className={styles.sectionTitle}>Items from this store</h2>
            </div>
          </div>

          {mappedProducts.length === 0 ? (
            <p className={styles.emptyState}>This seller has no products listed yet.</p>
          ) : (
            <div className={productStyles.listGrid}>
              {mappedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
