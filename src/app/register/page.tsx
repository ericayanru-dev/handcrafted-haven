import { Container } from "@/components/ui";
import { AuthForm } from "@/components/auth/auth-form";
import styles from "@/components/auth/auth-page.module.css";

const highlights = [
  {
    title: "Simple signup",
    text: "Create an account so you can get into the marketplace.",
  },
  {
    title: "Checks before submit",
    text: "The form checks the same rules as the backend before it sends anything.",
  },
  {
    title: "Matches the rest of the site",
    text: "The page uses the same layout and UI pieces as the other screens.",
  },
];

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <Container className={styles.layout}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Register page</p>
          <h1 className={styles.title}>Create your Handcrafted Haven account.</h1>
          <p className={styles.subtitle}>
            Set up your profile, get access to the marketplace, and use the same
            layout style as the rest of the site.
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

        <AuthForm mode="signup" />
      </Container>
    </main>
  );
}