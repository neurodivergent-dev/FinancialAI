
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Send, Bot, Trash2, AlertCircle, WifiOff, Key, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useApiKey } from '../context/ApiKeyContext';
import { useProfile } from '../context/ProfileContext';
import { useFinanceStore } from '../store/useFinanceStore';
import { AIChatService, ChatMessage, FinancialContext } from '../services/aiChatService';

export const ChatScreen = () => {
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const { getActiveApiKey } = useApiKey();
  const { profile } = useProfile(); // Profil verilerini al
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const aiChatServiceRef = useRef<AIChatService | null>(null);

  // Markdown stilleri
  const markdownStyles = {
    body: { color: colors.text.primary, fontSize: 15, lineHeight: 22 },
    paragraph: { marginTop: 0, marginBottom: 8 },
    strong: { fontWeight: '700', color: colors.purple.light },
    em: { fontStyle: 'italic' },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    list_item: { marginBottom: 4 },
    code_inline: {
      backgroundColor: colors.text.tertiary + '20',
      color: colors.purple.light,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    code_block: {
      backgroundColor: colors.text.tertiary + '15',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: 14,
    },
    fence: {
      backgroundColor: colors.text.tertiary + '15',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: 14,
    },
    blockquote: {
      backgroundColor: colors.text.tertiary + '10',
      borderLeftWidth: 4,
      borderLeftColor: colors.purple.light,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
    },
    heading1: { fontSize: 20, fontWeight: '800', marginBottom: 8, color: colors.text.primary },
    heading2: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: colors.text.primary },
    heading3: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: colors.text.primary },
    link: { color: colors.purple.light, textDecorationLine: 'underline' },
  };

  const {
    getTotalAssets,
    getTotalLiabilities,
    getNetWorth,
    getSafeToSpend,
    receivables,
    installments,
  } = useFinanceStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Initialize AI service with current API key
  useEffect(() => {
    const activeKey = getActiveApiKey();
    if (!aiChatServiceRef.current) {
      aiChatServiceRef.current = new AIChatService(activeKey);
    } else {
      aiChatServiceRef.current.updateApiKey(activeKey);
    }
  }, [getActiveApiKey]);

  // Auto-scroll when streaming message updates
  useEffect(() => {
    if (streamingMessage) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [streamingMessage]);

  useEffect(() => {
    // İlk karşılama mesajı
    const welcomeMsg: ChatMessage = {
      id: '0',
      role: 'assistant',
      content: `## Merhaba! 👋

Ben senin **AI finansal danışmanınım**. Finansal durumunu analiz edip sorularına yanıt verebilirim.

**Örnek Sorular:**
• "iPhone alsam sorun olur mu?"
• "Tatile ne kadar harcayabilirim?"
• "Acil durum fonu nasıl oluştururum?"

Ne öğrenmek istersin?`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMsg]);

    // Klavye listener'ları
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const buildContext = (): FinancialContext => {
    const totalReceivables = receivables.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const totalInstallments = installments.reduce(
      (sum, i) => sum + (Number(i.installmentAmount) || 0),
      0
    );

    return {
      totalAssets: getTotalAssets(),
      totalLiabilities: getTotalLiabilities(),
      netWorth: getNetWorth(),
      safeToSpend: getSafeToSpend(),
      totalReceivables,
      totalInstallments,
      currencySymbol,
      findeksScore: profile.findeksScore,
      salary: profile.salary,
      additionalIncome: profile.additionalIncome,
    };
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const context = buildContext();
      let fullResponse = '';

      await aiChatServiceRef.current!.sendMessage(userMessage.content, context, (chunk) => {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage('');
    } catch (error: any) {
      const errorMessage = parseErrorMessage(error);
      const aiErrorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const parseErrorMessage = (error: any): string => {
    const errorStr = error.message || 'Bilinmeyen hata';

    // Error type ve mesajı ayır
    if (errorStr.includes('|')) {
      const [type, message] = errorStr.split('|');

      switch (type) {
        case 'RATE_LIMIT':
          return `## ⏱️ Çok Hızlısın!\n\n${message}\n\n**İpucu:** Birkaç saniye bekledikten sonra tekrar dene.`;

        case 'QUOTA_EXCEEDED':
          return `## 📊 Kota Doldu\n\n${message}\n\n**Çözüm:**\n• Birkaç dakika bekleyin\n• Veya yeni bir API anahtarı alın\n• [Google AI Studio](https://makersuite.google.com/app/apikey)`;

        case 'SERVICE_UNAVAILABLE':
          return `## 🔧 Servis Meşgul\n\n${message}\n\n**Not:** Bu geçici bir durum, lütfen kısa bir süre sonra tekrar deneyin.`;

        case 'INVALID_API_KEY':
          return `## 🔑 API Anahtarı Hatası\n\n${message}\n\n**Çözüm:**\n• Ayarlar → API Anahtarları bölümünden kontrol edin\n• Yeni bir anahtar oluşturun: [Google AI Studio](https://makersuite.google.com/app/apikey)`;

        case 'API_ERROR':
          return `## ⚠️ Bir Sorun Oluştu\n\n${message}\n\n**Öneriler:**\n• Mesajınızı kısaltıp tekrar deneyin\n• İnternet bağlantınızı kontrol edin`;

        default:
          return `## ⚠️ Bir Hata Oluştu\n\n${message}`;
      }
    }

    // Fallback genel hata mesajı
    return `## ⚠️ Bir Hata Oluştu\n\nÜzgünüm, bir sorun yaşadım: ${errorStr}\n\n**İpucu:** Tekrar denemek ister misin?`;
  };

  const handleClearChat = () => {
    aiChatServiceRef.current?.clearHistory();
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: `## Chat Temizlendi! ✨

Yeni bir konuşma başlatalım. **Ne öğrenmek istersin?**`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Dashboard Style Gradient */}
      <View style={styles.modernHeader}>
        <LinearGradient
          colors={['#FF0080', '#7928CA', '#0070F3', '#00DFD8']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.decorativePattern}>
            <View style={styles.patternCircle1} />
            <View style={styles.patternCircle2} />
            <View style={styles.patternCircle3} />
          </View>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.botIconContainer}>
                <View style={styles.botIconInner}>
                  <Bot size={24} color="#7928CA" strokeWidth={2.5} />
                </View>
                <View style={styles.onlineBadge} />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.headerTitle}>AI Finansal Danışman</Text>
                  <Sparkles size={14} color="rgba(255, 255, 255, 0.8)" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerSubtitle}>Gemini & Groq Destekli</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleClearChat} 
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <View style={styles.clearButtonInner}>
                <Trash2 size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: 140 }]} 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              message.role === 'user'
                ? { backgroundColor: colors.purple.primary }
                : { backgroundColor: colors.cardBackground },
            ]}
          >
            {message.role === 'user' ? (
              <Text
                style={[styles.messageText, { color: '#FFFFFF' }]}
              >
                {message.content}
              </Text>
            ) : (
              <Markdown style={markdownStyles}>
                {message.content}
              </Markdown>
            )}
            <Text
              style={[ 
                styles.messageTime,
                message.role === 'user'
                  ? { color: 'rgba(255, 255, 255, 0.7)' }
                  : { color: colors.text.tertiary },
              ]}
            >
              {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {/* Streaming mesaj */}
        {streamingMessage && (
          <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.cardBackground }]}>
            <Markdown style={markdownStyles}>
              {streamingMessage}
            </Markdown>
          </View>
        )}

        {/* Loading */}
        {isLoading && !streamingMessage && (
          <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="small" color={colors.purple.primary} />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[
        styles.inputContainer,
        {
          backgroundColor: colors.cardBackground,
          paddingBottom: keyboardHeight > 0 ? 8 : insets.bottom + 4,
          ...(keyboardHeight > 0 && { bottom: keyboardHeight + 50 })
        }
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text.primary, backgroundColor: colors.background }]} 
          placeholder="Mesajını yaz..."
          placeholderTextColor={colors.text.tertiary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() && !isLoading ? colors.purple.primary : colors.text.tertiary + '40' },
          ]}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modernHeader: {
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#7928CA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -80,
    right: -60,
  },
  patternCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -50,
    left: -40,
  },
  patternCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 50,
    left: '40%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  botIconContainer: {
    position: 'relative',
  },
  botIconInner: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.2,
  },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    position: 'absolute',
    bottom: '9%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
