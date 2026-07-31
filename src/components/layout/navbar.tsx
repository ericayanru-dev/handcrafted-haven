"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button, Container } from "@/components/ui";
import styles from "./site-chrome.module.css";

const navigationItems = [
  { href: "/#featured", label: "Featured" },
  { href: "/#why", label: "Why Us" },
  { href: "/#next", label: "Next Steps" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  return (
    <header className={styles.header}>
      <Container className={styles.headerInner}>
        <a className={styles.brandLink} href="/" onClick={() => setMobileOpen(false)}>
          <span aria-hidden="true" className={styles.brandMark}>
            H
          </span>
          Handcrafted Haven
        </a>

        <nav className={styles.navDesktop} aria-label="Primary">
          {navigationItems.map((item) => (
            <a key={item.href} className={styles.navLink} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          <Button href="/login" size="sm" variant={isLoginPage ? "primary" : "ghost"}>
            Log in
          </Button>
          <Button href="/register" size="sm" variant={isRegisterPage ? "primary" : "secondary"}>
            Sign up
          </Button>
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className={styles.menuButton}
            onClick={() => setMobileOpen((current) => !current)}
            type="button"
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </Container>

      <Container className={mobileOpen ? styles.mobilePanelOpen : styles.mobilePanel}>
        <nav className={styles.mobileNav} aria-label="Mobile primary navigation">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              className={styles.mobileNavLink}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className={styles.mobileNavFooter}>
            <Button
              href="/login"
              fullWidth
              onClick={() => setMobileOpen(false)}
              variant={isLoginPage ? "primary" : "secondary"}
            >
              Log in
            </Button>
            <Button
              href="/register"
              fullWidth
              onClick={() => setMobileOpen(false)}
              variant={isRegisterPage ? "primary" : "secondary"}
            >
              Sign up
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}