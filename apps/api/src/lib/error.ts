export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 500,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
