"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import { ProductCard } from "@/components/product/product-card";
import styles from "@/components/product/product-pages.module.css";

type ProductListItem = {
  id: string;
  title: string;
  description: string;
  price: unknown;
  stock: number;
  category: string;
  imageUrl?: string | null;
  seller?: {
    storeName?: string;
  };
};

type ProductsApiResponse = {
  success: boolean;
  data?: ProductListItem[];
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

export default function ProductListingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("limit", "24");
        params.set("sortBy", sortBy);
        if (search.trim()) {
          params.set("search", search.trim());
        }
        if (category.trim()) {
          params.set("category", category.trim());
        }

        const response = await fetch(`/api/product/get-products?${params.toString()}`);
        const result = (await response.json()) as ProductsApiResponse;

        if (!isMounted) {
          return;
        }

        if (!response.ok || !result.success) {
          setError(result.message ?? result.error ?? "Could not load products.");
          return;
        }

        setProducts(result.data ?? []);
      } catch {
        if (isMounted) {
          setError("Could not load products right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category, search, sortBy]);

  const mappedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: formatPrice(product.price),
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl,
      storeName: product.seller?.storeName,
    }));
  }, [products]);

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.section}>
          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Product listing</p>
              <h1 className={styles.title}>Browse marketplace products</h1>
            </div>
            <p className={styles.lead}>
              Search and filter products by category, then open a product to see more details.
            </p>
          </div>

          <div className={styles.toolbar}>
            <input
              className={styles.field}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title or description"
              value={search}
            />
            <input
              className={styles.field}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Category"
              value={category}
            />
            <select
              className={styles.select}
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="title">Title</option>
            </select>
          </div>

          {isLoading ? <Loading message="Loading products..." title="Product listing" /> : null}

          {!isLoading && error ? <p className={styles.error}>{error}</p> : null}

          {!isLoading && !error && mappedProducts.length === 0 ? (
            <div className={styles.status}>
              <p>No products matched your filters.</p>
            </div>
          ) : null}

          {!isLoading && !error && mappedProducts.length > 0 ? (
            <div className={styles.listGrid}>
              {mappedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}

          <div className={styles.actions}>
            <Button href="/dashboard/products/create">Create product</Button>
            <Button href="/dashboard/seller-profile" variant="secondary">
              Seller profile
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
