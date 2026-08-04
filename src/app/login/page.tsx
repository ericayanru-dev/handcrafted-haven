import { Container } from "@/components/ui";
import { AuthForm } from "@/components/auth/auth-form";
import styles from "@/components/auth/auth-page.module.css";

const highlights = [
  {
    title: "Quick sign in",
    text: "Sign in with the same form the rest of the site uses.",
  },
  {
    title: "Inline errors",
    text: "Validation and backend errors show up right in the form.",
  },
  {
    title: "Familiar layout",
    text: "Buttons, inputs, cards, and spacing feel consistent with the rest of the site.",
  },
];

type LoginPageProps = {
  searchParams?: Promise<{
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const showRegisteredMessage = resolvedSearchParams?.registered === "1";

  return (
    <main className={styles.page}>
      <Container className={styles.layout}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Welcome back</p>
          <h1 className={styles.title}>Sign back in to Handcrafted Haven.</h1>
          <p className={styles.subtitle}>
            Sign in to keep browsing, manage products, or pick up where you left off.
          </p>

          <div className={styles.highlights}>
            {highlights.map((item) => (
              <article className={styles.highlight} key={item.title}>
                <p className={styles.highlightTitle}>{item.title}</p>
                <p className={styles.highlightText}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.formCard}>
          {showRegisteredMessage ? (
            <p className={styles.success}>
              Your account was created. Check your email for verification, then sign in here.
            </p>
          ) : null}
          <AuthForm mode="login" />
        </div>
      </Container>
    </main>
  );
}