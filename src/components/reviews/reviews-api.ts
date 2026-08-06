import type { ProductReview, ReviewUser } from "./types";

type ReviewApiResponse = {
  success?: boolean;
  data?: {
    review?: ProductReview;
    reviews?: ProductReview[];
  };
  message?: string;
  error?: string;
};

function normalizeReview(review: ProductReview): ProductReview {
  return {
    ...review,
    rating: Math.min(5, Math.max(1, Number(review.rating) || 1)),
    comment: review.comment?.trim() ?? "",
    createdAt: review.createdAt || new Date().toISOString(),
    updatedAt: review.updatedAt || review.createdAt || new Date().toISOString(),
  };
}

function sortReviews(reviews: ProductReview[]) {
  return reviews.map(normalizeReview).sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

function toReviewErrorMessage(status: number, payload: ReviewApiResponse) {
  const rawMessage = (payload.message ?? payload.error ?? "").trim().toLowerCase();

  if (status === 401 || status === 403 || rawMessage.includes("unauthorized") || rawMessage.includes("forbidden")) {
    return "Please sign in to view and share reviews.";
  }

  if (status === 404) {
    return "Reviews are not available for this product yet.";
  }

  if (status >= 500) {
    return "We are having trouble loading reviews right now. Please try again shortly.";
  }

  if (payload.message || payload.error) {
    return payload.message ?? payload.error ?? "We could not load reviews right now.";
  }

  return "We could not load reviews right now.";
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
    throw new Error(toReviewErrorMessage(response.status, payload));
  }

  return payload;
}

export async function loadProductReviews(productId: string, initialReviews: ProductReview[]) {
  try {
    const payload = await fetchReviewEndpoint(`/api/review?productId=${encodeURIComponent(productId)}`);
    const reviews = payload.data?.reviews ?? initialReviews;
    return {
      reviews: sortReviews(reviews),
    };
  } catch (error) {
    return {
      reviews: sortReviews(initialReviews),
      message: error instanceof Error ? error.message : "Could not load latest reviews.",
    };
  }
}

export async function saveProductReview(input: {
  productId: string;
  user: ReviewUser;
  rating: number;
  comment: string;
  existingReviewId?: string;
}): Promise<{ review: ProductReview; mode: "api"; message: string }> {
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
    mode: "api",
    message: payload.message ?? "Review saved.",
  };
}

export async function deleteProductReview(input: { reviewId: string }) {
  const payload = await fetchReviewEndpoint(`/api/review/${input.reviewId}`, {
    method: "DELETE",
  });

  return {
    mode: "api" as const,
    message: payload.message ?? "Review deleted.",
  };
}