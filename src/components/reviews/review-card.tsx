import { Button, Card } from "@/components/ui";
import { RatingStars } from "./rating-stars";
import type { ProductReview } from "./types";
import styles from "./reviews.module.css";

type ReviewCardProps = {
  review: ProductReview;
  canManage: boolean;
  isBusy: boolean;
  onDelete?: (review: ProductReview) => Promise<void>;
  onEdit?: (review: ProductReview) => void;
};

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function ReviewCard({ review, canManage, isBusy, onDelete, onEdit }: ReviewCardProps) {
  return (
    <Card className={styles.reviewCard}>
      <div className={styles.reviewCardTop}>
        <div>
          <p className={styles.reviewAuthor}>{review.userName}</p>
          <p className={styles.reviewDate}>{formatReviewDate(review.updatedAt || review.createdAt)}</p>
        </div>
        <RatingStars compact label="Rating" value={review.rating} />
      </div>

      <p className={styles.reviewComment}>{review.comment}</p>

      {canManage ? (
        <div className={styles.reviewActions}>
          <Button disabled={isBusy} onClick={() => onEdit?.(review)} size="sm" variant="secondary">
            Edit review
          </Button>
          <Button disabled={isBusy} onClick={() => onDelete?.(review)} size="sm" variant="ghost">
            Delete review
          </Button>
        </div>
      ) : null}
    </Card>
  );
}