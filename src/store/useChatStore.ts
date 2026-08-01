import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './mmkv-storage';
import { ChatMessage } from '../services/aiChatService';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => {
        // More robust duplicate check using content + role + time within same second if ID check fails
        const isDuplicate = state.messages.some(m => 
          m.id === message.id || 
          (m.content === message.content && m.role === message.role && Math.abs(m.timestamp - message.timestamp) < 1000)
        );
        
        if (isDuplicate) {
          return state;
        }
        
        return { 
          messages: [...state.messages, { ...message }].slice(-50) 
        };
      }),
      setMessages: (messages) => set({ 
        messages: messages.slice(-50) 
      }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
