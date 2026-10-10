export type McpViewContext =
  | {
      type: "platform";
      id?: undefined;
    }
  | {
      type: "organization";
      id: string;
    };
