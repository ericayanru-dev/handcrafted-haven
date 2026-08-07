"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import styles from "./state.module.css";

type ToastTone = "info" | "success" | "error";

type ToastItem = {
  id: string;
  title: string;
  message: string;
  tone: ToastTone;
};

type ShowToastInput = {
  title: string;
  message: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(({ title, message, tone = "info" }: ShowToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const nextToast: ToastItem = { id, title, message, tone };

    setToasts((current) => [...current, nextToast].slice(-4));

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className={styles.toastViewport}>
        {toasts.map((toast) => (
          <div
            className={`${styles.toast} ${toast.tone === "success" ? styles.toastSuccess : toast.tone === "error" ? styles.toastError : styles.toastInfo}`}
            key={toast.id}
            role="status"
          >
            <p className={styles.toastTitle}>{toast.title}</p>
            <p className={styles.toastText}>{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}