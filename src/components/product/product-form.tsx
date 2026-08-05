"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, Card } from "@/components/ui";
import styles from "./product-pages.module.css";

const productSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  price: z.coerce.number().positive("Price must be greater than 0").max(999999, "Price is too high"),
  stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  category: z.string().trim().min(2, "Category is required").max(50, "Category is too long"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export type ProductFormValues = {
  title: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
};

type ProductApiResponse = {
  success?: boolean;
  data?: {
    id: string;
  };
  message?: string;
  error?: string;
};

type FieldErrors = Partial<Record<keyof ProductFormValues, string>>;

const defaultValues: ProductFormValues = {
  title: "",
  description: "",
  price: "",
  stock: "0",
  category: "",
  imageUrl: "",
};

export function ProductForm({ mode, productId, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(initialValues?.imageUrl ?? null);
  const fileReaderRef = useRef<FileReader | null>(null);

  const heading = mode === "create" ? "Create product" : "Edit product";

  const endpoint = useMemo(() => {
    return mode === "create" ? "/api/product/create" : `/api/product/edit/${productId}`;
  }, [mode, productId]);

  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) {
      setFormError("");
    }
    if (formSuccess) {
      setFormSuccess("");
    }
  }

  function handleImageFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    fileReaderRef.current = reader;
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = productSchema.safeParse(values);

    if (!validation.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (
          fieldName === "title" ||
          fieldName === "description" ||
          fieldName === "price" ||
          fieldName === "stock" ||
          fieldName === "category" ||
          fieldName === "imageUrl"
        ) {
          nextErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: validation.data.title,
          description: validation.data.description,
          price: validation.data.price,
          stock: validation.data.stock,
          category: validation.data.category,
          imageUrl: validation.data.imageUrl || undefined,
        }),
      });

      const result = (await response.json()) as ProductApiResponse;

      if (!response.ok || !result.success) {
        setFormError(result.message ?? result.error ?? "Could not save product.");
        return;
      }

      setFormSuccess(mode === "create" ? "Product created." : "Product updated.");

      const targetId = result.data?.id ?? productId;
      if (targetId) {
        router.push(`/products/${targetId}`);
        router.refresh();
        return;
      }

      router.push("/products");
      router.refresh();
    } catch {
      setFormError("Could not save product right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form aria-busy={isSubmitting} className={styles.form} noValidate onSubmit={handleSubmit}>
        <div>
          <p className={styles.eyebrow}>Product form</p>
          <h2 className={styles.title}>{heading}</h2>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.fieldGroup} htmlFor="title">
            <span className={styles.label}>Title</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="title"
              onChange={(event) => updateField("title", event.target.value)}
              required
              value={values.title}
            />
            {fieldErrors.title ? <p className={styles.error}>{fieldErrors.title}</p> : null}
          </label>

          <label className={styles.fieldGroup} htmlFor="category">
            <span className={styles.label}>Category</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="category"
              onChange={(event) => updateField("category", event.target.value)}
              required
              value={values.category}
            />
            {fieldErrors.category ? <p className={styles.error}>{fieldErrors.category}</p> : null}
          </label>

          <label className={styles.fieldGroup} htmlFor="price">
            <span className={styles.label}>Price</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="price"
              inputMode="decimal"
              min="0.01"
              onChange={(event) => updateField("price", event.target.value)}
              required
              step="0.01"
              type="number"
              value={values.price}
            />
            {fieldErrors.price ? <p className={styles.error}>{fieldErrors.price}</p> : null}
          </label>

          <label className={styles.fieldGroup} htmlFor="stock">
            <span className={styles.label}>Stock</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="stock"
              inputMode="numeric"
              min="0"
              onChange={(event) => updateField("stock", event.target.value)}
              required
              step="1"
              type="number"
              value={values.stock}
            />
            {fieldErrors.stock ? <p className={styles.error}>{fieldErrors.stock}</p> : null}
          </label>

          <label className={`${styles.fieldGroup} ${styles.fieldGroupFull}`} htmlFor="description">
            <span className={styles.label}>Description</span>
            <textarea
              className={styles.textarea}
              disabled={isSubmitting}
              id="description"
              onChange={(event) => updateField("description", event.target.value)}
              required
              value={values.description}
            />
            {fieldErrors.description ? <p className={styles.error}>{fieldErrors.description}</p> : null}
          </label>

          <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
            <span className={styles.label}>Image upload</span>
            <div className={styles.uploadRow}>
              <div className={styles.uploadControls}>
                <input
                  accept="image/*"
                  disabled={isSubmitting}
                  onChange={handleImageFile}
                  type="file"
                />
                <span className={styles.hint}>You can preview a local file here, then paste the image URL to save it.</span>
              </div>

              {previewSrc ? <img alt="Selected product preview" className={styles.uploadPreview} src={previewSrc} /> : null}

              <label className={styles.fieldGroup} htmlFor="imageUrl">
                <span className={styles.label}>Image URL</span>
                <input
                  className={styles.field}
                  disabled={isSubmitting}
                  id="imageUrl"
                  onChange={(event) => {
                    updateField("imageUrl", event.target.value);
                    if (event.target.value) {
                      setPreviewSrc(event.target.value);
                    }
                  }}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                  value={values.imageUrl}
                />
                {fieldErrors.imageUrl ? <p className={styles.error}>{fieldErrors.imageUrl}</p> : null}
              </label>
            </div>
          </div>
        </div>

        {formError ? (
          <p aria-live="polite" className={styles.error} role="alert">
            {formError}
          </p>
        ) : null}
        {formSuccess ? (
          <p aria-live="polite" className={styles.success} role="status">
            {formSuccess}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : mode === "create" ? "Create product" : "Save product"}
          </Button>
          <Button href="/products" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}