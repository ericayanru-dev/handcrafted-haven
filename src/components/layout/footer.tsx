import { Container } from "@/components/ui";
import styles from "./site-chrome.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.footerInner}>
        <div className={styles.footerText}>
          <p>Built by WDD 430 Group 6</p>
          <p>Frontend work for Handcrafted Haven</p>
        </div>

        <div className={styles.footerLinks}>
          <a className={styles.footerLink} href="/#featured">
            Featured
          </a>
          <a className={styles.footerLink} href="/#next">
            Roadmap
          </a>
          <a className={styles.footerLink} href="/login">
            Login
          </a>
        </div>
      </Container>
    </footer>
  );
}