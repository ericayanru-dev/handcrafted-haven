"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, Card } from "@/components/ui";
import styles from "./seller-profile.module.css";

const createSellerProfileSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name is too long"),
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters").optional(),
});

type CreateSellerProfileValues = {
  storeName: string;
  bio: string;
};

type FieldErrors = Partial<Record<keyof CreateSellerProfileValues, string>>;

const defaultValues: CreateSellerProfileValues = {
  storeName: "",
  bio: "",
};

export function CreateSellerProfileForm() {
  const router = useRouter();
  const [values, setValues] = useState<CreateSellerProfileValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof CreateSellerProfileValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) {
      setFormError("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validation = createSellerProfileSchema.safeParse({
      storeName: values.storeName,
      bio: values.bio || undefined,
    });

    if (!validation.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (fieldName === "storeName" || fieldName === "bio") {
          nextErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/seller/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setFormError(result.message ?? result.error ?? "Could not create seller profile.");
        return;
      }

      router.push("/dashboard/seller-profile");
      router.refresh();
    } catch {
      setFormError("Could not create seller profile right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form aria-busy={isSubmitting} className={styles.formGrid} noValidate onSubmit={handleSubmit}>
        <label className={styles.fieldGroup} htmlFor="storeName">
          <span className={styles.fieldLabel}>Store name</span>
          <input
            autoFocus
            className={styles.field}
            disabled={isSubmitting}
            id="storeName"
            name="storeName"
            onChange={(event) => updateField("storeName", event.target.value)}
            placeholder="e.g. Arlin's Studio"
            required
            value={values.storeName}
          />
          {fieldErrors.storeName ? <p className={styles.errorMessage}>{fieldErrors.storeName}</p> : null}
        </label>

        <label className={styles.fieldGroup} htmlFor="bio">
          <span className={styles.fieldLabel}>Bio</span>
          <textarea
            className={styles.textarea}
            disabled={isSubmitting}
            id="bio"
            name="bio"
            onChange={(event) => updateField("bio", event.target.value)}
            placeholder="Tell buyers a little about your store and products."
            value={values.bio}
          />
          <p className={styles.hint}>Optional, up to 500 characters.</p>
          {fieldErrors.bio ? <p className={styles.errorMessage}>{fieldErrors.bio}</p> : null}
        </label>

        {formError ? (
          <p aria-live="polite" className={styles.errorMessage} role="alert">
            {formError}
          </p>
        ) : null}

        <div className={styles.actionRow}>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating profile..." : "Create seller profile"}
          </Button>
          <Button href="/" variant="secondary">
            Continue as buyer
          </Button>
        </div>
      </form>
    </Card>
  );
}