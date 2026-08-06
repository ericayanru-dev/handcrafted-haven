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
    text: "If anything needs your attention, we show it right in the form.",
  },
  {
    title: "Uses the same pieces",
    text: "Buttons, inputs, cards, and spacing match the rest of the site.",
  },
];

type LoginPageProps = {
  searchParams?: {
    registered?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const showRegisteredMessage = searchParams?.registered === "1";

  return (
    <main className={styles.page}>
      <Container className={styles.layout}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Login page</p>
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
              Your account was created. Check your email for verification, then sign
              in here.
            </p>
          ) : null}
          <AuthForm mode="login" />
        </div>
      </Container>
    </main>
  );
}