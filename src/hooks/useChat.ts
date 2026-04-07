import { useState } from "react";
import { ChatMessage } from "../models/chat.types";
import { sendToChat } from "../api/chatService";


export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);

    try {
      const res = await sendToChat(text);

      const botMsg: ChatMessage = { sender: "bot", text: res };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: " Lỗi gọi API" },
      ]);
    }

    setLoading(false);
  };

  return { messages, sendMessage, loading };
};