"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, Card } from "@/components/ui";
import styles from "./product-pages.module.css";

const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(999999, "Price is too high"),
  stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  category: z.string().trim().min(2, "Category is required").max(50, "Category is too long"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

const editableFields = ["title", "description", "price", "stock", "category", "imageUrl"] as const;

const editFieldSchemas = {
  title: productSchema.shape.title,
  description: productSchema.shape.description,
  price: productSchema.shape.price,
  stock: productSchema.shape.stock,
  category: productSchema.shape.category,
  imageUrl: productSchema.shape.imageUrl,
};

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
  const baseValues: ProductFormValues = {
    ...defaultValues,
    ...initialValues,
  };
  const [values, setValues] = useState<ProductFormValues>({
    ...baseValues,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(initialValues?.imageUrl ?? null);

  useEffect(() => {
    if (mode !== "edit") {
      return;
    }

    const nextValues: ProductFormValues = {
      ...defaultValues,
      ...initialValues,
    };

    setValues(nextValues);
    setPreviewSrc(nextValues.imageUrl || null);
  }, [mode, initialValues]);

  const heading = mode === "create" ? "Create product" : "Edit product";

  const endpoint = useMemo(() => {
    return mode === "create" ? "/api/product/create" : `/api/product/edit/${productId}`;
  }, [mode, productId]);

  const cancelHref = "/dashboard/products";

  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) setFormError("");
    if (formSuccess) setFormSuccess("");
  }

  /**
   * Upload image to Vercel Blob via /api/upload
   */
  const uploadIdRef = useRef(0);

  async function handleImageFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Increase the ID so older uploads become "stale"
    const currentUploadId = ++uploadIdRef.current;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);

    setIsUploading(true);
    setFormError("");
    setFieldErrors((current) => ({ ...current, imageUrl: undefined }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      // Ignore this response if the user already selected another file
      if (currentUploadId !== uploadIdRef.current) {
        return;
      }

      if (!res.ok || !result.success) {
        setFormError(result.message || "Image upload failed");
        setPreviewSrc(initialValues?.imageUrl ?? null);
        return;
      }

      updateField("imageUrl", result.data.url);
      setPreviewSrc(result.data.url);
    } catch {
      if (currentUploadId !== uploadIdRef.current) return;

      setFormError("Could not upload image. Please try again.");
      setPreviewSrc(initialValues?.imageUrl ?? null);
    } finally {
      if (currentUploadId === uploadIdRef.current) {
        setIsUploading(false);
      }
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isUploading) {
      setFormError("Please wait for the image to finish uploading.");
      return;
    }

    let payload: Record<string, unknown> = {};

    if (mode === "create") {
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

      payload = {
        title: validation.data.title,
        description: validation.data.description,
        price: validation.data.price,
        stock: validation.data.stock,
        category: validation.data.category,
        imageUrl: validation.data.imageUrl || undefined,
      };
    } else {
      const changedFields = editableFields.filter((field) => values[field] !== baseValues[field]);

      if (changedFields.length === 0) {
        setFormError("Update at least one field before saving.");
        return;
      }

      const nextErrors: FieldErrors = {};

      for (const field of changedFields) {
        const parsed = editFieldSchemas[field].safeParse(values[field]);

        if (!parsed.success) {
          nextErrors[field] = parsed.error.issues[0]?.message ?? "Invalid value";
          continue;
        }

        payload[field] = field === "imageUrl" ? parsed.data || null : parsed.data;
      }

      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        return;
      }
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
        body: JSON.stringify(payload),
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

      router.push("/dashboard/products");
      router.refresh();
    } catch {
      setFormError("Could not save product right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form
        aria-busy={isSubmitting || isUploading}
        className={styles.form}
        noValidate
        onSubmit={handleSubmit}
      >
        <div>
          <p className={styles.eyebrow}>Product form</p>
          <h2 className={styles.title}>{heading}</h2>
        </div>

        <div className={styles.formGrid}>
          {/* Title */}
          <label className={styles.fieldGroup} htmlFor="title">
            <span className={styles.label}>Title</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="title"
              onChange={(e) => updateField("title", e.target.value)}
              required={mode === "create"}
              value={values.title}
            />
            {fieldErrors.title && <p className={styles.error}>{fieldErrors.title}</p>}
          </label>

          {/* Category */}
          <label className={styles.fieldGroup} htmlFor="category">
            <span className={styles.label}>Category</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="category"
              onChange={(e) => updateField("category", e.target.value)}
              required={mode === "create"}
              value={values.category}
            />
            {fieldErrors.category && <p className={styles.error}>{fieldErrors.category}</p>}
          </label>

          {/* Price */}
          <label className={styles.fieldGroup} htmlFor="price">
            <span className={styles.label}>Price</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="price"
              inputMode="decimal"
              min="0.01"
              onChange={(e) => updateField("price", e.target.value)}
              required={mode === "create"}
              step="0.01"
              type="number"
              value={values.price}
            />
            {fieldErrors.price && <p className={styles.error}>{fieldErrors.price}</p>}
          </label>

          {/* Stock */}
          <label className={styles.fieldGroup} htmlFor="stock">
            <span className={styles.label}>Stock</span>
            <input
              className={styles.field}
              disabled={isSubmitting}
              id="stock"
              inputMode="numeric"
              min="0"
              onChange={(e) => updateField("stock", e.target.value)}
              required={mode === "create"}
              step="1"
              type="number"
              value={values.stock}
            />
            {fieldErrors.stock && <p className={styles.error}>{fieldErrors.stock}</p>}
          </label>

          {/* Description */}
          <label className={`${styles.fieldGroup} ${styles.fieldGroupFull}`} htmlFor="description">
            <span className={styles.label}>Description</span>
            <textarea
              className={styles.textarea}
              disabled={isSubmitting}
              id="description"
              onChange={(e) => updateField("description", e.target.value)}
              required={mode === "create"}
              value={values.description}
            />
            {fieldErrors.description && <p className={styles.error}>{fieldErrors.description}</p>}
          </label>

          {/* Image Upload */}
          <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
            <span className={styles.label}>Product Image</span>
            <div className={styles.uploadRow}>
              <div className={styles.uploadControls}>
                <input
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  disabled={isSubmitting || isUploading}
                  onChange={handleImageFile}
                  type="file"
                />
                <span className={styles.hint}>
                  {isUploading ? "Uploading image..." : "JPEG, PNG or WebP. Max 4MB."}
                </span>
              </div>

              {previewSrc && (
                <img alt="Product preview" className={styles.uploadPreview} src={previewSrc} />
              )}

              {/* Hidden but still part of form state */}
              <input type="hidden" value={values.imageUrl} readOnly />
            </div>
            {fieldErrors.imageUrl && <p className={styles.error}>{fieldErrors.imageUrl}</p>}
          </div>
        </div>

        {formError && (
          <p aria-live="polite" className={styles.error} role="alert">
            {formError}
          </p>
        )}
        {formSuccess && (
          <p aria-live="polite" className={styles.success} role="status">
            {formSuccess}
          </p>
        )}

        <div className={styles.actions}>
          <Button disabled={isSubmitting || isUploading} type="submit">
            {isUploading
              ? "Uploading image..."
              : isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create product"
                : "Save product"}
          </Button>
          <Button href={cancelHref} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
