export type Sender = "user" | "bot";

export interface ChatMessage {
  sender: Sender;
  text: string;
}