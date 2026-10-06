export default class ApiResponse<T = unknown> {
  readonly success: boolean;

  constructor(
    readonly data: T,
    readonly message: string,
    readonly status: number = 200
  ) {
    this.success = status < 400;
  }
}
