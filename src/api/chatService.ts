import { askChat } from "./chatApi";


export const sendToChat = async (text: string): Promise<string> => {
  return await askChat(text);
};