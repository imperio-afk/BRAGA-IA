import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { Chat } from '@google/genai';
import { FunctionType, ChatMessage, Conversation, SlideData, QuizData } from './types';
import { createTextChat, generateImage, generateCode, generateSlides, generateQuiz } from './services/geminiService';
import { Header } from './components/Header';
import { FunctionSelector } from './components/FunctionSelector';
import { ChatInterface } from './components/ChatInterface';
import { PromptInput } from './components/PromptInput';
import { SlidesGenerator } from './components/SlidesGenerator';
import { QuizViewer } from './components/QuizViewer';
import { HistorySidebar } from './components/HistorySidebar';
import { SparklesIcon } from './components/icons/SparklesIcon';

const WelcomeMessage: React.FC = () => (
    <div>
        <h2 className="flex items-center text-lg font-bold text-amber-400 mb-2">
            <SparklesIcon className="w-5 h-5 mr-2" />
            <span>Olá! 👋 Sou a BRAGA IA, sua inteligência suprema.</span>
        </h2>
        <p className="text-gray-300">
            Selecione uma função ou inicie um novo chat. Suas conversas serão salvas automaticamente no histórico.
        </p>
    </div>
);

const initialWelcomeMessage: ChatMessage = { role: 'model', content: <WelcomeMessage /> };

function App() {
  const [history, setHistory] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const textChat = useRef<Chat | null>(null);
  
  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('braga-ia-history');
      if (savedHistory) {
        // We need to re-render React components from raw content
        const parsedHistory: Conversation[] = JSON.parse(savedHistory).map((conv: Conversation) => ({
          ...conv,
          messages: conv.messages.map(rehydrateMessageContent)
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      // Store raw content for serialization
      const serializableHistory = history.map(conv => ({
        ...conv,
        messages: conv.messages.map(dehydrateMessageContent)
      }));
      localStorage.setItem('braga-ia-history', JSON.stringify(serializableHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
  }, [history]);

  const currentConversation = history.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages ?? [initialWelcomeMessage];
  const selectedFunction = currentConversation?.functionType ?? FunctionType.TEXT;
  
  const rehydrateMessageContent = (msg: ChatMessage): ChatMessage => {
      if (!msg.rawContent) return msg;

      let content: React.ReactNode;
      const raw = msg.rawContent;

      if (typeof raw === 'string') {
        if (raw.startsWith('data:image')) {
            content = <img src={raw} alt="Generated content" className="rounded-lg max-w-full h-auto chat-message-container" />;
        } else {
            content = processResponseContent(raw);
        }
      } else if (typeof raw === 'object' && raw !== null) {
          if ('presentationTitle' in raw) {
              content = <SlidesGenerator data={raw as SlideData} />;
          } else if ('quizTitle' in raw) {
              content = <QuizViewer data={raw as QuizData} />;
          } else {
              content = JSON.stringify(raw);
          }
      } else {
        content = msg.content; // Fallback
      }
      return { ...msg, content };
  };

  const dehydrateMessageContent = (msg: ChatMessage): ChatMessage => {
    // Keep rawContent if it exists, otherwise remove content for serialization
    // FIX: Add 'content' property to satisfy ChatMessage interface.
    // The actual content is not serializable and will be rehydrated from rawContent.
    return {
        role: msg.role,
        content: null,
        rawContent: msg.rawContent,
    };
  };

  const handleNewChat = (type: FunctionType) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Novo Chat ${type}`,
      messages: [initialWelcomeMessage],
      functionType: type,
    };
    setHistory(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };
  
  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setHistory(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const processResponseContent = (content: string) => {
      const htmlContent = marked.parse(content, { gfm: true, breaks: true });
      return <div className="chat-message-container" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  const updateConversationMessages = (id: string, newMessages: ChatMessage[]) => {
      setHistory(prev => prev.map(c => c.id === id ? { ...c, messages: newMessages } : c));
  };
  
  const updateConversationTitle = (id: string, title: string) => {
     setHistory(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  }

  const handleSubmit = useCallback(async (prompt: string, image?: {data: string, mimeType: string}) => {
    if (!prompt.trim() && !image) return;
    setIsLoading(true);

    let conversationToUpdateId = currentConversationId;
    let isNewConversation = false;

    // Create a new conversation if one isn't active
    if (!conversationToUpdateId) {
        isNewConversation = true;
        const newConv: Conversation = {
            id: Date.now().toString(),
            title: prompt.substring(0, 40) + "...",
            messages: [], // Will be populated next
            functionType: selectedFunction,
        };
        setHistory(prev => [newConv, ...prev]);
        conversationToUpdateId = newConv.id;
        setCurrentConversationId(newConv.id);
    }

    const userMessageContent = (
      <div className="flex flex-col gap-2">
        {image && <img src={`data:${image.mimeType};base64,${image.data}`} alt="User upload" className="rounded-lg max-w-[200px] h-auto" />}
        {prompt && <p>{prompt}</p>}
      </div>
    );
    const userMessage: ChatMessage = { role: 'user', content: userMessageContent, rawContent: prompt };
    
    // Add user message to the conversation
    const initialMessages = isNewConversation ? [] : (history.find(c => c.id === conversationToUpdateId)?.messages ?? []);
    const updatedMessages = [...initialMessages, userMessage];
    updateConversationMessages(conversationToUpdateId!, updatedMessages);

    // If it's a new conversation, set a proper title
    if (isNewConversation) {
      updateConversationTitle(conversationToUpdateId!, prompt.substring(0, 40) + "...");
    }

    try {
      let responseContent: React.ReactNode;
      let rawResponseContent: string | object;

      if (selectedFunction === FunctionType.IMAGE) {
        const imageUrl = await generateImage(prompt, image);
        responseContent = <img src={imageUrl} alt={prompt} className="rounded-lg max-w-full h-auto chat-message-container" />;
        rawResponseContent = imageUrl;
      } else if (selectedFunction === FunctionType.CODE) {
        const code = await generateCode(prompt);
        responseContent = processResponseContent(code);
        rawResponseContent = code;
      } else if (selectedFunction === FunctionType.SLIDES) {
        const slideData = await generateSlides(prompt);
        responseContent = <SlidesGenerator data={slideData} />;
        rawResponseContent = slideData;
      } else if (selectedFunction === FunctionType.PROFESSOR) {
        const quizData = await generateQuiz(prompt);
        responseContent = <QuizViewer data={quizData} />;
        rawResponseContent = quizData;
      } else { // TEXT
        if (!textChat.current) textChat.current = createTextChat();
        const response = await textChat.current.sendMessage({ message: prompt });
        responseContent = processResponseContent(response.text);
        rawResponseContent = response.text;
      }
      
      const modelMessage: ChatMessage = { role: 'model', content: responseContent, rawContent: rawResponseContent };
      updateConversationMessages(conversationToUpdateId!, [...updatedMessages, modelMessage]);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        const errorResponseMessage: ChatMessage = { role: 'model', content: `Desculpe, ocorreu um erro: ${errorMessage}`, rawContent: errorMessage };
        updateConversationMessages(conversationToUpdateId!, [...updatedMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, selectedFunction, history]);

  const getPlaceholder = () => {
    switch(selectedFunction) {
        case FunctionType.IMAGE: return "Descreva a imagem que você deseja criar...";
        case FunctionType.CODE: return "Descreva o código ou script que você precisa...";
        case FunctionType.SLIDES: return "Qual o tema da sua apresentação de slides?";
        case FunctionType.PROFESSOR: return "Descreva a prova que você quer criar...";
        case FunctionType.TEXT: default: return "Digite sua mensagem para a BRAGA IA...";
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans overflow-hidden">
        <div className="flex h-full">
            <HistorySidebar 
                isOpen={isSidebarOpen}
                history={history}
                currentId={currentConversationId}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
                onNewChat={handleNewChat}
            />
            <div className="flex flex-col flex-grow h-full">
                <Header onToggleHistory={() => setIsSidebarOpen(!isSidebarOpen)} />
                <FunctionSelector selected={selectedFunction} onSelect={handleNewChat} />
                <ChatInterface messages={messages} isLoading={isLoading} />
                <PromptInput onSubmit={handleSubmit} isLoading={isLoading} placeholder={getPlaceholder()} />
            </div>
        </div>
    </div>
  );
}

export default App;
