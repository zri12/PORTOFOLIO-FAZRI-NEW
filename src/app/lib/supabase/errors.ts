export class PortfolioBackendError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PortfolioBackendError";
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected Supabase error.";
}
