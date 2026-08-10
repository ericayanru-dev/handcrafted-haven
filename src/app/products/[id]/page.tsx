"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart";
import {
  deleteProductReview,
  loadProductReviews,
  RatingStars,
  ReviewCard,
  ReviewForm,
  saveProductReview,
  type ProductReview,
  type ReviewFormInput,
} from "@/components/reviews";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import styles from "@/components/product/product-pages.module.css";
import reviewStyles from "@/components/reviews/reviews.module.css";

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
    seller?: {
      id: string;
      storeName: string;
      user?: {
        name: string;
      };
    };
    reviews?: Array<{
      id: string;
      userId: string;
      rating: number;
      comment: string;
      createdAt: string;
      updatedAt: string;
      user?: {
        id: string;
        name: string;
      };
    }>;
  };
  message?: string;
  error?: string;
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

type MeResponse = {
  success?: boolean;
  user?: SessionUser | null;
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

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart, isMutating: cartIsMutating, message: cartMessage } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<ProductDetailsResponse["data"]>(undefined);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
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
          setError(result.message ?? result.error ?? "Could not load this product.");
          return;
        }

        setProduct(result.data);
      } catch {
        if (isMounted) {
          setError("Could not load this product right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", { method: "GET" });
        const result = (await response.json()) as MeResponse;

        if (!isMounted) {
          return;
        }

        if (response.ok && result.success && result.user) {
          setSessionUser(result.user);
        } else {
          setSessionUser(null);
        }
      } catch {
        if (isMounted) {
          setSessionUser(null);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      if (!product) {
        return;
      }

      const initialReviews: ProductReview[] = (product.reviews ?? []).map((review) => ({
        id: review.id,
        productId: product.id,
        userId: review.userId,
        userName: review.user?.name ?? "Anonymous buyer",
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      }));

      const result = await loadProductReviews(product.id, initialReviews);

      if (!isMounted) {
        return;
      }

      setReviews(result.reviews);
      if (result.message) {
        setReviewError(result.message);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [product]);

  const price = useMemo(() => formatPrice(product?.price), [product?.price]);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);
  const currentUserReview = useMemo(() => {
    if (!sessionUser) {
      return null;
    }

    return reviews.find((review) => review.userId === sessionUser.id) ?? null;
  }, [reviews, sessionUser]);
  const activeReview = useMemo(() => {
    if (editingReviewId) {
      return reviews.find((review) => review.id === editingReviewId) ?? currentUserReview;
    }

    return currentUserReview;
  }, [currentUserReview, editingReviewId, reviews]);
  const cartMessageIsError = useMemo(
    () => /fail|error|could not|unable|unauthorized|forbidden/i.test(cartMessage),
    [cartMessage]
  );

  async function handleAddToCart() {
    if (!product) {
      return;
    }

    await addToCart({
      productId: product.id,
      title: product.title,
      price: Number(product.price) || 0,
      imageUrl: product.imageUrl,
      category: product.category,
      storeName: product.seller?.storeName,
      stock: product.stock,
      quantity: 1,
    });
  }

  async function handleSaveReview(input: ReviewFormInput) {
    if (!product || !sessionUser) {
      return;
    }

    setIsSavingReview(true);
    setReviewError("");
    setReviewNotice("");

    try {
      const result = await saveProductReview({
        productId: product.id,
        user: {
          id: sessionUser.id,
          name: sessionUser.name,
        },
        rating: input.rating,
        comment: input.comment,
        existingReviewId: activeReview?.id,
      });

      setReviews((current) => {
        const next = current.filter((review) => review.userId !== sessionUser.id);
        return [result.review, ...next].sort(
          (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        );
      });
      setReviewNotice(result.message);
      setEditingReviewId(null);
    } catch {
      setReviewError("Could not save your review right now.");
    } finally {
      setIsSavingReview(false);
    }
  }

  async function handleDeleteReview(review: ProductReview) {
    if (!product || !sessionUser) {
      return;
    }

    const confirmed = window.confirm("Delete your review for this product?");
    if (!confirmed) {
      return;
    }

    setIsSavingReview(true);
    setReviewError("");
    setReviewNotice("");

    try {
      const result = await deleteProductReview({
        reviewId: review.id,
      });

      setReviews((current) => current.filter((item) => item.id !== review.id));
      setReviewNotice(result.message);
      setEditingReviewId(null);
    } catch {
      setReviewError("Could not delete your review right now.");
    } finally {
      setIsSavingReview(false);
    }
  }

  if (isLoading) {
    return <Loading message="Loading product details..." title="Product details" />;
  }

  if (notFound) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.section}>
            <p className={styles.eyebrow}>Product details</p>
            <h1 className={styles.title}>Product not found</h1>
            <p className={styles.lead}>
              This product may have been removed or the link is no longer valid.
            </p>
            <div className={styles.actions}>
              <Button href="/products">Back to products</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.section}>
            <p className={styles.error}>{error || "Could not load product."}</p>
            <div className={styles.actions}>
              <Button href="/products">Back to products</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.section}>
          <div className={styles.detailLayout}>
            {product.imageUrl ? (
              <img alt={product.title} className={styles.detailImage} src={product.imageUrl} />
            ) : (
              <div aria-hidden="true" className={styles.detailImage} />
            )}

            <div className={styles.detailInfo}>
              <p className={styles.eyebrow}>{product.category}</p>
              <h1 className={styles.title}>{product.title}</h1>
              <RatingStars compact label="Average rating" value={averageRating} />
              <p className={styles.detailPrice}>{price}</p>
              <p className={styles.lead}>{product.description}</p>
              <div className={styles.detailMeta}>
                <span>{product.stock} in stock</span>
                <span>Store: {product.seller?.storeName ?? "Unknown"}</span>
                <span>Seller: {product.seller?.user?.name ?? "Unknown"}</span>
                <span>{reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
              </div>

              {cartMessage ? (
                <p className={cartMessageIsError ? styles.error : styles.success}>{cartMessage}</p>
              ) : null}

              <div className={styles.actions}>
                <Button
                  disabled={cartIsMutating || product.stock <= 0}
                  onClick={handleAddToCart}
                  type="button"
                >
                  {product.stock > 0 ? "Add to cart" : "Out of stock"}
                </Button>
                <Button href="/products" variant="secondary">
                  Back to products
                </Button>
              </div>
            </div>
          </div>

          <section className={reviewStyles.reviewSection}>
            <div className={reviewStyles.reviewHeader}>
              <div>
                <p className={reviewStyles.reviewEyebrow}>Ratings and reviews</p>
                <h2 className={reviewStyles.reviewTitle}>What buyers are saying</h2>
                <p className={reviewStyles.reviewLead}>
                  Read feedback from recent buyers and share your own experience with this product.
                </p>
              </div>

              <div className={reviewStyles.ratingSummary}>
                <span className={reviewStyles.ratingSummaryValue}>{averageRating.toFixed(1)}</span>
                <RatingStars compact label="Average" value={averageRating} />
                <span className={reviewStyles.ratingSummaryMeta}>
                  Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {reviewNotice ? <p className={reviewStyles.reviewSuccess}>{reviewNotice}</p> : null}
            {reviewError ? <p className={reviewStyles.reviewError}>{reviewError}</p> : null}

            {sessionUser ? (
              <ReviewForm existingReview={activeReview} isBusy={isSavingReview} onSave={handleSaveReview} />
            ) : (
              <p className={reviewStyles.reviewPrompt}>
                Log in to leave a review once you have tried the product.
              </p>
            )}

            {reviews.length > 0 ? (
              <div className={reviewStyles.reviewList}>
                {reviews.map((review) => (
                  <ReviewCard
                    canManage={sessionUser?.id === review.userId}
                    isBusy={isSavingReview}
                    key={review.id}
                    onDelete={handleDeleteReview}
                    onEdit={(nextReview) => setEditingReviewId(nextReview.id)}
                    review={review}
                  />
                ))}
              </div>
            ) : (
              <Card className={styles.status}>
                <p>No reviews yet. Be the first to rate this product.</p>
              </Card>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
