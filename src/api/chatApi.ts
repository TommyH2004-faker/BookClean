import { endpointBE } from "../layouts/utils/Constant";

export const askChat = async (question: string): Promise<string> => {
  const res = await fetch(`${endpointBE}/chat/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) throw new Error("API error");

  const data = await res.json();

  return data.answer; 
};