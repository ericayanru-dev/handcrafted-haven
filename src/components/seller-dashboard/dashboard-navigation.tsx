"use client";

import { usePathname } from "next/navigation";
import styles from "./seller-dashboard.module.css";

type DashboardLink = {
  href: string;
  label: string;
};

const links: DashboardLink[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/seller-profile", label: "Seller profile" },
  { href: "/dashboard/products", label: "My products" },
  { href: "/dashboard/products/create", label: "Add product" },
  { href: "/orders", label: "Orders" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seller dashboard navigation" className={styles.dashboardNav}>
      {links.map((link) => (
        <a
          className={isActive(pathname, link.href) ? styles.dashboardNavLinkActive : styles.dashboardNavLink}
          href={link.href}
          key={link.href}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
