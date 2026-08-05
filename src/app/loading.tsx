"use client";

import { useEffect, useState } from "react";
import { Loading } from "@/components/state/loading";

const LOADING_DELAY_MS = 500;

export default function LoadingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, LOADING_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return <Loading />;
}