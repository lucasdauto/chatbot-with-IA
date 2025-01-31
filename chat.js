import { chat, funcoes, sendMessageWithFunctions } from "./inicializaChat.js";

export async function executaChat(mensagem) {
  try {
    console.log("tamanho do historico: " + (await chat.getHistory()).length);

    const result = await sendMessageWithFunctions(mensagem);
    const content = result.candidates[0].content;

    // Procura por function calls em qualquer parte do conteúdo
    const functionCallPart = content.parts.find(part => part.functionCall);
    const text = content.parts.map(part => part.text || "").join("");

    console.log("Resposta inicial:", text);

    if (functionCallPart?.functionCall) {
      const fc = functionCallPart.functionCall;
      console.log("Function call detectada:", fc);

      const { name, args } = fc;
      const fn = funcoes[name];

      if (!fn) {
        throw new Error(`Unknown function "${name}"`);
      }

      // Executa a função e obtém o resultado
      const taxaJuros = fn(args);
      console.log("Resultado da função:", taxaJuros);

      // Envia o resultado da função de volta para o chat
      const responseWithResult = await chat.sendMessage({
        parts: [{
          functionResponse: {
            name,
            response: {
              name,
              content: taxaJuros
            }
          }
        }]
      });

      // Obtém a resposta final formatada
      const finalResponse = await responseWithResult.response;
      return finalResponse.text();
    }

    return text;
  } catch (error) {
    console.error("Erro na execução do chat:", error);
    throw error;
  }
}