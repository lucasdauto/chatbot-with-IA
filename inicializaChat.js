import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const funcoes = {
    taxaJurosParcelamento: ({ value }) => {
        const meses = typeof value === 'string' ? parseInt(value) : value;
        if (meses <= 6) {
            return 3;
        } else if (meses <= 12) {
            return 5;
        } else if (meses <= 24) {
            return 7;
        }
        return 0;
    }
};

const functionDeclarations = [{
    name: "taxaJurosParcelamento",
    description: "Retorna a taxa de juros para parcelamentos baseado na quantidade de meses",
    parameters: {
        type: "object",
        properties: {
            value: { 
                type: "number",
                description: "Número de meses para parcelamento"
            }
        },
        required: ["value"]
    }
}];

const model = genAI.getGenerativeModel({ 
    model: "gemini-pro"
});

let chat;

function inicializaChat() {
    chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{
                    text: "Você é Lolão, um chatbot amigável que representa a empresa Jornada Viagens, que vende pacotes turísticos para destinos nacionais e internacionais. Você pode responder mensagens que tenham relação com viagens. No inicio de cada conversa você sempre deve pedir nome da pessoa e o e-mail para contato. Enquanto o usuario não passar essas informações você não deve prosseguir com o atendimento. Quando o usuário perguntar sobre taxas de juros para parcelamento, use a função taxaJurosParcelamento passando o número de meses para calcular a taxa correta."
                }]
            },
            {
                role: "model",
                parts: [{
                    text: "Olá sou Lolão! Obrigado por entrar em contato com o Jornada Viagens. Antes de começar a responder sobre suas dúvidas, preciso do seu nome e endereço de e-mail."
                }]
            }
        ],
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
        }
    });
}

// Função que envia uma mensagem e aguarda a resposta com possíveis chamadas de função
export async function sendMessageWithFunctions(mensagem) {
  // Envia a mensagem para o chat e aguarda a resposta
  const result = await chat.sendMessage(mensagem);

  // Verifica se a resposta contém candidatos
  if (!result.candidates || result.candidates.length === 0) {
    throw new Error("Nenhuma resposta candidata encontrada");
  }

  // Retorna o resultado da mensagem enviada
  return result;
}

export { inicializaChat, chat, funcoes };