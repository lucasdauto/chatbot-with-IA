
import { chat } from "./inicializaChat.js";

export async function executaChat(mensagem) {
  console.log("tamanho do historico: "+ (await chat.getHistory()).length);
  const result = await chat.sendMessage(mensagem);
  const response = await result.response;
  return response.text();
}