export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: import("./product").Product[];
  outfit?: import("./product").Outfit;
  timestamp: Date;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  name: string;
  result: unknown;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  componentCode?: string;
}
