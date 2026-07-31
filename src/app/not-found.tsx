import { Button, Card, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <main>
      <Container size="narrow">
        <Card>
          <p style={{ color: "var(--accent)", fontWeight: 700, marginBottom: "0.5rem" }}>
            404
          </p>
          <h1 style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading), sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, marginBottom: "0.75rem" }}>
            We couldn&apos;t find that page.
          </h1>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            The page may have moved or the link could be broken. Head back to the
            homepage and try again.
          </p>
          <Button href="/">Back to home</Button>
        </Card>
      </Container>
    </main>
  );
}