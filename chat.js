import { chat, funcoes, sendMessageWithFunctions } from "./inicializaChat.js";

// Função assíncrona que executa o chat com uma mensagem fornecida
export async function executaChat(mensagem) {
  try {
    // Loga o tamanho do histórico do chat
    console.log("tamanho do historico: " + (await chat.getHistory()).length);

    // Envia a mensagem e aguarda a resposta
    const result = await sendMessageWithFunctions(mensagem);
    const content = result.candidates[0].content;

    // Procura por chamadas de função em qualquer parte do conteúdo
    const functionCallPart = content.parts.find(part => part.functionCall);
    const text = content.parts.map(part => part.text || "").join("");

    // Loga a resposta inicial do chat
    console.log("Resposta inicial:", text);

    // Se houver uma chamada de função na resposta
    if (functionCallPart?.functionCall) {
      const fc = functionCallPart.functionCall;
      // Loga a chamada de função detectada
      console.log("Function call detectada:", fc);

      const { name, args } = fc;
      const fn = funcoes[name];

      // Se a função não for encontrada, lança um erro
      if (!fn) {
        throw new Error(`Unknown function "${name}"`);
      }

      // Executa a função e obtém o resultado
      const taxaJuros = fn(args);
      // Loga o resultado da função
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

    // Retorna o texto da resposta inicial se não houver chamadas de função
    return text;
  } catch (error) {
    // Loga e lança qualquer erro encontrado durante a execução do chat
    console.error("Erro na execução do chat:", error);
    throw error;
  }
}