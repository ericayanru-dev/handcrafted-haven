"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import { SellerInformation } from "@/components/seller-profile/seller-information";
import { SellerProducts } from "@/components/seller-profile/seller-products";
import { StoreNotFoundState } from "@/components/seller-profile/store-not-found-state";
import styles from "@/components/seller-profile/seller-profile.module.css";

type SellerApiProduct = {
  id: string;
  title: string;
  description: string;
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

function getYearsSelling(createdAt?: string) {
  if (!createdAt) {
    return 1;
  }
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const years = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 365.25));
  return Math.max(1, years);
}

export default function SellerProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [missingProfile, setMissingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState<SellerApiResponse["data"]>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function loadSellerProfile() {
      setIsLoading(true);
      setMissingProfile(false);
      setErrorMessage("");

      try {
        const response = await fetch("/api/seller/get-seller", { method: "GET" });
        const result = (await response.json()) as SellerApiResponse;

        if (!isMounted) {
          return;
        }

        if (getSellerProfileErrorCode(response.status, result) === "SELLER_PROFILE_NOT_FOUND") {
          setMissingProfile(true);
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          setErrorMessage(result.message ?? result.error ?? "Could not load seller profile.");
          return;
        }

        setPayload(result.data);
      } catch {
        if (isMounted) {
          setErrorMessage("Could not load seller profile right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSellerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const sellerProfile = useMemo(() => {
    if (!payload) {
      return null;
    }

    return {
      storeName: payload.storeName,
      ownerName: payload.user?.name ?? "Seller",
      rating: payload.rating ?? null,
      bio: payload.bio,
      location: payload.user?.location ?? "Location not set",
      productsCount: payload.products?.length ?? 0,
      yearsSelling: getYearsSelling(payload.createdAt),
    };
  }, [payload]);

  const sellerProducts = useMemo(() => {
    if (!payload?.products) {
      return [];
    }
    return payload.products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: formatPrice(product.price),
      stock: product.stock,
      category: product.category ?? "General",
    }));
  }, [payload]);

  if (isLoading) {
    return <Loading message="Loading your seller profile..." title="Seller profile" />;
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

  if (errorMessage || !sellerProfile) {
    return (
      <main>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <div>
              <p className={styles.productCategory}>Seller profile</p>
              <h2 className={styles.statusTitle}>We couldn't load your seller profile.</h2>
            </div>
            <p className={styles.errorMessage}>{errorMessage || "Please try again."}</p>
            <div className={styles.statusActions}>
              <Button href="/dashboard/seller-profile">Retry</Button>
              <Button href="/" variant="secondary">
                Continue as buyer
              </Button>
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
              <h2 className={styles.sectionTitle}>Your seller profile</h2>
            </div>
            <p className={styles.sectionText}>
                Keep your store details up to date so shoppers can learn about your brand.
            </p>
          </div>

          <SellerInformation seller={sellerProfile} />
        </div>
      </Container>

      <Container>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Seller products</p>
              <h2 className={styles.sectionTitle}>Products in your store</h2>
            </div>
          </div>

          <SellerProducts products={sellerProducts} />
        </div>
      </Container>

      <Container>
        <div className={styles.section}>
          <div className={styles.actionRow}>
            <Button href="/dashboard/seller-profile/edit">Edit seller profile</Button>
            <Button href="/" variant="secondary">
              Continue as buyer
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}