import { Container } from "@/components/ui";
import styles from "./site-chrome.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.footerInner}>
        <div className={styles.footerText}>
          <p>Handcrafted Haven</p>
          <p>Discover handcrafted goods from trusted makers.</p>
        </div>

        <div className={styles.footerLinks}>
          <a className={styles.footerLink} href="/products">
            Browse Products
          </a>
          <a className={styles.footerLink} href="/dashboard/seller-profile/create">
            Start Selling
          </a>
          <a className={styles.footerLink} href="/register">
            Create Account
          </a>
        </div>
      </Container>
    </footer>
  );
}