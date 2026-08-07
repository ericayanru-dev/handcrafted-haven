"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import { StoreNotFoundState } from "@/components/seller-profile/store-not-found-state";
import styles from "@/components/seller-profile/seller-profile.module.css";

const updateSellerProfileSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name is too long"),
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters").optional(),
});

const defaultForm = {
  storeName: "",
  bio: "",
};

type SellerApiResponse = {
  success: boolean;
  data?: {
    storeName: string;
    bio: string | null;
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

export default function EditSellerProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingProfile, setMissingProfile] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [fieldErrors, setFieldErrors] = useState<{ storeName?: string; bio?: string }>({});
  const [formError, setFormError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentSeller() {
      setIsLoading(true);
      setMissingProfile(false);
      setFormError("");

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
          setFormError(result.message ?? result.error ?? "Could not load seller profile.");
          return;
        }

        setForm({
          storeName: result.data.storeName,
          bio: result.data.bio ?? "",
        });
      } catch {
        if (isMounted) {
          setFormError("Could not load seller profile right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentSeller();

    return () => {
      isMounted = false;
    };
  }, []);

  const isDisabled = useMemo(() => isSubmitting || isLoading, [isLoading, isSubmitting]);

  function updateField(field: keyof typeof defaultForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) {
      setFormError("");
    }
    setSavedMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = updateSellerProfileSchema.safeParse({
      storeName: form.storeName,
      bio: form.bio || undefined,
    });

    if (!validation.success) {
      const nextErrors: { storeName?: string; bio?: string } = {};
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
    setFormError("");
    setSavedMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/seller/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      const result = (await response.json()) as SellerApiResponse;

      if (!response.ok || !result.success) {
        setFormError(result.message ?? result.error ?? "Could not save seller profile.");
        return;
      }

      setSavedMessage("Seller profile updated.");
      router.push("/dashboard/seller-profile");
      router.refresh();
    } catch {
      setFormError("Could not save seller profile right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <Loading message="Loading profile for editing..." title="Edit seller profile" />;
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

  return (
    <main>
      <Container size="narrow">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.productCategory}>Edit seller profile</p>
              <h2 className={styles.sectionTitle}>Update profile details</h2>
            </div>
            <p className={styles.sectionText}>
              Update your store name and bio, then save your changes.
            </p>
          </div>

          <Card>
            <form aria-busy={isSubmitting} className={styles.formGrid} noValidate onSubmit={handleSubmit}>
              <label className={styles.fieldGroup} htmlFor="storeName">
                <span className={styles.fieldLabel}>Store name</span>
                <input
                  className={styles.field}
                  disabled={isDisabled}
                  id="storeName"
                  name="storeName"
                  onChange={(event) => updateField("storeName", event.target.value)}
                  required
                  value={form.storeName}
                />
                {fieldErrors.storeName ? <p className={styles.errorMessage}>{fieldErrors.storeName}</p> : null}
              </label>

              <label className={styles.fieldGroup} htmlFor="bio">
                <span className={styles.fieldLabel}>Bio</span>
                <textarea
                  className={styles.textarea}
                  disabled={isDisabled}
                  id="bio"
                  name="bio"
                  onChange={(event) => updateField("bio", event.target.value)}
                  value={form.bio}
                />
                {fieldErrors.bio ? <p className={styles.errorMessage}>{fieldErrors.bio}</p> : null}
              </label>

              <p className={styles.hint}>Bio is optional. Max 500 characters.</p>

              {formError ? (
                <p aria-live="polite" className={styles.errorMessage} role="alert">
                  {formError}
                </p>
              ) : null}

              {savedMessage ? <p className={styles.successMessage}>{savedMessage}</p> : null}

              <div className={styles.actionRow}>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
                <Button href="/dashboard/seller-profile" variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </main>
  );
}