"use client";

import { useState } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Container } from "@/components/ui";
import styles from "./site-chrome.module.css";

const navigationItems = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/#featured", label: "Featured" },
  { href: "/#why", label: "Why Us" },
  { href: "/#next", label: "Next Steps" },
];

function isActivePath(pathname: string, href: string) {
  if (href.startsWith("/#")) {
    return pathname === "/";
  }

  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

type MeResponse = {
  success?: boolean;
  user?: SessionUser;
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authActionError, setAuthActionError] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  function closeMenuOnSmallScreens() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches) {
      setMobileOpen(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      setIsCheckingAuth(true);

      try {
        const response = await fetch("/api/auth/me", { method: "GET" });
        const result = (await response.json()) as MeResponse;

        if (!isMounted) {
          return;
        }

        if (response.ok && result.success && result.user) {
          setSessionUser(result.user);
        } else {
          setSessionUser(null);
        }
      } catch {
        if (isMounted) {
          setSessionUser(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  async function handleLogout() {
    setAuthActionError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setAuthActionError("Could not log out. Please try again.");
        return;
      }

      setSessionUser(null);
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      setAuthActionError("Could not log out. Please try again.");
    }
  }

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
            <a
              key={item.href}
              className={isActivePath(pathname, item.href) ? styles.navLinkActive : styles.navLink}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          <Button href="/cart" size="sm" variant="secondary">
            Cart
          </Button>
          {!isCheckingAuth && sessionUser ? (
            <>
              <Button href="/dashboard" size="sm" variant="secondary">
                Dashboard
              </Button>
              <Button onClick={handleLogout} size="sm" variant="secondary">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button href="/login" size="sm" variant={isLoginPage ? "primary" : "ghost"}>
                Log in
              </Button>
              <Button href="/register" size="sm" variant={isRegisterPage ? "primary" : "secondary"}>
                Sign up
              </Button>
            </>
          )}
          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className={mobileOpen ? `${styles.menuButton} ${styles.menuButtonVisible}` : styles.menuButton}
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
              className={isActivePath(pathname, item.href) ? styles.mobileNavLinkActive : styles.mobileNavLink}
              href={item.href}
              onClick={closeMenuOnSmallScreens}
            >
              {item.label}
            </a>
          ))}
          <div className={styles.mobileNavFooter}>
            <Button href="/cart" fullWidth onClick={closeMenuOnSmallScreens} variant="secondary">
              Cart
            </Button>
            {!isCheckingAuth && sessionUser ? (
              <>
                <Button href="/dashboard" fullWidth onClick={closeMenuOnSmallScreens} variant="secondary">
                  Dashboard
                </Button>
                <Button fullWidth onClick={handleLogout} variant="secondary">
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  href="/login"
                  fullWidth
                  onClick={closeMenuOnSmallScreens}
                  variant={isLoginPage ? "primary" : "secondary"}
                >
                  Log in
                </Button>
                <Button
                  href="/register"
                  fullWidth
                  onClick={closeMenuOnSmallScreens}
                  variant={isRegisterPage ? "primary" : "secondary"}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
          {authActionError ? <p className={styles.navError}>{authActionError}</p> : null}
        </nav>
      </Container>
    </header>
  );
}