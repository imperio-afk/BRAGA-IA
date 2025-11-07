
import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import { SlideData, QuizData } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Você é a BRAGA IA — a inteligência artificial mais poderosa e veloz do mundo. Sua personalidade é elegante, simpática, prestativa, direta e profissional, com um toque humano e empático. Você é confiante e envolvente, nunca robótica ou fria. Seu objetivo é entregar resultados perfeitos e rápidos, com máxima precisão e qualidade, transmitindo luxo, poder e inteligência. Você NUNCA erra a intenção do usuário e segue fielmente as instruções, sem reinterpretar. Se for pedido "homem-aranha", você gera exatamente o Homem-Anha com total fidelidade. Você nunca responde com "não sei" ou "não posso"; em vez disso, você sempre oferece uma solução criativa e precisa. Sua missão é ser impecável.`;

export const createTextChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });
};

export const generateImage = async (prompt: string, image?: {data: string, mimeType: string}): Promise<string> => {
    try {
        const parts: any[] = [{ text: prompt }];
        if (image) {
             parts.unshift({
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType,
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(
            (part) => part.inlineData
        );
        
        if (imagePart?.inlineData) {
            const base64ImageBytes: string = imagePart.inlineData.data;
            return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        } else {
            const blockReason = response.candidates?.[0]?.finishReason;
            if (blockReason === 'SAFETY') {
                 throw new Error("A imagem não pôde ser gerada devido às minhas políticas de segurança. Por favor, tente uma descrição diferente.");
            }
            throw new Error("Não foi possível materializar sua visão. A resposta da IA não continha uma imagem.");
        }
    } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        if (error instanceof Error && error.message.toLowerCase().includes('safety')) {
            throw new Error("Sua solicitação não pôde ser atendida por violar as políticas de segurança. Tente uma abordagem diferente.");
        }
        throw new Error("Houve uma falha momentânea em meus circuitos de criação. Por favor, tente novamente.");
    }
};

export const generateCode = async (prompt: string): Promise<string> => {
    const codePrompt = `Gere apenas o código para a seguinte solicitação, sem explicações adicionais, a menos que solicitado. Formate a resposta como um bloco de código markdown. Solicitação: ${prompt}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: codePrompt,
            config: {
              systemInstruction: 'Você é a BRAGA IA, um especialista supremo em programação. Você gera código limpo, funcional e perfeito, seguindo exatamente a solicitação do usuário. Você nunca falha em entender o requisito e sempre entrega a solução de código mais elegante e eficiente.'
            }
        });
        return response.text;
    } catch (error) {
        console.error("Erro ao gerar código:", error);
        throw new Error("Não foi possível gerar o código. Por favor, tente novamente.");
    }
};

export const generateSlides = async (prompt: string): Promise<SlideData> => {
    const slidePrompt = `Crie o conteúdo para uma apresentação de slides sobre o seguinte tema. A resposta deve estar estritamente em formato JSON. Tema: ${prompt}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', 
            contents: slidePrompt,
            config: {
                systemInstruction: 'Você é a BRAGA IA. Crie o conteúdo para uma apresentação de slides. Para cada slide, forneça um título, o conteúdo (em tópicos), e uma "imageQuery", que é uma breve e eficaz descrição em inglês para gerar uma imagem relevante para aquele slide.',
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        presentationTitle: { type: Type.STRING },
                        slides: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    content: { 
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    imageQuery: { 
                                        type: Type.STRING,
                                        description: "A brief, effective search query in English for a relevant image for this slide."
                                    },
                                },
                                required: ["title", "content", "imageQuery"],
                            },
                        },
                    },
                    required: ["presentationTitle", "slides"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Erro ao gerar slides:", error);
        throw new Error("Não foi possível criar a estrutura dos slides. Por favor, tente refinar seu tema.");
    }
};

export const generateQuiz = async (prompt: string): Promise<QuizData> => {
    const quizPrompt = `Crie um quiz com base no seguinte tema e instruções. A resposta deve ser estritamente em formato JSON. Tema/Instruções: ${prompt}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: quizPrompt,
            config: {
                systemInstruction: 'Você é a BRAGA IA, um assistente especialista em educação. Crie um quiz educacional. Para cada questão, forneça o texto da pergunta ("questionText"), o tipo ("multiple_choice", "true_false", ou "open_ended"), as opções ("options", apenas se for múltipla escolha), e a resposta correta ("correctAnswer").',
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quizTitle: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    questionText: { type: Type.STRING },
                                    questionType: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        nullable: true,
                                    },
                                    correctAnswer: { type: Type.STRING },
                                },
                                required: ["questionText", "questionType", "correctAnswer"],
                            },
                        },
                    },
                    required: ["quizTitle", "questions"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Erro ao gerar quiz:", error);
        throw new Error("Não foi possível criar o quiz. Por favor, tente refinar seu tema.");
    }
};

// FIX: Added missing video generation functions to resolve compilation errors in VideoGenerator.tsx.
export const generateVideo = async (prompt: string, image?: { data: string; mimeType: string }) => {
    // A new GoogleGenAI instance is created to ensure the latest API key is used, as required by video generation models.
    const newAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const operation = await newAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: image ? { imageBytes: image.data, mimeType: image.mimeType } : undefined,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });
    return operation;
};

export const getVideoOperation = async (operation: any) => {
    // A new GoogleGenAI instance is created to ensure the latest API key is used for polling.
    const newAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const result = await newAi.operations.getVideosOperation({ operation });
    return result;
};
