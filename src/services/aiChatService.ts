import { AI_CONFIG } from '../config/ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FinancialContext {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  safeToSpend: number;
  totalReceivables: number;
  totalInstallments: number;
  currencySymbol: string;
  findeksScore?: number;
  salary?: number;
  additionalIncome?: number;
}

export class AIChatService {
  private apiKey: string;
  private endpoint: string;
  private conversationHistory: ChatMessage[] = [];

  constructor(customApiKey?: string) {
    this.apiKey = customApiKey || AI_CONFIG.gemini.apiKey;
    this.endpoint = AI_CONFIG.gemini.endpoint;
  }

  updateApiKey(newApiKey: string) {
    this.apiKey = newApiKey;
  }

  private buildSystemPrompt(context: FinancialContext): string {
    const isTr = context.language === 'Türkçe';
    
    const labels = {
      personalInfo: isTr ? 'KİŞİSEL BİLGİLER:' : 'PERSONAL INFORMATION:',
      findeks: isTr ? 'Findeks Puanı:' : 'Findeks Score:',
      salary: isTr ? 'Aylık Maaş:' : 'Monthly Salary:',
      additionalIncome: isTr ? 'Ek Gelir:' : 'Additional Income:',
      role: isTr ? 'Sen finansal danışmansın. Kısa ve net tavsiyelerde bulun.' : 'You are a financial advisor. Provide short and clear advice.',
      status: isTr ? 'FİNANSAL DURUM:' : 'FINANCIAL STATUS:',
      assets: isTr ? 'Varlık' : 'Assets',
      liabilities: isTr ? 'Borç' : 'Liabilities',
      netWorth: isTr ? 'Net' : 'Net',
      safeLimit: isTr ? 'Güvenli Limit' : 'Safe Limit',
      receivables: isTr ? 'Alacak' : 'Receivables',
      installments: isTr ? 'Taksit' : 'Installments',
      rules: isTr ? 'KURALLAR:' : 'RULES:',
      rulesList: isTr 
        ? `- Türkçe, samimi, max 100 kelime\n- Rakamlarla örnekle\n- Risk varsa söyle\n- Net cevap ver`
        : `- English, friendly, max 100 words\n- Example with numbers\n- Mention if there is a risk\n- Give clear answers`,
      format: isTr ? 'FORMAT:' : 'FORMAT:',
      formatList: isTr
        ? `- Yanıtlarını Markdown formatında yaz\n- Önemli bilgileri **kalın** yap\n- Listeler için • veya 1. 2. 3. kullan\n- Başlıklar için ## kullan\n- Kod veya hesaplamalar için \`backtick\` kullan`
        : `- Write your responses in Markdown format\n- Make important information **bold**\n- Use • or 1. 2. 3. for lists\n- Use ## for headers\n- Use \`backtick\` for code or calculations`
    };

    const personalInfo =
      context.findeksScore || context.salary || context.additionalIncome
        ? `
${labels.personalInfo}
${context.findeksScore ? `${labels.findeks} ${context.findeksScore}` : ''}
${context.salary ? `${labels.salary} ${context.currencySymbol}${context.salary.toFixed(0)}` : ''}
${context.additionalIncome ? `${labels.additionalIncome} ${context.currencySymbol}${context.additionalIncome.toFixed(0)}` : ''}
`
        : '';

    return `${labels.role}

${labels.status}
${labels.assets}: ${context.currencySymbol}${context.totalAssets.toFixed(0)} | ${labels.liabilities}: ${context.currencySymbol}${context.totalLiabilities.toFixed(0)} | ${labels.netWorth}: ${context.currencySymbol}${context.netWorth.toFixed(0)}
${labels.safeLimit}: ${context.currencySymbol}${context.safeToSpend.toFixed(0)} | ${labels.receivables}: ${context.currencySymbol}${context.totalReceivables.toFixed(0)} | ${labels.installments}: ${context.currencySymbol}${context.totalInstallments.toFixed(0)}
${personalInfo}
${labels.rules}
${labels.rulesList}

${labels.format}
${labels.formatList}`;
  }

  async sendMessage(
    userMessage: string,
    context: FinancialContext,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('CONFIG_ERROR');
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    this.conversationHistory.push(userMsg);

    // Prepare content to be sent to Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: this.buildSystemPrompt(context) }],
      },
      ...this.conversationHistory.slice(-4).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    const modelsToTry = [AI_CONFIG.gemini.model, ...(AI_CONFIG.gemini.fallbackModels || [])];

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];

      try {
        // Streaming doesn't work in React Native, use normal endpoint
        const url = `${this.endpoint}/models/${model}:generateContent?key=${this.apiKey}`;

        const requestBody = {
          contents,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);

          // Catch quota and rate limit errors
          if (response.status === 429) {
            throw new Error('RATE_LIMIT|Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin.');
          }

          if (errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('quota')) {
            throw new Error('QUOTA_EXCEEDED|API kotanız doldu. Lütfen daha sonra tekrar deneyin veya API anahtarınızı kontrol edin.');
          }

          if (response.status === 503 || errorText.includes('overloaded')) {
            throw new Error('SERVICE_UNAVAILABLE|Servis şu anda meşgul. Lütfen birkaç saniye bekleyip tekrar deneyin.');
          }

          if (response.status === 400 && errorText.includes('API_KEY')) {
            throw new Error('INVALID_API_KEY|API anahtarınız geçersiz. Lütfen ayarlardan kontrol edin.');
          }

          throw new Error(`API_ERROR|Bir hata oluştu (${response.status}). Lütfen tekrar deneyin.`);
        }

        // We are using non-streaming endpoint, get JSON directly
        const data = await response.json();

        if (!data.candidates || !data.candidates[0]) {
          console.error('Unexpected API response:', JSON.stringify(data, null, 2));
          throw new Error('API yanıtı beklenmeyen formatta');
        }

        const candidate = data.candidates[0];
        const finishReason = candidate.finishReason || 'STOP';

        // If response is not STOP (MAX_TOKENS, SAFETY etc.), fallback/error without showing partial content
        if (finishReason !== 'STOP') {
          console.warn('Finish reason:', finishReason, 'Prompt feedback:', data?.promptFeedback);
          const blockReason =
            data?.promptFeedback?.blockReason || candidate?.safetyFeedback?.[0]?.blockReason;
          const reasonText =
            finishReason === 'MAX_TOKENS'
              ? 'Token limiti doldu, yanıt kesildi.'
              : blockReason === 'SAFETY'
                ? 'G?venlik filtresi yanıtı kesti.'
                : 'Yanıt tamamlanamadı.';

          if (i < modelsToTry.length - 1) {
            console.log(`Finish reason ${finishReason}, sonraki modeli deniyorum...`);
            continue;
          }

          throw new Error(`${reasonText} Mesaj? k?salt?p tekrar dener misin?`);
        }

        // Combine all parts
        if (!candidate.content?.parts || candidate.content.parts.length === 0) {
          console.error('No parts in response:', JSON.stringify(data, null, 2));
          throw new Error('API yan?t?nda metin yok');
        }

        const fullContent = candidate.content.parts
          .map((part: any) => part.text || '')
          .join('');

        if (!fullContent.trim()) {
          console.error('Empty content from API:', JSON.stringify(data, null, 2));
          throw new Error('API bo? yan?t d?nd?');
        }

        // Show the entire response directly (no streaming effect)
        onChunk(fullContent);

        const assistantMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullContent.trim(),
          timestamp: Date.now(),
        };
        this.conversationHistory.push(assistantMsg);

        return fullContent.trim();

      } catch (error: any) {
        console.error(`Chat error with ${model}:`, error);

        if (
          (error.message?.includes('503') || error.message?.includes('overloaded')) &&
          i < modelsToTry.length - 1
        ) {
          console.log(`Model ${model} overloaded, trying next model...`);
          continue;
        }

        throw error;
      }
    }

    throw new Error('All models failed');
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }
}

export const aiChatService = new AIChatService();
