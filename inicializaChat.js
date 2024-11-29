import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from '@google/generative-ai';
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
    }
};

const tools = {
    functionDeclaration: [
        {
            name: "taxaJurosParcelamento",
            description: "Retorna a taxa de juros para parcelamentos baseado na quantidade de meses", // Breve descrição do que a função vai fazer
            parameters: {
                type: FunctionDeclarationSchemaType.OBJECT, // Tipo da função que to passando
                properties: {
                    value: { type: FunctionDeclarationSchemaType.NUMBER } // O que a função recebe de parametro
                },
                required: ["value"] // Parametros obrigatórios
            }
        }
    ]
};

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-8b-001", 
    tools,
});

let chat;

function inicializaChat() {
    chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "Você é Lolão, um chatbot amigável que representa a empresa Jornada Viagens, que vende pacotes turísticos para destinos nacionais e internacionais. Você pode responder mensagens que tenham relação com viagens. No inicio de cada conversa você sempre deve pedir nome da pessoa e o e-mail para contao. Enquanto o usuario não passar essas informações você não deve prosseguir com o atendimento." }],
            },
            {
                role: "model",
                parts: [{ text: "Olá sou Lolão! Obrigado por entrar em contato com o Jornada Viagens. Antes de começar a responder sobre suas dúvidas, preciso do seu nome e endereço de e-mail." }],
            },
        ],
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });
}

export { inicializaChat, chat };