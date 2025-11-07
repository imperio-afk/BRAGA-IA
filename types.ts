import { ReactNode } from 'react';

export enum FunctionType {
  TEXT = 'Texto',
  IMAGE = 'Imagem',
  CODE = 'Código',
  SLIDES = 'Slides',
  PROFESSOR = 'Professor',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: ReactNode;
  // Raw content is needed for recreating the conversation from history
  rawContent?: string | object; 
}

export interface Slide {
    title: string;
    content: string[] | string;
    imageQuery: string; // Query for generating a relevant image
    imageUrl?: string; // URL of the generated image
}

export interface SlideData {
    presentationTitle: string;
    slides: Slide[];
}

// FIX: Added missing PostData interface to resolve compilation errors.
export interface PostData {
    platform: string;
    text: string;
    hashtags: string[];
    imageQuery: string;
    imageUrl?: string;
}

export interface Question {
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'open_ended';
    options?: string[];
    correctAnswer: string;
}

export interface QuizData {
    quizTitle: string;
    questions: Question[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  functionType: FunctionType;
}
