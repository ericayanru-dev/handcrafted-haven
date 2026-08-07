import type { ProductReview, ReviewFormInput, ReviewUser } from "./types";

const REVIEW_STORAGE_KEY = "handcrafted-haven-reviews-v1";
const REVIEW_API_ENABLED = process.env.NEXT_PUBLIC_ENABLE_REVIEW_API === "1";

type ReviewApiResponse = {
  success?: boolean;
  data?: {
    review?: ProductReview;
    reviews?: ProductReview[];
  };
  message?: string;
  error?: string;
};

function canUseWindow() {
  return typeof window !== "undefined";
}

function readLocalReviews(): ProductReview[] {
  if (!canUseWindow()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ProductReview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalReviews(reviews: ProductReview[]) {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
}

function normalizeReview(review: ProductReview): ProductReview {
  return {
    ...review,
    rating: Math.min(5, Math.max(1, Number(review.rating) || 1)),
    comment: review.comment?.trim() ?? "",
    createdAt: review.createdAt || new Date().toISOString(),
    updatedAt: review.updatedAt || review.createdAt || new Date().toISOString(),
  };
}

function mergeReviews(productId: string, initialReviews: ProductReview[]) {
  const localReviews = readLocalReviews().filter((review) => review.productId === productId).map(normalizeReview);
  const merged = new Map<string, ProductReview>();
  const userIndex = new Map<string, string>();

  for (const review of initialReviews.map(normalizeReview)) {
    merged.set(review.id, review);
    userIndex.set(review.userId, review.id);
  }

  for (const review of localReviews) {
    const existingId = userIndex.get(review.userId);
    if (existingId) {
      merged.delete(existingId);
    }
    merged.set(review.id, review);
    userIndex.set(review.userId, review.id);
  }

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

async function fetchReviewEndpoint(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let payload: ReviewApiResponse = {};
  try {
    payload = (await response.json()) as ReviewApiResponse;
  } catch {
    payload = {};
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? payload.error ?? `Review request failed (${response.status})`);
  }

  return payload;
}

export async function loadProductReviews(productId: string, initialReviews: ProductReview[]) {
  if (!REVIEW_API_ENABLED) {
    return {
      reviews: mergeReviews(productId, initialReviews),
      mode: "local" as const,
    };
  }

  try {
    const payload = await fetchReviewEndpoint(`/api/review?productId=${encodeURIComponent(productId)}`);
    const reviews = payload.data?.reviews ?? initialReviews;
    return {
      reviews: mergeReviews(productId, reviews),
      mode: "api" as const,
    };
  } catch {
    return {
      reviews: mergeReviews(productId, initialReviews),
      mode: "local" as const,
    };
  }
}

export async function saveProductReview(input: {
  productId: string;
  user: ReviewUser;
  rating: number;
  comment: string;
  existingReviewId?: string;
}) {
  const nextReview = normalizeReview({
    id: input.existingReviewId ?? `review-${Date.now()}`,
    productId: input.productId,
    userId: input.user.id,
    userName: input.user.name,
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (REVIEW_API_ENABLED) {
    try {
      const payload = await fetchReviewEndpoint(
        input.existingReviewId ? `/api/review/${input.existingReviewId}` : "/api/review",
        {
          method: input.existingReviewId ? "PATCH" : "POST",
          body: JSON.stringify({
            productId: input.productId,
            rating: input.rating,
            comment: input.comment,
          }),
        }
      );

      return {
        review: normalizeReview(payload.data?.review ?? nextReview),
        mode: "api" as const,
        message: payload.message ?? "Review saved.",
      };
    } catch {
      // Falls through to local mode.
    }
  }

  const localReviews = readLocalReviews().filter(
    (review) => !(review.productId === input.productId && review.userId === input.user.id)
  );
  localReviews.push(nextReview);
  writeLocalReviews(localReviews);

  return {
    review: nextReview,
    mode: "local" as const,
    message: input.existingReviewId
      ? "Review saved locally until backend review APIs are available."
      : "Review added locally until backend review APIs are available.",
  };
}

export async function deleteProductReview(input: { productId: string; reviewId: string; userId: string }) {
  if (REVIEW_API_ENABLED) {
    try {
      const payload = await fetchReviewEndpoint(`/api/review/${input.reviewId}`, {
        method: "DELETE",
      });

      return {
        mode: "api" as const,
        message: payload.message ?? "Review deleted.",
      };
    } catch {
      // Falls through to local mode.
    }
  }

  const nextReviews = readLocalReviews().filter(
    (review) => !(review.id === input.reviewId && review.userId === input.userId && review.productId === input.productId)
  );
  writeLocalReviews(nextReviews);

  return {
    mode: "local" as const,
    message: "Review deleted locally until backend review APIs are available.",
  };
}