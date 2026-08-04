"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart";
import { Button, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import {
  CategoryFilter,
  EmptyResults,
  MarketplaceSearchBar,
  PriceFilter,
  ProductGrid,
  SortDropdown,
  type MappedProduct,
  type MarketplaceResponse,
  type ProductListItem,
} from "@/components/marketplace";
import styles from "@/components/marketplace/marketplace.module.css";

type SortValue = "newest" | "price-asc" | "price-desc" | "title";

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

function collectCategories(products: ProductListItem[]) {
  const names = new Set<string>();
  for (const product of products) {
    if (product.category?.trim()) {
      names.add(product.category.trim());
    }
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export default function MarketplacePage() {
  const { addToCart, isMutating: cartIsMutating, message: cartMessage } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [addMessage, setAddMessage] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("newest");

  const priceRangeInvalid =
    minPrice.trim().length > 0 &&
    maxPrice.trim().length > 0 &&
    Number(minPrice) > Number(maxPrice);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setIsLoading(true);
      setError("");

      if (priceRangeInvalid) {
        setError("Minimum price cannot be greater than maximum price.");
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams();
        query.set("limit", "24");
        query.set("sortBy", sortBy);

        if (debouncedSearch.trim()) {
          query.set("search", debouncedSearch.trim());
        }

        if (category.trim()) {
          query.set("category", category.trim());
        }

        if (minPrice.trim()) {
          query.set("minPrice", minPrice.trim());
        }

        if (maxPrice.trim()) {
          query.set("maxPrice", maxPrice.trim());
        }

        const response = await fetch(`/api/product/get-products?${query.toString()}`);
        const result = (await response.json()) as MarketplaceResponse;

        if (!isMounted) {
          return;
        }

        if (!response.ok || !result.success) {
          setError(result.message ?? result.error ?? "Could not load marketplace products.");
          return;
        }

        setProducts(result.data ?? []);
      } catch {
        if (isMounted) {
          setError("Could not load marketplace products right now.");
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
  }, [debouncedSearch, category, minPrice, maxPrice, sortBy, priceRangeInvalid]);

  const mappedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: formatPrice(product.price),
      priceValue: Number(product.price) || 0,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl,
      storeName: product.seller?.storeName,
    }));
  }, [products]);

  const categoryOptions = useMemo(() => collectCategories(products), [products]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  }

  async function handleAddToCart(product: MappedProduct) {
    await addToCart({
      productId: product.id,
      title: product.title,
      price: product.priceValue,
      imageUrl: product.imageUrl,
      category: product.category,
      storeName: product.storeName,
      stock: product.stock,
      quantity: 1,
    });
    setAddMessage(`${product.title} added to cart.`);
  }

  const resultsLabel = `${mappedProducts.length} ${mappedProducts.length === 1 ? "product" : "products"} found`;

  return (
    <main className={styles.page}>
      <Container>
        <section className={styles.section}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Marketplace</p>
              <h1 className={styles.title}>Find handmade products from local makers</h1>
            </div>
            <p className={styles.lead}>
              Search, filter, and sort listings to quickly find products that match your style and budget.
            </p>
          </header>

          <div className={styles.filters}>
            <MarketplaceSearchBar onChange={setSearch} value={search} />
            <CategoryFilter onChange={setCategory} options={categoryOptions} value={category} />
            <SortDropdown onChange={setSortBy} value={sortBy} />
            <PriceFilter
              maxPrice={maxPrice}
              minPrice={minPrice}
              onMaxChange={setMaxPrice}
              onMinChange={setMinPrice}
            />
          </div>

          {isLoading ? <Loading message="Loading marketplace products..." title="Marketplace" /> : null}

          {!isLoading && error ? <p className={styles.error}>{error}</p> : null}

          {!isLoading && !error && (addMessage || cartMessage) ? (
            <p className={styles.info}>{addMessage || cartMessage}</p>
          ) : null}

          {!isLoading && !error ? (
            <div className={styles.feedbackRow}>
              <p className={styles.resultsCount}>{resultsLabel}</p>
              <div className={styles.actions}>
                <Button onClick={clearFilters} type="button" variant="ghost">
                  Reset filters
                </Button>
                <Button href="/dashboard/products/create">Create product</Button>
              </div>
            </div>
          ) : null}

          {!isLoading && !error && mappedProducts.length === 0 ? (
            <EmptyResults onClear={clearFilters} />
          ) : null}

          {!isLoading && !error && mappedProducts.length > 0 ? (
            <ProductGrid isBusy={cartIsMutating} onAddToCart={handleAddToCart} products={mappedProducts} />
          ) : null}
        </section>
      </Container>
    </main>
  );
}
