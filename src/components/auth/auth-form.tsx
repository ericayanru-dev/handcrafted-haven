"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, Card, Input } from "@/components/ui";
import { loginSchema, signupSchema } from "@/back-end/lib/validation/auth-validations";
import styles from "./auth-page.module.css";

type AuthMode = "login" | "signup";

type AuthFormValues = {
  name: string;
  email: string;
  password: string;
};

type AuthFormProps = {
  mode: AuthMode;
};

type FieldErrors = Partial<Record<keyof AuthFormValues, string>>;

const defaultValues: AuthFormValues = {
  name: "",
  email: "",
  password: "",
};

const schemas = {
  login: loginSchema,
  signup: signupSchema,
} as const;

const endpoints = {
  login: "/api/auth/login",
  signup: "/api/auth/signup",
} as const;

function parseErrors(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  return "Something went wrong. Please try again.";
}

function mapValidationErrors(error: z.ZodError): FieldErrors {
  const nextErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];

    if (fieldName === "name" || fieldName === "email" || fieldName === "password") {
      nextErrors[fieldName] = issue.message;
    }
  }

  return nextErrors;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AuthFormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const schema = useMemo(() => schemas[mode], [mode]);

  function updateField(field: keyof AuthFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) {
      setFormError("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const payload = isSignup
      ? {
          name: values.name,
          email: values.email,
          password: values.password,
        }
      : {
          email: values.email,
          password: values.password,
        };

    const validation = schema.safeParse(payload);

    if (!validation.success) {
      setFieldErrors(mapValidationErrors(validation.error));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoints[mode], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setFormError(result.error ?? "Please check your details and try again.");
        return;
      }

      if (isSignup) {
        setSuccessMessage(result.message ?? "Account created successfully. Please verify your email.");
        setValues(defaultValues);
        router.push("/login?registered=1");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setFormError(parseErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <p className={styles.eyebrow}>{isSignup ? "Create your account" : "Welcome back"}</p>
        <h2 className={styles.formTitle}>{isSignup ? "Register" : "Login"}</h2>
        <p className={styles.formText}>
          {isSignup
            ? "Create your account to start shopping, selling, and managing orders."
            : "Use your email and password to sign in and continue to the marketplace."}
        </p>
      </div>

      <form aria-busy={isSubmitting} className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formFields}>
          {isSignup ? (
            <Input
              autoComplete="name"
              autoFocus
              disabled={isSubmitting}
              error={fieldErrors.name}
              label="Full name"
              name="name"
              required
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Your name"
              value={values.name}
            />
          ) : null}

          <Input
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus={!isSignup}
            disabled={isSubmitting}
            error={fieldErrors.email}
            label="Email address"
            name="email"
            inputMode="email"
            required
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={values.email}
          />

          <Input
            autoComplete={isSignup ? "new-password" : "current-password"}
            disabled={isSubmitting}
            error={fieldErrors.password}
            hint={isSignup ? "Use at least 8 characters with upper, lower, number, and symbol." : undefined}
            label="Password"
            name="password"
            required
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="••••••••"
            type="password"
            value={values.password}
          />
        </div>

        {formError ? (
          <p aria-live="polite" className={styles.error} role="alert">
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p aria-live="polite" className={styles.success} role="status">
            {successMessage}
          </p>
        ) : null}

        <Button fullWidth disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? (isSignup ? "Creating account..." : "Signing in...") : isSignup ? "Create account" : "Login"}
        </Button>
      </form>

      <div className={styles.footer}>
        <span>{isSignup ? "Already have an account?" : "Need an account?"}</span>
        <div className={styles.helperLinks}>
          {isSignup ? <a href="/login">Login</a> : <a href="/register">Register</a>}
        </div>
      </div>
    </Card>
  );
}