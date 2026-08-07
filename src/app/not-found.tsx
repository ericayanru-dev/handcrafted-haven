import { EmptyState } from "@/components/state/empty-state";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main>
      <EmptyState
        actions={<Button href="/">Back to home</Button>}
        eyebrow="404"
        message="The page may have moved or the link could be broken. Head back to the homepage and try again."
        title="We couldn&apos;t find that page."
      />
    </main>
  );
}