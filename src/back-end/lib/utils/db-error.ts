/**
 * Detect database connectivity / availability failures
 */
export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    code?: string;
    name?: string;
    message?: string;
    clientVersion?: string;
  };

  const dbCodes = new Set([
    "P1000", // Authentication failed against database server
    "P1001", // Can't reach database server
    "P1002", // Database server reached but timed out
    "P1008", // Operations timed out
    "P1017", // Server has closed the connection
    "P2024", // Timed out fetching a new connection from the pool
  ]);

  if (err.code && dbCodes.has(err.code)) {
    return true;
  }

  const message = (err.message || "").toLowerCase();

  return (
    message.includes("can't reach database server") ||
    message.includes("connection refused") ||
    message.includes("connection timed out") ||
    message.includes("server has closed the connection") ||
    message.includes("too many connections") ||
    message.includes("the database system is starting up")
  );
}

export function databaseErrorResponse() {
  return {
    success: false as const,
    message: "Service temporarily unavailable. Please try again shortly.",
    status: 503 as const,
  };
}
