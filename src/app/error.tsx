"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/state/error-state";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      message="An unexpected problem interrupted this page. Please retry or return to the homepage."
      onRetry={reset}
      title="Page error"
    />
  );
}