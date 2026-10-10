export type ApiEnvelope<T> = {
  data: T;
  message: string;
  success: boolean;
};
