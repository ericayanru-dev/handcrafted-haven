"use client";

import { use, useEffect, useState } from "react";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import { ProductForm, type ProductFormValues } from "@/components/product/product-form";
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
  };
  message?: string;
  error?: string;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<ProductFormValues>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await fetch(`/api/product/get-product/${id}`);
        const result = (await response.json()) as ProductDetailsResponse;

        if (!isMounted) {
          return;
        }

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          setError(result.message ?? result.error ?? "Could not load product.");
          return;
        }

        setInitialValues({
          title: result.data.title,
          description: result.data.description,
          price: String(result.data.price ?? ""),
          stock: String(result.data.stock ?? 0),
          category: result.data.category,
          imageUrl: result.data.imageUrl ?? "",
        });
      } catch {
        if (isMounted) {
          setError("Could not load product right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <Loading message="Loading product editor..." title="Edit product" />;
  }

  if (notFound) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.section}>
            <p className={styles.eyebrow}>Edit product</p>
            <h1 className={styles.title}>Product not found</h1>
            <div className={styles.actions}>
              <Button href="/dashboard/products">Back to my products</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.section}>
            <p className={styles.error}>{error}</p>
            <div className={styles.actions}>
              <Button href="/dashboard/products">Back to my products</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container size="narrow">
        <div className={styles.section}>
          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Edit product</p>
              <h1 className={styles.title}>Update your product listing</h1>
            </div>
            <p className={styles.lead}>Change product details and save updates to your listing.</p>
          </div>

          <ProductForm initialValues={initialValues} mode="edit" productId={id} />
        </div>
      </Container>
    </main>
  );
}