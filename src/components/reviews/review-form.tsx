"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { RatingStars } from "./rating-stars";
import type { ProductReview, ReviewFormInput } from "./types";
import styles from "./reviews.module.css";

type ReviewFormProps = {
  existingReview?: ProductReview | null;
  isBusy: boolean;
  onSave: (input: ReviewFormInput) => Promise<void>;
};

export function ReviewForm({ existingReview, isBusy, onSave }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setRating(existingReview?.rating ?? 5);
    setComment(existingReview?.comment ?? "");
    setError("");
  }, [existingReview?.comment, existingReview?.id, existingReview?.rating]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Please share a few words about the product.");
      return;
    }

    setError("");
    await onSave({
      rating,
      comment: comment.trim(),
    });
  }

  return (
    <Card className={styles.reviewFormCard}>
      <div>
        <p className={styles.reviewEyebrow}>{existingReview ? "Update review" : "Write a review"}</p>
        <h2 className={styles.reviewTitle}>{existingReview ? "Edit your rating" : "Share your experience"}</h2>
      </div>

      <form className={styles.reviewForm} onSubmit={handleSubmit}>
        <RatingStars label="Your rating" onChange={setRating} value={rating} />

        <label className={styles.reviewField} htmlFor="review-comment">
          <span className={styles.reviewLabel}>Comment</span>
          <textarea
            className={styles.reviewTextarea}
            disabled={isBusy}
            id="review-comment"
            onChange={(event) => setComment(event.target.value)}
            placeholder="What stood out about the quality, packaging, or overall experience?"
            value={comment}
          />
        </label>

        {error ? <p className={styles.reviewError}>{error}</p> : null}

        <div className={styles.reviewActions}>
          <Button disabled={isBusy} type="submit">
            {isBusy ? "Saving review..." : existingReview ? "Save review" : "Post review"}
          </Button>
        </div>
      </form>
    </Card>
  );
}