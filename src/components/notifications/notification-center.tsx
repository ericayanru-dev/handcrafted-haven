"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./notification-center.module.css";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationApiResponse = {
  success?: boolean;
  data?: {
    notifications?: NotificationItem[];
    unreadCount?: number;
  };
  message?: string;
  error?: string;
};

type NotificationCenterProps = {
  isAuthenticated: boolean;
};

const readEndpointCandidates = [
  "/api/notification/get-notifications",
  "/api/notifications",
] as const;

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeNotifications(items: NotificationItem[] | undefined) {
  if (!items) {
    return [];
  }

  return items
    .map((item) => ({
      ...item,
      title: item.title?.trim() || "Notification",
      message: item.message?.trim() || "",
      createdAt: item.createdAt || new Date().toISOString(),
      read: Boolean(item.read),
    }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

async function loadFromApi() {
  for (const endpoint of readEndpointCandidates) {
    try {
      const response = await fetch(endpoint, { method: "GET" });
      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as NotificationApiResponse;
      if (!payload.success) {
        continue;
      }

      const notifications = normalizeNotifications(payload.data?.notifications);
      const unreadCount =
        typeof payload.data?.unreadCount === "number"
          ? payload.data.unreadCount
          : notifications.filter((item) => !item.read).length;

      return {
        notifications,
        unreadCount,
      };
    } catch {
      continue;
    }
  }

  throw new Error("Could not load notifications from the API.");
}

export function NotificationCenter({ isAuthenticated }: NotificationCenterProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const snapshot = await loadFromApi();
      setNotifications(snapshot.notifications);
    } catch {
      setNotifications([]);
      setErrorMessage("Notifications are not available right now.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleOutside(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (rootRef.current && !rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const markOneAsRead = useCallback(async (id: string) => {
    setIsMutating(true);

    try {
      await fetch(`/api/notification/mark-read/${encodeURIComponent(id)}`, {
        method: "PATCH",
      });
    } catch {
      // Keep optimistic UI even when endpoint is not available yet.
    } finally {
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setIsMutating(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (notifications.length === 0 || unreadCount === 0) {
      return;
    }

    setIsMutating(true);

    try {
      await fetch("/api/notification/mark-all-read", { method: "PATCH" });
    } catch {
      // Keep optimistic UI even when endpoint is not available yet.
    } finally {
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setIsMutating(false);
    }
  }, [notifications.length, unreadCount]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : "Open notifications"}
        className={styles.trigger}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className={styles.bell}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 4a5.5 5.5 0 0 0-5.5 5.5v3.06c0 .65-.23 1.28-.66 1.76L4.8 15.5a1 1 0 0 0 .75 1.67h12.9a1 1 0 0 0 .75-1.67l-1.03-1.18a2.67 2.67 0 0 1-.67-1.76V9.5A5.5 5.5 0 0 0 12 4Zm0 17a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 21Z"
              fill="currentColor"
            />
          </svg>
        </span>
        {unreadCount > 0 ? (
          <span aria-label={`${unreadCount} unread notifications`} className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <section aria-label="Notifications" className={styles.panel} role="dialog">
          <header className={styles.header}>
            <div>
              <h2 className={styles.headerTitle}>Notifications</h2>
              <p className={styles.headerMeta}>
                {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
              </p>
            </div>
            <button
              className={styles.markRead}
              disabled={isMutating || unreadCount === 0}
              onClick={markAllAsRead}
              type="button"
            >
              Mark all read
            </button>
          </header>

          <div className={styles.list}>
            {isLoading ? <p className={styles.loading}>Loading notifications...</p> : null}
            {!isLoading && errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

            {!isLoading && !errorMessage && notifications.length === 0 ? (
              <p className={styles.empty}>No notifications yet.</p>
            ) : null}

            {!isLoading && !errorMessage
              ? notifications.map((item) => (
                  <article className={item.read ? styles.item : styles.itemUnread} key={item.id}>
                    <div className={styles.itemTop}>
                      <p className={styles.itemTitle}>{item.title}</p>
                      <time className={styles.itemDate} dateTime={item.createdAt}>
                        {formatWhen(item.createdAt)}
                      </time>
                    </div>
                    <p className={styles.itemText}>{item.message}</p>
                    {!item.read ? (
                      <div className={styles.itemActions}>
                        <button
                          className={styles.itemAction}
                          disabled={isMutating}
                          onClick={() => markOneAsRead(item.id)}
                          type="button"
                        >
                          Mark read
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))
              : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
