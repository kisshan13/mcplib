import type { ApiEnvelope } from "./api";

export type ExampleQuery = {
  name?: string;
};

export type ExampleResponse = {
  name: string;
  message: string;
};

export type ExampleResponseEnvelope = ApiEnvelope<ExampleResponse>;
